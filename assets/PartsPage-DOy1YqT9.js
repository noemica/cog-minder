import{v as le,j as r,B as Y,s as A,f as R,u as $,c as ee,b as k,d as F,z as re,S as ce,A as Z,R as ue,a as de,l as pe,e as he,p as fe,g as ye,C as me}from"./index-D8uQzli2.js";import{a as q,u as ge,G as ve,I as xe}from"./ItemPopover-B3EI0el6.js";import{S as Q,C as j,a as E}from"./itemTypes-bS4ZZpKd.js";import{T as je}from"./Table-DYfZtoop.js";import"./items-CuodUx7O.js";function p(){return r.jsx("pre",{className:"comparison-neutral",children:" "})}function T({children:e}){return r.jsx("pre",{className:"comparison-neutral",children:e})}function D({children:e}){return r.jsx("pre",{className:"comparison-negative",children:e})}function N({children:e}){return r.jsx("pre",{className:"comparison-positive",children:e})}function X({leftValue:e,rightValue:a}){return e===a?r.jsx(p,{}):e<a?r.jsxs(T,{children:["(+",a-e,")"]}):r.jsxs(T,{children:["(-",e-a,")"]})}function g({leftValue:e,rightValue:a}){return e===a?r.jsx(p,{}):e<a?r.jsxs(D,{children:["+",a-e]}):r.jsxs(N,{children:["-",e-a]})}function m({leftValue:e,rightValue:a}){return e===a?r.jsx(p,{}):e<a?r.jsxs(N,{children:["+",a-e]}):r.jsxs(D,{children:["-",e-a]})}function be({leftWeapon:e,rightWeapon:a}){return a.waypoints!==void 0?r.jsx(m,{leftValue:R(e.waypoints,0),rightValue:R(a.waypoints,0)}):r.jsx(g,{leftValue:e.arc??0,rightValue:a.arc??0})}function Se({leftPropulsion:e,rightPropulsion:a}){return e.burnout!==void 0||a.burnout!==void 0?r.jsx(g,{leftValue:R(e.burnout,0),rightValue:R(a.burnout,0)}):e.type==="Treads"&&a.type==="Treads"?e.siege===a.siege?r.jsx(p,{}):e.siege===Q.High?r.jsx(D,{children:"High"}):e.siege===Q.Standard&&a.siege===void 0?r.jsx(D,{children:"Standard"}):e.siege===void 0?r.jsx(N,{children:"N/A"}):r.jsx(N,{children:"Standard"}):r.jsx(p,{})}function Ve({leftWeapon:e,rightWeapon:a}){return e.minChunks===a.minChunks&&e.maxChunks===a.maxChunks?r.jsx(p,{}):r.jsxs(T,{children:[e.minChunks,"-",e.maxChunks]})}function _({leftWeapon:e,rightWeapon:a}){if(e.critical===void 0||a.critical===void 0||e.criticalType===a.criticalType)return r.jsx(m,{leftValue:e.critical??0,rightValue:a.critical??0});let s;switch(e.criticalType){case j.Blast:s="(Blast)";break;case j.Burn:s="(Burn)";break;case j.Corrupt:s="(Corrup)";break;case j.Destroy:s="(Destro)";break;case j.Detonate:s="(Detona)";break;case j.Impale:s="(Impale)";break;case j.Intensify:s="(Intens)";break;case j.Meltdown:s="(Meltdo)";break;case j.Phase:s="(Phase)";break;case j.Sever:s="(Sever)";break;case j.Smash:s="(Smash)";break;case j.Sunder:s="(Sunder)";break;default:throw"Invalid critical type"}return r.jsx(T,{children:s})}function H({explosive:e,leftWeapon:a,rightWeapon:s}){function i(f){let v=0,h=0;if(f!=null&&f.includes("-")){const x=f.split("-");v=parseInt(x[0]),h=parseInt(x[1])}else f!==void 0&&(v=parseInt(f),h=v);return{average:(h+v)/2,min:v,max:h}}let t,n;e?(t=a.explosionDamage,n=s.explosionDamage):(t=a.damage,n=s.damage);const o=i(t),l=i(n);if(o.average===l.average)return o.min===l.min?r.jsx(p,{}):r.jsxs(T,{children:[o.min,"-",o.max]});function u(f){return f>0?"+"+f:f.toString()}const c=l.min-o.min,y=l.max-o.max;return o.average<l.average?r.jsxs(N,{children:[u(c),"/",u(y)]}):r.jsxs(D,{children:[u(c),"/",u(y)]})}function G({explosive:e,leftWeapon:a,rightWeapon:s}){if(e){if(a.explosionType===s.explosionType||a.explosionType===void 0)return r.jsx(p,{})}else if(a.damageType===s.damageType||a.damageType===void 0)return r.jsx(p,{});function i(t){switch(t){case"Electromagnetic":return"EM";case"Entropic":return"EN";case"Explosive":return"EX";case"Impact":return"I";case"Kinetic":return"KI";case"Phasic":return"PH";case"Piercing":return"P";case"Slashing":return"S";case"Thermal":return"TH"}return""}return r.jsxs(T,{children:["(",i(e?a.explosionType:a.damageType),")"]})}function Ce({leftPropulsion:e,rightPropulsion:a}){return e.modPerExtra!==void 0&&a.modPerExtra!==void 0?r.jsx(g,{leftValue:e.modPerExtra,rightValue:a.modPerExtra}):e.drag!==void 0&&a.drag!==void 0?r.jsx(m,{leftValue:e.drag,rightValue:a.drag}):r.jsx(p,{})}function Ke({leftItem:e,rightItem:a}){const s=Math.ceil(e.rating),i=Math.ceil(a.rating);if(s===i)return r.jsx(p,{});if(s<i){let t;return e.ratingString.includes("*")||a.ratingString.includes("*")?t="* +"+(i-s):t="+"+(i-s),r.jsx("pre",{className:"comparison-positive",children:t})}else{let t;return e.ratingString.includes("*")||a.ratingString.includes("*")?t="* -"+(s-i):t="-"+(s-i),r.jsx("pre",{className:"comparison-negative",children:t})}}function J({explosive:e,leftWeapon:a,rightWeapon:s}){function i(o){return o===E.Fine?100:o===E.Narrow?50:o===E.Intermediate?30:o===E.Wide?10:0}function t(o){return o==="Minimal (5)"?5:o==="Low (25)"?25:o==="Medium (37)"?37:o==="High (50)"?50:o==="Massive (80)"?80:0}const n=t(e?s.explosionHeatTransfer:s.heatTransfer);if(n!=0){const o=t(e?a.explosionHeatTransfer:a.heatTransfer);return r.jsx(X,{leftValue:o,rightValue:n})}else{const o=i(e?a.explosionSpectrum:a.spectrum),l=i(e?s.explosionSpectrum:s.spectrum);return r.jsx(X,{leftValue:o,rightValue:l})}}function ke({leftWeapon:e,rightWeapon:a}){if(e.penetration==="Unlimited")return a.penetration==="Unlimited"?r.jsx(p,{}):r.jsx(D,{children:"-Inf."});if(a.penetration==="Unlimited")return r.jsx(N,{children:"+Inf."});function s(n){return n===void 0?0:n.split("/").length}const i=s(e.penetration),t=s(a.penetration);return r.jsx(m,{leftValue:i,rightValue:t})}function we({leftItem:e,rightItem:a}){if(e.slot==="Power"&&a.slot==="Power"){const s=e,i=a;return r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(m,{leftValue:s.energyGeneration??0,rightValue:i.energyGeneration??0}),r.jsx(m,{leftValue:s.energyStorage??0,rightValue:i.energyStorage??0}),r.jsx(m,{leftValue:s.powerStability??100,rightValue:i.powerStability??100})]})}}function Te({leftItem:e,rightItem:a}){if(e.slot==="Propulsion"&&a.slot==="Propulsion"){const s=e,i=a;return r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(g,{leftValue:s.timePerMove,rightValue:i.timePerMove}),r.jsx(Ce,{leftPropulsion:s,rightPropulsion:i}),r.jsx(g,{leftValue:s.energyPerMove??0,rightValue:i.energyPerMove??0}),r.jsx(g,{leftValue:s.heatPerMove??0,rightValue:i.heatPerMove??0}),r.jsx(m,{leftValue:s.support,rightValue:i.support}),r.jsx(g,{leftValue:s.penalty,rightValue:i.penalty}),r.jsx(Se,{leftPropulsion:s,rightPropulsion:i})]})}}function De({leftItem:e,rightItem:a}){if((e.slot==="Power"||e.slot==="Propulsion"||e.slot==="Utility")&&(a.slot==="Power"||a.slot==="Propulsion"||a.slot==="Utility")){const s=e,i=a;return r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(g,{leftValue:s.energyUpkeep??0,rightValue:i.energyUpkeep??0}),r.jsx(g,{leftValue:s.matterUpkeep??0,rightValue:i.matterUpkeep??0}),r.jsx(g,{leftValue:s.heatGeneration??0,rightValue:i.heatGeneration??0}),r.jsx(p,{})]})}}function Ne({leftItem:e,rightItem:a}){if(e.slot==="Weapon"&&a.slot==="Weapon"){let s=function(l){return l.type==="Slashing Weapon"||l.type==="Impact Weapon"||l.type==="Piercing Weapon"||l.type==="Special Melee Weapon"},i=function(l){return l.type==="Ballistic Gun"||l.type==="Energy Gun"||l.type==="Ballistic Cannon"||l.type==="Energy Cannon"||l.type==="Special Weapon"},t=function(l){return i(l)||l.type==="Launcher"};const n=e,o=a;if(s(n)&&s(o)){let l;return n.damage!==void 0&&o.damage!==void 0&&(l=r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(H,{leftWeapon:n,rightWeapon:o,explosive:!1}),r.jsx(G,{leftWeapon:n,rightWeapon:o,explosive:!1}),r.jsx(_,{leftWeapon:n,rightWeapon:o}),r.jsx(m,{leftValue:n.disruption??0,rightValue:o.disruption??0}),r.jsx(m,{leftValue:n.salvage??0,rightValue:o.salvage??0}),r.jsx(p,{})]})),r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(g,{leftValue:n.shotEnergy??0,rightValue:o.shotEnergy??0}),r.jsx(g,{leftValue:n.shotMatter??0,rightValue:o.shotMatter??0}),r.jsx(g,{leftValue:n.shotHeat??0,rightValue:o.shotHeat??0}),r.jsx(m,{leftValue:n.targeting??0,rightValue:o.targeting??0}),r.jsx(g,{leftValue:n.delay??0,rightValue:o.delay??0}),r.jsx(p,{}),l]})}if(t(n)&&t(o)){let l;return i(n)&&i(o)&&n.damage!==void 0&&o.damage!==void 0?l=r.jsxs(r.Fragment,{children:[r.jsx(m,{leftValue:n.projectileCount,rightValue:o.projectileCount}),r.jsx(H,{leftWeapon:n,rightWeapon:o,explosive:!1}),r.jsx(G,{leftWeapon:n,rightWeapon:o,explosive:!1}),r.jsx(_,{leftWeapon:n,rightWeapon:o}),r.jsx(ke,{leftWeapon:n,rightWeapon:o}),r.jsx(J,{leftWeapon:n,rightWeapon:o,explosive:!1}),r.jsx(m,{leftValue:n.disruption??0,rightValue:o.disruption??0}),r.jsx(m,{leftValue:n.salvage??0,rightValue:o.salvage??0}),r.jsx(p,{})]}):n.type==="Launcher"&&o.type==="Launcher"&&(l=r.jsxs(r.Fragment,{children:[r.jsx(m,{leftValue:n.projectileCount,rightValue:o.projectileCount}),r.jsx(m,{leftValue:n.explosionRadius??0,rightValue:o.explosionRadius??0}),r.jsx(H,{leftWeapon:n,rightWeapon:o,explosive:!0}),r.jsx(g,{leftValue:n.falloff??0,rightValue:o.falloff??0}),r.jsx(Ve,{leftWeapon:n,rightWeapon:o}),r.jsx(G,{leftWeapon:n,rightWeapon:o,explosive:!0}),r.jsx(J,{leftWeapon:n,rightWeapon:o,explosive:!0}),r.jsx(m,{leftValue:n.explosionDisruption??0,rightValue:o.explosionDisruption??0}),r.jsx(m,{leftValue:n.explosionSalvage??0,rightValue:o.explosionSalvage??0}),r.jsx(p,{})]})),r.jsxs(r.Fragment,{children:[r.jsx(p,{}),r.jsx(m,{leftValue:n.range??0,rightValue:o.range??0}),r.jsx(g,{leftValue:n.shotEnergy??0,rightValue:o.shotEnergy??0}),r.jsx(g,{leftValue:n.shotMatter??0,rightValue:o.shotMatter??0}),r.jsx(g,{leftValue:n.shotHeat??0,rightValue:o.shotHeat??0}),r.jsx(g,{leftValue:n.recoil??0,rightValue:o.recoil??0}),r.jsx(m,{leftValue:n.targeting??0,rightValue:o.targeting??0}),r.jsx(g,{leftValue:n.delay??0,rightValue:o.delay??0}),r.jsx(m,{leftValue:n.overloadStability??100,rightValue:o.overloadStability??100}),r.jsx(be,{leftWeapon:n,rightWeapon:o}),r.jsx(p,{}),l]})}}}function Me({leftItem:e,rightItem:a}){return r.jsxs(r.Fragment,{children:[r.jsx("div",{className:"item-art-image-container part-comparison-image-container"}),r.jsx(p,{}),r.jsx("pre",{className:"comparison-neutral details-item-image-title"}),r.jsx("pre",{className:"details-summary",children:"Comparison"}),r.jsx("pre",{className:"comparison-sprite-line"}),r.jsx(p,{}),r.jsx(p,{}),r.jsx(g,{leftValue:e.mass??0,rightValue:a.mass??0}),r.jsx(Ke,{leftItem:e,rightItem:a}),r.jsx(m,{leftValue:e.integrity,rightValue:a.integrity}),r.jsx(m,{leftValue:e.coverage??0,rightValue:a.coverage??0}),r.jsx(p,{}),r.jsx(p,{}),r.jsx(p,{}),r.jsx(De,{leftItem:e,rightItem:a}),r.jsx(we,{leftItem:e,rightItem:a}),r.jsx(Te,{leftItem:e,rightItem:a}),r.jsx(Ne,{leftItem:e,rightItem:a})]})}function Ae({itemData:e,items:a,pageState:s,setPageState:i}){const t=le(),n=a.map(c=>({value:c.name}));function o({itemName:c,setItem:y}){return r.jsx(A,{value:n.find(f=>f.value===c)||{value:{itemName:c}},onChange:f=>{y(f.value)},options:n})}const l=e.getItem(s.compareLeftItem||"Lgt. Assault Rifle"),u=e.getItem(s.compareRightItem||"Assault Rifle");return r.jsxs("div",{className:"comparison-container",children:[r.jsxs("div",{className:"part-comparison-part-column",children:[r.jsx(o,{itemName:l.name,setItem:c=>{i({...s,compareLeftItem:c})}}),r.jsx(q,{item:l,showWikiLink:!0})]}),r.jsxs("div",{className:"part-comparison-details-column",children:[r.jsx(Y,{className:t==="Cogmind"?"swap-button-cogmind":"swap-button",tooltip:"Swaps the left and right items in the comparison",onClick:()=>{i({...s,compareLeftItem:u.name,compareRightItem:l.name})},children:"← Swap →"}),r.jsx("div",{children:r.jsx(Me,{leftItem:l,rightItem:u})})]}),r.jsxs("div",{className:"part-comparison-part-column",children:[r.jsx(o,{itemName:u.name,setItem:c=>{i({...s,compareRightItem:c})}}),r.jsx(q,{item:u,showWikiLink:!0})]})]})}const Pe=[{value:"Simple",tooltip:"Part name viewer with clickable parts to show part detail."},{value:"Comparison",tooltip:"Side-by-side part comparison that shows details of both selected parts."},{value:"Spreadsheet",tooltip:"Spreadsheet view that shows all applicable stats. Stats are filtered depending on the selected slot."},{value:"Gallery",tooltip:"Gallery image viewer. Similar to simple view but shows the art of all parts in a grid as well as the names."}],Ee=[{value:"Any"},{value:"N/A",label:"Other"},{value:"Power"},{value:"Propulsion"},{value:"Utility"},{value:"Weapon"}],ae=[{value:"Any"},{value:"Engine"},{value:"Power Core"},{value:"Reactor"}],se=[{value:"Any"},{value:"Flight Unit"},{value:"Hover Unit"},{value:"Wheel"},{value:"Leg"},{value:"Treads"}],te=[{value:"Any"},{value:"Artifact"},{value:"Device"},{value:"Hackware"},{value:"Processor"},{value:"Protection"},{value:"Storage"}],oe=[{value:"Any"},{value:"Ballistic Cannon"},{value:"Ballistic Gun"},{value:"Energy Cannon"},{value:"Energy Gun"},{value:"Launcher"},{value:"Impact Weapon"},{value:"Piercing Weapon"},{value:"Slashing Weapon"},{value:"Special Melee Weapon"},{value:"Special Weapon"}],M=[];M.push(...ae);M.push(...se.slice(1));M.push(...te.slice(1));M.push(...oe.slice(1));M.sort((e,a)=>e.value.localeCompare(a.value));const Le=[{value:"Any",tooltip:"All parts."},{value:"0b10",tooltip:"Parts that can be found on any standard complex floors or complex-controlled branches."},{value:"Alien",tooltip:"All Sigix-related alien artifacts."},{value:"Derelict",tooltip:"Derelict-created parts, either found in derelict-controlled areas or on unique derelicts.",spoiler:"Spoiler"},{value:"Architects",tooltip:"Parts found on Architect-faction related bots.",spoiler:"Redacted"},{value:"Exile",tooltip:"Exile vault items and unique Exile bot parts."},{value:"Golem",tooltip:"Parts created by the GOLEM Unit.",spoiler:"Spoiler"},{value:"Heroes",tooltip:"Parts unique to the Heroes of Zion.",spoiler:"Spoiler"},{value:"Lab",tooltip:"Parts that can be found in the hidden Lab.",spoiler:"Redacted"},{value:"Quarantine",tooltip:"Parts that can be found in Quarantine.",spoiler:"Spoiler"},{value:"S7 Guarded",tooltip:"Parts that can be found in Section 7 suspension chambers guarded by S7 Guards.",spoiler:"Redacted"},{value:"S7 Hangar",tooltip:"Parts that can be found in the Section 7 spaceship chamber.",spoiler:"Redacted"},{value:"S7 LRC Lab",tooltip:"Parts that can be found in the Section 7 LRC label. LRC parts are found in the locked room with a Terminal, the others are found in suspension chambers.",spoiler:"Redacted"},{value:"S7 Unguarded",tooltip:"Parts that can be found in unguarded Section 7 suspension chambers.",spoiler:"Redacted"},{value:"Testing",tooltip:"Parts that can be found in Testing.",spoiler:"Spoiler"},{value:"Unobtainable",tooltip:"Parts that are not obtainable by normal gameplay."},{value:"UFD",tooltip:"Parts that can be found in Scraptown or are related to the United Federation of Derelicts",spoiler:"Spoiler"},{value:"Warlord",tooltip:"Parts that are obtainable in the Warlord map, or on Warlord-aligned bots",spoiler:"Spoiler"},{value:"Zion",tooltip:"Parts that are obtainable in Zion.",spoiler:"Spoiler"},{value:"Zionite",tooltip:"Parts that are obtainable from Imprinter-aligned Zionites. Some are obtainable in Zion Deep Caves, and some are only obtainable by Imprinting.",spoiler:"Spoiler"}],Re=[{value:"Level 1"},{value:"Level 2"},{value:"Level 3"}],L=[{value:"Alphabetical"},{value:"Gallery"},{value:"Coverage"},{value:"Integrity"},{value:"Mass"},{value:"Rating"},{value:"Size"},{value:"Arc"},{value:"Critical"},{value:"Damage"},{value:"Delay"},{value:"Disruption"},{value:"Drag"},{value:"Energy/Move"},{value:"Energy Generation"},{value:"Energy Storage"},{value:"Energy Upkeep"},{value:"Explosion Radius"},{value:"Falloff"},{value:"Heat/Move"},{value:"Heat Generation"},{value:"Heat Transfer"},{value:"Matter Upkeep"},{value:"Penalty"},{value:"Projectile Count"},{value:"Range"},{value:"Recoil"},{value:"Salvage"},{value:"Shot Energy"},{value:"Shot Heat"},{value:"Shot Matter"},{value:"Spectrum"},{value:"Support"},{value:"Targeting"},{value:"Time/Move"},{value:"Waypoints"}],U=[{value:"None"},...L],w=[{value:"Ascending"},{value:"Descending"}];function ze({pageState:e,setPageState:a}){function s({options:i}){const t=i.find(n=>n.value===e.slotType)||i[0];return r.jsx(re,{label:"Type",className:"slot-type-select",isSearchable:!1,options:i,tooltip:"Additional filter based on the sub-type of the part based on slot.",value:t,onChange:n=>{a({...e,slotType:n.value})}})}switch(e.slot){case"Power":return r.jsx(s,{options:ae});case"Propulsion":return r.jsx(s,{options:se});case"Utility":return r.jsx(s,{options:te});case"Weapon":return r.jsx(s,{options:oe})}return r.jsx(s,{options:M})}function Fe({pageState:e,setPageState:a}){const s=$(),i=Le.filter(t=>ee(t.spoiler||"None",s));return r.jsxs(r.Fragment,{children:[r.jsxs("div",{className:"page-input-group",children:[r.jsx(k,{label:"Name",placeholder:"Any",tooltip:"The name of a part to search for.",value:e.name||"",onChange:t=>{a({...e,name:t})}}),r.jsx(k,{label:"Effect",placeholder:"Any",tooltip:"The text to search for the description or effect of a part.",value:e.effect||"",onChange:t=>{a({...e,effect:t})}}),r.jsx(F,{label:"Mode",buttons:Pe,className:"flex-grow-0",tooltip:"The mode to display the parts in.",selected:e.mode,onValueChanged:t=>{a({...e,mode:t})}}),r.jsx(Y,{className:"flex-grow-0",tooltip:"Resets all filters to their default (unfiltered) state",onClick:()=>{a({mode:e.mode})},children:"Reset"})]}),r.jsxs("div",{className:"page-input-group",children:[r.jsx(k,{label:"Rating",placeholder:"Any",tooltip:"The rating of the part. Use * to search for prototypes only. Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range.",value:e.rating||"",onChange:t=>{a({...e,rating:t})}}),r.jsx(k,{label:"Size",placeholder:"Any",tooltip:"The size of the part (aka # of slots). Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range.",value:e.size||"",onChange:t=>{a({...e,size:t})}}),r.jsx(k,{label:"Mass",placeholder:"Any",tooltip:"The mass of the part. Add a + at the end to include larger values, a - at the end to include smaller values, or a - between two values to include a range.",value:e.mass||"",onChange:t=>{a({...e,mass:t})}}),r.jsx(re,{label:"Category",tooltip:"Additional part category like location/faction",className:"category-type-select",isSearchable:!1,options:i,value:i.find(t=>t.value===e.category)||i[0],onChange:t=>{a({...e,category:t.value})}})]}),r.jsxs("div",{className:"page-input-group",children:[r.jsx(F,{label:"Slot",buttons:Ee,flexGrowButtonCount:!0,selected:e.slot,tooltip:"Only shows parts with the matching slot.",onValueChanged:t=>{t!==e.slot&&a({...e,slot:t,slotType:"Any"})}}),r.jsx(ze,{pageState:e,setPageState:a})]}),r.jsxs("div",{className:"page-input-group",children:[r.jsx(ce,{label:"Schematics",tooltip:"Search for hackable schematics."}),r.jsx(k,{label:"Depth",tooltip:"Current map depth. Can enter as 7 or -7.",placeholder:"Any",value:e.schematicsDepth||"",onChange:t=>{a({...e,schematicsDepth:t})}}),r.jsx(F,{label:"Terminal Level",tooltip:"The level of the terminal to hack from. Higher level terminals can hack higher rating schematics.",buttons:Re,selected:e.terminalLevel,onValueChanged:t=>{a({...e,terminalLevel:t})}})]}),e.mode!=="Spreadsheet"&&r.jsxs("div",{className:"page-input-group",children:[r.jsxs(Z,{label:"Sort by",tooltip:"How to sort parts matching all filters.",children:[r.jsx(A,{className:"sort-select",options:L,isSearchable:!1,value:L.find(t=>t.value===e.primarySort)||L[0],onChange:t=>{t.value==="Alphabetical"||t.value==="Gallery"?a({...e,primarySort:t.value,secondarySort:void 0}):e.secondarySort===void 0||e.secondarySort==="None"?a({...e,primarySort:t.value,secondarySort:"Alphabetical"}):a({...e,primarySort:t.value})}}),r.jsx(A,{className:"sort-order-select",options:w,isSearchable:!1,value:w.find(t=>t.value===e.primarySortDirection)||w[0],onChange:t=>{a({...e,primarySortDirection:t.value})}})]}),r.jsxs(Z,{label:"Then by",tooltip:"How to sort parts tied by the primary sort.",children:[r.jsx(A,{className:"sort-select",options:U,isSearchable:!1,value:U.find(t=>t.value===e.secondarySort)||U[0],onChange:t=>{a({...e,secondarySort:t.value})}}),r.jsx(A,{className:"sort-order-select",options:w,isSearchable:!1,value:w.find(t=>t.value===e.secondarySortDirection)||w[0],onChange:t=>{a({...e,secondarySortDirection:t.value})}})]})]})]})}function He(e,a){const s=typeof e=="string"?e:"",i=typeof a=="string"?a:"";return s.localeCompare(i)}function ne(e,a){function s(n){if(typeof n!="string")return"";let o=/(\d+)% (\w*)/.exec(n);return o===null?(o=/(\d+)/.exec(n),o===null?"":"Destroy"+parseInt(o[1]).toLocaleString("en-us",{minimumIntegerDigits:3,useGrouping:!1})):o[2]+parseInt(o[1]).toLocaleString("en-US",{minimumIntegerDigits:3,useGrouping:!1})}const i=s(e),t=s(a);return i.localeCompare(t)}function I(e,a){function s(n){if(typeof n!="string"||n==="")return 0;const o=n.split("-").map(l=>l.trim()).map(l=>parseInt(l));return o.reduce((l,u)=>l+u,0)/o.length}const i=s(e),t=s(a);return i-t}function B(e,a){function s(n){if(n===void 0)return 0;const o=n.toLowerCase();return o.startsWith("minimal")?5:o.startsWith("low")?25:o.startsWith("medium")?37:o.startsWith("high")?50:o.startsWith("massive")?80:o.startsWith("deadly")?100:0}const i=s(e),t=s(a);return i-t}function d(e,a){let s=parseInt(e),i=parseInt(a);return isNaN(s)&&(s=0),isNaN(i)&&(i=0),s-i}function W(e,a){function s(n){if(n===void 0)return 0;const o=n.toLowerCase();return o.startsWith("wide")?10:o.startsWith("intermediate")?30:o.startsWith("narrow")?50:o.startsWith("fine")?100:0}const i=s(e),t=s(a);return i-t}const C=40,S=15,P=10,Ge=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",size:S,maxSize:S},{accessorKey:"type",header:"Type",maxSize:P},{accessorKey:"ratingString",header:"Rating"},{accessorKey:"size",header:"Size"},{accessorKey:"integrity",header:"Integrity"},{accessorKey:"life",header:"Life"}]},{header:"Effect",columns:[{accessorKey:"effect",header:"Effect",size:C},{accessorKey:"description",header:"Description",size:C}]},{header:"Fabrication",columns:[{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.number},header:"Count"},{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.time},header:"Time"}]},{header:"Other",columns:[{accessorKey:"supporterAttribution",header:"Attribution"}]}],Ue=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",size:S,maxSize:S},{accessorKey:"type",header:"Type",maxSize:P},{accessorKey:"ratingString",header:"Rating"},{accessorKey:"size",header:"Size"},{accessorKey:"mass",header:"Mass"},{accessorKey:"integrity",header:"Integrity"},{accessorKey:"coverage",header:"Coverage"},{accessorKey:"heatGeneration",header:"Heat"},{accessorKey:"matterUpkeep",header:"Matter"}]},{header:"Power",columns:[{accessorKey:"energyGeneration",header:"Rate"},{accessorKey:"energyStorage",header:"Storage"},{accessorKey:"powerStability",header:"Stability"}]},{header:"Fabrication",columns:[{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.number},header:"Count"},{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.time},header:"Time"}]},{header:"Effect",columns:[{accessorKey:"effect",header:"Effect",size:C},{accessorKey:"description",header:"Description",size:C}]},{header:"Other",columns:[{accessorKey:"supporterAttribution",header:"Attribution"}]}],Oe=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",size:S,maxSize:S},{accessorKey:"type",header:"Type",maxSize:P},{accessorKey:"ratingString",header:"Rating"},{accessorKey:"size",header:"Size"},{accessorKey:"integrity",header:"Integrity"},{accessorKey:"coverage",header:"Coverage"}]},{header:"Upkeep",columns:[{accessorKey:"energyUpkeep",header:"Energy"},{accessorKey:"heatGeneration",header:"Heat"}]},{header:"Propulsion",columns:[{accessorKey:"timePerMove",header:"Time/Move"},{accessorKey:"modPerExtra",header:"Mod/Extra"},{accessorKey:"drag",header:"Drag"},{accessorKey:"energyPerMove",header:"Energy"},{accessorKey:"heatPerMove",header:"Heat"},{accessorKey:"support",header:"Support"},{accessorKey:"penalty",header:"Penalty"},{accessorKey:"burnout",header:"Burnout"},{accessorKey:"siege",header:"Siege"}]},{header:"Fabrication",columns:[{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.number},header:"Count"},{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.time},header:"Time"}]},{header:"Other",columns:[{accessorKey:"supporterAttribution",header:"Attribution"}]}],Ie=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",size:S,maxSize:S},{accessorKey:"type",header:"Type",maxSize:P},{accessorKey:"ratingString",header:"Rating"},{accessorKey:"size",header:"Size"},{accessorKey:"mass",header:"Mass"},{accessorKey:"integrity",header:"Integrity"},{accessorKey:"coverage",header:"Coverage"},{accessorKey:"specialTrait",header:"Special Trait"}]},{header:"Upkeep",columns:[{accessorKey:"energyUpkeep",header:"Energy"},{accessorKey:"matterUpkeep",header:"Matter"},{accessorKey:"heatGeneration",header:"Heat"}]},{header:"Fabrication",columns:[{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.number},header:"Count"},{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.time},header:"Time"}]},{header:"Effect",columns:[{accessorKey:"effect",header:"Effect",size:C},{accessorKey:"description",header:"Description",size:C}]},{header:"Other",columns:[{accessorKey:"supporterAttribution",header:"Attribution"}]}],Be=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",maxSize:S},{accessorKey:"type",header:"Type",maxSize:P},{accessorKey:"ratingString",header:"Rating"},{accessorKey:"size",header:"Size"},{accessorKey:"mass",header:"Mass"},{accessorKey:"integrity",header:"Integrity"},{accessorKey:"coverage",header:"Coverage"},{accessorKey:"specialTrait",header:"Special Trait"}]},{header:"Shot",columns:[{accessorKey:"range",header:"Range"},{accessorKey:"shotEnergy",header:"Energy"},{accessorKey:"shotMatter",header:"Matter"},{accessorKey:"shotHeat",header:"Heat"},{accessorKey:"recoil",header:"Recoil"},{accessorKey:"targeting",header:"Targeting"},{accessorKey:"delay",header:"Delay"},{accessorKey:"overloadStability",header:"Stability"},{accessorKey:"waypoints",header:"Waypoints"}]},{header:"Projectile",columns:[{accessorKey:"arc",header:"Arc"},{accessorKey:"projectileCount",header:"Count"},{accessorKey:"damage",header:"Damage",sortingFn:(e,a,s)=>I(e.getValue(s),a.getValue(s))},{accessorKey:"damageType",header:"Type"},{accessorKey:"criticalString",header:"Critical",sortingFn:(e,a,s)=>ne(e.getValue(s),a.getValue(s)),maxSize:8},{accessorKey:"penetration",header:"Penetration",maxSize:10},{accessorKey:"heatTransfer",header:"Heat Transfer",sortingFn:(e,a,s)=>B(e.getValue(s),a.getValue(s))},{accessorKey:"spectrum",header:"Spectrum",sortingFn:(e,a,s)=>W(e.getValue(s),a.getValue(s)),maxSize:9},{accessorKey:"disruption",header:"Disruption"},{accessorKey:"salvage",header:"Salvage"}]},{header:"Explosion",columns:[{accessorKey:"explosionRadius",header:"Radius"},{accessorKey:"explosionDamage",header:"Damage",sortingFn:(e,a,s)=>I(e.getValue(s),a.getValue(s))},{accessorKey:"falloff",header:"Falloff"},{accessorKey:"explosionType",header:"Type"},{accessorKey:"explosionHeatTransfer",header:"Heat Transfer",sortingFn:(e,a,s)=>B(e.getValue(s),a.getValue(s))},{accessorKey:"explosionSpectrum",header:"Spectrum",sortingFn:(e,a,s)=>W(e.getValue(s),a.getValue(s)),maxSize:9},{accessorKey:"explosionDisruption",header:"Disruption"},{accessorKey:"explosionSalvage",header:"Salvage"}]},{header:"Fabrication",columns:[{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.number},header:"Count"},{accessorFn:e=>{var a;return(a=e.fabrication)==null?void 0:a.time},header:"Time"}]},{header:"Effect",columns:[{accessorKey:"effect",header:"Effect",size:C},{accessorKey:"description",header:"Description",size:C}]},{header:"Other",columns:[{accessorKey:"supporterAttribution",header:"Attribution"}]}],We={Any:[],"N/A":Ge,Power:Ue,Propulsion:Oe,Utility:Ie,Weapon:Be};function Ze({pageState:e,items:a}){const[s,i]=ue.useState([]),t=e.slot||"Any",n=We[t];return t==="Any"?r.jsx("span",{children:"Please select a slot to see the spreadsheet view."}):r.jsx(je,{columns:n,data:a,setSorting:i,sorting:s})}function qe(e,a){const s=$();return a.getAllItems().filter(t=>{var o,l;if(!ee(t.spoiler,s))return!1;if(e.name){const u=t.name.toLowerCase(),c=e.name.toLowerCase();if(c.length>1){if(!u.includes(c)&&!pe(u).includes(c))return!1}else if(c.length>0&&!u.includes(c))return!1}if(e.effect&&e.effect.length>0){const u=e.effect.toLowerCase();if(!((o=t.description)!=null&&o.toLowerCase().includes(u))&&!((l=t.effect)!=null&&l.toLowerCase().includes(u)))return!1}if(e.rating&&e.rating.length>0){let u=function(y){return y.slice(-1)==="*"?parseFloat(y.slice(0,y.lastIndexOf("*")))+.5:parseFloat(y)},c=e.rating.includes("-");if(c){const y=e.rating.split("-");if(y.length===2&&y[1]!==""){const f=u(y[0]),v=u(y[1]);if(t.rating<f||t.rating>v)return!1}else c=!1}if(!c){const y=e.rating.endsWith("+"),f=e.rating.endsWith("-"),v=e.rating.replace("+","").replace("-",""),h=u(v);if(y){if(t.rating<h)return!1}else if(f){if(t.rating>h)return!1}else if(v==="*"){if(!t.ratingString.includes("*"))return!1}else if(t.rating!==h)return!1}}function n(u,c){let y=c.includes("-");if(y){const f=c.split("-");if(f.length===2&&f[1]!==""){const v=parseFloat(f[0]),h=parseFloat(f[1]);if(u<v||u>h)return!1}else y=!1}if(!y){const f=c.endsWith("+"),v=c.endsWith("-"),h=c.replace("+","").replace("-",""),x=parseFloat(h);if(f){if(u<x)return!1}else if(v){if(u>x)return!1}else if(u!==x)return!1}return!0}if(e.size&&e.size.length>0&&!n(t.size,e.size)||e.mass&&e.mass.length>0&&!n(t.mass??0,e.mass)||e.category&&e.category!=="Any"&&!t.categories.includes(e.category)||e.slot&&e.slot!=="Any"&&t.slot!==e.slot||e.slotType&&e.slotType!=="Any"&&t.type!==e.slotType)return!1;if(e.schematicsDepth&&e.schematicsDepth.length>0){const u=Math.abs(parseInt(e.schematicsDepth));if(!Number.isNaN(u)){if(!t.hackable)return!1;let c=1;if(e.terminalLevel==="Level 2"?c=2:e.terminalLevel==="Level 3"&&(c=3),10-u+c<Math.ceil(t.rating))return!1}}return!0})}function Qe(){const e=he();return fe(e,{})}const O={Alphabetical:{key:"name",sort:He},Gallery:{sort:me},Rating:{key:"rating",sort:d},Size:{key:"size",sort:d},Mass:{key:"mass",sort:d},Integrity:{key:"integrity",sort:d},Coverage:{key:"coverage",sort:d},Arc:{key:"arc",sort:d},Critical:{key:"criticalString",sort:ne},Damage:{keys:["damage","explosionDamage"],sort:I},Delay:{key:"delay",sort:d},Disruption:{keys:["disruption","explosionDisruption"],sort:d},Drag:{key:"drag",sort:d},"Energy/Move":{key:"energyPerMove",sort:d},"Energy Generation":{key:"energyGeneration",sort:d},"Energy Storage":{key:"energyStorage",sort:d},"Energy Upkeep":{key:"energyUpkeep",sort:d},"Explosion Radius":{key:"explosionRadius",sort:d},Falloff:{key:"falloff",sort:d},"Heat/Move":{key:"heatPerMove",sort:d},"Heat Generation":{key:"heatGeneration",sort:d},"Heat Transfer":{keys:["heatTransfer","explosionHeatTransfer"],sort:B},"Matter Upkeep":{key:"matterUpkeep",sort:d},Penalty:{key:"penalty",sort:d},"Projectile Count":{key:"projectileCount",sort:d},Range:{key:"range",sort:d},Recoil:{key:"recoil",sort:d},Salvage:{keys:["salvage","explosionSalvage"],sort:d},"Shot Energy":{key:"shotEnergy",sort:d},"Shot Heat":{key:"shotHeat",sort:d},"Shot Matter":{key:"shotMatter",sort:d},Spectrum:{keys:["spectrum","explosionSpectrum"],sort:W},Support:{key:"support",sort:d},Targeting:{key:"targeting",sort:d},"Time/Move":{key:"timePerMove",sort:d},Waypoints:{key:"waypoints",sort:d}};function Xe(e,a){const s=a.mode==="Spreadsheet",i=s?O.Gallery:O[a.primarySort||"Alphabetical"],t="key"in i?[i.key]:"keys"in i?i.keys:[],n=i.sort;if(e.sort((h,x)=>{if(t.length===0)return n(h,x);const b=t.find(K=>K in h&&h[K]!==void 0),V=t.find(K=>K in x&&x[K]!==void 0);return n(h[b],x[V])}),s||(a.primarySortDirection==="Descending"&&e.reverse(),a.secondarySort===void 0||a.secondarySort==="None")||t.length===0)return e;const o=O[a.secondarySort],l="key"in o?[o.key]:"keys"in o?o.keys:[],u=o.sort,c={},y=[];e.forEach(h=>{const x=t.find(V=>V in h&&h[V]!==void 0),b=h[x];b in c?c[b].push(h):(c[b]=[h],y.push(b))}),y.forEach(h=>{c[h].sort((b,V)=>{if(l.length===0)return u(b,V);const K=l.find(z=>z in b),ie=l.find(z=>z in V);return u(b[K],V[ie])})});const f=a.secondarySortDirection==="Descending";let v=[];return y.forEach(h=>{f&&c[h].reverse(),v=v.concat(c[h])}),v}function _e(e,a){const s=e;return s==="mode"&&a.mode==="Simple"||s==="terminalLevel"&&a.terminalLevel==="Level 1"||s==="slot"&&a.slot==="Any"||s==="slotType"&&a.slotType==="Any"||s==="category"&&a.category==="Any"||s==="primarySort"&&a.primarySort==="Alphabetical"||s==="primarySortDirection"&&a.primarySortDirection==="Ascending"||s==="secondarySortDirection"&&a.secondarySortDirection==="Ascending"}function Je({items:e}){const a=e.map(s=>r.jsx(ve,{item:s},s.name));return r.jsx("div",{className:"part-gallery-grid",children:a})}function Ye({items:e}){const a=e.map(s=>r.jsx(xe,{item:s,showWikiLink:!0},s.name));return r.jsx("div",{className:"part-button-grid",children:a})}function tr(){const e=ge(),[a,s]=de(),i=Qe();function t(l){const u=ye("/parts",l,_e);s(u,{replace:!0})}const n=Xe(qe(i,e),i);let o;switch(i.mode){case"Simple":default:o=r.jsx(Ye,{items:n});break;case"Comparison":o=r.jsx(Ae,{items:n,itemData:e,pageState:i,setPageState:t});break;case"Gallery":o=r.jsx(Je,{items:n});break;case"Spreadsheet":o=r.jsx(Ze,{items:n,pageState:i});break}return r.jsxs("div",{className:"page-content",children:[r.jsx(Fe,{pageState:i,setPageState:t}),o]})}export{tr as default};
