var qi = Object.defineProperty;
var Hi = (e, t, n) => t in e ? qi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var T = (e, t, n) => Hi(e, typeof t != "symbol" ? t + "" : t, n);
function Wi(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e);
  return on(this.cover(t, n), t, n, e);
}
function on(e, t, n, i) {
  if (isNaN(t) || isNaN(n)) return e;
  var r, s = e._root, a = { data: i }, l = e._x0, c = e._y0, o = e._x1, h = e._y1, g, d, p, x, y, v, w, b;
  if (!s) return e._root = a, e;
  for (; s.length; )
    if ((y = t >= (g = (l + o) / 2)) ? l = g : o = g, (v = n >= (d = (c + h) / 2)) ? c = d : h = d, r = s, !(s = s[w = v << 1 | y])) return r[w] = a, e;
  if (p = +e._x.call(null, s.data), x = +e._y.call(null, s.data), t === p && n === x) return a.next = s, r ? r[w] = a : e._root = a, e;
  do
    r = r ? r[w] = new Array(4) : e._root = new Array(4), (y = t >= (g = (l + o) / 2)) ? l = g : o = g, (v = n >= (d = (c + h) / 2)) ? c = d : h = d;
  while ((w = v << 1 | y) === (b = (x >= d) << 1 | p >= g));
  return r[b] = s, r[w] = a, e;
}
function Vi(e) {
  var t, n, i = e.length, r, s, a = new Array(i), l = new Array(i), c = 1 / 0, o = 1 / 0, h = -1 / 0, g = -1 / 0;
  for (n = 0; n < i; ++n)
    isNaN(r = +this._x.call(null, t = e[n])) || isNaN(s = +this._y.call(null, t)) || (a[n] = r, l[n] = s, r < c && (c = r), r > h && (h = r), s < o && (o = s), s > g && (g = s));
  if (c > h || o > g) return this;
  for (this.cover(c, o).cover(h, g), n = 0; n < i; ++n)
    on(this, a[n], l[n], e[n]);
  return this;
}
function $i(e, t) {
  if (isNaN(e = +e) || isNaN(t = +t)) return this;
  var n = this._x0, i = this._y0, r = this._x1, s = this._y1;
  if (isNaN(n))
    r = (n = Math.floor(e)) + 1, s = (i = Math.floor(t)) + 1;
  else {
    for (var a = r - n || 1, l = this._root, c, o; n > e || e >= r || i > t || t >= s; )
      switch (o = (t < i) << 1 | e < n, c = new Array(4), c[o] = l, l = c, a *= 2, o) {
        case 0:
          r = n + a, s = i + a;
          break;
        case 1:
          n = r - a, s = i + a;
          break;
        case 2:
          r = n + a, i = s - a;
          break;
        case 3:
          n = r - a, i = s - a;
          break;
      }
    this._root && this._root.length && (this._root = l);
  }
  return this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = s, this;
}
function Xi() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length) do
      e.push(t.data);
    while (t = t.next);
  }), e;
}
function Ki(e) {
  return arguments.length ? this.cover(+e[0][0], +e[0][1]).cover(+e[1][0], +e[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function U(e, t, n, i, r) {
  this.node = e, this.x0 = t, this.y0 = n, this.x1 = i, this.y1 = r;
}
function Yi(e, t, n) {
  var i, r = this._x0, s = this._y0, a, l, c, o, h = this._x1, g = this._y1, d = [], p = this._root, x, y;
  for (p && d.push(new U(p, r, s, h, g)), n == null ? n = 1 / 0 : (r = e - n, s = t - n, h = e + n, g = t + n, n *= n); x = d.pop(); )
    if (!(!(p = x.node) || (a = x.x0) > h || (l = x.y0) > g || (c = x.x1) < r || (o = x.y1) < s))
      if (p.length) {
        var v = (a + c) / 2, w = (l + o) / 2;
        d.push(
          new U(p[3], v, w, c, o),
          new U(p[2], a, w, v, o),
          new U(p[1], v, l, c, w),
          new U(p[0], a, l, v, w)
        ), (y = (t >= w) << 1 | e >= v) && (x = d[d.length - 1], d[d.length - 1] = d[d.length - 1 - y], d[d.length - 1 - y] = x);
      } else {
        var b = e - +this._x.call(null, p.data), S = t - +this._y.call(null, p.data), _ = b * b + S * S;
        if (_ < n) {
          var C = Math.sqrt(n = _);
          r = e - C, s = t - C, h = e + C, g = t + C, i = p.data;
        }
      }
  return i;
}
function Zi(e) {
  if (isNaN(h = +this._x.call(null, e)) || isNaN(g = +this._y.call(null, e))) return this;
  var t, n = this._root, i, r, s, a = this._x0, l = this._y0, c = this._x1, o = this._y1, h, g, d, p, x, y, v, w;
  if (!n) return this;
  if (n.length) for (; ; ) {
    if ((x = h >= (d = (a + c) / 2)) ? a = d : c = d, (y = g >= (p = (l + o) / 2)) ? l = p : o = p, t = n, !(n = n[v = y << 1 | x])) return this;
    if (!n.length) break;
    (t[v + 1 & 3] || t[v + 2 & 3] || t[v + 3 & 3]) && (i = t, w = v);
  }
  for (; n.data !== e; ) if (r = n, !(n = n.next)) return this;
  return (s = n.next) && delete n.next, r ? (s ? r.next = s : delete r.next, this) : t ? (s ? t[v] = s : delete t[v], (n = t[0] || t[1] || t[2] || t[3]) && n === (t[3] || t[2] || t[1] || t[0]) && !n.length && (i ? i[w] = n : this._root = n), this) : (this._root = s, this);
}
function Qi(e) {
  for (var t = 0, n = e.length; t < n; ++t) this.remove(e[t]);
  return this;
}
function Ji() {
  return this._root;
}
function tr() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length) do
      ++e;
    while (t = t.next);
  }), e;
}
function er(e) {
  var t = [], n, i = this._root, r, s, a, l, c;
  for (i && t.push(new U(i, this._x0, this._y0, this._x1, this._y1)); n = t.pop(); )
    if (!e(i = n.node, s = n.x0, a = n.y0, l = n.x1, c = n.y1) && i.length) {
      var o = (s + l) / 2, h = (a + c) / 2;
      (r = i[3]) && t.push(new U(r, o, h, l, c)), (r = i[2]) && t.push(new U(r, s, h, o, c)), (r = i[1]) && t.push(new U(r, o, a, l, h)), (r = i[0]) && t.push(new U(r, s, a, o, h));
    }
  return this;
}
function nr(e) {
  var t = [], n = [], i;
  for (this._root && t.push(new U(this._root, this._x0, this._y0, this._x1, this._y1)); i = t.pop(); ) {
    var r = i.node;
    if (r.length) {
      var s, a = i.x0, l = i.y0, c = i.x1, o = i.y1, h = (a + c) / 2, g = (l + o) / 2;
      (s = r[0]) && t.push(new U(s, a, l, h, g)), (s = r[1]) && t.push(new U(s, h, l, c, g)), (s = r[2]) && t.push(new U(s, a, g, h, o)), (s = r[3]) && t.push(new U(s, h, g, c, o));
    }
    n.push(i);
  }
  for (; i = n.pop(); )
    e(i.node, i.x0, i.y0, i.x1, i.y1);
  return this;
}
function ir(e) {
  return e[0];
}
function rr(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function or(e) {
  return e[1];
}
function sr(e) {
  return arguments.length ? (this._y = e, this) : this._y;
}
function me(e, t, n) {
  var i = new ve(t ?? ir, n ?? or, NaN, NaN, NaN, NaN);
  return e == null ? i : i.addAll(e);
}
function ve(e, t, n, i, r, s) {
  this._x = e, this._y = t, this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = s, this._root = void 0;
}
function He(e) {
  for (var t = { data: e.data }, n = t; e = e.next; ) n = n.next = { data: e.data };
  return t;
}
var G = me.prototype = ve.prototype;
G.copy = function() {
  var e = new ve(this._x, this._y, this._x0, this._y0, this._x1, this._y1), t = this._root, n, i;
  if (!t) return e;
  if (!t.length) return e._root = He(t), e;
  for (n = [{ source: t, target: e._root = new Array(4) }]; t = n.pop(); )
    for (var r = 0; r < 4; ++r)
      (i = t.source[r]) && (i.length ? n.push({ source: i, target: t.target[r] = new Array(4) }) : t.target[r] = He(i));
  return e;
};
G.add = Wi;
G.addAll = Vi;
G.cover = $i;
G.data = Xi;
G.extent = Ki;
G.find = Yi;
G.remove = Zi;
G.removeAll = Qi;
G.root = Ji;
G.size = tr;
G.visit = er;
G.visitAfter = nr;
G.x = rr;
G.y = sr;
function P(e) {
  return function() {
    return e;
  };
}
function Y(e) {
  return (e() - 0.5) * 1e-6;
}
function ar(e) {
  return e.x + e.vx;
}
function ur(e) {
  return e.y + e.vy;
}
function lr(e) {
  var t, n, i, r = 1, s = 1;
  typeof e != "function" && (e = P(e == null ? 1 : +e));
  function a() {
    for (var o, h = t.length, g, d, p, x, y, v, w = 0; w < s; ++w)
      for (g = me(t, ar, ur).visitAfter(l), o = 0; o < h; ++o)
        d = t[o], y = n[d.index], v = y * y, p = d.x + d.vx, x = d.y + d.vy, g.visit(b);
    function b(S, _, C, M, N) {
      var k = S.data, B = S.r, F = y + B;
      if (k) {
        if (k.index > d.index) {
          var j = p - k.x - k.vx, H = x - k.y - k.vy, q = j * j + H * H;
          q < F * F && (j === 0 && (j = Y(i), q += j * j), H === 0 && (H = Y(i), q += H * H), q = (F - (q = Math.sqrt(q))) / q * r, d.vx += (j *= q) * (F = (B *= B) / (v + B)), d.vy += (H *= q) * F, k.vx -= j * (F = 1 - F), k.vy -= H * F);
        }
        return;
      }
      return _ > p + F || M < p - F || C > x + F || N < x - F;
    }
  }
  function l(o) {
    if (o.data) return o.r = n[o.data.index];
    for (var h = o.r = 0; h < 4; ++h)
      o[h] && o[h].r > o.r && (o.r = o[h].r);
  }
  function c() {
    if (t) {
      var o, h = t.length, g;
      for (n = new Array(h), o = 0; o < h; ++o) g = t[o], n[g.index] = +e(g, o, t);
    }
  }
  return a.initialize = function(o, h) {
    t = o, i = h, c();
  }, a.iterations = function(o) {
    return arguments.length ? (s = +o, a) : s;
  }, a.strength = function(o) {
    return arguments.length ? (r = +o, a) : r;
  }, a.radius = function(o) {
    return arguments.length ? (e = typeof o == "function" ? o : P(+o), c(), a) : e;
  }, a;
}
function cr(e) {
  return e.index;
}
function We(e, t) {
  var n = e.get(t);
  if (!n) throw new Error("node not found: " + t);
  return n;
}
function hr(e) {
  var t = cr, n = g, i, r = P(30), s, a, l, c, o, h = 1;
  e == null && (e = []);
  function g(v) {
    return 1 / Math.min(l[v.source.index], l[v.target.index]);
  }
  function d(v) {
    for (var w = 0, b = e.length; w < h; ++w)
      for (var S = 0, _, C, M, N, k, B, F; S < b; ++S)
        _ = e[S], C = _.source, M = _.target, N = M.x + M.vx - C.x - C.vx || Y(o), k = M.y + M.vy - C.y - C.vy || Y(o), B = Math.sqrt(N * N + k * k), B = (B - s[S]) / B * v * i[S], N *= B, k *= B, M.vx -= N * (F = c[S]), M.vy -= k * F, C.vx += N * (F = 1 - F), C.vy += k * F;
  }
  function p() {
    if (a) {
      var v, w = a.length, b = e.length, S = new Map(a.map((C, M) => [t(C, M, a), C])), _;
      for (v = 0, l = new Array(w); v < b; ++v)
        _ = e[v], _.index = v, typeof _.source != "object" && (_.source = We(S, _.source)), typeof _.target != "object" && (_.target = We(S, _.target)), l[_.source.index] = (l[_.source.index] || 0) + 1, l[_.target.index] = (l[_.target.index] || 0) + 1;
      for (v = 0, c = new Array(b); v < b; ++v)
        _ = e[v], c[v] = l[_.source.index] / (l[_.source.index] + l[_.target.index]);
      i = new Array(b), x(), s = new Array(b), y();
    }
  }
  function x() {
    if (a)
      for (var v = 0, w = e.length; v < w; ++v)
        i[v] = +n(e[v], v, e);
  }
  function y() {
    if (a)
      for (var v = 0, w = e.length; v < w; ++v)
        s[v] = +r(e[v], v, e);
  }
  return d.initialize = function(v, w) {
    a = v, o = w, p();
  }, d.links = function(v) {
    return arguments.length ? (e = v, p(), d) : e;
  }, d.id = function(v) {
    return arguments.length ? (t = v, d) : t;
  }, d.iterations = function(v) {
    return arguments.length ? (h = +v, d) : h;
  }, d.strength = function(v) {
    return arguments.length ? (n = typeof v == "function" ? v : P(+v), x(), d) : n;
  }, d.distance = function(v) {
    return arguments.length ? (r = typeof v == "function" ? v : P(+v), y(), d) : r;
  }, d;
}
var fr = { value: () => {
} };
function _e() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new Ot(n);
}
function Ot(e) {
  this._ = e;
}
function dr(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", r = n.indexOf(".");
    if (r >= 0 && (i = n.slice(r + 1), n = n.slice(0, r)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
Ot.prototype = _e.prototype = {
  constructor: Ot,
  on: function(e, t) {
    var n = this._, i = dr(e + "", n), r, s = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++s < a; ) if ((r = (e = i[s]).type) && (r = gr(n[r], e.name))) return r;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++s < a; )
      if (r = (e = i[s]).type) n[r] = Ve(n[r], e.name, t);
      else if (t == null) for (r in n) n[r] = Ve(n[r], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Ot(e);
  },
  call: function(e, t) {
    if ((r = arguments.length - 2) > 0) for (var n = new Array(r), i = 0, r, s; i < r; ++i) n[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (s = this._[e], i = 0, r = s.length; i < r; ++i) s[i].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var i = this._[e], r = 0, s = i.length; r < s; ++r) i[r].value.apply(t, n);
  }
};
function gr(e, t) {
  for (var n = 0, i = e.length, r; n < i; ++n)
    if ((r = e[n]).name === t)
      return r.value;
}
function Ve(e, t, n) {
  for (var i = 0, r = e.length; i < r; ++i)
    if (e[i].name === t) {
      e[i] = fr, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var at = 0, yt = 0, pt = 0, sn = 1e3, Pt, mt, Lt = 0, nt = 0, Vt = 0, _t = typeof performance == "object" && performance.now ? performance : Date, an = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function un() {
  return nt || (an(pr), nt = _t.now() + Vt);
}
function pr() {
  nt = 0;
}
function de() {
  this._call = this._time = this._next = null;
}
de.prototype = ln.prototype = {
  constructor: de,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? un() : +n) + (t == null ? 0 : +t), !this._next && mt !== this && (mt ? mt._next = this : Pt = this, mt = this), this._call = e, this._time = n, ge();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, ge());
  }
};
function ln(e, t, n) {
  var i = new de();
  return i.restart(e, t, n), i;
}
function yr() {
  un(), ++at;
  for (var e = Pt, t; e; )
    (t = nt - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --at;
}
function $e() {
  nt = (Lt = _t.now()) + Vt, at = yt = 0;
  try {
    yr();
  } finally {
    at = 0, vr(), nt = 0;
  }
}
function mr() {
  var e = _t.now(), t = e - Lt;
  t > sn && (Vt -= t, Lt = e);
}
function vr() {
  for (var e, t = Pt, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : Pt = n);
  mt = e, ge(i);
}
function ge(e) {
  if (!at) {
    yt && (yt = clearTimeout(yt));
    var t = e - nt;
    t > 24 ? (e < 1 / 0 && (yt = setTimeout($e, e - _t.now() - Vt)), pt && (pt = clearInterval(pt))) : (pt || (Lt = _t.now(), pt = setInterval(mr, sn)), at = 1, an($e));
  }
}
const _r = 1664525, wr = 1013904223, Xe = 4294967296;
function xr() {
  let e = 1;
  return () => (e = (_r * e + wr) % Xe) / Xe;
}
function br(e) {
  return e.x;
}
function Sr(e) {
  return e.y;
}
var Tr = 10, Ar = Math.PI * (3 - Math.sqrt(5));
function Cr(e) {
  var t, n = 1, i = 1e-3, r = 1 - Math.pow(i, 1 / 300), s = 0, a = 0.6, l = /* @__PURE__ */ new Map(), c = ln(g), o = _e("tick", "end"), h = xr();
  e == null && (e = []);
  function g() {
    d(), o.call("tick", t), n < i && (c.stop(), o.call("end", t));
  }
  function d(y) {
    var v, w = e.length, b;
    y === void 0 && (y = 1);
    for (var S = 0; S < y; ++S)
      for (n += (s - n) * r, l.forEach(function(_) {
        _(n);
      }), v = 0; v < w; ++v)
        b = e[v], b.fx == null ? b.x += b.vx *= a : (b.x = b.fx, b.vx = 0), b.fy == null ? b.y += b.vy *= a : (b.y = b.fy, b.vy = 0);
    return t;
  }
  function p() {
    for (var y = 0, v = e.length, w; y < v; ++y) {
      if (w = e[y], w.index = y, w.fx != null && (w.x = w.fx), w.fy != null && (w.y = w.fy), isNaN(w.x) || isNaN(w.y)) {
        var b = Tr * Math.sqrt(0.5 + y), S = y * Ar;
        w.x = b * Math.cos(S), w.y = b * Math.sin(S);
      }
      (isNaN(w.vx) || isNaN(w.vy)) && (w.vx = w.vy = 0);
    }
  }
  function x(y) {
    return y.initialize && y.initialize(e, h), y;
  }
  return p(), t = {
    tick: d,
    restart: function() {
      return c.restart(g), t;
    },
    stop: function() {
      return c.stop(), t;
    },
    nodes: function(y) {
      return arguments.length ? (e = y, p(), l.forEach(x), t) : e;
    },
    alpha: function(y) {
      return arguments.length ? (n = +y, t) : n;
    },
    alphaMin: function(y) {
      return arguments.length ? (i = +y, t) : i;
    },
    alphaDecay: function(y) {
      return arguments.length ? (r = +y, t) : +r;
    },
    alphaTarget: function(y) {
      return arguments.length ? (s = +y, t) : s;
    },
    velocityDecay: function(y) {
      return arguments.length ? (a = 1 - y, t) : 1 - a;
    },
    randomSource: function(y) {
      return arguments.length ? (h = y, l.forEach(x), t) : h;
    },
    force: function(y, v) {
      return arguments.length > 1 ? (v == null ? l.delete(y) : l.set(y, x(v)), t) : l.get(y);
    },
    find: function(y, v, w) {
      var b = 0, S = e.length, _, C, M, N, k;
      for (w == null ? w = 1 / 0 : w *= w, b = 0; b < S; ++b)
        N = e[b], _ = y - N.x, C = v - N.y, M = _ * _ + C * C, M < w && (k = N, w = M);
      return k;
    },
    on: function(y, v) {
      return arguments.length > 1 ? (o.on(y, v), t) : o.on(y);
    }
  };
}
function Mr() {
  var e, t, n, i, r = P(-30), s, a = 1, l = 1 / 0, c = 0.81;
  function o(p) {
    var x, y = e.length, v = me(e, br, Sr).visitAfter(g);
    for (i = p, x = 0; x < y; ++x) t = e[x], v.visit(d);
  }
  function h() {
    if (e) {
      var p, x = e.length, y;
      for (s = new Array(x), p = 0; p < x; ++p) y = e[p], s[y.index] = +r(y, p, e);
    }
  }
  function g(p) {
    var x = 0, y, v, w = 0, b, S, _;
    if (p.length) {
      for (b = S = _ = 0; _ < 4; ++_)
        (y = p[_]) && (v = Math.abs(y.value)) && (x += y.value, w += v, b += v * y.x, S += v * y.y);
      p.x = b / w, p.y = S / w;
    } else {
      y = p, y.x = y.data.x, y.y = y.data.y;
      do
        x += s[y.data.index];
      while (y = y.next);
    }
    p.value = x;
  }
  function d(p, x, y, v) {
    if (!p.value) return !0;
    var w = p.x - t.x, b = p.y - t.y, S = v - x, _ = w * w + b * b;
    if (S * S / c < _)
      return _ < l && (w === 0 && (w = Y(n), _ += w * w), b === 0 && (b = Y(n), _ += b * b), _ < a && (_ = Math.sqrt(a * _)), t.vx += w * p.value * i / _, t.vy += b * p.value * i / _), !0;
    if (p.length || _ >= l) return;
    (p.data !== t || p.next) && (w === 0 && (w = Y(n), _ += w * w), b === 0 && (b = Y(n), _ += b * b), _ < a && (_ = Math.sqrt(a * _)));
    do
      p.data !== t && (S = s[p.data.index] * i / _, t.vx += w * S, t.vy += b * S);
    while (p = p.next);
  }
  return o.initialize = function(p, x) {
    e = p, n = x, h();
  }, o.strength = function(p) {
    return arguments.length ? (r = typeof p == "function" ? p : P(+p), h(), o) : r;
  }, o.distanceMin = function(p) {
    return arguments.length ? (a = p * p, o) : Math.sqrt(a);
  }, o.distanceMax = function(p) {
    return arguments.length ? (l = p * p, o) : Math.sqrt(l);
  }, o.theta = function(p) {
    return arguments.length ? (c = p * p, o) : Math.sqrt(c);
  }, o;
}
function Ke(e, t, n) {
  var i, r = P(0.1), s, a;
  typeof e != "function" && (e = P(+e)), t == null && (t = 0), n == null && (n = 0);
  function l(o) {
    for (var h = 0, g = i.length; h < g; ++h) {
      var d = i[h], p = d.x - t || 1e-6, x = d.y - n || 1e-6, y = Math.sqrt(p * p + x * x), v = (a[h] - y) * s[h] * o / y;
      d.vx += p * v, d.vy += x * v;
    }
  }
  function c() {
    if (i) {
      var o, h = i.length;
      for (s = new Array(h), a = new Array(h), o = 0; o < h; ++o)
        a[o] = +e(i[o], o, i), s[o] = isNaN(a[o]) ? 0 : +r(i[o], o, i);
    }
  }
  return l.initialize = function(o) {
    i = o, c();
  }, l.strength = function(o) {
    return arguments.length ? (r = typeof o == "function" ? o : P(+o), c(), l) : r;
  }, l.radius = function(o) {
    return arguments.length ? (e = typeof o == "function" ? o : P(+o), c(), l) : e;
  }, l.x = function(o) {
    return arguments.length ? (t = +o, l) : t;
  }, l.y = function(o) {
    return arguments.length ? (n = +o, l) : n;
  }, l;
}
function Ye(e) {
  var t = P(0.1), n, i, r;
  typeof e != "function" && (e = P(e == null ? 0 : +e));
  function s(l) {
    for (var c = 0, o = n.length, h; c < o; ++c)
      h = n[c], h.vx += (r[c] - h.x) * i[c] * l;
  }
  function a() {
    if (n) {
      var l, c = n.length;
      for (i = new Array(c), r = new Array(c), l = 0; l < c; ++l)
        i[l] = isNaN(r[l] = +e(n[l], l, n)) ? 0 : +t(n[l], l, n);
    }
  }
  return s.initialize = function(l) {
    n = l, a();
  }, s.strength = function(l) {
    return arguments.length ? (t = typeof l == "function" ? l : P(+l), a(), s) : t;
  }, s.x = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : P(+l), a(), s) : e;
  }, s;
}
function Ze(e) {
  var t = P(0.1), n, i, r;
  typeof e != "function" && (e = P(e == null ? 0 : +e));
  function s(l) {
    for (var c = 0, o = n.length, h; c < o; ++c)
      h = n[c], h.vy += (r[c] - h.y) * i[c] * l;
  }
  function a() {
    if (n) {
      var l, c = n.length;
      for (i = new Array(c), r = new Array(c), l = 0; l < c; ++l)
        i[l] = isNaN(r[l] = +e(n[l], l, n)) ? 0 : +t(n[l], l, n);
    }
  }
  return s.initialize = function(l) {
    n = l, a();
  }, s.strength = function(l) {
    return arguments.length ? (t = typeof l == "function" ? l : P(+l), a(), s) : t;
  }, s.y = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : P(+l), a(), s) : e;
  }, s;
}
function Dr(e = 0, t = 0, n = 1e-3) {
  let i = [], r;
  function s() {
    r = typeof n == "function" ? n : () => n;
  }
  function a(l) {
    for (let c = 0, o = i.length; c < o; ++c) {
      const h = i[c], g = r(h, c, i);
      h.vx && h.x && (h.vx -= (h.x - e) * g * l), h.vy && h.y && (h.vy -= (h.y - t) * g * l);
    }
  }
  return a.initialize = (l) => {
    i = l, s();
  }, a.x = function(l) {
    return arguments.length ? (e = l, a) : e;
  }, a.y = function(l) {
    return arguments.length ? (t = l, a) : t;
  }, a.strength = function(l) {
    return arguments.length ? (n = l, s(), a) : n;
  }, a;
}
var pe = "http://www.w3.org/1999/xhtml";
const Qe = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: pe,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function cn(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Qe.hasOwnProperty(t) ? { space: Qe[t], local: e } : e;
}
function kr(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === pe && t.documentElement.namespaceURI === pe ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Nr(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function hn(e) {
  var t = cn(e);
  return (t.local ? Nr : kr)(t);
}
function Ir() {
}
function fn(e) {
  return e == null ? Ir : function() {
    return this.querySelector(e);
  };
}
function Fr(e) {
  typeof e != "function" && (e = fn(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var s = t[r], a = s.length, l = i[r] = new Array(a), c, o, h = 0; h < a; ++h)
      (c = s[h]) && (o = e.call(c, c.__data__, h, s)) && ("__data__" in c && (o.__data__ = c.__data__), l[h] = o);
  return new V(i, this._parents);
}
function Er(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Rr() {
  return [];
}
function Or(e) {
  return e == null ? Rr : function() {
    return this.querySelectorAll(e);
  };
}
function zr(e) {
  return function() {
    return Er(e.apply(this, arguments));
  };
}
function Br(e) {
  typeof e == "function" ? e = zr(e) : e = Or(e);
  for (var t = this._groups, n = t.length, i = [], r = [], s = 0; s < n; ++s)
    for (var a = t[s], l = a.length, c, o = 0; o < l; ++o)
      (c = a[o]) && (i.push(e.call(c, c.__data__, o, a)), r.push(c));
  return new V(i, r);
}
function jr(e) {
  return function() {
    return this.matches(e);
  };
}
function dn(e) {
  return function(t) {
    return t.matches(e);
  };
}
var Pr = Array.prototype.find;
function Lr(e) {
  return function() {
    return Pr.call(this.children, e);
  };
}
function Ur() {
  return this.firstElementChild;
}
function Gr(e) {
  return this.select(e == null ? Ur : Lr(typeof e == "function" ? e : dn(e)));
}
var qr = Array.prototype.filter;
function Hr() {
  return Array.from(this.children);
}
function Wr(e) {
  return function() {
    return qr.call(this.children, e);
  };
}
function Vr(e) {
  return this.selectAll(e == null ? Hr : Wr(typeof e == "function" ? e : dn(e)));
}
function $r(e) {
  typeof e != "function" && (e = jr(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var s = t[r], a = s.length, l = i[r] = [], c, o = 0; o < a; ++o)
      (c = s[o]) && e.call(c, c.__data__, o, s) && l.push(c);
  return new V(i, this._parents);
}
function gn(e) {
  return new Array(e.length);
}
function Xr() {
  return new V(this._enter || this._groups.map(gn), this._parents);
}
function Ut(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Ut.prototype = {
  constructor: Ut,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function Kr(e) {
  return function() {
    return e;
  };
}
function Yr(e, t, n, i, r, s) {
  for (var a = 0, l, c = t.length, o = s.length; a < o; ++a)
    (l = t[a]) ? (l.__data__ = s[a], i[a] = l) : n[a] = new Ut(e, s[a]);
  for (; a < c; ++a)
    (l = t[a]) && (r[a] = l);
}
function Zr(e, t, n, i, r, s, a) {
  var l, c, o = /* @__PURE__ */ new Map(), h = t.length, g = s.length, d = new Array(h), p;
  for (l = 0; l < h; ++l)
    (c = t[l]) && (d[l] = p = a.call(c, c.__data__, l, t) + "", o.has(p) ? r[l] = c : o.set(p, c));
  for (l = 0; l < g; ++l)
    p = a.call(e, s[l], l, s) + "", (c = o.get(p)) ? (i[l] = c, c.__data__ = s[l], o.delete(p)) : n[l] = new Ut(e, s[l]);
  for (l = 0; l < h; ++l)
    (c = t[l]) && o.get(d[l]) === c && (r[l] = c);
}
function Qr(e) {
  return e.__data__;
}
function Jr(e, t) {
  if (!arguments.length) return Array.from(this, Qr);
  var n = t ? Zr : Yr, i = this._parents, r = this._groups;
  typeof e != "function" && (e = Kr(e));
  for (var s = r.length, a = new Array(s), l = new Array(s), c = new Array(s), o = 0; o < s; ++o) {
    var h = i[o], g = r[o], d = g.length, p = to(e.call(h, h && h.__data__, o, i)), x = p.length, y = l[o] = new Array(x), v = a[o] = new Array(x), w = c[o] = new Array(d);
    n(h, g, y, v, w, p, t);
    for (var b = 0, S = 0, _, C; b < x; ++b)
      if (_ = y[b]) {
        for (b >= S && (S = b + 1); !(C = v[S]) && ++S < x; ) ;
        _._next = C || null;
      }
  }
  return a = new V(a, i), a._enter = l, a._exit = c, a;
}
function to(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function eo() {
  return new V(this._exit || this._groups.map(gn), this._parents);
}
function no(e, t, n) {
  var i = this.enter(), r = this, s = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (r = t(r), r && (r = r.selection())), n == null ? s.remove() : n(s), i && r ? i.merge(r).order() : r;
}
function io(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, r = n.length, s = i.length, a = Math.min(r, s), l = new Array(r), c = 0; c < a; ++c)
    for (var o = n[c], h = i[c], g = o.length, d = l[c] = new Array(g), p, x = 0; x < g; ++x)
      (p = o[x] || h[x]) && (d[x] = p);
  for (; c < r; ++c)
    l[c] = n[c];
  return new V(l, this._parents);
}
function ro() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], r = i.length - 1, s = i[r], a; --r >= 0; )
      (a = i[r]) && (s && a.compareDocumentPosition(s) ^ 4 && s.parentNode.insertBefore(a, s), s = a);
  return this;
}
function oo(e) {
  e || (e = so);
  function t(g, d) {
    return g && d ? e(g.__data__, d.__data__) : !g - !d;
  }
  for (var n = this._groups, i = n.length, r = new Array(i), s = 0; s < i; ++s) {
    for (var a = n[s], l = a.length, c = r[s] = new Array(l), o, h = 0; h < l; ++h)
      (o = a[h]) && (c[h] = o);
    c.sort(t);
  }
  return new V(r, this._parents).order();
}
function so(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function ao() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function uo() {
  return Array.from(this);
}
function lo() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, s = i.length; r < s; ++r) {
      var a = i[r];
      if (a) return a;
    }
  return null;
}
function co() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function ho() {
  return !this.node();
}
function fo(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var r = t[n], s = 0, a = r.length, l; s < a; ++s)
      (l = r[s]) && e.call(l, l.__data__, s, r);
  return this;
}
function go(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function po(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function yo(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function mo(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function vo(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function _o(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function wo(e, t) {
  var n = cn(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? po : go : typeof t == "function" ? n.local ? _o : vo : n.local ? mo : yo)(n, t));
}
function pn(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function xo(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function bo(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function So(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function To(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? xo : typeof t == "function" ? So : bo)(e, t, n ?? "")) : Ao(this.node(), e);
}
function Ao(e, t) {
  return e.style.getPropertyValue(t) || pn(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Co(e) {
  return function() {
    delete this[e];
  };
}
function Mo(e, t) {
  return function() {
    this[e] = t;
  };
}
function Do(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function ko(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Co : typeof t == "function" ? Do : Mo)(e, t)) : this.node()[e];
}
function yn(e) {
  return e.trim().split(/^|\s+/);
}
function we(e) {
  return e.classList || new mn(e);
}
function mn(e) {
  this._node = e, this._names = yn(e.getAttribute("class") || "");
}
mn.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function vn(e, t) {
  for (var n = we(e), i = -1, r = t.length; ++i < r; ) n.add(t[i]);
}
function _n(e, t) {
  for (var n = we(e), i = -1, r = t.length; ++i < r; ) n.remove(t[i]);
}
function No(e) {
  return function() {
    vn(this, e);
  };
}
function Io(e) {
  return function() {
    _n(this, e);
  };
}
function Fo(e, t) {
  return function() {
    (t.apply(this, arguments) ? vn : _n)(this, e);
  };
}
function Eo(e, t) {
  var n = yn(e + "");
  if (arguments.length < 2) {
    for (var i = we(this.node()), r = -1, s = n.length; ++r < s; ) if (!i.contains(n[r])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Fo : t ? No : Io)(n, t));
}
function Ro() {
  this.textContent = "";
}
function Oo(e) {
  return function() {
    this.textContent = e;
  };
}
function zo(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function Bo(e) {
  return arguments.length ? this.each(e == null ? Ro : (typeof e == "function" ? zo : Oo)(e)) : this.node().textContent;
}
function jo() {
  this.innerHTML = "";
}
function Po(e) {
  return function() {
    this.innerHTML = e;
  };
}
function Lo(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function Uo(e) {
  return arguments.length ? this.each(e == null ? jo : (typeof e == "function" ? Lo : Po)(e)) : this.node().innerHTML;
}
function Go() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function qo() {
  return this.each(Go);
}
function Ho() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function Wo() {
  return this.each(Ho);
}
function Vo(e) {
  var t = typeof e == "function" ? e : hn(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function $o() {
  return null;
}
function Xo(e, t) {
  var n = typeof e == "function" ? e : hn(e), i = t == null ? $o : typeof t == "function" ? t : fn(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function Ko() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function Yo() {
  return this.each(Ko);
}
function Zo() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Qo() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Jo(e) {
  return this.select(e ? Qo : Zo);
}
function ts(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function es(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function ns(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function is(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, r = t.length, s; n < r; ++n)
        s = t[n], (!e.type || s.type === e.type) && s.name === e.name ? this.removeEventListener(s.type, s.listener, s.options) : t[++i] = s;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function rs(e, t, n) {
  return function() {
    var i = this.__on, r, s = es(t);
    if (i) {
      for (var a = 0, l = i.length; a < l; ++a)
        if ((r = i[a]).type === e.type && r.name === e.name) {
          this.removeEventListener(r.type, r.listener, r.options), this.addEventListener(r.type, r.listener = s, r.options = n), r.value = t;
          return;
        }
    }
    this.addEventListener(e.type, s, n), r = { type: e.type, name: e.name, value: t, listener: s, options: n }, i ? i.push(r) : this.__on = [r];
  };
}
function os(e, t, n) {
  var i = ns(e + ""), r, s = i.length, a;
  if (arguments.length < 2) {
    var l = this.node().__on;
    if (l) {
      for (var c = 0, o = l.length, h; c < o; ++c)
        for (r = 0, h = l[c]; r < s; ++r)
          if ((a = i[r]).type === h.type && a.name === h.name)
            return h.value;
    }
    return;
  }
  for (l = t ? rs : is, r = 0; r < s; ++r) this.each(l(i[r], t, n));
  return this;
}
function wn(e, t, n) {
  var i = pn(e), r = i.CustomEvent;
  typeof r == "function" ? r = new r(t, n) : (r = i.document.createEvent("Event"), n ? (r.initEvent(t, n.bubbles, n.cancelable), r.detail = n.detail) : r.initEvent(t, !1, !1)), e.dispatchEvent(r);
}
function ss(e, t) {
  return function() {
    return wn(this, e, t);
  };
}
function as(e, t) {
  return function() {
    return wn(this, e, t.apply(this, arguments));
  };
}
function us(e, t) {
  return this.each((typeof t == "function" ? as : ss)(e, t));
}
function* ls() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, s = i.length, a; r < s; ++r)
      (a = i[r]) && (yield a);
}
var cs = [null];
function V(e, t) {
  this._groups = e, this._parents = t;
}
function hs() {
  return this;
}
V.prototype = {
  constructor: V,
  select: Fr,
  selectAll: Br,
  selectChild: Gr,
  selectChildren: Vr,
  filter: $r,
  data: Jr,
  enter: Xr,
  exit: eo,
  join: no,
  merge: io,
  selection: hs,
  order: ro,
  sort: oo,
  call: ao,
  nodes: uo,
  node: lo,
  size: co,
  empty: ho,
  each: fo,
  attr: wo,
  style: To,
  property: ko,
  classed: Eo,
  text: Bo,
  html: Uo,
  raise: qo,
  lower: Wo,
  append: Vo,
  insert: Xo,
  remove: Yo,
  clone: Jo,
  datum: ts,
  on: os,
  dispatch: us,
  [Symbol.iterator]: ls
};
function Gt(e) {
  return typeof e == "string" ? new V([[document.querySelector(e)]], [document.documentElement]) : new V([[e]], cs);
}
function fs(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Je(e, t) {
  if (e = fs(e), t === void 0 && (t = e.currentTarget), t) {
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
const ds = { passive: !1 }, wt = { capture: !0, passive: !1 };
function le(e) {
  e.stopImmediatePropagation();
}
function st(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function gs(e) {
  var t = e.document.documentElement, n = Gt(e).on("dragstart.drag", st, wt);
  "onselectstart" in t ? n.on("selectstart.drag", st, wt) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function ps(e, t) {
  var n = e.document.documentElement, i = Gt(e).on("dragstart.drag", null);
  t && (i.on("click.drag", st, wt), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Et = (e) => () => e;
function ye(e, {
  sourceEvent: t,
  subject: n,
  target: i,
  identifier: r,
  active: s,
  x: a,
  y: l,
  dx: c,
  dy: o,
  dispatch: h
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: i, enumerable: !0, configurable: !0 },
    identifier: { value: r, enumerable: !0, configurable: !0 },
    active: { value: s, enumerable: !0, configurable: !0 },
    x: { value: a, enumerable: !0, configurable: !0 },
    y: { value: l, enumerable: !0, configurable: !0 },
    dx: { value: c, enumerable: !0, configurable: !0 },
    dy: { value: o, enumerable: !0, configurable: !0 },
    _: { value: h }
  });
}
ye.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function ys(e) {
  return !e.ctrlKey && !e.button;
}
function ms() {
  return this.parentNode;
}
function vs(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function _s() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function ws() {
  var e = ys, t = ms, n = vs, i = _s, r = {}, s = _e("start", "drag", "end"), a = 0, l, c, o, h, g = 0;
  function d(_) {
    _.on("mousedown.drag", p).filter(i).on("touchstart.drag", v).on("touchmove.drag", w, ds).on("touchend.drag touchcancel.drag", b).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function p(_, C) {
    if (!(h || !e.call(this, _, C))) {
      var M = S(this, t.call(this, _, C), _, C, "mouse");
      M && (Gt(_.view).on("mousemove.drag", x, wt).on("mouseup.drag", y, wt), gs(_.view), le(_), o = !1, l = _.clientX, c = _.clientY, M("start", _));
    }
  }
  function x(_) {
    if (st(_), !o) {
      var C = _.clientX - l, M = _.clientY - c;
      o = C * C + M * M > g;
    }
    r.mouse("drag", _);
  }
  function y(_) {
    Gt(_.view).on("mousemove.drag mouseup.drag", null), ps(_.view, o), st(_), r.mouse("end", _);
  }
  function v(_, C) {
    if (e.call(this, _, C)) {
      var M = _.changedTouches, N = t.call(this, _, C), k = M.length, B, F;
      for (B = 0; B < k; ++B)
        (F = S(this, N, _, C, M[B].identifier, M[B])) && (le(_), F("start", _, M[B]));
    }
  }
  function w(_) {
    var C = _.changedTouches, M = C.length, N, k;
    for (N = 0; N < M; ++N)
      (k = r[C[N].identifier]) && (st(_), k("drag", _, C[N]));
  }
  function b(_) {
    var C = _.changedTouches, M = C.length, N, k;
    for (h && clearTimeout(h), h = setTimeout(function() {
      h = null;
    }, 500), N = 0; N < M; ++N)
      (k = r[C[N].identifier]) && (le(_), k("end", _, C[N]));
  }
  function S(_, C, M, N, k, B) {
    var F = s.copy(), j = Je(B || M, C), H, q, it;
    if ((it = n.call(_, new ye("beforestart", {
      sourceEvent: M,
      target: d,
      identifier: k,
      active: a,
      x: j[0],
      y: j[1],
      dx: 0,
      dy: 0,
      dispatch: F
    }), N)) != null)
      return H = it.x - j[0] || 0, q = it.y - j[1] || 0, function Kt(ut, St, Yt) {
        var Tt = j, lt;
        switch (ut) {
          case "start":
            r[k] = Kt, lt = a++;
            break;
          case "end":
            delete r[k], --a;
          // falls through
          case "drag":
            j = Je(Yt || St, C), lt = a;
            break;
        }
        F.call(
          ut,
          _,
          new ye(ut, {
            sourceEvent: St,
            subject: it,
            target: d,
            identifier: k,
            active: lt,
            x: j[0] + H,
            y: j[1] + q,
            dx: j[0] - Tt[0],
            dy: j[1] - Tt[1],
            dispatch: F
          }),
          N
        );
      };
  }
  return d.filter = function(_) {
    return arguments.length ? (e = typeof _ == "function" ? _ : Et(!!_), d) : e;
  }, d.container = function(_) {
    return arguments.length ? (t = typeof _ == "function" ? _ : Et(_), d) : t;
  }, d.subject = function(_) {
    return arguments.length ? (n = typeof _ == "function" ? _ : Et(_), d) : n;
  }, d.touchable = function(_) {
    return arguments.length ? (i = typeof _ == "function" ? _ : Et(!!_), d) : i;
  }, d.on = function() {
    var _ = s.on.apply(s, arguments);
    return _ === s ? d : _;
  }, d.clickDistance = function(_) {
    return arguments.length ? (g = (_ = +_) * _, d) : Math.sqrt(g);
  }, d;
}
function xn(e = 8, t = "id-") {
  const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", i = n + "0123456789-_";
  let r = n.charAt(Math.floor(Math.random() * n.length));
  for (let s = 1; s < e; s++)
    r += i.charAt(Math.floor(Math.random() * i.length));
  return `${t}${r}`;
}
let bn = class Sn {
  /**
   * Create a new Node instance.
   * @param id - Unique identifier for the node
   * @param data - Optional data payload associated with the node
   */
  constructor(t, n, i, r = xn(), s = []) {
    T(this, "id");
    T(this, "data");
    T(this, "children");
    T(this, "style");
    T(this, "edgesOut");
    T(this, "edgesIn");
    T(this, "defaultCircleRadius", 10);
    // Layout/physics properties
    T(this, "x");
    T(this, "y");
    T(this, "vx");
    T(this, "vy");
    T(this, "fx");
    T(this, "fy");
    T(this, "weight");
    T(this, "frozen");
    T(this, "visible");
    T(this, "expanded");
    /** True if this node is a child within a collapsed cluster */
    T(this, "isChild");
    T(this, "childrenDepth");
    /** True if this node has child nodes */
    T(this, "isParent");
    /** Reference to the parent cluster node (if this node is a child) */
    T(this, "parentNode");
    /**
     * Reference to the main graph node when this node is a clone in a subgraph.
     * Used for syncing position updates from subgraph back to main graph.
     */
    T(this, "_original_object");
    /**
     * Reference to the deepest sub graph node.
     * Used for checking state of this node in its subgraph
     */
    T(this, "_deepest_node_clone");
    /** The subgraph graph instance created when expanding this node */
    T(this, "_subgraph");
    T(this, "_circleRadius", this.defaultCircleRadius);
    T(this, "_circleRadiusCollapsed", this.defaultCircleRadius);
    T(this, "_dirty");
    T(this, "domID");
    this.id = t, this.domID = r, this.data = n ?? {}, this.style = i ?? {}, this.children = [], this.isParent = !1, this.setChildren(s), this._dirty = !0, this.frozen = !1, this.visible = !0, this.expanded = !1, this.isChild = !1, this.childrenDepth = 0, this.edgesOut = /* @__PURE__ */ new Set(), this.edgesIn = /* @__PURE__ */ new Set();
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
    const n = {
      id: this.id,
      data: this.data,
      style: this.style,
      weight: this.weight
      // expanded: this.expanded,
    };
    return t || (n.x = this.x, n.y = this.y, n.vx = this.vx, n.vy = this.vy, n.fx = this.fx, n.fy = this.fy), this.hasChildren() && (n.children = this.children.map((i) => i.toDict(t))), n;
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new Sn(this.id, t, n);
    return i.x = this.x, i.y = this.y, i.vx = this.vx, i.vy = this.vy, i.fx = this.fx, i.fy = this.fy, i.weight = this.weight, i.frozen = this.frozen, i.visible = this.visible, i.expanded = this.expanded, i.isChild = this.isChild, i.childrenDepth = this.childrenDepth, i.isParent = this.isParent, i.parentNode = this.parentNode, i._circleRadius = this._circleRadius, i.children = this.children.map((r) => r.clone()), i;
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
  markAsChild(t, n) {
    this.isChild = !0, this.childrenDepth = n, this.parentNode = t;
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
};
class $t {
  /**
   * Create a new Edge instance.
   * @param id - Unique identifier for the edge
   * @param from - Source node
   * @param to - Target node
   * @param data - Optional data payload for the edge
   * @param style - Optional style for the edge
   */
  constructor(t, n, i, r, s, a = null, l) {
    T(this, "id");
    T(this, "from");
    T(this, "to");
    T(this, "directed");
    T(this, "data");
    T(this, "style");
    T(this, "visible");
    /** True if this is a synthetic edge (placeholder for collapsed cluster child) */
    T(this, "isSynthetic");
    /** The actual child node this synthetic edge points to (for expansion logic) */
    T(this, "syntheticTerminalNode");
    T(this, "_original_object");
    T(this, "_subgraphFromNode");
    T(this, "_subgraphToNode");
    T(this, "_dirty");
    T(this, "domID");
    this.id = t, this.domID = xn(), this.from = n, this.to = i, this.directed = a, this.data = r ?? {}, this.style = s ?? {}, this.visible = !0, this._dirty = !0, this.isSynthetic = l !== void 0, this.syntheticTerminalNode = l, this.from.registerEdgeOut(this), this.to.registerEdgeIn(this);
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
    const t = { ...this.data }, n = { ...this.style }, i = new $t(
      this.id,
      this.from.clone(),
      this.to.clone(),
      t,
      n,
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
const Tn = 'var ta=Object.defineProperty;var ea=(Q,X,st)=>X in Q?ta(Q,X,{enumerable:!0,configurable:!0,writable:!0,value:st}):Q[X]=st;var T=(Q,X,st)=>ea(Q,typeof X!="symbol"?X+"":X,st);(function(){"use strict";function Q(e){const t=+this._x.call(null,e),n=+this._y.call(null,e);return X(this.cover(t,n),t,n,e)}function X(e,t,n,i){if(isNaN(t)||isNaN(n))return e;var r,o=e._root,a={data:i},u=e._x0,c=e._y0,s=e._x1,h=e._y1,g,d,p,x,y,_,w,b;if(!o)return e._root=a,e;for(;o.length;)if((y=t>=(g=(u+s)/2))?u=g:s=g,(_=n>=(d=(c+h)/2))?c=d:h=d,r=o,!(o=o[w=_<<1|y]))return r[w]=a,e;if(p=+e._x.call(null,o.data),x=+e._y.call(null,o.data),t===p&&n===x)return a.next=o,r?r[w]=a:e._root=a,e;do r=r?r[w]=new Array(4):e._root=new Array(4),(y=t>=(g=(u+s)/2))?u=g:s=g,(_=n>=(d=(c+h)/2))?c=d:h=d;while((w=_<<1|y)===(b=(x>=d)<<1|p>=g));return r[b]=o,r[w]=a,e}function st(e){var t,n,i=e.length,r,o,a=new Array(i),u=new Array(i),c=1/0,s=1/0,h=-1/0,g=-1/0;for(n=0;n<i;++n)isNaN(r=+this._x.call(null,t=e[n]))||isNaN(o=+this._y.call(null,t))||(a[n]=r,u[n]=o,r<c&&(c=r),r>h&&(h=r),o<s&&(s=o),o>g&&(g=o));if(c>h||s>g)return this;for(this.cover(c,s).cover(h,g),n=0;n<i;++n)X(this,a[n],u[n],e[n]);return this}function Dn(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(n))r=(n=Math.floor(e))+1,o=(i=Math.floor(t))+1;else{for(var a=r-n||1,u=this._root,c,s;n>e||e>=r||i>t||t>=o;)switch(s=(t<i)<<1|e<n,c=new Array(4),c[s]=u,u=c,a*=2,s){case 0:r=n+a,o=i+a;break;case 1:n=r-a,o=i+a;break;case 2:r=n+a,i=o-a;break;case 3:n=r-a,i=o-a;break}this._root&&this._root.length&&(this._root=u)}return this._x0=n,this._y0=i,this._x1=r,this._y1=o,this}function Mn(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function In(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function G(e,t,n,i,r){this.node=e,this.x0=t,this.y0=n,this.x1=i,this.y1=r}function Nn(e,t,n){var i,r=this._x0,o=this._y0,a,u,c,s,h=this._x1,g=this._y1,d=[],p=this._root,x,y;for(p&&d.push(new G(p,r,o,h,g)),n==null?n=1/0:(r=e-n,o=t-n,h=e+n,g=t+n,n*=n);x=d.pop();)if(!(!(p=x.node)||(a=x.x0)>h||(u=x.y0)>g||(c=x.x1)<r||(s=x.y1)<o))if(p.length){var _=(a+c)/2,w=(u+s)/2;d.push(new G(p[3],_,w,c,s),new G(p[2],a,w,_,s),new G(p[1],_,u,c,w),new G(p[0],a,u,_,w)),(y=(t>=w)<<1|e>=_)&&(x=d[d.length-1],d[d.length-1]=d[d.length-1-y],d[d.length-1-y]=x)}else{var b=e-+this._x.call(null,p.data),S=t-+this._y.call(null,p.data),v=b*b+S*S;if(v<n){var C=Math.sqrt(n=v);r=e-C,o=t-C,h=e+C,g=t+C,i=p.data}}return i}function Fn(e){if(isNaN(h=+this._x.call(null,e))||isNaN(g=+this._y.call(null,e)))return this;var t,n=this._root,i,r,o,a=this._x0,u=this._y0,c=this._x1,s=this._y1,h,g,d,p,x,y,_,w;if(!n)return this;if(n.length)for(;;){if((x=h>=(d=(a+c)/2))?a=d:c=d,(y=g>=(p=(u+s)/2))?u=p:s=p,t=n,!(n=n[_=y<<1|x]))return this;if(!n.length)break;(t[_+1&3]||t[_+2&3]||t[_+3&3])&&(i=t,w=_)}for(;n.data!==e;)if(r=n,!(n=n.next))return this;return(o=n.next)&&delete n.next,r?(o?r.next=o:delete r.next,this):t?(o?t[_]=o:delete t[_],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(i?i[w]=n:this._root=n),this):(this._root=o,this)}function kn(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function En(){return this._root}function Rn(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function zn(e){var t=[],n,i=this._root,r,o,a,u,c;for(i&&t.push(new G(i,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(i=n.node,o=n.x0,a=n.y0,u=n.x1,c=n.y1)&&i.length){var s=(o+u)/2,h=(a+c)/2;(r=i[3])&&t.push(new G(r,s,h,u,c)),(r=i[2])&&t.push(new G(r,o,h,s,c)),(r=i[1])&&t.push(new G(r,s,a,u,h)),(r=i[0])&&t.push(new G(r,o,a,s,h))}return this}function On(e){var t=[],n=[],i;for(this._root&&t.push(new G(this._root,this._x0,this._y0,this._x1,this._y1));i=t.pop();){var r=i.node;if(r.length){var o,a=i.x0,u=i.y0,c=i.x1,s=i.y1,h=(a+c)/2,g=(u+s)/2;(o=r[0])&&t.push(new G(o,a,u,h,g)),(o=r[1])&&t.push(new G(o,h,u,c,g)),(o=r[2])&&t.push(new G(o,a,g,h,s)),(o=r[3])&&t.push(new G(o,h,g,c,s))}n.push(i)}for(;i=n.pop();)e(i.node,i.x0,i.y0,i.x1,i.y1);return this}function Bn(e){return e[0]}function Pn(e){return arguments.length?(this._x=e,this):this._x}function Ln(e){return e[1]}function jn(e){return arguments.length?(this._y=e,this):this._y}function Qt(e,t,n){var i=new Jt(t??Bn,n??Ln,NaN,NaN,NaN,NaN);return e==null?i:i.addAll(e)}function Jt(e,t,n,i,r,o){this._x=e,this._y=t,this._x0=n,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function Te(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var U=Qt.prototype=Jt.prototype;U.copy=function(){var e=new Jt(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,i;if(!t)return e;if(!t.length)return e._root=Te(t),e;for(n=[{source:t,target:e._root=new Array(4)}];t=n.pop();)for(var r=0;r<4;++r)(i=t.source[r])&&(i.length?n.push({source:i,target:t.target[r]=new Array(4)}):t.target[r]=Te(i));return e},U.add=Q,U.addAll=st,U.cover=Dn,U.data=Mn,U.extent=In,U.find=Nn,U.remove=Fn,U.removeAll=kn,U.root=En,U.size=Rn,U.visit=zn,U.visitAfter=On,U.x=Pn,U.y=jn;function L(e){return function(){return e}}function Y(e){return(e()-.5)*1e-6}function Gn(e){return e.x+e.vx}function Un(e){return e.y+e.vy}function Hn(e){var t,n,i,r=1,o=1;typeof e!="function"&&(e=L(e==null?1:+e));function a(){for(var s,h=t.length,g,d,p,x,y,_,w=0;w<o;++w)for(g=Qt(t,Gn,Un).visitAfter(u),s=0;s<h;++s)d=t[s],y=n[d.index],_=y*y,p=d.x+d.vx,x=d.y+d.vy,g.visit(b);function b(S,v,C,D,N){var I=S.data,B=S.r,k=y+B;if(I){if(I.index>d.index){var P=p-I.x-I.vx,W=x-I.y-I.vy,H=P*P+W*W;H<k*k&&(P===0&&(P=Y(i),H+=P*P),W===0&&(W=Y(i),H+=W*W),H=(k-(H=Math.sqrt(H)))/H*r,d.vx+=(P*=H)*(k=(B*=B)/(_+B)),d.vy+=(W*=H)*k,I.vx-=P*(k=1-k),I.vy-=W*k)}return}return v>p+k||D<p-k||C>x+k||N<x-k}}function u(s){if(s.data)return s.r=n[s.data.index];for(var h=s.r=0;h<4;++h)s[h]&&s[h].r>s.r&&(s.r=s[h].r)}function c(){if(t){var s,h=t.length,g;for(n=new Array(h),s=0;s<h;++s)g=t[s],n[g.index]=+e(g,s,t)}}return a.initialize=function(s,h){t=s,i=h,c()},a.iterations=function(s){return arguments.length?(o=+s,a):o},a.strength=function(s){return arguments.length?(r=+s,a):r},a.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),a):e},a}function Wn(e){return e.index}function Ae(e,t){var n=e.get(t);if(!n)throw new Error("node not found: "+t);return n}function Vn(e){var t=Wn,n=g,i,r=L(30),o,a,u,c,s,h=1;e==null&&(e=[]);function g(_){return 1/Math.min(u[_.source.index],u[_.target.index])}function d(_){for(var w=0,b=e.length;w<h;++w)for(var S=0,v,C,D,N,I,B,k;S<b;++S)v=e[S],C=v.source,D=v.target,N=D.x+D.vx-C.x-C.vx||Y(s),I=D.y+D.vy-C.y-C.vy||Y(s),B=Math.sqrt(N*N+I*I),B=(B-o[S])/B*_*i[S],N*=B,I*=B,D.vx-=N*(k=c[S]),D.vy-=I*k,C.vx+=N*(k=1-k),C.vy+=I*k}function p(){if(a){var _,w=a.length,b=e.length,S=new Map(a.map((C,D)=>[t(C,D,a),C])),v;for(_=0,u=new Array(w);_<b;++_)v=e[_],v.index=_,typeof v.source!="object"&&(v.source=Ae(S,v.source)),typeof v.target!="object"&&(v.target=Ae(S,v.target)),u[v.source.index]=(u[v.source.index]||0)+1,u[v.target.index]=(u[v.target.index]||0)+1;for(_=0,c=new Array(b);_<b;++_)v=e[_],c[_]=u[v.source.index]/(u[v.source.index]+u[v.target.index]);i=new Array(b),x(),o=new Array(b),y()}}function x(){if(a)for(var _=0,w=e.length;_<w;++_)i[_]=+n(e[_],_,e)}function y(){if(a)for(var _=0,w=e.length;_<w;++_)o[_]=+r(e[_],_,e)}return d.initialize=function(_,w){a=_,s=w,p()},d.links=function(_){return arguments.length?(e=_,p(),d):e},d.id=function(_){return arguments.length?(t=_,d):t},d.iterations=function(_){return arguments.length?(h=+_,d):h},d.strength=function(_){return arguments.length?(n=typeof _=="function"?_:L(+_),x(),d):n},d.distance=function(_){return arguments.length?(r=typeof _=="function"?_:L(+_),y(),d):r},d}var $n={value:()=>{}};function te(){for(var e=0,t=arguments.length,n={},i;e<t;++e){if(!(i=arguments[e]+"")||i in n||/[\\s.]/.test(i))throw new Error("illegal type: "+i);n[i]=[]}return new Ct(n)}function Ct(e){this._=e}function qn(e,t){return e.trim().split(/^|\\s+/).map(function(n){var i="",r=n.indexOf(".");if(r>=0&&(i=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:i}})}Ct.prototype=te.prototype={constructor:Ct,on:function(e,t){var n=this._,i=qn(e+"",n),r,o=-1,a=i.length;if(arguments.length<2){for(;++o<a;)if((r=(e=i[o]).type)&&(r=Xn(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++o<a;)if(r=(e=i[o]).type)n[r]=Ce(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Ce(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new Ct(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),i=0,r,o;i<r;++i)n[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(o=this._[e],i=0,r=o.length;i<r;++i)o[i].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var i=this._[e],r=0,o=i.length;r<o;++r)i[r].value.apply(t,n)}};function Xn(e,t){for(var n=0,i=e.length,r;n<i;++n)if((r=e[n]).name===t)return r.value}function Ce(e,t,n){for(var i=0,r=e.length;i<r;++i)if(e[i].name===t){e[i]=$n,e=e.slice(0,i).concat(e.slice(i+1));break}return n!=null&&e.push({name:t,value:n}),e}var ot=0,ht=0,ft=0,De=1e3,Dt,dt,Mt=0,J=0,It=0,gt=typeof performance=="object"&&performance.now?performance:Date,Me=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Ie(){return J||(Me(Kn),J=gt.now()+It)}function Kn(){J=0}function ee(){this._call=this._time=this._next=null}ee.prototype=Ne.prototype={constructor:ee,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?Ie():+n)+(t==null?0:+t),!this._next&&dt!==this&&(dt?dt._next=this:Dt=this,dt=this),this._call=e,this._time=n,ne()},stop:function(){this._call&&(this._call=null,this._time=1/0,ne())}};function Ne(e,t,n){var i=new ee;return i.restart(e,t,n),i}function Yn(){Ie(),++ot;for(var e=Dt,t;e;)(t=J-e._time)>=0&&e._call.call(void 0,t),e=e._next;--ot}function Fe(){J=(Mt=gt.now())+It,ot=ht=0;try{Yn()}finally{ot=0,Qn(),J=0}}function Zn(){var e=gt.now(),t=e-Mt;t>De&&(It-=t,Mt=e)}function Qn(){for(var e,t=Dt,n,i=1/0;t;)t._call?(i>t._time&&(i=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:Dt=n);dt=e,ne(i)}function ne(e){if(!ot){ht&&(ht=clearTimeout(ht));var t=e-J;t>24?(e<1/0&&(ht=setTimeout(Fe,e-gt.now()-It)),ft&&(ft=clearInterval(ft))):(ft||(Mt=gt.now(),ft=setInterval(Zn,De)),ot=1,Me(Fe))}}const Jn=1664525,ti=1013904223,ke=4294967296;function ei(){let e=1;return()=>(e=(Jn*e+ti)%ke)/ke}function ni(e){return e.x}function ii(e){return e.y}var ri=10,si=Math.PI*(3-Math.sqrt(5));function oi(e){var t,n=1,i=.001,r=1-Math.pow(i,1/300),o=0,a=.6,u=new Map,c=Ne(g),s=te("tick","end"),h=ei();e==null&&(e=[]);function g(){d(),s.call("tick",t),n<i&&(c.stop(),s.call("end",t))}function d(y){var _,w=e.length,b;y===void 0&&(y=1);for(var S=0;S<y;++S)for(n+=(o-n)*r,u.forEach(function(v){v(n)}),_=0;_<w;++_)b=e[_],b.fx==null?b.x+=b.vx*=a:(b.x=b.fx,b.vx=0),b.fy==null?b.y+=b.vy*=a:(b.y=b.fy,b.vy=0);return t}function p(){for(var y=0,_=e.length,w;y<_;++y){if(w=e[y],w.index=y,w.fx!=null&&(w.x=w.fx),w.fy!=null&&(w.y=w.fy),isNaN(w.x)||isNaN(w.y)){var b=ri*Math.sqrt(.5+y),S=y*si;w.x=b*Math.cos(S),w.y=b*Math.sin(S)}(isNaN(w.vx)||isNaN(w.vy))&&(w.vx=w.vy=0)}}function x(y){return y.initialize&&y.initialize(e,h),y}return p(),t={tick:d,restart:function(){return c.restart(g),t},stop:function(){return c.stop(),t},nodes:function(y){return arguments.length?(e=y,p(),u.forEach(x),t):e},alpha:function(y){return arguments.length?(n=+y,t):n},alphaMin:function(y){return arguments.length?(i=+y,t):i},alphaDecay:function(y){return arguments.length?(r=+y,t):+r},alphaTarget:function(y){return arguments.length?(o=+y,t):o},velocityDecay:function(y){return arguments.length?(a=1-y,t):1-a},randomSource:function(y){return arguments.length?(h=y,u.forEach(x),t):h},force:function(y,_){return arguments.length>1?(_==null?u.delete(y):u.set(y,x(_)),t):u.get(y)},find:function(y,_,w){var b=0,S=e.length,v,C,D,N,I;for(w==null?w=1/0:w*=w,b=0;b<S;++b)N=e[b],v=y-N.x,C=_-N.y,D=v*v+C*C,D<w&&(I=N,w=D);return I},on:function(y,_){return arguments.length>1?(s.on(y,_),t):s.on(y)}}}function ai(){var e,t,n,i,r=L(-30),o,a=1,u=1/0,c=.81;function s(p){var x,y=e.length,_=Qt(e,ni,ii).visitAfter(g);for(i=p,x=0;x<y;++x)t=e[x],_.visit(d)}function h(){if(e){var p,x=e.length,y;for(o=new Array(x),p=0;p<x;++p)y=e[p],o[y.index]=+r(y,p,e)}}function g(p){var x=0,y,_,w=0,b,S,v;if(p.length){for(b=S=v=0;v<4;++v)(y=p[v])&&(_=Math.abs(y.value))&&(x+=y.value,w+=_,b+=_*y.x,S+=_*y.y);p.x=b/w,p.y=S/w}else{y=p,y.x=y.data.x,y.y=y.data.y;do x+=o[y.data.index];while(y=y.next)}p.value=x}function d(p,x,y,_){if(!p.value)return!0;var w=p.x-t.x,b=p.y-t.y,S=_-x,v=w*w+b*b;if(S*S/c<v)return v<u&&(w===0&&(w=Y(n),v+=w*w),b===0&&(b=Y(n),v+=b*b),v<a&&(v=Math.sqrt(a*v)),t.vx+=w*p.value*i/v,t.vy+=b*p.value*i/v),!0;if(p.length||v>=u)return;(p.data!==t||p.next)&&(w===0&&(w=Y(n),v+=w*w),b===0&&(b=Y(n),v+=b*b),v<a&&(v=Math.sqrt(a*v)));do p.data!==t&&(S=o[p.data.index]*i/v,t.vx+=w*S,t.vy+=b*S);while(p=p.next)}return s.initialize=function(p,x){e=p,n=x,h()},s.strength=function(p){return arguments.length?(r=typeof p=="function"?p:L(+p),h(),s):r},s.distanceMin=function(p){return arguments.length?(a=p*p,s):Math.sqrt(a)},s.distanceMax=function(p){return arguments.length?(u=p*p,s):Math.sqrt(u)},s.theta=function(p){return arguments.length?(c=p*p,s):Math.sqrt(c)},s}function Ee(e,t,n){var i,r=L(.1),o,a;typeof e!="function"&&(e=L(+e)),t==null&&(t=0),n==null&&(n=0);function u(s){for(var h=0,g=i.length;h<g;++h){var d=i[h],p=d.x-t||1e-6,x=d.y-n||1e-6,y=Math.sqrt(p*p+x*x),_=(a[h]-y)*o[h]*s/y;d.vx+=p*_,d.vy+=x*_}}function c(){if(i){var s,h=i.length;for(o=new Array(h),a=new Array(h),s=0;s<h;++s)a[s]=+e(i[s],s,i),o[s]=isNaN(a[s])?0:+r(i[s],s,i)}}return u.initialize=function(s){i=s,c()},u.strength=function(s){return arguments.length?(r=typeof s=="function"?s:L(+s),c(),u):r},u.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),u):e},u.x=function(s){return arguments.length?(t=+s,u):t},u.y=function(s){return arguments.length?(n=+s,u):n},u}function Re(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(u){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vx+=(r[c]-h.x)*i[c]*u}function a(){if(n){var u,c=n.length;for(i=new Array(c),r=new Array(c),u=0;u<c;++u)i[u]=isNaN(r[u]=+e(n[u],u,n))?0:+t(n[u],u,n)}}return o.initialize=function(u){n=u,a()},o.strength=function(u){return arguments.length?(t=typeof u=="function"?u:L(+u),a(),o):t},o.x=function(u){return arguments.length?(e=typeof u=="function"?u:L(+u),a(),o):e},o}function ze(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(u){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vy+=(r[c]-h.y)*i[c]*u}function a(){if(n){var u,c=n.length;for(i=new Array(c),r=new Array(c),u=0;u<c;++u)i[u]=isNaN(r[u]=+e(n[u],u,n))?0:+t(n[u],u,n)}}return o.initialize=function(u){n=u,a()},o.strength=function(u){return arguments.length?(t=typeof u=="function"?u:L(+u),a(),o):t},o.y=function(u){return arguments.length?(e=typeof u=="function"?u:L(+u),a(),o):e},o}function li(e=0,t=0,n=.001){let i=[],r;function o(){r=typeof n=="function"?n:()=>n}function a(u){for(let c=0,s=i.length;c<s;++c){const h=i[c],g=r(h,c,i);h.vx&&h.x&&(h.vx-=(h.x-e)*g*u),h.vy&&h.y&&(h.vy-=(h.y-t)*g*u)}}return a.initialize=u=>{i=u,o()},a.x=function(u){return arguments.length?(e=u,a):e},a.y=function(u){return arguments.length?(t=u,a):t},a.strength=function(u){return arguments.length?(n=u,o(),a):n},a}var ie="http://www.w3.org/1999/xhtml",Oe={svg:"http://www.w3.org/2000/svg",xhtml:ie,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Be(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),Oe.hasOwnProperty(t)?{space:Oe[t],local:e}:e}function ui(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===ie&&t.documentElement.namespaceURI===ie?t.createElement(e):t.createElementNS(n,e)}}function ci(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function Pe(e){var t=Be(e);return(t.local?ci:ui)(t)}function hi(){}function Le(e){return e==null?hi:function(){return this.querySelector(e)}}function fi(e){typeof e!="function"&&(e=Le(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,u=i[r]=new Array(a),c,s,h=0;h<a;++h)(c=o[h])&&(s=e.call(c,c.__data__,h,o))&&("__data__"in c&&(s.__data__=c.__data__),u[h]=s);return new $(i,this._parents)}function di(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function gi(){return[]}function pi(e){return e==null?gi:function(){return this.querySelectorAll(e)}}function yi(e){return function(){return di(e.apply(this,arguments))}}function mi(e){typeof e=="function"?e=yi(e):e=pi(e);for(var t=this._groups,n=t.length,i=[],r=[],o=0;o<n;++o)for(var a=t[o],u=a.length,c,s=0;s<u;++s)(c=a[s])&&(i.push(e.call(c,c.__data__,s,a)),r.push(c));return new $(i,r)}function _i(e){return function(){return this.matches(e)}}function je(e){return function(t){return t.matches(e)}}var vi=Array.prototype.find;function wi(e){return function(){return vi.call(this.children,e)}}function xi(){return this.firstElementChild}function bi(e){return this.select(e==null?xi:wi(typeof e=="function"?e:je(e)))}var Si=Array.prototype.filter;function Ti(){return Array.from(this.children)}function Ai(e){return function(){return Si.call(this.children,e)}}function Ci(e){return this.selectAll(e==null?Ti:Ai(typeof e=="function"?e:je(e)))}function Di(e){typeof e!="function"&&(e=_i(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,u=i[r]=[],c,s=0;s<a;++s)(c=o[s])&&e.call(c,c.__data__,s,o)&&u.push(c);return new $(i,this._parents)}function Ge(e){return new Array(e.length)}function Mi(){return new $(this._enter||this._groups.map(Ge),this._parents)}function Nt(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}Nt.prototype={constructor:Nt,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function Ii(e){return function(){return e}}function Ni(e,t,n,i,r,o){for(var a=0,u,c=t.length,s=o.length;a<s;++a)(u=t[a])?(u.__data__=o[a],i[a]=u):n[a]=new Nt(e,o[a]);for(;a<c;++a)(u=t[a])&&(r[a]=u)}function Fi(e,t,n,i,r,o,a){var u,c,s=new Map,h=t.length,g=o.length,d=new Array(h),p;for(u=0;u<h;++u)(c=t[u])&&(d[u]=p=a.call(c,c.__data__,u,t)+"",s.has(p)?r[u]=c:s.set(p,c));for(u=0;u<g;++u)p=a.call(e,o[u],u,o)+"",(c=s.get(p))?(i[u]=c,c.__data__=o[u],s.delete(p)):n[u]=new Nt(e,o[u]);for(u=0;u<h;++u)(c=t[u])&&s.get(d[u])===c&&(r[u]=c)}function ki(e){return e.__data__}function Ei(e,t){if(!arguments.length)return Array.from(this,ki);var n=t?Fi:Ni,i=this._parents,r=this._groups;typeof e!="function"&&(e=Ii(e));for(var o=r.length,a=new Array(o),u=new Array(o),c=new Array(o),s=0;s<o;++s){var h=i[s],g=r[s],d=g.length,p=Ri(e.call(h,h&&h.__data__,s,i)),x=p.length,y=u[s]=new Array(x),_=a[s]=new Array(x),w=c[s]=new Array(d);n(h,g,y,_,w,p,t);for(var b=0,S=0,v,C;b<x;++b)if(v=y[b]){for(b>=S&&(S=b+1);!(C=_[S])&&++S<x;);v._next=C||null}}return a=new $(a,i),a._enter=u,a._exit=c,a}function Ri(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function zi(){return new $(this._exit||this._groups.map(Ge),this._parents)}function Oi(e,t,n){var i=this.enter(),r=this,o=this.exit();return typeof e=="function"?(i=e(i),i&&(i=i.selection())):i=i.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?o.remove():n(o),i&&r?i.merge(r).order():r}function Bi(e){for(var t=e.selection?e.selection():e,n=this._groups,i=t._groups,r=n.length,o=i.length,a=Math.min(r,o),u=new Array(r),c=0;c<a;++c)for(var s=n[c],h=i[c],g=s.length,d=u[c]=new Array(g),p,x=0;x<g;++x)(p=s[x]||h[x])&&(d[x]=p);for(;c<r;++c)u[c]=n[c];return new $(u,this._parents)}function Pi(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var i=e[t],r=i.length-1,o=i[r],a;--r>=0;)(a=i[r])&&(o&&a.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(a,o),o=a);return this}function Li(e){e||(e=ji);function t(g,d){return g&&d?e(g.__data__,d.__data__):!g-!d}for(var n=this._groups,i=n.length,r=new Array(i),o=0;o<i;++o){for(var a=n[o],u=a.length,c=r[o]=new Array(u),s,h=0;h<u;++h)(s=a[h])&&(c[h]=s);c.sort(t)}return new $(r,this._parents).order()}function ji(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function Gi(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function Ui(){return Array.from(this)}function Hi(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length;r<o;++r){var a=i[r];if(a)return a}return null}function Wi(){let e=0;for(const t of this)++e;return e}function Vi(){return!this.node()}function $i(e){for(var t=this._groups,n=0,i=t.length;n<i;++n)for(var r=t[n],o=0,a=r.length,u;o<a;++o)(u=r[o])&&e.call(u,u.__data__,o,r);return this}function qi(e){return function(){this.removeAttribute(e)}}function Xi(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Ki(e,t){return function(){this.setAttribute(e,t)}}function Yi(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function Zi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function Qi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function Ji(e,t){var n=Be(e);if(arguments.length<2){var i=this.node();return n.local?i.getAttributeNS(n.space,n.local):i.getAttribute(n)}return this.each((t==null?n.local?Xi:qi:typeof t=="function"?n.local?Qi:Zi:n.local?Yi:Ki)(n,t))}function Ue(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function tr(e){return function(){this.style.removeProperty(e)}}function er(e,t,n){return function(){this.style.setProperty(e,t,n)}}function nr(e,t,n){return function(){var i=t.apply(this,arguments);i==null?this.style.removeProperty(e):this.style.setProperty(e,i,n)}}function ir(e,t,n){return arguments.length>1?this.each((t==null?tr:typeof t=="function"?nr:er)(e,t,n??"")):rr(this.node(),e)}function rr(e,t){return e.style.getPropertyValue(t)||Ue(e).getComputedStyle(e,null).getPropertyValue(t)}function sr(e){return function(){delete this[e]}}function or(e,t){return function(){this[e]=t}}function ar(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function lr(e,t){return arguments.length>1?this.each((t==null?sr:typeof t=="function"?ar:or)(e,t)):this.node()[e]}function He(e){return e.trim().split(/^|\\s+/)}function re(e){return e.classList||new We(e)}function We(e){this._node=e,this._names=He(e.getAttribute("class")||"")}We.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function Ve(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.add(t[i])}function $e(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.remove(t[i])}function ur(e){return function(){Ve(this,e)}}function cr(e){return function(){$e(this,e)}}function hr(e,t){return function(){(t.apply(this,arguments)?Ve:$e)(this,e)}}function fr(e,t){var n=He(e+"");if(arguments.length<2){for(var i=re(this.node()),r=-1,o=n.length;++r<o;)if(!i.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?hr:t?ur:cr)(n,t))}function dr(){this.textContent=""}function gr(e){return function(){this.textContent=e}}function pr(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function yr(e){return arguments.length?this.each(e==null?dr:(typeof e=="function"?pr:gr)(e)):this.node().textContent}function mr(){this.innerHTML=""}function _r(e){return function(){this.innerHTML=e}}function vr(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function wr(e){return arguments.length?this.each(e==null?mr:(typeof e=="function"?vr:_r)(e)):this.node().innerHTML}function xr(){this.nextSibling&&this.parentNode.appendChild(this)}function br(){return this.each(xr)}function Sr(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function Tr(){return this.each(Sr)}function Ar(e){var t=typeof e=="function"?e:Pe(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function Cr(){return null}function Dr(e,t){var n=typeof e=="function"?e:Pe(e),i=t==null?Cr:typeof t=="function"?t:Le(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),i.apply(this,arguments)||null)})}function Mr(){var e=this.parentNode;e&&e.removeChild(this)}function Ir(){return this.each(Mr)}function Nr(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function Fr(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function kr(e){return this.select(e?Fr:Nr)}function Er(e){return arguments.length?this.property("__data__",e):this.node().__data__}function Rr(e){return function(t){e.call(this,t,this.__data__)}}function zr(e){return e.trim().split(/^|\\s+/).map(function(t){var n="",i=t.indexOf(".");return i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),{type:t,name:n}})}function Or(e){return function(){var t=this.__on;if(t){for(var n=0,i=-1,r=t.length,o;n<r;++n)o=t[n],(!e.type||o.type===e.type)&&o.name===e.name?this.removeEventListener(o.type,o.listener,o.options):t[++i]=o;++i?t.length=i:delete this.__on}}}function Br(e,t,n){return function(){var i=this.__on,r,o=Rr(t);if(i){for(var a=0,u=i.length;a<u;++a)if((r=i[a]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=n),r.value=t;return}}this.addEventListener(e.type,o,n),r={type:e.type,name:e.name,value:t,listener:o,options:n},i?i.push(r):this.__on=[r]}}function Pr(e,t,n){var i=zr(e+""),r,o=i.length,a;if(arguments.length<2){var u=this.node().__on;if(u){for(var c=0,s=u.length,h;c<s;++c)for(r=0,h=u[c];r<o;++r)if((a=i[r]).type===h.type&&a.name===h.name)return h.value}return}for(u=t?Br:Or,r=0;r<o;++r)this.each(u(i[r],t,n));return this}function qe(e,t,n){var i=Ue(e),r=i.CustomEvent;typeof r=="function"?r=new r(t,n):(r=i.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function Lr(e,t){return function(){return qe(this,e,t)}}function jr(e,t){return function(){return qe(this,e,t.apply(this,arguments))}}function Gr(e,t){return this.each((typeof t=="function"?jr:Lr)(e,t))}function*Ur(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length,a;r<o;++r)(a=i[r])&&(yield a)}var Hr=[null];function $(e,t){this._groups=e,this._parents=t}function Wr(){return this}$.prototype={constructor:$,select:fi,selectAll:mi,selectChild:bi,selectChildren:Ci,filter:Di,data:Ei,enter:Mi,exit:zi,join:Oi,merge:Bi,selection:Wr,order:Pi,sort:Li,call:Gi,nodes:Ui,node:Hi,size:Wi,empty:Vi,each:$i,attr:Ji,style:ir,property:lr,classed:fr,text:yr,html:wr,raise:br,lower:Tr,append:Ar,insert:Dr,remove:Ir,clone:kr,datum:Er,on:Pr,dispatch:Gr,[Symbol.iterator]:Ur};function Ft(e){return typeof e=="string"?new $([[document.querySelector(e)]],[document.documentElement]):new $([[e]],Hr)}function Vr(e){let t;for(;t=e.sourceEvent;)e=t;return e}function Xe(e,t){if(e=Vr(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var i=n.createSVGPoint();return i.x=e.clientX,i.y=e.clientY,i=i.matrixTransform(t.getScreenCTM().inverse()),[i.x,i.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}const $r={passive:!1},pt={capture:!0,passive:!1};function se(e){e.stopImmediatePropagation()}function at(e){e.preventDefault(),e.stopImmediatePropagation()}function qr(e){var t=e.document.documentElement,n=Ft(e).on("dragstart.drag",at,pt);"onselectstart"in t?n.on("selectstart.drag",at,pt):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function Xr(e,t){var n=e.document.documentElement,i=Ft(e).on("dragstart.drag",null);t&&(i.on("click.drag",at,pt),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in n?i.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var kt=e=>()=>e;function oe(e,{sourceEvent:t,subject:n,target:i,identifier:r,active:o,x:a,y:u,dx:c,dy:s,dispatch:h}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:u,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:s,enumerable:!0,configurable:!0},_:{value:h}})}oe.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function Kr(e){return!e.ctrlKey&&!e.button}function Yr(){return this.parentNode}function Zr(e,t){return t??{x:e.x,y:e.y}}function Qr(){return navigator.maxTouchPoints||"ontouchstart"in this}function Jr(){var e=Kr,t=Yr,n=Zr,i=Qr,r={},o=te("start","drag","end"),a=0,u,c,s,h,g=0;function d(v){v.on("mousedown.drag",p).filter(i).on("touchstart.drag",_).on("touchmove.drag",w,$r).on("touchend.drag touchcancel.drag",b).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function p(v,C){if(!(h||!e.call(this,v,C))){var D=S(this,t.call(this,v,C),v,C,"mouse");D&&(Ft(v.view).on("mousemove.drag",x,pt).on("mouseup.drag",y,pt),qr(v.view),se(v),s=!1,u=v.clientX,c=v.clientY,D("start",v))}}function x(v){if(at(v),!s){var C=v.clientX-u,D=v.clientY-c;s=C*C+D*D>g}r.mouse("drag",v)}function y(v){Ft(v.view).on("mousemove.drag mouseup.drag",null),Xr(v.view,s),at(v),r.mouse("end",v)}function _(v,C){if(e.call(this,v,C)){var D=v.changedTouches,N=t.call(this,v,C),I=D.length,B,k;for(B=0;B<I;++B)(k=S(this,N,v,C,D[B].identifier,D[B]))&&(se(v),k("start",v,D[B]))}}function w(v){var C=v.changedTouches,D=C.length,N,I;for(N=0;N<D;++N)(I=r[C[N].identifier])&&(at(v),I("drag",v,C[N]))}function b(v){var C=v.changedTouches,D=C.length,N,I;for(h&&clearTimeout(h),h=setTimeout(function(){h=null},500),N=0;N<D;++N)(I=r[C[N].identifier])&&(se(v),I("end",v,C[N]))}function S(v,C,D,N,I,B){var k=o.copy(),P=Xe(B||D,C),W,H,lt;if((lt=n.call(v,new oe("beforestart",{sourceEvent:D,target:d,identifier:I,active:a,x:P[0],y:P[1],dx:0,dy:0,dispatch:k}),N))!=null)return W=lt.x-P[0]||0,H=lt.y-P[1]||0,function ce(vt,Ut,he){var Ht=P,wt;switch(vt){case"start":r[I]=ce,wt=a++;break;case"end":delete r[I],--a;case"drag":P=Xe(he||Ut,C),wt=a;break}k.call(vt,v,new oe(vt,{sourceEvent:Ut,subject:lt,target:d,identifier:I,active:wt,x:P[0]+W,y:P[1]+H,dx:P[0]-Ht[0],dy:P[1]-Ht[1],dispatch:k}),N)}}return d.filter=function(v){return arguments.length?(e=typeof v=="function"?v:kt(!!v),d):e},d.container=function(v){return arguments.length?(t=typeof v=="function"?v:kt(v),d):t},d.subject=function(v){return arguments.length?(n=typeof v=="function"?v:kt(v),d):n},d.touchable=function(v){return arguments.length?(i=typeof v=="function"?v:kt(!!v),d):i},d.on=function(){var v=o.on.apply(o,arguments);return v===o?d:v},d.clickDistance=function(v){return arguments.length?(g=(v=+v)*v,d):Math.sqrt(g)},d}function Ke(e=8,t="id-"){const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",i=n+"0123456789-_";let r=n.charAt(Math.floor(Math.random()*n.length));for(let o=1;o<e;o++)r+=i.charAt(Math.floor(Math.random()*i.length));return`${t}${r}`}let Ye=class Cn{constructor(t,n,i,r=Ke(),o=[]){T(this,"id");T(this,"data");T(this,"children");T(this,"style");T(this,"edgesOut");T(this,"edgesIn");T(this,"defaultCircleRadius",10);T(this,"x");T(this,"y");T(this,"vx");T(this,"vy");T(this,"fx");T(this,"fy");T(this,"weight");T(this,"frozen");T(this,"visible");T(this,"expanded");T(this,"isChild");T(this,"childrenDepth");T(this,"isParent");T(this,"parentNode");T(this,"_original_object");T(this,"_deepest_node_clone");T(this,"_subgraph");T(this,"_circleRadius",this.defaultCircleRadius);T(this,"_circleRadiusCollapsed",this.defaultCircleRadius);T(this,"_dirty");T(this,"domID");this.id=t,this.domID=r,this.data=n??{},this.style=i??{},this.children=[],this.isParent=!1,this.setChildren(o),this._dirty=!0,this.frozen=!1,this.visible=!0,this.expanded=!1,this.isChild=!1,this.childrenDepth=0,this.edgesOut=new Set,this.edgesIn=new Set}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}registerEdgeOut(t){this.edgesOut.add(t)}registerEdgeIn(t){this.edgesIn.add(t)}emptyEdges(){this.edgesOut.clear(),this.edgesIn.clear()}getConnectedNodes(){return[...this.edgesOut].map(t=>t.to)}getConnectingNodes(){return[...this.edgesIn].map(t=>t.from)}getEdgesOut(){return[...this.edgesOut]}getEdgesIn(){return[...this.edgesIn]}getStyle(){return this.style}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`node-${this.domID}`):null}toDict(t=!1){const n={id:this.id,data:this.data,style:this.style,weight:this.weight};return t||(n.x=this.x,n.y=this.y,n.vx=this.vx,n.vy=this.vy,n.fx=this.fx,n.fy=this.fy),this.hasChildren()&&(n.children=this.children.map(i=>i.toDict(t))),n}clone(){const t={...this.data},n={...this.style},i=new Cn(this.id,t,n);return i.x=this.x,i.y=this.y,i.vx=this.vx,i.vy=this.vy,i.fx=this.fx,i.fy=this.fy,i.weight=this.weight,i.frozen=this.frozen,i.visible=this.visible,i.expanded=this.expanded,i.isChild=this.isChild,i.childrenDepth=this.childrenDepth,i.isParent=this.isParent,i.parentNode=this.parentNode,i._circleRadius=this._circleRadius,i.children=this.children.map(r=>r.clone()),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}freeze(){this.frozen=!0,this.fx=this.x,this.fy=this.y}unfreeze(){this.frozen=!1,this.fx=void 0,this.fy=void 0}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}toggleExpand(t){t===void 0?this.expanded?this.collapse():this.expand():t?this.expand():this.collapse(),this.markDirty()}expand(){this.expanded=!0,this._original_object&&(this._original_object.expanded=!0)}collapse(){this.expanded=!1,this._original_object&&(this._original_object.expanded=!1)}degree(){return this.edgesOut.size+this.edgesIn.size}setCircleRadius(t){this._circleRadius=t}getCircleRadius(){return this._circleRadius}setCircleRadiusCollapsed(t){this._circleRadiusCollapsed=t}getCircleRadiusCollapsed(){return this._circleRadiusCollapsed}setChildren(t){this.children=t,this.hasChildren()?this.isParent=!0:this.isParent=!1}hasChildren(){return this.children.length>0}markAsChild(t,n){this.isChild=!0,this.childrenDepth=n,this.parentNode=t}markAsParent(){this.isParent=!0}setSubgraph(t){this._subgraph=t}getSubgraph(){return this._subgraph}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setDeepestNodeClone(t){this._deepest_node_clone=t}getDeepestNodeClone(){return this._deepest_node_clone}};class Et{constructor(t,n,i,r,o,a=null,u){T(this,"id");T(this,"from");T(this,"to");T(this,"directed");T(this,"data");T(this,"style");T(this,"visible");T(this,"isSynthetic");T(this,"syntheticTerminalNode");T(this,"_original_object");T(this,"_subgraphFromNode");T(this,"_subgraphToNode");T(this,"_dirty");T(this,"domID");this.id=t,this.domID=Ke(),this.from=n,this.to=i,this.directed=a,this.data=r??{},this.style=o??{},this.visible=!0,this._dirty=!0,this.isSynthetic=u!==void 0,this.syntheticTerminalNode=u,this.from.registerEdgeOut(this),this.to.registerEdgeIn(this)}get source(){return this.from}get target(){return this.to}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}getStyle(){return this.style}getEdgeStyle(){var t;return((t=this.style)==null?void 0:t.edge)??{}}getLabelStyle(){var t;return((t=this.style)==null?void 0:t.label)??{}}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`edge-${this.domID}`):null}setFrom(t){this.from=t}setTo(t){this.to=t}toDict(){return{id:this.id,from:this.from.id,to:this.to.id,data:this.data,style:this.style}}clone(){const t={...this.data},n={...this.style},i=new Et(this.id,this.from.clone(),this.to.clone(),t,n,this.directed);return i.visible=this.visible,i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setSubgraphFromNode(t){this._subgraphFromNode=t}setSubgraphToNode(t){this._subgraphToNode=t}getSubgraphFromNode(){return this._subgraphFromNode}getSubgraphToNode(){return this._subgraphToNode}}function ts(e){return new Worker(self.location.href,{name:e==null?void 0:e.name})}function es(){return new ts}const ns=(e,t,n,i,r)=>new Promise((o,a)=>{const u=es();u.postMessage({source:"simulation-worker-wrapper",nodes:e,edges:t,options:n,canvasBCR:i}),u.onmessage=c=>{const{type:s,progress:h,nodes:g,edges:d,elapsedTime:p}=c.data;if(s==="tick"&&typeof h=="number"){r==null||r(h,p);return}s==="done"&&(o({nodes:g,edges:d}),u.terminate())},u.onerror=a});var Rt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function is(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var yt={exports:{}};yt.exports;var Ze;function rs(){return Ze||(Ze=1,(function(e,t){var n=200,i="__lodash_hash_undefined__",r=800,o=16,a=9007199254740991,u="[object Arguments]",c="[object Array]",s="[object AsyncFunction]",h="[object Boolean]",g="[object Date]",d="[object Error]",p="[object Function]",x="[object GeneratorFunction]",y="[object Map]",_="[object Number]",w="[object Null]",b="[object Object]",S="[object Proxy]",v="[object RegExp]",C="[object Set]",D="[object String]",N="[object Undefined]",I="[object WeakMap]",B="[object ArrayBuffer]",k="[object DataView]",P="[object Float32Array]",W="[object Float64Array]",H="[object Int8Array]",lt="[object Int16Array]",ce="[object Int32Array]",vt="[object Uint8Array]",Ut="[object Uint8ClampedArray]",he="[object Uint16Array]",Ht="[object Uint32Array]",wt=/[\\\\^$.*+?()[\\]{}|]/g,Bs=/^\\[object .+?Constructor\\]$/,Ps=/^(?:0|[1-9]\\d*)$/,R={};R[P]=R[W]=R[H]=R[lt]=R[ce]=R[vt]=R[Ut]=R[he]=R[Ht]=!0,R[u]=R[c]=R[B]=R[h]=R[k]=R[g]=R[d]=R[p]=R[y]=R[_]=R[b]=R[v]=R[C]=R[D]=R[I]=!1;var nn=typeof Rt=="object"&&Rt&&Rt.Object===Object&&Rt,Ls=typeof self=="object"&&self&&self.Object===Object&&self,xt=nn||Ls||Function("return this")(),rn=t&&!t.nodeType&&t,bt=rn&&!0&&e&&!e.nodeType&&e,sn=bt&&bt.exports===rn,fe=sn&&nn.process,on=(function(){try{var l=bt&&bt.require&&bt.require("util").types;return l||fe&&fe.binding&&fe.binding("util")}catch{}})(),an=on&&on.isTypedArray;function js(l,f,m){switch(m.length){case 0:return l.call(f);case 1:return l.call(f,m[0]);case 2:return l.call(f,m[0],m[1]);case 3:return l.call(f,m[0],m[1],m[2])}return l.apply(f,m)}function Gs(l,f){for(var m=-1,A=Array(l);++m<l;)A[m]=f(m);return A}function Us(l){return function(f){return l(f)}}function Hs(l,f){return l==null?void 0:l[f]}function Ws(l,f){return function(m){return l(f(m))}}var Vs=Array.prototype,$s=Function.prototype,Wt=Object.prototype,de=xt["__core-js_shared__"],Vt=$s.toString,Z=Wt.hasOwnProperty,ln=(function(){var l=/[^.]+$/.exec(de&&de.keys&&de.keys.IE_PROTO||"");return l?"Symbol(src)_1."+l:""})(),un=Wt.toString,qs=Vt.call(Object),Xs=RegExp("^"+Vt.call(Z).replace(wt,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$"),$t=sn?xt.Buffer:void 0,cn=xt.Symbol,hn=xt.Uint8Array;$t&&$t.allocUnsafe;var fn=Ws(Object.getPrototypeOf,Object),dn=Object.create,Ks=Wt.propertyIsEnumerable,Ys=Vs.splice,nt=cn?cn.toStringTag:void 0,qt=(function(){try{var l=ye(Object,"defineProperty");return l({},"",{}),l}catch{}})(),Zs=$t?$t.isBuffer:void 0,gn=Math.max,Qs=Date.now,pn=ye(xt,"Map"),St=ye(Object,"create"),Js=(function(){function l(){}return function(f){if(!rt(f))return{};if(dn)return dn(f);l.prototype=f;var m=new l;return l.prototype=void 0,m}})();function it(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function to(){this.__data__=St?St(null):{},this.size=0}function eo(l){var f=this.has(l)&&delete this.__data__[l];return this.size-=f?1:0,f}function no(l){var f=this.__data__;if(St){var m=f[l];return m===i?void 0:m}return Z.call(f,l)?f[l]:void 0}function io(l){var f=this.__data__;return St?f[l]!==void 0:Z.call(f,l)}function ro(l,f){var m=this.__data__;return this.size+=this.has(l)?0:1,m[l]=St&&f===void 0?i:f,this}it.prototype.clear=to,it.prototype.delete=eo,it.prototype.get=no,it.prototype.has=io,it.prototype.set=ro;function K(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function so(){this.__data__=[],this.size=0}function oo(l){var f=this.__data__,m=Xt(f,l);if(m<0)return!1;var A=f.length-1;return m==A?f.pop():Ys.call(f,m,1),--this.size,!0}function ao(l){var f=this.__data__,m=Xt(f,l);return m<0?void 0:f[m][1]}function lo(l){return Xt(this.__data__,l)>-1}function uo(l,f){var m=this.__data__,A=Xt(m,l);return A<0?(++this.size,m.push([l,f])):m[A][1]=f,this}K.prototype.clear=so,K.prototype.delete=oo,K.prototype.get=ao,K.prototype.has=lo,K.prototype.set=uo;function ut(l){var f=-1,m=l==null?0:l.length;for(this.clear();++f<m;){var A=l[f];this.set(A[0],A[1])}}function co(){this.size=0,this.__data__={hash:new it,map:new(pn||K),string:new it}}function ho(l){var f=Yt(this,l).delete(l);return this.size-=f?1:0,f}function fo(l){return Yt(this,l).get(l)}function go(l){return Yt(this,l).has(l)}function po(l,f){var m=Yt(this,l),A=m.size;return m.set(l,f),this.size+=m.size==A?0:1,this}ut.prototype.clear=co,ut.prototype.delete=ho,ut.prototype.get=fo,ut.prototype.has=go,ut.prototype.set=po;function ct(l){var f=this.__data__=new K(l);this.size=f.size}function yo(){this.__data__=new K,this.size=0}function mo(l){var f=this.__data__,m=f.delete(l);return this.size=f.size,m}function _o(l){return this.__data__.get(l)}function vo(l){return this.__data__.has(l)}function wo(l,f){var m=this.__data__;if(m instanceof K){var A=m.__data__;if(!pn||A.length<n-1)return A.push([l,f]),this.size=++m.size,this;m=this.__data__=new ut(A)}return m.set(l,f),this.size=m.size,this}ct.prototype.clear=yo,ct.prototype.delete=mo,ct.prototype.get=_o,ct.prototype.has=vo,ct.prototype.set=wo;function xo(l,f){var m=ve(l),A=!m&&_e(l),M=!m&&!A&&wn(l),E=!m&&!A&&!M&&bn(l),z=m||A||M||E,F=z?Gs(l.length,String):[],O=F.length;for(var q in l)z&&(q=="length"||M&&(q=="offset"||q=="parent")||E&&(q=="buffer"||q=="byteLength"||q=="byteOffset")||_n(q,O))||F.push(q);return F}function ge(l,f,m){(m!==void 0&&!Zt(l[f],m)||m===void 0&&!(f in l))&&pe(l,f,m)}function bo(l,f,m){var A=l[f];(!(Z.call(l,f)&&Zt(A,m))||m===void 0&&!(f in l))&&pe(l,f,m)}function Xt(l,f){for(var m=l.length;m--;)if(Zt(l[m][0],f))return m;return-1}function pe(l,f,m){f=="__proto__"&&qt?qt(l,f,{configurable:!0,enumerable:!0,value:m,writable:!0}):l[f]=m}var So=Oo();function Kt(l){return l==null?l===void 0?N:w:nt&&nt in Object(l)?Bo(l):Ho(l)}function yn(l){return Tt(l)&&Kt(l)==u}function To(l){if(!rt(l)||Go(l))return!1;var f=xe(l)?Xs:Bs;return f.test(qo(l))}function Ao(l){return Tt(l)&&xn(l.length)&&!!R[Kt(l)]}function Co(l){if(!rt(l))return Uo(l);var f=vn(l),m=[];for(var A in l)A=="constructor"&&(f||!Z.call(l,A))||m.push(A);return m}function mn(l,f,m,A,M){l!==f&&So(f,function(E,z){if(M||(M=new ct),rt(E))Do(l,f,z,m,mn,A,M);else{var F=A?A(me(l,z),E,z+"",l,f,M):void 0;F===void 0&&(F=E),ge(l,z,F)}},Sn)}function Do(l,f,m,A,M,E,z){var F=me(l,m),O=me(f,m),q=z.get(O);if(q){ge(l,m,q);return}var V=E?E(F,O,m+"",l,f,z):void 0,At=V===void 0;if(At){var be=ve(O),Se=!be&&wn(O),An=!be&&!Se&&bn(O);V=O,be||Se||An?ve(F)?V=F:Xo(F)?V=Eo(F):Se?(At=!1,V=No(O)):An?(At=!1,V=ko(O)):V=[]:Ko(O)||_e(O)?(V=F,_e(F)?V=Yo(F):(!rt(F)||xe(F))&&(V=Po(O))):At=!1}At&&(z.set(O,V),M(V,O,A,E,z),z.delete(O)),ge(l,m,V)}function Mo(l,f){return Vo(Wo(l,f,Tn),l+"")}var Io=qt?function(l,f){return qt(l,"toString",{configurable:!0,enumerable:!1,value:Qo(f),writable:!0})}:Tn;function No(l,f){return l.slice()}function Fo(l){var f=new l.constructor(l.byteLength);return new hn(f).set(new hn(l)),f}function ko(l,f){var m=Fo(l.buffer);return new l.constructor(m,l.byteOffset,l.length)}function Eo(l,f){var m=-1,A=l.length;for(f||(f=Array(A));++m<A;)f[m]=l[m];return f}function Ro(l,f,m,A){var M=!m;m||(m={});for(var E=-1,z=f.length;++E<z;){var F=f[E],O=void 0;O===void 0&&(O=l[F]),M?pe(m,F,O):bo(m,F,O)}return m}function zo(l){return Mo(function(f,m){var A=-1,M=m.length,E=M>1?m[M-1]:void 0,z=M>2?m[2]:void 0;for(E=l.length>3&&typeof E=="function"?(M--,E):void 0,z&&Lo(m[0],m[1],z)&&(E=M<3?void 0:E,M=1),f=Object(f);++A<M;){var F=m[A];F&&l(f,F,A,E)}return f})}function Oo(l){return function(f,m,A){for(var M=-1,E=Object(f),z=A(f),F=z.length;F--;){var O=z[++M];if(m(E[O],O,E)===!1)break}return f}}function Yt(l,f){var m=l.__data__;return jo(f)?m[typeof f=="string"?"string":"hash"]:m.map}function ye(l,f){var m=Hs(l,f);return To(m)?m:void 0}function Bo(l){var f=Z.call(l,nt),m=l[nt];try{l[nt]=void 0;var A=!0}catch{}var M=un.call(l);return A&&(f?l[nt]=m:delete l[nt]),M}function Po(l){return typeof l.constructor=="function"&&!vn(l)?Js(fn(l)):{}}function _n(l,f){var m=typeof l;return f=f??a,!!f&&(m=="number"||m!="symbol"&&Ps.test(l))&&l>-1&&l%1==0&&l<f}function Lo(l,f,m){if(!rt(m))return!1;var A=typeof f;return(A=="number"?we(m)&&_n(f,m.length):A=="string"&&f in m)?Zt(m[f],l):!1}function jo(l){var f=typeof l;return f=="string"||f=="number"||f=="symbol"||f=="boolean"?l!=="__proto__":l===null}function Go(l){return!!ln&&ln in l}function vn(l){var f=l&&l.constructor,m=typeof f=="function"&&f.prototype||Wt;return l===m}function Uo(l){var f=[];if(l!=null)for(var m in Object(l))f.push(m);return f}function Ho(l){return un.call(l)}function Wo(l,f,m){return f=gn(f===void 0?l.length-1:f,0),function(){for(var A=arguments,M=-1,E=gn(A.length-f,0),z=Array(E);++M<E;)z[M]=A[f+M];M=-1;for(var F=Array(f+1);++M<f;)F[M]=A[M];return F[f]=m(z),js(l,this,F)}}function me(l,f){if(!(f==="constructor"&&typeof l[f]=="function")&&f!="__proto__")return l[f]}var Vo=$o(Io);function $o(l){var f=0,m=0;return function(){var A=Qs(),M=o-(A-m);if(m=A,M>0){if(++f>=r)return arguments[0]}else f=0;return l.apply(void 0,arguments)}}function qo(l){if(l!=null){try{return Vt.call(l)}catch{}try{return l+""}catch{}}return""}function Zt(l,f){return l===f||l!==l&&f!==f}var _e=yn((function(){return arguments})())?yn:function(l){return Tt(l)&&Z.call(l,"callee")&&!Ks.call(l,"callee")},ve=Array.isArray;function we(l){return l!=null&&xn(l.length)&&!xe(l)}function Xo(l){return Tt(l)&&we(l)}var wn=Zs||Jo;function xe(l){if(!rt(l))return!1;var f=Kt(l);return f==p||f==x||f==s||f==S}function xn(l){return typeof l=="number"&&l>-1&&l%1==0&&l<=a}function rt(l){var f=typeof l;return l!=null&&(f=="object"||f=="function")}function Tt(l){return l!=null&&typeof l=="object"}function Ko(l){if(!Tt(l)||Kt(l)!=b)return!1;var f=fn(l);if(f===null)return!0;var m=Z.call(f,"constructor")&&f.constructor;return typeof m=="function"&&m instanceof m&&Vt.call(m)==qs}var bn=an?Us(an):Ao;function Yo(l){return Ro(l,Sn(l))}function Sn(l){return we(l)?xo(l):Co(l)}var Zo=zo(function(l,f,m){mn(l,f,m)});function Qo(l){return function(){return l}}function Tn(l){return l}function Jo(){return!1}e.exports=Zo})(yt,yt.exports)),yt.exports}var ss=rs(),zt=is(ss);function os(e){var t=0,n=e.children,i=n&&n.length;if(!i)t=1;else for(;--i>=0;)t+=n[i].value;e.value=t}function as(){return this.eachAfter(os)}function ls(e,t){let n=-1;for(const i of this)e.call(t,i,++n,this);return this}function us(e,t){for(var n=this,i=[n],r,o,a=-1;n=i.pop();)if(e.call(t,n,++a,this),r=n.children)for(o=r.length-1;o>=0;--o)i.push(r[o]);return this}function cs(e,t){for(var n=this,i=[n],r=[],o,a,u,c=-1;n=i.pop();)if(r.push(n),o=n.children)for(a=0,u=o.length;a<u;++a)i.push(o[a]);for(;n=r.pop();)e.call(t,n,++c,this);return this}function hs(e,t){let n=-1;for(const i of this)if(e.call(t,i,++n,this))return i}function fs(e){return this.eachAfter(function(t){for(var n=+e(t.data)||0,i=t.children,r=i&&i.length;--r>=0;)n+=i[r].value;t.value=n})}function ds(e){return this.eachBefore(function(t){t.children&&t.children.sort(e)})}function gs(e){for(var t=this,n=ps(t,e),i=[t];t!==n;)t=t.parent,i.push(t);for(var r=i.length;e!==n;)i.splice(r,0,e),e=e.parent;return i}function ps(e,t){if(e===t)return e;var n=e.ancestors(),i=t.ancestors(),r=null;for(e=n.pop(),t=i.pop();e===t;)r=e,e=n.pop(),t=i.pop();return r}function ys(){for(var e=this,t=[e];e=e.parent;)t.push(e);return t}function ms(){return Array.from(this)}function _s(){var e=[];return this.eachBefore(function(t){t.children||e.push(t)}),e}function vs(){var e=this,t=[];return e.each(function(n){n!==e&&t.push({source:n.parent,target:n})}),t}function*ws(){var e=this,t,n=[e],i,r,o;do for(t=n.reverse(),n=[];e=t.pop();)if(yield e,i=e.children)for(r=0,o=i.length;r<o;++r)n.push(i[r]);while(n.length)}function Ot(e,t){e instanceof Map?(e=[void 0,e],t===void 0&&(t=Ss)):t===void 0&&(t=bs);for(var n=new mt(e),i,r=[n],o,a,u,c;i=r.pop();)if((a=t(i.data))&&(c=(a=Array.from(a)).length))for(i.children=a,u=c-1;u>=0;--u)r.push(o=a[u]=new mt(a[u])),o.parent=i,o.depth=i.depth+1;return n.eachBefore(As)}function xs(){return Ot(this).eachBefore(Ts)}function bs(e){return e.children}function Ss(e){return Array.isArray(e)?e[1]:null}function Ts(e){e.data.value!==void 0&&(e.value=e.data.value),e.data=e.data.data}function As(e){var t=0;do e.height=t;while((e=e.parent)&&e.height<++t)}function mt(e){this.data=e,this.depth=this.height=0,this.parent=null}mt.prototype=Ot.prototype={constructor:mt,count:as,each:ls,eachAfter:cs,eachBefore:us,find:hs,sum:fs,sort:ds,path:gs,ancestors:ys,descendants:ms,leaves:_s,links:vs,copy:xs,[Symbol.iterator]:ws};function Cs(e,t){return e.parent===t.parent?1:2}function ae(e){var t=e.children;return t?t[0]:e.t}function le(e){var t=e.children;return t?t[t.length-1]:e.t}function Ds(e,t,n){var i=n/(t.i-e.i);t.c-=i,t.s+=n,e.c+=i,t.z+=n,t.m+=n}function Ms(e){for(var t=0,n=0,i=e.children,r=i.length,o;--r>=0;)o=i[r],o.z+=t,o.m+=t,t+=o.s+(n+=o.c)}function Is(e,t,n){return e.a.parent===t.parent?e.a:n}function Bt(e,t){this._=e,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=t}Bt.prototype=Object.create(mt.prototype);function Ns(e){for(var t=new Bt(e,0),n,i=[t],r,o,a,u;n=i.pop();)if(o=n._.children)for(n.children=new Array(u=o.length),a=u-1;a>=0;--a)i.push(r=n.children[a]=new Bt(o[a],a)),r.parent=n;return(t.parent=new Bt(null,0)).children=[t],t}function Qe(){var e=Cs,t=1,n=1,i=null;function r(s){var h=Ns(s);if(h.eachAfter(o),h.parent.m=-h.z,h.eachBefore(a),i)s.eachBefore(c);else{var g=s,d=s,p=s;s.eachBefore(function(b){b.x<g.x&&(g=b),b.x>d.x&&(d=b),b.depth>p.depth&&(p=b)});var x=g===d?1:e(g,d)/2,y=x-g.x,_=t/(d.x+x+y),w=n/(p.depth||1);s.eachBefore(function(b){b.x=(b.x+y)*_,b.y=b.depth*w})}return s}function o(s){var h=s.children,g=s.parent.children,d=s.i?g[s.i-1]:null;if(h){Ms(s);var p=(h[0].z+h[h.length-1].z)/2;d?(s.z=d.z+e(s._,d._),s.m=s.z-p):s.z=p}else d&&(s.z=d.z+e(s._,d._));s.parent.A=u(s,d,s.parent.A||g[0])}function a(s){s._.x=s.z+s.parent.m,s.m+=s.parent.m}function u(s,h,g){if(h){for(var d=s,p=s,x=h,y=d.parent.children[0],_=d.m,w=p.m,b=x.m,S=y.m,v;x=le(x),d=ae(d),x&&d;)y=ae(y),p=le(p),p.a=s,v=x.z+b-d.z-_+e(x._,d._),v>0&&(Ds(Is(x,s,g),s,v),_+=v,w+=v),b+=x.m,_+=d.m,S+=y.m,w+=p.m;x&&!le(p)&&(p.t=x,p.m+=b-w),d&&!ae(y)&&(y.t=d,y.m+=_-S,g=s)}return g}function c(s){s.x*=t,s.y=s.depth*n}return r.separation=function(s){return arguments.length?(e=s,r):e},r.size=function(s){return arguments.length?(i=!1,t=+s[0],n=+s[1],r):i?null:[t,n]},r.nodeSize=function(s){return arguments.length?(i=!0,t=+s[0],n=+s[1],r):i?[t,n]:null},r}function Pt(e,t){const n={};for(const a of e)n[a.id]=[];for(const{source:a,target:u}of t)n[a.id]||(n[a.id]=[]),n[a.id].push(u.id);const i=new Set,r=new Set,o=a=>{if(!i.has(a)&&(i.add(a),r.add(a),n[a]))for(const u of n[a]){if(!i.has(u)&&o(u))return!0;if(r.has(u))return!0}return r.delete(a),!1};return e.some(a=>o(a.id))}function Je(e,t){const n=new Set(t.map(i=>i.target.id));for(const i of e)if(!n.has(i.id))return i;return e[0]}function Fs(e,t){const n=new Map;for(const c of e)n.set(c.id,[]);for(const c of t)n.get(c.from.id)||console.log(c),n.get(c.from.id).push(c.to);const i=new Map,r=new Map;function o(c,s=new Set){if(r.has(c))return new Set(r.get(c));const h=new Set;for(const g of n.get(c.id)??[])if(!s.has(g)){s.add(g),h.add(g);const d=o(g,s);for(const p of d)h.add(p)}return r.set(c,h),i.set(c,h.size),h}for(const c of e)i.has(c)||o(c);let a=null,u=-1;for(const c of e){const s=i.get(c)??0;s>u&&(u=s,a=c)}return a??e[0]}function ks(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Min-max distance root undefined."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let g=0;for(const d of n.get(h.id))g=Math.max(g,1+(a.get(d.id)||0));a.set(h.id,g)}let u=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,u=s)}return u??e[0]}function Es(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Cannot minimize DAG height."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let g=0;for(const d of n.get(h.id))g=Math.max(g,1+(a.get(d.id)??0));a.set(h.id,g)}let u=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,u=s)}return u??e[0]}const ue={type:"tree",rootId:void 0,rootIdAlgorithmFinder:"MaxReachability",strength:.25,radial:!1,radialGap:750,horizontal:!1,flipEdgeDirection:!1};class j{constructor(t,n,i,r={}){T(this,"graph");T(this,"simulation");T(this,"simulationForces");T(this,"options");T(this,"originalForceStrength");T(this,"canvasBCR");T(this,"levels");T(this,"positionedNodesByID");this.graph=t,this.simulation=n,this.simulationForces=i,this.options=zt({},ue,r),this.originalForceStrength={link:this.simulationForces.link.strength(),charge:this.simulationForces.charge.strength(),gravity:this.simulationForces.gravity.strength()},this.positionedNodesByID=new Map,this.levels={};const o=this.graph.getNodes(),a=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges();if(Pt(o,a)){this.graph.notifier.warning("Tree layout unavailable","The graph contains a cycle, so it cannot be displayed as a tree.");return}this.setSizes(),this.update(),this.registerForces()}update(){const t=this.graph.getNodes(),n=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges(),{levels:i}=this.buildLevels(t,n,void 0,this.options.rootIdAlgorithmFinder),{nodes:r,nodeById:o}=this.buildTree(t,n,this.options,this.canvasBCR);this.positionedNodesByID=o,this.levels=i,r&&this.setNodePositions(r,this.options)}flipEdgeDirection(t){return t.forEach(n=>{const i=n.from;n.setFrom(n.to),n.setTo(i)}),t}setSizes(){const t=this.graph.renderer.getCanvas();if(!t)throw new Error("Canvas element is not defined in the graph renderer.");this.canvasBCR=t.getBoundingClientRect()}setNodePositions(t,n){for(const i of t){const r=this.graph.getMutableNode(i.data.id);if(r)if(n.radial){const o=i.x??0,a=i.y??0;r.x=a*Math.cos(o-Math.PI/2),r.y=a*Math.sin(o-Math.PI/2),r.fx=r.x,r.fy=r.y}else n.horizontal?(r.x=i.y,r.fx=i.y,r.y=i.x,delete r.fy):(r.x=i.x,r.y=i.y,r.fy=i.y,delete r.fx)}}unsetNodePositions(){this.graph.getMutableNodes().forEach(t=>{delete t.fy,delete t.fx})}registerForces(){const t=this.options.strength??.1;if(this.options.radial){const n=Ee(i=>(this.levels[i.id]??1)*100,0,0).strength(t);this.simulation.force("tree-radial",n)}else this.simulation.force("tree-y",ze(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.x)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.y)??0}).strength(t)),this.simulation.force("tree-x",Re(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.y)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.x)??0}).strength(t));j.adjustOtherSimulationForces(this.simulationForces,this.options)}unregisterLayout(){this.unregisterForces(),this.unsetNodePositions()}unregisterForces(){this.simulation.force("tree-radial",null),this.simulation.force("tree-y",null),this.simulation.force("tree-x",null),j.resetOtherSimulationForces(this.simulationForces,this.originalForceStrength)}static registerForcesOnSimulation(t,n,i,r,o,a,u=this){const c=zt({},ue,o),s=c.strength??.1,h=a.width,g=a.height,d=[h/2,g/2];if(Pt(t,n))return;const{levels:p}=u.buildLevelsStatic(t,n,void 0,c.rootIdAlgorithmFinder),{nodeById:x}=u.buildTreeStatic(t,n,c,a);if(c.radial){const y=Ee(_=>(p[_.id]??1)*100,d[0],d[1]).strength(s);i.force("tree-radial",y)}else i.force("tree-y",ze(y=>{var _,w;return c.horizontal?((_=x.get(y.id))==null?void 0:_.x)??0:((w=x.get(y.id))==null?void 0:w.y)??0}).strength(s)),i.force("tree-x",Re(y=>{var _,w;return c.horizontal?((_=x.get(y.id))==null?void 0:_.y)??0:((w=x.get(y.id))==null?void 0:w.x)??0}).strength(s));u.adjustOtherSimulationForces(r,c)}static adjustOtherSimulationForces(t,n){n!=null&&n.radial?(t.link.strength(0),t.charge.strength(0),t.gravity.strength(0)):(t.link.strength(0),t.charge.strength(0),t.gravity.strength(1e-5))}static resetOtherSimulationForces(t,n){t.link.strength(n.link),t.charge.strength(n.charge),t.gravity.strength(n.gravity)}static simulationDone(t,n,i,r){const o=zt({},ue,r);for(const a of t)o.radial?(a.fx=a.x,a.fy=a.y):o.horizontal?(a.fx=a.x,delete a.fy):(a.fy=a.y,delete a.fx)}buildTree(t,n,i,r){return j.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Pt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const y of t){const _=y;_.children=[],o.set(y.id,_)}for(const y of n){const _=o.get(y.source.id),w=o.get(y.target.id);_&&w&&(_.children.push(w),w.parent=_)}const a=i.rootId||j.findRootId(t,n,i.rootIdAlgorithmFinder),u=o.get(a);if(!u)throw new Error(`Root node with id "${a}" not found.`);const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,g=Qe();i.radial?g.size([s,h]):g.size([s,h]).separation((y,_)=>{var b,S;const w=((S=(b=y.parent)==null?void 0:b.children)==null?void 0:S.length)??1;return y.parent===_.parent?1.5/w:1.5});const d=Ot(u),p=g(d),x=new Map;return p.descendants().forEach(y=>{x.set(y.data.id,y)}),{root:p,nodes:p.descendants(),nodeById:x}}buildLevels(t,n,i,r){return j.buildLevelsStatic(t,n,i,r)}static buildLevelsStatic(t,n,i,r){if(!t.length)return{levels:{},maxDepth:0,nodeCountPerLevel:{}};const o=i||j.findRootId(t,n,r),a={[o]:0},u={};for(const d of t)u[d.id]=[];for(const{source:d,target:p}of n)u[d.id].push(p.id);const c=[o];let s=0;for(;s<c.length;){const d=c[s++],p=a[d];for(const x of u[d]||[])x in a||(a[x]=p+1,c.push(x))}const h=Math.max(...Object.values(a)),g={};for(const d of Object.values(a))g[d]=(g[d]||0)+1;return{levels:a,maxDepth:h,nodeCountPerLevel:g}}static findRootId(t,n,i){switch(i){case"FirstZeroInDegree":return Je(t,n).id;case"MaxReachability":return Fs(t,n).id;case"MinMaxDistance":return ks(t,n).id;case"MinHeight":return Es(t,n).id;default:return Je(t,n).id}}}class _t extends j{constructor(t,n,i,r){super(t,n,i,{...r,type:"tree"})}static registerForcesOnSimulation(t,n,i,r,o,a){j.registerForcesOnSimulation(t,n,i,r,o,a,_t)}buildTree(t,n,i,r){return _t.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Pt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const y of t){const _=y;_.children=[],o.set(y.id,_)}if(!i.rootId||!o.get(i.rootId))throw new Error("Ego Tree can only be created with a rootId");const a=i.rootId,u=o.get(a);if(u.children=[],!u)throw new Error(`Root node with id "${a}" not found.`);for(const y of n){const _=o.get(y.source.id),w=o.get(y.target.id);_&&w&&(y.source.id===u.id?(u.children.push(w),w.parent=u):y.target.id===u.id&&(u.children.push(_),_.parent=u))}const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,g=Qe();i.radial?g.size([s,h]):g.size([s,h]).separation((y,_)=>{var b,S;const w=((S=(b=y.parent)==null?void 0:b.children)==null?void 0:S.length)??1;return y.parent===_.parent?1.5/w:1.5});const d=Ot(u),p=g(d),x=new Map;return p.descendants().forEach(y=>{x.set(y.data.id,y)}),{root:p,nodes:p.descendants(),nodeById:x}}}function Rs(e){var n;const t=(n=e.getData())==null?void 0:n.label;return typeof t=="string"?t:""}const tt={d3Alpha:1,d3AlphaMin:.001,d3AlphaDecay:.05,d3AlphaTarget:0,d3VelocityDecay:.45,d3LinkDistance:40,d3LinkStrength:null,d3ManyBodyStrength:-150,d3ManyBodyTheta:.9,d3CollideRadius:12,d3CollideStrength:1,d3CollideIterations:1,d3GravityStrength:.1,enabled:!0,cooldownTime:2e3,useWorker:!0,warmupTicks:"auto",freezeNodesOnDrag:!0,layout:{type:"force"},callbacks:{onInit:()=>{},onStart:()=>{},onStop:()=>{},onTick:()=>{}}};class et{constructor(t,n={}){T(this,"simulation");T(this,"graph");T(this,"canvas");T(this,"graphInteraction");T(this,"layout");T(this,"canvasBCR");T(this,"animationFrameId",null);T(this,"startSimulationTime",0);T(this,"engineRunning",!1);T(this,"slowTickThresholdReached",!1);T(this,"lastTickTime",0);T(this,"avgTickDuration",0);T(this,"SLOW_TICK_THRESHOLD",50);T(this,"dragInProgress",!1);T(this,"dragSelection",[]);T(this,"totalTickCount",0);T(this,"options");T(this,"callbacks");T(this,"simulationForces");T(this,"scaledForces",{d3ManyBodyStrength:tt.d3ManyBodyStrength,d3CollideStrength:tt.d3CollideStrength});if(this.graph=t,this.options=zt({},tt,n),this.callbacks=this.options.callbacks??{},this.canvas=this.graph.renderer.getCanvas(),!this.canvas)throw new Error("Canvas element is not defined in the graph renderer.");if(this.canvasBCR=this.canvas.getBoundingClientRect(),this.graphInteraction=this.graph.renderer.getGraphInteraction(),!this.graphInteraction)throw new Error("Graph interaction is not available.");const i=et.initSimulationForces(this.options,this.canvasBCR);this.simulation=i.simulation,this.simulationForces=i.simulationForces,this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength||tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=this.options.d3CollideStrength||tt.d3CollideStrength,this.options.layout.type==="tree"?this.layout=new j(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="egoTree"&&(this.layout=new _t(this.graph,this.simulation,this.simulationForces,this.options.layout)),this.callbacks.onInit&&this.callbacks.onInit(this)}static initSimulationForces(t,n){const i={link:Vn(),charge:ai(),collide:Hn(),gravity:li()},r=oi().force("link",i.link).force("charge",i.charge).force("collide",i.collide).force("gravity",i.gravity);return this.initSimulationForceGravity(i.gravity,t,n),this.initSimulationForceLink(i.link,t),this.initSimulationForceCharge(i.charge,t),this.initSimulationForceCollide(i.collide,t),r.alphaMin(t.d3AlphaMin),r.alphaDecay(t.d3AlphaDecay),r.alphaTarget(0),r.velocityDecay(t.d3VelocityDecay),{simulation:r,simulationForces:i}}static initSimulationForceGravity(t,n,i){t.x(i.width/2).y(i.height/2).strength(r=>(r.degree()??0)===0?n.d3GravityStrength:.001)}static initSimulationForceLink(t,n){t.distance(i=>{const r=Rs(i);if(!r||r==="")return n.d3LinkDistance;const o=r.length*10;return Math.max(n.d3LinkDistance,o)}),n.d3LinkStrength&&t.strength(n.d3LinkStrength)}static initSimulationForceCharge(t,n){t.theta(n.d3ManyBodyTheta).strength(i=>{const r=i,o=n.d3ManyBodyStrength,a=r.getCircleRadius(),u=10+Math.sqrt(a-10);let c=r.weight??1;return c*=r.isParent?10:1,o*(u*u)/100*c})}static initSimulationForceCollide(t,n){t.radius(i=>{const r=i;return r.expanded?1.2*r.getCircleRadius()+20:r.getCircleRadius()?1.2*r.getCircleRadius():n.d3CollideRadius}).strength(n.d3CollideStrength)}static initSimulationForceClusterRadialConstraint(t,n){t.strength(n.d3CollideStrength)}update(){this.layout&&this.layout.update();const t=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(t);const n=this.simulation.force("link");n&&n.id(i=>i.id).links(this.getActiveEdges()),this.restart()}getActiveEdges(){const t=this.graph.getMutableEdges().filter(i=>{if(!i.visible)return!1;const r=i.source,o=i.target;return!(r.isChild||o.isChild)}),n=this.getClusterLinks();return[...t,...n]}getClusterLinks(){return this.graph.getMutableEdges().filter(n=>n.visible)}scaleSimulationOptions(){const t=et.scaleSimulationOptions(this.options,this.canvasBCR,this.graph.getNodeCount());this.scaledForces.d3ManyBodyStrength=t.d3ManyBodyStrength??tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=t.d3CollideStrength??tt.d3CollideStrength}static scaleSimulationOptions(t,n,i){const r=i/(n.width*n.height),o=Math.min(2,75e-6/r);return{d3ManyBodyStrength:t.d3ManyBodyStrength*o,d3CollideStrength:t.d3ManyBodyStrength*o}}applyScalledSimulationOptions(){et.initSimulationForceCharge(this.simulationForces.charge,this.options),et.initSimulationForceCollide(this.simulationForces.collide,this.options)}enable(){this.avgTickDuration=0,this.options.enabled=!0,this.start(!1)}disable(){this.options.enabled=!1,this.stop()}pause(){this.engineRunning=!1,this.slowTickThresholdReached=!1}restart(){this.startSimulationTime=new Date().getTime(),this.lastTickTime=performance.now(),this.engineRunning=!0,this.slowTickThresholdReached=!1}async start(t=!0){if(t&&await this.runSimulationWorkerRouter(),!this.options.enabled){this.engineRunning=!1;return}this.lastTickTime=performance.now(),this.engineRunning=!0,this.slowTickThresholdReached=!1,this.callbacks.onStart&&this.callbacks.onStart(this),this.animationFrameId===null&&this.startAnimationLoop()}stop(){this.engineRunning=!1,this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)}startAnimationLoop(){const t=()=>{this.animationFrameId=requestAnimationFrame(t),this.simulationTick()};this.engineRunning=!0,this.simulation.alpha(.01).restart(),this.animationFrameId=requestAnimationFrame(t)}simulationTick(){this.engineRunning&&(!this.dragInProgress&&(new Date().getTime()-this.startSimulationTime>this.options.cooldownTime||this.options.d3AlphaMin>0&&this.simulation.alpha()<this.options.d3AlphaMin)&&(this.engineRunning=!1,this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)),this.totalTickCount++,this.updateTickMetrics(),this.simulation.tick(),this.graph.nextTick(),this.callbacks.onTick&&this.callbacks.onTick(this),this.graphInteraction.simulationTick(),this.totalTickCount%10===0&&this.graphInteraction.simulationSlowTick())}updateTickMetrics(){var i;const t=performance.now(),n=t-this.lastTickTime;this.lastTickTime=t,this.avgTickDuration=this.avgTickDuration*.9+n*.1,this.avgTickDuration>this.SLOW_TICK_THRESHOLD&&(this.slowTickThresholdReached=!0,this.disable(),(i=this.graph.UIManager.graphControls)==null||i.updatePhysicSimulationIndicator(!1),this.graph.UIManager.showNotification({level:"warning",title:"Physics engine running slow",message:"The physic has been disabled."}))}async waitForSimulationStop(){if(this.engineRunning)return new Promise(t=>{const n=this.callbacks.onStop;this.callbacks.onStop=i=>{n==null||n(i),this.callbacks.onStop=n,t()}})}isEnabled(){return this.options.enabled}async computeGraph(t={}){var h;const{runSimulation:n}=await Promise.resolve().then(function(){return Os}),i=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!i)return;const r=this.graph.getMutableNodes(),o=this.graph.getNodes().map(g=>(g.fx=void 0,g.fy=void 0,g)),a=this.graph.getEdges(),{callbacks:u,...c}=this.options;Object.assign(c,t);const{nodes:s}=n(o,a,c,i);s.forEach((g,d)=>{r[d].x=g.x,r[d].y=g.y,g.fx?r[d].fx=g.fx:r[d].fx=void 0,g.fy?r[d].fy=g.fy:r[d].fy=void 0}),this.graph.updateData(r,void 0,!1)}async runSimulationWorkerRouter(t={}){this.options.useWorker?await this.runSimulationWorker(t):(await this.computeGraph(t),this.graph.updateLayoutProgress(100,0,"done"))}async runSimulationWorker(t={}){var h;const n=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!n)return;const i=this.graph.getMutableNodes(),r=this.graph.getNodes().map(g=>(g.fx=void 0,g.fy=void 0,g)),o=this.graph.getEdges(),a=(g,d)=>{this.graph.updateLayoutProgress(g,d,"simulation")},{callbacks:u,...c}=this.options;Object.assign(c,t);const{nodes:s}=await ns(r,o,c,n,a);this.graph.updateLayoutProgress(100,0,"rendering"),s.forEach((g,d)=>{i[d].x=g.x,i[d].y=g.y,g.fx?i[d].fx=g.fx:i[d].fx=void 0,g.fy?i[d].fy=g.fy:i[d].fy=void 0}),this.graph.updateData(i,void 0,!1),this.graph.updateLayoutProgress(100,0,"done")}reheat(t=.7){this.restart(),this.simulation.alpha(t).restart()}createDragBehavior(){return Jr().on("start.draggedelement",(t,n)=>{this.graphInteraction.hasActiveMultiselection()?this.dragSelection=this.graphInteraction.getSelectedNodes().map(i=>{const{node:r}=i;return r.freeze(),{node:r,dx:r.x-n.x,dy:r.y-n.y}}):(this.dragSelection=[],n.freeze())}).on("drag.draggedelement",(t,n)=>{if(!this.dragInProgress&&this.isEnabled()&&(this.dragInProgress=!0,this.restart(),this.simulation.alphaTarget(.3).restart()),this.graphInteraction.hasActiveMultiselection()?this.dragSelection.forEach(({node:i,dx:r,dy:o})=>{i.fx=t.x+r,i.fy=t.y+o,i.x=t.x+r,i.y=t.y+o}):(n.fx=t.x,n.fy=t.y,n.x=t.x,n.y=t.y),this.graphInteraction.dragging(t.sourceEvent,t.subject),!this.engineRunning||!this.isEnabled()){const i=this.graphInteraction.hasActiveMultiselection()?this.dragSelection.map(r=>r.node):[n];this.graph.nextTickFor(i)}}).on("end.draggedelement",(t,n)=>{!t.active&&this.dragInProgress&&(this.dragInProgress=!1,this.restart(),this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()),this.options.freezeNodesOnDrag||(this.graphInteraction.hasActiveMultiselection()?(this.dragSelection.forEach(({node:i})=>i.unfreeze()),this.dragSelection=[]):n.unfreeze()),this.graphInteraction.dragended(t.sourceEvent,t.subject)})}isDragging(){return this.dragInProgress}getForceSimulation(){return this.simulationForces}getSimulation(){return this.simulation}async changeLayout(t,n={}){var i;this.layout&&((i=this.layout)==null||i.unregisterLayout(),this.layout=void 0),n=n??{},n.layout=n.layout??{},n.layout.type=t,t==="force"?this.applyScalledSimulationOptions():t==="tree"&&(this.layout=new j(this.graph,this.simulation,this.simulationForces,n.layout)),this.options.layout.type=t,this.update(),this.pause(),await this.runSimulationWorkerRouter(n),this.restart(),await this.waitForSimulationStop(),this.graph.renderer.fitAndCenter()}}const tn=1e4,Lt=2e4,jt=.15*Lt;self.onmessage=e=>{var y,_,w,b;if(e.data.source!=="simulation-worker-wrapper")return;const{nodes:t,edges:n,options:i,canvasBCR:r}=e.data,o=t.map(S=>{const v=new Ye(S.id,S.data,S.style);return v.setCircleRadius(S._circleRadius??10),v}),a=new Map(o.map(S=>[S.id,S]));(y=i.layout)==null||y.type;const{simulation:u,simulationForces:c}=et.initSimulationForces(i,r),s=[];for(const S of n){const v=a.get(S.from.id),C=a.get(S.to.id);if(v&&C){const D=S.style??{};s.push(new Et(S.id,v,C,S.data,D,S.directed))}}u.nodes(o);const h=u.force("link");h&&h.id(S=>S.id).links(s),((_=i.layout)==null?void 0:_.type)==="tree"?j.registerForcesOnSimulation(o,s,u,c,i.layout,r,j):((w=i.layout)==null?void 0:w.type)==="egoTree"&&j.registerForcesOnSimulation(o,s,u,c,i.layout,r,_t);let g=i.warmupTicks||Lt;g=g==="auto"?Lt:g,g=g-jt;let d=.3;u.alphaTarget(d);const p=new Date().getTime();let x;for(let S=0;S<g&&!(new Date().getTime()-p>tn||new Date().getTime()-p>i.cooldownTime||Gt(i,u,d)&&new Date().getTime()-p>i.cooldownTime*.15);++S)S%5===0&&(x=en(S,new Date().getTime()-p,i),postMessage({type:"tick",progress:x,elapsedTime:new Date().getTime()-p})),u.tick();d=0,u.alphaTarget(d),u.alpha(1);for(let S=0;S<jt&&!(Gt(i,u,d)&&new Date().getTime()-p>i.cooldownTime*.15);++S)u.tick(),S%5===0&&(x=en(g+S,new Date().getTime()-p,i),postMessage({type:"tick",progress:x,elapsedTime:new Date().getTime()-p}));postMessage({type:"tick",progress:1,elapsedTime:new Date().getTime()-p}),((b=i.layout)==null?void 0:b.type)==="tree"&&j.simulationDone(o,s,u,i.layout),postMessage({type:"done",nodes:o.map(S=>S.toDict()),edges:s.map(S=>S.toDict())})};function zs(e,t,n,i){var p,x,y,_;const r=e.map(w=>{const b=new Ye(w.id,w.getData(),w.getStyle());return b.weight=w.weight||1,b.setCircleRadius(w.getCircleRadius()),b}),o=new Map(r.map(w=>[w.id,w]));(p=n.layout)==null||p.type;const{simulation:a,simulationForces:u}=et.initSimulationForces(n,i),c=[];for(const w of t){const b=o.get(w.from.id),S=o.get(w.to.id);if(b&&S){const v=w.getStyle()??{};c.push(new Et(w.id,b,S,w.getData(),v,w.directed))}}a.nodes(r);const s=a.force("link");s&&s.id(w=>w.id).links(c),(((x=n.layout)==null?void 0:x.type)==="tree"||((y=n.layout)==null?void 0:y.type)==="egoTree")&&j.registerForcesOnSimulation(r,c,a,u,n.layout,i,j);let h;n.warmupTicks==="auto"||n.warmupTicks==null?h=Lt:h=n.warmupTicks,h=h-jt;let g=.3;a.alphaTarget(g);const d=new Date().getTime();for(let w=0;w<h&&!(new Date().getTime()-d>tn||new Date().getTime()-d>n.cooldownTime||Gt(n,a,g)&&new Date().getTime()-d>n.cooldownTime*.15);++w)a.tick();g=0,a.alphaTarget(g),a.alpha(1);for(let w=0;w<jt&&!(Gt(n,a,g)&&new Date().getTime()-d>n.cooldownTime*.15);++w)a.tick();return((_=n.layout)==null?void 0:_.type)==="tree"&&j.simulationDone(r,c,a,n.layout),{nodes:r,edges:c}}function en(e,t,n){return t/n.cooldownTime}function Gt(e,t,n){return e.d3AlphaMin>0&&t.alpha()-n<e.d3AlphaMin}var Os=Object.freeze({__proto__:null,runSimulation:zs})})();\n', tn = typeof self < "u" && self.Blob && new Blob([Tn], { type: "text/javascript;charset=utf-8" });
function xs(e) {
  let t;
  try {
    if (t = tn && (self.URL || self.webkitURL).createObjectURL(tn), !t) throw "";
    const n = new Worker(t, {
      name: e == null ? void 0 : e.name
    });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), n;
  } catch {
    return new Worker(
      "data:text/javascript;charset=utf-8," + encodeURIComponent(Tn),
      {
        name: e == null ? void 0 : e.name
      }
    );
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
function bs() {
  return new xs();
}
const Ss = (e, t, n, i, r) => new Promise((s, a) => {
  const l = bs();
  l.postMessage({ source: "simulation-worker-wrapper", nodes: e, edges: t, options: n, canvasBCR: i }), l.onmessage = (c) => {
    const { type: o, progress: h, nodes: g, edges: d, elapsedTime: p } = c.data;
    if (o === "tick" && typeof h == "number") {
      r == null || r(h, p);
      return;
    }
    o === "done" && (s({ nodes: g, edges: d }), l.terminate());
  }, l.onerror = a;
});
var Rt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ts(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var vt = { exports: {} };
vt.exports;
var en;
function As() {
  return en || (en = 1, (function(e, t) {
    var n = 200, i = "__lodash_hash_undefined__", r = 800, s = 16, a = 9007199254740991, l = "[object Arguments]", c = "[object Array]", o = "[object AsyncFunction]", h = "[object Boolean]", g = "[object Date]", d = "[object Error]", p = "[object Function]", x = "[object GeneratorFunction]", y = "[object Map]", v = "[object Number]", w = "[object Null]", b = "[object Object]", S = "[object Proxy]", _ = "[object RegExp]", C = "[object Set]", M = "[object String]", N = "[object Undefined]", k = "[object WeakMap]", B = "[object ArrayBuffer]", F = "[object DataView]", j = "[object Float32Array]", H = "[object Float64Array]", q = "[object Int8Array]", it = "[object Int16Array]", Kt = "[object Int32Array]", ut = "[object Uint8Array]", St = "[object Uint8ClampedArray]", Yt = "[object Uint16Array]", Tt = "[object Uint32Array]", lt = /[\\^$.*+?()[\]{}|]/g, Mn = /^\[object .+?Constructor\]$/, Dn = /^(?:0|[1-9]\d*)$/, R = {};
    R[j] = R[H] = R[q] = R[it] = R[Kt] = R[ut] = R[St] = R[Yt] = R[Tt] = !0, R[l] = R[c] = R[B] = R[h] = R[F] = R[g] = R[d] = R[p] = R[y] = R[v] = R[b] = R[_] = R[C] = R[M] = R[k] = !1;
    var xe = typeof Rt == "object" && Rt && Rt.Object === Object && Rt, kn = typeof self == "object" && self && self.Object === Object && self, ct = xe || kn || Function("return this")(), be = t && !t.nodeType && t, ht = be && !0 && e && !e.nodeType && e, Se = ht && ht.exports === be, Zt = Se && xe.process, Te = (function() {
      try {
        var u = ht && ht.require && ht.require("util").types;
        return u || Zt && Zt.binding && Zt.binding("util");
      } catch {
      }
    })(), Ae = Te && Te.isTypedArray;
    function Nn(u, f, m) {
      switch (m.length) {
        case 0:
          return u.call(f);
        case 1:
          return u.call(f, m[0]);
        case 2:
          return u.call(f, m[0], m[1]);
        case 3:
          return u.call(f, m[0], m[1], m[2]);
      }
      return u.apply(f, m);
    }
    function In(u, f) {
      for (var m = -1, A = Array(u); ++m < u; )
        A[m] = f(m);
      return A;
    }
    function Fn(u) {
      return function(f) {
        return u(f);
      };
    }
    function En(u, f) {
      return u == null ? void 0 : u[f];
    }
    function Rn(u, f) {
      return function(m) {
        return u(f(m));
      };
    }
    var On = Array.prototype, zn = Function.prototype, At = Object.prototype, Qt = ct["__core-js_shared__"], Ct = zn.toString, K = At.hasOwnProperty, Ce = (function() {
      var u = /[^.]+$/.exec(Qt && Qt.keys && Qt.keys.IE_PROTO || "");
      return u ? "Symbol(src)_1." + u : "";
    })(), Me = At.toString, Bn = Ct.call(Object), jn = RegExp(
      "^" + Ct.call(K).replace(lt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), Mt = Se ? ct.Buffer : void 0, De = ct.Symbol, ke = ct.Uint8Array;
    Mt && Mt.allocUnsafe;
    var Ne = Rn(Object.getPrototypeOf, Object), Ie = Object.create, Pn = At.propertyIsEnumerable, Ln = On.splice, Z = De ? De.toStringTag : void 0, Dt = (function() {
      try {
        var u = ee(Object, "defineProperty");
        return u({}, "", {}), u;
      } catch {
      }
    })(), Un = Mt ? Mt.isBuffer : void 0, Fe = Math.max, Gn = Date.now, Ee = ee(ct, "Map"), ft = ee(Object, "create"), qn = /* @__PURE__ */ (function() {
      function u() {
      }
      return function(f) {
        if (!J(f))
          return {};
        if (Ie)
          return Ie(f);
        u.prototype = f;
        var m = new u();
        return u.prototype = void 0, m;
      };
    })();
    function Q(u) {
      var f = -1, m = u == null ? 0 : u.length;
      for (this.clear(); ++f < m; ) {
        var A = u[f];
        this.set(A[0], A[1]);
      }
    }
    function Hn() {
      this.__data__ = ft ? ft(null) : {}, this.size = 0;
    }
    function Wn(u) {
      var f = this.has(u) && delete this.__data__[u];
      return this.size -= f ? 1 : 0, f;
    }
    function Vn(u) {
      var f = this.__data__;
      if (ft) {
        var m = f[u];
        return m === i ? void 0 : m;
      }
      return K.call(f, u) ? f[u] : void 0;
    }
    function $n(u) {
      var f = this.__data__;
      return ft ? f[u] !== void 0 : K.call(f, u);
    }
    function Xn(u, f) {
      var m = this.__data__;
      return this.size += this.has(u) ? 0 : 1, m[u] = ft && f === void 0 ? i : f, this;
    }
    Q.prototype.clear = Hn, Q.prototype.delete = Wn, Q.prototype.get = Vn, Q.prototype.has = $n, Q.prototype.set = Xn;
    function X(u) {
      var f = -1, m = u == null ? 0 : u.length;
      for (this.clear(); ++f < m; ) {
        var A = u[f];
        this.set(A[0], A[1]);
      }
    }
    function Kn() {
      this.__data__ = [], this.size = 0;
    }
    function Yn(u) {
      var f = this.__data__, m = kt(f, u);
      if (m < 0)
        return !1;
      var A = f.length - 1;
      return m == A ? f.pop() : Ln.call(f, m, 1), --this.size, !0;
    }
    function Zn(u) {
      var f = this.__data__, m = kt(f, u);
      return m < 0 ? void 0 : f[m][1];
    }
    function Qn(u) {
      return kt(this.__data__, u) > -1;
    }
    function Jn(u, f) {
      var m = this.__data__, A = kt(m, u);
      return A < 0 ? (++this.size, m.push([u, f])) : m[A][1] = f, this;
    }
    X.prototype.clear = Kn, X.prototype.delete = Yn, X.prototype.get = Zn, X.prototype.has = Qn, X.prototype.set = Jn;
    function rt(u) {
      var f = -1, m = u == null ? 0 : u.length;
      for (this.clear(); ++f < m; ) {
        var A = u[f];
        this.set(A[0], A[1]);
      }
    }
    function ti() {
      this.size = 0, this.__data__ = {
        hash: new Q(),
        map: new (Ee || X)(),
        string: new Q()
      };
    }
    function ei(u) {
      var f = It(this, u).delete(u);
      return this.size -= f ? 1 : 0, f;
    }
    function ni(u) {
      return It(this, u).get(u);
    }
    function ii(u) {
      return It(this, u).has(u);
    }
    function ri(u, f) {
      var m = It(this, u), A = m.size;
      return m.set(u, f), this.size += m.size == A ? 0 : 1, this;
    }
    rt.prototype.clear = ti, rt.prototype.delete = ei, rt.prototype.get = ni, rt.prototype.has = ii, rt.prototype.set = ri;
    function ot(u) {
      var f = this.__data__ = new X(u);
      this.size = f.size;
    }
    function oi() {
      this.__data__ = new X(), this.size = 0;
    }
    function si(u) {
      var f = this.__data__, m = f.delete(u);
      return this.size = f.size, m;
    }
    function ai(u) {
      return this.__data__.get(u);
    }
    function ui(u) {
      return this.__data__.has(u);
    }
    function li(u, f) {
      var m = this.__data__;
      if (m instanceof X) {
        var A = m.__data__;
        if (!Ee || A.length < n - 1)
          return A.push([u, f]), this.size = ++m.size, this;
        m = this.__data__ = new rt(A);
      }
      return m.set(u, f), this.size = m.size, this;
    }
    ot.prototype.clear = oi, ot.prototype.delete = si, ot.prototype.get = ai, ot.prototype.has = ui, ot.prototype.set = li;
    function ci(u, f) {
      var m = re(u), A = !m && ie(u), D = !m && !A && je(u), E = !m && !A && !D && Le(u), O = m || A || D || E, I = O ? In(u.length, String) : [], z = I.length;
      for (var $ in u)
        O && // Safari 9 has enumerable `arguments.length` in strict mode.
        ($ == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        D && ($ == "offset" || $ == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        E && ($ == "buffer" || $ == "byteLength" || $ == "byteOffset") || // Skip index properties.
        ze($, z)) || I.push($);
      return I;
    }
    function Jt(u, f, m) {
      (m !== void 0 && !Ft(u[f], m) || m === void 0 && !(f in u)) && te(u, f, m);
    }
    function hi(u, f, m) {
      var A = u[f];
      (!(K.call(u, f) && Ft(A, m)) || m === void 0 && !(f in u)) && te(u, f, m);
    }
    function kt(u, f) {
      for (var m = u.length; m--; )
        if (Ft(u[m][0], f))
          return m;
      return -1;
    }
    function te(u, f, m) {
      f == "__proto__" && Dt ? Dt(u, f, {
        configurable: !0,
        enumerable: !0,
        value: m,
        writable: !0
      }) : u[f] = m;
    }
    var fi = Ai();
    function Nt(u) {
      return u == null ? u === void 0 ? N : w : Z && Z in Object(u) ? Ci(u) : Fi(u);
    }
    function Re(u) {
      return dt(u) && Nt(u) == l;
    }
    function di(u) {
      if (!J(u) || Ni(u))
        return !1;
      var f = se(u) ? jn : Mn;
      return f.test(zi(u));
    }
    function gi(u) {
      return dt(u) && Pe(u.length) && !!R[Nt(u)];
    }
    function pi(u) {
      if (!J(u))
        return Ii(u);
      var f = Be(u), m = [];
      for (var A in u)
        A == "constructor" && (f || !K.call(u, A)) || m.push(A);
      return m;
    }
    function Oe(u, f, m, A, D) {
      u !== f && fi(f, function(E, O) {
        if (D || (D = new ot()), J(E))
          yi(u, f, O, m, Oe, A, D);
        else {
          var I = A ? A(ne(u, O), E, O + "", u, f, D) : void 0;
          I === void 0 && (I = E), Jt(u, O, I);
        }
      }, Ue);
    }
    function yi(u, f, m, A, D, E, O) {
      var I = ne(u, m), z = ne(f, m), $ = O.get(z);
      if ($) {
        Jt(u, m, $);
        return;
      }
      var W = E ? E(I, z, m + "", u, f, O) : void 0, gt = W === void 0;
      if (gt) {
        var ae = re(z), ue = !ae && je(z), qe = !ae && !ue && Le(z);
        W = z, ae || ue || qe ? re(I) ? W = I : Bi(I) ? W = bi(I) : ue ? (gt = !1, W = _i(z)) : qe ? (gt = !1, W = xi(z)) : W = [] : ji(z) || ie(z) ? (W = I, ie(I) ? W = Pi(I) : (!J(I) || se(I)) && (W = Mi(z))) : gt = !1;
      }
      gt && (O.set(z, W), D(W, z, A, E, O), O.delete(z)), Jt(u, m, W);
    }
    function mi(u, f) {
      return Ri(Ei(u, f, Ge), u + "");
    }
    var vi = Dt ? function(u, f) {
      return Dt(u, "toString", {
        configurable: !0,
        enumerable: !1,
        value: Ui(f),
        writable: !0
      });
    } : Ge;
    function _i(u, f) {
      return u.slice();
    }
    function wi(u) {
      var f = new u.constructor(u.byteLength);
      return new ke(f).set(new ke(u)), f;
    }
    function xi(u, f) {
      var m = wi(u.buffer);
      return new u.constructor(m, u.byteOffset, u.length);
    }
    function bi(u, f) {
      var m = -1, A = u.length;
      for (f || (f = Array(A)); ++m < A; )
        f[m] = u[m];
      return f;
    }
    function Si(u, f, m, A) {
      var D = !m;
      m || (m = {});
      for (var E = -1, O = f.length; ++E < O; ) {
        var I = f[E], z = void 0;
        z === void 0 && (z = u[I]), D ? te(m, I, z) : hi(m, I, z);
      }
      return m;
    }
    function Ti(u) {
      return mi(function(f, m) {
        var A = -1, D = m.length, E = D > 1 ? m[D - 1] : void 0, O = D > 2 ? m[2] : void 0;
        for (E = u.length > 3 && typeof E == "function" ? (D--, E) : void 0, O && Di(m[0], m[1], O) && (E = D < 3 ? void 0 : E, D = 1), f = Object(f); ++A < D; ) {
          var I = m[A];
          I && u(f, I, A, E);
        }
        return f;
      });
    }
    function Ai(u) {
      return function(f, m, A) {
        for (var D = -1, E = Object(f), O = A(f), I = O.length; I--; ) {
          var z = O[++D];
          if (m(E[z], z, E) === !1)
            break;
        }
        return f;
      };
    }
    function It(u, f) {
      var m = u.__data__;
      return ki(f) ? m[typeof f == "string" ? "string" : "hash"] : m.map;
    }
    function ee(u, f) {
      var m = En(u, f);
      return di(m) ? m : void 0;
    }
    function Ci(u) {
      var f = K.call(u, Z), m = u[Z];
      try {
        u[Z] = void 0;
        var A = !0;
      } catch {
      }
      var D = Me.call(u);
      return A && (f ? u[Z] = m : delete u[Z]), D;
    }
    function Mi(u) {
      return typeof u.constructor == "function" && !Be(u) ? qn(Ne(u)) : {};
    }
    function ze(u, f) {
      var m = typeof u;
      return f = f ?? a, !!f && (m == "number" || m != "symbol" && Dn.test(u)) && u > -1 && u % 1 == 0 && u < f;
    }
    function Di(u, f, m) {
      if (!J(m))
        return !1;
      var A = typeof f;
      return (A == "number" ? oe(m) && ze(f, m.length) : A == "string" && f in m) ? Ft(m[f], u) : !1;
    }
    function ki(u) {
      var f = typeof u;
      return f == "string" || f == "number" || f == "symbol" || f == "boolean" ? u !== "__proto__" : u === null;
    }
    function Ni(u) {
      return !!Ce && Ce in u;
    }
    function Be(u) {
      var f = u && u.constructor, m = typeof f == "function" && f.prototype || At;
      return u === m;
    }
    function Ii(u) {
      var f = [];
      if (u != null)
        for (var m in Object(u))
          f.push(m);
      return f;
    }
    function Fi(u) {
      return Me.call(u);
    }
    function Ei(u, f, m) {
      return f = Fe(f === void 0 ? u.length - 1 : f, 0), function() {
        for (var A = arguments, D = -1, E = Fe(A.length - f, 0), O = Array(E); ++D < E; )
          O[D] = A[f + D];
        D = -1;
        for (var I = Array(f + 1); ++D < f; )
          I[D] = A[D];
        return I[f] = m(O), Nn(u, this, I);
      };
    }
    function ne(u, f) {
      if (!(f === "constructor" && typeof u[f] == "function") && f != "__proto__")
        return u[f];
    }
    var Ri = Oi(vi);
    function Oi(u) {
      var f = 0, m = 0;
      return function() {
        var A = Gn(), D = s - (A - m);
        if (m = A, D > 0) {
          if (++f >= r)
            return arguments[0];
        } else
          f = 0;
        return u.apply(void 0, arguments);
      };
    }
    function zi(u) {
      if (u != null) {
        try {
          return Ct.call(u);
        } catch {
        }
        try {
          return u + "";
        } catch {
        }
      }
      return "";
    }
    function Ft(u, f) {
      return u === f || u !== u && f !== f;
    }
    var ie = Re(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Re : function(u) {
      return dt(u) && K.call(u, "callee") && !Pn.call(u, "callee");
    }, re = Array.isArray;
    function oe(u) {
      return u != null && Pe(u.length) && !se(u);
    }
    function Bi(u) {
      return dt(u) && oe(u);
    }
    var je = Un || Gi;
    function se(u) {
      if (!J(u))
        return !1;
      var f = Nt(u);
      return f == p || f == x || f == o || f == S;
    }
    function Pe(u) {
      return typeof u == "number" && u > -1 && u % 1 == 0 && u <= a;
    }
    function J(u) {
      var f = typeof u;
      return u != null && (f == "object" || f == "function");
    }
    function dt(u) {
      return u != null && typeof u == "object";
    }
    function ji(u) {
      if (!dt(u) || Nt(u) != b)
        return !1;
      var f = Ne(u);
      if (f === null)
        return !0;
      var m = K.call(f, "constructor") && f.constructor;
      return typeof m == "function" && m instanceof m && Ct.call(m) == Bn;
    }
    var Le = Ae ? Fn(Ae) : gi;
    function Pi(u) {
      return Si(u, Ue(u));
    }
    function Ue(u) {
      return oe(u) ? ci(u) : pi(u);
    }
    var Li = Ti(function(u, f, m) {
      Oe(u, f, m);
    });
    function Ui(u) {
      return function() {
        return u;
      };
    }
    function Ge(u) {
      return u;
    }
    function Gi() {
      return !1;
    }
    e.exports = Li;
  })(vt, vt.exports)), vt.exports;
}
var Cs = As();
const zt = /* @__PURE__ */ Ts(Cs);
function Ms(e) {
  var t = 0, n = e.children, i = n && n.length;
  if (!i) t = 1;
  else for (; --i >= 0; ) t += n[i].value;
  e.value = t;
}
function Ds() {
  return this.eachAfter(Ms);
}
function ks(e, t) {
  let n = -1;
  for (const i of this)
    e.call(t, i, ++n, this);
  return this;
}
function Ns(e, t) {
  for (var n = this, i = [n], r, s, a = -1; n = i.pop(); )
    if (e.call(t, n, ++a, this), r = n.children)
      for (s = r.length - 1; s >= 0; --s)
        i.push(r[s]);
  return this;
}
function Is(e, t) {
  for (var n = this, i = [n], r = [], s, a, l, c = -1; n = i.pop(); )
    if (r.push(n), s = n.children)
      for (a = 0, l = s.length; a < l; ++a)
        i.push(s[a]);
  for (; n = r.pop(); )
    e.call(t, n, ++c, this);
  return this;
}
function Fs(e, t) {
  let n = -1;
  for (const i of this)
    if (e.call(t, i, ++n, this))
      return i;
}
function Es(e) {
  return this.eachAfter(function(t) {
    for (var n = +e(t.data) || 0, i = t.children, r = i && i.length; --r >= 0; ) n += i[r].value;
    t.value = n;
  });
}
function Rs(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function Os(e) {
  for (var t = this, n = zs(t, e), i = [t]; t !== n; )
    t = t.parent, i.push(t);
  for (var r = i.length; e !== n; )
    i.splice(r, 0, e), e = e.parent;
  return i;
}
function zs(e, t) {
  if (e === t) return e;
  var n = e.ancestors(), i = t.ancestors(), r = null;
  for (e = n.pop(), t = i.pop(); e === t; )
    r = e, e = n.pop(), t = i.pop();
  return r;
}
function Bs() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function js() {
  return Array.from(this);
}
function Ps() {
  var e = [];
  return this.eachBefore(function(t) {
    t.children || e.push(t);
  }), e;
}
function Ls() {
  var e = this, t = [];
  return e.each(function(n) {
    n !== e && t.push({ source: n.parent, target: n });
  }), t;
}
function* Us() {
  var e = this, t, n = [e], i, r, s;
  do
    for (t = n.reverse(), n = []; e = t.pop(); )
      if (yield e, i = e.children)
        for (r = 0, s = i.length; r < s; ++r)
          n.push(i[r]);
  while (n.length);
}
function Xt(e, t) {
  e instanceof Map ? (e = [void 0, e], t === void 0 && (t = Hs)) : t === void 0 && (t = qs);
  for (var n = new xt(e), i, r = [n], s, a, l, c; i = r.pop(); )
    if ((a = t(i.data)) && (c = (a = Array.from(a)).length))
      for (i.children = a, l = c - 1; l >= 0; --l)
        r.push(s = a[l] = new xt(a[l])), s.parent = i, s.depth = i.depth + 1;
  return n.eachBefore(Vs);
}
function Gs() {
  return Xt(this).eachBefore(Ws);
}
function qs(e) {
  return e.children;
}
function Hs(e) {
  return Array.isArray(e) ? e[1] : null;
}
function Ws(e) {
  e.data.value !== void 0 && (e.value = e.data.value), e.data = e.data.data;
}
function Vs(e) {
  var t = 0;
  do
    e.height = t;
  while ((e = e.parent) && e.height < ++t);
}
function xt(e) {
  this.data = e, this.depth = this.height = 0, this.parent = null;
}
xt.prototype = Xt.prototype = {
  constructor: xt,
  count: Ds,
  each: ks,
  eachAfter: Is,
  eachBefore: Ns,
  find: Fs,
  sum: Es,
  sort: Rs,
  path: Os,
  ancestors: Bs,
  descendants: js,
  leaves: Ps,
  links: Ls,
  copy: Gs,
  [Symbol.iterator]: Us
};
function $s(e, t) {
  return e.parent === t.parent ? 1 : 2;
}
function ce(e) {
  var t = e.children;
  return t ? t[0] : e.t;
}
function he(e) {
  var t = e.children;
  return t ? t[t.length - 1] : e.t;
}
function Xs(e, t, n) {
  var i = n / (t.i - e.i);
  t.c -= i, t.s += n, e.c += i, t.z += n, t.m += n;
}
function Ks(e) {
  for (var t = 0, n = 0, i = e.children, r = i.length, s; --r >= 0; )
    s = i[r], s.z += t, s.m += t, t += s.s + (n += s.c);
}
function Ys(e, t, n) {
  return e.a.parent === t.parent ? e.a : n;
}
function Bt(e, t) {
  this._ = e, this.parent = null, this.children = null, this.A = null, this.a = this, this.z = 0, this.m = 0, this.c = 0, this.s = 0, this.t = null, this.i = t;
}
Bt.prototype = Object.create(xt.prototype);
function Zs(e) {
  for (var t = new Bt(e, 0), n, i = [t], r, s, a, l; n = i.pop(); )
    if (s = n._.children)
      for (n.children = new Array(l = s.length), a = l - 1; a >= 0; --a)
        i.push(r = n.children[a] = new Bt(s[a], a)), r.parent = n;
  return (t.parent = new Bt(null, 0)).children = [t], t;
}
function An() {
  var e = $s, t = 1, n = 1, i = null;
  function r(o) {
    var h = Zs(o);
    if (h.eachAfter(s), h.parent.m = -h.z, h.eachBefore(a), i) o.eachBefore(c);
    else {
      var g = o, d = o, p = o;
      o.eachBefore(function(b) {
        b.x < g.x && (g = b), b.x > d.x && (d = b), b.depth > p.depth && (p = b);
      });
      var x = g === d ? 1 : e(g, d) / 2, y = x - g.x, v = t / (d.x + x + y), w = n / (p.depth || 1);
      o.eachBefore(function(b) {
        b.x = (b.x + y) * v, b.y = b.depth * w;
      });
    }
    return o;
  }
  function s(o) {
    var h = o.children, g = o.parent.children, d = o.i ? g[o.i - 1] : null;
    if (h) {
      Ks(o);
      var p = (h[0].z + h[h.length - 1].z) / 2;
      d ? (o.z = d.z + e(o._, d._), o.m = o.z - p) : o.z = p;
    } else d && (o.z = d.z + e(o._, d._));
    o.parent.A = l(o, d, o.parent.A || g[0]);
  }
  function a(o) {
    o._.x = o.z + o.parent.m, o.m += o.parent.m;
  }
  function l(o, h, g) {
    if (h) {
      for (var d = o, p = o, x = h, y = d.parent.children[0], v = d.m, w = p.m, b = x.m, S = y.m, _; x = he(x), d = ce(d), x && d; )
        y = ce(y), p = he(p), p.a = o, _ = x.z + b - d.z - v + e(x._, d._), _ > 0 && (Xs(Ys(x, o, g), o, _), v += _, w += _), b += x.m, v += d.m, S += y.m, w += p.m;
      x && !he(p) && (p.t = x, p.m += b - w), d && !ce(y) && (y.t = d, y.m += v - S, g = o);
    }
    return g;
  }
  function c(o) {
    o.x *= t, o.y = o.depth * n;
  }
  return r.separation = function(o) {
    return arguments.length ? (e = o, r) : e;
  }, r.size = function(o) {
    return arguments.length ? (i = !1, t = +o[0], n = +o[1], r) : i ? null : [t, n];
  }, r.nodeSize = function(o) {
    return arguments.length ? (i = !0, t = +o[0], n = +o[1], r) : i ? [t, n] : null;
  }, r;
}
function jt(e, t) {
  const n = {};
  for (const a of e)
    n[a.id] = [];
  for (const { source: a, target: l } of t)
    n[a.id] || (n[a.id] = []), n[a.id].push(l.id);
  const i = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Set(), s = (a) => {
    if (!i.has(a) && (i.add(a), r.add(a), n[a]))
      for (const l of n[a]) {
        if (!i.has(l) && s(l)) return !0;
        if (r.has(l)) return !0;
      }
    return r.delete(a), !1;
  };
  return e.some((a) => s(a.id));
}
function nn(e, t) {
  const n = new Set(t.map((i) => i.target.id));
  for (const i of e)
    if (!n.has(i.id)) return i;
  return e[0];
}
function Qs(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const c of e)
    n.set(c.id, []);
  for (const c of t)
    n.get(c.from.id) || console.log(c), n.get(c.from.id).push(c.to);
  const i = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function s(c, o = /* @__PURE__ */ new Set()) {
    if (r.has(c))
      return new Set(r.get(c));
    const h = /* @__PURE__ */ new Set();
    for (const g of n.get(c.id) ?? [])
      if (!o.has(g)) {
        o.add(g), h.add(g);
        const d = s(g, o);
        for (const p of d) h.add(p);
      }
    return r.set(c, h), i.set(c, h.size), h;
  }
  for (const c of e)
    i.has(c) || s(c);
  let a = null, l = -1;
  for (const c of e) {
    const o = i.get(c) ?? 0;
    o > l && (l = o, a = c);
  }
  return a ?? e[0];
}
function Js(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const o of e)
    n.set(o.id, []), i.set(o.id, 0);
  for (const o of t)
    o.directed !== !1 && (n.get(o.from.id).push(o.to), i.set(o.to.id, (i.get(o.to.id) || 0) + 1));
  const r = [], s = e.filter((o) => i.get(o.id) === 0);
  for (; s.length; ) {
    const o = s.shift();
    r.push(o);
    for (const h of n.get(o.id))
      i.set(h.id, i.get(h.id) - 1), i.get(h.id) === 0 && s.push(h);
  }
  if (r.length !== e.length)
    return console.warn("Graph has a cycle! Min-max distance root undefined."), e[0];
  const a = /* @__PURE__ */ new Map();
  for (let o = r.length - 1; o >= 0; o--) {
    const h = r[o];
    let g = 0;
    for (const d of n.get(h.id))
      g = Math.max(g, 1 + (a.get(d.id) || 0));
    a.set(h.id, g);
  }
  let l = null, c = 1 / 0;
  for (const o of e) {
    const h = a.get(o.id);
    h < c && (c = h, l = o);
  }
  return l ?? e[0];
}
function ta(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const o of e)
    n.set(o.id, []), i.set(o.id, 0);
  for (const o of t)
    o.directed !== !1 && (n.get(o.from.id).push(o.to), i.set(o.to.id, (i.get(o.to.id) || 0) + 1));
  const r = [], s = e.filter((o) => i.get(o.id) === 0);
  for (; s.length; ) {
    const o = s.shift();
    r.push(o);
    for (const h of n.get(o.id))
      i.set(h.id, i.get(h.id) - 1), i.get(h.id) === 0 && s.push(h);
  }
  if (r.length !== e.length)
    return console.warn("Graph has a cycle! Cannot minimize DAG height."), e[0];
  const a = /* @__PURE__ */ new Map();
  for (let o = r.length - 1; o >= 0; o--) {
    const h = r[o];
    let g = 0;
    for (const d of n.get(h.id))
      g = Math.max(g, 1 + (a.get(d.id) ?? 0));
    a.set(h.id, g);
  }
  let l = null, c = 1 / 0;
  for (const o of e) {
    const h = a.get(o.id);
    h < c && (c = h, l = o);
  }
  return l ?? e[0];
}
const fe = {
  type: "tree",
  rootId: void 0,
  rootIdAlgorithmFinder: "MaxReachability",
  strength: 0.25,
  radial: !1,
  radialGap: 750,
  horizontal: !1,
  flipEdgeDirection: !1
};
class L {
  constructor(t, n, i, r = {}) {
    T(this, "graph");
    T(this, "simulation");
    T(this, "simulationForces");
    T(this, "options");
    T(this, "originalForceStrength");
    T(this, "canvasBCR");
    T(this, "levels");
    T(this, "positionedNodesByID");
    this.graph = t, this.simulation = n, this.simulationForces = i, this.options = zt({}, fe, r), this.originalForceStrength = {
      link: this.simulationForces.link.strength(),
      charge: this.simulationForces.charge.strength(),
      gravity: this.simulationForces.gravity.strength()
    }, this.positionedNodesByID = /* @__PURE__ */ new Map(), this.levels = {};
    const s = this.graph.getNodes(), a = this.options.flipEdgeDirection ? this.flipEdgeDirection(this.graph.getEdges()) : this.graph.getEdges();
    if (jt(s, a)) {
      this.graph.notifier.warning("Tree layout unavailable", "The graph contains a cycle, so it cannot be displayed as a tree.");
      return;
    }
    this.setSizes(), this.update(), this.registerForces();
  }
  update() {
    const t = this.graph.getNodes(), n = this.options.flipEdgeDirection ? this.flipEdgeDirection(this.graph.getEdges()) : this.graph.getEdges(), { levels: i } = this.buildLevels(t, n, void 0, this.options.rootIdAlgorithmFinder), { nodes: r, nodeById: s } = this.buildTree(t, n, this.options, this.canvasBCR);
    this.positionedNodesByID = s, this.levels = i, r && this.setNodePositions(r, this.options);
  }
  flipEdgeDirection(t) {
    return t.forEach((n) => {
      const i = n.from;
      n.setFrom(n.to), n.setTo(i);
    }), t;
  }
  setSizes() {
    const t = this.graph.renderer.getCanvas();
    if (!t)
      throw new Error("Canvas element is not defined in the graph renderer.");
    this.canvasBCR = t.getBoundingClientRect();
  }
  setNodePositions(t, n) {
    for (const i of t) {
      const r = this.graph.getMutableNode(i.data.id);
      if (r)
        if (n.radial) {
          const s = i.x ?? 0, a = i.y ?? 0;
          r.x = a * Math.cos(s - Math.PI / 2), r.y = a * Math.sin(s - Math.PI / 2), r.fx = r.x, r.fy = r.y;
        } else n.horizontal ? (r.x = i.y, r.fx = i.y, r.y = i.x, delete r.fy) : (r.x = i.x, r.y = i.y, r.fy = i.y, delete r.fx);
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
      const n = Ke(
        (i) => (this.levels[i.id] ?? 1) * 100,
        0,
        0
      ).strength(t);
      this.simulation.force("tree-radial", n);
    } else
      this.simulation.force("tree-y", Ze((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.x) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.y) ?? 0;
      }).strength(t)), this.simulation.force("tree-x", Ye((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.y) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.x) ?? 0;
      }).strength(t));
    L.adjustOtherSimulationForces(this.simulationForces, this.options);
  }
  unregisterLayout() {
    this.unregisterForces(), this.unsetNodePositions();
  }
  unregisterForces() {
    this.simulation.force("tree-radial", null), this.simulation.force("tree-y", null), this.simulation.force("tree-x", null), L.resetOtherSimulationForces(this.simulationForces, this.originalForceStrength);
  }
  static registerForcesOnSimulation(t, n, i, r, s, a, l = this) {
    const c = zt({}, fe, s), o = c.strength ?? 0.1, h = a.width, g = a.height, d = [h / 2, g / 2];
    if (jt(t, n))
      return;
    const { levels: p } = l.buildLevelsStatic(t, n, void 0, c.rootIdAlgorithmFinder), { nodeById: x } = l.buildTreeStatic(t, n, c, a);
    if (c.radial) {
      const y = Ke(
        (v) => (p[v.id] ?? 1) * 100,
        d[0],
        d[1]
      ).strength(o);
      i.force("tree-radial", y);
    } else
      i.force("tree-y", Ze((y) => {
        var v, w;
        return c.horizontal ? ((v = x.get(y.id)) == null ? void 0 : v.x) ?? 0 : ((w = x.get(y.id)) == null ? void 0 : w.y) ?? 0;
      }).strength(o)), i.force("tree-x", Ye((y) => {
        var v, w;
        return c.horizontal ? ((v = x.get(y.id)) == null ? void 0 : v.y) ?? 0 : ((w = x.get(y.id)) == null ? void 0 : w.x) ?? 0;
      }).strength(o));
    l.adjustOtherSimulationForces(r, c);
  }
  static adjustOtherSimulationForces(t, n) {
    n != null && n.radial ? (t.link.strength(0), t.charge.strength(0), t.gravity.strength(0)) : (t.link.strength(0), t.charge.strength(0), t.gravity.strength(1e-5));
  }
  static resetOtherSimulationForces(t, n) {
    t.link.strength(n.link), t.charge.strength(n.charge), t.gravity.strength(n.gravity);
  }
  static simulationDone(t, n, i, r) {
    const s = zt({}, fe, r);
    for (const a of t)
      s.radial ? (a.fx = a.x, a.fy = a.y) : s.horizontal ? (a.fx = a.x, delete a.fy) : (a.fy = a.y, delete a.fx);
  }
  buildTree(t, n, i, r) {
    return L.buildTreeStatic(t, n, i, r);
  }
  static buildTreeStatic(t, n, i, r) {
    if (!t.length)
      return {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    if (jt(t, n))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const s = /* @__PURE__ */ new Map();
    for (const y of t) {
      const v = y;
      v.children = [], s.set(y.id, v);
    }
    for (const y of n) {
      const v = s.get(y.source.id), w = s.get(y.target.id);
      v && w && (v.children.push(w), w.parent = v);
    }
    const a = i.rootId || L.findRootId(t, n, i.rootIdAlgorithmFinder), l = s.get(a);
    if (!l)
      throw new Error(`Root node with id "${a}" not found.`);
    const c = i.radialGap, o = i.radial ? 2 * Math.PI : r.width, h = i.radial ? c : r.height, g = An();
    i.radial ? g.size([o, h]) : g.size([o, h]).separation((y, v) => {
      var b, S;
      const w = ((S = (b = y.parent) == null ? void 0 : b.children) == null ? void 0 : S.length) ?? 1;
      return y.parent === v.parent ? 1.5 / w : 1.5;
    });
    const d = Xt(l), p = g(d), x = /* @__PURE__ */ new Map();
    return p.descendants().forEach((y) => {
      x.set(y.data.id, y);
    }), {
      root: p,
      nodes: p.descendants(),
      nodeById: x
    };
  }
  buildLevels(t, n, i, r) {
    return L.buildLevelsStatic(t, n, i, r);
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
  static buildLevelsStatic(t, n, i, r) {
    if (!t.length)
      return {
        levels: {},
        maxDepth: 0,
        nodeCountPerLevel: {}
      };
    const s = i || L.findRootId(t, n, r), a = { [s]: 0 }, l = {};
    for (const d of t)
      l[d.id] = [];
    for (const { source: d, target: p } of n)
      l[d.id].push(p.id);
    const c = [s];
    let o = 0;
    for (; o < c.length; ) {
      const d = c[o++], p = a[d];
      for (const x of l[d] || [])
        x in a || (a[x] = p + 1, c.push(x));
    }
    const h = Math.max(...Object.values(a)), g = {};
    for (const d of Object.values(a))
      g[d] = (g[d] || 0) + 1;
    return {
      levels: a,
      maxDepth: h,
      nodeCountPerLevel: g
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
  static findRootId(t, n, i) {
    switch (i) {
      case "FirstZeroInDegree":
        return nn(t, n).id;
      case "MaxReachability":
        return Qs(t, n).id;
      case "MinMaxDistance":
        return Js(t, n).id;
      case "MinHeight":
        return ta(t, n).id;
      default:
        return nn(t, n).id;
    }
  }
}
class bt extends L {
  constructor(t, n, i, r) {
    super(t, n, i, {
      ...r,
      type: "tree"
    });
  }
  static registerForcesOnSimulation(t, n, i, r, s, a) {
    L.registerForcesOnSimulation(
      t,
      n,
      i,
      r,
      s,
      a,
      bt
    );
  }
  buildTree(t, n, i, r) {
    return bt.buildTreeStatic(t, n, i, r);
  }
  static buildTreeStatic(t, n, i, r) {
    if (!t.length)
      return {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    if (jt(t, n))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const s = /* @__PURE__ */ new Map();
    for (const y of t) {
      const v = y;
      v.children = [], s.set(y.id, v);
    }
    if (!i.rootId || !s.get(i.rootId))
      throw new Error("Ego Tree can only be created with a rootId");
    const a = i.rootId, l = s.get(a);
    if (l.children = [], !l)
      throw new Error(`Root node with id "${a}" not found.`);
    for (const y of n) {
      const v = s.get(y.source.id), w = s.get(y.target.id);
      v && w && (y.source.id === l.id ? (l.children.push(w), w.parent = l) : y.target.id === l.id && (l.children.push(v), v.parent = l));
    }
    const c = i.radialGap, o = i.radial ? 2 * Math.PI : r.width, h = i.radial ? c : r.height, g = An();
    i.radial ? g.size([o, h]) : g.size([o, h]).separation((y, v) => {
      var b, S;
      const w = ((S = (b = y.parent) == null ? void 0 : b.children) == null ? void 0 : S.length) ?? 1;
      return y.parent === v.parent ? 1.5 / w : 1.5;
    });
    const d = Xt(l), p = g(d), x = /* @__PURE__ */ new Map();
    return p.descendants().forEach((y) => {
      x.set(y.data.id, y);
    }), {
      root: p,
      nodes: p.descendants(),
      nodeById: x
    };
  }
}
function ea(e) {
  var n;
  const t = (n = e.getData()) == null ? void 0 : n.label;
  return typeof t == "string" ? t : "";
}
const tt = {
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
class et {
  constructor(t, n = {}) {
    T(this, "simulation");
    T(this, "graph");
    T(this, "canvas");
    T(this, "graphInteraction");
    T(this, "layout");
    T(this, "canvasBCR");
    T(this, "animationFrameId", null);
    T(this, "startSimulationTime", 0);
    T(this, "engineRunning", !1);
    T(this, "slowTickThresholdReached", !1);
    T(this, "lastTickTime", 0);
    T(this, "avgTickDuration", 0);
    T(this, "SLOW_TICK_THRESHOLD", 50);
    // ms (20fps budget)
    T(this, "dragInProgress", !1);
    T(this, "dragSelection", []);
    T(this, "totalTickCount", 0);
    T(this, "options");
    T(this, "callbacks");
    T(this, "simulationForces");
    T(this, "scaledForces", {
      d3ManyBodyStrength: tt.d3ManyBodyStrength,
      d3CollideStrength: tt.d3CollideStrength
    });
    if (this.graph = t, this.options = zt({}, tt, n), this.callbacks = this.options.callbacks ?? {}, this.canvas = this.graph.renderer.getCanvas(), !this.canvas) throw new Error("Canvas element is not defined in the graph renderer.");
    if (this.canvasBCR = this.canvas.getBoundingClientRect(), this.graphInteraction = this.graph.renderer.getGraphInteraction(), !this.graphInteraction) throw new Error("Graph interaction is not available.");
    const i = et.initSimulationForces(this.options, this.canvasBCR);
    this.simulation = i.simulation, this.simulationForces = i.simulationForces, this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength || tt.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = this.options.d3CollideStrength || tt.d3CollideStrength, this.options.layout.type === "tree" ? this.layout = new L(
      this.graph,
      this.simulation,
      this.simulationForces,
      this.options.layout
    ) : this.options.layout.type === "egoTree" && (this.layout = new bt(
      this.graph,
      this.simulation,
      this.simulationForces,
      this.options.layout
    )), this.callbacks.onInit && this.callbacks.onInit(this);
  }
  /** @private */
  static initSimulationForces(t, n) {
    const i = {
      link: hr(),
      charge: Mr(),
      collide: lr(),
      gravity: Dr()
      // clusterRadialConstraint: ForceClusterRadial(),
    }, r = Cr().force("link", i.link).force("charge", i.charge).force("collide", i.collide).force("gravity", i.gravity);
    return this.initSimulationForceGravity(i.gravity, t, n), this.initSimulationForceLink(i.link, t), this.initSimulationForceCharge(i.charge, t), this.initSimulationForceCollide(i.collide, t), r.alphaMin(t.d3AlphaMin), r.alphaDecay(t.d3AlphaDecay), r.alphaTarget(0), r.velocityDecay(t.d3VelocityDecay), {
      simulation: r,
      simulationForces: i
    };
  }
  static initSimulationForceGravity(t, n, i) {
    t.x(i.width / 2).y(i.height / 2).strength((r) => (r.degree() ?? 0) === 0 ? n.d3GravityStrength : 1e-3);
  }
  static initSimulationForceLink(t, n) {
    t.distance((i) => {
      const r = ea(i);
      if (!r || r === "")
        return n.d3LinkDistance;
      const s = r.length * 10;
      return Math.max(n.d3LinkDistance, s);
    }), n.d3LinkStrength && t.strength(n.d3LinkStrength);
  }
  static initSimulationForceCharge(t, n) {
    t.theta(n.d3ManyBodyTheta).strength((i) => {
      const r = i, s = n.d3ManyBodyStrength, a = r.getCircleRadius(), l = 10 + Math.sqrt(a - 10);
      let c = r.weight ?? 1;
      return c *= r.isParent ? 10 : 1, s * (l * l) / 100 * c;
    });
  }
  static initSimulationForceCollide(t, n) {
    t.radius((i) => {
      const r = i;
      return r.expanded ? 1.2 * r.getCircleRadius() + 20 : r.getCircleRadius() ? 1.2 * r.getCircleRadius() : n.d3CollideRadius;
    }).strength(n.d3CollideStrength);
  }
  static initSimulationForceClusterRadialConstraint(t, n) {
    t.strength(n.d3CollideStrength);
  }
  update() {
    this.layout && this.layout.update();
    const t = this.graph.getMutableNodes().filter((i) => i.visible);
    this.simulation.nodes(t);
    const n = this.simulation.force("link");
    n && n.id((i) => i.id).links(this.getActiveEdges()), this.restart();
  }
  /** @private */
  getActiveEdges() {
    const t = this.graph.getMutableEdges().filter((i) => {
      if (!i.visible) return !1;
      const r = i.source, s = i.target;
      return !(r.isChild || s.isChild);
    }), n = this.getClusterLinks();
    return [...t, ...n];
  }
  /** @private */
  getClusterLinks() {
    return this.graph.getMutableEdges().filter((n) => n.visible);
  }
  /** @private */
  scaleSimulationOptions() {
    const t = et.scaleSimulationOptions(this.options, this.canvasBCR, this.graph.getNodeCount());
    this.scaledForces.d3ManyBodyStrength = t.d3ManyBodyStrength ?? tt.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = t.d3CollideStrength ?? tt.d3CollideStrength;
  }
  /** @private */
  static scaleSimulationOptions(t, n, i) {
    const r = i / (n.width * n.height), s = Math.min(2, 75e-6 / r);
    return {
      d3ManyBodyStrength: t.d3ManyBodyStrength * s,
      d3CollideStrength: t.d3ManyBodyStrength * s
    };
  }
  /** @private */
  applyScalledSimulationOptions() {
    et.initSimulationForceCharge(this.simulationForces.charge, this.options), et.initSimulationForceCollide(this.simulationForces.collide, this.options);
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
    const t = performance.now(), n = t - this.lastTickTime;
    this.lastTickTime = t, this.avgTickDuration = this.avgTickDuration * 0.9 + n * 0.1, this.avgTickDuration > this.SLOW_TICK_THRESHOLD && (this.slowTickThresholdReached = !0, this.disable(), (i = this.graph.UIManager.graphControls) == null || i.updatePhysicSimulationIndicator(!1), this.graph.UIManager.showNotification({
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
        const n = this.callbacks.onStop;
        this.callbacks.onStop = (i) => {
          n == null || n(i), this.callbacks.onStop = n, t();
        };
      });
  }
  isEnabled() {
    return this.options.enabled;
  }
  async computeGraph(t = {}) {
    var h;
    const { runSimulation: n } = await Promise.resolve().then(() => ia), i = (h = this.canvas) == null ? void 0 : h.getBoundingClientRect();
    if (!i) return;
    const r = this.graph.getMutableNodes(), s = this.graph.getNodes().map((g) => (g.fx = void 0, g.fy = void 0, g)), a = this.graph.getEdges(), { callbacks: l, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: o } = n(
      s,
      a,
      c,
      i
    );
    o.forEach((g, d) => {
      r[d].x = g.x, r[d].y = g.y, g.fx ? r[d].fx = g.fx : r[d].fx = void 0, g.fy ? r[d].fy = g.fy : r[d].fy = void 0;
    }), this.graph.updateData(r, void 0, !1);
  }
  async runSimulationWorkerRouter(t = {}) {
    this.options.useWorker ? await this.runSimulationWorker(t) : (await this.computeGraph(t), this.graph.updateLayoutProgress(100, 0, "done"));
  }
  async runSimulationWorker(t = {}) {
    var h;
    const n = (h = this.canvas) == null ? void 0 : h.getBoundingClientRect();
    if (!n) return;
    const i = this.graph.getMutableNodes(), r = this.graph.getNodes().map((g) => (g.fx = void 0, g.fy = void 0, g)), s = this.graph.getEdges(), a = (g, d) => {
      this.graph.updateLayoutProgress(g, d, "simulation");
    }, { callbacks: l, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: o } = await Ss(
      r,
      s,
      c,
      n,
      a
    );
    this.graph.updateLayoutProgress(100, 0, "rendering"), o.forEach((g, d) => {
      i[d].x = g.x, i[d].y = g.y, g.fx ? i[d].fx = g.fx : i[d].fx = void 0, g.fy ? i[d].fy = g.fy : i[d].fy = void 0;
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
    return ws().on("start.draggedelement", (t, n) => {
      this.graphInteraction.hasActiveMultiselection() ? this.dragSelection = this.graphInteraction.getSelectedNodes().map((i) => {
        const { node: r } = i;
        return r.freeze(), {
          node: r,
          dx: r.x - n.x,
          dy: r.y - n.y
        };
      }) : (this.dragSelection = [], n.freeze());
    }).on("drag.draggedelement", (t, n) => {
      if (!this.dragInProgress && this.isEnabled() && (this.dragInProgress = !0, this.restart(), this.simulation.alphaTarget(0.3).restart()), this.graphInteraction.hasActiveMultiselection() ? this.dragSelection.forEach(({ node: i, dx: r, dy: s }) => {
        i.fx = t.x + r, i.fy = t.y + s, i.x = t.x + r, i.y = t.y + s;
      }) : (n.fx = t.x, n.fy = t.y, n.x = t.x, n.y = t.y), this.graphInteraction.dragging(t.sourceEvent, t.subject), !this.engineRunning || !this.isEnabled()) {
        const i = this.graphInteraction.hasActiveMultiselection() ? this.dragSelection.map((r) => r.node) : [n];
        this.graph.nextTickFor(i);
      }
    }).on("end.draggedelement", (t, n) => {
      !t.active && this.dragInProgress && (this.dragInProgress = !1, this.restart(), this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()), this.options.freezeNodesOnDrag || (this.graphInteraction.hasActiveMultiselection() ? (this.dragSelection.forEach(({ node: i }) => i.unfreeze()), this.dragSelection = []) : n.unfreeze()), this.graphInteraction.dragended(t.sourceEvent, t.subject);
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
  async changeLayout(t, n = {}) {
    var i;
    this.layout && ((i = this.layout) == null || i.unregisterLayout(), this.layout = void 0), n = n ?? {}, n.layout = n.layout ?? {}, n.layout.type = t, t === "force" ? this.applyScalledSimulationOptions() : t === "tree" && (this.layout = new L(this.graph, this.simulation, this.simulationForces, n.layout)), this.options.layout.type = t, this.update(), this.pause(), await this.runSimulationWorkerRouter(n), this.restart(), await this.waitForSimulationStop(), this.graph.renderer.fitAndCenter();
  }
}
const Cn = 1e4, qt = 2e4, Ht = 0.15 * qt;
self.onmessage = (e) => {
  var y, v, w, b;
  if (e.data.source !== "simulation-worker-wrapper") return;
  const { nodes: t, edges: n, options: i, canvasBCR: r } = e.data, s = t.map((S) => {
    const _ = new bn(S.id, S.data, S.style);
    return _.setCircleRadius(S._circleRadius ?? 10), _;
  }), a = new Map(s.map((S) => [S.id, S]));
  (y = i.layout) == null || y.type;
  const { simulation: l, simulationForces: c } = et.initSimulationForces(i, r), o = [];
  for (const S of n) {
    const _ = a.get(S.from.id), C = a.get(S.to.id);
    if (_ && C) {
      const M = S.style ?? {};
      o.push(new $t(S.id, _, C, S.data, M, S.directed));
    }
  }
  l.nodes(s);
  const h = l.force("link");
  h && h.id((S) => S.id).links(o), ((v = i.layout) == null ? void 0 : v.type) === "tree" ? L.registerForcesOnSimulation(
    s,
    o,
    l,
    c,
    i.layout,
    r,
    L
  ) : ((w = i.layout) == null ? void 0 : w.type) === "egoTree" && L.registerForcesOnSimulation(
    s,
    o,
    l,
    c,
    i.layout,
    r,
    bt
  );
  let g = i.warmupTicks || qt;
  g = g === "auto" ? qt : g, g = g - Ht;
  let d = 0.3;
  l.alphaTarget(d);
  const p = (/* @__PURE__ */ new Date()).getTime();
  let x;
  for (let S = 0; S < g && !((/* @__PURE__ */ new Date()).getTime() - p > Cn || (/* @__PURE__ */ new Date()).getTime() - p > i.cooldownTime || Wt(i, l, d) && (/* @__PURE__ */ new Date()).getTime() - p > i.cooldownTime * 0.15); ++S)
    S % 5 === 0 && (x = rn(S, (/* @__PURE__ */ new Date()).getTime() - p, i), postMessage({ type: "tick", progress: x, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - p })), l.tick();
  d = 0, l.alphaTarget(d), l.alpha(1);
  for (let S = 0; S < Ht && !(Wt(i, l, d) && (/* @__PURE__ */ new Date()).getTime() - p > i.cooldownTime * 0.15); ++S)
    l.tick(), S % 5 === 0 && (x = rn(g + S, (/* @__PURE__ */ new Date()).getTime() - p, i), postMessage({ type: "tick", progress: x, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - p }));
  postMessage({ type: "tick", progress: 1, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - p }), ((b = i.layout) == null ? void 0 : b.type) === "tree" && L.simulationDone(
    s,
    o,
    l,
    i.layout
  ), postMessage({
    type: "done",
    nodes: s.map((S) => S.toDict()),
    edges: o.map((S) => S.toDict())
  });
};
function na(e, t, n, i) {
  var p, x, y, v;
  const r = e.map((w) => {
    const b = new bn(w.id, w.getData(), w.getStyle());
    return b.weight = w.weight || 1, b.setCircleRadius(w.getCircleRadius()), b;
  }), s = new Map(r.map((w) => [w.id, w]));
  (p = n.layout) == null || p.type;
  const { simulation: a, simulationForces: l } = et.initSimulationForces(n, i), c = [];
  for (const w of t) {
    const b = s.get(w.from.id), S = s.get(w.to.id);
    if (b && S) {
      const _ = w.getStyle() ?? {};
      c.push(new $t(w.id, b, S, w.getData(), _, w.directed));
    }
  }
  a.nodes(r);
  const o = a.force("link");
  o && o.id((w) => w.id).links(c), (((x = n.layout) == null ? void 0 : x.type) === "tree" || ((y = n.layout) == null ? void 0 : y.type) === "egoTree") && L.registerForcesOnSimulation(
    r,
    c,
    a,
    l,
    n.layout,
    i,
    L
  );
  let h;
  n.warmupTicks === "auto" || n.warmupTicks == null ? h = qt : h = n.warmupTicks, h = h - Ht;
  let g = 0.3;
  a.alphaTarget(g);
  const d = (/* @__PURE__ */ new Date()).getTime();
  for (let w = 0; w < h && !((/* @__PURE__ */ new Date()).getTime() - d > Cn || (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime || Wt(n, a, g) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++w)
    a.tick();
  g = 0, a.alphaTarget(g), a.alpha(1);
  for (let w = 0; w < Ht && !(Wt(n, a, g) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++w)
    a.tick();
  return ((v = n.layout) == null ? void 0 : v.type) === "tree" && L.simulationDone(
    r,
    c,
    a,
    n.layout
  ), {
    nodes: r,
    edges: c
  };
}
function rn(e, t, n) {
  return t / n.cooldownTime;
}
function Wt(e, t, n) {
  return e.d3AlphaMin > 0 && t.alpha() - n < e.d3AlphaMin;
}
const ia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  runSimulation: na
}, Symbol.toStringTag, { value: "Module" }));
export {
  na as runSimulation
};
