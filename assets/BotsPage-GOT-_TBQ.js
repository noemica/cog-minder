import{u as f,a as v,c as y,j as n,b as d,d as m,B as x,l as b,e as S,p as K,g as C,R as A,f as p}from"./index-F8Pqi-VJ.js";import{u as B}from"./BotDetails-D2bHQ85L.js";import{B as j}from"./BotPopover-Uys4pLcm.js";import{T as D}from"./Table-BRPHjTsq.js";/* empty css              */import"./bots_b15-Df5KG89k.js";import"./lore-Yb44s0tc.js";import"./botTypes-_WzAd8ij.js";import"./ItemPopover-Bi41VgJO.js";import"./items-DASIWQ_0.js";const w=[{value:"Simple"},{value:"Spreadsheet"}],L=[{value:"Any"},{value:"Architect",spoiler:"Redacted",tooltip:"Any Architect or Architect-related bots."},{value:"0b10",tooltip:"Any standard or prototype 0b10 bots."},{value:"Derelict",tooltip:"Any non-0b10 Derelict bots."},{value:"Exiles",tooltip:"Any Exiles or Exiles-related bots."},{value:"UFD",spoiler:"Spoiler",tooltip:"Any United Federation of Derelict (Scraptown) or related bots"},{value:"Warlord",spoiler:"Spoiler",tooltip:"Any Warlord-related bots"},{value:"Zionite",spoiler:"Spoiler",tooltip:"Any Zion-related bots including Imprint-related bots"}],F=[{header:"Overview",columns:[{accessorKey:"name",header:"Name",size:12,maxSize:12},{accessorKey:"class",header:"Class",size:12,maxSize:12},{accessorKey:"size",header:"Size"},{accessorKey:"profile",header:"Profile"},{accessorKey:"rating",header:"Rating"},{accessorKey:"tier",header:"Tier"},{accessorKey:"Threat",header:"Threat"},{accessorKey:"value",header:"Value"},{accessorKey:"energyGeneration",header:"Energy Generation"},{accessorKey:"heatDissipation",header:"Heat Dissipation"},{accessorKey:"visualRange",header:"Visual Range"},{accessorKey:"memory",header:"Memory"},{accessorKey:"spotPercent",header:"Spot %"},{accessorKey:"movement",header:"Movement",sortingFn:(e,t,s)=>P(e.getValue(s),t.getValue(s)),size:10,maxSize:10},{accessorKey:"coreIntegrity",header:"Core Integrity"},{accessorKey:"coreExposure",header:"Core Exposure"},{accessorKey:"salvagePotential",header:"Salvage Potential",sortingFn:(e,t,s)=>T(e.getValue(s),t.getValue(s))}]},{header:"Parts",columns:[{accessorKey:"armamentString",header:"Armament",size:25},{accessorKey:"componentsString",header:"Components",size:60}]},{header:"Resistances",columns:[{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Electromagnetic},header:"Electromagnetic"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Explosive},header:"Explosive"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Impact},header:"Impact"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Kinetic},header:"Kinetic"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Piercing},header:"Piercing"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Slashing},header:"Slashing"},{accessorFn:e=>{var t;return(t=e.resistances)==null?void 0:t.Thermal},header:"Thermal"}]},{header:"Other",columns:[{accessorKey:"immunitiesString",header:"Immunities",size:15},{accessorKey:"traitsString",header:"Traits",size:60}]}],h=/\((\d*)/;function P(e,t){const s=p(h.exec(e)[1],0),l=p(h.exec(t)[1],0);return s-l}function T(e,t){function s(o){if(typeof o!="string"||o==="")return 0;const r=o.split("~").map(i=>i.trim()).map(i=>parseInt(i));return r.reduce((i,u)=>i+u,0)/r.length}const l=s(e),a=s(t);return l-a}function z(e,t){const s=f(),l=t.getAllBots().filter(a=>{if(!y(a.spoiler,s))return!1;if(e.name&&e.name.length>0){const o=e.name.toLowerCase(),r=a.name.toLowerCase();if(!r.includes(o)&&!b(r).includes(o))return!1}if(e.class&&e.class.length>0&&!a.class.toLowerCase().includes(e.class.toLowerCase()))return!1;if(e.part&&e.part.length>0){const o=e.part.toLowerCase();if(!a.armamentData.find(r=>r.name.toLowerCase().includes(o))&&!a.componentData.find(r=>r.name.toLowerCase().includes(o))&&!a.armamentOptionData.find(r=>r.find(i=>i.name.toLowerCase().includes(o)))&&!a.componentOptionData.find(r=>r.find(i=>i.name.toLowerCase().includes(o))))return!1}return!(e.faction&&e.faction!=="Any"&&!a.categories.includes(e.faction))});return l.sort((a,o)=>a.name.localeCompare(o.name)),l}function E(){const e=S();return K(e,{})}function V(e,t){const s=e;return s==="mode"&&t.mode==="Simple"||s==="faction"&&t.faction==="Any"}function R({bots:e}){const t=e.map(s=>n.jsx(j,{bot:s},s.name));return n.jsx("div",{className:"bot-button-grid",children:t})}function N({bots:e}){const[t,s]=A.useState([]);return n.jsx(D,{data:e,columns:F,setSorting:s,sorting:t})}function q(){const e=B(),t=f(),[s,l]=v(),a=E();function o(c){const g=C("/bots",c,V);l(g,{replace:!0})}const r=z(a,e);let i;a.mode==="Spreadsheet"?i=n.jsx(N,{bots:r}):i=n.jsx(R,{bots:r});const u=L.filter(c=>y(c.spoiler||"None",t));return n.jsxs("div",{className:"page-content",children:[n.jsxs("div",{className:"page-input-group",children:[n.jsx(d,{label:"Name",placeholder:"Any",tooltip:"The name of a bot to search for.",value:a.name||"",onChange:c=>{o({...a,name:c})}}),n.jsx(d,{label:"Class",placeholder:"Any",tooltip:"The class of a bot to search for.",value:a.class||"",onChange:c=>{o({...a,class:c})}}),n.jsx(d,{label:"Part",placeholder:"Any",tooltip:"The name of a part to search for.",value:a.part||"",onChange:c=>{o({...a,part:c})}}),n.jsx(m,{label:"Mode",buttons:w,className:"flex-grow-0",tooltip:"The mode to display the parts in.",selected:a.mode,onValueChanged:c=>{o({...a,mode:c})}}),n.jsx(x,{className:"flex-grow-0",tooltip:"Resets all filters to their default (unfiltered) state",onClick:()=>{o({mode:a.mode})},children:"Reset"})]}),n.jsx("div",{className:"page-input-group",children:n.jsx(m,{label:"Faction",buttons:u,tooltip:"The mode to display the bots in.",selected:a.faction,onValueChanged:c=>{o({...a,faction:c})}})}),i]})}export{q as default};
