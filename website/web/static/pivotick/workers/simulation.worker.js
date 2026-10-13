var lo = Object.defineProperty;
var co = (e, t, n) => t in e ? lo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var E = (e, t, n) => co(e, typeof t != "symbol" ? t + "" : t, n);
function uo(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e);
  return cr(this.cover(t, n), t, n, e);
}
function cr(e, t, n, i) {
  if (isNaN(t) || isNaN(n)) return e;
  var r, o = e._root, a = { data: i }, s = e._x0, c = e._y0, l = e._x1, f = e._y1, v, d, m, S, b, g, w, _;
  if (!o) return e._root = a, e;
  for (; o.length; )
    if ((b = t >= (v = (s + l) / 2)) ? s = v : l = v, (g = n >= (d = (c + f) / 2)) ? c = d : f = d, r = o, !(o = o[w = g << 1 | b])) return r[w] = a, e;
  if (m = +e._x.call(null, o.data), S = +e._y.call(null, o.data), t === m && n === S) return a.next = o, r ? r[w] = a : e._root = a, e;
  do
    r = r ? r[w] = new Array(4) : e._root = new Array(4), (b = t >= (v = (s + l) / 2)) ? s = v : l = v, (g = n >= (d = (c + f) / 2)) ? c = d : f = d;
  while ((w = g << 1 | b) === (_ = (S >= d) << 1 | m >= v));
  return r[_] = o, r[w] = a, e;
}
function ho(e) {
  var t, n, i = e.length, r, o, a = new Array(i), s = new Array(i), c = 1 / 0, l = 1 / 0, f = -1 / 0, v = -1 / 0;
  for (n = 0; n < i; ++n)
    isNaN(r = +this._x.call(null, t = e[n])) || isNaN(o = +this._y.call(null, t)) || (a[n] = r, s[n] = o, r < c && (c = r), r > f && (f = r), o < l && (l = o), o > v && (v = o));
  if (c > f || l > v) return this;
  for (this.cover(c, l).cover(f, v), n = 0; n < i; ++n)
    cr(this, a[n], s[n], e[n]);
  return this;
}
function fo(e, t) {
  if (isNaN(e = +e) || isNaN(t = +t)) return this;
  var n = this._x0, i = this._y0, r = this._x1, o = this._y1;
  if (isNaN(n))
    r = (n = Math.floor(e)) + 1, o = (i = Math.floor(t)) + 1;
  else {
    for (var a = r - n || 1, s = this._root, c, l; n > e || e >= r || i > t || t >= o; )
      switch (l = (t < i) << 1 | e < n, c = new Array(4), c[l] = s, s = c, a *= 2, l) {
        case 0:
          r = n + a, o = i + a;
          break;
        case 1:
          n = r - a, o = i + a;
          break;
        case 2:
          r = n + a, i = o - a;
          break;
        case 3:
          n = r - a, i = o - a;
          break;
      }
    this._root && this._root.length && (this._root = s);
  }
  return this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = o, this;
}
function po() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length) do
      e.push(t.data);
    while (t = t.next);
  }), e;
}
function go(e) {
  return arguments.length ? this.cover(+e[0][0], +e[0][1]).cover(+e[1][0], +e[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function vt(e, t, n, i, r) {
  this.node = e, this.x0 = t, this.y0 = n, this.x1 = i, this.y1 = r;
}
function mo(e, t, n) {
  var i, r = this._x0, o = this._y0, a, s, c, l, f = this._x1, v = this._y1, d = [], m = this._root, S, b;
  for (m && d.push(new vt(m, r, o, f, v)), n == null ? n = 1 / 0 : (r = e - n, o = t - n, f = e + n, v = t + n, n *= n); S = d.pop(); )
    if (!(!(m = S.node) || (a = S.x0) > f || (s = S.y0) > v || (c = S.x1) < r || (l = S.y1) < o))
      if (m.length) {
        var g = (a + c) / 2, w = (s + l) / 2;
        d.push(new vt(m[3], g, w, c, l), new vt(m[2], a, w, g, l), new vt(m[1], g, s, c, w), new vt(m[0], a, s, g, w)), (b = (t >= w) << 1 | e >= g) && (S = d[d.length - 1], d[d.length - 1] = d[d.length - 1 - b], d[d.length - 1 - b] = S);
      } else {
        var _ = e - +this._x.call(null, m.data), M = t - +this._y.call(null, m.data), y = _ * _ + M * M;
        if (y < n) {
          var D = Math.sqrt(n = y);
          r = e - D, o = t - D, f = e + D, v = t + D, i = m.data;
        }
      }
  return i;
}
function yo(e) {
  if (isNaN(f = +this._x.call(null, e)) || isNaN(v = +this._y.call(null, e))) return this;
  var t, n = this._root, i, r, o, a = this._x0, s = this._y0, c = this._x1, l = this._y1, f, v, d, m, S, b, g, w;
  if (!n) return this;
  if (n.length) for (; ; ) {
    if ((S = f >= (d = (a + c) / 2)) ? a = d : c = d, (b = v >= (m = (s + l) / 2)) ? s = m : l = m, t = n, !(n = n[g = b << 1 | S])) return this;
    if (!n.length) break;
    (t[g + 1 & 3] || t[g + 2 & 3] || t[g + 3 & 3]) && (i = t, w = g);
  }
  for (; n.data !== e; ) if (r = n, !(n = n.next)) return this;
  return (o = n.next) && delete n.next, r ? (o ? r.next = o : delete r.next, this) : t ? (o ? t[g] = o : delete t[g], (n = t[0] || t[1] || t[2] || t[3]) && n === (t[3] || t[2] || t[1] || t[0]) && !n.length && (i ? i[w] = n : this._root = n), this) : (this._root = o, this);
}
function _o(e) {
  for (var t = 0, n = e.length; t < n; ++t) this.remove(e[t]);
  return this;
}
function vo() {
  return this._root;
}
function bo() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length) do
      ++e;
    while (t = t.next);
  }), e;
}
function To(e) {
  var t = [], n, i = this._root, r, o, a, s, c;
  for (i && t.push(new vt(i, this._x0, this._y0, this._x1, this._y1)); n = t.pop(); )
    if (!e(i = n.node, o = n.x0, a = n.y0, s = n.x1, c = n.y1) && i.length) {
      var l = (o + s) / 2, f = (a + c) / 2;
      (r = i[3]) && t.push(new vt(r, l, f, s, c)), (r = i[2]) && t.push(new vt(r, o, f, l, c)), (r = i[1]) && t.push(new vt(r, l, a, s, f)), (r = i[0]) && t.push(new vt(r, o, a, l, f));
    }
  return this;
}
function wo(e) {
  var t = [], n = [], i;
  for (this._root && t.push(new vt(this._root, this._x0, this._y0, this._x1, this._y1)); i = t.pop(); ) {
    var r = i.node;
    if (r.length) {
      var o, a = i.x0, s = i.y0, c = i.x1, l = i.y1, f = (a + c) / 2, v = (s + l) / 2;
      (o = r[0]) && t.push(new vt(o, a, s, f, v)), (o = r[1]) && t.push(new vt(o, f, s, c, v)), (o = r[2]) && t.push(new vt(o, a, v, f, l)), (o = r[3]) && t.push(new vt(o, f, v, c, l));
    }
    n.push(i);
  }
  for (; i = n.pop(); )
    e(i.node, i.x0, i.y0, i.x1, i.y1);
  return this;
}
function So(e) {
  return e[0];
}
function Ao(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function Eo(e) {
  return e[1];
}
function xo(e) {
  return arguments.length ? (this._y = e, this) : this._y;
}
function hi(e, t, n) {
  var i = new fi(t ?? So, n ?? Eo, NaN, NaN, NaN, NaN);
  return e == null ? i : i.addAll(e);
}
function fi(e, t, n, i, r, o) {
  this._x = e, this._y = t, this._x0 = n, this._y0 = i, this._x1 = r, this._y1 = o, this._root = void 0;
}
function Ai(e) {
  for (var t = { data: e.data }, n = t; e = e.next; ) n = n.next = { data: e.data };
  return t;
}
var Tt = hi.prototype = fi.prototype;
Tt.copy = function() {
  var e = new fi(this._x, this._y, this._x0, this._y0, this._x1, this._y1), t = this._root, n, i;
  if (!t) return e;
  if (!t.length) return e._root = Ai(t), e;
  for (n = [{ source: t, target: e._root = new Array(4) }]; t = n.pop(); )
    for (var r = 0; r < 4; ++r)
      (i = t.source[r]) && (i.length ? n.push({ source: i, target: t.target[r] = new Array(4) }) : t.target[r] = Ai(i));
  return e;
};
Tt.add = uo;
Tt.addAll = ho;
Tt.cover = fo;
Tt.data = po;
Tt.extent = go;
Tt.find = mo;
Tt.remove = yo;
Tt.removeAll = _o;
Tt.root = vo;
Tt.size = bo;
Tt.visit = To;
Tt.visitAfter = wo;
Tt.x = Ao;
Tt.y = xo;
function dt(e) {
  return function() {
    return e;
  };
}
function re(e) {
  return (e() - 0.5) * 1e-6;
}
function No(e) {
  return e.x + e.vx;
}
function Mo(e) {
  return e.y + e.vy;
}
function Ro(e) {
  var t, n, i, r = 1, o = 1;
  typeof e != "function" && (e = dt(e == null ? 1 : +e));
  function a() {
    for (var l, f = t.length, v, d, m, S, b, g, w = 0; w < o; ++w)
      for (v = hi(t, No, Mo).visitAfter(s), l = 0; l < f; ++l)
        d = t[l], b = n[d.index], g = b * b, m = d.x + d.vx, S = d.y + d.vy, v.visit(_);
    function _(M, y, D, O, B) {
      var P = M.data, L = M.r, z = b + L;
      if (P) {
        if (P.index > d.index) {
          var Y = m - P.x - P.vx, nt = S - P.y - P.vy, N = Y * Y + nt * nt;
          N < z * z && (Y === 0 && (Y = re(i), N += Y * Y), nt === 0 && (nt = re(i), N += nt * nt), N = (z - (N = Math.sqrt(N))) / N * r, d.vx += (Y *= N) * (z = (L *= L) / (g + L)), d.vy += (nt *= N) * z, P.vx -= Y * (z = 1 - z), P.vy -= nt * z);
        }
        return;
      }
      return y > m + z || O < m - z || D > S + z || B < S - z;
    }
  }
  function s(l) {
    if (l.data) return l.r = n[l.data.index];
    for (var f = l.r = 0; f < 4; ++f)
      l[f] && l[f].r > l.r && (l.r = l[f].r);
  }
  function c() {
    if (t) {
      var l, f = t.length, v;
      for (n = new Array(f), l = 0; l < f; ++l) v = t[l], n[v.index] = +e(v, l, t);
    }
  }
  return a.initialize = function(l, f) {
    t = l, i = f, c();
  }, a.iterations = function(l) {
    return arguments.length ? (o = +l, a) : o;
  }, a.strength = function(l) {
    return arguments.length ? (r = +l, a) : r;
  }, a.radius = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : dt(+l), c(), a) : e;
  }, a;
}
function Io(e) {
  return e.index;
}
function Ei(e, t) {
  var n = e.get(t);
  if (!n) throw new Error("node not found: " + t);
  return n;
}
function Do(e) {
  var t = Io, n = v, i, r = dt(30), o, a, s, c, l, f = 1;
  e == null && (e = []);
  function v(g) {
    return 1 / Math.min(s[g.source.index], s[g.target.index]);
  }
  function d(g) {
    for (var w = 0, _ = e.length; w < f; ++w)
      for (var M = 0, y, D, O, B, P, L, z; M < _; ++M)
        y = e[M], D = y.source, O = y.target, B = O.x + O.vx - D.x - D.vx || re(l), P = O.y + O.vy - D.y - D.vy || re(l), L = Math.sqrt(B * B + P * P), L = (L - o[M]) / L * g * i[M], B *= L, P *= L, O.vx -= B * (z = c[M]), O.vy -= P * z, D.vx += B * (z = 1 - z), D.vy += P * z;
  }
  function m() {
    if (a) {
      var g, w = a.length, _ = e.length, M = new Map(a.map((D, O) => [t(D, O, a), D])), y;
      for (g = 0, s = new Array(w); g < _; ++g)
        y = e[g], y.index = g, typeof y.source != "object" && (y.source = Ei(M, y.source)), typeof y.target != "object" && (y.target = Ei(M, y.target)), s[y.source.index] = (s[y.source.index] || 0) + 1, s[y.target.index] = (s[y.target.index] || 0) + 1;
      for (g = 0, c = new Array(_); g < _; ++g)
        y = e[g], c[g] = s[y.source.index] / (s[y.source.index] + s[y.target.index]);
      i = new Array(_), S(), o = new Array(_), b();
    }
  }
  function S() {
    if (a)
      for (var g = 0, w = e.length; g < w; ++g)
        i[g] = +n(e[g], g, e);
  }
  function b() {
    if (a)
      for (var g = 0, w = e.length; g < w; ++g)
        o[g] = +r(e[g], g, e);
  }
  return d.initialize = function(g, w) {
    a = g, l = w, m();
  }, d.links = function(g) {
    return arguments.length ? (e = g, m(), d) : e;
  }, d.id = function(g) {
    return arguments.length ? (t = g, d) : t;
  }, d.iterations = function(g) {
    return arguments.length ? (f = +g, d) : f;
  }, d.strength = function(g) {
    return arguments.length ? (n = typeof g == "function" ? g : dt(+g), S(), d) : n;
  }, d.distance = function(g) {
    return arguments.length ? (r = typeof g == "function" ? g : dt(+g), b(), d) : r;
  }, d;
}
var Co = { value: () => {
} };
function di() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new mn(n);
}
function mn(e) {
  this._ = e;
}
function Oo(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", r = n.indexOf(".");
    if (r >= 0 && (i = n.slice(r + 1), n = n.slice(0, r)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
mn.prototype = di.prototype = { constructor: mn, on: function(e, t) {
  var n = this._, i = Oo(e + "", n), r, o = -1, a = i.length;
  if (arguments.length < 2) {
    for (; ++o < a; ) if ((r = (e = i[o]).type) && (r = ko(n[r], e.name))) return r;
    return;
  }
  if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
  for (; ++o < a; )
    if (r = (e = i[o]).type) n[r] = xi(n[r], e.name, t);
    else if (t == null) for (r in n) n[r] = xi(n[r], e.name, null);
  return this;
}, copy: function() {
  var e = {}, t = this._;
  for (var n in t) e[n] = t[n].slice();
  return new mn(e);
}, call: function(e, t) {
  if ((r = arguments.length - 2) > 0) for (var n = new Array(r), i = 0, r, o; i < r; ++i) n[i] = arguments[i + 2];
  if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
  for (o = this._[e], i = 0, r = o.length; i < r; ++i) o[i].value.apply(t, n);
}, apply: function(e, t, n) {
  if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
  for (var i = this._[e], r = 0, o = i.length; r < o; ++r) i[r].value.apply(t, n);
} };
function ko(e, t) {
  for (var n = 0, i = e.length, r; n < i; ++n)
    if ((r = e[n]).name === t)
      return r.value;
}
function xi(e, t, n) {
  for (var i = 0, r = e.length; i < r; ++i)
    if (e[i].name === t) {
      e[i] = Co, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var we = 0, je = 0, ze = 0, ur = 1e3, vn, He, bn = 0, he = 0, Rn = 0, Ve = typeof performance == "object" && performance.now ? performance : Date, hr = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function fr() {
  return he || (hr(Lo), he = Ve.now() + Rn);
}
function Lo() {
  he = 0;
}
function ri() {
  this._call = this._time = this._next = null;
}
ri.prototype = dr.prototype = { constructor: ri, restart: function(e, t, n) {
  if (typeof e != "function") throw new TypeError("callback is not a function");
  n = (n == null ? fr() : +n) + (t == null ? 0 : +t), !this._next && He !== this && (He ? He._next = this : vn = this, He = this), this._call = e, this._time = n, oi();
}, stop: function() {
  this._call && (this._call = null, this._time = 1 / 0, oi());
} };
function dr(e, t, n) {
  var i = new ri();
  return i.restart(e, t, n), i;
}
function Fo() {
  fr(), ++we;
  for (var e = vn, t; e; )
    (t = he - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --we;
}
function Ni() {
  he = (bn = Ve.now()) + Rn, we = je = 0;
  try {
    Fo();
  } finally {
    we = 0, zo(), he = 0;
  }
}
function Po() {
  var e = Ve.now(), t = e - bn;
  t > ur && (Rn -= t, bn = e);
}
function zo() {
  for (var e, t = vn, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : vn = n);
  He = e, oi(i);
}
function oi(e) {
  if (!we) {
    je && (je = clearTimeout(je));
    var t = e - he;
    t > 24 ? (e < 1 / 0 && (je = setTimeout(Ni, e - Ve.now() - Rn)), ze && (ze = clearInterval(ze))) : (ze || (bn = Ve.now(), ze = setInterval(Po, ur)), we = 1, hr(Ni));
  }
}
const Bo = 1664525, Go = 1013904223, Mi = 4294967296;
function Uo() {
  let e = 1;
  return () => (e = (Bo * e + Go) % Mi) / Mi;
}
function jo(e) {
  return e.x;
}
function Ho(e) {
  return e.y;
}
var Wo = 10, Ko = Math.PI * (3 - Math.sqrt(5));
function Vo(e) {
  var t, n = 1, i = 1e-3, r = 1 - Math.pow(i, 1 / 300), o = 0, a = 0.6, s = /* @__PURE__ */ new Map(), c = dr(v), l = di("tick", "end"), f = Uo();
  e == null && (e = []);
  function v() {
    d(), l.call("tick", t), n < i && (c.stop(), l.call("end", t));
  }
  function d(b) {
    var g, w = e.length, _;
    b === void 0 && (b = 1);
    for (var M = 0; M < b; ++M)
      for (n += (o - n) * r, s.forEach(function(y) {
        y(n);
      }), g = 0; g < w; ++g)
        _ = e[g], _.fx == null ? _.x += _.vx *= a : (_.x = _.fx, _.vx = 0), _.fy == null ? _.y += _.vy *= a : (_.y = _.fy, _.vy = 0);
    return t;
  }
  function m() {
    for (var b = 0, g = e.length, w; b < g; ++b) {
      if (w = e[b], w.index = b, w.fx != null && (w.x = w.fx), w.fy != null && (w.y = w.fy), isNaN(w.x) || isNaN(w.y)) {
        var _ = Wo * Math.sqrt(0.5 + b), M = b * Ko;
        w.x = _ * Math.cos(M), w.y = _ * Math.sin(M);
      }
      (isNaN(w.vx) || isNaN(w.vy)) && (w.vx = w.vy = 0);
    }
  }
  function S(b) {
    return b.initialize && b.initialize(e, f), b;
  }
  return m(), t = { tick: d, restart: function() {
    return c.restart(v), t;
  }, stop: function() {
    return c.stop(), t;
  }, nodes: function(b) {
    return arguments.length ? (e = b, m(), s.forEach(S), t) : e;
  }, alpha: function(b) {
    return arguments.length ? (n = +b, t) : n;
  }, alphaMin: function(b) {
    return arguments.length ? (i = +b, t) : i;
  }, alphaDecay: function(b) {
    return arguments.length ? (r = +b, t) : +r;
  }, alphaTarget: function(b) {
    return arguments.length ? (o = +b, t) : o;
  }, velocityDecay: function(b) {
    return arguments.length ? (a = 1 - b, t) : 1 - a;
  }, randomSource: function(b) {
    return arguments.length ? (f = b, s.forEach(S), t) : f;
  }, force: function(b, g) {
    return arguments.length > 1 ? (g == null ? s.delete(b) : s.set(b, S(g)), t) : s.get(b);
  }, find: function(b, g, w) {
    var _ = 0, M = e.length, y, D, O, B, P;
    for (w == null ? w = 1 / 0 : w *= w, _ = 0; _ < M; ++_)
      B = e[_], y = b - B.x, D = g - B.y, O = y * y + D * D, O < w && (P = B, w = O);
    return P;
  }, on: function(b, g) {
    return arguments.length > 1 ? (l.on(b, g), t) : l.on(b);
  } };
}
function $o() {
  var e, t, n, i, r = dt(-30), o, a = 1, s = 1 / 0, c = 0.81;
  function l(m) {
    var S, b = e.length, g = hi(e, jo, Ho).visitAfter(v);
    for (i = m, S = 0; S < b; ++S) t = e[S], g.visit(d);
  }
  function f() {
    if (e) {
      var m, S = e.length, b;
      for (o = new Array(S), m = 0; m < S; ++m) b = e[m], o[b.index] = +r(b, m, e);
    }
  }
  function v(m) {
    var S = 0, b, g, w = 0, _, M, y;
    if (m.length) {
      for (_ = M = y = 0; y < 4; ++y)
        (b = m[y]) && (g = Math.abs(b.value)) && (S += b.value, w += g, _ += g * b.x, M += g * b.y);
      m.x = _ / w, m.y = M / w;
    } else {
      b = m, b.x = b.data.x, b.y = b.data.y;
      do
        S += o[b.data.index];
      while (b = b.next);
    }
    m.value = S;
  }
  function d(m, S, b, g) {
    if (!m.value) return !0;
    var w = m.x - t.x, _ = m.y - t.y, M = g - S, y = w * w + _ * _;
    if (M * M / c < y)
      return y < s && (w === 0 && (w = re(n), y += w * w), _ === 0 && (_ = re(n), y += _ * _), y < a && (y = Math.sqrt(a * y)), t.vx += w * m.value * i / y, t.vy += _ * m.value * i / y), !0;
    if (m.length || y >= s) return;
    (m.data !== t || m.next) && (w === 0 && (w = re(n), y += w * w), _ === 0 && (_ = re(n), y += _ * _), y < a && (y = Math.sqrt(a * y)));
    do
      m.data !== t && (M = o[m.data.index] * i / y, t.vx += w * M, t.vy += _ * M);
    while (m = m.next);
  }
  return l.initialize = function(m, S) {
    e = m, n = S, f();
  }, l.strength = function(m) {
    return arguments.length ? (r = typeof m == "function" ? m : dt(+m), f(), l) : r;
  }, l.distanceMin = function(m) {
    return arguments.length ? (a = m * m, l) : Math.sqrt(a);
  }, l.distanceMax = function(m) {
    return arguments.length ? (s = m * m, l) : Math.sqrt(s);
  }, l.theta = function(m) {
    return arguments.length ? (c = m * m, l) : Math.sqrt(c);
  }, l;
}
function Ri(e, t, n) {
  var i, r = dt(0.1), o, a;
  typeof e != "function" && (e = dt(+e)), t == null && (t = 0), n == null && (n = 0);
  function s(l) {
    for (var f = 0, v = i.length; f < v; ++f) {
      var d = i[f], m = d.x - t || 1e-6, S = d.y - n || 1e-6, b = Math.sqrt(m * m + S * S), g = (a[f] - b) * o[f] * l / b;
      d.vx += m * g, d.vy += S * g;
    }
  }
  function c() {
    if (i) {
      var l, f = i.length;
      for (o = new Array(f), a = new Array(f), l = 0; l < f; ++l)
        a[l] = +e(i[l], l, i), o[l] = isNaN(a[l]) ? 0 : +r(i[l], l, i);
    }
  }
  return s.initialize = function(l) {
    i = l, c();
  }, s.strength = function(l) {
    return arguments.length ? (r = typeof l == "function" ? l : dt(+l), c(), s) : r;
  }, s.radius = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : dt(+l), c(), s) : e;
  }, s.x = function(l) {
    return arguments.length ? (t = +l, s) : t;
  }, s.y = function(l) {
    return arguments.length ? (n = +l, s) : n;
  }, s;
}
function Ii(e) {
  var t = dt(0.1), n, i, r;
  typeof e != "function" && (e = dt(e == null ? 0 : +e));
  function o(s) {
    for (var c = 0, l = n.length, f; c < l; ++c)
      f = n[c], f.vx += (r[c] - f.x) * i[c] * s;
  }
  function a() {
    if (n) {
      var s, c = n.length;
      for (i = new Array(c), r = new Array(c), s = 0; s < c; ++s)
        i[s] = isNaN(r[s] = +e(n[s], s, n)) ? 0 : +t(n[s], s, n);
    }
  }
  return o.initialize = function(s) {
    n = s, a();
  }, o.strength = function(s) {
    return arguments.length ? (t = typeof s == "function" ? s : dt(+s), a(), o) : t;
  }, o.x = function(s) {
    return arguments.length ? (e = typeof s == "function" ? s : dt(+s), a(), o) : e;
  }, o;
}
function Di(e) {
  var t = dt(0.1), n, i, r;
  typeof e != "function" && (e = dt(e == null ? 0 : +e));
  function o(s) {
    for (var c = 0, l = n.length, f; c < l; ++c)
      f = n[c], f.vy += (r[c] - f.y) * i[c] * s;
  }
  function a() {
    if (n) {
      var s, c = n.length;
      for (i = new Array(c), r = new Array(c), s = 0; s < c; ++s)
        i[s] = isNaN(r[s] = +e(n[s], s, n)) ? 0 : +t(n[s], s, n);
    }
  }
  return o.initialize = function(s) {
    n = s, a();
  }, o.strength = function(s) {
    return arguments.length ? (t = typeof s == "function" ? s : dt(+s), a(), o) : t;
  }, o.y = function(s) {
    return arguments.length ? (e = typeof s == "function" ? s : dt(+s), a(), o) : e;
  }, o;
}
function Yo(e = 0, t = 0, n = 1e-3) {
  let i = [], r;
  function o() {
    r = typeof n == "function" ? n : () => n;
  }
  function a(s) {
    for (let c = 0, l = i.length; c < l; ++c) {
      const f = i[c], v = r(f, c, i);
      f.vx != null && f.x != null && (f.vx -= (f.x - e) * v * s), f.vy != null && f.y != null && (f.vy -= (f.y - t) * v * s);
    }
  }
  return a.initialize = (s) => {
    i = s, o();
  }, a.x = function(s) {
    return arguments.length ? (e = s, a) : e;
  }, a.y = function(s) {
    return arguments.length ? (t = s, a) : t;
  }, a.strength = function(s) {
    return arguments.length ? (n = s, o(), a) : n;
  }, a;
}
var si = "http://www.w3.org/1999/xhtml";
const Ci = { svg: "http://www.w3.org/2000/svg", xhtml: si, xlink: "http://www.w3.org/1999/xlink", xml: "http://www.w3.org/XML/1998/namespace", xmlns: "http://www.w3.org/2000/xmlns/" };
function pr(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Ci.hasOwnProperty(t) ? { space: Ci[t], local: e } : e;
}
function qo(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === si && t.documentElement.namespaceURI === si ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function Xo(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function gr(e) {
  var t = pr(e);
  return (t.local ? Xo : qo)(t);
}
function Zo() {
}
function mr(e) {
  return e == null ? Zo : function() {
    return this.querySelector(e);
  };
}
function Qo(e) {
  typeof e != "function" && (e = mr(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var o = t[r], a = o.length, s = i[r] = new Array(a), c, l, f = 0; f < a; ++f)
      (c = o[f]) && (l = e.call(c, c.__data__, f, o)) && ("__data__" in c && (l.__data__ = c.__data__), s[f] = l);
  return new It(i, this._parents);
}
function Jo(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function ts() {
  return [];
}
function es(e) {
  return e == null ? ts : function() {
    return this.querySelectorAll(e);
  };
}
function ns(e) {
  return function() {
    return Jo(e.apply(this, arguments));
  };
}
function is(e) {
  typeof e == "function" ? e = ns(e) : e = es(e);
  for (var t = this._groups, n = t.length, i = [], r = [], o = 0; o < n; ++o)
    for (var a = t[o], s = a.length, c, l = 0; l < s; ++l)
      (c = a[l]) && (i.push(e.call(c, c.__data__, l, a)), r.push(c));
  return new It(i, r);
}
function rs(e) {
  return function() {
    return this.matches(e);
  };
}
function yr(e) {
  return function(t) {
    return t.matches(e);
  };
}
var os = Array.prototype.find;
function ss(e) {
  return function() {
    return os.call(this.children, e);
  };
}
function as() {
  return this.firstElementChild;
}
function ls(e) {
  return this.select(e == null ? as : ss(typeof e == "function" ? e : yr(e)));
}
var cs = Array.prototype.filter;
function us() {
  return Array.from(this.children);
}
function hs(e) {
  return function() {
    return cs.call(this.children, e);
  };
}
function fs(e) {
  return this.selectAll(e == null ? us : hs(typeof e == "function" ? e : yr(e)));
}
function ds(e) {
  typeof e != "function" && (e = rs(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var o = t[r], a = o.length, s = i[r] = [], c, l = 0; l < a; ++l)
      (c = o[l]) && e.call(c, c.__data__, l, o) && s.push(c);
  return new It(i, this._parents);
}
function _r(e) {
  return new Array(e.length);
}
function ps() {
  return new It(this._enter || this._groups.map(_r), this._parents);
}
function Tn(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Tn.prototype = { constructor: Tn, appendChild: function(e) {
  return this._parent.insertBefore(e, this._next);
}, insertBefore: function(e, t) {
  return this._parent.insertBefore(e, t);
}, querySelector: function(e) {
  return this._parent.querySelector(e);
}, querySelectorAll: function(e) {
  return this._parent.querySelectorAll(e);
} };
function gs(e) {
  return function() {
    return e;
  };
}
function ms(e, t, n, i, r, o) {
  for (var a = 0, s, c = t.length, l = o.length; a < l; ++a)
    (s = t[a]) ? (s.__data__ = o[a], i[a] = s) : n[a] = new Tn(e, o[a]);
  for (; a < c; ++a)
    (s = t[a]) && (r[a] = s);
}
function ys(e, t, n, i, r, o, a) {
  var s, c, l = /* @__PURE__ */ new Map(), f = t.length, v = o.length, d = new Array(f), m;
  for (s = 0; s < f; ++s)
    (c = t[s]) && (d[s] = m = a.call(c, c.__data__, s, t) + "", l.has(m) ? r[s] = c : l.set(m, c));
  for (s = 0; s < v; ++s)
    m = a.call(e, o[s], s, o) + "", (c = l.get(m)) ? (i[s] = c, c.__data__ = o[s], l.delete(m)) : n[s] = new Tn(e, o[s]);
  for (s = 0; s < f; ++s)
    (c = t[s]) && l.get(d[s]) === c && (r[s] = c);
}
function _s(e) {
  return e.__data__;
}
function vs(e, t) {
  if (!arguments.length) return Array.from(this, _s);
  var n = t ? ys : ms, i = this._parents, r = this._groups;
  typeof e != "function" && (e = gs(e));
  for (var o = r.length, a = new Array(o), s = new Array(o), c = new Array(o), l = 0; l < o; ++l) {
    var f = i[l], v = r[l], d = v.length, m = bs(e.call(f, f && f.__data__, l, i)), S = m.length, b = s[l] = new Array(S), g = a[l] = new Array(S), w = c[l] = new Array(d);
    n(f, v, b, g, w, m, t);
    for (var _ = 0, M = 0, y, D; _ < S; ++_)
      if (y = b[_]) {
        for (_ >= M && (M = _ + 1); !(D = g[M]) && ++M < S; ) ;
        y._next = D || null;
      }
  }
  return a = new It(a, i), a._enter = s, a._exit = c, a;
}
function bs(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Ts() {
  return new It(this._exit || this._groups.map(_r), this._parents);
}
function ws(e, t, n) {
  var i = this.enter(), r = this, o = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (r = t(r), r && (r = r.selection())), n == null ? o.remove() : n(o), i && r ? i.merge(r).order() : r;
}
function Ss(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, r = n.length, o = i.length, a = Math.min(r, o), s = new Array(r), c = 0; c < a; ++c)
    for (var l = n[c], f = i[c], v = l.length, d = s[c] = new Array(v), m, S = 0; S < v; ++S)
      (m = l[S] || f[S]) && (d[S] = m);
  for (; c < r; ++c)
    s[c] = n[c];
  return new It(s, this._parents);
}
function As() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], r = i.length - 1, o = i[r], a; --r >= 0; )
      (a = i[r]) && (o && a.compareDocumentPosition(o) ^ 4 && o.parentNode.insertBefore(a, o), o = a);
  return this;
}
function Es(e) {
  e || (e = xs);
  function t(v, d) {
    return v && d ? e(v.__data__, d.__data__) : !v - !d;
  }
  for (var n = this._groups, i = n.length, r = new Array(i), o = 0; o < i; ++o) {
    for (var a = n[o], s = a.length, c = r[o] = new Array(s), l, f = 0; f < s; ++f)
      (l = a[f]) && (c[f] = l);
    c.sort(t);
  }
  return new It(r, this._parents).order();
}
function xs(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function Ns() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function Ms() {
  return Array.from(this);
}
function Rs() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, o = i.length; r < o; ++r) {
      var a = i[r];
      if (a) return a;
    }
  return null;
}
function Is() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function Ds() {
  return !this.node();
}
function Cs(e) {
  for (var t = this._groups, n = 0, i = t.length; n < i; ++n)
    for (var r = t[n], o = 0, a = r.length, s; o < a; ++o)
      (s = r[o]) && e.call(s, s.__data__, o, r);
  return this;
}
function Os(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function ks(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Ls(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function Fs(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Ps(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function zs(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Bs(e, t) {
  var n = pr(e);
  if (arguments.length < 2) {
    var i = this.node();
    return n.local ? i.getAttributeNS(n.space, n.local) : i.getAttribute(n);
  }
  return this.each((t == null ? n.local ? ks : Os : typeof t == "function" ? n.local ? zs : Ps : n.local ? Fs : Ls)(n, t));
}
function vr(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Gs(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Us(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function js(e, t, n) {
  return function() {
    var i = t.apply(this, arguments);
    i == null ? this.style.removeProperty(e) : this.style.setProperty(e, i, n);
  };
}
function Hs(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Gs : typeof t == "function" ? js : Us)(e, t, n ?? "")) : Ws(this.node(), e);
}
function Ws(e, t) {
  return e.style.getPropertyValue(t) || vr(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Ks(e) {
  return function() {
    delete this[e];
  };
}
function Vs(e, t) {
  return function() {
    this[e] = t;
  };
}
function $s(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function Ys(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Ks : typeof t == "function" ? $s : Vs)(e, t)) : this.node()[e];
}
function br(e) {
  return e.trim().split(/^|\s+/);
}
function pi(e) {
  return e.classList || new Tr(e);
}
function Tr(e) {
  this._node = e, this._names = br(e.getAttribute("class") || "");
}
Tr.prototype = { add: function(e) {
  var t = this._names.indexOf(e);
  t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
}, remove: function(e) {
  var t = this._names.indexOf(e);
  t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
}, contains: function(e) {
  return this._names.indexOf(e) >= 0;
} };
function wr(e, t) {
  for (var n = pi(e), i = -1, r = t.length; ++i < r; ) n.add(t[i]);
}
function Sr(e, t) {
  for (var n = pi(e), i = -1, r = t.length; ++i < r; ) n.remove(t[i]);
}
function qs(e) {
  return function() {
    wr(this, e);
  };
}
function Xs(e) {
  return function() {
    Sr(this, e);
  };
}
function Zs(e, t) {
  return function() {
    (t.apply(this, arguments) ? wr : Sr)(this, e);
  };
}
function Qs(e, t) {
  var n = br(e + "");
  if (arguments.length < 2) {
    for (var i = pi(this.node()), r = -1, o = n.length; ++r < o; ) if (!i.contains(n[r])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? Zs : t ? qs : Xs)(n, t));
}
function Js() {
  this.textContent = "";
}
function ta(e) {
  return function() {
    this.textContent = e;
  };
}
function ea(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function na(e) {
  return arguments.length ? this.each(e == null ? Js : (typeof e == "function" ? ea : ta)(e)) : this.node().textContent;
}
function ia() {
  this.innerHTML = "";
}
function ra(e) {
  return function() {
    this.innerHTML = e;
  };
}
function oa(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function sa(e) {
  return arguments.length ? this.each(e == null ? ia : (typeof e == "function" ? oa : ra)(e)) : this.node().innerHTML;
}
function aa() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function la() {
  return this.each(aa);
}
function ca() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function ua() {
  return this.each(ca);
}
function ha(e) {
  var t = typeof e == "function" ? e : gr(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function fa() {
  return null;
}
function da(e, t) {
  var n = typeof e == "function" ? e : gr(e), i = t == null ? fa : typeof t == "function" ? t : mr(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), i.apply(this, arguments) || null);
  });
}
function pa() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function ga() {
  return this.each(pa);
}
function ma() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function ya() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function _a(e) {
  return this.select(e ? ya : ma);
}
function va(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function ba(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Ta(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", i = t.indexOf(".");
    return i >= 0 && (n = t.slice(i + 1), t = t.slice(0, i)), { type: t, name: n };
  });
}
function wa(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, i = -1, r = t.length, o; n < r; ++n)
        o = t[n], (!e.type || o.type === e.type) && o.name === e.name ? this.removeEventListener(o.type, o.listener, o.options) : t[++i] = o;
      ++i ? t.length = i : delete this.__on;
    }
  };
}
function Sa(e, t, n) {
  return function() {
    var i = this.__on, r, o = ba(t);
    if (i) {
      for (var a = 0, s = i.length; a < s; ++a)
        if ((r = i[a]).type === e.type && r.name === e.name) {
          this.removeEventListener(r.type, r.listener, r.options), this.addEventListener(r.type, r.listener = o, r.options = n), r.value = t;
          return;
        }
    }
    this.addEventListener(e.type, o, n), r = { type: e.type, name: e.name, value: t, listener: o, options: n }, i ? i.push(r) : this.__on = [r];
  };
}
function Aa(e, t, n) {
  var i = Ta(e + ""), r, o = i.length, a;
  if (arguments.length < 2) {
    var s = this.node().__on;
    if (s) {
      for (var c = 0, l = s.length, f; c < l; ++c)
        for (r = 0, f = s[c]; r < o; ++r)
          if ((a = i[r]).type === f.type && a.name === f.name)
            return f.value;
    }
    return;
  }
  for (s = t ? Sa : wa, r = 0; r < o; ++r) this.each(s(i[r], t, n));
  return this;
}
function Ar(e, t, n) {
  var i = vr(e), r = i.CustomEvent;
  typeof r == "function" ? r = new r(t, n) : (r = i.document.createEvent("Event"), n ? (r.initEvent(t, n.bubbles, n.cancelable), r.detail = n.detail) : r.initEvent(t, !1, !1)), e.dispatchEvent(r);
}
function Ea(e, t) {
  return function() {
    return Ar(this, e, t);
  };
}
function xa(e, t) {
  return function() {
    return Ar(this, e, t.apply(this, arguments));
  };
}
function Na(e, t) {
  return this.each((typeof t == "function" ? xa : Ea)(e, t));
}
function* Ma() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, o = i.length, a; r < o; ++r)
      (a = i[r]) && (yield a);
}
var Ra = [null];
function It(e, t) {
  this._groups = e, this._parents = t;
}
function Ia() {
  return this;
}
It.prototype = { constructor: It, select: Qo, selectAll: is, selectChild: ls, selectChildren: fs, filter: ds, data: vs, enter: ps, exit: Ts, join: ws, merge: Ss, selection: Ia, order: As, sort: Es, call: Ns, nodes: Ms, node: Rs, size: Is, empty: Ds, each: Cs, attr: Bs, style: Hs, property: Ys, classed: Qs, text: na, html: sa, raise: la, lower: ua, append: ha, insert: da, remove: ga, clone: _a, datum: va, on: Aa, dispatch: Na, [Symbol.iterator]: Ma };
function wn(e) {
  return typeof e == "string" ? new It([[document.querySelector(e)]], [document.documentElement]) : new It([[e]], Ra);
}
function Da(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Oi(e, t) {
  if (e = Da(e), t === void 0 && (t = e.currentTarget), t) {
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
const Ca = { passive: !1 }, $e = { capture: !0, passive: !1 };
function $n(e) {
  e.stopImmediatePropagation();
}
function Te(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function Oa(e) {
  var t = e.document.documentElement, n = wn(e).on("dragstart.drag", Te, $e);
  "onselectstart" in t ? n.on("selectstart.drag", Te, $e) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function ka(e, t) {
  var n = e.document.documentElement, i = wn(e).on("dragstart.drag", null);
  t && (i.on("click.drag", Te, $e), setTimeout(function() {
    i.on("click.drag", null);
  }, 0)), "onselectstart" in n ? i.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const fn = (e) => () => e;
function ai(e, { sourceEvent: t, subject: n, target: i, identifier: r, active: o, x: a, y: s, dx: c, dy: l, dispatch: f }) {
  Object.defineProperties(this, { type: { value: e, enumerable: !0, configurable: !0 }, sourceEvent: { value: t, enumerable: !0, configurable: !0 }, subject: { value: n, enumerable: !0, configurable: !0 }, target: { value: i, enumerable: !0, configurable: !0 }, identifier: { value: r, enumerable: !0, configurable: !0 }, active: { value: o, enumerable: !0, configurable: !0 }, x: { value: a, enumerable: !0, configurable: !0 }, y: { value: s, enumerable: !0, configurable: !0 }, dx: { value: c, enumerable: !0, configurable: !0 }, dy: { value: l, enumerable: !0, configurable: !0 }, _: { value: f } });
}
ai.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function La(e) {
  return !e.ctrlKey && !e.button;
}
function Fa() {
  return this.parentNode;
}
function Pa(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function za() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Ba() {
  var e = La, t = Fa, n = Pa, i = za, r = {}, o = di("start", "drag", "end"), a = 0, s, c, l, f, v = 0;
  function d(y) {
    y.on("mousedown.drag", m).filter(i).on("touchstart.drag", g).on("touchmove.drag", w, Ca).on("touchend.drag touchcancel.drag", _).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function m(y, D) {
    if (!(f || !e.call(this, y, D))) {
      var O = M(this, t.call(this, y, D), y, D, "mouse");
      O && (wn(y.view).on("mousemove.drag", S, $e).on("mouseup.drag", b, $e), Oa(y.view), $n(y), l = !1, s = y.clientX, c = y.clientY, O("start", y));
    }
  }
  function S(y) {
    if (Te(y), !l) {
      var D = y.clientX - s, O = y.clientY - c;
      l = D * D + O * O > v;
    }
    r.mouse("drag", y);
  }
  function b(y) {
    wn(y.view).on("mousemove.drag mouseup.drag", null), ka(y.view, l), Te(y), r.mouse("end", y);
  }
  function g(y, D) {
    if (e.call(this, y, D)) {
      var O = y.changedTouches, B = t.call(this, y, D), P = O.length, L, z;
      for (L = 0; L < P; ++L)
        (z = M(this, B, y, D, O[L].identifier, O[L])) && ($n(y), z("start", y, O[L]));
    }
  }
  function w(y) {
    var D = y.changedTouches, O = D.length, B, P;
    for (B = 0; B < O; ++B)
      (P = r[D[B].identifier]) && (Te(y), P("drag", y, D[B]));
  }
  function _(y) {
    var D = y.changedTouches, O = D.length, B, P;
    for (f && clearTimeout(f), f = setTimeout(function() {
      f = null;
    }, 500), B = 0; B < O; ++B)
      (P = r[D[B].identifier]) && ($n(y), P("end", y, D[B]));
  }
  function M(y, D, O, B, P, L) {
    var z = o.copy(), Y = Oi(L || O, D), nt, N, C;
    if ((C = n.call(y, new ai("beforestart", { sourceEvent: O, target: d, identifier: P, active: a, x: Y[0], y: Y[1], dx: 0, dy: 0, dispatch: z }), B)) != null)
      return nt = C.x - Y[0] || 0, N = C.y - Y[1] || 0, function K(W, R, G) {
        var Z = Y, ct;
        switch (W) {
          case "start":
            r[P] = K, ct = a++;
            break;
          case "end":
            delete r[P], --a;
          case "drag":
            Y = Oi(G || R, D), ct = a;
            break;
        }
        z.call(W, y, new ai(W, { sourceEvent: R, subject: C, target: d, identifier: P, active: ct, x: Y[0] + nt, y: Y[1] + N, dx: Y[0] - Z[0], dy: Y[1] - Z[1], dispatch: z }), B);
      };
  }
  return d.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : fn(!!y), d) : e;
  }, d.container = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : fn(y), d) : t;
  }, d.subject = function(y) {
    return arguments.length ? (n = typeof y == "function" ? y : fn(y), d) : n;
  }, d.touchable = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : fn(!!y), d) : i;
  }, d.on = function() {
    var y = o.on.apply(o, arguments);
    return y === o ? d : y;
  }, d.clickDistance = function(y) {
    return arguments.length ? (v = (y = +y) * y, d) : Math.sqrt(v);
  }, d;
}
const ki = "*", gi = "seed";
/*! @license DOMPurify 3.4.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.7/LICENSE */
function Li(e, t) {
  (t == null || t > e.length) && (t = e.length);
  for (var n = 0, i = Array(t); n < t; n++) i[n] = e[n];
  return i;
}
function Ga(e) {
  if (Array.isArray(e)) return e;
}
function Ua(e, t) {
  var n = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (n != null) {
    var i, r, o, a, s = [], c = !0, l = !1;
    try {
      if (o = (n = n.call(e)).next, t !== 0) for (; !(c = (i = o.call(n)).done) && (s.push(i.value), s.length !== t); c = !0) ;
    } catch (f) {
      l = !0, r = f;
    } finally {
      try {
        if (!c && n.return != null && (a = n.return(), Object(a) !== a)) return;
      } finally {
        if (l) throw r;
      }
    }
    return s;
  }
}
function ja() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Ha(e, t) {
  return Ga(e) || Ua(e, t) || Wa(e, t) || ja();
}
function Wa(e, t) {
  if (e) {
    if (typeof e == "string") return Li(e, t);
    var n = {}.toString.call(e).slice(8, -1);
    return n === "Object" && e.constructor && (n = e.constructor.name), n === "Map" || n === "Set" ? Array.from(e) : n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? Li(e, t) : void 0;
  }
}
const Er = Object.entries, Fi = Object.setPrototypeOf, Ka = Object.isFrozen, Va = Object.getPrototypeOf, $a = Object.getOwnPropertyDescriptor;
let bt = Object.freeze, Dt = Object.seal, be = Object.create, xr = typeof Reflect < "u" && Reflect, li = xr.apply, ci = xr.construct;
bt || (bt = function(t) {
  return t;
});
Dt || (Dt = function(t) {
  return t;
});
li || (li = function(t, n) {
  for (var i = arguments.length, r = new Array(i > 2 ? i - 2 : 0), o = 2; o < i; o++)
    r[o - 2] = arguments[o];
  return t.apply(n, r);
});
ci || (ci = function(t) {
  for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
    i[r - 1] = arguments[r];
  return new t(...i);
});
const ye = ft(Array.prototype.forEach), Ya = ft(Array.prototype.lastIndexOf), Pi = ft(Array.prototype.pop), _e = ft(Array.prototype.push), qa = ft(Array.prototype.splice), _t = Array.isArray, We = ft(String.prototype.toLowerCase), Yn = ft(String.prototype.toString), zi = ft(String.prototype.match), ve = ft(String.prototype.replace), Bi = ft(String.prototype.indexOf), Xa = ft(String.prototype.trim), Za = ft(Number.prototype.toString), Qa = ft(Boolean.prototype.toString), Gi = typeof BigInt > "u" ? null : ft(BigInt.prototype.toString), Ui = typeof Symbol > "u" ? null : ft(Symbol.prototype.toString), ut = ft(Object.prototype.hasOwnProperty), Be = ft(Object.prototype.toString), pt = ft(RegExp.prototype.test), Ge = Ja(TypeError);
function ft(e) {
  return function(t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var n = arguments.length, i = new Array(n > 1 ? n - 1 : 0), r = 1; r < n; r++)
      i[r - 1] = arguments[r];
    return li(e, t, i);
  };
}
function Ja(e) {
  return function() {
    for (var t = arguments.length, n = new Array(t), i = 0; i < t; i++)
      n[i] = arguments[i];
    return ci(e, n);
  };
}
function H(e, t) {
  let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : We;
  if (Fi && Fi(e, null), !_t(t))
    return e;
  let i = t.length;
  for (; i--; ) {
    let r = t[i];
    if (typeof r == "string") {
      const o = n(r);
      o !== r && (Ka(t) || (t[i] = o), r = o);
    }
    e[r] = !0;
  }
  return e;
}
function tl(e) {
  for (let t = 0; t < e.length; t++)
    ut(e, t) || (e[t] = null);
  return e;
}
function mt(e) {
  const t = be(null);
  for (const i of Er(e)) {
    var n = Ha(i, 2);
    const r = n[0], o = n[1];
    ut(e, r) && (_t(o) ? t[r] = tl(o) : o && typeof o == "object" && o.constructor === Object ? t[r] = mt(o) : t[r] = o);
  }
  return t;
}
function el(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Za(e);
    case "boolean":
      return Qa(e);
    case "bigint":
      return Gi ? Gi(e) : "0";
    case "symbol":
      return Ui ? Ui(e) : "Symbol()";
    case "undefined":
      return Be(e);
    case "function":
    case "object": {
      if (e === null)
        return Be(e);
      const t = e, n = Ut(t, "toString");
      if (typeof n == "function") {
        const i = n(t);
        return typeof i == "string" ? i : Be(i);
      }
      return Be(e);
    }
    default:
      return Be(e);
  }
}
function Ut(e, t) {
  for (; e !== null; ) {
    const i = $a(e, t);
    if (i) {
      if (i.get)
        return ft(i.get);
      if (typeof i.value == "function")
        return ft(i.value);
    }
    e = Va(e);
  }
  function n() {
    return null;
  }
  return n;
}
function nl(e) {
  try {
    return pt(e, ""), !0;
  } catch {
    return !1;
  }
}
const ji = bt(["a", "abbr", "acronym", "address", "area", "article", "aside", "audio", "b", "bdi", "bdo", "big", "blink", "blockquote", "body", "br", "button", "canvas", "caption", "center", "cite", "code", "col", "colgroup", "content", "data", "datalist", "dd", "decorator", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt", "element", "em", "fieldset", "figcaption", "figure", "font", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "img", "input", "ins", "kbd", "label", "legend", "li", "main", "map", "mark", "marquee", "menu", "menuitem", "meter", "nav", "nobr", "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "search", "section", "select", "shadow", "slot", "small", "source", "spacer", "span", "strike", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "tt", "u", "ul", "var", "video", "wbr"]), qn = bt(["svg", "a", "altglyph", "altglyphdef", "altglyphitem", "animatecolor", "animatemotion", "animatetransform", "circle", "clippath", "defs", "desc", "ellipse", "enterkeyhint", "exportparts", "filter", "font", "g", "glyph", "glyphref", "hkern", "image", "inputmode", "line", "lineargradient", "marker", "mask", "metadata", "mpath", "part", "path", "pattern", "polygon", "polyline", "radialgradient", "rect", "stop", "style", "switch", "symbol", "text", "textpath", "title", "tref", "tspan", "view", "vkern"]), Xn = bt(["feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence"]), il = bt(["animate", "color-profile", "cursor", "discard", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "foreignobject", "hatch", "hatchpath", "mesh", "meshgradient", "meshpatch", "meshrow", "missing-glyph", "script", "set", "solidcolor", "unknown", "use"]), Zn = bt(["math", "menclose", "merror", "mfenced", "mfrac", "mglyph", "mi", "mlabeledtr", "mmultiscripts", "mn", "mo", "mover", "mpadded", "mphantom", "mroot", "mrow", "ms", "mspace", "msqrt", "mstyle", "msub", "msup", "msubsup", "mtable", "mtd", "mtext", "mtr", "munder", "munderover", "mprescripts"]), rl = bt(["maction", "maligngroup", "malignmark", "mlongdiv", "mscarries", "mscarry", "msgroup", "mstack", "msline", "msrow", "semantics", "annotation", "annotation-xml", "mprescripts", "none"]), Hi = bt(["#text"]), Wi = bt(["accept", "action", "align", "alt", "autocapitalize", "autocomplete", "autopictureinpicture", "autoplay", "background", "bgcolor", "border", "capture", "cellpadding", "cellspacing", "checked", "cite", "class", "clear", "color", "cols", "colspan", "command", "commandfor", "controls", "controlslist", "coords", "crossorigin", "datetime", "decoding", "default", "dir", "disabled", "disablepictureinpicture", "disableremoteplayback", "download", "draggable", "enctype", "enterkeyhint", "exportparts", "face", "for", "headers", "height", "hidden", "high", "href", "hreflang", "id", "inert", "inputmode", "integrity", "ismap", "kind", "label", "lang", "list", "loading", "loop", "low", "max", "maxlength", "media", "method", "min", "minlength", "multiple", "muted", "name", "nonce", "noshade", "novalidate", "nowrap", "open", "optimum", "part", "pattern", "placeholder", "playsinline", "popover", "popovertarget", "popovertargetaction", "poster", "preload", "pubdate", "radiogroup", "readonly", "rel", "required", "rev", "reversed", "role", "rows", "rowspan", "spellcheck", "scope", "selected", "shape", "size", "sizes", "slot", "span", "srclang", "start", "src", "srcset", "step", "style", "summary", "tabindex", "title", "translate", "type", "usemap", "valign", "value", "width", "wrap", "xmlns"]), Qn = bt(["accent-height", "accumulate", "additive", "alignment-baseline", "amplitude", "ascent", "attributename", "attributetype", "azimuth", "basefrequency", "baseline-shift", "begin", "bias", "by", "class", "clip", "clippathunits", "clip-path", "clip-rule", "color", "color-interpolation", "color-interpolation-filters", "color-profile", "color-rendering", "cx", "cy", "d", "dx", "dy", "diffuseconstant", "direction", "display", "divisor", "dur", "edgemode", "elevation", "end", "exponent", "fill", "fill-opacity", "fill-rule", "filter", "filterunits", "flood-color", "flood-opacity", "font-family", "font-size", "font-size-adjust", "font-stretch", "font-style", "font-variant", "font-weight", "fx", "fy", "g1", "g2", "glyph-name", "glyphref", "gradientunits", "gradienttransform", "height", "href", "id", "image-rendering", "in", "in2", "intercept", "k", "k1", "k2", "k3", "k4", "kerning", "keypoints", "keysplines", "keytimes", "lang", "lengthadjust", "letter-spacing", "kernelmatrix", "kernelunitlength", "lighting-color", "local", "marker-end", "marker-mid", "marker-start", "markerheight", "markerunits", "markerwidth", "maskcontentunits", "maskunits", "max", "mask", "mask-type", "media", "method", "mode", "min", "name", "numoctaves", "offset", "operator", "opacity", "order", "orient", "orientation", "origin", "overflow", "paint-order", "path", "pathlength", "patterncontentunits", "patterntransform", "patternunits", "points", "preservealpha", "preserveaspectratio", "primitiveunits", "r", "rx", "ry", "radius", "refx", "refy", "repeatcount", "repeatdur", "restart", "result", "rotate", "scale", "seed", "shape-rendering", "slope", "specularconstant", "specularexponent", "spreadmethod", "startoffset", "stddeviation", "stitchtiles", "stop-color", "stop-opacity", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke", "stroke-width", "style", "surfacescale", "systemlanguage", "tabindex", "tablevalues", "targetx", "targety", "transform", "transform-origin", "text-anchor", "text-decoration", "text-rendering", "textlength", "type", "u1", "u2", "unicode", "values", "viewbox", "visibility", "version", "vert-adv-y", "vert-origin-x", "vert-origin-y", "width", "word-spacing", "wrap", "writing-mode", "xchannelselector", "ychannelselector", "x", "x1", "x2", "xmlns", "y", "y1", "y2", "z", "zoomandpan"]), Ki = bt(["accent", "accentunder", "align", "bevelled", "close", "columnalign", "columnlines", "columnspacing", "columnspan", "denomalign", "depth", "dir", "display", "displaystyle", "encoding", "fence", "frame", "height", "href", "id", "largeop", "length", "linethickness", "lquote", "lspace", "mathbackground", "mathcolor", "mathsize", "mathvariant", "maxsize", "minsize", "movablelimits", "notation", "numalign", "open", "rowalign", "rowlines", "rowspacing", "rowspan", "rspace", "rquote", "scriptlevel", "scriptminsize", "scriptsizemultiplier", "selection", "separator", "separators", "stretchy", "subscriptshift", "supscriptshift", "symmetric", "voffset", "width", "xmlns"]), dn = bt(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]), ol = Dt(/{{[\w\W]*|^[\w\W]*}}/g), sl = Dt(/<%[\w\W]*|^[\w\W]*%>/g), al = Dt(/\${[\w\W]*/g), ll = Dt(/^data-[\-\w.\u00B7-\uFFFF]+$/), cl = Dt(/^aria-[\-\w]+$/), Vi = Dt(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i), ul = Dt(/^(?:\w+script|data):/i), hl = Dt(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g), fl = Dt(/^html$/i), dl = Dt(/^[a-z][.\w]*(-[.\w]+)+$/i), Gt = { element: 1, attribute: 2, text: 3, cdataSection: 4, entityReference: 5, entityNode: 6, progressingInstruction: 7, comment: 8, document: 9, documentType: 10, documentFragment: 11, notation: 12 }, pl = function() {
  return typeof window > "u" ? null : window;
}, gl = function(t, n) {
  if (typeof t != "object" || typeof t.createPolicy != "function")
    return null;
  let i = null;
  const r = "data-tt-policy-suffix";
  n && n.hasAttribute(r) && (i = n.getAttribute(r));
  const o = "dompurify" + (i ? "#" + i : "");
  try {
    return t.createPolicy(o, { createHTML(a) {
      return a;
    }, createScriptURL(a) {
      return a;
    } });
  } catch {
    return console.warn("TrustedTypes policy " + o + " could not be created."), null;
  }
}, $i = function() {
  return { afterSanitizeAttributes: [], afterSanitizeElements: [], afterSanitizeShadowDOM: [], beforeSanitizeAttributes: [], beforeSanitizeElements: [], beforeSanitizeShadowDOM: [], uponSanitizeAttribute: [], uponSanitizeElement: [], uponSanitizeShadowNode: [] };
};
function Nr() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : pl();
  const t = (k) => Nr(k);
  if (t.version = "3.4.7", t.removed = [], !e || !e.document || e.document.nodeType !== Gt.document || !e.Element)
    return t.isSupported = !1, t;
  let n = e.document;
  const i = n, r = i.currentScript;
  e.DocumentFragment;
  const o = e.HTMLTemplateElement, a = e.Node, s = e.Element, c = e.NodeFilter, l = e.NamedNodeMap;
  l === void 0 && (e.NamedNodeMap || e.MozNamedAttrMap), e.HTMLFormElement;
  const f = e.DOMParser, v = e.trustedTypes, d = s.prototype, m = Ut(d, "cloneNode"), S = Ut(d, "remove"), b = Ut(d, "nextSibling"), g = Ut(d, "childNodes"), w = Ut(d, "parentNode"), _ = Ut(d, "shadowRoot"), M = Ut(d, "attributes"), y = a && a.prototype ? Ut(a.prototype, "nodeType") : null, D = a && a.prototype ? Ut(a.prototype, "nodeName") : null;
  if (typeof o == "function") {
    const k = n.createElement("template");
    k.content && k.content.ownerDocument && (n = k.content.ownerDocument);
  }
  let O, B = "";
  const P = n, L = P.implementation, z = P.createNodeIterator, Y = P.createDocumentFragment, nt = P.getElementsByTagName, N = i.importNode;
  let C = $i();
  t.isSupported = typeof Er == "function" && typeof w == "function" && L && L.createHTMLDocument !== void 0;
  const K = ol, W = sl, R = al, G = ll, Z = cl, ct = ul, gt = hl, it = dl;
  let j = Vi, X = null;
  const Xt = H({}, [...ji, ...qn, ...Xn, ...Zn, ...Hi]);
  let J = null;
  const Zt = H({}, [...Wi, ...Qn, ...Ki, ...dn]);
  let U = Object.seal(be(null, { tagNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, allowCustomizedBuiltInElements: { writable: !0, configurable: !1, enumerable: !0, value: !1 } })), yt = null, Qt = null;
  const Ct = Object.seal(be(null, { tagCheck: { writable: !0, configurable: !1, enumerable: !0, value: null }, attributeCheck: { writable: !0, configurable: !1, enumerable: !0, value: null } }));
  let Ae = !0, Ee = !0, Xe = !1, Ze = !0, Ft = !1, oe = !0, jt = !1, xe = !1, Jt = !1, Pt = !1, Ht = !1, St = !1, Ne = !0, Me = !1;
  const Qe = "user-content-";
  let Re = !0, zt = !1, Wt = {}, At = null;
  const fe = H({}, ["annotation-xml", "audio", "colgroup", "desc", "foreignobject", "head", "iframe", "math", "mi", "mn", "mo", "ms", "mtext", "noembed", "noframes", "noscript", "plaintext", "script", "style", "svg", "template", "thead", "title", "video", "xmp"]);
  let Ie = null;
  const Je = H({}, ["audio", "video", "img", "source", "image", "track"]);
  let De = null;
  const Bt = H({}, ["alt", "class", "for", "id", "label", "name", "pattern", "placeholder", "role", "summary", "title", "value", "style", "xmlns"]), Kt = "http://www.w3.org/1998/Math/MathML", de = "http://www.w3.org/2000/svg", Et = "http://www.w3.org/1999/xhtml";
  let te = Et, pe = !1, Vt = null;
  const On = H({}, [Kt, de, Et], Yn);
  let Ot = H({}, ["mi", "mo", "mn", "ms", "mtext"]), Ce = H({}, ["annotation-xml"]);
  const kn = H({}, ["title", "style", "font", "a", "script"]);
  let se = null;
  const Ln = ["application/xhtml+xml", "text/html"], Fn = "text/html";
  let tt = null, ee = null;
  const Pn = n.createElement("form"), tn = function(h) {
    return h instanceof RegExp || h instanceof Function;
  }, Oe = function() {
    let h = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (ee && ee === h)
      return;
    (!h || typeof h != "object") && (h = {}), h = mt(h), se = Ln.indexOf(h.PARSER_MEDIA_TYPE) === -1 ? Fn : h.PARSER_MEDIA_TYPE, tt = se === "application/xhtml+xml" ? Yn : We, X = ut(h, "ALLOWED_TAGS") && _t(h.ALLOWED_TAGS) ? H({}, h.ALLOWED_TAGS, tt) : Xt, J = ut(h, "ALLOWED_ATTR") && _t(h.ALLOWED_ATTR) ? H({}, h.ALLOWED_ATTR, tt) : Zt, Vt = ut(h, "ALLOWED_NAMESPACES") && _t(h.ALLOWED_NAMESPACES) ? H({}, h.ALLOWED_NAMESPACES, Yn) : On, De = ut(h, "ADD_URI_SAFE_ATTR") && _t(h.ADD_URI_SAFE_ATTR) ? H(mt(Bt), h.ADD_URI_SAFE_ATTR, tt) : Bt, Ie = ut(h, "ADD_DATA_URI_TAGS") && _t(h.ADD_DATA_URI_TAGS) ? H(mt(Je), h.ADD_DATA_URI_TAGS, tt) : Je, At = ut(h, "FORBID_CONTENTS") && _t(h.FORBID_CONTENTS) ? H({}, h.FORBID_CONTENTS, tt) : fe, yt = ut(h, "FORBID_TAGS") && _t(h.FORBID_TAGS) ? H({}, h.FORBID_TAGS, tt) : mt({}), Qt = ut(h, "FORBID_ATTR") && _t(h.FORBID_ATTR) ? H({}, h.FORBID_ATTR, tt) : mt({}), Wt = ut(h, "USE_PROFILES") ? h.USE_PROFILES && typeof h.USE_PROFILES == "object" ? mt(h.USE_PROFILES) : h.USE_PROFILES : !1, Ae = h.ALLOW_ARIA_ATTR !== !1, Ee = h.ALLOW_DATA_ATTR !== !1, Xe = h.ALLOW_UNKNOWN_PROTOCOLS || !1, Ze = h.ALLOW_SELF_CLOSE_IN_ATTR !== !1, Ft = h.SAFE_FOR_TEMPLATES || !1, oe = h.SAFE_FOR_XML !== !1, jt = h.WHOLE_DOCUMENT || !1, Pt = h.RETURN_DOM || !1, Ht = h.RETURN_DOM_FRAGMENT || !1, St = h.RETURN_TRUSTED_TYPE || !1, Jt = h.FORCE_BODY || !1, Ne = h.SANITIZE_DOM !== !1, Me = h.SANITIZE_NAMED_PROPS || !1, Re = h.KEEP_CONTENT !== !1, zt = h.IN_PLACE || !1, j = nl(h.ALLOWED_URI_REGEXP) ? h.ALLOWED_URI_REGEXP : Vi, te = typeof h.NAMESPACE == "string" ? h.NAMESPACE : Et, Ot = ut(h, "MATHML_TEXT_INTEGRATION_POINTS") && h.MATHML_TEXT_INTEGRATION_POINTS && typeof h.MATHML_TEXT_INTEGRATION_POINTS == "object" ? mt(h.MATHML_TEXT_INTEGRATION_POINTS) : H({}, ["mi", "mo", "mn", "ms", "mtext"]), Ce = ut(h, "HTML_INTEGRATION_POINTS") && h.HTML_INTEGRATION_POINTS && typeof h.HTML_INTEGRATION_POINTS == "object" ? mt(h.HTML_INTEGRATION_POINTS) : H({}, ["annotation-xml"]);
    const A = ut(h, "CUSTOM_ELEMENT_HANDLING") && h.CUSTOM_ELEMENT_HANDLING && typeof h.CUSTOM_ELEMENT_HANDLING == "object" ? mt(h.CUSTOM_ELEMENT_HANDLING) : be(null);
    if (U = be(null), ut(A, "tagNameCheck") && tn(A.tagNameCheck) && (U.tagNameCheck = A.tagNameCheck), ut(A, "attributeNameCheck") && tn(A.attributeNameCheck) && (U.attributeNameCheck = A.attributeNameCheck), ut(A, "allowCustomizedBuiltInElements") && typeof A.allowCustomizedBuiltInElements == "boolean" && (U.allowCustomizedBuiltInElements = A.allowCustomizedBuiltInElements), Ft && (Ee = !1), Ht && (Pt = !0), Wt && (X = H({}, Hi), J = be(null), Wt.html === !0 && (H(X, ji), H(J, Wi)), Wt.svg === !0 && (H(X, qn), H(J, Qn), H(J, dn)), Wt.svgFilters === !0 && (H(X, Xn), H(J, Qn), H(J, dn)), Wt.mathMl === !0 && (H(X, Zn), H(J, Ki), H(J, dn))), Ct.tagCheck = null, Ct.attributeCheck = null, ut(h, "ADD_TAGS") && (typeof h.ADD_TAGS == "function" ? Ct.tagCheck = h.ADD_TAGS : _t(h.ADD_TAGS) && (X === Xt && (X = mt(X)), H(X, h.ADD_TAGS, tt))), ut(h, "ADD_ATTR") && (typeof h.ADD_ATTR == "function" ? Ct.attributeCheck = h.ADD_ATTR : _t(h.ADD_ATTR) && (J === Zt && (J = mt(J)), H(J, h.ADD_ATTR, tt))), ut(h, "ADD_URI_SAFE_ATTR") && _t(h.ADD_URI_SAFE_ATTR) && H(De, h.ADD_URI_SAFE_ATTR, tt), ut(h, "FORBID_CONTENTS") && _t(h.FORBID_CONTENTS) && (At === fe && (At = mt(At)), H(At, h.FORBID_CONTENTS, tt)), ut(h, "ADD_FORBID_CONTENTS") && _t(h.ADD_FORBID_CONTENTS) && (At === fe && (At = mt(At)), H(At, h.ADD_FORBID_CONTENTS, tt)), Re && (X["#text"] = !0), jt && H(X, ["html", "head", "body"]), X.table && (H(X, ["tbody"]), delete yt.tbody), h.TRUSTED_TYPES_POLICY) {
      if (typeof h.TRUSTED_TYPES_POLICY.createHTML != "function")
        throw Ge('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      if (typeof h.TRUSTED_TYPES_POLICY.createScriptURL != "function")
        throw Ge('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      O = h.TRUSTED_TYPES_POLICY, B = O.createHTML("");
    } else
      O === void 0 && (O = gl(v, r)), O !== null && typeof B == "string" && (B = O.createHTML(""));
    (C.uponSanitizeElement.length > 0 || C.uponSanitizeAttribute.length > 0) && X === Xt && (X = mt(X)), C.uponSanitizeAttribute.length > 0 && J === Zt && (J = mt(J)), bt && bt(h), ee = h;
  }, en = H({}, [...qn, ...Xn, ...il]), $t = H({}, [...Zn, ...rl]), zn = function(h) {
    let A = w(h);
    (!A || !A.tagName) && (A = { namespaceURI: te, tagName: "template" });
    const I = We(h.tagName), Q = We(A.tagName);
    return Vt[h.namespaceURI] ? h.namespaceURI === de ? A.namespaceURI === Et ? I === "svg" : A.namespaceURI === Kt ? I === "svg" && (Q === "annotation-xml" || Ot[Q]) : !!en[I] : h.namespaceURI === Kt ? A.namespaceURI === Et ? I === "math" : A.namespaceURI === de ? I === "math" && Ce[Q] : !!$t[I] : h.namespaceURI === Et ? A.namespaceURI === de && !Ce[Q] || A.namespaceURI === Kt && !Ot[Q] ? !1 : !$t[I] && (kn[I] || !en[I]) : !!(se === "application/xhtml+xml" && Vt[h.namespaceURI]) : !1;
  }, xt = function(h) {
    _e(t.removed, { element: h });
    try {
      w(h).removeChild(h);
    } catch {
      S(h);
    }
  }, Yt = function(h, A) {
    try {
      _e(t.removed, { attribute: A.getAttributeNode(h), from: A });
    } catch {
      _e(t.removed, { attribute: null, from: A });
    }
    if (A.removeAttribute(h), h === "is")
      if (Pt || Ht)
        try {
          xt(A);
        } catch {
        }
      else
        try {
          A.setAttribute(h, "");
        } catch {
        }
  }, nn = function(h) {
    let A = null, I = null;
    if (Jt)
      h = "<remove></remove>" + h;
    else {
      const rt = zi(h, /^[\r\n\t ]+/);
      I = rt && rt[0];
    }
    se === "application/xhtml+xml" && te === Et && (h = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + h + "</body></html>");
    const Q = O ? O.createHTML(h) : h;
    if (te === Et)
      try {
        A = new f().parseFromString(Q, se);
      } catch {
      }
    if (!A || !A.documentElement) {
      A = L.createDocument(te, "template", null);
      try {
        A.documentElement.innerHTML = pe ? B : Q;
      } catch {
      }
    }
    const V = A.body || A.documentElement;
    return h && I && V.insertBefore(n.createTextNode(I), V.childNodes[0] || null), te === Et ? nt.call(A, jt ? "html" : "body")[0] : jt ? A.documentElement : V;
  }, rn = function(h) {
    return z.call(h.ownerDocument || h, h, c.SHOW_ELEMENT | c.SHOW_COMMENT | c.SHOW_TEXT | c.SHOW_PROCESSING_INSTRUCTION | c.SHOW_CDATA_SECTION, null);
  }, qt = function(h) {
    h.normalize();
    const A = z.call(h.ownerDocument || h, h, c.SHOW_TEXT | c.SHOW_COMMENT | c.SHOW_CDATA_SECTION | c.SHOW_PROCESSING_INSTRUCTION, null);
    let I = A.nextNode();
    for (; I; ) {
      let Q = I.data;
      ye([K, W, R], (V) => {
        Q = ve(Q, V, " ");
      }), I.data = Q, I = A.nextNode();
    }
  }, ge = function(h) {
    const A = D ? D(h) : null;
    return typeof A != "string" || tt(A) !== "form" ? !1 : typeof h.nodeName != "string" || typeof h.textContent != "string" || typeof h.removeChild != "function" || h.attributes !== M(h) || typeof h.removeAttribute != "function" || typeof h.setAttribute != "function" || typeof h.namespaceURI != "string" || typeof h.insertBefore != "function" || typeof h.hasChildNodes != "function" || h.nodeType !== y(h) || h.childNodes !== g(h);
  }, ae = function(h) {
    if (!y || typeof h != "object" || h === null)
      return !1;
    try {
      return y(h) === Gt.documentFragment;
    } catch {
      return !1;
    }
  }, me = function(h) {
    if (!y || typeof h != "object" || h === null)
      return !1;
    try {
      return typeof y(h) == "number";
    } catch {
      return !1;
    }
  };
  function kt(k, h, A) {
    ye(k, (I) => {
      I.call(t, h, A, ee);
    });
  }
  const on = function(h) {
    let A = null;
    if (kt(C.beforeSanitizeElements, h, null), ge(h))
      return xt(h), !0;
    const I = tt(h.nodeName);
    if (kt(C.uponSanitizeElement, h, { tagName: I, allowedTags: X }), oe && h.hasChildNodes() && !me(h.firstElementChild) && pt(/<[/\w!]/g, h.innerHTML) && pt(/<[/\w!]/g, h.textContent) || oe && h.namespaceURI === Et && I === "style" && me(h.firstElementChild) || h.nodeType === Gt.progressingInstruction || oe && h.nodeType === Gt.comment && pt(/<[/\w]/g, h.data))
      return xt(h), !0;
    if (yt[I] || !(Ct.tagCheck instanceof Function && Ct.tagCheck(I)) && !X[I]) {
      if (!yt[I] && an(I) && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, I) || U.tagNameCheck instanceof Function && U.tagNameCheck(I)))
        return !1;
      if (Re && !At[I]) {
        const V = w(h), rt = g(h);
        if (rt && V) {
          const wt = rt.length;
          for (let Rt = wt - 1; Rt >= 0; --Rt) {
            const Nt = m(rt[Rt], !0);
            V.insertBefore(Nt, b(h));
          }
        }
      }
      return xt(h), !0;
    }
    return (y ? y(h) : h.nodeType) === Gt.element && !zn(h) || (I === "noscript" || I === "noembed" || I === "noframes") && pt(/<\/no(script|embed|frames)/i, h.innerHTML) ? (xt(h), !0) : (Ft && h.nodeType === Gt.text && (A = h.textContent, ye([K, W, R], (V) => {
      A = ve(A, V, " ");
    }), h.textContent !== A && (_e(t.removed, { element: h.cloneNode() }), h.textContent = A)), kt(C.afterSanitizeElements, h, null), !1);
  }, sn = function(h, A, I) {
    if (Qt[A] || Ne && (A === "id" || A === "name") && (I in n || I in Pn))
      return !1;
    const Q = J[A] || Ct.attributeCheck instanceof Function && Ct.attributeCheck(A, h);
    if (!(Ee && !Qt[A] && pt(G, A))) {
      if (!(Ae && pt(Z, A))) {
        if (!Q || Qt[A]) {
          if (!(an(h) && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, h) || U.tagNameCheck instanceof Function && U.tagNameCheck(h)) && (U.attributeNameCheck instanceof RegExp && pt(U.attributeNameCheck, A) || U.attributeNameCheck instanceof Function && U.attributeNameCheck(A, h)) || A === "is" && U.allowCustomizedBuiltInElements && (U.tagNameCheck instanceof RegExp && pt(U.tagNameCheck, I) || U.tagNameCheck instanceof Function && U.tagNameCheck(I)))) return !1;
        } else if (!De[A]) {
          if (!pt(j, ve(I, gt, ""))) {
            if (!((A === "src" || A === "xlink:href" || A === "href") && h !== "script" && Bi(I, "data:") === 0 && Ie[h])) {
              if (!(Xe && !pt(ct, ve(I, gt, "")))) {
                if (I)
                  return !1;
              }
            }
          }
        }
      }
    }
    return !0;
  }, ke = H({}, ["annotation-xml", "color-profile", "font-face", "font-face-format", "font-face-name", "font-face-src", "font-face-uri", "missing-glyph"]), an = function(h) {
    return !ke[We(h)] && pt(it, h);
  }, le = function(h) {
    kt(C.beforeSanitizeAttributes, h, null);
    const A = h.attributes;
    if (!A || ge(h))
      return;
    const I = { attrName: "", attrValue: "", keepAttr: !0, allowedAttributes: J, forceKeepAttr: void 0 };
    let Q = A.length;
    for (; Q--; ) {
      const V = A[Q], rt = V.name, wt = V.namespaceURI, Rt = V.value, Nt = tt(rt), Le = Rt;
      let ht = rt === "value" ? Le : Xa(Le);
      if (I.attrName = Nt, I.attrValue = ht, I.keepAttr = !0, I.forceKeepAttr = void 0, kt(C.uponSanitizeAttribute, h, I), ht = I.attrValue, Me && (Nt === "id" || Nt === "name") && Bi(ht, Qe) !== 0 && (Yt(rt, h), ht = Qe + ht), oe && pt(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i, ht)) {
        Yt(rt, h);
        continue;
      }
      if (Nt === "attributename" && zi(ht, "href")) {
        Yt(rt, h);
        continue;
      }
      if (I.forceKeepAttr)
        continue;
      if (!I.keepAttr) {
        Yt(rt, h);
        continue;
      }
      if (!Ze && pt(/\/>/i, ht)) {
        Yt(rt, h);
        continue;
      }
      Ft && ye([K, W, R], (cn) => {
        ht = ve(ht, cn, " ");
      });
      const ln = tt(h.nodeName);
      if (!sn(ln, Nt, ht)) {
        Yt(rt, h);
        continue;
      }
      if (O && typeof v == "object" && typeof v.getAttributeType == "function" && !wt)
        switch (v.getAttributeType(ln, Nt)) {
          case "TrustedHTML": {
            ht = O.createHTML(ht);
            break;
          }
          case "TrustedScriptURL": {
            ht = O.createScriptURL(ht);
            break;
          }
        }
      if (ht !== Le)
        try {
          wt ? h.setAttributeNS(wt, rt, ht) : h.setAttribute(rt, ht), ge(h) ? xt(h) : Pi(t.removed);
        } catch {
          Yt(rt, h);
        }
    }
    kt(C.afterSanitizeAttributes, h, null);
  }, ne = function(h) {
    let A = null;
    const I = rn(h);
    for (kt(C.beforeSanitizeShadowDOM, h, null); A = I.nextNode(); )
      if (kt(C.uponSanitizeShadowNode, A, null), on(A), le(A), ae(A.content) && ne(A.content), (y ? y(A) : A.nodeType) === Gt.element) {
        const V = _ ? _(A) : A.shadowRoot;
        ae(V) && (ie(V), ne(V));
      }
    kt(C.afterSanitizeShadowDOM, h, null);
  }, ie = function(h) {
    const A = y ? y(h) : h.nodeType;
    if (A === Gt.element) {
      const V = _ ? _(h) : h.shadowRoot;
      ae(V) && (ie(V), ne(V));
    }
    const I = g ? g(h) : h.childNodes;
    if (!I)
      return;
    const Q = [];
    ye(I, (V) => {
      _e(Q, V);
    });
    for (const V of Q)
      ie(V);
    if (A === Gt.element) {
      const V = D ? D(h) : null;
      if (typeof V == "string" && tt(V) === "template") {
        const rt = h.content;
        ae(rt) && ie(rt);
      }
    }
  };
  return t.sanitize = function(k) {
    let h = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, A = null, I = null, Q = null, V = null;
    if (pe = !k, pe && (k = "<!-->"), typeof k != "string" && !me(k) && (k = el(k), typeof k != "string"))
      throw Ge("dirty is not a string, aborting");
    if (!t.isSupported)
      return k;
    if (xe || Oe(h), t.removed = [], typeof k == "string" && (zt = !1), zt) {
      const Rt = D ? D(k) : k.nodeName;
      if (typeof Rt == "string") {
        const Nt = tt(Rt);
        if (!X[Nt] || yt[Nt])
          throw Ge("root node is forbidden and cannot be sanitized in-place");
      }
      if (ge(k))
        throw Ge("root node is clobbered and cannot be sanitized in-place");
      ie(k);
    } else if (me(k))
      A = nn("<!---->"), I = A.ownerDocument.importNode(k, !0), I.nodeType === Gt.element && I.nodeName === "BODY" || I.nodeName === "HTML" ? A = I : A.appendChild(I), ie(I);
    else {
      if (!Pt && !Ft && !jt && k.indexOf("<") === -1)
        return O && St ? O.createHTML(k) : k;
      if (A = nn(k), !A)
        return Pt ? null : St ? B : "";
    }
    A && Jt && xt(A.firstChild);
    const rt = rn(zt ? k : A);
    for (; Q = rt.nextNode(); )
      on(Q), le(Q), ae(Q.content) && ne(Q.content);
    if (zt)
      return Ft && qt(k), k;
    if (Pt) {
      if (Ft && qt(A), Ht)
        for (V = Y.call(A.ownerDocument); A.firstChild; )
          V.appendChild(A.firstChild);
      else
        V = A;
      return (J.shadowroot || J.shadowrootmode) && (V = N.call(i, V, !0)), V;
    }
    let wt = jt ? A.outerHTML : A.innerHTML;
    return jt && X["!doctype"] && A.ownerDocument && A.ownerDocument.doctype && A.ownerDocument.doctype.name && pt(fl, A.ownerDocument.doctype.name) && (wt = "<!DOCTYPE " + A.ownerDocument.doctype.name + `>
` + wt), Ft && ye([K, W, R], (Rt) => {
      wt = ve(wt, Rt, " ");
    }), O && St ? O.createHTML(wt) : wt;
  }, t.setConfig = function() {
    let k = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    Oe(k), xe = !0;
  }, t.clearConfig = function() {
    ee = null, xe = !1;
  }, t.isValidAttribute = function(k, h, A) {
    ee || Oe({});
    const I = tt(k), Q = tt(h);
    return sn(I, Q, A);
  }, t.addHook = function(k, h) {
    typeof h == "function" && _e(C[k], h);
  }, t.removeHook = function(k, h) {
    if (h !== void 0) {
      const A = Ya(C[k], h);
      return A === -1 ? void 0 : qa(C[k], A, 1)[0];
    }
    return Pi(C[k]);
  }, t.removeHooks = function(k) {
    C[k] = [];
  }, t.removeAllHooks = function() {
    C = $i();
  }, t;
}
Nr();
function Mr(e = 8, t = "id-") {
  const n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", i = n + "0123456789-_";
  let r = n.charAt(Math.floor(Math.random() * n.length));
  for (let o = 1; o < e; o++)
    r += i.charAt(Math.floor(Math.random() * i.length));
  return `${t}${r}`;
}
function ml(e, t, n, i) {
  const r = Math.max(Math.abs(n) / e, Math.abs(i) / t);
  return r === 0 ? e : 1 / r;
}
function Sn(e, t = /* @__PURE__ */ new WeakSet()) {
  if (typeof e == "function") return;
  if (e === null || typeof e != "object") return e;
  const n = e;
  if (t.has(n)) return;
  if (t.add(n), Array.isArray(e))
    return e.map((r) => Sn(r, t));
  if (Object.getPrototypeOf(e) !== Object.prototype) return e;
  const i = {};
  for (const [r, o] of Object.entries(e))
    typeof o != "function" && (i[r] = Sn(o, t));
  return i;
}
function Rr(e) {
  return !e || e.size === 0 ? [gi] : [...e.keys()];
}
function Ir(e) {
  return e ? new Map([...e].map(([t, n]) => [t, [...n]])) : /* @__PURE__ */ new Map();
}
function Dr(e, t) {
  return !e || e.size === 0 ? t === gi : e.has(t);
}
function Cr(e, t, n, i = Date.now()) {
  const r = e.get(t);
  if (r) {
    r.some((o) => o.runId === n) || r.push({ runId: n, at: i });
    return;
  }
  e.set(t, [{ runId: n, at: i }]);
}
function Or(e, t, n) {
  if (!e) return !1;
  const i = e.get(t);
  if (i) {
    const r = i.filter((o) => o.runId !== n);
    r.length ? e.set(t, r) : e.delete(t);
  }
  return e.size === 0;
}
function kr(e, t) {
  return e ? (e.delete(t), e.size === 0) : t === gi;
}
let Lr = class Fr {
  constructor(t, n, i, r = Mr(), o = []) {
    E(this, "id");
    E(this, "data");
    E(this, "children");
    E(this, "style");
    E(this, "edgesOut");
    E(this, "edgesIn");
    E(this, "defaultCircleRadius", 10);
    E(this, "x");
    E(this, "y");
    E(this, "vx");
    E(this, "vy");
    E(this, "fx");
    E(this, "fy");
    E(this, "weight");
    E(this, "frozen");
    E(this, "visible");
    E(this, "expanded");
    E(this, "isChild");
    E(this, "childrenDepth");
    E(this, "isParent");
    E(this, "parentNode");
    E(this, "_original_object");
    E(this, "_deepest_node_clone");
    E(this, "_subgraph");
    E(this, "_circleRadius", this.defaultCircleRadius);
    E(this, "_circleRadiusCollapsed", this.defaultCircleRadius);
    E(this, "_border");
    E(this, "_dirty");
    E(this, "_sources");
    E(this, "_potential");
    E(this, "domID");
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
    return { id: this.id, data: this.data, style: Sn(this.style), weight: this.weight, _circleRadius: this._circleRadius, x: this.x, y: this.y, vx: this.vx, vy: this.vy, fx: this.fx, fy: this.fy };
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new Fr(this.id, t, n);
    return i.x = this.x, i.y = this.y, i.vx = this.vx, i.vy = this.vy, i.fx = this.fx, i.fy = this.fy, i.weight = this.weight, i.frozen = this.frozen, i.visible = this.visible, i.expanded = this.expanded, i.isChild = this.isChild, i.childrenDepth = this.childrenDepth, i.isParent = this.isParent, i.parentNode = this.parentNode, i._circleRadius = this._circleRadius, i.children = this.children.map((r) => r.clone()), this._sources && (i._sources = new Map([...this._sources].map(([r, o]) => [r, [...o]]))), this._potential && (i._potential = new Map(this._potential)), i;
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
    for (const t of this.ancestorChain())
      if (!t.expanded) return t;
    return this;
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
  setBorderBox(t, n) {
    this._border = { halfWidth: t / 2, halfHeight: n / 2 };
  }
  getBorderBox(t = 0) {
    if (this._border)
      return { halfWidth: this._border.halfWidth + t, halfHeight: this._border.halfHeight + t };
  }
  getBorderDistance(t, n, i = 0) {
    const r = this._border;
    return r ? ml(r.halfWidth + i, r.halfHeight + i, t, n) : this._circleRadius + i;
  }
  getSources() {
    return Rr(this._sources);
  }
  hasSource(t) {
    return Dr(this._sources, t);
  }
  vouch(t, n) {
    this._sources || (this._sources = /* @__PURE__ */ new Map()), Cr(this._sources, t, n);
  }
  revokeRun(t, n) {
    return Or(this._sources, t, n);
  }
  dropSource(t) {
    return kr(this._sources, t);
  }
  cloneLedger() {
    return Ir(this._sources);
  }
  setPotential(t, n) {
    var o, a;
    const i = typeof t == "string" ? t : ki, r = typeof t == "string" ? n ?? 0 : t;
    if (!r) {
      (o = this._potential) == null || o.delete(i), ((a = this._potential) == null ? void 0 : a.size) === 0 && (this._potential = void 0), this.markDirty();
      return;
    }
    this._potential || (this._potential = /* @__PURE__ */ new Map()), this._potential.set(i, r), this.markDirty();
  }
  getPotential(t = ki) {
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
class In {
  constructor(t, n, i, r, o, a = null, s) {
    E(this, "id");
    E(this, "from");
    E(this, "to");
    E(this, "directed");
    E(this, "data");
    E(this, "style");
    E(this, "visible");
    E(this, "layerVisible");
    E(this, "visibleIgnoringLayer");
    E(this, "representedEdges");
    E(this, "isSynthetic");
    E(this, "isCrossCluster");
    E(this, "syntheticTerminalNode");
    E(this, "syntheticSourceNode");
    E(this, "_original_object");
    E(this, "_subgraphFromNode");
    E(this, "_subgraphToNode");
    E(this, "_dirty");
    E(this, "_sources");
    E(this, "domID");
    this.id = t, this.domID = Mr(), this.from = n, this.to = i, this.directed = a, this.data = r ?? {}, this.style = o ?? {}, this.visible = !0, this.layerVisible = !0, this.visibleIgnoringLayer = !0, this._dirty = !0, this.isSynthetic = s !== void 0, this.syntheticTerminalNode = s, this.from.registerEdgeOut(this), this.to.registerEdgeIn(this);
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
    return { id: this.id, from: { id: this.from.id }, to: { id: this.to.id }, data: this.data, style: Sn(this.style), directed: this.directed };
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new In(this.id, this.from.clone(), this.to.clone(), t, n, this.directed);
    return i.visible = this.visible, i.layerVisible = this.layerVisible, i.visibleIgnoringLayer = this.visibleIgnoringLayer, i;
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
  setSubgraphFromNode(t) {
    this._subgraphFromNode = t;
  }
  setSubgraphToNode(t) {
    this._subgraphToNode = t;
  }
  getSubgraphFromNode() {
    return this._subgraphFromNode;
  }
  getSubgraphToNode() {
    return this._subgraphToNode;
  }
  getSources() {
    return Rr(this._sources);
  }
  hasSource(t) {
    return Dr(this._sources, t);
  }
  vouch(t, n) {
    this._sources || (this._sources = /* @__PURE__ */ new Map()), Cr(this._sources, t, n);
  }
  revokeRun(t, n) {
    return Or(this._sources, t, n);
  }
  dropSource(t) {
    return kr(this._sources, t);
  }
  cloneLedger() {
    return Ir(this._sources);
  }
}
const Pr = 'var Hc=Object.defineProperty;var Wc=(se,kt,pe)=>kt in se?Hc(se,kt,{enumerable:!0,configurable:!0,writable:!0,value:pe}):se[kt]=pe;var E=(se,kt,pe)=>Wc(se,typeof kt!="symbol"?kt+"":kt,pe);(function(){"use strict";function se(e){const t=+this._x.call(null,e),n=+this._y.call(null,e);return kt(this.cover(t,n),t,n,e)}function kt(e,t,n,i){if(isNaN(t)||isNaN(n))return e;var r,o=e._root,a={data:i},s=e._x0,c=e._y0,l=e._x1,f=e._y1,T,d,m,A,b,g,w,_;if(!o)return e._root=a,e;for(;o.length;)if((b=t>=(T=(s+l)/2))?s=T:l=T,(g=n>=(d=(c+f)/2))?c=d:f=d,r=o,!(o=o[w=g<<1|b]))return r[w]=a,e;if(m=+e._x.call(null,o.data),A=+e._y.call(null,o.data),t===m&&n===A)return a.next=o,r?r[w]=a:e._root=a,e;do r=r?r[w]=new Array(4):e._root=new Array(4),(b=t>=(T=(s+l)/2))?s=T:l=T,(g=n>=(d=(c+f)/2))?c=d:f=d;while((w=g<<1|b)===(_=(A>=d)<<1|m>=T));return r[_]=o,r[w]=a,e}function pe(e){var t,n,i=e.length,r,o,a=new Array(i),s=new Array(i),c=1/0,l=1/0,f=-1/0,T=-1/0;for(n=0;n<i;++n)isNaN(r=+this._x.call(null,t=e[n]))||isNaN(o=+this._y.call(null,t))||(a[n]=r,s[n]=o,r<c&&(c=r),r>f&&(f=r),o<l&&(l=o),o>T&&(T=o));if(c>f||l>T)return this;for(this.cover(c,l).cover(f,T),n=0;n<i;++n)kt(this,a[n],s[n],e[n]);return this}function Wr(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(n))r=(n=Math.floor(e))+1,o=(i=Math.floor(t))+1;else{for(var a=r-n||1,s=this._root,c,l;n>e||e>=r||i>t||t>=o;)switch(l=(t<i)<<1|e<n,c=new Array(4),c[l]=s,s=c,a*=2,l){case 0:r=n+a,o=i+a;break;case 1:n=r-a,o=i+a;break;case 2:r=n+a,i=o-a;break;case 3:n=r-a,i=o-a;break}this._root&&this._root.length&&(this._root=s)}return this._x0=n,this._y0=i,this._x1=r,this._y1=o,this}function jr(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function Kr(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function yt(e,t,n,i,r){this.node=e,this.x0=t,this.y0=n,this.x1=i,this.y1=r}function Vr(e,t,n){var i,r=this._x0,o=this._y0,a,s,c,l,f=this._x1,T=this._y1,d=[],m=this._root,A,b;for(m&&d.push(new yt(m,r,o,f,T)),n==null?n=1/0:(r=e-n,o=t-n,f=e+n,T=t+n,n*=n);A=d.pop();)if(!(!(m=A.node)||(a=A.x0)>f||(s=A.y0)>T||(c=A.x1)<r||(l=A.y1)<o))if(m.length){var g=(a+c)/2,w=(s+l)/2;d.push(new yt(m[3],g,w,c,l),new yt(m[2],a,w,g,l),new yt(m[1],g,s,c,w),new yt(m[0],a,s,g,w)),(b=(t>=w)<<1|e>=g)&&(A=d[d.length-1],d[d.length-1]=d[d.length-1-b],d[d.length-1-b]=A)}else{var _=e-+this._x.call(null,m.data),N=t-+this._y.call(null,m.data),y=_*_+N*N;if(y<n){var D=Math.sqrt(n=y);r=e-D,o=t-D,f=e+D,T=t+D,i=m.data}}return i}function $r(e){if(isNaN(f=+this._x.call(null,e))||isNaN(T=+this._y.call(null,e)))return this;var t,n=this._root,i,r,o,a=this._x0,s=this._y0,c=this._x1,l=this._y1,f,T,d,m,A,b,g,w;if(!n)return this;if(n.length)for(;;){if((A=f>=(d=(a+c)/2))?a=d:c=d,(b=T>=(m=(s+l)/2))?s=m:l=m,t=n,!(n=n[g=b<<1|A]))return this;if(!n.length)break;(t[g+1&3]||t[g+2&3]||t[g+3&3])&&(i=t,w=g)}for(;n.data!==e;)if(r=n,!(n=n.next))return this;return(o=n.next)&&delete n.next,r?(o?r.next=o:delete r.next,this):t?(o?t[g]=o:delete t[g],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(i?i[w]=n:this._root=n),this):(this._root=o,this)}function Yr(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function Xr(){return this._root}function qr(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function Zr(e){var t=[],n,i=this._root,r,o,a,s,c;for(i&&t.push(new yt(i,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(i=n.node,o=n.x0,a=n.y0,s=n.x1,c=n.y1)&&i.length){var l=(o+s)/2,f=(a+c)/2;(r=i[3])&&t.push(new yt(r,l,f,s,c)),(r=i[2])&&t.push(new yt(r,o,f,l,c)),(r=i[1])&&t.push(new yt(r,l,a,s,f)),(r=i[0])&&t.push(new yt(r,o,a,l,f))}return this}function Qr(e){var t=[],n=[],i;for(this._root&&t.push(new yt(this._root,this._x0,this._y0,this._x1,this._y1));i=t.pop();){var r=i.node;if(r.length){var o,a=i.x0,s=i.y0,c=i.x1,l=i.y1,f=(a+c)/2,T=(s+l)/2;(o=r[0])&&t.push(new yt(o,a,s,f,T)),(o=r[1])&&t.push(new yt(o,f,s,c,T)),(o=r[2])&&t.push(new yt(o,a,T,f,l)),(o=r[3])&&t.push(new yt(o,f,T,c,l))}n.push(i)}for(;i=n.pop();)e(i.node,i.x0,i.y0,i.x1,i.y1);return this}function Jr(e){return e[0]}function to(e){return arguments.length?(this._x=e,this):this._x}function eo(e){return e[1]}function no(e){return arguments.length?(this._y=e,this):this._y}function kn(e,t,n){var i=new Pn(t??Jr,n??eo,NaN,NaN,NaN,NaN);return e==null?i:i.addAll(e)}function Pn(e,t,n,i,r,o){this._x=e,this._y=t,this._x0=n,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function Ti(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var _t=kn.prototype=Pn.prototype;_t.copy=function(){var e=new Pn(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,i;if(!t)return e;if(!t.length)return e._root=Ti(t),e;for(n=[{source:t,target:e._root=new Array(4)}];t=n.pop();)for(var r=0;r<4;++r)(i=t.source[r])&&(i.length?n.push({source:i,target:t.target[r]=new Array(4)}):t.target[r]=Ti(i));return e},_t.add=se,_t.addAll=pe,_t.cover=Wr,_t.data=jr,_t.extent=Kr,_t.find=Vr,_t.remove=$r,_t.removeAll=Yr,_t.root=Xr,_t.size=qr,_t.visit=Zr,_t.visitAfter=Qr,_t.x=to,_t.y=no;function dt(e){return function(){return e}}function Zt(e){return(e()-.5)*1e-6}function io(e){return e.x+e.vx}function ro(e){return e.y+e.vy}function oo(e){var t,n,i,r=1,o=1;typeof e!="function"&&(e=dt(e==null?1:+e));function a(){for(var l,f=t.length,T,d,m,A,b,g,w=0;w<o;++w)for(T=kn(t,io,ro).visitAfter(s),l=0;l<f;++l)d=t[l],b=n[d.index],g=b*b,m=d.x+d.vx,A=d.y+d.vy,T.visit(_);function _(N,y,D,O,G){var P=N.data,F=N.r,z=b+F;if(P){if(P.index>d.index){var Y=m-P.x-P.vx,nt=A-P.y-P.vy,R=Y*Y+nt*nt;R<z*z&&(Y===0&&(Y=Zt(i),R+=Y*Y),nt===0&&(nt=Zt(i),R+=nt*nt),R=(z-(R=Math.sqrt(R)))/R*r,d.vx+=(Y*=R)*(z=(F*=F)/(g+F)),d.vy+=(nt*=R)*z,P.vx-=Y*(z=1-z),P.vy-=nt*z)}return}return y>m+z||O<m-z||D>A+z||G<A-z}}function s(l){if(l.data)return l.r=n[l.data.index];for(var f=l.r=0;f<4;++f)l[f]&&l[f].r>l.r&&(l.r=l[f].r)}function c(){if(t){var l,f=t.length,T;for(n=new Array(f),l=0;l<f;++l)T=t[l],n[T.index]=+e(T,l,t)}}return a.initialize=function(l,f){t=l,i=f,c()},a.iterations=function(l){return arguments.length?(o=+l,a):o},a.strength=function(l){return arguments.length?(r=+l,a):r},a.radius=function(l){return arguments.length?(e=typeof l=="function"?l:dt(+l),c(),a):e},a}function so(e){return e.index}function bi(e,t){var n=e.get(t);if(!n)throw new Error("node not found: "+t);return n}function ao(e){var t=so,n=T,i,r=dt(30),o,a,s,c,l,f=1;e==null&&(e=[]);function T(g){return 1/Math.min(s[g.source.index],s[g.target.index])}function d(g){for(var w=0,_=e.length;w<f;++w)for(var N=0,y,D,O,G,P,F,z;N<_;++N)y=e[N],D=y.source,O=y.target,G=O.x+O.vx-D.x-D.vx||Zt(l),P=O.y+O.vy-D.y-D.vy||Zt(l),F=Math.sqrt(G*G+P*P),F=(F-o[N])/F*g*i[N],G*=F,P*=F,O.vx-=G*(z=c[N]),O.vy-=P*z,D.vx+=G*(z=1-z),D.vy+=P*z}function m(){if(a){var g,w=a.length,_=e.length,N=new Map(a.map((D,O)=>[t(D,O,a),D])),y;for(g=0,s=new Array(w);g<_;++g)y=e[g],y.index=g,typeof y.source!="object"&&(y.source=bi(N,y.source)),typeof y.target!="object"&&(y.target=bi(N,y.target)),s[y.source.index]=(s[y.source.index]||0)+1,s[y.target.index]=(s[y.target.index]||0)+1;for(g=0,c=new Array(_);g<_;++g)y=e[g],c[g]=s[y.source.index]/(s[y.source.index]+s[y.target.index]);i=new Array(_),A(),o=new Array(_),b()}}function A(){if(a)for(var g=0,w=e.length;g<w;++g)i[g]=+n(e[g],g,e)}function b(){if(a)for(var g=0,w=e.length;g<w;++g)o[g]=+r(e[g],g,e)}return d.initialize=function(g,w){a=g,l=w,m()},d.links=function(g){return arguments.length?(e=g,m(),d):e},d.id=function(g){return arguments.length?(t=g,d):t},d.iterations=function(g){return arguments.length?(f=+g,d):f},d.strength=function(g){return arguments.length?(n=typeof g=="function"?g:dt(+g),A(),d):n},d.distance=function(g){return arguments.length?(r=typeof g=="function"?g:dt(+g),b(),d):r},d}var lo={value:()=>{}};function zn(){for(var e=0,t=arguments.length,n={},i;e<t;++e){if(!(i=arguments[e]+"")||i in n||/[\\s.]/.test(i))throw new Error("illegal type: "+i);n[i]=[]}return new Je(n)}function Je(e){this._=e}function co(e,t){return e.trim().split(/^|\\s+/).map(function(n){var i="",r=n.indexOf(".");if(r>=0&&(i=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:i}})}Je.prototype=zn.prototype={constructor:Je,on:function(e,t){var n=this._,i=co(e+"",n),r,o=-1,a=i.length;if(arguments.length<2){for(;++o<a;)if((r=(e=i[o]).type)&&(r=uo(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++o<a;)if(r=(e=i[o]).type)n[r]=Si(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Si(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new Je(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),i=0,r,o;i<r;++i)n[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(o=this._[e],i=0,r=o.length;i<r;++i)o[i].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var i=this._[e],r=0,o=i.length;r<o;++r)i[r].value.apply(t,n)}};function uo(e,t){for(var n=0,i=e.length,r;n<i;++n)if((r=e[n]).name===t)return r.value}function Si(e,t,n){for(var i=0,r=e.length;i<r;++i)if(e[i].name===t){e[i]=lo,e=e.slice(0,i).concat(e.slice(i+1));break}return n!=null&&e.push({name:t,value:n}),e}var ge=0,Re=0,Ne=0,wi=1e3,tn,Ie,en=0,ae=0,nn=0,Me=typeof performance=="object"&&performance.now?performance:Date,Ai=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function vi(){return ae||(Ai(ho),ae=Me.now()+nn)}function ho(){ae=0}function Gn(){this._call=this._time=this._next=null}Gn.prototype=Ei.prototype={constructor:Gn,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?vi():+n)+(t==null?0:+t),!this._next&&Ie!==this&&(Ie?Ie._next=this:tn=this,Ie=this),this._call=e,this._time=n,Bn()},stop:function(){this._call&&(this._call=null,this._time=1/0,Bn())}};function Ei(e,t,n){var i=new Gn;return i.restart(e,t,n),i}function fo(){vi(),++ge;for(var e=tn,t;e;)(t=ae-e._time)>=0&&e._call.call(void 0,t),e=e._next;--ge}function xi(){ae=(en=Me.now())+nn,ge=Re=0;try{fo()}finally{ge=0,go(),ae=0}}function po(){var e=Me.now(),t=e-en;t>wi&&(nn-=t,en=e)}function go(){for(var e,t=tn,n,i=1/0;t;)t._call?(i>t._time&&(i=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:tn=n);Ie=e,Bn(i)}function Bn(e){if(!ge){Re&&(Re=clearTimeout(Re));var t=e-ae;t>24?(e<1/0&&(Re=setTimeout(xi,e-Me.now()-nn)),Ne&&(Ne=clearInterval(Ne))):(Ne||(en=Me.now(),Ne=setInterval(po,wi)),ge=1,Ai(xi))}}const mo=1664525,yo=1013904223,Ri=4294967296;function _o(){let e=1;return()=>(e=(mo*e+yo)%Ri)/Ri}function To(e){return e.x}function bo(e){return e.y}var So=10,wo=Math.PI*(3-Math.sqrt(5));function Ao(e){var t,n=1,i=.001,r=1-Math.pow(i,1/300),o=0,a=.6,s=new Map,c=Ei(T),l=zn("tick","end"),f=_o();e==null&&(e=[]);function T(){d(),l.call("tick",t),n<i&&(c.stop(),l.call("end",t))}function d(b){var g,w=e.length,_;b===void 0&&(b=1);for(var N=0;N<b;++N)for(n+=(o-n)*r,s.forEach(function(y){y(n)}),g=0;g<w;++g)_=e[g],_.fx==null?_.x+=_.vx*=a:(_.x=_.fx,_.vx=0),_.fy==null?_.y+=_.vy*=a:(_.y=_.fy,_.vy=0);return t}function m(){for(var b=0,g=e.length,w;b<g;++b){if(w=e[b],w.index=b,w.fx!=null&&(w.x=w.fx),w.fy!=null&&(w.y=w.fy),isNaN(w.x)||isNaN(w.y)){var _=So*Math.sqrt(.5+b),N=b*wo;w.x=_*Math.cos(N),w.y=_*Math.sin(N)}(isNaN(w.vx)||isNaN(w.vy))&&(w.vx=w.vy=0)}}function A(b){return b.initialize&&b.initialize(e,f),b}return m(),t={tick:d,restart:function(){return c.restart(T),t},stop:function(){return c.stop(),t},nodes:function(b){return arguments.length?(e=b,m(),s.forEach(A),t):e},alpha:function(b){return arguments.length?(n=+b,t):n},alphaMin:function(b){return arguments.length?(i=+b,t):i},alphaDecay:function(b){return arguments.length?(r=+b,t):+r},alphaTarget:function(b){return arguments.length?(o=+b,t):o},velocityDecay:function(b){return arguments.length?(a=1-b,t):1-a},randomSource:function(b){return arguments.length?(f=b,s.forEach(A),t):f},force:function(b,g){return arguments.length>1?(g==null?s.delete(b):s.set(b,A(g)),t):s.get(b)},find:function(b,g,w){var _=0,N=e.length,y,D,O,G,P;for(w==null?w=1/0:w*=w,_=0;_<N;++_)G=e[_],y=b-G.x,D=g-G.y,O=y*y+D*D,O<w&&(P=G,w=O);return P},on:function(b,g){return arguments.length>1?(l.on(b,g),t):l.on(b)}}}function vo(){var e,t,n,i,r=dt(-30),o,a=1,s=1/0,c=.81;function l(m){var A,b=e.length,g=kn(e,To,bo).visitAfter(T);for(i=m,A=0;A<b;++A)t=e[A],g.visit(d)}function f(){if(e){var m,A=e.length,b;for(o=new Array(A),m=0;m<A;++m)b=e[m],o[b.index]=+r(b,m,e)}}function T(m){var A=0,b,g,w=0,_,N,y;if(m.length){for(_=N=y=0;y<4;++y)(b=m[y])&&(g=Math.abs(b.value))&&(A+=b.value,w+=g,_+=g*b.x,N+=g*b.y);m.x=_/w,m.y=N/w}else{b=m,b.x=b.data.x,b.y=b.data.y;do A+=o[b.data.index];while(b=b.next)}m.value=A}function d(m,A,b,g){if(!m.value)return!0;var w=m.x-t.x,_=m.y-t.y,N=g-A,y=w*w+_*_;if(N*N/c<y)return y<s&&(w===0&&(w=Zt(n),y+=w*w),_===0&&(_=Zt(n),y+=_*_),y<a&&(y=Math.sqrt(a*y)),t.vx+=w*m.value*i/y,t.vy+=_*m.value*i/y),!0;if(m.length||y>=s)return;(m.data!==t||m.next)&&(w===0&&(w=Zt(n),y+=w*w),_===0&&(_=Zt(n),y+=_*_),y<a&&(y=Math.sqrt(a*y)));do m.data!==t&&(N=o[m.data.index]*i/y,t.vx+=w*N,t.vy+=_*N);while(m=m.next)}return l.initialize=function(m,A){e=m,n=A,f()},l.strength=function(m){return arguments.length?(r=typeof m=="function"?m:dt(+m),f(),l):r},l.distanceMin=function(m){return arguments.length?(a=m*m,l):Math.sqrt(a)},l.distanceMax=function(m){return arguments.length?(s=m*m,l):Math.sqrt(s)},l.theta=function(m){return arguments.length?(c=m*m,l):Math.sqrt(c)},l}function Ni(e,t,n){var i,r=dt(.1),o,a;typeof e!="function"&&(e=dt(+e)),t==null&&(t=0),n==null&&(n=0);function s(l){for(var f=0,T=i.length;f<T;++f){var d=i[f],m=d.x-t||1e-6,A=d.y-n||1e-6,b=Math.sqrt(m*m+A*A),g=(a[f]-b)*o[f]*l/b;d.vx+=m*g,d.vy+=A*g}}function c(){if(i){var l,f=i.length;for(o=new Array(f),a=new Array(f),l=0;l<f;++l)a[l]=+e(i[l],l,i),o[l]=isNaN(a[l])?0:+r(i[l],l,i)}}return s.initialize=function(l){i=l,c()},s.strength=function(l){return arguments.length?(r=typeof l=="function"?l:dt(+l),c(),s):r},s.radius=function(l){return arguments.length?(e=typeof l=="function"?l:dt(+l),c(),s):e},s.x=function(l){return arguments.length?(t=+l,s):t},s.y=function(l){return arguments.length?(n=+l,s):n},s}function Ii(e){var t=dt(.1),n,i,r;typeof e!="function"&&(e=dt(e==null?0:+e));function o(s){for(var c=0,l=n.length,f;c<l;++c)f=n[c],f.vx+=(r[c]-f.x)*i[c]*s}function a(){if(n){var s,c=n.length;for(i=new Array(c),r=new Array(c),s=0;s<c;++s)i[s]=isNaN(r[s]=+e(n[s],s,n))?0:+t(n[s],s,n)}}return o.initialize=function(s){n=s,a()},o.strength=function(s){return arguments.length?(t=typeof s=="function"?s:dt(+s),a(),o):t},o.x=function(s){return arguments.length?(e=typeof s=="function"?s:dt(+s),a(),o):e},o}function Mi(e){var t=dt(.1),n,i,r;typeof e!="function"&&(e=dt(e==null?0:+e));function o(s){for(var c=0,l=n.length,f;c<l;++c)f=n[c],f.vy+=(r[c]-f.y)*i[c]*s}function a(){if(n){var s,c=n.length;for(i=new Array(c),r=new Array(c),s=0;s<c;++s)i[s]=isNaN(r[s]=+e(n[s],s,n))?0:+t(n[s],s,n)}}return o.initialize=function(s){n=s,a()},o.strength=function(s){return arguments.length?(t=typeof s=="function"?s:dt(+s),a(),o):t},o.y=function(s){return arguments.length?(e=typeof s=="function"?s:dt(+s),a(),o):e},o}function Eo(e=0,t=0,n=.001){let i=[],r;function o(){r=typeof n=="function"?n:()=>n}function a(s){for(let c=0,l=i.length;c<l;++c){const f=i[c],T=r(f,c,i);f.vx!=null&&f.x!=null&&(f.vx-=(f.x-e)*T*s),f.vy!=null&&f.y!=null&&(f.vy-=(f.y-t)*T*s)}}return a.initialize=s=>{i=s,o()},a.x=function(s){return arguments.length?(e=s,a):e},a.y=function(s){return arguments.length?(t=s,a):t},a.strength=function(s){return arguments.length?(n=s,o(),a):n},a}var Un="http://www.w3.org/1999/xhtml",Di={svg:"http://www.w3.org/2000/svg",xhtml:Un,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Ci(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),Di.hasOwnProperty(t)?{space:Di[t],local:e}:e}function xo(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===Un&&t.documentElement.namespaceURI===Un?t.createElement(e):t.createElementNS(n,e)}}function Ro(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function Oi(e){var t=Ci(e);return(t.local?Ro:xo)(t)}function No(){}function Li(e){return e==null?No:function(){return this.querySelector(e)}}function Io(e){typeof e!="function"&&(e=Li(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,s=i[r]=new Array(a),c,l,f=0;f<a;++f)(c=o[f])&&(l=e.call(c,c.__data__,f,o))&&("__data__"in c&&(l.__data__=c.__data__),s[f]=l);return new It(i,this._parents)}function Mo(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function Do(){return[]}function Co(e){return e==null?Do:function(){return this.querySelectorAll(e)}}function Oo(e){return function(){return Mo(e.apply(this,arguments))}}function Lo(e){typeof e=="function"?e=Oo(e):e=Co(e);for(var t=this._groups,n=t.length,i=[],r=[],o=0;o<n;++o)for(var a=t[o],s=a.length,c,l=0;l<s;++l)(c=a[l])&&(i.push(e.call(c,c.__data__,l,a)),r.push(c));return new It(i,r)}function Fo(e){return function(){return this.matches(e)}}function Fi(e){return function(t){return t.matches(e)}}var ko=Array.prototype.find;function Po(e){return function(){return ko.call(this.children,e)}}function zo(){return this.firstElementChild}function Go(e){return this.select(e==null?zo:Po(typeof e=="function"?e:Fi(e)))}var Bo=Array.prototype.filter;function Uo(){return Array.from(this.children)}function Ho(e){return function(){return Bo.call(this.children,e)}}function Wo(e){return this.selectAll(e==null?Uo:Ho(typeof e=="function"?e:Fi(e)))}function jo(e){typeof e!="function"&&(e=Fo(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,s=i[r]=[],c,l=0;l<a;++l)(c=o[l])&&e.call(c,c.__data__,l,o)&&s.push(c);return new It(i,this._parents)}function ki(e){return new Array(e.length)}function Ko(){return new It(this._enter||this._groups.map(ki),this._parents)}function rn(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}rn.prototype={constructor:rn,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function Vo(e){return function(){return e}}function $o(e,t,n,i,r,o){for(var a=0,s,c=t.length,l=o.length;a<l;++a)(s=t[a])?(s.__data__=o[a],i[a]=s):n[a]=new rn(e,o[a]);for(;a<c;++a)(s=t[a])&&(r[a]=s)}function Yo(e,t,n,i,r,o,a){var s,c,l=new Map,f=t.length,T=o.length,d=new Array(f),m;for(s=0;s<f;++s)(c=t[s])&&(d[s]=m=a.call(c,c.__data__,s,t)+"",l.has(m)?r[s]=c:l.set(m,c));for(s=0;s<T;++s)m=a.call(e,o[s],s,o)+"",(c=l.get(m))?(i[s]=c,c.__data__=o[s],l.delete(m)):n[s]=new rn(e,o[s]);for(s=0;s<f;++s)(c=t[s])&&l.get(d[s])===c&&(r[s]=c)}function Xo(e){return e.__data__}function qo(e,t){if(!arguments.length)return Array.from(this,Xo);var n=t?Yo:$o,i=this._parents,r=this._groups;typeof e!="function"&&(e=Vo(e));for(var o=r.length,a=new Array(o),s=new Array(o),c=new Array(o),l=0;l<o;++l){var f=i[l],T=r[l],d=T.length,m=Zo(e.call(f,f&&f.__data__,l,i)),A=m.length,b=s[l]=new Array(A),g=a[l]=new Array(A),w=c[l]=new Array(d);n(f,T,b,g,w,m,t);for(var _=0,N=0,y,D;_<A;++_)if(y=b[_]){for(_>=N&&(N=_+1);!(D=g[N])&&++N<A;);y._next=D||null}}return a=new It(a,i),a._enter=s,a._exit=c,a}function Zo(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function Qo(){return new It(this._exit||this._groups.map(ki),this._parents)}function Jo(e,t,n){var i=this.enter(),r=this,o=this.exit();return typeof e=="function"?(i=e(i),i&&(i=i.selection())):i=i.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?o.remove():n(o),i&&r?i.merge(r).order():r}function ts(e){for(var t=e.selection?e.selection():e,n=this._groups,i=t._groups,r=n.length,o=i.length,a=Math.min(r,o),s=new Array(r),c=0;c<a;++c)for(var l=n[c],f=i[c],T=l.length,d=s[c]=new Array(T),m,A=0;A<T;++A)(m=l[A]||f[A])&&(d[A]=m);for(;c<r;++c)s[c]=n[c];return new It(s,this._parents)}function es(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var i=e[t],r=i.length-1,o=i[r],a;--r>=0;)(a=i[r])&&(o&&a.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(a,o),o=a);return this}function ns(e){e||(e=is);function t(T,d){return T&&d?e(T.__data__,d.__data__):!T-!d}for(var n=this._groups,i=n.length,r=new Array(i),o=0;o<i;++o){for(var a=n[o],s=a.length,c=r[o]=new Array(s),l,f=0;f<s;++f)(l=a[f])&&(c[f]=l);c.sort(t)}return new It(r,this._parents).order()}function is(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function rs(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function os(){return Array.from(this)}function ss(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length;r<o;++r){var a=i[r];if(a)return a}return null}function as(){let e=0;for(const t of this)++e;return e}function ls(){return!this.node()}function cs(e){for(var t=this._groups,n=0,i=t.length;n<i;++n)for(var r=t[n],o=0,a=r.length,s;o<a;++o)(s=r[o])&&e.call(s,s.__data__,o,r);return this}function us(e){return function(){this.removeAttribute(e)}}function hs(e){return function(){this.removeAttributeNS(e.space,e.local)}}function fs(e,t){return function(){this.setAttribute(e,t)}}function ds(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function ps(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function gs(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function ms(e,t){var n=Ci(e);if(arguments.length<2){var i=this.node();return n.local?i.getAttributeNS(n.space,n.local):i.getAttribute(n)}return this.each((t==null?n.local?hs:us:typeof t=="function"?n.local?gs:ps:n.local?ds:fs)(n,t))}function Pi(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function ys(e){return function(){this.style.removeProperty(e)}}function _s(e,t,n){return function(){this.style.setProperty(e,t,n)}}function Ts(e,t,n){return function(){var i=t.apply(this,arguments);i==null?this.style.removeProperty(e):this.style.setProperty(e,i,n)}}function bs(e,t,n){return arguments.length>1?this.each((t==null?ys:typeof t=="function"?Ts:_s)(e,t,n??"")):Ss(this.node(),e)}function Ss(e,t){return e.style.getPropertyValue(t)||Pi(e).getComputedStyle(e,null).getPropertyValue(t)}function ws(e){return function(){delete this[e]}}function As(e,t){return function(){this[e]=t}}function vs(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function Es(e,t){return arguments.length>1?this.each((t==null?ws:typeof t=="function"?vs:As)(e,t)):this.node()[e]}function zi(e){return e.trim().split(/^|\\s+/)}function Hn(e){return e.classList||new Gi(e)}function Gi(e){this._node=e,this._names=zi(e.getAttribute("class")||"")}Gi.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function Bi(e,t){for(var n=Hn(e),i=-1,r=t.length;++i<r;)n.add(t[i])}function Ui(e,t){for(var n=Hn(e),i=-1,r=t.length;++i<r;)n.remove(t[i])}function xs(e){return function(){Bi(this,e)}}function Rs(e){return function(){Ui(this,e)}}function Ns(e,t){return function(){(t.apply(this,arguments)?Bi:Ui)(this,e)}}function Is(e,t){var n=zi(e+"");if(arguments.length<2){for(var i=Hn(this.node()),r=-1,o=n.length;++r<o;)if(!i.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?Ns:t?xs:Rs)(n,t))}function Ms(){this.textContent=""}function Ds(e){return function(){this.textContent=e}}function Cs(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function Os(e){return arguments.length?this.each(e==null?Ms:(typeof e=="function"?Cs:Ds)(e)):this.node().textContent}function Ls(){this.innerHTML=""}function Fs(e){return function(){this.innerHTML=e}}function ks(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function Ps(e){return arguments.length?this.each(e==null?Ls:(typeof e=="function"?ks:Fs)(e)):this.node().innerHTML}function zs(){this.nextSibling&&this.parentNode.appendChild(this)}function Gs(){return this.each(zs)}function Bs(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function Us(){return this.each(Bs)}function Hs(e){var t=typeof e=="function"?e:Oi(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function Ws(){return null}function js(e,t){var n=typeof e=="function"?e:Oi(e),i=t==null?Ws:typeof t=="function"?t:Li(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),i.apply(this,arguments)||null)})}function Ks(){var e=this.parentNode;e&&e.removeChild(this)}function Vs(){return this.each(Ks)}function $s(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function Ys(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function Xs(e){return this.select(e?Ys:$s)}function qs(e){return arguments.length?this.property("__data__",e):this.node().__data__}function Zs(e){return function(t){e.call(this,t,this.__data__)}}function Qs(e){return e.trim().split(/^|\\s+/).map(function(t){var n="",i=t.indexOf(".");return i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),{type:t,name:n}})}function Js(e){return function(){var t=this.__on;if(t){for(var n=0,i=-1,r=t.length,o;n<r;++n)o=t[n],(!e.type||o.type===e.type)&&o.name===e.name?this.removeEventListener(o.type,o.listener,o.options):t[++i]=o;++i?t.length=i:delete this.__on}}}function ta(e,t,n){return function(){var i=this.__on,r,o=Zs(t);if(i){for(var a=0,s=i.length;a<s;++a)if((r=i[a]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=n),r.value=t;return}}this.addEventListener(e.type,o,n),r={type:e.type,name:e.name,value:t,listener:o,options:n},i?i.push(r):this.__on=[r]}}function ea(e,t,n){var i=Qs(e+""),r,o=i.length,a;if(arguments.length<2){var s=this.node().__on;if(s){for(var c=0,l=s.length,f;c<l;++c)for(r=0,f=s[c];r<o;++r)if((a=i[r]).type===f.type&&a.name===f.name)return f.value}return}for(s=t?ta:Js,r=0;r<o;++r)this.each(s(i[r],t,n));return this}function Hi(e,t,n){var i=Pi(e),r=i.CustomEvent;typeof r=="function"?r=new r(t,n):(r=i.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function na(e,t){return function(){return Hi(this,e,t)}}function ia(e,t){return function(){return Hi(this,e,t.apply(this,arguments))}}function ra(e,t){return this.each((typeof t=="function"?ia:na)(e,t))}function*oa(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length,a;r<o;++r)(a=i[r])&&(yield a)}var sa=[null];function It(e,t){this._groups=e,this._parents=t}function aa(){return this}It.prototype={constructor:It,select:Io,selectAll:Lo,selectChild:Go,selectChildren:Wo,filter:jo,data:qo,enter:Ko,exit:Qo,join:Jo,merge:ts,selection:aa,order:es,sort:ns,call:rs,nodes:os,node:ss,size:as,empty:ls,each:cs,attr:ms,style:bs,property:Es,classed:Is,text:Os,html:Ps,raise:Gs,lower:Us,append:Hs,insert:js,remove:Vs,clone:Xs,datum:qs,on:ea,dispatch:ra,[Symbol.iterator]:oa};function on(e){return typeof e=="string"?new It([[document.querySelector(e)]],[document.documentElement]):new It([[e]],sa)}function la(e){let t;for(;t=e.sourceEvent;)e=t;return e}function Wi(e,t){if(e=la(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var i=n.createSVGPoint();return i.x=e.clientX,i.y=e.clientY,i=i.matrixTransform(t.getScreenCTM().inverse()),[i.x,i.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}const ca={passive:!1},De={capture:!0,passive:!1};function Wn(e){e.stopImmediatePropagation()}function me(e){e.preventDefault(),e.stopImmediatePropagation()}function ua(e){var t=e.document.documentElement,n=on(e).on("dragstart.drag",me,De);"onselectstart"in t?n.on("selectstart.drag",me,De):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function ha(e,t){var n=e.document.documentElement,i=on(e).on("dragstart.drag",null);t&&(i.on("click.drag",me,De),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in n?i.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var sn=e=>()=>e;function jn(e,{sourceEvent:t,subject:n,target:i,identifier:r,active:o,x:a,y:s,dx:c,dy:l,dispatch:f}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:s,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:l,enumerable:!0,configurable:!0},_:{value:f}})}jn.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function fa(e){return!e.ctrlKey&&!e.button}function da(){return this.parentNode}function pa(e,t){return t??{x:e.x,y:e.y}}function ga(){return navigator.maxTouchPoints||"ontouchstart"in this}function ma(){var e=fa,t=da,n=pa,i=ga,r={},o=zn("start","drag","end"),a=0,s,c,l,f,T=0;function d(y){y.on("mousedown.drag",m).filter(i).on("touchstart.drag",g).on("touchmove.drag",w,ca).on("touchend.drag touchcancel.drag",_).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function m(y,D){if(!(f||!e.call(this,y,D))){var O=N(this,t.call(this,y,D),y,D,"mouse");O&&(on(y.view).on("mousemove.drag",A,De).on("mouseup.drag",b,De),ua(y.view),Wn(y),l=!1,s=y.clientX,c=y.clientY,O("start",y))}}function A(y){if(me(y),!l){var D=y.clientX-s,O=y.clientY-c;l=D*D+O*O>T}r.mouse("drag",y)}function b(y){on(y.view).on("mousemove.drag mouseup.drag",null),ha(y.view,l),me(y),r.mouse("end",y)}function g(y,D){if(e.call(this,y,D)){var O=y.changedTouches,G=t.call(this,y,D),P=O.length,F,z;for(F=0;F<P;++F)(z=N(this,G,y,D,O[F].identifier,O[F]))&&(Wn(y),z("start",y,O[F]))}}function w(y){var D=y.changedTouches,O=D.length,G,P;for(G=0;G<O;++G)(P=r[D[G].identifier])&&(me(y),P("drag",y,D[G]))}function _(y){var D=y.changedTouches,O=D.length,G,P;for(f&&clearTimeout(f),f=setTimeout(function(){f=null},500),G=0;G<O;++G)(P=r[D[G].identifier])&&(Wn(y),P("end",y,D[G]))}function N(y,D,O,G,P,F){var z=o.copy(),Y=Wi(F||O,D),nt,R,C;if((C=n.call(y,new jn("beforestart",{sourceEvent:O,target:d,identifier:P,active:a,x:Y[0],y:Y[1],dx:0,dy:0,dispatch:z}),G))!=null)return nt=C.x-Y[0]||0,R=C.y-Y[1]||0,function K(j,I,B){var Z=Y,ut;switch(j){case"start":r[P]=K,ut=a++;break;case"end":delete r[P],--a;case"drag":Y=Wi(B||I,D),ut=a;break}z.call(j,y,new jn(j,{sourceEvent:I,subject:C,target:d,identifier:P,active:ut,x:Y[0]+nt,y:Y[1]+R,dx:Y[0]-Z[0],dy:Y[1]-Z[1],dispatch:z}),G)}}return d.filter=function(y){return arguments.length?(e=typeof y=="function"?y:sn(!!y),d):e},d.container=function(y){return arguments.length?(t=typeof y=="function"?y:sn(y),d):t},d.subject=function(y){return arguments.length?(n=typeof y=="function"?y:sn(y),d):n},d.touchable=function(y){return arguments.length?(i=typeof y=="function"?y:sn(!!y),d):i},d.on=function(){var y=o.on.apply(o,arguments);return y===o?d:y},d.clickDistance=function(y){return arguments.length?(T=(y=+y)*y,d):Math.sqrt(T)},d}const ji="*",Kn="seed";/*! @license DOMPurify 3.4.7 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.7/LICENSE */function Ki(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,i=Array(t);n<t;n++)i[n]=e[n];return i}function ya(e){if(Array.isArray(e))return e}function _a(e,t){var n=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(n!=null){var i,r,o,a,s=[],c=!0,l=!1;try{if(o=(n=n.call(e)).next,t!==0)for(;!(c=(i=o.call(n)).done)&&(s.push(i.value),s.length!==t);c=!0);}catch(f){l=!0,r=f}finally{try{if(!c&&n.return!=null&&(a=n.return(),Object(a)!==a))return}finally{if(l)throw r}}return s}}function Ta(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ba(e,t){return ya(e)||_a(e,t)||Sa(e,t)||Ta()}function Sa(e,t){if(e){if(typeof e=="string")return Ki(e,t);var n={}.toString.call(e).slice(8,-1);return n==="Object"&&e.constructor&&(n=e.constructor.name),n==="Map"||n==="Set"?Array.from(e):n==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Ki(e,t):void 0}}const Vi=Object.entries,$i=Object.setPrototypeOf,wa=Object.isFrozen,Aa=Object.getPrototypeOf,va=Object.getOwnPropertyDescriptor;let Tt=Object.freeze,Mt=Object.seal,ye=Object.create,Yi=typeof Reflect<"u"&&Reflect,Vn=Yi.apply,$n=Yi.construct;Tt||(Tt=function(t){return t}),Mt||(Mt=function(t){return t}),Vn||(Vn=function(t,n){for(var i=arguments.length,r=new Array(i>2?i-2:0),o=2;o<i;o++)r[o-2]=arguments[o];return t.apply(n,r)}),$n||($n=function(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];return new t(...i)});const _e=ht(Array.prototype.forEach),Ea=ht(Array.prototype.lastIndexOf),Xi=ht(Array.prototype.pop),Te=ht(Array.prototype.push),xa=ht(Array.prototype.splice),bt=Array.isArray,Ce=ht(String.prototype.toLowerCase),Yn=ht(String.prototype.toString),qi=ht(String.prototype.match),be=ht(String.prototype.replace),Zi=ht(String.prototype.indexOf),Ra=ht(String.prototype.trim),Na=ht(Number.prototype.toString),Ia=ht(Boolean.prototype.toString),Qi=typeof BigInt>"u"?null:ht(BigInt.prototype.toString),Ji=typeof Symbol>"u"?null:ht(Symbol.prototype.toString),ct=ht(Object.prototype.hasOwnProperty),Oe=ht(Object.prototype.toString),pt=ht(RegExp.prototype.test),Le=Ma(TypeError);function ht(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];return Vn(e,t,i)}}function Ma(e){return function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];return $n(e,n)}}function W(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Ce;if($i&&$i(e,null),!bt(t))return e;let i=t.length;for(;i--;){let r=t[i];if(typeof r=="string"){const o=n(r);o!==r&&(wa(t)||(t[i]=o),r=o)}e[r]=!0}return e}function Da(e){for(let t=0;t<e.length;t++)ct(e,t)||(e[t]=null);return e}function gt(e){const t=ye(null);for(const i of Vi(e)){var n=ba(i,2);const r=n[0],o=n[1];ct(e,r)&&(bt(o)?t[r]=Da(o):o&&typeof o=="object"&&o.constructor===Object?t[r]=gt(o):t[r]=o)}return t}function Ca(e){switch(typeof e){case"string":return e;case"number":return Na(e);case"boolean":return Ia(e);case"bigint":return Qi?Qi(e):"0";case"symbol":return Ji?Ji(e):"Symbol()";case"undefined":return Oe(e);case"function":case"object":{if(e===null)return Oe(e);const t=e,n=Pt(t,"toString");if(typeof n=="function"){const i=n(t);return typeof i=="string"?i:Oe(i)}return Oe(e)}default:return Oe(e)}}function Pt(e,t){for(;e!==null;){const i=va(e,t);if(i){if(i.get)return ht(i.get);if(typeof i.value=="function")return ht(i.value)}e=Aa(e)}function n(){return null}return n}function Oa(e){try{return pt(e,""),!0}catch{return!1}}const tr=Tt(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Xn=Tt(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),qn=Tt(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),La=Tt(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Zn=Tt(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Fa=Tt(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),er=Tt(["#text"]),nr=Tt(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),Qn=Tt(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),ir=Tt(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),an=Tt(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),ka=Mt(/{{[\\w\\W]*|^[\\w\\W]*}}/g),Pa=Mt(/<%[\\w\\W]*|^[\\w\\W]*%>/g),za=Mt(/\\${[\\w\\W]*/g),Ga=Mt(/^data-[\\-\\w.\\u00B7-\\uFFFF]+$/),Ba=Mt(/^aria-[\\-\\w]+$/),rr=Mt(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\\-:]|$))/i),Ua=Mt(/^(?:\\w+script|data):/i),Ha=Mt(/[\\u0000-\\u0020\\u00A0\\u1680\\u180E\\u2000-\\u2029\\u205F\\u3000]/g),Wa=Mt(/^html$/i),ja=Mt(/^[a-z][.\\w]*(-[.\\w]+)+$/i),zt={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,progressingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Ka=function(){return typeof window>"u"?null:window},Va=function(t,n){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let i=null;const r="data-tt-policy-suffix";n&&n.hasAttribute(r)&&(i=n.getAttribute(r));const o="dompurify"+(i?"#"+i:"");try{return t.createPolicy(o,{createHTML(a){return a},createScriptURL(a){return a}})}catch{return console.warn("TrustedTypes policy "+o+" could not be created."),null}},or=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function sr(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Ka();const t=L=>sr(L);if(t.version="3.4.7",t.removed=[],!e||!e.document||e.document.nodeType!==zt.document||!e.Element)return t.isSupported=!1,t;let n=e.document;const i=n,r=i.currentScript;e.DocumentFragment;const o=e.HTMLTemplateElement,a=e.Node,s=e.Element,c=e.NodeFilter,l=e.NamedNodeMap;l===void 0&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;const f=e.DOMParser,T=e.trustedTypes,d=s.prototype,m=Pt(d,"cloneNode"),A=Pt(d,"remove"),b=Pt(d,"nextSibling"),g=Pt(d,"childNodes"),w=Pt(d,"parentNode"),_=Pt(d,"shadowRoot"),N=Pt(d,"attributes"),y=a&&a.prototype?Pt(a.prototype,"nodeType"):null,D=a&&a.prototype?Pt(a.prototype,"nodeName"):null;if(typeof o=="function"){const L=n.createElement("template");L.content&&L.content.ownerDocument&&(n=L.content.ownerDocument)}let O,G="";const P=n,F=P.implementation,z=P.createNodeIterator,Y=P.createDocumentFragment,nt=P.getElementsByTagName,R=i.importNode;let C=or();t.isSupported=typeof Vi=="function"&&typeof w=="function"&&F&&F.createHTMLDocument!==void 0;const K=ka,j=Pa,I=za,B=Ga,Z=Ba,ut=Ua,mt=Ha,it=ja;let H=rr,q=null;const Qt=W({},[...tr,...Xn,...qn,...Zn,...er]);let J=null;const Jt=W({},[...nr,...Qn,...ir,...an]);let U=Object.seal(ye(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),St=null,te=null;const Ct=Object.seal(ye(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let Ge=!0,Be=!0,Sn=!1,wn=!0,Gt=!1,ce=!0,Wt=!1,Ue=!1,ee=!1,Bt=!1,jt=!1,At=!1,He=!0,We=!1;const An="user-content-";let je=!0,Ut=!1,Kt={},vt=null;const we=W({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Ke=null;const vn=W({},["audio","video","img","source","image","track"]);let Ve=null;const Ht=W({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Vt="http://www.w3.org/1998/Math/MathML",Ae="http://www.w3.org/2000/svg",Et="http://www.w3.org/1999/xhtml";let ne=Et,ve=!1,$t=null;const oi=W({},[Vt,Ae,Et],Yn);let Ot=W({},["mi","mo","mn","ms","mtext"]),$e=W({},["annotation-xml"]);const si=W({},["title","style","font","a","script"]);let ue=null;const ai=["application/xhtml+xml","text/html"],li="text/html";let tt=null,ie=null;const ci=n.createElement("form"),En=function(h){return h instanceof RegExp||h instanceof Function},Ye=function(){let h=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(ie&&ie===h)return;(!h||typeof h!="object")&&(h={}),h=gt(h),ue=ai.indexOf(h.PARSER_MEDIA_TYPE)===-1?li:h.PARSER_MEDIA_TYPE,tt=ue==="application/xhtml+xml"?Yn:Ce,q=ct(h,"ALLOWED_TAGS")&&bt(h.ALLOWED_TAGS)?W({},h.ALLOWED_TAGS,tt):Qt,J=ct(h,"ALLOWED_ATTR")&&bt(h.ALLOWED_ATTR)?W({},h.ALLOWED_ATTR,tt):Jt,$t=ct(h,"ALLOWED_NAMESPACES")&&bt(h.ALLOWED_NAMESPACES)?W({},h.ALLOWED_NAMESPACES,Yn):oi,Ve=ct(h,"ADD_URI_SAFE_ATTR")&&bt(h.ADD_URI_SAFE_ATTR)?W(gt(Ht),h.ADD_URI_SAFE_ATTR,tt):Ht,Ke=ct(h,"ADD_DATA_URI_TAGS")&&bt(h.ADD_DATA_URI_TAGS)?W(gt(vn),h.ADD_DATA_URI_TAGS,tt):vn,vt=ct(h,"FORBID_CONTENTS")&&bt(h.FORBID_CONTENTS)?W({},h.FORBID_CONTENTS,tt):we,St=ct(h,"FORBID_TAGS")&&bt(h.FORBID_TAGS)?W({},h.FORBID_TAGS,tt):gt({}),te=ct(h,"FORBID_ATTR")&&bt(h.FORBID_ATTR)?W({},h.FORBID_ATTR,tt):gt({}),Kt=ct(h,"USE_PROFILES")?h.USE_PROFILES&&typeof h.USE_PROFILES=="object"?gt(h.USE_PROFILES):h.USE_PROFILES:!1,Ge=h.ALLOW_ARIA_ATTR!==!1,Be=h.ALLOW_DATA_ATTR!==!1,Sn=h.ALLOW_UNKNOWN_PROTOCOLS||!1,wn=h.ALLOW_SELF_CLOSE_IN_ATTR!==!1,Gt=h.SAFE_FOR_TEMPLATES||!1,ce=h.SAFE_FOR_XML!==!1,Wt=h.WHOLE_DOCUMENT||!1,Bt=h.RETURN_DOM||!1,jt=h.RETURN_DOM_FRAGMENT||!1,At=h.RETURN_TRUSTED_TYPE||!1,ee=h.FORCE_BODY||!1,He=h.SANITIZE_DOM!==!1,We=h.SANITIZE_NAMED_PROPS||!1,je=h.KEEP_CONTENT!==!1,Ut=h.IN_PLACE||!1,H=Oa(h.ALLOWED_URI_REGEXP)?h.ALLOWED_URI_REGEXP:rr,ne=typeof h.NAMESPACE=="string"?h.NAMESPACE:Et,Ot=ct(h,"MATHML_TEXT_INTEGRATION_POINTS")&&h.MATHML_TEXT_INTEGRATION_POINTS&&typeof h.MATHML_TEXT_INTEGRATION_POINTS=="object"?gt(h.MATHML_TEXT_INTEGRATION_POINTS):W({},["mi","mo","mn","ms","mtext"]),$e=ct(h,"HTML_INTEGRATION_POINTS")&&h.HTML_INTEGRATION_POINTS&&typeof h.HTML_INTEGRATION_POINTS=="object"?gt(h.HTML_INTEGRATION_POINTS):W({},["annotation-xml"]);const v=ct(h,"CUSTOM_ELEMENT_HANDLING")&&h.CUSTOM_ELEMENT_HANDLING&&typeof h.CUSTOM_ELEMENT_HANDLING=="object"?gt(h.CUSTOM_ELEMENT_HANDLING):ye(null);if(U=ye(null),ct(v,"tagNameCheck")&&En(v.tagNameCheck)&&(U.tagNameCheck=v.tagNameCheck),ct(v,"attributeNameCheck")&&En(v.attributeNameCheck)&&(U.attributeNameCheck=v.attributeNameCheck),ct(v,"allowCustomizedBuiltInElements")&&typeof v.allowCustomizedBuiltInElements=="boolean"&&(U.allowCustomizedBuiltInElements=v.allowCustomizedBuiltInElements),Gt&&(Be=!1),jt&&(Bt=!0),Kt&&(q=W({},er),J=ye(null),Kt.html===!0&&(W(q,tr),W(J,nr)),Kt.svg===!0&&(W(q,Xn),W(J,Qn),W(J,an)),Kt.svgFilters===!0&&(W(q,qn),W(J,Qn),W(J,an)),Kt.mathMl===!0&&(W(q,Zn),W(J,ir),W(J,an))),Ct.tagCheck=null,Ct.attributeCheck=null,ct(h,"ADD_TAGS")&&(typeof h.ADD_TAGS=="function"?Ct.tagCheck=h.ADD_TAGS:bt(h.ADD_TAGS)&&(q===Qt&&(q=gt(q)),W(q,h.ADD_TAGS,tt))),ct(h,"ADD_ATTR")&&(typeof h.ADD_ATTR=="function"?Ct.attributeCheck=h.ADD_ATTR:bt(h.ADD_ATTR)&&(J===Jt&&(J=gt(J)),W(J,h.ADD_ATTR,tt))),ct(h,"ADD_URI_SAFE_ATTR")&&bt(h.ADD_URI_SAFE_ATTR)&&W(Ve,h.ADD_URI_SAFE_ATTR,tt),ct(h,"FORBID_CONTENTS")&&bt(h.FORBID_CONTENTS)&&(vt===we&&(vt=gt(vt)),W(vt,h.FORBID_CONTENTS,tt)),ct(h,"ADD_FORBID_CONTENTS")&&bt(h.ADD_FORBID_CONTENTS)&&(vt===we&&(vt=gt(vt)),W(vt,h.ADD_FORBID_CONTENTS,tt)),je&&(q["#text"]=!0),Wt&&W(q,["html","head","body"]),q.table&&(W(q,["tbody"]),delete St.tbody),h.TRUSTED_TYPES_POLICY){if(typeof h.TRUSTED_TYPES_POLICY.createHTML!="function")throw Le(\'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.\');if(typeof h.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw Le(\'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.\');O=h.TRUSTED_TYPES_POLICY,G=O.createHTML("")}else O===void 0&&(O=Va(T,r)),O!==null&&typeof G=="string"&&(G=O.createHTML(""));(C.uponSanitizeElement.length>0||C.uponSanitizeAttribute.length>0)&&q===Qt&&(q=gt(q)),C.uponSanitizeAttribute.length>0&&J===Jt&&(J=gt(J)),Tt&&Tt(h),ie=h},xn=W({},[...Xn,...qn,...La]),Yt=W({},[...Zn,...Fa]),ui=function(h){let v=w(h);(!v||!v.tagName)&&(v={namespaceURI:ne,tagName:"template"});const M=Ce(h.tagName),Q=Ce(v.tagName);return $t[h.namespaceURI]?h.namespaceURI===Ae?v.namespaceURI===Et?M==="svg":v.namespaceURI===Vt?M==="svg"&&(Q==="annotation-xml"||Ot[Q]):!!xn[M]:h.namespaceURI===Vt?v.namespaceURI===Et?M==="math":v.namespaceURI===Ae?M==="math"&&$e[Q]:!!Yt[M]:h.namespaceURI===Et?v.namespaceURI===Ae&&!$e[Q]||v.namespaceURI===Vt&&!Ot[Q]?!1:!Yt[M]&&(si[M]||!xn[M]):!!(ue==="application/xhtml+xml"&&$t[h.namespaceURI]):!1},xt=function(h){Te(t.removed,{element:h});try{w(h).removeChild(h)}catch{A(h)}},Xt=function(h,v){try{Te(t.removed,{attribute:v.getAttributeNode(h),from:v})}catch{Te(t.removed,{attribute:null,from:v})}if(v.removeAttribute(h),h==="is")if(Bt||jt)try{xt(v)}catch{}else try{v.setAttribute(h,"")}catch{}},Rn=function(h){let v=null,M=null;if(ee)h="<remove></remove>"+h;else{const rt=qi(h,/^[\\r\\n\\t ]+/);M=rt&&rt[0]}ue==="application/xhtml+xml"&&ne===Et&&(h=\'<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>\'+h+"</body></html>");const Q=O?O.createHTML(h):h;if(ne===Et)try{v=new f().parseFromString(Q,ue)}catch{}if(!v||!v.documentElement){v=F.createDocument(ne,"template",null);try{v.documentElement.innerHTML=ve?G:Q}catch{}}const V=v.body||v.documentElement;return h&&M&&V.insertBefore(n.createTextNode(M),V.childNodes[0]||null),ne===Et?nt.call(v,Wt?"html":"body")[0]:Wt?v.documentElement:V},Nn=function(h){return z.call(h.ownerDocument||h,h,c.SHOW_ELEMENT|c.SHOW_COMMENT|c.SHOW_TEXT|c.SHOW_PROCESSING_INSTRUCTION|c.SHOW_CDATA_SECTION,null)},qt=function(h){h.normalize();const v=z.call(h.ownerDocument||h,h,c.SHOW_TEXT|c.SHOW_COMMENT|c.SHOW_CDATA_SECTION|c.SHOW_PROCESSING_INSTRUCTION,null);let M=v.nextNode();for(;M;){let Q=M.data;_e([K,j,I],V=>{Q=be(Q,V," ")}),M.data=Q,M=v.nextNode()}},Ee=function(h){const v=D?D(h):null;return typeof v!="string"||tt(v)!=="form"?!1:typeof h.nodeName!="string"||typeof h.textContent!="string"||typeof h.removeChild!="function"||h.attributes!==N(h)||typeof h.removeAttribute!="function"||typeof h.setAttribute!="function"||typeof h.namespaceURI!="string"||typeof h.insertBefore!="function"||typeof h.hasChildNodes!="function"||h.nodeType!==y(h)||h.childNodes!==g(h)},he=function(h){if(!y||typeof h!="object"||h===null)return!1;try{return y(h)===zt.documentFragment}catch{return!1}},xe=function(h){if(!y||typeof h!="object"||h===null)return!1;try{return typeof y(h)=="number"}catch{return!1}};function Lt(L,h,v){_e(L,M=>{M.call(t,h,v,ie)})}const In=function(h){let v=null;if(Lt(C.beforeSanitizeElements,h,null),Ee(h))return xt(h),!0;const M=tt(h.nodeName);if(Lt(C.uponSanitizeElement,h,{tagName:M,allowedTags:q}),ce&&h.hasChildNodes()&&!xe(h.firstElementChild)&&pt(/<[/\\w!]/g,h.innerHTML)&&pt(/<[/\\w!]/g,h.textContent)||ce&&h.namespaceURI===Et&&M==="style"&&xe(h.firstElementChild)||h.nodeType===zt.progressingInstruction||ce&&h.nodeType===zt.comment&&pt(/<[/\\w]/g,h.data))return xt(h),!0;if(St[M]||!(Ct.tagCheck instanceof Function&&Ct.tagCheck(M))&&!q[M]){if(!St[M]&&Dn(M)&&(U.tagNameCheck instanceof RegExp&&pt(U.tagNameCheck,M)||U.tagNameCheck instanceof Function&&U.tagNameCheck(M)))return!1;if(je&&!vt[M]){const V=w(h),rt=g(h);if(rt&&V){const wt=rt.length;for(let Dt=wt-1;Dt>=0;--Dt){const Rt=m(rt[Dt],!0);V.insertBefore(Rt,b(h))}}}return xt(h),!0}return(y?y(h):h.nodeType)===zt.element&&!ui(h)||(M==="noscript"||M==="noembed"||M==="noframes")&&pt(/<\\/no(script|embed|frames)/i,h.innerHTML)?(xt(h),!0):(Gt&&h.nodeType===zt.text&&(v=h.textContent,_e([K,j,I],V=>{v=be(v,V," ")}),h.textContent!==v&&(Te(t.removed,{element:h.cloneNode()}),h.textContent=v)),Lt(C.afterSanitizeElements,h,null),!1)},Mn=function(h,v,M){if(te[v]||He&&(v==="id"||v==="name")&&(M in n||M in ci))return!1;const Q=J[v]||Ct.attributeCheck instanceof Function&&Ct.attributeCheck(v,h);if(!(Be&&!te[v]&&pt(B,v))){if(!(Ge&&pt(Z,v))){if(!Q||te[v]){if(!(Dn(h)&&(U.tagNameCheck instanceof RegExp&&pt(U.tagNameCheck,h)||U.tagNameCheck instanceof Function&&U.tagNameCheck(h))&&(U.attributeNameCheck instanceof RegExp&&pt(U.attributeNameCheck,v)||U.attributeNameCheck instanceof Function&&U.attributeNameCheck(v,h))||v==="is"&&U.allowCustomizedBuiltInElements&&(U.tagNameCheck instanceof RegExp&&pt(U.tagNameCheck,M)||U.tagNameCheck instanceof Function&&U.tagNameCheck(M))))return!1}else if(!Ve[v]){if(!pt(H,be(M,mt,""))){if(!((v==="src"||v==="xlink:href"||v==="href")&&h!=="script"&&Zi(M,"data:")===0&&Ke[h])){if(!(Sn&&!pt(ut,be(M,mt,"")))){if(M)return!1}}}}}}return!0},Xe=W({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Dn=function(h){return!Xe[Ce(h)]&&pt(it,h)},fe=function(h){Lt(C.beforeSanitizeAttributes,h,null);const v=h.attributes;if(!v||Ee(h))return;const M={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:J,forceKeepAttr:void 0};let Q=v.length;for(;Q--;){const V=v[Q],rt=V.name,wt=V.namespaceURI,Dt=V.value,Rt=tt(rt),qe=Dt;let ft=rt==="value"?qe:Ra(qe);if(M.attrName=Rt,M.attrValue=ft,M.keepAttr=!0,M.forceKeepAttr=void 0,Lt(C.uponSanitizeAttribute,h,M),ft=M.attrValue,We&&(Rt==="id"||Rt==="name")&&Zi(ft,An)!==0&&(Xt(rt,h),ft=An+ft),ce&&pt(/((--!?|])>)|<\\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,ft)){Xt(rt,h);continue}if(Rt==="attributename"&&qi(ft,"href")){Xt(rt,h);continue}if(M.forceKeepAttr)continue;if(!M.keepAttr){Xt(rt,h);continue}if(!wn&&pt(/\\/>/i,ft)){Xt(rt,h);continue}Gt&&_e([K,j,I],On=>{ft=be(ft,On," ")});const Cn=tt(h.nodeName);if(!Mn(Cn,Rt,ft)){Xt(rt,h);continue}if(O&&typeof T=="object"&&typeof T.getAttributeType=="function"&&!wt)switch(T.getAttributeType(Cn,Rt)){case"TrustedHTML":{ft=O.createHTML(ft);break}case"TrustedScriptURL":{ft=O.createScriptURL(ft);break}}if(ft!==qe)try{wt?h.setAttributeNS(wt,rt,ft):h.setAttribute(rt,ft),Ee(h)?xt(h):Xi(t.removed)}catch{Xt(rt,h)}}Lt(C.afterSanitizeAttributes,h,null)},re=function(h){let v=null;const M=Nn(h);for(Lt(C.beforeSanitizeShadowDOM,h,null);v=M.nextNode();)if(Lt(C.uponSanitizeShadowNode,v,null),In(v),fe(v),he(v.content)&&re(v.content),(y?y(v):v.nodeType)===zt.element){const V=_?_(v):v.shadowRoot;he(V)&&(oe(V),re(V))}Lt(C.afterSanitizeShadowDOM,h,null)},oe=function(h){const v=y?y(h):h.nodeType;if(v===zt.element){const V=_?_(h):h.shadowRoot;he(V)&&(oe(V),re(V))}const M=g?g(h):h.childNodes;if(!M)return;const Q=[];_e(M,V=>{Te(Q,V)});for(const V of Q)oe(V);if(v===zt.element){const V=D?D(h):null;if(typeof V=="string"&&tt(V)==="template"){const rt=h.content;he(rt)&&oe(rt)}}};return t.sanitize=function(L){let h=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},v=null,M=null,Q=null,V=null;if(ve=!L,ve&&(L="<!-->"),typeof L!="string"&&!xe(L)&&(L=Ca(L),typeof L!="string"))throw Le("dirty is not a string, aborting");if(!t.isSupported)return L;if(Ue||Ye(h),t.removed=[],typeof L=="string"&&(Ut=!1),Ut){const Dt=D?D(L):L.nodeName;if(typeof Dt=="string"){const Rt=tt(Dt);if(!q[Rt]||St[Rt])throw Le("root node is forbidden and cannot be sanitized in-place")}if(Ee(L))throw Le("root node is clobbered and cannot be sanitized in-place");oe(L)}else if(xe(L))v=Rn("<!---->"),M=v.ownerDocument.importNode(L,!0),M.nodeType===zt.element&&M.nodeName==="BODY"||M.nodeName==="HTML"?v=M:v.appendChild(M),oe(M);else{if(!Bt&&!Gt&&!Wt&&L.indexOf("<")===-1)return O&&At?O.createHTML(L):L;if(v=Rn(L),!v)return Bt?null:At?G:""}v&&ee&&xt(v.firstChild);const rt=Nn(Ut?L:v);for(;Q=rt.nextNode();)In(Q),fe(Q),he(Q.content)&&re(Q.content);if(Ut)return Gt&&qt(L),L;if(Bt){if(Gt&&qt(v),jt)for(V=Y.call(v.ownerDocument);v.firstChild;)V.appendChild(v.firstChild);else V=v;return(J.shadowroot||J.shadowrootmode)&&(V=R.call(i,V,!0)),V}let wt=Wt?v.outerHTML:v.innerHTML;return Wt&&q["!doctype"]&&v.ownerDocument&&v.ownerDocument.doctype&&v.ownerDocument.doctype.name&&pt(Wa,v.ownerDocument.doctype.name)&&(wt="<!DOCTYPE "+v.ownerDocument.doctype.name+`>\n`+wt),Gt&&_e([K,j,I],Dt=>{wt=be(wt,Dt," ")}),O&&At?O.createHTML(wt):wt},t.setConfig=function(){let L=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};Ye(L),Ue=!0},t.clearConfig=function(){ie=null,Ue=!1},t.isValidAttribute=function(L,h,v){ie||Ye({});const M=tt(L),Q=tt(h);return Mn(M,Q,v)},t.addHook=function(L,h){typeof h=="function"&&Te(C[L],h)},t.removeHook=function(L,h){if(h!==void 0){const v=Ea(C[L],h);return v===-1?void 0:xa(C[L],v,1)[0]}return Xi(C[L])},t.removeHooks=function(L){C[L]=[]},t.removeAllHooks=function(){C=or()},t}sr();function ar(e=8,t="id-"){const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",i=n+"0123456789-_";let r=n.charAt(Math.floor(Math.random()*n.length));for(let o=1;o<e;o++)r+=i.charAt(Math.floor(Math.random()*i.length));return`${t}${r}`}function $a(e,t,n,i){const r=Math.max(Math.abs(n)/e,Math.abs(i)/t);return r===0?e:1/r}function ln(e,t=new WeakSet){if(typeof e=="function")return;if(e===null||typeof e!="object")return e;const n=e;if(t.has(n))return;if(t.add(n),Array.isArray(e))return e.map(r=>ln(r,t));if(Object.getPrototypeOf(e)!==Object.prototype)return e;const i={};for(const[r,o]of Object.entries(e))typeof o!="function"&&(i[r]=ln(o,t));return i}function lr(e){return!e||e.size===0?[Kn]:[...e.keys()]}function cr(e){return e?new Map([...e].map(([t,n])=>[t,[...n]])):new Map}function ur(e,t){return!e||e.size===0?t===Kn:e.has(t)}function hr(e,t,n,i=Date.now()){const r=e.get(t);if(r){r.some(o=>o.runId===n)||r.push({runId:n,at:i});return}e.set(t,[{runId:n,at:i}])}function fr(e,t,n){if(!e)return!1;const i=e.get(t);if(i){const r=i.filter(o=>o.runId!==n);r.length?e.set(t,r):e.delete(t)}return e.size===0}function dr(e,t){return e?(e.delete(t),e.size===0):t===Kn}let pr=class Hr{constructor(t,n,i,r=ar(),o=[]){E(this,"id");E(this,"data");E(this,"children");E(this,"style");E(this,"edgesOut");E(this,"edgesIn");E(this,"defaultCircleRadius",10);E(this,"x");E(this,"y");E(this,"vx");E(this,"vy");E(this,"fx");E(this,"fy");E(this,"weight");E(this,"frozen");E(this,"visible");E(this,"expanded");E(this,"isChild");E(this,"childrenDepth");E(this,"isParent");E(this,"parentNode");E(this,"_original_object");E(this,"_deepest_node_clone");E(this,"_subgraph");E(this,"_circleRadius",this.defaultCircleRadius);E(this,"_circleRadiusCollapsed",this.defaultCircleRadius);E(this,"_border");E(this,"_dirty");E(this,"_sources");E(this,"_potential");E(this,"domID");this.id=t,this.domID=r,this.data=n??{},this.style=i??{},this.children=[],this.isParent=!1,this.setChildren(o),this._dirty=!0,this.frozen=!1,this.visible=!0,this.expanded=!1,this.isChild=!1,this.childrenDepth=0,this.edgesOut=new Set,this.edgesIn=new Set}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}registerEdgeOut(t){this.edgesOut.add(t)}registerEdgeIn(t){this.edgesIn.add(t)}unregisterEdge(t){this.edgesOut.delete(t),this.edgesIn.delete(t)}emptyEdges(){this.edgesOut.clear(),this.edgesIn.clear()}getConnectedNodes(){return[...this.edgesOut].map(t=>t.to)}getConnectingNodes(){return[...this.edgesIn].map(t=>t.from)}getEdgesOut(){return[...this.edgesOut]}getEdgesIn(){return[...this.edgesIn]}getStyle(){return this.style}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`node-${this.domID}`):null}toDict(t=!1){const n={id:this.id,data:this.data,style:this.style,weight:this.weight};return t||(n.x=this.x,n.y=this.y,n.vx=this.vx,n.vy=this.vy,n.fx=this.fx,n.fy=this.fy),this.hasChildren()&&(n.children=this.children.map(i=>i.toDict(t))),n}toSimulationDTO(){return{id:this.id,data:this.data,style:ln(this.style),weight:this.weight,_circleRadius:this._circleRadius,x:this.x,y:this.y,vx:this.vx,vy:this.vy,fx:this.fx,fy:this.fy}}clone(){const t={...this.data},n={...this.style},i=new Hr(this.id,t,n);return i.x=this.x,i.y=this.y,i.vx=this.vx,i.vy=this.vy,i.fx=this.fx,i.fy=this.fy,i.weight=this.weight,i.frozen=this.frozen,i.visible=this.visible,i.expanded=this.expanded,i.isChild=this.isChild,i.childrenDepth=this.childrenDepth,i.isParent=this.isParent,i.parentNode=this.parentNode,i._circleRadius=this._circleRadius,i.children=this.children.map(r=>r.clone()),this._sources&&(i._sources=new Map([...this._sources].map(([r,o])=>[r,[...o]]))),this._potential&&(i._potential=new Map(this._potential)),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}freeze(){this.frozen=!0,this.fx=this.x,this.fy=this.y}unfreeze(){this.frozen=!1,this.fx=void 0,this.fy=void 0}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}toggleExpand(t){t===void 0?this.expanded?this.collapse():this.expand():t?this.expand():this.collapse(),this.markDirty()}expand(){this.expanded=!0,this._original_object&&(this._original_object.expanded=!0)}collapse(){this.expanded=!1,this._original_object&&(this._original_object.expanded=!1)}degree(){return this.edgesOut.size+this.edgesIn.size}ancestorChain(){const t=[];let n=this.parentNode;for(;n;)t.unshift(n),n=n.parentNode;return t}canvasRepresentative(){for(const t of this.ancestorChain())if(!t.expanded)return t;return this}setCircleRadius(t){this._circleRadius=t,this._border=void 0}getCircleRadius(){return this._circleRadius}setCircleRadiusCollapsed(t){this._circleRadiusCollapsed=t}getCircleRadiusCollapsed(){return this._circleRadiusCollapsed}setBorderBox(t,n){this._border={halfWidth:t/2,halfHeight:n/2}}getBorderBox(t=0){if(this._border)return{halfWidth:this._border.halfWidth+t,halfHeight:this._border.halfHeight+t}}getBorderDistance(t,n,i=0){const r=this._border;return r?$a(r.halfWidth+i,r.halfHeight+i,t,n):this._circleRadius+i}getSources(){return lr(this._sources)}hasSource(t){return ur(this._sources,t)}vouch(t,n){this._sources||(this._sources=new Map),hr(this._sources,t,n)}revokeRun(t,n){return fr(this._sources,t,n)}dropSource(t){return dr(this._sources,t)}cloneLedger(){return cr(this._sources)}setPotential(t,n){var o,a;const i=typeof t=="string"?t:ji,r=typeof t=="string"?n??0:t;if(!r){(o=this._potential)==null||o.delete(i),((a=this._potential)==null?void 0:a.size)===0&&(this._potential=void 0),this.markDirty();return}this._potential||(this._potential=new Map),this._potential.set(i,r),this.markDirty()}getPotential(t=ji){var n;return(n=this._potential)==null?void 0:n.get(t)}getPotentials(){return new Map(this._potential??[])}setChildren(t){this.children=t,this.hasChildren()?this.isParent=!0:this.isParent=!1}unionChildren(t){const n=[],i=new Map(this.children.map(r=>[r.id,r]));for(const r of t){const o=i.get(r.id);if(o){n.push(...o.unionChildren(r.children));continue}this.children.push(r),this.claim(r),i.set(r.id,r),n.push(r,...r.descendants())}return this.isParent=this.hasChildren(),this.markDirty(),n}removeChildById(t){const n=this.children.findIndex(r=>r.id===t);if(n<0)return;const[i]=this.children.splice(n,1);return this.isParent=this.hasChildren(),this.isParent||(this.expanded=!1),this.markDirty(),i}descendants(){return this.children.flatMap(t=>[t,...t.descendants()])}claim(t){t.markAsChild(this,this.childrenDepth+1),t.hide();for(const n of t.children)t.claim(n)}hasChildren(){return this.children.length>0}markAsChild(t,n){this.isChild=!0,this.childrenDepth=n,this.parentNode=t}markAsParent(){this.isParent=!0}setSubgraph(t){this._subgraph=t}getSubgraph(){return this._subgraph}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setDeepestNodeClone(t){this._deepest_node_clone=t}getDeepestNodeClone(){return this._deepest_node_clone}};class cn{constructor(t,n,i,r,o,a=null,s){E(this,"id");E(this,"from");E(this,"to");E(this,"directed");E(this,"data");E(this,"style");E(this,"visible");E(this,"layerVisible");E(this,"visibleIgnoringLayer");E(this,"representedEdges");E(this,"isSynthetic");E(this,"isCrossCluster");E(this,"syntheticTerminalNode");E(this,"syntheticSourceNode");E(this,"_original_object");E(this,"_subgraphFromNode");E(this,"_subgraphToNode");E(this,"_dirty");E(this,"_sources");E(this,"domID");this.id=t,this.domID=ar(),this.from=n,this.to=i,this.directed=a,this.data=r??{},this.style=o??{},this.visible=!0,this.layerVisible=!0,this.visibleIgnoringLayer=!0,this._dirty=!0,this.isSynthetic=s!==void 0,this.syntheticTerminalNode=s,this.from.registerEdgeOut(this),this.to.registerEdgeIn(this)}bindEndpoints(t,n){this.from!==t&&(this.from=t,this.markDirty()),this.to!==n&&(this.to=n,this.markDirty()),t.registerEdgeOut(this),n.registerEdgeIn(this)}get source(){return this.from}get target(){return this.to}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}getStyle(){return this.style}getEdgeStyle(){var t;return((t=this.style)==null?void 0:t.edge)??{}}getLabelStyle(){var t;return((t=this.style)==null?void 0:t.label)??{}}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){const n=this.style,i=t;this.style={...n,...i,edge:{...n.edge,...i.edge},label:{...n.label,...i.label}},this.markDirty()}getGraphElement(){return document?document.getElementById(`edge-${this.domID}`):null}setFrom(t){this.from=t}setTo(t){this.to=t}toDict(){return{id:this.id,from:this.from.id,to:this.to.id,data:this.data,style:this.style}}toSimulationDTO(){return{id:this.id,from:{id:this.from.id},to:{id:this.to.id},data:this.data,style:ln(this.style),directed:this.directed}}clone(){const t={...this.data},n={...this.style},i=new cn(this.id,this.from.clone(),this.to.clone(),t,n,this.directed);return i.visible=this.visible,i.layerVisible=this.layerVisible,i.visibleIgnoringLayer=this.visibleIgnoringLayer,i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visibleIgnoringLayer=!0,this.visible=this.layerVisible}hide(){this.visibleIgnoringLayer=!1,this.visible=!1}setLayerVisible(t){if(this.layerVisible===t)return!1;this.layerVisible=t;const n=t&&this.visibleIgnoringLayer;return this.visible!==n&&(this.visible=n,this.markDirty()),!0}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setSubgraphFromNode(t){this._subgraphFromNode=t}setSubgraphToNode(t){this._subgraphToNode=t}getSubgraphFromNode(){return this._subgraphFromNode}getSubgraphToNode(){return this._subgraphToNode}getSources(){return lr(this._sources)}hasSource(t){return ur(this._sources,t)}vouch(t,n){this._sources||(this._sources=new Map),hr(this._sources,t,n)}revokeRun(t,n){return fr(this._sources,t,n)}dropSource(t){return dr(this._sources,t)}cloneLedger(){return cr(this._sources)}}function Ya(e){return new Worker(self.location.href,{name:e==null?void 0:e.name})}function Xa(){return new Ya}const qa=(e,t,n,i,r)=>new Promise((o,a)=>{const s=Xa();s.postMessage({source:"simulation-worker-wrapper",nodes:e,edges:t,options:n,canvasBCR:i}),s.onmessage=c=>{const{type:l,progress:f,nodes:T,edges:d,elapsedTime:m}=c.data;if(l==="tick"&&typeof f=="number"){r==null||r(f,m);return}l==="done"&&(o({nodes:T,edges:d}),s.terminate())},s.onerror=a});var un=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Za(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Fe={exports:{}};Fe.exports;var gr;function Qa(){return gr||(gr=1,(function(e,t){var n=200,i="__lodash_hash_undefined__",r=800,o=16,a=9007199254740991,s="[object Arguments]",c="[object Array]",l="[object AsyncFunction]",f="[object Boolean]",T="[object Date]",d="[object Error]",m="[object Function]",A="[object GeneratorFunction]",b="[object Map]",g="[object Number]",w="[object Null]",_="[object Object]",N="[object Proxy]",y="[object RegExp]",D="[object Set]",O="[object String]",G="[object Undefined]",P="[object WeakMap]",F="[object ArrayBuffer]",z="[object DataView]",Y="[object Float32Array]",nt="[object Float64Array]",R="[object Int8Array]",C="[object Int16Array]",K="[object Int32Array]",j="[object Uint8Array]",I="[object Uint8ClampedArray]",B="[object Uint16Array]",Z="[object Uint32Array]",ut=/[\\\\^$.*+?()[\\]{}|]/g,mt=/^\\[object .+?Constructor\\]$/,it=/^(?:0|[1-9]\\d*)$/,H={};H[Y]=H[nt]=H[R]=H[C]=H[K]=H[j]=H[I]=H[B]=H[Z]=!0,H[s]=H[c]=H[F]=H[f]=H[z]=H[T]=H[d]=H[m]=H[b]=H[g]=H[_]=H[y]=H[D]=H[O]=H[P]=!1;var q=typeof un=="object"&&un&&un.Object===Object&&un,Qt=typeof self=="object"&&self&&self.Object===Object&&self,J=q||Qt||Function("return this")(),Jt=t&&!t.nodeType&&t,U=Jt&&!0&&e&&!e.nodeType&&e,St=U&&U.exports===Jt,te=St&&q.process,Ct=(function(){try{var u=U&&U.require&&U.require("util").types;return u||te&&te.binding&&te.binding("util")}catch{}})(),Ge=Ct&&Ct.isTypedArray;function Be(u,p,S){switch(S.length){case 0:return u.call(p);case 1:return u.call(p,S[0]);case 2:return u.call(p,S[0],S[1]);case 3:return u.call(p,S[0],S[1],S[2])}return u.apply(p,S)}function Sn(u,p){for(var S=-1,k=Array(u);++S<u;)k[S]=p(S);return k}function wn(u){return function(p){return u(p)}}function Gt(u,p){return u==null?void 0:u[p]}function ce(u,p){return function(S){return u(p(S))}}var Wt=Array.prototype,Ue=Function.prototype,ee=Object.prototype,Bt=J["__core-js_shared__"],jt=Ue.toString,At=ee.hasOwnProperty,He=(function(){var u=/[^.]+$/.exec(Bt&&Bt.keys&&Bt.keys.IE_PROTO||"");return u?"Symbol(src)_1."+u:""})(),We=ee.toString,An=jt.call(Object),je=RegExp("^"+jt.call(At).replace(ut,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$"),Ut=St?J.Buffer:void 0,Kt=J.Symbol,vt=J.Uint8Array;Ut&&Ut.allocUnsafe;var we=ce(Object.getPrototypeOf,Object),Ke=Object.create,vn=ee.propertyIsEnumerable,Ve=Wt.splice,Ht=Kt?Kt.toStringTag:void 0,Vt=(function(){try{var u=hi(Object,"defineProperty");return u({},"",{}),u}catch{}})(),Ae=Ut?Ut.isBuffer:void 0,Et=Math.max,ne=Date.now,ve=hi(J,"Map"),$t=hi(Object,"create"),oi=(function(){function u(){}return function(p){if(!de(p))return{};if(Ke)return Ke(p);u.prototype=p;var S=new u;return u.prototype=void 0,S}})();function Ot(u){var p=-1,S=u==null?0:u.length;for(this.clear();++p<S;){var k=u[p];this.set(k[0],k[1])}}function $e(){this.__data__=$t?$t(null):{},this.size=0}function si(u){var p=this.has(u)&&delete this.__data__[u];return this.size-=p?1:0,p}function ue(u){var p=this.__data__;if($t){var S=p[u];return S===i?void 0:S}return At.call(p,u)?p[u]:void 0}function ai(u){var p=this.__data__;return $t?p[u]!==void 0:At.call(p,u)}function li(u,p){var S=this.__data__;return this.size+=this.has(u)?0:1,S[u]=$t&&p===void 0?i:p,this}Ot.prototype.clear=$e,Ot.prototype.delete=si,Ot.prototype.get=ue,Ot.prototype.has=ai,Ot.prototype.set=li;function tt(u){var p=-1,S=u==null?0:u.length;for(this.clear();++p<S;){var k=u[p];this.set(k[0],k[1])}}function ie(){this.__data__=[],this.size=0}function ci(u){var p=this.__data__,S=fe(p,u);if(S<0)return!1;var k=p.length-1;return S==k?p.pop():Ve.call(p,S,1),--this.size,!0}function En(u){var p=this.__data__,S=fe(p,u);return S<0?void 0:p[S][1]}function Ye(u){return fe(this.__data__,u)>-1}function xn(u,p){var S=this.__data__,k=fe(S,u);return k<0?(++this.size,S.push([u,p])):S[k][1]=p,this}tt.prototype.clear=ie,tt.prototype.delete=ci,tt.prototype.get=En,tt.prototype.has=Ye,tt.prototype.set=xn;function Yt(u){var p=-1,S=u==null?0:u.length;for(this.clear();++p<S;){var k=u[p];this.set(k[0],k[1])}}function ui(){this.size=0,this.__data__={hash:new Ot,map:new(ve||tt),string:new Ot}}function xt(u){var p=Ln(this,u).delete(u);return this.size-=p?1:0,p}function Xt(u){return Ln(this,u).get(u)}function Rn(u){return Ln(this,u).has(u)}function Nn(u,p){var S=Ln(this,u),k=S.size;return S.set(u,p),this.size+=S.size==k?0:1,this}Yt.prototype.clear=ui,Yt.prototype.delete=xt,Yt.prototype.get=Xt,Yt.prototype.has=Rn,Yt.prototype.set=Nn;function qt(u){var p=this.__data__=new tt(u);this.size=p.size}function Ee(){this.__data__=new tt,this.size=0}function he(u){var p=this.__data__,S=p.delete(u);return this.size=p.size,S}function xe(u){return this.__data__.get(u)}function Lt(u){return this.__data__.has(u)}function In(u,p){var S=this.__data__;if(S instanceof tt){var k=S.__data__;if(!ve||k.length<n-1)return k.push([u,p]),this.size=++S.size,this;S=this.__data__=new Yt(k)}return S.set(u,p),this.size=S.size,this}qt.prototype.clear=Ee,qt.prototype.delete=he,qt.prototype.get=xe,qt.prototype.has=Lt,qt.prototype.set=In;function Mn(u,p){var S=pi(u),k=!S&&di(u),X=!S&&!k&&kr(u),ot=!S&&!k&&!X&&zr(u),st=S||k||X||ot,et=st?Sn(u.length,String):[],at=et.length;for(var Ft in u)st&&(Ft=="length"||X&&(Ft=="offset"||Ft=="parent")||ot&&(Ft=="buffer"||Ft=="byteLength"||Ft=="byteOffset")||Lr(Ft,at))||et.push(Ft);return et}function Xe(u,p,S){(S!==void 0&&!Fn(u[p],S)||S===void 0&&!(p in u))&&re(u,p,S)}function Dn(u,p,S){var k=u[p];(!(At.call(u,p)&&Fn(k,S))||S===void 0&&!(p in u))&&re(u,p,S)}function fe(u,p){for(var S=u.length;S--;)if(Fn(u[S][0],p))return S;return-1}function re(u,p,S){p=="__proto__"&&Vt?Vt(u,p,{configurable:!0,enumerable:!0,value:S,writable:!0}):u[p]=S}var oe=vc();function L(u){return u==null?u===void 0?G:w:Ht&&Ht in Object(u)?Ec(u):Dc(u)}function h(u){return Ze(u)&&L(u)==s}function v(u){if(!de(u)||Ic(u))return!1;var p=mi(u)?je:mt;return p.test(Fc(u))}function M(u){return Ze(u)&&Pr(u.length)&&!!H[L(u)]}function Q(u){if(!de(u))return Mc(u);var p=Fr(u),S=[];for(var k in u)k=="constructor"&&(p||!At.call(u,k))||S.push(k);return S}function V(u,p,S,k,X){u!==p&&oe(p,function(ot,st){if(X||(X=new qt),de(ot))rt(u,p,st,S,V,k,X);else{var et=k?k(fi(u,st),ot,st+"",u,p,X):void 0;et===void 0&&(et=ot),Xe(u,st,et)}},Gr)}function rt(u,p,S,k,X,ot,st){var et=fi(u,S),at=fi(p,S),Ft=st.get(at);if(Ft){Xe(u,S,Ft);return}var Nt=ot?ot(et,at,S+"",u,p,st):void 0,Qe=Nt===void 0;if(Qe){var yi=pi(at),_i=!yi&&kr(at),Ur=!yi&&!_i&&zr(at);Nt=at,yi||_i||Ur?pi(et)?Nt=et:kc(et)?Nt=Cn(et):_i?(Qe=!1,Nt=Rt(at)):Ur?(Qe=!1,Nt=ft(at)):Nt=[]:Pc(at)||di(at)?(Nt=et,di(et)?Nt=zc(et):(!de(et)||mi(et))&&(Nt=xc(at))):Qe=!1}Qe&&(st.set(at,Nt),X(Nt,at,k,ot,st),st.delete(at)),Xe(u,S,Nt)}function wt(u,p){return Oc(Cc(u,p,Br),u+"")}var Dt=Vt?function(u,p){return Vt(u,"toString",{configurable:!0,enumerable:!1,value:Bc(p),writable:!0})}:Br;function Rt(u,p){return u.slice()}function qe(u){var p=new u.constructor(u.byteLength);return new vt(p).set(new vt(u)),p}function ft(u,p){var S=qe(u.buffer);return new u.constructor(S,u.byteOffset,u.length)}function Cn(u,p){var S=-1,k=u.length;for(p||(p=Array(k));++S<k;)p[S]=u[S];return p}function On(u,p,S,k){var X=!S;S||(S={});for(var ot=-1,st=p.length;++ot<st;){var et=p[ot],at=void 0;at===void 0&&(at=u[et]),X?re(S,et,at):Dn(S,et,at)}return S}function Ac(u){return wt(function(p,S){var k=-1,X=S.length,ot=X>1?S[X-1]:void 0,st=X>2?S[2]:void 0;for(ot=u.length>3&&typeof ot=="function"?(X--,ot):void 0,st&&Rc(S[0],S[1],st)&&(ot=X<3?void 0:ot,X=1),p=Object(p);++k<X;){var et=S[k];et&&u(p,et,k,ot)}return p})}function vc(u){return function(p,S,k){for(var X=-1,ot=Object(p),st=k(p),et=st.length;et--;){var at=st[++X];if(S(ot[at],at,ot)===!1)break}return p}}function Ln(u,p){var S=u.__data__;return Nc(p)?S[typeof p=="string"?"string":"hash"]:S.map}function hi(u,p){var S=Gt(u,p);return v(S)?S:void 0}function Ec(u){var p=At.call(u,Ht),S=u[Ht];try{u[Ht]=void 0;var k=!0}catch{}var X=We.call(u);return k&&(p?u[Ht]=S:delete u[Ht]),X}function xc(u){return typeof u.constructor=="function"&&!Fr(u)?oi(we(u)):{}}function Lr(u,p){var S=typeof u;return p=p??a,!!p&&(S=="number"||S!="symbol"&&it.test(u))&&u>-1&&u%1==0&&u<p}function Rc(u,p,S){if(!de(S))return!1;var k=typeof p;return(k=="number"?gi(S)&&Lr(p,S.length):k=="string"&&p in S)?Fn(S[p],u):!1}function Nc(u){var p=typeof u;return p=="string"||p=="number"||p=="symbol"||p=="boolean"?u!=="__proto__":u===null}function Ic(u){return!!He&&He in u}function Fr(u){var p=u&&u.constructor,S=typeof p=="function"&&p.prototype||ee;return u===S}function Mc(u){var p=[];if(u!=null)for(var S in Object(u))p.push(S);return p}function Dc(u){return We.call(u)}function Cc(u,p,S){return p=Et(p===void 0?u.length-1:p,0),function(){for(var k=arguments,X=-1,ot=Et(k.length-p,0),st=Array(ot);++X<ot;)st[X]=k[p+X];X=-1;for(var et=Array(p+1);++X<p;)et[X]=k[X];return et[p]=S(st),Be(u,this,et)}}function fi(u,p){if(!(p==="constructor"&&typeof u[p]=="function")&&p!="__proto__")return u[p]}var Oc=Lc(Dt);function Lc(u){var p=0,S=0;return function(){var k=ne(),X=o-(k-S);if(S=k,X>0){if(++p>=r)return arguments[0]}else p=0;return u.apply(void 0,arguments)}}function Fc(u){if(u!=null){try{return jt.call(u)}catch{}try{return u+""}catch{}}return""}function Fn(u,p){return u===p||u!==u&&p!==p}var di=h((function(){return arguments})())?h:function(u){return Ze(u)&&At.call(u,"callee")&&!vn.call(u,"callee")},pi=Array.isArray;function gi(u){return u!=null&&Pr(u.length)&&!mi(u)}function kc(u){return Ze(u)&&gi(u)}var kr=Ae||Uc;function mi(u){if(!de(u))return!1;var p=L(u);return p==m||p==A||p==l||p==N}function Pr(u){return typeof u=="number"&&u>-1&&u%1==0&&u<=a}function de(u){var p=typeof u;return u!=null&&(p=="object"||p=="function")}function Ze(u){return u!=null&&typeof u=="object"}function Pc(u){if(!Ze(u)||L(u)!=_)return!1;var p=we(u);if(p===null)return!0;var S=At.call(p,"constructor")&&p.constructor;return typeof S=="function"&&S instanceof S&&jt.call(S)==An}var zr=Ge?wn(Ge):M;function zc(u){return On(u,Gr(u))}function Gr(u){return gi(u)?Mn(u):Q(u)}var Gc=Ac(function(u,p,S){V(u,p,S)});function Bc(u){return function(){return u}}function Br(u){return u}function Uc(){return!1}e.exports=Gc})(Fe,Fe.exports)),Fe.exports}var Ja=Qa(),hn=Za(Ja);function tl(e){var t=0,n=e.children,i=n&&n.length;if(!i)t=1;else for(;--i>=0;)t+=n[i].value;e.value=t}function el(){return this.eachAfter(tl)}function nl(e,t){let n=-1;for(const i of this)e.call(t,i,++n,this);return this}function il(e,t){for(var n=this,i=[n],r,o,a=-1;n=i.pop();)if(e.call(t,n,++a,this),r=n.children)for(o=r.length-1;o>=0;--o)i.push(r[o]);return this}function rl(e,t){for(var n=this,i=[n],r=[],o,a,s,c=-1;n=i.pop();)if(r.push(n),o=n.children)for(a=0,s=o.length;a<s;++a)i.push(o[a]);for(;n=r.pop();)e.call(t,n,++c,this);return this}function ol(e,t){let n=-1;for(const i of this)if(e.call(t,i,++n,this))return i}function sl(e){return this.eachAfter(function(t){for(var n=+e(t.data)||0,i=t.children,r=i&&i.length;--r>=0;)n+=i[r].value;t.value=n})}function al(e){return this.eachBefore(function(t){t.children&&t.children.sort(e)})}function ll(e){for(var t=this,n=cl(t,e),i=[t];t!==n;)t=t.parent,i.push(t);for(var r=i.length;e!==n;)i.splice(r,0,e),e=e.parent;return i}function cl(e,t){if(e===t)return e;var n=e.ancestors(),i=t.ancestors(),r=null;for(e=n.pop(),t=i.pop();e===t;)r=e,e=n.pop(),t=i.pop();return r}function ul(){for(var e=this,t=[e];e=e.parent;)t.push(e);return t}function hl(){return Array.from(this)}function fl(){var e=[];return this.eachBefore(function(t){t.children||e.push(t)}),e}function dl(){var e=this,t=[];return e.each(function(n){n!==e&&t.push({source:n.parent,target:n})}),t}function*pl(){var e=this,t,n=[e],i,r,o;do for(t=n.reverse(),n=[];e=t.pop();)if(yield e,i=e.children)for(r=0,o=i.length;r<o;++r)n.push(i[r]);while(n.length)}function fn(e,t){e instanceof Map?(e=[void 0,e],t===void 0&&(t=yl)):t===void 0&&(t=ml);for(var n=new ke(e),i,r=[n],o,a,s,c;i=r.pop();)if((a=t(i.data))&&(c=(a=Array.from(a)).length))for(i.children=a,s=c-1;s>=0;--s)r.push(o=a[s]=new ke(a[s])),o.parent=i,o.depth=i.depth+1;return n.eachBefore(Tl)}function gl(){return fn(this).eachBefore(_l)}function ml(e){return e.children}function yl(e){return Array.isArray(e)?e[1]:null}function _l(e){e.data.value!==void 0&&(e.value=e.data.value),e.data=e.data.data}function Tl(e){var t=0;do e.height=t;while((e=e.parent)&&e.height<++t)}function ke(e){this.data=e,this.depth=this.height=0,this.parent=null}ke.prototype=fn.prototype={constructor:ke,count:el,each:nl,eachAfter:rl,eachBefore:il,find:ol,sum:sl,sort:al,path:ll,ancestors:ul,descendants:hl,leaves:fl,links:dl,copy:gl,[Symbol.iterator]:pl};function bl(e,t){return e.parent===t.parent?1:2}function Jn(e){var t=e.children;return t?t[0]:e.t}function ti(e){var t=e.children;return t?t[t.length-1]:e.t}function Sl(e,t,n){var i=n/(t.i-e.i);t.c-=i,t.s+=n,e.c+=i,t.z+=n,t.m+=n}function wl(e){for(var t=0,n=0,i=e.children,r=i.length,o;--r>=0;)o=i[r],o.z+=t,o.m+=t,t+=o.s+(n+=o.c)}function Al(e,t,n){return e.a.parent===t.parent?e.a:n}function dn(e,t){this._=e,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=t}dn.prototype=Object.create(ke.prototype);function vl(e){for(var t=new dn(e,0),n,i=[t],r,o,a,s;n=i.pop();)if(o=n._.children)for(n.children=new Array(s=o.length),a=s-1;a>=0;--a)i.push(r=n.children[a]=new dn(o[a],a)),r.parent=n;return(t.parent=new dn(null,0)).children=[t],t}function El(){var e=bl,t=1,n=1,i=null;function r(l){var f=vl(l);if(f.eachAfter(o),f.parent.m=-f.z,f.eachBefore(a),i)l.eachBefore(c);else{var T=l,d=l,m=l;l.eachBefore(function(_){_.x<T.x&&(T=_),_.x>d.x&&(d=_),_.depth>m.depth&&(m=_)});var A=T===d?1:e(T,d)/2,b=A-T.x,g=t/(d.x+A+b),w=n/(m.depth||1);l.eachBefore(function(_){_.x=(_.x+b)*g,_.y=_.depth*w})}return l}function o(l){var f=l.children,T=l.parent.children,d=l.i?T[l.i-1]:null;if(f){wl(l);var m=(f[0].z+f[f.length-1].z)/2;d?(l.z=d.z+e(l._,d._),l.m=l.z-m):l.z=m}else d&&(l.z=d.z+e(l._,d._));l.parent.A=s(l,d,l.parent.A||T[0])}function a(l){l._.x=l.z+l.parent.m,l.m+=l.parent.m}function s(l,f,T){if(f){for(var d=l,m=l,A=f,b=d.parent.children[0],g=d.m,w=m.m,_=A.m,N=b.m,y;A=ti(A),d=Jn(d),A&&d;)b=Jn(b),m=ti(m),m.a=l,y=A.z+_-d.z-g+e(A._,d._),y>0&&(Sl(Al(A,l,T),l,y),g+=y,w+=y),_+=A.m,g+=d.m,N+=b.m,w+=m.m;A&&!ti(m)&&(m.t=A,m.m+=_-w),d&&!Jn(b)&&(b.t=d,b.m+=g-N,T=l)}return T}function c(l){l.x*=t,l.y=l.depth*n}return r.separation=function(l){return arguments.length?(e=l,r):e},r.size=function(l){return arguments.length?(i=!1,t=+l[0],n=+l[1],r):i?null:[t,n]},r.nodeSize=function(l){return arguments.length?(i=!0,t=+l[0],n=+l[1],r):i?[t,n]:null},r}function mr(e,t){const n=new Set(t.map(i=>i.target.id));for(const i of e)if(!n.has(i.id))return i;return e[0]}const xl=1e6;function yr(e,t){var s;const n=new Map;for(const c of e)n.set(c.id,[]);for(const c of t)(s=n.get(c.from.id))==null||s.push(c.to);let i=0,r=!1,o=null,a=-1;for(const c of e){const l=new Set([c.id]),f=[c];for(;f.length>0&&!r;){const d=f.pop();for(const m of n.get(d.id)??[]){if(++i>xl){r=!0;break}l.has(m.id)||(l.add(m.id),f.push(m))}}const T=l.size-1;if(T>a&&(a=T,o=c),r)break}return r&&console.warn("Pivotick: reachability search hit its traversal cap, using the best root found so far."),o??e[0]}function Rl(e,t){return _r(e,t)}function _r(e,t){const n=new Map,i=new Map;for(const l of e)n.set(l.id,[]),i.set(l.id,0);for(const l of t)l.directed!==!1&&(n.get(l.from.id).push(l.to),i.set(l.to.id,(i.get(l.to.id)||0)+1));const r=[],o=e.filter(l=>i.get(l.id)===0);for(;o.length;){const l=o.shift();r.push(l);for(const f of n.get(l.id))i.set(f.id,i.get(f.id)-1),i.get(f.id)===0&&o.push(f)}if(r.length!==e.length)return console.warn("Pivotick: the graph has a cycle, so no shallowest root is defined — using the first node."),e[0];const a=new Map;for(let l=r.length-1;l>=0;l--){const f=r[l];let T=0;for(const d of n.get(f.id))T=Math.max(T,1+(a.get(d.id)??0));a.set(f.id,T)}let s=null,c=1/0;for(const l of e){const f=a.get(l.id);f<c&&(c=f,s=l)}return s??e[0]}function Nl(e,t,n){var T;const i=new Map(e.map(d=>[d.id,d])),r=new Map(e.map(d=>[d.id,[]]));for(const d of t)!r.has(d.from.id)||!r.has(d.to.id)||(r.get(d.from.id).push(d.to.id),r.get(d.to.id).push(d.from.id));const o=d=>{const m=new Map([[d,0]]),A=new Map,b=[d];for(let g=0;g<b.length;g++){const w=b[g];for(const _ of r.get(w)??[])m.has(_)||(m.set(_,m.get(w)+1),A.set(_,w),b.push(_))}return{levels:m,parentOf:A,farthest:b[b.length-1]}},a=n!==void 0&&r.has(n)?n:(T=e[0])==null?void 0:T.id;if(a===void 0)return e[0];const s=o(a).farthest,{parentOf:c,farthest:l}=o(s),f=[];for(let d=l;d!==void 0;d=c.get(d))f.push(d);return i.get(f[Math.floor(f.length/2)])??e[0]}const Il=24,Ml=16,ei=1,Tr=.1;function ni(e,t){return e?e.measured<=0?mn[1]:e.needed/e.measured*t:ei}function ii(e){if(!Number.isFinite(e))return ei;const t=Math.ceil(e/Tr)*Tr;return Math.min(mn[1],Math.max(ei,Math.round(t*10)/10))}function Dl(e){const t=ni(e.level,e.current.levelSpacing);if(e.radial){const n=ni(e.sibling,e.current.levelSpacing);return{levelSpacing:ii(Math.max(t,n)),siblingSpacing:e.current.siblingSpacing}}return{levelSpacing:ii(t),siblingSpacing:ii(ni(e.sibling,e.current.siblingSpacing))}}function Cl(e,t){return e+t+Il}function Ol(e,t){return e+t+Ml}const Ll=20,br="__pivotick_forest_root__",Sr="__pivotick_tree_spacer__",wr=4096,Fl=5e4,Ar=.5;let vr="";const ri={type:"tree",rootId:void 0,parentKey:void 0,depthKey:void 0,rootIdAlgorithmFinder:"MaxReachability",strength:.25,radial:!1,radialGap:750,spacing:"auto",levelSpacing:1,siblingSpacing:1,horizontal:!1};class ${constructor(t,n,i,r={}){E(this,"graph");E(this,"simulation");E(this,"simulationForces");E(this,"options");E(this,"originalForceStrength");E(this,"canvasBCR");E(this,"levels");E(this,"maxDepth",0);E(this,"autoSpacing");E(this,"parkedIds",new Set);E(this,"positionedNodesByID");this.graph=t,this.simulation=n,this.simulationForces=i,this.options=hn({},ri,r),this.originalForceStrength={link:this.simulationForces.link.strength(),charge:this.simulationForces.charge.strength(),gravity:this.simulationForces.gravity.strength()},this.autoSpacing=r.spacing==="auto"||r.spacing!=="manual"&&r.levelSpacing===void 0&&r.siblingSpacing===void 0,this.positionedNodesByID=new Map,this.levels=new Map,this.setSizes(),this.update(),this.registerForces()}update(){var n,i;if(this.layoutOnce(),!this.autoSpacing||this.positionedNodesByID.size===0)return;const t=Dl(this.measureAutoContext());t.levelSpacing===this.options.levelSpacing&&t.siblingSpacing===this.options.siblingSpacing||(this.options.levelSpacing=t.levelSpacing,this.options.siblingSpacing=t.siblingSpacing,this.layoutOnce(),(i=(n=this.graph.UIManager)==null?void 0:n.physicsFlyout)==null||i.syncAutoSpacing(t))}layoutOnce(){const t=this.graph.getNodes(),n=this.graph.getEdges(),i=this.buildLevels(t,n,this.options),{levels:r,maxDepth:o,parked:a}=i;this.parkedIds=new Set(a);const{nodes:s,nodeById:c}=this.buildTree(t,n,this.options,this.canvasBCR,i);this.positionedNodesByID=c,this.levels=r,this.maxDepth=o,s&&this.setNodePositions(s,this.options)}measureAutoContext(){const t=new Map;for(const[o,a]of this.positionedNodesByID){const s=this.graph.getMutableNode(o);if(!s||this.parkedIds.has(o))continue;const c=s.expanded?s.getCircleRadiusCollapsed():s.getCircleRadius(),l=Number.isFinite(c)?c:0,f=t.get(a.depth)??[];f.push({node:a,radius:l}),t.set(a.depth,f)}const n=[...t.keys()].sort((o,a)=>o-a);let i=null,r=null;for(let o=0;o<n.length;o++){const a=t.get(n[o]),s=o+1<n.length?t.get(n[o+1]):void 0;if(s){const l=Math.max(n[o+1]-n[o],1),f=Math.abs((s[0].node.y??0)-(a[0].node.y??0))/l,T=Cl($.widestOf(a),$.widestOf(s));i=$.tighter(i,{measured:f,needed:T})}const c=[...a].sort((l,f)=>(l.node.x??0)-(f.node.x??0));for(let l=1;l<c.length;l++){const[f,T]=[c[l-1],c[l]],d=this.options.radial?2*(T.node.y??0)*Math.sin(Math.abs((T.node.x??0)-(f.node.x??0))/2):(T.node.x??0)-(f.node.x??0),m=Ol(f.radius,T.radius);r=$.tighter(r,{measured:d,needed:m})}}return{level:i,sibling:r,radial:this.options.radial,current:this.getSpacing()}}static tighter(t,n){if(!t)return n;const i=r=>r.needed/Math.max(r.measured,1e-6);return i(n)>i(t)?n:t}static widestOf(t){return t.reduce((n,i)=>Math.max(n,i.radius),0)}setSizes(){const t=this.graph.renderer.getCanvas();if(!t)throw new Error("Canvas element is not defined in the graph renderer.");this.canvasBCR=t.getBoundingClientRect()}setNodePositions(t,n){for(const i of t){const r=this.graph.getMutableNode(i.data.id);if(r)if(n.radial){const o=i.x??0,a=i.y??0;r.x=a*Math.cos(o-Math.PI/2),r.y=a*Math.sin(o-Math.PI/2),r.fx=r.x,r.fy=r.y}else n.horizontal?(r.x=i.y,r.fx=i.y,r.y=i.x,delete r.fy):(r.x=i.x,r.y=i.y,r.fy=i.y,delete r.fx)}}unsetNodePositions(){this.graph.getMutableNodes().forEach(t=>{delete t.fy,delete t.fx})}registerForces(){const t=this.options.strength??.1;if(this.options.radial){const n=$.radialRingGap(this.options,this.maxDepth),i=Ni(r=>(this.levels.get(r.id)??1)*n,0,0).strength(t);this.simulation.force("tree-radial",i)}else this.simulation.force("tree-y",Mi(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.x)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.y)??0}).strength(t)),this.simulation.force("tree-x",Ii(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.y)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.x)??0}).strength(t));$.adjustOtherSimulationForces(this.simulationForces,this.options)}unregisterLayout(){this.unregisterForces(),this.unsetNodePositions()}unregisterForces(){this.simulation.force("tree-radial",null),this.simulation.force("tree-y",null),this.simulation.force("tree-x",null),$.resetOtherSimulationForces(this.simulationForces,this.originalForceStrength)}static registerForcesOnSimulation(t,n,i,r,o,a,s=this){const c=hn({},ri,o),l=c.strength??.1,f=a.width,T=a.height,d=[f/2,T/2],m=s.buildLevelsStatic(t,n,c),{levels:A,maxDepth:b}=m,{nodeById:g}=s.buildTreeStatic(t,n,c,a,m);if(c.radial){const w=s.radialRingGap(c,b),_=Ni(N=>(A.get(N.id)??1)*w,d[0],d[1]).strength(l);i.force("tree-radial",_)}else i.force("tree-y",Mi(w=>{var _,N;return c.horizontal?((_=g.get(w.id))==null?void 0:_.x)??0:((N=g.get(w.id))==null?void 0:N.y)??0}).strength(l)),i.force("tree-x",Ii(w=>{var _,N;return c.horizontal?((_=g.get(w.id))==null?void 0:_.y)??0:((N=g.get(w.id))==null?void 0:N.x)??0}).strength(l));s.adjustOtherSimulationForces(r,c)}static adjustOtherSimulationForces(t,n){n!=null&&n.radial?(t.link.strength(0),t.charge.strength(0),t.gravity.strength(0)):(t.link.strength(0),t.charge.strength(0),t.gravity.strength(1e-5))}static resetOtherSimulationForces(t,n){t.link.strength(n.link),t.charge.strength(n.charge),t.gravity.strength(n.gravity)}static simulationDone(t,n,i,r){const o=hn({},ri,r);for(const a of t)o.radial?(a.fx=a.x,a.fy=a.y):o.horizontal?(a.fx=a.x,delete a.fy):(a.fy=a.y,delete a.fx)}static radialRingGap(t,n){const i=t.radialGap*$.spacingOf(t).level;return n>0?i/n:i}static spacingOf(t){const n=i=>Number.isFinite(i)?i:1;return{level:n(t.levelSpacing),sibling:n(t.siblingSpacing)}}getSpacing(){const{level:t,sibling:n}=$.spacingOf(this.options);return{levelSpacing:t,siblingSpacing:n}}setSpacing(t){this.autoSpacing=!1,this.options.spacing="manual",t.levelSpacing!==void 0&&(this.options.levelSpacing=t.levelSpacing),t.siblingSpacing!==void 0&&(this.options.siblingSpacing=t.siblingSpacing),this.relayout()}isAutoSpacing(){return this.autoSpacing}getRoot(){return{rootId:this.options.rootId,algorithm:this.options.rootIdAlgorithmFinder}}setRoot(t){"rootId"in t?this.options.rootId=t.rootId:(this.options.rootId=void 0,this.options.rootIdAlgorithmFinder=t.algorithm),this.relayout()}enableAutoSpacing(){this.autoSpacing=!0,this.options.spacing="auto",this.relayout()}relayout(){this.setSizes(),this.update(),this.positionedNodesByID.size!==0&&this.registerForces()}static sizedTreeLayout(t,n){const i=$.spacingOf(t),r=El();if(t.radial)return r.size([2*Math.PI,t.radialGap*i.level]),{treeLayout:r,offset:{x:0,y:0}};const o=t.horizontal?n.width:n.height,a=t.horizontal?n.height:n.width,s=a*i.sibling,c=o*i.level;return r.size([s,c]).separation((l,f)=>{var d,m;const T=((m=(d=l.parent)==null?void 0:d.children)==null?void 0:m.length)??1;return l.parent===f.parent?1.5/T:1.5}),{treeLayout:r,offset:{x:-(s-a)/2,y:-(c-o)/2}}}static packParked(t,n,i,r,o=new Map){if(!t.length)return[];const a=I=>{const B=I.getCircleRadius();return Number.isFinite(B)?B:0},s=2*t.reduce((I,B)=>Math.max(I,a(B)),0)+Ll,c=(I,B,Z,ut)=>({data:I,depth:ut,x:B,y:Z,height:0}),l=n.map(I=>I.x??0),f=n.map(I=>I.y??0),T=t.filter(I=>o.has(I.id)),d=t.filter(I=>!o.has(I.id)),m=I=>o.get(I.id)??0,A=[...new Set(n.map(I=>I.depth))].sort((I,B)=>I-B),b=new Map;for(const I of n)b.set(I.depth,I.y??0);const g=A[0]??0,w=A[A.length-1]??0,_=w>g?((b.get(w)??0)-(b.get(g)??0))/(w-g):s,N=I=>b.get(I)??(A.length?(b.get(g)??0)+(I-g)*_:I*s);if(i.radial){const I=[],B=new Map;for(const it of T){const H=m(it);B.set(H,[...B.get(H)??[],it])}for(const[it,H]of B){const q=n.filter(U=>U.depth===it).map(U=>U.x??0).sort((U,St)=>U-St);let Qt=0,J=2*Math.PI;if(q.length){J=0;for(let U=0;U<q.length;U++){const St=U+1<q.length?q[U+1]:q[0]+2*Math.PI;St-q[U]>J&&(J=St-q[U],Qt=q[U])}}const Jt=J/(H.length+1);H.forEach((U,St)=>I.push(c(U,Qt+Jt*(St+1),N(it),it)))}const Z=new Set(f).size,ut=f.length?Math.max(...f):i.radialGap,mt=Z>0?ut/Z:ut;return d.forEach((it,H)=>I.push(c(it,H*2*Math.PI/d.length,ut+mt,Z+1))),I}if(!n.length){const I=Math.max(1,Math.floor(r.width/s)),B=[],Z=new Map;for(const mt of T){const it=m(mt),H=Z.get(it)??0;Z.set(it,H+1),B.push(c(mt,H*s,it*s,it))}const ut=Z.size?Math.max(...Z.keys())+1:0;return d.forEach((mt,it)=>{const H=ut+Math.floor(it/I);B.push(c(mt,it%I*s,H*s,H))}),B}const y=new Map,D=new Map;for(const I of n){const B=I.y??0,Z=I.x??0;y.set(B,Math.max(y.get(B)??Z,Z)),D.set(I.depth,Math.max(D.get(I.depth)??Z,Z))}const O=[...y.keys()].sort((I,B)=>I-B),G=Math.min(...l),P=Math.max(...l),F=O.length>1?O[1]-O[0]:s,z=[],Y=[],nt=new Map;for(const I of T){const B=m(I),Z=N(B),ut=nt.get(Z)??0,mt=P-ut*s,it=D.get(B);if(it!==void 0&&mt-s<=it){Y.push(I);continue}nt.set(Z,ut+1),z.push(c(I,mt,Z,B))}const R=[...d,...Y];let C=0;for(const[I,B]of O.entries()){if(C>=R.length)break;const Z=nt.get(B)??0,ut=P-Z*s-((y.get(B)??P)+s),mt=Math.floor(ut/s);for(let it=0;it<mt&&C<R.length;it++)z.push(c(R[C++],P-(Z+it)*s,B,I))}const K=Math.max(1,Math.floor((P-G)/s)),j=O[O.length-1];for(let I=0;C<R.length;I++)z.push(c(R[C++],P-I%K*s,j+F*(1+Math.floor(I/K)),O.length));return z}static offsetTree(t,n){if(!(!n.x&&!n.y))for(const i of t)i.x=(i.x??0)+n.x,i.y=(i.y??0)+n.y}buildTree(t,n,i,r,o){return $.buildTreeStatic(t,n,i,r,o)}static isScaffolding(t){return t===br||t.startsWith(Sr)}static buildTreeStatic(t,n,i,r,o){if(!t.length)return{root:null,nodes:[],nodeById:new Map};const a=new Map;for(const F of t){const z=F;z.children=[],a.set(F.id,z)}const{parentOf:s,roots:c,parked:l,levels:f,declaredRows:T}=o??$.buildLevelsStatic(t,n,i);let d=0;const m=()=>({id:`${Sr}${d++}`,children:[]}),A=F=>f.get(F)??0,b=(F,z,Y,nt)=>{let R=F;for(let C=z+1;C<nt&&d<Fl;C++){const K=m();R.children.push(K),R=K}R.children.push(Y)};for(const[F,z]of s){const Y=a.get(F),nt=a.get(z);!Y||!nt||(b(nt,A(z),Y,A(F)),Y.parent=nt)}const g=l.map(F=>a.get(F)).filter(F=>!!F),w=$.hierarchyRootFor(c,a,A,b,m);if(!w){if(!c.length&&g.length){const F=$.packParked(g,[],i,r,T);return{root:null,nodes:F,nodeById:new Map(F.map(z=>[z.data.id,z]))}}throw new Error(`Root node with id "${c[0]}" not found.`)}const{treeLayout:_,offset:N}=$.sizedTreeLayout(i,r),y=fn(w),D=_(y);$.offsetTree(D.descendants(),N);const O=D.descendants().filter(F=>!$.isScaffolding(F.data.id)),G=$.packParked(g,O,i,r,T),P=new Map;for(const F of G)P.set(F.data.id,F);return D.descendants().forEach(F=>{$.isScaffolding(F.data.id)||P.set(F.data.id,F)}),{root:D,nodes:[...O,...G],nodeById:P}}static hierarchyRootFor(t,n,i,r,o){if(t.length===1){const c=n.get(t[0]);if(!c||i(t[0])<=0)return c;const l=o();return r(l,0,c,i(t[0])),l}const a=t.map(c=>n.get(c)).filter(c=>!!c);if(!a.length)return;const s={id:br,children:[]};for(const c of a)r(s,0,c,i(c.id));return s}buildLevels(t,n,i){return $.buildLevelsStatic(t,n,i)}static readDeclaredHierarchy(t,n,i){const r=new Map,o=new Map,a=new Map,s=d=>a.set(d,(a.get(d)??0)+1),c=i?n.parentKey:void 0,l=n.depthKey;if(!c&&!l)return{parentOf:r,rowOf:o,complaints:a};const f=new Set(t.map(d=>d.id));for(const d of t){const m=d.getData();if(l){const g=m[l];if(g!=null&&g!==""){const w=Math.floor(Number(g));Number.isFinite(w)&&w>=0&&w<=wr?o.set(d.id,w):s(`declared depths that are not a row between 0 and ${wr}`)}}if(!c)continue;const A=m[c];if(A==null||A==="")continue;const b=String(A);b===d.id?s("declared parents pointing at their own node"):f.has(b)?r.set(d.id,b):s("declared parents not in the layout")}const T=new Set;for(const d of[...r.keys()]){if(T.has(d))continue;const m=[],A=new Set;let b=d;for(;b!==void 0&&!T.has(b);){if(A.has(b)){r.delete(b),s("declared parent cycles broken");break}A.add(b),m.push(b),b=r.get(b)}for(const g of m)T.add(g)}return{parentOf:r,rowOf:o,complaints:a}}static warnAboutDeclared(t){if(!t.size)return;const n="[Pivotick] Tree layout ignored part of the declared hierarchy: "+[...t].map(([i,r])=>`${r} ${i}`).join(", ")+".";n!==vr&&(vr=n,console.warn(n))}static buildLevelsStatic(t,n,i={}){var nt;if(!t.length)return{levels:new Map,maxDepth:0,nodeCountPerLevel:{},parentOf:new Map,roots:[],parked:[],declaredRows:new Map};const r=i.rootId!==void 0&&t.some(R=>R.id===i.rootId)?i.rootId:void 0,o=$.readDeclaredHierarchy(t,i,r===void 0);let a=r!==void 0;const s=new Map,c=new Map(o.parentOf),l=new Map,f=new Set,T=new Set;for(const R of t)l.set(R.id,[]);for(const{source:R,target:C}of n)(nt=l.get(R.id))==null||nt.push(C.id),f.add(C.id),T.add(R.id),T.add(C.id);for(const[R,C]of o.parentOf)T.add(R),T.add(C),f.add(R);const d=()=>{var R;for(const{source:C,target:K}of n)(R=l.get(K.id))==null||R.push(C.id);a=!0};a&&d();const m=R=>T.has(R)||R===r,A=t.filter(R=>m(R.id)),b=t.filter(R=>!m(R.id)).map(R=>R.id),g=o.parentOf.size>0,w=(R,C)=>{const K=new Set;let j=C;for(;j!==void 0&&!K.has(j);){if(j===R)return!0;K.add(j),j=c.get(j)}return!1},_=new Set,N=R=>{if(_.has(R))return;_.add(R);const C=[R];let K=0;for(;K<C.length;){const j=C[K++];for(const I of l.get(j)??[])_.has(I)||(_.add(I),!c.has(I)&&!(g&&w(I,j))&&c.set(I,j),C.push(I))}},y=[];if(A.length){const R=g?A.filter(j=>!c.has(j.id)):A,C=R.length?R:A;let K=r??$.findRootId(C,n,i.rootIdAlgorithmFinder);if(r===void 0&&$.directedCoverage(K,l,n)<Ar){const j=yr(C,n).id;$.directedCoverage(j,l,n)<Ar&&(d(),K=Nl(C,n,j).id)}N(K);for(const j of A){if(_.has(j.id))continue;const I=A.find(B=>!_.has(B.id)&&!f.has(B.id))??j;N(I.id)}c.has(K)||y.push(K);for(const j of A)j.id!==K&&!c.has(j.id)&&y.push(j.id)}const D=new Map;for(const[R,C]of c){const K=D.get(C)??[];K.push(R),D.set(C,K)}let O=0;const G=(R,C)=>{const K=[[R,C]];for(;K.length;){const[j,I]=K.pop();if(s.has(j))continue;const B=o.rowOf.get(j);B!==void 0&&B<I&&O++;const Z=B!==void 0&&B>I?B:I;s.set(j,Z);for(const ut of D.get(j)??[])K.push([ut,Z+1])}};for(const R of y)G(R,0);for(const R of A)s.has(R.id)||G(R.id,0);O&&o.complaints.set("declared depths clamped to just below their parent",O),$.warnAboutDeclared(o.complaints);const P=y.length>1?1:0;if(P)for(const[R,C]of s)s.set(R,C+P);let F=0;for(const R of s.values())R>F&&(F=R);if(b.length){const R=F+1;for(const C of b){const K=o.rowOf.get(C);s.set(C,K===void 0?R:K+P)}for(const C of s.values())C>F&&(F=C)}const z=new Map;for(const[R,C]of o.rowOf)z.set(R,C+P);const Y={};for(const R of s.values())Y[R]=(Y[R]||0)+1;return{levels:s,maxDepth:F,nodeCountPerLevel:Y,parentOf:c,roots:y,parked:b,declaredRows:z}}static directedCoverage(t,n,i){var s,c;const r=l=>{const f=new Set([t]),T=[t];for(let d=0;d<T.length;d++)for(const m of l.get(T[d])??[])f.has(m)||(f.add(m),T.push(m));return f.size},o=new Map;for(const l of n.keys())o.set(l,[]);for(const{source:l,target:f}of i)(s=o.get(l.id))==null||s.push(f.id),(c=o.get(f.id))==null||c.push(l.id);const a=r(o);return a===0?1:r(n)/a}static findRootId(t,n,i){switch(i){case"FirstZeroInDegree":return mr(t,n).id;case"MaxReachability":return yr(t,n).id;case"MinMaxDistance":return Rl(t,n).id;case"MinHeight":return _r(t,n).id;default:return mr(t,n).id}}}class le extends ${constructor(t,n,i,r){super(t,n,i,{...r,type:"tree"})}static registerForcesOnSimulation(t,n,i,r,o,a){$.registerForcesOnSimulation(t,n,i,r,o,a,le)}buildTree(t,n,i,r){return le.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const A of t){const b=A;b.children=[],o.set(A.id,b)}if(!i.rootId||!o.get(i.rootId))throw new Error("Ego Tree can only be created with a rootId");const a=i.rootId,s=o.get(a);if(s.children=[],!s)throw new Error(`Root node with id "${a}" not found.`);const c=new Set([s.id]);for(const A of n){const b=o.get(A.source.id),g=o.get(A.target.id);if(!b||!g)continue;const w=A.source.id===s.id?g:A.target.id===s.id?b:void 0;!w||c.has(w.id)||(c.add(w.id),s.children.push(w),w.parent=s)}const{treeLayout:l,offset:f}=le.sizedTreeLayout(i,r),T=fn(s),d=l(T);le.offsetTree(d.descendants(),f);const m=new Map;return d.descendants().forEach(A=>{m.set(A.data.id,A)}),{root:d,nodes:d.descendants(),nodeById:m}}}function kl(e){var n;const t=(n=e.getData())==null?void 0:n.label;return typeof t=="string"?t:""}const Er=.3,Pl=1,xr=4,zl=400,Gl=24,Bl=6.5,Ul=10,Hl=140,Wl=1.15,jl=.35,Kl=.35,Vl=.0058,$l=38,Rr=95,Yl=300,Xl=.35,ql=8,Zl=10,Ql=.54,Nr=24,Jl=62,tc=.2,ec=240,nc=.9,pn=.001,ic=.06,rc=.03,oc=8,Ir=.002;function Se(e,t,n){return Math.max(t,Math.min(n,e))}function Pe(e){return Se(e,0,1)}function gn(e,t){const[n,i]=lt[t];return Se(e,n,i)}function sc(e){return Er+(Pl-Er)*Mr(e)}function Mr(e){return Pe(Math.log10(Math.max(e,1)/xr)/Math.log10(zl/xr))}function Dr(e){const t=10+Math.sqrt(Math.max(0,e-10));return t*t/100}function ac(e,t){const n=Math.pow(Math.max(1,t)/Zl,Ql),i=$l*Math.pow(Yl/Math.max(1,e),Xl);return Se(i*n,ql,Rr)}function lc(e,t,n){const i=e/Dr(t);return Se(i/400*100,ac(n,t),Rr)}function cc(e,t){return e/100*400*Dr(t)}function uc(e){const t=(e-.6)/1.7999999999999998;return gn(4+t*56,"collisionRadius")}function hc(e,t,n,i){const r=Math.max(1,nc*.5*Math.min(t.width,t.height)),o=ec*n*e/(r*r*r),a=pn+(rc-pn)*Math.pow(1-Mr(n),3),s=pn+(ic-pn)*Pe(i),c=Math.max(a,s),l=Se(o,Ir,Math.max(Ir,c));return gn(100*Math.sqrt(Pe(l/tc)),"centering")}function fc(e){return gn(1.2+.8*Math.log10(Math.max(e,1)),"settleTime")}function dc(e){const t=Pe(Math.log10(Math.max(e,1)/4)/Math.log10(125));return Nr+(Jl-Nr)*t}function pc(e){return{repulsion:Math.round(e.repulsion),linkDistance:Math.round(e.linkDistance),collisionRadius:Math.round(e.collisionRadius),friction:Math.round(e.friction),centering:Math.round(e.centering),settleTime:Math.round(e.settleTime*10)/10}}function gc(e){const t=sc(e.nodeCount)*e.canvas.width*e.canvas.height;return{targetArea:t,spacing:Math.sqrt(t/Math.max(1,e.nodeCount))}}function mc(e){const{spacing:t}=gc(e),n=Math.max(1,e.radii.mean),i=Math.max(.8*t,Bl*n),r=2*n+Gl,o=Math.min(lt.linkDistance[1],Ul*n+Hl),a=gn(Se(i,r,Math.max(r,o)),"linkDistance"),s=Vl*t*t,c=e.radii.totalArea/Math.max(1,e.nodeCount*a*a),l=Wl+jl*Pe(c/Kl),f=lc(s,n,e.nodeCount);return pc({repulsion:f,linkDistance:a,collisionRadius:uc(l),friction:dc(e.nodeCount),centering:hc(cc(f,n),e.canvas,e.nodeCount,e.looseNodeFraction),settleTime:fc(e.nodeCount)})}function yc(e,t){const n=new Map;for(const a of e)n.set(a,a);const i=a=>{let s=a;for(;n.get(s)!==s;)s=n.get(s);let c=a;for(;n.get(c)!==s;){const l=n.get(c);n.set(c,s),c=l}return s};let r=e.length;for(const[a,s]of t){if(!n.has(a)||!n.has(s))continue;const c=i(a),l=i(s);c!==l&&(n.set(c,l),r--)}let o=0;if(r>1){const a=new Map;for(const s of e){const c=i(s);a.set(c,(a.get(c)??0)+1)}for(const s of a.values())s<oc&&(o+=s)}return{count:r,looseNodeFraction:e.length?o/e.length:0}}const ze={d3Alpha:1,d3AlphaMin:.001,d3AlphaDecay:.05,d3AlphaTarget:0,d3VelocityDecay:.45,d3LinkDistance:40,d3LinkStrength:null,d3ManyBodyStrength:-150,d3ManyBodyTheta:.9,d3CollideRadius:12,d3CollideRadiusMultiplier:1.2,d3CollideStrength:1,d3CollideIterations:1,d3GravityStrength:.1,d3GravityStrengthConnected:.001,enabled:!0,cooldownTime:2e3,useWorker:!0,warmupTicks:"auto",freezeNodesOnDrag:!0,gridSnappingEnabled:!1,gridSize:50,fitViewOnExpandCollapse:!1,layout:{type:"force"},callbacks:{onInit:()=>{},onStart:()=>{},onStop:()=>{},onTick:()=>{}}},lt={repulsion:[0,100],linkDistance:[40,600],collisionRadius:[4,60],friction:[0,100],centering:[0,100],settleTime:[.5,8]},mn=[.5,10],_c="MaxReachability",Tc={levelSpacing:1,siblingSpacing:1},bc={tight:{repulsion:32,linkDistance:70,collisionRadius:16,friction:45,centering:7,settleTime:3},loose:{repulsion:70,linkDistance:150,collisionRadius:26,friction:28,centering:7,settleTime:2.25}},x=class x{constructor(t,n={}){E(this,"simulation");E(this,"graph");E(this,"container");E(this,"graphInteraction");E(this,"layout");E(this,"containerBCR");E(this,"containerObserver");E(this,"animationFrameId",null);E(this,"startSimulationTime",0);E(this,"engineRunning",!1);E(this,"slowTickThresholdReached",!1);E(this,"avgTickDuration",0);E(this,"SLOW_TICK_THRESHOLD",33);E(this,"dragInProgress",!1);E(this,"dragSelection",[]);E(this,"totalTickCount",0);E(this,"runTickCount",0);E(this,"options");E(this,"callbacks");E(this,"simulationForces");E(this,"scaledForces",{d3ManyBodyStrength:ze.d3ManyBodyStrength,d3CollideStrength:ze.d3CollideStrength});E(this,"physicsKnobs");E(this,"autoEnabled");E(this,"autoTuneTimer",null);E(this,"applyingAutoKnobs",!1);E(this,"suppressReheat",!1);E(this,"autoLastRun",null);if(this.graph=t,this.autoEnabled=x.shouldAutoTune(n),this.options=hn({},ze,n),this.callbacks=this.options.callbacks??{},this.physicsKnobs=x.knobsFromOptions(this.options),this.container=this.graph.renderer.getRootContainer(),!this.container)throw new Error("Root container is not defined in the graph renderer.");if(this.containerBCR=x.measureContainer(this.container),this.graphInteraction=this.graph.renderer.getGraphInteraction(),!this.graphInteraction)throw new Error("Graph interaction is not available.");const i=x.initSimulationForces(this.options,this.containerBCR);this.simulation=i.simulation,this.simulationForces=i.simulationForces,this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength||ze.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=this.options.d3CollideStrength||ze.d3CollideStrength,this.options.layout.type==="tree"?this.layout=new $(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="egoTree"&&(this.layout=new le(this.graph,this.simulation,this.simulationForces,this.options.layout)),this.layout&&Object.assign(this.options.layout,this.layout.getSpacing()),this.observeContainer(),this.callbacks.onInit&&this.callbacks.onInit(this)}static measureContainer(t){const n=t.getBoundingClientRect();if(n.width>0&&n.height>0)return n;const{width:i,height:r}=x.FALLBACK_CONTAINER_SIZE;return new DOMRect(n.x,n.y,i,r)}observeContainer(){!this.container||typeof ResizeObserver>"u"||(this.containerObserver=new ResizeObserver(()=>{if(!this.container)return;const t=x.measureContainer(this.container);t.width===this.containerBCR.width&&t.height===this.containerBCR.height||(this.containerBCR=t,x.initSimulationForceGravity(this.simulationForces.gravity,this.options,t),this.scheduleTune())}),this.containerObserver.observe(this.container))}destroy(){var t;this.stop(),(t=this.containerObserver)==null||t.disconnect(),this.containerObserver=void 0,this.container=void 0}static initSimulationForces(t,n){const i={link:ao(),charge:vo(),collide:oo(),gravity:Eo()},r=Ao().force("link",i.link).force("charge",i.charge).force("collide",i.collide).force("gravity",i.gravity);return this.initSimulationForceGravity(i.gravity,t,n),this.initSimulationForceLink(i.link,t),this.initSimulationForceCharge(i.charge,t),this.initSimulationForceCollide(i.collide,t),r.alphaMin(t.d3AlphaMin),r.alphaDecay(t.d3AlphaDecay),r.alphaTarget(0),r.velocityDecay(t.d3VelocityDecay),{simulation:r,simulationForces:i}}static initSimulationForceGravity(t,n,i){t.x(i.width/2).y(i.height/2).strength(r=>(r.degree()??0)===0?n.d3GravityStrength:n.d3GravityStrengthConnected)}static initSimulationForceLink(t,n){t.distance(i=>{const r=i.__clusterAnchorDistance;if(r!=null)return r;const o=kl(i);if(!o||o==="")return n.d3LinkDistance;const a=o.length*10;return Math.max(n.d3LinkDistance,a)}),n.d3LinkStrength&&t.strength(n.d3LinkStrength)}static initSimulationForceCharge(t,n){t.theta(n.d3ManyBodyTheta).strength(i=>{const r=i,o=n.d3ManyBodyStrength,a=r.expanded?r.getCircleRadiusCollapsed():r.getCircleRadius(),s=10+Math.sqrt(Math.max(0,a-10));let c=r.weight??1;return c*=r.isParent?10:1,o*(s*s)/100*c})}static initSimulationForceCollide(t,n){const i=n.d3CollideRadiusMultiplier;t.radius(r=>{const o=r;return o.expanded?i*o.getCircleRadius()+20:o.getCircleRadius()?i*o.getCircleRadius():n.d3CollideRadius}).strength(n.d3CollideStrength)}static initSimulationForceClusterRadialConstraint(t,n){t.strength(n.d3CollideStrength)}update(){this.layout?(this.layout.update(),Object.assign(this.options.layout,this.layout.getSpacing())):this.scheduleTune();const t=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(t);const n=this.simulation.force("link");n&&n.id(i=>i.id).links(this.getActiveEdges()),this.restart()}getActiveEdges(){const t=new Set(this.graph.getMutableNodes().filter(a=>a.visible).map(a=>a.id)),n=a=>{let s=a;for(;s&&!t.has(s.id);)s=s.parentNode;return s},i=(a,s)=>a<s?`${a}|${s}`:`${s}|${a}`,r=[],o=new Set;for(const a of this.graph.getMutableEdges()){if(!a.visibleIgnoringLayer)continue;const s=a.source,c=a.target;if(!s.isChild&&!c.isChild){r.push(a),o.add(i(s.id,c.id));continue}if(s.isChild&&c.isChild)continue;const l=s.isChild?c:s,f=n(s.isChild?s:c);if(!f||f.id===l.id)continue;const T=i(l.id,f.id);o.has(T)||(o.add(T),r.push(this.clusterAnchorLink(l,f)))}return r}clusterAnchorLink(t,n){return{id:`cluster-anchor-${t.id}-${n.id}`,source:t,target:n,__clusterAnchorDistance:n.getCircleRadius()+this.options.d3LinkDistance}}enable(){this.avgTickDuration=0,this.options.enabled=!0,this.start(!1)}disable(){this.options.enabled=!1,this.stop()}pause(){this.engineRunning=!1,this.slowTickThresholdReached=!1}restart(){this.startSimulationTime=new Date().getTime(),this.runTickCount=0,this.engineRunning=!0,this.slowTickThresholdReached=!1}async start(t=!0){if(t&&(this.tuneNow({reheat:!1}),await this.runSimulationWorkerRouter()),!this.options.enabled){this.engineRunning=!1;return}this.engineRunning=!0,this.slowTickThresholdReached=!1,this.callbacks.onStart&&this.callbacks.onStart(this),this.animationFrameId===null&&this.startAnimationLoop()}stop(){this.engineRunning=!1,this.autoTuneTimer!==null&&(clearTimeout(this.autoTuneTimer),this.autoTuneTimer=null),this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)}startAnimationLoop(){const t=()=>{this.animationFrameId=requestAnimationFrame(t),this.simulationTick()};this.engineRunning=!0,this.simulation.alpha(.01).restart(),this.animationFrameId=requestAnimationFrame(t)}simulationTick(){if(this.engineRunning){!this.dragInProgress&&this.cooledDown()&&(this.engineRunning=!1,this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)),this.totalTickCount++,this.runTickCount++;const t=performance.now();this.simulation.tick(),this.graph.nextTick(),this.updateTickMetrics(performance.now()-t),this.callbacks.onTick&&this.callbacks.onTick(this),this.graphInteraction.simulationTick(),this.totalTickCount%10===0&&this.graphInteraction.simulationSlowTick()}}cooledDown(){const t=this.options.cooldownTime/1e3*x.NOMINAL_FPS;return this.runTickCount>=t||this.options.d3AlphaMin>0&&this.simulation.alpha()<this.options.d3AlphaMin?!0:new Date().getTime()-this.startSimulationTime>this.options.cooldownTime*x.COOLDOWN_WALL_GRACE}updateTickMetrics(t){var n;this.avgTickDuration=this.avgTickDuration*.9+t*.1,this.avgTickDuration>this.SLOW_TICK_THRESHOLD&&(this.slowTickThresholdReached=!0,this.disable(),this.graph.UIManager.showNotification({level:"warning",title:"Physics engine running slow",message:"The physic has been disabled."}),(n=this.graph.UIManager.physicsFlyout)==null||n.syncRunState())}async waitForSimulationStop(){if(this.engineRunning)return new Promise(t=>{const n=this.callbacks.onStop;this.callbacks.onStop=i=>{n==null||n(i),this.callbacks.onStop=n,t()}})}isEnabled(){return this.options.enabled}applyComputedPositions(t){const n=new Map(t.map(i=>[i.id,i]));for(const i of this.graph.getMutableNodes()){const r=n.get(i.id);r&&(i.x=r.x,i.y=r.y,i.fx=typeof r.fx=="number"?r.fx:void 0,i.fy=typeof r.fy=="number"?r.fy:void 0)}}async computeGraph(t={}){const{runSimulation:n}=await Promise.resolve().then(function(){return wc}),i=this.containerBCR,r=this.graph.getMutableNodes(),o=this.graph.getNodes(),a=this.graph.getEdges(),{callbacks:s,...c}=this.options;Object.assign(c,t);const{nodes:l}=n(o,a,c,i);this.applyComputedPositions(l),this.graph.updateData(r,void 0,!1)}async runSimulationWorkerRouter(t={}){if(this.options.useWorker)try{await this.runSimulationWorker(t);return}catch(n){this.options.useWorker=!1,console.warn("[Pivotick] Simulation Web Worker unavailable (often a CSP blocking blob workers); falling back to the main thread. Set `simulation.useWorker: false` to silence this.",n)}await this.computeGraph(t),this.graph.updateLayoutProgress(100,0,"done")}async runSimulationWorker(t={}){const n=this.containerBCR,i=this.graph.getMutableNodes(),r=this.graph.getNodes().map(f=>f.toSimulationDTO()),o=this.graph.getEdges().map(f=>f.toSimulationDTO()),a=(f,T)=>{this.graph.updateLayoutProgress(f,T,"simulation")},{callbacks:s,...c}=this.options;Object.assign(c,t);const{nodes:l}=await qa(r,o,c,n,a);this.graph.updateLayoutProgress(100,0,"rendering"),this.applyComputedPositions(l),this.graph.updateData(i,void 0,!1),this.graph.updateLayoutProgress(100,0,"done")}reheat(t=.7){this.restart(),this.simulation.alpha(t).restart()}refreshForcesAndReheat(t=.5){if(!this.options.enabled)return;this.tuneNow({reheat:!1});const n=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(n),this.reheat(t)}setRepulsion(t){const n=x.clamp(t,lt.repulsion);this.physicsKnobs.repulsion=n,this.options.d3ManyBodyStrength=x.mapLinear(n,lt.repulsion,x.REPULSION_STRENGTH_RANGE),this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength,x.initSimulationForceCharge(this.simulationForces.charge,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setLinkDistance(t){const n=x.clamp(t,lt.linkDistance);this.physicsKnobs.linkDistance=n,this.options.d3LinkDistance=x.mapLinear(n,lt.linkDistance,x.LINK_DISTANCE_RANGE),x.initSimulationForceLink(this.simulationForces.link,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setCollisionRadius(t){const n=x.clamp(t,lt.collisionRadius);this.physicsKnobs.collisionRadius=n,this.options.d3CollideRadiusMultiplier=x.mapLinear(n,lt.collisionRadius,x.COLLIDE_MULTIPLIER_RANGE),x.initSimulationForceCollide(this.simulationForces.collide,this.options),this.noteManualKnobEdit(),this.reheatIfEnabled()}setFriction(t){const n=x.clamp(t,lt.friction);this.physicsKnobs.friction=n,this.options.d3VelocityDecay=x.mapLinear(n,lt.friction,x.FRICTION_DECAY_RANGE),this.simulation.velocityDecay(this.options.d3VelocityDecay),this.noteManualKnobEdit()}setCentering(t){const n=x.clamp(t,lt.centering);this.physicsKnobs.centering=n,this.options.d3GravityStrengthConnected=x.gravityForCentering(n),this.options.d3GravityStrength=x.isolatedGravityFor(this.options.d3GravityStrengthConnected),x.initSimulationForceGravity(this.simulationForces.gravity,this.options,this.containerBCR),this.noteManualKnobEdit(),this.reheatIfEnabled()}setSettleTime(t){const n=x.clamp(t,lt.settleTime);this.physicsKnobs.settleTime=n,this.options.d3AlphaDecay=x.alphaDecayForSettleTime(n,this.options.d3AlphaMin),this.options.cooldownTime=n*1e3,this.simulation.alphaDecay(this.options.d3AlphaDecay),this.noteManualKnobEdit()}applyPhysicsPreset(t){this.disableAutoPhysics(),this.writeKnobs(bc[t]),this.reheatIfEnabled(x.CLICK_REHEAT_ALPHA)}writeKnobs(t){this.physicsKnobs={...t},this.options.d3ManyBodyStrength=x.mapLinear(t.repulsion,lt.repulsion,x.REPULSION_STRENGTH_RANGE),this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength,this.options.d3LinkDistance=x.mapLinear(t.linkDistance,lt.linkDistance,x.LINK_DISTANCE_RANGE),this.options.d3CollideRadiusMultiplier=x.mapLinear(t.collisionRadius,lt.collisionRadius,x.COLLIDE_MULTIPLIER_RANGE),this.options.d3VelocityDecay=x.mapLinear(t.friction,lt.friction,x.FRICTION_DECAY_RANGE),this.options.d3GravityStrengthConnected=x.gravityForCentering(t.centering),this.options.d3GravityStrength=x.isolatedGravityFor(this.options.d3GravityStrengthConnected),this.options.d3AlphaDecay=x.alphaDecayForSettleTime(t.settleTime,this.options.d3AlphaMin),this.options.cooldownTime=t.settleTime*1e3,x.initSimulationForceCharge(this.simulationForces.charge,this.options),x.initSimulationForceLink(this.simulationForces.link,this.options),x.initSimulationForceCollide(this.simulationForces.collide,this.options),x.initSimulationForceGravity(this.simulationForces.gravity,this.options,this.containerBCR),this.simulation.velocityDecay(this.options.d3VelocityDecay),this.simulation.alphaDecay(this.options.d3AlphaDecay)}getPhysicsKnobs(){return{...this.physicsKnobs}}getLayoutType(){return this.options.layout.type}getTreeSpacing(){var t;return((t=this.layout)==null?void 0:t.getSpacing())??{...Tc}}setTreeSpacing(t){if(!this.layout)return;const n={};t.levelSpacing!==void 0&&(n.levelSpacing=x.clamp(t.levelSpacing,mn)),t.siblingSpacing!==void 0&&(n.siblingSpacing=x.clamp(t.siblingSpacing,mn)),this.layout.setSpacing(n),Object.assign(this.options.layout,n,{spacing:"manual"}),this.graph.nextTick(),this.reheatIfEnabled()}getTreeRoot(){var t;return((t=this.layout)==null?void 0:t.getRoot())??{algorithm:_c}}setTreeRoot(t){if(!this.layout)return;this.layout.setRoot(t);const n=this.layout.getRoot();Object.assign(this.options.layout,{rootId:n.rootId,rootIdAlgorithmFinder:n.algorithm}),this.graph.nextTick(),this.reheatIfEnabled()}isAutoTreeSpacingEnabled(){var t;return((t=this.layout)==null?void 0:t.isAutoSpacing())??!1}enableAutoTreeSpacing(){this.layout&&(this.layout.enableAutoSpacing(),Object.assign(this.options.layout,{spacing:"auto"}),this.graph.nextTick(),this.reheatIfEnabled())}reheatIfEnabled(t=.5){this.suppressReheat||this.options.enabled&&this.reheat(t)}static clamp(t,[n,i]){return Math.max(n,Math.min(i,t))}static mapLinear(t,n,i){const r=(t-n[0])/(n[1]-n[0]);return i[0]+r*(i[1]-i[0])}static knobsFromOptions(t){const n=(r,o,a)=>Math.round(x.clamp(x.mapLinear(r,o,lt[a]),lt[a])),i=x.settleTimeFromAlphaDecay(t.d3AlphaDecay,t.d3AlphaMin);return{repulsion:n(t.d3ManyBodyStrength,x.REPULSION_STRENGTH_RANGE,"repulsion"),linkDistance:n(t.d3LinkDistance,x.LINK_DISTANCE_RANGE,"linkDistance"),collisionRadius:n(t.d3CollideRadiusMultiplier,x.COLLIDE_MULTIPLIER_RANGE,"collisionRadius"),friction:n(t.d3VelocityDecay,x.FRICTION_DECAY_RANGE,"friction"),centering:Math.round(x.clamp(x.centeringFromGravity(t.d3GravityStrengthConnected),lt.centering)),settleTime:Math.round(x.clamp(i,lt.settleTime)*10)/10}}static gravityForCentering(t){const n=t/lt.centering[1];return x.CENTERING_STRENGTH_MAX*n*n}static centeringFromGravity(t){const n=Math.sqrt(Math.max(0,t)/x.CENTERING_STRENGTH_MAX);return lt.centering[1]*n}static isolatedGravityFor(t){const[n,i]=x.CENTERING_ISOLATED_RANGE;return Math.max(n,Math.min(i,t*x.CENTERING_ISOLATED_MULTIPLE))}static alphaDecayForSettleTime(t,n){const i=Math.max(1,t*x.NOMINAL_FPS),r=Math.min(.999,Math.max(1e-6,n));return 1-Math.pow(r,1/i)}static settleTimeFromAlphaDecay(t,n){const i=Math.min(.999,Math.max(1e-6,n)),r=Math.min(.999,Math.max(1e-6,t));return Math.log(i)/Math.log(1-r)/x.NOMINAL_FPS}static shouldAutoTune(t){return t.physics==="auto"?!0:t.physics==="manual"?!1:!x.AUTO_OWNED_OPTIONS.some(n=>t[n]!==void 0)}isAutoPhysicsEnabled(){return this.autoEnabled}enableAutoPhysics(){this.autoEnabled=!0,this.tuneNow({alpha:x.CLICK_REHEAT_ALPHA,force:!0})}disableAutoPhysics(){this.autoEnabled=!1,this.autoTuneTimer!==null&&(clearTimeout(this.autoTuneTimer),this.autoTuneTimer=null)}getAutoRun(){return this.autoLastRun}noteManualKnobEdit(){this.applyingAutoKnobs||this.disableAutoPhysics()}scheduleTune(){this.autoEnabled&&(this.autoTuneTimer!==null&&clearTimeout(this.autoTuneTimer),this.autoTuneTimer=setTimeout(()=>{this.autoTuneTimer=null,this.tuneNow()},x.AUTO_DEBOUNCE_MS))}tuneNow(t={}){var l;const{reheat:n=!0,alpha:i=x.AUTO_REHEAT_ALPHA,force:r=!1}=t;if(!this.autoEnabled||this.options.layout.type!=="force")return;const o=this.buildAutoContext();if(o.nodeCount===0)return;const a=mc(o),c=Object.keys(a).every(f=>{const[T,d]=lt[f];return Math.abs(a[f]-this.physicsKnobs[f])<=(d-T)*x.AUTO_DEADBAND})&&!r;if(this.autoLastRun={context:o,knobs:c?this.getPhysicsKnobs():a,skipped:c},!c){this.applyingAutoKnobs=!0,this.suppressReheat=!0;try{this.writeKnobs(a)}finally{this.suppressReheat=!1,this.applyingAutoKnobs=!1}n&&this.reheatIfEnabled(i),(l=this.graph.UIManager.physicsFlyout)==null||l.syncAutoKnobs(this.getPhysicsKnobs())}}buildAutoContext(){const t=this.containerBCR,n=this.graph.getMutableNodes().filter(c=>c.visible),i=this.getActiveEdges();let r=0,o=0,a=0;for(const c of n){const l=c.expanded?c.getCircleRadiusCollapsed():c.getCircleRadius();r+=l,o=Math.max(o,l),a+=Math.PI*l*l}const s=yc(n.map(c=>c.id),i.map(c=>[c.source.id,c.target.id]));return{canvas:{width:t.width,height:t.height},nodeCount:n.length,radii:{mean:n.length?r/n.length:0,max:o,totalArea:a},edgeCount:i.length,componentCount:s.count,looseNodeFraction:s.looseNodeFraction,current:this.getPhysicsKnobs()}}createDragBehavior(){return ma().filter(()=>!this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement",(t,n)=>{this.graphInteraction.hasActiveMultiselection()?this.dragSelection=this.graphInteraction.getSelectedNodes().map(i=>{const{node:r}=i;return r.freeze(),{node:r,dx:r.x-n.x,dy:r.y-n.y}}):(this.dragSelection=[],n.freeze())}).on("drag.draggedelement",(t,n)=>{if(!this.dragInProgress&&this.isEnabled()&&(this.dragInProgress=!0,this.restart(),this.simulation.alphaTarget(.3).restart()),this.graphInteraction.hasActiveMultiselection())this.dragSelection.forEach(({node:i,dx:r,dy:o})=>{const a=this.applySnap(t.x+r),s=this.applySnap(t.y+o);i.fx=a,i.fy=s,i.x=a,i.y=s});else{const i=this.applySnap(t.x),r=this.applySnap(t.y);n.fx=i,n.fy=r,n.x=i,n.y=r}if(this.graphInteraction.dragging(t.sourceEvent,t.subject),!this.engineRunning||!this.isEnabled()){const i=this.graphInteraction.hasActiveMultiselection()?this.dragSelection.map(r=>r.node):[n];this.graph.nextTickFor(i)}}).on("end.draggedelement",(t,n)=>{!t.active&&this.dragInProgress&&(this.dragInProgress=!1,this.restart(),this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()),this.options.freezeNodesOnDrag||(this.graphInteraction.hasActiveMultiselection()?(this.dragSelection.forEach(({node:i})=>i.unfreeze()),this.dragSelection=[]):n.unfreeze()),this.graphInteraction.dragended(t.sourceEvent,t.subject)})}isDragging(){return this.dragInProgress}toggleGridSnapping(){this.options.gridSnappingEnabled=!this.options.gridSnappingEnabled}toggleFreezeNodesOnDrag(){this.options.freezeNodesOnDrag=!this.options.freezeNodesOnDrag}isFreezeNodesOnDrag(){return this.options.freezeNodesOnDrag}isGridSnappingEnabled(){return this.options.gridSnappingEnabled}toggleFitViewOnExpandCollapse(){this.options.fitViewOnExpandCollapse=!this.options.fitViewOnExpandCollapse}isFitViewOnExpandCollapse(){return this.options.fitViewOnExpandCollapse}applySnap(t){return this.options.gridSnappingEnabled?Math.round(t/this.options.gridSize)*this.options.gridSize:t}snapToGrid(t){return this.applySnap(t)}getForceSimulation(){return this.simulationForces}getSimulation(){return this.simulation}async changeLayout(t,n={}){var i;this.layout&&((i=this.layout)==null||i.unregisterLayout(),this.layout=void 0),n=n??{},n.layout=n.layout??{},n.layout.type=t,t==="force"?(x.initSimulationForceCharge(this.simulationForces.charge,this.options),x.initSimulationForceCollide(this.simulationForces.collide,this.options)):t==="tree"&&(this.layout=new $(this.graph,this.simulation,this.simulationForces,n.layout)),this.options.layout.type=t,this.update(),this.pause(),await this.runSimulationWorkerRouter(n),this.restart(),await this.waitForSimulationStop(),this.graph.renderer.fitAndCenterWhenSettled()}};E(x,"REPULSION_STRENGTH_RANGE",[0,-400]),E(x,"LINK_DISTANCE_RANGE",[40,600]),E(x,"COLLIDE_MULTIPLIER_RANGE",[.6,2.4]),E(x,"FRICTION_DECAY_RANGE",[0,1]),E(x,"CENTERING_STRENGTH_MAX",.2),E(x,"CENTERING_ISOLATED_MULTIPLE",4),E(x,"CENTERING_ISOLATED_RANGE",[.1,.3]),E(x,"AUTO_OWNED_OPTIONS",["d3LinkDistance","d3ManyBodyStrength","d3CollideRadiusMultiplier","d3VelocityDecay","d3GravityStrength","d3GravityStrengthConnected","d3AlphaDecay","cooldownTime"]),E(x,"AUTO_DEBOUNCE_MS",150),E(x,"AUTO_DEADBAND",.04),E(x,"AUTO_REHEAT_ALPHA",.3),E(x,"CLICK_REHEAT_ALPHA",1),E(x,"NOMINAL_FPS",60),E(x,"COOLDOWN_WALL_GRACE",4),E(x,"FALLBACK_CONTAINER_SIZE",{width:1e3,height:800});let yn=x;const Cr=1e4,_n=2e4,Tn=.15*_n;self.onmessage=e=>{var b,g,w;if(e.data.source!=="simulation-worker-wrapper")return;const{nodes:t,edges:n,options:i,canvasBCR:r}=e.data,o=t.map(_=>{const N=new pr(_.id,_.data,_.style);return N.setCircleRadius(_._circleRadius??10),typeof _.x=="number"&&(N.x=_.x),typeof _.y=="number"&&(N.y=_.y),typeof _.fx=="number"&&(N.fx=_.fx),typeof _.fy=="number"&&(N.fy=_.fy),N}),a=new Map(o.map(_=>[_.id,_])),{simulation:s,simulationForces:c}=yn.initSimulationForces(i,r),l=[];for(const _ of n){const N=a.get(_.from.id),y=a.get(_.to.id);if(N&&y){const D=_.style??{};l.push(new cn(_.id,N,y,_.data,D,_.directed))}}s.nodes(o);const f=s.force("link");f&&f.id(_=>_.id).links(l),((b=i.layout)==null?void 0:b.type)==="tree"?$.registerForcesOnSimulation(o,l,s,c,i.layout,r,$):((g=i.layout)==null?void 0:g.type)==="egoTree"&&$.registerForcesOnSimulation(o,l,s,c,i.layout,r,le);let T=i.warmupTicks||_n;T=T==="auto"?_n:T,T=T-Tn;let d=.3;s.alphaTarget(d);const m=new Date().getTime();let A;for(let _=0;_<T&&!(new Date().getTime()-m>Cr||new Date().getTime()-m>i.cooldownTime||bn(i,s,d)&&new Date().getTime()-m>i.cooldownTime*.15);++_)_%5===0&&(A=Or(_,new Date().getTime()-m,i),postMessage({type:"tick",progress:A,elapsedTime:new Date().getTime()-m})),s.tick();d=0,s.alphaTarget(d),s.alpha(1);for(let _=0;_<Tn&&!(bn(i,s,d)&&new Date().getTime()-m>i.cooldownTime*.15);++_)s.tick(),_%5===0&&(A=Or(T+_,new Date().getTime()-m,i),postMessage({type:"tick",progress:A,elapsedTime:new Date().getTime()-m}));postMessage({type:"tick",progress:1,elapsedTime:new Date().getTime()-m}),((w=i.layout)==null?void 0:w.type)==="tree"&&$.simulationDone(o,l,s,i.layout),postMessage({type:"done",nodes:o.map(_=>_.toDict()),edges:l.map(_=>_.toDict())})};function Sc(e,t,n,i){var m,A,b;const r=e.map(g=>{const w=new pr(g.id,g.getData(),g.getStyle());return w.weight=g.weight||1,w.setCircleRadius(g.getCircleRadius()),typeof g.x=="number"&&(w.x=g.x),typeof g.y=="number"&&(w.y=g.y),typeof g.fx=="number"&&(w.fx=g.fx),typeof g.fy=="number"&&(w.fy=g.fy),w}),o=new Map(r.map(g=>[g.id,g])),{simulation:a,simulationForces:s}=yn.initSimulationForces(n,i),c=[];for(const g of t){const w=o.get(g.from.id),_=o.get(g.to.id);if(w&&_){const N=g.getStyle()??{};c.push(new cn(g.id,w,_,g.getData(),N,g.directed))}}a.nodes(r);const l=a.force("link");l&&l.id(g=>g.id).links(c),(((m=n.layout)==null?void 0:m.type)==="tree"||((A=n.layout)==null?void 0:A.type)==="egoTree")&&$.registerForcesOnSimulation(r,c,a,s,n.layout,i,$);let f;n.warmupTicks==="auto"||n.warmupTicks==null?f=_n:f=n.warmupTicks,f=f-Tn;let T=.3;a.alphaTarget(T);const d=new Date().getTime();for(let g=0;g<f&&!(new Date().getTime()-d>Cr||new Date().getTime()-d>n.cooldownTime||bn(n,a,T)&&new Date().getTime()-d>n.cooldownTime*.15);++g)a.tick();T=0,a.alphaTarget(T),a.alpha(1);for(let g=0;g<Tn&&!(bn(n,a,T)&&new Date().getTime()-d>n.cooldownTime*.15);++g)a.tick();return((b=n.layout)==null?void 0:b.type)==="tree"&&$.simulationDone(r,c,a,n.layout),{nodes:r,edges:c}}function Or(e,t,n){return t/n.cooldownTime}function bn(e,t,n){return e.d3AlphaMin>0&&t.alpha()-n<e.d3AlphaMin}var wc=Object.freeze({__proto__:null,runSimulation:Sc})})();\n', Yi = typeof self < "u" && self.Blob && new Blob([Pr], { type: "text/javascript;charset=utf-8" });
function yl(e) {
  let t;
  try {
    if (t = Yi && (self.URL || self.webkitURL).createObjectURL(Yi), !t) throw "";
    const n = new Worker(t, { name: e == null ? void 0 : e.name });
    return n.addEventListener("error", () => {
      (self.URL || self.webkitURL).revokeObjectURL(t);
    }), n;
  } catch {
    return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(Pr), { name: e == null ? void 0 : e.name });
  } finally {
    t && (self.URL || self.webkitURL).revokeObjectURL(t);
  }
}
function _l() {
  return new yl();
}
const vl = (e, t, n, i, r) => new Promise((o, a) => {
  const s = _l();
  s.postMessage({ source: "simulation-worker-wrapper", nodes: e, edges: t, options: n, canvasBCR: i }), s.onmessage = (c) => {
    const { type: l, progress: f, nodes: v, edges: d, elapsedTime: m } = c.data;
    if (l === "tick" && typeof f == "number") {
      r == null || r(f, m);
      return;
    }
    l === "done" && (o({ nodes: v, edges: d }), s.terminate());
  }, s.onerror = a;
});
var pn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function bl(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ke = { exports: {} };
Ke.exports;
var qi;
function Tl() {
  return qi || (qi = 1, (function(e, t) {
    var n = 200, i = "__lodash_hash_undefined__", r = 800, o = 16, a = 9007199254740991, s = "[object Arguments]", c = "[object Array]", l = "[object AsyncFunction]", f = "[object Boolean]", v = "[object Date]", d = "[object Error]", m = "[object Function]", S = "[object GeneratorFunction]", b = "[object Map]", g = "[object Number]", w = "[object Null]", _ = "[object Object]", M = "[object Proxy]", y = "[object RegExp]", D = "[object Set]", O = "[object String]", B = "[object Undefined]", P = "[object WeakMap]", L = "[object ArrayBuffer]", z = "[object DataView]", Y = "[object Float32Array]", nt = "[object Float64Array]", N = "[object Int8Array]", C = "[object Int16Array]", K = "[object Int32Array]", W = "[object Uint8Array]", R = "[object Uint8ClampedArray]", G = "[object Uint16Array]", Z = "[object Uint32Array]", ct = /[\\^$.*+?()[\]{}|]/g, gt = /^\[object .+?Constructor\]$/, it = /^(?:0|[1-9]\d*)$/, j = {};
    j[Y] = j[nt] = j[N] = j[C] = j[K] = j[W] = j[R] = j[G] = j[Z] = !0, j[s] = j[c] = j[L] = j[f] = j[z] = j[v] = j[d] = j[m] = j[b] = j[g] = j[_] = j[y] = j[D] = j[O] = j[P] = !1;
    var X = typeof pn == "object" && pn && pn.Object === Object && pn, Xt = typeof self == "object" && self && self.Object === Object && self, J = X || Xt || Function("return this")(), Zt = t && !t.nodeType && t, U = Zt && !0 && e && !e.nodeType && e, yt = U && U.exports === Zt, Qt = yt && X.process, Ct = (function() {
      try {
        var u = U && U.require && U.require("util").types;
        return u || Qt && Qt.binding && Qt.binding("util");
      } catch {
      }
    })(), Ae = Ct && Ct.isTypedArray;
    function Ee(u, p, T) {
      switch (T.length) {
        case 0:
          return u.call(p);
        case 1:
          return u.call(p, T[0]);
        case 2:
          return u.call(p, T[0], T[1]);
        case 3:
          return u.call(p, T[0], T[1], T[2]);
      }
      return u.apply(p, T);
    }
    function Xe(u, p) {
      for (var T = -1, F = Array(u); ++T < u; )
        F[T] = p(T);
      return F;
    }
    function Ze(u) {
      return function(p) {
        return u(p);
      };
    }
    function Ft(u, p) {
      return u == null ? void 0 : u[p];
    }
    function oe(u, p) {
      return function(T) {
        return u(p(T));
      };
    }
    var jt = Array.prototype, xe = Function.prototype, Jt = Object.prototype, Pt = J["__core-js_shared__"], Ht = xe.toString, St = Jt.hasOwnProperty, Ne = (function() {
      var u = /[^.]+$/.exec(Pt && Pt.keys && Pt.keys.IE_PROTO || "");
      return u ? "Symbol(src)_1." + u : "";
    })(), Me = Jt.toString, Qe = Ht.call(Object), Re = RegExp("^" + Ht.call(St).replace(ct, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"), zt = yt ? J.Buffer : void 0, Wt = J.Symbol, At = J.Uint8Array;
    zt && zt.allocUnsafe;
    var fe = oe(Object.getPrototypeOf, Object), Ie = Object.create, Je = Jt.propertyIsEnumerable, De = jt.splice, Bt = Wt ? Wt.toStringTag : void 0, Kt = (function() {
      try {
        var u = Bn(Object, "defineProperty");
        return u({}, "", {}), u;
      } catch {
      }
    })(), de = zt ? zt.isBuffer : void 0, Et = Math.max, te = Date.now, pe = Bn(J, "Map"), Vt = Bn(Object, "create"), On = /* @__PURE__ */ (function() {
      function u() {
      }
      return function(p) {
        if (!ce(p))
          return {};
        if (Ie)
          return Ie(p);
        u.prototype = p;
        var T = new u();
        return u.prototype = void 0, T;
      };
    })();
    function Ot(u) {
      var p = -1, T = u == null ? 0 : u.length;
      for (this.clear(); ++p < T; ) {
        var F = u[p];
        this.set(F[0], F[1]);
      }
    }
    function Ce() {
      this.__data__ = Vt ? Vt(null) : {}, this.size = 0;
    }
    function kn(u) {
      var p = this.has(u) && delete this.__data__[u];
      return this.size -= p ? 1 : 0, p;
    }
    function se(u) {
      var p = this.__data__;
      if (Vt) {
        var T = p[u];
        return T === i ? void 0 : T;
      }
      return St.call(p, u) ? p[u] : void 0;
    }
    function Ln(u) {
      var p = this.__data__;
      return Vt ? p[u] !== void 0 : St.call(p, u);
    }
    function Fn(u, p) {
      var T = this.__data__;
      return this.size += this.has(u) ? 0 : 1, T[u] = Vt && p === void 0 ? i : p, this;
    }
    Ot.prototype.clear = Ce, Ot.prototype.delete = kn, Ot.prototype.get = se, Ot.prototype.has = Ln, Ot.prototype.set = Fn;
    function tt(u) {
      var p = -1, T = u == null ? 0 : u.length;
      for (this.clear(); ++p < T; ) {
        var F = u[p];
        this.set(F[0], F[1]);
      }
    }
    function ee() {
      this.__data__ = [], this.size = 0;
    }
    function Pn(u) {
      var p = this.__data__, T = le(p, u);
      if (T < 0)
        return !1;
      var F = p.length - 1;
      return T == F ? p.pop() : De.call(p, T, 1), --this.size, !0;
    }
    function tn(u) {
      var p = this.__data__, T = le(p, u);
      return T < 0 ? void 0 : p[T][1];
    }
    function Oe(u) {
      return le(this.__data__, u) > -1;
    }
    function en(u, p) {
      var T = this.__data__, F = le(T, u);
      return F < 0 ? (++this.size, T.push([u, p])) : T[F][1] = p, this;
    }
    tt.prototype.clear = ee, tt.prototype.delete = Pn, tt.prototype.get = tn, tt.prototype.has = Oe, tt.prototype.set = en;
    function $t(u) {
      var p = -1, T = u == null ? 0 : u.length;
      for (this.clear(); ++p < T; ) {
        var F = u[p];
        this.set(F[0], F[1]);
      }
    }
    function zn() {
      this.size = 0, this.__data__ = { hash: new Ot(), map: new (pe || tt)(), string: new Ot() };
    }
    function xt(u) {
      var p = un(this, u).delete(u);
      return this.size -= p ? 1 : 0, p;
    }
    function Yt(u) {
      return un(this, u).get(u);
    }
    function nn(u) {
      return un(this, u).has(u);
    }
    function rn(u, p) {
      var T = un(this, u), F = T.size;
      return T.set(u, p), this.size += T.size == F ? 0 : 1, this;
    }
    $t.prototype.clear = zn, $t.prototype.delete = xt, $t.prototype.get = Yt, $t.prototype.has = nn, $t.prototype.set = rn;
    function qt(u) {
      var p = this.__data__ = new tt(u);
      this.size = p.size;
    }
    function ge() {
      this.__data__ = new tt(), this.size = 0;
    }
    function ae(u) {
      var p = this.__data__, T = p.delete(u);
      return this.size = p.size, T;
    }
    function me(u) {
      return this.__data__.get(u);
    }
    function kt(u) {
      return this.__data__.has(u);
    }
    function on(u, p) {
      var T = this.__data__;
      if (T instanceof tt) {
        var F = T.__data__;
        if (!pe || F.length < n - 1)
          return F.push([u, p]), this.size = ++T.size, this;
        T = this.__data__ = new $t(F);
      }
      return T.set(u, p), this.size = T.size, this;
    }
    qt.prototype.clear = ge, qt.prototype.delete = ae, qt.prototype.get = me, qt.prototype.has = kt, qt.prototype.set = on;
    function sn(u, p) {
      var T = jn(u), F = !T && Un(u), q = !T && !F && _i(u), ot = !T && !F && !q && bi(u), st = T || F || q || ot, et = st ? Xe(u.length, String) : [], at = et.length;
      for (var Lt in u)
        st && (Lt == "length" || q && (Lt == "offset" || Lt == "parent") || ot && (Lt == "buffer" || Lt == "byteLength" || Lt == "byteOffset") || mi(Lt, at)) || et.push(Lt);
      return et;
    }
    function ke(u, p, T) {
      (T !== void 0 && !hn(u[p], T) || T === void 0 && !(p in u)) && ne(u, p, T);
    }
    function an(u, p, T) {
      var F = u[p];
      (!(St.call(u, p) && hn(F, T)) || T === void 0 && !(p in u)) && ne(u, p, T);
    }
    function le(u, p) {
      for (var T = u.length; T--; )
        if (hn(u[T][0], p))
          return T;
      return -1;
    }
    function ne(u, p, T) {
      p == "__proto__" && Kt ? Kt(u, p, { configurable: !0, enumerable: !0, value: T, writable: !0 }) : u[p] = T;
    }
    var ie = Wr();
    function k(u) {
      return u == null ? u === void 0 ? B : w : Bt && Bt in Object(u) ? Kr(u) : Zr(u);
    }
    function h(u) {
      return Fe(u) && k(u) == s;
    }
    function A(u) {
      if (!ce(u) || qr(u))
        return !1;
      var p = Wn(u) ? Re : gt;
      return p.test(eo(u));
    }
    function I(u) {
      return Fe(u) && vi(u.length) && !!j[k(u)];
    }
    function Q(u) {
      if (!ce(u))
        return Xr(u);
      var p = yi(u), T = [];
      for (var F in u)
        F == "constructor" && (p || !St.call(u, F)) || T.push(F);
      return T;
    }
    function V(u, p, T, F, q) {
      u !== p && ie(p, function(ot, st) {
        if (q || (q = new qt()), ce(ot))
          rt(u, p, st, T, V, F, q);
        else {
          var et = F ? F(Gn(u, st), ot, st + "", u, p, q) : void 0;
          et === void 0 && (et = ot), ke(u, st, et);
        }
      }, Ti);
    }
    function rt(u, p, T, F, q, ot, st) {
      var et = Gn(u, T), at = Gn(p, T), Lt = st.get(at);
      if (Lt) {
        ke(u, T, Lt);
        return;
      }
      var Mt = ot ? ot(et, at, T + "", u, p, st) : void 0, Pe = Mt === void 0;
      if (Pe) {
        var Kn = jn(at), Vn = !Kn && _i(at), Si = !Kn && !Vn && bi(at);
        Mt = at, Kn || Vn || Si ? jn(et) ? Mt = et : no(et) ? Mt = ln(et) : Vn ? (Pe = !1, Mt = Nt(at)) : Si ? (Pe = !1, Mt = ht(at)) : Mt = [] : io(at) || Un(at) ? (Mt = et, Un(et) ? Mt = ro(et) : (!ce(et) || Wn(et)) && (Mt = Vr(at))) : Pe = !1;
      }
      Pe && (st.set(at, Mt), q(Mt, at, F, ot, st), st.delete(at)), ke(u, T, Mt);
    }
    function wt(u, p) {
      return Jr(Qr(u, p, wi), u + "");
    }
    var Rt = Kt ? function(u, p) {
      return Kt(u, "toString", { configurable: !0, enumerable: !1, value: so(p), writable: !0 });
    } : wi;
    function Nt(u, p) {
      return u.slice();
    }
    function Le(u) {
      var p = new u.constructor(u.byteLength);
      return new At(p).set(new At(u)), p;
    }
    function ht(u, p) {
      var T = Le(u.buffer);
      return new u.constructor(T, u.byteOffset, u.length);
    }
    function ln(u, p) {
      var T = -1, F = u.length;
      for (p || (p = Array(F)); ++T < F; )
        p[T] = u[T];
      return p;
    }
    function cn(u, p, T, F) {
      var q = !T;
      T || (T = {});
      for (var ot = -1, st = p.length; ++ot < st; ) {
        var et = p[ot], at = void 0;
        at === void 0 && (at = u[et]), q ? ne(T, et, at) : an(T, et, at);
      }
      return T;
    }
    function Hr(u) {
      return wt(function(p, T) {
        var F = -1, q = T.length, ot = q > 1 ? T[q - 1] : void 0, st = q > 2 ? T[2] : void 0;
        for (ot = u.length > 3 && typeof ot == "function" ? (q--, ot) : void 0, st && $r(T[0], T[1], st) && (ot = q < 3 ? void 0 : ot, q = 1), p = Object(p); ++F < q; ) {
          var et = T[F];
          et && u(p, et, F, ot);
        }
        return p;
      });
    }
    function Wr(u) {
      return function(p, T, F) {
        for (var q = -1, ot = Object(p), st = F(p), et = st.length; et--; ) {
          var at = st[++q];
          if (T(ot[at], at, ot) === !1)
            break;
        }
        return p;
      };
    }
    function un(u, p) {
      var T = u.__data__;
      return Yr(p) ? T[typeof p == "string" ? "string" : "hash"] : T.map;
    }
    function Bn(u, p) {
      var T = Ft(u, p);
      return A(T) ? T : void 0;
    }
    function Kr(u) {
      var p = St.call(u, Bt), T = u[Bt];
      try {
        u[Bt] = void 0;
        var F = !0;
      } catch {
      }
      var q = Me.call(u);
      return F && (p ? u[Bt] = T : delete u[Bt]), q;
    }
    function Vr(u) {
      return typeof u.constructor == "function" && !yi(u) ? On(fe(u)) : {};
    }
    function mi(u, p) {
      var T = typeof u;
      return p = p ?? a, !!p && (T == "number" || T != "symbol" && it.test(u)) && u > -1 && u % 1 == 0 && u < p;
    }
    function $r(u, p, T) {
      if (!ce(T))
        return !1;
      var F = typeof p;
      return (F == "number" ? Hn(T) && mi(p, T.length) : F == "string" && p in T) ? hn(T[p], u) : !1;
    }
    function Yr(u) {
      var p = typeof u;
      return p == "string" || p == "number" || p == "symbol" || p == "boolean" ? u !== "__proto__" : u === null;
    }
    function qr(u) {
      return !!Ne && Ne in u;
    }
    function yi(u) {
      var p = u && u.constructor, T = typeof p == "function" && p.prototype || Jt;
      return u === T;
    }
    function Xr(u) {
      var p = [];
      if (u != null)
        for (var T in Object(u))
          p.push(T);
      return p;
    }
    function Zr(u) {
      return Me.call(u);
    }
    function Qr(u, p, T) {
      return p = Et(p === void 0 ? u.length - 1 : p, 0), function() {
        for (var F = arguments, q = -1, ot = Et(F.length - p, 0), st = Array(ot); ++q < ot; )
          st[q] = F[p + q];
        q = -1;
        for (var et = Array(p + 1); ++q < p; )
          et[q] = F[q];
        return et[p] = T(st), Ee(u, this, et);
      };
    }
    function Gn(u, p) {
      if (!(p === "constructor" && typeof u[p] == "function") && p != "__proto__")
        return u[p];
    }
    var Jr = to(Rt);
    function to(u) {
      var p = 0, T = 0;
      return function() {
        var F = te(), q = o - (F - T);
        if (T = F, q > 0) {
          if (++p >= r)
            return arguments[0];
        } else
          p = 0;
        return u.apply(void 0, arguments);
      };
    }
    function eo(u) {
      if (u != null) {
        try {
          return Ht.call(u);
        } catch {
        }
        try {
          return u + "";
        } catch {
        }
      }
      return "";
    }
    function hn(u, p) {
      return u === p || u !== u && p !== p;
    }
    var Un = h(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? h : function(u) {
      return Fe(u) && St.call(u, "callee") && !Je.call(u, "callee");
    }, jn = Array.isArray;
    function Hn(u) {
      return u != null && vi(u.length) && !Wn(u);
    }
    function no(u) {
      return Fe(u) && Hn(u);
    }
    var _i = de || ao;
    function Wn(u) {
      if (!ce(u))
        return !1;
      var p = k(u);
      return p == m || p == S || p == l || p == M;
    }
    function vi(u) {
      return typeof u == "number" && u > -1 && u % 1 == 0 && u <= a;
    }
    function ce(u) {
      var p = typeof u;
      return u != null && (p == "object" || p == "function");
    }
    function Fe(u) {
      return u != null && typeof u == "object";
    }
    function io(u) {
      if (!Fe(u) || k(u) != _)
        return !1;
      var p = fe(u);
      if (p === null)
        return !0;
      var T = St.call(p, "constructor") && p.constructor;
      return typeof T == "function" && T instanceof T && Ht.call(T) == Qe;
    }
    var bi = Ae ? Ze(Ae) : I;
    function ro(u) {
      return cn(u, Ti(u));
    }
    function Ti(u) {
      return Hn(u) ? sn(u) : Q(u);
    }
    var oo = Hr(function(u, p, T) {
      V(u, p, T);
    });
    function so(u) {
      return function() {
        return u;
      };
    }
    function wi(u) {
      return u;
    }
    function ao() {
      return !1;
    }
    e.exports = oo;
  })(Ke, Ke.exports)), Ke.exports;
}
var wl = Tl();
const yn = bl(wl);
function Sl(e) {
  var t = 0, n = e.children, i = n && n.length;
  if (!i) t = 1;
  else for (; --i >= 0; ) t += n[i].value;
  e.value = t;
}
function Al() {
  return this.eachAfter(Sl);
}
function El(e, t) {
  let n = -1;
  for (const i of this)
    e.call(t, i, ++n, this);
  return this;
}
function xl(e, t) {
  for (var n = this, i = [n], r, o, a = -1; n = i.pop(); )
    if (e.call(t, n, ++a, this), r = n.children)
      for (o = r.length - 1; o >= 0; --o)
        i.push(r[o]);
  return this;
}
function Nl(e, t) {
  for (var n = this, i = [n], r = [], o, a, s, c = -1; n = i.pop(); )
    if (r.push(n), o = n.children)
      for (a = 0, s = o.length; a < s; ++a)
        i.push(o[a]);
  for (; n = r.pop(); )
    e.call(t, n, ++c, this);
  return this;
}
function Ml(e, t) {
  let n = -1;
  for (const i of this)
    if (e.call(t, i, ++n, this))
      return i;
}
function Rl(e) {
  return this.eachAfter(function(t) {
    for (var n = +e(t.data) || 0, i = t.children, r = i && i.length; --r >= 0; ) n += i[r].value;
    t.value = n;
  });
}
function Il(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function Dl(e) {
  for (var t = this, n = Cl(t, e), i = [t]; t !== n; )
    t = t.parent, i.push(t);
  for (var r = i.length; e !== n; )
    i.splice(r, 0, e), e = e.parent;
  return i;
}
function Cl(e, t) {
  if (e === t) return e;
  var n = e.ancestors(), i = t.ancestors(), r = null;
  for (e = n.pop(), t = i.pop(); e === t; )
    r = e, e = n.pop(), t = i.pop();
  return r;
}
function Ol() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function kl() {
  return Array.from(this);
}
function Ll() {
  var e = [];
  return this.eachBefore(function(t) {
    t.children || e.push(t);
  }), e;
}
function Fl() {
  var e = this, t = [];
  return e.each(function(n) {
    n !== e && t.push({ source: n.parent, target: n });
  }), t;
}
function* Pl() {
  var e = this, t, n = [e], i, r, o;
  do
    for (t = n.reverse(), n = []; e = t.pop(); )
      if (yield e, i = e.children)
        for (r = 0, o = i.length; r < o; ++r)
          n.push(i[r]);
  while (n.length);
}
function Dn(e, t) {
  e instanceof Map ? (e = [void 0, e], t === void 0 && (t = Gl)) : t === void 0 && (t = Bl);
  for (var n = new Ye(e), i, r = [n], o, a, s, c; i = r.pop(); )
    if ((a = t(i.data)) && (c = (a = Array.from(a)).length))
      for (i.children = a, s = c - 1; s >= 0; --s)
        r.push(o = a[s] = new Ye(a[s])), o.parent = i, o.depth = i.depth + 1;
  return n.eachBefore(jl);
}
function zl() {
  return Dn(this).eachBefore(Ul);
}
function Bl(e) {
  return e.children;
}
function Gl(e) {
  return Array.isArray(e) ? e[1] : null;
}
function Ul(e) {
  e.data.value !== void 0 && (e.value = e.data.value), e.data = e.data.data;
}
function jl(e) {
  var t = 0;
  do
    e.height = t;
  while ((e = e.parent) && e.height < ++t);
}
function Ye(e) {
  this.data = e, this.depth = this.height = 0, this.parent = null;
}
Ye.prototype = Dn.prototype = { constructor: Ye, count: Al, each: El, eachAfter: Nl, eachBefore: xl, find: Ml, sum: Rl, sort: Il, path: Dl, ancestors: Ol, descendants: kl, leaves: Ll, links: Fl, copy: zl, [Symbol.iterator]: Pl };
function Hl(e, t) {
  return e.parent === t.parent ? 1 : 2;
}
function Jn(e) {
  var t = e.children;
  return t ? t[0] : e.t;
}
function ti(e) {
  var t = e.children;
  return t ? t[t.length - 1] : e.t;
}
function Wl(e, t, n) {
  var i = n / (t.i - e.i);
  t.c -= i, t.s += n, e.c += i, t.z += n, t.m += n;
}
function Kl(e) {
  for (var t = 0, n = 0, i = e.children, r = i.length, o; --r >= 0; )
    o = i[r], o.z += t, o.m += t, t += o.s + (n += o.c);
}
function Vl(e, t, n) {
  return e.a.parent === t.parent ? e.a : n;
}
function _n(e, t) {
  this._ = e, this.parent = null, this.children = null, this.A = null, this.a = this, this.z = 0, this.m = 0, this.c = 0, this.s = 0, this.t = null, this.i = t;
}
_n.prototype = Object.create(Ye.prototype);
function $l(e) {
  for (var t = new _n(e, 0), n, i = [t], r, o, a, s; n = i.pop(); )
    if (o = n._.children)
      for (n.children = new Array(s = o.length), a = s - 1; a >= 0; --a)
        i.push(r = n.children[a] = new _n(o[a], a)), r.parent = n;
  return (t.parent = new _n(null, 0)).children = [t], t;
}
function Yl() {
  var e = Hl, t = 1, n = 1, i = null;
  function r(l) {
    var f = $l(l);
    if (f.eachAfter(o), f.parent.m = -f.z, f.eachBefore(a), i) l.eachBefore(c);
    else {
      var v = l, d = l, m = l;
      l.eachBefore(function(_) {
        _.x < v.x && (v = _), _.x > d.x && (d = _), _.depth > m.depth && (m = _);
      });
      var S = v === d ? 1 : e(v, d) / 2, b = S - v.x, g = t / (d.x + S + b), w = n / (m.depth || 1);
      l.eachBefore(function(_) {
        _.x = (_.x + b) * g, _.y = _.depth * w;
      });
    }
    return l;
  }
  function o(l) {
    var f = l.children, v = l.parent.children, d = l.i ? v[l.i - 1] : null;
    if (f) {
      Kl(l);
      var m = (f[0].z + f[f.length - 1].z) / 2;
      d ? (l.z = d.z + e(l._, d._), l.m = l.z - m) : l.z = m;
    } else d && (l.z = d.z + e(l._, d._));
    l.parent.A = s(l, d, l.parent.A || v[0]);
  }
  function a(l) {
    l._.x = l.z + l.parent.m, l.m += l.parent.m;
  }
  function s(l, f, v) {
    if (f) {
      for (var d = l, m = l, S = f, b = d.parent.children[0], g = d.m, w = m.m, _ = S.m, M = b.m, y; S = ti(S), d = Jn(d), S && d; )
        b = Jn(b), m = ti(m), m.a = l, y = S.z + _ - d.z - g + e(S._, d._), y > 0 && (Wl(Vl(S, l, v), l, y), g += y, w += y), _ += S.m, g += d.m, M += b.m, w += m.m;
      S && !ti(m) && (m.t = S, m.m += _ - w), d && !Jn(b) && (b.t = d, b.m += g - M, v = l);
    }
    return v;
  }
  function c(l) {
    l.x *= t, l.y = l.depth * n;
  }
  return r.separation = function(l) {
    return arguments.length ? (e = l, r) : e;
  }, r.size = function(l) {
    return arguments.length ? (i = !1, t = +l[0], n = +l[1], r) : i ? null : [t, n];
  }, r.nodeSize = function(l) {
    return arguments.length ? (i = !0, t = +l[0], n = +l[1], r) : i ? [t, n] : null;
  }, r;
}
function Xi(e, t) {
  const n = new Set(t.map((i) => i.target.id));
  for (const i of e)
    if (!n.has(i.id)) return i;
  return e[0];
}
const ql = 1e6;
function Zi(e, t) {
  var s;
  const n = /* @__PURE__ */ new Map();
  for (const c of e)
    n.set(c.id, []);
  for (const c of t)
    (s = n.get(c.from.id)) == null || s.push(c.to);
  let i = 0, r = !1, o = null, a = -1;
  for (const c of e) {
    const l = /* @__PURE__ */ new Set([c.id]), f = [c];
    for (; f.length > 0 && !r; ) {
      const d = f.pop();
      for (const m of n.get(d.id) ?? []) {
        if (++i > ql) {
          r = !0;
          break;
        }
        l.has(m.id) || (l.add(m.id), f.push(m));
      }
    }
    const v = l.size - 1;
    if (v > a && (a = v, o = c), r) break;
  }
  return r && console.warn("Pivotick: reachability search hit its traversal cap, using the best root found so far."), o ?? e[0];
}
function Xl(e, t) {
  return zr(e, t);
}
function zr(e, t) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const l of e)
    n.set(l.id, []), i.set(l.id, 0);
  for (const l of t)
    l.directed !== !1 && (n.get(l.from.id).push(l.to), i.set(l.to.id, (i.get(l.to.id) || 0) + 1));
  const r = [], o = e.filter((l) => i.get(l.id) === 0);
  for (; o.length; ) {
    const l = o.shift();
    r.push(l);
    for (const f of n.get(l.id))
      i.set(f.id, i.get(f.id) - 1), i.get(f.id) === 0 && o.push(f);
  }
  if (r.length !== e.length)
    return console.warn("Pivotick: the graph has a cycle, so no shallowest root is defined — using the first node."), e[0];
  const a = /* @__PURE__ */ new Map();
  for (let l = r.length - 1; l >= 0; l--) {
    const f = r[l];
    let v = 0;
    for (const d of n.get(f.id))
      v = Math.max(v, 1 + (a.get(d.id) ?? 0));
    a.set(f.id, v);
  }
  let s = null, c = 1 / 0;
  for (const l of e) {
    const f = a.get(l.id);
    f < c && (c = f, s = l);
  }
  return s ?? e[0];
}
function Zl(e, t, n) {
  var v;
  const i = new Map(e.map((d) => [d.id, d])), r = new Map(e.map((d) => [d.id, []]));
  for (const d of t)
    !r.has(d.from.id) || !r.has(d.to.id) || (r.get(d.from.id).push(d.to.id), r.get(d.to.id).push(d.from.id));
  const o = (d) => {
    const m = /* @__PURE__ */ new Map([[d, 0]]), S = /* @__PURE__ */ new Map(), b = [d];
    for (let g = 0; g < b.length; g++) {
      const w = b[g];
      for (const _ of r.get(w) ?? [])
        m.has(_) || (m.set(_, m.get(w) + 1), S.set(_, w), b.push(_));
    }
    return { levels: m, parentOf: S, farthest: b[b.length - 1] };
  }, a = n !== void 0 && r.has(n) ? n : (v = e[0]) == null ? void 0 : v.id;
  if (a === void 0) return e[0];
  const s = o(a).farthest, { parentOf: c, farthest: l } = o(s), f = [];
  for (let d = l; d !== void 0; d = c.get(d))
    f.push(d);
  return i.get(f[Math.floor(f.length / 2)]) ?? e[0];
}
const Ql = 24, Jl = 16, ui = 1, Qi = 0.1;
function ei(e, t) {
  return e ? e.measured <= 0 ? An[1] : e.needed / e.measured * t : ui;
}
function ni(e) {
  if (!Number.isFinite(e)) return ui;
  const t = Math.ceil(e / Qi) * Qi;
  return Math.min(An[1], Math.max(ui, Math.round(t * 10) / 10));
}
function tc(e) {
  const t = ei(e.level, e.current.levelSpacing);
  if (e.radial) {
    const n = ei(e.sibling, e.current.levelSpacing);
    return { levelSpacing: ni(Math.max(t, n)), siblingSpacing: e.current.siblingSpacing };
  }
  return { levelSpacing: ni(t), siblingSpacing: ni(ei(e.sibling, e.current.siblingSpacing)) };
}
function ec(e, t) {
  return e + t + Ql;
}
function nc(e, t) {
  return e + t + Jl;
}
const ic = 20, Ji = "__pivotick_forest_root__", tr = "__pivotick_tree_spacer__", er = 4096, rc = 5e4, nr = 0.5;
let ir = "";
const ii = { type: "tree", rootId: void 0, parentKey: void 0, depthKey: void 0, rootIdAlgorithmFinder: "MaxReachability", strength: 0.25, radial: !1, radialGap: 750, spacing: "auto", levelSpacing: 1, siblingSpacing: 1, horizontal: !1 };
class $ {
  constructor(t, n, i, r = {}) {
    E(this, "graph");
    E(this, "simulation");
    E(this, "simulationForces");
    E(this, "options");
    E(this, "originalForceStrength");
    E(this, "canvasBCR");
    E(this, "levels");
    E(this, "maxDepth", 0);
    E(this, "autoSpacing");
    E(this, "parkedIds", /* @__PURE__ */ new Set());
    E(this, "positionedNodesByID");
    this.graph = t, this.simulation = n, this.simulationForces = i, this.options = yn({}, ii, r), this.originalForceStrength = { link: this.simulationForces.link.strength(), charge: this.simulationForces.charge.strength(), gravity: this.simulationForces.gravity.strength() }, this.autoSpacing = r.spacing === "auto" || r.spacing !== "manual" && r.levelSpacing === void 0 && r.siblingSpacing === void 0, this.positionedNodesByID = /* @__PURE__ */ new Map(), this.levels = /* @__PURE__ */ new Map(), this.setSizes(), this.update(), this.registerForces();
  }
  update() {
    var n, i;
    if (this.layoutOnce(), !this.autoSpacing || this.positionedNodesByID.size === 0) return;
    const t = tc(this.measureAutoContext());
    t.levelSpacing === this.options.levelSpacing && t.siblingSpacing === this.options.siblingSpacing || (this.options.levelSpacing = t.levelSpacing, this.options.siblingSpacing = t.siblingSpacing, this.layoutOnce(), (i = (n = this.graph.UIManager) == null ? void 0 : n.physicsFlyout) == null || i.syncAutoSpacing(t));
  }
  layoutOnce() {
    const t = this.graph.getNodes(), n = this.graph.getEdges(), i = this.buildLevels(t, n, this.options), { levels: r, maxDepth: o, parked: a } = i;
    this.parkedIds = new Set(a);
    const { nodes: s, nodeById: c } = this.buildTree(t, n, this.options, this.canvasBCR, i);
    this.positionedNodesByID = c, this.levels = r, this.maxDepth = o, s && this.setNodePositions(s, this.options);
  }
  measureAutoContext() {
    const t = /* @__PURE__ */ new Map();
    for (const [o, a] of this.positionedNodesByID) {
      const s = this.graph.getMutableNode(o);
      if (!s || this.parkedIds.has(o)) continue;
      const c = s.expanded ? s.getCircleRadiusCollapsed() : s.getCircleRadius(), l = Number.isFinite(c) ? c : 0, f = t.get(a.depth) ?? [];
      f.push({ node: a, radius: l }), t.set(a.depth, f);
    }
    const n = [...t.keys()].sort((o, a) => o - a);
    let i = null, r = null;
    for (let o = 0; o < n.length; o++) {
      const a = t.get(n[o]), s = o + 1 < n.length ? t.get(n[o + 1]) : void 0;
      if (s) {
        const l = Math.max(n[o + 1] - n[o], 1), f = Math.abs((s[0].node.y ?? 0) - (a[0].node.y ?? 0)) / l, v = ec($.widestOf(a), $.widestOf(s));
        i = $.tighter(i, { measured: f, needed: v });
      }
      const c = [...a].sort((l, f) => (l.node.x ?? 0) - (f.node.x ?? 0));
      for (let l = 1; l < c.length; l++) {
        const [f, v] = [c[l - 1], c[l]], d = this.options.radial ? 2 * (v.node.y ?? 0) * Math.sin(Math.abs((v.node.x ?? 0) - (f.node.x ?? 0)) / 2) : (v.node.x ?? 0) - (f.node.x ?? 0), m = nc(f.radius, v.radius);
        r = $.tighter(r, { measured: d, needed: m });
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
      const r = this.graph.getMutableNode(i.data.id);
      if (r)
        if (n.radial) {
          const o = i.x ?? 0, a = i.y ?? 0;
          r.x = a * Math.cos(o - Math.PI / 2), r.y = a * Math.sin(o - Math.PI / 2), r.fx = r.x, r.fy = r.y;
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
      const n = $.radialRingGap(this.options, this.maxDepth), i = Ri((r) => (this.levels.get(r.id) ?? 1) * n, 0, 0).strength(t);
      this.simulation.force("tree-radial", i);
    } else
      this.simulation.force("tree-y", Di((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.x) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.y) ?? 0;
      }).strength(t)), this.simulation.force("tree-x", Ii((n) => {
        var i, r;
        return this.options.horizontal ? ((i = this.positionedNodesByID.get(n.id)) == null ? void 0 : i.y) ?? 0 : ((r = this.positionedNodesByID.get(n.id)) == null ? void 0 : r.x) ?? 0;
      }).strength(t));
    $.adjustOtherSimulationForces(this.simulationForces, this.options);
  }
  unregisterLayout() {
    this.unregisterForces(), this.unsetNodePositions();
  }
  unregisterForces() {
    this.simulation.force("tree-radial", null), this.simulation.force("tree-y", null), this.simulation.force("tree-x", null), $.resetOtherSimulationForces(this.simulationForces, this.originalForceStrength);
  }
  static registerForcesOnSimulation(t, n, i, r, o, a, s = this) {
    const c = yn({}, ii, o), l = c.strength ?? 0.1, f = a.width, v = a.height, d = [f / 2, v / 2], m = s.buildLevelsStatic(t, n, c), { levels: S, maxDepth: b } = m, { nodeById: g } = s.buildTreeStatic(t, n, c, a, m);
    if (c.radial) {
      const w = s.radialRingGap(c, b), _ = Ri((M) => (S.get(M.id) ?? 1) * w, d[0], d[1]).strength(l);
      i.force("tree-radial", _);
    } else
      i.force("tree-y", Di((w) => {
        var _, M;
        return c.horizontal ? ((_ = g.get(w.id)) == null ? void 0 : _.x) ?? 0 : ((M = g.get(w.id)) == null ? void 0 : M.y) ?? 0;
      }).strength(l)), i.force("tree-x", Ii((w) => {
        var _, M;
        return c.horizontal ? ((_ = g.get(w.id)) == null ? void 0 : _.y) ?? 0 : ((M = g.get(w.id)) == null ? void 0 : M.x) ?? 0;
      }).strength(l));
    s.adjustOtherSimulationForces(r, c);
  }
  static adjustOtherSimulationForces(t, n) {
    n != null && n.radial ? (t.link.strength(0), t.charge.strength(0), t.gravity.strength(0)) : (t.link.strength(0), t.charge.strength(0), t.gravity.strength(1e-5));
  }
  static resetOtherSimulationForces(t, n) {
    t.link.strength(n.link), t.charge.strength(n.charge), t.gravity.strength(n.gravity);
  }
  static simulationDone(t, n, i, r) {
    const o = yn({}, ii, r);
    for (const a of t)
      o.radial ? (a.fx = a.x, a.fy = a.y) : o.horizontal ? (a.fx = a.x, delete a.fy) : (a.fy = a.y, delete a.fx);
  }
  static radialRingGap(t, n) {
    const i = t.radialGap * $.spacingOf(t).level;
    return n > 0 ? i / n : i;
  }
  static spacingOf(t) {
    const n = (i) => Number.isFinite(i) ? i : 1;
    return { level: n(t.levelSpacing), sibling: n(t.siblingSpacing) };
  }
  getSpacing() {
    const { level: t, sibling: n } = $.spacingOf(this.options);
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
    const i = $.spacingOf(t), r = Yl();
    if (t.radial)
      return r.size([2 * Math.PI, t.radialGap * i.level]), { treeLayout: r, offset: { x: 0, y: 0 } };
    const o = t.horizontal ? n.width : n.height, a = t.horizontal ? n.height : n.width, s = a * i.sibling, c = o * i.level;
    return r.size([s, c]).separation((l, f) => {
      var d, m;
      const v = ((m = (d = l.parent) == null ? void 0 : d.children) == null ? void 0 : m.length) ?? 1;
      return l.parent === f.parent ? 1.5 / v : 1.5;
    }), { treeLayout: r, offset: { x: -(s - a) / 2, y: -(c - o) / 2 } };
  }
  static packParked(t, n, i, r, o = /* @__PURE__ */ new Map()) {
    if (!t.length) return [];
    const a = (R) => {
      const G = R.getCircleRadius();
      return Number.isFinite(G) ? G : 0;
    }, s = 2 * t.reduce((R, G) => Math.max(R, a(G)), 0) + ic, c = (R, G, Z, ct) => ({ data: R, depth: ct, x: G, y: Z, height: 0 }), l = n.map((R) => R.x ?? 0), f = n.map((R) => R.y ?? 0), v = t.filter((R) => o.has(R.id)), d = t.filter((R) => !o.has(R.id)), m = (R) => o.get(R.id) ?? 0, S = [...new Set(n.map((R) => R.depth))].sort((R, G) => R - G), b = /* @__PURE__ */ new Map();
    for (const R of n) b.set(R.depth, R.y ?? 0);
    const g = S[0] ?? 0, w = S[S.length - 1] ?? 0, _ = w > g ? ((b.get(w) ?? 0) - (b.get(g) ?? 0)) / (w - g) : s, M = (R) => b.get(R) ?? (S.length ? (b.get(g) ?? 0) + (R - g) * _ : R * s);
    if (i.radial) {
      const R = [], G = /* @__PURE__ */ new Map();
      for (const it of v) {
        const j = m(it);
        G.set(j, [...G.get(j) ?? [], it]);
      }
      for (const [it, j] of G) {
        const X = n.filter((U) => U.depth === it).map((U) => U.x ?? 0).sort((U, yt) => U - yt);
        let Xt = 0, J = 2 * Math.PI;
        if (X.length) {
          J = 0;
          for (let U = 0; U < X.length; U++) {
            const yt = U + 1 < X.length ? X[U + 1] : X[0] + 2 * Math.PI;
            yt - X[U] > J && (J = yt - X[U], Xt = X[U]);
          }
        }
        const Zt = J / (j.length + 1);
        j.forEach((U, yt) => R.push(c(U, Xt + Zt * (yt + 1), M(it), it)));
      }
      const Z = new Set(f).size, ct = f.length ? Math.max(...f) : i.radialGap, gt = Z > 0 ? ct / Z : ct;
      return d.forEach((it, j) => R.push(c(it, j * 2 * Math.PI / d.length, ct + gt, Z + 1))), R;
    }
    if (!n.length) {
      const R = Math.max(1, Math.floor(r.width / s)), G = [], Z = /* @__PURE__ */ new Map();
      for (const gt of v) {
        const it = m(gt), j = Z.get(it) ?? 0;
        Z.set(it, j + 1), G.push(c(gt, j * s, it * s, it));
      }
      const ct = Z.size ? Math.max(...Z.keys()) + 1 : 0;
      return d.forEach((gt, it) => {
        const j = ct + Math.floor(it / R);
        G.push(c(gt, it % R * s, j * s, j));
      }), G;
    }
    const y = /* @__PURE__ */ new Map(), D = /* @__PURE__ */ new Map();
    for (const R of n) {
      const G = R.y ?? 0, Z = R.x ?? 0;
      y.set(G, Math.max(y.get(G) ?? Z, Z)), D.set(R.depth, Math.max(D.get(R.depth) ?? Z, Z));
    }
    const O = [...y.keys()].sort((R, G) => R - G), B = Math.min(...l), P = Math.max(...l), L = O.length > 1 ? O[1] - O[0] : s, z = [], Y = [], nt = /* @__PURE__ */ new Map();
    for (const R of v) {
      const G = m(R), Z = M(G), ct = nt.get(Z) ?? 0, gt = P - ct * s, it = D.get(G);
      if (it !== void 0 && gt - s <= it) {
        Y.push(R);
        continue;
      }
      nt.set(Z, ct + 1), z.push(c(R, gt, Z, G));
    }
    const N = [...d, ...Y];
    let C = 0;
    for (const [R, G] of O.entries()) {
      if (C >= N.length) break;
      const Z = nt.get(G) ?? 0, ct = P - Z * s - ((y.get(G) ?? P) + s), gt = Math.floor(ct / s);
      for (let it = 0; it < gt && C < N.length; it++)
        z.push(c(N[C++], P - (Z + it) * s, G, R));
    }
    const K = Math.max(1, Math.floor((P - B) / s)), W = O[O.length - 1];
    for (let R = 0; C < N.length; R++)
      z.push(c(N[C++], P - R % K * s, W + L * (1 + Math.floor(R / K)), O.length));
    return z;
  }
  static offsetTree(t, n) {
    if (!(!n.x && !n.y))
      for (const i of t)
        i.x = (i.x ?? 0) + n.x, i.y = (i.y ?? 0) + n.y;
  }
  buildTree(t, n, i, r, o) {
    return $.buildTreeStatic(t, n, i, r, o);
  }
  static isScaffolding(t) {
    return t === Ji || t.startsWith(tr);
  }
  static buildTreeStatic(t, n, i, r, o) {
    if (!t.length)
      return { root: null, nodes: [], nodeById: /* @__PURE__ */ new Map() };
    const a = /* @__PURE__ */ new Map();
    for (const L of t) {
      const z = L;
      z.children = [], a.set(L.id, z);
    }
    const { parentOf: s, roots: c, parked: l, levels: f, declaredRows: v } = o ?? $.buildLevelsStatic(t, n, i);
    let d = 0;
    const m = () => ({ id: `${tr}${d++}`, children: [] }), S = (L) => f.get(L) ?? 0, b = (L, z, Y, nt) => {
      let N = L;
      for (let C = z + 1; C < nt && d < rc; C++) {
        const K = m();
        N.children.push(K), N = K;
      }
      N.children.push(Y);
    };
    for (const [L, z] of s) {
      const Y = a.get(L), nt = a.get(z);
      !Y || !nt || (b(nt, S(z), Y, S(L)), Y.parent = nt);
    }
    const g = l.map((L) => a.get(L)).filter((L) => !!L), w = $.hierarchyRootFor(c, a, S, b, m);
    if (!w) {
      if (!c.length && g.length) {
        const L = $.packParked(g, [], i, r, v);
        return { root: null, nodes: L, nodeById: new Map(L.map((z) => [z.data.id, z])) };
      }
      throw new Error(`Root node with id "${c[0]}" not found.`);
    }
    const { treeLayout: _, offset: M } = $.sizedTreeLayout(i, r), y = Dn(w), D = _(y);
    $.offsetTree(D.descendants(), M);
    const O = D.descendants().filter((L) => !$.isScaffolding(L.data.id)), B = $.packParked(g, O, i, r, v), P = /* @__PURE__ */ new Map();
    for (const L of B) P.set(L.data.id, L);
    return D.descendants().forEach((L) => {
      $.isScaffolding(L.data.id) || P.set(L.data.id, L);
    }), { root: D, nodes: [...O, ...B], nodeById: P };
  }
  static hierarchyRootFor(t, n, i, r, o) {
    if (t.length === 1) {
      const c = n.get(t[0]);
      if (!c || i(t[0]) <= 0) return c;
      const l = o();
      return r(l, 0, c, i(t[0])), l;
    }
    const a = t.map((c) => n.get(c)).filter((c) => !!c);
    if (!a.length) return;
    const s = { id: Ji, children: [] };
    for (const c of a) r(s, 0, c, i(c.id));
    return s;
  }
  buildLevels(t, n, i) {
    return $.buildLevelsStatic(t, n, i);
  }
  static readDeclaredHierarchy(t, n, i) {
    const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), s = (d) => a.set(d, (a.get(d) ?? 0) + 1), c = i ? n.parentKey : void 0, l = n.depthKey;
    if (!c && !l) return { parentOf: r, rowOf: o, complaints: a };
    const f = new Set(t.map((d) => d.id));
    for (const d of t) {
      const m = d.getData();
      if (l) {
        const g = m[l];
        if (g != null && g !== "") {
          const w = Math.floor(Number(g));
          Number.isFinite(w) && w >= 0 && w <= er ? o.set(d.id, w) : s(`declared depths that are not a row between 0 and ${er}`);
        }
      }
      if (!c) continue;
      const S = m[c];
      if (S == null || S === "") continue;
      const b = String(S);
      b === d.id ? s("declared parents pointing at their own node") : f.has(b) ? r.set(d.id, b) : s("declared parents not in the layout");
    }
    const v = /* @__PURE__ */ new Set();
    for (const d of [...r.keys()]) {
      if (v.has(d)) continue;
      const m = [], S = /* @__PURE__ */ new Set();
      let b = d;
      for (; b !== void 0 && !v.has(b); ) {
        if (S.has(b)) {
          r.delete(b), s("declared parent cycles broken");
          break;
        }
        S.add(b), m.push(b), b = r.get(b);
      }
      for (const g of m) v.add(g);
    }
    return { parentOf: r, rowOf: o, complaints: a };
  }
  static warnAboutDeclared(t) {
    if (!t.size) return;
    const n = "[Pivotick] Tree layout ignored part of the declared hierarchy: " + [...t].map(([i, r]) => `${r} ${i}`).join(", ") + ".";
    n !== ir && (ir = n, console.warn(n));
  }
  static buildLevelsStatic(t, n, i = {}) {
    var nt;
    if (!t.length)
      return { levels: /* @__PURE__ */ new Map(), maxDepth: 0, nodeCountPerLevel: {}, parentOf: /* @__PURE__ */ new Map(), roots: [], parked: [], declaredRows: /* @__PURE__ */ new Map() };
    const r = i.rootId !== void 0 && t.some((N) => N.id === i.rootId) ? i.rootId : void 0, o = $.readDeclaredHierarchy(t, i, r === void 0);
    let a = r !== void 0;
    const s = /* @__PURE__ */ new Map(), c = new Map(o.parentOf), l = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Set(), v = /* @__PURE__ */ new Set();
    for (const N of t)
      l.set(N.id, []);
    for (const { source: N, target: C } of n)
      (nt = l.get(N.id)) == null || nt.push(C.id), f.add(C.id), v.add(N.id), v.add(C.id);
    for (const [N, C] of o.parentOf)
      v.add(N), v.add(C), f.add(N);
    const d = () => {
      var N;
      for (const { source: C, target: K } of n) (N = l.get(K.id)) == null || N.push(C.id);
      a = !0;
    };
    a && d();
    const m = (N) => v.has(N) || N === r, S = t.filter((N) => m(N.id)), b = t.filter((N) => !m(N.id)).map((N) => N.id), g = o.parentOf.size > 0, w = (N, C) => {
      const K = /* @__PURE__ */ new Set();
      let W = C;
      for (; W !== void 0 && !K.has(W); ) {
        if (W === N) return !0;
        K.add(W), W = c.get(W);
      }
      return !1;
    }, _ = /* @__PURE__ */ new Set(), M = (N) => {
      if (_.has(N)) return;
      _.add(N);
      const C = [N];
      let K = 0;
      for (; K < C.length; ) {
        const W = C[K++];
        for (const R of l.get(W) ?? [])
          _.has(R) || (_.add(R), !c.has(R) && !(g && w(R, W)) && c.set(R, W), C.push(R));
      }
    }, y = [];
    if (S.length) {
      const N = g ? S.filter((W) => !c.has(W.id)) : S, C = N.length ? N : S;
      let K = r ?? $.findRootId(C, n, i.rootIdAlgorithmFinder);
      if (r === void 0 && $.directedCoverage(K, l, n) < nr) {
        const W = Zi(C, n).id;
        $.directedCoverage(W, l, n) < nr && (d(), K = Zl(C, n, W).id);
      }
      M(K);
      for (const W of S) {
        if (_.has(W.id)) continue;
        const R = S.find((G) => !_.has(G.id) && !f.has(G.id)) ?? W;
        M(R.id);
      }
      c.has(K) || y.push(K);
      for (const W of S)
        W.id !== K && !c.has(W.id) && y.push(W.id);
    }
    const D = /* @__PURE__ */ new Map();
    for (const [N, C] of c) {
      const K = D.get(C) ?? [];
      K.push(N), D.set(C, K);
    }
    let O = 0;
    const B = (N, C) => {
      const K = [[N, C]];
      for (; K.length; ) {
        const [W, R] = K.pop();
        if (s.has(W)) continue;
        const G = o.rowOf.get(W);
        G !== void 0 && G < R && O++;
        const Z = G !== void 0 && G > R ? G : R;
        s.set(W, Z);
        for (const ct of D.get(W) ?? []) K.push([ct, Z + 1]);
      }
    };
    for (const N of y) B(N, 0);
    for (const N of S)
      s.has(N.id) || B(N.id, 0);
    O && o.complaints.set("declared depths clamped to just below their parent", O), $.warnAboutDeclared(o.complaints);
    const P = y.length > 1 ? 1 : 0;
    if (P)
      for (const [N, C] of s) s.set(N, C + P);
    let L = 0;
    for (const N of s.values())
      N > L && (L = N);
    if (b.length) {
      const N = L + 1;
      for (const C of b) {
        const K = o.rowOf.get(C);
        s.set(C, K === void 0 ? N : K + P);
      }
      for (const C of s.values())
        C > L && (L = C);
    }
    const z = /* @__PURE__ */ new Map();
    for (const [N, C] of o.rowOf) z.set(N, C + P);
    const Y = {};
    for (const N of s.values())
      Y[N] = (Y[N] || 0) + 1;
    return { levels: s, maxDepth: L, nodeCountPerLevel: Y, parentOf: c, roots: y, parked: b, declaredRows: z };
  }
  static directedCoverage(t, n, i) {
    var s, c;
    const r = (l) => {
      const f = /* @__PURE__ */ new Set([t]), v = [t];
      for (let d = 0; d < v.length; d++)
        for (const m of l.get(v[d]) ?? [])
          f.has(m) || (f.add(m), v.push(m));
      return f.size;
    }, o = /* @__PURE__ */ new Map();
    for (const l of n.keys()) o.set(l, []);
    for (const { source: l, target: f } of i)
      (s = o.get(l.id)) == null || s.push(f.id), (c = o.get(f.id)) == null || c.push(l.id);
    const a = r(o);
    return a === 0 ? 1 : r(n) / a;
  }
  static findRootId(t, n, i) {
    switch (i) {
      case "FirstZeroInDegree":
        return Xi(t, n).id;
      case "MaxReachability":
        return Zi(t, n).id;
      case "MinMaxDistance":
        return Xl(t, n).id;
      case "MinHeight":
        return zr(t, n).id;
      default:
        return Xi(t, n).id;
    }
  }
}
class ue extends $ {
  constructor(t, n, i, r) {
    super(t, n, i, { ...r, type: "tree" });
  }
  static registerForcesOnSimulation(t, n, i, r, o, a) {
    $.registerForcesOnSimulation(t, n, i, r, o, a, ue);
  }
  buildTree(t, n, i, r) {
    return ue.buildTreeStatic(t, n, i, r);
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
    const a = i.rootId, s = o.get(a);
    if (s.children = [], !s)
      throw new Error(`Root node with id "${a}" not found.`);
    const c = /* @__PURE__ */ new Set([s.id]);
    for (const S of n) {
      const b = o.get(S.source.id), g = o.get(S.target.id);
      if (!b || !g) continue;
      const w = S.source.id === s.id ? g : S.target.id === s.id ? b : void 0;
      !w || c.has(w.id) || (c.add(w.id), s.children.push(w), w.parent = s);
    }
    const { treeLayout: l, offset: f } = ue.sizedTreeLayout(i, r), v = Dn(s), d = l(v);
    ue.offsetTree(d.descendants(), f);
    const m = /* @__PURE__ */ new Map();
    return d.descendants().forEach((S) => {
      m.set(S.data.id, S);
    }), { root: d, nodes: d.descendants(), nodeById: m };
  }
}
function oc(e) {
  var n;
  const t = (n = e.getData()) == null ? void 0 : n.label;
  return typeof t == "string" ? t : "";
}
const rr = 0.3, sc = 1, or = 4, ac = 400, lc = 24, cc = 6.5, uc = 10, hc = 140, fc = 1.15, dc = 0.35, pc = 0.35, gc = 58e-4, mc = 38, Br = 95, yc = 300, _c = 0.35, vc = 8, bc = 10, Tc = 0.54, sr = 24, wc = 62, Sc = 0.2, Ac = 240, Ec = 0.9, gn = 1e-3, xc = 0.06, Nc = 0.03, Mc = 8, ar = 2e-3;
function Se(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function qe(e) {
  return Se(e, 0, 1);
}
function Cn(e, t) {
  const [n, i] = lt[t];
  return Se(e, n, i);
}
function Rc(e) {
  return rr + (sc - rr) * Gr(e);
}
function Gr(e) {
  return qe(Math.log10(Math.max(e, 1) / or) / Math.log10(ac / or));
}
function Ur(e) {
  const t = 10 + Math.sqrt(Math.max(0, e - 10));
  return t * t / 100;
}
function Ic(e, t) {
  const n = Math.pow(Math.max(1, t) / bc, Tc), i = mc * Math.pow(yc / Math.max(1, e), _c);
  return Se(i * n, vc, Br);
}
function Dc(e, t, n) {
  const i = e / Ur(t);
  return Se(i / 400 * 100, Ic(n, t), Br);
}
function Cc(e, t) {
  return e / 100 * 400 * Ur(t);
}
function Oc(e) {
  const t = (e - 0.6) / 1.7999999999999998;
  return Cn(4 + t * 56, "collisionRadius");
}
function kc(e, t, n, i) {
  const r = Math.max(1, Ec * 0.5 * Math.min(t.width, t.height)), o = Ac * n * e / (r * r * r), a = gn + (Nc - gn) * Math.pow(1 - Gr(n), 3), s = gn + (xc - gn) * qe(i), c = Math.max(a, s), l = Se(o, ar, Math.max(ar, c));
  return Cn(100 * Math.sqrt(qe(l / Sc)), "centering");
}
function Lc(e) {
  return Cn(1.2 + 0.8 * Math.log10(Math.max(e, 1)), "settleTime");
}
function Fc(e) {
  const t = qe(Math.log10(Math.max(e, 1) / 4) / Math.log10(125));
  return sr + (wc - sr) * t;
}
function Pc(e) {
  return { repulsion: Math.round(e.repulsion), linkDistance: Math.round(e.linkDistance), collisionRadius: Math.round(e.collisionRadius), friction: Math.round(e.friction), centering: Math.round(e.centering), settleTime: Math.round(e.settleTime * 10) / 10 };
}
function zc(e) {
  const t = Rc(e.nodeCount) * e.canvas.width * e.canvas.height;
  return { targetArea: t, spacing: Math.sqrt(t / Math.max(1, e.nodeCount)) };
}
function Bc(e) {
  const { spacing: t } = zc(e), n = Math.max(1, e.radii.mean), i = Math.max(0.8 * t, cc * n), r = 2 * n + lc, o = Math.min(lt.linkDistance[1], uc * n + hc), a = Cn(Se(i, r, Math.max(r, o)), "linkDistance"), s = gc * t * t, c = e.radii.totalArea / Math.max(1, e.nodeCount * a * a), l = fc + dc * qe(c / pc), f = Dc(s, n, e.nodeCount);
  return Pc({ repulsion: f, linkDistance: a, collisionRadius: Oc(l), friction: Fc(e.nodeCount), centering: kc(Cc(f, n), e.canvas, e.nodeCount, e.looseNodeFraction), settleTime: Lc(e.nodeCount) });
}
function Gc(e, t) {
  const n = /* @__PURE__ */ new Map();
  for (const a of e) n.set(a, a);
  const i = (a) => {
    let s = a;
    for (; n.get(s) !== s; ) s = n.get(s);
    let c = a;
    for (; n.get(c) !== s; ) {
      const l = n.get(c);
      n.set(c, s), c = l;
    }
    return s;
  };
  let r = e.length;
  for (const [a, s] of t) {
    if (!n.has(a) || !n.has(s)) continue;
    const c = i(a), l = i(s);
    c !== l && (n.set(c, l), r--);
  }
  let o = 0;
  if (r > 1) {
    const a = /* @__PURE__ */ new Map();
    for (const s of e) {
      const c = i(s);
      a.set(c, (a.get(c) ?? 0) + 1);
    }
    for (const s of a.values())
      s < Mc && (o += s);
  }
  return { count: r, looseNodeFraction: e.length ? o / e.length : 0 };
}
const Ue = { d3Alpha: 1, d3AlphaMin: 1e-3, d3AlphaDecay: 0.05, d3AlphaTarget: 0, d3VelocityDecay: 0.45, d3LinkDistance: 40, d3LinkStrength: null, d3ManyBodyStrength: -150, d3ManyBodyTheta: 0.9, d3CollideRadius: 12, d3CollideRadiusMultiplier: 1.2, d3CollideStrength: 1, d3CollideIterations: 1, d3GravityStrength: 0.1, d3GravityStrengthConnected: 1e-3, enabled: !0, cooldownTime: 2e3, useWorker: !0, warmupTicks: "auto", freezeNodesOnDrag: !0, gridSnappingEnabled: !1, gridSize: 50, fitViewOnExpandCollapse: !1, layout: { type: "force" }, callbacks: { onInit: () => {
}, onStart: () => {
}, onStop: () => {
}, onTick: () => {
} } }, lt = { repulsion: [0, 100], linkDistance: [40, 600], collisionRadius: [4, 60], friction: [0, 100], centering: [0, 100], settleTime: [0.5, 8] }, An = [0.5, 10], Uc = "MaxReachability", jc = { levelSpacing: 1, siblingSpacing: 1 }, Hc = { tight: { repulsion: 32, linkDistance: 70, collisionRadius: 16, friction: 45, centering: 7, settleTime: 3 }, loose: { repulsion: 70, linkDistance: 150, collisionRadius: 26, friction: 28, centering: 7, settleTime: 2.25 } }, x = class x {
  constructor(t, n = {}) {
    E(this, "simulation");
    E(this, "graph");
    E(this, "container");
    E(this, "graphInteraction");
    E(this, "layout");
    E(this, "containerBCR");
    E(this, "containerObserver");
    E(this, "animationFrameId", null);
    E(this, "startSimulationTime", 0);
    E(this, "engineRunning", !1);
    E(this, "slowTickThresholdReached", !1);
    E(this, "avgTickDuration", 0);
    E(this, "SLOW_TICK_THRESHOLD", 33);
    E(this, "dragInProgress", !1);
    E(this, "dragSelection", []);
    E(this, "totalTickCount", 0);
    E(this, "runTickCount", 0);
    E(this, "options");
    E(this, "callbacks");
    E(this, "simulationForces");
    E(this, "scaledForces", { d3ManyBodyStrength: Ue.d3ManyBodyStrength, d3CollideStrength: Ue.d3CollideStrength });
    E(this, "physicsKnobs");
    E(this, "autoEnabled");
    E(this, "autoTuneTimer", null);
    E(this, "applyingAutoKnobs", !1);
    E(this, "suppressReheat", !1);
    E(this, "autoLastRun", null);
    if (this.graph = t, this.autoEnabled = x.shouldAutoTune(n), this.options = yn({}, Ue, n), this.callbacks = this.options.callbacks ?? {}, this.physicsKnobs = x.knobsFromOptions(this.options), this.container = this.graph.renderer.getRootContainer(), !this.container) throw new Error("Root container is not defined in the graph renderer.");
    if (this.containerBCR = x.measureContainer(this.container), this.graphInteraction = this.graph.renderer.getGraphInteraction(), !this.graphInteraction) throw new Error("Graph interaction is not available.");
    const i = x.initSimulationForces(this.options, this.containerBCR);
    this.simulation = i.simulation, this.simulationForces = i.simulationForces, this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength || Ue.d3ManyBodyStrength, this.scaledForces.d3CollideStrength = this.options.d3CollideStrength || Ue.d3CollideStrength, this.options.layout.type === "tree" ? this.layout = new $(this.graph, this.simulation, this.simulationForces, this.options.layout) : this.options.layout.type === "egoTree" && (this.layout = new ue(this.graph, this.simulation, this.simulationForces, this.options.layout)), this.layout && Object.assign(this.options.layout, this.layout.getSpacing()), this.observeContainer(), this.callbacks.onInit && this.callbacks.onInit(this);
  }
  static measureContainer(t) {
    const n = t.getBoundingClientRect();
    if (n.width > 0 && n.height > 0) return n;
    const { width: i, height: r } = x.FALLBACK_CONTAINER_SIZE;
    return new DOMRect(n.x, n.y, i, r);
  }
  observeContainer() {
    !this.container || typeof ResizeObserver > "u" || (this.containerObserver = new ResizeObserver(() => {
      if (!this.container) return;
      const t = x.measureContainer(this.container);
      t.width === this.containerBCR.width && t.height === this.containerBCR.height || (this.containerBCR = t, x.initSimulationForceGravity(this.simulationForces.gravity, this.options, t), this.scheduleTune());
    }), this.containerObserver.observe(this.container));
  }
  destroy() {
    var t;
    this.stop(), (t = this.containerObserver) == null || t.disconnect(), this.containerObserver = void 0, this.container = void 0;
  }
  static initSimulationForces(t, n) {
    const i = { link: Do(), charge: $o(), collide: Ro(), gravity: Yo() }, r = Vo().force("link", i.link).force("charge", i.charge).force("collide", i.collide).force("gravity", i.gravity);
    return this.initSimulationForceGravity(i.gravity, t, n), this.initSimulationForceLink(i.link, t), this.initSimulationForceCharge(i.charge, t), this.initSimulationForceCollide(i.collide, t), r.alphaMin(t.d3AlphaMin), r.alphaDecay(t.d3AlphaDecay), r.alphaTarget(0), r.velocityDecay(t.d3VelocityDecay), { simulation: r, simulationForces: i };
  }
  static initSimulationForceGravity(t, n, i) {
    t.x(i.width / 2).y(i.height / 2).strength((r) => (r.degree() ?? 0) === 0 ? n.d3GravityStrength : n.d3GravityStrengthConnected);
  }
  static initSimulationForceLink(t, n) {
    t.distance((i) => {
      const r = i.__clusterAnchorDistance;
      if (r != null) return r;
      const o = oc(i);
      if (!o || o === "")
        return n.d3LinkDistance;
      const a = o.length * 10;
      return Math.max(n.d3LinkDistance, a);
    }), n.d3LinkStrength && t.strength(n.d3LinkStrength);
  }
  static initSimulationForceCharge(t, n) {
    t.theta(n.d3ManyBodyTheta).strength((i) => {
      const r = i, o = n.d3ManyBodyStrength, a = r.expanded ? r.getCircleRadiusCollapsed() : r.getCircleRadius(), s = 10 + Math.sqrt(Math.max(0, a - 10));
      let c = r.weight ?? 1;
      return c *= r.isParent ? 10 : 1, o * (s * s) / 100 * c;
    });
  }
  static initSimulationForceCollide(t, n) {
    const i = n.d3CollideRadiusMultiplier;
    t.radius((r) => {
      const o = r;
      return o.expanded ? i * o.getCircleRadius() + 20 : o.getCircleRadius() ? i * o.getCircleRadius() : n.d3CollideRadius;
    }).strength(n.d3CollideStrength);
  }
  static initSimulationForceClusterRadialConstraint(t, n) {
    t.strength(n.d3CollideStrength);
  }
  update() {
    this.layout ? (this.layout.update(), Object.assign(this.options.layout, this.layout.getSpacing())) : this.scheduleTune();
    const t = this.graph.getMutableNodes().filter((i) => i.visible);
    this.simulation.nodes(t);
    const n = this.simulation.force("link");
    n && n.id((i) => i.id).links(this.getActiveEdges()), this.restart();
  }
  getActiveEdges() {
    const t = new Set(this.graph.getMutableNodes().filter((a) => a.visible).map((a) => a.id)), n = (a) => {
      let s = a;
      for (; s && !t.has(s.id); ) s = s.parentNode;
      return s;
    }, i = (a, s) => a < s ? `${a}|${s}` : `${s}|${a}`, r = [], o = /* @__PURE__ */ new Set();
    for (const a of this.graph.getMutableEdges()) {
      if (!a.visibleIgnoringLayer) continue;
      const s = a.source, c = a.target;
      if (!s.isChild && !c.isChild) {
        r.push(a), o.add(i(s.id, c.id));
        continue;
      }
      if (s.isChild && c.isChild) continue;
      const l = s.isChild ? c : s, f = n(s.isChild ? s : c);
      if (!f || f.id === l.id) continue;
      const v = i(l.id, f.id);
      o.has(v) || (o.add(v), r.push(this.clusterAnchorLink(l, f)));
    }
    return r;
  }
  clusterAnchorLink(t, n) {
    return { id: `cluster-anchor-${t.id}-${n.id}`, source: t, target: n, __clusterAnchorDistance: n.getCircleRadius() + this.options.d3LinkDistance };
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
    if (t && (this.tuneNow({ reheat: !1 }), await this.runSimulationWorkerRouter()), !this.options.enabled) {
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
    const t = this.options.cooldownTime / 1e3 * x.NOMINAL_FPS;
    return this.runTickCount >= t || this.options.d3AlphaMin > 0 && this.simulation.alpha() < this.options.d3AlphaMin ? !0 : (/* @__PURE__ */ new Date()).getTime() - this.startSimulationTime > this.options.cooldownTime * x.COOLDOWN_WALL_GRACE;
  }
  updateTickMetrics(t) {
    var n;
    this.avgTickDuration = this.avgTickDuration * 0.9 + t * 0.1, this.avgTickDuration > this.SLOW_TICK_THRESHOLD && (this.slowTickThresholdReached = !0, this.disable(), this.graph.UIManager.showNotification({ level: "warning", title: "Physics engine running slow", message: "The physic has been disabled." }), (n = this.graph.UIManager.physicsFlyout) == null || n.syncRunState());
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
    for (const i of this.graph.getMutableNodes()) {
      const r = n.get(i.id);
      r && (i.x = r.x, i.y = r.y, i.fx = typeof r.fx == "number" ? r.fx : void 0, i.fy = typeof r.fy == "number" ? r.fy : void 0);
    }
  }
  async computeGraph(t = {}) {
    const { runSimulation: n } = await Promise.resolve().then(() => Kc), i = this.containerBCR, r = this.graph.getMutableNodes(), o = this.graph.getNodes(), a = this.graph.getEdges(), { callbacks: s, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: l } = n(o, a, c, i);
    this.applyComputedPositions(l), this.graph.updateData(r, void 0, !1);
  }
  async runSimulationWorkerRouter(t = {}) {
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
    const n = this.containerBCR, i = this.graph.getMutableNodes(), r = this.graph.getNodes().map((f) => f.toSimulationDTO()), o = this.graph.getEdges().map((f) => f.toSimulationDTO()), a = (f, v) => {
      this.graph.updateLayoutProgress(f, v, "simulation");
    }, { callbacks: s, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: l } = await vl(r, o, c, n, a);
    this.graph.updateLayoutProgress(100, 0, "rendering"), this.applyComputedPositions(l), this.graph.updateData(i, void 0, !1), this.graph.updateLayoutProgress(100, 0, "done");
  }
  reheat(t = 0.7) {
    this.restart(), this.simulation.alpha(t).restart();
  }
  refreshForcesAndReheat(t = 0.5) {
    if (!this.options.enabled) return;
    this.tuneNow({ reheat: !1 });
    const n = this.graph.getMutableNodes().filter((i) => i.visible);
    this.simulation.nodes(n), this.reheat(t);
  }
  setRepulsion(t) {
    const n = x.clamp(t, lt.repulsion);
    this.physicsKnobs.repulsion = n, this.options.d3ManyBodyStrength = x.mapLinear(n, lt.repulsion, x.REPULSION_STRENGTH_RANGE), this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength, x.initSimulationForceCharge(this.simulationForces.charge, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setLinkDistance(t) {
    const n = x.clamp(t, lt.linkDistance);
    this.physicsKnobs.linkDistance = n, this.options.d3LinkDistance = x.mapLinear(n, lt.linkDistance, x.LINK_DISTANCE_RANGE), x.initSimulationForceLink(this.simulationForces.link, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setCollisionRadius(t) {
    const n = x.clamp(t, lt.collisionRadius);
    this.physicsKnobs.collisionRadius = n, this.options.d3CollideRadiusMultiplier = x.mapLinear(n, lt.collisionRadius, x.COLLIDE_MULTIPLIER_RANGE), x.initSimulationForceCollide(this.simulationForces.collide, this.options), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setFriction(t) {
    const n = x.clamp(t, lt.friction);
    this.physicsKnobs.friction = n, this.options.d3VelocityDecay = x.mapLinear(n, lt.friction, x.FRICTION_DECAY_RANGE), this.simulation.velocityDecay(this.options.d3VelocityDecay), this.noteManualKnobEdit();
  }
  setCentering(t) {
    const n = x.clamp(t, lt.centering);
    this.physicsKnobs.centering = n, this.options.d3GravityStrengthConnected = x.gravityForCentering(n), this.options.d3GravityStrength = x.isolatedGravityFor(this.options.d3GravityStrengthConnected), x.initSimulationForceGravity(this.simulationForces.gravity, this.options, this.containerBCR), this.noteManualKnobEdit(), this.reheatIfEnabled();
  }
  setSettleTime(t) {
    const n = x.clamp(t, lt.settleTime);
    this.physicsKnobs.settleTime = n, this.options.d3AlphaDecay = x.alphaDecayForSettleTime(n, this.options.d3AlphaMin), this.options.cooldownTime = n * 1e3, this.simulation.alphaDecay(this.options.d3AlphaDecay), this.noteManualKnobEdit();
  }
  applyPhysicsPreset(t) {
    this.disableAutoPhysics(), this.writeKnobs(Hc[t]), this.reheatIfEnabled(x.CLICK_REHEAT_ALPHA);
  }
  writeKnobs(t) {
    this.physicsKnobs = { ...t }, this.options.d3ManyBodyStrength = x.mapLinear(t.repulsion, lt.repulsion, x.REPULSION_STRENGTH_RANGE), this.scaledForces.d3ManyBodyStrength = this.options.d3ManyBodyStrength, this.options.d3LinkDistance = x.mapLinear(t.linkDistance, lt.linkDistance, x.LINK_DISTANCE_RANGE), this.options.d3CollideRadiusMultiplier = x.mapLinear(t.collisionRadius, lt.collisionRadius, x.COLLIDE_MULTIPLIER_RANGE), this.options.d3VelocityDecay = x.mapLinear(t.friction, lt.friction, x.FRICTION_DECAY_RANGE), this.options.d3GravityStrengthConnected = x.gravityForCentering(t.centering), this.options.d3GravityStrength = x.isolatedGravityFor(this.options.d3GravityStrengthConnected), this.options.d3AlphaDecay = x.alphaDecayForSettleTime(t.settleTime, this.options.d3AlphaMin), this.options.cooldownTime = t.settleTime * 1e3, x.initSimulationForceCharge(this.simulationForces.charge, this.options), x.initSimulationForceLink(this.simulationForces.link, this.options), x.initSimulationForceCollide(this.simulationForces.collide, this.options), x.initSimulationForceGravity(this.simulationForces.gravity, this.options, this.containerBCR), this.simulation.velocityDecay(this.options.d3VelocityDecay), this.simulation.alphaDecay(this.options.d3AlphaDecay);
  }
  getPhysicsKnobs() {
    return { ...this.physicsKnobs };
  }
  getLayoutType() {
    return this.options.layout.type;
  }
  getTreeSpacing() {
    var t;
    return ((t = this.layout) == null ? void 0 : t.getSpacing()) ?? { ...jc };
  }
  setTreeSpacing(t) {
    if (!this.layout) return;
    const n = {};
    t.levelSpacing !== void 0 && (n.levelSpacing = x.clamp(t.levelSpacing, An)), t.siblingSpacing !== void 0 && (n.siblingSpacing = x.clamp(t.siblingSpacing, An)), this.layout.setSpacing(n), Object.assign(this.options.layout, n, { spacing: "manual" }), this.graph.nextTick(), this.reheatIfEnabled();
  }
  getTreeRoot() {
    var t;
    return ((t = this.layout) == null ? void 0 : t.getRoot()) ?? { algorithm: Uc };
  }
  setTreeRoot(t) {
    if (!this.layout) return;
    this.layout.setRoot(t);
    const n = this.layout.getRoot();
    Object.assign(this.options.layout, { rootId: n.rootId, rootIdAlgorithmFinder: n.algorithm }), this.graph.nextTick(), this.reheatIfEnabled();
  }
  isAutoTreeSpacingEnabled() {
    var t;
    return ((t = this.layout) == null ? void 0 : t.isAutoSpacing()) ?? !1;
  }
  enableAutoTreeSpacing() {
    this.layout && (this.layout.enableAutoSpacing(), Object.assign(this.options.layout, { spacing: "auto" }), this.graph.nextTick(), this.reheatIfEnabled());
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
    const n = (r, o, a) => Math.round(x.clamp(x.mapLinear(r, o, lt[a]), lt[a])), i = x.settleTimeFromAlphaDecay(t.d3AlphaDecay, t.d3AlphaMin);
    return { repulsion: n(t.d3ManyBodyStrength, x.REPULSION_STRENGTH_RANGE, "repulsion"), linkDistance: n(t.d3LinkDistance, x.LINK_DISTANCE_RANGE, "linkDistance"), collisionRadius: n(t.d3CollideRadiusMultiplier, x.COLLIDE_MULTIPLIER_RANGE, "collisionRadius"), friction: n(t.d3VelocityDecay, x.FRICTION_DECAY_RANGE, "friction"), centering: Math.round(x.clamp(x.centeringFromGravity(t.d3GravityStrengthConnected), lt.centering)), settleTime: Math.round(x.clamp(i, lt.settleTime) * 10) / 10 };
  }
  static gravityForCentering(t) {
    const n = t / lt.centering[1];
    return x.CENTERING_STRENGTH_MAX * n * n;
  }
  static centeringFromGravity(t) {
    const n = Math.sqrt(Math.max(0, t) / x.CENTERING_STRENGTH_MAX);
    return lt.centering[1] * n;
  }
  static isolatedGravityFor(t) {
    const [n, i] = x.CENTERING_ISOLATED_RANGE;
    return Math.max(n, Math.min(i, t * x.CENTERING_ISOLATED_MULTIPLE));
  }
  static alphaDecayForSettleTime(t, n) {
    const i = Math.max(1, t * x.NOMINAL_FPS), r = Math.min(0.999, Math.max(1e-6, n));
    return 1 - Math.pow(r, 1 / i);
  }
  static settleTimeFromAlphaDecay(t, n) {
    const i = Math.min(0.999, Math.max(1e-6, n)), r = Math.min(0.999, Math.max(1e-6, t));
    return Math.log(i) / Math.log(1 - r) / x.NOMINAL_FPS;
  }
  static shouldAutoTune(t) {
    return t.physics === "auto" ? !0 : t.physics === "manual" ? !1 : !x.AUTO_OWNED_OPTIONS.some((n) => t[n] !== void 0);
  }
  isAutoPhysicsEnabled() {
    return this.autoEnabled;
  }
  enableAutoPhysics() {
    this.autoEnabled = !0, this.tuneNow({ alpha: x.CLICK_REHEAT_ALPHA, force: !0 });
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
      this.autoTuneTimer = null, this.tuneNow();
    }, x.AUTO_DEBOUNCE_MS));
  }
  tuneNow(t = {}) {
    var l;
    const { reheat: n = !0, alpha: i = x.AUTO_REHEAT_ALPHA, force: r = !1 } = t;
    if (!this.autoEnabled || this.options.layout.type !== "force") return;
    const o = this.buildAutoContext();
    if (o.nodeCount === 0) return;
    const a = Bc(o), c = Object.keys(a).every((f) => {
      const [v, d] = lt[f];
      return Math.abs(a[f] - this.physicsKnobs[f]) <= (d - v) * x.AUTO_DEADBAND;
    }) && !r;
    if (this.autoLastRun = { context: o, knobs: c ? this.getPhysicsKnobs() : a, skipped: c }, !c) {
      this.applyingAutoKnobs = !0, this.suppressReheat = !0;
      try {
        this.writeKnobs(a);
      } finally {
        this.suppressReheat = !1, this.applyingAutoKnobs = !1;
      }
      n && this.reheatIfEnabled(i), (l = this.graph.UIManager.physicsFlyout) == null || l.syncAutoKnobs(this.getPhysicsKnobs());
    }
  }
  buildAutoContext() {
    const t = this.containerBCR, n = this.graph.getMutableNodes().filter((c) => c.visible), i = this.getActiveEdges();
    let r = 0, o = 0, a = 0;
    for (const c of n) {
      const l = c.expanded ? c.getCircleRadiusCollapsed() : c.getCircleRadius();
      r += l, o = Math.max(o, l), a += Math.PI * l * l;
    }
    const s = Gc(n.map((c) => c.id), i.map((c) => [c.source.id, c.target.id]));
    return { canvas: { width: t.width, height: t.height }, nodeCount: n.length, radii: { mean: n.length ? r / n.length : 0, max: o, totalArea: a }, edgeCount: i.length, componentCount: s.count, looseNodeFraction: s.looseNodeFraction, current: this.getPhysicsKnobs() };
  }
  createDragBehavior() {
    return Ba().filter(() => !this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement", (t, n) => {
      this.graphInteraction.hasActiveMultiselection() ? this.dragSelection = this.graphInteraction.getSelectedNodes().map((i) => {
        const { node: r } = i;
        return r.freeze(), { node: r, dx: r.x - n.x, dy: r.y - n.y };
      }) : (this.dragSelection = [], n.freeze());
    }).on("drag.draggedelement", (t, n) => {
      if (!this.dragInProgress && this.isEnabled() && (this.dragInProgress = !0, this.restart(), this.simulation.alphaTarget(0.3).restart()), this.graphInteraction.hasActiveMultiselection())
        this.dragSelection.forEach(({ node: i, dx: r, dy: o }) => {
          const a = this.applySnap(t.x + r), s = this.applySnap(t.y + o);
          i.fx = a, i.fy = s, i.x = a, i.y = s;
        });
      else {
        const i = this.applySnap(t.x), r = this.applySnap(t.y);
        n.fx = i, n.fy = r, n.x = i, n.y = r;
      }
      if (this.graphInteraction.dragging(t.sourceEvent, t.subject), !this.engineRunning || !this.isEnabled()) {
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
    this.layout && ((i = this.layout) == null || i.unregisterLayout(), this.layout = void 0), n = n ?? {}, n.layout = n.layout ?? {}, n.layout.type = t, t === "force" ? (x.initSimulationForceCharge(this.simulationForces.charge, this.options), x.initSimulationForceCollide(this.simulationForces.collide, this.options)) : t === "tree" && (this.layout = new $(this.graph, this.simulation, this.simulationForces, n.layout)), this.options.layout.type = t, this.update(), this.pause(), await this.runSimulationWorkerRouter(n), this.restart(), await this.waitForSimulationStop(), this.graph.renderer.fitAndCenterWhenSettled();
  }
};
E(x, "REPULSION_STRENGTH_RANGE", [0, -400]), E(x, "LINK_DISTANCE_RANGE", [40, 600]), E(x, "COLLIDE_MULTIPLIER_RANGE", [0.6, 2.4]), E(x, "FRICTION_DECAY_RANGE", [0, 1]), E(x, "CENTERING_STRENGTH_MAX", 0.2), E(x, "CENTERING_ISOLATED_MULTIPLE", 4), E(x, "CENTERING_ISOLATED_RANGE", [0.1, 0.3]), E(x, "AUTO_OWNED_OPTIONS", ["d3LinkDistance", "d3ManyBodyStrength", "d3CollideRadiusMultiplier", "d3VelocityDecay", "d3GravityStrength", "d3GravityStrengthConnected", "d3AlphaDecay", "cooldownTime"]), E(x, "AUTO_DEBOUNCE_MS", 150), E(x, "AUTO_DEADBAND", 0.04), E(x, "AUTO_REHEAT_ALPHA", 0.3), E(x, "CLICK_REHEAT_ALPHA", 1), E(x, "NOMINAL_FPS", 60), E(x, "COOLDOWN_WALL_GRACE", 4), E(x, "FALLBACK_CONTAINER_SIZE", { width: 1e3, height: 800 });
let En = x;
const jr = 1e4, xn = 2e4, Nn = 0.15 * xn;
self.onmessage = (e) => {
  var b, g, w;
  if (e.data.source !== "simulation-worker-wrapper") return;
  const { nodes: t, edges: n, options: i, canvasBCR: r } = e.data, o = t.map((_) => {
    const M = new Lr(_.id, _.data, _.style);
    return M.setCircleRadius(_._circleRadius ?? 10), typeof _.x == "number" && (M.x = _.x), typeof _.y == "number" && (M.y = _.y), typeof _.fx == "number" && (M.fx = _.fx), typeof _.fy == "number" && (M.fy = _.fy), M;
  }), a = new Map(o.map((_) => [_.id, _])), { simulation: s, simulationForces: c } = En.initSimulationForces(i, r), l = [];
  for (const _ of n) {
    const M = a.get(_.from.id), y = a.get(_.to.id);
    if (M && y) {
      const D = _.style ?? {};
      l.push(new In(_.id, M, y, _.data, D, _.directed));
    }
  }
  s.nodes(o);
  const f = s.force("link");
  f && f.id((_) => _.id).links(l), ((b = i.layout) == null ? void 0 : b.type) === "tree" ? $.registerForcesOnSimulation(o, l, s, c, i.layout, r, $) : ((g = i.layout) == null ? void 0 : g.type) === "egoTree" && $.registerForcesOnSimulation(o, l, s, c, i.layout, r, ue);
  let v = i.warmupTicks || xn;
  v = v === "auto" ? xn : v, v = v - Nn;
  let d = 0.3;
  s.alphaTarget(d);
  const m = (/* @__PURE__ */ new Date()).getTime();
  let S;
  for (let _ = 0; _ < v && !((/* @__PURE__ */ new Date()).getTime() - m > jr || (/* @__PURE__ */ new Date()).getTime() - m > i.cooldownTime || Mn(i, s, d) && (/* @__PURE__ */ new Date()).getTime() - m > i.cooldownTime * 0.15); ++_)
    _ % 5 === 0 && (S = lr(_, (/* @__PURE__ */ new Date()).getTime() - m, i), postMessage({ type: "tick", progress: S, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - m })), s.tick();
  d = 0, s.alphaTarget(d), s.alpha(1);
  for (let _ = 0; _ < Nn && !(Mn(i, s, d) && (/* @__PURE__ */ new Date()).getTime() - m > i.cooldownTime * 0.15); ++_)
    s.tick(), _ % 5 === 0 && (S = lr(v + _, (/* @__PURE__ */ new Date()).getTime() - m, i), postMessage({ type: "tick", progress: S, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - m }));
  postMessage({ type: "tick", progress: 1, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - m }), ((w = i.layout) == null ? void 0 : w.type) === "tree" && $.simulationDone(o, l, s, i.layout), postMessage({ type: "done", nodes: o.map((_) => _.toDict()), edges: l.map((_) => _.toDict()) });
};
function Wc(e, t, n, i) {
  var m, S, b;
  const r = e.map((g) => {
    const w = new Lr(g.id, g.getData(), g.getStyle());
    return w.weight = g.weight || 1, w.setCircleRadius(g.getCircleRadius()), typeof g.x == "number" && (w.x = g.x), typeof g.y == "number" && (w.y = g.y), typeof g.fx == "number" && (w.fx = g.fx), typeof g.fy == "number" && (w.fy = g.fy), w;
  }), o = new Map(r.map((g) => [g.id, g])), { simulation: a, simulationForces: s } = En.initSimulationForces(n, i), c = [];
  for (const g of t) {
    const w = o.get(g.from.id), _ = o.get(g.to.id);
    if (w && _) {
      const M = g.getStyle() ?? {};
      c.push(new In(g.id, w, _, g.getData(), M, g.directed));
    }
  }
  a.nodes(r);
  const l = a.force("link");
  l && l.id((g) => g.id).links(c), (((m = n.layout) == null ? void 0 : m.type) === "tree" || ((S = n.layout) == null ? void 0 : S.type) === "egoTree") && $.registerForcesOnSimulation(r, c, a, s, n.layout, i, $);
  let f;
  n.warmupTicks === "auto" || n.warmupTicks == null ? f = xn : f = n.warmupTicks, f = f - Nn;
  let v = 0.3;
  a.alphaTarget(v);
  const d = (/* @__PURE__ */ new Date()).getTime();
  for (let g = 0; g < f && !((/* @__PURE__ */ new Date()).getTime() - d > jr || (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime || Mn(n, a, v) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++g)
    a.tick();
  v = 0, a.alphaTarget(v), a.alpha(1);
  for (let g = 0; g < Nn && !(Mn(n, a, v) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++g)
    a.tick();
  return ((b = n.layout) == null ? void 0 : b.type) === "tree" && $.simulationDone(r, c, a, n.layout), { nodes: r, edges: c };
}
function lr(e, t, n) {
  return t / n.cooldownTime;
}
function Mn(e, t, n) {
  return e.d3AlphaMin > 0 && t.alpha() - n < e.d3AlphaMin;
}
const Kc = Object.freeze(Object.defineProperty({ __proto__: null, runSimulation: Wc }, Symbol.toStringTag, { value: "Module" }));
export {
  Wc as runSimulation
};
