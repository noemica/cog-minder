import{r as i,j as o,B as p,P as l,F as u,G as c,H as x}from"./index-D8uQzli2.js";import{B as h}from"./BotDetails-E9Vo2gUf.js";function d({bot:e,button:r,open:t,setOpen:n}){const s=i.useContext(l);if(s===void 0)throw Error("Missing PopupPositioningContext");return t!==void 0&&!t?r:o.jsxs(u,{open:t,onOpenChange:n,placement:s.placement,shouldShift:s.shouldShift,children:[o.jsx(c,{asChild:!0,children:r}),o.jsx(x,{floatingArrowClassName:"bot-popover-arrow",children:o.jsx("div",{className:"popover",children:o.jsx(h,{bot:e,showWikiLink:!0})})})]})}function j({bot:e,text:r,tooltip:t}){const[n,s]=i.useState(!1),a=o.jsx("div",{children:o.jsx(p,{tooltip:t,children:r||e.name})});return o.jsx(d,{bot:e,button:a,open:n,setOpen:s})}export{j as B};
