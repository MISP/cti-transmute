var Io = Object.defineProperty;
var No = (e, t, n) => t in e ? Io(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var M = (e, t, n) => No(e, typeof t != "symbol" ? t + "" : t, n);
function Ro(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e);
  return Tr(this.cover(t, n), t, n, e);
}
function Tr(e, t, n, i) {
  if (isNaN(t) || isNaN(n)) return e;
  var r, o = e._root, s = { data: i }, a = e._x0, l = e._y0, c = e._x1, u = e._y1, g, f, p, S, b, y, w, v;
  if (!o) return e._root = s, e;
  for (; o.length; )
    if ((b = t >= (g = (a + c) / 2)) ? a = g : c = g, (y = n >= (f = (l + u) / 2)) ? l = f : u = f, r = o, !(o = o[w = y << 1 | b])) return r[w] = s, e;
  if (p = +e._x.call(null, o.data), S = +e._y.call(null, o.data), t === p && n === S) return s.next = o, r ? r[w] = s : e._root = s, e;
  do
    r = r ? r[w] = new Array(4) : e._root = new Array(4), (b = t >= (g = (a + c) / 2)) ? a = g : c = g, (y = n >= (f = (l + u) / 2)) ? l = f : u = f;
  while ((w = y << 1 | b) === (v = (S >= f) << 1 | p >= g));
  return r[v] = o, r[w] = s, e;
}
function Co(e) {
  var t, n, i = e.length, r, o, s = new Array(i), a = new Array(i), l = 1 / 0, c = 1 / 0, u = -1 / 0, g = -1 / 0;
  for (n = 0; n < i; ++n)
    isNaN(r = +this._x.call(null, t = e[n])) || isNaN(o = +this._y.call(null, t)) || (s[n] = r, a[n] = o, r < l && (l = r), r > u && (u = r), o < c && (c = o), o > g && (g = o));
  if (l > u || c > g) return this;
  for (this.cover(l, c).cover(u, g), n = 0; n < i; ++n)
    Tr(this, s[n], a[n], e[n]);
  return this;
}
function Do(e, t) {
  if (isNaN(e = +e) || isNaN(t = +t)) return this;
  var n = this._x0, i = this._y0, r = this._x1, o = this._y1;
  if (isNaN(n))
    r = (n = Math.floor(e)) + 1, o = (i = Math.floor(t)) + 1;
  else {
    for (var s = r - n || 1, a = this._root, l, c; n > e || e >= r || i > t || t >= o; )
      switch (c = (t < i) << 1 | e < n, l = new Array(4), l[c] = a, a = l, s *= 2, c) {
        case 0:
          r = n + s, o = i + s;
          break;
        case 1:
          n = r - s, o = i + s;
          break;
        case 2:
          r = n + s, i = o - s;
          break;
        case 3:
          n = r - s, i = o - s;
          break;
      }
    this._root && this._root.length && (this._root = a);
  }
  return this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = o, this;
}
function Oo() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length) do
      e.push(t.data);
    while (t = t.next);
  }), e;
}
function ko(e) {
  return arguments.length ? this.cover(+e[0][0], +e[0][1]).cover(+e[1][0], +e[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function _t(e, t, n, i, r) {
  this.node = e, this.x0 = t, this.y0 = n, this.x1 = i, this.y1 = r;
}
function Lo(e, t, n) {
  var i, r = this._x0, o = this._y0, s, a, l, c, u = this._x1, g = this._y1, f = [], p = this._root, S, b;
  for (p && f.push(new _t(p, r, o, u, g)), n == null ? n = 1 / 0 : (r = e - n, o = t - n, u = e + n, g = t + n, n *= n); S = f.pop(); )
    if (!(!(p = S.node) || (s = S.x0) > u || (a = S.y0) > g || (l = S.x1) < r || (c = S.y1) < o))
      if (p.length) {
        var y = (s + l) / 2, w = (a + c) / 2;
        f.push(new _t(p[3], y, w, l, c), new _t(p[2], s, w, y, c), new _t(p[1], y, a, l, w), new _t(p[0], s, a, y, w)), (b = (t >= w) << 1 | e >= y) && (S = f[f.length - 1], f[f.length - 1] = f[f.length - 1 - b], f[f.length - 1 - b] = S);
      } else {
        var v = e - +this._x.call(null, p.data), E = t - +this._y.call(null, p.data), m = v * v + E * E;
        if (m < n) {
          var I = Math.sqrt(n = m);
          r = e - I, o = t - I, u = e + I, g = t + I, i = p.data;
        }
      }
  return i;
}
function Fo(e) {
  if (isNaN(u = +this._x.call(null, e)) || isNaN(g = +this._y.call(null, e))) return this;
  var t, n = this._root, i, r, o, s = this._x0, a = this._y0, l = this._x1, c = this._y1, u, g, f, p, S, b, y, w;
  if (!n) return this;
  if (n.length) for (; ; ) {
    if ((S = u >= (f = (s + l) / 2)) ? s = f : l = f, (b = g >= (p = (a + c) / 2)) ? a = p : c = p, t = n, !(n = n[y = b << 1 | S])) return this;
    if (!n.length) break;
    (t[y + 1 & 3] || t[y + 2 & 3] || t[y + 3 & 3]) && (i = t, w = y);
  }
  for (; n.data !== e; ) if (r = n, !(n = n.next)) return this;
  return (o = n.next) && delete n.next, r ? (o ? r.next = o : delete r.next, this) : t ? (o ? t[y] = o : delete t[y], (n = t[0] || t[1] || t[2] || t[3]) && n === (t[3] || t[2] || t[1] || t[0]) && !n.length && (i ? i[w] = n : this._root = n), this) : (this._root = o, this);
}
function Po(e) {
  for (var t = 0, n = e.length; t < n; ++t) this.remove(e[t]);
  return this;
}
function zo() {
  return this._root;
}
function Go() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length) do
      ++e;
    while (t = t.next);
  }), e;
}
function Bo(e) {
  var t = [], n, i = this._root, r, o, s, a, l;
  for (i && t.push(new _t(i, this._x0, this._y0, this._x1, this._y1)); n = t.pop(); )
    if (!e(i = n.node, o = n.x0, s = n.y0, a = n.x1, l = n.y1) && i.length) {
      var c = (o + a) / 2, u = (s + l) / 2;
      (r = i[3]) && t.push(new _t(r, c, u, a, l)), (r = i[2]) && t.push(new _t(r, o, u, c, l)), (r = i[1]) && t.push(new _t(r, c, s, a, u)), (r = i[0]) && t.push(new _t(r, o, s, c, u));
    }
  return this;
}
function jo(e) {
  var t = [], n = [], i;
  for (this._root && t.push(new _t(this._root, this._x0, this._y0, this._x1, this._y1)); i = t.pop(); ) {
    var r = i.node;
    if (r.length) {
      var o, s = i.x0, a = i.y0, l = i.x1, c = i.y1, u = (s + l) / 2, g = (a + c) / 2;
      (o = r[0]) && t.push(new _t(o, s, a, u, g)), (o = r[1]) && t.push(new _t(o, u, a, l, g)), (o = r[2]) && t.push(new _t(o, s, g, u, c)), (o = r[3]) && t.push(new _t(o, u, g, l, c));
    }
    n.push(i);
  }
  for (; i = n.pop(); )
    e(i.node, i.x0, i.y0, i.x1, i.y1);
  return this;
}
function Uo(e) {
  return e[0];
}
function Ho(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function Wo(e) {
  return e[1];
}
function Ko(e) {
  return arguments.length ? (this._y = e, this) : this._y;
}
function yi(e, t, n) {
  var i = new vi(t ?? Uo, n ?? Wo, NaN, NaN, NaN, NaN);
  return e == null ? i : i.addAll(e);
}
function vi(e, t, n, i, r, o) {
  this._x = e, this._y = t, this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = o, this._root = void 0;
}
function Ri(e) {
  for (var t = { data: e.data }, n = t; e = e.next; ) n = n.next = { data: e.data };
  return t;
}
var wt = yi.prototype = vi.prototype;
wt.copy = function() {
  var e = new vi(this._x, this._y, this._x0, this._y0, this._x1, this._y1), t = this._root, n, i;
  if (!t) return e;
  if (!t.length) return e._root = Ri(t), e;
  for (n = [{ source: t, target: e._root = new Array(4) }]; t = n.pop(); )
    for (var r = 0; r < 4; ++r)
      (i = t.source[r]) && (i.length ? n.push({ source: i, target: t.target[r] = new Array(4) }) : t.target[r] = Ri(i));
  return e;
};
wt.add = Ro;
wt.addAll = Co;
wt.cover = Do;
wt.data = Oo;
wt.extent = ko;
wt.find = Lo;
wt.remove = Fo;
wt.removeAll = Po;
wt.root = zo;
wt.size = Go;
wt.visit = Bo;
wt.visitAfter = jo;
wt.x = Ho;
wt.y = Ko;
function dt(e) {
  return function() {
    return e;
  };
}
function se(e) {
  return (e() - 0.5) * 1e-6;
}
function Vo(e) {
  return e.x + e.vx;
}
function $o(e) {
  return e.y + e.vy;
}
function qo(e) {
  var t, n, i, r = 1, o = 1;
  typeof e != "function" && (e = dt(e == null ? 1 : +e));
  function s() {
    for (var c, u = t.length, g, f, p, S, b, y, w = 0; w < o; ++w)
      for (g = yi(t, Vo, $o).visitAfter(a), c = 0; c < u; ++c)
        f = t[c], b = n[f.index], y = b * b, p = f.x + f.vx, S = f.y + f.vy, g.visit(v);
    function v(E, m, I, D, G) {
      var x = E.data, R = E.r, F = b + R;
      if (x) {
        if (x.index > f.index) {
          var B = p - x.x - x.vx, Q = S - x.y - x.vy, C = B * B + Q * Q;
          C < F * F && (B === 0 && (B = se(i), C += B * B), Q === 0 && (Q = se(i), C += Q * Q), C = (F - (C = Math.sqrt(C))) / C * r, f.vx += (B *= C) * (F = (R *= R) / (y + R)), f.vy += (Q *= C) * F, x.vx -= B * (F = 1 - F), x.vy -= Q * F);
        }
        return;
      }
      return m > p + F || D < p - F || I > S + F || G < S - F;
    }
  }
  function a(c) {
    if (c.data) return c.r = n[c.data.index];
    for (var u = c.r = 0; u < 4; ++u)
      c[u] && c[u].r > c.r && (c.r = c[u].r);
  }
  function l() {
    if (t) {
      var c, u = t.length, g;
      for (n = new Array(u), c = 0; c < u; ++c) g = t[c], n[g.index] = +e(g, c, t);
    }
  }
  return s.initialize = function(c, u) {
    t = c, i = u, l();
  }, s.iterations = function(c) {
    return arguments.length ? (o = +c, s) : o;
  }, s.strength = function(c) {
    return arguments.length ? (r = +c, s) : r;
  }, s.radius = function(c) {
    return arguments.length ? (e = typeof c == "function" ? c : dt(+c), l(), s) : e;
  }, s;
}
function Yo(e) {
  return e.index;
}
function Ci(e, t) {
  var n = e.get(t);
  if (!n) throw new Error("node not found: " + t);
  return n;
}
function Xo(e) {
  var t = Yo, n = g, i, r = dt(30), o, s, a, l, c, u = 1;
  e == null && (e = []);
  function g(y) {
    return 1 / Math.min(a[y.source.index], a[y.target.index]);
  }
  function f(y) {
    for (var w = 0, v = e.length; w < u; ++w)
      for (var E = 0, m, I, D, G, x, R, F; E < v; ++E)
        m = e[E], I = m.source, D = m.target, G = D.x + D.vx - I.x - I.vx || se(c), x = D.y + D.vy - I.y - I.vy || se(c), R = Math.sqrt(G * G + x * x), R = (R - o[E]) / R * y * i[E], G *= R, x *= R, D.vx -= G * (F = l[E]), D.vy -= x * F, I.vx += G * (F = 1 - F), I.vy += x * F;
  }
  function p() {
    if (s) {
      var y, w = s.length, v = e.length, E = new Map(s.map((I, D) => [t(I, D, s), I])), m;
      for (y = 0, a = new Array(w); y < v; ++y)
        m = e[y], m.index = y, typeof m.source != "object" && (m.source = Ci(E, m.source)), typeof m.target != "object" && (m.target = Ci(E, m.target)), a[m.source.index] = (a[m.source.index] || 0) + 1, a[m.target.index] = (a[m.target.index] || 0) + 1;
      for (y = 0, l = new Array(v); y < v; ++y)
        m = e[y], l[y] = a[m.source.index] / (a[m.source.index] + a[m.target.index]);
      i = new Array(v), S(), o = new Array(v), b();
    }
  }
  function S() {
    if (s)
      for (var y = 0, w = e.length; y < w; ++y)
        i[y] = +n(e[y], y, e);
  }
  function b() {
    if (s)
      for (var y = 0, w = e.length; y < w; ++y)
        o[y] = +r(e[y], y, e);
  }
  return f.initialize = function(y, w) {
    s = y, c = w, p();
  }, f.links = function(y) {
    return arguments.length ? (e = y, p(), f) : e;
  }, f.id = function(y) {
    return arguments.length ? (t = y, f) : t;
  }, f.iterations = function(y) {
    return arguments.length ? (u = +y, f) : u;
  }, f.strength = function(y) {
    return arguments.length ? (n = typeof y == "function" ? y : dt(+y), S(), f) : n;
  }, f.distance = function(y) {
    return arguments.length ? (r = typeof y == "function" ? y : dt(+y), b(), f) : r;
  }, f;
}
var Zo = { value: () => {
} };
function _i() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new Sn(n);
}
function Sn(e) {
  this._ = e;
}
function Jo(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", r = n.indexOf(".");
    if (r >= 0 && (i = n.slice(r + 1), n = n.slice(0, r)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
Sn.prototype = _i.prototype = { constructor: Sn, on: function(e, t) {
  var n = this._, i = Jo(e + "", n), r, o = -1, s = i.length;
  if (arguments.length < 2) {
    for (; ++o < s; ) if ((r = (e = i[o]).type) && (r = Qo(n[r], e.name))) return r;
    return;
  }
  if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
  for (; ++o < s; )
    if (r = (e = i[o]).type) n[r] = Di(n[r], e.name, t);
    else if (t == null) for (r in n) n[r] = Di(n[r], e.name, null);
  return this;
}, copy: function() {
  var e = {}, t = this._;
  for (var n in t) e[n] = t[n].slice();
  return new Sn(e);
}, call: function(e, t) {
  if ((r = arguments.length - 2) > 0) for (var n = new Array(r), i = 0, r, o; i < r; ++i) n[i] = arguments[i + 2];
  if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
  for (o = this._[e], i = 0, r = o.length; i < r; ++i) o[i].value.apply(t, n);
}, apply: function(e, t, n) {
  if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
  for (var i = this._[e], r = 0, o = i.length; r < o; ++r) i[r].value.apply(t, n);
} };
function Qo(e, t) {
  for (var n = 0, i = e.length, r; n < i; ++n)
    if ((r = e[n]).name === t)
      return r.value;
}
function Di(e, t, n) {
  for (var i = 0, r = e.length; i < r; ++i)
    if (e[i].name === t) {
      e[i] = Zo, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var Ee = 0, Ve = 0, Ue = 0, Ar = 1e3, An, $e, xn = 0, de = 0, Dn = 0, Je = typeof performance == "object" && performance.now ? performance : Date, xr = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function Er() {
  return de || (xr(ts), de = Je.now() + Dn);
}
function ts() {
  de = 0;
}
function ci() {
  this._call = this._time = this._next = null;
}
ci.prototype = Mr.prototype = { constructor: ci, restart: function(e, t, n) {
  if (typeof e != "function") throw new TypeError("callback is not a function");
  n = (n == null ? Er() : +n) + (t == null ? 0 : +t), !this._next && $e !== this && ($e ? $e._next = this : An = this, $e = this), this._call = e, this._time = n, li();
}, stop: function() {
  this._call && (this._call = null, this._time = 1 / 0, li());
} };
function Mr(e, t, n) {
  var i = new ci();
  return i.restart(e, t, n), i;
}
function es() {
  Er(), ++Ee;
  for (var e = An, t; e; )
    (t = de - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --Ee;
}
function Oi() {
  de = (xn = Je.now()) + Dn, Ee = Ve = 0;
  try {
    es();
  } finally {
    Ee = 0, is(), de = 0;
  }
}
function ns() {
  var e = Je.now(), t = e - xn;
  t > Ar && (Dn -= t, xn = e);
}
function is() {
  for (var e, t = An, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : An = n);
  $e = e, li(i);
}
function li(e) {
  if (!Ee) {
    Ve && (Ve = clearTimeout(Ve));
    var t = e - de;
    t > 24 ? (e < 1 / 0 && (Ve = setTimeout(Oi, e - Je.now() - Dn)), Ue && (Ue = clearInterval(Ue))) : (Ue || (xn = Je.now(), Ue = setInterval(ns, Ar)), Ee = 1, xr(Oi));
  }
}
const rs = 1664525, os = 1013904223, ki = 4294967296;
function ss() {
  let e = 1;
  return () => (e = (rs * e + os) % ki) / ki;
}
function as(e) {
  return e.x;
}
function cs(e) {
  return e.y;
}
var ls = 10, us = Math.PI * (3 - Math.sqrt(5));
function hs(e) {
  var t, n = 1, i = 1e-3, r = 1 - Math.pow(i, 1 / 300), o = 0, s = 0.6, a = /* @__PURE__ */ new Map(), l = Mr(g), c = _i("tick", "end"), u = ss();
  e == null && (e = []);
  function g() {
    f(), c.call("tick", t), n < i && (l.stop(), c.call("end", t));
  }
  function f(b) {
    var y, w = e.length, v;
    b === void 0 && (b = 1);
    for (var E = 0; E < b; ++E)
      for (n += (o - n) * r, a.forEach(function(m) {
        m(n);
      }), y = 0; y < w; ++y)
        v = e[y], v.fx == null ? v.x += v.vx *= s : (v.x = v.fx, v.vx = 0), v.fy == null ? v.y += v.vy *= s : (v.y = v.fy, v.vy = 0);
    return t;
  }
  function p() {
    for (var b = 0, y = e.length, w; b < y; ++b) {
      if (w = e[b], w.index = b, w.fx != null && (w.x = w.fx), w.fy != null && (w.y = w.fy), isNaN(w.x) || isNaN(w.y)) {
        var v = ls * Math.sqrt(0.5 + b), E = b * us;
        w.x = v * Math.cos(E), w.y = v * Math.sin(E);
      }
      (isNaN(w.vx) || isNaN(w.vy)) && (w.vx = w.vy = 0);
    }
  }
  function S(b) {
    return b.initialize && b.initialize(e, u), b;
  }
  return p(), t = { tick: f, restart: function() {
    return l.restart(g), t;
  }, stop: function() {
    return l.stop(), t;
  }, nodes: function(b) {
    return arguments.length ? (e = b, p(), a.forEach(S), t) : e;
  }, alpha: function(b) {
    return arguments.length ? (n = +b, t) : n;
  }, alphaMin: function(b) {
    return arguments.length ? (i = +b, t) : i;
  }, alphaDecay: function(b) {
    return arguments.length ? (r = +b, t) : +r;
  }, alphaTarget: function(b) {
    return arguments.length ? (o = +b, t) : o;
  }, velocityDecay: function(b) {
    return arguments.length ? (s = 1 - b, t) : 1 - s;
  }, randomSource: function(b) {
    return arguments.length ? (u = b, a.forEach(S), t) : u;
  }, force: function(b, y) {
    return arguments.length > 1 ? (y == null ? a.delete(b) : a.set(b, S(y)), t) : a.get(b);
  }, find: function(b, y, w) {
    var v = 0, E = e.length, m, I, D, G, x;
    for (w == null ? w = 1 / 0 : w *= w, v = 0; v < E; ++v)
      G = e[v], m = b - G.x, I = y - G.y, D = m * m + I * I, D < w && (x = G, w = D);
    return x;
  }, on: function(b, y) {
    return arguments.length > 1 ? (c.on(b, y), t) : c.on(b);
  } };
}
function fs() {
  var e, t, n, i, r = dt(-30), o, s = 1, a = 1 / 0, l = 0.81;
  function c(p) {
    var S, b = e.length, y = yi(e, as, cs).visitAfter(g);
    for (i = p, S = 0; S < b; ++S) t = e[S], y.visit(f);
  }
  function u() {
    if (e) {
      var p, S = e.length, b;
      for (o = new Array(S), p = 0; p < S; ++p) b = e[p], o[b.index] = +r(b, p, e);
    }
  }
  function g(p) {
    var S = 0, b, y, w = 0, v, E, m;
    if (p.length) {
      for (v = E = m = 0; m < 4; ++m)
        (b = p[m]) && (y = Math.abs(b.value)) && (S += b.value, w += y, v += y * b.x, E += y * b.y);
      p.x = v / w, p.y = E / w;
    } else {
      b = p, b.x = b.data.x, b.y = b.data.y;
      do
        S += o[b.data.index];
      while (b = b.next);
    }
    p.value = S;
  }
  function f(p, S, b, y) {
    if (!p.value) return !0;
    var w = p.x - t.x, v = p.y - t.y, E = y - S, m = w * w + v * v;
    if (E * E / l < m)
      return m < a && (w === 0 && (w = se(n), m += w * w), v === 0 && (v = se(n), m += v * v), m < s && (m = Math.sqrt(s * m)), t.vx += w * p.value * i / m, t.vy += v * p.value * i / m), !0;
    if (p.length || m >= a) return;
    (p.data !== t || p.next) && (w === 0 && (w = se(n), m += w * w), v === 0 && (v = se(n), m += v * v), m < s && (m = Math.sqrt(s * m)));
    do
      p.data !== t && (E = o[p.data.index] * i / m, t.vx += w * E, t.vy += v * E);
    while (p = p.next);
  }
  return c.initialize = function(p, S) {
    e = p, n = S, u();
  }, c.strength = function(p) {
    return arguments.length ? (r = typeof p == "function" ? p : dt(+p), u(), c) : r;
  }, c.distanceMin = function(p) {
    return arguments.length ? (s = p * p, c) : Math.sqrt(s);
  }, c.distanceMax = function(p) {
    return arguments.length ? (a = p * p, c) : Math.sqrt(a);
  }, c.theta = function(p) {
    return arguments.length ? (l = p * p, c) : Math.sqrt(l);
  }, c;
}
function Li(e, t, n) {
  var i, r = dt(0.1), o, s;
  typeof e != "function" && (e = dt(+e)), t == null && (t = 0), n == null && (n = 0);
  function a(c) {
    for (var u = 0, g = i.length; u < g; ++u) {
      var f = i[u], p = f.x - t || 1e-6, S = f.y - n || 1e-6, b = Math.sqrt(p * p + S * S), y = (s[u] - b) * o[u] * c / b;
      f.vx += p * y, f.vy += S * y;
    }
  }
  function l() {
    if (i) {
      var c, u = i.length;
      for (o = new Array(u), s = new Array(u), c = 0; c < u; ++c)
        s[c] = +e(i[c], c, i), o[c] = isNaN(s[c]) ? 0 : +r(i[c], c, i);
    }
  }
  return a.initialize = function(c) {
    i = c, l();
  }, a.strength = function(c) {
    return arguments.length ? (r = typeof c == "function" ? c : dt(+c), l(), a) : r;
  }, a.radius = function(c) {
    return arguments.length ? (e = typeof c == "function" ? c : dt(+c), l(), a) : e;
  }, a.x = function(c) {
    return arguments.length ? (t = +c, a) : t;
  }, a.y = function(c) {
    return arguments.length ? (n = +c, a) : n;
  }, a;
}
function Fi(e) {
  var t = dt(0.1), n, i, r;
  typeof e != "function" && (e = dt(e == null ? 0 : +e));
  function o(a) {
    for (var l = 0, c = n.length, u; l < c; ++l)
      u = n[l], u.vx += (r[l] - u.x) * i[l] * a;
  }
  function s() {
    if (n) {
      var a, l = n.length;
      for (i = new Array(l), r = new Array(l), a = 0; a < l; ++a)
        i[a] = isNaN(r[a] = +e(n[a], a, n)) ? 0 : +t(n[a], a, n);
    }
  }
  return o.initialize = function(a) {
    n = a, s();
  }, o.strength = function(a) {
    return arguments.length ? (t = typeof a == "function" ? a : dt(+a), s(), o) : t;
  }, o.x = function(a) {
    return arguments.length ? (e = typeof a == "function" ? a : dt(+a), s(), o) : e;
  }, o;
}
function Pi(e) {
  var t = dt(0.1), n, i, r;
  typeof e != "function" && (e = dt(e == null ? 0 : +e));
  function o(a) {
    for (var l = 0, c = n.length, u; l < c; ++l)
      u = n[l], u.vy += (r[l] - u.y) * i[l] * a;
  }
  function s() {
    if (n) {
      var a, l = n.length;
      for (i = new Array(l), r = new Array(l), a = 0; a < l; ++a)
        i[a] = isNaN(r[a] = +e(n[a], a, n)) ? 0 : +t(n[a], a, n);
    }
  }
  return o.initialize = function(a) {
    n = a, s();
  }, o.strength = function(a) {
    return arguments.length ? (t = typeof a == "function" ? a : dt(+a), s(), o) : t;
  }, o.y = function(a) {
    return arguments.length ? (e = typeof a == "function" ? a : dt(+a), s(), o) : e;
  }, o;
}
function ds(e = 0, t = 0, n = 1e-3) {
  let i = [], r;
  function o() {
    r = typeof n == "function" ? n : () => n;
  }
  function s(a) {
    for (let l = 0, c = i.length; l < c; ++l) {
      const u = i[l], g = r(u, l, i);
      u.vx != null && u.x != null && (u.vx -= (u.x - e) * g * a), u.vy != null && u.y != null && (u.vy -= (u.y - t) * g * a);
    }
  }
  return s.initialize = (a) => {
    i = a, o();
  }, s.x = function(a) {
    return arguments.length ? (e = a, s) : e;
  }, s.y = function(a) {
    return arguments.length ? (t = a, s) : t;
  }, s.strength = function(a) {
    return arguments.length ? (n = a, o(), s) : n;
  }, s;
}
var ui = "http://www.w3.org/1999/xhtml";
const zi = { svg: "http://www.w3.org/2000/svg", xhtml: ui, xlink: "http://www.w3.org/1999/xlink", xml: "http://www.w3.org/XML/1998/namespace", xmlns: "http://www.w3.org/2000/xmlns/" };
function Ir(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), zi.hasOwnProperty(t) ? { space: zi[t], local: e } : e;
}
function ps(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ui && t.documentElement.namespaceURI === ui ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function gs(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Nr(e) {
  var t = Ir(e);
  return (t.local ? gs : ps)(t);
}
function ms() {
}
function Rr(e) {
  return e == null ? ms : function() {
    return this.querySelector(e);
  };
}
function ys(e) {
  typeof e != "function" && (e = Rr(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var o = t[r], s = o.length, a = i[r] = new Array(s), l, c, u = 0; u < s; ++u)
      (l = o[u]) && (c = e.call(l, l.__data__, u, o)) && ("__data__" in l && (c.__data__ = l.__data__), a[u] = c);
  return new Rt(i, this._parents);
}
function vs(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function _s() {
  return [];
}
function bs(e) {
  return e == null ? _s : function() {
    return this.querySelectorAll(e);
  };
}
function ws(e) {
  return function() {
    return vs(e.apply(this, arguments));
  };
}
function Ss(e) {
  typeof e == "function" ? e = ws(e) : e = bs(e);
  for (var t = this._groups, n = t.length, i = [], r = [], o = 0; o < n; ++o)
    for (var s = t[o], a = s.length, l, c = 0; c < a; ++c)
      (l = s[c]) && (i.push(e.call(l, l.__data__, c, s)), r.push(l));
  return new Rt(i, r);
}
function Ts(e) {
  return function() {
    return this.matches(e);
  };
}
function Cr(e) {
  return function(t) {
    return t.matches(e);
  };
}
var As = Array.prototype.find;
function xs(e) {
  return function() {
    return As.call(this.children, e);
  };
}
function Es() {
  return this.firstElementChild;
}
function Ms(e) {
  return this.select(e == null ? Es : xs(typeof e == "function" ? e : Cr(e)));
}
var Is = Array.prototype.filter;
function Ns() {
  return Array.from(this.children);
}
function Rs(e) {
  return function() {
    return Is.call(this.children, e);
  };
}
function Cs(e) {
  return this.selectAll(e == null ? Ns : Rs(typeof e == "function" ? e : Cr(e)));
}
function Ds(e) {
  typeof e != "function" && (e = Ts(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var o = t[r], s = o.length, a = i[r] = [], l, c = 0; c < s; ++c)
      (l = o[c]) && e.call(l, l.__data__, c, o) && a.push(l);
  return new Rt(i, this._parents);
}
function Dr(e) {
  return new Array(e.length);
}
function Os() {
  return new Rt(this._enter || this._groups.map(Dr), this._parents);
}
function En(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
En.prototype = { constructor: En, appendChild: function(e) {
  return this._parent.insertBefore(e, this._next);
}, insertBefore: function(e, t) {
  return this._parent.insertBefore(e, t);
}, querySelector: function(e) {
  return this._parent.querySelector(e);
}, querySelectorAll: function(e) {
  return this._parent.querySelectorAll(e);
} };
function ks(e) {
  return function() {
    return e;
  };
}
function Ls(e, t, n, i, r, o) {
  for (var s = 0, a, l = t.length, c = o.length; s < c; ++s)
    (a = t[s]) ? (a.__data__ = o[s], i[s] = a) : n[s] = new En(e, o[s]);
  for (; s < l; ++s)
    (a = t[s]) && (r[s] = a);
}
function Fs(e, t, n, i, r, o, s) {
  var a, l, c = /* @__PURE__ */ new Map(), u = t.length, g = o.length, f = new Array(u), p;
  for (a = 0; a < u; ++a)
    (l = t[a]) && (f[a] = p = s.call(l, l.__data__, a, t) + "", c.has(p) ? r[a] = l : c.set(p, l));
  for (a = 0; a < g; ++a)
    p = s.call(e, o[a], a, o) + "", (l = c.get(p)) ? (i[a] = l, l.__data__ = o[a], c.delete(p)) : n[a] = new En(e, o[a]);
  for (a = 0; a < u; ++a)
    (l = t[a]) && c.get(f[a]) === l && (r[a] = l);
}
function Ps(e) {
  return e.__data__;
}
function zs(e, t) {
  if (!arguments.length) return Array.from(this, Ps);
  var n = t ? Fs : Ls, i = this._parents, r = this._groups;
  typeof e != "function" && (e = ks(e));
  for (var o = r.length, s = new Array(o), a = new Array(o), l = new Array(o), c = 0; c < o; ++c) {
    var u = i[c], g = r[c], f = g.length, p = Gs(e.call(u, u && u.__data__, c, i)), S = p.length, b = a[c] = new Array(S), y = s[c] = new Array(S), w = l[c] = new Array(f);
    n(u, g, b, y, w, p, t);
    for (var v = 0, E = 0, m, I; v < S; ++v)
      if (m = b[v]) {
        for (v >= E && (E = v + 1); !(I = y[E]) && ++E < S; ) ;
        m._next = I || null;
      }
  }
  return s = new Rt(s, i), s._enter = a, s._exit = l, s;
}
function Gs(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Bs() {
  return new Rt(this._exit || this._groups.map(Dr), this._parents);
}
function js(e, t, n) {
  var i = this.enter(), r = this, o = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (r = t(r), r && (r = r.selection())), n == null ? o.remove() : n(o), i && r ? i.merge(r).order() : r;
}
function Us(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, r = n.length, o = i.length, s = Math.min(r, o), a = new Array(r), l = 0; l < s; ++l)
    for (var c = n[l], u = i[l], g = c.length, f = a[l] = new Array(g), p, S = 0; S < g; ++S)
      (p = c[S] || u[S]) && (f[S] = p);
  for (; l < r; ++l)
    a[l] = n[l];
  return new Rt(a, this._parents);
}
function Hs() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], r = i.length - 1, o = i[r], s; --r >= 0; )
      (s = i[r]) && (o && s.compareDocumentPosition(o) ^ 4 && o.parentNode.insertBefore(s, o), o = s);
  return this;
}
function Ws(e) {
  e || (e = Ks);
  function t(g, f) {
    return g && f ? e(g.__data__, f.__data__) : !g - !f;
  }
  for (var n = this._groups, i = n.length, r = new Array(i), o = 0; o < i; ++o) {
    for (var s = n[o], a = s.length, l = r[o] = new Array(a), c, u = 0; u < a; ++u)
      (c = s[u]) && (l[u] = c);
    l.sort(t);
  }
  return new Rt(r, this._parents).order();
}
function Ks(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function Vs() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function $s() {
  return Array.from(this);
}
function qs() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, o = i.length; r < o; ++r) {
      var s = i[r];
      if (s) return s;
    }
  return null;
}
function Ys() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function Xs() {
  return !this.node();
}
function Zs(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var r = t[n], o = 0, s = r.length, a; o < s; ++o)
      (a = r[o]) && e.call(a, a.__data__, o, r);
  return this;
}
function Js(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Qs(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function ta(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function ea(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function na(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function ia(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function ra(e, t) {
  var n = Ir(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? Qs : Js : typeof t == "function" ? n.local ? ia : na : n.local ? ea : ta)(n, t));
}
function Or(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function oa(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function sa(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function aa(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function ca(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? oa : typeof t == "function" ? aa : sa)(e, t, n ?? "")) : la(this.node(), e);
}
function la(e, t) {
  return e.style.getPropertyValue(t) || Or(e).getComputedStyle(e, null).getPropertyValue(t);
}
function ua(e) {
  return function() {
    delete this[e];
  };
}
function ha(e, t) {
  return function() {
    this[e] = t;
  };
}
function fa(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function da(e, t) {
  return arguments.length > 1 ? this.each((t == null ? ua : typeof t == "function" ? fa : ha)(e, t)) : this.node()[e];
}
function kr(e) {
  return e.trim().split(/^|\s+/);
}
function bi(e) {
  return e.classList || new Lr(e);
}
function Lr(e) {
  this._node = e, this._names = kr(e.getAttribute("class") || "");
}
Lr.prototype = { add: function(e) {
  var t = this._names.indexOf(e);
  t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
}, remove: function(e) {
  var t = this._names.indexOf(e);
  t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
}, contains: function(e) {
  return this._names.indexOf(e) >= 0;
} };
function Fr(e, t) {
  for (var n = bi(e), i = -1, r = t.length; ++i < r; ) n.add(t[i]);
}
function Pr(e, t) {
  for (var n = bi(e), i = -1, r = t.length; ++i < r; ) n.remove(t[i]);
}
function pa(e) {
  return function() {
    Fr(this, e);
  };
}
function ga(e) {
  return function() {
    Pr(this, e);
  };
}
function ma(e, t) {
  return function() {
    (t.apply(this, arguments) ? Fr : Pr)(this, e);
  };
}
function ya(e, t) {
  var n = kr(e + "");
  if (arguments.length < 2) {
    for (var i = bi(this.node()), r = -1, o = n.length; ++r < o; ) if (!i.contains(n[r])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? ma : t ? pa : ga)(n, t));
}
function va() {
  this.textContent = "";
}
function _a(e) {
  return function() {
    this.textContent = e;
  };
}
function ba(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function wa(e) {
  return arguments.length ? this.each(e == null ? va : (typeof e == "function" ? ba : _a)(e)) : this.node().textContent;
}
function Sa() {
  this.innerHTML = "";
}
function Ta(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Aa(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function xa(e) {
  return arguments.length ? this.each(e == null ? Sa : (typeof e == "function" ? Aa : Ta)(e)) : this.node().innerHTML;
}
function Ea() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Ma() {
  return this.each(Ea);
}
function Ia() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Na() {
  return this.each(Ia);
}
function Ra(e) {
  var t = typeof e == "function" ? e : Nr(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Ca() {
  return null;
}
function Da(e, t) {
  var n = typeof e == "function" ? e : Nr(e), i = t == null ? Ca : typeof t == "function" ? t : Rr(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function Oa() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function ka() {
  return this.each(Oa);
}
function La() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Fa() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Pa(e) {
  return this.select(e ? Fa : La);
}
function za(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Ga(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Ba(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function ja(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, r = t.length, o; n < r; ++n)
        o = t[n], (!e.type || o.type === e.type) && o.name === e.name ? this.removeEventListener(o.type, o.listener, o.options) : t[++i] = o;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function Ua(e, t, n) {
  return function() {
    var i = this.__on, r, o = Ga(t);
    if (i) {
      for (var s = 0, a = i.length; s < a; ++s)
        if ((r = i[s]).type === e.type && r.name === e.name) {
          this.removeEventListener(r.type, r.listener, r.options), this.addEventListener(r.type, r.listener = o, r.options = n), r.value = t;
          return;
        }
    }
    this.addEventListener(e.type, o, n), r = { type: e.type, name: e.name, value: t, listener: o, options: n }, i ? i.push(r) : this.__on = [r];
  };
}
function Ha(e, t, n) {
  var i = Ba(e + ""), r, o = i.length, s;
  if (arguments.length < 2) {
    var a = this.node().__on;
    if (a) {
      for (var l = 0, c = a.length, u; l < c; ++l)
        for (r = 0, u = a[l]; r < o; ++r)
          if ((s = i[r]).type === u.type && s.name === u.name)
            return u.value;
    }
    return;
  }
  for (a = t ? Ua : ja, r = 0; r < o; ++r) this.each(a(i[r], t, n));
  return this;
}
function zr(e, t, n) {
  var i = Or(e), r = i.CustomEvent;
  typeof r == "function" ? r = new r(t, n) : (r = i.document.createEvent("Event"), n ? (r.initEvent(t, n.bubbles, n.cancelable), r.detail = n.detail) : r.initEvent(t, !1, !1)), e.dispatchEvent(r);
}
function Wa(e, t) {
  return function() {
    return zr(this, e, t);
  };
}
function Ka(e, t) {
  return function() {
    return zr(this, e, t.apply(this, arguments));
  };
}
function Va(e, t) {
  return this.each((typeof t == "function" ? Ka : Wa)(e, t));
}
function* $a() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, o = i.length, s; r < o; ++r)
      (s = i[r]) && (yield s);
}
var qa = [null];
function Rt(e, t) {
  this._groups = e, this._parents = t;
}
function Ya() {
  return this;
}
Rt.prototype = { constructor: Rt, select: ys, selectAll: Ss, selectChild: Ms, selectChildren: Cs, filter: Ds, data: zs, enter: Os, exit: Bs, join: js, merge: Us, selection: Ya, order: Hs, sort: Ws, call: Vs, nodes: $s, node: qs, size: Ys, empty: Xs, each: Zs, attr: ra, style: ca, property: da, classed: ya, text: wa, html: xa, raise: Ma, lower: Na, append: Ra, insert: Da, remove: ka, clone: Pa, datum: za, on: Ha, dispatch: Va, [Symbol.iterator]: $a };
function Mn(e) {
  return typeof e == "string" ? new Rt([[document.querySelector(e)]], [document.documentElement]) : new Rt([[e]], qa);
}
function Xa(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Gi(e, t) {
  if (e = Xa(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var i = n.createSVGPoint();
      return i.x = e.clientX, i.y = e.clientY, i = i.matrixTransform(t.getScreenCTM().inverse()), [i.x, i.y];
    }
    if (t.getBoundingClientRect) {
      var r = t.getBoundingClientRect();
      return [e.clientX - r.left - t.clientLeft, e.clientY - r.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const Za = { passive: !1 }, Qe = { capture: !0, passive: !1 };
function Yn(e) {
  e.stopImmediatePropagation();
}
function xe(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Ja(e) {
  var t = e.document.documentElement, n = Mn(e).on("dragstart.drag", xe, Qe);
  "onselectstart" in t ? n.on("selectstart.drag", xe, Qe) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function Qa(e, t) {
  var n = e.document.documentElement, i = Mn(e).on("dragstart.drag", null);
  t && (i.on("click.drag", xe, Qe), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const vn = (e) => () => e;
function hi(e, { sourceEvent: t, subject: n, target: i, identifier: r, active: o, x: s, y: a, dx: l, dy: c, dispatch: u }) {
  Object.defineProperties(this, { type: { value: e, enumerable: !0, configurable: !0 }, sourceEvent: { value: t, enumerable: !0, configurable: !0 }, subject: { value: n, enumerable: !0, configurable: !0 }, target: { value: i, enumerable: !0, configurable: !0 }, identifier: { value: r, enumerable: !0, configurable: !0 }, active: { value: o, enumerable: !0, configurable: !0 }, x: { value: s, enumerable: !0, configurable: !0 }, y: { value: a, enumerable: !0, configurable: !0 }, dx: { value: l, enumerable: !0, configurable: !0 }, dy: { value: c, enumerable: !0, configurable: !0 }, _: { value: u } });
}
hi.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function tc(e) {
  return !e.ctrlKey && !e.button;
}
function ec() {
  return this.parentNode;
}
function nc(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function ic() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Bi() {
  var e = tc, t = ec, n = nc, i = ic, r = {}, o = _i("start", "drag", "end"), s = 0, a, l, c, u, g = 0;
  function f(m) {
    m.on("mousedown.drag", p).filter(i).on("touchstart.drag", y).on("touchmove.drag", w, Za).on("touchend.drag touchcancel.drag", v).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(m, I) {
    if (!(u || !e.call(this, m, I))) {
      var D = E(this, t.call(this, m, I), m, I, "mouse");
      D && (Mn(m.view).on("mousemove.drag", S, Qe).on("mouseup.drag", b, Qe), Ja(m.view), Yn(m), c = !1, a = m.clientX, l = m.clientY, D("start", m));
    }
  }
  function S(m) {
    if (xe(m), !c) {
      var I = m.clientX - a, D = m.clientY - l;
      c = I * I + D * D > g;
    }
    r.mouse("drag", m);
  }
  function b(m) {
    Mn(m.view).on("mousemove.drag mouseup.drag", null), Qa(m.view, c), xe(m), r.mouse("end", m);
  }
  function y(m, I) {
    if (e.call(this, m, I)) {
      var D = m.changedTouches, G = t.call(this, m, I), x = D.length, R, F;
      for (R = 0; R < x; ++R)
        (F = E(this, G, m, I, D[R].identifier, D[R])) && (Yn(m), F("start", m, D[R]));
    }
  }
  function w(m) {
    var I = m.changedTouches, D = I.length, G, x;
    for (G = 0; G < D; ++G)
      (x = r[I[G].identifier]) && (xe(m), x("drag", m, I[G]));
  }
  function v(m) {
    var I = m.changedTouches, D = I.length, G, x;
    for (u && clearTimeout(u), u = setTimeout(function() {
      u = null;
    }, 500), G = 0; G < D; ++G)
      (x = r[I[G].identifier]) && (Yn(m), x("end", m, I[G]));
  }
  function E(m, I, D, G, x, R) {
    var F = o.copy(), B = Gi(R || D, I), Q, C, L;
    if ((L = n.call(m, new hi("beforestart", { sourceEvent: D, target: f, identifier: x, active: s, x: B[0], y: B[1], dx: 0, dy: 0, dispatch: F }), G)) != null)
      return Q = L.x - B[0] || 0, C = L.y - B[1] || 0, function W(V, O, j) {
        var Z = B, lt;
        switch (V) {
          case "start":
            r[x] = W, lt = s++;
            break;
          case "end":
            delete r[x], --s;
          case "drag":
            B = Gi(j || O, I), lt = s;
            break;
        }
        F.call(V, m, new hi(V, { sourceEvent: O, subject: L, target: f, identifier: x, active: lt, x: B[0] + Q, y: B[1] + C, dx: B[0] - Z[0], dy: B[1] - Z[1], dispatch: F }), G);
      };
  }
  return f.filter = function(m) {
    return arguments.length ? (e = typeof m == "function" ? m : vn(!!m), f) : e;
  }, f.container = function(m) {
    return arguments.length ? (t = typeof m == "function" ? m : vn(m), f) : t;
  }, f.subject = function(m) {
    return arguments.length ? (n = typeof m == "function" ? m : vn(m), f) : n;
  }, f.touchable = function(m) {
    return arguments.length ? (i = typeof m == "function" ? m : vn(!!m), f) : i;
  }, f.on = function() {
    var m = o.on.apply(o, arguments);
    return m === o ? f : m;
  }, f.clickDistance = function(m) {
    return arguments.length ? (g = (m = +m) * m, f) : Math.sqrt(g);
  }, f;
}
const rc = 0.06;
function Gr(e) {
  function t(n) {
    for (const i of e()) {
      const r = i.parts.filter((l) => l.canvasRepresentative() === l && l.onCanvas && l.x != null && l.y != null);
      if (r.length < 2) continue;
      let o = 0, s = 0;
      for (const l of r)
        o += l.x, s += l.y;
      o /= r.length, s /= r.length;
      const a = rc * n;
      for (const l of r)
        l.fx != null || l.fy != null || (l.vx = (l.vx ?? 0) + (o - l.x) * a, l.vy = (l.vy ?? 0) + (s - l.y) * a);
    }
  }
  return t.initialize = () => {
  }, t;
}
const ji = "*", wi = "seed";
/*! @license DOMPurify 3.4.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.7/LICENSE */
function Ui(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function oc(e) {
  if (Array.isArray(e)) return e;
}
function sc(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var i, r, o, s, a = [], l = !0, c = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(l = (i = o.call(n)).done) && (a.push(i.value), a.length !== t); l = !0) ;
    } catch (u) {
      c = !0, r = u;
    } finally {
      try {
        if (!l && n.return != null && (s = n.return(), Object(s) !== s)) return;
      } finally {
        if (c) throw r;
      }
    }
    return a;
  }
}
function ac() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function cc(e, t) {
  return oc(e) || sc(e, t) || lc(e, t) || ac();
}
function lc(e, t) {
  if (e) {
    if (typeof e == "string") return Ui(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Ui(e, t) : void 0;
  }
}
const Br = Object.entries, Hi = Object.setPrototypeOf, uc = Object.isFrozen, hc = Object.getPrototypeOf, fc = Object.getOwnPropertyDescriptor;
let bt = Object.freeze, Ct = Object.seal, Te = Object.create, jr = typeof Reflect < "u" && Reflect, fi = jr.apply, di = jr.construct;
bt || (bt = function(t) {
  return t;
});
Ct || (Ct = function(t) {
  return t;
});
fi || (fi = function(t, n) {
  for (var i = arguments.length, r = new Array(i > 2 ? i - 2 : 0), o = 2; o < i; o++)
    r[o - 2] = arguments[o];
  return t.apply(n, r);
});
di || (di = function(t) {
  for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    i[r - 1] = arguments[r];
  return new t(...i);
});
const _e = ft(Array.prototype.forEach), dc = ft(Array.prototype.lastIndexOf), Wi = ft(Array.prototype.pop), be = ft(Array.prototype.push), pc = ft(Array.prototype.splice), vt = Array.isArray, qe = ft(String.prototype.toLowerCase), Xn = ft(String.prototype.toString), Ki = ft(String.prototype.match), we = ft(String.prototype.replace), Vi = ft(String.prototype.indexOf), gc = ft(String.prototype.trim), mc = ft(Number.prototype.toString), yc = ft(Boolean.prototype.toString), $i = typeof BigInt > "u" ? null : ft(BigInt.prototype.toString), qi = typeof Symbol > "u" ? null : ft(Symbol.prototype.toString), ut = ft(Object.prototype.hasOwnProperty), He = ft(Object.prototype.toString), pt = ft(RegExp.prototype.test), We = vc(TypeError);
function ft(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      i[r - 1] = arguments[r];
    return fi(e, t, i);
  };
}
function vc(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), i = 0; i < t; i++)
      n[i] = arguments[i];
    return di(e, n);
  };
}
function K(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : qe;
  if (Hi && Hi(e, null), !vt(t))
    return e;
  let i = t.length;
  for (; i--; ) {
    let r = t[i];
    if (typeof r == "string") {
      const o = n(r);
      o !== r && (uc(t) || (t[i] = o), r = o);
    }
    e[r] = !0;
  }
  return e;
}
function _c(e) {
  for (let t = 0; t < e.length; t++)
    ut(e, t) || (e[t] = null);
  return e;
}
function mt(e) {
  const t = Te(null);
  for (const i of Br(e)) {
    var n = cc(i, 2);
    const r = n[0], o = n[1];
    ut(e, r) && (vt(o) ? t[r] = _c(o) : o && typeof o == "object" && o.constructor === Object ? t[r] = mt(o) : t[r] = o);
  }
  return t;
}
function bc(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return mc(e);
    case "boolean":
      return yc(e);
    case "bigint":
      return $i ? $i(e) : "0";
    case "symbol":
      return qi ? qi(e) : "Symbol()";
    case "undefined":
      return He(e);
    case "function":
    case "object": {
      if (e === null)
        return He(e);
      const t = e, n = jt(t, "toString");
      if (typeof n == "function") {
        const i = n(t);
        return typeof i == "string" ? i : He(i);
      }
      return He(e);
    }
    default:
      return He(e);
  }
}
function jt(e, t) {
  for (; e !== null; ) {
    const i = fc(e, t);
    if (i) {
      if (i.get)
        return ft(i.get);
      if (typeof i.value == "function")
        return ft(i.value);
    }
    e = hc(e);
  }
  function n() {
    return null;
  }
  return n;
}
function wc(e) {
  try {
    return pt(e, ""), !0;
  } catch {
    return !1;
  }
}
const Yi = bt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), Zn = bt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Jn = bt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), Sc = bt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Qn = bt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), Tc = bt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Xi = bt(["#text"]), Zi = bt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), ti = bt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ji = bt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), _n = bt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), Ac = Ct(/{{[\w\W]*|^[\w\W]*}}/g), xc = Ct(/<%[\w\W]*|^[\w\W]*%>/g), Ec = Ct(/\${[\w\W]*/g), Mc = Ct(/^data-[\-\w.\u00B7-\uFFFF]+$/), Ic = Ct(/^aria-[\-\w]+$/), Qi = Ct(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), Nc = Ct(/^(?:\w+script|data):/i), Rc = Ct(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), Cc = Ct(/^html$/i), Dc = Ct(/^[a-z][.\w]*(-[.\w]+)+$/i), Bt = { element: 1, attribute: 2, text: 3, cdataSection: 4, entityReference: 5, entityNode: 6, progressingInstruction: 7, comment: 8, document: 9, documentType: 10, documentFragment: 11, notation: 12 }, Oc = function() {
  return typeof window > "u" ? null : window;
}, kc = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let i = null;
  const r = "data-tt-policy-suffix";
  n && n.hasAttribute(r) && (i = n.getAttribute(r));
  const o = "dompurify" + (i ? "#" + i : "");
  try {
    return t.createPolicy(o, { createHTML(s) {
      return s;
    }, createScriptURL(s) {
      return s;
    } });
  } catch {
    return console.warn("TrustedTypes policy " + o + " could not be created."), null;
  }
}, tr = function() {
  return { afterSanitizeAttributes: [], afterSanitizeElements: [], afterSanitizeShadowDOM: [], beforeSanitizeAttributes: [], beforeSanitizeElements: [], beforeSanitizeShadowDOM: [], uponSanitizeAttribute: [], uponSanitizeElement: [], uponSanitizeShadowNode: [] };
};
function Ur() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Oc();
  const t = (P) => Ur(P);
  if (t.version = "3.4.7", t.removed = [], !e || !e.document || e.document.nodeType !== Bt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const i = n, r = i.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, s = e.Node, a = e.Element, l = e.NodeFilter, c = e.NamedNodeMap;
  c === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const u = e.DOMParser, g = e.trustedTypes, f = a.prototype, p = jt(f, "cloneNode"), S = jt(f, "remove"), b = jt(f, "nextSibling"), y = jt(f, "childNodes"), w = jt(f, "parentNode"), v = jt(f, "shadowRoot"), E = jt(f, "attributes"), m = s && s.prototype ? jt(s.prototype, "nodeType") : null, I = s && s.prototype ? jt(s.prototype, "nodeName") : null;
  if (typeof o == "function") {
    const P = n.createElement("template");
    P.content && P.content.ownerDocument && (n = P.content.ownerDocument);
  }
  let D, G = "";
  const x = n, R = x.implementation, F = x.createNodeIterator, B = x.createDocumentFragment, Q = x.getElementsByTagName, C = i.importNode;
  let L = tr();
  t.isSupported = typeof Br == "function" && typeof w == "function" && R && R.createHTMLDocument !== void 0;
  const W = Ac, V = xc, O = Ec, j = Mc, Z = Ic, lt = Nc, gt = Rc, it = Dc;
  let H = Qi, X = null;
  const Zt = K({}, [...Yi, ...Zn, ...Jn, ...Qn, ...Xi]);
  let tt = null;
  const Jt = K({}, [...Zi, ...ti, ...Ji, ..._n]);
  let U = Object.seal(Te(null, { tagNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, allowCustomizedBuiltInElements: { writable: !0, configurable: !1, enumerable: !0, value: !1 } })), yt = null, Qt = null;
  const Dt = Object.seal(Te(null, { tagCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeCheck: { writable: !0, configurable: !1, enumerable: !0, value: null } }));
  let Ie = !0, Ne = !0, nn = !1, rn = !0, Ft = !1, ae = !0, Ht = !1, Re = !1, te = !1, Pt = !1, Wt = !1, Tt = !1, Ce = !0, De = !1;
  const on = "user-content-";
  let Oe = !0, zt = !1, Kt = {}, At = null;
  const pe = K({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let ke = null;
  const sn = K({}, ["audio", "video", "img", "source", "image", "track"]);
  let Le = null;
  const Gt = K({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Vt = "http://www.w3.org/1998/Math/MathML", ge = "http://www.w3.org/2000/svg", xt = "http://www.w3.org/1999/xhtml";
  let ee = xt, me = !1, $t = null;
  const Ln = K({}, [Vt, ge, xt], Xn);
  let Ot = K({}, ["mi", "mo", "mn", "ms", "mtext"]), Fe = K({}, ["annotation-xml"]);
  const Fn = K({}, ["title", "style", "font", "a", "script"]);
  let ce = null;
  const Pn = ["application/xhtml+xml", "text/html"], zn = "text/html";
  let et = null, ne = null;
  const Gn = n.createElement("form"), an = function(d) {
    return d instanceof RegExp || d instanceof Function;
  }, Pe = function() {
    let d = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (ne && ne === d)
      return;
    (!d || typeof d != "object") && (d = {}), d = mt(d), ce = Pn.indexOf(d.PARSER_MEDIA_TYPE) === -1 ? zn : d.PARSER_MEDIA_TYPE, et = ce === "application/xhtml+xml" ? Xn : qe, X = ut(d, "ALLOWED_TAGS") && vt(d.ALLOWED_TAGS) ? K({}, d.ALLOWED_TAGS, et) : Zt, tt = ut(d, "ALLOWED_ATTR") && vt(d.ALLOWED_ATTR) ? K({}, d.ALLOWED_ATTR, et) : Jt, $t = ut(d, "ALLOWED_NAMESPACES") && vt(d.ALLOWED_NAMESPACES) ? K({}, d.ALLOWED_NAMESPACES, Xn) : Ln, Le = ut(d, "ADD_URI_SAFE_ATTR") && vt(d.ADD_URI_SAFE_ATTR) ? K(mt(Gt), d.ADD_URI_SAFE_ATTR, et) : Gt, ke = ut(d, "ADD_DATA_URI_TAGS") && vt(d.ADD_DATA_URI_TAGS) ? K(mt(sn), d.ADD_DATA_URI_TAGS, et) : sn, At = ut(d, "FORBID_CONTENTS") && vt(d.FORBID_CONTENTS) ? K({}, d.FORBID_CONTENTS, et) : pe, yt = ut(d, "FORBID_TAGS") && vt(d.FORBID_TAGS) ? K({}, d.FORBID_TAGS, et) : mt({}), Qt = ut(d, "FORBID_ATTR") && vt(d.FORBID_ATTR) ? K({}, d.FORBID_ATTR, et) : mt({}), Kt = ut(d, "USE_PROFILES") ? d.USE_PROFILES && typeof d.USE_PROFILES == "object" ? mt(d.USE_PROFILES) : d.USE_PROFILES : !1, Ie = d.ALLOW_ARIA_ATTR !== !1, Ne = d.ALLOW_DATA_ATTR !== !1, nn = d.ALLOW_UNKNOWN_PROTOCOLS || !1, rn = d.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ft = d.SAFE_FOR_TEMPLATES || !1, ae = d.SAFE_FOR_XML !== !1, Ht = d.WHOLE_DOCUMENT || !1, Pt = d.RETURN_DOM || !1, Wt = d.RETURN_DOM_FRAGMENT || !1, Tt = d.RETURN_TRUSTED_TYPE || !1, te = d.FORCE_BODY || !1, Ce = d.SANITIZE_DOM !== !1, De = d.SANITIZE_NAMED_PROPS || !1, Oe = d.KEEP_CONTENT !== !1, zt = d.IN_PLACE || !1, H = wc(d.ALLOWED_URI_REGEXP) ? d.ALLOWED_URI_REGEXP : Qi, ee = typeof d.NAMESPACE == "string" ? d.NAMESPACE : xt, Ot = ut(d, "MATHML_TEXT_INTEGRATION_POINTS") && d.MATHML_TEXT_INTEGRATION_POINTS && typeof d.MATHML_TEXT_INTEGRATION_POINTS == "object" ? mt(d.MATHML_TEXT_INTEGRATION_POINTS) : K({}, ["mi", "mo", "mn", "ms", "mtext"]), Fe = ut(d, "HTML_INTEGRATION_POINTS") && d.HTML_INTEGRATION_POINTS && typeof d.HTML_INTEGRATION_POINTS == "object" ? mt(d.HTML_INTEGRATION_POINTS) : K({}, ["annotation-xml"]);
    const A = ut(d, "CUSTOM_ELEMENT_HANDLING") && d.CUSTOM_ELEMENT_HANDLING && typeof d.CUSTOM_ELEMENT_HANDLING == "object" ? mt(d.CUSTOM_ELEMENT_HANDLING) : Te(null);
    if (U = Te(null), ut(A, "tagNameCheck") && an(A.tagNameCheck) && (U.tagNameCheck = A.tagNameCheck), ut(A, "attributeNameCheck") && an(A.attributeNameCheck) && (U.attributeNameCheck = A.attributeNameCheck), ut(A, "allowCustomizedBuiltInElements") && typeof A.allowCustomizedBuiltInElements == "boolean" && (U.allowCustomizedBuiltInElements = A.allowCustomizedBuiltInElements), Ft && (Ne = !1), Wt && (Pt = !0), Kt && (X = K({}, Xi), tt = Te(null), Kt.html === !0 && (K(X, Yi), K(tt, Zi)), Kt.svg === !0 && (K(X, Zn), K(tt, ti), K(tt, _n)), Kt.svgFilters === !0 && (K(X, Jn), K(tt, ti), K(tt, _n)), Kt.mathMl === !0 && (K(X, Qn), K(tt, Ji), K(tt, _n))), Dt.tagCheck = null, Dt.attributeCheck = null, ut(d, "ADD_TAGS") && (typeof d.ADD_TAGS == "function" ? Dt.tagCheck = d.ADD_TAGS : vt(d.ADD_TAGS) && (X === Zt && (X = mt(X)), K(X, d.ADD_TAGS, et))), ut(d, "ADD_ATTR") && (typeof d.ADD_ATTR == "function" ? Dt.attributeCheck = d.ADD_ATTR : vt(d.ADD_ATTR) && (tt === Jt && (tt = mt(tt)), K(tt, d.ADD_ATTR, et))), ut(d, "ADD_URI_SAFE_ATTR") && vt(d.ADD_URI_SAFE_ATTR) && K(Le, d.ADD_URI_SAFE_ATTR, et), ut(d, "FORBID_CONTENTS") && vt(d.FORBID_CONTENTS) && (At === pe && (At = mt(At)), K(At, d.FORBID_CONTENTS, et)), ut(d, "ADD_FORBID_CONTENTS") && vt(d.ADD_FORBID_CONTENTS) && (At === pe && (At = mt(At)), K(At, d.ADD_FORBID_CONTENTS, et)), Oe && (X["#text"] = !0), Ht && K(X, ["html", "head", "body"]), X.table && (K(X, ["tbody"]), delete yt.tbody), d.TRUSTED_TYPES_POLICY) {
      if (typeof d.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw We('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof d.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw We('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      D = d.TRUSTED_TYPES_POLICY, G = D.createHTML("");
    } else
      D === void 0 && (D = kc(g, r)), D !== null && typeof G == "string" && (G = D.createHTML(""));
    (L.uponSanitizeElement.length > 0 || L.uponSanitizeAttribute.length > 0) && X === Zt && (X = mt(X)), L.uponSanitizeAttribute.length > 0 && tt === Jt && (tt = mt(tt)), bt && bt(d), ne = d;
  }, cn = K({}, [...Zn, ...Jn, ...Sc]), qt = K({}, [...Qn, ...Tc]), Bn = function(d) {
    let A = w(d);
    (!A || !A.tagName) && (A = { namespaceURI: ee, tagName: "template" });
    const k = qe(d.tagName), J = qe(A.tagName);
    return $t[d.namespaceURI] ? d.namespaceURI === ge ? A.namespaceURI === xt ? k === "svg" : A.namespaceURI === Vt ? k === "svg" && (J === "annotation-xml" || Ot[J]) : !!cn[k] : d.namespaceURI === Vt ? A.namespaceURI === xt ? k === "math" : A.namespaceURI === ge ? k === "math" && Fe[J] : !!qt[k] : d.namespaceURI === xt ? A.namespaceURI === ge && !Fe[J] || A.namespaceURI === Vt && !Ot[J] ? !1 : !qt[k] && (Fn[k] || !cn[k]) : !!(ce === "application/xhtml+xml" && $t[d.namespaceURI]) : !1;
  }, Et = function(d) {
    be(t.removed, { element: d });
    try {
      w(d).removeChild(d);
    } catch {
      S(d);
    }
  }, Yt = function(d, A) {
    try {
      be(t.removed, { attribute: A.getAttributeNode(d), from: A });
    } catch {
      be(t.removed, { attribute: null, from: A });
    }
    if (A.removeAttribute(d), d === "is")
      if (Pt || Wt)
        try {
          Et(A);
        } catch {
        }
      else
        try {
          A.setAttribute(d, "");
        } catch {
        }
  }, ln = function(d) {
    let A = null, k = null;
    if (te)
      d = "<remove></remove>" + d;
    else {
      const rt = Ki(d, /^[\r\n\t ]+/);
      k = rt && rt[0];
    }
    ce === "application/xhtml+xml" && ee === xt && (d = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + d + "</body></html>");
    const J = D ? D.createHTML(d) : d;
    if (ee === xt)
      try {
        A = new u().parseFromString(J, ce);
      } catch {
      }
    if (!A || !A.documentElement) {
      A = R.createDocument(ee, "template", null);
      try {
        A.documentElement.innerHTML = me ? G : J;
      } catch {
      }
    }
    const $ = A.body || A.documentElement;
    return d && k && $.insertBefore(n.createTextNode(k), $.childNodes[0] || null), ee === xt ? Q.call(A, Ht ? "html" : "body")[0] : Ht ? A.documentElement : $;
  }, un = function(d) {
    return F.call(d.ownerDocument || d, d, l.SHOW_ELEMENT | l.SHOW_COMMENT | l.SHOW_TEXT | l.SHOW_PROCESSING_INSTRUCTION | l.SHOW_CDATA_SECTION, null);
  }, Xt = function(d) {
    d.normalize();
    const A = F.call(d.ownerDocument || d, d, l.SHOW_TEXT | l.SHOW_COMMENT | l.SHOW_CDATA_SECTION | l.SHOW_PROCESSING_INSTRUCTION, null);
    let k = A.nextNode();
    for (; k; ) {
      let J = k.data;
      _e([W, V, O], ($) => {
        J = we(J, $, " ");
      }), k.data = J, k = A.nextNode();
    }
  }, ye = function(d) {
    const A = I ? I(d) : null;
    return typeof A != "string" || et(A) !== "form" ? !1 : typeof d.nodeName != "string" || typeof d.textContent != "string" || typeof d.removeChild != "function" || d.attributes !== E(d) || typeof d.removeAttribute != "function" || typeof d.setAttribute != "function" || typeof d.namespaceURI != "string" || typeof d.insertBefore != "function" || typeof d.hasChildNodes != "function" || d.nodeType !== m(d) || d.childNodes !== y(d);
  }, le = function(d) {
    if (!m || typeof d != "object" || d === null)
      return !1;
    try {
      return m(d) === Bt.documentFragment;
    } catch {
      return !1;
    }
  }, ve = function(d) {
    if (!m || typeof d != "object" || d === null)
      return !1;
    try {
      return typeof m(d) == "number";
    } catch {
      return !1;
    }
  };
  function kt(P, d, A) {
    _e(P, (k) => {
      k.call(t, d, A, ne);
    });
  }
  const hn = function(d) {
    let A = null;
    if (kt(L.beforeSanitizeElements, d, null), ye(d))
      return Et(d), !0;
    const k = et(d.nodeName);
    if (kt(L.uponSanitizeElement, d, { tagName: k, allowedTags: X }), ae && d.hasChildNodes() && !ve(d.firstElementChild) && pt(/<[/\w!]/g, d.innerHTML) && pt(/<[/\w!]/g, d.textContent) || ae && d.namespaceURI === xt && k === "style" && ve(d.firstElementChild) || d.nodeType === Bt.progressingInstruction || ae && d.nodeType === Bt.comment && pt(/<[/\w]/g, d.data))
      return Et(d), !0;
    if (yt[k] || !(Dt.tagCheck instanceof Function && Dt.tagCheck(k)) && !X[k]) {
      if (!yt[k] && dn(k) && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, k) || U.tagNameCheck instanceof Function && U.tagNameCheck(k)))
        return !1;
      if (Oe && !At[k]) {
        const $ = w(d), rt = y(d);
        if (rt && $) {
          const St = rt.length;
          for (let Nt = St - 1; Nt >= 0; --Nt) {
            const Mt = p(rt[Nt], !0);
            $.insertBefore(Mt, b(d));
          }
        }
      }
      return Et(d), !0;
    }
    return (m ? m(d) : d.nodeType) === Bt.element && !Bn(d) || (k === "noscript" || k === "noembed" || k === "noframes") && pt(/<\/no(script|embed|frames)/i, d.innerHTML) ? (Et(d), !0) : (Ft && d.nodeType === Bt.text && (A = d.textContent, _e([W, V, O], ($) => {
      A = we(A, $, " ");
    }), d.textContent !== A && (be(t.removed, { element: d.cloneNode() }), d.textContent = A)), kt(L.afterSanitizeElements, d, null), !1);
  }, fn = function(d, A, k) {
    if (Qt[A] || Ce && (A === "id" || A === "name") && (k in n || k in Gn))
      return !1;
    const J = tt[A] || Dt.attributeCheck instanceof Function && Dt.attributeCheck(A, d);
    if (!(Ne && !Qt[A] && pt(j, A))) {
      if (!(Ie && pt(Z, A))) {
        if (!J || Qt[A]) {
          if (!(dn(d) && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, d) || U.tagNameCheck instanceof Function && U.tagNameCheck(d)) && (U.attributeNameCheck instanceof RegExp && pt(U.attributeNameCheck, A) || U.attributeNameCheck instanceof Function && U.attributeNameCheck(A, d)) || A === "is" && U.allowCustomizedBuiltInElements && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, k) || U.tagNameCheck instanceof Function && U.tagNameCheck(k)))) return !1;
        } else if (!Le[A]) {
          if (!pt(H, we(k, gt, ""))) {
            if (!((A === "src" || A === "xlink:href" || A === "href") && d !== "script" && Vi(k, "data:") === 0 && ke[d])) {
              if (!(nn && !pt(lt, we(k, gt, "")))) {
                if (k)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, ze = K({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), dn = function(d) {
    return !ze[qe(d)] && pt(it, d);
  }, ue = function(d) {
    kt(L.beforeSanitizeAttributes, d, null);
    const A = d.attributes;
    if (!A || ye(d))
      return;
    const k = { attrName: "", attrValue: "", keepAttr: !0, allowedAttributes: tt, forceKeepAttr: void 0 };
    let J = A.length;
    for (; J--; ) {
      const $ = A[J], rt = $.name, St = $.namespaceURI, Nt = $.value, Mt = et(rt), Ge = Nt;
      let ht = rt === "value" ? Ge : gc(Ge);
      if (k.attrName = Mt, k.attrValue = ht, k.keepAttr = !0, k.forceKeepAttr = void 0, kt(L.uponSanitizeAttribute, d, k), ht = k.attrValue, De && (Mt === "id" || Mt === "name") && Vi(ht, on) !== 0 && (Yt(rt, d), ht = on + ht), ae && pt(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, ht)) {
        Yt(rt, d);
        continue;
      }
      if (Mt === "attributename" && Ki(ht, "href")) {
        Yt(rt, d);
        continue;
      }
      if (k.forceKeepAttr)
        continue;
      if (!k.keepAttr) {
        Yt(rt, d);
        continue;
      }
      if (!rn && pt(/\/>/i, ht)) {
        Yt(rt, d);
        continue;
      }
      Ft && _e([W, V, O], (gn) => {
        ht = we(ht, gn, " ");
      });
      const pn = et(d.nodeName);
      if (!fn(pn, Mt, ht)) {
        Yt(rt, d);
        continue;
      }
      if (D && typeof g == "object" && typeof g.getAttributeType == "function" && !St)
        switch (g.getAttributeType(pn, Mt)) {
          case "TrustedHTML": {
            ht = D.createHTML(ht);
            break;
          }
          case "TrustedScriptURL": {
            ht = D.createScriptURL(ht);
            break;
          }
        }
      if (ht !== Ge)
        try {
          St ? d.setAttributeNS(St, rt, ht) : d.setAttribute(rt, ht), ye(d) ? Et(d) : Wi(t.removed);
        } catch {
          Yt(rt, d);
        }
    }
    kt(L.afterSanitizeAttributes, d, null);
  }, ie = function(d) {
    let A = null;
    const k = un(d);
    for (kt(L.beforeSanitizeShadowDOM, d, null); A = k.nextNode(); )
      if (kt(L.uponSanitizeShadowNode, A, null), hn(A), ue(A), le(A.content) && ie(A.content), (m ? m(A) : A.nodeType) === Bt.element) {
        const $ = v ? v(A) : A.shadowRoot;
        le($) && (re($), ie($));
      }
    kt(L.afterSanitizeShadowDOM, d, null);
  }, re = function(d) {
    const A = m ? m(d) : d.nodeType;
    if (A === Bt.element) {
      const $ = v ? v(d) : d.shadowRoot;
      le($) && (re($), ie($));
    }
    const k = y ? y(d) : d.childNodes;
    if (!k)
      return;
    const J = [];
    _e(k, ($) => {
      be(J, $);
    });
    for (const $ of J)
      re($);
    if (A === Bt.element) {
      const $ = I ? I(d) : null;
      if (typeof $ == "string" && et($) === "template") {
        const rt = d.content;
        le(rt) && re(rt);
      }
    }
  };
  return t.sanitize = function(P) {
    let d = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, A = null, k = null, J = null, $ = null;
    if (me = !P, me && (P = "<!-->"), typeof P != "string" && !ve(P) && (P = bc(P), typeof P != "string"))
      throw We("dirty is not a string, aborting");
    if (!t.isSupported)
      return P;
    if (Re || Pe(d), t.removed = [], typeof P == "string" && (zt = !1), zt) {
      const Nt = I ? I(P) : P.nodeName;
      if (typeof Nt == "string") {
        const Mt = et(Nt);
        if (!X[Mt] || yt[Mt])
          throw We("root node is forbidden and cannot be sanitized in-place");
      }
      if (ye(P))
        throw We("root node is clobbered and cannot be sanitized in-place");
      re(P);
    } else if (ve(P))
      A = ln("<!---->"), k = A.ownerDocument.importNode(P, !0), k.nodeType === Bt.element && k.nodeName === "BODY" || k.nodeName === "HTML" ? A = k : A.appendChild(k), re(k);
    else {
      if (!Pt && !Ft && !Ht && P.indexOf("<") === -1)
        return D && Tt ? D.createHTML(P) : P;
      if (A = ln(P), !A)
        return Pt ? null : Tt ? G : "";
    }
    A && te && Et(A.firstChild);
    const rt = un(zt ? P : A);
    for (; J = rt.nextNode(); )
      hn(J), ue(J), le(J.content) && ie(J.content);
    if (zt)
      return Ft && Xt(P), P;
    if (Pt) {
      if (Ft && Xt(A), Wt)
        for ($ = B.call(A.ownerDocument); A.firstChild; )
          $.appendChild(A.firstChild);
      else
        $ = A;
      return (tt.shadowroot || tt.shadowrootmode) && ($ = C.call(i, $, !0)), $;
    }
    let St = Ht ? A.outerHTML : A.innerHTML;
    return Ht && X["!doctype"] && A.ownerDocument && A.ownerDocument.doctype && A.ownerDocument.doctype.name && pt(Cc, A.ownerDocument.doctype.name) && (St = "<!DOCTYPE " + A.ownerDocument.doctype.name + `>
` + St), Ft && _e([W, V, O], (Nt) => {
      St = we(St, Nt, " ");
    }), D && Tt ? D.createHTML(St) : St;
  }, t.setConfig = function() {
    let P = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Pe(P), Re = !0;
  }, t.clearConfig = function() {
    ne = null, Re = !1;
  }, t.isValidAttribute = function(P, d, A) {
    ne || Pe({});
    const k = et(P), J = et(d);
    return fn(k, J, A);
  }, t.addHook = function(P, d) {
    typeof d == "function" && be(L[P], d);
  }, t.removeHook = function(P, d) {
    if (d !== void 0) {
      const A = dc(L[P], d);
      return A === -1 ? void 0 : pc(L[P], A, 1)[0];
    }
    return Wi(L[P]);
  }, t.removeHooks = function(P) {
    L[P] = [];
  }, t.removeAllHooks = function() {
    L = tr();
  }, t;
}
Ur();
function Hr(e = 8, t = "id-") {
  const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", i = n + "0123456789-_";
  let r = n.charAt(Math.floor(Math.random() * n.length));
  for (let o = 1; o < e; o++)
    r += i.charAt(Math.floor(Math.random() * i.length));
  return `${t}${r}`;
}
function Lc(e, t, n, i) {
  const r = Math.max(Math.abs(n) / e, Math.abs(i) / t);
  return r === 0 ? e : 1 / r;
}
function In(e, t = /* @__PURE__ */ new WeakSet()) {
  if (typeof e == "function") return;
  if (e === null || typeof e != "object") return e;
  const n = e;
  if (t.has(n)) return;
  if (t.add(n), Array.isArray(e))
    return e.map((r) => In(r, t));
  if (Object.getPrototypeOf(e) !== Object.prototype) return e;
  const i = {};
  for (const [r, o] of Object.entries(e))
    typeof o != "function" && (i[r] = In(o, t));
  return i;
}
function Wr(e) {
  return !e || e.size === 0 ? [wi] : [...e.keys()];
}
function Xe(e) {
  return e ? new Map([...e].map(([t, n]) => [t, [...n]])) : /* @__PURE__ */ new Map();
}
function Kr(e, t) {
  return !e || e.size === 0 ? t === wi : e.has(t);
}
function Vr(e, t, n, i = Date.now()) {
  const r = e.get(t);
  if (r) {
    r.some((o) => o.runId === n) || r.push({ runId: n, at: i });
    return;
  }
  e.set(t, [{ runId: n, at: i }]);
}
function $r(e, t, n) {
  if (!e) return !1;
  const i = e.get(t);
  if (i) {
    const r = i.filter((o) => o.runId !== n);
    r.length ? e.set(t, r) : e.delete(t);
  }
  return e.size === 0;
}
function qr(e, t) {
  return e ? (e.delete(t), e.size === 0) : t === wi;
}
let Yr = class Xr {
  constructor(t, n, i, r = Hr(), o = []) {
    M(this, "id");
    M(this, "data");
    M(this, "children");
    M(this, "style");
    M(this, "edgesOut");
    M(this, "edgesIn");
    M(this, "defaultCircleRadius", 10);
    M(this, "x");
    M(this, "y");
    M(this, "vx");
    M(this, "vy");
    M(this, "fx");
    M(this, "fy");
    M(this, "weight");
    M(this, "frozen");
    M(this, "visible");
    M(this, "expanded");
    M(this, "isChild");
    M(this, "childrenDepth");
    M(this, "isParent");
    M(this, "parentNode");
    M(this, "foldedInto");
    M(this, "_original_object");
    M(this, "_deepest_node_clone");
    M(this, "_subgraph");
    M(this, "_circleRadius", this.defaultCircleRadius);
    M(this, "_circleRadiusCollapsed", this.defaultCircleRadius);
    M(this, "_layoutSize");
    M(this, "_border");
    M(this, "_dirty");
    M(this, "_sources");
    M(this, "_potential");
    M(this, "domID");
    this.id = t, this.domID = r, this.data = n ?? {}, this.style = i ?? {}, this.children = [], this.isParent = !1, this.setChildren(o), this._dirty = !0, this.frozen = !1, this.visible = !0, this.expanded = !1, this.isChild = !1, this.childrenDepth = 0, this.edgesOut = /* @__PURE__ */ new Set(), this.edgesIn = /* @__PURE__ */ new Set();
  }
  getData() {
    return this.data;
  }
  setData(t) {
    this.data = t, this.markDirty();
  }
  updateData(t) {
    this.data = { ...this.data, ...t }, this.markDirty();
  }
  registerEdgeOut(t) {
    this.edgesOut.add(t);
  }
  registerEdgeIn(t) {
    this.edgesIn.add(t);
  }
  unregisterEdge(t) {
    this.edgesOut.delete(t), this.edgesIn.delete(t);
  }
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
  getStyle() {
    return this.style;
  }
  setStyle(t) {
    this.style = t, this.markDirty();
  }
  updateStyle(t) {
    this.style = { ...this.style, ...t }, this.markDirty();
  }
  getGraphElement() {
    return document ? document.getElementById(`node-${this.domID}`) : null;
  }
  toDict(t = !1) {
    const n = { id: this.id, data: this.data, style: this.style, weight: this.weight };
    return t || (n.x = this.x, n.y = this.y, n.vx = this.vx, n.vy = this.vy, n.fx = this.fx, n.fy = this.fy), this.hasChildren() && (n.children = this.children.map((i) => i.toDict(t))), n;
  }
  toSimulationDTO() {
    return { id: this.id, data: this.data, style: In(this.style), weight: this.weight, _circleRadius: this._circleRadius, _layoutSize: this._layoutSize, x: this.x, y: this.y, vx: this.vx, vy: this.vy, fx: this.fx, fy: this.fy };
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new Xr(this.id, t, n);
    return i.x = this.x, i.y = this.y, i.vx = this.vx, i.vy = this.vy, i.fx = this.fx, i.fy = this.fy, i.weight = this.weight, i.frozen = this.frozen, i.visible = this.visible, i.expanded = this.expanded, i.isChild = this.isChild, i.childrenDepth = this.childrenDepth, i.isParent = this.isParent, i.parentNode = this.parentNode, i._circleRadius = this._circleRadius, i._layoutSize = this._layoutSize, i.children = this.children.map((r) => r.clone()), this._sources && (i._sources = new Map([...this._sources].map(([r, o]) => [r, [...o]]))), this._potential && (i._potential = new Map(this._potential)), i;
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
  ancestorChain() {
    const t = [];
    let n = this.parentNode;
    for (; n; )
      t.unshift(n), n = n.parentNode;
    return t;
  }
  canvasRepresentative() {
    let t = this.clusterRepresentative();
    for (; t.foldedInto; ) t = t.foldedInto;
    return t;
  }
  clusterRepresentative() {
    for (const t of this.ancestorChain())
      if (!t.expanded) return t;
    return this;
  }
  get isGroup() {
    return !1;
  }
  get onCanvas() {
    return this.visible && !this.foldedInto;
  }
  setCircleRadius(t) {
    this._circleRadius = t, this._border = void 0;
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
  setLayoutSize(t) {
    this._layoutSize = t;
  }
  getLayoutSize() {
    return this._layoutSize;
  }
  getLayoutRadius() {
    return this._layoutSize ?? this._circleRadius;
  }
  setBorderBox(t, n) {
    this._border = { halfWidth: t / 2, halfHeight: n / 2 };
  }
  getBorderBox(t = 0) {
    if (this._border)
      return { halfWidth: this._border.halfWidth + t, halfHeight: this._border.halfHeight + t };
  }
  getBorderDistance(t, n, i = 0) {
    const r = this._border;
    return r ? Lc(r.halfWidth + i, r.halfHeight + i, t, n) : this._circleRadius + i;
  }
  getSources() {
    return Wr(this._sources);
  }
  hasSource(t) {
    return Kr(this._sources, t);
  }
  vouch(t, n) {
    this._sources || (this._sources = /* @__PURE__ */ new Map()), Vr(this._sources, t, n);
  }
  revokeRun(t, n) {
    return $r(this._sources, t, n);
  }
  dropSource(t) {
    return qr(this._sources, t);
  }
  cloneLedger() {
    return Xe(this._sources);
  }
  restoreLedger(t) {
    this._sources = Xe(t);
  }
  landedBy() {
    var t;
    return (t = this.landing()) == null ? void 0 : t.runId;
  }
  landing() {
    var i, r;
    const t = (i = this._sources) == null ? void 0 : i.entries().next().value, n = (r = t == null ? void 0 : t[1][0]) == null ? void 0 : r.runId;
    return t && n !== void 0 ? { pivotId: t[0], runId: n } : void 0;
  }
  setPotential(t, n) {
    var o, s;
    const i = typeof t == "string" ? t : ji, r = typeof t == "string" ? n ?? 0 : t;
    if (!r) {
      (o = this._potential) == null || o.delete(i), ((s = this._potential) == null ? void 0 : s.size) === 0 && (this._potential = void 0), this.markDirty();
      return;
    }
    this._potential || (this._potential = /* @__PURE__ */ new Map()), this._potential.set(i, r), this.markDirty();
  }
  getPotential(t = ji) {
    var n;
    return (n = this._potential) == null ? void 0 : n.get(t);
  }
  getPotentials() {
    return new Map(this._potential ?? []);
  }
  setChildren(t) {
    this.children = t, this.hasChildren() ? this.isParent = !0 : this.isParent = !1;
  }
  unionChildren(t) {
    const n = [], i = new Map(this.children.map((r) => [r.id, r]));
    for (const r of t) {
      const o = i.get(r.id);
      if (o) {
        n.push(...o.unionChildren(r.children));
        continue;
      }
      this.children.push(r), this.claim(r), i.set(r.id, r), n.push(r, ...r.descendants());
    }
    return this.isParent = this.hasChildren(), this.markDirty(), n;
  }
  removeChildById(t) {
    const n = this.children.findIndex((r) => r.id === t);
    if (n < 0) return;
    const [i] = this.children.splice(n, 1);
    return this.isParent = this.hasChildren(), this.isParent || (this.expanded = !1), this.markDirty(), i;
  }
  descendants() {
    return this.children.flatMap((t) => [t, ...t.descendants()]);
  }
  claim(t) {
    t.markAsChild(this, this.childrenDepth + 1), t.hide();
    for (const n of t.children) t.claim(n);
  }
  hasChildren() {
    return this.children.length > 0;
  }
  markAsChild(t, n) {
    this.isChild = !0, this.childrenDepth = n, this.parentNode = t;
  }
  markAsParent() {
    this.isParent = !0;
  }
  setSubgraph(t) {
    this._subgraph = t;
  }
  getSubgraph() {
    return this._subgraph;
  }
  setOriginalObject(t) {
    this._original_object = t;
  }
  getOriginalObject() {
    return this._original_object;
  }
  setDeepestNodeClone(t) {
    this._deepest_node_clone = t;
  }
  getDeepestNodeClone() {
    return this._deepest_node_clone;
  }
};
function Ae(e) {
  return typeof e == "object" && e !== null && Object.getPrototypeOf(e) === Object.prototype;
}
function pi(e) {
  const [t, ...n] = e, i = {};
  if (!Ae(t)) return i;
  for (const [r, o] of Object.entries(t)) {
    const s = n.map((a) => Ae(a) ? a[r] : void 0);
    if (Ae(o) && s.every(Ae)) {
      const a = pi([o, ...s]);
      Object.keys(a).length > 0 && (i[r] = a);
    } else o !== void 0 && s.every((a) => a === o) && (i[r] = o);
  }
  return i;
}
class oe {
  constructor(t, n, i, r, o, s = null) {
    M(this, "id");
    M(this, "from");
    M(this, "to");
    M(this, "directed");
    M(this, "data");
    M(this, "style");
    M(this, "visible");
    M(this, "layerVisible");
    M(this, "visibleIgnoringLayer");
    M(this, "representedEdges");
    M(this, "_original_object");
    M(this, "_dirty");
    M(this, "_sources");
    M(this, "domID");
    this.id = t, this.domID = Hr(), this.from = n, this.to = i, this.directed = s, this.data = r ?? {}, this.style = o ?? {}, this.visible = !0, this.layerVisible = !0, this.visibleIgnoringLayer = !0, this._dirty = !0, this.from.registerEdgeOut(this), this.to.registerEdgeIn(this);
  }
  bindEndpoints(t, n) {
    this.from !== t && (this.from = t, this.markDirty()), this.to !== n && (this.to = n, this.markDirty()), t.registerEdgeOut(this), n.registerEdgeIn(this);
  }
  get source() {
    return this.from;
  }
  get target() {
    return this.to;
  }
  getData() {
    return this.data;
  }
  setData(t) {
    this.data = t, this.markDirty();
  }
  updateData(t) {
    this.data = { ...this.data, ...t }, this.markDirty();
  }
  getStyle() {
    return this.style;
  }
  getEdgeStyle() {
    var t;
    return ((t = this.style) == null ? void 0 : t.edge) ?? {};
  }
  getLabelStyle() {
    var t;
    return ((t = this.style) == null ? void 0 : t.label) ?? {};
  }
  setStyle(t) {
    this.style = t, this.markDirty();
  }
  updateStyle(t) {
    const n = this.style, i = t;
    this.style = { ...n, ...i, edge: { ...n.edge, ...i.edge }, label: { ...n.label, ...i.label } }, this.markDirty();
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
  toDict() {
    return { id: this.id, from: this.from.id, to: this.to.id, data: this.data, style: this.style };
  }
  toSimulationDTO() {
    return { id: this.id, from: { id: this.from.id }, to: { id: this.to.id }, data: this.data, style: In(this.style), directed: this.directed };
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new oe(this.id, this.from.clone(), this.to.clone(), t, n, this.directed);
    return i.visible = this.visible, i.layerVisible = this.layerVisible, i.visibleIgnoringLayer = this.visibleIgnoringLayer, this._sources && (i._sources = Xe(this._sources)), i;
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
    this.visibleIgnoringLayer = !0, this.visible = this.layerVisible;
  }
  hide() {
    this.visibleIgnoringLayer = !1, this.visible = !1;
  }
  setLayerVisible(t) {
    if (this.layerVisible === t) return !1;
    this.layerVisible = t;
    const n = t && this.visibleIgnoringLayer;
    return this.visible !== n && (this.visible = n, this.markDirty()), !0;
  }
  setOriginalObject(t) {
    this._original_object = t;
  }
  getOriginalObject() {
    return this._original_object;
  }
  get isSynthetic() {
    return this.representedEdges !== void 0;
  }
  static standIn(t, n, i) {
    const r = new oe(t, n, i);
    return n.unregisterEdge(r), i.unregisterEdge(r), r.representedEdges = [], r;
  }
  standFor(t) {
    const n = t.length === 1 ? t[0] : void 0;
    this.representedEdges = t;
    const i = n ? n.data : pi(t.map((o) => o.data)), r = n ? n.style : pi(t.map((o) => o.style));
    oe.sameEntries(i, this.data) && oe.sameEntries(r, this.style) || (this.data = i, this.style = r, this.markDirty());
  }
  static sameEntries(t, n) {
    if (t === n) return !0;
    if (!Ae(t) || !Ae(n)) return !1;
    const i = Object.keys(t);
    return i.length === Object.keys(n).length && i.every((r) => r in n && oe.sameEntries(t[r], n[r]));
  }
  getSources() {
    return Wr(this._sources);
  }
  hasSource(t) {
    return Kr(this._sources, t);
  }
  vouch(t, n) {
    this._sources || (this._sources = /* @__PURE__ */ new Map()), Vr(this._sources, t, n);
  }
  revokeRun(t, n) {
    return $r(this._sources, t, n);
  }
  dropSource(t) {
    return qr(this._sources, t);
  }
  cloneLedger() {
    return Xe(this._sources);
  }
  restoreLedger(t) {
    this._sources = Xe(t);
  }
}
const Zr = 'var Yu=Object.defineProperty;var qu=(ce,Ft,me)=>Ft in ce?Yu(ce,Ft,{enumerable:!0,configurable:!0,writable:!0,value:me}):ce[Ft]=me;var M=(ce,Ft,me)=>qu(ce,typeof Ft!="symbol"?Ft+"":Ft,me);(function(){"use strict";function ce(e){const t=+this._x.call(null,e),n=+this._y.call(null,e);return Ft(this.cover(t,n),t,n,e)}function Ft(e,t,n,i){if(isNaN(t)||isNaN(n))return e;var r,o=e._root,s={data:i},a=e._x0,l=e._y0,c=e._x1,u=e._y1,p,f,g,S,b,y,T,_;if(!o)return e._root=s,e;for(;o.length;)if((b=t>=(p=(a+c)/2))?a=p:c=p,(y=n>=(f=(l+u)/2))?l=f:u=f,r=o,!(o=o[T=y<<1|b]))return r[T]=s,e;if(g=+e._x.call(null,o.data),S=+e._y.call(null,o.data),t===g&&n===S)return s.next=o,r?r[T]=s:e._root=s,e;do r=r?r[T]=new Array(4):e._root=new Array(4),(b=t>=(p=(a+c)/2))?a=p:c=p,(y=n>=(f=(l+u)/2))?l=f:u=f;while((T=y<<1|b)===(_=(S>=f)<<1|g>=p));return r[_]=o,r[T]=s,e}function me(e){var t,n,i=e.length,r,o,s=new Array(i),a=new Array(i),l=1/0,c=1/0,u=-1/0,p=-1/0;for(n=0;n<i;++n)isNaN(r=+this._x.call(null,t=e[n]))||isNaN(o=+this._y.call(null,t))||(s[n]=r,a[n]=o,r<l&&(l=r),r>u&&(u=r),o<c&&(c=o),o>p&&(p=o));if(l>u||c>p)return this;for(this.cover(l,c).cover(u,p),n=0;n<i;++n)Ft(this,s[n],a[n],e[n]);return this}function co(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(n))r=(n=Math.floor(e))+1,o=(i=Math.floor(t))+1;else{for(var s=r-n||1,a=this._root,l,c;n>e||e>=r||i>t||t>=o;)switch(c=(t<i)<<1|e<n,l=new Array(4),l[c]=a,a=l,s*=2,c){case 0:r=n+s,o=i+s;break;case 1:n=r-s,o=i+s;break;case 2:r=n+s,i=o-s;break;case 3:n=r-s,i=o-s;break}this._root&&this._root.length&&(this._root=a)}return this._x0=n,this._y0=i,this._x1=r,this._y1=o,this}function lo(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function uo(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function yt(e,t,n,i,r){this.node=e,this.x0=t,this.y0=n,this.x1=i,this.y1=r}function ho(e,t,n){var i,r=this._x0,o=this._y0,s,a,l,c,u=this._x1,p=this._y1,f=[],g=this._root,S,b;for(g&&f.push(new yt(g,r,o,u,p)),n==null?n=1/0:(r=e-n,o=t-n,u=e+n,p=t+n,n*=n);S=f.pop();)if(!(!(g=S.node)||(s=S.x0)>u||(a=S.y0)>p||(l=S.x1)<r||(c=S.y1)<o))if(g.length){var y=(s+l)/2,T=(a+c)/2;f.push(new yt(g[3],y,T,l,c),new yt(g[2],s,T,y,c),new yt(g[1],y,a,l,T),new yt(g[0],s,a,y,T)),(b=(t>=T)<<1|e>=y)&&(S=f[f.length-1],f[f.length-1]=f[f.length-1-b],f[f.length-1-b]=S)}else{var _=e-+this._x.call(null,g.data),x=t-+this._y.call(null,g.data),m=_*_+x*x;if(m<n){var I=Math.sqrt(n=m);r=e-I,o=t-I,u=e+I,p=t+I,i=g.data}}return i}function fo(e){if(isNaN(u=+this._x.call(null,e))||isNaN(p=+this._y.call(null,e)))return this;var t,n=this._root,i,r,o,s=this._x0,a=this._y0,l=this._x1,c=this._y1,u,p,f,g,S,b,y,T;if(!n)return this;if(n.length)for(;;){if((S=u>=(f=(s+l)/2))?s=f:l=f,(b=p>=(g=(a+c)/2))?a=g:c=g,t=n,!(n=n[y=b<<1|S]))return this;if(!n.length)break;(t[y+1&3]||t[y+2&3]||t[y+3&3])&&(i=t,T=y)}for(;n.data!==e;)if(r=n,!(n=n.next))return this;return(o=n.next)&&delete n.next,r?(o?r.next=o:delete r.next,this):t?(o?t[y]=o:delete t[y],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(i?i[T]=n:this._root=n),this):(this._root=o,this)}function go(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function po(){return this._root}function mo(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function yo(e){var t=[],n,i=this._root,r,o,s,a,l;for(i&&t.push(new yt(i,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(i=n.node,o=n.x0,s=n.y0,a=n.x1,l=n.y1)&&i.length){var c=(o+a)/2,u=(s+l)/2;(r=i[3])&&t.push(new yt(r,c,u,a,l)),(r=i[2])&&t.push(new yt(r,o,u,c,l)),(r=i[1])&&t.push(new yt(r,c,s,a,u)),(r=i[0])&&t.push(new yt(r,o,s,c,u))}return this}function _o(e){var t=[],n=[],i;for(this._root&&t.push(new yt(this._root,this._x0,this._y0,this._x1,this._y1));i=t.pop();){var r=i.node;if(r.length){var o,s=i.x0,a=i.y0,l=i.x1,c=i.y1,u=(s+l)/2,p=(a+c)/2;(o=r[0])&&t.push(new yt(o,s,a,u,p)),(o=r[1])&&t.push(new yt(o,u,a,l,p)),(o=r[2])&&t.push(new yt(o,s,p,u,c)),(o=r[3])&&t.push(new yt(o,u,p,l,c))}n.push(i)}for(;i=n.pop();)e(i.node,i.x0,i.y0,i.x1,i.y1);return this}function wo(e){return e[0]}function bo(e){return arguments.length?(this._x=e,this):this._x}function To(e){return e[1]}function So(e){return arguments.length?(this._y=e,this):this._y}function zn(e,t,n){var i=new Gn(t??wo,n??To,NaN,NaN,NaN,NaN);return e==null?i:i.addAll(e)}function Gn(e,t,n,i,r,o){this._x=e,this._y=t,this._x0=n,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function Ei(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var _t=zn.prototype=Gn.prototype;_t.copy=function(){var e=new Gn(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,i;if(!t)return e;if(!t.length)return e._root=Ei(t),e;for(n=[{source:t,target:e._root=new Array(4)}];t=n.pop();)for(var r=0;r<4;++r)(i=t.source[r])&&(i.length?n.push({source:i,target:t.target[r]=new Array(4)}):t.target[r]=Ei(i));return e},_t.add=ce,_t.addAll=me,_t.cover=co,_t.data=lo,_t.extent=uo,_t.find=ho,_t.remove=fo,_t.removeAll=go,_t.root=po,_t.size=mo,_t.visit=yo,_t.visitAfter=_o,_t.x=bo,_t.y=So;function dt(e){return function(){return e}}function Jt(e){return(e()-.5)*1e-6}function vo(e){return e.x+e.vx}function Ao(e){return e.y+e.vy}function Eo(e){var t,n,i,r=1,o=1;typeof e!="function"&&(e=dt(e==null?1:+e));function s(){for(var c,u=t.length,p,f,g,S,b,y,T=0;T<o;++T)for(p=zn(t,vo,Ao).visitAfter(a),c=0;c<u;++c)f=t[c],b=n[f.index],y=b*b,g=f.x+f.vx,S=f.y+f.vy,p.visit(_);function _(x,m,I,D,G){var E=x.data,N=x.r,F=b+N;if(E){if(E.index>f.index){var B=g-E.x-E.vx,Q=S-E.y-E.vy,C=B*B+Q*Q;C<F*F&&(B===0&&(B=Jt(i),C+=B*B),Q===0&&(Q=Jt(i),C+=Q*Q),C=(F-(C=Math.sqrt(C)))/C*r,f.vx+=(B*=C)*(F=(N*=N)/(y+N)),f.vy+=(Q*=C)*F,E.vx-=B*(F=1-F),E.vy-=Q*F)}return}return m>g+F||D<g-F||I>S+F||G<S-F}}function a(c){if(c.data)return c.r=n[c.data.index];for(var u=c.r=0;u<4;++u)c[u]&&c[u].r>c.r&&(c.r=c[u].r)}function l(){if(t){var c,u=t.length,p;for(n=new Array(u),c=0;c<u;++c)p=t[c],n[p.index]=+e(p,c,t)}}return s.initialize=function(c,u){t=c,i=u,l()},s.iterations=function(c){return arguments.length?(o=+c,s):o},s.strength=function(c){return arguments.length?(r=+c,s):r},s.radius=function(c){return arguments.length?(e=typeof c=="function"?c:dt(+c),l(),s):e},s}function xo(e){return e.index}function xi(e,t){var n=e.get(t);if(!n)throw new Error("node not found: "+t);return n}function Mo(e){var t=xo,n=p,i,r=dt(30),o,s,a,l,c,u=1;e==null&&(e=[]);function p(y){return 1/Math.min(a[y.source.index],a[y.target.index])}function f(y){for(var T=0,_=e.length;T<u;++T)for(var x=0,m,I,D,G,E,N,F;x<_;++x)m=e[x],I=m.source,D=m.target,G=D.x+D.vx-I.x-I.vx||Jt(c),E=D.y+D.vy-I.y-I.vy||Jt(c),N=Math.sqrt(G*G+E*E),N=(N-o[x])/N*y*i[x],G*=N,E*=N,D.vx-=G*(F=l[x]),D.vy-=E*F,I.vx+=G*(F=1-F),I.vy+=E*F}function g(){if(s){var y,T=s.length,_=e.length,x=new Map(s.map((I,D)=>[t(I,D,s),I])),m;for(y=0,a=new Array(T);y<_;++y)m=e[y],m.index=y,typeof m.source!="object"&&(m.source=xi(x,m.source)),typeof m.target!="object"&&(m.target=xi(x,m.target)),a[m.source.index]=(a[m.source.index]||0)+1,a[m.target.index]=(a[m.target.index]||0)+1;for(y=0,l=new Array(_);y<_;++y)m=e[y],l[y]=a[m.source.index]/(a[m.source.index]+a[m.target.index]);i=new Array(_),S(),o=new Array(_),b()}}function S(){if(s)for(var y=0,T=e.length;y<T;++y)i[y]=+n(e[y],y,e)}function b(){if(s)for(var y=0,T=e.length;y<T;++y)o[y]=+r(e[y],y,e)}return f.initialize=function(y,T){s=y,c=T,g()},f.links=function(y){return arguments.length?(e=y,g(),f):e},f.id=function(y){return arguments.length?(t=y,f):t},f.iterations=function(y){return arguments.length?(u=+y,f):u},f.strength=function(y){return arguments.length?(n=typeof y=="function"?y:dt(+y),S(),f):n},f.distance=function(y){return arguments.length?(r=typeof y=="function"?y:dt(+y),b(),f):r},f}var Io={value:()=>{}};function Bn(){for(var e=0,t=arguments.length,n={},i;e<t;++e){if(!(i=arguments[e]+"")||i in n||/[\\s.]/.test(i))throw new Error("illegal type: "+i);n[i]=[]}return new sn(n)}function sn(e){this._=e}function Ro(e,t){return e.trim().split(/^|\\s+/).map(function(n){var i="",r=n.indexOf(".");if(r>=0&&(i=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:i}})}sn.prototype=Bn.prototype={constructor:sn,on:function(e,t){var n=this._,i=Ro(e+"",n),r,o=-1,s=i.length;if(arguments.length<2){for(;++o<s;)if((r=(e=i[o]).type)&&(r=No(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++o<s;)if(r=(e=i[o]).type)n[r]=Mi(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Mi(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new sn(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),i=0,r,o;i<r;++i)n[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(o=this._[e],i=0,r=o.length;i<r;++i)o[i].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var i=this._[e],r=0,o=i.length;r<o;++r)i[r].value.apply(t,n)}};function No(e,t){for(var n=0,i=e.length,r;n<i;++n)if((r=e[n]).name===t)return r.value}function Mi(e,t,n){for(var i=0,r=e.length;i<r;++i)if(e[i].name===t){e[i]=Io,e=e.slice(0,i).concat(e.slice(i+1));break}return n!=null&&e.push({name:t,value:n}),e}var ye=0,Ce=0,De=0,Ii=1e3,an,Oe,cn=0,le=0,ln=0,Le=typeof performance=="object"&&performance.now?performance:Date,Ri=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Ni(){return le||(Ri(Co),le=Le.now()+ln)}function Co(){le=0}function Un(){this._call=this._time=this._next=null}Un.prototype=Ci.prototype={constructor:Un,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?Ni():+n)+(t==null?0:+t),!this._next&&Oe!==this&&(Oe?Oe._next=this:an=this,Oe=this),this._call=e,this._time=n,Hn()},stop:function(){this._call&&(this._call=null,this._time=1/0,Hn())}};function Ci(e,t,n){var i=new Un;return i.restart(e,t,n),i}function Do(){Ni(),++ye;for(var e=an,t;e;)(t=le-e._time)>=0&&e._call.call(void 0,t),e=e._next;--ye}function Di(){le=(cn=Le.now())+ln,ye=Ce=0;try{Do()}finally{ye=0,Lo(),le=0}}function Oo(){var e=Le.now(),t=e-cn;t>Ii&&(ln-=t,cn=e)}function Lo(){for(var e,t=an,n,i=1/0;t;)t._call?(i>t._time&&(i=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:an=n);Oe=e,Hn(i)}function Hn(e){if(!ye){Ce&&(Ce=clearTimeout(Ce));var t=e-le;t>24?(e<1/0&&(Ce=setTimeout(Di,e-Le.now()-ln)),De&&(De=clearInterval(De))):(De||(cn=Le.now(),De=setInterval(Oo,Ii)),ye=1,Ri(Di))}}const ko=1664525,Fo=1013904223,Oi=4294967296;function Po(){let e=1;return()=>(e=(ko*e+Fo)%Oi)/Oi}function zo(e){return e.x}function Go(e){return e.y}var Bo=10,Uo=Math.PI*(3-Math.sqrt(5));function Ho(e){var t,n=1,i=.001,r=1-Math.pow(i,1/300),o=0,s=.6,a=new Map,l=Ci(p),c=Bn("tick","end"),u=Po();e==null&&(e=[]);function p(){f(),c.call("tick",t),n<i&&(l.stop(),c.call("end",t))}function f(b){var y,T=e.length,_;b===void 0&&(b=1);for(var x=0;x<b;++x)for(n+=(o-n)*r,a.forEach(function(m){m(n)}),y=0;y<T;++y)_=e[y],_.fx==null?_.x+=_.vx*=s:(_.x=_.fx,_.vx=0),_.fy==null?_.y+=_.vy*=s:(_.y=_.fy,_.vy=0);return t}function g(){for(var b=0,y=e.length,T;b<y;++b){if(T=e[b],T.index=b,T.fx!=null&&(T.x=T.fx),T.fy!=null&&(T.y=T.fy),isNaN(T.x)||isNaN(T.y)){var _=Bo*Math.sqrt(.5+b),x=b*Uo;T.x=_*Math.cos(x),T.y=_*Math.sin(x)}(isNaN(T.vx)||isNaN(T.vy))&&(T.vx=T.vy=0)}}function S(b){return b.initialize&&b.initialize(e,u),b}return g(),t={tick:f,restart:function(){return l.restart(p),t},stop:function(){return l.stop(),t},nodes:function(b){return arguments.length?(e=b,g(),a.forEach(S),t):e},alpha:function(b){return arguments.length?(n=+b,t):n},alphaMin:function(b){return arguments.length?(i=+b,t):i},alphaDecay:function(b){return arguments.length?(r=+b,t):+r},alphaTarget:function(b){return arguments.length?(o=+b,t):o},velocityDecay:function(b){return arguments.length?(s=1-b,t):1-s},randomSource:function(b){return arguments.length?(u=b,a.forEach(S),t):u},force:function(b,y){return arguments.length>1?(y==null?a.delete(b):a.set(b,S(y)),t):a.get(b)},find:function(b,y,T){var _=0,x=e.length,m,I,D,G,E;for(T==null?T=1/0:T*=T,_=0;_<x;++_)G=e[_],m=b-G.x,I=y-G.y,D=m*m+I*I,D<T&&(E=G,T=D);return E},on:function(b,y){return arguments.length>1?(c.on(b,y),t):c.on(b)}}}function jo(){var e,t,n,i,r=dt(-30),o,s=1,a=1/0,l=.81;function c(g){var S,b=e.length,y=zn(e,zo,Go).visitAfter(p);for(i=g,S=0;S<b;++S)t=e[S],y.visit(f)}function u(){if(e){var g,S=e.length,b;for(o=new Array(S),g=0;g<S;++g)b=e[g],o[b.index]=+r(b,g,e)}}function p(g){var S=0,b,y,T=0,_,x,m;if(g.length){for(_=x=m=0;m<4;++m)(b=g[m])&&(y=Math.abs(b.value))&&(S+=b.value,T+=y,_+=y*b.x,x+=y*b.y);g.x=_/T,g.y=x/T}else{b=g,b.x=b.data.x,b.y=b.data.y;do S+=o[b.data.index];while(b=b.next)}g.value=S}function f(g,S,b,y){if(!g.value)return!0;var T=g.x-t.x,_=g.y-t.y,x=y-S,m=T*T+_*_;if(x*x/l<m)return m<a&&(T===0&&(T=Jt(n),m+=T*T),_===0&&(_=Jt(n),m+=_*_),m<s&&(m=Math.sqrt(s*m)),t.vx+=T*g.value*i/m,t.vy+=_*g.value*i/m),!0;if(g.length||m>=a)return;(g.data!==t||g.next)&&(T===0&&(T=Jt(n),m+=T*T),_===0&&(_=Jt(n),m+=_*_),m<s&&(m=Math.sqrt(s*m)));do g.data!==t&&(x=o[g.data.index]*i/m,t.vx+=T*x,t.vy+=_*x);while(g=g.next)}return c.initialize=function(g,S){e=g,n=S,u()},c.strength=function(g){return arguments.length?(r=typeof g=="function"?g:dt(+g),u(),c):r},c.distanceMin=function(g){return arguments.length?(s=g*g,c):Math.sqrt(s)},c.distanceMax=function(g){return arguments.length?(a=g*g,c):Math.sqrt(a)},c.theta=function(g){return arguments.length?(l=g*g,c):Math.sqrt(l)},c}function Li(e,t,n){var i,r=dt(.1),o,s;typeof e!="function"&&(e=dt(+e)),t==null&&(t=0),n==null&&(n=0);function a(c){for(var u=0,p=i.length;u<p;++u){var f=i[u],g=f.x-t||1e-6,S=f.y-n||1e-6,b=Math.sqrt(g*g+S*S),y=(s[u]-b)*o[u]*c/b;f.vx+=g*y,f.vy+=S*y}}function l(){if(i){var c,u=i.length;for(o=new Array(u),s=new Array(u),c=0;c<u;++c)s[c]=+e(i[c],c,i),o[c]=isNaN(s[c])?0:+r(i[c],c,i)}}return a.initialize=function(c){i=c,l()},a.strength=function(c){return arguments.length?(r=typeof c=="function"?c:dt(+c),l(),a):r},a.radius=function(c){return arguments.length?(e=typeof c=="function"?c:dt(+c),l(),a):e},a.x=function(c){return arguments.length?(t=+c,a):t},a.y=function(c){return arguments.length?(n=+c,a):n},a}function ki(e){var t=dt(.1),n,i,r;typeof e!="function"&&(e=dt(e==null?0:+e));function o(a){for(var l=0,c=n.length,u;l<c;++l)u=n[l],u.vx+=(r[l]-u.x)*i[l]*a}function s(){if(n){var a,l=n.length;for(i=new Array(l),r=new Array(l),a=0;a<l;++a)i[a]=isNaN(r[a]=+e(n[a],a,n))?0:+t(n[a],a,n)}}return o.initialize=function(a){n=a,s()},o.strength=function(a){return arguments.length?(t=typeof a=="function"?a:dt(+a),s(),o):t},o.x=function(a){return arguments.length?(e=typeof a=="function"?a:dt(+a),s(),o):e},o}function Fi(e){var t=dt(.1),n,i,r;typeof e!="function"&&(e=dt(e==null?0:+e));function o(a){for(var l=0,c=n.length,u;l<c;++l)u=n[l],u.vy+=(r[l]-u.y)*i[l]*a}function s(){if(n){var a,l=n.length;for(i=new Array(l),r=new Array(l),a=0;a<l;++a)i[a]=isNaN(r[a]=+e(n[a],a,n))?0:+t(n[a],a,n)}}return o.initialize=function(a){n=a,s()},o.strength=function(a){return arguments.length?(t=typeof a=="function"?a:dt(+a),s(),o):t},o.y=function(a){return arguments.length?(e=typeof a=="function"?a:dt(+a),s(),o):e},o}function Wo(e=0,t=0,n=.001){let i=[],r;function o(){r=typeof n=="function"?n:()=>n}function s(a){for(let l=0,c=i.length;l<c;++l){const u=i[l],p=r(u,l,i);u.vx!=null&&u.x!=null&&(u.vx-=(u.x-e)*p*a),u.vy!=null&&u.y!=null&&(u.vy-=(u.y-t)*p*a)}}return s.initialize=a=>{i=a,o()},s.x=function(a){return arguments.length?(e=a,s):e},s.y=function(a){return arguments.length?(t=a,s):t},s.strength=function(a){return arguments.length?(n=a,o(),s):n},s}var jn="http://www.w3.org/1999/xhtml",Pi={svg:"http://www.w3.org/2000/svg",xhtml:jn,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function zi(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),Pi.hasOwnProperty(t)?{space:Pi[t],local:e}:e}function Ko(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===jn&&t.documentElement.namespaceURI===jn?t.createElement(e):t.createElementNS(n,e)}}function Vo(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function Gi(e){var t=zi(e);return(t.local?Vo:Ko)(t)}function $o(){}function Bi(e){return e==null?$o:function(){return this.querySelector(e)}}function Xo(e){typeof e!="function"&&(e=Bi(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],s=o.length,a=i[r]=new Array(s),l,c,u=0;u<s;++u)(l=o[u])&&(c=e.call(l,l.__data__,u,o))&&("__data__"in l&&(c.__data__=l.__data__),a[u]=c);return new Rt(i,this._parents)}function Yo(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function qo(){return[]}function Zo(e){return e==null?qo:function(){return this.querySelectorAll(e)}}function Jo(e){return function(){return Yo(e.apply(this,arguments))}}function Qo(e){typeof e=="function"?e=Jo(e):e=Zo(e);for(var t=this._groups,n=t.length,i=[],r=[],o=0;o<n;++o)for(var s=t[o],a=s.length,l,c=0;c<a;++c)(l=s[c])&&(i.push(e.call(l,l.__data__,c,s)),r.push(l));return new Rt(i,r)}function ts(e){return function(){return this.matches(e)}}function Ui(e){return function(t){return t.matches(e)}}var es=Array.prototype.find;function ns(e){return function(){return es.call(this.children,e)}}function is(){return this.firstElementChild}function rs(e){return this.select(e==null?is:ns(typeof e=="function"?e:Ui(e)))}var os=Array.prototype.filter;function ss(){return Array.from(this.children)}function as(e){return function(){return os.call(this.children,e)}}function cs(e){return this.selectAll(e==null?ss:as(typeof e=="function"?e:Ui(e)))}function ls(e){typeof e!="function"&&(e=ts(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],s=o.length,a=i[r]=[],l,c=0;c<s;++c)(l=o[c])&&e.call(l,l.__data__,c,o)&&a.push(l);return new Rt(i,this._parents)}function Hi(e){return new Array(e.length)}function us(){return new Rt(this._enter||this._groups.map(Hi),this._parents)}function un(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}un.prototype={constructor:un,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function hs(e){return function(){return e}}function fs(e,t,n,i,r,o){for(var s=0,a,l=t.length,c=o.length;s<c;++s)(a=t[s])?(a.__data__=o[s],i[s]=a):n[s]=new un(e,o[s]);for(;s<l;++s)(a=t[s])&&(r[s]=a)}function ds(e,t,n,i,r,o,s){var a,l,c=new Map,u=t.length,p=o.length,f=new Array(u),g;for(a=0;a<u;++a)(l=t[a])&&(f[a]=g=s.call(l,l.__data__,a,t)+"",c.has(g)?r[a]=l:c.set(g,l));for(a=0;a<p;++a)g=s.call(e,o[a],a,o)+"",(l=c.get(g))?(i[a]=l,l.__data__=o[a],c.delete(g)):n[a]=new un(e,o[a]);for(a=0;a<u;++a)(l=t[a])&&c.get(f[a])===l&&(r[a]=l)}function gs(e){return e.__data__}function ps(e,t){if(!arguments.length)return Array.from(this,gs);var n=t?ds:fs,i=this._parents,r=this._groups;typeof e!="function"&&(e=hs(e));for(var o=r.length,s=new Array(o),a=new Array(o),l=new Array(o),c=0;c<o;++c){var u=i[c],p=r[c],f=p.length,g=ms(e.call(u,u&&u.__data__,c,i)),S=g.length,b=a[c]=new Array(S),y=s[c]=new Array(S),T=l[c]=new Array(f);n(u,p,b,y,T,g,t);for(var _=0,x=0,m,I;_<S;++_)if(m=b[_]){for(_>=x&&(x=_+1);!(I=y[x])&&++x<S;);m._next=I||null}}return s=new Rt(s,i),s._enter=a,s._exit=l,s}function ms(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function ys(){return new Rt(this._exit||this._groups.map(Hi),this._parents)}function _s(e,t,n){var i=this.enter(),r=this,o=this.exit();return typeof e=="function"?(i=e(i),i&&(i=i.selection())):i=i.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?o.remove():n(o),i&&r?i.merge(r).order():r}function ws(e){for(var t=e.selection?e.selection():e,n=this._groups,i=t._groups,r=n.length,o=i.length,s=Math.min(r,o),a=new Array(r),l=0;l<s;++l)for(var c=n[l],u=i[l],p=c.length,f=a[l]=new Array(p),g,S=0;S<p;++S)(g=c[S]||u[S])&&(f[S]=g);for(;l<r;++l)a[l]=n[l];return new Rt(a,this._parents)}function bs(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var i=e[t],r=i.length-1,o=i[r],s;--r>=0;)(s=i[r])&&(o&&s.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(s,o),o=s);return this}function Ts(e){e||(e=Ss);function t(p,f){return p&&f?e(p.__data__,f.__data__):!p-!f}for(var n=this._groups,i=n.length,r=new Array(i),o=0;o<i;++o){for(var s=n[o],a=s.length,l=r[o]=new Array(a),c,u=0;u<a;++u)(c=s[u])&&(l[u]=c);l.sort(t)}return new Rt(r,this._parents).order()}function Ss(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function vs(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function As(){return Array.from(this)}function Es(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length;r<o;++r){var s=i[r];if(s)return s}return null}function xs(){let e=0;for(const t of this)++e;return e}function Ms(){return!this.node()}function Is(e){for(var t=this._groups,n=0,i=t.length;n<i;++n)for(var r=t[n],o=0,s=r.length,a;o<s;++o)(a=r[o])&&e.call(a,a.__data__,o,r);return this}function Rs(e){return function(){this.removeAttribute(e)}}function Ns(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Cs(e,t){return function(){this.setAttribute(e,t)}}function Ds(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function Os(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function Ls(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function ks(e,t){var n=zi(e);if(arguments.length<2){var i=this.node();return n.local?i.getAttributeNS(n.space,n.local):i.getAttribute(n)}return this.each((t==null?n.local?Ns:Rs:typeof t=="function"?n.local?Ls:Os:n.local?Ds:Cs)(n,t))}function ji(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function Fs(e){return function(){this.style.removeProperty(e)}}function Ps(e,t,n){return function(){this.style.setProperty(e,t,n)}}function zs(e,t,n){return function(){var i=t.apply(this,arguments);i==null?this.style.removeProperty(e):this.style.setProperty(e,i,n)}}function Gs(e,t,n){return arguments.length>1?this.each((t==null?Fs:typeof t=="function"?zs:Ps)(e,t,n??"")):Bs(this.node(),e)}function Bs(e,t){return e.style.getPropertyValue(t)||ji(e).getComputedStyle(e,null).getPropertyValue(t)}function Us(e){return function(){delete this[e]}}function Hs(e,t){return function(){this[e]=t}}function js(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function Ws(e,t){return arguments.length>1?this.each((t==null?Us:typeof t=="function"?js:Hs)(e,t)):this.node()[e]}function Wi(e){return e.trim().split(/^|\\s+/)}function Wn(e){return e.classList||new Ki(e)}function Ki(e){this._node=e,this._names=Wi(e.getAttribute("class")||"")}Ki.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function Vi(e,t){for(var n=Wn(e),i=-1,r=t.length;++i<r;)n.add(t[i])}function $i(e,t){for(var n=Wn(e),i=-1,r=t.length;++i<r;)n.remove(t[i])}function Ks(e){return function(){Vi(this,e)}}function Vs(e){return function(){$i(this,e)}}function $s(e,t){return function(){(t.apply(this,arguments)?Vi:$i)(this,e)}}function Xs(e,t){var n=Wi(e+"");if(arguments.length<2){for(var i=Wn(this.node()),r=-1,o=n.length;++r<o;)if(!i.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?$s:t?Ks:Vs)(n,t))}function Ys(){this.textContent=""}function qs(e){return function(){this.textContent=e}}function Zs(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function Js(e){return arguments.length?this.each(e==null?Ys:(typeof e=="function"?Zs:qs)(e)):this.node().textContent}function Qs(){this.innerHTML=""}function ta(e){return function(){this.innerHTML=e}}function ea(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function na(e){return arguments.length?this.each(e==null?Qs:(typeof e=="function"?ea:ta)(e)):this.node().innerHTML}function ia(){this.nextSibling&&this.parentNode.appendChild(this)}function ra(){return this.each(ia)}function oa(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function sa(){return this.each(oa)}function aa(e){var t=typeof e=="function"?e:Gi(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function ca(){return null}function la(e,t){var n=typeof e=="function"?e:Gi(e),i=t==null?ca:typeof t=="function"?t:Bi(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),i.apply(this,arguments)||null)})}function ua(){var e=this.parentNode;e&&e.removeChild(this)}function ha(){return this.each(ua)}function fa(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function da(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function ga(e){return this.select(e?da:fa)}function pa(e){return arguments.length?this.property("__data__",e):this.node().__data__}function ma(e){return function(t){e.call(this,t,this.__data__)}}function ya(e){return e.trim().split(/^|\\s+/).map(function(t){var n="",i=t.indexOf(".");return i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),{type:t,name:n}})}function _a(e){return function(){var t=this.__on;if(t){for(var n=0,i=-1,r=t.length,o;n<r;++n)o=t[n],(!e.type||o.type===e.type)&&o.name===e.name?this.removeEventListener(o.type,o.listener,o.options):t[++i]=o;++i?t.length=i:delete this.__on}}}function wa(e,t,n){return function(){var i=this.__on,r,o=ma(t);if(i){for(var s=0,a=i.length;s<a;++s)if((r=i[s]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=n),r.value=t;return}}this.addEventListener(e.type,o,n),r={type:e.type,name:e.name,value:t,listener:o,options:n},i?i.push(r):this.__on=[r]}}function ba(e,t,n){var i=ya(e+""),r,o=i.length,s;if(arguments.length<2){var a=this.node().__on;if(a){for(var l=0,c=a.length,u;l<c;++l)for(r=0,u=a[l];r<o;++r)if((s=i[r]).type===u.type&&s.name===u.name)return u.value}return}for(a=t?wa:_a,r=0;r<o;++r)this.each(a(i[r],t,n));return this}function Xi(e,t,n){var i=ji(e),r=i.CustomEvent;typeof r=="function"?r=new r(t,n):(r=i.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function Ta(e,t){return function(){return Xi(this,e,t)}}function Sa(e,t){return function(){return Xi(this,e,t.apply(this,arguments))}}function va(e,t){return this.each((typeof t=="function"?Sa:Ta)(e,t))}function*Aa(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length,s;r<o;++r)(s=i[r])&&(yield s)}var Ea=[null];function Rt(e,t){this._groups=e,this._parents=t}function xa(){return this}Rt.prototype={constructor:Rt,select:Xo,selectAll:Qo,selectChild:rs,selectChildren:cs,filter:ls,data:ps,enter:us,exit:ys,join:_s,merge:ws,selection:xa,order:bs,sort:Ts,call:vs,nodes:As,node:Es,size:xs,empty:Ms,each:Is,attr:ks,style:Gs,property:Ws,classed:Xs,text:Js,html:na,raise:ra,lower:sa,append:aa,insert:la,remove:ha,clone:ga,datum:pa,on:ba,dispatch:va,[Symbol.iterator]:Aa};function hn(e){return typeof e=="string"?new Rt([[document.querySelector(e)]],[document.documentElement]):new Rt([[e]],Ea)}function Ma(e){let t;for(;t=e.sourceEvent;)e=t;return e}function Yi(e,t){if(e=Ma(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var i=n.createSVGPoint();return i.x=e.clientX,i.y=e.clientY,i=i.matrixTransform(t.getScreenCTM().inverse()),[i.x,i.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}const Ia={passive:!1},ke={capture:!0,passive:!1};function Kn(e){e.stopImmediatePropagation()}function _e(e){e.preventDefault(),e.stopImmediatePropagation()}function Ra(e){var t=e.document.documentElement,n=hn(e).on("dragstart.drag",_e,ke);"onselectstart"in t?n.on("selectstart.drag",_e,ke):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function Na(e,t){var n=e.document.documentElement,i=hn(e).on("dragstart.drag",null);t&&(i.on("click.drag",_e,ke),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in n?i.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var fn=e=>()=>e;function Vn(e,{sourceEvent:t,subject:n,target:i,identifier:r,active:o,x:s,y:a,dx:l,dy:c,dispatch:u}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:s,enumerable:!0,configurable:!0},y:{value:a,enumerable:!0,configurable:!0},dx:{value:l,enumerable:!0,configurable:!0},dy:{value:c,enumerable:!0,configurable:!0},_:{value:u}})}Vn.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function Ca(e){return!e.ctrlKey&&!e.button}function Da(){return this.parentNode}function Oa(e,t){return t??{x:e.x,y:e.y}}function La(){return navigator.maxTouchPoints||"ontouchstart"in this}function qi(){var e=Ca,t=Da,n=Oa,i=La,r={},o=Bn("start","drag","end"),s=0,a,l,c,u,p=0;function f(m){m.on("mousedown.drag",g).filter(i).on("touchstart.drag",y).on("touchmove.drag",T,Ia).on("touchend.drag touchcancel.drag",_).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function g(m,I){if(!(u||!e.call(this,m,I))){var D=x(this,t.call(this,m,I),m,I,"mouse");D&&(hn(m.view).on("mousemove.drag",S,ke).on("mouseup.drag",b,ke),Ra(m.view),Kn(m),c=!1,a=m.clientX,l=m.clientY,D("start",m))}}function S(m){if(_e(m),!c){var I=m.clientX-a,D=m.clientY-l;c=I*I+D*D>p}r.mouse("drag",m)}function b(m){hn(m.view).on("mousemove.drag mouseup.drag",null),Na(m.view,c),_e(m),r.mouse("end",m)}function y(m,I){if(e.call(this,m,I)){var D=m.changedTouches,G=t.call(this,m,I),E=D.length,N,F;for(N=0;N<E;++N)(F=x(this,G,m,I,D[N].identifier,D[N]))&&(Kn(m),F("start",m,D[N]))}}function T(m){var I=m.changedTouches,D=I.length,G,E;for(G=0;G<D;++G)(E=r[I[G].identifier])&&(_e(m),E("drag",m,I[G]))}function _(m){var I=m.changedTouches,D=I.length,G,E;for(u&&clearTimeout(u),u=setTimeout(function(){u=null},500),G=0;G<D;++G)(E=r[I[G].identifier])&&(Kn(m),E("end",m,I[G]))}function x(m,I,D,G,E,N){var F=o.copy(),B=Yi(N||D,I),Q,C,k;if((k=n.call(m,new Vn("beforestart",{sourceEvent:D,target:f,identifier:E,active:s,x:B[0],y:B[1],dx:0,dy:0,dispatch:F}),G))!=null)return Q=k.x-B[0]||0,C=k.y-B[1]||0,function K(V,O,U){var Z=B,ut;switch(V){case"start":r[E]=K,ut=s++;break;case"end":delete r[E],--s;case"drag":B=Yi(U||O,I),ut=s;break}F.call(V,m,new Vn(V,{sourceEvent:O,subject:k,target:f,identifier:E,active:ut,x:B[0]+Q,y:B[1]+C,dx:B[0]-Z[0],dy:B[1]-Z[1],dispatch:F}),G)}}return f.filter=function(m){return arguments.length?(e=typeof m=="function"?m:fn(!!m),f):e},f.container=function(m){return arguments.length?(t=typeof m=="function"?m:fn(m),f):t},f.subject=function(m){return arguments.length?(n=typeof m=="function"?m:fn(m),f):n},f.touchable=function(m){return arguments.length?(i=typeof m=="function"?m:fn(!!m),f):i},f.on=function(){var m=o.on.apply(o,arguments);return m===o?f:m},f.clickDistance=function(m){return arguments.length?(p=(m=+m)*m,f):Math.sqrt(p)},f}const ka=.06;function Zi(e){function t(n){for(const i of e()){const r=i.parts.filter(l=>l.canvasRepresentative()===l&&l.onCanvas&&l.x!=null&&l.y!=null);if(r.length<2)continue;let o=0,s=0;for(const l of r)o+=l.x,s+=l.y;o/=r.length,s/=r.length;const a=ka*n;for(const l of r)l.fx!=null||l.fy!=null||(l.vx=(l.vx??0)+(o-l.x)*a,l.vy=(l.vy??0)+(s-l.y)*a)}}return t.initialize=()=>{},t}const Ji="*",$n="seed";/*! @license DOMPurify 3.4.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.7/LICENSE */function Qi(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,i=Array(t);n<t;n++)i[n]=e[n];return i}function Fa(e){if(Array.isArray(e))return e}function Pa(e,t){var n=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(n!=null){var i,r,o,s,a=[],l=!0,c=!1;try{if(o=(n=n.call(e)).next,t!==0)for(;!(l=(i=o.call(n)).done)&&(a.push(i.value),a.length!==t);l=!0);}catch(u){c=!0,r=u}finally{try{if(!l&&n.return!=null&&(s=n.return(),Object(s)!==s))return}finally{if(c)throw r}}return a}}function za(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ga(e,t){return Fa(e)||Pa(e,t)||Ba(e,t)||za()}function Ba(e,t){if(e){if(typeof e=="string")return Qi(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Qi(e,t):void 0}}const tr=Object.entries,er=Object.setPrototypeOf,Ua=Object.isFrozen,Ha=Object.getPrototypeOf,ja=Object.getOwnPropertyDescriptor;let wt=Object.freeze,Nt=Object.seal,we=Object.create,nr=typeof Reflect<"u"&&Reflect,Xn=nr.apply,Yn=nr.construct;wt||(wt=function(t){return t}),Nt||(Nt=function(t){return t}),Xn||(Xn=function(t,n){for(var i=arguments.length,r=new Array(i>2?i-2:0),o=2;o<i;o++)r[o-2]=arguments[o];return t.apply(n,r)}),Yn||(Yn=function(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];return new t(...i)});const be=ht(Array.prototype.forEach),Wa=ht(Array.prototype.lastIndexOf),ir=ht(Array.prototype.pop),Te=ht(Array.prototype.push),Ka=ht(Array.prototype.splice),bt=Array.isArray,Fe=ht(String.prototype.toLowerCase),qn=ht(String.prototype.toString),rr=ht(String.prototype.match),Se=ht(String.prototype.replace),or=ht(String.prototype.indexOf),Va=ht(String.prototype.trim),$a=ht(Number.prototype.toString),Xa=ht(Boolean.prototype.toString),sr=typeof BigInt>"u"?null:ht(BigInt.prototype.toString),ar=typeof Symbol>"u"?null:ht(Symbol.prototype.toString),lt=ht(Object.prototype.hasOwnProperty),Pe=ht(Object.prototype.toString),gt=ht(RegExp.prototype.test),ze=Ya(TypeError);function ht(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];return Xn(e,t,i)}}function Ya(e){return function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];return Yn(e,n)}}function W(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Fe;if(er&&er(e,null),!bt(t))return e;let i=t.length;for(;i--;){let r=t[i];if(typeof r=="string"){const o=n(r);o!==r&&(Ua(t)||(t[i]=o),r=o)}e[r]=!0}return e}function qa(e){for(let t=0;t<e.length;t++)lt(e,t)||(e[t]=null);return e}function pt(e){const t=we(null);for(const i of tr(e)){var n=Ga(i,2);const r=n[0],o=n[1];lt(e,r)&&(bt(o)?t[r]=qa(o):o&&typeof o=="object"&&o.constructor===Object?t[r]=pt(o):t[r]=o)}return t}function Za(e){switch(typeof e){case"string":return e;case"number":return $a(e);case"boolean":return Xa(e);case"bigint":return sr?sr(e):"0";case"symbol":return ar?ar(e):"Symbol()";case"undefined":return Pe(e);case"function":case"object":{if(e===null)return Pe(e);const t=e,n=Pt(t,"toString");if(typeof n=="function"){const i=n(t);return typeof i=="string"?i:Pe(i)}return Pe(e)}default:return Pe(e)}}function Pt(e,t){for(;e!==null;){const i=ja(e,t);if(i){if(i.get)return ht(i.get);if(typeof i.value=="function")return ht(i.value)}e=Ha(e)}function n(){return null}return n}function Ja(e){try{return gt(e,""),!0}catch{return!1}}const cr=wt(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Zn=wt(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Jn=wt(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Qa=wt(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Qn=wt(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),tc=wt(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),lr=wt(["#text"]),ur=wt(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),ti=wt(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),hr=wt(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),dn=wt(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),ec=Nt(/{{[\\w\\W]*|^[\\w\\W]*}}/g),nc=Nt(/<%[\\w\\W]*|^[\\w\\W]*%>/g),ic=Nt(/\\${[\\w\\W]*/g),rc=Nt(/^data-[\\-\\w.\\u00B7-\\uFFFF]+$/),oc=Nt(/^aria-[\\-\\w]+$/),fr=Nt(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))/i),sc=Nt(/^(?:\\w+script|data):/i),ac=Nt(/[\\u0000-\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u2029\\u205F\\u3000]/g),cc=Nt(/^html$/i),lc=Nt(/^[a-z][.\\w]*(-[.\\w]+)+$/i),zt={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},uc=function(){return typeof window>"u"?null:window},hc=function(t,n){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let i=null;const r="data-tt-policy-suffix";n&&n.hasAttribute(r)&&(i=n.getAttribute(r));const o="dompurify"+(i?"#"+i:"");try{return t.createPolicy(o,{createHTML(s){return s},createScriptURL(s){return s}})}catch{return console.warn("TrustedTypes policy "+o+" could not be created."),null}},dr=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function gr(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:uc();const t=P=>gr(P);if(t.version="3.4.7",t.removed=[],!e||!e.document||e.document.nodeType!==zt.document||!e.Element)return t.isSupported=!1,t;let n=e.document;const i=n,r=i.currentScript;e.DocumentFragment;const o=e.HTMLTemplateElement,s=e.Node,a=e.Element,l=e.NodeFilter,c=e.NamedNodeMap;c===void 0&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;const u=e.DOMParser,p=e.trustedTypes,f=a.prototype,g=Pt(f,"cloneNode"),S=Pt(f,"remove"),b=Pt(f,"nextSibling"),y=Pt(f,"childNodes"),T=Pt(f,"parentNode"),_=Pt(f,"shadowRoot"),x=Pt(f,"attributes"),m=s&&s.prototype?Pt(s.prototype,"nodeType"):null,I=s&&s.prototype?Pt(s.prototype,"nodeName"):null;if(typeof o=="function"){const P=n.createElement("template");P.content&&P.content.ownerDocument&&(n=P.content.ownerDocument)}let D,G="";const E=n,N=E.implementation,F=E.createNodeIterator,B=E.createDocumentFragment,Q=E.getElementsByTagName,C=i.importNode;let k=dr();t.isSupported=typeof tr=="function"&&typeof T=="function"&&N&&N.createHTMLDocument!==void 0;const K=ec,V=nc,O=ic,U=rc,Z=oc,ut=sc,mt=ac,it=lc;let j=fr,q=null;const te=W({},[...cr,...Zn,...Jn,...Qn,...lr]);let tt=null;const ee=W({},[...ur,...ti,...hr,...dn]);let H=Object.seal(we(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Tt=null,ne=null;const Dt=Object.seal(we(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Ke=!0,Ve=!0,vn=!1,An=!0,Bt=!1,he=!0,Wt=!1,$e=!1,ie=!1,Ut=!1,Kt=!1,vt=!1,Xe=!0,Ye=!1;const En="user-content-";let qe=!0,Ht=!1,Vt={},At=null;const xe=W({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Ze=null;const xn=W({},["audio","video","img","source","image","track"]);let Je=null;const jt=W({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),$t="http://www.w3.org/1998/Math/MathML",Me="http://www.w3.org/2000/svg",Et="http://www.w3.org/1999/xhtml";let re=Et,Ie=!1,Xt=null;const hi=W({},[$t,Me,Et],qn);let Ot=W({},["mi","mo","mn","ms","mtext"]),Qe=W({},["annotation-xml"]);const fi=W({},["title","style","font","a","script"]);let fe=null;const di=["application/xhtml+xml","text/html"],gi="text/html";let et=null,oe=null;const pi=n.createElement("form"),Mn=function(d){return d instanceof RegExp||d instanceof Function},tn=function(){let d=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(oe&&oe===d)return;(!d||typeof d!="object")&&(d={}),d=pt(d),fe=di.indexOf(d.PARSER_MEDIA_TYPE)===-1?gi:d.PARSER_MEDIA_TYPE,et=fe==="application/xhtml+xml"?qn:Fe,q=lt(d,"ALLOWED_TAGS")&&bt(d.ALLOWED_TAGS)?W({},d.ALLOWED_TAGS,et):te,tt=lt(d,"ALLOWED_ATTR")&&bt(d.ALLOWED_ATTR)?W({},d.ALLOWED_ATTR,et):ee,Xt=lt(d,"ALLOWED_NAMESPACES")&&bt(d.ALLOWED_NAMESPACES)?W({},d.ALLOWED_NAMESPACES,qn):hi,Je=lt(d,"ADD_URI_SAFE_ATTR")&&bt(d.ADD_URI_SAFE_ATTR)?W(pt(jt),d.ADD_URI_SAFE_ATTR,et):jt,Ze=lt(d,"ADD_DATA_URI_TAGS")&&bt(d.ADD_DATA_URI_TAGS)?W(pt(xn),d.ADD_DATA_URI_TAGS,et):xn,At=lt(d,"FORBID_CONTENTS")&&bt(d.FORBID_CONTENTS)?W({},d.FORBID_CONTENTS,et):xe,Tt=lt(d,"FORBID_TAGS")&&bt(d.FORBID_TAGS)?W({},d.FORBID_TAGS,et):pt({}),ne=lt(d,"FORBID_ATTR")&&bt(d.FORBID_ATTR)?W({},d.FORBID_ATTR,et):pt({}),Vt=lt(d,"USE_PROFILES")?d.USE_PROFILES&&typeof d.USE_PROFILES=="object"?pt(d.USE_PROFILES):d.USE_PROFILES:!1,Ke=d.ALLOW_ARIA_ATTR!==!1,Ve=d.ALLOW_DATA_ATTR!==!1,vn=d.ALLOW_UNKNOWN_PROTOCOLS||!1,An=d.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Bt=d.SAFE_FOR_TEMPLATES||!1,he=d.SAFE_FOR_XML!==!1,Wt=d.WHOLE_DOCUMENT||!1,Ut=d.RETURN_DOM||!1,Kt=d.RETURN_DOM_FRAGMENT||!1,vt=d.RETURN_TRUSTED_TYPE||!1,ie=d.FORCE_BODY||!1,Xe=d.SANITIZE_DOM!==!1,Ye=d.SANITIZE_NAMED_PROPS||!1,qe=d.KEEP_CONTENT!==!1,Ht=d.IN_PLACE||!1,j=Ja(d.ALLOWED_URI_REGEXP)?d.ALLOWED_URI_REGEXP:fr,re=typeof d.NAMESPACE=="string"?d.NAMESPACE:Et,Ot=lt(d,"MATHML_TEXT_INTEGRATION_POINTS")&&d.MATHML_TEXT_INTEGRATION_POINTS&&typeof d.MATHML_TEXT_INTEGRATION_POINTS=="object"?pt(d.MATHML_TEXT_INTEGRATION_POINTS):W({},["mi","mo","mn","ms","mtext"]),Qe=lt(d,"HTML_INTEGRATION_POINTS")&&d.HTML_INTEGRATION_POINTS&&typeof d.HTML_INTEGRATION_POINTS=="object"?pt(d.HTML_INTEGRATION_POINTS):W({},["annotation-xml"]);const A=lt(d,"CUSTOM_ELEMENT_HANDLING")&&d.CUSTOM_ELEMENT_HANDLING&&typeof d.CUSTOM_ELEMENT_HANDLING=="object"?pt(d.CUSTOM_ELEMENT_HANDLING):we(null);if(H=we(null),lt(A,"tagNameCheck")&&Mn(A.tagNameCheck)&&(H.tagNameCheck=A.tagNameCheck),lt(A,"attributeNameCheck")&&Mn(A.attributeNameCheck)&&(H.attributeNameCheck=A.attributeNameCheck),lt(A,"allowCustomizedBuiltInElements")&&typeof A.allowCustomizedBuiltInElements=="boolean"&&(H.allowCustomizedBuiltInElements=A.allowCustomizedBuiltInElements),Bt&&(Ve=!1),Kt&&(Ut=!0),Vt&&(q=W({},lr),tt=we(null),Vt.html===!0&&(W(q,cr),W(tt,ur)),Vt.svg===!0&&(W(q,Zn),W(tt,ti),W(tt,dn)),Vt.svgFilters===!0&&(W(q,Jn),W(tt,ti),W(tt,dn)),Vt.mathMl===!0&&(W(q,Qn),W(tt,hr),W(tt,dn))),Dt.tagCheck=null,Dt.attributeCheck=null,lt(d,"ADD_TAGS")&&(typeof d.ADD_TAGS=="function"?Dt.tagCheck=d.ADD_TAGS:bt(d.ADD_TAGS)&&(q===te&&(q=pt(q)),W(q,d.ADD_TAGS,et))),lt(d,"ADD_ATTR")&&(typeof d.ADD_ATTR=="function"?Dt.attributeCheck=d.ADD_ATTR:bt(d.ADD_ATTR)&&(tt===ee&&(tt=pt(tt)),W(tt,d.ADD_ATTR,et))),lt(d,"ADD_URI_SAFE_ATTR")&&bt(d.ADD_URI_SAFE_ATTR)&&W(Je,d.ADD_URI_SAFE_ATTR,et),lt(d,"FORBID_CONTENTS")&&bt(d.FORBID_CONTENTS)&&(At===xe&&(At=pt(At)),W(At,d.FORBID_CONTENTS,et)),lt(d,"ADD_FORBID_CONTENTS")&&bt(d.ADD_FORBID_CONTENTS)&&(At===xe&&(At=pt(At)),W(At,d.ADD_FORBID_CONTENTS,et)),qe&&(q["#text"]=!0),Wt&&W(q,["html","head","body"]),q.table&&(W(q,["tbody"]),delete Tt.tbody),d.TRUSTED_TYPES_POLICY){if(typeof d.TRUSTED_TYPES_POLICY.createHTML!="function")throw ze(\'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.\');if(typeof d.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw ze(\'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.\');D=d.TRUSTED_TYPES_POLICY,G=D.createHTML("")}else D===void 0&&(D=hc(p,r)),D!==null&&typeof G=="string"&&(G=D.createHTML(""));(k.uponSanitizeElement.length>0||k.uponSanitizeAttribute.length>0)&&q===te&&(q=pt(q)),k.uponSanitizeAttribute.length>0&&tt===ee&&(tt=pt(tt)),wt&&wt(d),oe=d},In=W({},[...Zn,...Jn,...Qa]),Yt=W({},[...Qn,...tc]),mi=function(d){let A=T(d);(!A||!A.tagName)&&(A={namespaceURI:re,tagName:"template"});const L=Fe(d.tagName),J=Fe(A.tagName);return Xt[d.namespaceURI]?d.namespaceURI===Me?A.namespaceURI===Et?L==="svg":A.namespaceURI===$t?L==="svg"&&(J==="annotation-xml"||Ot[J]):!!In[L]:d.namespaceURI===$t?A.namespaceURI===Et?L==="math":A.namespaceURI===Me?L==="math"&&Qe[J]:!!Yt[L]:d.namespaceURI===Et?A.namespaceURI===Me&&!Qe[J]||A.namespaceURI===$t&&!Ot[J]?!1:!Yt[L]&&(fi[L]||!In[L]):!!(fe==="application/xhtml+xml"&&Xt[d.namespaceURI]):!1},xt=function(d){Te(t.removed,{element:d});try{T(d).removeChild(d)}catch{S(d)}},qt=function(d,A){try{Te(t.removed,{attribute:A.getAttributeNode(d),from:A})}catch{Te(t.removed,{attribute:null,from:A})}if(A.removeAttribute(d),d==="is")if(Ut||Kt)try{xt(A)}catch{}else try{A.setAttribute(d,"")}catch{}},Rn=function(d){let A=null,L=null;if(ie)d="<remove></remove>"+d;else{const rt=rr(d,/^[\\r\\n\\t ]+/);L=rt&&rt[0]}fe==="application/xhtml+xml"&&re===Et&&(d=\'<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>\'+d+"</body></html>");const J=D?D.createHTML(d):d;if(re===Et)try{A=new u().parseFromString(J,fe)}catch{}if(!A||!A.documentElement){A=N.createDocument(re,"template",null);try{A.documentElement.innerHTML=Ie?G:J}catch{}}const $=A.body||A.documentElement;return d&&L&&$.insertBefore(n.createTextNode(L),$.childNodes[0]||null),re===Et?Q.call(A,Wt?"html":"body")[0]:Wt?A.documentElement:$},Nn=function(d){return F.call(d.ownerDocument||d,d,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},Zt=function(d){d.normalize();const A=F.call(d.ownerDocument||d,d,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null);let L=A.nextNode();for(;L;){let J=L.data;be([K,V,O],$=>{J=Se(J,$," ")}),L.data=J,L=A.nextNode()}},Re=function(d){const A=I?I(d):null;return typeof A!="string"||et(A)!=="form"?!1:typeof d.nodeName!="string"||typeof d.textContent!="string"||typeof d.removeChild!="function"||d.attributes!==x(d)||typeof d.removeAttribute!="function"||typeof d.setAttribute!="function"||typeof d.namespaceURI!="string"||typeof d.insertBefore!="function"||typeof d.hasChildNodes!="function"||d.nodeType!==m(d)||d.childNodes!==y(d)},de=function(d){if(!m||typeof d!="object"||d===null)return!1;try{return m(d)===zt.documentFragment}catch{return!1}},Ne=function(d){if(!m||typeof d!="object"||d===null)return!1;try{return typeof m(d)=="number"}catch{return!1}};function Lt(P,d,A){be(P,L=>{L.call(t,d,A,oe)})}const Cn=function(d){let A=null;if(Lt(k.beforeSanitizeElements,d,null),Re(d))return xt(d),!0;const L=et(d.nodeName);if(Lt(k.uponSanitizeElement,d,{tagName:L,allowedTags:q}),he&&d.hasChildNodes()&&!Ne(d.firstElementChild)&&gt(/<[/\\w!]/g,d.innerHTML)&&gt(/<[/\\w!]/g,d.textContent)||he&&d.namespaceURI===Et&&L==="style"&&Ne(d.firstElementChild)||d.nodeType===zt.progressingInstruction||he&&d.nodeType===zt.comment&&gt(/<[/\\w]/g,d.data))return xt(d),!0;if(Tt[L]||!(Dt.tagCheck instanceof Function&&Dt.tagCheck(L))&&!q[L]){if(!Tt[L]&&On(L)&&(H.tagNameCheck instanceof RegExp&&gt(H.tagNameCheck,L)||H.tagNameCheck instanceof Function&&H.tagNameCheck(L)))return!1;if(qe&&!At[L]){const $=T(d),rt=y(d);if(rt&&$){const St=rt.length;for(let Ct=St-1;Ct>=0;--Ct){const Mt=g(rt[Ct],!0);$.insertBefore(Mt,b(d))}}}return xt(d),!0}return(m?m(d):d.nodeType)===zt.element&&!mi(d)||(L==="noscript"||L==="noembed"||L==="noframes")&&gt(/<\\/no(script|embed|frames)/i,d.innerHTML)?(xt(d),!0):(Bt&&d.nodeType===zt.text&&(A=d.textContent,be([K,V,O],$=>{A=Se(A,$," ")}),d.textContent!==A&&(Te(t.removed,{element:d.cloneNode()}),d.textContent=A)),Lt(k.afterSanitizeElements,d,null),!1)},Dn=function(d,A,L){if(ne[A]||Xe&&(A==="id"||A==="name")&&(L in n||L in pi))return!1;const J=tt[A]||Dt.attributeCheck instanceof Function&&Dt.attributeCheck(A,d);if(!(Ve&&!ne[A]&&gt(U,A))){if(!(Ke&&gt(Z,A))){if(!J||ne[A]){if(!(On(d)&&(H.tagNameCheck instanceof RegExp&&gt(H.tagNameCheck,d)||H.tagNameCheck instanceof Function&&H.tagNameCheck(d))&&(H.attributeNameCheck instanceof RegExp&&gt(H.attributeNameCheck,A)||H.attributeNameCheck instanceof Function&&H.attributeNameCheck(A,d))||A==="is"&&H.allowCustomizedBuiltInElements&&(H.tagNameCheck instanceof RegExp&&gt(H.tagNameCheck,L)||H.tagNameCheck instanceof Function&&H.tagNameCheck(L))))return!1}else if(!Je[A]){if(!gt(j,Se(L,mt,""))){if(!((A==="src"||A==="xlink:href"||A==="href")&&d!=="script"&&or(L,"data:")===0&&Ze[d])){if(!(vn&&!gt(ut,Se(L,mt,"")))){if(L)return!1}}}}}}return!0},en=W({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),On=function(d){return!en[Fe(d)]&&gt(it,d)},ge=function(d){Lt(k.beforeSanitizeAttributes,d,null);const A=d.attributes;if(!A||Re(d))return;const L={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:tt,forceKeepAttr:void 0};let J=A.length;for(;J--;){const $=A[J],rt=$.name,St=$.namespaceURI,Ct=$.value,Mt=et(rt),nn=Ct;let ft=rt==="value"?nn:Va(nn);if(L.attrName=Mt,L.attrValue=ft,L.keepAttr=!0,L.forceKeepAttr=void 0,Lt(k.uponSanitizeAttribute,d,L),ft=L.attrValue,Ye&&(Mt==="id"||Mt==="name")&&or(ft,En)!==0&&(qt(rt,d),ft=En+ft),he&&gt(/((--!?|])>)|<\\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,ft)){qt(rt,d);continue}if(Mt==="attributename"&&rr(ft,"href")){qt(rt,d);continue}if(L.forceKeepAttr)continue;if(!L.keepAttr){qt(rt,d);continue}if(!An&&gt(/\\/>/i,ft)){qt(rt,d);continue}Bt&&be([K,V,O],kn=>{ft=Se(ft,kn," ")});const Ln=et(d.nodeName);if(!Dn(Ln,Mt,ft)){qt(rt,d);continue}if(D&&typeof p=="object"&&typeof p.getAttributeType=="function"&&!St)switch(p.getAttributeType(Ln,Mt)){case"TrustedHTML":{ft=D.createHTML(ft);break}case"TrustedScriptURL":{ft=D.createScriptURL(ft);break}}if(ft!==nn)try{St?d.setAttributeNS(St,rt,ft):d.setAttribute(rt,ft),Re(d)?xt(d):ir(t.removed)}catch{qt(rt,d)}}Lt(k.afterSanitizeAttributes,d,null)},se=function(d){let A=null;const L=Nn(d);for(Lt(k.beforeSanitizeShadowDOM,d,null);A=L.nextNode();)if(Lt(k.uponSanitizeShadowNode,A,null),Cn(A),ge(A),de(A.content)&&se(A.content),(m?m(A):A.nodeType)===zt.element){const $=_?_(A):A.shadowRoot;de($)&&(ae($),se($))}Lt(k.afterSanitizeShadowDOM,d,null)},ae=function(d){const A=m?m(d):d.nodeType;if(A===zt.element){const $=_?_(d):d.shadowRoot;de($)&&(ae($),se($))}const L=y?y(d):d.childNodes;if(!L)return;const J=[];be(L,$=>{Te(J,$)});for(const $ of J)ae($);if(A===zt.element){const $=I?I(d):null;if(typeof $=="string"&&et($)==="template"){const rt=d.content;de(rt)&&ae(rt)}}};return t.sanitize=function(P){let d=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},A=null,L=null,J=null,$=null;if(Ie=!P,Ie&&(P="<!-->"),typeof P!="string"&&!Ne(P)&&(P=Za(P),typeof P!="string"))throw ze("dirty is not a string, aborting");if(!t.isSupported)return P;if($e||tn(d),t.removed=[],typeof P=="string"&&(Ht=!1),Ht){const Ct=I?I(P):P.nodeName;if(typeof Ct=="string"){const Mt=et(Ct);if(!q[Mt]||Tt[Mt])throw ze("root node is forbidden and cannot be sanitized in-place")}if(Re(P))throw ze("root node is clobbered and cannot be sanitized in-place");ae(P)}else if(Ne(P))A=Rn("<!---->"),L=A.ownerDocument.importNode(P,!0),L.nodeType===zt.element&&L.nodeName==="BODY"||L.nodeName==="HTML"?A=L:A.appendChild(L),ae(L);else{if(!Ut&&!Bt&&!Wt&&P.indexOf("<")===-1)return D&&vt?D.createHTML(P):P;if(A=Rn(P),!A)return Ut?null:vt?G:""}A&&ie&&xt(A.firstChild);const rt=Nn(Ht?P:A);for(;J=rt.nextNode();)Cn(J),ge(J),de(J.content)&&se(J.content);if(Ht)return Bt&&Zt(P),P;if(Ut){if(Bt&&Zt(A),Kt)for($=B.call(A.ownerDocument);A.firstChild;)$.appendChild(A.firstChild);else $=A;return(tt.shadowroot||tt.shadowrootmode)&&($=C.call(i,$,!0)),$}let St=Wt?A.outerHTML:A.innerHTML;return Wt&&q["!doctype"]&&A.ownerDocument&&A.ownerDocument.doctype&&A.ownerDocument.doctype.name&&gt(cc,A.ownerDocument.doctype.name)&&(St="<!DOCTYPE "+A.ownerDocument.doctype.name+`>\n`+St),Bt&&be([K,V,O],Ct=>{St=Se(St,Ct," ")}),D&&vt?D.createHTML(St):St},t.setConfig=function(){let P=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};tn(P),$e=!0},t.clearConfig=function(){oe=null,$e=!1},t.isValidAttribute=function(P,d,A){oe||tn({});const L=et(P),J=et(d);return Dn(L,J,A)},t.addHook=function(P,d){typeof d=="function"&&Te(k[P],d)},t.removeHook=function(P,d){if(d!==void 0){const A=Wa(k[P],d);return A===-1?void 0:Ka(k[P],A,1)[0]}return ir(k[P])},t.removeHooks=function(P){k[P]=[]},t.removeAllHooks=function(){k=dr()},t}gr();function pr(e=8,t="id-"){const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",i=n+"0123456789-_";let r=n.charAt(Math.floor(Math.random()*n.length));for(let o=1;o<e;o++)r+=i.charAt(Math.floor(Math.random()*i.length));return`${t}${r}`}function fc(e,t,n,i){const r=Math.max(Math.abs(n)/e,Math.abs(i)/t);return r===0?e:1/r}function gn(e,t=new WeakSet){if(typeof e=="function")return;if(e===null||typeof e!="object")return e;const n=e;if(t.has(n))return;if(t.add(n),Array.isArray(e))return e.map(r=>gn(r,t));if(Object.getPrototypeOf(e)!==Object.prototype)return e;const i={};for(const[r,o]of Object.entries(e))typeof o!="function"&&(i[r]=gn(o,t));return i}function mr(e){return!e||e.size===0?[$n]:[...e.keys()]}function Ge(e){return e?new Map([...e].map(([t,n])=>[t,[...n]])):new Map}function yr(e,t){return!e||e.size===0?t===$n:e.has(t)}function _r(e,t,n,i=Date.now()){const r=e.get(t);if(r){r.some(o=>o.runId===n)||r.push({runId:n,at:i});return}e.set(t,[{runId:n,at:i}])}function wr(e,t,n){if(!e)return!1;const i=e.get(t);if(i){const r=i.filter(o=>o.runId!==n);r.length?e.set(t,r):e.delete(t)}return e.size===0}function br(e,t){return e?(e.delete(t),e.size===0):t===$n}let Tr=class ao{constructor(t,n,i,r=pr(),o=[]){M(this,"id");M(this,"data");M(this,"children");M(this,"style");M(this,"edgesOut");M(this,"edgesIn");M(this,"defaultCircleRadius",10);M(this,"x");M(this,"y");M(this,"vx");M(this,"vy");M(this,"fx");M(this,"fy");M(this,"weight");M(this,"frozen");M(this,"visible");M(this,"expanded");M(this,"isChild");M(this,"childrenDepth");M(this,"isParent");M(this,"parentNode");M(this,"foldedInto");M(this,"_original_object");M(this,"_deepest_node_clone");M(this,"_subgraph");M(this,"_circleRadius",this.defaultCircleRadius);M(this,"_circleRadiusCollapsed",this.defaultCircleRadius);M(this,"_layoutSize");M(this,"_border");M(this,"_dirty");M(this,"_sources");M(this,"_potential");M(this,"domID");this.id=t,this.domID=r,this.data=n??{},this.style=i??{},this.children=[],this.isParent=!1,this.setChildren(o),this._dirty=!0,this.frozen=!1,this.visible=!0,this.expanded=!1,this.isChild=!1,this.childrenDepth=0,this.edgesOut=new Set,this.edgesIn=new Set}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}registerEdgeOut(t){this.edgesOut.add(t)}registerEdgeIn(t){this.edgesIn.add(t)}unregisterEdge(t){this.edgesOut.delete(t),this.edgesIn.delete(t)}emptyEdges(){this.edgesOut.clear(),this.edgesIn.clear()}getConnectedNodes(){return[...this.edgesOut].map(t=>t.to)}getConnectingNodes(){return[...this.edgesIn].map(t=>t.from)}getEdgesOut(){return[...this.edgesOut]}getEdgesIn(){return[...this.edgesIn]}getStyle(){return this.style}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`node-${this.domID}`):null}toDict(t=!1){const n={id:this.id,data:this.data,style:this.style,weight:this.weight};return t||(n.x=this.x,n.y=this.y,n.vx=this.vx,n.vy=this.vy,n.fx=this.fx,n.fy=this.fy),this.hasChildren()&&(n.children=this.children.map(i=>i.toDict(t))),n}toSimulationDTO(){return{id:this.id,data:this.data,style:gn(this.style),weight:this.weight,_circleRadius:this._circleRadius,_layoutSize:this._layoutSize,x:this.x,y:this.y,vx:this.vx,vy:this.vy,fx:this.fx,fy:this.fy}}clone(){const t={...this.data},n={...this.style},i=new ao(this.id,t,n);return i.x=this.x,i.y=this.y,i.vx=this.vx,i.vy=this.vy,i.fx=this.fx,i.fy=this.fy,i.weight=this.weight,i.frozen=this.frozen,i.visible=this.visible,i.expanded=this.expanded,i.isChild=this.isChild,i.childrenDepth=this.childrenDepth,i.isParent=this.isParent,i.parentNode=this.parentNode,i._circleRadius=this._circleRadius,i._layoutSize=this._layoutSize,i.children=this.children.map(r=>r.clone()),this._sources&&(i._sources=new Map([...this._sources].map(([r,o])=>[r,[...o]]))),this._potential&&(i._potential=new Map(this._potential)),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}freeze(){this.frozen=!0,this.fx=this.x,this.fy=this.y}unfreeze(){this.frozen=!1,this.fx=void 0,this.fy=void 0}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}toggleExpand(t){t===void 0?this.expanded?this.collapse():this.expand():t?this.expand():this.collapse(),this.markDirty()}expand(){this.expanded=!0,this._original_object&&(this._original_object.expanded=!0)}collapse(){this.expanded=!1,this._original_object&&(this._original_object.expanded=!1)}degree(){return this.edgesOut.size+this.edgesIn.size}ancestorChain(){const t=[];let n=this.parentNode;for(;n;)t.unshift(n),n=n.parentNode;return t}canvasRepresentative(){let t=this.clusterRepresentative();for(;t.foldedInto;)t=t.foldedInto;return t}clusterRepresentative(){for(const t of this.ancestorChain())if(!t.expanded)return t;return this}get isGroup(){return!1}get onCanvas(){return this.visible&&!this.foldedInto}setCircleRadius(t){this._circleRadius=t,this._border=void 0}getCircleRadius(){return this._circleRadius}setCircleRadiusCollapsed(t){this._circleRadiusCollapsed=t}getCircleRadiusCollapsed(){return this._circleRadiusCollapsed}setLayoutSize(t){this._layoutSize=t}getLayoutSize(){return this._layoutSize}getLayoutRadius(){return this._layoutSize??this._circleRadius}setBorderBox(t,n){this._border={halfWidth:t/2,halfHeight:n/2}}getBorderBox(t=0){if(this._border)return{halfWidth:this._border.halfWidth+t,halfHeight:this._border.halfHeight+t}}getBorderDistance(t,n,i=0){const r=this._border;return r?fc(r.halfWidth+i,r.halfHeight+i,t,n):this._circleRadius+i}getSources(){return mr(this._sources)}hasSource(t){return yr(this._sources,t)}vouch(t,n){this._sources||(this._sources=new Map),_r(this._sources,t,n)}revokeRun(t,n){return wr(this._sources,t,n)}dropSource(t){return br(this._sources,t)}cloneLedger(){return Ge(this._sources)}restoreLedger(t){this._sources=Ge(t)}landedBy(){var t;return(t=this.landing())==null?void 0:t.runId}landing(){var i,r;const t=(i=this._sources)==null?void 0:i.entries().next().value,n=(r=t==null?void 0:t[1][0])==null?void 0:r.runId;return t&&n!==void 0?{pivotId:t[0],runId:n}:void 0}setPotential(t,n){var o,s;const i=typeof t=="string"?t:Ji,r=typeof t=="string"?n??0:t;if(!r){(o=this._potential)==null||o.delete(i),((s=this._potential)==null?void 0:s.size)===0&&(this._potential=void 0),this.markDirty();return}this._potential||(this._potential=new Map),this._potential.set(i,r),this.markDirty()}getPotential(t=Ji){var n;return(n=this._potential)==null?void 0:n.get(t)}getPotentials(){return new Map(this._potential??[])}setChildren(t){this.children=t,this.hasChildren()?this.isParent=!0:this.isParent=!1}unionChildren(t){const n=[],i=new Map(this.children.map(r=>[r.id,r]));for(const r of t){const o=i.get(r.id);if(o){n.push(...o.unionChildren(r.children));continue}this.children.push(r),this.claim(r),i.set(r.id,r),n.push(r,...r.descendants())}return this.isParent=this.hasChildren(),this.markDirty(),n}removeChildById(t){const n=this.children.findIndex(r=>r.id===t);if(n<0)return;const[i]=this.children.splice(n,1);return this.isParent=this.hasChildren(),this.isParent||(this.expanded=!1),this.markDirty(),i}descendants(){return this.children.flatMap(t=>[t,...t.descendants()])}claim(t){t.markAsChild(this,this.childrenDepth+1),t.hide();for(const n of t.children)t.claim(n)}hasChildren(){return this.children.length>0}markAsChild(t,n){this.isChild=!0,this.childrenDepth=n,this.parentNode=t}markAsParent(){this.isParent=!0}setSubgraph(t){this._subgraph=t}getSubgraph(){return this._subgraph}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setDeepestNodeClone(t){this._deepest_node_clone=t}getDeepestNodeClone(){return this._deepest_node_clone}};function ve(e){return typeof e=="object"&&e!==null&&Object.getPrototypeOf(e)===Object.prototype}function ei(e){const[t,...n]=e,i={};if(!ve(t))return i;for(const[r,o]of Object.entries(t)){const s=n.map(a=>ve(a)?a[r]:void 0);if(ve(o)&&s.every(ve)){const a=ei([o,...s]);Object.keys(a).length>0&&(i[r]=a)}else o!==void 0&&s.every(a=>a===o)&&(i[r]=o)}return i}class Qt{constructor(t,n,i,r,o,s=null){M(this,"id");M(this,"from");M(this,"to");M(this,"directed");M(this,"data");M(this,"style");M(this,"visible");M(this,"layerVisible");M(this,"visibleIgnoringLayer");M(this,"representedEdges");M(this,"_original_object");M(this,"_dirty");M(this,"_sources");M(this,"domID");this.id=t,this.domID=pr(),this.from=n,this.to=i,this.directed=s,this.data=r??{},this.style=o??{},this.visible=!0,this.layerVisible=!0,this.visibleIgnoringLayer=!0,this._dirty=!0,this.from.registerEdgeOut(this),this.to.registerEdgeIn(this)}bindEndpoints(t,n){this.from!==t&&(this.from=t,this.markDirty()),this.to!==n&&(this.to=n,this.markDirty()),t.registerEdgeOut(this),n.registerEdgeIn(this)}get source(){return this.from}get target(){return this.to}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}getStyle(){return this.style}getEdgeStyle(){var t;return((t=this.style)==null?void 0:t.edge)??{}}getLabelStyle(){var t;return((t=this.style)==null?void 0:t.label)??{}}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){const n=this.style,i=t;this.style={...n,...i,edge:{...n.edge,...i.edge},label:{...n.label,...i.label}},this.markDirty()}getGraphElement(){return document?document.getElementById(`edge-${this.domID}`):null}setFrom(t){this.from=t}setTo(t){this.to=t}toDict(){return{id:this.id,from:this.from.id,to:this.to.id,data:this.data,style:this.style}}toSimulationDTO(){return{id:this.id,from:{id:this.from.id},to:{id:this.to.id},data:this.data,style:gn(this.style),directed:this.directed}}clone(){const t={...this.data},n={...this.style},i=new Qt(this.id,this.from.clone(),this.to.clone(),t,n,this.directed);return i.visible=this.visible,i.layerVisible=this.layerVisible,i.visibleIgnoringLayer=this.visibleIgnoringLayer,this._sources&&(i._sources=Ge(this._sources)),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visibleIgnoringLayer=!0,this.visible=this.layerVisible}hide(){this.visibleIgnoringLayer=!1,this.visible=!1}setLayerVisible(t){if(this.layerVisible===t)return!1;this.layerVisible=t;const n=t&&this.visibleIgnoringLayer;return this.visible!==n&&(this.visible=n,this.markDirty()),!0}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}get isSynthetic(){return this.representedEdges!==void 0}static standIn(t,n,i){const r=new Qt(t,n,i);return n.unregisterEdge(r),i.unregisterEdge(r),r.representedEdges=[],r}standFor(t){const n=t.length===1?t[0]:void 0;this.representedEdges=t;const i=n?n.data:ei(t.map(o=>o.data)),r=n?n.style:ei(t.map(o=>o.style));Qt.sameEntries(i,this.data)&&Qt.sameEntries(r,this.style)||(this.data=i,this.style=r,this.markDirty())}static sameEntries(t,n){if(t===n)return!0;if(!ve(t)||!ve(n))return!1;const i=Object.keys(t);return i.length===Object.keys(n).length&&i.every(r=>r in n&&Qt.sameEntries(t[r],n[r]))}getSources(){return mr(this._sources)}hasSource(t){return yr(this._sources,t)}vouch(t,n){this._sources||(this._sources=new Map),_r(this._sources,t,n)}revokeRun(t,n){return wr(this._sources,t,n)}dropSource(t){return br(this._sources,t)}cloneLedger(){return Ge(this._sources)}restoreLedger(t){this._sources=Ge(t)}}function dc(e){return new Worker(self.location.href,{name:e==null?void 0:e.name})}const ni=1e-12,gc=32;function pc(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let n=t;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}function Sr(e,t){const n=Array.from({length:e},(i,r)=>r);for(let i=e-1;i>0;i--){const r=Math.floor(t()*(i+1)),o=n[i];n[i]=n[r],n[r]=o}return n}function mc(e){const t=Array.from({length:e.nodeCount},()=>new Map);for(let o=0;o+1<e.edges.length;o+=2){const s=e.edges[o],a=e.edges[o+1];s!==a&&(t[s].set(a,(t[s].get(a)??0)+1),t[a].set(s,(t[a].get(s)??0)+1))}const n=new Float64Array(e.nodeCount);let i=0;return{adjacency:t.map((o,s)=>{const a=[...o].sort((l,c)=>l[0]-c[0]);for(const[,l]of a)n[s]+=l;return i+=n[s],a}),strength:n,total:i}}function yc(e,t,n,i){const r=t.length,o=new Float64Array(r),s=new Int32Array(r);for(let g=0;g<r;g++)o[t[g]]+=e.strength[g],s[t[g]]++;const a=[];for(let g=r-1;g>=0;g--)s[g]===0&&a.push(g);const l=new Float64Array(r),c=[],u=Sr(r,i),p=new Uint8Array(r).fill(1);let f=!1;for(let g=0;g<u.length;g++){const S=u[g];p[S]=0;const b=t[S],y=e.strength[S];for(const[x,m]of e.adjacency[S]){const I=t[x];l[I]===0&&c.push(I),l[I]+=m}o[b]-=y,s[b]--;let T=b,_=l[b]-n*y*o[b]/e.total;for(const x of c){const m=l[x]-n*y*o[x]/e.total;m>_+ni&&(T=x,_=m)}_<-ni&&s[b]>0&&a.length>0&&(T=a.pop());for(const x of c)l[x]=0;if(c.length=0,o[T]+=y,s[T]++,t[S]=T,s[b]===0&&a.push(b),T!==b){f=!0;for(const[x]of e.adjacency[S])t[x]!==T&&!p[x]&&(p[x]=1,u.push(x))}}return f}function _c(e,t,n,i){const r=t.length,o=Int32Array.from({length:r},(g,S)=>S),s=Float64Array.from(e.strength),a=new Int32Array(r).fill(1),l=new Float64Array(r),c=new Float64Array(r);for(let g=0;g<r;g++)c[t[g]]+=e.strength[g];const u=new Float64Array(r);for(let g=0;g<r;g++){for(const[S,b]of e.adjacency[g])t[S]===t[g]&&(u[g]+=b);l[g]=u[g]}const p=new Float64Array(r),f=[];for(const g of Sr(r,i)){if(a[o[g]]!==1)continue;const S=t[g],b=e.strength[g];if(u[g]<n*b*(c[S]-b)/e.total)continue;for(const[_,x]of e.adjacency[g]){if(t[_]!==S)continue;const m=o[_];p[m]===0&&f.push(m),p[m]+=x}let y=-1,T=ni;for(const _ of f){if(!(l[_]>=n*s[_]*(c[S]-s[_])/e.total))continue;const m=p[_]-n*b*s[_]/e.total;m>T&&(y=_,T=m)}if(y!==-1){const _=o[g];l[y]=l[y]+u[g]-2*p[y],s[y]+=b,a[y]++,s[_]=0,a[_]=0,o[g]=y}for(const _ of f)p[_]=0;f.length=0}return o}function ii(e){const t=new Map,n=new Int32Array(e.length);for(let i=0;i<e.length;i++){let r=t.get(e[i]);r===void 0&&(r=t.size,t.set(e[i],r)),n[i]=r}return{ids:n,count:t.size}}function wc(e,t,n){const i=Array.from({length:n},()=>new Map),r=new Float64Array(n);for(let s=0;s<t.length;s++){const a=t[s];r[a]+=e.strength[s];for(const[l,c]of e.adjacency[s]){const u=t[l];u!==a&&i[a].set(u,(i[a].get(u)??0)+c)}}return{adjacency:i.map(s=>[...s].sort((a,l)=>a[0]-l[0])),strength:r,total:e.total}}function bc(e,t=1,n=1){let i=mc(e);const r=Int32Array.from({length:e.nodeCount},(l,c)=>c);if(i.total===0)return r;const o=pc(n);let s=Int32Array.from({length:e.nodeCount},(l,c)=>c),a=Int32Array.from({length:e.nodeCount},(l,c)=>c);for(let l=0;l<gc;l++){yc(i,a,t,o);const c=ii(a);if(a=c.ids,c.count===a.length)break;const u=ii(_c(i,a,t,o));if(u.count===a.length)break;const p=new Int32Array(u.count);for(let f=0;f<a.length;f++)p[u.ids[f]]=a[f];s=s.map(f=>u.ids[f]),i=wc(i,u.ids,u.count),a=p}for(let l=0;l<e.nodeCount;l++)r[l]=a[s[l]];return ii(r).ids}const Tc=[3,2,1.4,1,.7,.45,.25];function Sc(e,t=Tc,n=1){return t.map(i=>bc(e,i,n))}const vc="pivotick-communities";function Ac(){return new dc}const Ec=(e,t,n,i,r,o=[])=>new Promise((s,a)=>{const l=Ac();l.postMessage({source:"simulation-worker-wrapper",nodes:e,edges:t,options:n,canvasBCR:i,groups:o}),l.onmessage=c=>{const{type:u,progress:p,nodes:f,edges:g,elapsedTime:S}=c.data;if(u==="tick"&&typeof p=="number"){r==null||r(p,S);return}u==="done"&&(s({nodes:f,edges:g}),l.terminate())},l.onerror=a});var pn=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function xc(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Be={exports:{}};Be.exports;var vr;function Mc(){return vr||(vr=1,(function(e,t){var n=200,i="__lodash_hash_undefined__",r=800,o=16,s=9007199254740991,a="[object Arguments]",l="[object Array]",c="[object AsyncFunction]",u="[object Boolean]",p="[object Date]",f="[object Error]",g="[object Function]",S="[object GeneratorFunction]",b="[object Map]",y="[object Number]",T="[object Null]",_="[object Object]",x="[object Proxy]",m="[object RegExp]",I="[object Set]",D="[object String]",G="[object Undefined]",E="[object WeakMap]",N="[object ArrayBuffer]",F="[object DataView]",B="[object Float32Array]",Q="[object Float64Array]",C="[object Int8Array]",k="[object Int16Array]",K="[object Int32Array]",V="[object Uint8Array]",O="[object Uint8ClampedArray]",U="[object Uint16Array]",Z="[object Uint32Array]",ut=/[\\\\^$.*+?()[\\]{}|]/g,mt=/^\\[object .+?Constructor\\]$/,it=/^(?:0|[1-9]\\d*)$/,j={};j[B]=j[Q]=j[C]=j[k]=j[K]=j[V]=j[O]=j[U]=j[Z]=!0,j[a]=j[l]=j[N]=j[u]=j[F]=j[p]=j[f]=j[g]=j[b]=j[y]=j[_]=j[m]=j[I]=j[D]=j[E]=!1;var q=typeof pn=="object"&&pn&&pn.Object===Object&&pn,te=typeof self=="object"&&self&&self.Object===Object&&self,tt=q||te||Function("return this")(),ee=t&&!t.nodeType&&t,H=ee&&!0&&e&&!e.nodeType&&e,Tt=H&&H.exports===ee,ne=Tt&&q.process,Dt=(function(){try{var h=H&&H.require&&H.require("util").types;return h||ne&&ne.binding&&ne.binding("util")}catch{}})(),Ke=Dt&&Dt.isTypedArray;function Ve(h,w,v){switch(v.length){case 0:return h.call(w);case 1:return h.call(w,v[0]);case 2:return h.call(w,v[0],v[1]);case 3:return h.call(w,v[0],v[1],v[2])}return h.apply(w,v)}function vn(h,w){for(var v=-1,z=Array(h);++v<h;)z[v]=w(v);return z}function An(h){return function(w){return h(w)}}function Bt(h,w){return h==null?void 0:h[w]}function he(h,w){return function(v){return h(w(v))}}var Wt=Array.prototype,$e=Function.prototype,ie=Object.prototype,Ut=tt["__core-js_shared__"],Kt=$e.toString,vt=ie.hasOwnProperty,Xe=(function(){var h=/[^.]+$/.exec(Ut&&Ut.keys&&Ut.keys.IE_PROTO||"");return h?"Symbol(src)_1."+h:""})(),Ye=ie.toString,En=Kt.call(Object),qe=RegExp("^"+Kt.call(vt).replace(ut,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$"),Ht=Tt?tt.Buffer:void 0,Vt=tt.Symbol,At=tt.Uint8Array;Ht&&Ht.allocUnsafe;var xe=he(Object.getPrototypeOf,Object),Ze=Object.create,xn=ie.propertyIsEnumerable,Je=Wt.splice,jt=Vt?Vt.toStringTag:void 0,$t=(function(){try{var h=yi(Object,"defineProperty");return h({},"",{}),h}catch{}})(),Me=Ht?Ht.isBuffer:void 0,Et=Math.max,re=Date.now,Ie=yi(tt,"Map"),Xt=yi(Object,"create"),hi=(function(){function h(){}return function(w){if(!pe(w))return{};if(Ze)return Ze(w);h.prototype=w;var v=new h;return h.prototype=void 0,v}})();function Ot(h){var w=-1,v=h==null?0:h.length;for(this.clear();++w<v;){var z=h[w];this.set(z[0],z[1])}}function Qe(){this.__data__=Xt?Xt(null):{},this.size=0}function fi(h){var w=this.has(h)&&delete this.__data__[h];return this.size-=w?1:0,w}function fe(h){var w=this.__data__;if(Xt){var v=w[h];return v===i?void 0:v}return vt.call(w,h)?w[h]:void 0}function di(h){var w=this.__data__;return Xt?w[h]!==void 0:vt.call(w,h)}function gi(h,w){var v=this.__data__;return this.size+=this.has(h)?0:1,v[h]=Xt&&w===void 0?i:w,this}Ot.prototype.clear=Qe,Ot.prototype.delete=fi,Ot.prototype.get=fe,Ot.prototype.has=di,Ot.prototype.set=gi;function et(h){var w=-1,v=h==null?0:h.length;for(this.clear();++w<v;){var z=h[w];this.set(z[0],z[1])}}function oe(){this.__data__=[],this.size=0}function pi(h){var w=this.__data__,v=ge(w,h);if(v<0)return!1;var z=w.length-1;return v==z?w.pop():Je.call(w,v,1),--this.size,!0}function Mn(h){var w=this.__data__,v=ge(w,h);return v<0?void 0:w[v][1]}function tn(h){return ge(this.__data__,h)>-1}function In(h,w){var v=this.__data__,z=ge(v,h);return z<0?(++this.size,v.push([h,w])):v[z][1]=w,this}et.prototype.clear=oe,et.prototype.delete=pi,et.prototype.get=Mn,et.prototype.has=tn,et.prototype.set=In;function Yt(h){var w=-1,v=h==null?0:h.length;for(this.clear();++w<v;){var z=h[w];this.set(z[0],z[1])}}function mi(){this.size=0,this.__data__={hash:new Ot,map:new(Ie||et),string:new Ot}}function xt(h){var w=Fn(this,h).delete(h);return this.size-=w?1:0,w}function qt(h){return Fn(this,h).get(h)}function Rn(h){return Fn(this,h).has(h)}function Nn(h,w){var v=Fn(this,h),z=v.size;return v.set(h,w),this.size+=v.size==z?0:1,this}Yt.prototype.clear=mi,Yt.prototype.delete=xt,Yt.prototype.get=qt,Yt.prototype.has=Rn,Yt.prototype.set=Nn;function Zt(h){var w=this.__data__=new et(h);this.size=w.size}function Re(){this.__data__=new et,this.size=0}function de(h){var w=this.__data__,v=w.delete(h);return this.size=w.size,v}function Ne(h){return this.__data__.get(h)}function Lt(h){return this.__data__.has(h)}function Cn(h,w){var v=this.__data__;if(v instanceof et){var z=v.__data__;if(!Ie||z.length<n-1)return z.push([h,w]),this.size=++v.size,this;v=this.__data__=new Yt(z)}return v.set(h,w),this.size=v.size,this}Zt.prototype.clear=Re,Zt.prototype.delete=de,Zt.prototype.get=Ne,Zt.prototype.has=Lt,Zt.prototype.set=Cn;function Dn(h,w){var v=bi(h),z=!v&&wi(h),Y=!v&&!z&&eo(h),ot=!v&&!z&&!Y&&io(h),st=v||z||Y||ot,nt=st?vn(h.length,String):[],at=nt.length;for(var kt in h)st&&(kt=="length"||Y&&(kt=="offset"||kt=="parent")||ot&&(kt=="buffer"||kt=="byteLength"||kt=="byteOffset")||Qr(kt,at))||nt.push(kt);return nt}function en(h,w,v){(v!==void 0&&!Pn(h[w],v)||v===void 0&&!(w in h))&&se(h,w,v)}function On(h,w,v){var z=h[w];(!(vt.call(h,w)&&Pn(z,v))||v===void 0&&!(w in h))&&se(h,w,v)}function ge(h,w){for(var v=h.length;v--;)if(Pn(h[v][0],w))return v;return-1}function se(h,w,v){w=="__proto__"&&$t?$t(h,w,{configurable:!0,enumerable:!0,value:v,writable:!0}):h[w]=v}var ae=Cu();function P(h){return h==null?h===void 0?G:T:jt&&jt in Object(h)?Du(h):zu(h)}function d(h){return rn(h)&&P(h)==a}function A(h){if(!pe(h)||Fu(h))return!1;var w=Si(h)?qe:mt;return w.test(Hu(h))}function L(h){return rn(h)&&no(h.length)&&!!j[P(h)]}function J(h){if(!pe(h))return Pu(h);var w=to(h),v=[];for(var z in h)z=="constructor"&&(w||!vt.call(h,z))||v.push(z);return v}function $(h,w,v,z,Y){h!==w&&ae(w,function(ot,st){if(Y||(Y=new Zt),pe(ot))rt(h,w,st,v,$,z,Y);else{var nt=z?z(_i(h,st),ot,st+"",h,w,Y):void 0;nt===void 0&&(nt=ot),en(h,st,nt)}},ro)}function rt(h,w,v,z,Y,ot,st){var nt=_i(h,v),at=_i(w,v),kt=st.get(at);if(kt){en(h,v,kt);return}var It=ot?ot(nt,at,v+"",h,w,st):void 0,on=It===void 0;if(on){var vi=bi(at),Ai=!vi&&eo(at),so=!vi&&!Ai&&io(at);It=at,vi||Ai||so?bi(nt)?It=nt:ju(nt)?It=Ln(nt):Ai?(on=!1,It=Mt(at)):so?(on=!1,It=ft(at)):It=[]:Wu(at)||wi(at)?(It=nt,wi(nt)?It=Ku(nt):(!pe(nt)||Si(nt))&&(It=Ou(at))):on=!1}on&&(st.set(at,It),Y(It,at,z,ot,st),st.delete(at)),en(h,v,It)}function St(h,w){return Bu(Gu(h,w,oo),h+"")}var Ct=$t?function(h,w){return $t(h,"toString",{configurable:!0,enumerable:!1,value:$u(w),writable:!0})}:oo;function Mt(h,w){return h.slice()}function nn(h){var w=new h.constructor(h.byteLength);return new At(w).set(new At(h)),w}function ft(h,w){var v=nn(h.buffer);return new h.constructor(v,h.byteOffset,h.length)}function Ln(h,w){var v=-1,z=h.length;for(w||(w=Array(z));++v<z;)w[v]=h[v];return w}function kn(h,w,v,z){var Y=!v;v||(v={});for(var ot=-1,st=w.length;++ot<st;){var nt=w[ot],at=void 0;at===void 0&&(at=h[nt]),Y?se(v,nt,at):On(v,nt,at)}return v}function Nu(h){return St(function(w,v){var z=-1,Y=v.length,ot=Y>1?v[Y-1]:void 0,st=Y>2?v[2]:void 0;for(ot=h.length>3&&typeof ot=="function"?(Y--,ot):void 0,st&&Lu(v[0],v[1],st)&&(ot=Y<3?void 0:ot,Y=1),w=Object(w);++z<Y;){var nt=v[z];nt&&h(w,nt,z,ot)}return w})}function Cu(h){return function(w,v,z){for(var Y=-1,ot=Object(w),st=z(w),nt=st.length;nt--;){var at=st[++Y];if(v(ot[at],at,ot)===!1)break}return w}}function Fn(h,w){var v=h.__data__;return ku(w)?v[typeof w=="string"?"string":"hash"]:v.map}function yi(h,w){var v=Bt(h,w);return A(v)?v:void 0}function Du(h){var w=vt.call(h,jt),v=h[jt];try{h[jt]=void 0;var z=!0}catch{}var Y=Ye.call(h);return z&&(w?h[jt]=v:delete h[jt]),Y}function Ou(h){return typeof h.constructor=="function"&&!to(h)?hi(xe(h)):{}}function Qr(h,w){var v=typeof h;return w=w??s,!!w&&(v=="number"||v!="symbol"&&it.test(h))&&h>-1&&h%1==0&&h<w}function Lu(h,w,v){if(!pe(v))return!1;var z=typeof w;return(z=="number"?Ti(v)&&Qr(w,v.length):z=="string"&&w in v)?Pn(v[w],h):!1}function ku(h){var w=typeof h;return w=="string"||w=="number"||w=="symbol"||w=="boolean"?h!=="__proto__":h===null}function Fu(h){return!!Xe&&Xe in h}function to(h){var w=h&&h.constructor,v=typeof w=="function"&&w.prototype||ie;return h===v}function Pu(h){var w=[];if(h!=null)for(var v in Object(h))w.push(v);return w}function zu(h){return Ye.call(h)}function Gu(h,w,v){return w=Et(w===void 0?h.length-1:w,0),function(){for(var z=arguments,Y=-1,ot=Et(z.length-w,0),st=Array(ot);++Y<ot;)st[Y]=z[w+Y];Y=-1;for(var nt=Array(w+1);++Y<w;)nt[Y]=z[Y];return nt[w]=v(st),Ve(h,this,nt)}}function _i(h,w){if(!(w==="constructor"&&typeof h[w]=="function")&&w!="__proto__")return h[w]}var Bu=Uu(Ct);function Uu(h){var w=0,v=0;return function(){var z=re(),Y=o-(z-v);if(v=z,Y>0){if(++w>=r)return arguments[0]}else w=0;return h.apply(void 0,arguments)}}function Hu(h){if(h!=null){try{return Kt.call(h)}catch{}try{return h+""}catch{}}return""}function Pn(h,w){return h===w||h!==h&&w!==w}var wi=d((function(){return arguments})())?d:function(h){return rn(h)&&vt.call(h,"callee")&&!xn.call(h,"callee")},bi=Array.isArray;function Ti(h){return h!=null&&no(h.length)&&!Si(h)}function ju(h){return rn(h)&&Ti(h)}var eo=Me||Xu;function Si(h){if(!pe(h))return!1;var w=P(h);return w==g||w==S||w==c||w==x}function no(h){return typeof h=="number"&&h>-1&&h%1==0&&h<=s}function pe(h){var w=typeof h;return h!=null&&(w=="object"||w=="function")}function rn(h){return h!=null&&typeof h=="object"}function Wu(h){if(!rn(h)||P(h)!=_)return!1;var w=xe(h);if(w===null)return!0;var v=vt.call(w,"constructor")&&w.constructor;return typeof v=="function"&&v instanceof v&&Kt.call(v)==En}var io=Ke?An(Ke):L;function Ku(h){return kn(h,ro(h))}function ro(h){return Ti(h)?Dn(h):J(h)}var Vu=Nu(function(h,w,v){$(h,w,v)});function $u(h){return function(){return h}}function oo(h){return h}function Xu(){return!1}e.exports=Vu})(Be,Be.exports)),Be.exports}var Ic=Mc(),Ue=xc(Ic);function Rc(e){var t=0,n=e.children,i=n&&n.length;if(!i)t=1;else for(;--i>=0;)t+=n[i].value;e.value=t}function Nc(){return this.eachAfter(Rc)}function Cc(e,t){let n=-1;for(const i of this)e.call(t,i,++n,this);return this}function Dc(e,t){for(var n=this,i=[n],r,o,s=-1;n=i.pop();)if(e.call(t,n,++s,this),r=n.children)for(o=r.length-1;o>=0;--o)i.push(r[o]);return this}function Oc(e,t){for(var n=this,i=[n],r=[],o,s,a,l=-1;n=i.pop();)if(r.push(n),o=n.children)for(s=0,a=o.length;s<a;++s)i.push(o[s]);for(;n=r.pop();)e.call(t,n,++l,this);return this}function Lc(e,t){let n=-1;for(const i of this)if(e.call(t,i,++n,this))return i}function kc(e){return this.eachAfter(function(t){for(var n=+e(t.data)||0,i=t.children,r=i&&i.length;--r>=0;)n+=i[r].value;t.value=n})}function Fc(e){return this.eachBefore(function(t){t.children&&t.children.sort(e)})}function Pc(e){for(var t=this,n=zc(t,e),i=[t];t!==n;)t=t.parent,i.push(t);for(var r=i.length;e!==n;)i.splice(r,0,e),e=e.parent;return i}function zc(e,t){if(e===t)return e;var n=e.ancestors(),i=t.ancestors(),r=null;for(e=n.pop(),t=i.pop();e===t;)r=e,e=n.pop(),t=i.pop();return r}function Gc(){for(var e=this,t=[e];e=e.parent;)t.push(e);return t}function Bc(){return Array.from(this)}function Uc(){var e=[];return this.eachBefore(function(t){t.children||e.push(t)}),e}function Hc(){var e=this,t=[];return e.each(function(n){n!==e&&t.push({source:n.parent,target:n})}),t}function*jc(){var e=this,t,n=[e],i,r,o;do for(t=n.reverse(),n=[];e=t.pop();)if(yield e,i=e.children)for(r=0,o=i.length;r<o;++r)n.push(i[r]);while(n.length)}function mn(e,t){e instanceof Map?(e=[void 0,e],t===void 0&&(t=Vc)):t===void 0&&(t=Kc);for(var n=new He(e),i,r=[n],o,s,a,l;i=r.pop();)if((s=t(i.data))&&(l=(s=Array.from(s)).length))for(i.children=s,a=l-1;a>=0;--a)r.push(o=s[a]=new He(s[a])),o.parent=i,o.depth=i.depth+1;return n.eachBefore(Xc)}function Wc(){return mn(this).eachBefore($c)}function Kc(e){return e.children}function Vc(e){return Array.isArray(e)?e[1]:null}function $c(e){e.data.value!==void 0&&(e.value=e.data.value),e.data=e.data.data}function Xc(e){var t=0;do e.height=t;while((e=e.parent)&&e.height<++t)}function He(e){this.data=e,this.depth=this.height=0,this.parent=null}He.prototype=mn.prototype={constructor:He,count:Nc,each:Cc,eachAfter:Oc,eachBefore:Dc,find:Lc,sum:kc,sort:Fc,path:Pc,ancestors:Gc,descendants:Bc,leaves:Uc,links:Hc,copy:Wc,[Symbol.iterator]:jc};function Yc(e,t){return e.parent===t.parent?1:2}function ri(e){var t=e.children;return t?t[0]:e.t}function oi(e){var t=e.children;return t?t[t.length-1]:e.t}function qc(e,t,n){var i=n/(t.i-e.i);t.c-=i,t.s+=n,e.c+=i,t.z+=n,t.m+=n}function Zc(e){for(var t=0,n=0,i=e.children,r=i.length,o;--r>=0;)o=i[r],o.z+=t,o.m+=t,t+=o.s+(n+=o.c)}function Jc(e,t,n){return e.a.parent===t.parent?e.a:n}function yn(e,t){this._=e,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=t}yn.prototype=Object.create(He.prototype);function Qc(e){for(var t=new yn(e,0),n,i=[t],r,o,s,a;n=i.pop();)if(o=n._.children)for(n.children=new Array(a=o.length),s=a-1;s>=0;--s)i.push(r=n.children[s]=new yn(o[s],s)),r.parent=n;return(t.parent=new yn(null,0)).children=[t],t}function tl(){var e=Yc,t=1,n=1,i=null;function r(c){var u=Qc(c);if(u.eachAfter(o),u.parent.m=-u.z,u.eachBefore(s),i)c.eachBefore(l);else{var p=c,f=c,g=c;c.eachBefore(function(_){_.x<p.x&&(p=_),_.x>f.x&&(f=_),_.depth>g.depth&&(g=_)});var S=p===f?1:e(p,f)/2,b=S-p.x,y=t/(f.x+S+b),T=n/(g.depth||1);c.eachBefore(function(_){_.x=(_.x+b)*y,_.y=_.depth*T})}return c}function o(c){var u=c.children,p=c.parent.children,f=c.i?p[c.i-1]:null;if(u){Zc(c);var g=(u[0].z+u[u.length-1].z)/2;f?(c.z=f.z+e(c._,f._),c.m=c.z-g):c.z=g}else f&&(c.z=f.z+e(c._,f._));c.parent.A=a(c,f,c.parent.A||p[0])}function s(c){c._.x=c.z+c.parent.m,c.m+=c.parent.m}function a(c,u,p){if(u){for(var f=c,g=c,S=u,b=f.parent.children[0],y=f.m,T=g.m,_=S.m,x=b.m,m;S=oi(S),f=ri(f),S&&f;)b=ri(b),g=oi(g),g.a=c,m=S.z+_-f.z-y+e(S._,f._),m>0&&(qc(Jc(S,c,p),c,m),y+=m,T+=m),_+=S.m,y+=f.m,x+=b.m,T+=g.m;S&&!oi(g)&&(g.t=S,g.m+=_-T),f&&!ri(b)&&(b.t=f,b.m+=y-x,p=c)}return p}function l(c){c.x*=t,c.y=c.depth*n}return r.separation=function(c){return arguments.length?(e=c,r):e},r.size=function(c){return arguments.length?(i=!1,t=+c[0],n=+c[1],r):i?null:[t,n]},r.nodeSize=function(c){return arguments.length?(i=!0,t=+c[0],n=+c[1],r):i?[t,n]:null},r}function Ar(e,t){const n=new Set(t.map(i=>i.target.id));for(const i of e)if(!n.has(i.id))return i;return e[0]}const el=1e6;function Er(e,t){var a;const n=new Map;for(const l of e)n.set(l.id,[]);for(const l of t)(a=n.get(l.from.id))==null||a.push(l.to);let i=0,r=!1,o=null,s=-1;for(const l of e){const c=new Set([l.id]),u=[l];for(;u.length>0&&!r;){const f=u.pop();for(const g of n.get(f.id)??[]){if(++i>el){r=!0;break}c.has(g.id)||(c.add(g.id),u.push(g))}}const p=c.size-1;if(p>s&&(s=p,o=l),r)break}return r&&console.warn("Pivotick: reachability search hit its traversal cap, using the best root found so far."),o??e[0]}function nl(e,t){return xr(e,t)}function xr(e,t){const n=new Map,i=new Map;for(const c of e)n.set(c.id,[]),i.set(c.id,0);for(const c of t)c.directed!==!1&&(n.get(c.from.id).push(c.to),i.set(c.to.id,(i.get(c.to.id)||0)+1));const r=[],o=e.filter(c=>i.get(c.id)===0);for(;o.length;){const c=o.shift();r.push(c);for(const u of n.get(c.id))i.set(u.id,i.get(u.id)-1),i.get(u.id)===0&&o.push(u)}if(r.length!==e.length)return console.warn("Pivotick: the graph has a cycle, so no shallowest root is defined — using the first node."),e[0];const s=new Map;for(let c=r.length-1;c>=0;c--){const u=r[c];let p=0;for(const f of n.get(u.id))p=Math.max(p,1+(s.get(f.id)??0));s.set(u.id,p)}let a=null,l=1/0;for(const c of e){const u=s.get(c.id);u<l&&(l=u,a=c)}return a??e[0]}function il(e,t,n){var p;const i=new Map(e.map(f=>[f.id,f])),r=new Map(e.map(f=>[f.id,[]]));for(const f of t)!r.has(f.from.id)||!r.has(f.to.id)||(r.get(f.from.id).push(f.to.id),r.get(f.to.id).push(f.from.id));const o=f=>{const g=new Map([[f,0]]),S=new Map,b=[f];for(let y=0;y<b.length;y++){const T=b[y];for(const _ of r.get(T)??[])g.has(_)||(g.set(_,g.get(T)+1),S.set(_,T),b.push(_))}return{levels:g,parentOf:S,farthest:b[b.length-1]}},s=n!==void 0&&r.has(n)?n:(p=e[0])==null?void 0:p.id;if(s===void 0)return e[0];const a=o(s).farthest,{parentOf:l,farthest:c}=o(a),u=[];for(let f=c;f!==void 0;f=l.get(f))u.push(f);return i.get(u[Math.floor(u.length/2)])??e[0]}const rl=24,ol=16,si=1,Mr=.1;function ai(e,t){return e?e.measured<=0?bn[1]:e.needed/e.measured*t:si}function ci(e){if(!Number.isFinite(e))return si;const t=Math.ceil(e/Mr)*Mr;return Math.min(bn[1],Math.max(si,Math.round(t*10)/10))}function sl(e){const t=ai(e.level,e.current.levelSpacing);if(e.radial){const n=ai(e.sibling,e.current.levelSpacing);return{levelSpacing:ci(Math.max(t,n)),siblingSpacing:e.current.siblingSpacing}}return{levelSpacing:ci(t),siblingSpacing:ci(ai(e.sibling,e.current.siblingSpacing))}}function al(e,t){return e+t+rl}function cl(e,t){return e+t+ol}const ll=20,Ir="__pivotick_forest_root__",Rr="__pivotick_tree_spacer__",Nr=4096,ul=5e4,Cr=.5;let Dr="";const li={type:"tree",rootId:void 0,parentKey:void 0,depthKey:void 0,rootIdAlgorithmFinder:"MaxReachability",strength:.25,radial:!1,radialGap:750,spacing:"auto",levelSpacing:1,siblingSpacing:1,horizontal:!1};class X{constructor(t,n,i,r={}){M(this,"graph");M(this,"simulation");M(this,"simulationForces");M(this,"options");M(this,"originalForceStrength");M(this,"canvasBCR");M(this,"levels");M(this,"maxDepth",0);M(this,"autoSpacing");M(this,"parkedIds",new Set);M(this,"positionedNodesByID");this.graph=t,this.simulation=n,this.simulationForces=i,this.options=Ue({},li,r),this.originalForceStrength={link:this.simulationForces.link.strength(),charge:this.simulationForces.charge.strength(),gravity:this.simulationForces.gravity.strength()},this.autoSpacing=r.spacing==="auto"||r.spacing!=="manual"&&r.levelSpacing===void 0&&r.siblingSpacing===void 0,this.positionedNodesByID=new Map,this.levels=new Map,this.setSizes(),this.update(),this.registerForces()}update(){var n,i;if(this.layoutOnce(),!this.autoSpacing||this.positionedNodesByID.size===0)return;const t=sl(this.measureAutoContext());t.levelSpacing===this.options.levelSpacing&&t.siblingSpacing===this.options.siblingSpacing||(this.options.levelSpacing=t.levelSpacing,this.options.siblingSpacing=t.siblingSpacing,this.layoutOnce(),(i=(n=this.graph.UIManager)==null?void 0:n.physicsFlyout)==null||i.syncAutoSpacing(t))}layoutOnce(){const{nodes:t,edges:n}=this.drawnGraph(),i=this.buildLevels(t,n,this.options),{levels:r,maxDepth:o,parked:s}=i;this.parkedIds=new Set(s);const{nodes:a,nodeById:l}=this.buildTree(t,n,this.options,this.canvasBCR,i);this.positionedNodesByID=l,this.levels=r,this.maxDepth=o,a&&this.setNodePositions(a,this.options)}drawnGraph(){const t=this.graph.getNodes().filter(s=>{var a;return!((a=this.graph.getMutableNode(s.id))!=null&&a.foldedInto)}),n=new Map(this.graph.simplify.getDrawnGroups().map(s=>[s.id,s.clone()]));if(n.size===0)return{nodes:t,edges:this.graph.getEdges()};t.push(...n.values());const i=s=>s.foldedInto?i(s.foldedInto):s,r=[],o=new Set;for(const s of this.graph.getMutableEdges()){const a=i(s.from),l=i(s.to);if(a===s.from&&l===s.to){r.push(s.clone());continue}const c=`${a.id}->${l.id}`;if(a===l||o.has(c))continue;o.add(c);const u=s.clone();u.bindEndpoints(n.get(a.id)??a.clone(),n.get(l.id)??l.clone()),r.push(u)}return{nodes:t,edges:r}}measureAutoContext(){const t=new Map;for(const[o,s]of this.positionedNodesByID){const a=this.graph.getCanvasNode(o);if(!a||this.parkedIds.has(o))continue;const l=a.expanded?a.getCircleRadiusCollapsed():a.getLayoutRadius(),c=Number.isFinite(l)?l:0,u=t.get(s.depth)??[];u.push({node:s,radius:c}),t.set(s.depth,u)}const n=[...t.keys()].sort((o,s)=>o-s);let i=null,r=null;for(let o=0;o<n.length;o++){const s=t.get(n[o]),a=o+1<n.length?t.get(n[o+1]):void 0;if(a){const c=Math.max(n[o+1]-n[o],1),u=Math.abs((a[0].node.y??0)-(s[0].node.y??0))/c,p=al(X.widestOf(s),X.widestOf(a));i=X.tighter(i,{measured:u,needed:p})}const l=[...s].sort((c,u)=>(c.node.x??0)-(u.node.x??0));for(let c=1;c<l.length;c++){const[u,p]=[l[c-1],l[c]],f=this.options.radial?2*(p.node.y??0)*Math.sin(Math.abs((p.node.x??0)-(u.node.x??0))/2):(p.node.x??0)-(u.node.x??0),g=cl(u.radius,p.radius);r=X.tighter(r,{measured:f,needed:g})}}return{level:i,sibling:r,radial:this.options.radial,current:this.getSpacing()}}static tighter(t,n){if(!t)return n;const i=r=>r.needed/Math.max(r.measured,1e-6);return i(n)>i(t)?n:t}static widestOf(t){return t.reduce((n,i)=>Math.max(n,i.radius),0)}setSizes(){const t=this.graph.renderer.getCanvas();if(!t)throw new Error("Canvas element is not defined in the graph renderer.");this.canvasBCR=t.getBoundingClientRect()}setNodePositions(t,n){for(const i of t){const r=this.graph.getCanvasNode(i.data.id);if(r)if(n.radial){const o=i.x??0,s=i.y??0;r.x=s*Math.cos(o-Math.PI/2),r.y=s*Math.sin(o-Math.PI/2),r.fx=r.x,r.fy=r.y}else n.horizontal?(r.x=i.y,r.fx=i.y,r.y=i.x,delete r.fy):(r.x=i.x,r.y=i.y,r.fy=i.y,delete r.fx)}}unsetNodePositions(){[...this.graph.getMutableNodes(),...this.graph.simplify.getDrawnGroups()].forEach(t=>{delete t.fy,delete t.fx})}registerForces(){const t=this.options.strength??.1;if(this.options.radial){const n=X.radialRingGap(this.options,this.maxDepth),i=Li(r=>(this.levels.get(r.id)??1)*n,0,0).strength(t);this.simulation.force("tree-radial",i)}else this.simulation.force("tree-y",Fi(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.x)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.y)??0}).strength(t)),this.simulation.force("tree-x",ki(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.y)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.x)??0}).strength(t));X.adjustOtherSimulationForces(this.simulationForces,this.options)}unregisterLayout(){this.unregisterForces(),this.unsetNodePositions()}unregisterForces(){this.simulation.force("tree-radial",null),this.simulation.force("tree-y",null),this.simulation.force("tree-x",null),X.resetOtherSimulationForces(this.simulationForces,this.originalForceStrength)}static registerForcesOnSimulation(t,n,i,r,o,s,a=this){const l=Ue({},li,o),c=l.strength??.1,u=s.width,p=s.height,f=[u/2,p/2],g=a.buildLevelsStatic(t,n,l),{levels:S,maxDepth:b}=g,{nodeById:y}=a.buildTreeStatic(t,n,l,s,g);if(l.radial){const T=a.radialRingGap(l,b),_=Li(x=>(S.get(x.id)??1)*T,f[0],f[1]).strength(c);i.force("tree-radial",_)}else i.force("tree-y",Fi(T=>{var _,x;return l.horizontal?((_=y.get(T.id))==null?void 0:_.x)??0:((x=y.get(T.id))==null?void 0:x.y)??0}).strength(c)),i.force("tree-x",ki(T=>{var _,x;return l.horizontal?((_=y.get(T.id))==null?void 0:_.y)??0:((x=y.get(T.id))==null?void 0:x.x)??0}).strength(c));a.adjustOtherSimulationForces(r,l)}static adjustOtherSimulationForces(t,n){n!=null&&n.radial?(t.link.strength(0),t.charge.strength(0),t.gravity.strength(0)):(t.link.strength(0),t.charge.strength(0),t.gravity.strength(1e-5))}static resetOtherSimulationForces(t,n){t.link.strength(n.link),t.charge.strength(n.charge),t.gravity.strength(n.gravity)}static simulationDone(t,n,i,r){const o=Ue({},li,r);for(const s of t)o.radial?(s.fx=s.x,s.fy=s.y):o.horizontal?(s.fx=s.x,delete s.fy):(s.fy=s.y,delete s.fx)}static radialRingGap(t,n){const i=t.radialGap*X.spacingOf(t).level;return n>0?i/n:i}static spacingOf(t){const n=i=>Number.isFinite(i)?i:1;return{level:n(t.levelSpacing),sibling:n(t.siblingSpacing)}}getSpacing(){const{level:t,sibling:n}=X.spacingOf(this.options);return{levelSpacing:t,siblingSpacing:n}}setSpacing(t){this.autoSpacing=!1,this.options.spacing="manual",t.levelSpacing!==void 0&&(this.options.levelSpacing=t.levelSpacing),t.siblingSpacing!==void 0&&(this.options.siblingSpacing=t.siblingSpacing),this.relayout()}isAutoSpacing(){return this.autoSpacing}getRoot(){return{rootId:this.options.rootId,algorithm:this.options.rootIdAlgorithmFinder}}setRoot(t){"rootId"in t?this.options.rootId=t.rootId:(this.options.rootId=void 0,this.options.rootIdAlgorithmFinder=t.algorithm),this.relayout()}enableAutoSpacing(){this.autoSpacing=!0,this.options.spacing="auto",this.relayout()}relayout(){this.setSizes(),this.update(),this.positionedNodesByID.size!==0&&this.registerForces()}static sizedTreeLayout(t,n){const i=X.spacingOf(t),r=tl();if(t.radial)return r.size([2*Math.PI,t.radialGap*i.level]),{treeLayout:r,offset:{x:0,y:0}};const o=t.horizontal?n.width:n.height,s=t.horizontal?n.height:n.width,a=s*i.sibling,l=o*i.level;return r.size([a,l]).separation((c,u)=>{var f,g;const p=((g=(f=c.parent)==null?void 0:f.children)==null?void 0:g.length)??1;return c.parent===u.parent?1.5/p:1.5}),{treeLayout:r,offset:{x:-(a-s)/2,y:-(l-o)/2}}}static packParked(t,n,i,r,o=new Map){if(!t.length)return[];const s=O=>{const U=O.getLayoutRadius();return Number.isFinite(U)?U:0},a=2*t.reduce((O,U)=>Math.max(O,s(U)),0)+ll,l=(O,U,Z,ut)=>({data:O,depth:ut,x:U,y:Z,height:0}),c=n.map(O=>O.x??0),u=n.map(O=>O.y??0),p=t.filter(O=>o.has(O.id)),f=t.filter(O=>!o.has(O.id)),g=O=>o.get(O.id)??0,S=[...new Set(n.map(O=>O.depth))].sort((O,U)=>O-U),b=new Map;for(const O of n)b.set(O.depth,O.y??0);const y=S[0]??0,T=S[S.length-1]??0,_=T>y?((b.get(T)??0)-(b.get(y)??0))/(T-y):a,x=O=>b.get(O)??(S.length?(b.get(y)??0)+(O-y)*_:O*a);if(i.radial){const O=[],U=new Map;for(const it of p){const j=g(it);U.set(j,[...U.get(j)??[],it])}for(const[it,j]of U){const q=n.filter(H=>H.depth===it).map(H=>H.x??0).sort((H,Tt)=>H-Tt);let te=0,tt=2*Math.PI;if(q.length){tt=0;for(let H=0;H<q.length;H++){const Tt=H+1<q.length?q[H+1]:q[0]+2*Math.PI;Tt-q[H]>tt&&(tt=Tt-q[H],te=q[H])}}const ee=tt/(j.length+1);j.forEach((H,Tt)=>O.push(l(H,te+ee*(Tt+1),x(it),it)))}const Z=new Set(u).size,ut=u.length?Math.max(...u):i.radialGap,mt=Z>0?ut/Z:ut;return f.forEach((it,j)=>O.push(l(it,j*2*Math.PI/f.length,ut+mt,Z+1))),O}if(!n.length){const O=Math.max(1,Math.floor(r.width/a)),U=[],Z=new Map;for(const mt of p){const it=g(mt),j=Z.get(it)??0;Z.set(it,j+1),U.push(l(mt,j*a,it*a,it))}const ut=Z.size?Math.max(...Z.keys())+1:0;return f.forEach((mt,it)=>{const j=ut+Math.floor(it/O);U.push(l(mt,it%O*a,j*a,j))}),U}const m=new Map,I=new Map;for(const O of n){const U=O.y??0,Z=O.x??0;m.set(U,Math.max(m.get(U)??Z,Z)),I.set(O.depth,Math.max(I.get(O.depth)??Z,Z))}const D=[...m.keys()].sort((O,U)=>O-U),G=Math.min(...c),E=Math.max(...c),N=D.length>1?D[1]-D[0]:a,F=[],B=[],Q=new Map;for(const O of p){const U=g(O),Z=x(U),ut=Q.get(Z)??0,mt=E-ut*a,it=I.get(U);if(it!==void 0&&mt-a<=it){B.push(O);continue}Q.set(Z,ut+1),F.push(l(O,mt,Z,U))}const C=[...f,...B];let k=0;for(const[O,U]of D.entries()){if(k>=C.length)break;const Z=Q.get(U)??0,ut=E-Z*a-((m.get(U)??E)+a),mt=Math.floor(ut/a);for(let it=0;it<mt&&k<C.length;it++)F.push(l(C[k++],E-(Z+it)*a,U,O))}const K=Math.max(1,Math.floor((E-G)/a)),V=D[D.length-1];for(let O=0;k<C.length;O++)F.push(l(C[k++],E-O%K*a,V+N*(1+Math.floor(O/K)),D.length));return F}static offsetTree(t,n){if(!(!n.x&&!n.y))for(const i of t)i.x=(i.x??0)+n.x,i.y=(i.y??0)+n.y}buildTree(t,n,i,r,o){return X.buildTreeStatic(t,n,i,r,o)}static isScaffolding(t){return t===Ir||t.startsWith(Rr)}static buildTreeStatic(t,n,i,r,o){if(!t.length)return{root:null,nodes:[],nodeById:new Map};const s=new Map;for(const N of t){const F=N;F.children=[],s.set(N.id,F)}const{parentOf:a,roots:l,parked:c,levels:u,declaredRows:p}=o??X.buildLevelsStatic(t,n,i);let f=0;const g=()=>({id:`${Rr}${f++}`,children:[]}),S=N=>u.get(N)??0,b=(N,F,B,Q)=>{let C=N;for(let k=F+1;k<Q&&f<ul;k++){const K=g();C.children.push(K),C=K}C.children.push(B)};for(const[N,F]of a){const B=s.get(N),Q=s.get(F);!B||!Q||(b(Q,S(F),B,S(N)),B.parent=Q)}const y=c.map(N=>s.get(N)).filter(N=>!!N),T=X.hierarchyRootFor(l,s,S,b,g);if(!T){if(!l.length&&y.length){const N=X.packParked(y,[],i,r,p);return{root:null,nodes:N,nodeById:new Map(N.map(F=>[F.data.id,F]))}}throw new Error(`Root node with id "${l[0]}" not found.`)}const{treeLayout:_,offset:x}=X.sizedTreeLayout(i,r),m=mn(T),I=_(m);X.offsetTree(I.descendants(),x);const D=I.descendants().filter(N=>!X.isScaffolding(N.data.id)),G=X.packParked(y,D,i,r,p),E=new Map;for(const N of G)E.set(N.data.id,N);return I.descendants().forEach(N=>{X.isScaffolding(N.data.id)||E.set(N.data.id,N)}),{root:I,nodes:[...D,...G],nodeById:E}}static hierarchyRootFor(t,n,i,r,o){if(t.length===1){const l=n.get(t[0]);if(!l||i(t[0])<=0)return l;const c=o();return r(c,0,l,i(t[0])),c}const s=t.map(l=>n.get(l)).filter(l=>!!l);if(!s.length)return;const a={id:Ir,children:[]};for(const l of s)r(a,0,l,i(l.id));return a}buildLevels(t,n,i){return X.buildLevelsStatic(t,n,i)}static readDeclaredHierarchy(t,n,i){const r=new Map,o=new Map,s=new Map,a=f=>s.set(f,(s.get(f)??0)+1),l=i?n.parentKey:void 0,c=n.depthKey;if(!l&&!c)return{parentOf:r,rowOf:o,complaints:s};const u=new Set(t.map(f=>f.id));for(const f of t){const g=f.getData();if(c){const y=g[c];if(y!=null&&y!==""){const T=Math.floor(Number(y));Number.isFinite(T)&&T>=0&&T<=Nr?o.set(f.id,T):a(`declared depths that are not a row between 0 and ${Nr}`)}}if(!l)continue;const S=g[l];if(S==null||S==="")continue;const b=String(S);b===f.id?a("declared parents pointing at their own node"):u.has(b)?r.set(f.id,b):a("declared parents not in the layout")}const p=new Set;for(const f of[...r.keys()]){if(p.has(f))continue;const g=[],S=new Set;let b=f;for(;b!==void 0&&!p.has(b);){if(S.has(b)){r.delete(b),a("declared parent cycles broken");break}S.add(b),g.push(b),b=r.get(b)}for(const y of g)p.add(y)}return{parentOf:r,rowOf:o,complaints:s}}static warnAboutDeclared(t){if(!t.size)return;const n="[Pivotick] Tree layout ignored part of the declared hierarchy: "+[...t].map(([i,r])=>`${r} ${i}`).join(", ")+".";n!==Dr&&(Dr=n,console.warn(n))}static buildLevelsStatic(t,n,i={}){var Q;if(!t.length)return{levels:new Map,maxDepth:0,nodeCountPerLevel:{},parentOf:new Map,roots:[],parked:[],declaredRows:new Map};const r=i.rootId!==void 0&&t.some(C=>C.id===i.rootId)?i.rootId:void 0,o=X.readDeclaredHierarchy(t,i,r===void 0);let s=r!==void 0;const a=new Map,l=new Map(o.parentOf),c=new Map,u=new Set,p=new Set;for(const C of t)c.set(C.id,[]);for(const{source:C,target:k}of n)(Q=c.get(C.id))==null||Q.push(k.id),u.add(k.id),p.add(C.id),p.add(k.id);for(const[C,k]of o.parentOf)p.add(C),p.add(k),u.add(C);const f=()=>{var C;for(const{source:k,target:K}of n)(C=c.get(K.id))==null||C.push(k.id);s=!0};s&&f();const g=C=>p.has(C)||C===r,S=t.filter(C=>g(C.id)),b=t.filter(C=>!g(C.id)).map(C=>C.id),y=o.parentOf.size>0,T=(C,k)=>{const K=new Set;let V=k;for(;V!==void 0&&!K.has(V);){if(V===C)return!0;K.add(V),V=l.get(V)}return!1},_=new Set,x=C=>{if(_.has(C))return;_.add(C);const k=[C];let K=0;for(;K<k.length;){const V=k[K++];for(const O of c.get(V)??[])_.has(O)||(_.add(O),!l.has(O)&&!(y&&T(O,V))&&l.set(O,V),k.push(O))}},m=[];if(S.length){const C=y?S.filter(V=>!l.has(V.id)):S,k=C.length?C:S;let K=r??X.findRootId(k,n,i.rootIdAlgorithmFinder);if(r===void 0&&X.directedCoverage(K,c,n)<Cr){const V=Er(k,n).id;X.directedCoverage(V,c,n)<Cr&&(f(),K=il(k,n,V).id)}x(K);for(const V of S){if(_.has(V.id))continue;const O=S.find(U=>!_.has(U.id)&&!u.has(U.id))??V;x(O.id)}l.has(K)||m.push(K);for(const V of S)V.id!==K&&!l.has(V.id)&&m.push(V.id)}const I=new Map;for(const[C,k]of l){const K=I.get(k)??[];K.push(C),I.set(k,K)}let D=0;const G=(C,k)=>{const K=[[C,k]];for(;K.length;){const[V,O]=K.pop();if(a.has(V))continue;const U=o.rowOf.get(V);U!==void 0&&U<O&&D++;const Z=U!==void 0&&U>O?U:O;a.set(V,Z);for(const ut of I.get(V)??[])K.push([ut,Z+1])}};for(const C of m)G(C,0);for(const C of S)a.has(C.id)||G(C.id,0);D&&o.complaints.set("declared depths clamped to just below their parent",D),X.warnAboutDeclared(o.complaints);const E=m.length>1?1:0;if(E)for(const[C,k]of a)a.set(C,k+E);let N=0;for(const C of a.values())C>N&&(N=C);if(b.length){const C=N+1;for(const k of b){const K=o.rowOf.get(k);a.set(k,K===void 0?C:K+E)}for(const k of a.values())k>N&&(N=k)}const F=new Map;for(const[C,k]of o.rowOf)F.set(C,k+E);const B={};for(const C of a.values())B[C]=(B[C]||0)+1;return{levels:a,maxDepth:N,nodeCountPerLevel:B,parentOf:l,roots:m,parked:b,declaredRows:F}}static directedCoverage(t,n,i){var a,l;const r=c=>{const u=new Set([t]),p=[t];for(let f=0;f<p.length;f++)for(const g of c.get(p[f])??[])u.has(g)||(u.add(g),p.push(g));return u.size},o=new Map;for(const c of n.keys())o.set(c,[]);for(const{source:c,target:u}of i)(a=o.get(c.id))==null||a.push(u.id),(l=o.get(u.id))==null||l.push(c.id);const s=r(o);return s===0?1:r(n)/s}static findRootId(t,n,i){switch(i){case"FirstZeroInDegree":return Ar(t,n).id;case"MaxReachability":return Er(t,n).id;case"MinMaxDistance":return nl(t,n).id;case"MinHeight":return xr(t,n).id;default:return Ar(t,n).id}}}class ue extends X{constructor(t,n,i,r){super(t,n,i,{...r,type:"tree"})}static registerForcesOnSimulation(t,n,i,r,o,s){X.registerForcesOnSimulation(t,n,i,r,o,s,ue)}buildTree(t,n,i,r){return ue.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const S of t){const b=S;b.children=[],o.set(S.id,b)}if(!i.rootId||!o.get(i.rootId))throw new Error("Ego Tree can only be created with a rootId");const s=i.rootId,a=o.get(s);if(a.children=[],!a)throw new Error(`Root node with id "${s}" not found.`);const l=new Set([a.id]);for(const S of n){const b=o.get(S.source.id),y=o.get(S.target.id);if(!b||!y)continue;const T=S.source.id===a.id?y:S.target.id===a.id?b:void 0;!T||l.has(T.id)||(l.add(T.id),a.children.push(T),T.parent=a)}const{treeLayout:c,offset:u}=ue.sizedTreeLayout(i,r),p=mn(a),f=c(p);ue.offsetTree(f.descendants(),u);const g=new Map;return f.descendants().forEach(S=>{g.set(S.data.id,S)}),{root:f,nodes:f.descendants(),nodeById:g}}}const hl="";function Or(e){return e.map(t=>t.id).sort().join(",")}function fl(e){const t=new Map;for(const n of e.nodes){const i=e.inNeighbours(n),r=e.outNeighbours(n);i.length===0&&r.length===0||t.set(n.id,[e.typeOf(n)??"",Or(i),Or(r)].join(hl))}return t}const dl=1e-4,gl=300,pl=100;function ml(e){const t=e.length;if(t===0)return[];if(t===1)return[[0,0]];if(t===2)return[[-e[0][1]/2,0],[e[0][1]/2,0]];const n=_l(e);let i=Lr(n,e);for(let r=0;r<gl;r++){yl(n,e);const o=Lr(n,e);if(i-o<dl*i)break;i=o}return Tl(n)}function yl(e,t){const n=e.length;for(let i=0;i<n;i++){let r=0,o=0,s=0;for(let a=0;a<n;a++){if(i===a)continue;const l=t[i][a],c=1/(l*l);let u=e[i][0]-e[a][0],p=e[i][1]-e[a][1],f=Math.hypot(u,p);f<1e-9&&(u=i<a?-1:1,p=0,f=1),r+=c*(e[a][0]+l*u/f),o+=c*(e[a][1]+l*p/f),s+=c}e[i][0]=r/s,e[i][1]=o/s}}function Lr(e,t){let n=0;for(let i=0;i<e.length;i++)for(let r=i+1;r<e.length;r++){const o=t[i][r],s=Math.hypot(e[i][0]-e[r][0],e[i][1]-e[r][1])-o;n+=s*s/(o*o)}return n}function _l(e){const t=e.length,n=e.map(p=>p.map(f=>f*f)),i=n.map(p=>p.reduce((f,g)=>f+g,0)/t),r=i.reduce((p,f)=>p+f,0)/t,o=n.map((p,f)=>p.map((g,S)=>-.5*(g-i[f]-i[S]+r))),s=kr(o,t,1);wl(o,s);const a=kr(o,t,2),l=[];for(let p=0;p<t;p++)l.push([s.vector[p]*Math.sqrt(s.value),a.vector[p]*Math.sqrt(a.value)]);let c=0;for(const p of e)for(const f of p)c+=f;const u=c/(t*(t-1));return s.value===0?l.forEach((p,f)=>{p[0]=u*Math.cos(2*Math.PI*f/t),p[1]=u*Math.sin(2*Math.PI*f/t)}):a.value===0&&l.forEach((p,f)=>{p[1]=.05*u*Math.sin((f+1)*2.399)}),l}function kr(e,t,n){const i=Math.max(...e.map(s=>s.reduce((a,l)=>a+Math.abs(l),0)));let r=bl(Array.from({length:t},(s,a)=>Math.sin((a+1)*(n+.618))));for(let s=0;s<pl;s++){const a=Fr(e,r).map((c,u)=>c+i*r[u]),l=Math.hypot(...a);if(l<1e-12)break;r=a.map(c=>c/l)}const o=Pr(r,Fr(e,r));return{value:o>1e-9?o:0,vector:r}}function wl(e,t){for(let n=0;n<e.length;n++)for(let i=0;i<e.length;i++)e[n][i]-=t.value*t.vector[n]*t.vector[i]}function Fr(e,t){return e.map(n=>Pr(n,t))}function Pr(e,t){let n=0;for(let i=0;i<e.length;i++)n+=e[i]*t[i];return n}function bl(e){const t=Math.hypot(...e);return t>0?e.map(n=>n/t):e}function Tl(e){const t=e.reduce((i,r)=>i+r[0],0)/e.length,n=e.reduce((i,r)=>i+r[1],0)/e.length;return e.map(([i,r])=>[i-t,r-n])}function Sl(e,t){const n=Array.from({length:e},()=>[]);for(const[r,o,s]of t)n[r].push([o,s]),n[o].push([r,s]);const i=[];for(let r=0;r<e;r++){const o=new Array(e).fill(1/0),s=new Array(e).fill(!1);o[r]=0;for(let a=0;a<e;a++){let l=-1;for(let c=0;c<e;c++)!s[c]&&(l===-1||o[c]<o[l])&&(l=c);if(l===-1||o[l]===1/0)break;s[l]=!0;for(const[c,u]of n[l]){const p=o[l]+u;p<o[c]&&(o[c]=p)}}i.push(o)}return i}const vl=12,Al=100,ui=["bottom","right","top","left"],El={right:0,bottom:Math.PI/2,left:Math.PI,top:-Math.PI/2};function xl(e,t,n,i){const r=[...e].sort((c,u)=>Gt(c.id,u.id)),o=new Map(r.map(c=>[c.id,c])),s=new Map(r.map(c=>[c.id,new Set]));for(const[c,u]of t)c===u||!o.has(c)||!o.has(u)||(s.get(c).add(u),s.get(u).add(c));const a=r.filter(c=>s.get(c.id).size===0),l=Ml(r,s).map(c=>Il(c,s,n,i));return Fl(l,a,i)}function Ml(e,t){const n=new Map(e.map(o=>[o.id,o])),i=new Set,r=[];for(const o of e){if(i.has(o.id)||t.get(o.id).size===0)continue;const s=[o.id];i.add(o.id);for(let a=0;a<s.length;a++)for(const l of[...t.get(s[a])].sort(Gt))i.has(l)||(i.add(l),s.push(l));r.push(s.sort(Gt).map(a=>n.get(a)))}return r}function Il(e,t,n,i){const{gap:r}=i,o=2*r,s=Rl(e,t,n,i),a=new Map;for(const E of s)for(const N of E.members)a.set(N.id,E);const l=[...e.filter(E=>!a.has(E.id)).map(E=>({node:E,x:0,y:0})),...s.map(E=>({block:E,x:0,y:0}))],c=new Map(l.flatMap((E,N)=>E.node?[[E.node.id,N]]:[])),u=E=>c.get(E)??l.findIndex(N=>N.block===a.get(E)),p=(E,N)=>E.thickness/2+o+N.radius,f=E=>E.anchors.length===2?Math.max(E.length/2-E.cell/2,0):0,g=new Map;for(const E of e)for(const N of t.get(E.id)){const[F,B]=[u(E.id),u(N)];if(F===B)continue;const Q=F<B?`${F}:${B}`:`${B}:${F}`;if(g.has(Q))continue;const C=l[F].block??l[B].block,k=l[F].node??l[B].node,K=C?Math.hypot(p(C,k),f(C)):l[F].node.radius+l[B].node.radius+o;g.set(Q,[Math.min(F,B),Math.max(F,B),K])}const S=Sl(l.length,[...g.values()]);for(const E of s){if(E.anchors.length!==2)continue;const[N,F]=E.anchors.map(u),B=Math.max(2*f(E),zr(e,E.anchors[0]).radius+zr(e,E.anchors[1]).radius+r);S[N][F]=S[F][N]=Math.min(S[N][F],B)}const b=ml(S);l.forEach((E,N)=>{E.x=b[N][0],E.y=b[N][1]}),Nl(l,t,i);for(const E of s)Cl(E,l,u,i);Dl(l,r);const y=new Map,T=new Map;for(const E of l)E.node&&y.set(E.node.id,[E.x,E.y]),E.block&&Ol(E.block,E.x,E.y,y,T);for(const E of e)T.has(E.id)||T.set(E.id,Ll(y.get(E.id),[...t.get(E.id)].map(N=>y.get(N))));let _=1/0,x=1/0,m=-1/0,I=-1/0;for(const E of e){const[N,F]=y.get(E.id);_=Math.min(_,N-E.radius),x=Math.min(x,F-E.radius),m=Math.max(m,N+E.radius),I=Math.max(I,F+E.radius)}for(const[E,[N,F]]of y)y.set(E,[N-_,F-x]);const D=m-_,G=I-x;return{positions:y,labelSides:T,width:D,height:G,area:D*G,key:e[0].id}}function zr(e,t){return e.find(n=>n.id===t)}function Rl(e,t,n,i){const r=new Map;for(const s of e){const a=n.get(s.id),l=t.get(s.id);if(a===void 0||l.size>2)continue;const c=`${a}${[...l].sort(Gt).join(",")}`;r.set(c,[...r.get(c)??[],s])}const o=[];for(const s of r.values()){if(s.length<i.groupMin)continue;const a=[...t.get(s[0].id)].sort(Gt);if(a.length===0)continue;s.sort((p,f)=>Gt(p.sortKey,f.sortKey)||Gt(p.id,f.id));const l=2*Math.max(...s.map(p=>p.radius))+i.gap,c=Math.min(s.length,vl),u=Math.ceil(s.length/c);o.push({members:s,anchors:a,cell:l,perLine:c,lines:u,length:c*l,thickness:u*l,vertical:!0,side:"right"})}return o}function Nl(e,t,n){if(e.length<2)return;const i=e.reduce((y,T)=>y+T.x,0)/e.length,r=e.reduce((y,T)=>y+T.y,0)/e.length;let o=0,s=0,a=0;for(const y of e){const T=y.x-i,_=y.y-r;o+=T*T,s+=_*_,a+=T*_}const l=.5*Math.atan2(2*a,o-s),c=n.width>=n.height,u=(c?0:Math.PI/2)-l,[p,f]=[Math.cos(u),Math.sin(u)];for(const y of e){const T=y.x-i,_=y.y-r;y.x=T*p-_*f,y.y=T*f+_*p}const g=y=>y.node?t.get(y.node.id).size:0,S=e.reduce((y,T)=>g(T)>g(y)?T:y,e[0]);if(c?S.x>0:S.y>0)for(const y of e)c?y.x=-y.x:y.y=-y.y}function Cl(e,t,n,i){const r=t.find(l=>l.block===e),o=e.anchors.map(l=>t[n(l)]),s=o.reduce((l,c)=>l+c.x,0)/o.length-r.x,a=o.reduce((l,c)=>l+c.y,0)/o.length-r.y;e.vertical=i.direction==="column"||i.direction==="auto"&&Math.abs(s)>=Math.abs(a),e.side=e.vertical?s<=0?"right":"left":a<=0?"bottom":"top"}function Gr(e,t){if(e.node)return[e.node.radius+t/2,e.node.radius+t/2];const n=e.block;return n.vertical?[n.thickness/2,n.length/2]:[n.length/2,n.thickness/2]}function Dl(e,t){for(let n=0;n<Al;n++){let i=!1;for(let r=0;r<e.length;r++)for(let o=r+1;o<e.length;o++){const[s,a]=[e[r],e[o]],[l,c]=Gr(s,t),[u,p]=Gr(a,t),f=a.x-s.x,g=a.y-s.y,S=l+u-Math.abs(f),b=c+p-Math.abs(g);if(!(S<=0||b<=0))if(i=!0,S<b){const y=(f<0?-1:1)*S/2;s.x-=y,a.x+=y}else{const y=(g<0?-1:1)*b/2;s.y-=y,a.y+=y}}if(!i)return}}function Ol(e,t,n,i,r){const{members:o,perLine:s,lines:a,cell:l}=e;o.forEach((c,u)=>{const p=Math.floor(u/s),f=p<a-1?s:o.length-s*(a-1),g=(p-(a-1)/2)*l,S=(u%s-(f-1)/2)*l;i.set(c.id,e.vertical?[t+g,n+S]:[t+S,n+g]),r.set(c.id,e.side)})}function Ll(e,t){if(t.length===0)return ui[0];const n=t.map(([o,s])=>Math.atan2(s-e[1],o-e[0]));let i=ui[0],r=-1;for(const o of ui){const s=Math.min(...n.map(a=>kl(a,El[o])));s>r+1e-6&&(i=o,r=s)}return i}function kl(e,t){const n=Math.abs(e-t)%(2*Math.PI);return n>Math.PI?2*Math.PI-n:n}function Fl(e,t,n){const{gap:i,width:r,height:o}=n,s=3*i,a=[...e].sort((T,_)=>_.area-T.area||Gt(T.key,_.key)),l=2*Math.max(0,...t.map(T=>T.radius))+i,c=new Set;let u=0;for(const T of a)u+=(u>0?s:0)+T.width,c.add(u),c.add(T.width);c.size===0&&c.add(0);let p;for(const T of[...c].sort((_,x)=>_-x))for(const _ of zl(Pl(a,T,s),t.length,l,s,n.trayPosition)){const x=Math.min(r/Math.max(_.width,1),o/Math.max(_.height,1));(!p||x>p.scale+1e-9)&&(p={..._,scale:x})}const f=new Map,g=new Map,S=r/2-p.width/2,b=o/2-p.height/2;for(const{component:T,x:_,y:x}of p.placed){for(const[m,[I,D]]of T.positions)f.set(m,{x:S+_+I,y:b+x+D});for(const[m,I]of T.labelSides)g.set(m,I)}const y=p.tray;return t.slice().sort((T,_)=>Gt(T.sortKey,_.sortKey)||Gt(T.id,_.id)).forEach((T,_)=>{const x=y.perRow>0?_%y.perRow:0,m=y.perRow>0?Math.floor(_/y.perRow):_;f.set(T.id,{x:S+y.x+x*l+l/2,y:b+y.y+m*l+l/2}),g.set(T.id,"bottom")}),{positions:f,labelSides:g}}function Pl(e,t,n){const i=[];let r=[],o=0;for(const u of e){const p=o+(r.length?n:0)+u.width;r.length&&p>t+1e-6&&(i.push(r),r=[],o=0),o+=(r.length?n:0)+u.width,r.push(u)}r.length&&i.push(r);const s=u=>u.reduce((p,f)=>p+f.width,0)+n*(u.length-1),a=Math.max(0,...i.map(s)),l=[];let c=0;for(const u of i){const p=Math.max(...u.map(g=>g.height));let f=(a-s(u))/2;for(const g of u)l.push({component:g,x:f,y:c+(p-g.height)/2}),f+=g.width+n;c+=p+n}return{placed:l,width:a,height:i.length?c-n:0}}function zl(e,t,n,i,r){if(t===0)return[{...e,tray:{x:0,y:0,perRow:0}}];if(e.placed.length===0)return Array.from({length:t},(a,l)=>{const c=l+1;return{...e,width:c*n,height:Math.ceil(t/c)*n,tray:{x:0,y:0,perRow:c}}});if(r==="right"){const a=Math.ceil(t/Math.max(1,Math.floor(e.height/n)));return[{...e,width:e.width+i+a*n,height:Math.max(e.height,Math.ceil(t/a)*n),tray:{x:e.width+i,y:0,perRow:a}}]}const o=Math.max(1,Math.floor(e.width/n)),s=Math.min(t,o);return[{...e,width:Math.max(e.width,s*n),height:e.height+i+Math.ceil(t/o)*n,tray:{x:(Math.max(e.width,s*n)-s*n)/2,y:e.height+i,perRow:o}}]}function Gt(e,t){return e<t?-1:e>t?1:0}const Gl={type:"structured",groupMin:3,direction:"auto",gap:30,trayPosition:"bottom",labelSides:!0},Bl={width:1e3,height:800},Ul=10;class Ae{constructor(t,n,i,r={},o){M(this,"graph");M(this,"simulationForces");M(this,"options");M(this,"originalStrengths");M(this,"links");M(this,"labelSides",new Map);this.graph=t,this.simulationForces=i,this.options=Ue({},Gl,r),this.links=o,this.originalStrengths={link:i.link.strength(),charge:i.charge.strength(),gravity:i.gravity.strength()},this.update(),this.registerForces()}update(){const t=this.graph.getCanvasNodes(),n=this.links().map(o=>[o.source,o.target]),i=xl(t.map(o=>this.arrangeNode(o)),n.map(([o,s])=>[o.id,s.id]),this.groupKeys(t,n),{...this.options,...this.canvasSize()}),r=[];for(const o of t){const s=i.positions.get(o.id);if(!s)continue;o.x=o.fx=s.x,o.y=o.fy=s.y,o.vx=o.vy=0;const a=i.labelSides.get(o.id);this.labelSides.has(o.id)&&this.labelSides.get(o.id)!==a&&r.push(o)}return this.labelSides=i.labelSides,this.options.labelSides?r:[]}getLabelSide(t){return this.options.labelSides?this.labelSides.get(t):void 0}unregisterLayout(){this.simulationForces.link.strength(this.originalStrengths.link),this.simulationForces.charge.strength(this.originalStrengths.charge),this.simulationForces.gravity.strength(this.originalStrengths.gravity);for(const t of[...this.graph.getMutableNodes(),...this.graph.simplify.getDrawnGroups()])delete t.fx,delete t.fy;this.labelSides.clear()}registerForces(){this.simulationForces.link.strength(0),this.simulationForces.charge.strength(0),this.simulationForces.gravity.strength(0)}arrangeNode(t){var r;const n=t.expanded?t.getCircleRadius():t.getLayoutRadius(),i=(r=t.getData())==null?void 0:r.label;return{id:t.id,radius:Number.isFinite(n)&&n>0?n:Ul,sortKey:typeof i=="string"?i:t.id}}groupKeys(t,n){const i=new Map,r=new Map;for(const[o,s]of n)o!==s&&(r.set(o,[...r.get(o)??[],s]),i.set(s,[...i.get(s)??[],o]));return fl({nodes:t,inNeighbours:o=>i.get(o)??[],outNeighbours:o=>r.get(o)??[],typeOf:o=>this.graph.simplify.typeOf(o),groupOf:()=>{}})}canvasSize(){var n;const t=(n=this.graph.renderer.getCanvas())==null?void 0:n.getBoundingClientRect();return t&&t.width>0&&t.height>0?{width:t.width,height:t.height}:Bl}}function Hl(e){var n;const t=(n=e.getData())==null?void 0:n.label;return typeof t=="string"?t:""}const Br=.3,jl=1,Ur=4,Wl=400,Kl=24,Vl=6.5,$l=10,Xl=140,Yl=1.15,ql=.35,Zl=.35,Jl=.0058,Ql=38,Hr=95,tu=300,eu=.35,nu=8,iu=10,ru=.54,jr=24,ou=62,su=.2,au=240,cu=.9,_n=.001,lu=.06,uu=.03,hu=8,Wr=.002;function Ee(e,t,n){return Math.max(t,Math.min(n,e))}function je(e){return Ee(e,0,1)}function wn(e,t){const[n,i]=ct[t];return Ee(e,n,i)}function fu(e){return Br+(jl-Br)*Kr(e)}function Kr(e){return je(Math.log10(Math.max(e,1)/Ur)/Math.log10(Wl/Ur))}function Vr(e){const t=10+Math.sqrt(Math.max(0,e-10));return t*t/100}function du(e,t){const n=Math.pow(Math.max(1,t)/iu,ru),i=Ql*Math.pow(tu/Math.max(1,e),eu);return Ee(i*n,nu,Hr)}function gu(e,t,n){const i=e/Vr(t);return Ee(i/400*100,du(n,t),Hr)}function pu(e,t){return e/100*400*Vr(t)}function mu(e){const t=(e-.6)/1.7999999999999998;return wn(4+t*56,"collisionRadius")}function yu(e,t,n,i){const r=Math.max(1,cu*.5*Math.min(t.width,t.height)),o=au*n*e/(r*r*r),s=_n+(uu-_n)*Math.pow(1-Kr(n),3),a=_n+(lu-_n)*je(i),l=Math.max(s,a),c=Ee(o,Wr,Math.max(Wr,l));return wn(100*Math.sqrt(je(c/su)),"centering")}function _u(e){return wn(1.2+.8*Math.log10(Math.max(e,1)),"settleTime")}function wu(e){const t=je(Math.log10(Math.max(e,1)/4)/Math.log10(125));return jr+(ou-jr)*t}function bu(e){return{repulsion:Math.round(e.repulsion),linkDistance:Math.round(e.linkDistance),collisionRadius:Math.round(e.collisionRadius),friction:Math.round(e.friction),centering:Math.round(e.centering),settleTime:Math.round(e.settleTime*10)/10}}function Tu(e){const t=fu(e.nodeCount)*e.canvas.width*e.canvas.height;return{targetArea:t,spacing:Math.sqrt(t/Math.max(1,e.nodeCount))}}function Su(e){const{spacing:t}=Tu(e),n=Math.max(1,e.radii.mean),i=Math.max(.8*t,Vl*n),r=2*n+Kl,o=Math.min(ct.linkDistance[1],$l*n+Xl),s=wn(Ee(i,r,Math.max(r,o)),"linkDistance"),a=Jl*t*t,l=e.radii.totalArea/Math.max(1,e.nodeCount*s*s),c=Yl+ql*je(l/Zl),u=gu(a,n,e.nodeCount);return bu({repulsion:u,linkDistance:s,collisionRadius:mu(c),friction:wu(e.nodeCount),centering:yu(pu(u,n),e.canvas,e.nodeCount,e.looseNodeFraction),settleTime:_u(e.nodeCount)})}function vu(e,t){const n=new Map;for(const s of e)n.set(s,s);const i=s=>{let a=s;for(;n.get(a)!==a;)a=n.get(a);let l=s;for(;n.get(l)!==a;){const c=n.get(l);n.set(l,a),l=c}return a};let r=e.length;for(const[s,a]of t){if(!n.has(s)||!n.has(a))continue;const l=i(s),c=i(a);l!==c&&(n.set(l,c),r--)}let o=0;if(r>1){const s=new Map;for(const a of e){const l=i(a);s.set(l,(s.get(l)??0)+1)}for(const a of s.values())a<hu&&(o+=a)}return{count:r,looseNodeFraction:e.length?o/e.length:0}}const We={d3Alpha:1,d3AlphaMin:.001,d3AlphaDecay:.05,d3AlphaTarget:0,d3VelocityDecay:.45,d3LinkDistance:40,d3LinkStrength:null,d3ManyBodyStrength:-150,d3ManyBodyTheta:.9,d3CollideRadius:12,d3CollideRadiusMultiplier:1.2,d3CollideStrength:1,d3CollideIterations:1,d3GravityStrength:.1,d3GravityStrengthConnected:.001,enabled:!0,cooldownTime:2e3,useWorker:!0,warmupTicks:"auto",freezeNodesOnDrag:!0,gridSnappingEnabled:!1,gridSize:50,fitViewOnExpandCollapse:!1,layout:{type:"force"},callbacks:{onInit:()=>{},onStart:()=>{},onStop:()=>{},onTick:()=>{}}},ct={repulsion:[0,100],linkDistance:[40,600],collisionRadius:[4,60],friction:[0,100],centering:[0,100],settleTime:[.5,8]},bn=[.5,10],Au="MaxReachability",Eu={levelSpacing:1,siblingSpacing:1},xu={tight:{repulsion:32,linkDistance:70,collisionRadius:16,friction:45,centering:7,settleTime:3},loose:{repulsion:70,linkDistance:150,collisionRadius:26,friction:28,centering:7,settleTime:2.25}},R=class R{constructor(t,n={}){M(this,"simulation");M(this,"graph");M(this,"container");M(this,"graphInteraction");M(this,"layout");M(this,"containerBCR");M(this,"containerObserver");M(this,"animationFrameId",null);M(this,"startSimulationTime",0);M(this,"engineRunning",!1);M(this,"slowTickThresholdReached",!1);M(this,"avgTickDuration",0);M(this,"SLOW_TICK_THRESHOLD",33);M(this,"dragInProgress",!1);M(this,"dragSelection",[]);M(this,"totalTickCount",0);M(this,"runTickCount",0);M(this,"options");M(this,"callbacks");M(this,"simulationForces");M(this,"scaledForces",{d3ManyBodyStrength:We.d3ManyBodyStrength,d3CollideStrength:We.d3CollideStrength});M(this,"physicsKnobs");M(this,"autoEnabled");M(this,"autoTuneTimer",null);M(this,"applyingAutoKnobs",!1);M(this,"suppressReheat",!1);M(this,"autoLastRun",null);M(this,"heldCanvas");if(this.graph=t,this.autoEnabled=R.shouldAutoTune(n),this.options=Ue({},We,n),this.callbacks=this.options.callbacks??{},this.physicsKnobs=R.knobsFromOptions(this.options),this.container=this.graph.renderer.getRootContainer(),!this.container)throw new Error("Root container is not defined in the graph renderer.");if(this.containerBCR=R.measureContainer(this.container),this.graphInteraction=this.graph.renderer.getGraphInteraction(),!this.graphInteraction)throw new Error("Graph interaction is not available.");const i=R.initSimulationForces(this.options,this.containerBCR);this.simulation=i.simulation,this.simulationForces=i.simulationForces,this.simulation.force("groupCohesion",Zi(()=>this.graph.simplify.getOpenGroupNodes())),this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength||We.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=this.options.d3CollideStrength||We.d3CollideStrength,this.options.layout.type==="tree"?this.layout=new X(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="egoTree"?this.layout=new ue(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="structured"&&(this.layout=this.createStructuredLayout(this.options.layout)),this.treeLayout&&Object.assign(this.options.layout,this.treeLayout.getSpacing()),this.observeContainer(),this.callbacks.onInit&&this.callbacks.onInit(this)}static measureContainer(t){const n=t.getBoundingClientRect();if(n.width>0&&n.height>0)return n;const{width:i,height:r}=R.FALLBACK_CONTAINER_SIZE;return new DOMRect(n.x,n.y,i,r)}observeContainer(){!this.container||typeof ResizeObserver>"u"||(this.containerObserver=new ResizeObserver(()=>{if(!this.container)return;const t=R.measureContainer(this.container);t.width===this.containerBCR.width&&t.height===this.containerBCR.height||(this.containerBCR=t,R.initSimulationForceGravity(this.simulationForces.gravity,this.options,t),this.scheduleTune())}),this.containerObserver.observe(this.container))}destroy(){var t;this.stop(),(t=this.containerObserver)==null||t.disconnect(),this.containerObserver=void 0,this.container=void 0}static initSimulationForces(t,n){const i={link:Mo(),charge:jo(),collide:Eo(),gravity:Wo()},r=Ho().force("link",i.link).force("charge",i.charge).force("collide",i.collide).force("gravity",i.gravity);return this.initSimulationForceGravity(i.gravity,t,n),this.initSimulationForceLink(i.link,t),this.initSimulationForceCharge(i.charge,t),this.initSimulationForceCollide(i.collide,t),r.stop(),r.alphaMin(t.d3AlphaMin),r.alphaDecay(t.d3AlphaDecay),r.alphaTarget(0),r.velocityDecay(t.d3VelocityDecay),{simulation:r,simulationForces:i}}static initSimulationForceGravity(t,n,i){t.x(i.width/2).y(i.height/2).strength(r=>(r.degree()??0)===0?n.d3GravityStrength:n.d3GravityStrengthConnected)}static initSimulationForceLink(t,n){t.distance(i=>{const r=i.__clusterAnchorDistance;if(r!=null)return r;const o=Hl(i);if(!o||o==="")return n.d3LinkDistance;const s=o.length*10;return Math.max(n.d3LinkDistance,s)}),n.d3LinkStrength&&t.strength(n.d3LinkStrength)}static initSimulationForceCharge(t,n){t.theta(n.d3ManyBodyTheta).strength(i=>{const r=i,o=n.d3ManyBodyStrength,s=r.expanded?r.getCircleRadiusCollapsed():r.getLayoutRadius(),a=10+Math.sqrt(Math.max(0,s-10));let l=r.weight??1;return l*=r.isParent?10:1,o*(a*a)/100*l})}static initSimulationForceCollide(t,n){const i=n.d3CollideRadiusMultiplier;t.radius(r=>{const o=r;if(o.expanded)return i*o.getCircleRadius()+20;const s=o.getLayoutRadius();return s?i*s:n.d3CollideRadius}).strength(n.d3CollideStrength)}static initSimulationForceClusterRadialConstraint(t,n){t.strength(n.d3CollideStrength)}update(){this.layout instanceof Ae?this.relayoutStructured():this.layout?(this.layout.update(),Object.assign(this.options.layout,this.layout.getSpacing())):this.scheduleTune();const t=this.graph.getCanvasNodes(),n=this.getActiveEdges();this.heldCanvas!==void 0&&this.heldCanvas!==R.canvasKey(t,n)&&(this.heldCanvas=void 0),this.simulation.nodes(t);const i=this.simulation.force("link");i&&i.id(r=>r.id).links(n),this.restart()}getActiveEdges(){const t=[];for(const n of this.graph.getClusterPulls()){const i=this.graph.getCanvasNode(n.source.id),r=this.graph.getCanvasNode(n.target.id);if(!(i!=null&&i.onCanvas)||!(r!=null&&r.onCanvas))continue;const o=n.reachesInto[0]||n.reachesInto[1];if(n.edge&&!o&&n.edge.from===i&&n.edge.to===r){t.push(n.edge);continue}t.push(this.clusterLink(i,r,n.reachesInto))}return t}clusterLink(t,n,i){const r=(i[0]?t.getCircleRadius():0)+(i[1]?n.getCircleRadius():0);return{id:`cluster-pull-${t.id}-${n.id}`,source:t,target:n,__clusterAnchorDistance:r+this.options.d3LinkDistance}}enable(){this.avgTickDuration=0,this.options.enabled=!0,this.start(!1)}disable(){this.options.enabled=!1,this.stop()}pause(){this.engineRunning=!1,this.slowTickThresholdReached=!1}restart(){this.startSimulationTime=new Date().getTime(),this.runTickCount=0,this.engineRunning=!0,this.slowTickThresholdReached=!1}async start(t=!0){if(t&&(this.heldCanvas=this.options.warmupTicks===0?R.canvasKey(this.graph.getCanvasNodes(),this.getActiveEdges()):void 0,await Promise.resolve(),this.tuneNow({reheat:!1}),await this.runSimulationWorkerRouter()),!this.options.enabled){this.engineRunning=!1;return}this.engineRunning=!0,this.slowTickThresholdReached=!1,this.callbacks.onStart&&this.callbacks.onStart(this),this.animationFrameId===null&&this.startAnimationLoop()}stop(){this.engineRunning=!1,this.autoTuneTimer!==null&&(clearTimeout(this.autoTuneTimer),this.autoTuneTimer=null),this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)}startAnimationLoop(){const t=()=>{this.animationFrameId=requestAnimationFrame(t),this.simulationTick()};this.engineRunning=!0,this.simulation.alpha(.01).restart(),this.animationFrameId=requestAnimationFrame(t)}simulationTick(){if(this.engineRunning){!this.dragInProgress&&this.cooledDown()&&(this.engineRunning=!1,this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)),this.totalTickCount++,this.runTickCount++;const t=performance.now();this.simulation.tick(),this.graph.nextTick(),this.updateTickMetrics(performance.now()-t),this.callbacks.onTick&&this.callbacks.onTick(this),this.graphInteraction.simulationTick(),this.totalTickCount%10===0&&this.graphInteraction.simulationSlowTick()}}cooledDown(){const t=this.options.cooldownTime/1e3*R.NOMINAL_FPS;return this.runTickCount>=t||this.options.d3AlphaMin>0&&this.simulation.alpha()<this.options.d3AlphaMin?!0:new Date().getTime()-this.startSimulationTime>this.options.cooldownTime*R.COOLDOWN_WALL_GRACE}updateTickMetrics(t){var n;this.avgTickDuration=this.avgTickDuration*.9+t*.1,this.avgTickDuration>this.SLOW_TICK_THRESHOLD&&(this.slowTickThresholdReached=!0,this.disable(),this.graph.UIManager.showNotification({level:"warning",title:this.graph.i18n.t("simulation.slow.title"),message:this.graph.i18n.t("simulation.slow.message")}),(n=this.graph.UIManager.physicsFlyout)==null||n.syncRunState())}async waitForSimulationStop(){if(this.engineRunning)return new Promise(t=>{const n=this.callbacks.onStop;this.callbacks.onStop=i=>{n==null||n(i),this.callbacks.onStop=n,t()}})}isEnabled(){return this.options.enabled}applyComputedPositions(t){const n=new Map(t.map(i=>[i.id,i]));for(const i of[...this.graph.getMutableNodes(),...this.graph.simplify.getDrawnGroups()]){const r=n.get(i.id);r&&(i.x=r.x,i.y=r.y,i.fx=typeof r.fx=="number"?r.fx:void 0,i.fy=typeof r.fy=="number"?r.fy:void 0)}}async computeGraph(t={}){const{runSimulation:n}=await Promise.resolve().then(function(){return Ru}),i=this.containerBCR,r=this.graph.getMutableNodes(),o=[...this.graph.getNodes().filter(u=>{var p;return!((p=this.graph.getMutableNode(u.id))!=null&&p.foldedInto)}),...this.graph.simplify.getDrawnGroups()],s=[...this.graph.getEdges(),...this.graph.getDrawnEdges().filter(u=>u.isSynthetic)],{callbacks:a,...l}=this.options;Object.assign(l,t);const{nodes:c}=n(o,s,l,i,this.openGroupMemberIds());this.applyComputedPositions(c),this.graph.updateData(r,void 0,!1)}async runSimulationWorkerRouter(t={}){if(this.layout instanceof Ae){this.relayoutStructured(),this.graph.updateLayoutProgress(100,0,"done");return}if(this.options.useWorker)try{await this.runSimulationWorker(t);return}catch(n){this.options.useWorker=!1,console.warn("[Pivotick] Simulation Web Worker unavailable (often a CSP blocking blob workers); falling back to the main thread. Set `simulation.useWorker: false` to silence this.",n)}await this.computeGraph(t),this.graph.updateLayoutProgress(100,0,"done")}async runSimulationWorker(t={}){const n=this.containerBCR,i=this.graph.getMutableNodes(),r=[...this.graph.getNodes().filter(p=>{var f;return!((f=this.graph.getMutableNode(p.id))!=null&&f.foldedInto)}),...this.graph.simplify.getDrawnGroups()].map(p=>p.toSimulationDTO()),o=this.graph.getDrawnEdges().filter(p=>p.isSynthetic),s=[...this.graph.getEdges(),...o].map(p=>p.toSimulationDTO()),a=(p,f)=>{this.graph.updateLayoutProgress(p,f,"simulation")},{callbacks:l,...c}=this.options;Object.assign(c,t);const{nodes:u}=await Ec(r,s,c,n,a,this.openGroupMemberIds());this.graph.updateLayoutProgress(100,0,"rendering"),this.applyComputedPositions(u),this.graph.updateData(i,void 0,!1),this.graph.updateLayoutProgress(100,0,"done")}openGroupMemberIds(){return this.graph.simplify.getOpenGroupNodes().map(t=>t.parts.filter(n=>n.canvasRepresentative()===n&&n.onCanvas).map(n=>n.id))}reheat(t=.7){this.restart(),this.simulation.alpha(t).restart()}refreshForcesAndReheat(t=.5){if(this.layout instanceof Ae&&(this.relayoutStructured(),this.graph.nextTick()),!this.options.enabled)return;this.tuneNow({reheat:!1});const n=this.graph.getCanvasNodes();this.simulation.nodes(n),this.reheat(t)}setRepulsion(t){const n=R.clamp(t,ct.repulsion);this.physicsKnobs.repulsion=n,this.options.d3ManyBodyStrength=R.mapLinear(n,ct.repulsion,R.REPULSION_STRENGTH_RANGE),this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength,R.initSimulationForceCharge(this.simulationForces.charge,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setLinkDistance(t){const n=R.clamp(t,ct.linkDistance);this.physicsKnobs.linkDistance=n,this.options.d3LinkDistance=R.mapLinear(n,ct.linkDistance,R.LINK_DISTANCE_RANGE),R.initSimulationForceLink(this.simulationForces.link,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setCollisionRadius(t){const n=R.clamp(t,ct.collisionRadius);this.physicsKnobs.collisionRadius=n,this.options.d3CollideRadiusMultiplier=R.mapLinear(n,ct.collisionRadius,R.COLLIDE_MULTIPLIER_RANGE),R.initSimulationForceCollide(this.simulationForces.collide,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setFriction(t){const n=R.clamp(t,ct.friction);this.physicsKnobs.friction=n,this.options.d3VelocityDecay=R.mapLinear(n,ct.friction,R.FRICTION_DECAY_RANGE),this.simulation.velocityDecay(this.options.d3VelocityDecay),this.noteManualKnobEdit()}setCentering(t){const n=R.clamp(t,ct.centering);this.physicsKnobs.centering=n,this.options.d3GravityStrengthConnected=R.gravityForCentering(n),this.options.d3GravityStrength=R.isolatedGravityFor(this.options.d3GravityStrengthConnected),R.initSimulationForceGravity(this.simulationForces.gravity,this.options,this.containerBCR),this.noteManualKnobEdit(),this.reheatIfEnabled()}setSettleTime(t){const n=R.clamp(t,ct.settleTime);this.physicsKnobs.settleTime=n,this.options.d3AlphaDecay=R.alphaDecayForSettleTime(n,this.options.d3AlphaMin),this.options.cooldownTime=n*1e3,this.simulation.alphaDecay(this.options.d3AlphaDecay),this.noteManualKnobEdit()}applyPhysicsPreset(t){this.disableAutoPhysics(),this.writeKnobs(xu[t]),this.reheatIfEnabled(R.CLICK_REHEAT_ALPHA)}writeKnobs(t){this.physicsKnobs={...t},this.options.d3ManyBodyStrength=R.mapLinear(t.repulsion,ct.repulsion,R.REPULSION_STRENGTH_RANGE),this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength,this.options.d3LinkDistance=R.mapLinear(t.linkDistance,ct.linkDistance,R.LINK_DISTANCE_RANGE),this.options.d3CollideRadiusMultiplier=R.mapLinear(t.collisionRadius,ct.collisionRadius,R.COLLIDE_MULTIPLIER_RANGE),this.options.d3VelocityDecay=R.mapLinear(t.friction,ct.friction,R.FRICTION_DECAY_RANGE),this.options.d3GravityStrengthConnected=R.gravityForCentering(t.centering),this.options.d3GravityStrength=R.isolatedGravityFor(this.options.d3GravityStrengthConnected),this.options.d3AlphaDecay=R.alphaDecayForSettleTime(t.settleTime,this.options.d3AlphaMin),this.options.cooldownTime=t.settleTime*1e3,R.initSimulationForceCharge(this.simulationForces.charge,this.options),R.initSimulationForceLink(this.simulationForces.link,this.options),R.initSimulationForceCollide(this.simulationForces.collide,this.options),R.initSimulationForceGravity(this.simulationForces.gravity,this.options,this.containerBCR),this.simulation.velocityDecay(this.options.d3VelocityDecay),this.simulation.alphaDecay(this.options.d3AlphaDecay)}getPhysicsKnobs(){return{...this.physicsKnobs}}getLayoutType(){return this.options.layout.type}get treeLayout(){return this.layout instanceof X?this.layout:void 0}relayoutStructured(){if(!(this.layout instanceof Ae))return;const t=this.layout.update().filter(n=>n.getGraphElement());t.length&&(t.forEach(n=>n.markDirty()),this.graph.renderer.update(!1))}createStructuredLayout(t){return new Ae(this.graph,this.simulation,this.simulationForces,t,()=>this.getActiveEdges())}getLabelSide(t){return this.layout instanceof Ae?this.layout.getLabelSide(t):void 0}getTreeSpacing(){var t;return((t=this.treeLayout)==null?void 0:t.getSpacing())??{...Eu}}setTreeSpacing(t){const n=this.treeLayout;if(!n)return;const i={};t.levelSpacing!==void 0&&(i.levelSpacing=R.clamp(t.levelSpacing,bn)),t.siblingSpacing!==void 0&&(i.siblingSpacing=R.clamp(t.siblingSpacing,bn)),n.setSpacing(i),Object.assign(this.options.layout,i,{spacing:"manual"}),this.graph.nextTick(),this.reheatIfEnabled()}getTreeRoot(){var t;return((t=this.treeLayout)==null?void 0:t.getRoot())??{algorithm:Au}}setTreeRoot(t){const n=this.treeLayout;if(!n)return;n.setRoot(t);const i=n.getRoot();Object.assign(this.options.layout,{rootId:i.rootId,rootIdAlgorithmFinder:i.algorithm}),this.graph.nextTick(),this.reheatIfEnabled()}isAutoTreeSpacingEnabled(){var t;return((t=this.treeLayout)==null?void 0:t.isAutoSpacing())??!1}enableAutoTreeSpacing(){const t=this.treeLayout;t&&(t.enableAutoSpacing(),Object.assign(this.options.layout,{spacing:"auto"}),this.graph.nextTick(),this.reheatIfEnabled())}reheatIfEnabled(t=.5){this.suppressReheat||this.options.enabled&&this.reheat(t)}static clamp(t,[n,i]){return Math.max(n,Math.min(i,t))}static mapLinear(t,n,i){const r=(t-n[0])/(n[1]-n[0]);return i[0]+r*(i[1]-i[0])}static knobsFromOptions(t){const n=(r,o,s)=>Math.round(R.clamp(R.mapLinear(r,o,ct[s]),ct[s])),i=R.settleTimeFromAlphaDecay(t.d3AlphaDecay,t.d3AlphaMin);return{repulsion:n(t.d3ManyBodyStrength,R.REPULSION_STRENGTH_RANGE,"repulsion"),linkDistance:n(t.d3LinkDistance,R.LINK_DISTANCE_RANGE,"linkDistance"),collisionRadius:n(t.d3CollideRadiusMultiplier,R.COLLIDE_MULTIPLIER_RANGE,"collisionRadius"),friction:n(t.d3VelocityDecay,R.FRICTION_DECAY_RANGE,"friction"),centering:Math.round(R.clamp(R.centeringFromGravity(t.d3GravityStrengthConnected),ct.centering)),settleTime:Math.round(R.clamp(i,ct.settleTime)*10)/10}}static gravityForCentering(t){const n=t/ct.centering[1];return R.CENTERING_STRENGTH_MAX*n*n}static centeringFromGravity(t){const n=Math.sqrt(Math.max(0,t)/R.CENTERING_STRENGTH_MAX);return ct.centering[1]*n}static isolatedGravityFor(t){const[n,i]=R.CENTERING_ISOLATED_RANGE;return Math.max(n,Math.min(i,t*R.CENTERING_ISOLATED_MULTIPLE))}static alphaDecayForSettleTime(t,n){const i=Math.max(1,t*R.NOMINAL_FPS),r=Math.min(.999,Math.max(1e-6,n));return 1-Math.pow(r,1/i)}static settleTimeFromAlphaDecay(t,n){const i=Math.min(.999,Math.max(1e-6,n)),r=Math.min(.999,Math.max(1e-6,t));return Math.log(i)/Math.log(1-r)/R.NOMINAL_FPS}static shouldAutoTune(t){return t.physics==="auto"?!0:t.physics==="manual"?!1:!R.AUTO_OWNED_OPTIONS.some(n=>t[n]!==void 0)}isAutoPhysicsEnabled(){return this.autoEnabled}enableAutoPhysics(){this.autoEnabled=!0,this.tuneNow({alpha:R.CLICK_REHEAT_ALPHA,force:!0})}disableAutoPhysics(){this.autoEnabled=!1,this.autoTuneTimer!==null&&(clearTimeout(this.autoTuneTimer),this.autoTuneTimer=null)}getAutoRun(){return this.autoLastRun}noteManualKnobEdit(){this.applyingAutoKnobs||this.disableAutoPhysics()}scheduleTune(){this.autoEnabled&&(this.autoTuneTimer!==null&&clearTimeout(this.autoTuneTimer),this.autoTuneTimer=setTimeout(()=>{this.autoTuneTimer=null,this.tuneNow({reheat:this.heldCanvas===void 0})},R.AUTO_DEBOUNCE_MS))}static canvasKey(t,n){return`${t.map(i=>i.id).join(`\n`)}\n|\n${n.map(i=>i.id).join(`\n`)}`}tuneNow(t={}){var c;const{reheat:n=!0,alpha:i=R.AUTO_REHEAT_ALPHA,force:r=!1}=t;if(!this.autoEnabled||this.options.layout.type!=="force")return;const o=this.buildAutoContext();if(o.nodeCount===0)return;const s=Su(o),l=Object.keys(s).every(u=>{const[p,f]=ct[u];return Math.abs(s[u]-this.physicsKnobs[u])<=(f-p)*R.AUTO_DEADBAND})&&!r;if(this.autoLastRun={context:o,knobs:l?this.getPhysicsKnobs():s,skipped:l},!l){this.applyingAutoKnobs=!0,this.suppressReheat=!0;try{this.writeKnobs(s)}finally{this.suppressReheat=!1,this.applyingAutoKnobs=!1}n&&this.reheatIfEnabled(i),(c=this.graph.UIManager.physicsFlyout)==null||c.syncAutoKnobs(this.getPhysicsKnobs())}}buildAutoContext(){const t=this.containerBCR,n=this.graph.getCanvasNodes(),i=this.getActiveEdges();let r=0,o=0,s=0;for(const l of n){const c=l.expanded?l.getCircleRadiusCollapsed():l.getLayoutRadius();r+=c,o=Math.max(o,c),s+=Math.PI*c*c}const a=vu(n.map(l=>l.id),i.map(l=>[l.source.id,l.target.id]));return{canvas:{width:t.width,height:t.height},nodeCount:n.length,radii:{mean:n.length?r/n.length:0,max:o,totalArea:s},edgeCount:i.length,componentCount:a.count,looseNodeFraction:a.looseNodeFraction,current:this.getPhysicsKnobs()}}createDragBehavior(){return qi().filter(()=>!this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement",(t,n)=>{this.graphInteraction.hasActiveMultiselection()?this.dragSelection=this.graphInteraction.getSelectedNodes().map(i=>{const{node:r}=i;return r.freeze(),{node:r,dx:r.x-n.x,dy:r.y-n.y}}):(this.dragSelection=[],n.freeze())}).on("drag.draggedelement",(t,n)=>{if(this.reheatForDrag(),this.graphInteraction.hasActiveMultiselection())this.moveDragSelection(t.x,t.y);else{const i=this.applySnap(t.x),r=this.applySnap(t.y);n.fx=i,n.fy=r,n.x=i,n.y=r}if(this.graphInteraction.dragging(t.sourceEvent,t.subject),!this.engineRunning||!this.isEnabled()){const i=this.graphInteraction.hasActiveMultiselection()?this.dragSelection.map(r=>r.node):[n];this.graph.nextTickFor(i)}}).on("end.draggedelement",(t,n)=>{this.coolAfterDrag(t.active),this.options.freezeNodesOnDrag||(this.graphInteraction.hasActiveMultiselection()?(this.dragSelection.forEach(({node:i})=>i.unfreeze()),this.dragSelection=[]):n.unfreeze()),this.graphInteraction.dragended(t.sourceEvent,t.subject)})}createMembersDragBehavior(t){let n;return qi().filter(i=>!i.button&&!this.graph.editing.connectManager.isActiveAndNotIdle()).subject(()=>(n=t()[0],{x:(n==null?void 0:n.x)??0,y:(n==null?void 0:n.y)??0})).on("start",i=>{this.dragSelection=t().map(r=>(r.freeze(),{node:r,dx:r.x-i.subject.x,dy:r.y-i.subject.y}))}).on("drag",i=>{n&&(this.reheatForDrag(),this.moveDragSelection(i.x,i.y),this.graphInteraction.dragging(i.sourceEvent,n),(!this.engineRunning||!this.isEnabled())&&this.graph.nextTickFor(this.dragSelection.map(({node:r})=>r)))}).on("end",i=>{this.coolAfterDrag(i.active),this.options.freezeNodesOnDrag||this.dragSelection.forEach(({node:r})=>r.unfreeze()),this.dragSelection=[],n&&this.graphInteraction.dragended(i.sourceEvent,n),n=void 0})}reheatForDrag(){this.dragInProgress||!this.isEnabled()||(this.dragInProgress=!0,this.restart(),this.simulation.alphaTarget(.3).restart())}coolAfterDrag(t){t||!this.dragInProgress||(this.dragInProgress=!1,this.restart(),this.simulation.alphaTarget(this.options.d3AlphaTarget).restart())}moveDragSelection(t,n){this.dragSelection.forEach(({node:i,dx:r,dy:o})=>{const s=this.applySnap(t+r),a=this.applySnap(n+o);i.fx=s,i.fy=a,i.x=s,i.y=a})}isDragging(){return this.dragInProgress}toggleGridSnapping(){this.options.gridSnappingEnabled=!this.options.gridSnappingEnabled}toggleFreezeNodesOnDrag(){this.options.freezeNodesOnDrag=!this.options.freezeNodesOnDrag}isFreezeNodesOnDrag(){return this.options.freezeNodesOnDrag}isGridSnappingEnabled(){return this.options.gridSnappingEnabled}toggleFitViewOnExpandCollapse(){this.options.fitViewOnExpandCollapse=!this.options.fitViewOnExpandCollapse}isFitViewOnExpandCollapse(){return this.options.fitViewOnExpandCollapse}applySnap(t){return this.options.gridSnappingEnabled?Math.round(t/this.options.gridSize)*this.options.gridSize:t}snapToGrid(t){return this.applySnap(t)}getForceSimulation(){return this.simulationForces}getSimulation(){return this.simulation}async changeLayout(t,n={}){var i;this.layout&&((i=this.layout)==null||i.unregisterLayout(),this.layout=void 0),n=n??{},n.layout=n.layout??{},n.layout.type=t,t==="force"?(R.initSimulationForceCharge(this.simulationForces.charge,this.options),R.initSimulationForceCollide(this.simulationForces.collide,this.options)):t==="tree"?this.layout=new X(this.graph,this.simulation,this.simulationForces,n.layout):t==="structured"&&(this.layout=this.createStructuredLayout(n.layout)),this.options.layout.type=t,this.update(),this.pause(),await this.runSimulationWorkerRouter(n),this.options.enabled?(this.restart(),await this.waitForSimulationStop()):this.graph.nextTick(),this.graph.renderer.fitAndCenterWhenSettled()}};M(R,"REPULSION_STRENGTH_RANGE",[0,-400]),M(R,"LINK_DISTANCE_RANGE",[40,600]),M(R,"COLLIDE_MULTIPLIER_RANGE",[.6,2.4]),M(R,"FRICTION_DECAY_RANGE",[0,1]),M(R,"CENTERING_STRENGTH_MAX",.2),M(R,"CENTERING_ISOLATED_MULTIPLE",4),M(R,"CENTERING_ISOLATED_RANGE",[.1,.3]),M(R,"AUTO_OWNED_OPTIONS",["d3LinkDistance","d3ManyBodyStrength","d3CollideRadiusMultiplier","d3VelocityDecay","d3GravityStrength","d3GravityStrengthConnected","d3AlphaDecay","cooldownTime"]),M(R,"AUTO_DEBOUNCE_MS",150),M(R,"AUTO_DEADBAND",.04),M(R,"AUTO_REHEAT_ALPHA",.3),M(R,"CLICK_REHEAT_ALPHA",1),M(R,"NOMINAL_FPS",60),M(R,"COOLDOWN_WALL_GRACE",4),M(R,"FALLBACK_CONTAINER_SIZE",{width:1e3,height:800});let Tn=R;const $r=1e4,Xr=2e4,Yr=.15*Xr;self.onmessage=e=>{if(e.data.source===vc){const{graph:t,resolutions:n}=e.data;postMessage({type:"done",levels:Sc(t,n)});return}e.data.source==="simulation-worker-wrapper"&&Mu(e.data)};function Mu(e){var T,_,x;const{nodes:t,edges:n,options:i,canvasBCR:r,groups:o=[]}=e,s=t.map(m=>{const I=new Tr(m.id,m.data,m.style);return I.setCircleRadius(m._circleRadius??10),I.setLayoutSize(m._layoutSize),typeof m.x=="number"&&(I.x=m.x),typeof m.y=="number"&&(I.y=m.y),typeof m.fx=="number"&&(I.fx=m.fx),typeof m.fy=="number"&&(I.fy=m.fy),I}),a=new Map(s.map(m=>[m.id,m])),{simulation:l,simulationForces:c}=Tn.initSimulationForces(i,r),u=[];for(const m of n){const I=a.get(m.from.id),D=a.get(m.to.id);if(I&&D){const G=m.style??{};u.push(new Qt(m.id,I,D,m.data,G,m.directed))}}l.nodes(s);const p=l.force("link");p&&p.id(m=>m.id).links(u),qr(l,o,a),((T=i.layout)==null?void 0:T.type)==="tree"?X.registerForcesOnSimulation(s,u,l,c,i.layout,r,X):((_=i.layout)==null?void 0:_.type)==="egoTree"&&X.registerForcesOnSimulation(s,u,l,c,i.layout,r,ue);const{warmupTicks:f,reheatTicks:g}=Zr(i);let S=.3;l.alphaTarget(S);const b=new Date().getTime();let y;for(let m=0;m<f&&!(new Date().getTime()-b>$r||new Date().getTime()-b>i.cooldownTime||Sn(i,l,S)&&new Date().getTime()-b>i.cooldownTime*.15);++m)m%5===0&&(y=Jr(m,new Date().getTime()-b,i),postMessage({type:"tick",progress:y,elapsedTime:new Date().getTime()-b})),l.tick();S=0,l.alphaTarget(S),l.alpha(1);for(let m=0;m<g&&!(Sn(i,l,S)&&new Date().getTime()-b>i.cooldownTime*.15);++m)l.tick(),m%5===0&&(y=Jr(f+m,new Date().getTime()-b,i),postMessage({type:"tick",progress:y,elapsedTime:new Date().getTime()-b}));postMessage({type:"tick",progress:1,elapsedTime:new Date().getTime()-b}),((x=i.layout)==null?void 0:x.type)==="tree"&&X.simulationDone(s,u,l,i.layout),postMessage({type:"done",nodes:s.map(m=>m.toDict()),edges:u.map(m=>m.toDict())})}function Iu(e,t,n,i,r=[]){var b,y,T;const o=e.map(_=>{const x=new Tr(_.id,_.getData(),_.getStyle());return x.weight=_.weight||1,x.setCircleRadius(_.getCircleRadius()),typeof _.x=="number"&&(x.x=_.x),typeof _.y=="number"&&(x.y=_.y),typeof _.fx=="number"&&(x.fx=_.fx),typeof _.fy=="number"&&(x.fy=_.fy),x}),s=new Map(o.map(_=>[_.id,_])),{simulation:a,simulationForces:l}=Tn.initSimulationForces(n,i),c=[];for(const _ of t){const x=s.get(_.from.id),m=s.get(_.to.id);if(x&&m){const I=_.getStyle()??{};c.push(new Qt(_.id,x,m,_.getData(),I,_.directed))}}a.nodes(o);const u=a.force("link");u&&u.id(_=>_.id).links(c),qr(a,r,s),(((b=n.layout)==null?void 0:b.type)==="tree"||((y=n.layout)==null?void 0:y.type)==="egoTree")&&X.registerForcesOnSimulation(o,c,a,l,n.layout,i,X);const{warmupTicks:p,reheatTicks:f}=Zr(n);let g=.3;a.alphaTarget(g);const S=new Date().getTime();for(let _=0;_<p&&!(new Date().getTime()-S>$r||new Date().getTime()-S>n.cooldownTime||Sn(n,a,g)&&new Date().getTime()-S>n.cooldownTime*.15);++_)a.tick();g=0,a.alphaTarget(g),a.alpha(1);for(let _=0;_<f&&!(Sn(n,a,g)&&new Date().getTime()-S>n.cooldownTime*.15);++_)a.tick();return((T=n.layout)==null?void 0:T.type)==="tree"&&X.simulationDone(o,c,a,n.layout),{nodes:o,edges:c}}function qr(e,t,n){const i=t.map(r=>({parts:r.map(o=>n.get(o)).filter(o=>o!==void 0)})).filter(r=>r.parts.length>1);i.length&&e.force("groupCohesion",Zi(()=>i))}function Zr(e){const t=e.warmupTicks==="auto"||e.warmupTicks==null?Xr:e.warmupTicks;return t<=0?{warmupTicks:0,reheatTicks:0}:{warmupTicks:t-Yr,reheatTicks:Yr}}function Jr(e,t,n){return t/n.cooldownTime}function Sn(e,t,n){return e.d3AlphaMin>0&&t.alpha()-n<e.d3AlphaMin}var Ru=Object.freeze({__proto__:null,runSimulation:Iu})})();\n', er = typeof self < "u" && self.Blob && new Blob([Zr], { type: "text/javascript;charset=utf-8" });
function Fc(e) {
  let t;
  try {
    if (t = er && (self.URL || self.webkitURL).createObjectURL(er), !t) throw "";
    const n = new Worker(t, { name: e == null ? void 0 : e.name });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), n;
  } catch {
    return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(Zr), { name: e == null ? void 0 : e.name });
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
const gi = 1e-12, Pc = 32;
function zc(e) {
  let t = e >>> 0;
  return () => {
    t = t + 1831565813 >>> 0;
    let n = t;
    return n = Math.imul(n ^ n >>> 15, n | 1), n ^= n + Math.imul(n ^ n >>> 7, n | 61), ((n ^ n >>> 14) >>> 0) / 4294967296;
  };
}
function Jr(e, t) {
  const n = Array.from({ length: e }, (i, r) => r);
  for (let i = e - 1; i > 0; i--) {
    const r = Math.floor(t() * (i + 1)), o = n[i];
    n[i] = n[r], n[r] = o;
  }
  return n;
}
function Gc(e) {
  const t = Array.from({ length: e.nodeCount }, () => /* @__PURE__ */ new Map());
  for (let o = 0; o + 1 < e.edges.length; o += 2) {
    const s = e.edges[o], a = e.edges[o + 1];
    s !== a && (t[s].set(a, (t[s].get(a) ?? 0) + 1), t[a].set(s, (t[a].get(s) ?? 0) + 1));
  }
  const n = new Float64Array(e.nodeCount);
  let i = 0;
  return { adjacency: t.map((o, s) => {
    const a = [...o].sort((l, c) => l[0] - c[0]);
    for (const [, l] of a) n[s] += l;
    return i += n[s], a;
  }), strength: n, total: i };
}
function Bc(e, t, n, i) {
  const r = t.length, o = new Float64Array(r), s = new Int32Array(r);
  for (let p = 0; p < r; p++)
    o[t[p]] += e.strength[p], s[t[p]]++;
  const a = [];
  for (let p = r - 1; p >= 0; p--) s[p] === 0 && a.push(p);
  const l = new Float64Array(r), c = [], u = Jr(r, i), g = new Uint8Array(r).fill(1);
  let f = !1;
  for (let p = 0; p < u.length; p++) {
    const S = u[p];
    g[S] = 0;
    const b = t[S], y = e.strength[S];
    for (const [E, m] of e.adjacency[S]) {
      const I = t[E];
      l[I] === 0 && c.push(I), l[I] += m;
    }
    o[b] -= y, s[b]--;
    let w = b, v = l[b] - n * y * o[b] / e.total;
    for (const E of c) {
      const m = l[E] - n * y * o[E] / e.total;
      m > v + gi && (w = E, v = m);
    }
    v < -gi && s[b] > 0 && a.length > 0 && (w = a.pop());
    for (const E of c) l[E] = 0;
    if (c.length = 0, o[w] += y, s[w]++, t[S] = w, s[b] === 0 && a.push(b), w !== b) {
      f = !0;
      for (const [E] of e.adjacency[S])
        t[E] !== w && !g[E] && (g[E] = 1, u.push(E));
    }
  }
  return f;
}
function jc(e, t, n, i) {
  const r = t.length, o = Int32Array.from({ length: r }, (p, S) => S), s = Float64Array.from(e.strength), a = new Int32Array(r).fill(1), l = new Float64Array(r), c = new Float64Array(r);
  for (let p = 0; p < r; p++) c[t[p]] += e.strength[p];
  const u = new Float64Array(r);
  for (let p = 0; p < r; p++) {
    for (const [S, b] of e.adjacency[p])
      t[S] === t[p] && (u[p] += b);
    l[p] = u[p];
  }
  const g = new Float64Array(r), f = [];
  for (const p of Jr(r, i)) {
    if (a[o[p]] !== 1) continue;
    const S = t[p], b = e.strength[p];
    if (u[p] < n * b * (c[S] - b) / e.total) continue;
    for (const [v, E] of e.adjacency[p]) {
      if (t[v] !== S) continue;
      const m = o[v];
      g[m] === 0 && f.push(m), g[m] += E;
    }
    let y = -1, w = gi;
    for (const v of f) {
      if (!(l[v] >= n * s[v] * (c[S] - s[v]) / e.total)) continue;
      const m = g[v] - n * b * s[v] / e.total;
      m > w && (y = v, w = m);
    }
    if (y !== -1) {
      const v = o[p];
      l[y] = l[y] + u[p] - 2 * g[y], s[y] += b, a[y]++, s[v] = 0, a[v] = 0, o[p] = y;
    }
    for (const v of f) g[v] = 0;
    f.length = 0;
  }
  return o;
}
function ei(e) {
  const t = /* @__PURE__ */ new Map(), n = new Int32Array(e.length);
  for (let i = 0; i < e.length; i++) {
    let r = t.get(e[i]);
    r === void 0 && (r = t.size, t.set(e[i], r)), n[i] = r;
  }
  return { ids: n, count: t.size };
}
function Uc(e, t, n) {
  const i = Array.from({ length: n }, () => /* @__PURE__ */ new Map()), r = new Float64Array(n);
  for (let s = 0; s < t.length; s++) {
    const a = t[s];
    r[a] += e.strength[s];
    for (const [l, c] of e.adjacency[s]) {
      const u = t[l];
      u !== a && i[a].set(u, (i[a].get(u) ?? 0) + c);
    }
  }
  return { adjacency: i.map((s) => [...s].sort((a, l) => a[0] - l[0])), strength: r, total: e.total };
}
function Hc(e, t = 1, n = 1) {
  let i = Gc(e);
  const r = Int32Array.from({ length: e.nodeCount }, (l, c) => c);
  if (i.total === 0) return r;
  const o = zc(n);
  let s = Int32Array.from({ length: e.nodeCount }, (l, c) => c), a = Int32Array.from({ length: e.nodeCount }, (l, c) => c);
  for (let l = 0; l < Pc; l++) {
    Bc(i, a, t, o);
    const c = ei(a);
    if (a = c.ids, c.count === a.length) break;
    const u = ei(jc(i, a, t, o));
    if (u.count === a.length) break;
    const g = new Int32Array(u.count);
    for (let f = 0; f < a.length; f++) g[u.ids[f]] = a[f];
    s = s.map((f) => u.ids[f]), i = Uc(i, u.ids, u.count), a = g;
  }
  for (let l = 0; l < e.nodeCount; l++) r[l] = a[s[l]];
  return ei(r).ids;
}
const Wc = [3, 2, 1.4, 1, 0.7, 0.45, 0.25];
function Kc(e, t = Wc, n = 1) {
  return t.map((i) => Hc(e, i, n));
}
const Vc = "pivotick-communities";
function $c() {
  return new Fc();
}
const qc = (e, t, n, i, r, o = []) => new Promise((s, a) => {
  const l = $c();
  l.postMessage({ source: "simulation-worker-wrapper", nodes: e, edges: t, options: n, canvasBCR: i, groups: o }), l.onmessage = (c) => {
    const { type: u, progress: g, nodes: f, edges: p, elapsedTime: S } = c.data;
    if (u === "tick" && typeof g == "number") {
      r == null || r(g, S);
      return;
    }
    u === "done" && (s({ nodes: f, edges: p }), l.terminate());
  }, l.onerror = a;
});
var bn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Yc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ye = { exports: {} };
Ye.exports;
var nr;
function Xc() {
  return nr || (nr = 1, (function(e, t) {
    var n = 200, i = "__lodash_hash_undefined__", r = 800, o = 16, s = 9007199254740991, a = "[object Arguments]", l = "[object Array]", c = "[object AsyncFunction]", u = "[object Boolean]", g = "[object Date]", f = "[object Error]", p = "[object Function]", S = "[object GeneratorFunction]", b = "[object Map]", y = "[object Number]", w = "[object Null]", v = "[object Object]", E = "[object Proxy]", m = "[object RegExp]", I = "[object Set]", D = "[object String]", G = "[object Undefined]", x = "[object WeakMap]", R = "[object ArrayBuffer]", F = "[object DataView]", B = "[object Float32Array]", Q = "[object Float64Array]", C = "[object Int8Array]", L = "[object Int16Array]", W = "[object Int32Array]", V = "[object Uint8Array]", O = "[object Uint8ClampedArray]", j = "[object Uint16Array]", Z = "[object Uint32Array]", lt = /[\\^$.*+?()[\]{}|]/g, gt = /^\[object .+?Constructor\]$/, it = /^(?:0|[1-9]\d*)$/, H = {};
    H[B] = H[Q] = H[C] = H[L] = H[W] = H[V] = H[O] = H[j] = H[Z] = !0, H[a] = H[l] = H[R] = H[u] = H[F] = H[g] = H[f] = H[p] = H[b] = H[y] = H[v] = H[m] = H[I] = H[D] = H[x] = !1;
    var X = typeof bn == "object" && bn && bn.Object === Object && bn, Zt = typeof self == "object" && self && self.Object === Object && self, tt = X || Zt || Function("return this")(), Jt = t && !t.nodeType && t, U = Jt && !0 && e && !e.nodeType && e, yt = U && U.exports === Jt, Qt = yt && X.process, Dt = (function() {
      try {
        var h = U && U.require && U.require("util").types;
        return h || Qt && Qt.binding && Qt.binding("util");
      } catch {
      }
    })(), Ie = Dt && Dt.isTypedArray;
    function Ne(h, _, T) {
      switch (T.length) {
        case 0:
          return h.call(_);
        case 1:
          return h.call(_, T[0]);
        case 2:
          return h.call(_, T[0], T[1]);
        case 3:
          return h.call(_, T[0], T[1], T[2]);
      }
      return h.apply(_, T);
    }
    function nn(h, _) {
      for (var T = -1, z = Array(h); ++T < h; )
        z[T] = _(T);
      return z;
    }
    function rn(h) {
      return function(_) {
        return h(_);
      };
    }
    function Ft(h, _) {
      return h == null ? void 0 : h[_];
    }
    function ae(h, _) {
      return function(T) {
        return h(_(T));
      };
    }
    var Ht = Array.prototype, Re = Function.prototype, te = Object.prototype, Pt = tt["__core-js_shared__"], Wt = Re.toString, Tt = te.hasOwnProperty, Ce = (function() {
      var h = /[^.]+$/.exec(Pt && Pt.keys && Pt.keys.IE_PROTO || "");
      return h ? "Symbol(src)_1." + h : "";
    })(), De = te.toString, on = Wt.call(Object), Oe = RegExp("^" + Wt.call(Tt).replace(lt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), zt = yt ? tt.Buffer : void 0, Kt = tt.Symbol, At = tt.Uint8Array;
    zt && zt.allocUnsafe;
    var pe = ae(Object.getPrototypeOf, Object), ke = Object.create, sn = te.propertyIsEnumerable, Le = Ht.splice, Gt = Kt ? Kt.toStringTag : void 0, Vt = (function() {
      try {
        var h = jn(Object, "defineProperty");
        return h({}, "", {}), h;
      } catch {
      }
    })(), ge = zt ? zt.isBuffer : void 0, xt = Math.max, ee = Date.now, me = jn(tt, "Map"), $t = jn(Object, "create"), Ln = /* @__PURE__ */ (function() {
      function h() {
      }
      return function(_) {
        if (!he(_))
          return {};
        if (ke)
          return ke(_);
        h.prototype = _;
        var T = new h();
        return h.prototype = void 0, T;
      };
    })();
    function Ot(h) {
      var _ = -1, T = h == null ? 0 : h.length;
      for (this.clear(); ++_ < T; ) {
        var z = h[_];
        this.set(z[0], z[1]);
      }
    }
    function Fe() {
      this.__data__ = $t ? $t(null) : {}, this.size = 0;
    }
    function Fn(h) {
      var _ = this.has(h) && delete this.__data__[h];
      return this.size -= _ ? 1 : 0, _;
    }
    function ce(h) {
      var _ = this.__data__;
      if ($t) {
        var T = _[h];
        return T === i ? void 0 : T;
      }
      return Tt.call(_, h) ? _[h] : void 0;
    }
    function Pn(h) {
      var _ = this.__data__;
      return $t ? _[h] !== void 0 : Tt.call(_, h);
    }
    function zn(h, _) {
      var T = this.__data__;
      return this.size += this.has(h) ? 0 : 1, T[h] = $t && _ === void 0 ? i : _, this;
    }
    Ot.prototype.clear = Fe, Ot.prototype.delete = Fn, Ot.prototype.get = ce, Ot.prototype.has = Pn, Ot.prototype.set = zn;
    function et(h) {
      var _ = -1, T = h == null ? 0 : h.length;
      for (this.clear(); ++_ < T; ) {
        var z = h[_];
        this.set(z[0], z[1]);
      }
    }
    function ne() {
      this.__data__ = [], this.size = 0;
    }
    function Gn(h) {
      var _ = this.__data__, T = ue(_, h);
      if (T < 0)
        return !1;
      var z = _.length - 1;
      return T == z ? _.pop() : Le.call(_, T, 1), --this.size, !0;
    }
    function an(h) {
      var _ = this.__data__, T = ue(_, h);
      return T < 0 ? void 0 : _[T][1];
    }
    function Pe(h) {
      return ue(this.__data__, h) > -1;
    }
    function cn(h, _) {
      var T = this.__data__, z = ue(T, h);
      return z < 0 ? (++this.size, T.push([h, _])) : T[z][1] = _, this;
    }
    et.prototype.clear = ne, et.prototype.delete = Gn, et.prototype.get = an, et.prototype.has = Pe, et.prototype.set = cn;
    function qt(h) {
      var _ = -1, T = h == null ? 0 : h.length;
      for (this.clear(); ++_ < T; ) {
        var z = h[_];
        this.set(z[0], z[1]);
      }
    }
    function Bn() {
      this.size = 0, this.__data__ = { hash: new Ot(), map: new (me || et)(), string: new Ot() };
    }
    function Et(h) {
      var _ = mn(this, h).delete(h);
      return this.size -= _ ? 1 : 0, _;
    }
    function Yt(h) {
      return mn(this, h).get(h);
    }
    function ln(h) {
      return mn(this, h).has(h);
    }
    function un(h, _) {
      var T = mn(this, h), z = T.size;
      return T.set(h, _), this.size += T.size == z ? 0 : 1, this;
    }
    qt.prototype.clear = Bn, qt.prototype.delete = Et, qt.prototype.get = Yt, qt.prototype.has = ln, qt.prototype.set = un;
    function Xt(h) {
      var _ = this.__data__ = new et(h);
      this.size = _.size;
    }
    function ye() {
      this.__data__ = new et(), this.size = 0;
    }
    function le(h) {
      var _ = this.__data__, T = _.delete(h);
      return this.size = _.size, T;
    }
    function ve(h) {
      return this.__data__.get(h);
    }
    function kt(h) {
      return this.__data__.has(h);
    }
    function hn(h, _) {
      var T = this.__data__;
      if (T instanceof et) {
        var z = T.__data__;
        if (!me || z.length < n - 1)
          return z.push([h, _]), this.size = ++T.size, this;
        T = this.__data__ = new qt(z);
      }
      return T.set(h, _), this.size = T.size, this;
    }
    Xt.prototype.clear = ye, Xt.prototype.delete = le, Xt.prototype.get = ve, Xt.prototype.has = kt, Xt.prototype.set = hn;
    function fn(h, _) {
      var T = Wn(h), z = !T && Hn(h), Y = !T && !z && Ai(h), ot = !T && !z && !Y && Ei(h), st = T || z || Y || ot, nt = st ? nn(h.length, String) : [], at = nt.length;
      for (var Lt in h)
        st && (Lt == "length" || Y && (Lt == "offset" || Lt == "parent") || ot && (Lt == "buffer" || Lt == "byteLength" || Lt == "byteOffset") || Si(Lt, at)) || nt.push(Lt);
      return nt;
    }
    function ze(h, _, T) {
      (T !== void 0 && !yn(h[_], T) || T === void 0 && !(_ in h)) && ie(h, _, T);
    }
    function dn(h, _, T) {
      var z = h[_];
      (!(Tt.call(h, _) && yn(z, T)) || T === void 0 && !(_ in h)) && ie(h, _, T);
    }
    function ue(h, _) {
      for (var T = h.length; T--; )
        if (yn(h[T][0], _))
          return T;
      return -1;
    }
    function ie(h, _, T) {
      _ == "__proto__" && Vt ? Vt(h, _, { configurable: !0, enumerable: !0, value: T, writable: !0 }) : h[_] = T;
    }
    var re = lo();
    function P(h) {
      return h == null ? h === void 0 ? G : w : Gt && Gt in Object(h) ? uo(h) : yo(h);
    }
    function d(h) {
      return Be(h) && P(h) == a;
    }
    function A(h) {
      if (!he(h) || go(h))
        return !1;
      var _ = Vn(h) ? Oe : gt;
      return _.test(wo(h));
    }
    function k(h) {
      return Be(h) && xi(h.length) && !!H[P(h)];
    }
    function J(h) {
      if (!he(h))
        return mo(h);
      var _ = Ti(h), T = [];
      for (var z in h)
        z == "constructor" && (_ || !Tt.call(h, z)) || T.push(z);
      return T;
    }
    function $(h, _, T, z, Y) {
      h !== _ && re(_, function(ot, st) {
        if (Y || (Y = new Xt()), he(ot))
          rt(h, _, st, T, $, z, Y);
        else {
          var nt = z ? z(Un(h, st), ot, st + "", h, _, Y) : void 0;
          nt === void 0 && (nt = ot), ze(h, st, nt);
        }
      }, Mi);
    }
    function rt(h, _, T, z, Y, ot, st) {
      var nt = Un(h, T), at = Un(_, T), Lt = st.get(at);
      if (Lt) {
        ze(h, T, Lt);
        return;
      }
      var It = ot ? ot(nt, at, T + "", h, _, st) : void 0, je = It === void 0;
      if (je) {
        var $n = Wn(at), qn = !$n && Ai(at), Ni = !$n && !qn && Ei(at);
        It = at, $n || qn || Ni ? Wn(nt) ? It = nt : So(nt) ? It = pn(nt) : qn ? (je = !1, It = Mt(at)) : Ni ? (je = !1, It = ht(at)) : It = [] : To(at) || Hn(at) ? (It = nt, Hn(nt) ? It = Ao(nt) : (!he(nt) || Vn(nt)) && (It = ho(at))) : je = !1;
      }
      je && (st.set(at, It), Y(It, at, z, ot, st), st.delete(at)), ze(h, T, It);
    }
    function St(h, _) {
      return _o(vo(h, _, Ii), h + "");
    }
    var Nt = Vt ? function(h, _) {
      return Vt(h, "toString", { configurable: !0, enumerable: !1, value: Eo(_), writable: !0 });
    } : Ii;
    function Mt(h, _) {
      return h.slice();
    }
    function Ge(h) {
      var _ = new h.constructor(h.byteLength);
      return new At(_).set(new At(h)), _;
    }
    function ht(h, _) {
      var T = Ge(h.buffer);
      return new h.constructor(T, h.byteOffset, h.length);
    }
    function pn(h, _) {
      var T = -1, z = h.length;
      for (_ || (_ = Array(z)); ++T < z; )
        _[T] = h[T];
      return _;
    }
    function gn(h, _, T, z) {
      var Y = !T;
      T || (T = {});
      for (var ot = -1, st = _.length; ++ot < st; ) {
        var nt = _[ot], at = void 0;
        at === void 0 && (at = h[nt]), Y ? ie(T, nt, at) : dn(T, nt, at);
      }
      return T;
    }
    function co(h) {
      return St(function(_, T) {
        var z = -1, Y = T.length, ot = Y > 1 ? T[Y - 1] : void 0, st = Y > 2 ? T[2] : void 0;
        for (ot = h.length > 3 && typeof ot == "function" ? (Y--, ot) : void 0, st && fo(T[0], T[1], st) && (ot = Y < 3 ? void 0 : ot, Y = 1), _ = Object(_); ++z < Y; ) {
          var nt = T[z];
          nt && h(_, nt, z, ot);
        }
        return _;
      });
    }
    function lo(h) {
      return function(_, T, z) {
        for (var Y = -1, ot = Object(_), st = z(_), nt = st.length; nt--; ) {
          var at = st[++Y];
          if (T(ot[at], at, ot) === !1)
            break;
        }
        return _;
      };
    }
    function mn(h, _) {
      var T = h.__data__;
      return po(_) ? T[typeof _ == "string" ? "string" : "hash"] : T.map;
    }
    function jn(h, _) {
      var T = Ft(h, _);
      return A(T) ? T : void 0;
    }
    function uo(h) {
      var _ = Tt.call(h, Gt), T = h[Gt];
      try {
        h[Gt] = void 0;
        var z = !0;
      } catch {
      }
      var Y = De.call(h);
      return z && (_ ? h[Gt] = T : delete h[Gt]), Y;
    }
    function ho(h) {
      return typeof h.constructor == "function" && !Ti(h) ? Ln(pe(h)) : {};
    }
    function Si(h, _) {
      var T = typeof h;
      return _ = _ ?? s, !!_ && (T == "number" || T != "symbol" && it.test(h)) && h > -1 && h % 1 == 0 && h < _;
    }
    function fo(h, _, T) {
      if (!he(T))
        return !1;
      var z = typeof _;
      return (z == "number" ? Kn(T) && Si(_, T.length) : z == "string" && _ in T) ? yn(T[_], h) : !1;
    }
    function po(h) {
      var _ = typeof h;
      return _ == "string" || _ == "number" || _ == "symbol" || _ == "boolean" ? h !== "__proto__" : h === null;
    }
    function go(h) {
      return !!Ce && Ce in h;
    }
    function Ti(h) {
      var _ = h && h.constructor, T = typeof _ == "function" && _.prototype || te;
      return h === T;
    }
    function mo(h) {
      var _ = [];
      if (h != null)
        for (var T in Object(h))
          _.push(T);
      return _;
    }
    function yo(h) {
      return De.call(h);
    }
    function vo(h, _, T) {
      return _ = xt(_ === void 0 ? h.length - 1 : _, 0), function() {
        for (var z = arguments, Y = -1, ot = xt(z.length - _, 0), st = Array(ot); ++Y < ot; )
          st[Y] = z[_ + Y];
        Y = -1;
        for (var nt = Array(_ + 1); ++Y < _; )
          nt[Y] = z[Y];
        return nt[_] = T(st), Ne(h, this, nt);
      };
    }
    function Un(h, _) {
      if (!(_ === "constructor" && typeof h[_] == "function") && _ != "__proto__")
        return h[_];
    }
    var _o = bo(Nt);
    function bo(h) {
      var _ = 0, T = 0;
      return function() {
        var z = ee(), Y = o - (z - T);
        if (T = z, Y > 0) {
          if (++_ >= r)
            return arguments[0];
        } else
          _ = 0;
        return h.apply(void 0, arguments);
      };
    }
    function wo(h) {
      if (h != null) {
        try {
          return Wt.call(h);
        } catch {
        }
        try {
          return h + "";
        } catch {
        }
      }
      return "";
    }
    function yn(h, _) {
      return h === _ || h !== h && _ !== _;
    }
    var Hn = d(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? d : function(h) {
      return Be(h) && Tt.call(h, "callee") && !sn.call(h, "callee");
    }, Wn = Array.isArray;
    function Kn(h) {
      return h != null && xi(h.length) && !Vn(h);
    }
    function So(h) {
      return Be(h) && Kn(h);
    }
    var Ai = ge || Mo;
    function Vn(h) {
      if (!he(h))
        return !1;
      var _ = P(h);
      return _ == p || _ == S || _ == c || _ == E;
    }
    function xi(h) {
      return typeof h == "number" && h > -1 && h % 1 == 0 && h <= s;
    }
    function he(h) {
      var _ = typeof h;
      return h != null && (_ == "object" || _ == "function");
    }
    function Be(h) {
      return h != null && typeof h == "object";
    }
    function To(h) {
      if (!Be(h) || P(h) != v)
        return !1;
      var _ = pe(h);
      if (_ === null)
        return !0;
      var T = Tt.call(_, "constructor") && _.constructor;
      return typeof T == "function" && T instanceof T && Wt.call(T) == on;
    }
    var Ei = Ie ? rn(Ie) : k;
    function Ao(h) {
      return gn(h, Mi(h));
    }
    function Mi(h) {
      return Kn(h) ? fn(h) : J(h);
    }
    var xo = co(function(h, _, T) {
      $(h, _, T);
    });
    function Eo(h) {
      return function() {
        return h;
      };
    }
    function Ii(h) {
      return h;
    }
    function Mo() {
      return !1;
    }
    e.exports = xo;
  })(Ye, Ye.exports)), Ye.exports;
}
var Zc = Xc();
const Ze = Yc(Zc);
function Jc(e) {
  var t = 0, n = e.children, i = n && n.length;
  if (!i) t = 1;
  else for (; --i >= 0; ) t += n[i].value;
  e.value = t;
}
function Qc() {
  return this.eachAfter(Jc);
}
function tl(e, t) {
  let n = -1;
  for (const i of this)
    e.call(t, i, ++n, this);
  return this;
}
function el(e, t) {
  for (var n = this, i = [n], r, o, s = -1; n = i.pop(); )
    if (e.call(t, n, ++s, this), r = n.children)
      for (o = r.length - 1; o >= 0; --o)
        i.push(r[o]);
  return this;
}
function nl(e, t) {
  for (var n = this, i = [n], r = [], o, s, a, l = -1; n = i.pop(); )
    if (r.push(n), o = n.children)
      for (s = 0, a = o.length; s < a; ++s)
        i.push(o[s]);
  for (; n = r.pop(); )
    e.call(t, n, ++l, this);
  return this;
}
function il(e, t) {
  let n = -1;
  for (const i of this)
    if (e.call(t, i, ++n, this))
      return i;
}
function rl(e) {
  return this.eachAfter(function(t) {
    for (var n = +e(t.data) || 0, i = t.children, r = i && i.length; --r >= 0; ) n += i[r].value;
    t.value = n;
  });
}
function ol(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function sl(e) {
  for (var t = this, n = al(t, e), i = [t]; t !== n; )
    t = t.parent, i.push(t);
  for (var r = i.length; e !== n; )
    i.splice(r, 0, e), e = e.parent;
  return i;
}
function al(e, t) {
  if (e === t) return e;
  var n = e.ancestors(), i = t.ancestors(), r = null;
  for (e = n.pop(), t = i.pop(); e === t; )
    r = e, e = n.pop(), t = i.pop();
  return r;
}
function cl() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function ll() {
  return Array.from(this);
}
function ul() {
  var e = [];
  return this.eachBefore(function(t) {
    t.children || e.push(t);
  }), e;
}
function hl() {
  var e = this, t = [];
  return e.each(function(n) {
    n !== e && t.push({ source: n.parent, target: n });
  }), t;
}
function* fl() {
  var e = this, t, n = [e], i, r, o;
  do
    for (t = n.reverse(), n = []; e = t.pop(); )
      if (yield e, i = e.children)
        for (r = 0, o = i.length; r < o; ++r)
          n.push(i[r]);
  while (n.length);
}
function On(e, t) {
  e instanceof Map ? (e = [void 0, e], t === void 0 && (t = gl)) : t === void 0 && (t = pl);
  for (var n = new tn(e), i, r = [n], o, s, a, l; i = r.pop(); )
    if ((s = t(i.data)) && (l = (s = Array.from(s)).length))
      for (i.children = s, a = l - 1; a >= 0; --a)
        r.push(o = s[a] = new tn(s[a])), o.parent = i, o.depth = i.depth + 1;
  return n.eachBefore(yl);
}
function dl() {
  return On(this).eachBefore(ml);
}
function pl(e) {
  return e.children;
}
function gl(e) {
  return Array.isArray(e) ? e[1] : null;
}
function ml(e) {
  e.data.value !== void 0 && (e.value = e.data.value), e.data = e.data.data;
}
function yl(e) {
  var t = 0;
  do
    e.height = t;
  while ((e = e.parent) && e.height < ++t);
}
function tn(e) {
  this.data = e, this.depth = this.height = 0, this.parent = null;
}
tn.prototype = On.prototype = { constructor: tn, count: Qc, each: tl, eachAfter: nl, eachBefore: el, find: il, sum: rl, sort: ol, path: sl, ancestors: cl, descendants: ll, leaves: ul, links: hl, copy: dl, [Symbol.iterator]: fl };
function vl(e, t) {
  return e.parent === t.parent ? 1 : 2;
}
function ni(e) {
  var t = e.children;
  return t ? t[0] : e.t;
}
function ii(e) {
  var t = e.children;
  return t ? t[t.length - 1] : e.t;
}
function _l(e, t, n) {
  var i = n / (t.i - e.i);
  t.c -= i, t.s += n, e.c += i, t.z += n, t.m += n;
}
function bl(e) {
  for (var t = 0, n = 0, i = e.children, r = i.length, o; --r >= 0; )
    o = i[r], o.z += t, o.m += t, t += o.s + (n += o.c);
}
function wl(e, t, n) {
  return e.a.parent === t.parent ? e.a : n;
}
function Tn(e, t) {
  this._ = e, this.parent = null, this.children = null, this.A = null, this.a = this, this.z = 0, this.m = 0, this.c = 0, this.s = 0, this.t = null, this.i = t;
}
Tn.prototype = Object.create(tn.prototype);
function Sl(e) {
  for (var t = new Tn(e, 0), n, i = [t], r, o, s, a; n = i.pop(); )
    if (o = n._.children)
      for (n.children = new Array(a = o.length), s = a - 1; s >= 0; --s)
        i.push(r = n.children[s] = new Tn(o[s], s)), r.parent = n;
  return (t.parent = new Tn(null, 0)).children = [t], t;
}
function Tl() {
  var e = vl, t = 1, n = 1, i = null;
  function r(c) {
    var u = Sl(c);
    if (u.eachAfter(o), u.parent.m = -u.z, u.eachBefore(s), i) c.eachBefore(l);
    else {
      var g = c, f = c, p = c;
      c.eachBefore(function(v) {
        v.x < g.x && (g = v), v.x > f.x && (f = v), v.depth > p.depth && (p = v);
      });
      var S = g === f ? 1 : e(g, f) / 2, b = S - g.x, y = t / (f.x + S + b), w = n / (p.depth || 1);
      c.eachBefore(function(v) {
        v.x = (v.x + b) * y, v.y = v.depth * w;
      });
    }
    return c;
  }
  function o(c) {
    var u = c.children, g = c.parent.children, f = c.i ? g[c.i - 1] : null;
    if (u) {
      bl(c);
      var p = (u[0].z + u[u.length - 1].z) / 2;
      f ? (c.z = f.z + e(c._, f._), c.m = c.z - p) : c.z = p;
    } else f && (c.z = f.z + e(c._, f._));
    c.parent.A = a(c, f, c.parent.A || g[0]);
  }
  function s(c) {
    c._.x = c.z + c.parent.m, c.m += c.parent.m;
  }
  function a(c, u, g) {
    if (u) {
      for (var f = c, p = c, S = u, b = f.parent.children[0], y = f.m, w = p.m, v = S.m, E = b.m, m; S = ii(S), f = ni(f), S && f; )
        b = ni(b), p = ii(p), p.a = c, m = S.z + v - f.z - y + e(S._, f._), m > 0 && (_l(wl(S, c, g), c, m), y += m, w += m), v += S.m, y += f.m, E += b.m, w += p.m;
      S && !ii(p) && (p.t = S, p.m += v - w), f && !ni(b) && (b.t = f, b.m += y - E, g = c);
    }
    return g;
  }
  function l(c) {
    c.x *= t, c.y = c.depth * n;
  }
  return r.separation = function(c) {
    return arguments.length ? (e = c, r) : e;
  }, r.size = function(c) {
    return arguments.length ? (i = !1, t = +c[0], n = +c[1], r) : i ? null : [t, n];
  }, r.nodeSize = function(c) {
    return arguments.length ? (i = !0, t = +c[0], n = +c[1], r) : i ? [t, n] : null;
  }, r;
}
function ir(e, t) {
  const n = new Set(t.map((i) => i.target.id));
  for (const i of e)
    if (!n.has(i.id)) return i;
  return e[0];
}
const Al = 1e6;
function rr(e, t) {
  var a;
  const n = /* @__PURE__ */ new Map();
  for (const l of e)
    n.set(l.id, []);
  for (const l of t)
    (a = n.get(l.from.id)) == null || a.push(l.to);
  let i = 0, r = !1, o = null, s = -1;
  for (const l of e) {
    const c = /* @__PURE__ */ new Set([l.id]), u = [l];
    for (; u.length > 0 && !r; ) {
      const f = u.pop();
      for (const p of n.get(f.id) ?? []) {
        if (++i > Al) {
          r = !0;
          break;
        }
        c.has(p.id) || (c.add(p.id), u.push(p));
      }
    }
    const g = c.size - 1;
    if (g > s && (s = g, o = l), r) break;
  }
  return r && console.warn("Pivotick: reachability search hit its traversal cap, using the best root found so far."), o ?? e[0];
}
function xl(e, t) {
  return Qr(e, t);
}
function Qr(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const c of e)
    n.set(c.id, []), i.set(c.id, 0);
  for (const c of t)
    c.directed !== !1 && (n.get(c.from.id).push(c.to), i.set(c.to.id, (i.get(c.to.id) || 0) + 1));
  const r = [], o = e.filter((c) => i.get(c.id) === 0);
  for (; o.length; ) {
    const c = o.shift();
    r.push(c);
    for (const u of n.get(c.id))
      i.set(u.id, i.get(u.id) - 1), i.get(u.id) === 0 && o.push(u);
  }
  if (r.length !== e.length)
    return console.warn("Pivotick: the graph has a cycle, so no shallowest root is defined — using the first node."), e[0];
  const s = /* @__PURE__ */ new Map();
  for (let c = r.length - 1; c >= 0; c--) {
    const u = r[c];
    let g = 0;
    for (const f of n.get(u.id))
      g = Math.max(g, 1 + (s.get(f.id) ?? 0));
    s.set(u.id, g);
  }
  let a = null, l = 1 / 0;
  for (const c of e) {
    const u = s.get(c.id);
    u < l && (l = u, a = c);
  }
  return a ?? e[0];
}
function El(e, t, n) {
  var g;
  const i = new Map(e.map((f) => [f.id, f])), r = new Map(e.map((f) => [f.id, []]));
  for (const f of t)
    !r.has(f.from.id) || !r.has(f.to.id) || (r.get(f.from.id).push(f.to.id), r.get(f.to.id).push(f.from.id));
  const o = (f) => {
    const p = /* @__PURE__ */ new Map([[f, 0]]), S = /* @__PURE__ */ new Map(), b = [f];
    for (let y = 0; y < b.length; y++) {
      const w = b[y];
      for (const v of r.get(w) ?? [])
        p.has(v) || (p.set(v, p.get(w) + 1), S.set(v, w), b.push(v));
    }
    return { levels: p, parentOf: S, farthest: b[b.length - 1] };
  }, s = n !== void 0 && r.has(n) ? n : (g = e[0]) == null ? void 0 : g.id;
  if (s === void 0) return e[0];
  const a = o(s).farthest, { parentOf: l, farthest: c } = o(a), u = [];
  for (let f = c; f !== void 0; f = l.get(f))
    u.push(f);
  return i.get(u[Math.floor(u.length / 2)]) ?? e[0];
}
const Ml = 24, Il = 16, mi = 1, or = 0.1;
function ri(e, t) {
  return e ? e.measured <= 0 ? Nn[1] : e.needed / e.measured * t : mi;
}
function oi(e) {
  if (!Number.isFinite(e)) return mi;
  const t = Math.ceil(e / or) * or;
  return Math.min(Nn[1], Math.max(mi, Math.round(t * 10) / 10));
}
function Nl(e) {
  const t = ri(e.level, e.current.levelSpacing);
  if (e.radial) {
    const n = ri(e.sibling, e.current.levelSpacing);
    return { levelSpacing: oi(Math.max(t, n)), siblingSpacing: e.current.siblingSpacing };
  }
  return { levelSpacing: oi(t), siblingSpacing: oi(ri(e.sibling, e.current.siblingSpacing)) };
}
function Rl(e, t) {
  return e + t + Ml;
}
function Cl(e, t) {
  return e + t + Il;
}
const Dl = 20, sr = "__pivotick_forest_root__", ar = "__pivotick_tree_spacer__", cr = 4096, Ol = 5e4, lr = 0.5;
let ur = "";
const si = { type: "tree", rootId: void 0, parentKey: void 0, depthKey: void 0, rootIdAlgorithmFinder: "MaxReachability", strength: 0.25, radial: !1, radialGap: 750, spacing: "auto", levelSpacing: 1, siblingSpacing: 1, horizontal: !1 };
class q {
  constructor(t, n, i, r = {}) {
    M(this, "graph");
    M(this, "simulation");
    M(this, "simulationForces");
    M(this, "options");
    M(this, "originalForceStrength");
    M(this, "canvasBCR");
    M(this, "levels");
    M(this, "maxDepth", 0);
    M(this, "autoSpacing");
    M(this, "parkedIds", /* @__PURE__ */ new Set());
    M(this, "positionedNodesByID");
    this.graph = t, this.simulation = n, this.simulationForces = i, this.options = Ze({}, si, r), this.originalForceStrength = { link: this.simulationForces.link.strength(), charge: this.simulationForces.charge.strength(), gravity: this.simulationForces.gravity.strength() }, this.autoSpacing = r.spacing === "auto" || r.spacing !== "manual" && r.levelSpacing === void 0 && r.siblingSpacing === void 0, this.positionedNodesByID = /* @__PURE__ */ new Map(), this.levels = /* @__PURE__ */ new Map(), this.setSizes(), this.update(), this.registerForces();
  }
  update() {
    var n, i;
    if (this.layoutOnce(), !this.autoSpacing || this.positionedNodesByID.size === 0) return;
    const t = Nl(this.measureAutoContext());
    t.levelSpacing === this.options.levelSpacing && t.siblingSpacing === this.options.siblingSpacing || (this.options.levelSpacing = t.levelSpacing, this.options.siblingSpacing = t.siblingSpacing, this.layoutOnce(), (i = (n = this.graph.UIManager) == null ? void 0 : n.physicsFlyout) == null || i.syncAutoSpacing(t));
  }
  layoutOnce() {
    const { nodes: t, edges: n } = this.drawnGraph(), i = this.buildLevels(t, n, this.options), { levels: r, maxDepth: o, parked: s } = i;
    this.parkedIds = new Set(s);
    const { nodes: a, nodeById: l } = this.buildTree(t, n, this.options, this.canvasBCR, i);
    this.positionedNodesByID = l, this.levels = r, this.maxDepth = o, a && this.setNodePositions(a, this.options);
  }
  drawnGraph() {
    const t = this.graph.getNodes().filter((s) => {
      var a;
      return !((a = this.graph.getMutableNode(s.id)) != null && a.foldedInto);
    }), n = new Map(this.graph.simplify.getDrawnGroups().map((s) => [s.id, s.clone()]));
    if (n.size === 0) return { nodes: t, edges: this.graph.getEdges() };
    t.push(...n.values());
    const i = (s) => s.foldedInto ? i(s.foldedInto) : s, r = [], o = /* @__PURE__ */ new Set();
    for (const s of this.graph.getMutableEdges()) {
      const a = i(s.from), l = i(s.to);
      if (a === s.from && l === s.to) {
        r.push(s.clone());
        continue;
      }
      const c = `${a.id}->${l.id}`;
      if (a === l || o.has(c)) continue;
      o.add(c);
      const u = s.clone();
      u.bindEndpoints(n.get(a.id) ?? a.clone(), n.get(l.id) ?? l.clone()), r.push(u);
    }
    return { nodes: t, edges: r };
  }
  measureAutoContext() {
    const t = /* @__PURE__ */ new Map();
    for (const [o, s] of this.positionedNodesByID) {
      const a = this.graph.getCanvasNode(o);
      if (!a || this.parkedIds.has(o)) continue;
      const l = a.expanded ? a.getCircleRadiusCollapsed() : a.getLayoutRadius(), c = Number.isFinite(l) ? l : 0, u = t.get(s.depth) ?? [];
      u.push({ node: s, radius: c }), t.set(s.depth, u);
    }
    const n = [...t.keys()].sort((o, s) => o - s);
    let i = null, r = null;
    for (let o = 0; o < n.length; o++) {
      const s = t.get(n[o]), a = o + 1 < n.length ? t.get(n[o + 1]) : void 0;
      if (a) {
        const c = Math.max(n[o + 1] - n[o], 1), u = Math.abs((a[0].node.y ?? 0) - (s[0].node.y ?? 0)) / c, g = Rl(q.widestOf(s), q.widestOf(a));
        i = q.tighter(i, { measured: u, needed: g });
      }
      const l = [...s].sort((c, u) => (c.node.x ?? 0) - (u.node.x ?? 0));
      for (let c = 1; c < l.length; c++) {
        const [u, g] = [l[c - 1], l[c]], f = this.options.radial ? 2 * (g.node.y ?? 0) * Math.sin(Math.abs((g.node.x ?? 0) - (u.node.x ?? 0)) / 2) : (g.node.x ?? 0) - (u.node.x ?? 0), p = Cl(u.radius, g.radius);
        r = q.tighter(r, { measured: f, needed: p });
      }
    }
    return { level: i, sibling: r, radial: this.options.radial, current: this.getSpacing() };
  }
  static tighter(t, n) {
    if (!t) return n;
    const i = (r) => r.needed / Math.max(r.measured, 1e-6);
    return i(n) > i(t) ? n : t;
  }
  static widestOf(t) {
    return t.reduce((n, i) => Math.max(n, i.radius), 0);
  }
  setSizes() {
    const t = this.graph.renderer.getCanvas();
    if (!t)
      throw new Error("Canvas element is not defined in the graph renderer.");
    this.canvasBCR = t.getBoundingClientRect();
  }
  setNodePositions(t, n) {
    for (const i of t) {
      const r = this.graph.getCanvasNode(i.data.id);
      if (r)
        if (n.radial) {
          const o = i.x ?? 0, s = i.y ?? 0;
          r.x = s * Math.cos(o - Math.PI / 2), r.y = s * Math.sin(o - Math.PI / 2), r.fx = r.x, r.fy = r.y;
        } else n.horizontal ? (r.x = i.y, r.fx = i.y, r.y = i.x, delete r.fy) : (r.x = i.x, r.y = i.y, r.fy = i.y, delete r.fx);
    }
  }
  unsetNodePositions() {
    [...this.graph.getMutableNodes(), ...this.graph.simplify.getDrawnGroups()].forEach((t) => {
      delete t.fy, delete t.fx;
    });
  }
  registerForces() {
    const t = this.options.strength ?? 0.1;
    if (this.options.radial) {
      const n = q.radialRingGap(this.options, this.maxDepth), i = Li((r) => (this.levels.get(r.id) ?? 1) * n, 0, 0).strength(t);
      this.simulation.force("tree-radial", i);
    } else
      this.simulation.force("tree-y", Pi((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.x) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.y) ?? 0;
      }).strength(t)), this.simulation.force("tree-x", Fi((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.y) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.x) ?? 0;
      }).strength(t));
    q.adjustOtherSimulationForces(this.simulationForces, this.options);
  }
  unregisterLayout() {
    this.unregisterForces(), this.unsetNodePositions();
  }
  unregisterForces() {
    this.simulation.force("tree-radial", null), this.simulation.force("tree-y", null), this.simulation.force("tree-x", null), q.resetOtherSimulationForces(this.simulationForces, this.originalForceStrength);
  }
  static registerForcesOnSimulation(t, n, i, r, o, s, a = this) {
    const l = Ze({}, si, o), c = l.strength ?? 0.1, u = s.width, g = s.height, f = [u / 2, g / 2], p = a.buildLevelsStatic(t, n, l), { levels: S, maxDepth: b } = p, { nodeById: y } = a.buildTreeStatic(t, n, l, s, p);
    if (l.radial) {
      const w = a.radialRingGap(l, b), v = Li((E) => (S.get(E.id) ?? 1) * w, f[0], f[1]).strength(c);
      i.force("tree-radial", v);
    } else
      i.force("tree-y", Pi((w) => {
        var v, E;
        return l.horizontal ? ((v = y.get(w.id)) == null ? void 0 : v.x) ?? 0 : ((E = y.get(w.id)) == null ? void 0 : E.y) ?? 0;
      }).strength(c)), i.force("tree-x", Fi((w) => {
        var v, E;
        return l.horizontal ? ((v = y.get(w.id)) == null ? void 0 : v.y) ?? 0 : ((E = y.get(w.id)) == null ? void 0 : E.x) ?? 0;
      }).strength(c));
    a.adjustOtherSimulationForces(r, l);
  }
  static adjustOtherSimulationForces(t, n) {
    n != null && n.radial ? (t.link.strength(0), t.charge.strength(0), t.gravity.strength(0)) : (t.link.strength(0), t.charge.strength(0), t.gravity.strength(1e-5));
  }
  static resetOtherSimulationForces(t, n) {
    t.link.strength(n.link), t.charge.strength(n.charge), t.gravity.strength(n.gravity);
  }
  static simulationDone(t, n, i, r) {
    const o = Ze({}, si, r);
    for (const s of t)
      o.radial ? (s.fx = s.x, s.fy = s.y) : o.horizontal ? (s.fx = s.x, delete s.fy) : (s.fy = s.y, delete s.fx);
  }
  static radialRingGap(t, n) {
    const i = t.radialGap * q.spacingOf(t).level;
    return n > 0 ? i / n : i;
  }
  static spacingOf(t) {
    const n = (i) => Number.isFinite(i) ? i : 1;
    return { level: n(t.levelSpacing), sibling: n(t.siblingSpacing) };
  }
  getSpacing() {
    const { level: t, sibling: n } = q.spacingOf(this.options);
    return { levelSpacing: t, siblingSpacing: n };
  }
  setSpacing(t) {
    this.autoSpacing = !1, this.options.spacing = "manual", t.levelSpacing !== void 0 && (this.options.levelSpacing = t.levelSpacing), t.siblingSpacing !== void 0 && (this.options.siblingSpacing = t.siblingSpacing), this.relayout();
  }
  isAutoSpacing() {
    return this.autoSpacing;
  }
  getRoot() {
    return { rootId: this.options.rootId, algorithm: this.options.rootIdAlgorithmFinder };
  }
  setRoot(t) {
    "rootId" in t ? this.options.rootId = t.rootId : (this.options.rootId = void 0, this.options.rootIdAlgorithmFinder = t.algorithm), this.relayout();
  }
  enableAutoSpacing() {
    this.autoSpacing = !0, this.options.spacing = "auto", this.relayout();
  }
  relayout() {
    this.setSizes(), this.update(), this.positionedNodesByID.size !== 0 && this.registerForces();
  }
  static sizedTreeLayout(t, n) {
    const i = q.spacingOf(t), r = Tl();
    if (t.radial)
      return r.size([2 * Math.PI, t.radialGap * i.level]), { treeLayout: r, offset: { x: 0, y: 0 } };
    const o = t.horizontal ? n.width : n.height, s = t.horizontal ? n.height : n.width, a = s * i.sibling, l = o * i.level;
    return r.size([a, l]).separation((c, u) => {
      var f, p;
      const g = ((p = (f = c.parent) == null ? void 0 : f.children) == null ? void 0 : p.length) ?? 1;
      return c.parent === u.parent ? 1.5 / g : 1.5;
    }), { treeLayout: r, offset: { x: -(a - s) / 2, y: -(l - o) / 2 } };
  }
  static packParked(t, n, i, r, o = /* @__PURE__ */ new Map()) {
    if (!t.length) return [];
    const s = (O) => {
      const j = O.getLayoutRadius();
      return Number.isFinite(j) ? j : 0;
    }, a = 2 * t.reduce((O, j) => Math.max(O, s(j)), 0) + Dl, l = (O, j, Z, lt) => ({ data: O, depth: lt, x: j, y: Z, height: 0 }), c = n.map((O) => O.x ?? 0), u = n.map((O) => O.y ?? 0), g = t.filter((O) => o.has(O.id)), f = t.filter((O) => !o.has(O.id)), p = (O) => o.get(O.id) ?? 0, S = [...new Set(n.map((O) => O.depth))].sort((O, j) => O - j), b = /* @__PURE__ */ new Map();
    for (const O of n) b.set(O.depth, O.y ?? 0);
    const y = S[0] ?? 0, w = S[S.length - 1] ?? 0, v = w > y ? ((b.get(w) ?? 0) - (b.get(y) ?? 0)) / (w - y) : a, E = (O) => b.get(O) ?? (S.length ? (b.get(y) ?? 0) + (O - y) * v : O * a);
    if (i.radial) {
      const O = [], j = /* @__PURE__ */ new Map();
      for (const it of g) {
        const H = p(it);
        j.set(H, [...j.get(H) ?? [], it]);
      }
      for (const [it, H] of j) {
        const X = n.filter((U) => U.depth === it).map((U) => U.x ?? 0).sort((U, yt) => U - yt);
        let Zt = 0, tt = 2 * Math.PI;
        if (X.length) {
          tt = 0;
          for (let U = 0; U < X.length; U++) {
            const yt = U + 1 < X.length ? X[U + 1] : X[0] + 2 * Math.PI;
            yt - X[U] > tt && (tt = yt - X[U], Zt = X[U]);
          }
        }
        const Jt = tt / (H.length + 1);
        H.forEach((U, yt) => O.push(l(U, Zt + Jt * (yt + 1), E(it), it)));
      }
      const Z = new Set(u).size, lt = u.length ? Math.max(...u) : i.radialGap, gt = Z > 0 ? lt / Z : lt;
      return f.forEach((it, H) => O.push(l(it, H * 2 * Math.PI / f.length, lt + gt, Z + 1))), O;
    }
    if (!n.length) {
      const O = Math.max(1, Math.floor(r.width / a)), j = [], Z = /* @__PURE__ */ new Map();
      for (const gt of g) {
        const it = p(gt), H = Z.get(it) ?? 0;
        Z.set(it, H + 1), j.push(l(gt, H * a, it * a, it));
      }
      const lt = Z.size ? Math.max(...Z.keys()) + 1 : 0;
      return f.forEach((gt, it) => {
        const H = lt + Math.floor(it / O);
        j.push(l(gt, it % O * a, H * a, H));
      }), j;
    }
    const m = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map();
    for (const O of n) {
      const j = O.y ?? 0, Z = O.x ?? 0;
      m.set(j, Math.max(m.get(j) ?? Z, Z)), I.set(O.depth, Math.max(I.get(O.depth) ?? Z, Z));
    }
    const D = [...m.keys()].sort((O, j) => O - j), G = Math.min(...c), x = Math.max(...c), R = D.length > 1 ? D[1] - D[0] : a, F = [], B = [], Q = /* @__PURE__ */ new Map();
    for (const O of g) {
      const j = p(O), Z = E(j), lt = Q.get(Z) ?? 0, gt = x - lt * a, it = I.get(j);
      if (it !== void 0 && gt - a <= it) {
        B.push(O);
        continue;
      }
      Q.set(Z, lt + 1), F.push(l(O, gt, Z, j));
    }
    const C = [...f, ...B];
    let L = 0;
    for (const [O, j] of D.entries()) {
      if (L >= C.length) break;
      const Z = Q.get(j) ?? 0, lt = x - Z * a - ((m.get(j) ?? x) + a), gt = Math.floor(lt / a);
      for (let it = 0; it < gt && L < C.length; it++)
        F.push(l(C[L++], x - (Z + it) * a, j, O));
    }
    const W = Math.max(1, Math.floor((x - G) / a)), V = D[D.length - 1];
    for (let O = 0; L < C.length; O++)
      F.push(l(C[L++], x - O % W * a, V + R * (1 + Math.floor(O / W)), D.length));
    return F;
  }
  static offsetTree(t, n) {
    if (!(!n.x && !n.y))
      for (const i of t)
        i.x = (i.x ?? 0) + n.x, i.y = (i.y ?? 0) + n.y;
  }
  buildTree(t, n, i, r, o) {
    return q.buildTreeStatic(t, n, i, r, o);
  }
  static isScaffolding(t) {
    return t === sr || t.startsWith(ar);
  }
  static buildTreeStatic(t, n, i, r, o) {
    if (!t.length)
      return { root: null, nodes: [], nodeById: /* @__PURE__ */ new Map() };
    const s = /* @__PURE__ */ new Map();
    for (const R of t) {
      const F = R;
      F.children = [], s.set(R.id, F);
    }
    const { parentOf: a, roots: l, parked: c, levels: u, declaredRows: g } = o ?? q.buildLevelsStatic(t, n, i);
    let f = 0;
    const p = () => ({ id: `${ar}${f++}`, children: [] }), S = (R) => u.get(R) ?? 0, b = (R, F, B, Q) => {
      let C = R;
      for (let L = F + 1; L < Q && f < Ol; L++) {
        const W = p();
        C.children.push(W), C = W;
      }
      C.children.push(B);
    };
    for (const [R, F] of a) {
      const B = s.get(R), Q = s.get(F);
      !B || !Q || (b(Q, S(F), B, S(R)), B.parent = Q);
    }
    const y = c.map((R) => s.get(R)).filter((R) => !!R), w = q.hierarchyRootFor(l, s, S, b, p);
    if (!w) {
      if (!l.length && y.length) {
        const R = q.packParked(y, [], i, r, g);
        return { root: null, nodes: R, nodeById: new Map(R.map((F) => [F.data.id, F])) };
      }
      throw new Error(`Root node with id "${l[0]}" not found.`);
    }
    const { treeLayout: v, offset: E } = q.sizedTreeLayout(i, r), m = On(w), I = v(m);
    q.offsetTree(I.descendants(), E);
    const D = I.descendants().filter((R) => !q.isScaffolding(R.data.id)), G = q.packParked(y, D, i, r, g), x = /* @__PURE__ */ new Map();
    for (const R of G) x.set(R.data.id, R);
    return I.descendants().forEach((R) => {
      q.isScaffolding(R.data.id) || x.set(R.data.id, R);
    }), { root: I, nodes: [...D, ...G], nodeById: x };
  }
  static hierarchyRootFor(t, n, i, r, o) {
    if (t.length === 1) {
      const l = n.get(t[0]);
      if (!l || i(t[0]) <= 0) return l;
      const c = o();
      return r(c, 0, l, i(t[0])), c;
    }
    const s = t.map((l) => n.get(l)).filter((l) => !!l);
    if (!s.length) return;
    const a = { id: sr, children: [] };
    for (const l of s) r(a, 0, l, i(l.id));
    return a;
  }
  buildLevels(t, n, i) {
    return q.buildLevelsStatic(t, n, i);
  }
  static readDeclaredHierarchy(t, n, i) {
    const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), a = (f) => s.set(f, (s.get(f) ?? 0) + 1), l = i ? n.parentKey : void 0, c = n.depthKey;
    if (!l && !c) return { parentOf: r, rowOf: o, complaints: s };
    const u = new Set(t.map((f) => f.id));
    for (const f of t) {
      const p = f.getData();
      if (c) {
        const y = p[c];
        if (y != null && y !== "") {
          const w = Math.floor(Number(y));
          Number.isFinite(w) && w >= 0 && w <= cr ? o.set(f.id, w) : a(`declared depths that are not a row between 0 and ${cr}`);
        }
      }
      if (!l) continue;
      const S = p[l];
      if (S == null || S === "") continue;
      const b = String(S);
      b === f.id ? a("declared parents pointing at their own node") : u.has(b) ? r.set(f.id, b) : a("declared parents not in the layout");
    }
    const g = /* @__PURE__ */ new Set();
    for (const f of [...r.keys()]) {
      if (g.has(f)) continue;
      const p = [], S = /* @__PURE__ */ new Set();
      let b = f;
      for (; b !== void 0 && !g.has(b); ) {
        if (S.has(b)) {
          r.delete(b), a("declared parent cycles broken");
          break;
        }
        S.add(b), p.push(b), b = r.get(b);
      }
      for (const y of p) g.add(y);
    }
    return { parentOf: r, rowOf: o, complaints: s };
  }
  static warnAboutDeclared(t) {
    if (!t.size) return;
    const n = "[Pivotick] Tree layout ignored part of the declared hierarchy: " + [...t].map(([i, r]) => `${r} ${i}`).join(", ") + ".";
    n !== ur && (ur = n, console.warn(n));
  }
  static buildLevelsStatic(t, n, i = {}) {
    var Q;
    if (!t.length)
      return { levels: /* @__PURE__ */ new Map(), maxDepth: 0, nodeCountPerLevel: {}, parentOf: /* @__PURE__ */ new Map(), roots: [], parked: [], declaredRows: /* @__PURE__ */ new Map() };
    const r = i.rootId !== void 0 && t.some((C) => C.id === i.rootId) ? i.rootId : void 0, o = q.readDeclaredHierarchy(t, i, r === void 0);
    let s = r !== void 0;
    const a = /* @__PURE__ */ new Map(), l = new Map(o.parentOf), c = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Set(), g = /* @__PURE__ */ new Set();
    for (const C of t)
      c.set(C.id, []);
    for (const { source: C, target: L } of n)
      (Q = c.get(C.id)) == null || Q.push(L.id), u.add(L.id), g.add(C.id), g.add(L.id);
    for (const [C, L] of o.parentOf)
      g.add(C), g.add(L), u.add(C);
    const f = () => {
      var C;
      for (const { source: L, target: W } of n) (C = c.get(W.id)) == null || C.push(L.id);
      s = !0;
    };
    s && f();
    const p = (C) => g.has(C) || C === r, S = t.filter((C) => p(C.id)), b = t.filter((C) => !p(C.id)).map((C) => C.id), y = o.parentOf.size > 0, w = (C, L) => {
      const W = /* @__PURE__ */ new Set();
      let V = L;
      for (; V !== void 0 && !W.has(V); ) {
        if (V === C) return !0;
        W.add(V), V = l.get(V);
      }
      return !1;
    }, v = /* @__PURE__ */ new Set(), E = (C) => {
      if (v.has(C)) return;
      v.add(C);
      const L = [C];
      let W = 0;
      for (; W < L.length; ) {
        const V = L[W++];
        for (const O of c.get(V) ?? [])
          v.has(O) || (v.add(O), !l.has(O) && !(y && w(O, V)) && l.set(O, V), L.push(O));
      }
    }, m = [];
    if (S.length) {
      const C = y ? S.filter((V) => !l.has(V.id)) : S, L = C.length ? C : S;
      let W = r ?? q.findRootId(L, n, i.rootIdAlgorithmFinder);
      if (r === void 0 && q.directedCoverage(W, c, n) < lr) {
        const V = rr(L, n).id;
        q.directedCoverage(V, c, n) < lr && (f(), W = El(L, n, V).id);
      }
      E(W);
      for (const V of S) {
        if (v.has(V.id)) continue;
        const O = S.find((j) => !v.has(j.id) && !u.has(j.id)) ?? V;
        E(O.id);
      }
      l.has(W) || m.push(W);
      for (const V of S)
        V.id !== W && !l.has(V.id) && m.push(V.id);
    }
    const I = /* @__PURE__ */ new Map();
    for (const [C, L] of l) {
      const W = I.get(L) ?? [];
      W.push(C), I.set(L, W);
    }
    let D = 0;
    const G = (C, L) => {
      const W = [[C, L]];
      for (; W.length; ) {
        const [V, O] = W.pop();
        if (a.has(V)) continue;
        const j = o.rowOf.get(V);
        j !== void 0 && j < O && D++;
        const Z = j !== void 0 && j > O ? j : O;
        a.set(V, Z);
        for (const lt of I.get(V) ?? []) W.push([lt, Z + 1]);
      }
    };
    for (const C of m) G(C, 0);
    for (const C of S)
      a.has(C.id) || G(C.id, 0);
    D && o.complaints.set("declared depths clamped to just below their parent", D), q.warnAboutDeclared(o.complaints);
    const x = m.length > 1 ? 1 : 0;
    if (x)
      for (const [C, L] of a) a.set(C, L + x);
    let R = 0;
    for (const C of a.values())
      C > R && (R = C);
    if (b.length) {
      const C = R + 1;
      for (const L of b) {
        const W = o.rowOf.get(L);
        a.set(L, W === void 0 ? C : W + x);
      }
      for (const L of a.values())
        L > R && (R = L);
    }
    const F = /* @__PURE__ */ new Map();
    for (const [C, L] of o.rowOf) F.set(C, L + x);
    const B = {};
    for (const C of a.values())
      B[C] = (B[C] || 0) + 1;
    return { levels: a, maxDepth: R, nodeCountPerLevel: B, parentOf: l, roots: m, parked: b, declaredRows: F };
  }
  static directedCoverage(t, n, i) {
    var a, l;
    const r = (c) => {
      const u = /* @__PURE__ */ new Set([t]), g = [t];
      for (let f = 0; f < g.length; f++)
        for (const p of c.get(g[f]) ?? [])
          u.has(p) || (u.add(p), g.push(p));
      return u.size;
    }, o = /* @__PURE__ */ new Map();
    for (const c of n.keys()) o.set(c, []);
    for (const { source: c, target: u } of i)
      (a = o.get(c.id)) == null || a.push(u.id), (l = o.get(u.id)) == null || l.push(c.id);
    const s = r(o);
    return s === 0 ? 1 : r(n) / s;
  }
  static findRootId(t, n, i) {
    switch (i) {
      case "FirstZeroInDegree":
        return ir(t, n).id;
      case "MaxReachability":
        return rr(t, n).id;
      case "MinMaxDistance":
        return xl(t, n).id;
      case "MinHeight":
        return Qr(t, n).id;
      default:
        return ir(t, n).id;
    }
  }
}
class fe extends q {
  constructor(t, n, i, r) {
    super(t, n, i, { ...r, type: "tree" });
  }
  static registerForcesOnSimulation(t, n, i, r, o, s) {
    q.registerForcesOnSimulation(t, n, i, r, o, s, fe);
  }
  buildTree(t, n, i, r) {
    return fe.buildTreeStatic(t, n, i, r);
  }
  static buildTreeStatic(t, n, i, r) {
    if (!t.length)
      return { root: null, nodes: [], nodeById: /* @__PURE__ */ new Map() };
    const o = /* @__PURE__ */ new Map();
    for (const S of t) {
      const b = S;
      b.children = [], o.set(S.id, b);
    }
    if (!i.rootId || !o.get(i.rootId))
      throw new Error("Ego Tree can only be created with a rootId");
    const s = i.rootId, a = o.get(s);
    if (a.children = [], !a)
      throw new Error(`Root node with id "${s}" not found.`);
    const l = /* @__PURE__ */ new Set([a.id]);
    for (const S of n) {
      const b = o.get(S.source.id), y = o.get(S.target.id);
      if (!b || !y) continue;
      const w = S.source.id === a.id ? y : S.target.id === a.id ? b : void 0;
      !w || l.has(w.id) || (l.add(w.id), a.children.push(w), w.parent = a);
    }
    const { treeLayout: c, offset: u } = fe.sizedTreeLayout(i, r), g = On(a), f = c(g);
    fe.offsetTree(f.descendants(), u);
    const p = /* @__PURE__ */ new Map();
    return f.descendants().forEach((S) => {
      p.set(S.data.id, S);
    }), { root: f, nodes: f.descendants(), nodeById: p };
  }
}
const kl = "";
function hr(e) {
  return e.map((t) => t.id).sort().join(",");
}
function Ll(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e.nodes) {
    const i = e.inNeighbours(n), r = e.outNeighbours(n);
    i.length === 0 && r.length === 0 || t.set(n.id, [e.typeOf(n) ?? "", hr(i), hr(r)].join(kl));
  }
  return t;
}
const Fl = 1e-4, Pl = 300, zl = 100;
function Gl(e) {
  const t = e.length;
  if (t === 0) return [];
  if (t === 1) return [[0, 0]];
  if (t === 2) return [[-e[0][1] / 2, 0], [e[0][1] / 2, 0]];
  const n = jl(e);
  let i = fr(n, e);
  for (let r = 0; r < Pl; r++) {
    Bl(n, e);
    const o = fr(n, e);
    if (i - o < Fl * i) break;
    i = o;
  }
  return Wl(n);
}
function Bl(e, t) {
  const n = e.length;
  for (let i = 0; i < n; i++) {
    let r = 0, o = 0, s = 0;
    for (let a = 0; a < n; a++) {
      if (i === a) continue;
      const l = t[i][a], c = 1 / (l * l);
      let u = e[i][0] - e[a][0], g = e[i][1] - e[a][1], f = Math.hypot(u, g);
      f < 1e-9 && (u = i < a ? -1 : 1, g = 0, f = 1), r += c * (e[a][0] + l * u / f), o += c * (e[a][1] + l * g / f), s += c;
    }
    e[i][0] = r / s, e[i][1] = o / s;
  }
}
function fr(e, t) {
  let n = 0;
  for (let i = 0; i < e.length; i++)
    for (let r = i + 1; r < e.length; r++) {
      const o = t[i][r], s = Math.hypot(e[i][0] - e[r][0], e[i][1] - e[r][1]) - o;
      n += s * s / (o * o);
    }
  return n;
}
function jl(e) {
  const t = e.length, n = e.map((g) => g.map((f) => f * f)), i = n.map((g) => g.reduce((f, p) => f + p, 0) / t), r = i.reduce((g, f) => g + f, 0) / t, o = n.map((g, f) => g.map((p, S) => -0.5 * (p - i[f] - i[S] + r))), s = dr(o, t, 1);
  Ul(o, s);
  const a = dr(o, t, 2), l = [];
  for (let g = 0; g < t; g++)
    l.push([s.vector[g] * Math.sqrt(s.value), a.vector[g] * Math.sqrt(a.value)]);
  let c = 0;
  for (const g of e) for (const f of g) c += f;
  const u = c / (t * (t - 1));
  return s.value === 0 ? l.forEach((g, f) => {
    g[0] = u * Math.cos(2 * Math.PI * f / t), g[1] = u * Math.sin(2 * Math.PI * f / t);
  }) : a.value === 0 && l.forEach((g, f) => {
    g[1] = 0.05 * u * Math.sin((f + 1) * 2.399);
  }), l;
}
function dr(e, t, n) {
  const i = Math.max(...e.map((s) => s.reduce((a, l) => a + Math.abs(l), 0)));
  let r = Hl(Array.from({ length: t }, (s, a) => Math.sin((a + 1) * (n + 0.618))));
  for (let s = 0; s < zl; s++) {
    const a = pr(e, r).map((c, u) => c + i * r[u]), l = Math.hypot(...a);
    if (l < 1e-12) break;
    r = a.map((c) => c / l);
  }
  const o = to(r, pr(e, r));
  return { value: o > 1e-9 ? o : 0, vector: r };
}
function Ul(e, t) {
  for (let n = 0; n < e.length; n++)
    for (let i = 0; i < e.length; i++)
      e[n][i] -= t.value * t.vector[n] * t.vector[i];
}
function pr(e, t) {
  return e.map((n) => to(n, t));
}
function to(e, t) {
  let n = 0;
  for (let i = 0; i < e.length; i++) n += e[i] * t[i];
  return n;
}
function Hl(e) {
  const t = Math.hypot(...e);
  return t > 0 ? e.map((n) => n / t) : e;
}
function Wl(e) {
  const t = e.reduce((i, r) => i + r[0], 0) / e.length, n = e.reduce((i, r) => i + r[1], 0) / e.length;
  return e.map(([i, r]) => [i - t, r - n]);
}
function Kl(e, t) {
  const n = Array.from({ length: e }, () => []);
  for (const [r, o, s] of t)
    n[r].push([o, s]), n[o].push([r, s]);
  const i = [];
  for (let r = 0; r < e; r++) {
    const o = new Array(e).fill(1 / 0), s = new Array(e).fill(!1);
    o[r] = 0;
    for (let a = 0; a < e; a++) {
      let l = -1;
      for (let c = 0; c < e; c++)
        !s[c] && (l === -1 || o[c] < o[l]) && (l = c);
      if (l === -1 || o[l] === 1 / 0) break;
      s[l] = !0;
      for (const [c, u] of n[l]) {
        const g = o[l] + u;
        g < o[c] && (o[c] = g);
      }
    }
    i.push(o);
  }
  return i;
}
const Vl = 12, $l = 100, ai = ["bottom", "right", "top", "left"], ql = { right: 0, bottom: Math.PI / 2, left: Math.PI, top: -Math.PI / 2 };
function Yl(e, t, n, i) {
  const r = [...e].sort((c, u) => Ut(c.id, u.id)), o = new Map(r.map((c) => [c.id, c])), s = new Map(r.map((c) => [c.id, /* @__PURE__ */ new Set()]));
  for (const [c, u] of t)
    c === u || !o.has(c) || !o.has(u) || (s.get(c).add(u), s.get(u).add(c));
  const a = r.filter((c) => s.get(c.id).size === 0), l = Xl(r, s).map((c) => Zl(c, s, n, i));
  return ou(l, a, i);
}
function Xl(e, t) {
  const n = new Map(e.map((o) => [o.id, o])), i = /* @__PURE__ */ new Set(), r = [];
  for (const o of e) {
    if (i.has(o.id) || t.get(o.id).size === 0) continue;
    const s = [o.id];
    i.add(o.id);
    for (let a = 0; a < s.length; a++)
      for (const l of [...t.get(s[a])].sort(Ut))
        i.has(l) || (i.add(l), s.push(l));
    r.push(s.sort(Ut).map((a) => n.get(a)));
  }
  return r;
}
function Zl(e, t, n, i) {
  const { gap: r } = i, o = 2 * r, s = Jl(e, t, n, i), a = /* @__PURE__ */ new Map();
  for (const x of s) for (const R of x.members) a.set(R.id, x);
  const l = [...e.filter((x) => !a.has(x.id)).map((x) => ({ node: x, x: 0, y: 0 })), ...s.map((x) => ({ block: x, x: 0, y: 0 }))], c = new Map(l.flatMap((x, R) => x.node ? [[x.node.id, R]] : [])), u = (x) => c.get(x) ?? l.findIndex((R) => R.block === a.get(x)), g = (x, R) => x.thickness / 2 + o + R.radius, f = (x) => x.anchors.length === 2 ? Math.max(x.length / 2 - x.cell / 2, 0) : 0, p = /* @__PURE__ */ new Map();
  for (const x of e)
    for (const R of t.get(x.id)) {
      const [F, B] = [u(x.id), u(R)];
      if (F === B) continue;
      const Q = F < B ? `${F}:${B}` : `${B}:${F}`;
      if (p.has(Q)) continue;
      const C = l[F].block ?? l[B].block, L = l[F].node ?? l[B].node, W = C ? Math.hypot(g(C, L), f(C)) : l[F].node.radius + l[B].node.radius + o;
      p.set(Q, [Math.min(F, B), Math.max(F, B), W]);
    }
  const S = Kl(l.length, [...p.values()]);
  for (const x of s) {
    if (x.anchors.length !== 2) continue;
    const [R, F] = x.anchors.map(u), B = Math.max(2 * f(x), gr(e, x.anchors[0]).radius + gr(e, x.anchors[1]).radius + r);
    S[R][F] = S[F][R] = Math.min(S[R][F], B);
  }
  const b = Gl(S);
  l.forEach((x, R) => {
    x.x = b[R][0], x.y = b[R][1];
  }), Ql(l, t, i);
  for (const x of s) tu(x, l, u, i);
  eu(l, r);
  const y = /* @__PURE__ */ new Map(), w = /* @__PURE__ */ new Map();
  for (const x of l)
    x.node && y.set(x.node.id, [x.x, x.y]), x.block && nu(x.block, x.x, x.y, y, w);
  for (const x of e)
    w.has(x.id) || w.set(x.id, iu(y.get(x.id), [...t.get(x.id)].map((R) => y.get(R))));
  let v = 1 / 0, E = 1 / 0, m = -1 / 0, I = -1 / 0;
  for (const x of e) {
    const [R, F] = y.get(x.id);
    v = Math.min(v, R - x.radius), E = Math.min(E, F - x.radius), m = Math.max(m, R + x.radius), I = Math.max(I, F + x.radius);
  }
  for (const [x, [R, F]] of y) y.set(x, [R - v, F - E]);
  const D = m - v, G = I - E;
  return { positions: y, labelSides: w, width: D, height: G, area: D * G, key: e[0].id };
}
function gr(e, t) {
  return e.find((n) => n.id === t);
}
function Jl(e, t, n, i) {
  const r = /* @__PURE__ */ new Map();
  for (const s of e) {
    const a = n.get(s.id), l = t.get(s.id);
    if (a === void 0 || l.size > 2) continue;
    const c = `${a}${[...l].sort(Ut).join(",")}`;
    r.set(c, [...r.get(c) ?? [], s]);
  }
  const o = [];
  for (const s of r.values()) {
    if (s.length < i.groupMin) continue;
    const a = [...t.get(s[0].id)].sort(Ut);
    if (a.length === 0) continue;
    s.sort((g, f) => Ut(g.sortKey, f.sortKey) || Ut(g.id, f.id));
    const l = 2 * Math.max(...s.map((g) => g.radius)) + i.gap, c = Math.min(s.length, Vl), u = Math.ceil(s.length / c);
    o.push({ members: s, anchors: a, cell: l, perLine: c, lines: u, length: c * l, thickness: u * l, vertical: !0, side: "right" });
  }
  return o;
}
function Ql(e, t, n) {
  if (e.length < 2) return;
  const i = e.reduce((y, w) => y + w.x, 0) / e.length, r = e.reduce((y, w) => y + w.y, 0) / e.length;
  let o = 0, s = 0, a = 0;
  for (const y of e) {
    const w = y.x - i, v = y.y - r;
    o += w * w, s += v * v, a += w * v;
  }
  const l = 0.5 * Math.atan2(2 * a, o - s), c = n.width >= n.height, u = (c ? 0 : Math.PI / 2) - l, [g, f] = [Math.cos(u), Math.sin(u)];
  for (const y of e) {
    const w = y.x - i, v = y.y - r;
    y.x = w * g - v * f, y.y = w * f + v * g;
  }
  const p = (y) => y.node ? t.get(y.node.id).size : 0, S = e.reduce((y, w) => p(w) > p(y) ? w : y, e[0]);
  if (c ? S.x > 0 : S.y > 0)
    for (const y of e)
      c ? y.x = -y.x : y.y = -y.y;
}
function tu(e, t, n, i) {
  const r = t.find((l) => l.block === e), o = e.anchors.map((l) => t[n(l)]), s = o.reduce((l, c) => l + c.x, 0) / o.length - r.x, a = o.reduce((l, c) => l + c.y, 0) / o.length - r.y;
  e.vertical = i.direction === "column" || i.direction === "auto" && Math.abs(s) >= Math.abs(a), e.side = e.vertical ? s <= 0 ? "right" : "left" : a <= 0 ? "bottom" : "top";
}
function mr(e, t) {
  if (e.node) return [e.node.radius + t / 2, e.node.radius + t / 2];
  const n = e.block;
  return n.vertical ? [n.thickness / 2, n.length / 2] : [n.length / 2, n.thickness / 2];
}
function eu(e, t) {
  for (let n = 0; n < $l; n++) {
    let i = !1;
    for (let r = 0; r < e.length; r++)
      for (let o = r + 1; o < e.length; o++) {
        const [s, a] = [e[r], e[o]], [l, c] = mr(s, t), [u, g] = mr(a, t), f = a.x - s.x, p = a.y - s.y, S = l + u - Math.abs(f), b = c + g - Math.abs(p);
        if (!(S <= 0 || b <= 0))
          if (i = !0, S < b) {
            const y = (f < 0 ? -1 : 1) * S / 2;
            s.x -= y, a.x += y;
          } else {
            const y = (p < 0 ? -1 : 1) * b / 2;
            s.y -= y, a.y += y;
          }
      }
    if (!i) return;
  }
}
function nu(e, t, n, i, r) {
  const { members: o, perLine: s, lines: a, cell: l } = e;
  o.forEach((c, u) => {
    const g = Math.floor(u / s), f = g < a - 1 ? s : o.length - s * (a - 1), p = (g - (a - 1) / 2) * l, S = (u % s - (f - 1) / 2) * l;
    i.set(c.id, e.vertical ? [t + p, n + S] : [t + S, n + p]), r.set(c.id, e.side);
  });
}
function iu(e, t) {
  if (t.length === 0) return ai[0];
  const n = t.map(([o, s]) => Math.atan2(s - e[1], o - e[0]));
  let i = ai[0], r = -1;
  for (const o of ai) {
    const s = Math.min(...n.map((a) => ru(a, ql[o])));
    s > r + 1e-6 && (i = o, r = s);
  }
  return i;
}
function ru(e, t) {
  const n = Math.abs(e - t) % (2 * Math.PI);
  return n > Math.PI ? 2 * Math.PI - n : n;
}
function ou(e, t, n) {
  const { gap: i, width: r, height: o } = n, s = 3 * i, a = [...e].sort((w, v) => v.area - w.area || Ut(w.key, v.key)), l = 2 * Math.max(0, ...t.map((w) => w.radius)) + i, c = /* @__PURE__ */ new Set();
  let u = 0;
  for (const w of a)
    u += (u > 0 ? s : 0) + w.width, c.add(u), c.add(w.width);
  c.size === 0 && c.add(0);
  let g;
  for (const w of [...c].sort((v, E) => v - E))
    for (const v of au(su(a, w, s), t.length, l, s, n.trayPosition)) {
      const E = Math.min(r / Math.max(v.width, 1), o / Math.max(v.height, 1));
      (!g || E > g.scale + 1e-9) && (g = { ...v, scale: E });
    }
  const f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ new Map(), S = r / 2 - g.width / 2, b = o / 2 - g.height / 2;
  for (const { component: w, x: v, y: E } of g.placed) {
    for (const [m, [I, D]] of w.positions) f.set(m, { x: S + v + I, y: b + E + D });
    for (const [m, I] of w.labelSides) p.set(m, I);
  }
  const y = g.tray;
  return t.slice().sort((w, v) => Ut(w.sortKey, v.sortKey) || Ut(w.id, v.id)).forEach((w, v) => {
    const E = y.perRow > 0 ? v % y.perRow : 0, m = y.perRow > 0 ? Math.floor(v / y.perRow) : v;
    f.set(w.id, { x: S + y.x + E * l + l / 2, y: b + y.y + m * l + l / 2 }), p.set(w.id, "bottom");
  }), { positions: f, labelSides: p };
}
function su(e, t, n) {
  const i = [];
  let r = [], o = 0;
  for (const u of e) {
    const g = o + (r.length ? n : 0) + u.width;
    r.length && g > t + 1e-6 && (i.push(r), r = [], o = 0), o += (r.length ? n : 0) + u.width, r.push(u);
  }
  r.length && i.push(r);
  const s = (u) => u.reduce((g, f) => g + f.width, 0) + n * (u.length - 1), a = Math.max(0, ...i.map(s)), l = [];
  let c = 0;
  for (const u of i) {
    const g = Math.max(...u.map((p) => p.height));
    let f = (a - s(u)) / 2;
    for (const p of u)
      l.push({ component: p, x: f, y: c + (g - p.height) / 2 }), f += p.width + n;
    c += g + n;
  }
  return { placed: l, width: a, height: i.length ? c - n : 0 };
}
function au(e, t, n, i, r) {
  if (t === 0) return [{ ...e, tray: { x: 0, y: 0, perRow: 0 } }];
  if (e.placed.length === 0)
    return Array.from({ length: t }, (a, l) => {
      const c = l + 1;
      return { ...e, width: c * n, height: Math.ceil(t / c) * n, tray: { x: 0, y: 0, perRow: c } };
    });
  if (r === "right") {
    const a = Math.ceil(t / Math.max(1, Math.floor(e.height / n)));
    return [{ ...e, width: e.width + i + a * n, height: Math.max(e.height, Math.ceil(t / a) * n), tray: { x: e.width + i, y: 0, perRow: a } }];
  }
  const o = Math.max(1, Math.floor(e.width / n)), s = Math.min(t, o);
  return [{ ...e, width: Math.max(e.width, s * n), height: e.height + i + Math.ceil(t / o) * n, tray: { x: (Math.max(e.width, s * n) - s * n) / 2, y: e.height + i, perRow: o } }];
}
function Ut(e, t) {
  return e < t ? -1 : e > t ? 1 : 0;
}
const cu = { type: "structured", groupMin: 3, direction: "auto", gap: 30, trayPosition: "bottom", labelSides: !0 }, lu = { width: 1e3, height: 800 }, uu = 10;
class Se {
  constructor(t, n, i, r = {}, o) {
    M(this, "graph");
    M(this, "simulationForces");
    M(this, "options");
    M(this, "originalStrengths");
    M(this, "links");
    M(this, "labelSides", /* @__PURE__ */ new Map());
    this.graph = t, this.simulationForces = i, this.options = Ze({}, cu, r), this.links = o, this.originalStrengths = { link: i.link.strength(), charge: i.charge.strength(), gravity: i.gravity.strength() }, this.update(), this.registerForces();
  }
  update() {
    const t = this.graph.getCanvasNodes(), n = this.links().map((o) => [o.source, o.target]), i = Yl(t.map((o) => this.arrangeNode(o)), n.map(([o, s]) => [o.id, s.id]), this.groupKeys(t, n), { ...this.options, ...this.canvasSize() }), r = [];
    for (const o of t) {
      const s = i.positions.get(o.id);
      if (!s) continue;
      o.x = o.fx = s.x, o.y = o.fy = s.y, o.vx = o.vy = 0;
      const a = i.labelSides.get(o.id);
      this.labelSides.has(o.id) && this.labelSides.get(o.id) !== a && r.push(o);
    }
    return this.labelSides = i.labelSides, this.options.labelSides ? r : [];
  }
  getLabelSide(t) {
    return this.options.labelSides ? this.labelSides.get(t) : void 0;
  }
  unregisterLayout() {
    this.simulationForces.link.strength(this.originalStrengths.link), this.simulationForces.charge.strength(this.originalStrengths.charge), this.simulationForces.gravity.strength(this.originalStrengths.gravity);
    for (const t of [...this.graph.getMutableNodes(), ...this.graph.simplify.getDrawnGroups()])
      delete t.fx, delete t.fy;
    this.labelSides.clear();
  }
  registerForces() {
    this.simulationForces.link.strength(0), this.simulationForces.charge.strength(0), this.simulationForces.gravity.strength(0);
  }
  arrangeNode(t) {
    var r;
    const n = t.expanded ? t.getCircleRadius() : t.getLayoutRadius(), i = (r = t.getData()) == null ? void 0 : r.label;
    return { id: t.id, radius: Number.isFinite(n) && n > 0 ? n : uu, sortKey: typeof i == "string" ? i : t.id };
  }
  groupKeys(t, n) {
    const i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
    for (const [o, s] of n)
      o !== s && (r.set(o, [...r.get(o) ?? [], s]), i.set(s, [...i.get(s) ?? [], o]));
    return Ll({ nodes: t, inNeighbours: (o) => i.get(o) ?? [], outNeighbours: (o) => r.get(o) ?? [], typeOf: (o) => this.graph.simplify.typeOf(o), groupOf: () => {
    } });
  }
  canvasSize() {
    var n;
    const t = (n = this.graph.renderer.getCanvas()) == null ? void 0 : n.getBoundingClientRect();
    return t && t.width > 0 && t.height > 0 ? { width: t.width, height: t.height } : lu;
  }
}
function hu(e) {
  var n;
  const t = (n = e.getData()) == null ? void 0 : n.label;
  return typeof t == "string" ? t : "";
}
const yr = 0.3, fu = 1, vr = 4, du = 400, pu = 24, gu = 6.5, mu = 10, yu = 140, vu = 1.15, _u = 0.35, bu = 0.35, wu = 58e-4, Su = 38, eo = 95, Tu = 300, Au = 0.35, xu = 8, Eu = 10, Mu = 0.54, _r = 24, Iu = 62, Nu = 0.2, Ru = 240, Cu = 0.9, wn = 1e-3, Du = 0.06, Ou = 0.03, ku = 8, br = 2e-3;
function Me(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function en(e) {
  return Me(e, 0, 1);
}
function kn(e, t) {
  const [n, i] = ct[t];
  return Me(e, n, i);
}
function Lu(e) {
  return yr + (fu - yr) * no(e);
}
function no(e) {
  return en(Math.log10(Math.max(e, 1) / vr) / Math.log10(du / vr));
}
function io(e) {
  const t = 10 + Math.sqrt(Math.max(0, e - 10));
  return t * t / 100;
}
function Fu(e, t) {
  const n = Math.pow(Math.max(1, t) / Eu, Mu), i = Su * Math.pow(Tu / Math.max(1, e), Au);
  return Me(i * n, xu, eo);
}
function Pu(e, t, n) {
  const i = e / io(t);
  return Me(i / 400 * 100, Fu(n, t), eo);
}
function zu(e, t) {
  return e / 100 * 400 * io(t);
}
function Gu(e) {
  const t = (e - 0.6) / 1.7999999999999998;
  return kn(4 + t * 56, "collisionRadius");
}
function Bu(e, t, n, i) {
  const r = Math.max(1, Cu * 0.5 * Math.min(t.width, t.height)), o = Ru * n * e / (r * r * r), s = wn + (Ou - wn) * Math.pow(1 - no(n), 3), a = wn + (Du - wn) * en(i), l = Math.max(s, a), c = Me(o, br, Math.max(br, l));
  return kn(100 * Math.sqrt(en(c / Nu)), "centering");
}
function ju(e) {
  return kn(1.2 + 0.8 * Math.log10(Math.max(e, 1)), "settleTime");
}
function Uu(e) {
  const t = en(Math.log10(Math.max(e, 1) / 4) / Math.log10(125));
  return _r + (Iu - _r) * t;
}
function Hu(e) {
  return { repulsion: Math.round(e.repulsion), linkDistance: Math.round(e.linkDistance), collisionRadius: Math.round(e.collisionRadius), friction: Math.round(e.friction), centering: Math.round(e.centering), settleTime: Math.round(e.settleTime * 10) / 10 };
}
function Wu(e) {
  const t = Lu(e.nodeCount) * e.canvas.width * e.canvas.height;
  return { targetArea: t, spacing: Math.sqrt(t / Math.max(1, e.nodeCount)) };
}
function Ku(e) {
  const { spacing: t } = Wu(e), n = Math.max(1, e.radii.mean), i = Math.max(0.8 * t, gu * n), r = 2 * n + pu, o = Math.min(ct.linkDistance[1], mu * n + yu), s = kn(Me(i, r, Math.max(r, o)), "linkDistance"), a = wu * t * t, l = e.radii.totalArea / Math.max(1, e.nodeCount * s * s), c = vu + _u * en(l / bu), u = Pu(a, n, e.nodeCount);
  return Hu({ repulsion: u, linkDistance: s, collisionRadius: Gu(c), friction: Uu(e.nodeCount), centering: Bu(zu(u, n), e.canvas, e.nodeCount, e.looseNodeFraction), settleTime: ju(e.nodeCount) });
}
function Vu(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const s of e) n.set(s, s);
  const i = (s) => {
    let a = s;
    for (; n.get(a) !== a; ) a = n.get(a);
    let l = s;
    for (; n.get(l) !== a; ) {
      const c = n.get(l);
      n.set(l, a), l = c;
    }
    return a;
  };
  let r = e.length;
  for (const [s, a] of t) {
    if (!n.has(s) || !n.has(a)) continue;
    const l = i(s), c = i(a);
    l !== c && (n.set(l, c), r--);
  }
  let o = 0;
  if (r > 1) {
    const s = /* @__PURE__ */ new Map();
    for (const a of e) {
      const l = i(a);
      s.set(l, (s.get(l) ?? 0) + 1);
    }
    for (const a of s.values())
      a < ku && (o += a);
  }
  return { count: r, looseNodeFraction: e.length ? o / e.length : 0 };
}
const Ke = { d3Alpha: 1, d3AlphaMin: 1e-3, d3AlphaDecay: 0.05, d3AlphaTarget: 0, d3VelocityDecay: 0.45, d3LinkDistance: 40, d3LinkStrength: null, d3ManyBodyStrength: -150, d3ManyBodyTheta: 0.9, d3CollideRadius: 12, d3CollideRadiusMultiplier: 1.2, d3CollideStrength: 1, d3CollideIterations: 1, d3GravityStrength: 0.1, d3GravityStrengthConnected: 1e-3, enabled: !0, cooldownTime: 2e3, useWorker: !0, warmupTicks: "auto", freezeNodesOnDrag: !0, gridSnappingEnabled: !1, gridSize: 50, fitViewOnExpandCollapse: !1, layout: { type: "force" }, callbacks: { onInit: () => {
}, onStart: () => {
}, onStop: () => {
}, onTick: () => {
} } }, ct = { repulsion: [0, 100], linkDistance: [40, 600], collisionRadius: [4, 60], friction: [0, 100], centering: [0, 100], settleTime: [0.5, 8] }, Nn = [0.5, 10], $u = "MaxReachability", qu = { levelSpacing: 1, siblingSpacing: 1 }, Yu = { tight: { repulsion: 32, linkDistance: 70, collisionRadius: 16, friction: 45, centering: 7, settleTime: 3 }, loose: { repulsion: 70, linkDistance: 150, collisionRadius: 26, friction: 28, centering: 7, settleTime: 2.25 } }, N = class N {
  constructor(t, n = {}) {
    M(this, "simulation");
    M(this, "graph");
    M(this, "container");
    M(this, "graphInteraction");
    M(this, "layout");
    M(this, "containerBCR");
    M(this, "containerObserver");
    M(this, "animationFrameId", null);
    M(this, "startSimulationTime", 0);
    M(this, "engineRunning", !1);
    M(this, "slowTickThresholdReached", !1);
    M(this, "avgTickDuration", 0);
    M(this, "SLOW_TICK_THRESHOLD", 33);
    M(this, "dragInProgress", !1);
    M(this, "dragSelection", []);
    M(this, "totalTickCount", 0);
    M(this, "runTickCount", 0);
    M(this, "options");
    M(this, "callbacks");
    M(this, "simulationForces");
    M(this, "scaledForces", { d3ManyBodyStrength: Ke.d3ManyBodyStrength, d3CollideStrength: Ke.d3CollideStrength });
    M(this, "physicsKnobs");
    M(this, "autoEnabled");
    M(this, "autoTuneTimer", null);
    M(this, "applyingAutoKnobs", !1);
    M(this, "suppressReheat", !1);
    M(this, "autoLastRun", null);
    M(this, "heldCanvas");
    if (this.graph = t, this.autoEnabled = N.shouldAutoTune(n), this.options = Ze({}, Ke, n), this.callbacks = this.options.callbacks ?? {}, this.physicsKnobs = N.knobsFromOptions(this.options), this.container = this.graph.renderer.getRootContainer(), !this.container) throw new Error("Root container is not defined in the graph renderer.");
    if (this.containerBCR = N.measureContainer(this.container), this.graphInteraction = this.graph.renderer.getGraphInteraction(), !this.graphInteraction) throw new Error("Graph interaction is not available.");
    const i = N.initSimulationForces(this.options, this.containerBCR);
    this.simulation = i.simulation, this.simulationForces = i.simulationForces, this.simulation.force("groupCohesion", Gr(() => this.graph.simplify.getOpenGroupNodes())), this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength || Ke.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = this.options.d3CollideStrength || Ke.d3CollideStrength, this.options.layout.type === "tree" ? this.layout = new q(this.graph, this.simulation, this.simulationForces, this.options.layout) : this.options.layout.type === "egoTree" ? this.layout = new fe(this.graph, this.simulation, this.simulationForces, this.options.layout) : this.options.layout.type === "structured" && (this.layout = this.createStructuredLayout(this.options.layout)), this.treeLayout && Object.assign(this.options.layout, this.treeLayout.getSpacing()), this.observeContainer(), this.callbacks.onInit && this.callbacks.onInit(this);
  }
  static measureContainer(t) {
    const n = t.getBoundingClientRect();
    if (n.width > 0 && n.height > 0) return n;
    const { width: i, height: r } = N.FALLBACK_CONTAINER_SIZE;
    return new DOMRect(n.x, n.y, i, r);
  }
  observeContainer() {
    !this.container || typeof ResizeObserver > "u" || (this.containerObserver = new ResizeObserver(() => {
      if (!this.container) return;
      const t = N.measureContainer(this.container);
      t.width === this.containerBCR.width && t.height === this.containerBCR.height || (this.containerBCR = t, N.initSimulationForceGravity(this.simulationForces.gravity, this.options, t), this.scheduleTune());
    }), this.containerObserver.observe(this.container));
  }
  destroy() {
    var t;
    this.stop(), (t = this.containerObserver) == null || t.disconnect(), this.containerObserver = void 0, this.container = void 0;
  }
  static initSimulationForces(t, n) {
    const i = { link: Xo(), charge: fs(), collide: qo(), gravity: ds() }, r = hs().force("link", i.link).force("charge", i.charge).force("collide", i.collide).force("gravity", i.gravity);
    return this.initSimulationForceGravity(i.gravity, t, n), this.initSimulationForceLink(i.link, t), this.initSimulationForceCharge(i.charge, t), this.initSimulationForceCollide(i.collide, t), r.stop(), r.alphaMin(t.d3AlphaMin), r.alphaDecay(t.d3AlphaDecay), r.alphaTarget(0), r.velocityDecay(t.d3VelocityDecay), { simulation: r, simulationForces: i };
  }
  static initSimulationForceGravity(t, n, i) {
    t.x(i.width / 2).y(i.height / 2).strength((r) => (r.degree() ?? 0) === 0 ? n.d3GravityStrength : n.d3GravityStrengthConnected);
  }
  static initSimulationForceLink(t, n) {
    t.distance((i) => {
      const r = i.__clusterAnchorDistance;
      if (r != null) return r;
      const o = hu(i);
      if (!o || o === "")
        return n.d3LinkDistance;
      const s = o.length * 10;
      return Math.max(n.d3LinkDistance, s);
    }), n.d3LinkStrength && t.strength(n.d3LinkStrength);
  }
  static initSimulationForceCharge(t, n) {
    t.theta(n.d3ManyBodyTheta).strength((i) => {
      const r = i, o = n.d3ManyBodyStrength, s = r.expanded ? r.getCircleRadiusCollapsed() : r.getLayoutRadius(), a = 10 + Math.sqrt(Math.max(0, s - 10));
      let l = r.weight ?? 1;
      return l *= r.isParent ? 10 : 1, o * (a * a) / 100 * l;
    });
  }
  static initSimulationForceCollide(t, n) {
    const i = n.d3CollideRadiusMultiplier;
    t.radius((r) => {
      const o = r;
      if (o.expanded)
        return i * o.getCircleRadius() + 20;
      const s = o.getLayoutRadius();
      return s ? i * s : n.d3CollideRadius;
    }).strength(n.d3CollideStrength);
  }
  static initSimulationForceClusterRadialConstraint(t, n) {
    t.strength(n.d3CollideStrength);
  }
  update() {
    this.layout instanceof Se ? this.relayoutStructured() : this.layout ? (this.layout.update(), Object.assign(this.options.layout, this.layout.getSpacing())) : this.scheduleTune();
    const t = this.graph.getCanvasNodes(), n = this.getActiveEdges();
    this.heldCanvas !== void 0 && this.heldCanvas !== N.canvasKey(t, n) && (this.heldCanvas = void 0), this.simulation.nodes(t);
    const i = this.simulation.force("link");
    i && i.id((r) => r.id).links(n), this.restart();
  }
  getActiveEdges() {
    const t = [];
    for (const n of this.graph.getClusterPulls()) {
      const i = this.graph.getCanvasNode(n.source.id), r = this.graph.getCanvasNode(n.target.id);
      if (!(i != null && i.onCanvas) || !(r != null && r.onCanvas)) continue;
      const o = n.reachesInto[0] || n.reachesInto[1];
      if (n.edge && !o && n.edge.from === i && n.edge.to === r) {
        t.push(n.edge);
        continue;
      }
      t.push(this.clusterLink(i, r, n.reachesInto));
    }
    return t;
  }
  clusterLink(t, n, i) {
    const r = (i[0] ? t.getCircleRadius() : 0) + (i[1] ? n.getCircleRadius() : 0);
    return { id: `cluster-pull-${t.id}-${n.id}`, source: t, target: n, __clusterAnchorDistance: r + this.options.d3LinkDistance };
  }
  enable() {
    this.avgTickDuration = 0, this.options.enabled = !0, this.start(!1);
  }
  disable() {
    this.options.enabled = !1, this.stop();
  }
  pause() {
    this.engineRunning = !1, this.slowTickThresholdReached = !1;
  }
  restart() {
    this.startSimulationTime = (/* @__PURE__ */ new Date()).getTime(), this.runTickCount = 0, this.engineRunning = !0, this.slowTickThresholdReached = !1;
  }
  async start(t = !0) {
    if (t && (this.heldCanvas = this.options.warmupTicks === 0 ? N.canvasKey(this.graph.getCanvasNodes(), this.getActiveEdges()) : void 0, await Promise.resolve(), this.tuneNow({ reheat: !1 }), await this.runSimulationWorkerRouter()), !this.options.enabled) {
      this.engineRunning = !1;
      return;
    }
    this.engineRunning = !0, this.slowTickThresholdReached = !1, this.callbacks.onStart && this.callbacks.onStart(this), this.animationFrameId === null && this.startAnimationLoop();
  }
  stop() {
    this.engineRunning = !1, this.autoTuneTimer !== null && (clearTimeout(this.autoTuneTimer), this.autoTuneTimer = null), this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.simulation.stop(), this.callbacks.onStop && this.callbacks.onStop(this);
  }
  startAnimationLoop() {
    const t = () => {
      this.animationFrameId = requestAnimationFrame(t), this.simulationTick();
    };
    this.engineRunning = !0, this.simulation.alpha(0.01).restart(), this.animationFrameId = requestAnimationFrame(t);
  }
  simulationTick() {
    if (this.engineRunning) {
      !this.dragInProgress && this.cooledDown() && (this.engineRunning = !1, this.simulation.stop(), this.callbacks.onStop && this.callbacks.onStop(this)), this.totalTickCount++, this.runTickCount++;
      const t = performance.now();
      this.simulation.tick(), this.graph.nextTick(), this.updateTickMetrics(performance.now() - t), this.callbacks.onTick && this.callbacks.onTick(this), this.graphInteraction.simulationTick(), this.totalTickCount % 10 === 0 && this.graphInteraction.simulationSlowTick();
    }
  }
  cooledDown() {
    const t = this.options.cooldownTime / 1e3 * N.NOMINAL_FPS;
    return this.runTickCount >= t || this.options.d3AlphaMin > 0 && this.simulation.alpha() < this.options.d3AlphaMin ? !0 : (/* @__PURE__ */ new Date()).getTime() - this.startSimulationTime > this.options.cooldownTime * N.COOLDOWN_WALL_GRACE;
  }
  updateTickMetrics(t) {
    var n;
    this.avgTickDuration = this.avgTickDuration * 0.9 + t * 0.1, this.avgTickDuration > this.SLOW_TICK_THRESHOLD && (this.slowTickThresholdReached = !0, this.disable(), this.graph.UIManager.showNotification({ level: "warning", title: this.graph.i18n.t("simulation.slow.title"), message: this.graph.i18n.t("simulation.slow.message") }), (n = this.graph.UIManager.physicsFlyout) == null || n.syncRunState());
  }
  async waitForSimulationStop() {
    if (this.engineRunning)
      return new Promise((t) => {
        const n = this.callbacks.onStop;
        this.callbacks.onStop = (i) => {
          n == null || n(i), this.callbacks.onStop = n, t();
        };
      });
  }
  isEnabled() {
    return this.options.enabled;
  }
  applyComputedPositions(t) {
    const n = new Map(t.map((i) => [i.id, i]));
    for (const i of [...this.graph.getMutableNodes(), ...this.graph.simplify.getDrawnGroups()]) {
      const r = n.get(i.id);
      r && (i.x = r.x, i.y = r.y, i.fx = typeof r.fx == "number" ? r.fx : void 0, i.fy = typeof r.fy == "number" ? r.fy : void 0);
    }
  }
  async computeGraph(t = {}) {
    const { runSimulation: n } = await Promise.resolve().then(() => Ju), i = this.containerBCR, r = this.graph.getMutableNodes(), o = [...this.graph.getNodes().filter((u) => {
      var g;
      return !((g = this.graph.getMutableNode(u.id)) != null && g.foldedInto);
    }), ...this.graph.simplify.getDrawnGroups()], s = [...this.graph.getEdges(), ...this.graph.getDrawnEdges().filter((u) => u.isSynthetic)], { callbacks: a, ...l } = this.options;
    Object.assign(l, t);
    const { nodes: c } = n(o, s, l, i, this.openGroupMemberIds());
    this.applyComputedPositions(c), this.graph.updateData(r, void 0, !1);
  }
  async runSimulationWorkerRouter(t = {}) {
    if (this.layout instanceof Se) {
      this.relayoutStructured(), this.graph.updateLayoutProgress(100, 0, "done");
      return;
    }
    if (this.options.useWorker)
      try {
        await this.runSimulationWorker(t);
        return;
      } catch (n) {
        this.options.useWorker = !1, console.warn("[Pivotick] Simulation Web Worker unavailable (often a CSP blocking blob workers); falling back to the main thread. Set `simulation.useWorker: false` to silence this.", n);
      }
    await this.computeGraph(t), this.graph.updateLayoutProgress(100, 0, "done");
  }
  async runSimulationWorker(t = {}) {
    const n = this.containerBCR, i = this.graph.getMutableNodes(), r = [...this.graph.getNodes().filter((g) => {
      var f;
      return !((f = this.graph.getMutableNode(g.id)) != null && f.foldedInto);
    }), ...this.graph.simplify.getDrawnGroups()].map((g) => g.toSimulationDTO()), o = this.graph.getDrawnEdges().filter((g) => g.isSynthetic), s = [...this.graph.getEdges(), ...o].map((g) => g.toSimulationDTO()), a = (g, f) => {
      this.graph.updateLayoutProgress(g, f, "simulation");
    }, { callbacks: l, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: u } = await qc(r, s, c, n, a, this.openGroupMemberIds());
    this.graph.updateLayoutProgress(100, 0, "rendering"), this.applyComputedPositions(u), this.graph.updateData(i, void 0, !1), this.graph.updateLayoutProgress(100, 0, "done");
  }
  openGroupMemberIds() {
    return this.graph.simplify.getOpenGroupNodes().map((t) => t.parts.filter((n) => n.canvasRepresentative() === n && n.onCanvas).map((n) => n.id));
  }
  reheat(t = 0.7) {
    this.restart(), this.simulation.alpha(t).restart();
  }
  refreshForcesAndReheat(t = 0.5) {
    if (this.layout instanceof Se && (this.relayoutStructured(), this.graph.nextTick()), !this.options.enabled) return;
    this.tuneNow({ reheat: !1 });
    const n = this.graph.getCanvasNodes();
    this.simulation.nodes(n), this.reheat(t);
  }
  setRepulsion(t) {
    const n = N.clamp(t, ct.repulsion);
    this.physicsKnobs.repulsion = n, this.options.d3ManyBodyStrength = N.mapLinear(n, ct.repulsion, N.REPULSION_STRENGTH_RANGE), this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength, N.initSimulationForceCharge(this.simulationForces.charge, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setLinkDistance(t) {
    const n = N.clamp(t, ct.linkDistance);
    this.physicsKnobs.linkDistance = n, this.options.d3LinkDistance = N.mapLinear(n, ct.linkDistance, N.LINK_DISTANCE_RANGE), N.initSimulationForceLink(this.simulationForces.link, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setCollisionRadius(t) {
    const n = N.clamp(t, ct.collisionRadius);
    this.physicsKnobs.collisionRadius = n, this.options.d3CollideRadiusMultiplier = N.mapLinear(n, ct.collisionRadius, N.COLLIDE_MULTIPLIER_RANGE), N.initSimulationForceCollide(this.simulationForces.collide, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setFriction(t) {
    const n = N.clamp(t, ct.friction);
    this.physicsKnobs.friction = n, this.options.d3VelocityDecay = N.mapLinear(n, ct.friction, N.FRICTION_DECAY_RANGE), this.simulation.velocityDecay(this.options.d3VelocityDecay), this.noteManualKnobEdit();
  }
  setCentering(t) {
    const n = N.clamp(t, ct.centering);
    this.physicsKnobs.centering = n, this.options.d3GravityStrengthConnected = N.gravityForCentering(n), this.options.d3GravityStrength = N.isolatedGravityFor(this.options.d3GravityStrengthConnected), N.initSimulationForceGravity(this.simulationForces.gravity, this.options, this.containerBCR), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setSettleTime(t) {
    const n = N.clamp(t, ct.settleTime);
    this.physicsKnobs.settleTime = n, this.options.d3AlphaDecay = N.alphaDecayForSettleTime(n, this.options.d3AlphaMin), this.options.cooldownTime = n * 1e3, this.simulation.alphaDecay(this.options.d3AlphaDecay), this.noteManualKnobEdit();
  }
  applyPhysicsPreset(t) {
    this.disableAutoPhysics(), this.writeKnobs(Yu[t]), this.reheatIfEnabled(N.CLICK_REHEAT_ALPHA);
  }
  writeKnobs(t) {
    this.physicsKnobs = { ...t }, this.options.d3ManyBodyStrength = N.mapLinear(t.repulsion, ct.repulsion, N.REPULSION_STRENGTH_RANGE), this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength, this.options.d3LinkDistance = N.mapLinear(t.linkDistance, ct.linkDistance, N.LINK_DISTANCE_RANGE), this.options.d3CollideRadiusMultiplier = N.mapLinear(t.collisionRadius, ct.collisionRadius, N.COLLIDE_MULTIPLIER_RANGE), this.options.d3VelocityDecay = N.mapLinear(t.friction, ct.friction, N.FRICTION_DECAY_RANGE), this.options.d3GravityStrengthConnected = N.gravityForCentering(t.centering), this.options.d3GravityStrength = N.isolatedGravityFor(this.options.d3GravityStrengthConnected), this.options.d3AlphaDecay = N.alphaDecayForSettleTime(t.settleTime, this.options.d3AlphaMin), this.options.cooldownTime = t.settleTime * 1e3, N.initSimulationForceCharge(this.simulationForces.charge, this.options), N.initSimulationForceLink(this.simulationForces.link, this.options), N.initSimulationForceCollide(this.simulationForces.collide, this.options), N.initSimulationForceGravity(this.simulationForces.gravity, this.options, this.containerBCR), this.simulation.velocityDecay(this.options.d3VelocityDecay), this.simulation.alphaDecay(this.options.d3AlphaDecay);
  }
  getPhysicsKnobs() {
    return { ...this.physicsKnobs };
  }
  getLayoutType() {
    return this.options.layout.type;
  }
  get treeLayout() {
    return this.layout instanceof q ? this.layout : void 0;
  }
  relayoutStructured() {
    if (!(this.layout instanceof Se)) return;
    const t = this.layout.update().filter((n) => n.getGraphElement());
    t.length && (t.forEach((n) => n.markDirty()), this.graph.renderer.update(!1));
  }
  createStructuredLayout(t) {
    return new Se(this.graph, this.simulation, this.simulationForces, t, () => this.getActiveEdges());
  }
  getLabelSide(t) {
    return this.layout instanceof Se ? this.layout.getLabelSide(t) : void 0;
  }
  getTreeSpacing() {
    var t;
    return ((t = this.treeLayout) == null ? void 0 : t.getSpacing()) ?? { ...qu };
  }
  setTreeSpacing(t) {
    const n = this.treeLayout;
    if (!n) return;
    const i = {};
    t.levelSpacing !== void 0 && (i.levelSpacing = N.clamp(t.levelSpacing, Nn)), t.siblingSpacing !== void 0 && (i.siblingSpacing = N.clamp(t.siblingSpacing, Nn)), n.setSpacing(i), Object.assign(this.options.layout, i, { spacing: "manual" }), this.graph.nextTick(), this.reheatIfEnabled();
  }
  getTreeRoot() {
    var t;
    return ((t = this.treeLayout) == null ? void 0 : t.getRoot()) ?? { algorithm: $u };
  }
  setTreeRoot(t) {
    const n = this.treeLayout;
    if (!n) return;
    n.setRoot(t);
    const i = n.getRoot();
    Object.assign(this.options.layout, { rootId: i.rootId, rootIdAlgorithmFinder: i.algorithm }), this.graph.nextTick(), this.reheatIfEnabled();
  }
  isAutoTreeSpacingEnabled() {
    var t;
    return ((t = this.treeLayout) == null ? void 0 : t.isAutoSpacing()) ?? !1;
  }
  enableAutoTreeSpacing() {
    const t = this.treeLayout;
    t && (t.enableAutoSpacing(), Object.assign(this.options.layout, { spacing: "auto" }), this.graph.nextTick(), this.reheatIfEnabled());
  }
  reheatIfEnabled(t = 0.5) {
    this.suppressReheat || this.options.enabled && this.reheat(t);
  }
  static clamp(t, [n, i]) {
    return Math.max(n, Math.min(i, t));
  }
  static mapLinear(t, n, i) {
    const r = (t - n[0]) / (n[1] - n[0]);
    return i[0] + r * (i[1] - i[0]);
  }
  static knobsFromOptions(t) {
    const n = (r, o, s) => Math.round(N.clamp(N.mapLinear(r, o, ct[s]), ct[s])), i = N.settleTimeFromAlphaDecay(t.d3AlphaDecay, t.d3AlphaMin);
    return { repulsion: n(t.d3ManyBodyStrength, N.REPULSION_STRENGTH_RANGE, "repulsion"), linkDistance: n(t.d3LinkDistance, N.LINK_DISTANCE_RANGE, "linkDistance"), collisionRadius: n(t.d3CollideRadiusMultiplier, N.COLLIDE_MULTIPLIER_RANGE, "collisionRadius"), friction: n(t.d3VelocityDecay, N.FRICTION_DECAY_RANGE, "friction"), centering: Math.round(N.clamp(N.centeringFromGravity(t.d3GravityStrengthConnected), ct.centering)), settleTime: Math.round(N.clamp(i, ct.settleTime) * 10) / 10 };
  }
  static gravityForCentering(t) {
    const n = t / ct.centering[1];
    return N.CENTERING_STRENGTH_MAX * n * n;
  }
  static centeringFromGravity(t) {
    const n = Math.sqrt(Math.max(0, t) / N.CENTERING_STRENGTH_MAX);
    return ct.centering[1] * n;
  }
  static isolatedGravityFor(t) {
    const [n, i] = N.CENTERING_ISOLATED_RANGE;
    return Math.max(n, Math.min(i, t * N.CENTERING_ISOLATED_MULTIPLE));
  }
  static alphaDecayForSettleTime(t, n) {
    const i = Math.max(1, t * N.NOMINAL_FPS), r = Math.min(0.999, Math.max(1e-6, n));
    return 1 - Math.pow(r, 1 / i);
  }
  static settleTimeFromAlphaDecay(t, n) {
    const i = Math.min(0.999, Math.max(1e-6, n)), r = Math.min(0.999, Math.max(1e-6, t));
    return Math.log(i) / Math.log(1 - r) / N.NOMINAL_FPS;
  }
  static shouldAutoTune(t) {
    return t.physics === "auto" ? !0 : t.physics === "manual" ? !1 : !N.AUTO_OWNED_OPTIONS.some((n) => t[n] !== void 0);
  }
  isAutoPhysicsEnabled() {
    return this.autoEnabled;
  }
  enableAutoPhysics() {
    this.autoEnabled = !0, this.tuneNow({ alpha: N.CLICK_REHEAT_ALPHA, force: !0 });
  }
  disableAutoPhysics() {
    this.autoEnabled = !1, this.autoTuneTimer !== null && (clearTimeout(this.autoTuneTimer), this.autoTuneTimer = null);
  }
  getAutoRun() {
    return this.autoLastRun;
  }
  noteManualKnobEdit() {
    this.applyingAutoKnobs || this.disableAutoPhysics();
  }
  scheduleTune() {
    this.autoEnabled && (this.autoTuneTimer !== null && clearTimeout(this.autoTuneTimer), this.autoTuneTimer = setTimeout(() => {
      this.autoTuneTimer = null, this.tuneNow({ reheat: this.heldCanvas === void 0 });
    }, N.AUTO_DEBOUNCE_MS));
  }
  static canvasKey(t, n) {
    return `${t.map((i) => i.id).join(`
`)}
|
${n.map((i) => i.id).join(`
`)}`;
  }
  tuneNow(t = {}) {
    var c;
    const { reheat: n = !0, alpha: i = N.AUTO_REHEAT_ALPHA, force: r = !1 } = t;
    if (!this.autoEnabled || this.options.layout.type !== "force") return;
    const o = this.buildAutoContext();
    if (o.nodeCount === 0) return;
    const s = Ku(o), l = Object.keys(s).every((u) => {
      const [g, f] = ct[u];
      return Math.abs(s[u] - this.physicsKnobs[u]) <= (f - g) * N.AUTO_DEADBAND;
    }) && !r;
    if (this.autoLastRun = { context: o, knobs: l ? this.getPhysicsKnobs() : s, skipped: l }, !l) {
      this.applyingAutoKnobs = !0, this.suppressReheat = !0;
      try {
        this.writeKnobs(s);
      } finally {
        this.suppressReheat = !1, this.applyingAutoKnobs = !1;
      }
      n && this.reheatIfEnabled(i), (c = this.graph.UIManager.physicsFlyout) == null || c.syncAutoKnobs(this.getPhysicsKnobs());
    }
  }
  buildAutoContext() {
    const t = this.containerBCR, n = this.graph.getCanvasNodes(), i = this.getActiveEdges();
    let r = 0, o = 0, s = 0;
    for (const l of n) {
      const c = l.expanded ? l.getCircleRadiusCollapsed() : l.getLayoutRadius();
      r += c, o = Math.max(o, c), s += Math.PI * c * c;
    }
    const a = Vu(n.map((l) => l.id), i.map((l) => [l.source.id, l.target.id]));
    return { canvas: { width: t.width, height: t.height }, nodeCount: n.length, radii: { mean: n.length ? r / n.length : 0, max: o, totalArea: s }, edgeCount: i.length, componentCount: a.count, looseNodeFraction: a.looseNodeFraction, current: this.getPhysicsKnobs() };
  }
  createDragBehavior() {
    return Bi().filter(() => !this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement", (t, n) => {
      this.graphInteraction.hasActiveMultiselection() ? this.dragSelection = this.graphInteraction.getSelectedNodes().map((i) => {
        const { node: r } = i;
        return r.freeze(), { node: r, dx: r.x - n.x, dy: r.y - n.y };
      }) : (this.dragSelection = [], n.freeze());
    }).on("drag.draggedelement", (t, n) => {
      if (this.reheatForDrag(), this.graphInteraction.hasActiveMultiselection())
        this.moveDragSelection(t.x, t.y);
      else {
        const i = this.applySnap(t.x), r = this.applySnap(t.y);
        n.fx = i, n.fy = r, n.x = i, n.y = r;
      }
      if (this.graphInteraction.dragging(t.sourceEvent, t.subject), !this.engineRunning || !this.isEnabled()) {
        const i = this.graphInteraction.hasActiveMultiselection() ? this.dragSelection.map((r) => r.node) : [n];
        this.graph.nextTickFor(i);
      }
    }).on("end.draggedelement", (t, n) => {
      this.coolAfterDrag(t.active), this.options.freezeNodesOnDrag || (this.graphInteraction.hasActiveMultiselection() ? (this.dragSelection.forEach(({ node: i }) => i.unfreeze()), this.dragSelection = []) : n.unfreeze()), this.graphInteraction.dragended(t.sourceEvent, t.subject);
    });
  }
  createMembersDragBehavior(t) {
    let n;
    return Bi().filter((i) => !i.button && !this.graph.editing.connectManager.isActiveAndNotIdle()).subject(() => (n = t()[0], { x: (n == null ? void 0 : n.x) ?? 0, y: (n == null ? void 0 : n.y) ?? 0 })).on("start", (i) => {
      this.dragSelection = t().map((r) => (r.freeze(), { node: r, dx: r.x - i.subject.x, dy: r.y - i.subject.y }));
    }).on("drag", (i) => {
      n && (this.reheatForDrag(), this.moveDragSelection(i.x, i.y), this.graphInteraction.dragging(i.sourceEvent, n), (!this.engineRunning || !this.isEnabled()) && this.graph.nextTickFor(this.dragSelection.map(({ node: r }) => r)));
    }).on("end", (i) => {
      this.coolAfterDrag(i.active), this.options.freezeNodesOnDrag || this.dragSelection.forEach(({ node: r }) => r.unfreeze()), this.dragSelection = [], n && this.graphInteraction.dragended(i.sourceEvent, n), n = void 0;
    });
  }
  reheatForDrag() {
    this.dragInProgress || !this.isEnabled() || (this.dragInProgress = !0, this.restart(), this.simulation.alphaTarget(0.3).restart());
  }
  coolAfterDrag(t) {
    t || !this.dragInProgress || (this.dragInProgress = !1, this.restart(), this.simulation.alphaTarget(this.options.d3AlphaTarget).restart());
  }
  moveDragSelection(t, n) {
    this.dragSelection.forEach(({ node: i, dx: r, dy: o }) => {
      const s = this.applySnap(t + r), a = this.applySnap(n + o);
      i.fx = s, i.fy = a, i.x = s, i.y = a;
    });
  }
  isDragging() {
    return this.dragInProgress;
  }
  toggleGridSnapping() {
    this.options.gridSnappingEnabled = !this.options.gridSnappingEnabled;
  }
  toggleFreezeNodesOnDrag() {
    this.options.freezeNodesOnDrag = !this.options.freezeNodesOnDrag;
  }
  isFreezeNodesOnDrag() {
    return this.options.freezeNodesOnDrag;
  }
  isGridSnappingEnabled() {
    return this.options.gridSnappingEnabled;
  }
  toggleFitViewOnExpandCollapse() {
    this.options.fitViewOnExpandCollapse = !this.options.fitViewOnExpandCollapse;
  }
  isFitViewOnExpandCollapse() {
    return this.options.fitViewOnExpandCollapse;
  }
  applySnap(t) {
    return this.options.gridSnappingEnabled ? Math.round(t / this.options.gridSize) * this.options.gridSize : t;
  }
  snapToGrid(t) {
    return this.applySnap(t);
  }
  getForceSimulation() {
    return this.simulationForces;
  }
  getSimulation() {
    return this.simulation;
  }
  async changeLayout(t, n = {}) {
    var i;
    this.layout && ((i = this.layout) == null || i.unregisterLayout(), this.layout = void 0), n = n ?? {}, n.layout = n.layout ?? {}, n.layout.type = t, t === "force" ? (N.initSimulationForceCharge(this.simulationForces.charge, this.options), N.initSimulationForceCollide(this.simulationForces.collide, this.options)) : t === "tree" ? this.layout = new q(this.graph, this.simulation, this.simulationForces, n.layout) : t === "structured" && (this.layout = this.createStructuredLayout(n.layout)), this.options.layout.type = t, this.update(), this.pause(), await this.runSimulationWorkerRouter(n), this.options.enabled ? (this.restart(), await this.waitForSimulationStop()) : this.graph.nextTick(), this.graph.renderer.fitAndCenterWhenSettled();
  }
};
M(N, "REPULSION_STRENGTH_RANGE", [0, -400]), M(N, "LINK_DISTANCE_RANGE", [40, 600]), M(N, "COLLIDE_MULTIPLIER_RANGE", [0.6, 2.4]), M(N, "FRICTION_DECAY_RANGE", [0, 1]), M(N, "CENTERING_STRENGTH_MAX", 0.2), M(N, "CENTERING_ISOLATED_MULTIPLE", 4), M(N, "CENTERING_ISOLATED_RANGE", [0.1, 0.3]), M(N, "AUTO_OWNED_OPTIONS", ["d3LinkDistance", "d3ManyBodyStrength", "d3CollideRadiusMultiplier", "d3VelocityDecay", "d3GravityStrength", "d3GravityStrengthConnected", "d3AlphaDecay", "cooldownTime"]), M(N, "AUTO_DEBOUNCE_MS", 150), M(N, "AUTO_DEADBAND", 0.04), M(N, "AUTO_REHEAT_ALPHA", 0.3), M(N, "CLICK_REHEAT_ALPHA", 1), M(N, "NOMINAL_FPS", 60), M(N, "COOLDOWN_WALL_GRACE", 4), M(N, "FALLBACK_CONTAINER_SIZE", { width: 1e3, height: 800 });
let Rn = N;
const ro = 1e4, oo = 2e4, wr = 0.15 * oo;
self.onmessage = (e) => {
  if (e.data.source === Vc) {
    const { graph: t, resolutions: n } = e.data;
    postMessage({ type: "done", levels: Kc(t, n) });
    return;
  }
  e.data.source === "simulation-worker-wrapper" && Xu(e.data);
};
function Xu(e) {
  var w, v, E;
  const { nodes: t, edges: n, options: i, canvasBCR: r, groups: o = [] } = e, s = t.map((m) => {
    const I = new Yr(m.id, m.data, m.style);
    return I.setCircleRadius(m._circleRadius ?? 10), I.setLayoutSize(m._layoutSize), typeof m.x == "number" && (I.x = m.x), typeof m.y == "number" && (I.y = m.y), typeof m.fx == "number" && (I.fx = m.fx), typeof m.fy == "number" && (I.fy = m.fy), I;
  }), a = new Map(s.map((m) => [m.id, m])), { simulation: l, simulationForces: c } = Rn.initSimulationForces(i, r), u = [];
  for (const m of n) {
    const I = a.get(m.from.id), D = a.get(m.to.id);
    if (I && D) {
      const G = m.style ?? {};
      u.push(new oe(m.id, I, D, m.data, G, m.directed));
    }
  }
  l.nodes(s);
  const g = l.force("link");
  g && g.id((m) => m.id).links(u), so(l, o, a), ((w = i.layout) == null ? void 0 : w.type) === "tree" ? q.registerForcesOnSimulation(s, u, l, c, i.layout, r, q) : ((v = i.layout) == null ? void 0 : v.type) === "egoTree" && q.registerForcesOnSimulation(s, u, l, c, i.layout, r, fe);
  const { warmupTicks: f, reheatTicks: p } = ao(i);
  let S = 0.3;
  l.alphaTarget(S);
  const b = (/* @__PURE__ */ new Date()).getTime();
  let y;
  for (let m = 0; m < f && !((/* @__PURE__ */ new Date()).getTime() - b > ro || (/* @__PURE__ */ new Date()).getTime() - b > i.cooldownTime || Cn(i, l, S) && (/* @__PURE__ */ new Date()).getTime() - b > i.cooldownTime * 0.15); ++m)
    m % 5 === 0 && (y = Sr(m, (/* @__PURE__ */ new Date()).getTime() - b, i), postMessage({ type: "tick", progress: y, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - b })), l.tick();
  S = 0, l.alphaTarget(S), l.alpha(1);
  for (let m = 0; m < p && !(Cn(i, l, S) && (/* @__PURE__ */ new Date()).getTime() - b > i.cooldownTime * 0.15); ++m)
    l.tick(), m % 5 === 0 && (y = Sr(f + m, (/* @__PURE__ */ new Date()).getTime() - b, i), postMessage({ type: "tick", progress: y, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - b }));
  postMessage({ type: "tick", progress: 1, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - b }), ((E = i.layout) == null ? void 0 : E.type) === "tree" && q.simulationDone(s, u, l, i.layout), postMessage({ type: "done", nodes: s.map((m) => m.toDict()), edges: u.map((m) => m.toDict()) });
}
function Zu(e, t, n, i, r = []) {
  var b, y, w;
  const o = e.map((v) => {
    const E = new Yr(v.id, v.getData(), v.getStyle());
    return E.weight = v.weight || 1, E.setCircleRadius(v.getCircleRadius()), typeof v.x == "number" && (E.x = v.x), typeof v.y == "number" && (E.y = v.y), typeof v.fx == "number" && (E.fx = v.fx), typeof v.fy == "number" && (E.fy = v.fy), E;
  }), s = new Map(o.map((v) => [v.id, v])), { simulation: a, simulationForces: l } = Rn.initSimulationForces(n, i), c = [];
  for (const v of t) {
    const E = s.get(v.from.id), m = s.get(v.to.id);
    if (E && m) {
      const I = v.getStyle() ?? {};
      c.push(new oe(v.id, E, m, v.getData(), I, v.directed));
    }
  }
  a.nodes(o);
  const u = a.force("link");
  u && u.id((v) => v.id).links(c), so(a, r, s), (((b = n.layout) == null ? void 0 : b.type) === "tree" || ((y = n.layout) == null ? void 0 : y.type) === "egoTree") && q.registerForcesOnSimulation(o, c, a, l, n.layout, i, q);
  const { warmupTicks: g, reheatTicks: f } = ao(n);
  let p = 0.3;
  a.alphaTarget(p);
  const S = (/* @__PURE__ */ new Date()).getTime();
  for (let v = 0; v < g && !((/* @__PURE__ */ new Date()).getTime() - S > ro || (/* @__PURE__ */ new Date()).getTime() - S > n.cooldownTime || Cn(n, a, p) && (/* @__PURE__ */ new Date()).getTime() - S > n.cooldownTime * 0.15); ++v)
    a.tick();
  p = 0, a.alphaTarget(p), a.alpha(1);
  for (let v = 0; v < f && !(Cn(n, a, p) && (/* @__PURE__ */ new Date()).getTime() - S > n.cooldownTime * 0.15); ++v)
    a.tick();
  return ((w = n.layout) == null ? void 0 : w.type) === "tree" && q.simulationDone(o, c, a, n.layout), { nodes: o, edges: c };
}
function so(e, t, n) {
  const i = t.map((r) => ({ parts: r.map((o) => n.get(o)).filter((o) => o !== void 0) })).filter((r) => r.parts.length > 1);
  i.length && e.force("groupCohesion", Gr(() => i));
}
function ao(e) {
  const t = e.warmupTicks === "auto" || e.warmupTicks == null ? oo : e.warmupTicks;
  return t <= 0 ? { warmupTicks: 0, reheatTicks: 0 } : { warmupTicks: t - wr, reheatTicks: wr };
}
function Sr(e, t, n) {
  return t / n.cooldownTime;
}
function Cn(e, t, n) {
  return e.d3AlphaMin > 0 && t.alpha() - n < e.d3AlphaMin;
}
const Ju = Object.freeze(Object.defineProperty({ __proto__: null, runSimulation: Zu }, Symbol.toStringTag, { value: "Module" }));
export {
  Zu as runSimulation
};
