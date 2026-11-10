/*! Vitrine v0.0.0 | MIT License | https://github.com/ecrou-exact/vitrine
 * Includes: highlight.js 11.12.0 (BSD-3-Clause), marked 18.1.3 (MIT), DOMPurify 3.4.17 (Apache-2.0 OR MPL-2.0), Lucide 1.52.0 (ISC; icons derived from Feather: MIT).
 * Full license texts: THIRD_PARTY_NOTICES.md */
import{a as P,b as j,c as D}from"./chunk-U26XVEFU.js";import{c as U}from"./chunk-JZ3PJRDP.js";import{a as z}from"./chunk-M662NQ6S.js";import{l as R,m as S,n as O}from"./chunk-B7F4FUUX.js";import{N as x,O as C,R as g,Y as T,aa as V,ca as k,ea as H,f as E,fa as $,g as A,h as L,i as B,ia as N,ka as I,p as M,r as o,t as q}from"./chunk-ROOVB7KQ.js";var G=`/*
 * CSV table. Header names are data: their case is kept (no uppercase label style).
 */
.table-host {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-body {
  background: var(--_surface);
}

.grid {
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: var(--_font-ui);
  font-size: var(--_font-size-ui);
  font-variant-numeric: tabular-nums;
}

.grid th,
.grid td {
  max-width: 40ch;
  padding: 6px var(--_space-3);
  border-bottom: 1px solid var(--_border);
  text-align: start;
  vertical-align: top;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.grid thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--_surface-sunken);
  color: var(--_fg);
  font-weight: 600;
  white-space: nowrap;
}

.grid tbody tr:hover > * {
  background: color-mix(in srgb, var(--_accent-soft) 60%, transparent);
}

.grid .col-number {
  text-align: end;
}

.grid .row-number {
  position: sticky;
  left: 0;
  z-index: 1;
  width: 1%;
  background: var(--_surface);
  color: var(--_fg-muted);
  font-weight: 400;
  text-align: end;
  white-space: nowrap;
}

.grid thead .row-number {
  z-index: 3;
  background: var(--_surface-sunken);
}

.grid .sort {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.grid .col-number .sort {
  flex-direction: row-reverse;
}

.grid .sort .name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.grid .sort .icon {
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--_fg-muted);
}

.grid [aria-sort='ascending'] .icon,
.grid [aria-sort='descending'] .icon {
  color: var(--_accent-fg);
}

.grid .no-rows {
  padding: var(--_space-5);
  color: var(--_fg-muted);
  text-align: center;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--_space-3);
  min-height: 40px;
  padding: 0 var(--_space-2) 0 var(--_space-3);
  border-top: 1px solid var(--_border);
  background: var(--_surface);
  color: var(--_fg-muted);
  font-family: var(--_font-ui);
  font-size: var(--_font-size-small);
}
`;var J=["table","raw"],W={",":",",comma:",",";":";",semicolon:";",tab:"	","\\t":"	","|":"|",pipe:"|"},X=1e3,F=class extends I{static type="csv";static fromData=U;static dataAttributes=Object.freeze([]);static componentAttributes=Object.freeze(["delimiter","header-row","page-size","sortable","line-numbers","tabs","view"]);static presets={simple:{"header-row":!0},full:{header:!0,dot:!0,copy:!0,search:!0,download:!0,tabs:!0,sortable:!0,"line-numbers":!0,"header-row":!0,fullscreen:!0}};static styles=[E,z,G];constructor(){super(),this.parsed=null,this.parsedText=null,this.sort=null,this.page=0,this.viewState=null,this.panelId=q("panel"),this.query="",this.searchMatches=[],this.current=-1,this.tableHost=null,this.editor=null,this.status=null,this.parseTimer=void 0}attributeChangedCallback(t,e,s){t==="view"&&(this.viewState=null),(t==="page-size"||t==="header-row")&&(this.page=0),super.attributeChangedCallback(t,e,s)}contentChanged(){this.parsed=null,this.sort=null,this.page=0}get rows(){return this.parse().rows.map(t=>[...t])}parse(){let t=this.text??"",e=(this.getAttribute("delimiter")??"").trim().toLowerCase(),s=Object.hasOwn(W,e)?W[e]:void 0,i=`${s??"auto"}`;return(!this.parsed||this.parsed.key!==i||this.parsedText!==t)&&(this.parsed={key:i,result:P(t,s?{delimiter:s}:{})},this.parsedText=t),this.parsed.result}get view(){return this.viewState??B(this.getAttribute("view"),J,this.editing?"raw":"table")}get pageSize(){return L(this.getAttribute("page-size"),{min:10,max:1e3,fallback:100})}model(){let t=this.parse(),e=this.feature("header-row"),s=e?t.rows[0]??[]:[],i=e?t.rows.slice(1):t.rows,r=Array.from({length:t.columns},(c,h)=>s[h]?.trim()||this.t("column",{n:h+1})),a=r.map((c,h)=>j(i,h));return{names:r,types:a,data:i,result:t}}order(t,e){let s=t.map((r,a)=>a);if(this.sort){let{column:r,direction:a}=this.sort,c=e[r]??"text",h=t.map(l=>(l[r]??"").trim()?D(l[r],c):null),n=a==="ascending"?1:-1;s.sort((l,d)=>{let p=h[l],u=h[d];if(p===null||u===null||typeof p=="number"&&Number.isNaN(p)||typeof u=="number"&&Number.isNaN(u)){let v=p===null||Number.isNaN(p),_=u===null||Number.isNaN(u);return v===_?l-d:v?1:-1}return p<u?-n:p>u?n:l-d})}if(!this.query)return s;let i=this.query.toLowerCase();return s.filter(r=>t[r].some(a=>a.toLowerCase().includes(i)))}renderContent(t){let e=this.t,s=this.view,i=this.feature("tabs")?$({tabs:[{id:"table",label:e("table"),icon:"table"},{id:"raw",label:e("raw"),icon:"code"}],selected:s,label:e("tabs"),panelId:this.panelId,onSelect:n=>this.selectView(n)}):null,r=o("div",{class:"panel",attrs:{id:this.panelId,role:i?"tabpanel":null}}),a,c=[];if(s==="raw"&&this.editing){let n=this.createEditor();r.append(o("div",{class:"body editor-body",part:"body"},n.element)),A(this.getAttribute("status"))!==!1&&r.append(this.status);let l=null;a={run:d=>(l=new k(n.layer.querySelector("pre.code")),l.run(d)),go:d=>S(l?.go(d)??null),clear:()=>l?.clear()},c=this.historyButtons(n)}else if(s==="raw"){let n=R(this.text??"",{language:"plaintext",lineNumbers:this.feature("line-numbers"),startLine:1,highlightRanges:[],diff:!1,highlightLimit:M().highlightLimit});r.append(o("div",{class:"body",part:"body",attrs:{tabindex:"0",role:"region","aria-label":this.heading||"CSV"}},n.element));let l=new k(n.code);a={run:d=>l.run(d),go:d=>S(l.go(d)),clear:()=>l.clear()}}else this.tableHost=o("div",{class:"table-host"}),r.append(...this.notices(),this.tableHost),this.renderTable(),a={run:n=>this.search(n),go:n=>this.goToMatch(n),clear:()=>this.search("")};let h=[this.searchButton(a),...c,this.editToggleButton(),this.fullscreenButton(),this.feature("download")?this.downloadButton(()=>this.text??"",this.downloadName("data.csv"),"text/csv"):null,this.feature("copy")?this.copyButton(()=>this.text??"",e("copy")):null];t.append(...this.chrome({badge:i?"":"CSV",tabs:i,actions:h}),r),this.editor?.align()}notices(){let{result:t}=this.model(),e=this.t,s=[];return t.error&&s.push(N(e("csvUnclosed",{line:t.error.line}))),t.truncatedColumns&&s.push(N(e("tooManyColumns",{limit:g(1e3,this.locale)}))),s}renderTable(){if(!this.tableHost)return;let t=this.t,{names:e,types:s,data:i}=this.model(),r=this.order(i,s),a=this.pageSize,c=Math.max(1,Math.ceil(r.length/a));this.page=Math.min(this.page,c-1);let h=this.page*a,n=r.slice(h,h+a),l=this.feature("line-numbers"),d=this.feature("sortable"),p=o("tr");l&&p.append(o("th",{class:"row-number",attrs:{scope:"col"}},o("span",{class:"sr-only",text:t("rowNumber")}))),e.forEach((f,w)=>{let b=this.sort?.column===w?this.sort.direction:null,m=o("th",{class:`col-${s[w]}`,part:"header-cell",attrs:{scope:"col","aria-sort":d?b??"none":null}});if(d){let y=o("button",{class:"sort",attrs:{type:"button","data-focus-key":`sort-${w}`,title:t("sortBy",{name:f})},on:{click:()=>this.sortBy(w,f)}},o("span",{class:"name",text:f}),T(b==="ascending"?"sort-up":b==="descending"?"sort-down":"sort"));m.append(y)}else m.append(o("span",{class:"name",text:f}));p.append(m)});let u=o("tbody");for(let f of n){let w=i[f],b=o("tr");l&&b.append(o("th",{class:"row-number",part:"row-number",attrs:{scope:"row"},text:g(f+1,this.locale)}));for(let m=0;m<e.length;m+=1){let y=w[m]??"";b.append(o("td",{class:`col-${s[m]}`,part:"cell",attrs:{"data-row":f,"data-column":m},text:y.length>X?`${y.slice(0,X)}\u2026`:y}))}u.append(b)}n.length||u.append(o("tr",{},o("td",{class:"no-rows",attrs:{colspan:e.length+(l?1:0)},text:t("noRows")})));let v=o("table",{class:"grid",part:"table"},o("caption",{class:"sr-only",text:this.heading||"CSV"}),o("thead",{},p),u),_=o("div",{class:"body table-body",part:"body",attrs:{tabindex:"0",role:"region","aria-label":this.heading||t("table")}},v);this.tableHost.replaceChildren(_,this.pager(r.length,c)),this.query&&this.highlightMatches(u)}pager(t,e){let s=this.t,i=t?this.page*this.pageSize+1:0,r=Math.min(t,(this.page+1)*this.pageSize),a=n=>{this.page=Math.max(0,Math.min(e-1,n)),this.renderTable()},c=(n,l,d,p)=>{let u=H({icon:n,label:s(l),key:l,onClick:()=>a(d)});return u.disabled=p,u},h=this.query?`${s("matchingRows",{count:g(t,this.locale)})} \xB7 ${s("rowsRange",{from:g(i,this.locale),to:g(r,this.locale),total:g(t,this.locale)})}`:s("rowsRange",{from:g(i,this.locale),to:g(r,this.locale),total:g(t,this.locale)});return o("div",{class:"pager",part:"pager"},o("span",{class:"pager-info",attrs:{"aria-live":"polite"},text:h}),e>1?o("div",{class:"toolbar"},c("chevrons-left","firstPage",0,this.page===0),c("chevron-left","previousPage",this.page-1,this.page===0),c("chevron-right","nextPage",this.page+1,this.page>=e-1),c("chevrons-right","lastPage",e-1,this.page>=e-1)):null)}sortBy(t,e){let s=this.sort?.column!==t?"ascending":this.sort.direction==="ascending"?"descending":null;this.sort=s?{column:t,direction:s}:null,this.page=0,this.renderTable(),this.root.querySelector(`[data-focus-key="sort-${t}"]`)?.focus(),C(this,x.SORT,{column:t,name:e,direction:s??"none"})}search(t){this.query=t,this.page=0,this.searchMatches=[],this.current=-1;let e=!1;if(t){let{types:s,data:i}=this.model(),r=t.toLowerCase();for(let a of this.order(i,s))if(i[a].forEach((c,h)=>{this.searchMatches.length>=V?e=!0:c.toLowerCase().includes(r)&&this.searchMatches.push({row:a,column:h})}),e)break}return this.renderTable(),{total:this.searchMatches.length,capped:e}}goToMatch(t){let e=this.searchMatches[t];if(!e)return;this.current=t;let{types:s,data:i}=this.model(),r=this.order(i,s).indexOf(e.row),a=Math.floor(r/this.pageSize);a!==this.page?(this.page=a,this.renderTable()):this.highlightMatches(this.tableHost?.querySelector("tbody"))}highlightMatches(t){let e=this.searchMatches[this.current];for(let s of t.querySelectorAll("td[data-row]")){let i=new k(s);if(i.clear(),!i.run(this.query).total)continue;if(e&&Number(s.getAttribute("data-row"))===e.row&&Number(s.getAttribute("data-column"))===e.column){for(let a of i.matches)for(let c of a)c.classList.add("current");S(i.matches[0]?.[0]??null)}}}createEditor(){this.editor?.destroy();let t=new O({text:this.text??"",language:"plaintext",lineNumbers:this.feature("line-numbers"),wrap:!1,highlightLimit:M().highlightLimit,label:this.heading||`CSV ${this.t("editor").toLowerCase()}`,placeholder:this.getAttribute("placeholder")??void 0,onInput:e=>this.edited(e),onChange:e=>C(this,x.CHANGE,{value:e}),history:this.editHistory??void 0});return this.editor=t,this.status=o("div",{class:"edit-status",part:"status",attrs:{role:"status"}}),this.showStatus(),t}showStatus(){if(!this.status)return;let{names:t,data:e,result:s}=this.model(),i=this.t,r=!s.error;this.status.className=`edit-status ${r?"ok":"bad"}`;let a=r?i("csvStatus",{rows:g(e.length,this.locale),columns:g(t.length,this.locale)}):i("csvUnclosed",{line:s.error.line});this.status.replaceChildren(T(r?"check":"alert"),o("span",{text:a}))}contentEdited(){this.parsed=null,clearTimeout(this.parseTimer),this.parseTimer=setTimeout(()=>{this.showStatus(),this.searchOpen&&this.searchQuery&&this.searchBar?.run()},150)}selectView(t){t!==this.view&&(this.viewState=t,this.render(),this.root.querySelector(`[data-tab="${t}"]`)?.focus(),C(this,x.TAB_CHANGE,{tab:t}))}disconnectedCallback(){clearTimeout(this.parseTimer),this.editor?.destroy(),super.disconnectedCallback()}};export{F as a};
//# sourceMappingURL=chunk-7HDCHGAS.js.map
