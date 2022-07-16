; Saves all gallery art to ./part_art
; Needs a little finagling to work right, Sigix Exoskeleton will mess up the script
; Also doesn't handle nonexistent parts well
; If it gets stuck, just pause/exit the script, chop off the beginning of the all_parts.txt until 
; you get to the part with the issue, and then rerun
; Assumes font size of 18, 1908 x 1080 window except for the Windows title bar (which should be present)

^Esc::ExitApp ; Ctrl + Escape to exit
^!p::Pause    ; Ctrl + Alt + P to pause
^!r::Reload   ; Ctrl + Alt + R to reload

^r::          ; Ctrl + R to run script
pToken := Gdip_Startup()
parts := []

; Read the list of all parts from the text file
Loop, Read, %A_WorkingDir%\all_parts.txt
{
    parts.Push(A_LoopReadLine)
}

; Create parts directory
If !FileExist("%A_ScriptDir%\part_art")
    FileCreateDir, %A_ScriptDir%\part_art

for index, partName in parts
{
    ; Open debug menu
    Send, !+d
    Sleep, 200

    ; Give part
    SendInput, g %partName%
    Sleep, 100
    Send, {Enter}
    Sleep, 200

    ; Open part info
    Send, +1
    Sleep, 1000

    ; Take screenshot at specific offset
    ; Assumes font size of 18, 1080p
    WinGetPos, X, Y,,, A
    bitmap := Gdip_BitmapFromScreen( X + 929 "|" 29 + Y + 195 "|" 432 "|" 180)
    
    ; Strip invalid characters from the filename
    partFileName := StrReplace(StrReplace(A_WorkingDir "\part_art\" partName ".png", """"), "/")
    Gdip_SaveBitmapToFile(bitmap , partFileName)
    Gdip_DisposeImage(bitmap)

    ; Close part info
    Send, {Escape}

    ; Drop part (don't need to wait)
    ; Send twice because of the crush warning (we don't care)
    Send, !1
    Send, !1
    Sleep, 500
}

; Cleanup resources
Gdip_Shutdown(pToken)

return
 
; GDIPlus wrapper
Gdip_Startup(){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    if !DllCall("GetModuleHandle", "str", "gdiplus", Ptr)
        DllCall("LoadLibrary", "str", "gdiplus")
    VarSetCapacity(si, A_PtrSize = 8 ? 24 : 16, 0), si := Chr(1)
    DllCall("gdiplus\GdiplusStartup", A_PtrSize ? "UPtr*" : "uint*", pToken, Ptr, &si, Ptr, 0)
    return pToken
}
Gdip_BitmapFromScreen(Screen=0, Raster=""){
    if (Screen = 0){
        Sysget, x, 76
        Sysget, y, 77   
        Sysget, w, 78
        Sysget, h, 79
    }else if (SubStr(Screen, 1, 5) = "hwnd:"){
        Screen := SubStr(Screen, 6)
        if !WinExist( "ahk_id " Screen)
            return -2
        WinGetPos,,, w, h, ahk_id %Screen%
        x := y := 0
        hhdc := GetDCEx(Screen, 3)
    }else if (Screen&1 != ""){
        Sysget, M, Monitor, %Screen%
        x := MLeft, y := MTop, w := MRight-MLeft, h := MBottom-MTop
    }else   {
        StringSplit, S, Screen, |
        x := S1, y := S2, w := S3, h := S4
    }
    if (x = "") || (y = "") || (w = "") || (h = "")
        return -1
    chdc := CreateCompatibleDC(), hbm := CreateDIBSection(w, h, chdc), obm := SelectObject(chdc, hbm), hhdc := hhdc ? hhdc : GetDC()
    BitBlt(chdc, 0, 0, w, h, hhdc, x, y, Raster)
    ReleaseDC(hhdc)
    pBitmap := Gdip_CreateBitmapFromHBITMAP(hbm)
    SelectObject(chdc, obm), DeleteObject(hbm), DeleteDC(hhdc), DeleteDC(chdc)
    return pBitmap
}
Gdip_SaveBitmapToFile(pBitmap, sOutput, Quality=75){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    SplitPath, sOutput,,, Extension
    if Extension not in BMP,DIB,RLE,JPG,JPEG,JPE,JFIF,GIF,TIF,TIFF,PNG
        return -1
    Extension := "." Extension
    DllCall("gdiplus\GdipGetImageEncodersSize", "uint*", nCount, "uint*", nSize)
    VarSetCapacity(ci, nSize)
    DllCall("gdiplus\GdipGetImageEncoders", "uint", nCount, "uint", nSize, Ptr, &ci)
    if !(nCount && nSize)
        return -2
    If (A_IsUnicode){
        StrGet_Name := "StrGet"
        Loop, % nCount  {
            sString := %StrGet_Name%(NumGet(ci, (idx := (48+7*A_PtrSize)*(A_Index-1))+32+3*A_PtrSize), "UTF-16")
            if !InStr(sString, "*" Extension)
                continue
            pCodec := &ci+idx
            break
        }
    } else {
        Loop, % nCount  {
            Location := NumGet(ci, 76*(A_Index-1)+44)
            nSize := DllCall("WideCharToMultiByte", "uint", 0, "uint", 0, "uint", Location, "int", -1, "uint", 0, "int",  0, "uint", 0, "uint", 0)
            VarSetCapacity(sString, nSize)
            DllCall("WideCharToMultiByte", "uint", 0, "uint", 0, "uint", Location, "int", -1, "str", sString, "int", nSize, "uint", 0, "uint", 0)
            if !InStr(sString, "*" Extension)
                continue
            pCodec := &ci+76*(A_Index-1)
            break
        }
    }
    if !pCodec
        return -3
    if (Quality != 75){
        Quality := (Quality < 0) ? 0 : (Quality > 100) ? 100 : Quality
        if Extension in .JPG,.JPEG,.JPE,.JFIF
        {
            DllCall("gdiplus\GdipGetEncoderParameterListSize", Ptr, pBitmap, Ptr, pCodec, "uint*", nSize)
            VarSetCapacity(EncoderParameters, nSize, 0)
            DllCall("gdiplus\GdipGetEncoderParameterList", Ptr, pBitmap, Ptr, pCodec, "uint", nSize, Ptr, &EncoderParameters)
            Loop, % NumGet(EncoderParameters, "UInt")   {
                elem := (24+(A_PtrSize ? A_PtrSize : 4))*(A_Index-1) + 4 + (pad := A_PtrSize = 8 ? 4 : 0)
                if (NumGet(EncoderParameters, elem+16, "UInt") = 1) && (NumGet(EncoderParameters, elem+20, "UInt") = 6){
                    p := elem+&EncoderParameters-pad-4
                    NumPut(Quality, NumGet(NumPut(4, NumPut(1, p+0)+20, "UInt")), "UInt")
                    break
                }
            }      
        }
    }
    if (!A_IsUnicode){
        nSize := DllCall("MultiByteToWideChar", "uint", 0, "uint", 0, Ptr, &sOutput, "int", -1, Ptr, 0, "int", 0)
        VarSetCapacity(wOutput, nSize*2)
        DllCall("MultiByteToWideChar", "uint", 0, "uint", 0, Ptr, &sOutput, "int", -1, Ptr, &wOutput, "int", nSize)
        VarSetCapacity(wOutput, -1)
        if !VarSetCapacity(wOutput)
            return -4
        E := DllCall("gdiplus\GdipSaveImageToFile", Ptr, pBitmap, Ptr, &wOutput, Ptr, pCodec, "uint", p ? p : 0)
    }
    else
        E := DllCall("gdiplus\GdipSaveImageToFile", Ptr, pBitmap, Ptr, &sOutput, Ptr, pCodec, "uint", p ? p : 0)
    return E ? -5 : 0
}
Gdip_DisposeImage(pBitmap){
   return DllCall("gdiplus\GdipDisposeImage", A_PtrSize ? "UPtr" : "UInt", pBitmap)
}
Gdip_Shutdown(pToken){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    DllCall("gdiplus\GdiplusShutdown", Ptr, pToken)
    if hModule := DllCall("GetModuleHandle", "str", "gdiplus", Ptr)
        DllCall("FreeLibrary", Ptr, hModule)
    return 0
}
GetDCEx(hwnd, flags=0, hrgnClip=0){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    return DllCall("GetDCEx", Ptr, hwnd, Ptr, hrgnClip, "int", flags)
}
CreateCompatibleDC(hdc=0){
   return DllCall("CreateCompatibleDC", A_PtrSize ? "UPtr" : "UInt", hdc)
}
CreateDIBSection(w, h, hdc="", bpp=32, ByRef ppvBits=0){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    hdc2 := hdc ? hdc : GetDC()
    VarSetCapacity(bi, 40, 0)
    NumPut(w, bi, 4, "uint") , NumPut(h, bi, 8, "uint") , NumPut(40, bi, 0, "uint") , NumPut(1, bi, 12, "ushort") , NumPut(0, bi, 16, "uInt") , NumPut(bpp, bi, 14, "ushort")
    hbm := DllCall("CreateDIBSection" , Ptr, hdc2 , Ptr, &bi , "uint", 0 , A_PtrSize ? "UPtr*" : "uint*", ppvBits , Ptr, 0 , "uint", 0, Ptr)
    if !hdc
        ReleaseDC(hdc2)
    return hbm
}
SelectObject(hdc, hgdiobj){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    return DllCall("SelectObject", Ptr, hdc, Ptr, hgdiobj)
}
GetDC(hwnd=0){
    return DllCall("GetDC", A_PtrSize ? "UPtr" : "UInt", hwnd)
}
BitBlt(ddc, dx, dy, dw, dh, sdc, sx, sy, Raster=""){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    return DllCall("gdi32\BitBlt" , Ptr, dDC , "int", dx , "int", dy , "int", dw , "int", dh , Ptr, sDC , "int", sx , "int", sy , "uint", Raster ? Raster : 0x00CC0020)
}
ReleaseDC(hdc, hwnd=0){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    return DllCall("ReleaseDC", Ptr, hwnd, Ptr, hdc)
}
Gdip_CreateBitmapFromHBITMAP(hBitmap, Palette=0){
    Ptr := A_PtrSize ? "UPtr" : "UInt"
    DllCall("gdiplus\GdipCreateBitmapFromHBITMAP", Ptr, hBitmap, Ptr, Palette, A_PtrSize ? "UPtr*" : "uint*", pBitmap)
    return pBitmap
}
DeleteObject(hObject){
   return DllCall("DeleteObject", A_PtrSize ? "UPtr" : "UInt", hObject)
}
DeleteDC(hdc){
   return DllCall("DeleteDC", A_PtrSize ? "UPtr" : "UInt", hdc)
}