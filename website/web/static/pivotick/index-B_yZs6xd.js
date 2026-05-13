var be = Object.defineProperty;
var xe = (l, t, e) => t in l ? be(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var h = (l, t, e) => xe(l, typeof t != "symbol" ? t + "" : t, e);
import { select as T } from "d3-selection";
import { transition as Wt } from "d3-transition";
import { zoom as we, zoomIdentity as Dt } from "d3-zoom";
import { drag as Ce } from "d3-drag";
import { forceCenter as Me, forceRadial as Pt, forceY as Bt, forceX as Ft, forceCollide as Se, forceManyBody as Ee, forceLink as ke, forceSimulation as Ne } from "d3-force";
import j from "lodash.merge";
import { tree as Yt, hierarchy as Xt } from "d3-hierarchy";
function E(l, ...t) {
  if (typeof l == "string")
    return l;
  if (typeof l == "function") {
    const e = l(...t);
    return typeof e == "string" ? e : void 0;
  }
}
function it(l, ...t) {
  if (typeof l == "boolean")
    return l;
  if (typeof l == "function") {
    const e = l(...t);
    return typeof e == "boolean" ? e : void 0;
  }
}
function H(l, ...t) {
  if (typeof l == "number")
    return l;
  if (typeof l == "function") {
    const e = l(...t);
    return typeof e == "number" ? e : void 0;
  }
}
function Zt(l, ...t) {
  if (Array.isArray(l))
    return l;
  if (typeof l == "function") {
    const e = l(...t);
    return Array.isArray(e) ? e : [];
  }
  return [];
}
function P(l, ...t) {
  if (l instanceof HTMLElement)
    return l;
  if (typeof l == "string") {
    const e = document.createElement("template"), i = l.trim();
    if (e.innerHTML = i, e.content.firstElementChild)
      return e.content.firstElementChild;
    const n = document.createElement("span");
    return n.textContent = i, n;
  } else if (typeof l == "function") {
    const e = l(...t);
    if (typeof e == "string") {
      const i = document.createElement("template");
      if (i.innerHTML = e, i.content.firstElementChild)
        return i.content.firstElementChild;
      const n = document.createElement("span");
      return n.textContent = e, n;
    } else
      return e;
  }
}
function Kt(l) {
  const t = document.createElement("i");
  t.className = l, document.body.appendChild(t);
  let n = getComputedStyle(t).getPropertyValue("--fa").replace(/["']/g, "");
  const r = parseInt(n.slice(1), 16);
  return n = String.fromCharCode(r), document.body.removeChild(t), n;
}
function _(l) {
  l.variant = l.variant ?? "primary";
  const {
    variant: t,
    size: e,
    onClick: i,
    onClickArgs: n,
    iconUnicode: r,
    iconClass: s,
    svgIcon: o,
    imagePath: d,
    text: a,
    ...c
  } = l, u = document.createElement("button");
  u.classList.add("pivotick-button"), u.classList.add(`pivotick-button-${t}`), e && u.classList.add(`pivotick-button-${e}`);
  for (const [f, m] of Object.entries(c))
    f === "class" ? Array.isArray(m) ? u.classList.add(...m) : u.classList.add(String(m)) : f in u ? u[f] = m : u.setAttribute(f, String(m));
  let p;
  r && (p = C({ iconUnicode: r })), s && (p = C({ iconClass: s })), o && (p = C({ svgIcon: o })), d && (p = C({ imagePath: d })), p && u.append(p);
  const g = document.createElement("text");
  if (a && (p && (p.style.marginRight = "0.1em"), g.textContent = a), u.append(g), typeof i == "function") {
    const f = n ?? [];
    u.addEventListener("click", (m) => {
      i(m, ...f);
    });
  }
  return u;
}
const _e = "outline-primary";
function Ie(l, t = {}, e = []) {
  const i = document.createElementNS("http://www.w3.org/2000/svg", l);
  for (const [n, r] of Object.entries(t))
    Array.isArray(r) ? i.setAttribute(n, r.join(" ")) : i.setAttribute(n, r.toString());
  for (const n of e)
    typeof n == "string" ? i.appendChild(document.createTextNode(n)) : i.appendChild(n);
  return i;
}
function b(l, t = {}, e = []) {
  const i = document.createElement(l);
  for (const [n, r] of Object.entries(t))
    Array.isArray(r) ? i.setAttribute(n, r.join(" ")) : i.setAttribute(n, r.toString());
  for (const n of e)
    typeof n == "string" ? i.appendChild(document.createTextNode(n)) : i.appendChild(n);
  return i;
}
function k(l) {
  const t = document.createElement("template");
  return t.innerHTML = l.trim(), t.content.firstElementChild;
}
function nt(l, t) {
  const e = b("dl", { class: "pvt-property-list" });
  for (const i of l) {
    const n = P(i.name, t) || "", r = P(i.value, t) || "", s = b(
      "dl",
      {
        class: "pvt-property-row"
      },
      [
        b("dt", { class: "pvt-property-name" }, [n]),
        b("dd", { class: "pvt-property-value" }, [r])
      ]
    );
    e.append(s);
  }
  return e;
}
function tt(l, t, e) {
  const i = b("div", { class: "pvt-action-list" }), n = Array.isArray(e) ? e[0] : e;
  return t.forEach((r) => {
    if (r.visible = r.visible ?? !0, it(r.visible, n) ?? !0) {
      const o = Ae(l, r, e);
      i.appendChild(o);
    }
  }), i;
}
function et(l, t, e) {
  const i = b("div", { class: "pvt-action-list" }), n = Array.isArray(e) ? e[0] : e;
  return t.forEach((r) => {
    if (r.visible = r.visible ?? !0, it(r.visible, n) ?? !0) {
      const o = Te(l, r, e);
      i.appendChild(o);
    }
  }), i;
}
function Ae(l, t, e) {
  t.variant = t.variant ?? _e;
  const { onclick: i, ...n } = t, r = b(
    "span",
    {
      class: ["pvt-action-item", `pvt-action-item-${t.variant}`],
      style: `${t.flushRight ? "margin-left: auto;" : ""}`
    },
    [
      _({
        size: "sm",
        ...n
      })
    ]
  );
  return typeof i == "function" && r.addEventListener("click", (s) => {
    i.call(l, s, e);
  }), r;
}
function Te(l, t, e) {
  const i = b(
    "div",
    {
      class: ["pvt-action-item", `pvt-action-item-${t.variant}`]
    },
    [
      C({ fixedWidth: !0, ...t }),
      b("span", {
        class: "pvt-action-text",
        title: t.title ?? ""
      }, [t.text ?? ""])
    ]
  );
  return typeof t.onclick == "function" && i.addEventListener("click", (n) => {
    t.onclick.call(l, n, e);
  }), i;
}
function Nt(l = 8, t = "id-") {
  const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", i = e + "0123456789-_";
  let n = e.charAt(Math.floor(Math.random() * e.length));
  for (let r = 1; r < l; r++)
    n += i.charAt(Math.floor(Math.random() * i.length));
  return `${t}${n}`;
}
function C(l) {
  const t = document.createElement("span");
  if (t.classList.add("pvt-icon"), l.fixedWidth && t.classList.add("fixed-width"), l.iconUnicode || l.iconClass) {
    const e = document.createElement("text");
    l.iconUnicode && (e.className = "icon icon-unicode"), l.iconClass && (e.className = `icon ${l.iconClass ?? ""}`), l.iconUnicode && (e.textContent = l.iconUnicode ?? Kt(l.iconClass ?? "") ?? "☐"), t.append(e);
  } else if (l.svgIcon) {
    const e = document.createElement("template");
    e.innerHTML = l.svgIcon.trim();
    const i = e.content.firstElementChild;
    i.setAttribute("width", "100%"), i.setAttribute("height", "100%"), t.style.display = "inline-flex", t.style.alignItems = "center", t.style.justifyContent = "center", t.style.width = "1em", t.append(i);
  } else if (l.imagePath) {
    const e = document.createElement("img");
    e.src = l.imagePath, t.style.display = "inline-flex", t.style.alignItems = "center", t.style.justifyContent = "center", t.style.width = "1em", t.append(e);
  }
  return t;
}
function Le(l, t, e, i = {}) {
  let n = !1, r = 0, s = 0, o = 0, d = 0, a = null, c = null;
  t.classList.add("draggable"), t.addEventListener("mousedown", (g) => {
    var v;
    const f = new AbortController(), { signal: m } = f;
    n = !0, t.style.transition = "none", r = g.clientX, s = g.clientY, o = l.offsetLeft, d = l.offsetTop, a = l.getBoundingClientRect(), c = e.getBoundingClientRect(), (v = i.onDragStart) == null || v.call(i, g, l), document.addEventListener("mousemove", u, { signal: m }), document.addEventListener("mouseup", (y) => {
      f.abort(), p(y);
    }, { signal: m });
  });
  function u(g) {
    var M;
    if (!n || !c || !a) return;
    const f = g.clientX - r, m = g.clientY - s;
    let v = o + f, y = d + m;
    const x = a.width, w = a.height;
    v = Math.max(c.left, Math.min(v, c.right - x)), y = Math.max(c.top, Math.min(y, c.bottom - w)), l.style.left = v + "px", l.style.top = y + "px", (M = i.onDrag) == null || M.call(i, g, l);
  }
  function p(g) {
    var f;
    n = !1, l.style.transition = "", (f = i.onDragStop) == null || f.call(i, g, l);
  }
}
class A {
  /**
   * Create a new Node instance.
   * @param id - Unique identifier for the node
   * @param data - Optional data payload associated with the node
   */
  constructor(t, e, i, n = Nt(), r = []) {
    h(this, "id");
    h(this, "data");
    h(this, "children");
    h(this, "style");
    h(this, "edgesOut");
    h(this, "edgesIn");
    h(this, "defaultCircleRadius", 10);
    // Layout/physics properties
    h(this, "x");
    h(this, "y");
    h(this, "vx");
    h(this, "vy");
    h(this, "fx");
    h(this, "fy");
    h(this, "weight");
    h(this, "frozen");
    h(this, "visible");
    h(this, "expanded");
    /** True if this node is a child within a collapsed cluster */
    h(this, "isChild");
    h(this, "childrenDepth");
    /** True if this node has child nodes */
    h(this, "isParent");
    /** Reference to the parent cluster node (if this node is a child) */
    h(this, "parentNode");
    /**
     * Reference to the main graph node when this node is a clone in a subgraph.
     * Used for syncing position updates from subgraph back to main graph.
     */
    h(this, "_original_object");
    /**
     * Reference to the deepest sub graph node.
     * Used for checking state of this node in its subgraph
     */
    h(this, "_deepest_node_clone");
    /** The subgraph graph instance created when expanding this node */
    h(this, "_subgraph");
    h(this, "_circleRadius", this.defaultCircleRadius);
    h(this, "_circleRadiusCollapsed", this.defaultCircleRadius);
    h(this, "_dirty");
    h(this, "domID");
    this.id = t, this.domID = n, this.data = e ?? {}, this.style = i ?? {}, this.children = [], this.isParent = !1, this.setChildren(r), this._dirty = !0, this.frozen = !1, this.visible = !0, this.expanded = !1, this.isChild = !1, this.childrenDepth = 0, this.edgesOut = /* @__PURE__ */ new Set(), this.edgesIn = /* @__PURE__ */ new Set();
  }
  /**
   * Get the node's data.
   */
  getData() {
    return this.data;
  }
  /**
   * Update the node's data.
   * @param newData - New data to set
   */
  setData(t) {
    this.data = t, this.markDirty();
  }
  /**
   * Merge partial data into the current node data.
   * Useful for updating only parts of the data.
   * @param partialData - Partial data object to merge
   */
  updateData(t) {
    this.data = { ...this.data, ...t }, this.markDirty();
  }
  /**
   * @private
   */
  registerEdgeOut(t) {
    this.edgesOut.add(t);
  }
  /**
   * @private
   */
  registerEdgeIn(t) {
    this.edgesIn.add(t);
  }
  /**
   * @private
   */
  emptyEdges() {
    this.edgesOut.clear(), this.edgesIn.clear();
  }
  getConnectedNodes() {
    return [...this.edgesOut].map((t) => t.to);
  }
  getConnectingNodes() {
    return [...this.edgesIn].map((t) => t.from);
  }
  getEdgesOut() {
    return [...this.edgesOut];
  }
  getEdgesIn() {
    return [...this.edgesIn];
  }
  /**
   * Get the node's data.
   */
  getStyle() {
    return this.style;
  }
  /**
   * Update the node's data.
   * @param newStyle - New data to set
   */
  setStyle(t) {
    this.style = t, this.markDirty();
  }
  /**
   * Merge partial data into the current node data.
   * Useful for updating only parts of the data.
   * @param partialStyle - Partial data object to merge
   */
  updateStyle(t) {
    this.style = { ...this.style, ...t }, this.markDirty();
  }
  getGraphElement() {
    return document ? document.getElementById(`node-${this.domID}`) : null;
  }
  /**
   * Convert node to a simple JSON object representation.
   * @param dataOnly - default: false
   */
  toDict(t = !1) {
    const e = {
      id: this.id,
      data: this.data,
      style: this.style,
      weight: this.weight
      // expanded: this.expanded,
    };
    return t || (e.x = this.x, e.y = this.y, e.vx = this.vx, e.vy = this.vy, e.fx = this.fx, e.fy = this.fy), this.hasChildren() && (e.children = this.children.map((i) => i.toDict(t))), e;
  }
  clone() {
    const t = { ...this.data }, e = { ...this.style }, i = new A(this.id, t, e);
    return i.x = this.x, i.y = this.y, i.vx = this.vx, i.vy = this.vy, i.fx = this.fx, i.fy = this.fy, i.weight = this.weight, i.frozen = this.frozen, i.visible = this.visible, i.expanded = this.expanded, i.isChild = this.isChild, i.childrenDepth = this.childrenDepth, i.isParent = this.isParent, i.parentNode = this.parentNode, i._circleRadius = this._circleRadius, i.children = this.children.map((n) => n.clone()), i;
  }
  /**
   * @private
   */
  markDirty() {
    this._dirty = !0;
  }
  /**
   * @private
   */
  clearDirty() {
    this._dirty = !1;
  }
  /**
   * @private
   */
  isDirty() {
    return this._dirty;
  }
  freeze() {
    this.frozen = !0, this.fx = this.x, this.fy = this.y;
  }
  unfreeze() {
    this.frozen = !1, this.fx = void 0, this.fy = void 0;
  }
  toggleVisibility(t) {
    t ? this.show() : this.hide(), this.markDirty();
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
  toggleExpand(t) {
    t === void 0 ? this.expanded ? this.collapse() : this.expand() : t ? this.expand() : this.collapse(), this.markDirty();
  }
  expand() {
    this.expanded = !0, this._original_object && (this._original_object.expanded = !0);
  }
  collapse() {
    this.expanded = !1, this._original_object && (this._original_object.expanded = !1);
  }
  degree() {
    return this.edgesOut.size + this.edgesIn.size;
  }
  setCircleRadius(t) {
    this._circleRadius = t;
  }
  getCircleRadius() {
    return this._circleRadius;
  }
  setCircleRadiusCollapsed(t) {
    this._circleRadiusCollapsed = t;
  }
  getCircleRadiusCollapsed() {
    return this._circleRadiusCollapsed;
  }
  setChildren(t) {
    this.children = t, this.hasChildren() ? this.isParent = !0 : this.isParent = !1;
  }
  hasChildren() {
    return this.children.length > 0;
  }
  markAsChild(t, e) {
    this.isChild = !0, this.childrenDepth = e, this.parentNode = t;
  }
  markAsParent() {
    this.isParent = !0;
  }
  /**
   * Sets the subgraph instance (when opening a cluster).
   * @private
   */
  setSubgraph(t) {
    this._subgraph = t;
  }
  /**
   * Gets the subgraph instance created from this node.
   * Returns undefined if this node didn't created a subgraph.
   * @private
   */
  getSubgraph() {
    return this._subgraph;
  }
  /**
   * Sets a reference to the original node from the main graph.
   * Used when this node is a clone in a subgraph to enable position syncing.
   * @private
   */
  setOriginalObject(t) {
    this._original_object = t;
  }
  /**
   * Gets the reference to the original node from the main graph.
   * Returns undefined if this is not a subgraph clone.
   * @private
   */
  getOriginalObject() {
    return this._original_object;
  }
  /**
   * Sets a reference to the original node from the main graph.
   * Used when this node is a clone in a subgraph to enable position syncing.
   * @private
   */
  setDeepestNodeClone(t) {
    this._deepest_node_clone = t;
  }
  /**
   * Gets the reference to the original node from the main graph.
   * Returns undefined if this is not a subgraph clone.
   * @private
   */
  getDeepestNodeClone() {
    return this._deepest_node_clone;
  }
}
class B {
  /**
   * Create a new Edge instance.
   * @param id - Unique identifier for the edge
   * @param from - Source node
   * @param to - Target node
   * @param data - Optional data payload for the edge
   * @param style - Optional style for the edge
   */
  constructor(t, e, i, n, r, s = null, o) {
    h(this, "id");
    h(this, "from");
    h(this, "to");
    h(this, "directed");
    h(this, "data");
    h(this, "style");
    h(this, "visible");
    /** True if this is a synthetic edge (placeholder for collapsed cluster child) */
    h(this, "isSynthetic");
    /** The actual child node this synthetic edge points to (for expansion logic) */
    h(this, "syntheticTerminalNode");
    h(this, "_original_object");
    h(this, "_subgraphFromNode");
    h(this, "_subgraphToNode");
    h(this, "_dirty");
    h(this, "domID");
    this.id = t, this.domID = Nt(), this.from = e, this.to = i, this.directed = s, this.data = n ?? {}, this.style = r ?? {}, this.visible = !0, this._dirty = !0, this.isSynthetic = o !== void 0, this.syntheticTerminalNode = o, this.from.registerEdgeOut(this), this.to.registerEdgeIn(this);
  }
  /** Required by d3-force */
  get source() {
    return this.from;
  }
  get target() {
    return this.to;
  }
  /**
   * Get the edge's data.
   */
  getData() {
    return this.data;
  }
  /**
   * Update the edge's data.
   * @param newData - New data to set
   */
  setData(t) {
    this.data = t, this.markDirty();
  }
  /**
   * Merge partial data into the current edge data.
   * @param partialData - Partial data object to merge
   */
  updateData(t) {
    this.data = { ...this.data, ...t }, this.markDirty();
  }
  /**
   * Get the edge's style.
   */
  getStyle() {
    return this.style;
  }
  /**
   * Get the edge's style.
   */
  getEdgeStyle() {
    var t;
    return ((t = this.style) == null ? void 0 : t.edge) ?? {};
  }
  /**
   * Get the edge's label style if available.
   */
  getLabelStyle() {
    var t;
    return ((t = this.style) == null ? void 0 : t.label) ?? {};
  }
  /**
   * Update the edge's style.
   * @param newStyle - New style to set
   */
  setStyle(t) {
    this.style = t, this.markDirty();
  }
  /**
   * Merge partial style into the current edge style.
   * Useful for updating only parts of the style.
   * @param partialStyle - Partial style object to merge
   */
  updateStyle(t) {
    this.style = {
      ...this.style,
      ...t
    }, this.markDirty();
  }
  getGraphElement() {
    return document ? document.getElementById(`edge-${this.domID}`) : null;
  }
  setFrom(t) {
    this.from = t;
  }
  setTo(t) {
    this.to = t;
  }
  /**
   * Convert edge to a simple JSON object representation.
   */
  toDict() {
    return {
      id: this.id,
      from: this.from.id,
      to: this.to.id,
      data: this.data,
      style: this.style
    };
  }
  clone() {
    const t = { ...this.data }, e = { ...this.style }, i = new B(
      this.id,
      this.from.clone(),
      this.to.clone(),
      t,
      e,
      this.directed
    );
    return i.visible = this.visible, i;
  }
  markDirty() {
    this._dirty = !0;
  }
  clearDirty() {
    this._dirty = !1;
  }
  isDirty() {
    return this._dirty;
  }
  toggleVisibility(t) {
    t ? this.show() : this.hide(), this.markDirty();
  }
  show() {
    this.visible = !0;
  }
  hide() {
    this.visible = !1;
  }
  /**
   * Sets a reference to the original node from the main graph.
   * Used when this node is a clone in a subgraph to enable position syncing.
   * @private
   */
  setOriginalObject(t) {
    this._original_object = t;
  }
  /**
   * Gets the reference to the original node from the main graph.
   * Returns undefined if this is not a subgraph clone.
   * @private
   */
  getOriginalObject() {
    return this._original_object;
  }
  /**
   * Sets a reference to the subgraph node from the main graph.
   * Used when the FROM node has a clone in a subgraph
   * @private
   */
  setSubgraphFromNode(t) {
    this._subgraphFromNode = t;
  }
  /**
   * Sets a reference to the subgraph node from the main graph.
   * Used when the TO node has a clone in a subgraph
   * @private
   */
  setSubgraphToNode(t) {
    this._subgraphToNode = t;
  }
  /**
   * Gets the reference to the subgraph node from the main graph.
   * @private
   */
  getSubgraphFromNode() {
    return this._subgraphFromNode;
  }
  /**
   * Gets the reference to the subgraph node from the main graph.
   * @private
   */
  getSubgraphToNode() {
    return this._subgraphToNode;
  }
}
function xt(l, t) {
  let e = [];
  function i() {
    if (!e) return;
    const n = (l - t) * 0.9;
    for (const r of e) {
      if (r.x == null || r.y == null) continue;
      const s = r.x, o = r.y, d = r.getCircleRadius() ?? 10, a = Math.sqrt(s * s + o * o) + d;
      if (a > n) {
        const c = n / a, u = s * c, p = o * c;
        r.x = u, r.y = p;
      }
    }
  }
  return i.initialize = (n) => {
    e = n;
  }, i;
}
class De {
  /**
   * Convert global coordinates to local coordinates relative to a parent cluster.
   *
   * Used when reading positions from the main graph and applying them to subgraph nodes.
   *
   * @param globalX Global X coordinate
   * @param globalY Global Y coordinate  * @param parentNode The parent cluster node (whose position defines the local origin)
   * @returns Local coordinates relative to parent center
   */
  static globalToLocal(t, e, i) {
    const n = i.x ?? 0, r = i.y ?? 0;
    return {
      x: t - n,
      y: e - r
    };
  }
  /**
   * Convert local coordinates (relative to parent cluster center) to global coordinates.
   *
   * Used when reading positions from subgraph nodes and updating the main graph.
   *
   * @param localX Local X coordinate (relative to parent)
   * @param localY Local Y coordinate (relative to parent)
   * @param parentNode The parent cluster node (whose position defines the local origin)
   * @returns Global coordinates
   */
  static localToGlobal(t, e, i) {
    const n = i.x ?? 0, r = i.y ?? 0;
    return {
      x: t + n,
      y: e + r
    };
  }
}
class S {
  constructor(t) {
    h(this, "nodeDrawer");
    h(this, "edgeDrawer");
    this.nodeDrawer = t;
  }
  /**
   * Renders an expanded cluster with its nested subgraph.
   *
   * This is called when a node with children is expanded. It creates:
   * - A cluster area circle around the parent node
   * - A nested subgraph containing the children nodes
   * - Appropriate edge visibility (hide synthetic, show actual)
   *
   * @param theClusterSelection - D3 selection of the cluster's SVG group element
   * @param node - The node being expanded
   * @param cb - Callback invoked after cluster expansion completes, receives final radius
   * @returns The cluster circle selection
   */
  render(t, e, i) {
    this.edgeDrawer || (this.edgeDrawer = this.nodeDrawer.graphSvgRenderer.edgeDrawer);
    let n = t.select(".pvt-cluster-area");
    if (n.empty()) {
      n = t.append("circle").classed("pvt-cluster-area", !0).lower();
      const u = S.buildGradientForNode(
        t.node().querySelector(".node"),
        n,
        e
      );
      u && n.style("stroke", `color-mix(in srgb, ${u} 70%, transparent)`);
    }
    const r = S.updateToNewRadiusExpanded(this.nodeDrawer.graph, e);
    n.attr("r", 0).attr("_final_r", r).attr("cx", 0).attr("cy", 0), n.transition().duration(250).attr("r", r);
    const s = /* @__PURE__ */ new Set(), o = e.children.flatMap((u) => [
      ...u.getEdgesOut() ?? [],
      ...u.getEdgesIn() ?? []
    ]).filter((u) => s.has(u.id) ? !1 : (s.add(u.id), !0)), d = t.node(), a = this.createSubgraph(
      e.children,
      o,
      d,
      e,
      this.nodeDrawer.graph
    );
    e.setSubgraph(a), t.select(":scope > .zoom-layer").attr("opacity", 0).transition().duration(250).attr("opacity", 1), S.toggleSyntheticEdges(e);
    let c = this.nodeDrawer.graph.getParentGraph();
    for (; c; )
      c.renderer.update(!1), c = c.getParentGraph();
    return i && requestAnimationFrame(() => {
      i(r);
    }), n;
  }
  /**
   * Creates a nested subgraph for rendering children inside a cluster.
   *
   * The subgraph is a separate Graph instance that:
   * - Uses local coordinates (relative to parent cluster center at 0,0)
   * - Contains clones of the child nodes
   * - Shares the same Node object references for proper position syncing
   * - Has its own simulation constrained within the parent radius
   *
   * @param nodes - Child nodes to include in the subgraph
   * @param edges - Edges connecting the child nodes
   * @param container - SVG group element to contain the subgraph
   * @param parentNode - The parent cluster node (defines the local coordinate origin)
   * @param parentGraph - Reference to the parent graph for coordinate conversion
   * @returns The created subgraph instance
   */
  createSubgraph(t, e, i, n, r) {
    const s = (p) => {
      p.getMutableNodes().forEach((g) => {
        let f = r.getMutableNode(g.id);
        f = f.getOriginalObject() ?? f, g.setOriginalObject(f), f.setDeepestNodeClone(g), g.isChild = !0;
      }), p.getMutableEdges().forEach((g) => {
        let f = r.getMutableEdge(g.id);
        f && (f = f.getOriginalObject() ?? f, g.setOriginalObject(f));
      }), t.forEach((g) => {
        var f;
        if (((f = g.parentNode) == null ? void 0 : f.id) === n.id) {
          const m = p.getMutableNode(g.id);
          m && (m.parentNode = n);
        }
      }), r.getMutableEdges().forEach((g) => {
        const f = g.getOriginalObject() ?? g, m = p.getMutableNode(g.from.id), v = p.getMutableNode(g.to.id);
        m && f.setSubgraphFromNode(m), v && f.setSubgraphToNode(v);
      });
    }, o = {
      UI: {
        mode: "viewer",
        tooltip: {
          enabled: !1
        },
        contextMenu: {
          enabled: !1
        },
        navigation: {
          enabled: !1
        }
      },
      render: {
        ...this.nodeDrawer.graph.getOptions().render,
        zoomEnabled: !1,
        zoomAnimationDuration: 100,
        beforeRender: s
      },
      simulation: {
        useWorker: !1,
        warmupTicks: 10,
        cooldownTime: 50,
        freezeNodesOnDrag: !1
      },
      callbacks: {
        onNodeSelect: (p) => {
          const g = r.getMutableNode(p.id);
          g && r.selectElement(g);
        },
        onNodesSelect: (p) => {
          const g = c.renderer.getGraphInteraction().getSelectedNodeIDs();
          if (g === null) return;
          const f = g.map((m) => {
            const v = r.getMutableNode(m);
            return {
              node: v,
              element: v == null ? void 0 : v.getGraphElement()
            };
          });
          r.renderer.getGraphInteraction().addNodesToSelection(f);
        },
        onEdgeSelect: (p) => {
          const g = r.getMutableEdge(p.id);
          g && r.selectElement(g);
        },
        onNodeHoverIn: (p, g) => {
          var f;
          (f = r.UIManager.tooltip) == null || f.openForNodeOnElement(p, g);
        }
      },
      parentGraph: this.nodeDrawer.graph
    }, d = {
      nodes: [...t].map((p) => p.toDict(!0)),
      edges: [...e].map((p) => p.toDict())
    }, a = document.createElement("div"), c = new I(a, d, o), u = a.querySelector(".zoom-layer");
    return i.appendChild(u), c.getMutableNodes().forEach((p) => {
      S.toggleSyntheticEdges(p);
    }), c.on("ready", () => {
      c.simulation.getSimulation().force("center", Me(0, 0)).force("constrainParent", xt(n.getCircleRadius(), 10)), c.simulation.restart();
    }), c.renderer.getGraphInteraction().on("dragended", () => {
    }), c.renderer.getGraphInteraction().on("simulationTick", () => {
      c.getMutableNodes().filter((g) => g.visible).forEach((g) => {
        const f = g.x ?? 0, m = g.y ?? 0;
        this.updatePositionOnRealChild(f, m, g.id);
      });
    }), r.renderer.getGraphInteraction().on("dragging", () => {
      this.updatePositionOnAllRealChildren(r);
    }), r.renderer.getGraphInteraction().on("simulationTick", () => {
      this.updatePositionOnAllRealChildren(r);
    }), r.renderer.getGraphInteraction().on("canvasClick", () => {
      c.deselectAll();
    }), c;
  }
  /**
   * Recursively updates positions of all real child nodes across nested subgraphs.
   *
   * This is called during simulation tick and drag events to propagate position changes
   * from subgraphs up to the main graph. It handles nested clusters by recursing through
   * parent graphs.
   *
   * @param graph - The graph to process (can be main graph or subgraph)
   */
  updatePositionOnAllRealChildren(t) {
    t.getMutableNodes().filter((e) => e.isParent && e.expanded).forEach((e) => {
      const i = e.children, n = e.getSubgraph(), r = /* @__PURE__ */ new Map();
      n && (n.getMutableNodes().forEach((s) => {
        r.set(s.id, s);
      }), this.updatePositionOnAllRealChildren(n)), i.forEach((s) => {
        const o = r.get(s.id);
        !o || !o.x || !o.y || this.updatePositionOnRealChild(o.x, o.y, s.id);
      });
    });
  }
  /**
   * Updates the position of a real child node in the main graph based on its subgraph position.
   * Then recursively bubbles the update up to parent graphs.
   *
   * This is the core method for syncing subgraph positions (local coordinates) to the main
   * graph (global coordinates). It:
   * 1. Converts local subgraph position to global position
   * 2. Updates the real node's position in the parent graph
   * 3. Triggers a render tick for the updated node
   * 4. Recursively updates parent graphs if this is a nested subgraph
   *
   * @param x - Local X position of the child in the subgraph
   * @param y - Local Y position of the child in the subgraph
   * @param id - ID of the child node (same in both subgraph and main graph)
   */
  updatePositionOnRealChild(t, e, i) {
    const n = this.nodeDrawer.graph.getMutableNode(i), r = n == null ? void 0 : n.parentNode;
    if (n && r) {
      const s = De.localToGlobal(t, e, r);
      n.x = s.x, n.y = s.y, this.nodeDrawer.graph.renderer.nextTickFor([n]);
      const o = this.nodeDrawer.graph.getParentGraph();
      o && o.renderer.nodeDrawer.clusterDrawer.updatePositionOnRealChild(t, e, i);
    }
  }
  /**
   * Toggles visibility of synthetic edges based on cluster expansion state.
   *
   * Synthetic edges are placeholder edges created during graph normalization that point
   * from external nodes to collapsed cluster children. When a cluster is expanded:
   * - Synthetic edges pointing to children are hidden
   * - Actual edges within the subgraph are shown
   * When collapsed:
   * - Synthetic edges are shown again
   * - Actual nested edges are hidden
   *
   * @param node - The cluster node being expanded/collapsed
   */
  static toggleSyntheticEdges(t) {
    if (t.expanded) {
      t.getEdgesIn().filter((i) => i.isSynthetic === !0).forEach((i) => {
        i.hide();
      });
      const e = t.getOriginalObject() ?? t;
      e.getEdgesIn().filter((i) => i.isSynthetic === !0).forEach((i) => {
        i.hide();
      }), e.children.forEach((i) => {
        i.getEdgesIn().filter((n) => !e.children.includes(n.from)).forEach((n) => {
          n.show();
        });
      });
    } else {
      t.getEdgesIn().filter((i) => i.isSynthetic === !0).forEach((i) => {
        i.show();
      });
      const e = t.getOriginalObject() ?? t;
      e.getEdgesIn().filter((i) => i.isSynthetic === !0).forEach((i) => {
        t.visible && i.show();
      }), S.hideNestedEdges(e);
    }
  }
  /**
   * Recursively hides edges that point to nested children of a collapsed cluster.
   *
   * When a cluster is collapsed, edges that would point to its nested children
   * need to be hidden since those children are not visible. This method traverses
   * the entire child hierarchy.
   *
   * @param node - The cluster node whose nested edges should be hidden
   */
  static hideNestedEdges(t) {
    t.children.forEach((e) => {
      S.hideNestedEdges(e), e.getEdgesIn().filter((i) => !t.children.includes(i.from)).forEach((i) => {
        i.hide();
      });
    });
  }
  /**
   * Recursively collapses all expanded clusters starting from the given node.
   *
   * Used when collapsing a parent cluster - all nested expanded clusters
   * must also be collapsed first.
   *
   * @param node - The node whose subtree should be collapsed
   */
  static collapseAllOpenedClusters(t) {
    t.children.forEach((e) => {
      S.collapseAllOpenedClusters(e), e.collapse(), e.setCircleRadius(e.getCircleRadiusCollapsed());
    });
  }
  /**
   * Updates the radius of a node when it is expanded, propagating changes up the parent hierarchy.
   *
   * When a cluster node expands:
   * 1. Save current radius as collapsed radius
   * 2. Calculate new expanded radius based on children
   * 3. Update the node in its parent graph
   * 4. Recursively update parent clusters
   *
   * @param graph - The graph containing the node
   * @param node - The node being expanded
   * @returns The calculated expanded radius
   */
  static updateToNewRadiusExpanded(t, e) {
    const i = S.getRadiusForClusterNode(e);
    e.expanded || e.setCircleRadiusCollapsed(e.getCircleRadius()), e.setCircleRadius(i);
    const n = t.getParentGraph();
    if (n) {
      const r = S.updateParentGraph(n, e, i);
      r && t.simulation.getSimulation().force("link", null).force("constrainParent", xt(r, 10)), n.getParentGraph() && e.parentNode && S.updateToNewRadiusExpanded(n, e.parentNode);
    }
    return i;
  }
  /**
   * Updates the radius of a node when it is collapsed, propagating changes up the parent hierarchy.
   *
   * @param node - The node being collapsed
   * @param restoreR - Whether to restore the original collapsed radius
   * @param graph - The graph containing the node (optional, used for propagation)
   */
  static updateToNewRadiusCollapsed(t, e, i) {
    const n = e ? t.getCircleRadiusCollapsed() : S.getRadiusForClusterNode(t);
    if (t.setCircleRadius(n), i) {
      S.updateParentGraph(i, t, n);
      const r = i.getParentGraph();
      t.parentNode && S.updateToNewRadiusCollapsed(t.parentNode, !1, r);
    }
  }
  /**
   * Calculates the appropriate radius for a cluster node based on its expansion state.
   *
   * For collapsed nodes: returns current radius + 4px padding
   * For expanded nodes: calculates radius based on children count and sizes using
   * a formula that approximates the area needed to contain all children.
   *
   * @param node - The cluster node to calculate radius for
   * @returns The calculated radius
   */
  static getRadiusForClusterNode(t) {
    if (!t.expanded)
      return t.getCircleRadius() + 4;
    const e = 50, i = 16, r = t.children.reduce((o, d) => {
      const a = d.getCircleRadius();
      return o + a + i;
    }, 0) / t.children.length, s = Math.sqrt(t.children.length) * (2 * r) + e;
    return Math.max(50, s);
  }
  /**
   * Updates the parent graph when a child cluster's radius changes.
   *
   * This method:
   * 1. Updates the radius of the node in the parent graph
   * 2. Triggers a re-layout of the parent graph
   * 3. Updates the parent cluster's visual radius if it exists
   *
   * @param parentGraph - The parent graph to update
   * @param node - The node whose radius changed
   * @param r - The new radius
   * @returns The parent's new radius if updated, undefined otherwise
   */
  static updateParentGraph(t, e, i) {
    var o;
    const n = t.getMutableNode(e.id);
    n == null || n.setCircleRadius(i);
    const r = e.getOriginalObject();
    r && r.setCircleRadius(i);
    const s = e.parentNode;
    if (s) {
      const d = S.getRadiusForClusterNode(s);
      s.setCircleRadius(d), t.onChange(), t.simulation.reheat(0.1);
      const a = (o = s.getGraphElement()) == null ? void 0 : o.querySelector("& > .pvt-cluster-area");
      if (a) {
        const c = T(a);
        c.attr("_final_r", d).transition().duration(250).attr("r", d), ot.handleChildrenExpanded(t, s, c);
      }
      return d;
    }
  }
  /**
   * Creates a radial gradient fill for the cluster area circle.
   *
   * The gradient fades from transparent at 90% to a color-mixed version of the
   * parent node's fill color at 100%, creating a subtle visual boundary.
   *
   * @param parentCircleElement - The parent node's circle element
   * @param clusterSelection - The cluster area circle selection
   * @param node - The cluster node
   * @returns The parent node's fill color, or undefined if not found
   */
  static buildGradientForNode(t, e, i) {
    if (t) {
      const n = getComputedStyle(t).fill, r = `color-mix(in srgb, ${n} 40%, transparent)`, s = `pvt-cluster-area-${i.id}`, o = t.closest(".pvt-canvas-element"), d = o == null ? void 0 : o.querySelector("defs");
      if (!d) return;
      const a = d.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "radialGradient"));
      a.setAttribute("id", s);
      const c = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      c.setAttribute("offset", "90%"), c.setAttribute("stop-color", "#ffffff00"), a.appendChild(c);
      const u = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      return u.setAttribute("offset", "100%"), u.setAttribute("stop-color", r), a.appendChild(u), e.style("fill", `url(#${s})`), n;
    }
  }
}
T.prototype.transition = Wt;
class ot {
  constructor(t, e, i) {
    h(this, "graph");
    h(this, "rendererOptions");
    h(this, "graphSvgRenderer");
    h(this, "clusterDrawer");
    h(this, "renderCB");
    var n;
    this.graphSvgRenderer = i, this.graph = e, this.rendererOptions = t, this.renderCB = (n = this.rendererOptions) == null ? void 0 : n.renderNode, this.clusterDrawer = new S(this);
  }
  render(t, e) {
    var i, n;
    if (this.renderCB) {
      const r = t.append("foreignObject"), s = (i = this == null ? void 0 : this.renderCB) == null ? void 0 : i.call(this, e);
      r.attr("width", 20).attr("height", 20), typeof s == "string" ? r.text(s) : s instanceof HTMLElement && ((n = r.node()) == null || n.append(s)), requestAnimationFrame(() => {
        const o = r.node();
        if (!o) return;
        const d = o.firstElementChild;
        if (!d) return;
        const a = d.getBoundingClientRect(), c = Math.ceil(a.width), u = Math.ceil(a.height);
        r.attr("width", c).attr("height", u), r.attr("x", -c / 2).attr("y", -u / 2), this.rendererOptions.enableNodeExpansion && (!e.hasChildren() || !e.expanded) && e.setCircleRadius(0.5 * Math.max(c, u));
      });
    } else
      this.defaultNodeRender(t, e), requestAnimationFrame(() => {
        const r = t.node();
        if (!r) return;
        let s = 50, o = 50;
        const d = r.querySelector(".node").getBBox();
        d.width > 0 && d.height > 0 && (s = Math.ceil(d.width), o = Math.ceil(d.height)), this.rendererOptions.enableNodeExpansion && (!e.hasChildren() || !e.expanded) && (this.getNodeStyle(e).shape == "square" ? e.setCircleRadius(Math.SQRT1_2 * Math.max(s, o)) : e.setCircleRadius(0.5 * Math.max(s, o)));
      });
    if (this.rendererOptions.enableNodeExpansion && e.hasChildren()) {
      if (e.expanded) {
        const r = this.clusterDrawer.render(t, e, () => {
          ot.handleChildrenExpanded(this.graph, e, r);
        });
        requestAnimationFrame(() => {
          S.updateToNewRadiusExpanded(this.graph, e);
        });
      }
      requestAnimationFrame(() => {
        this.addExpandCollapseIcons(t, e);
      });
    }
  }
  updatePositions(t) {
    t.attr("transform", (e) => {
      const i = e.x && isFinite(e.x) ? e.x : 0, n = e.y && isFinite(e.y) ? e.y : 0;
      return `translate(${i},${n})`;
    });
  }
  defaultNodeRender(t, e) {
    const i = this.getNodeStyle(e);
    this.genericNodeRender(t, i, e);
  }
  mergeNodeStylingOptions(t) {
    return {
      shape: (t == null ? void 0 : t.shape) ?? this.rendererOptions.defaultNodeStyle.shape,
      strokeColor: (t == null ? void 0 : t.strokeColor) ?? this.rendererOptions.defaultNodeStyle.strokeColor,
      strokeWidth: (t == null ? void 0 : t.strokeWidth) ?? this.rendererOptions.defaultNodeStyle.strokeWidth,
      fontFamily: (t == null ? void 0 : t.fontFamily) ?? this.rendererOptions.defaultNodeStyle.fontFamily,
      size: (t == null ? void 0 : t.size) ?? this.rendererOptions.defaultNodeStyle.size,
      color: (t == null ? void 0 : t.color) ?? this.rendererOptions.defaultNodeStyle.color,
      textColor: (t == null ? void 0 : t.textColor) ?? this.rendererOptions.defaultNodeStyle.textColor,
      textAnchorPosition: (t == null ? void 0 : t.textAnchorPosition) ?? this.rendererOptions.defaultNodeStyle.textAnchorPosition,
      textHorizontalShift: (t == null ? void 0 : t.textHorizontalShift) ?? this.rendererOptions.defaultNodeStyle.textHorizontalShift,
      textVerticalShift: (t == null ? void 0 : t.textVerticalShift) ?? this.rendererOptions.defaultNodeStyle.textVerticalShift,
      textRotateDegree: (t == null ? void 0 : t.textRotateDegree) ?? this.rendererOptions.defaultNodeStyle.textRotateDegree,
      iconUnicode: (t == null ? void 0 : t.iconUnicode) ?? this.rendererOptions.defaultNodeStyle.iconUnicode,
      iconClass: (t == null ? void 0 : t.iconClass) ?? this.rendererOptions.defaultNodeStyle.iconClass,
      svgIcon: (t == null ? void 0 : t.svgIcon) ?? this.rendererOptions.defaultNodeStyle.svgIcon,
      imagePath: (t == null ? void 0 : t.imagePath) ?? this.rendererOptions.defaultNodeStyle.imagePath,
      text: (t == null ? void 0 : t.text) ?? this.rendererOptions.defaultNodeStyle.text,
      html: (t == null ? void 0 : t.html) ?? this.rendererOptions.defaultNodeStyle.html
    };
  }
  computeNodeStyle(t) {
    let e = {};
    if (this.rendererOptions.nodeStyleMap && typeof this.rendererOptions.nodeTypeAccessor == "function") {
      const r = this.rendererOptions.nodeTypeAccessor(t);
      r && (e = this.rendererOptions.nodeStyleMap[r] ?? {});
    }
    const i = t.getStyle();
    let n = {};
    return i.styleCb ? n = i.styleCb(t) : n = {
      shape: (i == null ? void 0 : i.shape) ?? (e == null ? void 0 : e.shape),
      strokeColor: (i == null ? void 0 : i.strokeColor) ?? (e == null ? void 0 : e.strokeColor),
      strokeWidth: (i == null ? void 0 : i.strokeWidth) ?? (e == null ? void 0 : e.strokeWidth),
      fontFamily: (i == null ? void 0 : i.fontFamily) ?? (e == null ? void 0 : e.fontFamily),
      size: (i == null ? void 0 : i.size) ?? (e == null ? void 0 : e.size),
      color: (i == null ? void 0 : i.color) ?? (e == null ? void 0 : e.color),
      textColor: (i == null ? void 0 : i.textColor) ?? (e == null ? void 0 : e.textColor),
      textAnchorPosition: (i == null ? void 0 : i.textAnchorPosition) ?? (e == null ? void 0 : e.textAnchorPosition),
      textHorizontalShift: (i == null ? void 0 : i.textHorizontalShift) ?? (e == null ? void 0 : e.textHorizontalShift),
      textVerticalShift: (i == null ? void 0 : i.textVerticalShift) ?? (e == null ? void 0 : e.textVerticalShift),
      textRotateDegree: (i == null ? void 0 : i.textRotateDegree) ?? (e == null ? void 0 : e.textRotateDegree),
      iconUnicode: (i == null ? void 0 : i.iconUnicode) ?? (e == null ? void 0 : e.iconUnicode),
      iconClass: (i == null ? void 0 : i.iconClass) ?? (e == null ? void 0 : e.iconClass),
      svgIcon: (i == null ? void 0 : i.svgIcon) ?? (e == null ? void 0 : e.svgIcon),
      imagePath: (i == null ? void 0 : i.imagePath) ?? (e == null ? void 0 : e.imagePath),
      text: (i == null ? void 0 : i.text) ?? (e == null ? void 0 : e.text),
      html: (i == null ? void 0 : i.html) ?? (e == null ? void 0 : e.html)
    }, this.mergeNodeStylingOptions(n);
  }
  getNodeStyle(t) {
    const e = this.computeNodeStyle(t);
    return typeof e.shape == "function" && (e.shape = e.shape(t)), e.strokeWidth = e.strokeWidth !== void 0 ? E(e.strokeWidth.toString(), t) ?? "var(--pvt-node-stroke-width, 2)" : "var(--pvt-node-stroke-width, 2)", e.strokeColor = e.strokeColor !== void 0 ? E(e.strokeColor, t) ?? "var(--pvt-node-stroke, #fff)" : "var(--pvt-node-stroke, #fff)", e.size = e.size !== void 0 ? H(e.size, t) ?? 10 : 10, e.color = e.color !== void 0 ? E(e.color, t) ?? "var(--pvt-node-color, #007acc)" : "var(--pvt-node-color, #007acc)", e.textColor = e.textColor !== void 0 ? E(e.textColor, t) ?? "var(--pvt-node-text-color, #fff)" : "var(--pvt-node-text-color, #fff)", e.textAnchorPosition = e.textAnchorPosition !== void 0 ? E(e.textAnchorPosition, t) : "middle", e.textHorizontalShift = e.textHorizontalShift !== void 0 ? H(e.textHorizontalShift, t) ?? 0 : 0, e.textVerticalShift = e.textVerticalShift !== void 0 ? H(e.textVerticalShift, t) ?? 0 : 0, e.textRotateDegree = e.textRotateDegree !== void 0 ? H(e.textRotateDegree, t) ?? 0 : 0, e.text = e.text !== void 0 ? E(e.text, t) : void 0, e.iconUnicode = e.iconUnicode !== void 0 ? E(e.iconUnicode, t) : void 0, e.iconClass = e.iconClass !== void 0 ? E(e.iconClass, t) : void 0, e.svgIcon = e.svgIcon !== void 0 ? E(e.svgIcon, t) : void 0, e.imagePath = e.imagePath !== void 0 ? E(e.imagePath, t) : void 0, e;
  }
  isCustomShape(t) {
    return typeof t == "object" && t !== null && "d" in t;
  }
  genericNodeRender(t, e, i) {
    var s, o, d;
    e.size = e.size, e.shape = e.shape, e.text = e.text, e.textAnchorPosition = e.textAnchorPosition, e.textHorizontalShift = e.textHorizontalShift, e.textVerticalShift = e.textVerticalShift, e.textRotateDegree = e.textRotateDegree;
    let n = e.shape;
    e.shape == "square" ? n = "rect" : (this.isCustomShape(e.shape) || ["triangle", "hexagon"].includes(e.shape)) && (n = "path");
    const r = t.append(n).attr("stroke", e.strokeColor).attr("stroke-width", e.strokeWidth).attr("fill", e.color).classed("node", !0);
    switch (e.shape) {
      case "circle":
        r.attr("r", e.size), i.setCircleRadius(e.size);
        break;
      case "square":
        r.attr("width", e.size * 2).attr("height", e.size * 2).attr("x", -e.size).attr("y", -e.size), i.setCircleRadius(Math.SQRT1_2 * e.size);
        break;
      case "triangle": {
        const a = [
          [0, -e.size],
          [e.size, e.size],
          [-e.size, e.size]
        ].map((c) => c.join(",")).join(" ");
        r.attr("d", `M${a}Z`), i.setCircleRadius(e.size);
        break;
      }
      case "hexagon": {
        const a = Math.PI / 3, c = Array.from({ length: 6 }, (u, p) => {
          const g = a * p;
          return [Math.cos(g) * e.size, Math.sin(g) * e.size];
        }).map((u) => u.join(",")).join(" ");
        r.attr("d", `M${c}Z`), i.setCircleRadius(e.size);
        break;
      }
      default:
        this.isCustomShape(e.shape) ? (r.attr("d", e.shape.d), i.setCircleRadius(15)) : (r.attr("r", e.size), i.setCircleRadius(e.size));
        break;
    }
    if (e.iconUnicode || e.iconClass)
      t.append("text").attr("fill", e.textColor).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("font-size", e.size * 1.2).attr("class", "node-content icon " + (e.iconUnicode ? "icon-unicode" : e.iconClass ?? "")).text(e.iconUnicode ?? Kt(e.iconClass ?? "") ?? "☐");
    else if (e.svgIcon) {
      const a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      a.innerHTML = e.svgIcon, ((s = a.children[0]) == null ? void 0 : s.nodeName) === "svg" && (a.children[0].removeAttribute("width"), a.children[0].removeAttribute("height")), t.append(() => a).attr("class", "node-content").attr("x", -e.size * 0.7).attr("y", -e.size * 0.7).attr("width", e.size * 1.4).attr("height", e.size * 1.4).attr("color", e.strokeColor);
    } else if (e.imagePath)
      t.append("image").attr("class", "node-content").attr("xlink:href", e.imagePath).attr("x", -e.size * (1.2 / 2)).attr("y", -e.size * (1.2 / 2)).attr("width", e.size * 1.2).attr("height", e.size * 1.2);
    else if (e.html) {
      const a = t.append("foreignObject"), c = e.html(i);
      a.attr("width", e.size * 2).attr("height", e.size * 2).attr("x", -e.size).attr("y", -e.size), typeof c == "string" ? a.text(c) : c instanceof HTMLElement && ((o = a.node()) == null || o.append(c));
    }
    if (e.text) {
      const a = t.append("g"), c = Math.abs(e.textVerticalShift) >= 1 || Math.abs(e.textHorizontalShift) >= 1, [u, p] = this.computeTextLayout(e.text, e.size, c), g = e.textHorizontalShift * (e.size + u / 2 * 1.2), f = -e.textVerticalShift * (e.size + u / 2 * 1.2), v = (d = a.append("text").attr("text-anchor", e.textAnchorPosition).attr("x", g).attr("y", f).attr("dominant-baseline", "central").attr("font-size", u).attr("font-family", e.fontFamily).attr("fill", e.textColor).text(p).node()) == null ? void 0 : d.getBBox();
      c && v && a.insert("rect", "text").attr("x", v.x - 4).attr("y", v.y - 2).attr("width", v.width + 8).attr("height", v.height + 4).attr("fill", ee.backgroundColor).attr("rx", 2).attr("ry", 2), a.attr("transform", `rotate(${e.textRotateDegree}, ${g}, ${f})`);
    }
  }
  /**
   * This method is called on every node
   * Each node takes care of its own state, otherwise each node gets set multiple times
   * Each node takes care only of edges out, to avoid setting twice the same edge (for from and to nodes)
   */
  checkForHighlight(t, e) {
    var s, o, d;
    const i = this.isNodeSelected(e), n = this.isNodeAdjacentToSelection(e), r = this.getSelectedNodeIDs().length !== 0;
    (s = e.getGraphElement()) == null || s.classList.toggle("pvt-node-selected-highlight", i), this.rendererOptions.enableFocusMode && r ? (o = e.getGraphElement()) == null || o.classList.toggle("pvt-node-selected-highlight-shadow", !i && !n) : (d = e.getGraphElement()) == null || d.classList.toggle("pvt-node-selected-highlight-shadow", !1), e.getEdgesOut().forEach((a) => {
      var u, p;
      const c = this.isEdgeAdjacentToSelection(a);
      this.rendererOptions.enableFocusMode && r ? (u = a.getGraphElement()) == null || u.classList.toggle("pvt-edge-selected-highlight-shadow", !c) : (p = a.getGraphElement()) == null || p.classList.toggle("pvt-edge-selected-highlight-shadow", !1);
    });
  }
  getSelectedNodeIDs() {
    const e = this.graphSvgRenderer.getGraphInteraction().getSelectedNodeIDs();
    return Array.isArray(e) ? e : [];
  }
  isNodeSelected(t) {
    return this.getSelectedNodeIDs().includes(t.id);
  }
  isNodeAdjacentToSelection(t) {
    return t.getEdgesOut().some((e) => this.isNodeSelected(e.to)) || t.getEdgesIn().some((e) => this.isNodeSelected(e.from));
  }
  isEdgeAdjacentToSelection(t) {
    return this.isNodeSelected(t.from) || this.isNodeSelected(t.to);
  }
  computeTextLayout(t, e, i = !1) {
    const n = e * 0.9, r = i ? n * 5 : n * 2, s = Math.max(12, n * 0.5), o = s * 0.55, d = Math.floor(r / o) - 1;
    if (t.length > d && t.length > 7) {
      const a = Math.max(6, r / o) - 1, c = 3, u = a - c;
      t = t.slice(0, u) + "…" + t.slice(t.length - c);
    }
    return [s, t];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addExpandCollapseIcons(t, e) {
    const r = (s, o) => {
      this.graph.UIManager.tooltip && this.graph.UIManager.tooltip.hide(s), this.graph.toggleExpandNode(s), o || (this.graph.simulation.reheat(0.05), this.graph.renderer.fitAndCenter());
    };
    t.each((s, o, d) => {
      const a = T(d[o]);
      a.selectAll(":scope > .node-icon").remove();
      const c = (s.getCircleRadius() + 2) / Math.sqrt(2), u = a.append("g").classed("node-icon", !0).classed(s.expanded ? "collapse-icon" : "expand-icon", !0).attr("transform", s.expanded ? `translate(${c}, ${c})` : `translate(${c}, ${-c})`);
      u.append("title").text(s.expanded ? "Collapse nodes" : "Expand node"), u.append("circle").attr("r", 8).style("cursor", "pointer").on("click", (p) => {
        p.stopPropagation(), r(s, !s.expanded);
      }), a.select(s.expanded ? ":scope > .collapse-icon" : ":scope > .expand-icon").append("text").text(s.expanded ? "-" : "+");
    });
  }
  static handleChildrenExpanded(t, e, i) {
    var c, u;
    t.simulation.reheat(0.1);
    const n = Number(i.attr("_final_r")), s = (n + 2) / Math.sqrt(2), o = (c = e.getGraphElement()) == null ? void 0 : c.querySelector("& > .node");
    o && T(o).transition().duration(250).on("end", () => {
      t.renderer.fitAndCenter();
    }).attr("transform", `translate(${-s}, ${-s})`);
    const d = (u = e.getGraphElement()) == null ? void 0 : u.querySelector("& > .node-icon");
    d && T(d).transition().duration(250).attr("transform", e.expanded ? `translate(${s}, ${s})` : `translate(${s}, ${-s})`);
    const a = e.getSubgraph();
    a && a.simulation.getSimulation().force("constrainParent", xt(Number(n), 10));
  }
}
function Pe(l) {
  return l * Math.PI / 180;
}
function V(l) {
  for (; l < 0; ) l += 2 * Math.PI;
  for (; l >= 2 * Math.PI; ) l -= 2 * Math.PI;
  return l;
}
function Be(l) {
  let { rx: t, ry: e } = l;
  const { xAxisRotation: i, from: n, to: r } = l, s = Pe(i), o = Math.cos(s), d = Math.sin(s), a = (n.x - r.x) / 2, c = (n.y - r.y) / 2, u = o * a + d * c, p = -d * a + o * c;
  let g = t * t, f = e * e;
  const m = u * u, v = p * p, y = m / g + v / f;
  if (y > 1) {
    const O = Math.sqrt(y);
    t *= O, e *= O, g = t * t, f = e * e;
  }
  const x = 1, w = g * f - g * v - f * m, M = g * v + f * m, N = x * Math.sqrt(Math.max(0, w / M)), F = N * (t * p / e), L = N * (-(e * u) / t), X = o * F - d * L + (n.x + r.x) / 2, ge = d * F + o * L + (n.y + r.y) / 2;
  function At(O, Z, K, Q) {
    const ve = O * K + Z * Q, ye = Math.sqrt(O * O + Z * Z) * Math.sqrt(K * K + Q * Q);
    let ht = Math.acos(Math.min(Math.max(ve / ye, -1), 1));
    return O * Q - Z * K < 0 && (ht = -ht), ht;
  }
  const Tt = (u - F) / t, Lt = (p - L) / e, fe = (-u - F) / t, me = (-p - L) / e;
  let lt = At(1, 0, Tt, Lt), U = At(Tt, Lt, fe, me);
  return U < 0 && (U += 2 * Math.PI), lt = V(lt), U = V(U), {
    cx: X,
    cy: ge,
    startAngle: lt,
    deltaAngle: U,
    rx: t,
    ry: e,
    xAxisRotation: i
  };
}
function Fe(l, t, e, i, n, r) {
  const s = i - l, o = n - t, d = Math.sqrt(s * s + o * o);
  if (d > e + r) return [];
  if (d < Math.abs(e - r)) return [];
  if (d === 0 && e === r) return [];
  const a = (e * e - r * r + d * d) / (2 * d), c = Math.sqrt(e * e - a * a), u = l + a * s / d, p = t + a * o / d, g = u + c * o / d, f = p - c * s / d, m = u - c * o / d, v = p + c * s / d;
  return c === 0 ? [{ x: g, y: f }] : [
    { x: g, y: f },
    { x: m, y: v }
  ];
}
function Oe(l, t, e) {
  l = V(l), t = V(t);
  const i = V(t + e);
  return e >= 0 ? t <= i ? l >= t && l <= i : l >= t || l <= i : i <= t ? l <= t && l >= i : l <= t || l >= i;
}
function Re(l, t) {
  const { cx: e, cy: i, startAngle: n, deltaAngle: r } = t;
  for (const s of l) {
    const o = Math.atan2(s.y - i, s.x - e);
    if (Oe(o, n, r))
      return s;
  }
  return null;
}
function Ot(l, t) {
  const e = Be(l);
  if (e.rx === e.ry && e.xAxisRotation === 0) {
    const i = Fe(
      e.cx,
      e.cy,
      e.rx,
      t.cx,
      t.cy,
      t.r
    ), n = Re(i, e);
    return n || null;
  } else
    return console.log("Arc is elliptical or rotated, numerical methods needed for intersection."), null;
}
function ze(l) {
  if (!l) return null;
  const t = l.getAttribute("d");
  if (!t) return null;
  const e = $e(t);
  if (!e) return null;
  const { x0: i, y0: n, x1: r, y1: s } = e, o = r - i, d = s - n, a = {
    x: i + o / 2,
    y: n + d / 2
  };
  return {
    length: Math.sqrt(o * o + d * d),
    midpoint: a
  };
}
function He(l) {
  if (!l) return null;
  const t = l.getAttribute("d");
  if (!t) return null;
  const e = je(t);
  if (!e) return null;
  const i = e.to.x - e.from.x, n = e.to.y - e.from.y, r = Math.hypot(i, n), s = e.rx, o = 2 * Math.asin(Math.min(r / (2 * s), 1)), d = s * o, a = (e.from.x + e.to.x) / 2, c = (e.from.y + e.to.y) / 2, u = Math.sqrt(Math.max(0, s * s - (r / 2) ** 2)), p = -n / r, g = i / r, f = e.sweepFlag !== e.largeArcFlag ? 1 : -1, m = a + f * u * p, v = c + f * u * g, y = Math.atan2(e.from.y - v, e.from.x - m);
  let w = Math.atan2(e.to.y - v, e.to.x - m) - y;
  for (; w > Math.PI; ) w -= 2 * Math.PI;
  for (; w < -Math.PI; ) w += 2 * Math.PI;
  e.sweepFlag && w < 0 && (w += 2 * Math.PI), !e.sweepFlag && w > 0 && (w -= 2 * Math.PI);
  const M = y + w / 2, N = {
    x: m + s * Math.cos(M),
    y: v + s * Math.sin(M)
  };
  return {
    length: d,
    midpoint: N
  };
}
function Ge(l) {
  if (!l) return null;
  const t = l.getAttribute("d");
  if (!t) return null;
  const e = qe(t);
  if (!e) return null;
  const i = 0.5, n = Math.pow(1 - i, 3) * e.x0 + 3 * Math.pow(1 - i, 2) * i * e.px0 + 3 * (1 - i) * i * i * e.px1 + i * i * i * e.x1, r = Math.pow(1 - i, 3) * e.y0 + 3 * Math.pow(1 - i, 2) * i * e.py0 + 3 * (1 - i) * i * i * e.py1 + i * i * i * e.y1;
  return { length: Math.hypot(n, r), midpoint: { x: n, y: r } };
}
function je(l) {
  if (!l) return null;
  const t = _t(l);
  return t.length !== 9 || t[0][0] !== "M" || t[2][0] !== "A" ? null : {
    from: { x: parseFloat(t[0].slice(1)), y: parseFloat(t[1]) },
    to: { x: parseFloat(t[7]), y: parseFloat(t[8]) },
    rx: parseFloat(t[2].slice(1)),
    ry: parseFloat(t[3]),
    xAxisRotation: 0,
    largeArcFlag: !1,
    sweepFlag: !0
  };
}
function qe(l) {
  if (!l) return null;
  const t = _t(l);
  return t.length !== 10 || t[0][0] !== "M" || t[3][0] !== "C" ? null : {
    x0: parseFloat(t[1]),
    y0: parseFloat(t[2]),
    x1: parseFloat(t[8]),
    y1: parseFloat(t[9]),
    px0: parseFloat(t[4]),
    py0: parseFloat(t[5]),
    px1: parseFloat(t[6]),
    py1: parseFloat(t[7])
  };
}
function $e(l) {
  if (!l) return null;
  const t = _t(l);
  return t.length !== 6 || t[0] !== "M" || t[3] !== "L" ? null : {
    x0: parseFloat(t[1]),
    y0: parseFloat(t[2]),
    x1: parseFloat(t[4]),
    y1: parseFloat(t[5])
  };
}
function _t(l) {
  const t = [];
  let e = "", i = 0, n = l.length - 1;
  for (; i <= n && (l[i] === " " || l[i] === `
` || l[i] === "	" || l[i] === ","); ) i++;
  for (; n >= i && (l[n] === " " || l[n] === `
` || l[n] === "	" || l[n] === ","); ) n--;
  for (let r = i; r <= n; r++) {
    const s = l[r];
    s === " " || s === "," || s === `
` || s === "	" ? e && (t.push(e), e = "") : e += s;
  }
  return e && t.push(e), t;
}
function z(l, t) {
  var i;
  if (t.nodeHeaderMap.title)
    return E(t.nodeHeaderMap.title, l) || "Could not resolve title";
  const e = (i = l.getData()) == null ? void 0 : i.label;
  return typeof e == "string" ? e : "Optional name or label";
}
function Qt(l, t) {
  var i;
  if (t.nodeHeaderMap.subtitle)
    return E(t.nodeHeaderMap.subtitle, l) || null;
  const e = (i = l.getData()) == null ? void 0 : i.description;
  return typeof e == "string" ? e : "Optional subtitle or description";
}
function W(l, t) {
  var i;
  if (t.edgeHeaderMap.title)
    return E(t.edgeHeaderMap.title, l) || "";
  const e = (i = l.getData()) == null ? void 0 : i.label;
  return typeof e == "string" ? e : "Optional name or label";
}
function Jt(l, t) {
  var i;
  if (t.edgeHeaderMap.subtitle)
    return E(t.edgeHeaderMap.subtitle, l) || null;
  const e = (i = l.getData()) == null ? void 0 : i.label;
  return typeof e == "string" ? e : "Optional subtitle or description";
}
function te(l) {
  var e;
  const t = (e = l.getData()) == null ? void 0 : e.label;
  return typeof t == "string" ? t : "";
}
function wt(l, t) {
  const e = l.getData(), i = [];
  if (t.nodePropertiesMap)
    return Zt(t.nodePropertiesMap, l);
  for (const [n, r] of Object.entries(e))
    n && r && i.push({
      name: n,
      value: r
    });
  return i;
}
function Ct(l, t) {
  const e = l.getData(), i = [];
  if (t.edgePropertiesMap)
    return Zt(t.edgePropertiesMap, l);
  for (const [n, r] of Object.entries(e))
    n && r && i.push({
      name: n,
      value: r
    });
  return i;
}
class Ue {
  constructor(t, e, i) {
    h(this, "graph");
    h(this, "rendererOptions");
    h(this, "graphSvgRenderer");
    h(this, "renderLabelCB");
    var n;
    this.graphSvgRenderer = i, this.graph = e, this.rendererOptions = t, this.renderLabelCB = (n = this.rendererOptions) == null ? void 0 : n.renderLabel;
  }
  render(t, e) {
    this.defaultEdgeRender(t, e);
  }
  defaultEdgeRender(t, e) {
    var s, o;
    const i = this.getEdgeStyle(e), n = this.getLabelStyle(e), r = this.genericEdgeRender(t, i);
    if ((this.graph.getOptions().isDirected || e.directed) && this.drawEdgeMarker(r, i, e), this.renderLabelCB) {
      const d = t.append("g").classed("label-container", !0).append("foreignObject"), a = (s = this == null ? void 0 : this.renderLabelCB) == null ? void 0 : s.call(this, e);
      d.attr("width", 200).attr("height", 100), typeof a == "string" ? d.text(a) : a instanceof HTMLElement && ((o = d.node()) == null || o.append(a)), requestAnimationFrame(() => {
        const c = d.node();
        if (!c) return;
        const u = c.firstElementChild;
        if (!u) return;
        const p = u.getBoundingClientRect(), g = Math.ceil(p.width), f = Math.ceil(p.height);
        d.attr("width", g).attr("height", f), d.attr("x", -g / 2).attr("y", -f / 2), this.highlightSelection(t, e);
      });
    } else
      this.defaultLabelRender(t, e, n), this.highlightSelection(t, e);
  }
  getLabelStyle(t) {
    var n, r, s, o;
    let e;
    const i = t.getLabelStyle();
    return i && i.styleCb ? e = i.styleCb(t) : e = {
      backgroundColor: (n = t.getLabelStyle()) == null ? void 0 : n.backgroundColor,
      fontSize: (r = t.getLabelStyle()) == null ? void 0 : r.fontSize,
      fontFamily: (s = t.getLabelStyle()) == null ? void 0 : s.fontFamily,
      color: (o = t.getLabelStyle()) == null ? void 0 : o.color
    }, this.mergeLabelStylingOptions(e);
  }
  mergeLabelStylingOptions(t) {
    return {
      backgroundColor: (t == null ? void 0 : t.backgroundColor) ?? this.rendererOptions.defaultLabelStyle.backgroundColor,
      fontSize: (t == null ? void 0 : t.fontSize) ?? this.rendererOptions.defaultLabelStyle.fontSize,
      fontFamily: (t == null ? void 0 : t.fontFamily) ?? this.rendererOptions.defaultLabelStyle.fontFamily,
      color: (t == null ? void 0 : t.color) ?? this.rendererOptions.defaultLabelStyle.color
    };
  }
  getEdgeStyle(t) {
    var r;
    let e;
    const i = t.getEdgeStyle();
    i && i.styleCb ? e = i.styleCb(t) : e = {
      strokeColor: i == null ? void 0 : i.strokeColor,
      strokeWidth: i == null ? void 0 : i.strokeWidth,
      opacity: i == null ? void 0 : i.opacity,
      curveStyle: i == null ? void 0 : i.curveStyle,
      dashed: i == null ? void 0 : i.dashed,
      animateDash: i == null ? void 0 : i.animateDash,
      rotateLabel: i == null ? void 0 : i.rotateLabel,
      markerEnd: i == null ? void 0 : i.markerEnd,
      markerStart: i == null ? void 0 : i.markerStart
    };
    const n = this.mergeEdgeStylingOptions(e);
    if (n.strokeColor = n.strokeColor !== void 0 ? E(n.strokeColor, t) ?? "var(--pvt-edge-stroke, #999)" : "var(--pvt-edge-stroke, #999)", n.strokeWidth = n.strokeWidth !== void 0 ? H(n.strokeWidth, t) ?? 2 : 2, n.opacity = n.opacity !== void 0 ? H(n.opacity, t) ?? 1 : 1, n.curveStyle = n.curveStyle !== void 0 ? E(n.curveStyle, t) : "bidirectional", n.markerEnd = n.markerEnd !== void 0 ? E(n.markerEnd, t) : void 0, n.markerStart = n.markerStart !== void 0 ? E(n.markerStart, t) : void 0, n.dashed = n.dashed !== void 0 ? it(n.dashed, t) : void 0, n.animateDash = n.animateDash !== void 0 ? it(n.animateDash, t) : void 0, t.to.parentNode && t.to.parentNode === t.from) {
      n.curveStyle = "straight";
      const o = (r = (t.getSubgraphFromNode() ?? t.from).getGraphElement()) == null ? void 0 : r.querySelector(".node");
      o && (n.strokeColor = getComputedStyle(o).fill, n.markerStart = "bigcircle", n.markerEnd = "arrow");
    }
    return n;
  }
  mergeEdgeStylingOptions(t) {
    return {
      strokeColor: (t == null ? void 0 : t.strokeColor) ?? this.rendererOptions.defaultEdgeStyle.strokeColor,
      strokeWidth: (t == null ? void 0 : t.strokeWidth) ?? this.rendererOptions.defaultEdgeStyle.strokeWidth,
      opacity: (t == null ? void 0 : t.opacity) ?? this.rendererOptions.defaultEdgeStyle.opacity,
      curveStyle: (t == null ? void 0 : t.curveStyle) ?? this.rendererOptions.defaultEdgeStyle.curveStyle,
      dashed: (t == null ? void 0 : t.dashed) ?? this.rendererOptions.defaultEdgeStyle.dashed,
      animateDash: (t == null ? void 0 : t.animateDash) ?? this.rendererOptions.defaultEdgeStyle.animateDash,
      rotateLabel: (t == null ? void 0 : t.rotateLabel) ?? this.rendererOptions.defaultEdgeStyle.rotateLabel,
      markerEnd: (t == null ? void 0 : t.markerEnd) ?? this.rendererOptions.defaultEdgeStyle.markerEnd,
      markerStart: (t == null ? void 0 : t.markerStart) ?? this.rendererOptions.defaultEdgeStyle.markerStart
    };
  }
  genericEdgeRender(t, e) {
    const i = t.append("path").attr("stroke", e.strokeColor ?? "var(--pvt-edge-stroke)").attr("stroke-width", e.strokeWidth ?? "var(--pvt-edge-stroke-width)").attr("stroke-opacity", e.opacity);
    return e.dashed && (i.classed("dashed", !0), e.animateDash && i.classed("animated", !0)), i;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  drawEdgeMarker(t, e, i) {
    if (!this.rendererOptions.markerStyleMap)
      return;
    const n = e.markerEnd, r = e.markerStart;
    n && this.rendererOptions.markerStyleMap[n] && t.attr("marker-end", `url(#${n})`), r && this.rendererOptions.markerStyleMap[r] && t.attr("marker-start", `url(#${r})`);
  }
  updatePositions(t) {
    const e = t.selectAll("path"), i = t.selectAll("g.label-container");
    e.attr("d", (n) => this.linkPathRouter(n)), i.attr("transform", (n, r, s) => {
      const { from: o, to: d } = n, a = this.getEdgeStyle(n), c = s[r].parentNode;
      let u = null;
      c && c instanceof Element && (u = T(c).select("path").node());
      let p, g, f = { x: 0, y: 0 }, m = 0;
      if (o === d) {
        const v = u ? Ge(u) : void 0, { length: y = 0, midpoint: x = { x: 0, y: 0 } } = v ?? {};
        m = y, f = x;
      } else if (a.curveStyle === "straight") {
        const v = u ? ze(u) : void 0, { length: y = 0, midpoint: x = { x: 0, y: 0 } } = v ?? {};
        m = y, f = x;
      } else {
        const v = u ? He(u) : void 0, { length: y = 0, midpoint: x = { x: 0, y: 0 } } = v ?? {};
        m = y, f = x;
      }
      if (u && m > 0)
        p = f.x, g = f.y, o === d && (p += 12, g -= 4);
      else {
        const v = n.source.x ?? 0, y = n.source.y ?? 0, x = n.target.x ?? 0, w = n.target.y ?? 0;
        p = (v + x) / 2, g = (y + w) / 2;
      }
      if (p = isFinite(p) ? p : 0, g = isFinite(g) ? g : 0, a.rotateLabel) {
        const v = (n.target.x ?? 0) - (n.source.x ?? 0), y = (n.target.y ?? 0) - (n.source.y ?? 0), x = Math.atan2(y, v) * 180 / Math.PI, w = x > 90 || x < -90 ? x + 180 : x;
        return `translate(${p}, ${g}) rotate(${w})`;
      } else
        return `translate(${p}, ${g})`;
    });
  }
  linkPathRouter(t) {
    const { from: e, to: i } = t;
    if (e.x === void 0 || e.y === void 0 || i.x === void 0 || i.y === void 0)
      return null;
    if (e === i)
      return this.linkSelfLoop(t);
    const n = i.getConnectedNodes(), r = this.getEdgeStyle(t);
    return r.curveStyle === "straight" ? this.linkStraight(t) : r.curveStyle === "curved" ? this.linkArc(t) : n.filter((s) => s.id === e.id).length > 0 ? (t.updateStyle({ edge: { curveStyle: "curved" } }), this.linkArc(t)) : (t.updateStyle({ edge: { curveStyle: "straight" } }), this.linkStraight(t));
  }
  linkSelfLoop(t) {
    var L;
    const { from: e, to: i } = t, n = ((L = this.graphSvgRenderer.getGraphInteraction().getSelectedEdge()) == null ? void 0 : L.edge.id) === t.id;
    if (e.x === void 0 || e.y === void 0 || i.x === void 0 || i.y === void 0)
      return null;
    const r = 4 + (n ? 2 : 0), s = 4 + (n ? 2 : 0), o = e.x ?? 0, d = e.y ?? 0, a = e.getCircleRadius() ? e.getCircleRadius() : this.graphSvgRenderer.nodeDrawer.getNodeStyle(e).size, c = a + 16 * Math.log(a + 1), u = Math.max(10, 110 / Math.sqrt(a)), p = 45, g = (p + u) * Math.PI / 180, f = o + c * Math.cos(g), m = d - c * Math.sin(g), v = (p - u) * Math.PI / 180, y = o + c * Math.cos(v), x = d - c * Math.sin(v), w = o + (a + r) * Math.cos(g), M = d - (a + r) * Math.sin(g), N = o + (a + s) * Math.cos(v), F = d - (a + s) * Math.sin(v);
    return `M ${w} ${M} C ${f} ${m}, ${y} ${x}, ${N} ${F}`;
  }
  linkStraight(t) {
    var X;
    const { from: e, to: i } = t, n = ((X = this.graphSvgRenderer.getGraphInteraction().getSelectedEdge()) == null ? void 0 : X.edge.id) === t.id;
    if (e.x === void 0 || e.y === void 0 || i.x === void 0 || i.y === void 0)
      return null;
    const r = this.graphSvgRenderer.edgeDrawer.getEdgeStyle(t), s = this.graph.getOptions().isDirected || t.directed, o = s && r.markerEnd !== void 0, d = s && r.markerStart !== void 0, a = 4, c = 4 + (o ? 4 : 0) + (n ? 2 : 0);
    let u = i.x - e.x, p = i.y - e.y, g = Math.sqrt(u * u + p * p), f = u / g, m = p / g;
    const v = e.getCircleRadius() ? e.getCircleRadius() : this.graphSvgRenderer.nodeDrawer.getNodeStyle(e).size, y = t.getSubgraphToNode() ?? t.to, x = y.getCircleRadius() ? y.getCircleRadius() : this.graphSvgRenderer.nodeDrawer.getNodeStyle(y).size;
    g === 0 && (f = -Math.SQRT1_2, m = -Math.SQRT1_2, u = f * v, p = m * v, g = v);
    const w = g <= v;
    let M, N, F, L;
    return w ? (M = e.x + v * f, N = e.y + v * m, F = i.x + (x + c) * f, L = i.y + (x + c) * m) : (M = e.x + (v + a) * f, N = e.y + (v + a) * m, F = i.x - (x + c) * f, L = i.y - (x + c) * m), `M ${M},${N} L ${F},${L}`;
  }
  linkArc(t) {
    var v;
    const { from: e, to: i } = t, n = ((v = this.graphSvgRenderer.getGraphInteraction().getSelectedEdge()) == null ? void 0 : v.edge.id) === t.id;
    if (e.x === void 0 || e.y === void 0 || i.x === void 0 || i.y === void 0)
      return null;
    const r = Math.hypot(i.x - e.x, i.y - e.y), s = this.graphSvgRenderer.edgeDrawer.getEdgeStyle(t), o = 4 + (s.markerStart !== void 0, 0) + (n ? 2 : 0), d = 4 + (s.markerStart !== void 0 ? 2 : 0) + (n ? 2 : 0), a = t.source.getCircleRadius() ? t.source.getCircleRadius() : this.graphSvgRenderer.nodeDrawer.getNodeStyle(e).size, c = t.target.getCircleRadius() ? t.target.getCircleRadius() : this.graphSvgRenderer.nodeDrawer.getNodeStyle(i).size, u = {
      from: { x: e.x, y: e.y },
      to: { x: i.x, y: i.y },
      rx: r,
      ry: r,
      xAxisRotation: 0
    }, p = {
      cx: e.x,
      cy: e.y,
      r: a + o
    }, g = {
      cx: i.x,
      cy: i.y,
      r: c + d
    }, f = Ot(u, p), m = Ot(u, g);
    return f && m ? `M${f.x},${f.y} A${r},${r} 0 0,1 ${m.x},${m.y}` : "";
  }
  defaultLabelRender(t, e, i) {
    var d;
    const n = t.append("g").classed("label-container", !0), r = te(e);
    if (!r || r === "") return;
    const o = (d = n.append("text").text(r).attr("text-anchor", "middle").attr("alignment-baseline", "middle").style("font-size", i.fontSize).style("font-family", i.fontFamily).style("pointer-events", "none").style("fill", i.color).node()) == null ? void 0 : d.getBBox();
    o && n.insert("rect", "text").attr("x", o.x - 4).attr("y", o.y - 2).attr("width", o.width + 8).attr("height", o.height + 4).attr("fill", i.backgroundColor).attr("rx", 2).attr("ry", 2);
  }
  renderDefinitions() {
    this.renderMarkers();
  }
  renderMarkers() {
    if (this.rendererOptions.markerStyleMap)
      for (const t in this.rendererOptions.markerStyleMap)
        this.renderMarker(this.rendererOptions.markerStyleMap[t], t);
  }
  renderMarker(t, e) {
    var o, d, a, c, u, p, g, f, m;
    const i = this.graphSvgRenderer.defs;
    if (!i.select(`#${e}`).empty()) return;
    i.append("marker").attr("id", e).attr("viewBox", t.viewBox).attr("refX", t.refX).attr("refY", t.refY).attr("markerWidth", t.markerWidth).attr("markerHeight", t.markerHeight).attr("markerUnits", t.markerUnits || "userSpaceOnUse").attr("orient", t.orient ?? "auto").append("path").attr("d", t.pathD).attr("fill", t.fill ?? "context-stroke");
    const r = e + "_selected";
    if (!i.select(`#${r}`).empty()) return;
    i.append("marker").attr("id", r).attr("viewBox", ((o = t.selected) == null ? void 0 : o.viewBox) ?? t.viewBox).attr("refX", ((d = t.selected) == null ? void 0 : d.refX) ?? t.refX).attr("refY", ((a = t.selected) == null ? void 0 : a.refY) ?? t.refY).attr("markerWidth", ((c = t.selected) == null ? void 0 : c.markerWidth) ?? t.markerWidth).attr("markerHeight", ((u = t.selected) == null ? void 0 : u.markerHeight) ?? t.markerHeight).attr("markerUnits", (((p = t.selected) == null ? void 0 : p.markerUnits) ?? t.markerUnits) || "userSpaceOnUse").attr("orient", ((g = t.selected) == null ? void 0 : g.orient) ?? t.orient ?? "auto").append("path").attr("d", ((f = t.selected) == null ? void 0 : f.pathD) ?? t.pathD).attr("fill", ((m = t.selected) == null ? void 0 : m.fill) ?? t.fill ?? "context-stroke");
  }
  highlightSelection(t, e) {
    var i, n, r;
    if (t.classed("selected", !1), ((i = this.graphSvgRenderer.getGraphInteraction().getSelectedEdge()) == null ? void 0 : i.edge.id) === e.id) {
      t.classed("selected", !0);
      const s = t.selectAll("path"), o = (n = s.attr("marker-start")) == null ? void 0 : n.match(/#.*(?=\))/);
      o && s.attr("marker-start", `url(${o[0]}_selected)`);
      const d = (r = s.attr("marker-end")) == null ? void 0 : r.match(/#.*(?=\))/);
      d && s.attr("marker-end", `url(${d[0]}_selected)`);
    }
  }
}
class Ve {
  constructor(t) {
    h(this, "graph");
    h(this, "renderer");
    h(this, "graphInteraction");
    this.graph = t;
  }
  init(t, e) {
    this.renderer = t, this.graphInteraction = e, this.registerListeners();
  }
  update() {
    this.registerListeners();
  }
  registerListeners() {
    this.renderer.getOptions().dragEnabled && this.renderer.getNodeSelection().call(this.graph.simulation.createDragBehavior()), this.renderer.getOptions().interactionEnabled && (this.renderer.getNodeSelection().on("dblclick.node", (t, e) => {
      var n;
      t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.nodeDbclick(i, t, e);
    }).on("click.node", (t, e) => {
      var n;
      t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.nodeClick(i, t, e);
    }).on("contextmenu.node", (t, e) => {
      var n;
      t.preventDefault(), t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.nodeContextmenu(i, t, e);
    }).on("mouseenter.node", (t, e) => {
      var n;
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.nodeHoverIn(i, t, e);
    }).on("mouseleave.node", (t, e) => {
      var n;
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.nodeHoverOut(i, t, e);
    }).on("dragging.node", (t, e) => {
      var i;
      (i = this.graphInteraction) == null || i.dragging(t, e);
    }), this.renderer.getEdgeSelection().on("dblclick.edge", (t, e) => {
      var n;
      t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.edgeDbclick(i, t, e);
    }).on("click.edge", (t, e) => {
      var n;
      t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.edgeClick(i, t, e);
    }).on("contextmenu.edge", (t, e) => {
      var n;
      t.preventDefault(), t.stopPropagation();
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.edgeContextmenu(i, t, e);
    }).on("mouseenter.edge", (t, e) => {
      var n;
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.edgeHoverIn(i, t, e);
    }).on("mouseleave.edge", (t, e) => {
      var n;
      const i = t.currentTarget;
      (n = this.graphInteraction) == null || n.edgeHoverOut(i, t, e);
    }), this.renderer.getCanvasSelection().on("click.canvas", (t) => {
      var e;
      (e = this.graphInteraction) == null || e.canvasClick(t);
    }).on("contextmenu.canvas", (t) => {
      var e;
      t.preventDefault(), (e = this.graphInteraction) == null || e.canvasContextmenu(t);
    }).on("mousemove.canvas", (t) => {
      var e;
      (e = this.graphInteraction) == null || e.canvasMousemove(t);
    }));
  }
}
class We {
  constructor(t) {
    h(this, "graph");
    h(this, "callbacks");
    h(this, "listeners");
    h(this, "selectedNode", null);
    h(this, "selectedEdge", null);
    h(this, "selectedNodes", []);
    h(this, "selectedEdges", []);
    h(this, "nodeHoverIn", (t, e, i) => {
      this.emit("nodeHoverIn", e, i, t), this.callbacks.onNodeHoverIn && typeof this.callbacks.onNodeHoverIn == "function" && this.callbacks.onNodeHoverIn(e, i, t);
    });
    h(this, "nodeHoverOut", (t, e, i) => {
      this.emit("nodeHoverOut", e, i, t), this.callbacks.onNodeHoverOut && typeof this.callbacks.onNodeHoverOut == "function" && this.callbacks.onNodeHoverOut(e, i, t);
    });
    h(this, "dragging", (t, e) => {
      this.emit("dragging", t, e), this.callbacks.onNodeDragging && typeof this.callbacks.onNodeDragging == "function" && this.callbacks.onNodeDragging(t, e);
    });
    h(this, "dragended", (t, e) => {
      this.emit("dragended", t, e), this.callbacks.onNodeDragended && typeof this.callbacks.onNodeDragended == "function" && this.callbacks.onNodeDragended(t, e);
    });
    this.graph = t, this.callbacks = this.graph.getCallbacks() ?? {}, this.listeners = {
      nodeClick: [],
      nodeDbclick: [],
      nodeHoverIn: [],
      nodeHoverOut: [],
      nodeSelect: [],
      nodeBlur: [],
      dragging: [],
      dragended: [],
      nodeContextmenu: [],
      edgeClick: [],
      edgeDbclick: [],
      edgeHoverIn: [],
      edgeHoverOut: [],
      edgeSelect: [],
      edgeBlur: [],
      edgeContextmenu: [],
      canvasClick: [],
      canvasMousemove: [],
      canvasContextmenu: [],
      canvasZoom: [],
      simulationTick: [],
      simulationSlowTick: [],
      selectNode: [],
      unselectNode: [],
      selectEdge: [],
      unselectEdge: [],
      selectNodes: [],
      unselectNodes: [],
      selectEdges: [],
      unselectEdges: []
    }, this.graph.UIManager.keyManager.register({ key: "Enter", callback: () => {
      this.expandNodeSelection();
    } });
  }
  on(t, e) {
    this.listeners[t].push(e);
  }
  off(t, e) {
    this.listeners[t] = this.listeners[t].filter((i) => i !== e);
  }
  getGraph() {
    return this.graph;
  }
  emit(t, ...e) {
    for (const i of this.listeners[t])
      i(...e);
  }
  nodeClick(t, e, i) {
    var n;
    e.shiftKey ? this.addNodesToSelection([{ node: i, element: t }]) : e.altKey ? this.selectNodes([{ node: i, element: t }]) : e.ctrlKey ? this.removeNodesFromSelection([{ node: i, element: t }]) : ((n = this.getSelectedNode()) == null ? void 0 : n.node) !== i && (t.classList.contains("pvt-node-expanded"), this.selectNode(t, i)), this.emit("nodeClick", e, i, t), this.callbacks.onNodeClick && typeof this.callbacks.onNodeClick == "function" && this.callbacks.onNodeClick(e, i, t);
  }
  nodeDbclick(t, e, i) {
    this.emit("nodeDbclick", e, i, t), this.callbacks.onNodeDbclick && typeof this.callbacks.onNodeDbclick == "function" && this.callbacks.onNodeDbclick(e, i, t);
  }
  nodeContextmenu(t, e, i) {
    this.emit("nodeContextmenu", e, i, t), this.callbacks.onNodeContextmenu && typeof this.callbacks.onNodeContextmenu == "function" && this.callbacks.onNodeContextmenu(e, i, t);
  }
  edgeClick(t, e, i) {
    this.selectEdge(t, i), this.emit("edgeClick", e, i, t), this.callbacks.onEdgeClick && typeof this.callbacks.onEdgeClick == "function" && this.callbacks.onEdgeClick(e, i, t);
  }
  edgeDbclick(t, e, i) {
    this.emit("edgeDbclick", e, i, t), this.callbacks.onEdgeDbclick && typeof this.callbacks.onEdgeDbclick == "function" && this.callbacks.onEdgeDbclick(e, i, t);
  }
  edgeContextmenu(t, e, i) {
    this.emit("edgeContextmenu", e, i, t), this.callbacks.onEdgeContextmenu && typeof this.callbacks.onEdgeContextmenu == "function" && this.callbacks.onEdgeContextmenu(e, i, t);
  }
  edgeHoverIn(t, e, i) {
    this.emit("edgeHoverIn", e, i, t), this.callbacks.onEdgeHoverIn && typeof this.callbacks.onEdgeHoverIn == "function" && this.callbacks.onEdgeHoverIn(e, i, t);
  }
  edgeHoverOut(t, e, i) {
    this.emit("edgeHoverOut", e, i, t), this.callbacks.onEdgeHoverOut && typeof this.callbacks.onNodeHoverOut == "function" && this.callbacks.onEdgeHoverOut(e, i, t);
  }
  canvasClick(t) {
    this.unselectAll(), this.emit("canvasClick", t), this.callbacks.onCanvasClick && typeof this.callbacks.onCanvasClick == "function" && this.callbacks.onCanvasClick(t);
  }
  canvasZoom(t) {
    this.emit("canvasZoom", t), this.callbacks.onCanvasZoom && typeof this.callbacks.onCanvasZoom == "function" && this.callbacks.onCanvasZoom(t);
  }
  canvasContextmenu(t) {
    this.emit("canvasContextmenu", t), this.callbacks.onCanvasContextmenu && typeof this.callbacks.onCanvasContextmenu == "function" && this.callbacks.onCanvasContextmenu(t);
  }
  canvasMousemove(t) {
    this.emit("canvasMousemove", t), this.callbacks.onCanvasMousemove && typeof this.callbacks.onCanvasMousemove == "function" && this.callbacks.onCanvasMousemove(t);
  }
  simulationTick() {
    this.emit("simulationTick"), this.callbacks.onSimulationTick && typeof this.callbacks.onSimulationTick == "function" && this.callbacks.onSimulationTick();
  }
  simulationSlowTick() {
    this.emit("simulationSlowTick"), this.callbacks.onSimulationSlowTick && typeof this.callbacks.onSimulationSlowTick == "function" && this.callbacks.onSimulationSlowTick();
  }
  selectNode(t, e) {
    this.unselectAll(), this.selectedNode = {
      node: e,
      element: t
    }, this.selectedNodes = [this.selectedNode], this.emit("selectNode", e, t), this.callbacks.onNodeSelect && typeof this.callbacks.onNodeSelect == "function" && this.callbacks.onNodeSelect(e, t), this.refreshRendering();
  }
  unselectNode() {
    if (this.selectedNode === null)
      return;
    const t = this.selectedNode.node, e = this.selectedNode.element;
    this.selectedNode = null, this.selectedNodes = [], this.emit("unselectNode", t, e), this.callbacks.onNodeBlur && typeof this.callbacks.onNodeBlur == "function" && this.callbacks.onNodeBlur(t, e), this.unselectFromDirectSubgraph(t), this.refreshRendering();
  }
  unselectFromAncestorSubgraphs(t) {
    var o, d;
    const e = this.buildAncestorStack(t);
    let i = this.findOutermostSubgraph(e);
    if (!i) return;
    let n;
    for (; e.length > 0 && i; ) {
      const a = e.pop();
      n = i, a && (i = (o = i.getMutableNode(a.id)) == null ? void 0 : o.getSubgraph());
    }
    if (!n) return;
    const r = n.renderer.getGraphInteraction();
    ((d = r.getSelectedNode()) == null ? void 0 : d.node.id) === t.id && r.unselectNode();
  }
  unselectFromDirectSubgraph(t) {
    var i, n;
    const e = (i = t.parentNode) == null ? void 0 : i.getSubgraph();
    if (e) {
      const r = e.renderer.getGraphInteraction();
      ((n = r.getSelectedNode()) == null ? void 0 : n.node.id) === t.id && r.unselectNode();
    }
    this.refreshRendering();
  }
  buildAncestorStack(t) {
    const e = [];
    let i = t.parentNode;
    for (; i; )
      e.push(i), i = i.parentNode;
    return e;
  }
  findOutermostSubgraph(t) {
    var e;
    for (let i = t.length - 1; i >= 0; i--) {
      const n = (e = t[i]) == null ? void 0 : e.getSubgraph();
      if (n) return n;
    }
  }
  selectNodes(t) {
    if (t.length === 1)
      return this.selectNode(t[0].element, t[0].node);
    this.unselectAll(), this.selectedNodes = t, this.selectedNode = this.selectedNodes.length === 1 ? this.selectedNodes[0] : null, this.emit("selectNodes", this.selectedNodes), this.callbacks.onNodesSelect && typeof this.callbacks.onNodesSelect == "function" && this.callbacks.onNodesSelect(t), this.refreshRendering();
  }
  addNodesToSelection(t) {
    if (t.length == 0) return;
    if (this.selectedNodes.length === 0 && t.length === 1)
      return this.selectNode(t[0].element, t[0].node);
    const e = this.getSelectedNodeIDs() ?? [];
    t = t.filter((i) => !e.includes(i.node.id)), this.selectedNodes = this.selectedNodes.concat(t), this.selectedNode = this.selectedNodes.length === 1 ? this.selectedNodes[0] : null, this.callbacks.onNodesSelect && typeof this.callbacks.onNodesSelect == "function" && this.callbacks.onNodesSelect(t), this.emit("selectNodes", t), this.refreshRendering();
  }
  removeNodesFromSelection(t) {
    const e = t.map((i) => i.node.id);
    this.selectedNodes = this.selectedNodes.filter((i) => !e.includes(i.node.id)), this.selectedNode = this.selectedNodes.length === 1 ? this.selectedNodes[0] : null, t.forEach(({ node: i, element: n }) => {
      this.callbacks.onNodeBlur && typeof this.callbacks.onNodeBlur == "function" && this.callbacks.onNodeBlur(i, n);
    }), this.emit("unselectNodes", t), this.refreshRendering();
  }
  selectEdge(t, e) {
    this.unselectAll(), this.selectedEdge = {
      edge: e,
      element: t
    }, this.emit("selectEdge", e, t), this.callbacks.onEdgeSelect && typeof this.callbacks.onEdgeSelect == "function" && this.callbacks.onEdgeSelect(e, t), this.refreshRendering();
  }
  selectEdges(t) {
    this.unselectAll(), this.selectedEdges = t.map((e) => ({
      edge: e[0],
      element: e[1]
    })), this.selectedEdge = this.selectedEdges.length === 1 ? this.selectedEdges[0] : null, this.emit("selectEdges", this.selectedEdges), this.selectedEdges.forEach(({ edge: e, element: i }) => {
      this.callbacks.onEdgeSelect && typeof this.callbacks.onEdgeSelect == "function" && this.callbacks.onEdgeSelect(e, i);
    }), this.refreshRendering();
  }
  unselectEdge() {
    if (this.selectedEdge === null)
      return;
    const t = this.selectedEdge.edge, e = this.selectedEdge.element;
    this.selectedEdge = null, this.emit("unselectEdge", t, e), this.callbacks.onEdgeBlur && typeof this.callbacks.onEdgeBlur == "function" && this.callbacks.onEdgeBlur(t, e), this.refreshRendering();
  }
  unselectAll() {
    this.unselectNode(), this.unselectEdge(), this.clearNodeSelectionList(), this.clearEdgeSelectionList(), this.refreshRendering();
  }
  clearNodeSelectionList() {
    this.emit("unselectNodes", this.selectedNodes), this.selectedNodes.forEach(({ node: t, element: e }) => {
      this.callbacks.onNodeBlur && typeof this.callbacks.onNodeBlur == "function" && this.callbacks.onNodeBlur(t, e);
    }), this.selectedNodes = [], this.selectedNode = null;
  }
  clearEdgeSelectionList() {
    this.emit("unselectEdges", this.selectedEdges), this.selectedEdges.forEach(({ edge: t, element: e }) => {
      this.callbacks.onEdgeBlur && typeof this.callbacks.onEdgeBlur == "function" && this.callbacks.onEdgeBlur(t, e);
    }), this.selectedEdges = [], this.selectedEdge = null;
  }
  hasActiveMultiselection() {
    return this.selectedNodes.length > 1 || this.selectedEdges.length > 1;
  }
  refreshRendering() {
    this.graph.renderer.update(!1), this.graph.renderer.nextTick();
  }
  getSelectedNode() {
    return this.selectedNode;
  }
  getSelectedEdge() {
    return this.selectedEdge;
  }
  getSelectedNodeIDs() {
    var t;
    return ((t = this.selectedNodes) == null ? void 0 : t.map((e) => e.node.id)) ?? null;
  }
  getSelectedNodes() {
    return this.selectedNodes;
  }
  getSelectedEdgeIDs() {
    var t;
    return ((t = this.selectedEdges) == null ? void 0 : t.map((e) => e.edge.id)) ?? null;
  }
  getSelectedEdges() {
    return this.selectedEdges;
  }
  expandNodeSelection() {
    this.selectedNodes.length > 1 ? this.graph.toggleExpandNodes(this.selectedNodes.map((t) => t.node)) : this.selectedNode && this.graph.toggleExpandNode(this.selectedNode.node);
  }
}
class Ye {
  constructor(t, e, i) {
    h(this, "graph");
    h(this, "container");
    h(this, "options");
    h(this, "layoutProgress", 0);
    h(this, "layoutProgressType", "done");
    h(this, "progressBar", null);
    h(this, "timerLabel", null);
    h(this, "textLabel", null);
    h(this, "loadingPb", null);
    this.graph = t, this.container = e, this.options = i;
  }
  getCanvas() {
    return this.container.querySelector(".pvt-canvas");
  }
  updateLayoutProgress(t, e, i) {
    this.layoutProgress = t, this.layoutProgressType = i, !(!this.progressBar || !this.timerLabel || !this.textLabel) && (this.progressBar.style.width = `${t * 100}%`, this.timerLabel.textContent = `Elapsed time: ${(e / 1e3).toFixed(1)} sec`, this.layoutProgressType === "simulation" ? this.textLabel.textContent = "Optimizing node positions..." : this.layoutProgressType === "rendering" ? (this.progressBar.style.width = "100%", this.textLabel.textContent = "Rendering in progress") : this.layoutProgressType === "done" && (this.progressBar.style.width = "100%", this.timerLabel.textContent = "All done"), this.toggleLayoutProgressVisibility());
  }
  toggleLayoutProgressVisibility() {
    const t = this.getZoomGroup();
    t && t.classList.toggle("hidden", this.layoutProgressType !== "done"), this.loadingPb && this.loadingPb.classList.toggle("hidden", this.layoutProgressType === "done");
  }
  setupRendering() {
    this.createHtmlProgressBar();
  }
  createHtmlProgressBar() {
    const t = this.getCanvas();
    if (!t)
      throw new Error("Canvas element is not defined in the graph renderer.");
    const e = document.createElement("div");
    e.classList.add("pvt-loading-progress-bar"), e.style.position = "absolute", e.style.left = "50%", e.style.top = "50%", e.style.transform = "translate(-50%, -50%)";
    const i = document.createElement("div");
    i.classList.add("background"), i.style.width = "100%";
    const n = document.createElement("div");
    n.classList.add("track"), i.style.width = "100%";
    const r = document.createElement("div");
    r.classList.add("fill"), r.style.width = "0px";
    const s = document.createElement("span");
    s.classList.add("label"), s.textContent = "Optimizing node positions...";
    const o = document.createElement("span");
    o.classList.add("label"), o.textContent = "Elapsed time: 0 sec", n.appendChild(r), i.appendChild(n), e.append(i, s, o), t.appendChild(e), this.progressBar = r, this.timerLabel = o, this.textLabel = s, this.loadingPb = e;
  }
}
class Xe {
}
class Ze extends Xe {
  constructor(e, i, n) {
    super();
    h(this, "renderer");
    h(this, "svg");
    h(this, "selectionBoxGroup");
    h(this, "rect", null);
    h(this, "startX", 0);
    h(this, "startY", 0);
    h(this, "isSelecting", !1);
    h(this, "selectionMode", "start");
    h(this, "onSvgMouseLeave", () => {
      this.isSelecting && this.onMouseUp();
    });
    h(this, "onMouseDown", (e) => {
      if (!this.selectionBoxGroup) return;
      if (e.shiftKey)
        this.selectionMode = "add";
      else if (e.altKey)
        this.selectionMode = "start";
      else if (e.ctrlKey) {
        if (this.selectionMode = "remove", !this.renderer.getGraphInteraction().hasActiveMultiselection())
          return;
      } else {
        this.selectionMode = "start";
        return;
      }
      e.preventDefault(), this.svg.querySelectorAll(".pvt-selection-rectangle").forEach((r) => r.remove()), this.isSelecting = !0;
      const { x: i, y: n } = this.getSvgPoint(e);
      this.startX = i, this.startY = n, this.rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"), this.rect.setAttribute("x", i.toString()), this.rect.setAttribute("y", n.toString()), this.rect.setAttribute("width", "0"), this.rect.setAttribute("height", "0"), this.rect.setAttribute("class", "pvt-selection-rectangle"), this.selectionBoxGroup.appendChild(this.rect), this.svg.addEventListener("mouseleave", this.onSvgMouseLeave);
    });
    h(this, "onMouseMove", (e) => {
      if (!this.isSelecting || !this.rect) return;
      const { x: i, y: n } = this.getSvgPoint(e), r = Math.min(this.startX, i), s = Math.min(this.startY, n), o = Math.abs(i - this.startX), d = Math.abs(n - this.startY);
      this.rect.setAttribute("x", r.toString()), this.rect.setAttribute("y", s.toString()), this.rect.setAttribute("width", o.toString()), this.rect.setAttribute("height", d.toString());
    });
    h(this, "onMouseUp", () => {
      if (!this.selectionBoxGroup || !this.isSelecting || !this.rect) return;
      this.isSelecting = !1;
      const e = this.rect.getBoundingClientRect(), i = this.getNodesInRect(e).map((n) => ({
        node: n[0],
        element: n[1]
      }));
      this.selectionMode == "start" ? this.renderer.getGraphInteraction().selectNodes(i) : this.selectionMode == "add" ? this.renderer.getGraphInteraction().addNodesToSelection(i) : this.selectionMode == "remove" && this.renderer.getGraphInteraction().removeNodesFromSelection(i), this.selectionBoxGroup.removeChild(this.rect), this.rect = null, this.svg.removeEventListener("mouseleave", this.onSvgMouseLeave);
    });
    this.renderer = e, this.svg = i, this.selectionBoxGroup = n, this.init();
  }
  selectionInProgress() {
    return this.isSelecting;
  }
  init() {
    this.svg.addEventListener("mousedown", this.onMouseDown), this.svg.addEventListener("mousemove", this.onMouseMove), this.svg.addEventListener("mouseup", this.onMouseUp);
  }
  getSvgPoint(e) {
    var n;
    const i = this.svg.createSVGPoint();
    return i.x = e.clientX, i.y = e.clientY, i.matrixTransform((n = this.svg.getScreenCTM()) == null ? void 0 : n.inverse());
  }
  getNodesInRect(e) {
    const i = this.renderer.getGraphInteraction().getGraph().getMutableNodes(), n = [];
    return i.forEach((r) => {
      if (!r.x || !r.y) return;
      const s = r.getGraphElement();
      if (!s || !(s instanceof SVGGElement)) return;
      const o = s.getBoundingClientRect();
      o.x < e.x + e.width && o.x + o.width > e.x && o.y < e.y + e.height && o.y + o.height > e.y && n.push([r, s]);
    }), n;
  }
}
T.prototype.transition = Wt;
const Ke = {
  arrow: {
    pathD: "M0,-5L10,0L0,5",
    viewBox: "0 -5 10 10",
    refX: 6,
    refY: 0,
    markerWidth: 12,
    markerHeight: 12,
    markerUnits: "userSpaceOnUse",
    orient: "auto",
    selected: {
      fill: "var(--pvt-edge-selected-stroke, #007acc)"
    }
  },
  circle: {
    pathD: "M5,5m-3,0a3,3 0 1,0 6,0a3,3 0 1,0 -6,0",
    viewBox: "0 0 10 10",
    refX: 5,
    refY: 5,
    markerWidth: 10,
    markerHeight: 10,
    markerUnits: "userSpaceOnUse",
    orient: 0,
    selected: {
      fill: "var(--pvt-edge-selected-stroke, #007acc)",
      markerWidth: 16,
      markerHeight: 16
    }
  },
  diamond: {
    pathD: "M0,-4L4,0L0,4L-4,0Z",
    viewBox: "-5 -5 10 10",
    refX: 0,
    refY: 0,
    markerWidth: 8,
    markerHeight: 8,
    markerUnits: "userSpaceOnUse",
    orient: 0,
    selected: {
      fill: "var(--pvt-edge-selected-stroke, #007acc)",
      markerWidth: 14,
      markerHeight: 14
    }
  },
  bigcircle: {
    pathD: "M5,5m-3,0a3,3 0 1,0 6,0a3,3 0 1,0 -6,0",
    viewBox: "0 0 10 10",
    refX: 5,
    refY: 5,
    markerWidth: 16,
    markerHeight: 16,
    markerUnits: "userSpaceOnUse",
    orient: 0,
    selected: {
      fill: "var(--pvt-edge-selected-stroke, #007acc)",
      markerWidth: 24,
      markerHeight: 24
    }
  }
}, Qe = {
  shape: "circle",
  size: 10,
  strokeWidth: "var(--pvt-node-stroke-width, 2)",
  color: "var(--pvt-node-color, #007acc)",
  strokeColor: "var(--pvt-node-stroke, #fff)",
  fontFamily: "var(--pvt-label-font, system-ui, sans-serif)",
  textColor: "var(--pvt-node-text-color, #fff)",
  textAnchorPosition: "middle",
  textHorizontalShift: 0,
  textVerticalShift: 0,
  textRotateDegree: 0,
  iconUnicode: void 0,
  iconClass: void 0,
  svgIcon: void 0,
  imagePath: void 0,
  text: void 0,
  html: void 0
}, Je = {
  strokeWidth: 2,
  opacity: 1,
  curveStyle: "bidirectional",
  dashed: !1,
  animateDash: !0,
  rotateLabel: !1,
  markerEnd: "arrow",
  markerStart: void 0,
  strokeColor: "var(--pvt-edge-stroke, #999)"
}, ee = {
  fontSize: 12,
  fontFamily: "var(--pvt-label-font, system-ui, sans-serif)",
  color: "var(--pvt-edge-label-color, #333)",
  backgroundColor: "var(--pvt-edge-label-bg, #ffffffa0)"
}, ti = {
  type: "svg",
  enableFocusMode: !0,
  enableNodeExpansion: !0,
  beforeRender: () => {
  },
  zoomEnabled: !0,
  dragEnabled: !0,
  interactionEnabled: !0,
  minZoom: 0.05,
  maxZoom: 10,
  zoomAnimation: !0,
  zoomAnimationDuration: 300,
  defaultNodeStyle: Qe,
  defaultEdgeStyle: Je,
  defaultLabelStyle: ee,
  markerStyleMap: Ke,
  selectionBox: {
    enabled: !0
  }
};
class ei extends Ye {
  constructor(e, i, n, r) {
    super(e, i, r);
    h(this, "options");
    h(this, "zoom");
    h(this, "eventHandler");
    h(this, "selectionBox", null);
    h(this, "graphInteraction");
    h(this, "nodeDrawer");
    h(this, "edgeDrawer");
    h(this, "svgCanvas");
    // private progressBar: SVGRectElement
    h(this, "svg");
    h(this, "zoomGroup");
    h(this, "edgeGroup");
    h(this, "nodeGroup");
    h(this, "selectionBoxGroup");
    h(this, "defs");
    h(this, "nodeGroupSelection");
    h(this, "edgeGroupSelection");
    h(this, "nodeSelection");
    h(this, "edgeSelection");
    this.options = j({}, ti, r), this.graphInteraction = n, this.eventHandler = new Ve(this.graph), this.nodeDrawer = new ot(this.options, this.graph, this), this.edgeDrawer = new Ue(this.options, this.graph, this), this.svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.svgCanvas.setAttribute("width", "100%"), this.svgCanvas.setAttribute("height", "100%"), this.svgCanvas.setAttribute("fill", "none"), this.svgCanvas.setAttribute("class", "pvt-canvas-element"), this.svgCanvas.setAttribute("data-renderer-drag-enabled", this.options.dragEnabled ? "1" : "0"), this.getCanvas().appendChild(this.svgCanvas), this.svg = T(this.svgCanvas), this.zoomGroup = this.svg.append("g").attr("class", "zoom-layer hidden"), this.edgeGroup = this.zoomGroup.append("g").attr("class", "edges"), this.selectionBoxGroup = this.svg.append("g").attr("class", "selection-box"), this.nodeGroup = this.zoomGroup.append("g").attr("class", "nodes"), this.defs = this.svg.append("defs"), this.edgeDrawer.renderDefinitions(), this.zoom = we(), this.zoom = this.zoom.filter((o) => {
      if (!this.options.zoomEnabled || o.ctrlKey || o.shiftKey || o.altKey)
        return !1;
      const d = o.target;
      return !(d.tagName === "INPUT" || d.tagName === "SELECT" || d.tagName === "TEXTAREA");
    }).scaleExtent([this.options.minZoom, this.options.maxZoom]).on("zoom", (o) => {
      this.zoomGroup.attr("transform", o.transform), this.graphInteraction.canvasZoom(o);
    }), this.svg.call(this.zoom), this.svg.on("dblclick.zoom", null), this.options.selectionBox.enabled && (this.selectionBox = new Ze(this, this.svgCanvas, this.selectionBoxGroup.node())), new IntersectionObserver((o) => {
      o.forEach((d) => {
        d.isIntersecting && this.nodeSelection.each((a, c, u) => {
          if (a.getCircleRadius() !== 25) return;
          const p = u[c].querySelector(".node").getBBox();
          a.setCircleRadius(0.5 * Math.max(p.width, p.height));
        });
      });
    }, { threshold: 0 }).observe(this.svgCanvas);
  }
  setupRendering() {
    this.createHtmlProgressBar();
  }
  getZoomBehavior() {
    return this.zoom;
  }
  getSelectionBox() {
    return this.selectionBox;
  }
  getOptions() {
    return this.options;
  }
  init() {
    this.options.beforeRender && this.options.beforeRender(this.graph), this.dataUpdate(), this.eventHandler.init(this, this.graphInteraction);
  }
  update(e = !1) {
    this.dataUpdate(), e && this.eventHandler.update();
  }
  dataUpdate() {
    const e = this.graph.getMutableNodes().filter((r) => r.visible), i = this.nodeGroup.node();
    this.nodeGroupSelection = this.nodeGroup.selectAll("g.pvt-node").filter(function() {
      return this.parentNode === i;
    }), this.nodeSelection = this.nodeGroupSelection.data(e, (r) => r.id).join(
      (r) => r.append("g").classed("pvt-node", !0).classed("pvt-node-has-children", (s) => s.hasChildren()).classed("pvt-node-expanded", (s) => s.expanded === !0).each((s, o, d) => {
        s.clearDirty();
        const a = T(d[o]);
        a.attr("id", `node-${s.domID}`), this.nodeDrawer.render(a, s);
      }),
      (r) => r.classed("pvt-node-expanded", (s) => s.expanded === !0).each((s, o, d) => {
        const a = T(d[o]);
        if (s.isDirty()) {
          if (s.clearDirty(), !s.expanded) {
            S.collapseAllOpenedClusters(s), S.toggleSyntheticEdges(s);
            const c = this.nodeDrawer.graph.getParentGraph();
            let u = c;
            for (; u; )
              u.renderer.update(!1), u = u.getParentGraph();
            c && S.updateToNewRadiusCollapsed(s, !0, c);
          }
          a.selectChildren().remove(), this.nodeDrawer.render(a, s);
        }
        this.nodeDrawer.checkForHighlight(a, s);
      }),
      (r) => r.remove()
    );
    const n = this.graph.getMutableEdges().filter((r) => r.visible);
    this.edgeGroupSelection = this.edgeGroup.selectAll("g.pvt-edge-group"), this.edgeSelection = this.edgeGroupSelection.data(n, (r) => r.id).join(
      (r) => r.append("g").classed("pvt-edge-group", !0).classed("pvt-edge-synthetic", (s) => s.isSynthetic === !0).each((s, o, d) => {
        s.clearDirty();
        const a = T(d[o]);
        a.attr("id", `edge-${s.domID}`), this.edgeDrawer.render(a, s);
      }),
      (r) => r.each((s, o, d) => {
        if (s.isDirty()) {
          s.clearDirty();
          const a = T(d[o]);
          a.selectChildren().remove(), this.edgeDrawer.render(a, s);
        }
      }),
      (r) => r.remove()
    );
  }
  getCanvasSelection() {
    return this.svg;
  }
  getZoomGroup() {
    return this.zoomGroup.node();
  }
  nextTick() {
    this.updateEdgePositions(), this.updateNodePositions();
  }
  nextTickFor(e) {
    this.updateEdgePositions(e), this.updateNodePositions(e);
  }
  zoomIn() {
    const e = this.getZoomBehavior(), i = this.getCanvasSelection();
    !e || !i || (this.options.zoomAnimation ? i.transition().duration(300).call(e.scaleBy, 1.5) : i.call(e.scaleBy, 1.5));
  }
  zoomOut() {
    const e = this.getZoomBehavior(), i = this.getCanvasSelection();
    !e || !i || (this.options.zoomAnimation ? i.transition().duration(300).call(e.scaleBy, 0.667) : i.call(e.scaleBy, 0.667));
  }
  fitAndCenter(e) {
    const i = this.getZoomBehavior(), n = this.getCanvasSelection(), r = n.node(), s = n.select(".zoom-layer").node();
    if (!i || !r || !s) return;
    const o = s.getBBox();
    if (o.width == 0 || o.height == 0) return;
    const d = r.clientWidth, a = r.clientHeight, c = o.width, u = o.height, p = o.x + c / 2, g = o.y + u / 2;
    let f;
    e ? f = e : (f = Math.min(
      d / c,
      a / u
    ) * 0.8, f = Math.min(f, 3));
    const m = d / 2 - f * p, v = a / 2 - f * g, y = Dt.translate(m, v).scale(f);
    this.options.zoomAnimation ? n.transition().duration(this.options.zoomAnimationDuration).call(i.transform, y) : n.call(i.transform, y);
  }
  focusElement(e) {
    const i = e.getGraphElement(), n = this.getZoomBehavior(), r = this.getCanvasSelection(), s = r.node(), o = r.select(".zoom-layer").node();
    if (!n || !s || !o || !i) return;
    const d = o.getBBox(), a = s.clientWidth, c = s.clientHeight, u = d.width, p = d.height, g = i.transform.baseVal;
    let f = 0, m = 0;
    if (g.numberOfItems > 0) {
      const M = g.getItem(0);
      f = M.matrix.e, m = M.matrix.f;
    }
    const v = Math.min(
      a / u,
      c / p
    ) * 1.5, y = a / 2 - v * f, x = c / 2 - v * m, w = Dt.translate(y, x).scale(v);
    r.transition().duration(300).call(n.transform, w);
  }
  highlightElement(e) {
    const i = e.getGraphElement();
    e instanceof B ? (this.edgeSelection.classed("pvt-edge-highlighted", !1), i == null || i.classList.add("pvt-edge-highlighted")) : e instanceof A && (this.nodeSelection.classed("pvt-node-highlighted", !1), i == null || i.classList.add("pvt-node-highlighted"));
  }
  unHighlightElement(e) {
    const i = e.getGraphElement();
    e instanceof B ? i == null || i.classList.remove("pvt-edge-highlighted") : e instanceof A && (i == null || i.classList.remove("pvt-node-highlighted"));
  }
  clearHighlightedElements() {
    this.edgeSelection.classed("pvt-edge-highlighted", !1), this.nodeSelection.classed("pvt-node-highlighted", !1);
  }
  updateNodePositions(e) {
    if (e) {
      const i = new Set(e == null ? void 0 : e.map((r) => r.id)), n = this.nodeSelection.filter((r) => i.has(r.id));
      this.nodeDrawer.updatePositions(n);
    } else
      this.nodeDrawer.updatePositions(this.nodeSelection);
  }
  updateEdgePositions(e) {
    if (e) {
      const i = e.flatMap((s) => [...s.getEdgesOut(), ...s.getEdgesIn()]), n = new Set(i == null ? void 0 : i.map((s) => s.id)), r = this.edgeSelection.filter((s) => n.has(s.id));
      this.edgeDrawer.updatePositions(r);
    } else
      this.edgeDrawer.updatePositions(this.edgeSelection);
  }
  getNodeSelection() {
    return this.nodeSelection;
  }
  getEdgeSelection() {
    return this.edgeSelection;
  }
  // @ts-expect-error fixme: Don't really understand the typescript error below
  getGraphInteraction() {
    return this.graphInteraction;
  }
  getEventHandler() {
    return this.eventHandler;
  }
}
function ii(l, t, e) {
  const i = e.type ?? "svg";
  if (i === "svg") {
    const n = new We(l);
    return new ei(l, t, n, e);
  }
  throw new Error(`\`${i}\` renderer is not implemented yet.`);
}
function ni(l = 0, t = 0, e = 1e-3) {
  let i = [], n;
  function r() {
    n = typeof e == "function" ? e : () => e;
  }
  function s(o) {
    for (let d = 0, a = i.length; d < a; ++d) {
      const c = i[d], u = n(c, d, i);
      c.vx && c.x && (c.vx -= (c.x - l) * u * o), c.vy && c.y && (c.vy -= (c.y - t) * u * o);
    }
  }
  return s.initialize = (o) => {
    i = o, r();
  }, s.x = function(o) {
    return arguments.length ? (l = o, s) : l;
  }, s.y = function(o) {
    return arguments.length ? (t = o, s) : t;
  }, s.strength = function(o) {
    return arguments.length ? (e = o, r(), s) : e;
  }, s;
}
const ie = 'var ta=Object.defineProperty;var ea=(Q,X,st)=>X in Q?ta(Q,X,{enumerable:!0,configurable:!0,writable:!0,value:st}):Q[X]=st;var T=(Q,X,st)=>ea(Q,typeof X!="symbol"?X+"":X,st);(function(){"use strict";function Q(e){const t=+this._x.call(null,e),n=+this._y.call(null,e);return X(this.cover(t,n),t,n,e)}function X(e,t,n,i){if(isNaN(t)||isNaN(n))return e;var r,o=e._root,a={data:i},u=e._x0,c=e._y0,s=e._x1,h=e._y1,g,d,p,x,y,_,w,b;if(!o)return e._root=a,e;for(;o.length;)if((y=t>=(g=(u+s)/2))?u=g:s=g,(_=n>=(d=(c+h)/2))?c=d:h=d,r=o,!(o=o[w=_<<1|y]))return r[w]=a,e;if(p=+e._x.call(null,o.data),x=+e._y.call(null,o.data),t===p&&n===x)return a.next=o,r?r[w]=a:e._root=a,e;do r=r?r[w]=new Array(4):e._root=new Array(4),(y=t>=(g=(u+s)/2))?u=g:s=g,(_=n>=(d=(c+h)/2))?c=d:h=d;while((w=_<<1|y)===(b=(x>=d)<<1|p>=g));return r[b]=o,r[w]=a,e}function st(e){var t,n,i=e.length,r,o,a=new Array(i),u=new Array(i),c=1/0,s=1/0,h=-1/0,g=-1/0;for(n=0;n<i;++n)isNaN(r=+this._x.call(null,t=e[n]))||isNaN(o=+this._y.call(null,t))||(a[n]=r,u[n]=o,r<c&&(c=r),r>h&&(h=r),o<s&&(s=o),o>g&&(g=o));if(c>h||s>g)return this;for(this.cover(c,s).cover(h,g),n=0;n<i;++n)X(this,a[n],u[n],e[n]);return this}function Dn(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(n))r=(n=Math.floor(e))+1,o=(i=Math.floor(t))+1;else{for(var a=r-n||1,u=this._root,c,s;n>e||e>=r||i>t||t>=o;)switch(s=(t<i)<<1|e<n,c=new Array(4),c[s]=u,u=c,a*=2,s){case 0:r=n+a,o=i+a;break;case 1:n=r-a,o=i+a;break;case 2:r=n+a,i=o-a;break;case 3:n=r-a,i=o-a;break}this._root&&this._root.length&&(this._root=u)}return this._x0=n,this._y0=i,this._x1=r,this._y1=o,this}function Mn(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function In(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function G(e,t,n,i,r){this.node=e,this.x0=t,this.y0=n,this.x1=i,this.y1=r}function Nn(e,t,n){var i,r=this._x0,o=this._y0,a,u,c,s,h=this._x1,g=this._y1,d=[],p=this._root,x,y;for(p&&d.push(new G(p,r,o,h,g)),n==null?n=1/0:(r=e-n,o=t-n,h=e+n,g=t+n,n*=n);x=d.pop();)if(!(!(p=x.node)||(a=x.x0)>h||(u=x.y0)>g||(c=x.x1)<r||(s=x.y1)<o))if(p.length){var _=(a+c)/2,w=(u+s)/2;d.push(new G(p[3],_,w,c,s),new G(p[2],a,w,_,s),new G(p[1],_,u,c,w),new G(p[0],a,u,_,w)),(y=(t>=w)<<1|e>=_)&&(x=d[d.length-1],d[d.length-1]=d[d.length-1-y],d[d.length-1-y]=x)}else{var b=e-+this._x.call(null,p.data),S=t-+this._y.call(null,p.data),v=b*b+S*S;if(v<n){var C=Math.sqrt(n=v);r=e-C,o=t-C,h=e+C,g=t+C,i=p.data}}return i}function Fn(e){if(isNaN(h=+this._x.call(null,e))||isNaN(g=+this._y.call(null,e)))return this;var t,n=this._root,i,r,o,a=this._x0,u=this._y0,c=this._x1,s=this._y1,h,g,d,p,x,y,_,w;if(!n)return this;if(n.length)for(;;){if((x=h>=(d=(a+c)/2))?a=d:c=d,(y=g>=(p=(u+s)/2))?u=p:s=p,t=n,!(n=n[_=y<<1|x]))return this;if(!n.length)break;(t[_+1&3]||t[_+2&3]||t[_+3&3])&&(i=t,w=_)}for(;n.data!==e;)if(r=n,!(n=n.next))return this;return(o=n.next)&&delete n.next,r?(o?r.next=o:delete r.next,this):t?(o?t[_]=o:delete t[_],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(i?i[w]=n:this._root=n),this):(this._root=o,this)}function kn(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function En(){return this._root}function Rn(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function zn(e){var t=[],n,i=this._root,r,o,a,u,c;for(i&&t.push(new G(i,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(i=n.node,o=n.x0,a=n.y0,u=n.x1,c=n.y1)&&i.length){var s=(o+u)/2,h=(a+c)/2;(r=i[3])&&t.push(new G(r,s,h,u,c)),(r=i[2])&&t.push(new G(r,o,h,s,c)),(r=i[1])&&t.push(new G(r,s,a,u,h)),(r=i[0])&&t.push(new G(r,o,a,s,h))}return this}function On(e){var t=[],n=[],i;for(this._root&&t.push(new G(this._root,this._x0,this._y0,this._x1,this._y1));i=t.pop();){var r=i.node;if(r.length){var o,a=i.x0,u=i.y0,c=i.x1,s=i.y1,h=(a+c)/2,g=(u+s)/2;(o=r[0])&&t.push(new G(o,a,u,h,g)),(o=r[1])&&t.push(new G(o,h,u,c,g)),(o=r[2])&&t.push(new G(o,a,g,h,s)),(o=r[3])&&t.push(new G(o,h,g,c,s))}n.push(i)}for(;i=n.pop();)e(i.node,i.x0,i.y0,i.x1,i.y1);return this}function Bn(e){return e[0]}function Pn(e){return arguments.length?(this._x=e,this):this._x}function Ln(e){return e[1]}function jn(e){return arguments.length?(this._y=e,this):this._y}function Qt(e,t,n){var i=new Jt(t??Bn,n??Ln,NaN,NaN,NaN,NaN);return e==null?i:i.addAll(e)}function Jt(e,t,n,i,r,o){this._x=e,this._y=t,this._x0=n,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function Te(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var U=Qt.prototype=Jt.prototype;U.copy=function(){var e=new Jt(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,i;if(!t)return e;if(!t.length)return e._root=Te(t),e;for(n=[{source:t,target:e._root=new Array(4)}];t=n.pop();)for(var r=0;r<4;++r)(i=t.source[r])&&(i.length?n.push({source:i,target:t.target[r]=new Array(4)}):t.target[r]=Te(i));return e},U.add=Q,U.addAll=st,U.cover=Dn,U.data=Mn,U.extent=In,U.find=Nn,U.remove=Fn,U.removeAll=kn,U.root=En,U.size=Rn,U.visit=zn,U.visitAfter=On,U.x=Pn,U.y=jn;function L(e){return function(){return e}}function Y(e){return(e()-.5)*1e-6}function Gn(e){return e.x+e.vx}function Un(e){return e.y+e.vy}function Hn(e){var t,n,i,r=1,o=1;typeof e!="function"&&(e=L(e==null?1:+e));function a(){for(var s,h=t.length,g,d,p,x,y,_,w=0;w<o;++w)for(g=Qt(t,Gn,Un).visitAfter(u),s=0;s<h;++s)d=t[s],y=n[d.index],_=y*y,p=d.x+d.vx,x=d.y+d.vy,g.visit(b);function b(S,v,C,D,N){var I=S.data,B=S.r,k=y+B;if(I){if(I.index>d.index){var P=p-I.x-I.vx,W=x-I.y-I.vy,H=P*P+W*W;H<k*k&&(P===0&&(P=Y(i),H+=P*P),W===0&&(W=Y(i),H+=W*W),H=(k-(H=Math.sqrt(H)))/H*r,d.vx+=(P*=H)*(k=(B*=B)/(_+B)),d.vy+=(W*=H)*k,I.vx-=P*(k=1-k),I.vy-=W*k)}return}return v>p+k||D<p-k||C>x+k||N<x-k}}function u(s){if(s.data)return s.r=n[s.data.index];for(var h=s.r=0;h<4;++h)s[h]&&s[h].r>s.r&&(s.r=s[h].r)}function c(){if(t){var s,h=t.length,g;for(n=new Array(h),s=0;s<h;++s)g=t[s],n[g.index]=+e(g,s,t)}}return a.initialize=function(s,h){t=s,i=h,c()},a.iterations=function(s){return arguments.length?(o=+s,a):o},a.strength=function(s){return arguments.length?(r=+s,a):r},a.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),a):e},a}function Wn(e){return e.index}function Ae(e,t){var n=e.get(t);if(!n)throw new Error("node not found: "+t);return n}function Vn(e){var t=Wn,n=g,i,r=L(30),o,a,u,c,s,h=1;e==null&&(e=[]);function g(_){return 1/Math.min(u[_.source.index],u[_.target.index])}function d(_){for(var w=0,b=e.length;w<h;++w)for(var S=0,v,C,D,N,I,B,k;S<b;++S)v=e[S],C=v.source,D=v.target,N=D.x+D.vx-C.x-C.vx||Y(s),I=D.y+D.vy-C.y-C.vy||Y(s),B=Math.sqrt(N*N+I*I),B=(B-o[S])/B*_*i[S],N*=B,I*=B,D.vx-=N*(k=c[S]),D.vy-=I*k,C.vx+=N*(k=1-k),C.vy+=I*k}function p(){if(a){var _,w=a.length,b=e.length,S=new Map(a.map((C,D)=>[t(C,D,a),C])),v;for(_=0,u=new Array(w);_<b;++_)v=e[_],v.index=_,typeof v.source!="object"&&(v.source=Ae(S,v.source)),typeof v.target!="object"&&(v.target=Ae(S,v.target)),u[v.source.index]=(u[v.source.index]||0)+1,u[v.target.index]=(u[v.target.index]||0)+1;for(_=0,c=new Array(b);_<b;++_)v=e[_],c[_]=u[v.source.index]/(u[v.source.index]+u[v.target.index]);i=new Array(b),x(),o=new Array(b),y()}}function x(){if(a)for(var _=0,w=e.length;_<w;++_)i[_]=+n(e[_],_,e)}function y(){if(a)for(var _=0,w=e.length;_<w;++_)o[_]=+r(e[_],_,e)}return d.initialize=function(_,w){a=_,s=w,p()},d.links=function(_){return arguments.length?(e=_,p(),d):e},d.id=function(_){return arguments.length?(t=_,d):t},d.iterations=function(_){return arguments.length?(h=+_,d):h},d.strength=function(_){return arguments.length?(n=typeof _=="function"?_:L(+_),x(),d):n},d.distance=function(_){return arguments.length?(r=typeof _=="function"?_:L(+_),y(),d):r},d}var $n={value:()=>{}};function te(){for(var e=0,t=arguments.length,n={},i;e<t;++e){if(!(i=arguments[e]+"")||i in n||/[\\s.]/.test(i))throw new Error("illegal type: "+i);n[i]=[]}return new Ct(n)}function Ct(e){this._=e}function qn(e,t){return e.trim().split(/^|\\s+/).map(function(n){var i="",r=n.indexOf(".");if(r>=0&&(i=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:i}})}Ct.prototype=te.prototype={constructor:Ct,on:function(e,t){var n=this._,i=qn(e+"",n),r,o=-1,a=i.length;if(arguments.length<2){for(;++o<a;)if((r=(e=i[o]).type)&&(r=Xn(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++o<a;)if(r=(e=i[o]).type)n[r]=Ce(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Ce(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new Ct(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),i=0,r,o;i<r;++i)n[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(o=this._[e],i=0,r=o.length;i<r;++i)o[i].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var i=this._[e],r=0,o=i.length;r<o;++r)i[r].value.apply(t,n)}};function Xn(e,t){for(var n=0,i=e.length,r;n<i;++n)if((r=e[n]).name===t)return r.value}function Ce(e,t,n){for(var i=0,r=e.length;i<r;++i)if(e[i].name===t){e[i]=$n,e=e.slice(0,i).concat(e.slice(i+1));break}return n!=null&&e.push({name:t,value:n}),e}var ot=0,ht=0,ft=0,De=1e3,Dt,dt,Mt=0,J=0,It=0,gt=typeof performance=="object"&&performance.now?performance:Date,Me=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Ie(){return J||(Me(Kn),J=gt.now()+It)}function Kn(){J=0}function ee(){this._call=this._time=this._next=null}ee.prototype=Ne.prototype={constructor:ee,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?Ie():+n)+(t==null?0:+t),!this._next&&dt!==this&&(dt?dt._next=this:Dt=this,dt=this),this._call=e,this._time=n,ne()},stop:function(){this._call&&(this._call=null,this._time=1/0,ne())}};function Ne(e,t,n){var i=new ee;return i.restart(e,t,n),i}function Yn(){Ie(),++ot;for(var e=Dt,t;e;)(t=J-e._time)>=0&&e._call.call(void 0,t),e=e._next;--ot}function Fe(){J=(Mt=gt.now())+It,ot=ht=0;try{Yn()}finally{ot=0,Qn(),J=0}}function Zn(){var e=gt.now(),t=e-Mt;t>De&&(It-=t,Mt=e)}function Qn(){for(var e,t=Dt,n,i=1/0;t;)t._call?(i>t._time&&(i=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:Dt=n);dt=e,ne(i)}function ne(e){if(!ot){ht&&(ht=clearTimeout(ht));var t=e-J;t>24?(e<1/0&&(ht=setTimeout(Fe,e-gt.now()-It)),ft&&(ft=clearInterval(ft))):(ft||(Mt=gt.now(),ft=setInterval(Zn,De)),ot=1,Me(Fe))}}const Jn=1664525,ti=1013904223,ke=4294967296;function ei(){let e=1;return()=>(e=(Jn*e+ti)%ke)/ke}function ni(e){return e.x}function ii(e){return e.y}var ri=10,si=Math.PI*(3-Math.sqrt(5));function oi(e){var t,n=1,i=.001,r=1-Math.pow(i,1/300),o=0,a=.6,u=new Map,c=Ne(g),s=te("tick","end"),h=ei();e==null&&(e=[]);function g(){d(),s.call("tick",t),n<i&&(c.stop(),s.call("end",t))}function d(y){var _,w=e.length,b;y===void 0&&(y=1);for(var S=0;S<y;++S)for(n+=(o-n)*r,u.forEach(function(v){v(n)}),_=0;_<w;++_)b=e[_],b.fx==null?b.x+=b.vx*=a:(b.x=b.fx,b.vx=0),b.fy==null?b.y+=b.vy*=a:(b.y=b.fy,b.vy=0);return t}function p(){for(var y=0,_=e.length,w;y<_;++y){if(w=e[y],w.index=y,w.fx!=null&&(w.x=w.fx),w.fy!=null&&(w.y=w.fy),isNaN(w.x)||isNaN(w.y)){var b=ri*Math.sqrt(.5+y),S=y*si;w.x=b*Math.cos(S),w.y=b*Math.sin(S)}(isNaN(w.vx)||isNaN(w.vy))&&(w.vx=w.vy=0)}}function x(y){return y.initialize&&y.initialize(e,h),y}return p(),t={tick:d,restart:function(){return c.restart(g),t},stop:function(){return c.stop(),t},nodes:function(y){return arguments.length?(e=y,p(),u.forEach(x),t):e},alpha:function(y){return arguments.length?(n=+y,t):n},alphaMin:function(y){return arguments.length?(i=+y,t):i},alphaDecay:function(y){return arguments.length?(r=+y,t):+r},alphaTarget:function(y){return arguments.length?(o=+y,t):o},velocityDecay:function(y){return arguments.length?(a=1-y,t):1-a},randomSource:function(y){return arguments.length?(h=y,u.forEach(x),t):h},force:function(y,_){return arguments.length>1?(_==null?u.delete(y):u.set(y,x(_)),t):u.get(y)},find:function(y,_,w){var b=0,S=e.length,v,C,D,N,I;for(w==null?w=1/0:w*=w,b=0;b<S;++b)N=e[b],v=y-N.x,C=_-N.y,D=v*v+C*C,D<w&&(I=N,w=D);return I},on:function(y,_){return arguments.length>1?(s.on(y,_),t):s.on(y)}}}function ai(){var e,t,n,i,r=L(-30),o,a=1,u=1/0,c=.81;function s(p){var x,y=e.length,_=Qt(e,ni,ii).visitAfter(g);for(i=p,x=0;x<y;++x)t=e[x],_.visit(d)}function h(){if(e){var p,x=e.length,y;for(o=new Array(x),p=0;p<x;++p)y=e[p],o[y.index]=+r(y,p,e)}}function g(p){var x=0,y,_,w=0,b,S,v;if(p.length){for(b=S=v=0;v<4;++v)(y=p[v])&&(_=Math.abs(y.value))&&(x+=y.value,w+=_,b+=_*y.x,S+=_*y.y);p.x=b/w,p.y=S/w}else{y=p,y.x=y.data.x,y.y=y.data.y;do x+=o[y.data.index];while(y=y.next)}p.value=x}function d(p,x,y,_){if(!p.value)return!0;var w=p.x-t.x,b=p.y-t.y,S=_-x,v=w*w+b*b;if(S*S/c<v)return v<u&&(w===0&&(w=Y(n),v+=w*w),b===0&&(b=Y(n),v+=b*b),v<a&&(v=Math.sqrt(a*v)),t.vx+=w*p.value*i/v,t.vy+=b*p.value*i/v),!0;if(p.length||v>=u)return;(p.data!==t||p.next)&&(w===0&&(w=Y(n),v+=w*w),b===0&&(b=Y(n),v+=b*b),v<a&&(v=Math.sqrt(a*v)));do p.data!==t&&(S=o[p.data.index]*i/v,t.vx+=w*S,t.vy+=b*S);while(p=p.next)}return s.initialize=function(p,x){e=p,n=x,h()},s.strength=function(p){return arguments.length?(r=typeof p=="function"?p:L(+p),h(),s):r},s.distanceMin=function(p){return arguments.length?(a=p*p,s):Math.sqrt(a)},s.distanceMax=function(p){return arguments.length?(u=p*p,s):Math.sqrt(u)},s.theta=function(p){return arguments.length?(c=p*p,s):Math.sqrt(c)},s}function Ee(e,t,n){var i,r=L(.1),o,a;typeof e!="function"&&(e=L(+e)),t==null&&(t=0),n==null&&(n=0);function u(s){for(var h=0,g=i.length;h<g;++h){var d=i[h],p=d.x-t||1e-6,x=d.y-n||1e-6,y=Math.sqrt(p*p+x*x),_=(a[h]-y)*o[h]*s/y;d.vx+=p*_,d.vy+=x*_}}function c(){if(i){var s,h=i.length;for(o=new Array(h),a=new Array(h),s=0;s<h;++s)a[s]=+e(i[s],s,i),o[s]=isNaN(a[s])?0:+r(i[s],s,i)}}return u.initialize=function(s){i=s,c()},u.strength=function(s){return arguments.length?(r=typeof s=="function"?s:L(+s),c(),u):r},u.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),u):e},u.x=function(s){return arguments.length?(t=+s,u):t},u.y=function(s){return arguments.length?(n=+s,u):n},u}function Re(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(u){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vx+=(r[c]-h.x)*i[c]*u}function a(){if(n){var u,c=n.length;for(i=new Array(c),r=new Array(c),u=0;u<c;++u)i[u]=isNaN(r[u]=+e(n[u],u,n))?0:+t(n[u],u,n)}}return o.initialize=function(u){n=u,a()},o.strength=function(u){return arguments.length?(t=typeof u=="function"?u:L(+u),a(),o):t},o.x=function(u){return arguments.length?(e=typeof u=="function"?u:L(+u),a(),o):e},o}function ze(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(u){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vy+=(r[c]-h.y)*i[c]*u}function a(){if(n){var u,c=n.length;for(i=new Array(c),r=new Array(c),u=0;u<c;++u)i[u]=isNaN(r[u]=+e(n[u],u,n))?0:+t(n[u],u,n)}}return o.initialize=function(u){n=u,a()},o.strength=function(u){return arguments.length?(t=typeof u=="function"?u:L(+u),a(),o):t},o.y=function(u){return arguments.length?(e=typeof u=="function"?u:L(+u),a(),o):e},o}function li(e=0,t=0,n=.001){let i=[],r;function o(){r=typeof n=="function"?n:()=>n}function a(u){for(let c=0,s=i.length;c<s;++c){const h=i[c],g=r(h,c,i);h.vx&&h.x&&(h.vx-=(h.x-e)*g*u),h.vy&&h.y&&(h.vy-=(h.y-t)*g*u)}}return a.initialize=u=>{i=u,o()},a.x=function(u){return arguments.length?(e=u,a):e},a.y=function(u){return arguments.length?(t=u,a):t},a.strength=function(u){return arguments.length?(n=u,o(),a):n},a}var ie="http://www.w3.org/1999/xhtml",Oe={svg:"http://www.w3.org/2000/svg",xhtml:ie,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Be(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),Oe.hasOwnProperty(t)?{space:Oe[t],local:e}:e}function ui(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===ie&&t.documentElement.namespaceURI===ie?t.createElement(e):t.createElementNS(n,e)}}function ci(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function Pe(e){var t=Be(e);return(t.local?ci:ui)(t)}function hi(){}function Le(e){return e==null?hi:function(){return this.querySelector(e)}}function fi(e){typeof e!="function"&&(e=Le(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,u=i[r]=new Array(a),c,s,h=0;h<a;++h)(c=o[h])&&(s=e.call(c,c.__data__,h,o))&&("__data__"in c&&(s.__data__=c.__data__),u[h]=s);return new $(i,this._parents)}function di(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function gi(){return[]}function pi(e){return e==null?gi:function(){return this.querySelectorAll(e)}}function yi(e){return function(){return di(e.apply(this,arguments))}}function mi(e){typeof e=="function"?e=yi(e):e=pi(e);for(var t=this._groups,n=t.length,i=[],r=[],o=0;o<n;++o)for(var a=t[o],u=a.length,c,s=0;s<u;++s)(c=a[s])&&(i.push(e.call(c,c.__data__,s,a)),r.push(c));return new $(i,r)}function _i(e){return function(){return this.matches(e)}}function je(e){return function(t){return t.matches(e)}}var vi=Array.prototype.find;function wi(e){return function(){return vi.call(this.children,e)}}function xi(){return this.firstElementChild}function bi(e){return this.select(e==null?xi:wi(typeof e=="function"?e:je(e)))}var Si=Array.prototype.filter;function Ti(){return Array.from(this.children)}function Ai(e){return function(){return Si.call(this.children,e)}}function Ci(e){return this.selectAll(e==null?Ti:Ai(typeof e=="function"?e:je(e)))}function Di(e){typeof e!="function"&&(e=_i(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,u=i[r]=[],c,s=0;s<a;++s)(c=o[s])&&e.call(c,c.__data__,s,o)&&u.push(c);return new $(i,this._parents)}function Ge(e){return new Array(e.length)}function Mi(){return new $(this._enter||this._groups.map(Ge),this._parents)}function Nt(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}Nt.prototype={constructor:Nt,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function Ii(e){return function(){return e}}function Ni(e,t,n,i,r,o){for(var a=0,u,c=t.length,s=o.length;a<s;++a)(u=t[a])?(u.__data__=o[a],i[a]=u):n[a]=new Nt(e,o[a]);for(;a<c;++a)(u=t[a])&&(r[a]=u)}function Fi(e,t,n,i,r,o,a){var u,c,s=new Map,h=t.length,g=o.length,d=new Array(h),p;for(u=0;u<h;++u)(c=t[u])&&(d[u]=p=a.call(c,c.__data__,u,t)+"",s.has(p)?r[u]=c:s.set(p,c));for(u=0;u<g;++u)p=a.call(e,o[u],u,o)+"",(c=s.get(p))?(i[u]=c,c.__data__=o[u],s.delete(p)):n[u]=new Nt(e,o[u]);for(u=0;u<h;++u)(c=t[u])&&s.get(d[u])===c&&(r[u]=c)}function ki(e){return e.__data__}function Ei(e,t){if(!arguments.length)return Array.from(this,ki);var n=t?Fi:Ni,i=this._parents,r=this._groups;typeof e!="function"&&(e=Ii(e));for(var o=r.length,a=new Array(o),u=new Array(o),c=new Array(o),s=0;s<o;++s){var h=i[s],g=r[s],d=g.length,p=Ri(e.call(h,h&&h.__data__,s,i)),x=p.length,y=u[s]=new Array(x),_=a[s]=new Array(x),w=c[s]=new Array(d);n(h,g,y,_,w,p,t);for(var b=0,S=0,v,C;b<x;++b)if(v=y[b]){for(b>=S&&(S=b+1);!(C=_[S])&&++S<x;);v._next=C||null}}return a=new $(a,i),a._enter=u,a._exit=c,a}function Ri(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function zi(){return new $(this._exit||this._groups.map(Ge),this._parents)}function Oi(e,t,n){var i=this.enter(),r=this,o=this.exit();return typeof e=="function"?(i=e(i),i&&(i=i.selection())):i=i.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?o.remove():n(o),i&&r?i.merge(r).order():r}function Bi(e){for(var t=e.selection?e.selection():e,n=this._groups,i=t._groups,r=n.length,o=i.length,a=Math.min(r,o),u=new Array(r),c=0;c<a;++c)for(var s=n[c],h=i[c],g=s.length,d=u[c]=new Array(g),p,x=0;x<g;++x)(p=s[x]||h[x])&&(d[x]=p);for(;c<r;++c)u[c]=n[c];return new $(u,this._parents)}function Pi(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var i=e[t],r=i.length-1,o=i[r],a;--r>=0;)(a=i[r])&&(o&&a.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(a,o),o=a);return this}function Li(e){e||(e=ji);function t(g,d){return g&&d?e(g.__data__,d.__data__):!g-!d}for(var n=this._groups,i=n.length,r=new Array(i),o=0;o<i;++o){for(var a=n[o],u=a.length,c=r[o]=new Array(u),s,h=0;h<u;++h)(s=a[h])&&(c[h]=s);c.sort(t)}return new $(r,this._parents).order()}function ji(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function Gi(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function Ui(){return Array.from(this)}function Hi(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length;r<o;++r){var a=i[r];if(a)return a}return null}function Wi(){let e=0;for(const t of this)++e;return e}function Vi(){return!this.node()}function $i(e){for(var t=this._groups,n=0,i=t.length;n<i;++n)for(var r=t[n],o=0,a=r.length,u;o<a;++o)(u=r[o])&&e.call(u,u.__data__,o,r);return this}function qi(e){return function(){this.removeAttribute(e)}}function Xi(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Ki(e,t){return function(){this.setAttribute(e,t)}}function Yi(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function Zi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function Qi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function Ji(e,t){var n=Be(e);if(arguments.length<2){var i=this.node();return n.local?i.getAttributeNS(n.space,n.local):i.getAttribute(n)}return this.each((t==null?n.local?Xi:qi:typeof t=="function"?n.local?Qi:Zi:n.local?Yi:Ki)(n,t))}function Ue(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function tr(e){return function(){this.style.removeProperty(e)}}function er(e,t,n){return function(){this.style.setProperty(e,t,n)}}function nr(e,t,n){return function(){var i=t.apply(this,arguments);i==null?this.style.removeProperty(e):this.style.setProperty(e,i,n)}}function ir(e,t,n){return arguments.length>1?this.each((t==null?tr:typeof t=="function"?nr:er)(e,t,n??"")):rr(this.node(),e)}function rr(e,t){return e.style.getPropertyValue(t)||Ue(e).getComputedStyle(e,null).getPropertyValue(t)}function sr(e){return function(){delete this[e]}}function or(e,t){return function(){this[e]=t}}function ar(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function lr(e,t){return arguments.length>1?this.each((t==null?sr:typeof t=="function"?ar:or)(e,t)):this.node()[e]}function He(e){return e.trim().split(/^|\\s+/)}function re(e){return e.classList||new We(e)}function We(e){this._node=e,this._names=He(e.getAttribute("class")||"")}We.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function Ve(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.add(t[i])}function $e(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.remove(t[i])}function ur(e){return function(){Ve(this,e)}}function cr(e){return function(){$e(this,e)}}function hr(e,t){return function(){(t.apply(this,arguments)?Ve:$e)(this,e)}}function fr(e,t){var n=He(e+"");if(arguments.length<2){for(var i=re(this.node()),r=-1,o=n.length;++r<o;)if(!i.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?hr:t?ur:cr)(n,t))}function dr(){this.textContent=""}function gr(e){return function(){this.textContent=e}}function pr(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function yr(e){return arguments.length?this.each(e==null?dr:(typeof e=="function"?pr:gr)(e)):this.node().textContent}function mr(){this.innerHTML=""}function _r(e){return function(){this.innerHTML=e}}function vr(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function wr(e){return arguments.length?this.each(e==null?mr:(typeof e=="function"?vr:_r)(e)):this.node().innerHTML}function xr(){this.nextSibling&&this.parentNode.appendChild(this)}function br(){return this.each(xr)}function Sr(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function Tr(){return this.each(Sr)}function Ar(e){var t=typeof e=="function"?e:Pe(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function Cr(){return null}function Dr(e,t){var n=typeof e=="function"?e:Pe(e),i=t==null?Cr:typeof t=="function"?t:Le(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),i.apply(this,arguments)||null)})}function Mr(){var e=this.parentNode;e&&e.removeChild(this)}function Ir(){return this.each(Mr)}function Nr(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function Fr(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function kr(e){return this.select(e?Fr:Nr)}function Er(e){return arguments.length?this.property("__data__",e):this.node().__data__}function Rr(e){return function(t){e.call(this,t,this.__data__)}}function zr(e){return e.trim().split(/^|\\s+/).map(function(t){var n="",i=t.indexOf(".");return i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),{type:t,name:n}})}function Or(e){return function(){var t=this.__on;if(t){for(var n=0,i=-1,r=t.length,o;n<r;++n)o=t[n],(!e.type||o.type===e.type)&&o.name===e.name?this.removeEventListener(o.type,o.listener,o.options):t[++i]=o;++i?t.length=i:delete this.__on}}}function Br(e,t,n){return function(){var i=this.__on,r,o=Rr(t);if(i){for(var a=0,u=i.length;a<u;++a)if((r=i[a]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=n),r.value=t;return}}this.addEventListener(e.type,o,n),r={type:e.type,name:e.name,value:t,listener:o,options:n},i?i.push(r):this.__on=[r]}}function Pr(e,t,n){var i=zr(e+""),r,o=i.length,a;if(arguments.length<2){var u=this.node().__on;if(u){for(var c=0,s=u.length,h;c<s;++c)for(r=0,h=u[c];r<o;++r)if((a=i[r]).type===h.type&&a.name===h.name)return h.value}return}for(u=t?Br:Or,r=0;r<o;++r)this.each(u(i[r],t,n));return this}function qe(e,t,n){var i=Ue(e),r=i.CustomEvent;typeof r=="function"?r=new r(t,n):(r=i.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function Lr(e,t){return function(){return qe(this,e,t)}}function jr(e,t){return function(){return qe(this,e,t.apply(this,arguments))}}function Gr(e,t){return this.each((typeof t=="function"?jr:Lr)(e,t))}function*Ur(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length,a;r<o;++r)(a=i[r])&&(yield a)}var Hr=[null];function $(e,t){this._groups=e,this._parents=t}function Wr(){return this}$.prototype={constructor:$,select:fi,selectAll:mi,selectChild:bi,selectChildren:Ci,filter:Di,data:Ei,enter:Mi,exit:zi,join:Oi,merge:Bi,selection:Wr,order:Pi,sort:Li,call:Gi,nodes:Ui,node:Hi,size:Wi,empty:Vi,each:$i,attr:Ji,style:ir,property:lr,classed:fr,text:yr,html:wr,raise:br,lower:Tr,append:Ar,insert:Dr,remove:Ir,clone:kr,datum:Er,on:Pr,dispatch:Gr,[Symbol.iterator]:Ur};function Ft(e){return typeof e=="string"?new $([[document.querySelector(e)]],[document.documentElement]):new $([[e]],Hr)}function Vr(e){let t;for(;t=e.sourceEvent;)e=t;return e}function Xe(e,t){if(e=Vr(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var i=n.createSVGPoint();return i.x=e.clientX,i.y=e.clientY,i=i.matrixTransform(t.getScreenCTM().inverse()),[i.x,i.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}const $r={passive:!1},pt={capture:!0,passive:!1};function se(e){e.stopImmediatePropagation()}function at(e){e.preventDefault(),e.stopImmediatePropagation()}function qr(e){var t=e.document.documentElement,n=Ft(e).on("dragstart.drag",at,pt);"onselectstart"in t?n.on("selectstart.drag",at,pt):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function Xr(e,t){var n=e.document.documentElement,i=Ft(e).on("dragstart.drag",null);t&&(i.on("click.drag",at,pt),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in n?i.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var kt=e=>()=>e;function oe(e,{sourceEvent:t,subject:n,target:i,identifier:r,active:o,x:a,y:u,dx:c,dy:s,dispatch:h}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:u,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:s,enumerable:!0,configurable:!0},_:{value:h}})}oe.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function Kr(e){return!e.ctrlKey&&!e.button}function Yr(){return this.parentNode}function Zr(e,t){return t??{x:e.x,y:e.y}}function Qr(){return navigator.maxTouchPoints||"ontouchstart"in this}function Jr(){var e=Kr,t=Yr,n=Zr,i=Qr,r={},o=te("start","drag","end"),a=0,u,c,s,h,g=0;function d(v){v.on("mousedown.drag",p).filter(i).on("touchstart.drag",_).on("touchmove.drag",w,$r).on("touchend.drag touchcancel.drag",b).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function p(v,C){if(!(h||!e.call(this,v,C))){var D=S(this,t.call(this,v,C),v,C,"mouse");D&&(Ft(v.view).on("mousemove.drag",x,pt).on("mouseup.drag",y,pt),qr(v.view),se(v),s=!1,u=v.clientX,c=v.clientY,D("start",v))}}function x(v){if(at(v),!s){var C=v.clientX-u,D=v.clientY-c;s=C*C+D*D>g}r.mouse("drag",v)}function y(v){Ft(v.view).on("mousemove.drag mouseup.drag",null),Xr(v.view,s),at(v),r.mouse("end",v)}function _(v,C){if(e.call(this,v,C)){var D=v.changedTouches,N=t.call(this,v,C),I=D.length,B,k;for(B=0;B<I;++B)(k=S(this,N,v,C,D[B].identifier,D[B]))&&(se(v),k("start",v,D[B]))}}function w(v){var C=v.changedTouches,D=C.length,N,I;for(N=0;N<D;++N)(I=r[C[N].identifier])&&(at(v),I("drag",v,C[N]))}function b(v){var C=v.changedTouches,D=C.length,N,I;for(h&&clearTimeout(h),h=setTimeout(function(){h=null},500),N=0;N<D;++N)(I=r[C[N].identifier])&&(se(v),I("end",v,C[N]))}function S(v,C,D,N,I,B){var k=o.copy(),P=Xe(B||D,C),W,H,lt;if((lt=n.call(v,new oe("beforestart",{sourceEvent:D,target:d,identifier:I,active:a,x:P[0],y:P[1],dx:0,dy:0,dispatch:k}),N))!=null)return W=lt.x-P[0]||0,H=lt.y-P[1]||0,function ce(vt,Ut,he){var Ht=P,wt;switch(vt){case"start":r[I]=ce,wt=a++;break;case"end":delete r[I],--a;case"drag":P=Xe(he||Ut,C),wt=a;break}k.call(vt,v,new oe(vt,{sourceEvent:Ut,subject:lt,target:d,identifier:I,active:wt,x:P[0]+W,y:P[1]+H,dx:P[0]-Ht[0],dy:P[1]-Ht[1],dispatch:k}),N)}}return d.filter=function(v){return arguments.length?(e=typeof v=="function"?v:kt(!!v),d):e},d.container=function(v){return arguments.length?(t=typeof v=="function"?v:kt(v),d):t},d.subject=function(v){return arguments.length?(n=typeof v=="function"?v:kt(v),d):n},d.touchable=function(v){return arguments.length?(i=typeof v=="function"?v:kt(!!v),d):i},d.on=function(){var v=o.on.apply(o,arguments);return v===o?d:v},d.clickDistance=function(v){return arguments.length?(g=(v=+v)*v,d):Math.sqrt(g)},d}function Ke(e=8,t="id-"){const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",i=n+"0123456789-_";let r=n.charAt(Math.floor(Math.random()*n.length));for(let o=1;o<e;o++)r+=i.charAt(Math.floor(Math.random()*i.length));return`${t}${r}`}let Ye=class Cn{constructor(t,n,i,r=Ke(),o=[]){T(this,"id");T(this,"data");T(this,"children");T(this,"style");T(this,"edgesOut");T(this,"edgesIn");T(this,"defaultCircleRadius",10);T(this,"x");T(this,"y");T(this,"vx");T(this,"vy");T(this,"fx");T(this,"fy");T(this,"weight");T(this,"frozen");T(this,"visible");T(this,"expanded");T(this,"isChild");T(this,"childrenDepth");T(this,"isParent");T(this,"parentNode");T(this,"_original_object");T(this,"_deepest_node_clone");T(this,"_subgraph");T(this,"_circleRadius",this.defaultCircleRadius);T(this,"_circleRadiusCollapsed",this.defaultCircleRadius);T(this,"_dirty");T(this,"domID");this.id=t,this.domID=r,this.data=n??{},this.style=i??{},this.children=[],this.isParent=!1,this.setChildren(o),this._dirty=!0,this.frozen=!1,this.visible=!0,this.expanded=!1,this.isChild=!1,this.childrenDepth=0,this.edgesOut=new Set,this.edgesIn=new Set}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}registerEdgeOut(t){this.edgesOut.add(t)}registerEdgeIn(t){this.edgesIn.add(t)}emptyEdges(){this.edgesOut.clear(),this.edgesIn.clear()}getConnectedNodes(){return[...this.edgesOut].map(t=>t.to)}getConnectingNodes(){return[...this.edgesIn].map(t=>t.from)}getEdgesOut(){return[...this.edgesOut]}getEdgesIn(){return[...this.edgesIn]}getStyle(){return this.style}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`node-${this.domID}`):null}toDict(t=!1){const n={id:this.id,data:this.data,style:this.style,weight:this.weight};return t||(n.x=this.x,n.y=this.y,n.vx=this.vx,n.vy=this.vy,n.fx=this.fx,n.fy=this.fy),this.hasChildren()&&(n.children=this.children.map(i=>i.toDict(t))),n}clone(){const t={...this.data},n={...this.style},i=new Cn(this.id,t,n);return i.x=this.x,i.y=this.y,i.vx=this.vx,i.vy=this.vy,i.fx=this.fx,i.fy=this.fy,i.weight=this.weight,i.frozen=this.frozen,i.visible=this.visible,i.expanded=this.expanded,i.isChild=this.isChild,i.childrenDepth=this.childrenDepth,i.isParent=this.isParent,i.parentNode=this.parentNode,i._circleRadius=this._circleRadius,i.children=this.children.map(r=>r.clone()),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}freeze(){this.frozen=!0,this.fx=this.x,this.fy=this.y}unfreeze(){this.frozen=!1,this.fx=void 0,this.fy=void 0}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}toggleExpand(t){t===void 0?this.expanded?this.collapse():this.expand():t?this.expand():this.collapse(),this.markDirty()}expand(){this.expanded=!0,this._original_object&&(this._original_object.expanded=!0)}collapse(){this.expanded=!1,this._original_object&&(this._original_object.expanded=!1)}degree(){return this.edgesOut.size+this.edgesIn.size}setCircleRadius(t){this._circleRadius=t}getCircleRadius(){return this._circleRadius}setCircleRadiusCollapsed(t){this._circleRadiusCollapsed=t}getCircleRadiusCollapsed(){return this._circleRadiusCollapsed}setChildren(t){this.children=t,this.hasChildren()?this.isParent=!0:this.isParent=!1}hasChildren(){return this.children.length>0}markAsChild(t,n){this.isChild=!0,this.childrenDepth=n,this.parentNode=t}markAsParent(){this.isParent=!0}setSubgraph(t){this._subgraph=t}getSubgraph(){return this._subgraph}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setDeepestNodeClone(t){this._deepest_node_clone=t}getDeepestNodeClone(){return this._deepest_node_clone}};class Et{constructor(t,n,i,r,o,a=null,u){T(this,"id");T(this,"from");T(this,"to");T(this,"directed");T(this,"data");T(this,"style");T(this,"visible");T(this,"isSynthetic");T(this,"syntheticTerminalNode");T(this,"_original_object");T(this,"_subgraphFromNode");T(this,"_subgraphToNode");T(this,"_dirty");T(this,"domID");this.id=t,this.domID=Ke(),this.from=n,this.to=i,this.directed=a,this.data=r??{},this.style=o??{},this.visible=!0,this._dirty=!0,this.isSynthetic=u!==void 0,this.syntheticTerminalNode=u,this.from.registerEdgeOut(this),this.to.registerEdgeIn(this)}get source(){return this.from}get target(){return this.to}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}getStyle(){return this.style}getEdgeStyle(){var t;return((t=this.style)==null?void 0:t.edge)??{}}getLabelStyle(){var t;return((t=this.style)==null?void 0:t.label)??{}}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`edge-${this.domID}`):null}setFrom(t){this.from=t}setTo(t){this.to=t}toDict(){return{id:this.id,from:this.from.id,to:this.to.id,data:this.data,style:this.style}}clone(){const t={...this.data},n={...this.style},i=new Et(this.id,this.from.clone(),this.to.clone(),t,n,this.directed);return i.visible=this.visible,i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setSubgraphFromNode(t){this._subgraphFromNode=t}setSubgraphToNode(t){this._subgraphToNode=t}getSubgraphFromNode(){return this._subgraphFromNode}getSubgraphToNode(){return this._subgraphToNode}}function ts(e){return new Worker(self.location.href,{name:e==null?void 0:e.name})}function es(){return new ts}const ns=(e,t,n,i,r)=>new Promise((o,a)=>{const u=es();u.postMessage({source:"simulation-worker-wrapper",nodes:e,edges:t,options:n,canvasBCR:i}),u.onmessage=c=>{const{type:s,progress:h,nodes:g,edges:d,elapsedTime:p}=c.data;if(s==="tick"&&typeof h=="number"){r==null||r(h,p);return}s==="done"&&(o({nodes:g,edges:d}),u.terminate())},u.onerror=a});var Rt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function is(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var yt={exports:{}};yt.exports;var Ze;function rs(){return Ze||(Ze=1,(function(e,t){var n=200,i="__lodash_hash_undefined__",r=800,o=16,a=9007199254740991,u="[object Arguments]",c="[object Array]",s="[object AsyncFunction]",h="[object Boolean]",g="[object Date]",d="[object Error]",p="[object Function]",x="[object GeneratorFunction]",y="[object Map]",_="[object Number]",w="[object Null]",b="[object Object]",S="[object Proxy]",v="[object RegExp]",C="[object Set]",D="[object String]",N="[object Undefined]",I="[object WeakMap]",B="[object ArrayBuffer]",k="[object DataView]",P="[object Float32Array]",W="[object Float64Array]",H="[object Int8Array]",lt="[object Int16Array]",ce="[object Int32Array]",vt="[object Uint8Array]",Ut="[object Uint8ClampedArray]",he="[object Uint16Array]",Ht="[object Uint32Array]",wt=/[\\\\^$.*+?()[\\]{}|]/g,Bs=/^\\[object .+?Constructor\\]$/,Ps=/^(?:0|[1-9]\\d*)$/,R={};R[P]=R[W]=R[H]=R[lt]=R[ce]=R[vt]=R[Ut]=R[he]=R[Ht]=!0,R[u]=R[c]=R[B]=R[h]=R[k]=R[g]=R[d]=R[p]=R[y]=R[_]=R[b]=R[v]=R[C]=R[D]=R[I]=!1;var nn=typeof Rt=="object"&&Rt&&Rt.Object===Object&&Rt,Ls=typeof self=="object"&&self&&self.Object===Object&&self,xt=nn||Ls||Function("return this")(),rn=t&&!t.nodeType&&t,bt=rn&&!0&&e&&!e.nodeType&&e,sn=bt&&bt.exports===rn,fe=sn&&nn.process,on=(function(){try{var l=bt&&bt.require&&bt.require("util").types;return l||fe&&fe.binding&&fe.binding("util")}catch{}})(),an=on&&on.isTypedArray;function js(l,f,m){switch(m.length){case 0:return l.call(f);case 1:return l.call(f,m[0]);case 2:return l.call(f,m[0],m[1]);case 3:return l.call(f,m[0],m[1],m[2])}return l.apply(f,m)}function Gs(l,f){for(var m=-1,A=Array(l);++m<l;)A[m]=f(m);return A}function Us(l){return function(f){return l(f)}}function Hs(l,f){return l==null?void 0:l[f]}function Ws(l,f){return function(m){return l(f(m))}}var Vs=Array.prototype,$s=Function.prototype,Wt=Object.prototype,de=xt["__core-js_shared__"],Vt=$s.toString,Z=Wt.hasOwnProperty,ln=(function(){var l=/[^.]+$/.exec(de&&de.keys&&de.keys.IE_PROTO||"");return l?"Symbol(src)_1."+l:""})(),un=Wt.toString,qs=Vt.call(Object),Xs=RegExp("^"+Vt.call(Z).replace(wt,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$"),$t=sn?xt.Buffer:void 0,cn=xt.Symbol,hn=xt.Uint8Array;$t&&$t.allocUnsafe;var fn=Ws(Object.getPrototypeOf,Object),dn=Object.create,Ks=Wt.propertyIsEnumerable,Ys=Vs.splice,nt=cn?cn.toStringTag:void 0,qt=(function(){try{var l=ye(Object,"defineProperty");return l({},"",{}),l}catch{}})(),Zs=$t?$t.isBuffer:void 0,gn=Math.max,Qs=Date.now,pn=ye(xt,"Map"),St=ye(Object,"create"),Js=(function(){function l(){}return function(f){if(!rt(f))return{};if(dn)return dn(f);l.prototype=f;var m=new l;return l.prototype=void 0,m}})();function it(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function to(){this.__data__=St?St(null):{},this.size=0}function eo(l){var f=this.has(l)&&delete this.__data__[l];return this.size-=f?1:0,f}function no(l){var f=this.__data__;if(St){var m=f[l];return m===i?void 0:m}return Z.call(f,l)?f[l]:void 0}function io(l){var f=this.__data__;return St?f[l]!==void 0:Z.call(f,l)}function ro(l,f){var m=this.__data__;return this.size+=this.has(l)?0:1,m[l]=St&&f===void 0?i:f,this}it.prototype.clear=to,it.prototype.delete=eo,it.prototype.get=no,it.prototype.has=io,it.prototype.set=ro;function K(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function so(){this.__data__=[],this.size=0}function oo(l){var f=this.__data__,m=Xt(f,l);if(m<0)return!1;var A=f.length-1;return m==A?f.pop():Ys.call(f,m,1),--this.size,!0}function ao(l){var f=this.__data__,m=Xt(f,l);return m<0?void 0:f[m][1]}function lo(l){return Xt(this.__data__,l)>-1}function uo(l,f){var m=this.__data__,A=Xt(m,l);return A<0?(++this.size,m.push([l,f])):m[A][1]=f,this}K.prototype.clear=so,K.prototype.delete=oo,K.prototype.get=ao,K.prototype.has=lo,K.prototype.set=uo;function ut(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function co(){this.size=0,this.__data__={hash:new it,map:new(pn||K),string:new it}}function ho(l){var f=Yt(this,l).delete(l);return this.size-=f?1:0,f}function fo(l){return Yt(this,l).get(l)}function go(l){return Yt(this,l).has(l)}function po(l,f){var m=Yt(this,l),A=m.size;return m.set(l,f),this.size+=m.size==A?0:1,this}ut.prototype.clear=co,ut.prototype.delete=ho,ut.prototype.get=fo,ut.prototype.has=go,ut.prototype.set=po;function ct(l){var f=this.__data__=new K(l);this.size=f.size}function yo(){this.__data__=new K,this.size=0}function mo(l){var f=this.__data__,m=f.delete(l);return this.size=f.size,m}function _o(l){return this.__data__.get(l)}function vo(l){return this.__data__.has(l)}function wo(l,f){var m=this.__data__;if(m instanceof K){var A=m.__data__;if(!pn||A.length<n-1)return A.push([l,f]),this.size=++m.size,this;m=this.__data__=new ut(A)}return m.set(l,f),this.size=m.size,this}ct.prototype.clear=yo,ct.prototype.delete=mo,ct.prototype.get=_o,ct.prototype.has=vo,ct.prototype.set=wo;function xo(l,f){var m=ve(l),A=!m&&_e(l),M=!m&&!A&&wn(l),E=!m&&!A&&!M&&bn(l),z=m||A||M||E,F=z?Gs(l.length,String):[],O=F.length;for(var q in l)z&&(q=="length"||M&&(q=="offset"||q=="parent")||E&&(q=="buffer"||q=="byteLength"||q=="byteOffset")||_n(q,O))||F.push(q);return F}function ge(l,f,m){(m!==void 0&&!Zt(l[f],m)||m===void 0&&!(f in l))&&pe(l,f,m)}function bo(l,f,m){var A=l[f];(!(Z.call(l,f)&&Zt(A,m))||m===void 0&&!(f in l))&&pe(l,f,m)}function Xt(l,f){for(var m=l.length;m--;)if(Zt(l[m][0],f))return m;return-1}function pe(l,f,m){f=="__proto__"&&qt?qt(l,f,{configurable:!0,enumerable:!0,value:m,writable:!0}):l[f]=m}var So=Oo();function Kt(l){return l==null?l===void 0?N:w:nt&&nt in Object(l)?Bo(l):Ho(l)}function yn(l){return Tt(l)&&Kt(l)==u}function To(l){if(!rt(l)||Go(l))return!1;var f=xe(l)?Xs:Bs;return f.test(qo(l))}function Ao(l){return Tt(l)&&xn(l.length)&&!!R[Kt(l)]}function Co(l){if(!rt(l))return Uo(l);var f=vn(l),m=[];for(var A in l)A=="constructor"&&(f||!Z.call(l,A))||m.push(A);return m}function mn(l,f,m,A,M){l!==f&&So(f,function(E,z){if(M||(M=new ct),rt(E))Do(l,f,z,m,mn,A,M);else{var F=A?A(me(l,z),E,z+"",l,f,M):void 0;F===void 0&&(F=E),ge(l,z,F)}},Sn)}function Do(l,f,m,A,M,E,z){var F=me(l,m),O=me(f,m),q=z.get(O);if(q){ge(l,m,q);return}var V=E?E(F,O,m+"",l,f,z):void 0,At=V===void 0;if(At){var be=ve(O),Se=!be&&wn(O),An=!be&&!Se&&bn(O);V=O,be||Se||An?ve(F)?V=F:Xo(F)?V=Eo(F):Se?(At=!1,V=No(O)):An?(At=!1,V=ko(O)):V=[]:Ko(O)||_e(O)?(V=F,_e(F)?V=Yo(F):(!rt(F)||xe(F))&&(V=Po(O))):At=!1}At&&(z.set(O,V),M(V,O,A,E,z),z.delete(O)),ge(l,m,V)}function Mo(l,f){return Vo(Wo(l,f,Tn),l+"")}var Io=qt?function(l,f){return qt(l,"toString",{configurable:!0,enumerable:!1,value:Qo(f),writable:!0})}:Tn;function No(l,f){return l.slice()}function Fo(l){var f=new l.constructor(l.byteLength);return new hn(f).set(new hn(l)),f}function ko(l,f){var m=Fo(l.buffer);return new l.constructor(m,l.byteOffset,l.length)}function Eo(l,f){var m=-1,A=l.length;for(f||(f=Array(A));++m<A;)f[m]=l[m];return f}function Ro(l,f,m,A){var M=!m;m||(m={});for(var E=-1,z=f.length;++E<z;){var F=f[E],O=void 0;O===void 0&&(O=l[F]),M?pe(m,F,O):bo(m,F,O)}return m}function zo(l){return Mo(function(f,m){var A=-1,M=m.length,E=M>1?m[M-1]:void 0,z=M>2?m[2]:void 0;for(E=l.length>3&&typeof E=="function"?(M--,E):void 0,z&&Lo(m[0],m[1],z)&&(E=M<3?void 0:E,M=1),f=Object(f);++A<M;){var F=m[A];F&&l(f,F,A,E)}return f})}function Oo(l){return function(f,m,A){for(var M=-1,E=Object(f),z=A(f),F=z.length;F--;){var O=z[++M];if(m(E[O],O,E)===!1)break}return f}}function Yt(l,f){var m=l.__data__;return jo(f)?m[typeof f=="string"?"string":"hash"]:m.map}function ye(l,f){var m=Hs(l,f);return To(m)?m:void 0}function Bo(l){var f=Z.call(l,nt),m=l[nt];try{l[nt]=void 0;var A=!0}catch{}var M=un.call(l);return A&&(f?l[nt]=m:delete l[nt]),M}function Po(l){return typeof l.constructor=="function"&&!vn(l)?Js(fn(l)):{}}function _n(l,f){var m=typeof l;return f=f??a,!!f&&(m=="number"||m!="symbol"&&Ps.test(l))&&l>-1&&l%1==0&&l<f}function Lo(l,f,m){if(!rt(m))return!1;var A=typeof f;return(A=="number"?we(m)&&_n(f,m.length):A=="string"&&f in m)?Zt(m[f],l):!1}function jo(l){var f=typeof l;return f=="string"||f=="number"||f=="symbol"||f=="boolean"?l!=="__proto__":l===null}function Go(l){return!!ln&&ln in l}function vn(l){var f=l&&l.constructor,m=typeof f=="function"&&f.prototype||Wt;return l===m}function Uo(l){var f=[];if(l!=null)for(var m in Object(l))f.push(m);return f}function Ho(l){return un.call(l)}function Wo(l,f,m){return f=gn(f===void 0?l.length-1:f,0),function(){for(var A=arguments,M=-1,E=gn(A.length-f,0),z=Array(E);++M<E;)z[M]=A[f+M];M=-1;for(var F=Array(f+1);++M<f;)F[M]=A[M];return F[f]=m(z),js(l,this,F)}}function me(l,f){if(!(f==="constructor"&&typeof l[f]=="function")&&f!="__proto__")return l[f]}var Vo=$o(Io);function $o(l){var f=0,m=0;return function(){var A=Qs(),M=o-(A-m);if(m=A,M>0){if(++f>=r)return arguments[0]}else f=0;return l.apply(void 0,arguments)}}function qo(l){if(l!=null){try{return Vt.call(l)}catch{}try{return l+""}catch{}}return""}function Zt(l,f){return l===f||l!==l&&f!==f}var _e=yn((function(){return arguments})())?yn:function(l){return Tt(l)&&Z.call(l,"callee")&&!Ks.call(l,"callee")},ve=Array.isArray;function we(l){return l!=null&&xn(l.length)&&!xe(l)}function Xo(l){return Tt(l)&&we(l)}var wn=Zs||Jo;function xe(l){if(!rt(l))return!1;var f=Kt(l);return f==p||f==x||f==s||f==S}function xn(l){return typeof l=="number"&&l>-1&&l%1==0&&l<=a}function rt(l){var f=typeof l;return l!=null&&(f=="object"||f=="function")}function Tt(l){return l!=null&&typeof l=="object"}function Ko(l){if(!Tt(l)||Kt(l)!=b)return!1;var f=fn(l);if(f===null)return!0;var m=Z.call(f,"constructor")&&f.constructor;return typeof m=="function"&&m instanceof m&&Vt.call(m)==qs}var bn=an?Us(an):Ao;function Yo(l){return Ro(l,Sn(l))}function Sn(l){return we(l)?xo(l):Co(l)}var Zo=zo(function(l,f,m){mn(l,f,m)});function Qo(l){return function(){return l}}function Tn(l){return l}function Jo(){return!1}e.exports=Zo})(yt,yt.exports)),yt.exports}var ss=rs(),zt=is(ss);function os(e){var t=0,n=e.children,i=n&&n.length;if(!i)t=1;else for(;--i>=0;)t+=n[i].value;e.value=t}function as(){return this.eachAfter(os)}function ls(e,t){let n=-1;for(const i of this)e.call(t,i,++n,this);return this}function us(e,t){for(var n=this,i=[n],r,o,a=-1;n=i.pop();)if(e.call(t,n,++a,this),r=n.children)for(o=r.length-1;o>=0;--o)i.push(r[o]);return this}function cs(e,t){for(var n=this,i=[n],r=[],o,a,u,c=-1;n=i.pop();)if(r.push(n),o=n.children)for(a=0,u=o.length;a<u;++a)i.push(o[a]);for(;n=r.pop();)e.call(t,n,++c,this);return this}function hs(e,t){let n=-1;for(const i of this)if(e.call(t,i,++n,this))return i}function fs(e){return this.eachAfter(function(t){for(var n=+e(t.data)||0,i=t.children,r=i&&i.length;--r>=0;)n+=i[r].value;t.value=n})}function ds(e){return this.eachBefore(function(t){t.children&&t.children.sort(e)})}function gs(e){for(var t=this,n=ps(t,e),i=[t];t!==n;)t=t.parent,i.push(t);for(var r=i.length;e!==n;)i.splice(r,0,e),e=e.parent;return i}function ps(e,t){if(e===t)return e;var n=e.ancestors(),i=t.ancestors(),r=null;for(e=n.pop(),t=i.pop();e===t;)r=e,e=n.pop(),t=i.pop();return r}function ys(){for(var e=this,t=[e];e=e.parent;)t.push(e);return t}function ms(){return Array.from(this)}function _s(){var e=[];return this.eachBefore(function(t){t.children||e.push(t)}),e}function vs(){var e=this,t=[];return e.each(function(n){n!==e&&t.push({source:n.parent,target:n})}),t}function*ws(){var e=this,t,n=[e],i,r,o;do for(t=n.reverse(),n=[];e=t.pop();)if(yield e,i=e.children)for(r=0,o=i.length;r<o;++r)n.push(i[r]);while(n.length)}function Ot(e,t){e instanceof Map?(e=[void 0,e],t===void 0&&(t=Ss)):t===void 0&&(t=bs);for(var n=new mt(e),i,r=[n],o,a,u,c;i=r.pop();)if((a=t(i.data))&&(c=(a=Array.from(a)).length))for(i.children=a,u=c-1;u>=0;--u)r.push(o=a[u]=new mt(a[u])),o.parent=i,o.depth=i.depth+1;return n.eachBefore(As)}function xs(){return Ot(this).eachBefore(Ts)}function bs(e){return e.children}function Ss(e){return Array.isArray(e)?e[1]:null}function Ts(e){e.data.value!==void 0&&(e.value=e.data.value),e.data=e.data.data}function As(e){var t=0;do e.height=t;while((e=e.parent)&&e.height<++t)}function mt(e){this.data=e,this.depth=this.height=0,this.parent=null}mt.prototype=Ot.prototype={constructor:mt,count:as,each:ls,eachAfter:cs,eachBefore:us,find:hs,sum:fs,sort:ds,path:gs,ancestors:ys,descendants:ms,leaves:_s,links:vs,copy:xs,[Symbol.iterator]:ws};function Cs(e,t){return e.parent===t.parent?1:2}function ae(e){var t=e.children;return t?t[0]:e.t}function le(e){var t=e.children;return t?t[t.length-1]:e.t}function Ds(e,t,n){var i=n/(t.i-e.i);t.c-=i,t.s+=n,e.c+=i,t.z+=n,t.m+=n}function Ms(e){for(var t=0,n=0,i=e.children,r=i.length,o;--r>=0;)o=i[r],o.z+=t,o.m+=t,t+=o.s+(n+=o.c)}function Is(e,t,n){return e.a.parent===t.parent?e.a:n}function Bt(e,t){this._=e,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=t}Bt.prototype=Object.create(mt.prototype);function Ns(e){for(var t=new Bt(e,0),n,i=[t],r,o,a,u;n=i.pop();)if(o=n._.children)for(n.children=new Array(u=o.length),a=u-1;a>=0;--a)i.push(r=n.children[a]=new Bt(o[a],a)),r.parent=n;return(t.parent=new Bt(null,0)).children=[t],t}function Qe(){var e=Cs,t=1,n=1,i=null;function r(s){var h=Ns(s);if(h.eachAfter(o),h.parent.m=-h.z,h.eachBefore(a),i)s.eachBefore(c);else{var g=s,d=s,p=s;s.eachBefore(function(b){b.x<g.x&&(g=b),b.x>d.x&&(d=b),b.depth>p.depth&&(p=b)});var x=g===d?1:e(g,d)/2,y=x-g.x,_=t/(d.x+x+y),w=n/(p.depth||1);s.eachBefore(function(b){b.x=(b.x+y)*_,b.y=b.depth*w})}return s}function o(s){var h=s.children,g=s.parent.children,d=s.i?g[s.i-1]:null;if(h){Ms(s);var p=(h[0].z+h[h.length-1].z)/2;d?(s.z=d.z+e(s._,d._),s.m=s.z-p):s.z=p}else d&&(s.z=d.z+e(s._,d._));s.parent.A=u(s,d,s.parent.A||g[0])}function a(s){s._.x=s.z+s.parent.m,s.m+=s.parent.m}function u(s,h,g){if(h){for(var d=s,p=s,x=h,y=d.parent.children[0],_=d.m,w=p.m,b=x.m,S=y.m,v;x=le(x),d=ae(d),x&&d;)y=ae(y),p=le(p),p.a=s,v=x.z+b-d.z-_+e(x._,d._),v>0&&(Ds(Is(x,s,g),s,v),_+=v,w+=v),b+=x.m,_+=d.m,S+=y.m,w+=p.m;x&&!le(p)&&(p.t=x,p.m+=b-w),d&&!ae(y)&&(y.t=d,y.m+=_-S,g=s)}return g}function c(s){s.x*=t,s.y=s.depth*n}return r.separation=function(s){return arguments.length?(e=s,r):e},r.size=function(s){return arguments.length?(i=!1,t=+s[0],n=+s[1],r):i?null:[t,n]},r.nodeSize=function(s){return arguments.length?(i=!0,t=+s[0],n=+s[1],r):i?[t,n]:null},r}function Pt(e,t){const n={};for(const a of e)n[a.id]=[];for(const{source:a,target:u}of t)n[a.id]||(n[a.id]=[]),n[a.id].push(u.id);const i=new Set,r=new Set,o=a=>{if(!i.has(a)&&(i.add(a),r.add(a),n[a]))for(const u of n[a]){if(!i.has(u)&&o(u))return!0;if(r.has(u))return!0}return r.delete(a),!1};return e.some(a=>o(a.id))}function Je(e,t){const n=new Set(t.map(i=>i.target.id));for(const i of e)if(!n.has(i.id))return i;return e[0]}function Fs(e,t){const n=new Map;for(const c of e)n.set(c.id,[]);for(const c of t)n.get(c.from.id)||console.log(c),n.get(c.from.id).push(c.to);const i=new Map,r=new Map;function o(c,s=new Set){if(r.has(c))return new Set(r.get(c));const h=new Set;for(const g of n.get(c.id)??[])if(!s.has(g)){s.add(g),h.add(g);const d=o(g,s);for(const p of d)h.add(p)}return r.set(c,h),i.set(c,h.size),h}for(const c of e)i.has(c)||o(c);let a=null,u=-1;for(const c of e){const s=i.get(c)??0;s>u&&(u=s,a=c)}return a??e[0]}function ks(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Min-max distance root undefined."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let g=0;for(const d of n.get(h.id))g=Math.max(g,1+(a.get(d.id)||0));a.set(h.id,g)}let u=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,u=s)}return u??e[0]}function Es(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Cannot minimize DAG height."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let g=0;for(const d of n.get(h.id))g=Math.max(g,1+(a.get(d.id)??0));a.set(h.id,g)}let u=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,u=s)}return u??e[0]}const ue={type:"tree",rootId:void 0,rootIdAlgorithmFinder:"MaxReachability",strength:.25,radial:!1,radialGap:750,horizontal:!1,flipEdgeDirection:!1};class j{constructor(t,n,i,r={}){T(this,"graph");T(this,"simulation");T(this,"simulationForces");T(this,"options");T(this,"originalForceStrength");T(this,"canvasBCR");T(this,"levels");T(this,"positionedNodesByID");this.graph=t,this.simulation=n,this.simulationForces=i,this.options=zt({},ue,r),this.originalForceStrength={link:this.simulationForces.link.strength(),charge:this.simulationForces.charge.strength(),gravity:this.simulationForces.gravity.strength()},this.positionedNodesByID=new Map,this.levels={};const o=this.graph.getNodes(),a=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges();if(Pt(o,a)){this.graph.notifier.warning("Tree layout unavailable","The graph contains a cycle, so it cannot be displayed as a tree.");return}this.setSizes(),this.update(),this.registerForces()}update(){const t=this.graph.getNodes(),n=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges(),{levels:i}=this.buildLevels(t,n,void 0,this.options.rootIdAlgorithmFinder),{nodes:r,nodeById:o}=this.buildTree(t,n,this.options,this.canvasBCR);this.positionedNodesByID=o,this.levels=i,r&&this.setNodePositions(r,this.options)}flipEdgeDirection(t){return t.forEach(n=>{const i=n.from;n.setFrom(n.to),n.setTo(i)}),t}setSizes(){const t=this.graph.renderer.getCanvas();if(!t)throw new Error("Canvas element is not defined in the graph renderer.");this.canvasBCR=t.getBoundingClientRect()}setNodePositions(t,n){for(const i of t){const r=this.graph.getMutableNode(i.data.id);if(r)if(n.radial){const o=i.x??0,a=i.y??0;r.x=a*Math.cos(o-Math.PI/2),r.y=a*Math.sin(o-Math.PI/2),r.fx=r.x,r.fy=r.y}else n.horizontal?(r.x=i.y,r.fx=i.y,r.y=i.x,delete r.fy):(r.x=i.x,r.y=i.y,r.fy=i.y,delete r.fx)}}unsetNodePositions(){this.graph.getMutableNodes().forEach(t=>{delete t.fy,delete t.fx})}registerForces(){const t=this.options.strength??.1;if(this.options.radial){const n=Ee(i=>(this.levels[i.id]??1)*100,0,0).strength(t);this.simulation.force("tree-radial",n)}else this.simulation.force("tree-y",ze(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.x)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.y)??0}).strength(t)),this.simulation.force("tree-x",Re(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.y)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.x)??0}).strength(t));j.adjustOtherSimulationForces(this.simulationForces,this.options)}unregisterLayout(){this.unregisterForces(),this.unsetNodePositions()}unregisterForces(){this.simulation.force("tree-radial",null),this.simulation.force("tree-y",null),this.simulation.force("tree-x",null),j.resetOtherSimulationForces(this.simulationForces,this.originalForceStrength)}static registerForcesOnSimulation(t,n,i,r,o,a,u=this){const c=zt({},ue,o),s=c.strength??.1,h=a.width,g=a.height,d=[h/2,g/2];if(Pt(t,n))return;const{levels:p}=u.buildLevelsStatic(t,n,void 0,c.rootIdAlgorithmFinder),{nodeById:x}=u.buildTreeStatic(t,n,c,a);if(c.radial){const y=Ee(_=>(p[_.id]??1)*100,d[0],d[1]).strength(s);i.force("tree-radial",y)}else i.force("tree-y",ze(y=>{var _,w;return c.horizontal?((_=x.get(y.id))==null?void 0:_.x)??0:((w=x.get(y.id))==null?void 0:w.y)??0}).strength(s)),i.force("tree-x",Re(y=>{var _,w;return c.horizontal?((_=x.get(y.id))==null?void 0:_.y)??0:((w=x.get(y.id))==null?void 0:w.x)??0}).strength(s));u.adjustOtherSimulationForces(r,c)}static adjustOtherSimulationForces(t,n){n!=null&&n.radial?(t.link.strength(0),t.charge.strength(0),t.gravity.strength(0)):(t.link.strength(0),t.charge.strength(0),t.gravity.strength(1e-5))}static resetOtherSimulationForces(t,n){t.link.strength(n.link),t.charge.strength(n.charge),t.gravity.strength(n.gravity)}static simulationDone(t,n,i,r){const o=zt({},ue,r);for(const a of t)o.radial?(a.fx=a.x,a.fy=a.y):o.horizontal?(a.fx=a.x,delete a.fy):(a.fy=a.y,delete a.fx)}buildTree(t,n,i,r){return j.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Pt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const y of t){const _=y;_.children=[],o.set(y.id,_)}for(const y of n){const _=o.get(y.source.id),w=o.get(y.target.id);_&&w&&(_.children.push(w),w.parent=_)}const a=i.rootId||j.findRootId(t,n,i.rootIdAlgorithmFinder),u=o.get(a);if(!u)throw new Error(`Root node with id "${a}" not found.`);const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,g=Qe();i.radial?g.size([s,h]):g.size([s,h]).separation((y,_)=>{var b,S;const w=((S=(b=y.parent)==null?void 0:b.children)==null?void 0:S.length)??1;return y.parent===_.parent?1.5/w:1.5});const d=Ot(u),p=g(d),x=new Map;return p.descendants().forEach(y=>{x.set(y.data.id,y)}),{root:p,nodes:p.descendants(),nodeById:x}}buildLevels(t,n,i,r){return j.buildLevelsStatic(t,n,i,r)}static buildLevelsStatic(t,n,i,r){if(!t.length)return{levels:{},maxDepth:0,nodeCountPerLevel:{}};const o=i||j.findRootId(t,n,r),a={[o]:0},u={};for(const d of t)u[d.id]=[];for(const{source:d,target:p}of n)u[d.id].push(p.id);const c=[o];let s=0;for(;s<c.length;){const d=c[s++],p=a[d];for(const x of u[d]||[])x in a||(a[x]=p+1,c.push(x))}const h=Math.max(...Object.values(a)),g={};for(const d of Object.values(a))g[d]=(g[d]||0)+1;return{levels:a,maxDepth:h,nodeCountPerLevel:g}}static findRootId(t,n,i){switch(i){case"FirstZeroInDegree":return Je(t,n).id;case"MaxReachability":return Fs(t,n).id;case"MinMaxDistance":return ks(t,n).id;case"MinHeight":return Es(t,n).id;default:return Je(t,n).id}}}class _t extends j{constructor(t,n,i,r){super(t,n,i,{...r,type:"tree"})}static registerForcesOnSimulation(t,n,i,r,o,a){j.registerForcesOnSimulation(t,n,i,r,o,a,_t)}buildTree(t,n,i,r){return _t.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Pt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const y of t){const _=y;_.children=[],o.set(y.id,_)}if(!i.rootId||!o.get(i.rootId))throw new Error("Ego Tree can only be created with a rootId");const a=i.rootId,u=o.get(a);if(u.children=[],!u)throw new Error(`Root node with id "${a}" not found.`);for(const y of n){const _=o.get(y.source.id),w=o.get(y.target.id);_&&w&&(y.source.id===u.id?(u.children.push(w),w.parent=u):y.target.id===u.id&&(u.children.push(_),_.parent=u))}const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,g=Qe();i.radial?g.size([s,h]):g.size([s,h]).separation((y,_)=>{var b,S;const w=((S=(b=y.parent)==null?void 0:b.children)==null?void 0:S.length)??1;return y.parent===_.parent?1.5/w:1.5});const d=Ot(u),p=g(d),x=new Map;return p.descendants().forEach(y=>{x.set(y.data.id,y)}),{root:p,nodes:p.descendants(),nodeById:x}}}function Rs(e){var n;const t=(n=e.getData())==null?void 0:n.label;return typeof t=="string"?t:""}const tt={d3Alpha:1,d3AlphaMin:.001,d3AlphaDecay:.05,d3AlphaTarget:0,d3VelocityDecay:.45,d3LinkDistance:40,d3LinkStrength:null,d3ManyBodyStrength:-150,d3ManyBodyTheta:.9,d3CollideRadius:12,d3CollideStrength:1,d3CollideIterations:1,d3GravityStrength:.1,enabled:!0,cooldownTime:2e3,useWorker:!0,warmupTicks:"auto",freezeNodesOnDrag:!0,layout:{type:"force"},callbacks:{onInit:()=>{},onStart:()=>{},onStop:()=>{},onTick:()=>{}}};class et{constructor(t,n={}){T(this,"simulation");T(this,"graph");T(this,"canvas");T(this,"graphInteraction");T(this,"layout");T(this,"canvasBCR");T(this,"animationFrameId",null);T(this,"startSimulationTime",0);T(this,"engineRunning",!1);T(this,"slowTickThresholdReached",!1);T(this,"lastTickTime",0);T(this,"avgTickDuration",0);T(this,"SLOW_TICK_THRESHOLD",50);T(this,"dragInProgress",!1);T(this,"dragSelection",[]);T(this,"totalTickCount",0);T(this,"options");T(this,"callbacks");T(this,"simulationForces");T(this,"scaledForces",{d3ManyBodyStrength:tt.d3ManyBodyStrength,d3CollideStrength:tt.d3CollideStrength});if(this.graph=t,this.options=zt({},tt,n),this.callbacks=this.options.callbacks??{},this.canvas=this.graph.renderer.getCanvas(),!this.canvas)throw new Error("Canvas element is not defined in the graph renderer.");if(this.canvasBCR=this.canvas.getBoundingClientRect(),this.graphInteraction=this.graph.renderer.getGraphInteraction(),!this.graphInteraction)throw new Error("Graph interaction is not available.");const i=et.initSimulationForces(this.options,this.canvasBCR);this.simulation=i.simulation,this.simulationForces=i.simulationForces,this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength||tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=this.options.d3CollideStrength||tt.d3CollideStrength,this.options.layout.type==="tree"?this.layout=new j(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="egoTree"&&(this.layout=new _t(this.graph,this.simulation,this.simulationForces,this.options.layout)),this.callbacks.onInit&&this.callbacks.onInit(this)}static initSimulationForces(t,n){const i={link:Vn(),charge:ai(),collide:Hn(),gravity:li()},r=oi().force("link",i.link).force("charge",i.charge).force("collide",i.collide).force("gravity",i.gravity);return this.initSimulationForceGravity(i.gravity,t,n),this.initSimulationForceLink(i.link,t),this.initSimulationForceCharge(i.charge,t),this.initSimulationForceCollide(i.collide,t),r.alphaMin(t.d3AlphaMin),r.alphaDecay(t.d3AlphaDecay),r.alphaTarget(0),r.velocityDecay(t.d3VelocityDecay),{simulation:r,simulationForces:i}}static initSimulationForceGravity(t,n,i){t.x(i.width/2).y(i.height/2).strength(r=>(r.degree()??0)===0?n.d3GravityStrength:.001)}static initSimulationForceLink(t,n){t.distance(i=>{const r=Rs(i);if(!r||r==="")return n.d3LinkDistance;const o=r.length*10;return Math.max(n.d3LinkDistance,o)}),n.d3LinkStrength&&t.strength(n.d3LinkStrength)}static initSimulationForceCharge(t,n){t.theta(n.d3ManyBodyTheta).strength(i=>{const r=i,o=n.d3ManyBodyStrength,a=r.getCircleRadius(),u=10+Math.sqrt(a-10);let c=r.weight??1;return c*=r.isParent?10:1,o*(u*u)/100*c})}static initSimulationForceCollide(t,n){t.radius(i=>{const r=i;return r.expanded?1.2*r.getCircleRadius()+20:r.getCircleRadius()?1.2*r.getCircleRadius():n.d3CollideRadius}).strength(n.d3CollideStrength)}static initSimulationForceClusterRadialConstraint(t,n){t.strength(n.d3CollideStrength)}update(){this.layout&&this.layout.update();const t=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(t);const n=this.simulation.force("link");n&&n.id(i=>i.id).links(this.getActiveEdges()),this.restart()}getActiveEdges(){const t=this.graph.getMutableEdges().filter(i=>{if(!i.visible)return!1;const r=i.source,o=i.target;return!(r.isChild||o.isChild)}),n=this.getClusterLinks();return[...t,...n]}getClusterLinks(){return this.graph.getMutableEdges().filter(n=>n.visible)}scaleSimulationOptions(){const t=et.scaleSimulationOptions(this.options,this.canvasBCR,this.graph.getNodeCount());this.scaledForces.d3ManyBodyStrength=t.d3ManyBodyStrength??tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=t.d3CollideStrength??tt.d3CollideStrength}static scaleSimulationOptions(t,n,i){const r=i/(n.width*n.height),o=Math.min(2,75e-6/r);return{d3ManyBodyStrength:t.d3ManyBodyStrength*o,d3CollideStrength:t.d3ManyBodyStrength*o}}applyScalledSimulationOptions(){et.initSimulationForceCharge(this.simulationForces.charge,this.options),et.initSimulationForceCollide(this.simulationForces.collide,this.options)}enable(){this.avgTickDuration=0,this.options.enabled=!0,this.start(!1)}disable(){this.options.enabled=!1,this.stop()}pause(){this.engineRunning=!1,this.slowTickThresholdReached=!1}restart(){this.startSimulationTime=new Date().getTime(),this.lastTickTime=performance.now(),this.engineRunning=!0,this.slowTickThresholdReached=!1}async start(t=!0){if(t&&await this.runSimulationWorkerRouter(),!this.options.enabled){this.engineRunning=!1;return}this.lastTickTime=performance.now(),this.engineRunning=!0,this.slowTickThresholdReached=!1,this.callbacks.onStart&&this.callbacks.onStart(this),this.animationFrameId===null&&this.startAnimationLoop()}stop(){this.engineRunning=!1,this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)}startAnimationLoop(){const t=()=>{this.animationFrameId=requestAnimationFrame(t),this.simulationTick()};this.engineRunning=!0,this.simulation.alpha(.01).restart(),this.animationFrameId=requestAnimationFrame(t)}simulationTick(){this.engineRunning&&(!this.dragInProgress&&(new Date().getTime()-this.startSimulationTime>this.options.cooldownTime||this.options.d3AlphaMin>0&&this.simulation.alpha()<this.options.d3AlphaMin)&&(this.engineRunning=!1,this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)),this.totalTickCount++,this.updateTickMetrics(),this.simulation.tick(),this.graph.nextTick(),this.callbacks.onTick&&this.callbacks.onTick(this),this.graphInteraction.simulationTick(),this.totalTickCount%10===0&&this.graphInteraction.simulationSlowTick())}updateTickMetrics(){var i;const t=performance.now(),n=t-this.lastTickTime;this.lastTickTime=t,this.avgTickDuration=this.avgTickDuration*.9+n*.1,this.avgTickDuration>this.SLOW_TICK_THRESHOLD&&(this.slowTickThresholdReached=!0,this.disable(),(i=this.graph.UIManager.graphControls)==null||i.updatePhysicSimulationIndicator(!1),this.graph.UIManager.showNotification({level:"warning",title:"Physics engine running slow",message:"The physic has been disabled."}))}async waitForSimulationStop(){if(this.engineRunning)return new Promise(t=>{const n=this.callbacks.onStop;this.callbacks.onStop=i=>{n==null||n(i),this.callbacks.onStop=n,t()}})}isEnabled(){return this.options.enabled}async computeGraph(t={}){var h;const{runSimulation:n}=await Promise.resolve().then(function(){return Os}),i=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!i)return;const r=this.graph.getMutableNodes(),o=this.graph.getNodes().map(g=>(g.fx=void 0,g.fy=void 0,g)),a=this.graph.getEdges(),{callbacks:u,...c}=this.options;Object.assign(c,t);const{nodes:s}=n(o,a,c,i);s.forEach((g,d)=>{r[d].x=g.x,r[d].y=g.y,g.fx?r[d].fx=g.fx:r[d].fx=void 0,g.fy?r[d].fy=g.fy:r[d].fy=void 0}),this.graph.updateData(r,void 0,!1)}async runSimulationWorkerRouter(t={}){this.options.useWorker?await this.runSimulationWorker(t):(await this.computeGraph(t),this.graph.updateLayoutProgress(100,0,"done"))}async runSimulationWorker(t={}){var h;const n=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!n)return;const i=this.graph.getMutableNodes(),r=this.graph.getNodes().map(g=>(g.fx=void 0,g.fy=void 0,g)),o=this.graph.getEdges(),a=(g,d)=>{this.graph.updateLayoutProgress(g,d,"simulation")},{callbacks:u,...c}=this.options;Object.assign(c,t);const{nodes:s}=await ns(r,o,c,n,a);this.graph.updateLayoutProgress(100,0,"rendering"),s.forEach((g,d)=>{i[d].x=g.x,i[d].y=g.y,g.fx?i[d].fx=g.fx:i[d].fx=void 0,g.fy?i[d].fy=g.fy:i[d].fy=void 0}),this.graph.updateData(i,void 0,!1),this.graph.updateLayoutProgress(100,0,"done")}reheat(t=.7){this.restart(),this.simulation.alpha(t).restart()}createDragBehavior(){return Jr().on("start.draggedelement",(t,n)=>{this.graphInteraction.hasActiveMultiselection()?this.dragSelection=this.graphInteraction.getSelectedNodes().map(i=>{const{node:r}=i;return r.freeze(),{node:r,dx:r.x-n.x,dy:r.y-n.y}}):(this.dragSelection=[],n.freeze())}).on("drag.draggedelement",(t,n)=>{if(!this.dragInProgress&&this.isEnabled()&&(this.dragInProgress=!0,this.restart(),this.simulation.alphaTarget(.3).restart()),this.graphInteraction.hasActiveMultiselection()?this.dragSelection.forEach(({node:i,dx:r,dy:o})=>{i.fx=t.x+r,i.fy=t.y+o,i.x=t.x+r,i.y=t.y+o}):(n.fx=t.x,n.fy=t.y,n.x=t.x,n.y=t.y),this.graphInteraction.dragging(t.sourceEvent,t.subject),!this.engineRunning||!this.isEnabled()){const i=this.graphInteraction.hasActiveMultiselection()?this.dragSelection.map(r=>r.node):[n];this.graph.nextTickFor(i)}}).on("end.draggedelement",(t,n)=>{!t.active&&this.dragInProgress&&(this.dragInProgress=!1,this.restart(),this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()),this.options.freezeNodesOnDrag||(this.graphInteraction.hasActiveMultiselection()?(this.dragSelection.forEach(({node:i})=>i.unfreeze()),this.dragSelection=[]):n.unfreeze()),this.graphInteraction.dragended(t.sourceEvent,t.subject)})}isDragging(){return this.dragInProgress}getForceSimulation(){return this.simulationForces}getSimulation(){return this.simulation}async changeLayout(t,n={}){var i;this.layout&&((i=this.layout)==null||i.unregisterLayout(),this.layout=void 0),n=n??{},n.layout=n.layout??{},n.layout.type=t,t==="force"?this.applyScalledSimulationOptions():t==="tree"&&(this.layout=new j(this.graph,this.simulation,this.simulationForces,n.layout)),this.options.layout.type=t,this.update(),this.pause(),await this.runSimulationWorkerRouter(n),this.restart(),await this.waitForSimulationStop(),this.graph.renderer.fitAndCenter()}}const tn=1e4,Lt=2e4,jt=.15*Lt;self.onmessage=e=>{var y,_,w,b;if(e.data.source!=="simulation-worker-wrapper")return;const{nodes:t,edges:n,options:i,canvasBCR:r}=e.data,o=t.map(S=>{const v=new Ye(S.id,S.data,S.style);return v.setCircleRadius(S._circleRadius??10),v}),a=new Map(o.map(S=>[S.id,S]));(y=i.layout)==null||y.type;const{simulation:u,simulationForces:c}=et.initSimulationForces(i,r),s=[];for(const S of n){const v=a.get(S.from.id),C=a.get(S.to.id);if(v&&C){const D=S.style??{};s.push(new Et(S.id,v,C,S.data,D,S.directed))}}u.nodes(o);const h=u.force("link");h&&h.id(S=>S.id).links(s),((_=i.layout)==null?void 0:_.type)==="tree"?j.registerForcesOnSimulation(o,s,u,c,i.layout,r,j):((w=i.layout)==null?void 0:w.type)==="egoTree"&&j.registerForcesOnSimulation(o,s,u,c,i.layout,r,_t);let g=i.warmupTicks||Lt;g=g==="auto"?Lt:g,g=g-jt;let d=.3;u.alphaTarget(d);const p=new Date().getTime();let x;for(let S=0;S<g&&!(new Date().getTime()-p>tn||new Date().getTime()-p>i.cooldownTime||Gt(i,u,d)&&new Date().getTime()-p>i.cooldownTime*.15);++S)S%5===0&&(x=en(S,new Date().getTime()-p,i),postMessage({type:"tick",progress:x,elapsedTime:new Date().getTime()-p})),u.tick();d=0,u.alphaTarget(d),u.alpha(1);for(let S=0;S<jt&&!(Gt(i,u,d)&&new Date().getTime()-p>i.cooldownTime*.15);++S)u.tick(),S%5===0&&(x=en(g+S,new Date().getTime()-p,i),postMessage({type:"tick",progress:x,elapsedTime:new Date().getTime()-p}));postMessage({type:"tick",progress:1,elapsedTime:new Date().getTime()-p}),((b=i.layout)==null?void 0:b.type)==="tree"&&j.simulationDone(o,s,u,i.layout),postMessage({type:"done",nodes:o.map(S=>S.toDict()),edges:s.map(S=>S.toDict())})};function zs(e,t,n,i){var p,x,y,_;const r=e.map(w=>{const b=new Ye(w.id,w.getData(),w.getStyle());return b.weight=w.weight||1,b.setCircleRadius(w.getCircleRadius()),b}),o=new Map(r.map(w=>[w.id,w]));(p=n.layout)==null||p.type;const{simulation:a,simulationForces:u}=et.initSimulationForces(n,i),c=[];for(const w of t){const b=o.get(w.from.id),S=o.get(w.to.id);if(b&&S){const v=w.getStyle()??{};c.push(new Et(w.id,b,S,w.getData(),v,w.directed))}}a.nodes(r);const s=a.force("link");s&&s.id(w=>w.id).links(c),(((x=n.layout)==null?void 0:x.type)==="tree"||((y=n.layout)==null?void 0:y.type)==="egoTree")&&j.registerForcesOnSimulation(r,c,a,u,n.layout,i,j);let h;n.warmupTicks==="auto"||n.warmupTicks==null?h=Lt:h=n.warmupTicks,h=h-jt;let g=.3;a.alphaTarget(g);const d=new Date().getTime();for(let w=0;w<h&&!(new Date().getTime()-d>tn||new Date().getTime()-d>n.cooldownTime||Gt(n,a,g)&&new Date().getTime()-d>n.cooldownTime*.15);++w)a.tick();g=0,a.alphaTarget(g),a.alpha(1);for(let w=0;w<jt&&!(Gt(n,a,g)&&new Date().getTime()-d>n.cooldownTime*.15);++w)a.tick();return((_=n.layout)==null?void 0:_.type)==="tree"&&j.simulationDone(r,c,a,n.layout),{nodes:r,edges:c}}function en(e,t,n){return t/n.cooldownTime}function Gt(e,t,n){return e.d3AlphaMin>0&&t.alpha()-n<e.d3AlphaMin}var Os=Object.freeze({__proto__:null,runSimulation:zs})})();\n', Rt = typeof self < "u" && self.Blob && new Blob([ie], { type: "text/javascript;charset=utf-8" });
function ri(l) {
  let t;
  try {
    if (t = Rt && (self.URL || self.webkitURL).createObjectURL(Rt), !t) throw "";
    const e = new Worker(t, {
      name: l == null ? void 0 : l.name
    });
    return e.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), e;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(ie),
      {
        name: l == null ? void 0 : l.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
function si() {
  return new ri();
}
const oi = (l, t, e, i, n) => new Promise((r, s) => {
  const o = si();
  o.postMessage({ source: "simulation-worker-wrapper", nodes: l, edges: t, options: e, canvasBCR: i }), o.onmessage = (d) => {
    const { type: a, progress: c, nodes: u, edges: p, elapsedTime: g } = d.data;
    if (a === "tick" && typeof c == "number") {
      n == null || n(c, g);
      return;
    }
    a === "done" && (r({ nodes: u, edges: p }), o.terminate());
  }, o.onerror = s;
});
function Y(l, t) {
  const e = {};
  for (const s of l)
    e[s.id] = [];
  for (const { source: s, target: o } of t)
    e[s.id] || (e[s.id] = []), e[s.id].push(o.id);
  const i = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), r = (s) => {
    if (!i.has(s) && (i.add(s), n.add(s), e[s]))
      for (const o of e[s]) {
        if (!i.has(o) && r(o)) return !0;
        if (n.has(o)) return !0;
      }
    return n.delete(s), !1;
  };
  return l.some((s) => r(s.id));
}
function zt(l, t) {
  const e = new Set(t.map((i) => i.target.id));
  for (const i of l)
    if (!e.has(i.id)) return i;
  return l[0];
}
function ai(l, t) {
  const e = /* @__PURE__ */ new Map();
  for (const d of l)
    e.set(d.id, []);
  for (const d of t)
    e.get(d.from.id) || console.log(d), e.get(d.from.id).push(d.to);
  const i = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  function r(d, a = /* @__PURE__ */ new Set()) {
    if (n.has(d))
      return new Set(n.get(d));
    const c = /* @__PURE__ */ new Set();
    for (const u of e.get(d.id) ?? [])
      if (!a.has(u)) {
        a.add(u), c.add(u);
        const p = r(u, a);
        for (const g of p) c.add(g);
      }
    return n.set(d, c), i.set(d, c.size), c;
  }
  for (const d of l)
    i.has(d) || r(d);
  let s = null, o = -1;
  for (const d of l) {
    const a = i.get(d) ?? 0;
    a > o && (o = a, s = d);
  }
  return s ?? l[0];
}
function li(l, t) {
  const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of l)
    e.set(a.id, []), i.set(a.id, 0);
  for (const a of t)
    a.directed !== !1 && (e.get(a.from.id).push(a.to), i.set(a.to.id, (i.get(a.to.id) || 0) + 1));
  const n = [], r = l.filter((a) => i.get(a.id) === 0);
  for (; r.length; ) {
    const a = r.shift();
    n.push(a);
    for (const c of e.get(a.id))
      i.set(c.id, i.get(c.id) - 1), i.get(c.id) === 0 && r.push(c);
  }
  if (n.length !== l.length)
    return console.warn("Graph has a cycle! Min-max distance root undefined."), l[0];
  const s = /* @__PURE__ */ new Map();
  for (let a = n.length - 1; a >= 0; a--) {
    const c = n[a];
    let u = 0;
    for (const p of e.get(c.id))
      u = Math.max(u, 1 + (s.get(p.id) || 0));
    s.set(c.id, u);
  }
  let o = null, d = 1 / 0;
  for (const a of l) {
    const c = s.get(a.id);
    c < d && (d = c, o = a);
  }
  return o ?? l[0];
}
function hi(l, t) {
  const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of l)
    e.set(a.id, []), i.set(a.id, 0);
  for (const a of t)
    a.directed !== !1 && (e.get(a.from.id).push(a.to), i.set(a.to.id, (i.get(a.to.id) || 0) + 1));
  const n = [], r = l.filter((a) => i.get(a.id) === 0);
  for (; r.length; ) {
    const a = r.shift();
    n.push(a);
    for (const c of e.get(a.id))
      i.set(c.id, i.get(c.id) - 1), i.get(c.id) === 0 && r.push(c);
  }
  if (n.length !== l.length)
    return console.warn("Graph has a cycle! Cannot minimize DAG height."), l[0];
  const s = /* @__PURE__ */ new Map();
  for (let a = n.length - 1; a >= 0; a--) {
    const c = n[a];
    let u = 0;
    for (const p of e.get(c.id))
      u = Math.max(u, 1 + (s.get(p.id) ?? 0));
    s.set(c.id, u);
  }
  let o = null, d = 1 / 0;
  for (const a of l) {
    const c = s.get(a.id);
    c < d && (d = c, o = a);
  }
  return o ?? l[0];
}
const ct = {
  type: "tree",
  rootId: void 0,
  rootIdAlgorithmFinder: "MaxReachability",
  strength: 0.25,
  radial: !1,
  radialGap: 750,
  horizontal: !1,
  flipEdgeDirection: !1
};
class D {
  constructor(t, e, i, n = {}) {
    h(this, "graph");
    h(this, "simulation");
    h(this, "simulationForces");
    h(this, "options");
    h(this, "originalForceStrength");
    h(this, "canvasBCR");
    h(this, "levels");
    h(this, "positionedNodesByID");
    this.graph = t, this.simulation = e, this.simulationForces = i, this.options = j({}, ct, n), this.originalForceStrength = {
      link: this.simulationForces.link.strength(),
      charge: this.simulationForces.charge.strength(),
      gravity: this.simulationForces.gravity.strength()
    }, this.positionedNodesByID = /* @__PURE__ */ new Map(), this.levels = {};
    const r = this.graph.getNodes(), s = this.options.flipEdgeDirection ? this.flipEdgeDirection(this.graph.getEdges()) : this.graph.getEdges();
    if (Y(r, s)) {
      this.graph.notifier.warning("Tree layout unavailable", "The graph contains a cycle, so it cannot be displayed as a tree.");
      return;
    }
    this.setSizes(), this.update(), this.registerForces();
  }
  update() {
    const t = this.graph.getNodes(), e = this.options.flipEdgeDirection ? this.flipEdgeDirection(this.graph.getEdges()) : this.graph.getEdges(), { levels: i } = this.buildLevels(t, e, void 0, this.options.rootIdAlgorithmFinder), { nodes: n, nodeById: r } = this.buildTree(t, e, this.options, this.canvasBCR);
    this.positionedNodesByID = r, this.levels = i, n && this.setNodePositions(n, this.options);
  }
  flipEdgeDirection(t) {
    return t.forEach((e) => {
      const i = e.from;
      e.setFrom(e.to), e.setTo(i);
    }), t;
  }
  setSizes() {
    const t = this.graph.renderer.getCanvas();
    if (!t)
      throw new Error("Canvas element is not defined in the graph renderer.");
    this.canvasBCR = t.getBoundingClientRect();
  }
  setNodePositions(t, e) {
    for (const i of t) {
      const n = this.graph.getMutableNode(i.data.id);
      if (n)
        if (e.radial) {
          const r = i.x ?? 0, s = i.y ?? 0;
          n.x = s * Math.cos(r - Math.PI / 2), n.y = s * Math.sin(r - Math.PI / 2), n.fx = n.x, n.fy = n.y;
        } else e.horizontal ? (n.x = i.y, n.fx = i.y, n.y = i.x, delete n.fy) : (n.x = i.x, n.y = i.y, n.fy = i.y, delete n.fx);
    }
  }
  unsetNodePositions() {
    this.graph.getMutableNodes().forEach((t) => {
      delete t.fy, delete t.fx;
    });
  }
  registerForces() {
    const t = this.options.strength ?? 0.1;
    if (this.options.radial) {
      const e = Pt(
        (i) => (this.levels[i.id] ?? 1) * 100,
        0,
        0
      ).strength(t);
      this.simulation.force("tree-radial", e);
    } else
      this.simulation.force("tree-y", Bt((e) => {
        var i, n;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(e.id)) == null ? void 0 : i.x) ?? 0 : ((n = this.positionedNodesByID.get(e.id)) == null ? void 0 : n.y) ?? 0;
      }).strength(t)), this.simulation.force("tree-x", Ft((e) => {
        var i, n;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(e.id)) == null ? void 0 : i.y) ?? 0 : ((n = this.positionedNodesByID.get(e.id)) == null ? void 0 : n.x) ?? 0;
      }).strength(t));
    D.adjustOtherSimulationForces(this.simulationForces, this.options);
  }
  unregisterLayout() {
    this.unregisterForces(), this.unsetNodePositions();
  }
  unregisterForces() {
    this.simulation.force("tree-radial", null), this.simulation.force("tree-y", null), this.simulation.force("tree-x", null), D.resetOtherSimulationForces(this.simulationForces, this.originalForceStrength);
  }
  static registerForcesOnSimulation(t, e, i, n, r, s, o = this) {
    const d = j({}, ct, r), a = d.strength ?? 0.1, c = s.width, u = s.height, p = [c / 2, u / 2];
    if (Y(t, e))
      return;
    const { levels: g } = o.buildLevelsStatic(t, e, void 0, d.rootIdAlgorithmFinder), { nodeById: f } = o.buildTreeStatic(t, e, d, s);
    if (d.radial) {
      const m = Pt(
        (v) => (g[v.id] ?? 1) * 100,
        p[0],
        p[1]
      ).strength(a);
      i.force("tree-radial", m);
    } else
      i.force("tree-y", Bt((m) => {
        var v, y;
        return d.horizontal ? ((v = f.get(m.id)) == null ? void 0 : v.x) ?? 0 : ((y = f.get(m.id)) == null ? void 0 : y.y) ?? 0;
      }).strength(a)), i.force("tree-x", Ft((m) => {
        var v, y;
        return d.horizontal ? ((v = f.get(m.id)) == null ? void 0 : v.y) ?? 0 : ((y = f.get(m.id)) == null ? void 0 : y.x) ?? 0;
      }).strength(a));
    o.adjustOtherSimulationForces(n, d);
  }
  static adjustOtherSimulationForces(t, e) {
    e != null && e.radial ? (t.link.strength(0), t.charge.strength(0), t.gravity.strength(0)) : (t.link.strength(0), t.charge.strength(0), t.gravity.strength(1e-5));
  }
  static resetOtherSimulationForces(t, e) {
    t.link.strength(e.link), t.charge.strength(e.charge), t.gravity.strength(e.gravity);
  }
  static simulationDone(t, e, i, n) {
    const r = j({}, ct, n);
    for (const s of t)
      r.radial ? (s.fx = s.x, s.fy = s.y) : r.horizontal ? (s.fx = s.x, delete s.fy) : (s.fy = s.y, delete s.fx);
  }
  buildTree(t, e, i, n) {
    return D.buildTreeStatic(t, e, i, n);
  }
  static buildTreeStatic(t, e, i, n) {
    if (!t.length)
      return {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    if (Y(t, e))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const r = /* @__PURE__ */ new Map();
    for (const m of t) {
      const v = m;
      v.children = [], r.set(m.id, v);
    }
    for (const m of e) {
      const v = r.get(m.source.id), y = r.get(m.target.id);
      v && y && (v.children.push(y), y.parent = v);
    }
    const s = i.rootId || D.findRootId(t, e, i.rootIdAlgorithmFinder), o = r.get(s);
    if (!o)
      throw new Error(`Root node with id "${s}" not found.`);
    const d = i.radialGap, a = i.radial ? 2 * Math.PI : n.width, c = i.radial ? d : n.height, u = Yt();
    i.radial ? u.size([a, c]) : u.size([a, c]).separation((m, v) => {
      var x, w;
      const y = ((w = (x = m.parent) == null ? void 0 : x.children) == null ? void 0 : w.length) ?? 1;
      return m.parent === v.parent ? 1.5 / y : 1.5;
    });
    const p = Xt(o), g = u(p), f = /* @__PURE__ */ new Map();
    return g.descendants().forEach((m) => {
      f.set(m.data.id, m);
    }), {
      root: g,
      nodes: g.descendants(),
      nodeById: f
    };
  }
  buildLevels(t, e, i, n) {
    return D.buildLevelsStatic(t, e, i, n);
  }
  /**
   * Builds a mapping from node ID to its level (distance from the root),
   * by traversing the graph in BFS manner. If the graph contains cycles,
   * each node is assigned the shortest level found first.
   *
   * @param nodes - The list of graph nodes.
   * @param edges - The list of graph edges (assumed to be directed).
   * @param passedRootId - The ID of the node considered as the root.
   * @param rootIdAlgorithmFinder - The algorithm to use to find the root ID.
   * @returns A mapping of each node's ID to its depth level in the tree and the maximum depth
   */
  static buildLevelsStatic(t, e, i, n) {
    if (!t.length)
      return {
        levels: {},
        maxDepth: 0,
        nodeCountPerLevel: {}
      };
    const r = i || D.findRootId(t, e, n), s = { [r]: 0 }, o = {};
    for (const p of t)
      o[p.id] = [];
    for (const { source: p, target: g } of e)
      o[p.id].push(g.id);
    const d = [r];
    let a = 0;
    for (; a < d.length; ) {
      const p = d[a++], g = s[p];
      for (const f of o[p] || [])
        f in s || (s[f] = g + 1, d.push(f));
    }
    const c = Math.max(...Object.values(s)), u = {};
    for (const p of Object.values(s))
      u[p] = (u[p] || 0) + 1;
    return {
      levels: s,
      maxDepth: c,
      nodeCountPerLevel: u
    };
  }
  /**
   * Attempts to infer the root node of a directed graph.
   *
   * This function looks for a node that is never a target in the list of links,
   * assuming such a node is a likely root (i.e., has no incoming edges).
   * If no such node is found, it falls back to the first node in the list.
   *
   * @param nodes - The list of graph nodes.
   * @param edges - The list of graph edges (assumed to be directed).
   * @returns The ID of the inferred root node.
   */
  static findRootId(t, e, i) {
    switch (i) {
      case "FirstZeroInDegree":
        return zt(t, e).id;
      case "MaxReachability":
        return ai(t, e).id;
      case "MinMaxDistance":
        return li(t, e).id;
      case "MinHeight":
        return hi(t, e).id;
      default:
        return zt(t, e).id;
    }
  }
}
class rt extends D {
  constructor(t, e, i, n) {
    super(t, e, i, {
      ...n,
      type: "tree"
    });
  }
  static registerForcesOnSimulation(t, e, i, n, r, s) {
    D.registerForcesOnSimulation(
      t,
      e,
      i,
      n,
      r,
      s,
      rt
    );
  }
  buildTree(t, e, i, n) {
    return rt.buildTreeStatic(t, e, i, n);
  }
  static buildTreeStatic(t, e, i, n) {
    if (!t.length)
      return {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    if (Y(t, e))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const r = /* @__PURE__ */ new Map();
    for (const m of t) {
      const v = m;
      v.children = [], r.set(m.id, v);
    }
    if (!i.rootId || !r.get(i.rootId))
      throw new Error("Ego Tree can only be created with a rootId");
    const s = i.rootId, o = r.get(s);
    if (o.children = [], !o)
      throw new Error(`Root node with id "${s}" not found.`);
    for (const m of e) {
      const v = r.get(m.source.id), y = r.get(m.target.id);
      v && y && (m.source.id === o.id ? (o.children.push(y), y.parent = o) : m.target.id === o.id && (o.children.push(v), v.parent = o));
    }
    const d = i.radialGap, a = i.radial ? 2 * Math.PI : n.width, c = i.radial ? d : n.height, u = Yt();
    i.radial ? u.size([a, c]) : u.size([a, c]).separation((m, v) => {
      var x, w;
      const y = ((w = (x = m.parent) == null ? void 0 : x.children) == null ? void 0 : w.length) ?? 1;
      return m.parent === v.parent ? 1.5 / y : 1.5;
    });
    const p = Xt(o), g = u(p), f = /* @__PURE__ */ new Map();
    return g.descendants().forEach((m) => {
      f.set(m.data.id, m);
    }), {
      root: g,
      nodes: g.descendants(),
      nodeById: f
    };
  }
}
const R = {
  d3Alpha: 1,
  d3AlphaMin: 1e-3,
  d3AlphaDecay: 0.05,
  d3AlphaTarget: 0,
  d3VelocityDecay: 0.45,
  d3LinkDistance: 40,
  d3LinkStrength: null,
  d3ManyBodyStrength: -150,
  d3ManyBodyTheta: 0.9,
  d3CollideRadius: 12,
  d3CollideStrength: 1,
  d3CollideIterations: 1,
  d3GravityStrength: 0.1,
  enabled: !0,
  cooldownTime: 2e3,
  useWorker: !0,
  warmupTicks: "auto",
  freezeNodesOnDrag: !0,
  layout: {
    type: "force"
  },
  callbacks: {
    onInit: () => {
    },
    onStart: () => {
    },
    onStop: () => {
    },
    onTick: () => {
    }
  }
};
class G {
  constructor(t, e = {}) {
    h(this, "simulation");
    h(this, "graph");
    h(this, "canvas");
    h(this, "graphInteraction");
    h(this, "layout");
    h(this, "canvasBCR");
    h(this, "animationFrameId", null);
    h(this, "startSimulationTime", 0);
    h(this, "engineRunning", !1);
    h(this, "slowTickThresholdReached", !1);
    h(this, "lastTickTime", 0);
    h(this, "avgTickDuration", 0);
    h(this, "SLOW_TICK_THRESHOLD", 50);
    // ms (20fps budget)
    h(this, "dragInProgress", !1);
    h(this, "dragSelection", []);
    h(this, "totalTickCount", 0);
    h(this, "options");
    h(this, "callbacks");
    h(this, "simulationForces");
    h(this, "scaledForces", {
      d3ManyBodyStrength: R.d3ManyBodyStrength,
      d3CollideStrength: R.d3CollideStrength
    });
    if (this.graph = t, this.options = j({}, R, e), this.callbacks = this.options.callbacks ?? {}, this.canvas = this.graph.renderer.getCanvas(), !this.canvas) throw new Error("Canvas element is not defined in the graph renderer.");
    if (this.canvasBCR = this.canvas.getBoundingClientRect(), this.graphInteraction = this.graph.renderer.getGraphInteraction(), !this.graphInteraction) throw new Error("Graph interaction is not available.");
    const i = G.initSimulationForces(this.options, this.canvasBCR);
    this.simulation = i.simulation, this.simulationForces = i.simulationForces, this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength || R.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = this.options.d3CollideStrength || R.d3CollideStrength, this.options.layout.type === "tree" ? this.layout = new D(
      this.graph,
      this.simulation,
      this.simulationForces,
      this.options.layout
    ) : this.options.layout.type === "egoTree" && (this.layout = new rt(
      this.graph,
      this.simulation,
      this.simulationForces,
      this.options.layout
    )), this.callbacks.onInit && this.callbacks.onInit(this);
  }
  /** @private */
  static initSimulationForces(t, e) {
    const i = {
      link: ke(),
      charge: Ee(),
      collide: Se(),
      gravity: ni()
      // clusterRadialConstraint: ForceClusterRadial(),
    }, n = Ne().force("link", i.link).force("charge", i.charge).force("collide", i.collide).force("gravity", i.gravity);
    return this.initSimulationForceGravity(i.gravity, t, e), this.initSimulationForceLink(i.link, t), this.initSimulationForceCharge(i.charge, t), this.initSimulationForceCollide(i.collide, t), n.alphaMin(t.d3AlphaMin), n.alphaDecay(t.d3AlphaDecay), n.alphaTarget(0), n.velocityDecay(t.d3VelocityDecay), {
      simulation: n,
      simulationForces: i
    };
  }
  static initSimulationForceGravity(t, e, i) {
    t.x(i.width / 2).y(i.height / 2).strength((n) => (n.degree() ?? 0) === 0 ? e.d3GravityStrength : 1e-3);
  }
  static initSimulationForceLink(t, e) {
    t.distance((i) => {
      const n = te(i);
      if (!n || n === "")
        return e.d3LinkDistance;
      const r = n.length * 10;
      return Math.max(e.d3LinkDistance, r);
    }), e.d3LinkStrength && t.strength(e.d3LinkStrength);
  }
  static initSimulationForceCharge(t, e) {
    t.theta(e.d3ManyBodyTheta).strength((i) => {
      const n = i, r = e.d3ManyBodyStrength, s = n.getCircleRadius(), o = 10 + Math.sqrt(s - 10);
      let d = n.weight ?? 1;
      return d *= n.isParent ? 10 : 1, r * (o * o) / 100 * d;
    });
  }
  static initSimulationForceCollide(t, e) {
    t.radius((i) => {
      const n = i;
      return n.expanded ? 1.2 * n.getCircleRadius() + 20 : n.getCircleRadius() ? 1.2 * n.getCircleRadius() : e.d3CollideRadius;
    }).strength(e.d3CollideStrength);
  }
  static initSimulationForceClusterRadialConstraint(t, e) {
    t.strength(e.d3CollideStrength);
  }
  update() {
    this.layout && this.layout.update();
    const t = this.graph.getMutableNodes().filter((i) => i.visible);
    this.simulation.nodes(t);
    const e = this.simulation.force("link");
    e && e.id((i) => i.id).links(this.getActiveEdges()), this.restart();
  }
  /** @private */
  getActiveEdges() {
    const t = this.graph.getMutableEdges().filter((i) => {
      if (!i.visible) return !1;
      const n = i.source, r = i.target;
      return !(n.isChild || r.isChild);
    }), e = this.getClusterLinks();
    return [...t, ...e];
  }
  /** @private */
  getClusterLinks() {
    return this.graph.getMutableEdges().filter((e) => e.visible);
  }
  /** @private */
  scaleSimulationOptions() {
    const t = G.scaleSimulationOptions(this.options, this.canvasBCR, this.graph.getNodeCount());
    this.scaledForces.d3ManyBodyStrength = t.d3ManyBodyStrength ?? R.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = t.d3CollideStrength ?? R.d3CollideStrength;
  }
  /** @private */
  static scaleSimulationOptions(t, e, i) {
    const n = i / (e.width * e.height), r = Math.min(2, 75e-6 / n);
    return {
      d3ManyBodyStrength: t.d3ManyBodyStrength * r,
      d3CollideStrength: t.d3ManyBodyStrength * r
    };
  }
  /** @private */
  applyScalledSimulationOptions() {
    G.initSimulationForceCharge(this.simulationForces.charge, this.options), G.initSimulationForceCollide(this.simulationForces.collide, this.options);
  }
  enable() {
    this.avgTickDuration = 0, this.options.enabled = !0, this.start(!1);
  }
  disable() {
    this.options.enabled = !1, this.stop();
  }
  /**
   * Pause the simulation
   */
  pause() {
    this.engineRunning = !1, this.slowTickThresholdReached = !1;
  }
  /**
   * Restart the simulation with rendering on each animation frame.
   */
  restart() {
    this.startSimulationTime = (/* @__PURE__ */ new Date()).getTime(), this.lastTickTime = performance.now(), this.engineRunning = !0, this.slowTickThresholdReached = !1;
  }
  /**
   * Start the simulation with rendering on each animation frame.
   */
  async start(t = !0) {
    if (t && await this.runSimulationWorkerRouter(), !this.options.enabled) {
      this.engineRunning = !1;
      return;
    }
    this.lastTickTime = performance.now(), this.engineRunning = !0, this.slowTickThresholdReached = !1, this.callbacks.onStart && this.callbacks.onStart(this), this.animationFrameId === null && this.startAnimationLoop();
  }
  /**
   * Manually stop the simulation and cancel animation frame.
   */
  stop() {
    this.engineRunning = !1, this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.simulation.stop(), this.callbacks.onStop && this.callbacks.onStop(this);
  }
  /**
   * Start the simulation loop with rendering on each animation frame.
   */
  startAnimationLoop() {
    const t = () => {
      this.animationFrameId = requestAnimationFrame(t), this.simulationTick();
    };
    this.engineRunning = !0, this.simulation.alpha(0.01).restart(), this.animationFrameId = requestAnimationFrame(t);
  }
  /**
   * Evaluate at each tick to update the simulation state and request rendering
   */
  simulationTick() {
    this.engineRunning && (!this.dragInProgress && ((/* @__PURE__ */ new Date()).getTime() - this.startSimulationTime > this.options.cooldownTime || this.options.d3AlphaMin > 0 && this.simulation.alpha() < this.options.d3AlphaMin) && (this.engineRunning = !1, this.simulation.stop(), this.callbacks.onStop && this.callbacks.onStop(this)), this.totalTickCount++, this.updateTickMetrics(), this.simulation.tick(), this.graph.nextTick(), this.callbacks.onTick && this.callbacks.onTick(this), this.graphInteraction.simulationTick(), this.totalTickCount % 10 === 0 && this.graphInteraction.simulationSlowTick());
  }
  updateTickMetrics() {
    var i;
    const t = performance.now(), e = t - this.lastTickTime;
    this.lastTickTime = t, this.avgTickDuration = this.avgTickDuration * 0.9 + e * 0.1, this.avgTickDuration > this.SLOW_TICK_THRESHOLD && (this.slowTickThresholdReached = !0, this.disable(), (i = this.graph.UIManager.graphControls) == null || i.updatePhysicSimulationIndicator(!1), this.graph.UIManager.showNotification({
      level: "warning",
      title: "Physics engine running slow",
      message: "The physic has been disabled."
    }));
  }
  /**
   * Returns a promise that resolves when the simulation stops naturally.
   * Useful for performing actions (like fitAndCenter) after stabilization.
   */
  async waitForSimulationStop() {
    if (this.engineRunning)
      return new Promise((t) => {
        const e = this.callbacks.onStop;
        this.callbacks.onStop = (i) => {
          e == null || e(i), this.callbacks.onStop = e, t();
        };
      });
  }
  isEnabled() {
    return this.options.enabled;
  }
  async computeGraph(t = {}) {
    var c;
    const { runSimulation: e } = await import("./SimulationWorker-BQcw9ZV7.js"), i = (c = this.canvas) == null ? void 0 : c.getBoundingClientRect();
    if (!i) return;
    const n = this.graph.getMutableNodes(), r = this.graph.getNodes().map((u) => (u.fx = void 0, u.fy = void 0, u)), s = this.graph.getEdges(), { callbacks: o, ...d } = this.options;
    Object.assign(d, t);
    const { nodes: a } = e(
      r,
      s,
      d,
      i
    );
    a.forEach((u, p) => {
      n[p].x = u.x, n[p].y = u.y, u.fx ? n[p].fx = u.fx : n[p].fx = void 0, u.fy ? n[p].fy = u.fy : n[p].fy = void 0;
    }), this.graph.updateData(n, void 0, !1);
  }
  async runSimulationWorkerRouter(t = {}) {
    this.options.useWorker ? await this.runSimulationWorker(t) : (await this.computeGraph(t), this.graph.updateLayoutProgress(100, 0, "done"));
  }
  async runSimulationWorker(t = {}) {
    var c;
    const e = (c = this.canvas) == null ? void 0 : c.getBoundingClientRect();
    if (!e) return;
    const i = this.graph.getMutableNodes(), n = this.graph.getNodes().map((u) => (u.fx = void 0, u.fy = void 0, u)), r = this.graph.getEdges(), s = (u, p) => {
      this.graph.updateLayoutProgress(u, p, "simulation");
    }, { callbacks: o, ...d } = this.options;
    Object.assign(d, t);
    const { nodes: a } = await oi(
      n,
      r,
      d,
      e,
      s
    );
    this.graph.updateLayoutProgress(100, 0, "rendering"), a.forEach((u, p) => {
      i[p].x = u.x, i[p].y = u.y, u.fx ? i[p].fx = u.fx : i[p].fx = void 0, u.fy ? i[p].fy = u.fy : i[p].fy = void 0;
    }), this.graph.updateData(i, void 0, !1), this.graph.updateLayoutProgress(100, 0, "done");
  }
  /**
   * Restart the simulation with a bit of heat
   */
  reheat(t = 0.7) {
    this.restart(), this.simulation.alpha(t).restart();
  }
  /**
   * @private
   */
  createDragBehavior() {
    return Ce().on("start.draggedelement", (t, e) => {
      this.graphInteraction.hasActiveMultiselection() ? this.dragSelection = this.graphInteraction.getSelectedNodes().map((i) => {
        const { node: n } = i;
        return n.freeze(), {
          node: n,
          dx: n.x - e.x,
          dy: n.y - e.y
        };
      }) : (this.dragSelection = [], e.freeze());
    }).on("drag.draggedelement", (t, e) => {
      if (!this.dragInProgress && this.isEnabled() && (this.dragInProgress = !0, this.restart(), this.simulation.alphaTarget(0.3).restart()), this.graphInteraction.hasActiveMultiselection() ? this.dragSelection.forEach(({ node: i, dx: n, dy: r }) => {
        i.fx = t.x + n, i.fy = t.y + r, i.x = t.x + n, i.y = t.y + r;
      }) : (e.fx = t.x, e.fy = t.y, e.x = t.x, e.y = t.y), this.graphInteraction.dragging(t.sourceEvent, t.subject), !this.engineRunning || !this.isEnabled()) {
        const i = this.graphInteraction.hasActiveMultiselection() ? this.dragSelection.map((n) => n.node) : [e];
        this.graph.nextTickFor(i);
      }
    }).on("end.draggedelement", (t, e) => {
      !t.active && this.dragInProgress && (this.dragInProgress = !1, this.restart(), this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()), this.options.freezeNodesOnDrag || (this.graphInteraction.hasActiveMultiselection() ? (this.dragSelection.forEach(({ node: i }) => i.unfreeze()), this.dragSelection = []) : e.unfreeze()), this.graphInteraction.dragended(t.sourceEvent, t.subject);
    });
  }
  isDragging() {
    return this.dragInProgress;
  }
  getForceSimulation() {
    return this.simulationForces;
  }
  getSimulation() {
    return this.simulation;
  }
  /**
   * Allows to change the layout of the graph
   * 
   * @example
   * ```ts
   * changeLayout('tree', {
   *     layout: {
   *          horizontal: false,
   *          rootIdAlgorithmFinder: 'FirstZeroInDegree'
   *     }
   * })
   * ```
   */
  async changeLayout(t, e = {}) {
    var i;
    this.layout && ((i = this.layout) == null || i.unregisterLayout(), this.layout = void 0), e = e ?? {}, e.layout = e.layout ?? {}, e.layout.type = t, t === "force" ? this.applyScalledSimulationOptions() : t === "tree" && (this.layout = new D(this.graph, this.simulation, this.simulationForces, e.layout)), this.options.layout.type = t, this.update(), this.pause(), await this.runSimulationWorkerRouter(e), this.restart(), await this.waitForSimulationStop(), this.graph.renderer.fitAndCenter();
  }
}
const ci = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 3a3 3 0 0 1 2.995 2.824L21 6v12a3 3 0 0 1-2.824 2.995L18 21H6a3 3 0 0 1-2.995-2.824L3 18V6a3 3 0 0 1 2.824-2.995L6 3zm0 2H9v14h9a1 1 0 0 0 .993-.883L19 18V6a1 1 0 0 0-.883-.993zm-4.387 4.21l.094.083l2 2a1 1 0 0 1 .083 1.32l-.083.094l-2 2a1 1 0 0 1-1.497-1.32l.083-.094L13.585 12l-1.292-1.293a1 1 0 0 1-.083-1.32l.083-.094a1 1 0 0 1 1.32-.083"/></svg>', di = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 3a3 3 0 0 1 2.995 2.824L21 6v12a3 3 0 0 1-2.824 2.995L18 21H6a3 3 0 0 1-2.995-2.824L3 18V6a3 3 0 0 1 2.824-2.995L6 3zm-3 2H6a1 1 0 0 0-.993.883L5 6v12a1 1 0 0 0 .883.993L6 19h9zm-3.293 4.293a1 1 0 0 1 .083 1.32l-.083.094L10.415 12l1.292 1.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083l-2-2a1 1 0 0 1-.083-1.32l.083-.094l2-2a1 1 0 0 1 1.414 0"/></svg>', ui = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M13 3.5v3a.5.5 0 0 1-1 0V4.71L9.85 6.86a.5.5 0 0 1-.707-.707l2.15-2.15h-1.79a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .351.144l.004.004a.5.5 0 0 1 .144.348v.004zM3.5 9a.5.5 0 0 1 .5.5v1.79l2.15-2.15a.5.5 0 0 1 .707.707l-2.15 2.15h1.79a.5.5 0 0 1 0 1H3.494a.5.5 0 0 1-.497-.499v-3a.5.5 0 0 1 .5-.5z"/><path fill="currentColor" fill-rule="evenodd" d="M0 4.8c0-1.68 0-2.52.327-3.16A3.02 3.02 0 0 1 1.637.33c.642-.327 1.48-.327 3.16-.327h6.4c1.68 0 2.52 0 3.16.327a3.02 3.02 0 0 1 1.31 1.31c.327.642.327 1.48.327 3.16v6.4c0 1.68 0 2.52-.327 3.16a3 3 0 0 1-1.31 1.31c-.642.327-1.48.327-3.16.327h-6.4c-1.68 0-2.52 0-3.16-.327a3 3 0 0 1-1.31-1.31C0 13.718 0 12.88 0 11.2zM4.8 1h6.4c.857 0 1.44 0 1.89.038c.438.035.663.1.819.18c.376.192.682.498.874.874c.08.156.145.38.18.819c.037.45.038 1.03.038 1.89v6.4c0 .857-.001 1.44-.038 1.89c-.036.438-.101.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.381.145-.819.18c-.45.036-1.03.037-1.89.037H4.8c-.857 0-1.44 0-1.89-.037c-.438-.036-.663-.101-.819-.18a2 2 0 0 1-.874-.874c-.08-.156-.145-.381-.18-.82C1 12.64.999 12.06.999 11.2V4.8c0-.856.001-1.44.038-1.89c.036-.437.101-.662.18-.818c.192-.376.498-.682.874-.874c.156-.08.381-.145.819-.18C3.36 1 3.94 1 4.8 1" clip-rule="evenodd"/></svg>', pi = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 1.5a.5.5 0 0 0-.5-.5H4.2c-1.12 0-1.68 0-2.11.218a2 2 0 0 0-.874.874c-.218.428-.218.988-.218 2.11v3.3a.5.5 0 0 0 1 0v-3.3c0-.577 0-.949.024-1.23c.022-.272.06-.372.085-.422c.096-.188.249-.341.437-.437c.05-.025.15-.063.422-.085c.283-.023.656-.024 1.23-.024h3.3a.5.5 0 0 0 .5-.5zm7 10.3V8.5a.5.5 0 0 0-1 0v3.3c0 .577 0 .949-.024 1.23c-.022.272-.06.372-.085.422a1 1 0 0 1-.437.437c-.05.025-.15.063-.422.085c-.283.023-.656.024-1.23.024h-3.3a.5.5 0 0 0 0 1h3.3c1.12 0 1.68 0 2.11-.218c.376-.192.682-.498.874-.874c.218-.428.218-.988.218-2.11zM6.85 9.15a.5.5 0 0 1 .147.35v3.003a.5.5 0 0 1-1 0v-1.79l-4.15 4.15a.5.5 0 0 1-.707-.707l4.15-4.15H3.5a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .191.038q.09.036.162.11zM10.7 6l4.15-4.15a.5.5 0 0 0-.707-.707l-4.15 4.15v-1.79a.5.5 0 0 0-1 0v3.003a.5.5 0 0 0 .309.46a.5.5 0 0 0 .19.037h3a.5.5 0 0 0 0-1h-1.79z"/></svg>', gi = '<svg width="4.2333331mm" height="3.96875mm" viewBox="0 0 4.2333331 3.96875" version="1.1" id="svg1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <defs id="defs1" /> <g id="layer1" transform="translate(-132.29166,-106.89167)"> <path fill="currentColor" fill-rule="evenodd" d="m 132.57451,108.09552 a 0.66066458,0.66066458 0 0 0 1.04007,-0.54239 0.66145833,0.66145833 0 1 0 -1.04007,0.54239 m 0.37861,-0.27781 a 0.264585,0.264585 0 1 0 0,-0.52917 0.264585,0.264585 0 0 0 0,0.52917 m 2.91042,0.39687 a 0.66066458,0.66066458 0 0 1 -0.66146,-0.66145 0.66145833,0.66145833 0 1 1 0.66146,0.66145 m 0.26458,-0.66145 a 0.26458333,0.26458333 0 1 1 -0.52916,0 0.26458333,0.26458333 0 0 1 0.52916,0 m -2.2307,1.33614 a 0.66066458,0.66066458 0 0 0 1.04008,-0.54239 0.66145833,0.66145833 0 1 0 -1.04008,0.54239 m 0.37862,-0.27781 a 0.264585,0.264585 0 1 0 0,-0.52917 0.264585,0.264585 0 0 0 0,0.52917 m 1.19063,1.71979 a 0.66066458,0.66066458 0 0 1 -0.66146,-0.66146 0.66145833,0.66145833 0 1 1 0.66146,0.66146 m 0.26458,-0.66146 a 0.264585,0.264585 0 1 1 -0.52917,0 0.264585,0.264585 0 0 1 0.52917,0 m -2.24896,1.19063 a 0.66066458,0.66066458 0 0 1 -0.66146,-0.66146 0.66145833,0.66145833 0 1 1 0.66146,0.66146 m 0.26458,-0.66146 a 0.26458333,0.26458333 0 1 1 -0.52916,0 0.26458333,0.26458333 0 0 1 0.52916,0" clip-rule="evenodd" id="path1" style="stroke-width:0.264583" /> <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.529167" d="m 133.06292,108.11741 0.25132,1.51998 m 0.7969,-0.73919 -0.3281,0.80361 m 1.57769,-1.87938 -0.59147,0.26106 m 0.35159,1.16811 -0.45978,-0.53433" id="path1-6" /> </g> </svg>', fi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 20a2 2 0 1 0-4 0a2 2 0 0 0 4 0M16 4a2 2 0 1 0-4 0a2 2 0 0 0 4 0m0 16a2 2 0 1 0-4 0a2 2 0 0 0 4 0m-5-8a2 2 0 1 0-4 0a2 2 0 0 0 4 0m10 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0M5.058 18.306l2.88-4.606m2.123-3.397l2.877-4.604m-2.873 8.006l2.876 4.6M15.063 5.7l2.881 4.61" />
</svg>`, mi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="transform: rotate(-90deg);">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 20a2 2 0 1 0-4 0a2 2 0 0 0 4 0M16 4a2 2 0 1 0-4 0a2 2 0 0 0 4 0m0 16a2 2 0 1 0-4 0a2 2 0 0 0 4 0m-5-8a2 2 0 1 0-4 0a2 2 0 0 0 4 0m10 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0M5.058 18.306l2.88-4.606m2.123-3.397l2.877-4.604m-2.873 8.006l2.876 4.6M15.063 5.7l2.881 4.61" />
</svg>`, vi = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19a2 2 0 1 0-4 0a2 2 0 0 0 4 0m8-14a2 2 0 1 0-4 0a2 2 0 0 0 4 0m-8 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0m-4 7a2 2 0 1 0-4 0a2 2 0 0 0 4 0m12 7a2 2 0 1 0-4 0a2 2 0 0 0 4 0m-4-7a2 2 0 1 0-4 0a2 2 0 0 0 4 0m8 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0M6 12h4m4 0h4m-3-5l-2 3M9 7l2 3m0 4l-2 3m4-3l2 3" />
</svg>`, yi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 15h2a1.5 1.5 0 0 0 0-3h-2V9h3.5M3 12v.01M21 12v.01M12 21v.01M7.5 4.2v.01m9 15.59v.01m-9-.01v.01M4.2 16.5v.01m15.6-.01v.01m0-9.01v.01M4.2 7.5v.01m12.3-3.304A9.04 9.04 0 0 0 12 3"/></svg>', bi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9v6m3-4v2a2 2 0 1 0 4 0v-2a2 2 0 1 0-4 0m-9 1v.01M21 12v.01M12 21v.01M7.5 4.2v.01m9 15.59v.01m-9-.01v.01M4.2 16.5v.01m15.6-.01v.01M4.2 7.5v.01m15.61.017A9 9 0 0 0 12 3"/></svg>', xi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15h2a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-2V9h3M9 9v6m-6-3v.01M12 21v.01M7.5 4.2v.01m9 15.59v.01m-9-.01v.01M4.2 16.5v.01m15.6-.01v.01M4.2 7.5v.01M21 12a9 9 0 0 0-9-9"/></svg>', dt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20"><path fill="currentColor" d="M15.72 2.22a.75.75 0 1 1 1.06 1.06l-.97.97l.97.97a.75.75 0 0 1-1.06 1.06l-1.5-1.5a.75.75 0 0 1 0-1.06zM3.75 3.5h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5m12.5 10a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5zM3.75 10h12.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5"/></svg>', ut = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M10 15h12v2H10zM8.7 6.285A3 3 0 0 0 9 5a3 3 0 1 0-3 3a2.96 2.96 0 0 0 1.285-.3L10 10.413V13h2V9.586zM6 6a1 1 0 1 1 1-1a1 1 0 0 1-1 1m13-1a3 3 0 1 0-4 2.815V13h2V7.816A3 3 0 0 0 19 5m-3 1a1 1 0 1 1 1-1a1 1 0 0 1-1 1m10-4a3.003 3.003 0 0 0-3 3a3 3 0 0 0 .3 1.285l-3.3 3.3V13h2v-2.586L24.715 7.7A2.96 2.96 0 0 0 26 8a3 3 0 0 0 0-6m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1M12 19h-2v2.586L7.285 24.3A2.96 2.96 0 0 0 6 24a3 3 0 1 0 3 3a3 3 0 0 0-.3-1.285l3.3-3.3zm-6 9a1 1 0 1 1 1-1a1 1 0 0 1-1 1m11-3.816V19h-2v5.184a3 3 0 1 0 2 0M16 28a1 1 0 1 1 1-1a1 1 0 0 1-1 1m10-4a2.96 2.96 0 0 0-1.285.3L22 21.587V19h-2v3.414l3.3 3.3A3 3 0 0 0 23 27a3 3 0 1 0 3-3m0 4a1 1 0 1 1 1-1a1 1 0 0 1-1 1"/></svg>', pt = '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 640 512"><path fill="currentColor" d="M519.8 62.4c16.8-5.6 25.8-23.7 20.2-40.5S516.3-3.9 499.6 1.6l-113 37.7C372.7 15.8 347 0 317.7 0c-44.2 0-80 35.8-80 80c0 3 .2 5.9.5 8.8l-122.6 40.8c-16.8 5.6-25.8 23.7-20.2 40.5s23.7 25.8 40.5 20.2l135.5-45.2c4.5 3.2 9.3 5.9 14.4 8.2V480c0 17.7 14.3 32 32 32h192c17.7 0 32-14.3 32-32s-14.3-32-32-32h-160V153.3c21-9.2 37.2-27 44.2-49l125.9-42zM437.3 288l72.4-124.2L582.1 288H437.2zm72.4 96c62.9 0 115.2-34 126-78.9c2.6-11-1-22.3-6.7-32.1l-95.2-163.2c-5-8.6-14.2-13.8-24.1-13.8s-19.1 5.3-24.1 13.8l-95.2 163.3c-5.7 9.8-9.3 21.1-6.7 32.1c10.8 44.8 63.1 78.9 126 78.9zm-382.9-92.2L199.2 416H54.3l72.4-124.2zM.9 433.1C11.7 478 64 512 126.8 512s115.2-34 126-78.9c2.6-11-1-22.3-6.7-32.1l-95.2-163.2c-5-8.6-14.2-13.8-24.1-13.8s-19.1 5.3-24.1 13.8L7.6 401.1c-5.7 9.8-9.3 21.1-6.7 32.1z"/></svg>', gt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m16.957 10.207l2.5-2.5a1 1 0 0 0-1.414-1.414l-.793.793V4a1 1 0 1 0-2 0v3.086l-.793-.793a1 1 0 1 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0M4 6.5A2.5 2.5 0 0 1 6.5 4h4a1 1 0 1 1 0 2h-4a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h4a1 1 0 1 1 0 2h-4A2.5 2.5 0 0 1 4 17.5zm15.457 9.793l-2.5-2.5a1 1 0 0 0-1.414 0l-2.5 2.5a1 1 0 0 0 1.414 1.414l.793-.793V20a1 1 0 1 0 2 0v-3.086l.793.793a1 1 0 0 0 1.414-1.414"/></svg>', ft = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill="currentColor" d="m0 15l6-5l-6-4.9zm9-4.9l6 4.9V5zm5 2.8l-3.4-2.8l3.4-3zM7 5h1v1H7zm0-2h1v1H7zm0 4h1v1H7zm0 2h1v1H7zm0 2h1v1H7zm0 2h1v1H7zm0 2h1v1H7z"/><path fill="currentColor" d="M7.5 1c1.3 0 2.6.7 3.6 1.9L10 4h3V1l-1.2 1.2C10.6.8 9.1 0 7.5 0C5.6 0 3.9 1 2.6 2.9l.8.6C4.5 1.9 5.9 1 7.5 1"/></svg>', mt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="currentColor" d="M24.23 11.71a39 39 0 0 0-4.57-3.92a23 23 0 0 1 3.48-1.72c.32-.12.62-.21.92-.3a2.28 2.28 0 0 0 3.81-.46a3.3 3.3 0 0 1 1.92.84c1.19 1.19 1.22 3.59.1 6.58c.49.65.94 1.31 1.35 2c.17-.4.35-.79.49-1.18c1.47-3.85 1.28-7-.53-8.78a5.3 5.3 0 0 0-3.33-1.44a2.29 2.29 0 0 0-4.31.54c-.37.11-.74.22-1.13.37a26 26 0 0 0-4.57 2.35a26 26 0 0 0-4.58-2.39c-3.85-1.46-7-1.28-8.77.53c-1.66 1.67-1.93 4.44-.83 7.86a2.28 2.28 0 0 0 1.59 3.67c.32.61.67 1.22 1.06 1.82A25.5 25.5 0 0 0 4 22.66c-1.47 3.84-1.28 7 .53 8.77a5.63 5.63 0 0 0 4.12 1.51a13.3 13.3 0 0 0 4.65-1a26 26 0 0 0 4.58-2.35A26 26 0 0 0 22.43 32a14.2 14.2 0 0 0 3.65.9a2.3 2.3 0 0 0 4.38-.9a4.6 4.6 0 0 0 .74-.57c1.81-1.81 2-4.93.53-8.77a32.7 32.7 0 0 0-7.5-10.95M12.57 30.09c-3 1.15-5.45 1.13-6.65-.08s-1.23-3.62-.07-6.64a23 23 0 0 1 1.71-3.48a40 40 0 0 0 3.92 4.56c.43.43.87.85 1.31 1.25q.9-.46 1.83-1.05c-.58-.52-1.16-1-1.72-1.61a34 34 0 0 1-5.74-7.47a2.29 2.29 0 0 0-1.66-3.88c-.75-2.5-.62-4.49.43-5.54a3.72 3.72 0 0 1 2.72-.92a11.4 11.4 0 0 1 3.93.84a23 23 0 0 1 3.48 1.72a39 39 0 0 0-4.57 3.92c-.44.44-.87.9-1.29 1.36a20 20 0 0 0 1 1.85c.54-.61 1.09-1.21 1.68-1.8a36.3 36.3 0 0 1 5-4.17a37 37 0 0 1 4.95 4.17a36.3 36.3 0 0 1 4.17 5a37 37 0 0 1-4.17 5a30.7 30.7 0 0 1-10.26 6.97M29.79 30l-.16.13a2.27 2.27 0 0 0-3.5.72a12.6 12.6 0 0 1-3-.77a22 22 0 0 1-3.48-1.72a39 39 0 0 0 4.57-3.92a38 38 0 0 0 3.92-4.56a23 23 0 0 1 1.72 3.48C31 26.39 31 28.81 29.79 30" class="clr-i-solid clr-i-solid-path-1"/><circle cx="17.99" cy="18.07" r="3.3" fill="currentColor" transform="rotate(-9.22 17.955 18.05)"/><path fill="none" d="M0 0h36v36H0z"/></svg>', Ht = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path d="M25.837 2.03a2.29 2.29 0 0 0-2.276 1.84c-.37.11-.741.22-1.131.37a26 26 0 0 0-4.57 2.349A26 26 0 0 0 13.28 4.2C10.806 3.263 8.62 3 6.905 3.413l1.82 1.82a11.4 11.4 0 0 1 3.855.837 23 23 0 0 1 3.48 1.72 39 39 0 0 0-2.654 2.124l1.41 1.41A36.3 36.3 0 0 1 17.88 8.95a37 37 0 0 1 4.951 4.17 36.3 36.3 0 0 1 4.169 5 37 37 0 0 1-2.353 3.038l1.372 1.368a38 38 0 0 0 2.12-2.645 23 23 0 0 1 1.72 3.48c.545 1.447.83 2.752.847 3.853v.003l1.81 1.807c.42-1.718.162-3.89-.785-6.363a32.7 32.7 0 0 0-7.5-10.951 39 39 0 0 0-4.57-3.92 23 23 0 0 1 3.478-1.72c.32-.12.62-.211.92-.301a2.28 2.28 0 0 0 3.811-.46 3.3 3.3 0 0 1 1.92.84c1.19 1.19 1.219 3.59.099 6.58.49.65.94 1.311 1.35 2.001.17-.4.352-.79.492-1.18 1.47-3.85 1.28-7-.53-8.78a5.3 5.3 0 0 0-3.33-1.439 2.29 2.29 0 0 0-2.034-1.3ZM4.195 5.08C2.82 6.774 2.653 9.397 3.68 12.59a2.28 2.28 0 0 0 1.59 3.67c.32.61.671 1.22 1.061 1.82A25.5 25.5 0 0 0 4 22.661c-1.47 3.84-1.28 6.999.53 8.769a5.63 5.63 0 0 0 4.122 1.511 13.3 13.3 0 0 0 4.65-1.002 26 26 0 0 0 4.579-2.35 26 26 0 0 0 4.55 2.412 14.2 14.2 0 0 0 3.65.9 2.3 2.3 0 0 0 4.38-.9 4.6 4.6 0 0 0 .39-.27l-2.048-2.047a2.27 2.27 0 0 0-2.672 1.166 12.6 12.6 0 0 1-3-.77 22 22 0 0 1-3.48-1.72 39 39 0 0 0 4.236-3.59l-1.35-1.353a30.7 30.7 0 0 1-9.965 6.674c-3 1.15-5.45 1.128-6.65-.082-1.2-1.21-1.23-3.619-.07-6.639a23 23 0 0 1 1.708-3.48 40 40 0 0 0 3.922 4.561c.43.43.87.848 1.31 1.248.6-.306 1.208-.655 1.828-1.049-.58-.52-1.16-1-1.72-1.61A34 34 0 0 1 7.16 15.57 2.29 2.29 0 0 0 5.5 11.69c-.67-2.236-.634-4.061.132-5.173v-.003zm6.967 6.964c-.326.336-.646.68-.96 1.025a20 20 0 0 0 .998 1.852c.442-.499.891-.991 1.363-1.477z" fill="currentColor" /><circle cx="14.866" cy="20.714" r="3.3" fill="currentColor" transform="rotate(-9.22)"/><path fill="none" d="M0 0h36v36H0Z"/><path fill="currentColor" d="m.147 5.402 3.926 3.926L25.645 30.9l5.028 5.027 2.186-2.186L2.334 3.216" style="stroke-width:1.72169"/></svg>', ne = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"/></svg>', re = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12zm3 5h3v-3h2v3h3v2h-3v3h-2v-3h-3z"/></svg>', wi = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path fill="currentColor" d="M5.655 2.639a.5.5 0 0 0 .69.723l1.313-1.254a.5.5 0 0 1 .691.001l1.305 1.252a.5.5 0 0 0 .692-.721L9.042 1.388a1.5 1.5 0 0 0-2.075-.003zM3.362 6.346a.5.5 0 1 0-.723-.69L1.388 6.963a1.5 1.5 0 0 0 0 2.073l1.251 1.31a.5.5 0 0 0 .723-.691l-1.251-1.31a.5.5 0 0 1 0-.69zm2.984 6.293a.5.5 0 0 0-.691.723l1.314 1.256a1.5 1.5 0 0 0 2.077-.004l1.301-1.254a.5.5 0 1 0-.694-.72l-1.3 1.254a.5.5 0 0 1-.693.001zm7.015-6.985a.5.5 0 1 0-.722.693l1.258 1.31a.5.5 0 0 1 0 .693L12.64 9.654a.5.5 0 1 0 .72.694l1.257-1.304a1.5 1.5 0 0 0 .001-2.08zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5z" />
</svg>`, Ci = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
    <path fill="currentColor" d="M18 10h-4V6a2 2 0 0 0-4 0l.071 4H6a2 2 0 0 0 0 4l4.071-.071L10 18a2 2 0 0 0 4 0v-4.071L18 14a2 2 0 0 0 0-4" />
</svg>`, Mi = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path fill="currentColor" fill-rule="evenodd" d="M2 8a1 1 0 0 1 1-1h10a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1" clip-rule="evenodd" />
</svg>`, st = (l) => `<svg xmlns="http://www.w3.org/2000/svg" width="${l ?? 24}" height="${l ?? 24}" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 1px #00000033);">
    <g fill="none" stroke="currentColor" stroke-width="1.5">
        <path stroke-linejoin="round" d="M8 6h1.78c2.017 0 3.025 0 3.534.241a2.5 2.5 0 0 1 1.211 3.276c-.229.515-.994 1.17-2.525 2.483c-1.53 1.312-2.296 1.968-2.525 2.483a2.5 2.5 0 0 0 1.211 3.276c.51.241 1.517.241 3.534.241H16" />
        <path d="M2 6a3 3 0 1 0 6 0a3 3 0 0 0-6 0Zm14 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0Z" />
    </g>
</svg>`, se = (l) => `<svg xmlns="http://www.w3.org/2000/svg" width="${l}" height="${l}" viewBox="0 0 256 256" ><g fill="currentColor"><path d="M216 40v176H40V40Z" opacity="0.2"/><path d="M152 40a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-8 168h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m64-176h-24a8 8 0 0 0 0 16h24v24a8 8 0 0 0 16 0V48a16 16 0 0 0-16-16m8 72a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m0 72a8 8 0 0 0-8 8v24h-24a8 8 0 0 0 0 16h24a16 16 0 0 0 16-16v-24a8 8 0 0 0-8-8M40 152a8 8 0 0 0 8-8v-32a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 56H48v-24a8 8 0 0 0-16 0v24a16 16 0 0 0 16 16h24a8 8 0 0 0 0-16m0-176H48a16 16 0 0 0-16 16v24a8 8 0 0 0 16 0V48h24a8 8 0 0 0 0-16"/></g></svg>`, Si = '<svg width="16" height="16"viewBox="0 0 3.4393651 3.7032704" version="1.1" id="svg1" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"> <defs id="defs1" /> <g id="layer1" transform="translate(-128.32315,-97.896729)" fill="currentColor"> <path id="path1" d="m 130.91707,97.898417 a 0.79375,0.79375 0 0 0 -0.71416,0.999939 l -0.51729,0.296106 a 0.79375,0.79375 0 1 0 0,1.107428 l 0.51729,0.29559 a 0.79454375,0.79454375 0 0 0 0.76584,1.00252 0.79375,0.79375 0 1 0 -0.56896,-1.3472 l -0.51728,-0.296111 a 0.79375,0.79375 0 0 0 0,-0.417545 l 0.51728,-0.296106 a 0.79375,0.79375 0 0 0 1.36271,-0.553455 0.79375,0.79375 0 0 0 -0.84543,-0.791166 z m 0.0517,0.394291 a 0.396875,0.396875 0 0 1 0,0.79375 0.396875,0.396875 0 1 1 0,-0.79375 z m 0,2.116662 a 0.396875,0.396875 0 0 1 0,0.79375 0.396875,0.396875 0 0 1 0,-0.79375 z" /> </g> </svg> ', oe = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
</svg>`, ae = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path fill="currentColor" d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5z" />
</svg>`, Ei = '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><path fill="currentColor" d="M227.73 66.85L160 139.17v55.49a16 16 0 0 1-7.13 13.34l-32 21.34A16 16 0 0 1 96 216v-76.83L28.27 66.85l-.08-.09A16 16 0 0 1 40 40h176a16 16 0 0 1 11.84 26.76ZM227.31 192l18.35-18.34a8 8 0 0 0-11.32-11.32L216 180.69l-18.34-18.35a8 8 0 0 0-11.32 11.32L204.69 192l-18.35 18.34a8 8 0 0 0 11.32 11.32L216 203.31l18.34 18.35a8 8 0 0 0 11.32-11.32Z"/></svg>', ki = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
        <path d="M11.272 36.728A17.94 17.94 0 0 0 24 42c9.941 0 18-8.059 18-18S33.941 6 24 6c-4.97 0-9.47 2.015-12.728 5.272C9.614 12.93 6 17 6 17" />
        <path d="M6 9v8h8" />
    </g>
</svg>`, Ni = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48" style="transform: scaleX(-1); transform-origin: center;">
    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
        <path d="M11.272 36.728A17.94 17.94 0 0 0 24 42c9.941 0 18-8.059 18-18S33.941 6 24 6c-4.97 0-9.47 2.015-12.728 5.272C9.614 12.93 6 17 6 17" />
        <path d="M6 9v8h8" />
    </g>
</svg>`, _i = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13 20h-2V8l-5.5 5.5l-1.42-1.42L12 4.16l7.92 7.92l-1.42 1.42L13 8z"/></svg>', Ii = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 4h2v12l5.5-5.5l1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5L11 16z"/></svg>', Ai = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4l4 4"/></svg>', Ti = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0l-4 4m4-4l-4-4"/></svg>', Li = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.75 5.623V9.52a4 4 0 0 1-4 4H3.871m4.236 4.857L4.31 14.58a1.5 1.5 0 0 1-.44-1.061m4.236-4.857L4.31 12.46c-.293.293-.44.677-.44 1.061"/></svg>', Di = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M2 7.75A.75.75 0 0 1 2.75 7h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 2 7.75"/></svg>', $ = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m15.113 3.21l.094.083l5.5 5.5a1 1 0 0 1-1.175 1.59l-3.172 3.171l-1.424 3.797a1 1 0 0 1-.158.277l-.07.08l-1.5 1.5a1 1 0 0 1-1.32.082l-.095-.083L9 16.415l-3.793 3.792a1 1 0 0 1-1.497-1.32l.083-.094L7.585 15l-2.792-2.793a1 1 0 0 1-.083-1.32l.083-.094l1.5-1.5a1 1 0 0 1 .258-.187l.098-.042l3.796-1.425l3.171-3.17a1 1 0 0 1 1.497-1.26z"/></svg>', It = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m20.971 17.172l-1.414 1.414l-3.535-3.535l-.073.074l-.707 3.535l-1.415 1.415l-4.242-4.243l-4.95 4.95l-1.414-1.414l4.95-4.95l-4.243-4.243l1.414-1.414l3.536-.707l.073-.074l-3.536-3.536l1.414-1.415zm-2.12-4.95l1.34-1.34l.707.707l1.415-1.414l-8.486-8.485l-1.414 1.414l.707.707l-1.34 1.34z"/></svg>', Pi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m7 7l10 10M7 17L17 7"/></svg>', le = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><defs><mask id="SVGhUb5Xdyy"><g fill="none"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M16 6H8a2 2 0 0 0-2 2v8m10 26H8a2 2 0 0 1-2-2v-8m26 10h8a2 2 0 0 0 2-2v-8M32 6h8a2 2 0 0 1 2 2v8"/><rect width="20" height="20" x="14" y="14" fill="#fff" stroke="#fff" stroke-width="4" rx="10"/><circle r="3" fill="#000" transform="matrix(-1 0 0 1 24 24)"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#SVGhUb5Xdyy)"/></svg>', Bi = '<svg xmlns="http://www.w3.org/2000/svg" width="${fixedPreviewSize}" height="${fixedPreviewSize}" viewBox="0 0 256 256" ><g fill="currentColor"><path d="M216 40v176H40V40Z" opacity="0.2"/><path d="M152 40a8 8 0 0 1-8 8h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 8 8m-8 168h-32a8 8 0 0 0 0 16h32a8 8 0 0 0 0-16m64-176h-24a8 8 0 0 0 0 16h24v24a8 8 0 0 0 16 0V48a16 16 0 0 0-16-16m8 72a8 8 0 0 0-8 8v32a8 8 0 0 0 16 0v-32a8 8 0 0 0-8-8m0 72a8 8 0 0 0-8 8v24h-24a8 8 0 0 0 0 16h24a16 16 0 0 0 16-16v-24a8 8 0 0 0-8-8M40 152a8 8 0 0 0 8-8v-32a8 8 0 0 0-16 0v32a8 8 0 0 0 8 8m32 56H48v-24a8 8 0 0 0-16 0v24a16 16 0 0 0 16 16h24a8 8 0 0 0 0-16m0-176H48a16 16 0 0 0-16 16v24a8 8 0 0 0 16 0V48h24a8 8 0 0 0 0-16"/></g></svg>', Mt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"/></svg>', Gt = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/></svg>', he = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><circle cx="21" cy="26" r="2" fill="currentColor"/><circle cx="21" cy="6" r="2" fill="currentColor"/><circle cx="4" cy="16" r="2" fill="currentColor"/><path fill="currentColor" d="M28 12a3.996 3.996 0 0 0-3.858 3h-4.284a3.966 3.966 0 0 0-5.491-2.643l-3.177-3.97A3.96 3.96 0 0 0 12 6a4 4 0 1 0-4 4a4 4 0 0 0 1.634-.357l3.176 3.97a3.924 3.924 0 0 0 0 4.774l-3.176 3.97A4 4 0 0 0 8 22a4 4 0 1 0 4 4a3.96 3.96 0 0 0-.81-2.387l3.176-3.97A3.966 3.966 0 0 0 19.858 17h4.284A3.993 3.993 0 1 0 28 12M6 6a2 2 0 1 1 2 2a2 2 0 0 1-2-2m2 22a2 2 0 1 1 2-2a2 2 0 0 1-2 2m8-10a2 2 0 1 1 2-2a2 2 0 0 1-2 2m12 0a2 2 0 1 1 2-2a2 2 0 0 1-2 2"/></svg>', Fi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="round" d="M17.5 17.5L22 22"/><path d="M20 11a9 9 0 1 0-18 0a9 9 0 0 0 18 0Z"/><path stroke-linecap="round" d="m14.5 9.5l.92.793c.387.333.58.5.58.707s-.193.374-.58.707l-.92.793m-7-3l-.92.793c-.387.333-.58.5-.58.707s.193.374.58.707l.92.793m4.5-4l-2 5"/></g></svg>', Oi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M20 4H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1M4 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3zm2 5h2v2H6zm5 0a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2zm-3 4H6v2h2zm2 1a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1m-2 3H6v2h2zm2 1a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-6a1 1 0 0 1-1-1" clip-rule="evenodd"/></svg>', Ri = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m11.852 2.011l.058-.007L12 2l.075.003l.126.017l.111.03l.111.044l.098.052l.104.074l.082.073l3 3a1 1 0 1 1-1.414 1.414L13 5.415V13a1 1 0 0 1-2 0V5.415L9.707 6.707a1 1 0 0 1-1.32.083l-.094-.083a1 1 0 0 1 0-1.414l3-3q.053-.054.112-.097l.11-.071l.114-.054l.105-.035zM12 16a3 3 0 1 1 0 6a3 3 0 0 1 0-6"/></svg>', zi = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 10a1 1 0 0 1 1 1v7.584l1.293-1.291a1 1 0 0 1 1.32-.083l.094.083a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-.112.097l-.11.071l-.114.054l-.105.035l-.149.03L12 22l-.075-.003l-.126-.017l-.111-.03l-.111-.044l-.098-.052l-.096-.067l-.09-.08l-3-3a1 1 0 0 1 1.414-1.414L11 18.586V11a1 1 0 0 1 1-1m0-8a3 3 0 1 1-3 3l.005-.176A3 3 0 0 1 12 2"/></svg>';
function q(l, t) {
  if (Array.isArray(l) && Array.isArray(t))
    return [...l, ...t];
  if (typeof l == "object" && typeof t == "object" && l && t) {
    const e = { ...l };
    for (const i in t)
      Object.prototype.hasOwnProperty.call(t, i) && (i in l ? e[i] = q(l[i], t[i]) : e[i] = t[i]);
    return e;
  }
  return t;
}
const Hi = {
  topbar: [
    {
      title: "Pin Nodes",
      svgIcon: $,
      variant: "outline-primary",
      visible: !0,
      onclick(l, t) {
        t.forEach((e) => {
          e.freeze();
        });
      }
    },
    {
      title: "Unpin Node",
      svgIcon: It,
      variant: "outline-primary",
      visible: !0,
      onclick(l, t) {
        t.forEach((e) => {
          e.unfreeze(), this.uiManager.graph.simulation.reheat();
        });
      }
    },
    {
      title: "Hide Nodes",
      svgIcon: Mt,
      variant: "outline-danger",
      visible: !0,
      flushRight: !0,
      onclick(l, t) {
        t.forEach((e) => {
          this.uiManager.graph.queryEngine.excludeNode(e), this.uiManager.graph.renderer.getGraphInteraction().unselectAll();
        });
      }
    }
  ],
  menu: [
    {
      text: "Expand Nodes",
      title: "Expand Node",
      svgIcon: he,
      variant: "outline-primary",
      visible: !1
    },
    {
      text: "Pin Nodes",
      title: "Pin Nodes",
      svgIcon: $,
      variant: "outline-primary",
      visible: !0,
      onclick(l, t) {
        t.forEach((e) => {
          e.freeze();
        });
      }
    }
  ]
};
class Gi {
  constructor(t) {
    h(this, "uiManager");
    h(this, "navigation");
    h(this, "selectionMenu");
    h(this, "layoutMenu");
    h(this, "selectionMenuShown", !1);
    h(this, "menuNode");
    h(this, "layoutTypeOptions", [
      {
        root: {
          id: "pvt-graphcontrols-simulation-toggle",
          class: "",
          title: "Toggle graph physic simulation",
          svgIcon: mt,
          onClick: () => {
            this.togglePhysicSimulation();
          }
        },
        children: [
          {
            id: "pvt-graphcontrols-simulation-stop",
            class: "",
            title: "Stop graph physic simulation",
            svgIcon: Ht,
            onClick: () => {
              this.togglePhysicSimulation(!1);
            }
          },
          {
            id: "pvt-graphcontrols-simulation-start",
            class: "",
            title: "Start graph physic simulation",
            svgIcon: mt,
            onClick: () => {
              this.togglePhysicSimulation(!0);
            }
          }
        ]
      },
      {
        root: {
          id: "pvt-graphcontrols-layout-organic",
          class: "",
          title: "Change Graph Layout to Organic",
          svgIcon: gi,
          onClick: () => {
            this.uiManager.graph.simulation.changeLayout("force");
          }
        },
        children: [
          {
            id: "pvt-graphcontrols-layout-organic-5",
            class: "",
            title: "Run Organic Layout for 5 seconds. Or until it stabilises",
            svgIcon: yi,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("force", { cooldownTime: 5e3 });
            }
          },
          {
            id: "pvt-graphcontrols-layout-organic-10",
            class: "",
            title: "Run Organic Layout for 10 seconds. Or until it stabilises",
            svgIcon: bi,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("force", { cooldownTime: 1e4 });
            }
          },
          {
            id: "pvt-graphcontrols-layout-organic-15",
            class: "",
            title: "Run Organic Layout for 15 seconds. Or until it stabilises",
            svgIcon: xi,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("force", { cooldownTime: 15e3 });
            }
          }
        ]
      },
      {
        root: {
          id: "pvt-graphcontrols-layout-tree-v",
          class: "pvt-graphcontrols-layout-tree-v-options",
          title: "Change Graph Layout to Vertical Tree",
          svgIcon: fi,
          onClick: () => {
            this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1 } });
          }
        },
        children: [
          {
            id: "pvt-graphcontrols-layout-tree-v-FirstZeroInDegree",
            class: "pvt-graphcontrols-layout-tree-v-options",
            title: "Pick the first valid 0 in-degree node",
            svgIcon: dt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1, rootIdAlgorithmFinder: "FirstZeroInDegree" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-v-MaxReachability",
            class: "pvt-graphcontrols-layout-tree-v-options",
            title: "Pick the most connected node based on the reachability to others",
            svgIcon: ut,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1, rootIdAlgorithmFinder: "MaxReachability" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-v-MinMaxDistance",
            class: "pvt-graphcontrols-layout-tree-v-options",
            title: "Minimize max distance by trying to balance subtree",
            svgIcon: pt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1, rootIdAlgorithmFinder: "MinMaxDistance" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-v-MinHeight",
            class: "pvt-graphcontrols-layout-tree-v-options",
            title: "Pick node minimizing tree height",
            svgIcon: gt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1, rootIdAlgorithmFinder: "MinHeight" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-v-FlipEdgeDirection",
            class: "pvt-graphcontrols-layout-tree-v-options",
            title: "Flip the direction of all edges, then pick the most connected node based on the reachability to others",
            svgIcon: ft,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !1, rootIdAlgorithmFinder: "MaxReachability", flipEdgeDirection: !0 } });
            }
          }
        ]
      },
      {
        root: {
          id: "pvt-graphcontrols-layout-tree-h",
          class: "pvt-graphcontrols-layout-tree-h-options",
          title: "Change Graph Layout to Horizontal Tree",
          svgIcon: mi,
          onClick: () => {
            this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0 } });
          }
        },
        children: [
          {
            id: "pvt-graphcontrols-layout-tree-h-FirstZeroInDegree",
            class: "pvt-graphcontrols-layout-tree-h-options",
            title: "Pick the first valid 0 in-degree node",
            svgIcon: dt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0, rootIdAlgorithmFinder: "FirstZeroInDegree" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-h-MaxReachability",
            class: "pvt-graphcontrols-layout-tree-h-options",
            title: "Pick the most connected node based on the reachability to others",
            svgIcon: ut,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0, rootIdAlgorithmFinder: "MaxReachability" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-h-MinMaxDistance",
            class: "pvt-graphcontrols-layout-tree-h-options",
            title: "Minimize max distance by trying to balance subtree",
            svgIcon: pt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0, rootIdAlgorithmFinder: "MinMaxDistance" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-h-MinHeight",
            class: "pvt-graphcontrols-layout-tree-h-options",
            title: "Pick node minimizing tree height",
            svgIcon: gt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0, rootIdAlgorithmFinder: "MinHeight" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-h-FlipEdgeDirection",
            class: "pvt-graphcontrols-layout-tree-h-options",
            title: "Flip the direction of all edges, then pick the most connected node based on the reachability to others",
            svgIcon: ft,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { horizontal: !0, rootIdAlgorithmFinder: "MaxReachability", flipEdgeDirection: !0 } });
            }
          }
        ]
      },
      {
        root: {
          id: "pvt-graphcontrols-layout-tree-r",
          class: "pvt-graphcontrols-layout-tree-r-options",
          title: "Change Graph Layout to Radial Tree",
          svgIcon: vi,
          onClick: () => {
            this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0 } });
          }
        },
        children: [
          {
            id: "pvt-graphcontrols-layout-tree-r-FirstZeroInDegree",
            class: "pvt-graphcontrols-layout-tree-r-options",
            title: "Pick the first valid 0 in-degree node",
            svgIcon: dt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0, rootIdAlgorithmFinder: "FirstZeroInDegree" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-r-MaxReachability",
            class: "pvt-graphcontrols-layout-tree-r-options",
            title: "Pick the most connected node based on the reachability to others",
            svgIcon: ut,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0, rootIdAlgorithmFinder: "MaxReachability" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-r-MinMaxDistance",
            class: "pvt-graphcontrols-layout-tree-r-options",
            title: "Minimize max distance by trying to balance subtree",
            svgIcon: pt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0, rootIdAlgorithmFinder: "MinMaxDistance" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-r-MinHeight",
            class: "pvt-graphcontrols-layout-tree-r-options",
            title: "Pick node minimizing tree height",
            svgIcon: gt,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0, rootIdAlgorithmFinder: "MinHeight" } });
            }
          },
          {
            id: "pvt-graphcontrols-layout-tree-r-FlipEdgeDirection",
            class: "pvt-graphcontrols-layout-tree-r-options",
            title: "Flip the direction of all edges, then pick the most connected node based on the reachability to others",
            svgIcon: ft,
            onClick: () => {
              this.uiManager.graph.simulation.changeLayout("tree", { layout: { radial: !0, rootIdAlgorithmFinder: "MaxReachability", flipEdgeDirection: !0 } });
            }
          }
        ]
      }
    ]);
    this.uiManager = t, this.menuNode = q(Hi, this.uiManager.getOptions().selectionMenu.menuNode ?? {});
  }
  mount(t) {
    if (!t) return;
    const e = document.createElement("template");
    e.innerHTML = `
  <div class="pvt-graphcontrols-elements">
    <div class="pvt-graphcontrols-panel pvt-graphcontrols-layout"></div>
    <div class="pvt-graphcontrols-panel pvt-graphcontrols-selection">
        <div class="pvt-graphcontrols-selection-title"></div>
        <div class="pvt-graphcontrols-selection-topbar"></div>
        <div class="pvt-graphcontrols-selection-mainmenu"></div>
    </div>
  </div>
`, this.navigation = e.content.firstElementChild, t.appendChild(this.navigation);
  }
  destroy() {
    var t;
    (t = this.navigation) == null || t.remove(), this.navigation = void 0;
  }
  afterMount() {
    this.navigation && (this.selectionMenu = this.navigation.querySelector(".pvt-graphcontrols-selection"), this.layoutMenu = this.navigation.querySelector(".pvt-graphcontrols-layout"), this.createLayoutOptionAndBind(this.layoutTypeOptions));
  }
  graphReady() {
    if (!this.navigation) return;
    const t = this.uiManager.graph.getNodes(), e = this.uiManager.graph.getEdges();
    Y(t, e) ? (this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-v-options").forEach((i) => {
      i.setAttribute("disabled", "disabled"), i.setAttribute("data-old-title", i.getAttribute("title") ?? ""), i.setAttribute("title", "The graph contains a cycle, so it cannot be displayed as a tree.");
    }), this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-h-options").forEach((i) => {
      i.setAttribute("disabled", "disabled"), i.setAttribute("data-old-title", i.getAttribute("title") ?? ""), i.setAttribute("title", "The graph contains a cycle, so it cannot be displayed as a tree.");
    }), this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-r-options").forEach((i) => {
      i.setAttribute("disabled", "disabled"), i.setAttribute("data-old-title", i.getAttribute("title") ?? ""), i.setAttribute("title", "The graph contains a cycle, so it cannot be displayed as a tree.");
    })) : (this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-v-options").forEach((i) => {
      i.removeAttribute("disabled"), i.setAttribute("title", i.getAttribute("data-old-title") ?? i.getAttribute("title") ?? "");
    }), this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-h-options").forEach((i) => {
      i.removeAttribute("disabled"), i.setAttribute("title", i.getAttribute("data-old-title") ?? i.getAttribute("title") ?? "");
    }), this.navigation.querySelectorAll(".pvt-graphcontrols-layout-tree-r-options").forEach((i) => {
      i.removeAttribute("disabled"), i.setAttribute("title", i.getAttribute("data-old-title") ?? i.getAttribute("title") ?? "");
    })), this.uiManager.graph.renderer.getGraphInteraction().on("selectNodes", (i) => {
      this.populateNodeSelectionContainer(i), this.showSelectionMenu();
    }), this.uiManager.graph.renderer.getGraphInteraction().on("unselectNodes", () => {
      this.hideSelectionMenu(), setTimeout(this.clearSelectionContainer, 200);
    });
  }
  showSelectionMenu() {
    this.selectionMenuShown || this.selectionMenu && (this.selectionMenu.classList.add("shown"), this.selectionMenuShown = !0);
  }
  hideSelectionMenu() {
    this.selectionMenuShown && this.selectionMenu && (this.selectionMenu.classList.remove("shown"), this.selectionMenuShown = !1);
  }
  populateNodeSelectionContainer(t) {
    if (!this.navigation || !this.selectionMenu) return;
    const e = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-title"), i = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-topbar"), n = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-mainmenu"), r = this.getNodesFromSelection(t);
    e.innerHTML = "", i.innerHTML = "", n.innerHTML = "", e.textContent = `${r.length} nodes selected`, i.appendChild(tt(this, this.menuNode.topbar, r)), n.appendChild(et(this, this.menuNode.menu, r));
  }
  clearSelectionContainer() {
    if (!this.navigation || !this.selectionMenu) return;
    const t = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-title"), e = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-topbar"), i = this.selectionMenu.querySelector(".pvt-graphcontrols-selection-mainmenu");
    t.innerHTML = "", e.innerHTML = "", i.innerHTML = "";
  }
  getNodesFromSelection(t) {
    return t.map((e) => {
      const { node: i } = e;
      return i;
    });
  }
  createLayoutOptionAndBind(t) {
    t.forEach((e, i) => {
      if (!this.layoutMenu) return;
      i > 0 && this.layoutMenu.appendChild(b("div", {
        class: "pivotick-divider"
      }, []));
      const n = e.root, r = e.children, s = b("div", {}, [
        this.createLayoutOption(n)
      ]), o = this.createLayoutOptionMenu(r), d = b("div", {
        class: "pvt-graphcontrols-layout-type-container"
      }, [
        s,
        o
      ]);
      this.layoutMenu.appendChild(d);
      const a = d.querySelector(`#${n.id}`);
      a && typeof n.onClick == "function" && a.addEventListener("click", n.onClick), r.forEach((c) => {
        const u = o.querySelector(`#${c.id}`);
        u && typeof c.onClick == "function" && u.addEventListener("click", c.onClick);
      });
    });
  }
  createLayoutOptionMenu(t) {
    const e = b("div", {
      class: ["pvt-graphcontrols-layout-type-options"]
    });
    return t.forEach((i) => {
      const n = this.createLayoutOption(i);
      e.appendChild(n);
    }), e;
  }
  createLayoutOption(t) {
    return b("button", {
      id: t.id,
      class: t.class,
      title: t.title
    }, [
      t.html ? t.html() : C({ svgIcon: t.svgIcon })
    ]);
  }
  togglePhysicSimulation(t) {
    const e = this.uiManager.graph.simulation;
    if (!e) return;
    t ?? !e.isEnabled() ? (e.enable(), this.updatePhysicSimulationIndicator(!0)) : (this.updatePhysicSimulationIndicator(!1), e.disable());
  }
  updatePhysicSimulationIndicator(t) {
    const e = this.layoutMenu.querySelector("#pvt-graphcontrols-simulation-toggle"), i = e.querySelector(".pvt-icon");
    !e || !i || (t ? i.outerHTML = C({ svgIcon: mt }).outerHTML : i.outerHTML = C({ svgIcon: Ht }).outerHTML);
  }
}
class ji {
  constructor(t) {
    h(this, "uiManager");
    h(this, "navigation");
    this.uiManager = t;
  }
  mount(t) {
    if (!t) return;
    const e = document.createElement("template");
    e.innerHTML = `
  <div class="pvt-graphnavigation-elements">
    <div class="pvt-graphnavigation-zoom-fit">
        <button id="pvt-graphnavigation-reset" class="pvt-graphnavigation-reset-button" title="Fit and center">
            ${wi}
        </button>
    </div>
    <div class="pvt-graphnavigation-zoom-controls">
        <button id="pvt-graphnavigation-zoom-in" class="pvt-graphnavigation-zoomin-button" title="Zoom In">
           ${Ci}
        </button>
        <div class="pvt-zoom-divider"></div>
        <button id="pvt-graphnavigation-zoom-out" class="pvt-graphnavigation-zoomout-button" title="Zoom Out">
            ${Mi}
        </button>
    </div>
    <div class="pvt-graphnavigation-fullscreen">
        <button id="pvt-graphnavigation-fullscreen" class="pvt-graphnavigation-fullscreen-button" title="Zoom In">
           <span>${ui}</span>
           <span style="display: none">${pi}</span>
        </button>
    </div>
  </div>
`, this.navigation = e.content.firstElementChild, t.appendChild(this.navigation);
  }
  destroy() {
    var t;
    (t = this.navigation) == null || t.remove(), this.navigation = void 0;
  }
  afterMount() {
    if (!this.navigation) return;
    const t = this.navigation.querySelector("#pvt-graphnavigation-zoom-in"), e = this.navigation.querySelector("#pvt-graphnavigation-zoom-out"), i = this.navigation.querySelector("#pvt-graphnavigation-reset"), n = this.navigation.querySelector("#pvt-graphnavigation-fullscreen");
    t == null || t.addEventListener("click", () => {
      this.uiManager.graph.renderer.zoomIn();
    }), e == null || e.addEventListener("click", () => {
      this.uiManager.graph.renderer.zoomOut();
    }), i == null || i.addEventListener("click", () => {
      this.uiManager.graph.renderer.fitAndCenter();
    }), n == null || n.addEventListener("click", () => {
      this.uiManager.toggleFullscreen(), this.updateFullscreenIcon(n);
    });
  }
  updateFullscreenIcon(t) {
    const e = t.querySelectorAll("span"), i = e[0], n = e[1], r = this.uiManager.isFullscreenOn();
    i.style.display = r ? "none" : "", n.style.display = r ? "" : "none";
  }
  graphReady() {
  }
}
class qi {
  constructor() {
    h(this, "layout");
    h(this, "canvas");
    h(this, "sidebar");
    h(this, "toolbar");
    h(this, "notification");
    h(this, "modal");
    h(this, "slidePanel");
    h(this, "graphnavigation");
    h(this, "graphcontrols");
  }
  mount(t, e = "full") {
    this.layout = document.createElement("div"), this.layout.className = `pvt-layout mode-${e}`, this.canvas = document.createElement("div"), this.canvas.className = "pvt-canvas", this.layout.appendChild(this.canvas), this.notification = document.createElement("div"), this.notification.className = "pvt-notification", this.canvas.appendChild(this.notification), e === "full" && (this.sidebar = document.createElement("div"), this.sidebar.className = "pvt-sidebar", this.layout.appendChild(this.sidebar)), (e === "light" || e === "full") && (this.toolbar = document.createElement("div"), this.toolbar.className = "pvt-toolbar", this.layout.appendChild(this.toolbar), this.modal = document.createElement("div"), this.modal.className = "pvt-modalcontainer", t.appendChild(this.modal), this.slidePanel = document.createElement("div"), this.slidePanel.className = "pvt-slidepanel-container", this.canvas.appendChild(this.slidePanel)), e !== "static" && (this.graphnavigation = document.createElement("div"), this.graphnavigation.className = "pvt-graphnavigation", this.canvas.appendChild(this.graphnavigation), this.graphcontrols = document.createElement("div"), this.graphcontrols.className = "pvt-graphcontrols", this.canvas.appendChild(this.graphcontrols)), t.appendChild(this.layout);
  }
  destroy() {
    var t;
    (t = this.layout) == null || t.remove(), this.layout = void 0;
  }
  afterMount() {
  }
  graphReady() {
  }
}
class $i {
  constructor(t) {
    h(this, "uiManager");
    h(this, "panel");
    h(this, "renderCb");
    this.uiManager = t, this.renderCb = typeof this.uiManager.getOptions().mainHeader.render == "function" ? this.uiManager.getOptions().mainHeader.render : void 0;
  }
  mount(t) {
    t && (this.panel = t);
  }
  destroy() {
    var t;
    (t = this.panel) == null || t.remove(), this.panel = void 0;
  }
  afterMount() {
    this.clearOverview();
  }
  graphReady() {
    this.clearOverview();
  }
  renderCustomContent(t) {
    var i;
    if (!this.panel || !this.renderCb) return;
    this.panel.innerHTML = "";
    const e = P(this.renderCb, t);
    e && ((i = this.panel) == null || i.appendChild(e));
  }
  clearOverview() {
    if (this.panel) {
      if (this.renderCb) {
        this.renderCustomContent(null);
        return;
      }
      this.panel.innerHTML = "", this.showTotalNodeCount();
    }
  }
  /* Single selection */
  updateNodeOverview(t, e) {
    if (!this.panel) return;
    if (this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
    this.panel.innerHTML = "";
    const i = 42, n = `
<div class="enter-ready">
    <div class="pvt-mainheader-nodepreview">
        <svg class="pvt-mainheader-icon" width="${i}" height="${i}" viewBox="0 0 ${i} ${i}" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
    <div class="pvt-mainheader-nodeinfo">
        <div class="pvt-mainheader-nodeinfo-name"></div>
        <div class="pvt-mainheader-nodeinfo-subtitle"></div>
    </div>
    <div class="pvt-mainheader-nodeinfo-action">
    </div>
</div>`, r = k(n), s = r.querySelector(".pvt-mainheader-icon"), o = r.querySelector(".pvt-mainheader-nodeinfo-name"), d = r.querySelector(".pvt-mainheader-nodeinfo-subtitle");
    if (s && e && e instanceof SVGGElement) {
      const a = e.cloneNode(!0), c = e.getBBox(), u = i / Math.max(c.width, c.height);
      a.setAttribute(
        "transform",
        `translate(${(i - c.width * u) / 2 - c.x * u}, ${(i - c.height * u) / 2 - c.y * u}) scale(${u})`
      ), s.appendChild(a);
    }
    if (o && (o.textContent = z(t, this.uiManager.getOptions().mainHeader)), d) {
      const a = Qt(t, this.uiManager.getOptions().mainHeader);
      d.textContent = a ?? "";
    }
    this.panel.appendChild(r), requestAnimationFrame(() => {
      var a, c;
      (c = (a = this.panel) == null ? void 0 : a.firstElementChild) == null || c.classList.add("enter-active");
    });
  }
  updateEdgeOverview(t) {
    if (!this.panel) return;
    if (this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
    this.panel.innerHTML = "";
    const i = `<div class="enter-ready">
<div class="pvt-mainheader-nodepreview">
    ${st(42)}
</div>
<div class="pvt-mainheader-nodeinfo">
    <div class="pvt-mainheader-nodeinfo-name"></div>
    <div class="pvt-mainheader-nodeinfo-subtitle"></div>
</div>
<div class="pvt-mainheader-nodeinfo-action">
</div>
</div>`, n = k(i), r = n.querySelector(".pvt-mainheader-nodeinfo-name"), s = n.querySelector(".pvt-mainheader-nodeinfo-subtitle");
    r && (r.textContent = W(t, this.uiManager.getOptions().mainHeader)), s && (s.textContent = Jt(t, this.uiManager.getOptions().mainHeader)), this.panel.appendChild(n), requestAnimationFrame(() => {
      var o, d;
      (d = (o = this.panel) == null ? void 0 : o.firstElementChild) == null || d.classList.add("enter-active");
    });
  }
  /* Multi selection */
  updateNodesOverview(t) {
    if (!this.panel) return;
    if (this.renderCb) {
      this.renderCustomContent(t.map((d) => d.node));
      return;
    }
    this.panel.innerHTML = "";
    const e = 42, i = `<div class="enter-ready">
    <div class="pvt-mainheader-nodepreview">
        <svg class="pvt-mainheader-icon" width="${e}" height="${e}" viewBox="0 0 ${e} ${e}" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
    <div class="pvt-mainheader-nodeinfo">
        <div class="pvt-mainheader-nodeinfo-name"></div>
        <div class="pvt-mainheader-nodeinfo-subtitle"></div>
    </div>
    <div class="pvt-mainheader-nodeinfo-action">
    </div>
</div>`, n = k(i), r = n.querySelector(".pvt-mainheader-icon"), s = n.querySelector(".pvt-mainheader-nodeinfo-name"), o = n.querySelector(".pvt-mainheader-nodeinfo-subtitle");
    if (r) {
      const d = se(e), a = k(d);
      r.appendChild(a);
    }
    s && (s.textContent = `${t.length} nodes selected`), o && (o.textContent = `Out of ${this.uiManager.graph.getNodeCount()} total`), this.panel.appendChild(n), requestAnimationFrame(() => {
      var d, a;
      (a = (d = this.panel) == null ? void 0 : d.firstElementChild) == null || a.classList.add("enter-active");
    });
  }
  updateEdgesOverview(t) {
    if (!this.panel) return;
    if (this.renderCb) {
      this.renderCustomContent(t.map((o) => o.edge));
      return;
    }
    this.panel.innerHTML = "";
    const i = `<div class="enter-ready">
<div class="pvt-mainheader-nodepreview">
    ${st(42)}
</div>
<div class="pvt-mainheader-nodeinfo">
    <div class="pvt-mainheader-nodeinfo-name"></div>
    <div class="pvt-mainheader-nodeinfo-subtitle"></div>
</div>
<div class="pvt-mainheader-nodeinfo-action">
</div>
</div>`, n = k(i), r = n.querySelector(".pvt-mainheader-nodeinfo-name"), s = n.querySelector(".pvt-mainheader-nodeinfo-subtitle");
    r && (r.textContent = `${t.length} edges selected`), s && (s.textContent = `Out of ${this.uiManager.graph.getEdgeCount()} total`), this.panel.appendChild(n), requestAnimationFrame(() => {
      var o, d;
      (d = (o = this.panel) == null ? void 0 : o.firstElementChild) == null || d.classList.add("enter-active");
    });
  }
  /* Private methods */
  showTotalNodeCount() {
    if (!this.panel) return;
    const t = this.uiManager.graph.getMutableVisibleNodes().length, e = this.uiManager.graph.getMutableVisibleEdges().length;
    this.panel.textContent = `Showing ${t} nodes and ${e} edges`;
  }
}
function Ui(l, t) {
  const e = t > 0 ? l / t * 100 : 0, i = document.createElement("span");
  i.style.display = "flex", i.style.alignItems = "center", i.style.gap = "0.5rem", i.style.fontFamily = "sans-serif", i.style.fontSize = "0.85rem", i.title = `${l} - ${e.toFixed(0)}%`;
  const n = document.createElement("span");
  n.classList.add("pivotick-inline-bar-container"), i.appendChild(n);
  const r = document.createElement("span");
  return r.classList.add("pivotick-inline-bar-fill"), r.style.width = `${e}%`, r.style.backgroundSize = `${100 / (e / 100)}% 100%`, n.appendChild(r), i;
}
const St = "4dfd89de5d25fc9cc4b66c23d84b443af631c7dc", Vi = 6;
function Et(l, t, e) {
  const i = Xi(l), n = document.createElement("div");
  for (const [r, s] of i) {
    const o = b("div", {
      class: "pvt-aggregated-property-section"
    }), d = b("span", {
      class: "pvt-aggregated-property-title"
    }, [`.${r}`]), a = b("div", {
      class: "pvt-aggregated-property-container"
    });
    let c = 0;
    for (const [u, p] of s) {
      if (c >= 10) {
        const m = b(
          "div",
          {},
          [
            b("div", {
              style: "text-align: center; font-weight: 300; font-size: 0.9rem; color: var(--pvt-text-color-5);"
            }, [
              `... ${s.size - c} more`
            ])
          ]
        );
        a.append(m);
        break;
      }
      let g = "";
      e && (g = kt(u) ? "" : e(r, u));
      const f = b(
        "div",
        {
          class: "pvt-aggregated-property-row"
        },
        [
          b("span", {
            class: [
              "pvt-aggregated-property-value",
              kt(u) ? "" : "code-container"
            ]
          }, [
            b("span", {}, [
              Yi(Wi(u), p),
              g
            ])
          ]),
          b("span", { class: "pvt-aggregated-property-count" }, [
            Ui(p, t)
          ])
        ]
      );
      a.append(f), c++;
    }
    o.appendChild(d), o.appendChild(a), n.appendChild(o);
  }
  return n;
}
function Wi(l) {
  return typeof l == "string" ? l : JSON.stringify(l);
}
function Yi(l, t) {
  if (kt(l)) {
    let e = "", i = "";
    return ce(l) ? (e = "- empty -", i = "The value is empty") : de(l) && (e = `- ${t} other unique values -`, i = "All other values are unique"), b("span", { class: "pvt-aggregated-property-value-dim", title: i }, [
      e
    ]);
  }
  return document.createTextNode(l);
}
function ce(l) {
  return l.length === 0;
}
function de(l) {
  return l === St;
}
function kt(l) {
  return ce(l) || de(l);
}
function jt(l) {
  const t = /* @__PURE__ */ new Map();
  return l.forEach((e) => {
    e.forEach((i) => {
      if ((typeof i.name == "string" || typeof i.name == "number" || typeof i.name == "boolean") && (typeof i.value == "string" || typeof i.value == "number" || typeof i.value == "boolean")) {
        t.has(i.name) || t.set(i.name, /* @__PURE__ */ new Map());
        const n = t.get(i.name), r = n.get(i.value) || 0;
        n.set(i.value, r + 1);
      }
    });
  }), t;
}
function Xi(l, t = !0) {
  const e = /* @__PURE__ */ new Map();
  for (const [s, o] of l.entries()) {
    const d = Array.from(o.entries()).sort(
      (a, c) => c[1] - a[1]
      // high count first
    );
    e.set(s, new Map(d));
  }
  const i = Array.from(e.entries()).sort(
    (s, o) => s[1].size - o[1].size
  ), n = new Map(i);
  if (!t)
    return n;
  const r = /* @__PURE__ */ new Map();
  for (const [s, o] of n)
    for (const [d, a] of o) {
      r.has(s) || r.set(s, /* @__PURE__ */ new Map());
      const c = r.get(s);
      if (o.size > Vi && a === 1) {
        const u = c.get(St) || 0;
        c.set(St, u + 1);
      } else
        c.set(d, a);
    }
  return r;
}
class Zi {
  constructor(t) {
    h(this, "uiManager");
    h(this, "panel");
    h(this, "header");
    h(this, "body");
    h(this, "renderCb");
    this.uiManager = t, this.renderCb = typeof this.uiManager.getOptions().propertiesPanel.render == "function" ? this.uiManager.getOptions().propertiesPanel.render : void 0;
  }
  mount(t) {
    if (!t) return;
    const e = `
<div class="enter-ready">
    <div class="pvt-properties-header-panel pvt-sidebar-header-panel"></div>
    <div class="pvt-properties-body-panel pvt-sidebar-body-panel"></div>
</div>`;
    this.panel = k(e), this.header = this.panel.querySelector(".pvt-properties-header-panel"), this.body = this.panel.querySelector(".pvt-properties-body-panel"), t.appendChild(this.panel);
  }
  destroy() {
    var t;
    (t = this.panel) == null || t.remove(), this.panel = void 0;
  }
  afterMount() {
    this.clearProperties();
  }
  clearProperties() {
    if (this.body) {
      if (this.renderCb) {
        this.renderCustomContent(null);
        return;
      }
      this.body.innerHTML = "", this.hidePanel();
    }
  }
  graphReady() {
  }
  renderCustomContent(t) {
    var i;
    if (!this.body || !this.renderCb) return;
    this.body.innerHTML = "";
    const e = P(this.renderCb, t);
    e && ((i = this.body) == null || i.appendChild(e));
  }
  setHeaderBasicNode() {
    this.header.textContent = "Basic Node Properties";
  }
  setHeaderBasicEdge() {
    this.header.textContent = "Basic Edge Properties";
  }
  setHeaderMultiSelectNode() {
    this.header.textContent = "Aggregated Node Properties";
  }
  setHeaderMultiSelectEdge() {
    this.header.textContent = "Aggregated Edge Properties";
  }
  showPanel() {
    this.panel.classList.add("enter-active");
  }
  hidePanel() {
    this.panel.classList.remove("enter-active");
  }
  /* Single selection */
  updateNodeProperties(t) {
    if (!this.body) return;
    if (this.setHeaderBasicNode(), this.showPanel(), this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
    const i = k(`
<div class="pvt-properties-container">
    <div class="dl-container">
    </div>
</div>`), n = i.querySelector(".dl-container");
    if (n) {
      const r = wt(t, this.uiManager.getOptions().propertiesPanel);
      n.append(nt(r, t));
    }
    this.body.innerHTML = "", this.body.appendChild(i);
  }
  updateEdgeProperties(t) {
    if (!this.body) return;
    if (this.setHeaderBasicEdge(), this.showPanel(), this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
    const i = k(`
<div class="pvt-properties-container">
    <div class="dl-container">
    </div>
</div>`), n = i.querySelector(".dl-container");
    if (n) {
      const r = Ct(t, this.uiManager.getOptions().propertiesPanel);
      n.append(nt(r, t));
    }
    this.body.innerHTML = "", this.body.appendChild(i);
  }
  /* Multiple selection */
  updateNodesProperties(t) {
    if (!this.body) return;
    if (this.setHeaderMultiSelectNode(), this.showPanel(), this.renderCb) {
      this.renderCustomContent(t.map((r) => r.node));
      return;
    }
    const i = k(`
<div class="pvt-properties-container">
    <div class="">
        <div class="pvt-aggregated-properties"></div>
    </div>
</div>`), n = i.querySelector("div.pvt-aggregated-properties");
    if (n) {
      const r = [];
      t.forEach((d) => {
        const { node: a } = d, c = wt(a, this.uiManager.getOptions().propertiesPanel);
        r.push(c);
      });
      const s = jt(r), o = Et(s, t.length, this.genActionButtons.bind(this));
      n.appendChild(o);
    }
    this.body.innerHTML = "", this.body.appendChild(i);
  }
  updateEdgesProperties(t) {
    if (!this.body) return;
    if (this.setHeaderMultiSelectEdge(), this.showPanel(), this.renderCb) {
      this.renderCustomContent(t.map((r) => r.edge));
      return;
    }
    const i = k(`
<div class="pvt-properties-container">
    <div class="">
        <div class="pvt-aggregated-properties"></div>
    </div>
</div>`), n = i.querySelector("div.pvt-aggregated-properties");
    if (n) {
      const r = [];
      t.forEach((d) => {
        const { edge: a } = d, c = Ct(a, this.uiManager.getOptions().propertiesPanel);
        r.push(c);
      });
      const s = jt(r), o = Et(s, t.length, this.genActionButtons.bind(this));
      n.appendChild(o);
    }
    this.body.innerHTML = "", this.body.appendChild(i);
  }
  genActionButtons(t, e) {
    const i = b("button", {
      title: "Select Similar"
    }, [C({ svgIcon: re })]);
    i.addEventListener("click", () => {
      const s = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNodes().filter((o) => o.node.getData()[t] != e);
      this.uiManager.graph.renderer.getGraphInteraction().removeNodesFromSelection(s);
    });
    const n = b("button", {
      title: "Exclude Similar"
    }, [C({ svgIcon: ne })]);
    return n.addEventListener("click", () => {
      const s = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNodes().filter((o) => o.node.getData()[t] == e);
      this.uiManager.graph.renderer.getGraphInteraction().removeNodesFromSelection(s);
    }), b("div", { class: "pvt-aggregated-property-actions" }, [
      i,
      n
    ]);
  }
}
class Ki {
  constructor(t) {
    h(this, "uiManager");
    h(this, "panelContainer");
    h(this, "panels");
    h(this, "allPanels", []);
    this.uiManager = t, this.panels = this.uiManager.getOptions().extraPanels;
  }
  mount(t) {
    t && (this.panelContainer = t);
  }
  destroy() {
    var t;
    (t = this.panelContainer) == null || t.remove(), this.panelContainer = void 0, this.allPanels = [];
  }
  afterMount() {
    this.mountPanels(), this.panels.forEach((t, e) => {
      t.alwaysVisible === !0 && this.showPanel(this.allPanels[e]);
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateNode(t) {
    this.showAll();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateEdge(t) {
    this.showAll();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateNodes(t) {
    this.showAll();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateEdges(t) {
    this.showAll();
  }
  clear() {
    this.hideAll();
  }
  showAll() {
    this.allPanels.forEach((t) => {
      this.showPanel(t);
    });
  }
  hideAll() {
    this.allPanels.forEach((t, e) => {
      this.panels[e].alwaysVisible !== !0 && this.hidePanel(t);
    });
  }
  showPanel(t) {
    t.classList.add("enter-active");
  }
  hidePanel(t) {
    t.classList.remove("enter-active");
  }
  mountPanels() {
    this.panelContainer && this.panels.forEach((t) => [
      this.mountPanel(t)
    ]);
  }
  mountPanel(t) {
    if (!this.panelContainer) return;
    const i = k(`
            <div class="enter-ready">
                <div class="pivotick-extrapanel-header-panel pvt-sidebar-header-panel"></div>
                <div class="pivotick-extrapanel-body-panel pvt-sidebar-body-panel"></div>
            </div>`), n = i.querySelector(".pivotick-extrapanel-header-panel"), r = i.querySelector(".pivotick-extrapanel-body-panel"), s = P(t.title, null);
    s && n.appendChild(s);
    const o = P(t.render, null);
    o && r.appendChild(o), this.allPanels.push(i), this.panelContainer.appendChild(i);
  }
  graphReady() {
  }
}
function Qi(l, t, e, i) {
  const n = document.createElement("div");
  n.className = "pivotick-tabs";
  const r = document.createElement("div");
  r.className = "pivotick-tab-controls";
  const s = document.createElement("div");
  s.className = "pivotick-tab-panels", i && e ? (i.appendChild(r), e.appendChild(s)) : e ? e.appendChild(n) : n.append(r, s);
  function o(a) {
    const c = a.id;
    s.querySelectorAll("[data-tab-panel]").forEach((g) => g.style.display = "none"), r.querySelectorAll(".pivotick-button").forEach((g) => {
      g.classList.toggle("pivotick-button-primary", !1), g.classList.toggle("pivotick-button-outline-secondary", !0);
    });
    const u = s.querySelector(`[data-tab-panel="${c}"]`), p = r.querySelector(`[data-tab-control="${c}"]`);
    u && (u.style.display = "block"), p && (p.classList.remove("pivotick-button-outline-secondary"), p.classList.add("pivotick-button-primary")), requestAnimationFrame(() => {
      a.onShown && (a == null || a.onShown());
    });
  }
  l.forEach((a) => {
    const c = _({
      text: a.label,
      variant: "outline-secondary",
      "data-tab-control": a.id,
      onclick: () => o(a)
    });
    r.appendChild(c);
    const u = document.createElement("div");
    u.dataset.tabPanel = a.id, u.style.display = "none", u.appendChild(a.content), s.appendChild(u);
  });
  const d = l[0];
  return o(d), i && e ? s : n;
}
function ue(l) {
  l.variant = l.variant ?? "primary";
  const {
    variant: t,
    size: e,
    iconUnicode: i,
    iconClass: n,
    svgIcon: r,
    imagePath: s,
    text: o,
    html: d,
    ...a
  } = l, c = document.createElement("span");
  c.classList.add("pivotick-badge"), c.classList.add(`pivotick-badge-${t}`), e && c.classList.add(`pivotick-badge-${e}`);
  for (const [g, f] of Object.entries(a))
    g === "class" ? Array.isArray(f) ? c.classList.add(...f) : c.classList.add(String(f)) : g in c ? c[g] = f : c.setAttribute(g, String(f));
  let u;
  i && (u = C({ iconUnicode: i })), n && (u = C({ iconClass: n })), r && (u = C({ svgIcon: r })), s && (u = C({ imagePath: s })), u && c.append(u);
  const p = document.createElement("text");
  return o && (u && (u.style.marginRight = "0.1em"), p.textContent = o), c.append(p), d && c.appendChild(d), c;
}
class Ji {
  constructor(t) {
    h(this, "uiManager");
    h(this, "panel");
    h(this, "header");
    h(this, "body");
    h(this, "neighborCount");
    h(this, "egographContainer");
    h(this, "statContainer");
    h(this, "listContainer");
    h(this, "tabContainer");
    h(this, "egoGraph");
    h(this, "renderCb");
    this.uiManager = t, this.renderCb = typeof this.uiManager.getOptions().neighborsPanel.render == "function" ? this.uiManager.getOptions().neighborsPanel.render : void 0;
  }
  mount(t) {
    if (!t) return;
    const e = `
<div class="enter-ready">
    <div class="pvt-neighbors-header-panel pvt-sidebar-header-panel"></div>
    <div class="pvt-neighbors-body-panel pvt-sidebar-body-panel"></div>
</div>`;
    this.panel = k(e), this.header = this.panel.querySelector(".pvt-neighbors-header-panel"), this.body = this.panel.querySelector(".pvt-neighbors-body-panel"), this.neighborCount = b("div", { class: "pvt-neighbors-count" }), t.appendChild(this.panel), this.egographContainer = b("div", { class: "main-egograph-container" }, ["Egograph here"]), this.statContainer = b("div", { class: "main-stats-container" }, ["Stats here"]), this.listContainer = b("div", { class: "main-list-container" }, ["List here"]), this.tabContainer = Qi(
      [
        {
          id: "egograph",
          label: "Neighbor Graph",
          content: this.egographContainer,
          onShown: () => {
            requestAnimationFrame(async () => {
              this.egoGraph && (await this.egoGraph.simulation.start(), await this.egoGraph.simulation.waitForSimulationStop(), this.egoGraph.renderer.fitAndCenter());
            });
          }
        },
        {
          id: "stats",
          label: "Stats",
          content: this.statContainer
        },
        {
          id: "list",
          label: "List",
          content: this.listContainer
        }
      ],
      void 0,
      this.body,
      this.header
    ), this.body.insertBefore(this.neighborCount, this.body.firstChild);
  }
  destroy() {
    var t;
    (t = this.panel) == null || t.remove(), this.panel = void 0;
  }
  afterMount() {
    this.clearNeighbors();
  }
  clearNeighbors() {
    if (this.body) {
      if (this.renderCb) {
        this.renderCustomContent(null);
        return;
      }
      this.renderCb ? this.body.innerHTML = "" : this.egographContainer && this.statContainer && this.listContainer && (this.egographContainer.innerHTML = "", this.statContainer.innerHTML = "", this.listContainer.innerHTML = ""), this.hidePanel();
    }
  }
  graphReady() {
  }
  renderCustomContent(t) {
    var i;
    if (!this.body || !this.renderCb) return;
    this.body.innerHTML = "";
    const e = P(this.renderCb, t);
    e && ((i = this.body) == null || i.appendChild(e));
  }
  showPanel() {
    this.panel.classList.add("enter-active");
  }
  hidePanel() {
    this.panel.classList.remove("enter-active");
  }
  /* Single selection */
  updateNodeNeighbors(t) {
    if (this.showPanel(), !this.neighborCount) return;
    if (this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
    this.buildEgoGraph(t), this.buildList(t), this.buildStats(t);
    const e = t.degree(), i = e > 1 ? `${e} connections` : "1 connection";
    this.neighborCount.textContent = i;
  }
  updateEdgeNeighbors(t) {
    if (this.showPanel(), this.renderCb) {
      this.renderCustomContent(t);
      return;
    }
  }
  /* Multiple selection */
  updateNodesNeighbors(t) {
    if (this.showPanel(), !this.neighborCount) return;
    if (this.renderCb) {
      this.renderCustomContent(t.map((r) => r.node));
      return;
    }
    if (t.length <= 1) return;
    const e = this.mergeNodesIntoNode(t.map((r) => r.node));
    this.buildEgoGraph(e, !1), this.buildList(e), this.buildStats(e);
    const i = e.degree(), n = i > 1 ? `${i} connections` : "1 connection";
    this.neighborCount.textContent = n;
  }
  updateEdgesNeighbors(t) {
    if (this.showPanel(), this.renderCb) {
      this.renderCustomContent(t.map((e) => e.edge));
      return;
    }
  }
  buildEgoGraph(t, e = !0) {
    if (!this.egographContainer) return;
    this.egographContainer.innerHTML = "", this.egoGraph && this.egoGraph.destroy(), this.egographContainer.style.visibility = "hidden";
    const i = /* @__PURE__ */ new Map();
    for (const a of [
      t,
      ...t.getConnectedNodes(),
      ...t.getConnectingNodes()
    ])
      i.set(a.id.toString(), a);
    const n = [
      ...t.getEdgesOut(),
      ...t.getEdgesIn()
    ], r = /* @__PURE__ */ new Map();
    n.forEach((a) => {
      !a || a.id == null || r.set(a.id.toString(), a);
    }), i.forEach((a) => {
      a.getEdgesOut().forEach((c) => {
        const u = c.to;
        i.has(u.id.toString()) && u.id !== t.id && r.set(c.id.toString(), c);
      });
    });
    const o = {
      nodes: [...i.values()].filter((a) => {
        var c;
        return a.getDeepestNodeClone() === void 0 ? !0 : ((c = a.getDeepestNodeClone()) == null ? void 0 : c.visible) ?? !1;
      }).map((a) => a.toDict(!0)),
      edges: [...r.values()].map((a) => a.toDict())
    }, d = {
      isDirected: this.uiManager.graph.getOptions().isDirected,
      UI: {
        mode: "viewer",
        tooltip: {
          enabled: !0,
          allowPinning: !1,
          setPosition: (a, c, u) => {
            a.style.left = `${u.x + u.width + 15}px`, a.style.top = `${u.y}px`;
          }
        },
        contextMenu: {
          enabled: !1
        },
        navigation: {
          enabled: !1
        }
      },
      layout: {
        type: "egoTree",
        radial: !0,
        radialGap: 120,
        rootId: t.id
      },
      render: {
        ...this.uiManager.graph.getOptions().render,
        dragEnabled: !1,
        enableFocusMode: !1,
        enableNodeExpansion: !1,
        interactionEnabled: !0,
        zoomEnabled: !1,
        zoomAnimationDuration: 100
      },
      simulation: {
        useWorker: !1,
        warmupTicks: 0,
        cooldownTime: 0
      },
      callbacks: {
        onNodeClick: (a, c) => {
          var p, g;
          const u = this.uiManager.graph.getMutableNode(c.id);
          u && ((p = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNode()) == null ? void 0 : p.node) != u && (this.uiManager.graph.unHighlightElement(u), (g = this.egoGraph) == null || g.unHighlightElement(c), this.uiManager.graph.selectElement(u));
        },
        onNodeHoverIn: (a, c) => {
          var p, g, f;
          const u = this.uiManager.graph.getMutableNode(c.id);
          u && (this.uiManager.graph.highlightElement(u), (p = this.egoGraph) == null || p.highlightElement(c), (f = (g = this.egoGraph) == null ? void 0 : g.UIManager.tooltip) == null || f.nodeHovered(a, c));
        },
        onNodeHoverOut: (a, c) => {
          var p;
          const u = this.uiManager.graph.getMutableNode(c.id);
          u && (this.uiManager.graph.unHighlightElement(u), (p = this.egoGraph) == null || p.unHighlightElement(c));
        }
      }
    };
    this.egoGraph = new I(this.egographContainer, o, d), this.egoGraph.on("ready", () => {
      setTimeout(() => {
        this.egographContainer.style.visibility = "visible";
      }, 20), e && this.egoGraph.selectElement(this.egoGraph.getMutableNode(t.id));
    }), this.egoGraph.renderer.getGraphInteraction().canvasClick = () => {
    };
  }
  buildList(t) {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";
    const e = 26, i = [
      ...t.getEdgesOut(),
      ...t.getEdgesIn()
    ];
    i.sort((r, s) => {
      const o = r.from.id === t.id ? r.to : r.from, d = s.from.id === t.id ? s.to : s.from, a = z(o, this.uiManager.getOptions().mainHeader), c = z(d, this.uiManager.getOptions().mainHeader);
      return a.localeCompare(c);
    });
    const n = b("div", { class: "" });
    for (const r of i) {
      const s = r.from.id === t.id, o = s ? r.to : r.from, d = W(r, this.uiManager.getOptions().mainHeader) || "", a = this.uiManager.graph.getOptions().isDirected || r.directed;
      let c;
      a ? c = C(s ? { svgIcon: Ti } : { svgIcon: Ai }) : c = C({ svgIcon: Di }), c.classList.add("edge"), a ? (c.classList.add(s ? "edge-out" : "edge-in"), c.setAttribute("title", s ? "Outgoing edge" : "Incoming edge")) : c.setAttribute("title", "Non-directed edge");
      const u = z(o, this.uiManager.getOptions().mainHeader), p = document.createElement("template");
      p.innerHTML = `
            <div class="pvt-neighbors-list__nodecontainer">
                <span class="pvt-neighbors-list__nodepreview">
                    <svg class="pvt-mainheader-icon" width="${e}" height="${e}" viewBox="0 0 ${e} ${e}" preserveAspectRatio="xMidYMid meet"></svg>
                </span>
                <span class="pvt-neighbors-list__nodename">${u}</span>
            </div>`;
      const g = p.content.firstElementChild, f = g.querySelector(".pvt-neighbors-list__nodepreview .pvt-mainheader-icon") ?? void 0, m = o.getGraphElement();
      if (f && m && m instanceof SVGGElement) {
        const w = m.cloneNode(!0), M = m.getBBox(), N = e / Math.max(M.width, M.height);
        w.setAttribute(
          "transform",
          `translate(${(e - M.width * N) / 2 - M.x * N}, ${(e - M.height * N) / 2 - M.y * N}) scale(${N})`
        ), f.appendChild(w);
      }
      const v = ue({
        text: d || "- empty -",
        size: "sm",
        variant: "secondary",
        class: ["pvt-neighbor-edge-description", d || "empty-label"]
      }), x = b(
        "div",
        {
          class: "edge-details"
        },
        [
          c,
          g,
          v
        ]
      );
      n.appendChild(x);
    }
    this.listContainer.appendChild(n);
  }
  buildStats(t) {
    if (!this.statContainer) return;
    this.statContainer.innerHTML = "";
    const e = b("dl", { class: "pvt-property-list" }), i = b(
      "dl",
      {
        class: "pvt-property-row"
      },
      [
        b("dt", { class: "pvt-property-name", title: "Total connections", style: "font-size: 1em;" }, ["Degree"]),
        b("dd", { class: "pvt-property-value", style: "display: flex; align-items: center; font-size: 1em;" }, [
          b("span", { style: "margin-right: 8px;" }, [t.degree().toString()]),
          b("span", {
            style: "display: inline-flex; align-items: center; margin-right: 8px; color: var(--pvt-text-color-secondary)",
            title: "Outgoing edges"
          }, [C({ svgIcon: Ri }), t.getEdgesOut().length.toString()]),
          b("span", {
            style: "display: inline-flex; align-items: center; color: var(--pvt-text-color-secondary)",
            title: "Incoming edges"
          }, [C({ svgIcon: zi }), t.getEdgesIn().length.toString()])
        ])
      ]
    );
    e.append(i);
    const n = b("div", { class: "core-stats" }, [e]), r = /* @__PURE__ */ new Map();
    [
      ...t.getEdgesOut(),
      ...t.getEdgesIn()
    ].forEach((c) => {
      const u = W(c, this.uiManager.getOptions().mainHeader) || "", p = r.get(u) || 0;
      r.set(u, p + 1);
    });
    const o = /* @__PURE__ */ new Map();
    o.set("Label", r);
    const d = Et(o, t.degree(), this.genActionButtonsSingleSelection.bind(this)), a = b("div", { class: "aggregated-labels" }, [d]);
    this.statContainer.appendChild(n), this.statContainer.appendChild(a);
  }
  genActionButtonsSingleSelection(t, e) {
    const i = b("button", {
      title: "Select nodes linked with this label"
    }, [C({ svgIcon: re })]);
    i.addEventListener("click", () => {
      const s = this.getNodesMatchingFilteredEdgeName(e);
      s && (this.uiManager.graph.renderer.getGraphInteraction().clearNodeSelectionList(), s.length > 1 ? this.uiManager.graph.renderer.getGraphInteraction().selectNodes(s) : this.uiManager.graph.renderer.getGraphInteraction().selectNode(s[0].element, s[0].node));
    });
    const n = b("button", {
      title: "Exclude nodes linked with this label"
    }, [C({ svgIcon: ne })]);
    return n.addEventListener("click", () => {
      const s = this.getNodesMatchingFilteredEdgeName(e, !0);
      s && (this.uiManager.graph.renderer.getGraphInteraction().clearNodeSelectionList(), s.length > 1 ? this.uiManager.graph.renderer.getGraphInteraction().selectNodes(s) : this.uiManager.graph.renderer.getGraphInteraction().selectNode(s[0].element, s[0].node));
    }), b("div", { class: "pvt-aggregated-property-actions" }, [
      i,
      n
    ]);
  }
  getNodesMatchingFilteredEdgeName(t, e = !1) {
    const i = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNode();
    if (!i) return;
    const n = i.node, r = [...n.getEdgesOut(), ...n.getEdgesIn()], s = /* @__PURE__ */ new Map();
    return r.filter((o) => {
      const d = W(o, this.uiManager.getOptions().mainHeader);
      return e ? d !== t : d === t;
    }).forEach((o) => {
      const d = n === o.from ? o.to : o.from;
      s.set(d.id.toString(), d);
    }), [...s.values()].map((o) => ({
      node: o,
      element: o.getGraphElement()
    }));
  }
  mergeNodesIntoNode(t) {
    const e = {
      size: 50,
      shape: "square",
      color: "transparent",
      strokeColor: "transparent",
      html: (a) => {
        const u = a.getData().aggregated_node_count, p = C({ svgIcon: se(28) });
        return p.style = "position: absolute;", k(`<div style="display: flex; flex-direction: column; position: relative; align-items: center;">
                    ${p.outerHTML}
                    <div style="
    height: 65%;
    width: 65%;
    margin-top: 18%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    background-color: var(--pvt-bg-color-5);">
                        <div style="height: auto; font-weight: 600; font-size: 1.5em;">+${u}</div>
                        <div style="height: auto;">Group</div>
                    </div>
                </div>`);
      }
    }, i = { label: `${t.length} nodes`, aggregated_node_count: t.length }, n = new A("aggregated-node", i, e);
    n.weight = 10;
    const r = new Set(t.map((a) => a.id.toString())), s = t.flatMap((a) => [
      ...a.getEdgesOut(),
      ...a.getEdgesIn()
    ]), o = [], d = [];
    for (const a of s) {
      const c = r.has(a.from.id), u = r.has(a.to.id);
      c !== u && (c ? o.push(a) : d.push(a));
    }
    return o.forEach((a, c) => {
      const u = a.to.clone();
      new B(`outgoing-${c}`, n, u, a.getData(), a.getStyle());
    }), d.forEach((a, c) => {
      const u = a.from.clone();
      new B(`incoming-${c}`, u, n, a.getData(), a.getStyle());
    }), n;
  }
}
class tn {
  constructor(t) {
    h(this, "uiManager");
    h(this, "sidebar");
    h(this, "sidebarOpen", !0);
    h(this, "sidebarMainHeader");
    h(this, "sidebarProperties");
    h(this, "sidebarNeighbors");
    h(this, "extraPanelManager");
    h(this, "mainHeaderPanel");
    h(this, "mainBodyPanel");
    h(this, "neighborPanel");
    h(this, "extraPanelContainer");
    h(this, "collapse");
    this.uiManager = t, this.sidebarMainHeader = new $i(this.uiManager), this.sidebarProperties = new Zi(this.uiManager), this.sidebarNeighbors = new Ji(this.uiManager), this.extraPanelManager = new Ki(this.uiManager);
  }
  mount(t) {
    if (!t) return;
    const e = `
<div class="pvt-sidebar-elements">
    <div class="pvt-mainheader-panel"></div>
    <div class="pvt-sidebar-separator"></div>
    <div class="pvt-properties-panel pvt-sidebar-panel"></div>
    <div class="pvt-sidebar-separator"></div>
    <div class="pvt-neighbor-panel pvt-sidebar-panel"></div>
    <div class="pvt-sidebar-separator"></div>
    <div class="pvt-extra-panel pvt-sidebar-panel"></div>
</div>`;
    this.sidebar = k(e), t.appendChild(this.sidebar);
  }
  destroy() {
    var t;
    this.sidebarMainHeader.destroy(), this.sidebarProperties.destroy(), (t = this.sidebar) == null || t.remove(), this.sidebar = void 0;
  }
  afterMount() {
    var t, e;
    this.sidebar && (this.mainHeaderPanel = this.sidebar.querySelector(".pvt-mainheader-panel") ?? void 0, this.sidebarMainHeader.mount(this.mainHeaderPanel), this.mainBodyPanel = this.sidebar.querySelector(".pvt-properties-panel") ?? void 0, this.sidebarProperties.mount(this.mainBodyPanel), this.neighborPanel = this.sidebar.querySelector(".pvt-neighbor-panel") ?? void 0, this.sidebarNeighbors.mount(this.neighborPanel), this.extraPanelContainer = this.sidebar.querySelector(".pvt-extra-panel") ?? void 0, this.extraPanelManager.mount(this.extraPanelContainer), this.collapse = b("span", { class: "pvt-sidebar-collapse-container" }, [
      b("span", { class: "pvt-sidebar-collapse-button pvt-sidebar-collapse-button-collapse" }, [C({ svgIcon: di })]),
      b("span", { class: "pvt-sidebar-collapse-button pvt-sidebar-collapse-button-expand" }, [C({ svgIcon: ci })])
    ]), this.sidebar.parentElement.appendChild(this.collapse), ((e = (t = this.uiManager.getOptions()) == null ? void 0 : t.sidebar) == null ? void 0 : e.collapsed) === !0 ? this.hideSidebar() : this.showSidebar(), this.sidebarMainHeader.afterMount(), this.sidebarProperties.afterMount(), this.sidebarNeighbors.afterMount(), this.extraPanelManager.afterMount());
  }
  graphReady() {
    var t;
    this.sidebarMainHeader.graphReady(), this.sidebarProperties.graphReady(), this.sidebarNeighbors.graphReady(), this.extraPanelManager.graphReady(), this.uiManager.graph.renderer.getGraphInteraction().on("selectNode", (e, i) => {
      this.sidebarMainHeader.updateNodeOverview(e, i), this.sidebarProperties.updateNodeProperties(e), this.sidebarNeighbors.updateNodeNeighbors(e), this.extraPanelManager.updateNode(e);
    }), this.uiManager.graph.renderer.getGraphInteraction().on("unselectNode", () => {
      this.sidebarMainHeader.clearOverview(), this.sidebarProperties.clearProperties(), this.sidebarNeighbors.clearNeighbors(), this.extraPanelManager.clear();
    }), this.uiManager.graph.renderer.getGraphInteraction().on("selectEdge", (e) => {
      this.sidebarMainHeader.updateEdgeOverview(e), this.sidebarProperties.updateEdgeProperties(e), this.sidebarNeighbors.updateEdgeNeighbors(e), this.extraPanelManager.updateEdge(e);
    }), this.uiManager.graph.renderer.getGraphInteraction().on("unselectEdge", () => {
      this.sidebarMainHeader.clearOverview(), this.sidebarProperties.clearProperties(), this.sidebarNeighbors.clearNeighbors(), this.extraPanelManager.clear();
    }), this.uiManager.graph.renderer.getGraphInteraction().on("selectNodes", (e) => {
      const i = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNodes();
      this.sidebarMainHeader.updateNodesOverview(i), this.sidebarProperties.updateNodesProperties(i), this.sidebarNeighbors.updateNodesNeighbors(i), this.extraPanelManager.updateNodes(i);
    }), this.uiManager.graph.renderer.getGraphInteraction().on("unselectNodes", () => {
      const e = this.uiManager.graph.renderer.getGraphInteraction().getSelectedNodes();
      e.length > 0 ? (this.sidebarMainHeader.updateNodesOverview(e), this.sidebarProperties.updateNodesProperties(e), this.sidebarNeighbors.updateNodesNeighbors(e), this.extraPanelManager.updateNodes(e)) : (this.sidebarMainHeader.clearOverview(), this.sidebarProperties.clearProperties(), this.sidebarNeighbors.clearNeighbors(), this.extraPanelManager.clear());
    }), this.uiManager.graph.renderer.getGraphInteraction().on("selectEdges", (e) => {
      this.sidebarMainHeader.updateEdgesOverview(e), this.sidebarProperties.updateEdgesProperties(e), this.sidebarNeighbors.updateEdgesNeighbors(e), this.extraPanelManager.updateEdges(e);
    }), this.uiManager.graph.renderer.getGraphInteraction().on("unselectEdges", () => {
      this.sidebarMainHeader.clearOverview(), this.sidebarProperties.clearProperties(), this.sidebarNeighbors.clearNeighbors(), this.extraPanelManager.clear();
    }), (t = this.collapse) == null || t.addEventListener("click", () => {
      this.toggleSidebar();
    });
  }
  toggleSidebar() {
    this.sidebar.closest(".pvt-sidebar").classList.toggle("pvt-sidebar-collapsed", this.sidebarOpen), this.sidebarOpen = !this.sidebarOpen;
  }
  showSidebar() {
    this.sidebar.closest(".pvt-sidebar").classList.remove("pvt-sidebar-collapsed"), this.sidebarOpen = !0;
  }
  hideSidebar() {
    this.sidebar.closest(".pvt-sidebar").classList.add("pvt-sidebar-collapsed"), this.sidebarOpen = !1;
  }
}
class en {
  constructor(t, e = {}) {
    h(this, "uiManager");
    h(this, "options");
    h(this, "slidePanel");
    h(this, "header");
    h(this, "body");
    h(this, "isOpen", !1);
    h(this, "DEFAULT_HEADER", null);
    h(this, "DEFAULT_BODY", "- empty panel -");
    this.uiManager = t, this.options = e, this.options.header || (this.options.header = this.DEFAULT_HEADER), this.options.body || (this.options.body = this.DEFAULT_BODY);
  }
  mount(t) {
    if (!t) return;
    const e = document.createElement("template");
    if (e.innerHTML = `
  <div class="pvt-slide-panel" id="pvt-side-panel">
  </div>
`, this.slidePanel = e.content.firstElementChild, this.slidePanel.innerHTML = "", this.options.header != null) {
      this.header = document.createElement("div"), this.header.className = "pvt-slide-panel__header", this.setHeader(this.options.header), this.slidePanel.appendChild(this.header);
      const i = _({
        text: "×",
        onClick: () => {
          this.close();
        },
        id: "pvt-sidePanel-close",
        class: "pvt-close-button",
        style: "margin-left: auto;"
      });
      this.header.appendChild(i);
    }
    this.body = document.createElement("div"), this.body.className = "pvt-slide-panel__content", this.setBody(this.options.body), this.slidePanel.appendChild(this.body), this.options.noBodyPadding ? this.body.style.padding = "0" : this.body.style.padding = "", t.appendChild(this.slidePanel);
  }
  destroy() {
    var t;
    (t = this.slidePanel) == null || t.remove(), this.slidePanel = void 0;
  }
  afterMount() {
  }
  graphReady() {
  }
  open() {
    var t;
    this.isOpen = !0, (t = this.slidePanel) == null || t.classList.add("open");
  }
  close() {
    var t;
    this.isOpen = !1, (t = this.slidePanel) == null || t.classList.remove("open");
  }
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  setHeader(t) {
    this.header && (this.header.innerHTML = "", t && (this.options.header instanceof HTMLElement ? this.header.appendChild(this.options.header) : this.options.rawHeader ? this.header.innerHTML = this.options.header : this.header.textContent = this.options.header));
  }
  setBody(t) {
    this.body && (this.body.innerHTML = "", t && (t instanceof HTMLElement ? this.body.appendChild(t) : this.options.rawBody ? this.body.innerHTML = t : this.body.textContent = t));
  }
}
class nn {
  constructor(t) {
    h(this, "uiManager");
    h(this, "searchBox");
    h(this, "searchInput");
    h(this, "searchResultsContainer");
    h(this, "searchSummaryContainer");
    h(this, "results");
    h(this, "highlightedIndex", 0);
    h(this, "MAX_RESULT_COUNT", 12);
    this.uiManager = t;
  }
  mount(t) {
    t && (this.searchBox = this.build(), t.appendChild(this.searchBox));
  }
  build() {
    var e, i;
    const t = document.createElement("template");
    return t.innerHTML = `
  <div id="pvt-searchbox" class="pvt-searchbox">
    <div class="search-container">
        <div class="input-container">
            <span class="icon-container">${oe}</span>
            <input id="pvt-search-input" type="text" name="pvt-search" placeholder="Search" class="search-text" autocomplete="off" />
        </div>
    </div>
    <div class="pvt-search-results"></div>
    <div class="pvt-search-summary"></div>
    <div class="pvt-search-hints">
        <span>
            <span class="pvt-search-icon">${_i}</span>
            <span class="pvt-search-icon">${Ii}</span>
            <span class="pvt-search-text">to navigate</span>
        </span>
        <span>
            <span class="pvt-search-icon">${Li}</span>
            <span class="pvt-search-text">to select</span>
        </span>
        <span>
            <span class="pvt-search-icon">esc</span>
            <span class="pvt-search-text">to close</span>
        </span>
    </div>
  </div>
`, this.searchBox = t.content.firstElementChild, this.searchInput = this.searchBox.querySelector("#pvt-search-input") ?? void 0, this.searchResultsContainer = this.searchBox.querySelector(".pvt-search-results") ?? void 0, this.searchSummaryContainer = this.searchBox.querySelector(".pvt-search-summary") ?? void 0, (e = this.searchInput) == null || e.addEventListener("input", () => {
      this.searchAndShowResults(this.searchInput.value), this.updateHighlight();
    }), (i = this.searchInput) == null || i.addEventListener("keydown", (n) => {
      var s;
      if (n.key == "Escape") {
        this.dispatchEvent("pvt-searchbox-close");
        return;
      }
      if (!this.results || this.results.length < 1) return;
      const r = Math.min(this.MAX_RESULT_COUNT, this.results.length);
      switch (n.key) {
        case "ArrowDown":
          n.preventDefault(), this.highlightedIndex = (this.highlightedIndex + 1) % r, this.updateHighlight();
          break;
        case "ArrowUp":
          n.preventDefault(), this.highlightedIndex = (this.highlightedIndex - 1 + r) % r, this.updateHighlight();
          break;
        case "Enter":
          if (n.preventDefault(), this.highlightedIndex >= 0) {
            const o = (s = this.searchResultsContainer) == null ? void 0 : s.children[this.highlightedIndex];
            o == null || o.click();
          }
          break;
      }
    }), this.searchBox;
  }
  destroy() {
    var t;
    (t = this.searchBox) == null || t.remove(), this.searchBox = void 0;
  }
  afterMount() {
  }
  graphReady() {
  }
  buildResult(t) {
    const i = document.createElement("template");
    i.innerHTML = `
  <div class="pvt-search-result">
    <div>
        <div class="pvt-search-result__nodepreview">
            <svg class="pvt-mainheader-icon" width="30" height="30" viewBox="0 0 30 30" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div class="pvt-search-result__name"></div>
    </div>
    <div class="pvt-search-result__info">
        <div class="pvt-search-result__info_key"></div>
        <div class="pvt-search-result__info_value"></div>
    </div>
  </div>
`;
    const n = t[0], r = t[1], s = i.content.firstElementChild, o = s.querySelector(".pvt-search-result__nodepreview .pvt-mainheader-icon") ?? void 0, d = s.querySelector(".pvt-search-result__name") ?? void 0, a = s.querySelector(".pvt-search-result__info_key") ?? void 0, c = s.querySelector(".pvt-search-result__info_value") ?? void 0;
    s.addEventListener("click", () => {
      this.clickHandler(n);
    });
    const u = n.getGraphElement();
    if (u && u instanceof SVGGElement) {
      const p = u.cloneNode(!0), g = u.getBBox(), f = 30 / Math.max(g.width, g.height);
      p.setAttribute(
        "transform",
        `translate(${(30 - g.width * f) / 2 - g.x * f}, ${(30 - g.height * f) / 2 - g.y * f}) scale(${f})`
      ), o.appendChild(p);
    }
    return d.textContent = z(n, this.uiManager.getOptions().mainHeader), a.textContent = `.${r.key}: `, c.textContent = r.value, s;
  }
  updateHighlight() {
    !this.results || !this.searchResultsContainer || this.results.forEach((t, e) => {
      var n;
      const i = (n = this.searchResultsContainer) == null ? void 0 : n.children[e];
      i && (e === this.highlightedIndex ? i.classList.add("active") : i.classList.remove("active"));
    });
  }
  search(t) {
    const e = [], i = t.trim().toLowerCase();
    if (!(!i || i.length < 2)) {
      for (const n of this.uiManager.graph.getMutableNodes()) {
        const r = n.getData();
        for (const s in r) {
          const o = r[s];
          if (o == null) continue;
          const d = String(o).toLowerCase();
          let a = i.startsWith('"') ? i.slice(1) : i;
          const c = i.startsWith('"') && i.endsWith('"');
          if (c && (a = a.slice(0, -1).trim()), c ? d === a : d.includes(a)) {
            const p = { key: s, value: String(o) };
            e.push([n, p]);
            break;
          }
        }
      }
      return e;
    }
  }
  clickHandler(t) {
    this.dispatchEvent("pvt-searchbox-select", t);
  }
  searchAndShowResults(t) {
    if (!(!this.searchResultsContainer || !this.searchSummaryContainer) && (this.results = void 0, this.searchResultsContainer.innerHTML = "", this.searchSummaryContainer.innerHTML = "", this.results = this.search(t), this.results)) {
      const e = [];
      for (const i of this.results) {
        if (e.length >= this.MAX_RESULT_COUNT) break;
        e.push(this.buildResult(i));
      }
      e.forEach((i) => {
        var n;
        (n = this.searchResultsContainer) == null || n.appendChild(i);
      }), this.searchSummaryContainer.appendChild(this.createSummary());
    }
  }
  createSummary() {
    if (!this.results) return document.createElement("div");
    let t = "";
    this.results.length === 0 ? t = "No results found" : this.results.length > this.MAX_RESULT_COUNT ? t = `Showing top ${this.MAX_RESULT_COUNT} of ${this.results.length} results` : t = `${this.results.length} results`;
    const e = document.createElement("template");
    return e.innerHTML = `
  <div>
    ${t}
  </div>
`, e.content.firstElementChild;
  }
  dispatchEvent(t, e) {
    if (!this.searchBox) return;
    const i = new CustomEvent(t, {
      detail: e,
      bubbles: !0,
      cancelable: !0
    });
    this.searchBox.dispatchEvent(i);
  }
}
class qt {
  constructor(t, e = {}) {
    h(this, "root");
    h(this, "select");
    h(this, "options", []);
    h(this, "selected", /* @__PURE__ */ new Set());
    h(this, "mode");
    h(this, "searchable");
    h(this, "dropdown");
    h(this, "input");
    h(this, "chipsContainer");
    h(this, "listContainer");
    h(this, "clearButton");
    h(this, "singleCloseButton");
    h(this, "inputWrap");
    h(this, "searchWrap");
    h(this, "searchInput");
    h(this, "focusedIndex", -1);
    this.select = t, this.root = document.createElement("div"), this.root.className = "pvt-picker", this.mode = e.mode ?? (t.multiple ? "multi" : "single"), this.searchable = e.searchable ?? !0, this.parseOptions(), this.build(), this.syncFromSelect(), this.attach();
  }
  parseOptions() {
    this.options = Array.from(this.select.options).filter((t) => t.value).map((t) => ({
      value: t.value,
      label: t.text,
      disabled: t.disabled
    }));
  }
  build() {
    var e;
    this.select.style.display = "none", (e = this.select.parentElement) == null || e.insertBefore(this.root, this.select);
    const t = document.createElement("div");
    t.className = "pvt-picker__control", this.chipsContainer = document.createElement("div"), this.chipsContainer.className = "pvt-picker__chips", this.clearButton = document.createElement("button"), this.clearButton.className = "pvt-picker__clear", this.clearButton.textContent = "×", this.clearButton.tabIndex = -1, this.clearButton.style.display = "none", this.clearButton.type = "button", this.inputWrap = document.createElement("div"), this.inputWrap.className = "pvt-picker__input-wrap", this.input = document.createElement("input"), this.input.className = "pvt-picker__input", this.input.placeholder = this.select.getAttribute("placeholder") || "Select...", this.input.type = "text", this.singleCloseButton = document.createElement("button"), this.singleCloseButton.className = "pvt-picker__single-close", this.singleCloseButton.textContent = "×", this.singleCloseButton.type = "button", this.singleCloseButton.style.display = "none", this.inputWrap.appendChild(this.input), this.inputWrap.appendChild(this.singleCloseButton), this.dropdown = document.createElement("div"), this.dropdown.className = "pvt-picker__dropdown", this.listContainer = document.createElement("div"), this.listContainer.className = "pvt-picker__list", this.dropdown.appendChild(this.listContainer), this.mode === "multi" ? (t.appendChild(this.chipsContainer), t.appendChild(this.clearButton)) : t.appendChild(this.inputWrap), this.mode === "multi" && (this.searchWrap = document.createElement("div"), this.searchWrap.className = "pvt-picker__search", this.searchInput = document.createElement("input"), this.searchInput.className = "pvt-picker__search-input", this.searchInput.placeholder = this.select.getAttribute("placeholder") || "Search...", this.searchWrap.appendChild(this.searchInput), this.dropdown.insertBefore(this.searchWrap, this.listContainer)), this.root.appendChild(t), this.root.appendChild(this.dropdown), this.renderList(), this.renderChips();
  }
  attach() {
    const t = this.root.querySelector(".pvt-picker__control");
    t == null || t.addEventListener("click", (n) => {
      if (this.mode === "single") {
        if (this.dropdown.classList.toggle("open"), this.focusedIndex = -1, this.dropdown.classList.contains("open")) {
          if (this.selected.size === 0) {
            const r = this.select.getAttribute("placeholder") || "Select...";
            this.input.placeholder = r, this.input.value = "";
          }
          this.renderList(), this.focusedIndex === -1 && (this.focusedIndex = 0, this.updateFocusedOption());
        }
        return;
      }
      n.target.tagName !== "BUTTON" && !n.target.classList.contains("pvt-picker__chip-remove") && (this.dropdown.classList.toggle("open"), this.focusedIndex = -1, this.dropdown.classList.contains("open") && (this.searchInput.focus(), this.focusedIndex === -1 && (this.focusedIndex = 0, this.updateFocusedOption())));
    });
    const e = (n) => this.handleKeyDown(n);
    this.searchInput ? (this.searchInput.addEventListener("input", () => {
      this.focusedIndex = -1, this.renderList(this.searchInput.value);
    }), this.searchInput.addEventListener("focus", (n) => {
      n.stopPropagation(), this.dropdown.classList.add("open");
    }), this.searchInput.addEventListener("keydown", e)) : (this.input.addEventListener("keydown", e), this.input.addEventListener("input", () => {
      this.focusedIndex = -1, this.renderList(this.input.value);
    }), this.input.addEventListener("keydown", (n) => {
      n.key === "Backspace" && this.input.value && this.selected.size === 1 && (n.preventDefault(), this.selected.clear(), this.input.value = "", this.syncToSelect(), this.syncFromSelect());
    })), document.addEventListener("pointerdown", (n) => {
      this.root.contains(n.target) || this.dropdown.classList.remove("open");
    }), this.clearButton.addEventListener("click", () => this.clear()), this.singleCloseButton.addEventListener("click", (n) => {
      n.stopPropagation(), this.selected.clear(), this.syncToSelect(), this.syncFromSelect(), this.dropdown.classList.remove("open");
    }), new MutationObserver((n) => {
      let r = !1;
      for (const s of n) {
        for (const o of s.addedNodes)
          if (o.tagName === "OPTION") {
            r = !0;
            break;
          }
        for (const o of s.removedNodes)
          if (o.tagName === "OPTION") {
            r = !0;
            break;
          }
        if (r) break;
      }
      r && this.syncFromSelect();
    }).observe(this.select, { childList: !0, subtree: !0 });
  }
  renderList(t = "") {
    this.listContainer.innerHTML = "";
    const e = this.searchable ? this.options.filter(
      (i) => t ? i.label.toLowerCase().includes(t.toLowerCase()) : !0
    ) : this.options;
    if (e.length === 0) {
      const i = document.createElement("div");
      i.className = "pvt-picker__no-options", i.textContent = "No options available", this.listContainer.appendChild(i);
    }
    e.forEach((i, n) => {
      const r = document.createElement("div");
      r.className = "pvt-picker__option", i.disabled && r.classList.add("disabled"), this.selected.has(i.value) && r.classList.add("selected"), n === this.focusedIndex && (r.classList.add("focused"), this.selected.has(i.value) && r.classList.add("focused-selected")), r.textContent = i.label, r.addEventListener("click", (s) => {
        if (s.stopPropagation(), !i.disabled) {
          if (this.mode === "single") {
            this.selected.clear(), this.selected.add(i.value);
            const o = this.options.find((d) => d.value === i.value);
            this.input.value = o ? o.label : "", this.input.placeholder = "", this.focusedIndex = -1, this.dropdown.classList.remove("open"), this.syncToSelect(), this.syncFromSelect();
            return;
          } else
            this.selected.has(i.value) ? this.selected.delete(i.value) : this.selected.add(i.value);
          this.focusedIndex = n, this.syncToSelect(), this.renderList(this.mode === "multi" ? this.searchInput.value : this.input.value), this.renderChips();
        }
      }), this.listContainer.appendChild(r);
    });
  }
  handleKeyDown(t) {
    var n;
    if (!this.dropdown.classList.contains("open")) return;
    const e = this.searchable ? this.options.filter(
      (r) => {
        var s;
        return (s = this.searchInput) != null && s.value ? r.label.toLowerCase().includes(this.searchInput.value.toLowerCase()) : !0;
      }
    ) : this.options, i = e.length;
    switch (t.key) {
      case "ArrowDown":
        if (t.preventDefault(), this.mode === "multi")
          for (let r = 0; r < i; r++) {
            const s = (this.focusedIndex + 1 + r) % i;
            if (!this.selected.has(e[s].value)) {
              this.focusedIndex = s, this.updateFocusedOption();
              break;
            }
          }
        else
          this.focusedIndex = (this.focusedIndex + 1) % i, this.updateFocusedOption();
        break;
      case "ArrowUp":
        if (t.preventDefault(), this.mode === "multi")
          for (let r = 0; r < i; r++) {
            const s = this.focusedIndex - 1 - r < 0 ? i + this.focusedIndex - 1 - r : this.focusedIndex - 1 - r;
            if (!this.selected.has(e[s].value)) {
              this.focusedIndex = s, this.updateFocusedOption();
              break;
            }
          }
        else
          this.focusedIndex = this.focusedIndex <= 0 ? i - 1 : this.focusedIndex - 1, this.updateFocusedOption();
        break;
      case "Enter":
        if (this.focusedIndex >= 0 && this.focusedIndex < i) {
          t.preventDefault();
          const r = e[this.focusedIndex];
          if (!r.disabled) {
            if (this.mode === "multi" && this.selected.has(r.value)) return;
            if (this.mode === "single" && this.selected.has(r.value)) {
              this.focusedIndex = -1, this.dropdown.classList.remove("open");
              return;
            }
            if (this.mode === "single") {
              this.selected.clear(), this.selected.add(r.value);
              const s = this.options.find((o) => o.value === r.value);
              this.input.value = s ? s.label : "", this.input.placeholder = "", this.focusedIndex = -1, this.dropdown.classList.remove("open"), this.syncToSelect(), this.syncFromSelect();
            } else
              this.selected.has(r.value) ? this.selected.delete(r.value) : this.selected.add(r.value), this.focusedIndex = -1, this.syncToSelect(), this.renderList(((n = this.searchInput) == null ? void 0 : n.value) || ""), this.renderChips();
          }
        }
        break;
      case "Escape":
        t.preventDefault(), this.dropdown.classList.remove("open");
        break;
    }
  }
  updateFocusedOption() {
    const t = this.listContainer.querySelectorAll(".pvt-picker__option");
    if (t.forEach((e, i) => {
      const n = i === this.focusedIndex;
      e.classList.toggle("focused", n), e.classList.toggle("focused-selected", n && e.classList.contains("selected"));
    }), this.focusedIndex >= t.length) {
      this.focusedIndex = -1;
      return;
    }
    if (this.focusedIndex >= 0) {
      const e = this.listContainer.children[this.focusedIndex];
      e == null || e.scrollIntoView({ block: "nearest" });
    }
  }
  renderChips() {
    if (this.mode !== "single") {
      if (this.chipsContainer.innerHTML = "", this.selected.size > 0)
        this.selected.forEach((t) => {
          const e = this.options.find((s) => s.value === t);
          if (!e) return;
          const i = document.createElement("span");
          i.className = "pvt-picker__chip";
          const n = document.createElement("span");
          n.className = "pvt-picker__chip-label", n.textContent = e.label;
          const r = document.createElement("button");
          r.className = "pvt-picker__chip-remove", r.textContent = "×", r.setAttribute("aria-label", `Remove ${e.label}`), r.addEventListener("click", (s) => {
            s.stopPropagation(), this.selected.delete(t), this.syncToSelect(), this.renderChips(), this.renderList(this.searchInput.value);
          }), i.appendChild(n), i.appendChild(r), this.chipsContainer.appendChild(i);
        });
      else {
        const t = document.createElement("span");
        t.className = "pvt-picker__placeholder", t.textContent = this.select.getAttribute("placeholder") || "Select...", this.chipsContainer.appendChild(t);
      }
      this.clearButton.style.display = this.selected.size > 0 ? "" : "none";
    }
  }
  syncToSelect() {
    Array.from(this.select.options).forEach((t) => {
      t.selected = this.selected.has(t.value);
    }), this.select.dispatchEvent(new Event("change", { bubbles: !0 }));
  }
  syncFromSelect() {
    if (this.selected.clear(), Array.from(this.select.selectedOptions).forEach((t) => {
      if (!t.value) return;
      this.options.find((i) => i.value === t.value) && this.selected.add(t.value);
    }), this.mode === "single") {
      if (this.selected.size === 1) {
        const t = this.selected.values().next().value, e = this.options.find((i) => i.value === t);
        e && (this.input.value = e.label, this.input.placeholder = "");
      } else {
        const t = this.select.getAttribute("placeholder") || "Select...";
        this.input.value = "", this.input.placeholder = t;
      }
      this.mode === "single" && (this.singleCloseButton.style.display = this.selected.size > 0 ? "" : "none");
    }
    this.renderChips(), this.renderList(this.input.value);
  }
  /**
   * Manual sync — call after programmatically changing options on the original <select>.
   * Also watches DOM mutations automatically, but this is useful for JS-driven changes
   * that don't touch the DOM (e.g., adding/removing <option> elements via framework).
   */
  sync() {
    this.syncFromSelect();
  }
  clear() {
    this.selected.clear(), this.syncToSelect(), this.syncFromSelect(), this.renderList(this.searchInput.value), this.dropdown.classList.remove("open");
  }
  /**
   * Get the currently selected values.
   */
  getValues() {
    return Array.from(this.selected);
  }
  /**
   * Programmatically set selected values.
   */
  setValues(t) {
    if (this.selected = new Set(t), this.syncToSelect(), this.mode === "single" && this.selected.size === 1) {
      const e = this.selected.values().next().value, i = this.options.find((n) => n.value === e);
      i && (this.input.value = i.label, this.input.placeholder = "");
    }
    this.renderChips(), this.renderList(this.input.value);
  }
  /**
   * Access the underlying PivotickPicker from the original <select> element.
   * Usage: (element as HTMLSelectElement)._picker
   */
  get picker() {
    return this;
  }
}
class vt {
  static createForm(t) {
    const e = document.createElement("form");
    return e.className = "pvt-form", t.fields.forEach((i) => {
      e.appendChild(this.createField(i));
    }), e;
  }
  static getValues(t) {
    const e = {};
    return t.querySelectorAll("[data-field-key]").forEach((n) => {
      const r = n.getAttribute("data-field-key");
      switch (n.getAttribute("data-field-type")) {
        case "text":
          e[r] = n.value || void 0;
          break;
        case "select": {
          const o = n;
          e[r] = o.value || void 0, o.dataset.fieldValuesAreBoolean === "yes" && e[r] !== void 0 && e[r] === "true" && (e[r] = !0);
          break;
        }
        case "multiselect": {
          const o = n;
          e[r] = Array.from(
            o.selectedOptions
          ).map((d) => d.value).filter((d) => d.length > 0), o.dataset.fieldValuesAreBoolean === "yes" && e[r].map((d) => d !== void 0 && d === "true" ? !0 : d);
          break;
        }
        case "checkbox":
          e[r] = n.checked;
          break;
        case "numberRange": {
          const o = n.querySelector(".min").value, d = n.querySelector(".max").value;
          e[r] = {
            min: o ? Number(o) : void 0,
            max: d ? Number(d) : void 0
          };
          break;
        }
      }
    }), console.log(e), e;
  }
  static clear(t) {
    t.reset();
  }
  static createField(t) {
    const e = document.createElement("div");
    e.className = "pvt-form-element";
    const i = document.createElement("label");
    switch (i.htmlFor = `pvt-form-element-${t.key}`, i.textContent = this.niceLabelFromKey(t.label), e.appendChild(i), t.type) {
      case "select":
        e.appendChild(this.createSelect(t));
        break;
      case "multiselect":
        e.appendChild(this.createMultiSelect(t));
        break;
      case "checkbox":
        e.appendChild(this.createCheckbox(t));
        break;
      case "text":
        e.appendChild(this.createText(t));
        break;
      case "numberRange":
        e.appendChild(this.createNumberRange(t));
        break;
    }
    return e;
  }
  static baseAttrs(t, e) {
    t.id = `pvt-form-element-${e.key}`, t.setAttribute("data-field-key", e.key), t.setAttribute("data-field-type", e.type);
  }
  static buildSelect(t) {
    var i;
    const e = document.createElement("select");
    if (this.baseAttrs(e, t), t.allowEmpty) {
      const n = document.createElement("option");
      n.value = "", n.textContent = "", n.selected = !0, e.appendChild(n);
    }
    return t.valuesAreBoolean && e.setAttribute("data-field-values-are-boolean", "yes"), (i = t.options) == null || i.forEach((n) => {
      const r = document.createElement("option");
      r.value = n.value, r.textContent = n.label, t.defaultValue && (Array.isArray(t.defaultValue) ? t.defaultValue.includes(n.value) : t.defaultValue === n.value) && (r.selected = !0), e.appendChild(r);
    }), e;
  }
  static createSelect(t) {
    const e = this.buildSelect(t);
    return requestAnimationFrame(() => {
      new qt(e, {});
    }), e;
  }
  static createMultiSelect(t) {
    const e = this.buildSelect(t);
    return e.multiple = !0, requestAnimationFrame(() => {
      new qt(e, {});
    }), e;
  }
  static createCheckbox(t) {
    const e = document.createElement("input");
    return e.type = "checkbox", t.defaultValue === !0 && (e.checked = !0), this.baseAttrs(e, t), e;
  }
  static createText(t) {
    const e = document.createElement("input");
    return e.type = "text", e.placeholder = t.placeholder ?? "", this.baseAttrs(e, t), t.defaultValue && (e.value = String(t.defaultValue)), e;
  }
  static createNumberRange(t) {
    const e = document.createElement("div");
    e.className = "pvt-number-range", this.baseAttrs(e, t);
    const i = document.createElement("input");
    i.type = "number", i.placeholder = "Min", i.className = "min";
    const n = document.createElement("input");
    n.type = "number", n.placeholder = "Max", n.className = "max";
    const r = typeof t.defaultValue == "object" && t.defaultValue !== null ? t.defaultValue : void 0;
    return (r == null ? void 0 : r.min) != null && (i.value = String(r.min)), (r == null ? void 0 : r.max) != null && (n.value = String(r.max)), e.append(i, n), e;
  }
  static niceLabelFromKey(t) {
    return t.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ").trim().split(" ").map((i) => i.charAt(0).toUpperCase() + i.slice(1).toLowerCase()).join(" ");
  }
}
const rn = "Filter Graph";
class sn {
  constructor(t) {
    h(this, "uiManager");
    h(this, "graphFilter");
    h(this, "formOptions");
    h(this, "manuallyFilteredContainer");
    this.uiManager = t, this.formOptions = [];
  }
  mount(t) {
    t && (this.build(), this.graphFilter && t.appendChild(this.graphFilter));
  }
  destroy() {
    var t;
    (t = this.graphFilter) == null || t.remove(), this.graphFilter = void 0;
  }
  afterMount() {
  }
  graphReady() {
  }
  build() {
    return this.graphFilter = document.createElement("div"), this.graphFilter.classList.add("pvt-graph-filter-container"), this.uiManager.graph.on("dataBatchChanged", () => {
      this.rebuild();
    }), this.uiManager.graph.queryEngine.on("filterChange", (t) => {
      this.updateUIFilterButtonContent(t), this.updateUIFilterHiddenNodes();
    }), requestAnimationFrame(() => {
      this.updateUIFilterButtonContent({}), this.updateUIFilterHiddenNodes();
    }), this.graphFilter;
  }
  rebuild() {
    var o;
    if (!this.graphFilter) return;
    const t = _({
      variant: "secondary",
      text: "Reset",
      size: "sm",
      style: "align-self: end;",
      svgIcon: Ei,
      onClick: () => {
        vt.clear(i);
        const d = {};
        this.filterGraph(d);
      }
    }), e = this.getAvailableNodeAttributes();
    this.formOptions = Object.entries(e).map(([d, a]) => {
      let c = "text", u = "exact", p = !1;
      a.values ? a.values && a.values.every((f) => f.length < 64) ? a.values.length > 2 ? (c = "multiselect", u = "partial") : c = "select" : a.values.every((f) => typeof f == "boolean") && (c = "select", a.values = ["true", "false"], p = !0) : c = "numberRange";
      const g = {
        key: d,
        label: d,
        type: c,
        matchMode: u,
        valuesAreBoolean: p
      };
      return (g.type == "select" || g.type == "multiselect") && a.values && (g.options = a.values.map((f) => ({
        label: f,
        value: f
      })), g.allowEmpty = !0), g;
    });
    const i = vt.createForm({
      fields: this.formOptions
    }), n = _({
      variant: "primary",
      text: "Filter Graph",
      size: "block",
      style: "margin-top: 16px;",
      svgIcon: ae,
      onClick: () => {
        const d = vt.getValues(i);
        this.filterGraph(d);
      }
    }), r = b("div", { class: "pvt-sidebar-separator" });
    this.manuallyFilteredContainer = k(`<div class="pvt-hidden-nodes-container">
                <h4>Hidden nodes</h4>
                <div class="pvt-hidden-nodes-container-list"></div>
            </div>`);
    const s = _({
      variant: "secondary",
      text: "Show all nodes",
      size: "sm",
      style: "align-self: end;",
      svgIcon: Gt,
      onClick: () => {
        this.uiManager.graph.queryEngine.clearNodeExclusions();
      },
      title: "Restore manually hidden nodes"
    });
    (o = this.manuallyFilteredContainer.querySelector("h4")) == null || o.appendChild(s), this.graphFilter.appendChild(t), this.graphFilter.appendChild(i), this.graphFilter.appendChild(n), this.graphFilter.appendChild(r), this.graphFilter.appendChild(this.manuallyFilteredContainer);
  }
  updateUIFilterButtonContent(t) {
    var s, o;
    const e = (s = this.uiManager.toolbar) == null ? void 0 : s.filterButton, i = e == null ? void 0 : e.querySelector(".action-text");
    if (!i) return;
    i.innerHTML = "";
    let n = Object.keys(t).length;
    const r = (o = t.manuallyHidden) == null ? void 0 : o.value;
    if (Array.isArray(r) && r.length == 0 && n--, n > 0) {
      const d = n > 1 ? `${n} active filters` : "1 active filter", a = this.uiManager.graph.queryEngine.getHiddenNodeCount(), c = b(
        "span",
        {
          class: "active-filter-subtext"
        },
        [
          b("span", {}, ["·"]),
          b("span", {}, [`${a} hidden`])
        ]
      ), u = ue({
        text: d,
        html: c,
        variant: "primary",
        size: "sm"
      });
      i.appendChild(u);
    } else
      i.textContent = rn;
  }
  updateUIFilterHiddenNodes() {
    if (!this.manuallyFilteredContainer) return;
    const t = this.manuallyFilteredContainer.querySelector(".pvt-hidden-nodes-container-list");
    t && (this.uiManager.graph.queryEngine.getExcludedNodeCount() > 0 ? (this.manuallyFilteredContainer.classList.remove("hidden"), t.innerHTML = "", this.uiManager.graph.queryEngine.getExcludedNodes().forEach((e) => {
      const i = Object.keys(e.getData()).length, n = e.getEdgesIn().length + e.getEdgesOut().length, r = _({
        variant: "secondary",
        text: "Show node",
        size: "sm",
        title: "Restore manually hidden node",
        svgIcon: Gt,
        onClick: () => {
          this.uiManager.graph.queryEngine.includeNode(e);
        }
      }), s = b(
        "span",
        {
          class: "subtext"
        },
        [
          b("span", { class: "nodeinfo" }, [i.toString(), C({ svgIcon: Oi })]),
          "·",
          b("span", { class: "nodeinfo" }, [n.toString(), C({ svgIcon: st(24) })])
        ]
      ), o = b(
        "div",
        {
          class: "hidden-node"
        },
        [
          z(e, this.uiManager.getOptions().mainHeader),
          s,
          r
        ]
      );
      o.addEventListener("mouseenter", (d) => {
        var a;
        (a = this.uiManager.tooltip) == null || a.openForNodeOnElement(d, e);
      }), o.addEventListener("mouseleave", () => {
        var d;
        (d = this.uiManager.tooltip) == null || d.hide();
      }), t == null || t.appendChild(o);
    })) : this.manuallyFilteredContainer.classList.add("hidden"));
  }
  getAvailableNodeAttributes() {
    const t = /* @__PURE__ */ new Map();
    this.uiManager.graph.getMutableNodes().forEach((n) => {
      Object.entries(n.getData()).forEach(([r, s]) => {
        let o = t.get(r);
        o || (o = {
          numbers: /* @__PURE__ */ new Set(),
          values: /* @__PURE__ */ new Set()
        }), Number.isInteger(s) ? o.range.add(s) : o.values.add(s), t.set(r, o);
      });
    });
    const i = /* @__PURE__ */ new Map();
    return t.forEach((n, r) => {
      const s = {};
      n.values ? s.values = [.../* @__PURE__ */ new Set([...n.values, ...n.numbers])] : n.number && (s.range = [Math.min(...n.numbers), Math.max(...n.numbers)]), i.set(r, s);
    }), Object.fromEntries(i);
  }
  filterGraph(t) {
    const e = this.getActiveFilters(t), i = {}, n = Object.fromEntries(this.formOptions.map((r) => [r.key, r]));
    for (const [r, s] of Object.entries(e)) {
      const o = {
        value: s,
        matchMode: n[r].matchMode
      };
      s !== void 0 && (i[r] = o);
    }
    this.uiManager.graph.queryEngine.resetFilters(), this.uiManager.graph.queryEngine.setFilters(i);
  }
  getActiveFilters(t) {
    const e = {};
    for (const [i, n] of Object.entries(t))
      this.isFilterActive(n) ? e[i] = n : e[i] = void 0;
    return e;
  }
  isFilterActive(t) {
    return t === void 0 ? !1 : typeof t == "string" ? t.trim() !== "" : typeof t == "number" || typeof t == "boolean" ? !0 : Array.isArray(t) ? t.length > 0 : typeof t == "object" ? t.min !== void 0 || t.max !== void 0 : !1;
  }
}
class on {
  constructor(t) {
    h(this, "uiManager");
    h(this, "toolbar");
    h(this, "searchBoxButton");
    h(this, "filterButton");
    h(this, "undoButton");
    h(this, "redoButton");
    h(this, "filteringSlidepanel");
    h(this, "searchModal");
    this.uiManager = t;
  }
  mount(t) {
    if (!t) return;
    this.toolbar = document.createElement("div"), this.toolbar.className = "pvt-toolbar-elements";
    const e = document.createElement("template");
    e.innerHTML = `
  <div id="pvt-searchbox-button" class="pvt-action-button">
    <div class="action-container">
        <span class="icon-container">${oe}</span>
        <span class="action-text">Search</span>
        <span class="pvt-keyboard-shortcut">Ctrl J</span>
    </div>
  </div>`, this.searchBoxButton = e.content.firstElementChild, this.toolbar.appendChild(this.searchBoxButton);
    const i = document.createElement("template");
    i.innerHTML = `
  <div id="pvt-filter-button" class="pvt-action-button">
    <div class="action-container">
        <span class="icon-container">${ae}</span>
        <span class="action-text">Filter Graph</span>
        <span class="pvt-keyboard-shortcut">Ctrl K</span>
    </div>
  </div>`, this.filterButton = i.content.firstElementChild;
    const n = document.createElement("template");
    n.innerHTML = `
  <div class="pvt-right">
    <div class="pvt-undoredo-group">
        <button id="pvt-undo-button" class="pvt-button-undo" disabled>
            ${ki}
        </button>
        <button id="pvt-redo-button" class="pvt-button-redo" disabled>
            ${Ni}
        </button>
    </div>
  </div>`;
    const r = n.content.firstElementChild;
    r.prepend(this.filterButton), this.undoButton = r.querySelector("#pvt-undo-button") ?? void 0, this.redoButton = r.querySelector("#pvt-redo-button") ?? void 0, this.toolbar.appendChild(r), t.appendChild(this.toolbar);
  }
  destroy() {
    var t;
    (t = this.toolbar) == null || t.remove(), this.toolbar = void 0;
  }
  afterMount() {
    var e;
    if (!this.filterButton) return;
    this.uiManager.keyManager.register({ key: "Ctrl+j", callback: () => {
      var i;
      return (i = this.searchBoxButton) == null ? void 0 : i.click();
    } }), this.uiManager.keyManager.register({ key: "Ctrl+k", callback: () => {
      var i;
      return (i = this.filterButton) == null ? void 0 : i.click();
    } });
    const t = new sn(this.uiManager);
    this.filteringSlidepanel = this.uiManager.createSlidepanel({
      header: "Graph Filters",
      body: t.build()
    }), this.filterButton.addEventListener("click", () => {
      this.filteringSlidepanel.toggle();
    }), (e = this.searchBoxButton) == null || e.addEventListener("click", () => {
      var i, n;
      this.searchModal || (this.searchModal = this.uiManager.createModal({
        body: "",
        buttons: null,
        position: "top",
        size: "xl",
        noBodyPadding: !0
      }), this.searchModal && ((i = this.searchModal.modal) == null || i.addEventListener("pvt-modal-show", () => {
        var s, o, d, a;
        const r = new nn(this.uiManager);
        (s = this.searchModal) == null || s.setBody(r.build()), (o = r.searchInput) == null || o.focus(), (d = r.searchBox) == null || d.addEventListener("pvt-searchbox-select", (c) => {
          var g;
          const p = c.detail;
          this.uiManager.graph.selectElement(p), (g = this.searchModal) == null || g.destroy();
        }), (a = r.searchBox) == null || a.addEventListener("pvt-searchbox-close", () => {
          var c;
          (c = this.searchModal) == null || c.destroy();
        });
      }), (n = this.searchModal.modal) == null || n.addEventListener("pvt-modal-hidden", () => {
        this.searchModal = void 0;
      })));
    });
  }
  graphReady() {
  }
}
class an {
  constructor(t, e) {
    h(this, "uiManager");
    h(this, "options");
    h(this, "overlay");
    h(this, "modal");
    h(this, "header");
    h(this, "body");
    h(this, "footer");
    h(this, "DEFAULT_HEADER", null);
    h(this, "DEFAULT_BODY", "");
    h(this, "DEFAULT_BUTTON_CONFIG", {
      text: "Ok",
      variant: "primary",
      onClick: (t, e) => {
        e();
      }
    });
    this.uiManager = t, this.options = e, this.options.header || (this.options.header = this.DEFAULT_HEADER), this.options.body || (this.options.body = this.DEFAULT_BODY), !this.options.buttons && this.options.buttons !== null && (this.options.buttons = [this.DEFAULT_BUTTON_CONFIG]), this.options.position = e.position ?? "center";
  }
  mount(t) {
    if (!t) return;
    this.overlay = document.createElement("div"), this.overlay.className = "pvt-modal-overlay", this.overlay.classList.add(
      this.options.position === "center" ? "pvt-modal-overlay-center" : "pvt-modal-overlay-top"
    ), this.overlay.addEventListener("click", (i) => {
      i.target === this.overlay && this.destroy();
    }), this.modal = document.createElement("div"), this.modal.className = "pvt-modal";
    const e = this.options.size ?? "md";
    if (this.modal.classList.add(`pvt-modal-${e}`), this.options.header != null) {
      this.header = document.createElement("div"), this.header.className = "pvt-modal__header", this.setHeader(this.options.header), this.modal.appendChild(this.header);
      const i = _({
        text: "×",
        variant: "outline-primary",
        size: "sm",
        onClick: () => {
          this.hide();
        },
        style: "margin-left: auto;"
      });
      this.header.appendChild(i);
    }
    this.body = document.createElement("div"), this.body.className = "pvt-modal__body", this.setBody(this.options.body), this.options.noBodyPadding ? this.body.style.padding = "0" : this.body.style.padding = "", this.modal.appendChild(this.body), this.options.buttons != null && (this.footer = document.createElement("div"), this.footer.className = "pvt-modal__footer", this.setButtons(this.options.buttons), this.modal.appendChild(this.footer)), this.overlay.appendChild(this.modal), t.appendChild(this.overlay);
  }
  destroy() {
    this.hide(), requestAnimationFrame(() => {
      var t;
      (t = this.overlay) == null || t.remove(), this.overlay = void 0;
    });
  }
  afterMount() {
  }
  graphReady() {
  }
  setButtons(t) {
    !this.modal || !this.footer || (this.footer.innerHTML = "", t.forEach((e) => {
      if (typeof e.onClick == "function") {
        const n = e.onClick;
        e.onClick = (r, s) => {
          n && n(r, s);
        }, e.onClickArgs = [this.hide.bind(this)];
      }
      const i = _(e);
      this.footer.appendChild(i);
    }));
  }
  setHeader(t) {
    this.header && (this.header.innerHTML = "", t && (this.options.header instanceof HTMLElement ? this.header.appendChild(this.options.header) : this.options.rawHeader ? this.header.innerHTML = this.options.header : this.header.textContent = this.options.header));
  }
  setBody(t) {
    this.body && (this.body.innerHTML = "", t && (t instanceof HTMLElement ? this.body.appendChild(t) : this.options.rawBody ? this.body.innerHTML = t : this.body.textContent = t));
  }
  show() {
    if (!this.modal || !this.overlay) return;
    this.dispatchEvent("show"), this.modal.classList.add("pvt-modal-open");
    const t = (e) => {
      var i;
      e.target === this.modal && ((i = this.modal) == null || i.removeEventListener("animationend", t), this.dispatchEvent("shown"));
    };
    this.modal.addEventListener("animationend", t);
  }
  hide() {
    var t;
    !this.modal || !this.overlay || (this.dispatchEvent("hide"), this.modal.classList.remove("pvt-modal-open"), (t = this.overlay) == null || t.remove(), requestAnimationFrame(() => {
      this.dispatchEvent("hidden");
    }));
  }
  dispatchEvent(t) {
    if (!this.modal) return;
    const e = `pvt-modal-${t}`, i = new CustomEvent(e, { bubbles: !0, cancelable: !0 });
    this.modal.dispatchEvent(i);
    const n = `on${t.charAt(0).toUpperCase()}${t.slice(1)}`, r = this.options[n];
    typeof r == "function" && r();
  }
}
const ln = {
  enabled: !0,
  allowPinning: !0
};
class hn {
  constructor(t) {
    h(this, "uiManager");
    h(this, "options");
    h(this, "tooltip");
    h(this, "parentContainer");
    h(this, "shadowLinkContainer");
    h(this, "mouseX", 0);
    h(this, "mouseY", 0);
    h(this, "x", 0);
    h(this, "y", 0);
    h(this, "triggerX", 0);
    h(this, "triggerY", 0);
    h(this, "hoveredElementID", null);
    h(this, "hoveredElement", null);
    h(this, "showDelay", 400);
    h(this, "hideDelay", 200);
    h(this, "tooltipTimeout", null);
    h(this, "hideTimeout", null);
    h(this, "tooltipDataMap", /* @__PURE__ */ new Map());
    h(this, "shadowlinkMap", /* @__PURE__ */ new WeakMap());
    h(this, "shadowlinkBoundingBoxesMap", /* @__PURE__ */ new WeakMap());
    this.uiManager = t, this.options = q(ln, this.uiManager.getOptions().tooltip);
  }
  mount(t) {
    if (!t) return;
    this.parentContainer = document.querySelector("body");
    const e = this.parentContainer.querySelector(".pvt-tooltip"), i = this.parentContainer.querySelector(".pivotick-shadowlink-container");
    if (e && i) {
      this.tooltip = e, this.shadowLinkContainer = i;
      return;
    }
    const n = document.createElement("template");
    n.innerHTML = '<div class="pvt-tooltip"></div>', this.tooltip = n.content.firstElementChild, this.shadowLinkContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.shadowLinkContainer.setAttribute("class", "pivotick-shadowlink-container"), this.parentContainer.appendChild(this.tooltip), this.parentContainer.appendChild(this.shadowLinkContainer);
  }
  destroy() {
    var t;
    (t = this.tooltip) == null || t.remove(), this.tooltip = void 0;
  }
  afterMount() {
  }
  graphReady() {
    this.tooltip && (this.uiManager.graph.renderer.getGraphInteraction().on("nodeHoverIn", this.nodeHovered.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("nodeHoverOut", this.delayedHide.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("canvasMousemove", this.updateMousePosition.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("dragging", (t, e) => {
      this.hoveredElementID === e.id && this.hide(e);
    }), this.uiManager.graph.renderer.getGraphInteraction().on("canvasZoom", this.canvasZoomed.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("simulationSlowTick", this.simulationSlowTick.bind(this)), this.tooltip.addEventListener("mouseenter", () => {
      this.hideTimeout && (clearTimeout(this.hideTimeout), this.hideTimeout = null);
    }), this.tooltip.addEventListener("mouseleave", () => this.hide()));
  }
  updateMousePosition(t) {
    this.mouseX = t.pageX, this.mouseY = t.pageY;
  }
  tooltipCanBeShown() {
    if (!this.tooltip || this.uiManager.graph.simulation.isDragging()) return !1;
    const t = this.uiManager.graph.renderer.getSelectionBox();
    return !(t !== null && t.selectionInProgress() || Math.abs(this.triggerX - this.mouseX) >= 50 || Math.abs(this.triggerY - this.mouseY) >= 50);
  }
  openForNodeOnElement(t, e) {
    this.triggerX = t.pageX, this.triggerY = t.pageY, this.mouseY = t.pageY, this.mouseX = t.pageX, this.hoveredElementID = e.id, this.hoveredElement = e, this.tooltipCanBeShown() && this.show(() => {
      this.createNodeTooltip(e);
    });
  }
  nodeHovered(t, e) {
    this.hoveredElementID !== e.id && (this.triggerX = t.pageX, this.triggerY = t.pageY, this.hoveredElementID = e.id, this.hoveredElement = e, this.tooltipCanBeShown() && this.show(() => {
      this.createNodeTooltip(e);
    }));
  }
  edgeHovered(t, e) {
    this.hoveredElementID !== e.id && (this.triggerX = t.pageX, this.triggerY = t.pageY, this.hoveredElementID = e.id, this.hoveredElement = e, this.tooltipCanBeShown() && this.show(() => {
      if (this.uiManager.graph.simulation.isDragging()) {
        this.hide();
        return;
      }
      this.createEdgeTooltip(e);
    }));
  }
  canvasZoomed() {
    this.updateShadowLinks(!0);
  }
  simulationSlowTick() {
    this.updateShadowLinks(!0);
  }
  buildNodeTooltip(t) {
    var m;
    const n = k(`
<div class="pvt-tooltip-container">
    <div class="pvt-mainheader-container">
        <div class="pvt-mainheader-nodepreview">
            <svg class="pvt-mainheader-icon" width="32" height="32" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet"></svg>
            <span class="pvt-mainheader-topright"></span>
        </div>
        <div class="pvt-mainheader-nodeinfo">
            <div class="pvt-mainheader-nodeinfo-name"></div>
            <div class="pvt-mainheader-nodeinfo-subtitle"></div>
        </div>
        <div class="pvt-mainheader-nodeinfo-action">
        </div>
    </div>
</div>`), r = n.querySelector(".pvt-mainheader-container"), s = n.querySelector(".pvt-mainheader-icon"), o = n.querySelector(".pvt-mainheader-nodeinfo-name"), d = n.querySelector(".pvt-mainheader-nodeinfo-subtitle"), a = n.querySelector(".pvt-mainheader-topright"), c = wt(t, this.uiManager.getOptions().propertiesPanel), u = t.getGraphElement();
    if (u && u instanceof SVGGElement) {
      const v = u.cloneNode(!0);
      (m = v.querySelector("circle.pvt-node-selected-highlight")) == null || m.remove();
      const y = u.getBBox(), x = 32 / Math.max(y.width, y.height);
      v.setAttribute(
        "transform",
        `translate(${(32 - y.width * x) / 2 - y.x * x}, ${(32 - y.height * x) / 2 - y.y * x}) scale(${x})`
      ), s.appendChild(v);
    }
    if (o.textContent = z(t, this.uiManager.getOptions().mainHeader), d.textContent = Qt(t, this.uiManager.getOptions().mainHeader), this.options.allowPinning) {
      const v = _({
        title: "Pin Tooltip",
        variant: "outline-primary",
        size: "sm",
        class: "pin-button",
        svgIcon: $,
        onClick: () => {
          this.pinTooltip();
        }
      });
      a.appendChild(v);
    }
    const p = this.uiManager.getOptions().tooltip.render;
    if (p && typeof p == "function") {
      const v = P(p, t);
      if (v) {
        const y = b("div", { class: "pivotick-extra-content-container" }, [
          v
        ]);
        n.appendChild(y);
      }
      return n;
    }
    const g = b("div", { class: "pvt-properties-container" }, [
      nt(c, t)
    ]);
    n.appendChild(r), n.appendChild(g);
    const f = this.uiManager.getOptions().tooltip.renderNodeExtra;
    if (f && typeof f == "function") {
      const v = P(f, t);
      if (v) {
        const y = b("div", { class: "pivotick-extra-content-container" }, [
          v
        ]);
        n.appendChild(y);
      }
    }
    return n;
  }
  createNodeTooltip(t) {
    if (!this.tooltip) return !1;
    this.tooltip.innerHTML = "";
    const e = this.buildNodeTooltip(t);
    this.tooltip.appendChild(e);
  }
  createEdgeTooltip(t) {
    if (!this.tooltip) return !1;
    this.tooltip.innerHTML = "";
    const i = `
<div class="pvt-tooltip-container">
    <div class="pvt-mainheader-container">
        <div class="pvt-mainheader-nodepreview">
            ${st(32)}
            <span class="pvt-mainheader-topright"></span>
        </div>
        <div class="pvt-mainheader-nodeinfo">
            <div class="pvt-mainheader-nodeinfo-name"></div>
            <div class="pvt-mainheader-nodeinfo-subtitle"></div>
        </div>
        <div class="pvt-mainheader-nodeinfo-action">
        </div>
    </div>
</div>`, n = k(i), r = n.querySelector(".pvt-mainheader-container"), s = n.querySelector(".pvt-mainheader-nodeinfo-name"), o = n.querySelector(".pvt-mainheader-nodeinfo-subtitle"), d = n.querySelector(".pvt-mainheader-topright"), a = _({
      title: "Pin Tooltip",
      variant: "outline-primary",
      size: "sm",
      class: "pin-button",
      svgIcon: $,
      onClick: () => {
        this.pinTooltip();
      }
    });
    d.appendChild(a);
    const c = this.uiManager.getOptions().tooltip.render;
    if (c && typeof c == "function") {
      const f = P(c, t);
      if (f) {
        const m = b("div", { class: "pivotick-extra-content-container" }, [
          f
        ]);
        n.appendChild(m);
      }
      this.tooltip.appendChild(n);
      return;
    }
    const u = Ct(t, this.uiManager.getOptions().propertiesPanel);
    s.textContent = W(t, this.uiManager.getOptions().mainHeader), o.textContent = Jt(t, this.uiManager.getOptions().mainHeader);
    const p = b("div", { class: "pvt-properties-container" }, [nt(u, t)]);
    n.appendChild(r), n.appendChild(p);
    const g = this.uiManager.getOptions().tooltip.renderEdgeExtra;
    if (g && typeof g == "function") {
      const f = P(g, t);
      if (f) {
        const m = b("div", { class: "pivotick-extra-content-container" }, [
          f
        ]);
        n.appendChild(m);
      }
    }
    this.tooltip.appendChild(n);
  }
  setPosition() {
    var p, g, f, m;
    if (!this.tooltip) return;
    const t = (g = (p = this.hoveredElement) == null ? void 0 : p.getGraphElement()) == null ? void 0 : g.getBoundingClientRect();
    if (!t) return;
    const e = (m = (f = this.uiManager.layout) == null ? void 0 : f.canvas) == null ? void 0 : m.getBoundingClientRect();
    if (!e) return;
    const i = this.uiManager.getOptions().tooltip.setPosition;
    if (i && typeof i == "function") {
      i(this.tooltip, t, e);
      return;
    }
    const n = 20, r = 15, s = e.left + window.scrollX, o = e.top + window.scrollY, d = e.width, a = e.height, c = this.tooltip.offsetWidth, u = this.tooltip.offsetHeight;
    this.x = t.x + t.width + r, this.y = t.y, this.x + c + n > s + d && (this.x = t.x - c - r), this.x < s + r && (this.x = s + r), this.y + u + n > o + a && (this.y -= u), this.y < o + n && (this.y = o + n), this.tooltip.style.left = `${this.x}px`, this.tooltip.style.top = `${this.y}px`;
  }
  delayedHide(t, e) {
    this.hideTimeout && clearTimeout(this.hideTimeout), this.hideTimeout = setTimeout(() => this.hide(e), this.hideDelay);
  }
  hide(t) {
    this.tooltip && (this.hideTimeout && clearTimeout(this.hideTimeout), (this.hoveredElement === t || t === void 0) && (this.tooltipTimeout && (clearTimeout(this.tooltipTimeout), this.tooltipTimeout = null), this.hoveredElementID = null, this.hoveredElement = null, this.triggerX = -2e3, this.triggerY = -2e3, this.tooltip.classList.remove("shown"), this.tooltip.style.left = "-10000px"));
  }
  show(t) {
    var e;
    (e = this.uiManager.contextMenu) != null && e.visible || (this.tooltipTimeout && clearTimeout(this.tooltipTimeout), this.tooltipTimeout = setTimeout(() => {
      var i;
      t && t(), (i = this.tooltip) == null || i.classList.add("shown"), requestAnimationFrame(() => {
        this.setPosition();
      });
    }, this.showDelay));
  }
  pinTooltip() {
    var o;
    if (!this.tooltip || !this.parentContainer || !this.hoveredElement) return;
    const t = this.tooltip.cloneNode(!0);
    this.tooltipDataMap.set(t, this.hoveredElement), t.classList.add("pvt-tooltip-floating"), (o = t.querySelector(".pin-button")) == null || o.remove();
    const e = _({
      title: "Close Tooltip",
      variant: "outline-danger",
      size: "sm",
      class: ["close-button"],
      svgIcon: Pi,
      onClick: () => {
        this.tooltipDataMap.delete(t), this.reomveShadowLink(t), t.remove();
      }
    }), i = _({
      title: "Focus Element in Graph",
      variant: "outline-primary",
      size: "sm",
      class: ["focus-element"],
      svgIcon: le,
      onClick: () => {
        const d = this.tooltipDataMap.get(t);
        d && this.uiManager.graph.focusElement(d);
      }
    }), n = _({
      title: "Select Element in Graph",
      variant: "outline-primary",
      size: "sm",
      class: ["select-element"],
      svgIcon: Bi,
      onClick: () => {
        const d = this.tooltipDataMap.get(t);
        d && this.uiManager.graph.selectElement(d);
      }
    }), r = b("div", {
      class: "pvt-tooltip-topbar"
    }, [
      i,
      n,
      e
    ]);
    t.prepend(r);
    const s = this.uiManager.getAppContainer();
    Le(t, r, s, {
      onDragStart: (d, a) => {
        this.shadowlinkBoundingBoxesMap.set(a, [
          a.getBoundingClientRect(),
          this.tooltipDataMap.get(a).getGraphElement().getBoundingClientRect()
        ]);
      },
      onDrag: (d, a) => {
        this.updateShadowLink(a, this.tooltipDataMap.get(a));
      }
    }), this.parentContainer.appendChild(t), this.addShadowLink(t);
  }
  addShadowLink(t) {
    var i;
    const e = Ie("path", {
      class: "pivotick-shadowlink"
    });
    this.shadowlinkMap.set(t, e), (i = this.shadowLinkContainer) == null || i.appendChild(e);
  }
  updateShadowLinks(t = !1) {
    for (const [e, i] of this.tooltipDataMap.entries())
      this.updateShadowLink(e, i, t);
  }
  updateShadowLink(t, e, i = !1) {
    let n;
    i ? n = [
      t.getBoundingClientRect(),
      e.getGraphElement().getBoundingClientRect()
    ] : n = this.shadowlinkBoundingBoxesMap.get(t);
    const { width: r, height: s } = n[0], { x: o, y: d, width: a, height: c } = n[1], u = this.shadowlinkMap.get(t), p = parseFloat(t.style.left), g = parseFloat(t.style.top);
    u && u.setAttribute("d", `M ${p + r / 2} ${g + s / 2} L ${o + a / 2} ${d + c / 2}`);
  }
  reomveShadowLink(t) {
    const e = this.shadowlinkMap.get(t);
    e && e.remove();
  }
}
const cn = {
  topbar: [
    {
      title: "Pin Node",
      svgIcon: $,
      variant: "outline-primary",
      visible: (l) => !l.frozen,
      onclick(l, t) {
        t.freeze();
      }
    },
    {
      title: "Unpin Node",
      svgIcon: It,
      variant: "outline-primary",
      visible: (l) => l.frozen,
      onclick(l, t) {
        t.unfreeze();
      }
    },
    {
      title: "Focus Node",
      svgIcon: le,
      variant: "outline-primary",
      onclick(l, t) {
        this.uiManager.graph.focusElement(t);
      }
    },
    {
      title: "Hide Node",
      svgIcon: Mt,
      variant: "outline-danger",
      flushRight: !0,
      visible: (l) => l.visible,
      onclick(l, t) {
        this.uiManager.graph.queryEngine.excludeNode(t);
      }
    }
  ],
  menu: [
    {
      text: "Select Neighbors",
      title: "Select Neighbors",
      svgIcon: Si,
      variant: "outline-primary",
      onclick(l, t) {
        const e = [
          ...t.getConnectedNodes(),
          ...t.getConnectingNodes()
        ].map((i) => ({
          node: i,
          element: i.getGraphElement()
        }));
        this.uiManager.graph.renderer.getGraphInteraction().selectNodes(e);
      }
    },
    {
      text: "Hide Children",
      title: "Hide Children",
      svgIcon: Mt,
      variant: "outline-primary",
      visible: (l) => l.visible,
      onclick(l, t) {
        t.hide();
      }
    },
    {
      text: "Expand Node",
      title: "Expand Node",
      svgIcon: he,
      variant: "outline-primary",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      visible: (l) => !1,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onclick(l, t) {
      }
    },
    {
      text: "Inspect Properties",
      title: "Inspect Properties",
      svgIcon: Fi,
      variant: "outline-primary",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      visible: (l) => !0,
      onclick(l, t) {
        this.uiManager.graph.renderer.getGraphInteraction().selectNode(t.getGraphElement(), t);
      }
    }
  ]
}, dn = {
  topbar: [],
  menu: []
}, un = {
  topbar: [
    {
      title: "Pin All",
      svgIcon: $,
      variant: "outline-primary",
      visible: !0,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onclick(l) {
        (this.uiManager.graph.getMutableNodes() ?? []).forEach((e) => {
          e.freeze();
        });
      }
    },
    {
      title: "Unpin All",
      svgIcon: It,
      variant: "outline-primary",
      visible: !0,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onclick(l) {
        var e;
        (this.uiManager.graph.getMutableNodes() ?? []).forEach((i) => {
          i.unfreeze();
        }), (e = this.uiManager.graph.simulation) == null || e.reheat();
      }
    }
  ],
  menu: []
};
class pn {
  constructor(t) {
    h(this, "uiManager");
    h(this, "menu");
    h(this, "visible");
    h(this, "parentContainer");
    h(this, "element", null);
    h(this, "menuNode");
    h(this, "menuEdge");
    h(this, "menuCanvas");
    this.uiManager = t, this.visible = !1, this.menuNode = q(cn, this.uiManager.getOptions().contextMenu.menuNode ?? {}), this.menuEdge = q(dn, this.uiManager.getOptions().contextMenu.menuEdge ?? {}), this.menuCanvas = q(un, this.uiManager.getOptions().contextMenu.menuCanvas ?? {}), this.wrapOnclickActions();
  }
  mount(t) {
    if (!t) return;
    this.parentContainer = document.querySelector("body");
    const e = this.parentContainer.querySelector(".pvt-contextmenu");
    if (e) {
      this.menu = e;
      return;
    }
    const i = document.createElement("template");
    i.innerHTML = `
        <div class="pvt-contextmenu">
            <div class="pvt-contextmenu-topbar"></div>
            <div class="pvt-contextmenu-mainmenu"></div>
        </div>
        `, this.menu = i.content.firstElementChild, this.parentContainer.appendChild(this.menu);
  }
  destroy() {
    var t;
    (t = this.menu) == null || t.remove(), this.menu = void 0;
  }
  afterMount() {
  }
  graphReady() {
    this.uiManager.graph.renderer.getGraphInteraction().on("nodeContextmenu", this.nodeClicked.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("edgeContextmenu", this.edgeClicked.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("canvasContextmenu", this.canvasClicked.bind(this)), this.uiManager.graph.renderer.getGraphInteraction().on("canvasClick", () => {
      this.hide();
    }), this.uiManager.graph.renderer.getGraphInteraction().on("canvasZoom", () => {
      this.hide();
    });
  }
  nodeClicked(t, e) {
    this.menu && (this.element = e, this.createNodeMenu(e), this.setPosition(t), this.show());
  }
  edgeClicked(t, e) {
    this.menu && (this.element = e, this.createEdgeMenu(e), this.setPosition(t), this.show());
  }
  canvasClicked(t) {
    this.menu && (this.element = null, this.createCanvasMenu(), this.setPosition(t), this.show());
  }
  wrapOnclickActions() {
    [
      this.menuNode.menu,
      this.menuNode.topbar,
      this.menuEdge.menu,
      this.menuEdge.topbar,
      this.menuCanvas.menu,
      this.menuCanvas.topbar
    ].forEach((t) => {
      t.forEach((e) => {
        this.wrapOnclickAction(e);
      });
    });
  }
  wrapOnclickAction(t) {
    if (t.onclick) {
      const e = t.onclick, i = this;
      t.onclick = function(n, r) {
        var s;
        e.apply(this, [n, r]), (s = i.hide) == null || s.call(i);
      };
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createNodeMenu(t) {
    if (!this.menu) return;
    const e = this.menu.querySelector(".pvt-contextmenu-topbar"), i = this.menu.querySelector(".pvt-contextmenu-mainmenu");
    e.innerHTML = "", i.innerHTML = "", e.appendChild(tt(this, this.menuNode.topbar, this.element)), i.appendChild(et(this, this.menuNode.menu, this.element));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createEdgeMenu(t) {
    if (!this.menu) return;
    const e = this.menu.querySelector(".pvt-contextmenu-topbar"), i = this.menu.querySelector(".pvt-contextmenu-mainmenu");
    e.innerHTML = "", i.innerHTML = "", e.appendChild(tt(this, this.menuEdge.topbar, this.element)), i.appendChild(et(this, this.menuEdge.menu, this.element));
  }
  createCanvasMenu() {
    if (!this.menu) return;
    const t = this.menu.querySelector(".pvt-contextmenu-topbar"), e = this.menu.querySelector(".pvt-contextmenu-mainmenu");
    t.innerHTML = "", e.innerHTML = "", t.appendChild(tt(this, this.menuCanvas.topbar, this.element)), e.appendChild(et(this, this.menuCanvas.menu, this.element));
  }
  show() {
    var t;
    this.visible || this.menu && ((t = this.uiManager.tooltip) == null || t.hide(), this.menu.classList.add("shown"), this.visible = !0);
  }
  hide() {
    this.visible && this.menu && (this.element = null, this.menu.classList.remove("shown"), this.menu.style.left = "-10000px", this.visible = !1);
  }
  setPosition(t) {
    if (!this.menu) return;
    const e = 10, i = t.pageX, n = t.pageY;
    this.menu.style.left = `${i + e}px`, this.menu.style.top = `${n + e}px`;
  }
}
class gn {
  constructor() {
    h(this, "bindings", /* @__PURE__ */ new Map());
  }
  register(t) {
    this.bindings.set(t.key, t.callback);
  }
  handleKeyPress(t) {
    const e = this.getKeyCombo(t), i = this.bindings.get(e);
    i && (t.preventDefault(), i(t));
  }
  getKeyCombo(t) {
    const e = [];
    return t.ctrlKey && e.push("Ctrl"), t.shiftKey && e.push("Shift"), t.altKey && e.push("Alt"), e.push(t.key), e.join("+");
  }
}
const pe = (l) => {
  const t = [];
  for (const [e, i] of Object.entries(l.getData()))
    e && i && t.push({
      name: e,
      value: i
    });
  return t;
}, at = (l, t, e = "") => {
  var n;
  const i = (n = l.getData()) == null ? void 0 : n[t];
  return typeof i == "string" ? i : e;
}, fn = (l) => at(l, "label", "Could not resolve title"), mn = (l) => at(l, "description"), vn = (l) => at(l, "label", ""), yn = (l) => at(l, "description"), $t = (l) => pe(l), Ut = (l) => pe(l), Vt = {
  nodeHeaderMap: {
    title: fn,
    subtitle: mn
  },
  edgeHeaderMap: {
    title: vn,
    subtitle: yn
  },
  render: void 0
}, bn = {
  mode: "viewer",
  mainHeader: Vt,
  sidebar: {
    collapsed: "auto"
  },
  propertiesPanel: {
    nodePropertiesMap: $t,
    edgePropertiesMap: Ut
  },
  neighborsPanel: {},
  tooltip: {
    enabled: !0,
    allowPinning: !0,
    nodePropertiesMap: $t,
    edgePropertiesMap: Ut,
    ...Vt
  },
  navigation: {
    enabled: !0
  },
  contextMenu: {
    enabled: !0,
    menuNode: {
      topbar: [],
      menu: []
    },
    menuEdge: {
      topbar: [],
      menu: []
    },
    menuCanvas: {
      topbar: [],
      menu: []
    }
  },
  selectionMenu: {
    menuNode: {
      topbar: [],
      menu: []
    }
  },
  extraPanels: []
};
class xn {
  constructor(t, e, i) {
    h(this, "graph");
    h(this, "container");
    h(this, "options");
    h(this, "layout");
    h(this, "slidePanel");
    h(this, "sidebar");
    h(this, "toolbar");
    h(this, "modal");
    h(this, "graphNaviation");
    h(this, "graphControls");
    h(this, "tooltip");
    h(this, "contextMenu");
    h(this, "keyManager");
    h(this, "fullscreenOn");
    this.graph = t, this.container = e, this.options = j({}, bn, i), this.keyManager = new gn(), this.fullscreenOn = !1, this.setup();
  }
  setup() {
    switch (this.destroy(), this.options.theme && this.container.setAttribute("data-theme", this.options.theme.toString()), this.options.mode) {
      case "viewer":
        this.setupViewerMode();
        break;
      case "full":
        this.setupFullMode();
        break;
      case "light":
        this.setupLightMode();
        break;
      case "static":
        this.setupStaticMode();
        break;
      default:
        console.warn(`Unknown mode: ${this.options.mode}. Defaulting to 'viewer'.`), this.setupViewerMode();
        break;
    }
    this.callAfterMount();
  }
  hasEnoughSpaceForFullMode() {
    const t = this.container.getBoundingClientRect();
    return t.width > 1200 && t.height > 800;
  }
  hasEnoughSpaceForLightMode() {
    const t = this.container.getBoundingClientRect();
    return t.width > 600 && t.height > 600;
  }
  setupViewerMode() {
    this.buildLayout(), this.buildUIGraphNavigation();
  }
  setupStaticMode() {
    this.buildLayout();
  }
  setupFullMode() {
    var t, e;
    ((e = (t = this.options) == null ? void 0 : t.sidebar) == null ? void 0 : e.collapsed) === "auto" && !this.hasEnoughSpaceForFullMode() && (console.debug("Not enough space for full mode UI. Collapsing sidebar"), this.options.sidebar.collapsed = !0), this.buildLayout(), this.buildUIGraphNavigation(), this.buildUIGraphControls(), this.buildToolbar(), this.buildSidebar();
  }
  setupLightMode() {
    if (!this.hasEnoughSpaceForLightMode()) {
      console.warn("Not enough space for light mode UI. Switching to viewer mode."), this.options.mode = "viewer", this.setupViewerMode();
      return;
    }
    this.buildLayout(), this.buildUIGraphNavigation(), this.buildUIGraphControls(), this.buildToolbar();
  }
  buildLayout() {
    this.layout = new qi(), this.layout.mount(this.container, this.options.mode);
  }
  buildUIGraphNavigation() {
    var t, e, i, n, r;
    this.options.navigation.enabled && (this.graphNaviation = new ji(this), this.graphNaviation.mount((t = this.layout) == null ? void 0 : t.graphnavigation)), (e = this.options.tooltip) != null && e.enabled && (this.tooltip = new hn(this), this.tooltip.mount((i = this.layout) == null ? void 0 : i.canvas)), (n = this.options.contextMenu) != null && n.enabled && (this.contextMenu = new pn(this), this.contextMenu.mount((r = this.layout) == null ? void 0 : r.canvas));
  }
  buildUIGraphControls() {
    var t;
    this.graphControls = new Gi(this), this.graphControls.mount((t = this.layout) == null ? void 0 : t.graphcontrols);
  }
  buildToolbar() {
    var t;
    this.toolbar = new on(this), this.toolbar.mount((t = this.layout) == null ? void 0 : t.toolbar);
  }
  buildSidebar() {
    var t;
    this.sidebar = new tn(this), this.sidebar.mount((t = this.layout) == null ? void 0 : t.sidebar);
  }
  destroy() {
    this.layout && (this.layout.destroy(), this.layout = void 0);
  }
  callAfterMount() {
    var t, e, i, n, r, s, o, d, a;
    (t = this.layout) == null || t.afterMount(), (e = this.toolbar) == null || e.afterMount(), (i = this.sidebar) == null || i.afterMount(), (n = this.graphNaviation) == null || n.afterMount(), (r = this.graphControls) == null || r.afterMount(), (s = this.options.tooltip) != null && s.enabled && ((o = this.tooltip) == null || o.afterMount()), (d = this.options.contextMenu) != null && d.enabled && ((a = this.contextMenu) == null || a.afterMount()), this.container.addEventListener("keydown", (c) => this.keyManager.handleKeyPress(c)), this.container.setAttribute("tabindex", "0");
  }
  toggleFullscreen(t) {
    (t !== void 0 ? t : !this.fullscreenOn) ? (document.fullscreenElement || this.container.requestFullscreen(), this.fullscreenOn = !0) : (document.fullscreenElement && document.exitFullscreen(), this.fullscreenOn = !1), document.addEventListener("fullscreenchange", () => {
      this.fullscreenOn = !!document.fullscreenElement;
    });
  }
  isFullscreenOn() {
    return this.fullscreenOn;
  }
  getOptions() {
    return this.options;
  }
  getAppContainer() {
    const t = this.graph.getAppID();
    return document.getElementById(t);
  }
  callGraphReady() {
    var t, e, i, n;
    (t = this.graphControls) == null || t.graphReady(), (e = this.sidebar) == null || e.graphReady(), (i = this.tooltip) == null || i.graphReady(), (n = this.contextMenu) == null || n.graphReady();
  }
  /**
  * Show a notification in the UI.
  * 
  * @param notification - The notification to display
  */
  showNotification(t) {
    var c;
    const { level: e, title: i, message: n } = t, r = (c = this.layout) == null ? void 0 : c.notification;
    if (!r) return;
    const s = document.createElement("template");
    s.innerHTML = `
  <div class="pivotick-toast pivotick-toast-${e}">
    <div class="pivotick-toast-title">
    </div>
    <div class="pivotick-toast-body">
    </div>
  </div>
`;
    const o = s.content.firstElementChild, d = o.querySelector(".pivotick-toast-title"), a = o.querySelector(".pivotick-toast-body");
    d && (d.textContent = i), a && (a.textContent = n ?? ""), r.appendChild(o), requestAnimationFrame(() => {
      o.classList.add("show");
    }), setTimeout(() => {
      o.classList.remove("show"), o.addEventListener("transitionend", () => {
        o.remove();
      }, { once: !0 });
    }, 4e3);
  }
  /**
  * Show a modal in the UI.
  * 
  * @param modalOption - The option for the modal
  */
  createModal(t) {
    var n, r;
    if (!((n = this.layout) == null ? void 0 : n.modal)) return;
    const i = new an(this, t);
    return i.mount((r = this.layout) == null ? void 0 : r.modal), requestAnimationFrame(() => {
      i.show();
    }), i;
  }
  /**
  * Show a sidepanel in the UI.
  * 
  * @param slidepanelOption - The notification to display
  */
  createSlidepanel(t) {
    var n, r;
    if (!((n = this.layout) == null ? void 0 : n.slidePanel)) return;
    const i = new en(this, t);
    return i.mount((r = this.layout) == null ? void 0 : r.slidePanel), i;
  }
}
const J = {
  Success: "success",
  Warning: "warning",
  Danger: "danger",
  Info: "info"
};
class wn {
  constructor(t) {
    h(this, "graph");
    h(this, "UIManager");
    this.graph = t, this.UIManager = this.graph.UIManager;
  }
  /**
   * Dispatch a notification to the UIManager.
   * 
   * @param level - The severity level of the notification.
   * @param title - The title to display in the notification.
   * @param message - Optional detailed message for the notification.
   */
  notify(t, e, i) {
    const n = { level: t, title: e, message: i };
    this.UIManager.showNotification(n);
  }
  success(t, e) {
    this.notify(J.Success, t, e);
  }
  warning(t, e) {
    this.notify(J.Warning, t, e);
  }
  error(t, e) {
    this.notify(J.Danger, t, e);
  }
  info(t, e) {
    this.notify(J.Info, t, e);
  }
}
const yt = "manually_hidden";
class Cn {
  constructor(t) {
    h(this, "graph");
    h(this, "listeners");
    h(this, "filters", {});
    h(this, "excludedNodeIds", /* @__PURE__ */ new Set());
    h(this, "hiddenNodeCount", 0);
    this.graph = t, this.listeners = {
      filterAdd: [],
      filterRemove: [],
      filterReset: [],
      filterChange: []
    };
  }
  on(t, e) {
    this.listeners[t].push(e);
  }
  off(t, e) {
    this.listeners[t] = this.listeners[t].filter((i) => i !== e);
  }
  emit(t, ...e) {
    for (const i of this.listeners[t])
      i(...e);
  }
  getFilters() {
    const t = {
      value: [...this.excludedNodeIds],
      matchMode: "exact"
    };
    return { ...this.filters, manuallyHidden: t };
  }
  setFilters(t) {
    for (const [e, i] of Object.entries(t)) {
      if (i === void 0) {
        this.removeFilter(e);
        return;
      }
      this.filters[e] = i;
    }
    this.apply(), this.emit("filterChange", this.getFilters());
  }
  setFilter(t, e) {
    if (e === void 0) {
      this.removeFilter(t);
      return;
    }
    this.filters[t] = e, this.apply(), this.emit("filterAdd", t, e), this.emit("filterChange", this.getFilters());
  }
  removeFilter(t) {
    t in this.filters && (delete this.filters[t], this.apply(), this.emit("filterRemove", t), this.emit("filterChange", this.getFilters()));
  }
  resetFilters() {
    this.filters = {}, this.apply(), this.emit("filterReset"), this.emit("filterChange", this.getFilters());
  }
  excludeNode(t) {
    let e;
    if (t instanceof A ? e = t : e = this.graph.getNode(t), e === void 0) return;
    this.excludedNodeIds.add(e.id), this.hiddenNodeCount++;
    const i = {
      value: e.id,
      matchMode: "exact"
    };
    this.graph.hideNode(e), this.emit("filterAdd", yt, i), this.emit("filterChange", this.getFilters());
  }
  includeNode(t) {
    let e;
    t instanceof A ? e = t : e = this.graph.getNode(t), e !== void 0 && (this.excludedNodeIds.delete(e.id), this.hiddenNodeCount--, this.graph.showNode(e), this.emit("filterRemove", yt), this.emit("filterChange", this.getFilters()));
  }
  clearNodeExclusions() {
    this.hiddenNodeCount += this.excludedNodeIds.size, this.excludedNodeIds.clear(), this.apply(), this.emit("filterRemove", yt), this.emit("filterChange", this.getFilters());
  }
  getExcludedNodeCount() {
    return this.excludedNodeIds.size;
  }
  getExcludedNodes() {
    return [...this.excludedNodeIds].map((t) => this.graph.getMutableNode(t)).filter((t) => t !== void 0);
  }
  getHiddenNodeCount() {
    return this.hiddenNodeCount;
  }
  apply() {
    const t = this.graph.getMutableNodes(), i = t.filter((n) => this.nodeMatchesFilters(n)).filter((n) => n.childrenDepth === 0);
    this.hiddenNodeCount = t.length - i.length, this.applyFiltersOnSubgraph(), this.graph.setVisibleNodes(i);
  }
  applyFiltersOnSubgraph() {
    const t = this.getFilters();
    this.graph.getMutableNodes().filter((e) => e.childrenDepth === 0).forEach((e) => {
      const i = e.getSubgraph();
      e.isParent && i && (i.queryEngine.resetFilters(), i.queryEngine.setFilters(t));
    });
  }
  nodeMatchesFilters(t) {
    if (this.excludedNodeIds.has(t.id))
      return !1;
    for (const [e, i] of Object.entries(this.filters)) {
      if (e === "manuallyHidden") continue;
      const n = t.getData()[e];
      if (!this.matches(n, i)) return !1;
    }
    return !0;
  }
  matches(t, e) {
    if (e === void 0) return !0;
    if (t === void 0) return !1;
    const i = e.value, n = (e == null ? void 0 : e.matchMode) ?? "partial";
    if (typeof i == "string")
      return n === "partial" ? String(t).includes(i) : t === i;
    if (typeof i == "number" || typeof i == "boolean")
      return t === i;
    if (Array.isArray(i))
      return n === "partial" ? i.includes(t) : t === i;
    if (typeof i == "object" && i !== null) {
      const { min: r, max: s } = i;
      return !(typeof t != "number" || r !== void 0 && t < r || s !== void 0 && t > s);
    }
    return !1;
  }
}
class I {
  /**
   * Initializes a graph inside the specified container using the provided data and options.
   *
   * @param container - The HTMLElement that will serve as the main container for the graph.
   * @param data - The graph data, including nodes and edges, to render.
   * @param options - Optional configuration for the graph's behavior, UI, styling, simulation, etc.
   */
  constructor(t, e, i) {
    h(this, "nodes", /* @__PURE__ */ new Map());
    h(this, "edges", /* @__PURE__ */ new Map());
    /** @private */
    h(this, "UIManager");
    h(this, "notifier");
    h(this, "renderer");
    h(this, "simulation");
    h(this, "queryEngine");
    /** @private */
    h(this, "options");
    h(this, "app_id");
    h(this, "parentGraph");
    h(this, "graphDepth");
    h(this, "listeners");
    var d, a, c;
    if (this.listeners = {
      ready: [],
      nodeAdd: [],
      nodeRemove: [],
      nodeChange: [],
      edgeAdd: [],
      edgeRemove: [],
      edgeChange: [],
      dataBatchChanged: []
    }, this.options = {
      isDirected: !0,
      ...i
    }, ((d = this.options.UI) == null ? void 0 : d.mode) === "static" && (this.options.simulation || (this.options.simulation = {}), this.options.simulation.enabled = !1, this.options.simulation.useWorker = !1, this.options.render || (this.options.render = {}), this.options.render.zoomEnabled = !1, this.options.render.zoomAnimation = !1, this.options.render.dragEnabled = !1, this.options.render.selectionBox || (this.options.render.selectionBox = {}), this.options.render.selectionBox.enabled = !1, this.options.UI.tooltip || (this.options.UI.tooltip = {}), this.options.UI.tooltip.enabled = !1, this.options.UI.contextMenu || (this.options.UI.contextMenu = {}), this.options.UI.contextMenu.enabled = !1), this.graphDepth = 0, this.options.parentGraph) {
      this.setParentGraph(this.options.parentGraph);
      let u = this.parentGraph;
      for (; u; )
        u = u.parentGraph, this.graphDepth++;
    }
    const n = {
      ...this.options.render
    }, r = this.options.UI, s = document.createElement("div");
    this.app_id = Nt(8, "pivotick-app-"), s.id = this.app_id, s.classList.add("pivotick"), t.appendChild(s), this.queryEngine = new Cn(this), this.UIManager = new xn(this, s, r), this.notifier = new wn(this), this.renderer = ii(this, s, n), this.renderer.setupRendering();
    const o = {
      ...this.options.simulation,
      layout: (a = this.options) == null ? void 0 : a.layout
    };
    if (this.simulation = new G(this, o), e) {
      const u = I.normalizeGraphData(e);
      this._setData(u == null ? void 0 : u.nodes, u == null ? void 0 : u.edges), (c = this.simulation) == null || c.update(), this.renderer.init(), this.renderer.fitAndCenter(1);
    }
    this.startAndRender();
  }
  on(t, e) {
    this.listeners[t].push(e);
  }
  off(t, e) {
    this.listeners[t] = this.listeners[t].filter((i) => i !== e);
  }
  emit(t, ...e) {
    for (const i of this.listeners[t])
      i(...e);
  }
  async startAndRender() {
    await this.simulation.start(), await this.simulation.waitForSimulationStop(), this.renderer.nextTick(), this.renderer.fitAndCenter(), this.UIManager.callGraphReady(), this.ready();
  }
  /**
   * Normalizes graph data by:
   * 1. Building a hierarchy of nodes (including nested children)
   * 2. Creating synthetic edges for edges that point to collapsed children
   * 3. Hiding edges that connect to invisible child nodes
   *
   * Synthetic edges are placeholder edges created when an edge would point to a
   * node inside a collapsed cluster. Instead of pointing to the invisible child,
   * a synthetic edge is created pointing to the parent cluster node. When the
   * cluster is expanded, synthetic edges are hidden and actual edges are shown.
   *
   * @param data - The raw graph data to normalize
   * @returns Normalized graph data with synthetic edges added
   * @private
   */
  static normalizeGraphData(t) {
    const e = t.nodes.map((a) => I.normalizeNode(a)), i = /* @__PURE__ */ new Map(), n = (a) => {
      a.children.forEach((c) => {
        i.set(c.id, c), c.hasChildren() && n(c);
      });
    };
    e.forEach((a) => {
      n(a);
    });
    const r = new Map(e.map((a) => [a.id, a])), s = new Map([...r, ...i]), o = t.edges.map((a) => I.normalizeEdge(a, s)).filter((a) => a !== null), d = [];
    for (const a of o)
      if (!a.from.isChild && a.to.isChild && a.to.parentNode) {
        let c = a.to.parentNode;
        const u = /* @__PURE__ */ new Set();
        for (; c && !u.has(c.id); ) {
          u.add(c.id);
          const p = `synthetic-${a.from.id}-${c.id}`, g = new B(
            p,
            a.from,
            c,
            // { 'label': `${edge.from.id}-${currentParent.id}` },
            {},
            {},
            null,
            a.to
          );
          if (g.to.isChild && g.hide(), d.push(g), !c.parentNode) break;
          c = c.parentNode;
        }
      }
    return o.push(...d), {
      nodes: e,
      edges: o
    };
  }
  /**
   * Normalizes a node, marking its children and hiding them.
   * @private
   */
  static normalizeNode(t, e = 0) {
    let i = [];
    !(t instanceof A) && t.children && (i = t.children.map((r) => I.normalizeNode(r, e + 1)));
    const n = t instanceof A ? t : new A(t.id.toString(), t.data, t.style, t.domID, i);
    return n.children.forEach((r) => {
      r.markAsChild(n, e + 1), r.hide();
    }), n.weight = t.weight, n.expanded = t.expanded, n;
  }
  /**
   * Normalizes an edge, hiding it if it connects to a child node in a collapsed cluster.
   * @private
   */
  static normalizeEdge(t, e) {
    var o;
    if (t instanceof B) return t;
    const i = e, n = i.get(t.from.toString()), r = i.get(t.to.toString());
    if (!n || !r) return null;
    const s = new B(
      ((o = t.id) == null ? void 0 : o.toString()) ?? `${t.from}-${t.to}`,
      n,
      r,
      t.data,
      t.style
    );
    return (n.isChild || r.isChild) && s.hide(), s;
  }
  ready() {
    this.emit("ready");
  }
  nodeAdd(t) {
    this.emit("nodeAdd", t);
  }
  nodeRemove(t) {
    this.emit("nodeRemove", t);
  }
  nodeChange(t, e, i) {
    this.emit("nodeChange", t, e, i);
  }
  edgeAdd(t) {
    this.emit("edgeAdd", t);
  }
  edgeRemove(t) {
    this.emit("edgeRemove", t);
  }
  edgeChange(t, e, i) {
    this.emit("edgeChange", t, e, i);
  }
  dataBatchChanged(t) {
    t && (this.emit("dataBatchChanged", t), t.forEach((e) => {
      switch (e.type) {
        case "node:add":
          this.nodeAdd(e.node);
          break;
        case "node:change":
          this.nodeChange(e.node, e.previousData, e.nextData);
          break;
        case "node:remove":
          this.nodeRemove(e.node);
          break;
        case "edge:add":
          this.edgeAdd(e.edge);
          break;
        case "edge:change":
          this.edgeChange(e.edge, e.previousData, e.nextData);
          break;
        case "edge:remove":
          this.edgeRemove(e.edge);
          break;
      }
    }));
  }
  /**
   * Returns the current configuration options of the graph.
   */
  getOptions() {
    return this.options;
  }
  /**
   * @private
   * Retrieves the callbacks defined in the options for graph interactions.
   * 
   * @returns A partial `InteractionCallbacks` object, or `undefined` if no callbacks are set.
   */
  getCallbacks() {
    var t;
    return (t = this.options) == null ? void 0 : t.callbacks;
  }
  /**
   * @private
   */
  onChange() {
    var t, e, i;
    (t = this.renderer) == null || t.update(!0), (e = this.simulation) == null || e.update(), (i = this.renderer) == null || i.nextTick();
  }
  /**
   * Updates the graph with new nodes and/or edges.
   * 
   * Existing nodes or edges with matching IDs are replaced; new ones are added.
   * Triggers the `onChange` callback if any updates were applied.
   * 
   * @param newNodes Optional array of nodes to update or add.
   * @param newEdges Optional array of edges to update or add.
   * Triggers `onChange`
   */
  updateData(t, e, i = !0) {
    const n = [];
    t && t.forEach((r) => {
      var s;
      this.nodes.has(r.id) ? (n.push({
        type: "node:change",
        node: r,
        previousData: (s = this.nodes.get(r.id)) == null ? void 0 : s.getData(),
        nextData: r.getData()
      }), this.nodes.set(r.id, r)) : (this.addNode(r), n.push({
        type: "node:add",
        node: r
      }));
    }), e && e.forEach((r) => {
      var s;
      this.edges.has(r.id) ? (n.push({
        type: "edge:change",
        edge: r,
        previousData: (s = this.nodes.get(r.id)) == null ? void 0 : s.getData(),
        nextData: r.getData()
      }), this.edges.set(r.id, r)) : (this.addEdge(r), n.push({
        type: "edge:add",
        edge: r
      }));
    }), (t || e) && this.onChange(), i && this.dataBatchChanged(n);
  }
  /**
   * Replaces all current nodes and edges in the graph with the provided data.
   * Clears existing nodes and edges before setting the new ones.
   * Triggers the `onChange` callback after the update.
   * 
   * @param nodes Array of nodes to set. Defaults to an empty array.
   * @param edges Array of edges to set. Defaults to an empty array.
   */
  setData(t = [], e = []) {
    this.nodes.clear(), this.edges.clear();
    const i = I.normalizeGraphData({ nodes: t, edges: e });
    this._setData(i == null ? void 0 : i.nodes, i == null ? void 0 : i.edges), this.onChange(), this.startAndRender();
  }
  /** 
   * @private
   */
  _setData(t, e) {
    const i = (r) => {
      r.children.forEach((s) => {
        this.nodes.set(s.id, s), s.hasChildren() && i(s);
      });
    }, n = [];
    t.forEach((r) => {
      this.nodes.set(r.id, r), n.push({
        type: "node:add",
        node: r
      }), i(r);
    }), e.forEach((r) => {
      if (!this.nodes.has(r.from.id) || !this.nodes.has(r.to.id)) {
        console.warn(`Edge is pointing a node that doesn't exist. (${this.nodes.get(r.from.id)}) -> (${this.nodes.get(r.to.id)}). It has been skipped`);
        return;
      }
      this.edges.set(r.id, r), n.push({
        type: "edge:add",
        edge: r
      });
    }), this.dataBatchChanged(n);
  }
  /**
   * Adds a node to the graph.
   * 
   * @throws Error if a node with the same `id` already exists.
   * Triggers `onChange` after the node is successfully added.
   */
  addNode(t) {
    const e = I.normalizeNode(t);
    if (this.nodes.has(e.id))
      throw new Error(`Node with id ${e.id} already exists.`);
    return this.nodes.set(e.id, e), this.dataBatchChanged([{
      type: "node:add",
      node: e
    }]), this.onChange(), e;
  }
  /**
   * Retrieves a node from the graph by its ID.
   * 
   * Returns a deep clone of the node to prevent external mutations.
   * 
   * @param id The ID of the node or a Node object.
   * @returns A cloned `Node` if found, otherwise `undefined`.
   */
  getNode(t) {
    const e = this._getNode(t);
    return e ? structuredClone(e) : void 0;
  }
  /**
   * Retrieves a node from the graph by its ID.
   * 
   * Returns the actual node instance, allowing direct modifications.
   * 
   * **Warning:** Directly modifying nodes using this method may lead to unexpected behavior.
   * It is generally safer to use `getNode` which returns a cloned instance.
   * 
   * @param id The ID of the node or a Node object.
   * @returns The `Node` if found, otherwise `undefined`.
   */
  getMutableNode(t) {
    return this._getNode(t);
  }
  _getNode(t) {
    if (typeof t == "string") {
      const e = this.nodes.get(t);
      return e || void 0;
    } else return t instanceof A ? t : void 0;
  }
  /**
   * Removes a node from the graph by its ID.
   * 
   * Also removes any edges connected to the node.
   * 
   * @param id The ID of the node to remove.
   * Triggers `onChange` after the node and its edges are removed.
   */
  removeNode(t) {
    if (this.nodes.has(t)) {
      this.dataBatchChanged([{
        type: "node:remove",
        node: this.nodes.get(t)
      }]), this.nodes.delete(t);
      for (const [e, i] of this.edges)
        (i.from.id === t || i.to.id === t) && (this.dataBatchChanged([{
          type: "edge:remove",
          edge: this.edges.get(e)
        }]), this.edges.delete(e));
      this.onChange();
    }
  }
  /**
   * Adds an edge to the graph.
   * 
   * Both the source (`from`) and target (`to`) nodes must already exist in the graph.
   * Throws an error if an edge with the same ID already exists.
   * 
   * @param e The edge to add.
   * @throws Error if the edge ID already exists or if either node does not exist.
   * Triggers `onChange` after the edge is successfully added.
   */
  addEdge(t) {
    const e = I.normalizeEdge(t, this.nodes);
    if (!e)
      throw new Error("Either of the from or to nodes do not exist");
    if (this.edges.has(e.id))
      throw new Error(`Edge with id ${e.id} already exists.`);
    if (!this.nodes.has(e.from.id) || !this.nodes.has(e.to.id))
      throw new Error("Both nodes must exist in the graph before adding an edge.");
    return this.edges.set(e.id, e), this.dataBatchChanged([{
      type: "edge:add",
      edge: e
    }]), this.onChange(), e;
  }
  /**
   * Retrieves an edge from the graph by its ID.
   * 
   * Returns a deep clone of the edge to prevent external mutations.
   * 
   * @param id The ID of the edge.
   * @returns A cloned `Edge` if found, otherwise `undefined`.
   */
  getEdge(t) {
    const e = this.edges.get(t);
    return e ? structuredClone(e) : void 0;
  }
  /**
   * Retrieves an edge from the graph by its ID.
   * 
   * Returns the actual edge instance, allowing direct modifications.
   * 
   * **Warning:** Directly modifying edges using this method may lead to unexpected behavior.
   * It is generally safer to use `getEdge` which returns a cloned instance.
   * 
   * @param id The ID of the edge.
   * @returns The `Edge` if found, otherwise `undefined`.
   */
  getMutableEdge(t) {
    return this.edges.get(t);
  }
  /**
   * Removes an edge from the graph by its ID.
   * 
   * @param id The ID of the edge to remove.
   * Triggers `onChange` after the edge is removed.
   */
  removeEdge(t) {
    this.edges.has(t) && (this.dataBatchChanged([{
      type: "edge:remove",
      edge: this.edges.get(t)
    }]), this.edges.delete(t), this.onChange());
  }
  /**
   * Returns the number of nodes currently in the graph.
   * 
   * @returns The total node count.
   */
  getNodeCount() {
    return this.nodes.size;
  }
  /**
   * Returns the number of edges currently in the graph.
   * 
   * @returns The total edge count.
   */
  getEdgeCount() {
    return this.edges.size;
  }
  /**
   * Retrieves all nodes in the graph.
   * 
   * Returns clones of the nodes to prevent external modifications.
   * 
   * @returns An array of cloned `Node` objects.
   */
  getNodes() {
    return Array.from(this.nodes.values()).filter((t) => !t.isChild).map((t) => t.clone());
  }
  /**
   * Retrieves all nodes in the graph.
   * 
   * Returns the actual node instances, allowing direct modifications.
   * 
   * @remarks
   * ⚠️ **Warning:** Modifying nodes directly may lead to unexpected behavior.
   * It is generally safer to use `getNodes`, which returns cloned instances.
   * 
   * @returns An array of `Node` objects.
   */
  getMutableNodes() {
    return Array.from(this.nodes.values());
  }
  /**
   * Retrieves all visible nodes in the graph. Recursively adding visible children
   * 
   * Returns the actual node instances, allowing direct modifications.
   * 
   * @remarks
   * ⚠️ **Warning:** Modifying nodes directly may lead to unexpected behavior.
   * It is generally safer to use `getNodes`, which returns cloned instances.
   * 
   * @returns An array of `Node` objects.
   */
  getMutableVisibleNodes() {
    return this.getMutableNodes().filter((t) => t.visible);
  }
  /**
   * Retrieves all edges in the graph.
   * 
   * Returns clones of the edges to prevent external modifications.
   * 
   * @returns An array of cloned `Edge` objects.
   */
  getEdges() {
    return Array.from(this.edges.values()).map((t) => t.clone());
  }
  /**
   * Retrieves all edges in the graph.
   * 
   * Returns the actual edge instances, allowing direct modifications.
   * 
   * @remarks
   * ⚠️ **Warning:** Modifying edges directly may lead to unexpected behavior.
   * Use {@link getEdges} instead to work with safe clones.
   * 
   * @returns An array of `Edge` objects.
   */
  getMutableEdges() {
    return Array.from(this.edges.values());
  }
  /**
   * Retrieves all visible edges in the graph.
   * 
   * Returns the actual edge instances, allowing direct modifications.
   * 
   * @remarks
   * ⚠️ **Warning:** Modifying edges directly may lead to unexpected behavior.
   * Use {@link getEdges} instead to work with safe clones.
   * 
   * @returns An array of `Edge` objects.
   */
  getMutableVisibleEdges() {
    return this.getMutableEdges().filter((t) => t.visible);
  }
  /**
   * Finds all edges originating from a given node.
   * 
   * Returns cloned edges to prevent external modifications.
   * 
   * @param node The node or node ID to find outgoing edges from.
   * @returns An array of `Edge` objects whose `from` node matches the query.
   */
  getEdgesFromNode(t) {
    const e = this._getNode(t);
    return e ? this.getEdges().filter((i) => i.from.id === e.id) : [];
  }
  /**
   * Finds all edges pointing to a given node.
   * 
   * Returns cloned edges to prevent external modifications.
   * 
   * @param node The node or node ID to find incoming edges to.
   * @returns An array of `Edge` objects whose `to` node matches the query.
   */
  getEdgesToNode(t) {
    const e = this._getNode(t);
    return e ? this.getEdges().filter((i) => i.to.id === e.id) : [];
  }
  /**
   * Retrieves all nodes directly connected from the given node.
   * 
   * Returns cloned nodes to prevent external modifications.
   * 
   * @param node The node or node ID to find connections from.
   * @returns An array of `Node` objects directly connected from the given node.
   */
  getConnectedNodes(t) {
    const e = this._getNode(t);
    return e ? this.getEdgesFromNode(e.id).map((r) => r.to) : [];
  }
  setVisibleNodes(t) {
    const e = new Set(t.map((n) => n.id));
    let i = !1;
    this.nodes.forEach((n) => {
      const r = e.has(n.id);
      n.visible !== r && (n.toggleVisibility(r), i = !0);
    }), this.edges.forEach((n) => {
      var d, a;
      const r = (((d = n.getSubgraphFromNode()) == null ? void 0 : d.visible) ?? n.from.visible) && (((a = n.getSubgraphToNode()) == null ? void 0 : a.visible) ?? n.to.visible), s = !n.isSynthetic || !n.to.expanded, o = r && s;
      n.visible !== o && (n.toggleVisibility(o), i = !0);
    }), i && this.onChange();
  }
  hideNode(t) {
    t.hide(), t.getEdgesOut().forEach((e) => {
      e.hide();
    }), t.getEdgesIn().forEach((e) => {
      e.hide();
    }), this.onChange();
  }
  showNode(t) {
    t.show(), t.getEdgesOut().forEach((e) => {
      e.target.visible && e.show();
    }), t.getEdgesIn().forEach((e) => {
      e.from.visible && e.show();
    }), this.onChange();
  }
  toggleExpandNode(t) {
    t.toggleExpand(), this.onChange();
  }
  toggleExpandNodes(t) {
    t.forEach((e) => {
      e.toggleExpand();
    }), this.onChange();
  }
  /**
   * Trigger the next render update of the graph.
   */
  nextTick() {
    var t;
    (t = this.renderer) == null || t.nextTick();
  }
  /**
   * Trigger the next render update of the graph for the passed subjects.
   */
  nextTickFor(t) {
    var e;
    (e = this.renderer) == null || e.nextTickFor(t);
  }
  /**
   * Destroy all UI components.
   */
  destroy() {
    this.UIManager.destroy();
  }
  /**
   * The ID of the app
   */
  getAppID() {
    return this.app_id;
  }
  /**
   * @private
   * Set the parent graph instance if this instance is nested as a subgraph
   */
  setParentGraph(t) {
    this.parentGraph = t;
  }
  /**
   * @private
   * Set the parent graph instance if this instance is nested as a subgraph
   */
  getParentGraph() {
    return this.parentGraph;
  }
  getGraphDepth() {
    return this.graphDepth;
  }
  /**
   * @private
   */
  updateLayoutProgress(t, e, i) {
    var n;
    (n = this.renderer) == null || n.updateLayoutProgress(t, e, i);
  }
  /**
   * Brings the specified node or edge into focus within the graph view.
   * 
   * @param element The `Node` or `Edge` to focus.
   */
  focusElement(t) {
    this.renderer.focusElement(t);
  }
  /**
   * Selects a given node or edge in the graph.
   * 
   * @param element The `Node` or `Edge` to select.
   */
  selectElement(t) {
    t instanceof B ? this.renderer.getGraphInteraction().selectEdge(t.getGraphElement(), t) : t instanceof A && this.renderer.getGraphInteraction().selectNode(t.getGraphElement(), t);
  }
  /**
   * Deselect all
   */
  deselectAll() {
    this.renderer.getGraphInteraction().unselectAll();
  }
  /**
   * Add a highligh class to the given node or edge
   * 
   * @param element The `Node` or `Edge` to highligh.
   */
  highlightElement(t) {
    this.renderer.highlightElement(t);
  }
  /**
   * Remove a highligh class to the given node or edge
   * 
   * @param element The `Node` or `Edge` to select.
   */
  unHighlightElement(t) {
    this.renderer.unHighlightElement(t);
  }
}
const bt = {
  pivotick: {
    colors: [
      "#7EA2FB",
      // vibrant-blue
      "#A666F4",
      // vibrant-indigo
      "#85CB33",
      // vibrant-green
      "#FFB74D",
      // amber-orange
      "#4DD0E1",
      // cyan-light
      "#FFD54F",
      // yellowish accent
      "#BA68C8",
      // purple accent
      "#81C784",
      // green-light
      "#00BCD4",
      // cyan-light
      "#FFA726"
      // orange accent
    ],
    maxColors: 10,
    colorblindSafe: !1,
    description: "Official Pivotick palette"
  },
  "d3-category10": {
    colors: [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf"
    ],
    maxColors: 10,
    colorblindSafe: !1,
    description: "Classic D3 categorical palette"
  },
  "d3-tableau10": {
    colors: [
      "#4E79A7",
      "#F28E2B",
      "#E15759",
      "#76B7B2",
      "#59A14F",
      "#EDC948",
      "#B07AA1",
      "#FF9DA7",
      "#9C755F",
      "#BAB0AC"
    ],
    maxColors: 10,
    colorblindSafe: !1,
    description: "Modern Tableau 10 palette"
  },
  "okabe-ito": {
    colors: [
      "#E69F00",
      "#56B4E9",
      "#009E73",
      "#F0E442",
      "#0072B2",
      "#D55E00",
      "#CC79A7",
      "#000000"
    ],
    maxColors: 8,
    colorblindSafe: !0,
    description: "Colorblind-safe Okabe-Ito palette"
  },
  "brewer-set3": {
    colors: [
      "#8DD3C7",
      "#FFFFB3",
      "#BEBADA",
      "#FB8072",
      "#80B1D3",
      "#FDB462",
      "#B3DE69",
      "#FCCDE5",
      "#D9D9D9",
      "#BC80BD",
      "#CCEBC5",
      "#FFED6F"
    ],
    maxColors: 12,
    colorblindSafe: !1,
    description: "Large ColorBrewer Set3 palette"
  },
  "tol-bright": {
    colors: [
      "#4477AA",
      "#EE6677",
      "#228833",
      "#CCBB44",
      "#66CCEE",
      "#AA3377",
      "#BBBBBB"
    ],
    maxColors: 7,
    colorblindSafe: !0,
    description: "Paul Tol bright palette"
  },
  "kelly-22": {
    colors: [
      "#F2F3F4",
      "#222222",
      "#F3C300",
      "#875692",
      "#F38400",
      "#A1CAF1",
      "#BE0032",
      "#C2B280",
      "#848482",
      "#008856",
      "#E68FAC",
      "#0067A5",
      "#F99379",
      "#604E97",
      "#F6A600",
      "#B3446C",
      "#DCD300",
      "#882D17",
      "#8DB600",
      "#654522",
      "#E25822",
      "#2B3D26"
    ],
    maxColors: 22,
    colorblindSafe: !1,
    description: "Kelly's 22 colors of maximum contrast"
  },
  "tableau-40": {
    colors: [
      "#4E79A7",
      "#A0CBE8",
      "#F28E2B",
      "#FFBE7D",
      "#59A14F",
      "#8CD17D",
      "#B6992D",
      "#F1CE63",
      "#499894",
      "#86BCB6",
      "#E15759",
      "#FF9D9A",
      "#79706E",
      "#BAB0AC",
      "#D37295",
      "#FABFD2",
      "#B07AA1",
      "#D4A6C8",
      "#9D7660",
      "#D7B5A6"
    ],
    maxColors: 40,
    colorblindSafe: !1,
    description: "Tableau extended palette, 40 colors"
  }
};
class Mn {
  constructor(t) {
    h(this, "palette");
    h(this, "valueToColor", /* @__PURE__ */ new Map());
    h(this, "nextIndex", 0);
    this.palette = this.resolvePalette(t);
  }
  resolvePalette(t) {
    var i;
    if (!t)
      return ((i = bt.pivotick) == null ? void 0 : i.colors) ?? Object.values(bt)[0].colors;
    if (Array.isArray(t)) {
      if (t.length === 0)
        throw new Error("Custom palette array cannot be empty.");
      return t;
    }
    const e = bt[t];
    if (!e)
      throw new Error(`Palette "${t}" not found in PALETTE_REGISTRY.`);
    return e.colors;
  }
  /**
   * Returns a color for the given value.
   * - If the value was already mapped, returns the same color.
   * - If not, assigns the next palette color (cycles if needed).
   */
  getColor(t) {
    if (t == null)
      return this.palette[0];
    const e = this.valueToColor.get(t);
    if (e)
      return e;
    const i = this.palette[this.nextIndex % this.palette.length];
    return this.valueToColor.set(t, i), this.nextIndex++, i;
  }
  /**
   * Clears all mappings and restarts from the beginning of the palette.
   */
  reset() {
    this.valueToColor.clear(), this.nextIndex = 0;
  }
  /**
   * Returns current internal mapping (read-only snapshot).
   */
  getMapping() {
    return new Map(this.valueToColor);
  }
}
I.Node = A;
I.Edge = B;
I.ColorPaletteMapper = Mn;
export {
  Mn as C,
  B as E,
  I as G,
  A as N,
  G as S,
  D as T,
  rt as a
};
