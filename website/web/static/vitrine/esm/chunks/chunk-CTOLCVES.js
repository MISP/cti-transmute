/*! Vitrine v0.0.0 | MIT License | https://github.com/ecrou-exact/vitrine
 * Includes: highlight.js 11.12.0 (BSD-3-Clause), marked 18.1.3 (MIT), DOMPurify 3.4.17 (Apache-2.0 OR MPL-2.0), Lucide 1.52.0 (ISC; icons derived from Feather: MIT).
 * Full license texts: THIRD_PARTY_NOTICES.md */
import{b as Qe}from"./chunk-JZ3PJRDP.js";import{a as $e}from"./chunk-M662NQ6S.js";import{b as Be,c as qe,d as Me,e as Oe,g as De,l as Ze,m as Ne,n as He}from"./chunk-B7F4FUUX.js";import{N as Y,O as J,Y as Pe,ca as he,da as Ce,ea as ee,f as _e,fa as Le,g as Ae,ha as Ee,i as H,j as Re,ka as Ie,p as K,r as y,t as Te,w as ze}from"./chunk-ROOVB7KQ.js";var je=`/*
 * Rendered Markdown. The content inherits the host page font (it is the host's content);
 * only the chrome uses the UI font. Spec: docs/DESIGN_SYSTEM.md \xA73.3.
 */
.vt.md {
  font-family: var(--vt-font-body, inherit);
  font-size: var(--vt-font-size-body, inherit);
}

.vt {
  container-type: inline-size;
}

.panel {
  min-width: 0;
}

.panel.split {
  /* Panes scroll on their own so they can be kept in sync; max-height sets their size. */
  --_split-height: var(--_max-height, min(70vh, 640px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.panel.split > .body {
  height: var(--_split-height);
  max-height: none;
}

.panel.split > .body + .body {
  border-left: 1px solid var(--_border);
}

.panel.split:is([data-preview='top'], [data-preview='bottom']) {
  grid-template-columns: minmax(0, 1fr);
}

.panel.split:is([data-preview='top'], [data-preview='bottom']) > .body {
  height: calc(var(--_split-height) / 2);
}

.panel.split:is([data-preview='top'], [data-preview='bottom']) > .body + .body {
  border-top: 1px solid var(--_border);
  border-left: 0;
}

@container (max-width: 640px) {
  .panel.split {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel.split > .body {
    height: calc(var(--_split-height) / 2);
  }

  .panel.split > .body + .body {
    border-top: 1px solid var(--_border);
    border-left: 0;
  }
}

.md-body {
  padding: var(--_space-5);
  background: var(--_surface);
}

/* ---------- Table of contents ---------- */

.toc {
  margin: 0 0 var(--_space-5);
  padding: var(--_space-2) var(--_space-3);
  border: 1px solid var(--_border);
  border-radius: var(--_radius-sm);
  background: var(--_surface-sunken);
}

.toc summary {
  color: var(--_fg-muted);
  font-size: var(--_font-size-small);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.toc-list {
  margin: var(--_space-2) 0 var(--_space-1);
  padding: 0;
  list-style: none;
}

.toc-list li {
  padding: 2px 0;
}

.toc-list a {
  color: var(--_accent-fg);
  text-decoration: none;
}

.toc-list a:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.toc-level-1 {
  padding-left: var(--_space-4) !important;
}

.toc-level-2 {
  padding-left: var(--_space-6) !important;
}

.toc-level-3 {
  padding-left: 48px !important;
}

/* ---------- Typography ---------- */

.markdown {
  color: var(--_fg);
  line-height: 1.65;
  overflow-wrap: break-word;
}

.markdown > :first-child,
.markdown > [data-vt-line]:first-child + * {
  margin-top: 0;
}

.markdown > :last-child {
  margin-bottom: 0;
}

.markdown :is(h1, h2, h3, h4, h5, h6) {
  position: relative;
  margin: 1.6em 0 0.6em;
  color: var(--_fg);
  font-weight: 650;
  line-height: 1.25;
  scroll-margin-top: var(--_space-4);
}

.markdown h1 {
  font-size: 1.75em;
  letter-spacing: -0.02em;
}

.markdown h2 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--_border);
  font-size: 1.4em;
  letter-spacing: -0.01em;
}

.markdown h3 {
  font-size: 1.2em;
}

.markdown h4 {
  font-size: 1.05em;
}

.markdown :is(h5, h6) {
  color: var(--_fg-muted);
  font-size: 0.95em;
}

.markdown :is(h1, h2, h3, h4, h5, h6):focus {
  outline: none;
}

.anchor {
  display: inline-grid;
  place-items: center;
  width: 1.4em;
  height: 1.4em;
  margin-left: 0.25em;
  border-radius: var(--_radius-sm);
  color: var(--_fg-muted);
  vertical-align: middle;
  opacity: 0;
  transition: opacity var(--_duration-fast) var(--_easing);
}

.anchor .icon {
  width: 0.8em;
  height: 0.8em;
}

:is(h1, h2, h3, h4, h5, h6):hover .anchor,
.anchor:focus-visible {
  opacity: 1;
}

.anchor:hover {
  background: var(--_accent-soft);
  color: var(--_accent-fg);
}

@media (hover: none) {
  .anchor {
    opacity: 0.6;
  }
}

.markdown :is(p, ul, ol, dl, blockquote, .table-wrap, .code-block, details, figure) {
  margin: 0 0 1em;
}

.markdown a {
  color: var(--_accent-fg);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}

.markdown a:hover {
  text-decoration-thickness: 2px;
}

.markdown :is(ul, ol) {
  padding-left: 1.6em;
}

.markdown li + li {
  margin-top: 0.25em;
}

.markdown li > :is(ul, ol) {
  margin: 0.25em 0 0;
}

.markdown li:has(> input[type='checkbox']) {
  list-style: none;
}

.markdown li > input[type='checkbox'] {
  margin: 0 0.5em 0 -1.4em;
  vertical-align: -0.1em;
  accent-color: var(--_accent);
}

.markdown blockquote {
  padding: 0 0 0 1em;
  border-left: 3px solid var(--_border-strong);
  color: var(--_fg-muted);
}

.markdown hr {
  height: 0;
  margin: 2em 0;
  border: 0;
  border-top: 1px solid var(--_border);
}

.markdown img {
  max-width: 100%;
  height: auto;
  border-radius: var(--_radius-sm);
}

.vt-blocked-image {
  display: inline-flex;
  align-items: center;
  gap: var(--_space-1);
  padding: 2px 8px;
  border: 1px dashed var(--_border-strong);
  border-radius: var(--_radius-sm);
  color: var(--_fg-muted);
  font-size: 0.875em;
}

.vt-blocked-image:empty::before {
  content: '\\25A1';
}

.markdown :is(code, kbd, samp) {
  font-family: var(--_font-mono);
  font-size: 0.875em;
}

.markdown :not(pre) > code {
  padding: 0.12em 0.35em;
  border-radius: var(--_radius-sm);
  background: var(--_surface-sunken);
}

.markdown kbd {
  padding: 0.1em 0.4em;
  border: 1px solid var(--_border-strong);
  border-radius: var(--_radius-sm);
  background: var(--_surface-raised);
  box-shadow: inset 0 -1px 0 var(--_border-strong);
}

.markdown mark {
  background: var(--_highlight);
  color: inherit;
}

/* ---------- Code blocks ---------- */

.code-block {
  position: relative;
}

.code-block pre {
  margin: 0;
  padding: var(--_space-3) var(--_space-4);
  overflow: auto;
  border: 1px solid var(--_border);
  border-radius: var(--_radius-sm);
  background: var(--_code-bg);
  color: var(--_code-fg);
  font-family: var(--_font-mono);
  font-size: var(--_font-size);
  line-height: var(--_line-height);
  tab-size: var(--_tab-size);
}

.code-block pre code {
  font-size: inherit;
}

.code-block > .btn {
  position: absolute;
  top: var(--_space-1);
  right: var(--_space-1);
  border: 1px solid var(--_border);
  background: var(--_surface);
  opacity: 0;
}

.code-block:hover > .btn,
.code-block > .btn:focus-visible,
.code-block > .btn.done {
  opacity: 1;
}

@media (hover: none) {
  .code-block > .btn {
    opacity: 1;
  }
}

/* ---------- Tables ---------- */

.table-wrap {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--_border);
  border-radius: var(--_radius-sm);
}

.markdown table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.925em;
  font-variant-numeric: tabular-nums;
}

.markdown :is(th, td) {
  padding: var(--_space-2) var(--_space-3);
  border-bottom: 1px solid var(--_border);
  text-align: start;
  vertical-align: top;
}

.markdown tr:last-child td {
  border-bottom: 0;
}

.markdown th {
  background: var(--_surface-sunken);
  color: var(--_fg-muted);
  font-size: 0.8em;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.markdown :is(th, td)[align='center'] {
  text-align: center;
}

.markdown :is(th, td)[align='right'] {
  text-align: end;
}

.markdown details {
  padding: var(--_space-2) var(--_space-3);
  border: 1px solid var(--_border);
  border-radius: var(--_radius-sm);
}

.markdown summary {
  cursor: pointer;
  font-weight: 600;
}
`;function ge(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var I=ge();function tt(s){I=s}var L={exec:()=>null};function C(s){let e=[];return t=>{let r=Math.max(0,Math.min(3,t-1)),n=e[r];return n||(n=s(r),e[r]=n),n}}function g(s,e=""){let t=typeof s=="string"?s:s.source,r={replace:(n,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(w.caret,"$1"),t=t.replace(n,o),r},getRegex:()=>new RegExp(t,e)};return r}var rt=((s="")=>{try{return!!new RegExp("(?<=1)(?<!1)"+s)}catch{return!1}})(),w={codeRemoveIndent:/^(?: {0,3}\t| {1,4})/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,endingSpaceTabChar:/[ \t]$/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,leadingSpaceTab:/^[ \t]+/,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+)[ \t]*)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,blockquoteMarkerWhitespace:/^( {0,3}>)([ \t]+)/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\][ \t]+\S/,listReplaceTask:/^\[[ xX]\][ \t]+/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,numericCharacterReference:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));/,numericCharacterReferenceOrAmpersand:/&#(?:(\d{1,7})|[Xx]([A-Fa-f0-9]{1,6}));|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:s=>new RegExp(`^( {0,3}${s})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:C(s=>new RegExp(`^ {0,${s}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:C(s=>new RegExp(`^ {0,${s}}((?:-[ 	]*){3,}|(?:_[ 	]*){3,}|(?:\\*[ 	]*){3,})(?:\\n+|$)`)),fencesBeginRegex:C(s=>new RegExp(`^ {0,${s}}(?:\`\`\`|~~~)`)),headingBeginRegex:C(s=>new RegExp(`^ {0,${s}}#{1,6}(?:\\s|$)`)),pedanticHeadingBeginRegex:C(s=>new RegExp(`^ {0,${s}}#`)),htmlBeginRegex:C(s=>new RegExp(`^ {0,${s}}(?:</?(?:${F})(?: +|$|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)`,"i")),blockquoteBeginRegex:C(s=>new RegExp(`^ {0,${s}}>`))},gt=/^(?:[ \t]*(?:\n|$))+/,ft=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,kt=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}(?:(?=`)\1`*|(?=~)\1~*) *(?=\n|$)|$)/,U=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,bt=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,fe=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,nt=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |fences|blockquote|heading|hr|html|table))+?)\n {0,3}(=+|-+)[ \t]*(?:\n+|$)/,st=g(nt).replace(/bull/g,fe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),mt=g(nt).replace(/bull/g,fe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/hr/g,/ {0,3}(?:(?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),ke=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,xt=/^[^\n]+/,be=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\\n]|\n(?![ \t]*\n))+/,wt=g(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",be).replace("title",/(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\\n]|\n(?!\n))*'|\((?:\\[\s\S]|[^()\\])*\))/).getRegex(),yt=g(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,fe).getRegex(),F="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",me=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,vt=g("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?:[ \\t]+|\\n|/?>|$)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!(?:script|pre|style|textarea)(?![a-z0-9-]))([a-z][a-z0-9-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</[a-z][a-z0-9-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",me).replace("tag",F).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),it=s=>g(ke).replace("hr",U).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list",s).replace("html"," {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag",F).getRegex(),St=it(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),_t=it(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),$t=g(/^( {0,3}> ?(?:(?![ \t]*(?:\n|$))(paragraph)|[^\n]*)(?:\n|$))+/).replace("paragraph",_t).getRegex(),xe={blockquote:$t,code:ft,def:wt,fences:kt,heading:bt,hr:U,html:vt,lheading:st,list:yt,newline:gt,paragraph:St,table:L,text:xt},Ue=g("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",U).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html"," {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag",F).getRegex(),At={...xe,lheading:mt,table:Ue,paragraph:g(ke).replace("hr",U).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ue).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html"," {0,3}(?:</?(?:tag)(?: +|\\n|/?>)|<(?:(?:script|pre|style|textarea)(?:[\\s>]|$)|!--)|<\\?|<![A-Za-z]|<!\\[CDATA\\[)").replace("tag",F).getRegex()},Rt={...xe,html:g(`^ *(?:comment(?: *\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1>(?: *\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?>(?: *\\n{2,}|\\s*$))`).replace("comment",me).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:L,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:g(ke).replace("hr",U).replace("heading",` *#{1,6} *[^
]`).replace("lheading",st).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Tt=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,zt=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,lt=/^( {2,}|\\)\n(?!\s*$)[ \t]*/,Pt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,A=/[\p{P}\p{S}]/u,D=/[\s\p{P}\p{S}]/u,G=/[^\s\p{P}\p{S}]/u,Ct=g(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,D).getRegex(),Lt=/[\p{Pi}\p{Ps}"']/u,ot=/(?!~)[\p{P}\p{S}]/u,Et=/(?!~)[\s\p{P}\p{S}]/u,It=/(?:[^\s\p{P}\p{S}]|~)/u,Bt=g(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",rt?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),at=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,qt=g(at,"u").replace(/punct/g,A).getRegex(),Mt=g(at,"u").replace(/punct/g,ot).getRegex(),Ot=/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,Dt=g(Ot,"u").replace(/openQuote/g,Lt).replace(/punct/g,A).getRegex(),ct="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Zt=g(ct,"gu").replace(/notPunctSpace/g,G).replace(/punctSpace/g,D).replace(/punct/g,A).getRegex(),Nt=g(ct,"gu").replace(/notPunctSpace/g,It).replace(/punctSpace/g,Et).replace(/punct/g,ot).getRegex(),Ht="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)",Qt=g(Ht,"gu").replace(/notPunctSpace/g,G).replace(/punctSpace/g,D).replace(/punct/g,A).getRegex(),jt=g("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,G).replace(/punctSpace/g,D).replace(/punct/g,A).getRegex(),Ut="^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)",Ft=g(Ut,"gu").replace(/notPunctSpace/g,G).replace(/punctSpace/g,D).replace(/punct/g,A).getRegex(),Gt=g(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,A).getRegex(),Wt="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",Xt=g(Wt,"gu").replace(/notPunctSpace/g,G).replace(/punctSpace/g,D).replace(/punct/g,A).getRegex(),Vt=g(/\\(punct)/,"gu").replace(/punct/g,A).getRegex(),Kt=g(/(`+)(?:[^`]|[^`][\s\S]*?[^`])\1(?!`)|`+|\\(punct)/,"gu").replace(/punct/g,A).getRegex(),Yt=g(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Jt=g(me).replace("(?:-->|$)","-->").getRegex(),er=g("^comment|^</[a-zA-Z][a-zA-Z0-9-]*\\s*>|^<[a-zA-Z][a-zA-Z0-9-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Jt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ht=/\[(?:\\[\s\S]|[^\[\]\\])*\]/,ne=g(/(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/).replace("brackets",ht).getRegex(),tr=g(/^!?\[(label)\]\([ \t\n]*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?[ \t\n]*\)/).replace("label",ne).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title",/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\((?:\\[\s\S]|[^)\\])*\)/).getRegex(),rr=g(/^!?\[(label)\]\[(ref)\]/).replace("label",ne).replace("ref",be).getRegex(),nr=g(/^!?\[(ref)\](?:\[\])?/).replace("ref",be).getRegex(),Fe=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\]){1,999}/,sr=g(/(?:[^\[\]\\`]*(?:\[(?:brackets|\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\]))){0,999}?[^\[\]\\`]*?/).replace("brackets",ht).getRegex(),ir=g("reflink|nolink(?!\\()","g").replace("reflink",g(/^!?\[(label)\]\[(ref)\]/).replace("label",sr).replace("ref",Fe).getRegex()).replace("nolink",g(/^!?\[(ref)\](?:\[\])?/).replace("ref",Fe).getRegex()).getRegex(),Ge=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,lr=/[A-Za-z0-9._+-]+@[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/,or=g(/(?:mailto:email|xmpp:email(?:\/[A-Za-z0-9@.]+)?)/).replace(/email/g,lr).getRegex(),we={_backpedal:L,anyPunctuation:Vt,anyPunctuationOutsideCode:Kt,autolink:Yt,blockSkip:Bt,br:lt,code:zt,del:L,delLDelim:L,delRDelim:L,emStrongLDelim:qt,emStrongRDelimAst:Zt,emStrongRDelimUnd:jt,escape:Tt,link:tr,nolink:nr,punctuation:Ct,reflink:rr,reflinkSearch:ir,tag:er,text:Pt,url:L},ar={...we,emStrongLDelim:Dt,emStrongRDelimAst:Qt,emStrongRDelimUnd:Ft,link:g(/^!?\[(label)\]\((.*?)\)/).replace("label",ne).getRegex(),reflink:g(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ne).getRegex()},pe={...we,emStrongRDelimAst:Nt,emStrongLDelim:Mt,delLDelim:Gt,delRDelim:Xt,url:g(/^emailProtocol|^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("emailProtocol",or).replace("protocol",Ge).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![\w-])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:g(/^(?:[^a-zA-Z0-9](?=emailProtocol)|(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|wwwStart|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9](?=emailProtocol)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))))/).replace("protocol",Ge).replace(/emailProtocol/g,/(?:mailto|xmpp):/).replace("wwwStart",rt?"(?<![^\\s*_~(])www\\.":"www\\.").getRegex()},cr={...pe,br:g(lt).replace("{2,}","*").getRegex(),text:g(pe.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},te={normal:xe,gfm:At,pedantic:Rt},Q={normal:we,gfm:pe,breaks:cr,pedantic:ar},hr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},We=s=>hr[s];function S(s,e){if(e){if(w.escapeTest.test(s))return s.replace(w.escapeReplace,We)}else if(w.escapeTestNoEncode.test(s))return s.replace(w.escapeReplaceNoEncode,We);return s}function pr(s){return w.numericCharacterReference.test(s)?s.replace(w.numericCharacterReferenceOrAmpersand,(e,t,r)=>{if(t===void 0&&r===void 0)return"&amp;";let n=t===void 0?Number.parseInt(r,16):Number.parseInt(t,10);return n===0||n>1114111||n>=55296&&n<=57343?"\uFFFD":n===38?"&amp;":String.fromCodePoint(n)}):s}function Xe(s){try{s=encodeURI(s).replace(w.percentDecode,"%")}catch{return null}return s}function Ve(s,e){let t=s.replace(w.findPipe,(i,o,l)=>{let h=!1,a=o;for(;--a>=0&&l[a]==="\\";)h=!h;return h?"|":" |"}),r=t.split(w.splitPipe),n=0;if(r[0].trim()||r.shift(),r.length>0&&!r.at(-1)?.trim()&&r.pop(),e)if(r.length>e)r.splice(e);else for(;r.length<e;)r.push("");for(;n<r.length;n++)r[n]=r[n].trim().replace(w.slashPipe,"|");return r}function T(s,e,t){let r=s.length;if(r===0)return"";let n=0;for(;n<r;){let i=s.charAt(r-n-1);if(i===e&&!t)n++;else if(i!==e&&t)n++;else break}return s.slice(0,r-n)}function Ke(s){let e=s.split(`
`),t=e.length-1;for(;t>=0&&w.blankLine.test(e[t]);)t--;return e.length-t<=2?s:e.slice(0,t+1).join(`
`)}function se(s){return s.trim().replace(w.multipleSpaceGlobal," ").toLowerCase().toUpperCase().toLowerCase()}function Ye(s,e){if(s.indexOf(e[0])===-1&&s.indexOf(e[1])===-1)return-1;let t=0;for(let r=0;r<s.length;r++)if(s[r]==="\\")r++;else if(s[r]===e[0])t++;else if(s[r]===e[1]&&(t--,t<0))return r;return t>0?-2:-1}var O=new WeakMap;function ye(s){let e={"*":-1,_:-1},t=-1,r=s.length;for(let n=0;n<r;n++){let i=s[n];if(i!=="*"&&i!=="_"&&i!=="~")continue;let o=n===0?`
`:s[n-1],l=n+1;for(;l<r&&s[l]===i;)l++;o!==" "&&o!=="	"&&o!==`
`&&o!=="\r"&&o!=="\f"&&(i==="~"?t=n:e[i]=n),n=l-1}return{maskedSrc:s,lastPossibleEmStrongCloserIndex:e,lastPossibleDelCloserIndex:t}}function ur(s,e){let t=ye(e),r=O.get(s);r?r.push(t):O.set(s,[t])}function dr(s){let e=O.get(s);e&&(e.pop(),e.length===0&&O.delete(s))}function gr(s,e,t){let r=O.get(s)?.at(-1);return r&&r.maskedSrc===e?r.lastPossibleEmStrongCloserIndex[t]:ye(e).lastPossibleEmStrongCloserIndex[t]}function fr(s,e){let t=O.get(s)?.at(-1);return t&&t.maskedSrc===e?t.lastPossibleDelCloserIndex:ye(e).lastPossibleDelCloserIndex}function re(s,e=0){let t=e,r="";for(let n of s)if(n==="	"){let i=4-t%4;r+=" ".repeat(i),t+=i}else r+=n,t++;return r}function Je(s,e,t,r,n){let i=e.href,o=e.title||null,l=s[1].replace(n.other.outputLinkReplace,"$1"),h=s[0].charAt(0)==="!",a=r.state.inLink,c=r.state.linkEmitted,p=r.state.inRawBlock;r.state.inLink=!0,r.state.linkEmitted=!1;let f=r.inlineTokens(l),u=r.state.linkEmitted;if(r.state.linkEmitted=c,r.state.inLink=a,!h){if(u){r.state.inRawBlock=p;return}r.state.linkEmitted=!0}return{type:h?"image":"link",raw:t,href:i,title:o,text:l,tokens:f}}function kr(s,e,t){let r=s.match(t.other.indentCodeCompensation);if(r===null)return e;let n=r[1];return e.split(`
`).map(i=>{let o=i.match(t.other.beginningSpace);if(o===null)return i;let[l]=o;return i.slice(Math.min(l.length,n.length))}).join(`
`)}function et(s,e,t,r){if(!e.includes("<"))return!1;for(let n=0;n<e.length;n++){if(e[n]==="\\"){n++;continue}if(e[n]==="`"){let l=r.inline.code.exec(e.slice(n));if(l){n+=l[0].length-1;continue}}if(e[n]!=="<")continue;let i=s.slice(t+n),o=r.inline.tag.exec(i)||r.inline.autolink.exec(i);if(o){if(o[0].length>e.length-n)return!0;n+=o[0].length-1}}return!1}var M=class{options;rules;lexer;constructor(s){this.options=s||I}space(s){let e=this.rules.block.newline.exec(s);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(s){let e=this.rules.block.code.exec(s);if(e){let t=this.options.pedantic?e[0]:Ke(e[0]),r=t.replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t,codeBlockStyle:"indented",text:r}}}fences(s){let e=this.rules.block.fences.exec(s);if(e){let t=e[0],r=kr(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:r}}}heading(s){let e=this.rules.block.heading.exec(s);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let r=T(t,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceTabChar.test(r))&&(t=r.trim())}return{type:"heading",raw:T(e[0],`
`),depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(s){let e=this.rules.block.hr.exec(s);if(e)return{type:"hr",raw:T(e[0],`
`)}}blockquote(s){let e=this.rules.block.blockquote.exec(s);if(e){let t=T(e[0],`
`).split(`
`),r="",n="",i=[];for(;t.length>0;){let o=!1,l=[],h;for(h=0;h<t.length;h++)if(this.rules.other.blockquoteStart.test(t[h]))l.push(t[h]),o=!0;else if(!o)l.push(t[h]);else break;t=t.slice(h);let a=l.join(`
`),c=a.replace(this.rules.other.blockquoteMarkerWhitespace,(u,d,m)=>d+re(m,d.length)).replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${a}`:a,n=n?`${n}
${c}`:c;let p=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,i,!0),this.lexer.state.top=p,t.length===0)break;let f=i.at(-1);if(f?.type==="code"||f?.type==="heading"||f?.type==="hr"||f?.type==="html"||f?.type==="table")break;if(f?.type==="blockquote"){let u=f,d=t.join(`
`),m=u.raw+`
`+d.replace(this.rules.other.blockquoteSetextReplace2,""),k=this.blockquote(m);i[i.length-1]=k;let v=m.substring(k.raw.length).replace(/^\n/,""),x=v?v.split(`
`).length:0,R=x?t.slice(0,-x):t;if(R.length>0&&(r=`${r}
${R.join(`
`)}`),n=n.substring(0,n.length-u.text.length)+k.text,t=t.slice(R.length),t.length>0&&this.rules.other.blockquoteStart.test(t[0]))continue;break}else if(f?.type==="list"){let u=f,d=u.raw+`
`+t.join(`
`),m=this.list(d);i[i.length-1]=m;let k=m.raw.length>u.raw.length?d.slice(u.raw.length+1,m.raw.length).split(`
`).length:0;if(k>0){let v=t.slice(0,k).join(`
`);r=`${r}
${v}`,n=`${n}
${v}`}t=t.slice(k);continue}}return{type:"blockquote",raw:r,tokens:i,text:n}}}list(s){let e=this.rules.block.list.exec(s);if(e){let t=s,r=()=>t.length-s.length,n=e[1].trim(),i=n.length>1,o={type:"list",raw:"",ordered:i,start:i?+n.slice(0,-1):"",loose:!1,items:[]};n=i?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=i?n:"[*+-]");let l=this.rules.other.listItemRegex(n),h=!1;for(;s;){let c=!1,p="";if(!(e=l.exec(s))||this.rules.block.hr.test(s))break;let f=r();s=s.substring(e[0].length);let u=e[2].split(`
`,1)[0],d=e[1].length,m=this.options.pedantic?re(u,d):u.replace(this.rules.other.leadingSpaceTab,B=>re(B,d)),k=s.split(`
`,1)[0],v=!m.trim(),x=0;if(this.options.pedantic?(x=2,p=m.trimStart()):v?x=d+1:(x=m.search(this.rules.other.nonSpaceChar),x=x>4?1:x,p=m.slice(x),x+=d),v&&this.rules.other.blankLine.test(k)&&(s=s.substring(k.length+1),c=!0),!c){let B=this.rules.other.nextBulletRegex(x),Z=this.rules.other.hrRegex(x),W=this.rules.other.fencesBeginRegex(x),X=this.options.pedantic?this.rules.other.pedanticHeadingBeginRegex(x):this.rules.other.headingBeginRegex(x),P=this.rules.other.htmlBeginRegex(x),V=this.rules.other.blockquoteBeginRegex(x);for(;s;){let N=s.split(`
`,1)[0],q;if(k=N,this.options.pedantic?(k=k.replace(this.rules.other.listReplaceNesting,"  "),q=k):q=k.replace(this.rules.other.leadingSpaceTab,ce=>re(ce)),W.test(k)||X.test(k)||P.test(k)||V.test(k)||B.test(k)||Z.test(k))break;if(q.search(this.rules.other.nonSpaceChar)>=x||!k.trim())p+=`
`+q.slice(x);else{if(v||m.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||W.test(m)||X.test(m)||P.test(m)||Z.test(m))break;let ce=!this.options.pedantic&&/^ {0,3}(?:=+|-+) *$/.test(k)&&this.rules.block.lheading.test(`${m}
${k}`)?`    ${q.replace(/^ {0,3}/,"")}`:k;p+=`
`+ce}v=!k.trim(),s=s.substring(N.length+1),m=q.slice(x)}}let R=t.slice(f,r());o.loose||(h?o.loose=!0:this.rules.other.doubleBlankLine.test(R)&&(h=!0)),o.items.push({type:"list_item",raw:R,task:!!this.options.gfm&&this.rules.other.listIsTask.test(p),loose:!1,text:p,tokens:[]})}let a=o.items.at(-1);if(a)a.raw=a.raw.trimEnd(),a.text=a.text.trimEnd();else return;o.raw=t.slice(0,r()).trimEnd();for(let c of o.items)if(this.lexer.state.top=!1,c.tokens=this.lexer.blockTokens(c.text,[]),!o.loose){let p=c.tokens.filter(u=>u.type==="space"),f=p.length>0&&p.some(u=>this.rules.other.anyLine.test(u.raw));o.loose=f}for(let c of o.items){let p=c.tokens[0];if(c.task&&(p?.type==="text"||p?.type==="paragraph")){c.text=c.text.replace(this.rules.other.listReplaceTask,""),p.raw=p.raw.replace(this.rules.other.listReplaceTask,""),p.text=p.text.replace(this.rules.other.listReplaceTask,"");for(let u=this.lexer.inlineQueue.length-1;u>=0;u--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[u].src)){this.lexer.inlineQueue[u].src=this.lexer.inlineQueue[u].src.replace(this.rules.other.listReplaceTask,"");break}let f=this.rules.other.listTaskCheckbox.exec(c.raw);if(f){let u={type:"checkbox",raw:f[0]+" ",checked:f[0]!=="[ ]"};c.checked=u.checked,o.loose?c.tokens[0]&&["paragraph","text"].includes(c.tokens[0].type)&&"tokens"in c.tokens[0]&&c.tokens[0].tokens?(c.tokens[0].raw=u.raw+c.tokens[0].raw,c.tokens[0].text=u.raw+c.tokens[0].text,c.tokens[0].tokens.unshift(u)):c.tokens.unshift({type:"paragraph",raw:u.raw,text:u.raw,tokens:[u]}):c.tokens.unshift(u)}}else c.task&&(c.task=!1)}if(o.loose)for(let c of o.items){c.loose=!0;for(let p of c.tokens)p.type==="text"&&(p.type="paragraph")}return o}}html(s){let e=this.rules.block.html.exec(s);if(e){let t=Ke(e[0]);return{type:"html",block:!0,raw:t,pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:t}}}def(s){let e=this.rules.block.def.exec(s);if(e){if(!this.rules.other.startAngleBracket.test(e[2])&&Ye(e[2],"()")!==-1)return;let t=se(e[1]),r=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:T(e[0],`
`),href:r,title:n}}}table(s){let e=this.rules.block.table.exec(s);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=Ve(e[1]),r=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:T(e[0],`
`),header:[],align:[],rows:[]};if(t.length===r.length){for(let o of r)this.rules.other.tableAlignRight.test(o)?i.align.push("right"):this.rules.other.tableAlignCenter.test(o)?i.align.push("center"):this.rules.other.tableAlignLeft.test(o)?i.align.push("left"):i.align.push(null);for(let o=0;o<t.length;o++)i.header.push({text:t[o],tokens:this.lexer.inline(t[o]),header:!0,align:i.align[o]});for(let o of n)i.rows.push(Ve(o,i.header.length).map((l,h)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:i.align[h]})));return i}}lheading(s){let e=this.rules.block.lheading.exec(s);if(e){let t=e[1].trim();return{type:"heading",raw:T(e[0],`
`),depth:e[2].charAt(0)==="="?1:2,text:t,tokens:this.lexer.inline(t)}}}paragraph(s){let e=this.rules.block.paragraph.exec(s);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(s){let e=this.rules.block.text.exec(s);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(s){let e=this.rules.inline.escape.exec(s);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(s){let e=this.rules.inline.tag.exec(s);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(s){if(this.lexer.state.linkParenPossible===!1)return;let e=this.rules.inline.link.exec(s);if(e){let t=e[0].charAt(0)==="!"?2:1;if(!this.options.pedantic&&et(s,e[1],t,this.rules))return;let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let l=T(r.slice(0,-1),"\\");if((r.length-l.length)%2===0)return}else{let l=Ye(e[2],"()");if(l===-2)return;if(l>-1){let h=(e[0].indexOf("!")===0?5:4)+e[1].length+l;e[2]=e[2].substring(0,l),e[0]=e[0].substring(0,h).trim(),e[3]=""}}let n=T(e[0].slice(0,-1),"\\");if((e[0].length-n.length)%2===0)return;let i=e[2],o="";if(this.options.pedantic){let l=this.rules.other.pedanticHrefTitle.exec(i);l&&(i=l[1],o=l[3])}else o=e[3]?e[3].slice(1,-1):"";return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?i=i.slice(1):i=i.slice(1,-1)),Je(e,{href:i&&i.replace(this.rules.inline.anyPunctuation,"$1"),title:o&&o.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(s,e){let t;if((t=this.rules.inline.reflink.exec(s))||(t=this.rules.inline.nolink.exec(s))){let r=t[0].charAt(0)==="!"?2:1;if(!this.options.pedantic&&et(s,t[1],r,this.rules))return;let n=e[se(t[2]||t[1])];if(!n){let i=t[0].charAt(0);return{type:"text",raw:i,text:i}}return Je(t,n,t[0],this.lexer,this.rules)}}emStrong(s,e,t=""){let r=this.rules.inline.emStrongLDelim.exec(s);if(!r||!r[1]&&!r[2]&&!r[3]&&!r[4])return;let n=r[0][0],i=t===n,o=e.length-s.length,l=o;for(;!this.options.pedantic&&l>0&&e[l-1]===n;)l--;let h=[...e.slice(Math.max(0,l-2),l)].at(-1)??"",a=h==="*"||h==="_"||!!this.rules.inline.punctuation.exec(h);l<o&&(t=h);let c=l<o?a:!!this.rules.inline.punctuation.exec(t);if(r[4]&&t.match(this.rules.other.unicodeAlphaNumeric))return;let p=r[1]||r[3]||"";if(!p||!t||c){let f=[...r[0]].length-1,u,d,m=f,k=0,v=o-l+f,x=!this.options.pedantic&&!!h.trim()&&(!!p||n==="*"&&!a);if(n!=="*"&&n!=="_")return;let R=n==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd,B=gr(this,e,n),Z=e.length-s.length+f;if(B<Z)return;e=e.slice(-1*s.length+f);let W=B-Z;for(R.lastIndex=0;(r=R.exec(e))!==null&&!(r.index>W);){if(u=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!u)continue;if(d=[...u].length,r[3]||r[4]){m+=d;continue}else if(r[5]||r[6]||x){if(i&&(r[5]||r[6]))break;if(v%3&&!((v+d)%3)){k+=d;continue}}if(m-=d,m>0)continue;d=Math.min(d,d+m+k);let X=[...r[0]][0].length,P=s.slice(0,f+r.index+X+d);if(Math.min(f,d)%2){let N=P.slice(1,-1);return{type:"em",raw:P,text:N,tokens:this.lexer.inlineTokens(N)}}let V=P.slice(2,-2);return{type:"strong",raw:P,text:V,tokens:this.lexer.inlineTokens(V)}}}}codespan(s){let e=this.rules.inline.code.exec(s);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(t),n=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return r&&n&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(s){let e=this.rules.inline.br.exec(s);if(e)return{type:"br",raw:e[0]}}del(s,e,t=""){let r=this.rules.inline.delLDelim.exec(s);if(r&&(!r[1]||!t||this.rules.inline.punctuation.exec(t))){let n=[...r[0]].length-1,i,o,l=n,h=this.rules.inline.delRDelim,a=fr(this,e),c=e.length-s.length+n;if(a<c)return;e=e.slice(-1*s.length+n);let p=a-c;for(h.lastIndex=0;(r=h.exec(e))!==null&&!(r.index>p);){if(i=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!i||(o=[...i].length,o!==n))continue;if(r[3]||r[4]){l+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l);let f=[...r[0]][0].length,u=s.slice(0,n+r.index+f+o),d=u.slice(n,-n);return{type:"del",raw:u,text:d,tokens:this.lexer.inlineTokens(d)}}}}autolink(s){let e=this.rules.inline.autolink.exec(s);if(e){let t,r;return e[2]==="@"?(t=e[1],r="mailto:"+t):(t=e[1],r=t),{type:"link",raw:e[0],text:t,href:r,autolink:!0,tokens:[{type:"text",raw:t,text:t}]}}}url(s){let e;if(e=this.rules.inline.url.exec(s)){let t,r;if(e[2]==="@")t=e[0],r="mailto:"+t;else{let n;do n=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(n!==e[0]);t=e[0],e[1]==="www."?r="http://"+e[0]:r=e[0]}return{type:"link",raw:e[0],text:t,href:r,autolink:!0,tokens:[{type:"text",raw:t,text:t}]}}}inlineText(s){let e=this.rules.inline.text.exec(s);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:t?e[0]:pr(e[0]),escaped:t}}}},_=class ue{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||I,this.options.tokenizer=this.options.tokenizer||new M,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,linkEmitted:!1,linkParenPossible:!0,top:!0};let t={other:w,block:te.normal,inline:Q.normal};this.options.pedantic?(t.block=te.pedantic,t.inline=Q.pedantic):this.options.gfm&&(t.block=te.gfm,this.options.breaks?t.inline=Q.breaks:t.inline=Q.gfm),this.tokenizer.rules=t}static get rules(){return{block:te,inline:Q}}static lex(e,t){return new ue(t).lex(e)}static lexInline(e,t){return new ue(t).inlineTokens(e)}lex(e){e=e.replace(w.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let r=this.inlineQueue[t];this.state.inRawBlock=!1,this.inlineTokens(r.src,r.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],r=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(w.tabCharGlobal,"    ").replace(w.spaceLine,""));let n=1/0;for(;e;){if(e.length<n)n=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(l=>(i=l.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let l=t.at(-1);i.raw.length===1&&l!==void 0?l.raw+=`
`:t.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let l=t.at(-1);l?.type==="paragraph"||l?.type==="text"?(l.raw+=(l.raw.endsWith(`
`)?"":`
`)+i.raw,l.text+=`
`+i.text,this.inlineQueue.at(-1).src=l.text):t.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let l=t.at(-1);l?.type==="paragraph"||l?.type==="text"?(l.raw+=(l.raw.endsWith(`
`)?"":`
`)+i.raw,l.text+=`
`+i.raw,this.inlineQueue.at(-1).src=l.text):(this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title}),t.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),t.push(i);continue}let o=e;if(this.options.extensions?.startBlock){let l=1/0,h=e.slice(1),a;this.options.extensions.startBlock.forEach(c=>{a=c.call({lexer:this},h),typeof a=="number"&&a>=0&&(l=Math.min(l,a))}),l<1/0&&l>=0&&(o=e.substring(0,l+1))}if(this.state.top&&(i=this.tokenizer.paragraph(o))){let l=t.at(-1);r&&l?.type==="paragraph"?(l.raw+=(l.raw.endsWith(`
`)?"":`
`)+i.raw,l.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=l.text):t.push(i),r=o.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let l=t.at(-1);l?.type==="text"?(l.raw+=(l.raw.endsWith(`
`)?"":`
`)+i.raw,l.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=l.text):t.push(i);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}linkInText(e){if(!e.includes("["))return!1;let t=this.tokenizer.rules.inline.link;for(let r of e.matchAll(this.tokenizer.rules.inline.blockSkip))if(t.test(r[0])&&e.charAt(r.index-1)!=="!")return!0;for(let r of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)){let n=r[0],i=n.lastIndexOf("[");if(!(n.charAt(0)==="!"||!Object.hasOwn(this.tokens.links,se(n.slice(i+1,-1))))&&!(i>1&&this.linkInText(n.slice(1,i-1))))return!0}return!1}inlineTokens(e,t=[]){this.tokenizer.lexer=this;let r=this.state.linkParenPossible;this.state.linkParenPossible=r&&e.includes(")");try{return this.#e(e,t)}finally{this.state.linkParenPossible=r}}#e(e,t){let r=e.includes("*")||e.includes("_")||e.includes("~")||this.options.hooks?.emStrongMask||this.tokenizer.emStrong!==M.prototype.emStrong||this.tokenizer.del!==M.prototype.del?this.#r(e):e;ur(this.tokenizer,r);try{return this.#t(e,r,t)}finally{dr(this.tokenizer)}}#t(e,t,r){let n=!1,i="",o=1/0;for(;e;){if(e.length<o)o=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}n||(i=""),n=!1;let l;if(this.options.extensions?.inline?.some(a=>(l=a.call({lexer:this},e,r))?(e=e.substring(l.raw.length),r.push(l),!0):!1))continue;if(l=this.tokenizer.escape(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.tag(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.link(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(l.raw.length);let a=r.at(-1);l.type==="text"&&a?.type==="text"?(a.raw+=l.raw,a.text+=l.text):r.push(l);continue}if(l=this.tokenizer.emStrong(e,t,i)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.codespan(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.br(e)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.del(e,t,i)){e=e.substring(l.raw.length),r.push(l);continue}if(l=this.tokenizer.autolink(e)){e=e.substring(l.raw.length),r.push(l);continue}if(!this.state.inLink&&(l=this.tokenizer.url(e))){e=e.substring(l.raw.length),r.push(l);continue}let h=e;if(this.options.extensions?.startInline){let a=1/0,c=e.slice(1),p;this.options.extensions.startInline.forEach(f=>{p=f.call({lexer:this},c),typeof p=="number"&&p>=0&&(a=Math.min(a,p))}),a<1/0&&a>=0&&(h=e.substring(0,a+1))}if(l=this.tokenizer.inlineText(h)){e=e.substring(l.raw.length),l.raw.slice(-1)!=="_"&&(i=l.raw.slice(-1)),n=!0;let a=r.at(-1);a?.type==="text"?(a.raw+=l.raw,a.text+=l.text):r.push(l);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return r}#r(e){let t=e;if(this.tokens.links&&e.includes("[")){let r=this.tokenizer.rules.inline.reflinkSearch,n=i=>{let o=i.lastIndexOf("[");if(!Object.hasOwn(this.tokens.links,se(i.slice(o+1,-1))))return i;if(o>1&&i.charAt(0)!=="!"){let l=i.slice(1,o-1);if(this.linkInText(l))return"["+l.replace(r,n)+"]["+"a".repeat(i.length-o-2)+"]"}return"["+"a".repeat(i.length-2)+"]"};t=t.replace(r,n)}return t=t.replace(this.tokenizer.rules.inline.anyPunctuationOutsideCode,(r,n,i)=>i?"+".repeat(r.length):n?n+r.slice(n.length,-n.length).replace(/`/g,"+")+n:r),t=t.replace(this.tokenizer.rules.inline.blockSkip,(r,n,i)=>{let o=i?i.length:0;return r.slice(0,o)+"["+"a".repeat(r.length-o-2)+"]"}),t=this.options.hooks?.emStrongMask?.call({lexer:this},t)??t,t}infiniteLoopError(e){let t="Infinite loop on byte: "+e;if(this.options.silent)console.error(t);else throw new Error(t)}},ie=class{options;parser;constructor(s){this.options=s||I}space(s){return""}code({text:s,lang:e,escaped:t}){let r=(e||"").match(w.notSpaceStart)?.[0],n=s?s.replace(w.endingNewline,"")+`
`:"";return r?'<pre><code class="language-'+S(r)+'">'+(t?n:S(n,!0))+`</code></pre>
`:"<pre><code>"+(t?n:S(n,!0))+`</code></pre>
`}blockquote({tokens:s}){return`<blockquote>
${this.parser.parse(s)}</blockquote>
`}html({text:s}){return s}def(s){return""}heading({tokens:s,depth:e}){return`<h${e}>${this.parser.parseInline(s)}</h${e}>
`}hr(s){return`<hr>
`}list(s){let e=s.ordered,t=s.start,r="";for(let o=0;o<s.items.length;o++){let l=s.items[o];r+=this.listitem(l)}let n=e?"ol":"ul",i=e&&t!==1?' start="'+t+'"':"";return"<"+n+i+`>
`+r+"</"+n+`>
`}listitem(s){return`<li>${this.parser.parse(s.tokens)}</li>
`}checkbox({checked:s}){return"<input "+(s?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:s}){return`<p>${this.parser.parseInline(s)}</p>
`}table(s){let e="",t="";for(let n=0;n<s.header.length;n++)t+=this.tablecell(s.header[n]);e+=this.tablerow({text:t});let r="";for(let n=0;n<s.rows.length;n++){let i=s.rows[n];t="";for(let o=0;o<i.length;o++)t+=this.tablecell(i[o]);r+=this.tablerow({text:t})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+r+`</table>
`}tablerow({text:s}){return`<tr>
${s}</tr>
`}tablecell(s){let e=this.parser.parseInline(s.tokens),t=s.header?"th":"td";return(s.align?`<${t} align="${s.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:s}){return`<strong>${this.parser.parseInline(s)}</strong>`}em({tokens:s}){return`<em>${this.parser.parseInline(s)}</em>`}codespan({text:s}){return`<code>${S(s,!0)}</code>`}br(s){return"<br>"}del({tokens:s}){return`<del>${this.parser.parseInline(s)}</del>`}link({href:s,title:e,text:t,tokens:r,autolink:n}){let i=n?S(t,!0):this.parser.parseInline(r),o=Xe(s);if(o===null)return i;s=S(o,n);let l='<a href="'+s+'"';return e&&(l+=' title="'+S(e)+'"'),l+=">"+i+"</a>",l}image({href:s,title:e,text:t,tokens:r}){r&&(t=this.parser.parseInline(r,this.parser.textRenderer));let n=Xe(s);if(n===null)return S(t);s=n;let i=`<img src="${S(s)}" alt="${S(t)}"`;return e&&(i+=` title="${S(e)}"`),i+=">",i}text(s){return"tokens"in s&&s.tokens?this.parser.parseInline(s.tokens):"escaped"in s&&s.escaped?s.text:S(s.text)}},ve=class{parser;strong({text:s,tokens:e}){return e?this.parser.parseInline(e,this):s}em({text:s,tokens:e}){return e?this.parser.parseInline(e,this):s}codespan({text:s}){return s}del({text:s,tokens:e}){return e?this.parser.parseInline(e,this):s}html({text:s}){return s}text({text:s}){return s}link({text:s,tokens:e}){return e?this.parser.parseInline(e,this):s}image({text:s,tokens:e}){return e?this.parser.parseInline(e,this):s}br(){return""}checkbox({raw:s}){return s}},$=class de{options;renderer;textRenderer;constructor(e){this.options=e||I,this.options.renderer=this.options.renderer||new ie,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ve,this.textRenderer.parser=this}static parse(e,t){return new de(t).parse(e)}static parseInline(e,t){return new de(t).parseInline(e)}parse(e){this.renderer.parser=this;let t="";for(let r=0;r<e.length;r++){let n=e[r];if(this.options.extensions?.renderers?.[n.type]){let o=n,l=this.options.extensions.renderers[o.type].call({parser:this},o);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","checkbox","html","def","paragraph","text"].includes(o.type)){t+=l||"";continue}}let i=n;switch(i.type){case"space":{t+=this.renderer.space(i);break}case"hr":{t+=this.renderer.hr(i);break}case"heading":{t+=this.renderer.heading(i);break}case"code":{t+=this.renderer.code(i);break}case"table":{t+=this.renderer.table(i);break}case"blockquote":{t+=this.renderer.blockquote(i);break}case"list":{t+=this.renderer.list(i);break}case"checkbox":{t+=this.renderer.checkbox(i);break}case"html":{t+=this.renderer.html(i);break}case"def":{t+=this.renderer.def(i);break}case"paragraph":{t+=this.renderer.paragraph(i);break}case"text":{t+=this.renderer.text(i);break}default:{let o='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return t}parseInline(e,t=this.renderer){this.renderer.parser=this;let r="";for(let n=0;n<e.length;n++){let i=e[n];if(this.options.extensions?.renderers?.[i.type]){let l=this.options.extensions.renderers[i.type].call({parser:this},i);if(l!==!1||!["escape","html","link","image","checkbox","strong","em","codespan","br","del","text"].includes(i.type)){r+=l||"";continue}}let o=i;switch(o.type){case"escape":{r+=t.text(o);break}case"html":{r+=t.html(o);break}case"link":{r+=t.link(o);break}case"image":{r+=t.image(o);break}case"checkbox":{r+=t.checkbox(o);break}case"strong":{r+=t.strong(o);break}case"em":{r+=t.em(o);break}case"codespan":{r+=t.codespan(o);break}case"br":{r+=t.br(o);break}case"del":{r+=t.del(o);break}case"text":{r+=t.text(o);break}default:{let l='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return r}},j=class{options;block;constructor(s){this.options=s||I}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(s){return s}postprocess(s){return s}processAllTokens(s){return s}emStrongMask(s){return s}provideLexer(s=this.block){return s?_.lex:_.lexInline}provideParser(s=this.block){return s?$.parse:$.parseInline}};function z(s,e){if(Array.isArray(e))for(let t=0;t<e.length;t++)s.push(e[t]);else s.push(e)}var le=class{defaults=ge();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=$;Renderer=ie;TextRenderer=ve;Lexer=_;Tokenizer=M;Hooks=j;constructor(...s){this.use(...s)}walkTokens(s,e){let t=[];for(let r of s)switch(z(t,e.call(this,r)),r.type){case"table":{let n=r;for(let i of n.header)z(t,this.walkTokens(i.tokens,e));for(let i of n.rows)for(let o of i)z(t,this.walkTokens(o.tokens,e));break}case"list":{let n=r;z(t,this.walkTokens(n.items,e));break}default:{let n=r;this.defaults.extensions?.childTokens?.[n.type]?this.defaults.extensions.childTokens[n.type].forEach(i=>{let o=n[i].flat(1/0);z(t,this.walkTokens(o,e))}):n.tokens&&z(t,this.walkTokens(n.tokens,e))}}return t}use(...s){let e=this.defaults.extensions||{renderers:Object.create(null),childTokens:Object.create(null)};return s.forEach(t=>{let r={...t};if(r.async=this.defaults.async||r.async||!1,t.extensions&&(t.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let i=e.renderers[n.name];i?e.renderers[n.name]=function(...o){let l=n.renderer.apply(this,o);return l===!1&&(l=i.apply(this,o)),l}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[n.level];i?i.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),r.extensions=e),t.renderer){let n=this.defaults.renderer||new ie(this.defaults);for(let i in t.renderer){if(!(i in n))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let o=i,l=t.renderer[o],h=n[o];n[o]=(...a)=>{let c=l.apply(n,a);return c===!1&&(c=h.apply(n,a)),c===!1?"":c??""}}r.renderer=n}if(t.tokenizer){let n=this.defaults.tokenizer||new M(this.defaults);for(let i in t.tokenizer){if(!(i in n))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let o=i,l=t.tokenizer[o],h=n[o];n[o]=(...a)=>{let c=l.apply(n,a);return c===!1&&(c=h.apply(n,a)),c}}r.tokenizer=n}if(t.hooks){let n=this.defaults.hooks||new j;for(let i in t.hooks){if(!(i in n))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let o=i,l=t.hooks[o],h=n[o];j.passThroughHooks.has(i)?n[o]=a=>{if(n.options.async&&j.passThroughHooksRespectAsync.has(i))return(async()=>{let p=await l.call(n,a);return h.call(n,p)})();let c=l.call(n,a);return h.call(n,c)}:n[o]=(...a)=>{if(n.options.async)return(async()=>{let p=await l.apply(n,a);return p===!1&&(p=await h.apply(n,a)),p})();let c=l.apply(n,a);return c===!1&&(c=h.apply(n,a)),c}}r.hooks=n}if(t.walkTokens){let n=this.defaults.walkTokens,i=t.walkTokens;r.walkTokens=function(o){let l=[];return z(l,i.call(this,o)),n&&z(l,n.call(this,o)),l}}this.defaults={...this.defaults,...r}}),this}setOptions(s){return this.defaults={...this.defaults,...s},this}lexer(s,e){return _.lex(s,e??this.defaults)}parser(s,e){return $.parse(s,e??this.defaults)}parseMarkdown(s){return(e,t)=>{let r={...t},n={...this.defaults,...r},i=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&r.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(n.hooks&&(n.hooks.options=n,n.hooks.block=s),n.async)return(async()=>{let o=n.hooks?await n.hooks.preprocess(e):e,l=await(n.hooks?await n.hooks.provideLexer(s):s?_.lex:_.lexInline)(o,n),h=n.hooks?await n.hooks.processAllTokens(l):l;n.walkTokens&&await Promise.all(this.walkTokens(h,n.walkTokens));let a=await(n.hooks?await n.hooks.provideParser(s):s?$.parse:$.parseInline)(h,n);return n.hooks?await n.hooks.postprocess(a):a})().catch(i);try{n.hooks&&(e=n.hooks.preprocess(e));let o=(n.hooks?n.hooks.provideLexer(s):s?_.lex:_.lexInline)(e,n);n.hooks&&(o=n.hooks.processAllTokens(o)),n.walkTokens&&this.walkTokens(o,n.walkTokens);let l=(n.hooks?n.hooks.provideParser(s):s?$.parse:$.parseInline)(o,n);return n.hooks&&(l=n.hooks.postprocess(l)),l}catch(o){return i(o)}}}onError(s,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,s){let r="<p>An error occurred:</p><pre>"+S(t.message+"",!0)+"</pre>";return e?Promise.resolve(r):r}if(e)return Promise.reject(t);throw t}}},E=new le;function b(s,e){return E.parse(s,e)}b.options=b.setOptions=function(s){return E.setOptions(s),b.defaults=E.defaults,tt(b.defaults),b};b.getDefaults=ge;b.defaults=I;function br(...s){return E.use(...s),b.defaults=E.defaults,tt(b.defaults),b}b.use=br;b.walkTokens=function(s,e){return E.walkTokens(s,e)};b.parseInline=E.parseInline;b.Parser=$;b.parser=$.parse;b.Renderer=ie;b.TextRenderer=ve;b.Lexer=_;b.lexer=_.lex;b.Tokenizer=M;b.Hooks=j;b.parse=b;var Lr=b.options,Er=b.setOptions,Ir=b.walkTokens,Br=b.parseInline;var qr=$.parse,Mr=_.lex;var mr=300;function xr(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var wr=new le({gfm:!0,breaks:!1,async:!1,renderer:{html(s){let e=xr(s.text);return s.block?`<p>${e}</p>`:e}}}),yr=new le({gfm:!0,breaks:!1,async:!1});function pt(s,e){let t=e.allowHtml?yr:wr,r=Sr(),n=vr(t,s,r),i=Be(n,{images:e.images,externalLinks:e.externalLinks,baseUrl:e.baseUrl,lineMarkers:r}),o=_r(i,e),l=Ar(i,e);for(let h of Array.from(i.querySelectorAll('li > input[type="checkbox"]'))){let a=(h.parentElement?.textContent??"").replace(/\s+/g," ").trim().slice(0,200);a&&h.setAttribute("aria-label",a)}for(let h of Array.from(i.querySelectorAll("table"))){let a=h.querySelector("caption")?.textContent?.trim(),c=y("div",{class:"table-wrap",attrs:{tabindex:"0",role:"region","aria-label":a||e.tableLabel}});h.replaceWith(c),c.append(h)}return{fragment:i,headings:o,codeBlocks:l}}function vr(s,e,t){let r=s.lexer(e),n=1,i="";for(let o of r)o.type!=="space"&&o.type!=="def"&&(i+=`<span data-vt-line="${n}:${t}"></span>`),i+=s.parser(Object.assign([o],{links:r.links})),n+=(o.raw.match(/\n/g)??[]).length;return i}function Sr(){let s=new Uint8Array(12);return crypto.getRandomValues(s),Array.from(s,e=>e.toString(16).padStart(2,"0")).join("")}function _r(s,e){let t=[],r=new Map;for(let n of Array.from(s.querySelectorAll("h1, h2, h3, h4, h5, h6"))){let i=(n.textContent??"").trim(),o=$r(i,r);if(n.id=o,n.setAttribute("tabindex","-1"),t.length<mr&&t.push({level:Number(n.localName[1]),text:i.slice(0,200),id:o}),e.anchors){let l=y("a",{class:"anchor",part:"anchor",attrs:{href:`#${o}`,"aria-label":`${e.anchorLabel}: ${i.slice(0,100)}`}});l.append(Pe("link")),n.append(l)}}return t}function $r(s,e){let t=s.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu,"").replace(/ /g,"-").slice(0,100)||"section",r=t;for(let n=e.get(t)??0;e.has(r);n+=1)r=`${t}-${n+1}`,e.set(t,n+1);return e.set(r,e.get(r)??0),r}function Ar(s,e){let t=[];for(let r of Array.from(s.querySelectorAll("pre > code"))){let n=r.parentElement,i=/language-([\w#+.-]+)/.exec(r.className)?.[1]??"",o=qe(i),l=(r.textContent??"").replace(/\n$/,"");o&&o!=="plaintext"&&l.length<=e.highlightLimit&&(Me(o)?r.replaceChildren(De(l,o)):Oe(o).then(a=>a&&e.onLanguageLoaded())),n.setAttribute("tabindex","0");let h=y("div",{class:"code-block",part:"code-block",attrs:{"data-language":o??""}});n.replaceWith(h),h.append(n),t.push(h)}return t}var oe=class{constructor(e,t){this.source=e,this.preview=t,this.anchors=null,this.lockedUntil=new Map,this.onSourceScroll=()=>this.follow(this.source,this.preview),this.onPreviewScroll=()=>this.follow(this.preview,this.source),this.resize=new ResizeObserver(()=>{this.anchors=null})}start(){this.source.addEventListener("scroll",this.onSourceScroll,{passive:!0}),this.preview.addEventListener("scroll",this.onPreviewScroll,{passive:!0});for(let e of[this.source,this.preview])this.resize.observe(e),e.firstElementChild&&this.resize.observe(e.firstElementChild);return this}stop(){this.source.removeEventListener("scroll",this.onSourceScroll),this.preview.removeEventListener("scroll",this.onPreviewScroll),this.resize.disconnect()}follow(e,t){if(performance.now()<(this.lockedUntil.get(e)??0))return;let r=this.anchors??(this.anchors=this.measure());if(r.length<2)return;let n=e===this.source?"source":"preview",i=n==="source"?"preview":"source",o=e.scrollTop,l=0;for(;l<r.length-2&&r[l+1][n]<=o;)l+=1;let h=r[l],a=r[l+1],c=a[n]-h[n],p=c>0?Math.min(1,Math.max(0,(o-h[n])/c)):0,f=Math.round(h[i]+p*(a[i]-h[i]));Math.abs(t.scrollTop-f)<1||(this.lockedUntil.set(t,performance.now()+150),t.scrollTop=f)}measure(){let e=this.source.querySelectorAll(".line"),t=e[0];if(!t)return[];let r=this.source.querySelector(".chunk")!==null,n=Se(this.source,t),i=t.getBoundingClientRect().height||1,o=c=>{if(r)return n+(c-1)*i;let p=e[c-1];return p?Se(this.source,p):n+(c-1)*i},l=Math.max(0,this.source.scrollHeight-this.source.clientHeight),h=Math.max(0,this.preview.scrollHeight-this.preview.clientHeight),a=[{source:0,preview:0}];for(let c of this.preview.querySelectorAll("[data-vt-line]")){let p=Number(c.getAttribute("data-vt-line")),f=c.nextElementSibling??c,u={source:o(p),preview:Se(this.preview,f)},d=a[a.length-1];u.source>d.source&&u.preview>d.preview&&a.push(u)}for(;a.length>1;){let c=a[a.length-1];if(c.source<l&&c.preview<h)break;a.pop()}return a.push({source:l,preview:h}),a}};function Se(s,e){return e.getBoundingClientRect().top-s.getBoundingClientRect().top+s.scrollTop}var ae=["preview","source","split"],Rr={preview:"eye",source:"code",split:"columns"},Tr=["right","left","bottom","top"],zr={right:"left",left:"right",bottom:"top",top:"bottom"},Pr={right:"bottom",bottom:"right",left:"top",top:"left"},ut=class extends Ie{static type="markdown";static fromData=Qe;static dataAttributes=Object.freeze(["label","toc","anchors"]);static componentAttributes=Object.freeze(["tabs","default-tab","toc","anchors","allow-html","external-links","images","line-numbers","split-preview","sync-scroll","split-controls"]);static presets={simple:{"line-numbers":!0,"sync-scroll":!0},full:{header:!0,dot:!0,copy:!0,search:!0,download:!0,toc:!0,anchors:!0,"line-numbers":!0,"sync-scroll":!0,"split-controls":!0,fullscreen:!0}};static styles=[_e,$e,je];constructor(){super(),this.tab=null,this.panelId=Te("panel"),this.cache=null,this.position=null,this.sync=null,this.scrollSync=null,this.editor=null,this.previewTimer=void 0}disconnectedCallback(){clearTimeout(this.previewTimer),this.editor?.destroy(),this.scrollSync?.stop(),this.scrollSync=null,super.disconnectedCallback()}get previewPosition(){return this.position??H(this.getAttribute("split-preview"),Tr,"right")}get syncScroll(){return this.sync??this.feature("sync-scroll")}attributeChangedCallback(e,t,r){(e==="default-tab"||e==="tabs")&&(this.tab=null),e==="split-preview"&&(this.position=null),e==="sync-scroll"&&(this.sync=null),super.attributeChangedCallback(e,t,r)}contentChanged(){this.cache=null}get visibleTabs(){return this.hasAttribute("tabs")?Re(this.getAttribute("tabs"),ae)??[]:this.variant==="full"?[...ae]:[]}get activeTab(){let e=this.visibleTabs,t=e.length?e:[...ae],r=this.editing&&t.includes("split")?"split":"preview",n=t.includes(r)?r:t[0],i=this.tab??H(this.getAttribute("default-tab"),ae,n);return t.includes(i)?i:n}rendered(){let e={allowHtml:Ae(this.getAttribute("allow-html"))===!0,images:H(this.getAttribute("images"),["allow","block","same-origin"],"allow"),externalLinks:H(this.getAttribute("external-links"),["new-tab","same"],"new-tab"),baseUrl:this.baseUrl(),anchors:this.feature("anchors"),anchorLabel:this.t("anchor"),tableLabel:this.t("table"),highlightLimit:K().highlightLimit,onLanguageLoaded:()=>{this.cache=null,this.requestRender()}},t=JSON.stringify({...e,onLanguageLoaded:void 0});if(!this.cache||this.cache.key!==t)try{this.cache={key:t,result:pt(this.text??"",e),error:null}}catch(o){this.cache={key:t,result:null,error:o instanceof RangeError?new ze("tooComplex",{},o):o}}if(this.cache.error||!this.cache.result)throw this.cache.error;let{fragment:r,headings:n}=this.cache.result,i=r.cloneNode(!0);return{fragment:i,headings:n,codeBlocks:Array.from(i.querySelectorAll(".code-block"))}}baseUrl(){let e=this.getAttribute("src");if(!(!e||this._content!==void 0))try{return new URL(e,document.baseURI).href}catch{return}}renderContent(e){let t=this.t,r=this.activeTab;e.classList.add("md"),this.scrollSync?.stop(),this.scrollSync=null;let n=null,i=null,o=[];try{(r==="preview"||r==="split")&&(n=this.previewPane(),o.push(new he(n.querySelector(".markdown"),{skip:".anchor"})))}catch(d){this.setError(d);return}if((r==="source"||r==="split")&&this.editing)i=this.editorPane();else if(r==="source"||r==="split"){let d=Ze(this.text??"",{language:"markdown",lineNumbers:this.feature("line-numbers"),startLine:1,highlightRanges:[],diff:!1,highlightLimit:K().highlightLimit});i=y("div",{class:"body",part:"body source",attrs:{tabindex:"0",role:"region","aria-label":t("source")}},d.element),o.push(new he(d.code))}let l=Ce(o,Ne),h=this.visibleTabs,a=h.length>1?Le({tabs:h.map(d=>({id:d,label:t(d),icon:Rr[d]})),selected:r,label:t("tabs"),panelId:this.panelId,onSelect:d=>this.selectTab(d)}):null,c=[this.searchButton(l),...r==="split"&&this.feature("split-controls")?this.splitButtons():[],...this.editor&&this.editing?this.historyButtons(this.editor):[],this.editToggleButton(),this.fullscreenButton(),this.feature("download")?this.downloadButton(()=>this.text??"",this.downloadName("document.md"),"text/markdown"):null,this.feature("copy")?this.copyButton(()=>this.text??"",t("copySource")):null],p=this.previewPosition,f=y("div",{class:r==="split"?"panel split":"panel",attrs:{id:this.panelId,role:a?"tabpanel":null,"data-preview":r==="split"?p:null}}),u=p==="left"||p==="top";for(let d of u?[n,i]:[i,n])d&&f.append(d);e.append(...this.chrome({tabs:a,actions:c}),f),this.editor?.align(),this.startSync()}startSync(){this.scrollSync?.stop(),this.scrollSync=null;let e=this.root.querySelector('.split > [part~="source"]'),t=this.root.querySelector('.split > [part~="preview"]');e&&t&&this.syncScroll&&(this.scrollSync=new oe(e,t).start())}editorPane(){return this.editor?.destroy(),this.editor=new He({text:this.text??"",language:"markdown",lineNumbers:this.feature("line-numbers"),wrap:!0,highlightLimit:K().highlightLimit,label:this.heading||this.t("editor"),placeholder:this.getAttribute("placeholder")??void 0,onInput:e=>this.edited(e),onChange:e=>J(this,Y.CHANGE,{value:e}),history:this.editHistory??void 0}),y("div",{class:"body editor-body",part:"body source"},this.editor.element)}contentEdited(){this.cache=null,clearTimeout(this.previewTimer),this.previewTimer=setTimeout(()=>this.refreshPreview(),120)}refreshPreview(){let e=this.root.querySelector('[part~="preview"]');if(!e)return;let t;try{t=this.previewPane()}catch(r){let{title:n,detail:i}=this.describeError(r);t=y("div",{class:"body md-body",part:"body preview"},Ee(n,i))}e.replaceWith(t),t.scrollTop=e.scrollTop,this.startSync(),this.scrollSync?.follow(this.scrollSync.source,this.scrollSync.preview),this.searchOpen&&this.searchQuery&&this.searchBar?.run()}splitButtons(){let e=this.t,t=this.previewPosition,r=t==="top"||t==="bottom";return[ee({icon:"swap",label:e("swapPanes"),key:"swap-panes",part:"swap-button",onClick:()=>this.changeLayout(zr[t],this.syncScroll)}),ee({icon:"rows",label:e("stackPanes"),key:"stack-panes",part:"stack-button",pressed:r,onClick:()=>this.changeLayout(Pr[t],this.syncScroll)}),ee({icon:"sync-scroll",label:e("syncScroll"),key:"sync-scroll",part:"sync-button",pressed:this.syncScroll,onClick:()=>this.changeLayout(t,!this.syncScroll)})]}changeLayout(e,t){this.position=e,this.sync=t,this.render(),J(this,Y.LAYOUT_CHANGE,{preview:e,sync:t})}previewPane(){let{fragment:e,headings:t,codeBlocks:r}=this.rendered(),n=y("div",{class:"markdown",part:"markdown"});if(n.append(e),this.feature("copy"))for(let o of r){let l=o.querySelector("pre");o.append(this.copyButton(()=>(l?.textContent??"").replace(/\n$/,""),this.t("copyCode"),`copy-block-${r.indexOf(o)}`))}let i=y("div",{class:"body md-body",part:"body preview",attrs:{tabindex:"0",role:"region","aria-label":this.heading||this.t("preview")}});return this.feature("toc")&&t.length>1&&i.append(this.tableOfContents(t)),i.append(n),i.addEventListener("click",o=>this.onLinkClick(o)),i}tableOfContents(e){let t=Math.min(...e.map(n=>n.level)),r=y("ol",{class:"toc-list"});for(let n of e){let i=y("li",{class:`toc-level-${Math.min(n.level-t,3)}`});i.append(y("a",{attrs:{href:`#${n.id}`},text:n.text||"\u2014"})),r.append(i)}return y("nav",{class:"toc",part:"toc",attrs:{"aria-label":this.t("toc")}},y("details",{attrs:{open:!0}},y("summary",{text:this.t("toc")}),r))}onLinkClick(e){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey)return;let t=e.target.closest?.('a[href^="#"]');if(!t)return;let r=decodeURIComponent((t.getAttribute("href")??"").slice(1)),n=r?this.root.getElementById(r):null;n&&(e.preventDefault(),n.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}),n.focus({preventScroll:!0}))}selectTab(e){e!==this.activeTab&&(this.tab=e,this.render(),this.root.querySelector(`[data-tab="${e}"]`)?.focus(),J(this,Y.TAB_CHANGE,{tab:e}))}};export{ut as a};
//# sourceMappingURL=chunk-CTOLCVES.js.map
