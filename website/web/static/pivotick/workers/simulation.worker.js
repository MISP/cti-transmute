var Vi = Object.defineProperty;
var Wi = (e, t, n) => t in e ? Vi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var T = (e, t, n) => Wi(e, typeof t != "symbol" ? t + "" : t, n);
function $i(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e);
  return on(this.cover(t, n), t, n, e);
}
function on(e, t, n, i) {
  if (isNaN(t) || isNaN(n)) return e;
  var r, s = e._root, a = { data: i }, l = e._x0, c = e._y0, o = e._x1, h = e._y1, w, d, g, b, p, v, _, x;
  if (!s) return e._root = a, e;
  for (; s.length; )
    if ((p = t >= (w = (l + o) / 2)) ? l = w : o = w, (v = n >= (d = (c + h) / 2)) ? c = d : h = d, r = s, !(s = s[_ = v << 1 | p])) return r[_] = a, e;
  if (g = +e._x.call(null, s.data), b = +e._y.call(null, s.data), t === g && n === b) return a.next = s, r ? r[_] = a : e._root = a, e;
  do
    r = r ? r[_] = new Array(4) : e._root = new Array(4), (p = t >= (w = (l + o) / 2)) ? l = w : o = w, (v = n >= (d = (c + h) / 2)) ? c = d : h = d;
  while ((_ = v << 1 | p) === (x = (b >= d) << 1 | g >= w));
  return r[x] = s, r[_] = a, e;
}
function qi(e) {
  var t, n, i = e.length, r, s, a = new Array(i), l = new Array(i), c = 1 / 0, o = 1 / 0, h = -1 / 0, w = -1 / 0;
  for (n = 0; n < i; ++n)
    isNaN(r = +this._x.call(null, t = e[n])) || isNaN(s = +this._y.call(null, t)) || (a[n] = r, l[n] = s, r < c && (c = r), r > h && (h = r), s < o && (o = s), s > w && (w = s));
  if (c > h || o > w) return this;
  for (this.cover(c, o).cover(h, w), n = 0; n < i; ++n)
    on(this, a[n], l[n], e[n]);
  return this;
}
function Hi(e, t) {
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
function G(e, t, n, i, r) {
  this.node = e, this.x0 = t, this.y0 = n, this.x1 = i, this.y1 = r;
}
function Yi(e, t, n) {
  var i, r = this._x0, s = this._y0, a, l, c, o, h = this._x1, w = this._y1, d = [], g = this._root, b, p;
  for (g && d.push(new G(g, r, s, h, w)), n == null ? n = 1 / 0 : (r = e - n, s = t - n, h = e + n, w = t + n, n *= n); b = d.pop(); )
    if (!(!(g = b.node) || (a = b.x0) > h || (l = b.y0) > w || (c = b.x1) < r || (o = b.y1) < s))
      if (g.length) {
        var v = (a + c) / 2, _ = (l + o) / 2;
        d.push(
          new G(g[3], v, _, c, o),
          new G(g[2], a, _, v, o),
          new G(g[1], v, l, c, _),
          new G(g[0], a, l, v, _)
        ), (p = (t >= _) << 1 | e >= v) && (b = d[d.length - 1], d[d.length - 1] = d[d.length - 1 - p], d[d.length - 1 - p] = b);
      } else {
        var x = e - +this._x.call(null, g.data), S = t - +this._y.call(null, g.data), y = x * x + S * S;
        if (y < n) {
          var A = Math.sqrt(n = y);
          r = e - A, s = t - A, h = e + A, w = t + A, i = g.data;
        }
      }
  return i;
}
function Zi(e) {
  if (isNaN(h = +this._x.call(null, e)) || isNaN(w = +this._y.call(null, e))) return this;
  var t, n = this._root, i, r, s, a = this._x0, l = this._y0, c = this._x1, o = this._y1, h, w, d, g, b, p, v, _;
  if (!n) return this;
  if (n.length) for (; ; ) {
    if ((b = h >= (d = (a + c) / 2)) ? a = d : c = d, (p = w >= (g = (l + o) / 2)) ? l = g : o = g, t = n, !(n = n[v = p << 1 | b])) return this;
    if (!n.length) break;
    (t[v + 1 & 3] || t[v + 2 & 3] || t[v + 3 & 3]) && (i = t, _ = v);
  }
  for (; n.data !== e; ) if (r = n, !(n = n.next)) return this;
  return (s = n.next) && delete n.next, r ? (s ? r.next = s : delete r.next, this) : t ? (s ? t[v] = s : delete t[v], (n = t[0] || t[1] || t[2] || t[3]) && n === (t[3] || t[2] || t[1] || t[0]) && !n.length && (i ? i[_] = n : this._root = n), this) : (this._root = s, this);
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
  for (i && t.push(new G(i, this._x0, this._y0, this._x1, this._y1)); n = t.pop(); )
    if (!e(i = n.node, s = n.x0, a = n.y0, l = n.x1, c = n.y1) && i.length) {
      var o = (s + l) / 2, h = (a + c) / 2;
      (r = i[3]) && t.push(new G(r, o, h, l, c)), (r = i[2]) && t.push(new G(r, s, h, o, c)), (r = i[1]) && t.push(new G(r, o, a, l, h)), (r = i[0]) && t.push(new G(r, s, a, o, h));
    }
  return this;
}
function nr(e) {
  var t = [], n = [], i;
  for (this._root && t.push(new G(this._root, this._x0, this._y0, this._x1, this._y1)); i = t.pop(); ) {
    var r = i.node;
    if (r.length) {
      var s, a = i.x0, l = i.y0, c = i.x1, o = i.y1, h = (a + c) / 2, w = (l + o) / 2;
      (s = r[0]) && t.push(new G(s, a, l, h, w)), (s = r[1]) && t.push(new G(s, h, l, c, w)), (s = r[2]) && t.push(new G(s, a, w, h, o)), (s = r[3]) && t.push(new G(s, h, w, c, o));
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
function We(e) {
  for (var t = { data: e.data }, n = t; e = e.next; ) n = n.next = { data: e.data };
  return t;
}
var U = me.prototype = ve.prototype;
U.copy = function() {
  var e = new ve(this._x, this._y, this._x0, this._y0, this._x1, this._y1), t = this._root, n, i;
  if (!t) return e;
  if (!t.length) return e._root = We(t), e;
  for (n = [{ source: t, target: e._root = new Array(4) }]; t = n.pop(); )
    for (var r = 0; r < 4; ++r)
      (i = t.source[r]) && (i.length ? n.push({ source: i, target: t.target[r] = new Array(4) }) : t.target[r] = We(i));
  return e;
};
U.add = $i;
U.addAll = qi;
U.cover = Hi;
U.data = Xi;
U.extent = Ki;
U.find = Yi;
U.remove = Zi;
U.removeAll = Qi;
U.root = Ji;
U.size = tr;
U.visit = er;
U.visitAfter = nr;
U.x = rr;
U.y = sr;
function j(e) {
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
function lr(e) {
  return e.y + e.vy;
}
function ur(e) {
  var t, n, i, r = 1, s = 1;
  typeof e != "function" && (e = j(e == null ? 1 : +e));
  function a() {
    for (var o, h = t.length, w, d, g, b, p, v, _ = 0; _ < s; ++_)
      for (w = me(t, ar, lr).visitAfter(l), o = 0; o < h; ++o)
        d = t[o], p = n[d.index], v = p * p, g = d.x + d.vx, b = d.y + d.vy, w.visit(x);
    function x(S, y, A, D, k) {
      var N = S.data, P = S.r, F = p + P;
      if (N) {
        if (N.index > d.index) {
          var B = g - N.x - N.vx, W = b - N.y - N.vy, V = B * B + W * W;
          V < F * F && (B === 0 && (B = Y(i), V += B * B), W === 0 && (W = Y(i), V += W * W), V = (F - (V = Math.sqrt(V))) / V * r, d.vx += (B *= V) * (F = (P *= P) / (v + P)), d.vy += (W *= V) * F, N.vx -= B * (F = 1 - F), N.vy -= W * F);
        }
        return;
      }
      return y > g + F || D < g - F || A > b + F || k < b - F;
    }
  }
  function l(o) {
    if (o.data) return o.r = n[o.data.index];
    for (var h = o.r = 0; h < 4; ++h)
      o[h] && o[h].r > o.r && (o.r = o[h].r);
  }
  function c() {
    if (t) {
      var o, h = t.length, w;
      for (n = new Array(h), o = 0; o < h; ++o) w = t[o], n[w.index] = +e(w, o, t);
    }
  }
  return a.initialize = function(o, h) {
    t = o, i = h, c();
  }, a.iterations = function(o) {
    return arguments.length ? (s = +o, a) : s;
  }, a.strength = function(o) {
    return arguments.length ? (r = +o, a) : r;
  }, a.radius = function(o) {
    return arguments.length ? (e = typeof o == "function" ? o : j(+o), c(), a) : e;
  }, a;
}
function cr(e) {
  return e.index;
}
function $e(e, t) {
  var n = e.get(t);
  if (!n) throw new Error("node not found: " + t);
  return n;
}
function hr(e) {
  var t = cr, n = w, i, r = j(30), s, a, l, c, o, h = 1;
  e == null && (e = []);
  function w(v) {
    return 1 / Math.min(l[v.source.index], l[v.target.index]);
  }
  function d(v) {
    for (var _ = 0, x = e.length; _ < h; ++_)
      for (var S = 0, y, A, D, k, N, P, F; S < x; ++S)
        y = e[S], A = y.source, D = y.target, k = D.x + D.vx - A.x - A.vx || Y(o), N = D.y + D.vy - A.y - A.vy || Y(o), P = Math.sqrt(k * k + N * N), P = (P - s[S]) / P * v * i[S], k *= P, N *= P, D.vx -= k * (F = c[S]), D.vy -= N * F, A.vx += k * (F = 1 - F), A.vy += N * F;
  }
  function g() {
    if (a) {
      var v, _ = a.length, x = e.length, S = new Map(a.map((A, D) => [t(A, D, a), A])), y;
      for (v = 0, l = new Array(_); v < x; ++v)
        y = e[v], y.index = v, typeof y.source != "object" && (y.source = $e(S, y.source)), typeof y.target != "object" && (y.target = $e(S, y.target)), l[y.source.index] = (l[y.source.index] || 0) + 1, l[y.target.index] = (l[y.target.index] || 0) + 1;
      for (v = 0, c = new Array(x); v < x; ++v)
        y = e[v], c[v] = l[y.source.index] / (l[y.source.index] + l[y.target.index]);
      i = new Array(x), b(), s = new Array(x), p();
    }
  }
  function b() {
    if (a)
      for (var v = 0, _ = e.length; v < _; ++v)
        i[v] = +n(e[v], v, e);
  }
  function p() {
    if (a)
      for (var v = 0, _ = e.length; v < _; ++v)
        s[v] = +r(e[v], v, e);
  }
  return d.initialize = function(v, _) {
    a = v, o = _, g();
  }, d.links = function(v) {
    return arguments.length ? (e = v, g(), d) : e;
  }, d.id = function(v) {
    return arguments.length ? (t = v, d) : t;
  }, d.iterations = function(v) {
    return arguments.length ? (h = +v, d) : h;
  }, d.strength = function(v) {
    return arguments.length ? (n = typeof v == "function" ? v : j(+v), b(), d) : n;
  }, d.distance = function(v) {
    return arguments.length ? (r = typeof v == "function" ? v : j(+v), p(), d) : r;
  }, d;
}
var fr = { value: () => {
} };
function _e() {
  for (var e = 0, t = arguments.length, n = {}, i; e < t; ++e) {
    if (!(i = arguments[e] + "") || i in n || /[\s.]/.test(i)) throw new Error("illegal type: " + i);
    n[i] = [];
  }
  return new Rt(n);
}
function Rt(e) {
  this._ = e;
}
function dr(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var i = "", r = n.indexOf(".");
    if (r >= 0 && (i = n.slice(r + 1), n = n.slice(0, r)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: i };
  });
}
Rt.prototype = _e.prototype = {
  constructor: Rt,
  on: function(e, t) {
    var n = this._, i = dr(e + "", n), r, s = -1, a = i.length;
    if (arguments.length < 2) {
      for (; ++s < a; ) if ((r = (e = i[s]).type) && (r = gr(n[r], e.name))) return r;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++s < a; )
      if (r = (e = i[s]).type) n[r] = qe(n[r], e.name, t);
      else if (t == null) for (r in n) n[r] = qe(n[r], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Rt(e);
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
function qe(e, t, n) {
  for (var i = 0, r = e.length; i < r; ++i)
    if (e[i].name === t) {
      e[i] = fr, e = e.slice(0, i).concat(e.slice(i + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var at = 0, yt = 0, pt = 0, sn = 1e3, jt, mt, Lt = 0, nt = 0, qt = 0, _t = typeof performance == "object" && performance.now ? performance : Date, an = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function ln() {
  return nt || (an(pr), nt = _t.now() + qt);
}
function pr() {
  nt = 0;
}
function de() {
  this._call = this._time = this._next = null;
}
de.prototype = un.prototype = {
  constructor: de,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? ln() : +n) + (t == null ? 0 : +t), !this._next && mt !== this && (mt ? mt._next = this : jt = this, mt = this), this._call = e, this._time = n, ge();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, ge());
  }
};
function un(e, t, n) {
  var i = new de();
  return i.restart(e, t, n), i;
}
function yr() {
  ln(), ++at;
  for (var e = jt, t; e; )
    (t = nt - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --at;
}
function He() {
  nt = (Lt = _t.now()) + qt, at = yt = 0;
  try {
    yr();
  } finally {
    at = 0, vr(), nt = 0;
  }
}
function mr() {
  var e = _t.now(), t = e - Lt;
  t > sn && (qt -= t, Lt = e);
}
function vr() {
  for (var e, t = jt, n, i = 1 / 0; t; )
    t._call ? (i > t._time && (i = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : jt = n);
  mt = e, ge(i);
}
function ge(e) {
  if (!at) {
    yt && (yt = clearTimeout(yt));
    var t = e - nt;
    t > 24 ? (e < 1 / 0 && (yt = setTimeout(He, e - _t.now() - qt)), pt && (pt = clearInterval(pt))) : (pt || (Lt = _t.now(), pt = setInterval(mr, sn)), at = 1, an(He));
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
var Tr = 10, Cr = Math.PI * (3 - Math.sqrt(5));
function Ar(e) {
  var t, n = 1, i = 1e-3, r = 1 - Math.pow(i, 1 / 300), s = 0, a = 0.6, l = /* @__PURE__ */ new Map(), c = un(w), o = _e("tick", "end"), h = xr();
  e == null && (e = []);
  function w() {
    d(), o.call("tick", t), n < i && (c.stop(), o.call("end", t));
  }
  function d(p) {
    var v, _ = e.length, x;
    p === void 0 && (p = 1);
    for (var S = 0; S < p; ++S)
      for (n += (s - n) * r, l.forEach(function(y) {
        y(n);
      }), v = 0; v < _; ++v)
        x = e[v], x.fx == null ? x.x += x.vx *= a : (x.x = x.fx, x.vx = 0), x.fy == null ? x.y += x.vy *= a : (x.y = x.fy, x.vy = 0);
    return t;
  }
  function g() {
    for (var p = 0, v = e.length, _; p < v; ++p) {
      if (_ = e[p], _.index = p, _.fx != null && (_.x = _.fx), _.fy != null && (_.y = _.fy), isNaN(_.x) || isNaN(_.y)) {
        var x = Tr * Math.sqrt(0.5 + p), S = p * Cr;
        _.x = x * Math.cos(S), _.y = x * Math.sin(S);
      }
      (isNaN(_.vx) || isNaN(_.vy)) && (_.vx = _.vy = 0);
    }
  }
  function b(p) {
    return p.initialize && p.initialize(e, h), p;
  }
  return g(), t = {
    tick: d,
    restart: function() {
      return c.restart(w), t;
    },
    stop: function() {
      return c.stop(), t;
    },
    nodes: function(p) {
      return arguments.length ? (e = p, g(), l.forEach(b), t) : e;
    },
    alpha: function(p) {
      return arguments.length ? (n = +p, t) : n;
    },
    alphaMin: function(p) {
      return arguments.length ? (i = +p, t) : i;
    },
    alphaDecay: function(p) {
      return arguments.length ? (r = +p, t) : +r;
    },
    alphaTarget: function(p) {
      return arguments.length ? (s = +p, t) : s;
    },
    velocityDecay: function(p) {
      return arguments.length ? (a = 1 - p, t) : 1 - a;
    },
    randomSource: function(p) {
      return arguments.length ? (h = p, l.forEach(b), t) : h;
    },
    force: function(p, v) {
      return arguments.length > 1 ? (v == null ? l.delete(p) : l.set(p, b(v)), t) : l.get(p);
    },
    find: function(p, v, _) {
      var x = 0, S = e.length, y, A, D, k, N;
      for (_ == null ? _ = 1 / 0 : _ *= _, x = 0; x < S; ++x)
        k = e[x], y = p - k.x, A = v - k.y, D = y * y + A * A, D < _ && (N = k, _ = D);
      return N;
    },
    on: function(p, v) {
      return arguments.length > 1 ? (o.on(p, v), t) : o.on(p);
    }
  };
}
function Dr() {
  var e, t, n, i, r = j(-30), s, a = 1, l = 1 / 0, c = 0.81;
  function o(g) {
    var b, p = e.length, v = me(e, br, Sr).visitAfter(w);
    for (i = g, b = 0; b < p; ++b) t = e[b], v.visit(d);
  }
  function h() {
    if (e) {
      var g, b = e.length, p;
      for (s = new Array(b), g = 0; g < b; ++g) p = e[g], s[p.index] = +r(p, g, e);
    }
  }
  function w(g) {
    var b = 0, p, v, _ = 0, x, S, y;
    if (g.length) {
      for (x = S = y = 0; y < 4; ++y)
        (p = g[y]) && (v = Math.abs(p.value)) && (b += p.value, _ += v, x += v * p.x, S += v * p.y);
      g.x = x / _, g.y = S / _;
    } else {
      p = g, p.x = p.data.x, p.y = p.data.y;
      do
        b += s[p.data.index];
      while (p = p.next);
    }
    g.value = b;
  }
  function d(g, b, p, v) {
    if (!g.value) return !0;
    var _ = g.x - t.x, x = g.y - t.y, S = v - b, y = _ * _ + x * x;
    if (S * S / c < y)
      return y < l && (_ === 0 && (_ = Y(n), y += _ * _), x === 0 && (x = Y(n), y += x * x), y < a && (y = Math.sqrt(a * y)), t.vx += _ * g.value * i / y, t.vy += x * g.value * i / y), !0;
    if (g.length || y >= l) return;
    (g.data !== t || g.next) && (_ === 0 && (_ = Y(n), y += _ * _), x === 0 && (x = Y(n), y += x * x), y < a && (y = Math.sqrt(a * y)));
    do
      g.data !== t && (S = s[g.data.index] * i / y, t.vx += _ * S, t.vy += x * S);
    while (g = g.next);
  }
  return o.initialize = function(g, b) {
    e = g, n = b, h();
  }, o.strength = function(g) {
    return arguments.length ? (r = typeof g == "function" ? g : j(+g), h(), o) : r;
  }, o.distanceMin = function(g) {
    return arguments.length ? (a = g * g, o) : Math.sqrt(a);
  }, o.distanceMax = function(g) {
    return arguments.length ? (l = g * g, o) : Math.sqrt(l);
  }, o.theta = function(g) {
    return arguments.length ? (c = g * g, o) : Math.sqrt(c);
  }, o;
}
function Ke(e, t, n) {
  var i, r = j(0.1), s, a;
  typeof e != "function" && (e = j(+e)), t == null && (t = 0), n == null && (n = 0);
  function l(o) {
    for (var h = 0, w = i.length; h < w; ++h) {
      var d = i[h], g = d.x - t || 1e-6, b = d.y - n || 1e-6, p = Math.sqrt(g * g + b * b), v = (a[h] - p) * s[h] * o / p;
      d.vx += g * v, d.vy += b * v;
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
    return arguments.length ? (r = typeof o == "function" ? o : j(+o), c(), l) : r;
  }, l.radius = function(o) {
    return arguments.length ? (e = typeof o == "function" ? o : j(+o), c(), l) : e;
  }, l.x = function(o) {
    return arguments.length ? (t = +o, l) : t;
  }, l.y = function(o) {
    return arguments.length ? (n = +o, l) : n;
  }, l;
}
function Ye(e) {
  var t = j(0.1), n, i, r;
  typeof e != "function" && (e = j(e == null ? 0 : +e));
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
    return arguments.length ? (t = typeof l == "function" ? l : j(+l), a(), s) : t;
  }, s.x = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : j(+l), a(), s) : e;
  }, s;
}
function Ze(e) {
  var t = j(0.1), n, i, r;
  typeof e != "function" && (e = j(e == null ? 0 : +e));
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
    return arguments.length ? (t = typeof l == "function" ? l : j(+l), a(), s) : t;
  }, s.y = function(l) {
    return arguments.length ? (e = typeof l == "function" ? l : j(+l), a(), s) : e;
  }, s;
}
function Mr(e = 0, t = 0, n = 1e-3) {
  let i = [], r;
  function s() {
    r = typeof n == "function" ? n : () => n;
  }
  function a(l) {
    for (let c = 0, o = i.length; c < o; ++c) {
      const h = i[c], w = r(h, c, i);
      h.vx && h.x && (h.vx -= (h.x - e) * w * l), h.vy && h.y && (h.vy -= (h.y - t) * w * l);
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
function Nr(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === pe && t.documentElement.namespaceURI === pe ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function kr(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function hn(e) {
  var t = cn(e);
  return (t.local ? kr : Nr)(t);
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
  return new q(i, this._parents);
}
function Er(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function Or() {
  return [];
}
function Rr(e) {
  return e == null ? Or : function() {
    return this.querySelectorAll(e);
  };
}
function zr(e) {
  return function() {
    return Er(e.apply(this, arguments));
  };
}
function Pr(e) {
  typeof e == "function" ? e = zr(e) : e = Rr(e);
  for (var t = this._groups, n = t.length, i = [], r = [], s = 0; s < n; ++s)
    for (var a = t[s], l = a.length, c, o = 0; o < l; ++o)
      (c = a[o]) && (i.push(e.call(c, c.__data__, o, a)), r.push(c));
  return new q(i, r);
}
function Br(e) {
  return function() {
    return this.matches(e);
  };
}
function dn(e) {
  return function(t) {
    return t.matches(e);
  };
}
var jr = Array.prototype.find;
function Lr(e) {
  return function() {
    return jr.call(this.children, e);
  };
}
function Gr() {
  return this.firstElementChild;
}
function Ur(e) {
  return this.select(e == null ? Gr : Lr(typeof e == "function" ? e : dn(e)));
}
var Vr = Array.prototype.filter;
function Wr() {
  return Array.from(this.children);
}
function $r(e) {
  return function() {
    return Vr.call(this.children, e);
  };
}
function qr(e) {
  return this.selectAll(e == null ? Wr : $r(typeof e == "function" ? e : dn(e)));
}
function Hr(e) {
  typeof e != "function" && (e = Br(e));
  for (var t = this._groups, n = t.length, i = new Array(n), r = 0; r < n; ++r)
    for (var s = t[r], a = s.length, l = i[r] = [], c, o = 0; o < a; ++o)
      (c = s[o]) && e.call(c, c.__data__, o, s) && l.push(c);
  return new q(i, this._parents);
}
function gn(e) {
  return new Array(e.length);
}
function Xr() {
  return new q(this._enter || this._groups.map(gn), this._parents);
}
function Gt(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
Gt.prototype = {
  constructor: Gt,
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
    (l = t[a]) ? (l.__data__ = s[a], i[a] = l) : n[a] = new Gt(e, s[a]);
  for (; a < c; ++a)
    (l = t[a]) && (r[a] = l);
}
function Zr(e, t, n, i, r, s, a) {
  var l, c, o = /* @__PURE__ */ new Map(), h = t.length, w = s.length, d = new Array(h), g;
  for (l = 0; l < h; ++l)
    (c = t[l]) && (d[l] = g = a.call(c, c.__data__, l, t) + "", o.has(g) ? r[l] = c : o.set(g, c));
  for (l = 0; l < w; ++l)
    g = a.call(e, s[l], l, s) + "", (c = o.get(g)) ? (i[l] = c, c.__data__ = s[l], o.delete(g)) : n[l] = new Gt(e, s[l]);
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
    var h = i[o], w = r[o], d = w.length, g = to(e.call(h, h && h.__data__, o, i)), b = g.length, p = l[o] = new Array(b), v = a[o] = new Array(b), _ = c[o] = new Array(d);
    n(h, w, p, v, _, g, t);
    for (var x = 0, S = 0, y, A; x < b; ++x)
      if (y = p[x]) {
        for (x >= S && (S = x + 1); !(A = v[S]) && ++S < b; ) ;
        y._next = A || null;
      }
  }
  return a = new q(a, i), a._enter = l, a._exit = c, a;
}
function to(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function eo() {
  return new q(this._exit || this._groups.map(gn), this._parents);
}
function no(e, t, n) {
  var i = this.enter(), r = this, s = this.exit();
  return typeof e == "function" ? (i = e(i), i && (i = i.selection())) : i = i.append(e + ""), t != null && (r = t(r), r && (r = r.selection())), n == null ? s.remove() : n(s), i && r ? i.merge(r).order() : r;
}
function io(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, i = t._groups, r = n.length, s = i.length, a = Math.min(r, s), l = new Array(r), c = 0; c < a; ++c)
    for (var o = n[c], h = i[c], w = o.length, d = l[c] = new Array(w), g, b = 0; b < w; ++b)
      (g = o[b] || h[b]) && (d[b] = g);
  for (; c < r; ++c)
    l[c] = n[c];
  return new q(l, this._parents);
}
function ro() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var i = e[t], r = i.length - 1, s = i[r], a; --r >= 0; )
      (a = i[r]) && (s && a.compareDocumentPosition(s) ^ 4 && s.parentNode.insertBefore(a, s), s = a);
  return this;
}
function oo(e) {
  e || (e = so);
  function t(w, d) {
    return w && d ? e(w.__data__, d.__data__) : !w - !d;
  }
  for (var n = this._groups, i = n.length, r = new Array(i), s = 0; s < i; ++s) {
    for (var a = n[s], l = a.length, c = r[s] = new Array(l), o, h = 0; h < l; ++h)
      (o = a[h]) && (c[h] = o);
    c.sort(t);
  }
  return new q(r, this._parents).order();
}
function so(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function ao() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function lo() {
  return Array.from(this);
}
function uo() {
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
  return arguments.length > 1 ? this.each((t == null ? xo : typeof t == "function" ? So : bo)(e, t, n ?? "")) : Co(this.node(), e);
}
function Co(e, t) {
  return e.style.getPropertyValue(t) || pn(e).getComputedStyle(e, null).getPropertyValue(t);
}
function Ao(e) {
  return function() {
    delete this[e];
  };
}
function Do(e, t) {
  return function() {
    this[e] = t;
  };
}
function Mo(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function No(e, t) {
  return arguments.length > 1 ? this.each((t == null ? Ao : typeof t == "function" ? Mo : Do)(e, t)) : this.node()[e];
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
function ko(e) {
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
  return this.each((typeof t == "function" ? Fo : t ? ko : Io)(n, t));
}
function Oo() {
  this.textContent = "";
}
function Ro(e) {
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
function Po(e) {
  return arguments.length ? this.each(e == null ? Oo : (typeof e == "function" ? zo : Ro)(e)) : this.node().textContent;
}
function Bo() {
  this.innerHTML = "";
}
function jo(e) {
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
function Go(e) {
  return arguments.length ? this.each(e == null ? Bo : (typeof e == "function" ? Lo : jo)(e)) : this.node().innerHTML;
}
function Uo() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function Vo() {
  return this.each(Uo);
}
function Wo() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function $o() {
  return this.each(Wo);
}
function qo(e) {
  var t = typeof e == "function" ? e : hn(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function Ho() {
  return null;
}
function Xo(e, t) {
  var n = typeof e == "function" ? e : hn(e), i = t == null ? Ho : typeof t == "function" ? t : fn(t);
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
function ls(e, t) {
  return this.each((typeof t == "function" ? as : ss)(e, t));
}
function* us() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var i = e[t], r = 0, s = i.length, a; r < s; ++r)
      (a = i[r]) && (yield a);
}
var cs = [null];
function q(e, t) {
  this._groups = e, this._parents = t;
}
function hs() {
  return this;
}
q.prototype = {
  constructor: q,
  select: Fr,
  selectAll: Pr,
  selectChild: Ur,
  selectChildren: qr,
  filter: Hr,
  data: Jr,
  enter: Xr,
  exit: eo,
  join: no,
  merge: io,
  selection: hs,
  order: ro,
  sort: oo,
  call: ao,
  nodes: lo,
  node: uo,
  size: co,
  empty: ho,
  each: fo,
  attr: wo,
  style: To,
  property: No,
  classed: Eo,
  text: Po,
  html: Go,
  raise: Vo,
  lower: $o,
  append: qo,
  insert: Xo,
  remove: Yo,
  clone: Jo,
  datum: ts,
  on: os,
  dispatch: ls,
  [Symbol.iterator]: us
};
function Ut(e) {
  return typeof e == "string" ? new q([[document.querySelector(e)]], [document.documentElement]) : new q([[e]], cs);
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
function ue(e) {
  e.stopImmediatePropagation();
}
function st(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function gs(e) {
  var t = e.document.documentElement, n = Ut(e).on("dragstart.drag", st, wt);
  "onselectstart" in t ? n.on("selectstart.drag", st, wt) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function ps(e, t) {
  var n = e.document.documentElement, i = Ut(e).on("dragstart.drag", null);
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
  var e = ys, t = ms, n = vs, i = _s, r = {}, s = _e("start", "drag", "end"), a = 0, l, c, o, h, w = 0;
  function d(y) {
    y.on("mousedown.drag", g).filter(i).on("touchstart.drag", v).on("touchmove.drag", _, ds).on("touchend.drag touchcancel.drag", x).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function g(y, A) {
    if (!(h || !e.call(this, y, A))) {
      var D = S(this, t.call(this, y, A), y, A, "mouse");
      D && (Ut(y.view).on("mousemove.drag", b, wt).on("mouseup.drag", p, wt), gs(y.view), ue(y), o = !1, l = y.clientX, c = y.clientY, D("start", y));
    }
  }
  function b(y) {
    if (st(y), !o) {
      var A = y.clientX - l, D = y.clientY - c;
      o = A * A + D * D > w;
    }
    r.mouse("drag", y);
  }
  function p(y) {
    Ut(y.view).on("mousemove.drag mouseup.drag", null), ps(y.view, o), st(y), r.mouse("end", y);
  }
  function v(y, A) {
    if (e.call(this, y, A)) {
      var D = y.changedTouches, k = t.call(this, y, A), N = D.length, P, F;
      for (P = 0; P < N; ++P)
        (F = S(this, k, y, A, D[P].identifier, D[P])) && (ue(y), F("start", y, D[P]));
    }
  }
  function _(y) {
    var A = y.changedTouches, D = A.length, k, N;
    for (k = 0; k < D; ++k)
      (N = r[A[k].identifier]) && (st(y), N("drag", y, A[k]));
  }
  function x(y) {
    var A = y.changedTouches, D = A.length, k, N;
    for (h && clearTimeout(h), h = setTimeout(function() {
      h = null;
    }, 500), k = 0; k < D; ++k)
      (N = r[A[k].identifier]) && (ue(y), N("end", y, A[k]));
  }
  function S(y, A, D, k, N, P) {
    var F = s.copy(), B = Je(P || D, A), W, V, it;
    if ((it = n.call(y, new ye("beforestart", {
      sourceEvent: D,
      target: d,
      identifier: N,
      active: a,
      x: B[0],
      y: B[1],
      dx: 0,
      dy: 0,
      dispatch: F
    }), k)) != null)
      return W = it.x - B[0] || 0, V = it.y - B[1] || 0, function Kt(lt, St, Yt) {
        var Tt = B, ut;
        switch (lt) {
          case "start":
            r[N] = Kt, ut = a++;
            break;
          case "end":
            delete r[N], --a;
          // falls through
          case "drag":
            B = Je(Yt || St, A), ut = a;
            break;
        }
        F.call(
          lt,
          y,
          new ye(lt, {
            sourceEvent: St,
            subject: it,
            target: d,
            identifier: N,
            active: ut,
            x: B[0] + W,
            y: B[1] + V,
            dx: B[0] - Tt[0],
            dy: B[1] - Tt[1],
            dispatch: F
          }),
          k
        );
      };
  }
  return d.filter = function(y) {
    return arguments.length ? (e = typeof y == "function" ? y : Et(!!y), d) : e;
  }, d.container = function(y) {
    return arguments.length ? (t = typeof y == "function" ? y : Et(y), d) : t;
  }, d.subject = function(y) {
    return arguments.length ? (n = typeof y == "function" ? y : Et(y), d) : n;
  }, d.touchable = function(y) {
    return arguments.length ? (i = typeof y == "function" ? y : Et(!!y), d) : i;
  }, d.on = function() {
    var y = s.on.apply(s, arguments);
    return y === s ? d : y;
  }, d.clickDistance = function(y) {
    return arguments.length ? (w = (y = +y) * y, d) : Math.sqrt(w);
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
  /** Structured-cloneable payload for the simulation worker (no live parent/children/_subgraph refs, unlike `clone()`). */
  toSimulationDTO() {
    return {
      id: this.id,
      data: this.data,
      style: this.style,
      weight: this.weight,
      _circleRadius: this._circleRadius,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      fx: this.fx,
      fy: this.fy
    };
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
class Ht {
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
    /**
     * True for the subclass of synthetic edges that stand in for a real edge whose
     * *both* endpoints are children of different clusters. Unlike the external→cluster
     * synthetic edges, these are resolved as a set (one per collapse state) by
     * {@link ClusterDrawer.resolveCrossClusterEdges} rather than the per-node toggle.
     */
    T(this, "isCrossCluster");
    /** The actual child node this synthetic edge points to (for expansion logic) */
    T(this, "syntheticTerminalNode");
    /** For a cross-cluster synthetic edge: the real child the `from` side stands in for. */
    T(this, "syntheticSourceNode");
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
    const n = this.style, i = t;
    this.style = {
      ...n,
      ...i,
      edge: { ...n.edge, ...i.edge },
      label: { ...n.label, ...i.label }
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
  /** Structured-cloneable payload for the simulation worker; endpoints reduced to ids, keeps `directed`. */
  toSimulationDTO() {
    return {
      id: this.id,
      from: { id: this.from.id },
      to: { id: this.to.id },
      data: this.data,
      style: this.style,
      directed: this.directed
    };
  }
  clone() {
    const t = { ...this.data }, n = { ...this.style }, i = new Ht(
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
const Tn = 'var ta=Object.defineProperty;var ea=(Q,K,st)=>K in Q?ta(Q,K,{enumerable:!0,configurable:!0,writable:!0,value:st}):Q[K]=st;var T=(Q,K,st)=>ea(Q,typeof K!="symbol"?K+"":K,st);(function(){"use strict";function Q(e){const t=+this._x.call(null,e),n=+this._y.call(null,e);return K(this.cover(t,n),t,n,e)}function K(e,t,n,i){if(isNaN(t)||isNaN(n))return e;var r,o=e._root,a={data:i},l=e._x0,c=e._y0,s=e._x1,h=e._y1,w,d,g,b,p,_,v,x;if(!o)return e._root=a,e;for(;o.length;)if((p=t>=(w=(l+s)/2))?l=w:s=w,(_=n>=(d=(c+h)/2))?c=d:h=d,r=o,!(o=o[v=_<<1|p]))return r[v]=a,e;if(g=+e._x.call(null,o.data),b=+e._y.call(null,o.data),t===g&&n===b)return a.next=o,r?r[v]=a:e._root=a,e;do r=r?r[v]=new Array(4):e._root=new Array(4),(p=t>=(w=(l+s)/2))?l=w:s=w,(_=n>=(d=(c+h)/2))?c=d:h=d;while((v=_<<1|p)===(x=(b>=d)<<1|g>=w));return r[x]=o,r[v]=a,e}function st(e){var t,n,i=e.length,r,o,a=new Array(i),l=new Array(i),c=1/0,s=1/0,h=-1/0,w=-1/0;for(n=0;n<i;++n)isNaN(r=+this._x.call(null,t=e[n]))||isNaN(o=+this._y.call(null,t))||(a[n]=r,l[n]=o,r<c&&(c=r),r>h&&(h=r),o<s&&(s=o),o>w&&(w=o));if(c>h||s>w)return this;for(this.cover(c,s).cover(h,w),n=0;n<i;++n)K(this,a[n],l[n],e[n]);return this}function Dn(e,t){if(isNaN(e=+e)||isNaN(t=+t))return this;var n=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(n))r=(n=Math.floor(e))+1,o=(i=Math.floor(t))+1;else{for(var a=r-n||1,l=this._root,c,s;n>e||e>=r||i>t||t>=o;)switch(s=(t<i)<<1|e<n,c=new Array(4),c[s]=l,l=c,a*=2,s){case 0:r=n+a,o=i+a;break;case 1:n=r-a,o=i+a;break;case 2:r=n+a,i=o-a;break;case 3:n=r-a,i=o-a;break}this._root&&this._root.length&&(this._root=l)}return this._x0=n,this._y0=i,this._x1=r,this._y1=o,this}function Nn(){var e=[];return this.visit(function(t){if(!t.length)do e.push(t.data);while(t=t.next)}),e}function Mn(e){return arguments.length?this.cover(+e[0][0],+e[0][1]).cover(+e[1][0],+e[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function G(e,t,n,i,r){this.node=e,this.x0=t,this.y0=n,this.x1=i,this.y1=r}function In(e,t,n){var i,r=this._x0,o=this._y0,a,l,c,s,h=this._x1,w=this._y1,d=[],g=this._root,b,p;for(g&&d.push(new G(g,r,o,h,w)),n==null?n=1/0:(r=e-n,o=t-n,h=e+n,w=t+n,n*=n);b=d.pop();)if(!(!(g=b.node)||(a=b.x0)>h||(l=b.y0)>w||(c=b.x1)<r||(s=b.y1)<o))if(g.length){var _=(a+c)/2,v=(l+s)/2;d.push(new G(g[3],_,v,c,s),new G(g[2],a,v,_,s),new G(g[1],_,l,c,v),new G(g[0],a,l,_,v)),(p=(t>=v)<<1|e>=_)&&(b=d[d.length-1],d[d.length-1]=d[d.length-1-p],d[d.length-1-p]=b)}else{var x=e-+this._x.call(null,g.data),S=t-+this._y.call(null,g.data),y=x*x+S*S;if(y<n){var A=Math.sqrt(n=y);r=e-A,o=t-A,h=e+A,w=t+A,i=g.data}}return i}function Fn(e){if(isNaN(h=+this._x.call(null,e))||isNaN(w=+this._y.call(null,e)))return this;var t,n=this._root,i,r,o,a=this._x0,l=this._y0,c=this._x1,s=this._y1,h,w,d,g,b,p,_,v;if(!n)return this;if(n.length)for(;;){if((b=h>=(d=(a+c)/2))?a=d:c=d,(p=w>=(g=(l+s)/2))?l=g:s=g,t=n,!(n=n[_=p<<1|b]))return this;if(!n.length)break;(t[_+1&3]||t[_+2&3]||t[_+3&3])&&(i=t,v=_)}for(;n.data!==e;)if(r=n,!(n=n.next))return this;return(o=n.next)&&delete n.next,r?(o?r.next=o:delete r.next,this):t?(o?t[_]=o:delete t[_],(n=t[0]||t[1]||t[2]||t[3])&&n===(t[3]||t[2]||t[1]||t[0])&&!n.length&&(i?i[v]=n:this._root=n),this):(this._root=o,this)}function kn(e){for(var t=0,n=e.length;t<n;++t)this.remove(e[t]);return this}function En(){return this._root}function On(){var e=0;return this.visit(function(t){if(!t.length)do++e;while(t=t.next)}),e}function Rn(e){var t=[],n,i=this._root,r,o,a,l,c;for(i&&t.push(new G(i,this._x0,this._y0,this._x1,this._y1));n=t.pop();)if(!e(i=n.node,o=n.x0,a=n.y0,l=n.x1,c=n.y1)&&i.length){var s=(o+l)/2,h=(a+c)/2;(r=i[3])&&t.push(new G(r,s,h,l,c)),(r=i[2])&&t.push(new G(r,o,h,s,c)),(r=i[1])&&t.push(new G(r,s,a,l,h)),(r=i[0])&&t.push(new G(r,o,a,s,h))}return this}function zn(e){var t=[],n=[],i;for(this._root&&t.push(new G(this._root,this._x0,this._y0,this._x1,this._y1));i=t.pop();){var r=i.node;if(r.length){var o,a=i.x0,l=i.y0,c=i.x1,s=i.y1,h=(a+c)/2,w=(l+s)/2;(o=r[0])&&t.push(new G(o,a,l,h,w)),(o=r[1])&&t.push(new G(o,h,l,c,w)),(o=r[2])&&t.push(new G(o,a,w,h,s)),(o=r[3])&&t.push(new G(o,h,w,c,s))}n.push(i)}for(;i=n.pop();)e(i.node,i.x0,i.y0,i.x1,i.y1);return this}function Pn(e){return e[0]}function Bn(e){return arguments.length?(this._x=e,this):this._x}function Ln(e){return e[1]}function jn(e){return arguments.length?(this._y=e,this):this._y}function Qt(e,t,n){var i=new Jt(t??Pn,n??Ln,NaN,NaN,NaN,NaN);return e==null?i:i.addAll(e)}function Jt(e,t,n,i,r,o){this._x=e,this._y=t,this._x0=n,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function Te(e){for(var t={data:e.data},n=t;e=e.next;)n=n.next={data:e.data};return t}var U=Qt.prototype=Jt.prototype;U.copy=function(){var e=new Jt(this._x,this._y,this._x0,this._y0,this._x1,this._y1),t=this._root,n,i;if(!t)return e;if(!t.length)return e._root=Te(t),e;for(n=[{source:t,target:e._root=new Array(4)}];t=n.pop();)for(var r=0;r<4;++r)(i=t.source[r])&&(i.length?n.push({source:i,target:t.target[r]=new Array(4)}):t.target[r]=Te(i));return e},U.add=Q,U.addAll=st,U.cover=Dn,U.data=Nn,U.extent=Mn,U.find=In,U.remove=Fn,U.removeAll=kn,U.root=En,U.size=On,U.visit=Rn,U.visitAfter=zn,U.x=Bn,U.y=jn;function L(e){return function(){return e}}function Y(e){return(e()-.5)*1e-6}function Gn(e){return e.x+e.vx}function Un(e){return e.y+e.vy}function Hn(e){var t,n,i,r=1,o=1;typeof e!="function"&&(e=L(e==null?1:+e));function a(){for(var s,h=t.length,w,d,g,b,p,_,v=0;v<o;++v)for(w=Qt(t,Gn,Un).visitAfter(l),s=0;s<h;++s)d=t[s],p=n[d.index],_=p*p,g=d.x+d.vx,b=d.y+d.vy,w.visit(x);function x(S,y,A,D,I){var M=S.data,P=S.r,k=p+P;if(M){if(M.index>d.index){var B=g-M.x-M.vx,W=b-M.y-M.vy,H=B*B+W*W;H<k*k&&(B===0&&(B=Y(i),H+=B*B),W===0&&(W=Y(i),H+=W*W),H=(k-(H=Math.sqrt(H)))/H*r,d.vx+=(B*=H)*(k=(P*=P)/(_+P)),d.vy+=(W*=H)*k,M.vx-=B*(k=1-k),M.vy-=W*k)}return}return y>g+k||D<g-k||A>b+k||I<b-k}}function l(s){if(s.data)return s.r=n[s.data.index];for(var h=s.r=0;h<4;++h)s[h]&&s[h].r>s.r&&(s.r=s[h].r)}function c(){if(t){var s,h=t.length,w;for(n=new Array(h),s=0;s<h;++s)w=t[s],n[w.index]=+e(w,s,t)}}return a.initialize=function(s,h){t=s,i=h,c()},a.iterations=function(s){return arguments.length?(o=+s,a):o},a.strength=function(s){return arguments.length?(r=+s,a):r},a.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),a):e},a}function Wn(e){return e.index}function Ce(e,t){var n=e.get(t);if(!n)throw new Error("node not found: "+t);return n}function Vn(e){var t=Wn,n=w,i,r=L(30),o,a,l,c,s,h=1;e==null&&(e=[]);function w(_){return 1/Math.min(l[_.source.index],l[_.target.index])}function d(_){for(var v=0,x=e.length;v<h;++v)for(var S=0,y,A,D,I,M,P,k;S<x;++S)y=e[S],A=y.source,D=y.target,I=D.x+D.vx-A.x-A.vx||Y(s),M=D.y+D.vy-A.y-A.vy||Y(s),P=Math.sqrt(I*I+M*M),P=(P-o[S])/P*_*i[S],I*=P,M*=P,D.vx-=I*(k=c[S]),D.vy-=M*k,A.vx+=I*(k=1-k),A.vy+=M*k}function g(){if(a){var _,v=a.length,x=e.length,S=new Map(a.map((A,D)=>[t(A,D,a),A])),y;for(_=0,l=new Array(v);_<x;++_)y=e[_],y.index=_,typeof y.source!="object"&&(y.source=Ce(S,y.source)),typeof y.target!="object"&&(y.target=Ce(S,y.target)),l[y.source.index]=(l[y.source.index]||0)+1,l[y.target.index]=(l[y.target.index]||0)+1;for(_=0,c=new Array(x);_<x;++_)y=e[_],c[_]=l[y.source.index]/(l[y.source.index]+l[y.target.index]);i=new Array(x),b(),o=new Array(x),p()}}function b(){if(a)for(var _=0,v=e.length;_<v;++_)i[_]=+n(e[_],_,e)}function p(){if(a)for(var _=0,v=e.length;_<v;++_)o[_]=+r(e[_],_,e)}return d.initialize=function(_,v){a=_,s=v,g()},d.links=function(_){return arguments.length?(e=_,g(),d):e},d.id=function(_){return arguments.length?(t=_,d):t},d.iterations=function(_){return arguments.length?(h=+_,d):h},d.strength=function(_){return arguments.length?(n=typeof _=="function"?_:L(+_),b(),d):n},d.distance=function(_){return arguments.length?(r=typeof _=="function"?_:L(+_),p(),d):r},d}var $n={value:()=>{}};function te(){for(var e=0,t=arguments.length,n={},i;e<t;++e){if(!(i=arguments[e]+"")||i in n||/[\\s.]/.test(i))throw new Error("illegal type: "+i);n[i]=[]}return new At(n)}function At(e){this._=e}function qn(e,t){return e.trim().split(/^|\\s+/).map(function(n){var i="",r=n.indexOf(".");if(r>=0&&(i=n.slice(r+1),n=n.slice(0,r)),n&&!t.hasOwnProperty(n))throw new Error("unknown type: "+n);return{type:n,name:i}})}At.prototype=te.prototype={constructor:At,on:function(e,t){var n=this._,i=qn(e+"",n),r,o=-1,a=i.length;if(arguments.length<2){for(;++o<a;)if((r=(e=i[o]).type)&&(r=Kn(n[r],e.name)))return r;return}if(t!=null&&typeof t!="function")throw new Error("invalid callback: "+t);for(;++o<a;)if(r=(e=i[o]).type)n[r]=Ae(n[r],e.name,t);else if(t==null)for(r in n)n[r]=Ae(n[r],e.name,null);return this},copy:function(){var e={},t=this._;for(var n in t)e[n]=t[n].slice();return new At(e)},call:function(e,t){if((r=arguments.length-2)>0)for(var n=new Array(r),i=0,r,o;i<r;++i)n[i]=arguments[i+2];if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(o=this._[e],i=0,r=o.length;i<r;++i)o[i].value.apply(t,n)},apply:function(e,t,n){if(!this._.hasOwnProperty(e))throw new Error("unknown type: "+e);for(var i=this._[e],r=0,o=i.length;r<o;++r)i[r].value.apply(t,n)}};function Kn(e,t){for(var n=0,i=e.length,r;n<i;++n)if((r=e[n]).name===t)return r.value}function Ae(e,t,n){for(var i=0,r=e.length;i<r;++i)if(e[i].name===t){e[i]=$n,e=e.slice(0,i).concat(e.slice(i+1));break}return n!=null&&e.push({name:t,value:n}),e}var ot=0,ht=0,ft=0,De=1e3,Dt,dt,Nt=0,J=0,Mt=0,gt=typeof performance=="object"&&performance.now?performance:Date,Ne=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(e){setTimeout(e,17)};function Me(){return J||(Ne(Xn),J=gt.now()+Mt)}function Xn(){J=0}function ee(){this._call=this._time=this._next=null}ee.prototype=Ie.prototype={constructor:ee,restart:function(e,t,n){if(typeof e!="function")throw new TypeError("callback is not a function");n=(n==null?Me():+n)+(t==null?0:+t),!this._next&&dt!==this&&(dt?dt._next=this:Dt=this,dt=this),this._call=e,this._time=n,ne()},stop:function(){this._call&&(this._call=null,this._time=1/0,ne())}};function Ie(e,t,n){var i=new ee;return i.restart(e,t,n),i}function Yn(){Me(),++ot;for(var e=Dt,t;e;)(t=J-e._time)>=0&&e._call.call(void 0,t),e=e._next;--ot}function Fe(){J=(Nt=gt.now())+Mt,ot=ht=0;try{Yn()}finally{ot=0,Qn(),J=0}}function Zn(){var e=gt.now(),t=e-Nt;t>De&&(Mt-=t,Nt=e)}function Qn(){for(var e,t=Dt,n,i=1/0;t;)t._call?(i>t._time&&(i=t._time),e=t,t=t._next):(n=t._next,t._next=null,t=e?e._next=n:Dt=n);dt=e,ne(i)}function ne(e){if(!ot){ht&&(ht=clearTimeout(ht));var t=e-J;t>24?(e<1/0&&(ht=setTimeout(Fe,e-gt.now()-Mt)),ft&&(ft=clearInterval(ft))):(ft||(Nt=gt.now(),ft=setInterval(Zn,De)),ot=1,Ne(Fe))}}const Jn=1664525,ti=1013904223,ke=4294967296;function ei(){let e=1;return()=>(e=(Jn*e+ti)%ke)/ke}function ni(e){return e.x}function ii(e){return e.y}var ri=10,si=Math.PI*(3-Math.sqrt(5));function oi(e){var t,n=1,i=.001,r=1-Math.pow(i,1/300),o=0,a=.6,l=new Map,c=Ie(w),s=te("tick","end"),h=ei();e==null&&(e=[]);function w(){d(),s.call("tick",t),n<i&&(c.stop(),s.call("end",t))}function d(p){var _,v=e.length,x;p===void 0&&(p=1);for(var S=0;S<p;++S)for(n+=(o-n)*r,l.forEach(function(y){y(n)}),_=0;_<v;++_)x=e[_],x.fx==null?x.x+=x.vx*=a:(x.x=x.fx,x.vx=0),x.fy==null?x.y+=x.vy*=a:(x.y=x.fy,x.vy=0);return t}function g(){for(var p=0,_=e.length,v;p<_;++p){if(v=e[p],v.index=p,v.fx!=null&&(v.x=v.fx),v.fy!=null&&(v.y=v.fy),isNaN(v.x)||isNaN(v.y)){var x=ri*Math.sqrt(.5+p),S=p*si;v.x=x*Math.cos(S),v.y=x*Math.sin(S)}(isNaN(v.vx)||isNaN(v.vy))&&(v.vx=v.vy=0)}}function b(p){return p.initialize&&p.initialize(e,h),p}return g(),t={tick:d,restart:function(){return c.restart(w),t},stop:function(){return c.stop(),t},nodes:function(p){return arguments.length?(e=p,g(),l.forEach(b),t):e},alpha:function(p){return arguments.length?(n=+p,t):n},alphaMin:function(p){return arguments.length?(i=+p,t):i},alphaDecay:function(p){return arguments.length?(r=+p,t):+r},alphaTarget:function(p){return arguments.length?(o=+p,t):o},velocityDecay:function(p){return arguments.length?(a=1-p,t):1-a},randomSource:function(p){return arguments.length?(h=p,l.forEach(b),t):h},force:function(p,_){return arguments.length>1?(_==null?l.delete(p):l.set(p,b(_)),t):l.get(p)},find:function(p,_,v){var x=0,S=e.length,y,A,D,I,M;for(v==null?v=1/0:v*=v,x=0;x<S;++x)I=e[x],y=p-I.x,A=_-I.y,D=y*y+A*A,D<v&&(M=I,v=D);return M},on:function(p,_){return arguments.length>1?(s.on(p,_),t):s.on(p)}}}function ai(){var e,t,n,i,r=L(-30),o,a=1,l=1/0,c=.81;function s(g){var b,p=e.length,_=Qt(e,ni,ii).visitAfter(w);for(i=g,b=0;b<p;++b)t=e[b],_.visit(d)}function h(){if(e){var g,b=e.length,p;for(o=new Array(b),g=0;g<b;++g)p=e[g],o[p.index]=+r(p,g,e)}}function w(g){var b=0,p,_,v=0,x,S,y;if(g.length){for(x=S=y=0;y<4;++y)(p=g[y])&&(_=Math.abs(p.value))&&(b+=p.value,v+=_,x+=_*p.x,S+=_*p.y);g.x=x/v,g.y=S/v}else{p=g,p.x=p.data.x,p.y=p.data.y;do b+=o[p.data.index];while(p=p.next)}g.value=b}function d(g,b,p,_){if(!g.value)return!0;var v=g.x-t.x,x=g.y-t.y,S=_-b,y=v*v+x*x;if(S*S/c<y)return y<l&&(v===0&&(v=Y(n),y+=v*v),x===0&&(x=Y(n),y+=x*x),y<a&&(y=Math.sqrt(a*y)),t.vx+=v*g.value*i/y,t.vy+=x*g.value*i/y),!0;if(g.length||y>=l)return;(g.data!==t||g.next)&&(v===0&&(v=Y(n),y+=v*v),x===0&&(x=Y(n),y+=x*x),y<a&&(y=Math.sqrt(a*y)));do g.data!==t&&(S=o[g.data.index]*i/y,t.vx+=v*S,t.vy+=x*S);while(g=g.next)}return s.initialize=function(g,b){e=g,n=b,h()},s.strength=function(g){return arguments.length?(r=typeof g=="function"?g:L(+g),h(),s):r},s.distanceMin=function(g){return arguments.length?(a=g*g,s):Math.sqrt(a)},s.distanceMax=function(g){return arguments.length?(l=g*g,s):Math.sqrt(l)},s.theta=function(g){return arguments.length?(c=g*g,s):Math.sqrt(c)},s}function Ee(e,t,n){var i,r=L(.1),o,a;typeof e!="function"&&(e=L(+e)),t==null&&(t=0),n==null&&(n=0);function l(s){for(var h=0,w=i.length;h<w;++h){var d=i[h],g=d.x-t||1e-6,b=d.y-n||1e-6,p=Math.sqrt(g*g+b*b),_=(a[h]-p)*o[h]*s/p;d.vx+=g*_,d.vy+=b*_}}function c(){if(i){var s,h=i.length;for(o=new Array(h),a=new Array(h),s=0;s<h;++s)a[s]=+e(i[s],s,i),o[s]=isNaN(a[s])?0:+r(i[s],s,i)}}return l.initialize=function(s){i=s,c()},l.strength=function(s){return arguments.length?(r=typeof s=="function"?s:L(+s),c(),l):r},l.radius=function(s){return arguments.length?(e=typeof s=="function"?s:L(+s),c(),l):e},l.x=function(s){return arguments.length?(t=+s,l):t},l.y=function(s){return arguments.length?(n=+s,l):n},l}function Oe(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(l){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vx+=(r[c]-h.x)*i[c]*l}function a(){if(n){var l,c=n.length;for(i=new Array(c),r=new Array(c),l=0;l<c;++l)i[l]=isNaN(r[l]=+e(n[l],l,n))?0:+t(n[l],l,n)}}return o.initialize=function(l){n=l,a()},o.strength=function(l){return arguments.length?(t=typeof l=="function"?l:L(+l),a(),o):t},o.x=function(l){return arguments.length?(e=typeof l=="function"?l:L(+l),a(),o):e},o}function Re(e){var t=L(.1),n,i,r;typeof e!="function"&&(e=L(e==null?0:+e));function o(l){for(var c=0,s=n.length,h;c<s;++c)h=n[c],h.vy+=(r[c]-h.y)*i[c]*l}function a(){if(n){var l,c=n.length;for(i=new Array(c),r=new Array(c),l=0;l<c;++l)i[l]=isNaN(r[l]=+e(n[l],l,n))?0:+t(n[l],l,n)}}return o.initialize=function(l){n=l,a()},o.strength=function(l){return arguments.length?(t=typeof l=="function"?l:L(+l),a(),o):t},o.y=function(l){return arguments.length?(e=typeof l=="function"?l:L(+l),a(),o):e},o}function li(e=0,t=0,n=.001){let i=[],r;function o(){r=typeof n=="function"?n:()=>n}function a(l){for(let c=0,s=i.length;c<s;++c){const h=i[c],w=r(h,c,i);h.vx&&h.x&&(h.vx-=(h.x-e)*w*l),h.vy&&h.y&&(h.vy-=(h.y-t)*w*l)}}return a.initialize=l=>{i=l,o()},a.x=function(l){return arguments.length?(e=l,a):e},a.y=function(l){return arguments.length?(t=l,a):t},a.strength=function(l){return arguments.length?(n=l,o(),a):n},a}var ie="http://www.w3.org/1999/xhtml",ze={svg:"http://www.w3.org/2000/svg",xhtml:ie,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Pe(e){var t=e+="",n=t.indexOf(":");return n>=0&&(t=e.slice(0,n))!=="xmlns"&&(e=e.slice(n+1)),ze.hasOwnProperty(t)?{space:ze[t],local:e}:e}function ui(e){return function(){var t=this.ownerDocument,n=this.namespaceURI;return n===ie&&t.documentElement.namespaceURI===ie?t.createElement(e):t.createElementNS(n,e)}}function ci(e){return function(){return this.ownerDocument.createElementNS(e.space,e.local)}}function Be(e){var t=Pe(e);return(t.local?ci:ui)(t)}function hi(){}function Le(e){return e==null?hi:function(){return this.querySelector(e)}}function fi(e){typeof e!="function"&&(e=Le(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,l=i[r]=new Array(a),c,s,h=0;h<a;++h)(c=o[h])&&(s=e.call(c,c.__data__,h,o))&&("__data__"in c&&(s.__data__=c.__data__),l[h]=s);return new $(i,this._parents)}function di(e){return e==null?[]:Array.isArray(e)?e:Array.from(e)}function gi(){return[]}function pi(e){return e==null?gi:function(){return this.querySelectorAll(e)}}function yi(e){return function(){return di(e.apply(this,arguments))}}function mi(e){typeof e=="function"?e=yi(e):e=pi(e);for(var t=this._groups,n=t.length,i=[],r=[],o=0;o<n;++o)for(var a=t[o],l=a.length,c,s=0;s<l;++s)(c=a[s])&&(i.push(e.call(c,c.__data__,s,a)),r.push(c));return new $(i,r)}function _i(e){return function(){return this.matches(e)}}function je(e){return function(t){return t.matches(e)}}var vi=Array.prototype.find;function wi(e){return function(){return vi.call(this.children,e)}}function xi(){return this.firstElementChild}function bi(e){return this.select(e==null?xi:wi(typeof e=="function"?e:je(e)))}var Si=Array.prototype.filter;function Ti(){return Array.from(this.children)}function Ci(e){return function(){return Si.call(this.children,e)}}function Ai(e){return this.selectAll(e==null?Ti:Ci(typeof e=="function"?e:je(e)))}function Di(e){typeof e!="function"&&(e=_i(e));for(var t=this._groups,n=t.length,i=new Array(n),r=0;r<n;++r)for(var o=t[r],a=o.length,l=i[r]=[],c,s=0;s<a;++s)(c=o[s])&&e.call(c,c.__data__,s,o)&&l.push(c);return new $(i,this._parents)}function Ge(e){return new Array(e.length)}function Ni(){return new $(this._enter||this._groups.map(Ge),this._parents)}function It(e,t){this.ownerDocument=e.ownerDocument,this.namespaceURI=e.namespaceURI,this._next=null,this._parent=e,this.__data__=t}It.prototype={constructor:It,appendChild:function(e){return this._parent.insertBefore(e,this._next)},insertBefore:function(e,t){return this._parent.insertBefore(e,t)},querySelector:function(e){return this._parent.querySelector(e)},querySelectorAll:function(e){return this._parent.querySelectorAll(e)}};function Mi(e){return function(){return e}}function Ii(e,t,n,i,r,o){for(var a=0,l,c=t.length,s=o.length;a<s;++a)(l=t[a])?(l.__data__=o[a],i[a]=l):n[a]=new It(e,o[a]);for(;a<c;++a)(l=t[a])&&(r[a]=l)}function Fi(e,t,n,i,r,o,a){var l,c,s=new Map,h=t.length,w=o.length,d=new Array(h),g;for(l=0;l<h;++l)(c=t[l])&&(d[l]=g=a.call(c,c.__data__,l,t)+"",s.has(g)?r[l]=c:s.set(g,c));for(l=0;l<w;++l)g=a.call(e,o[l],l,o)+"",(c=s.get(g))?(i[l]=c,c.__data__=o[l],s.delete(g)):n[l]=new It(e,o[l]);for(l=0;l<h;++l)(c=t[l])&&s.get(d[l])===c&&(r[l]=c)}function ki(e){return e.__data__}function Ei(e,t){if(!arguments.length)return Array.from(this,ki);var n=t?Fi:Ii,i=this._parents,r=this._groups;typeof e!="function"&&(e=Mi(e));for(var o=r.length,a=new Array(o),l=new Array(o),c=new Array(o),s=0;s<o;++s){var h=i[s],w=r[s],d=w.length,g=Oi(e.call(h,h&&h.__data__,s,i)),b=g.length,p=l[s]=new Array(b),_=a[s]=new Array(b),v=c[s]=new Array(d);n(h,w,p,_,v,g,t);for(var x=0,S=0,y,A;x<b;++x)if(y=p[x]){for(x>=S&&(S=x+1);!(A=_[S])&&++S<b;);y._next=A||null}}return a=new $(a,i),a._enter=l,a._exit=c,a}function Oi(e){return typeof e=="object"&&"length"in e?e:Array.from(e)}function Ri(){return new $(this._exit||this._groups.map(Ge),this._parents)}function zi(e,t,n){var i=this.enter(),r=this,o=this.exit();return typeof e=="function"?(i=e(i),i&&(i=i.selection())):i=i.append(e+""),t!=null&&(r=t(r),r&&(r=r.selection())),n==null?o.remove():n(o),i&&r?i.merge(r).order():r}function Pi(e){for(var t=e.selection?e.selection():e,n=this._groups,i=t._groups,r=n.length,o=i.length,a=Math.min(r,o),l=new Array(r),c=0;c<a;++c)for(var s=n[c],h=i[c],w=s.length,d=l[c]=new Array(w),g,b=0;b<w;++b)(g=s[b]||h[b])&&(d[b]=g);for(;c<r;++c)l[c]=n[c];return new $(l,this._parents)}function Bi(){for(var e=this._groups,t=-1,n=e.length;++t<n;)for(var i=e[t],r=i.length-1,o=i[r],a;--r>=0;)(a=i[r])&&(o&&a.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(a,o),o=a);return this}function Li(e){e||(e=ji);function t(w,d){return w&&d?e(w.__data__,d.__data__):!w-!d}for(var n=this._groups,i=n.length,r=new Array(i),o=0;o<i;++o){for(var a=n[o],l=a.length,c=r[o]=new Array(l),s,h=0;h<l;++h)(s=a[h])&&(c[h]=s);c.sort(t)}return new $(r,this._parents).order()}function ji(e,t){return e<t?-1:e>t?1:e>=t?0:NaN}function Gi(){var e=arguments[0];return arguments[0]=this,e.apply(null,arguments),this}function Ui(){return Array.from(this)}function Hi(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length;r<o;++r){var a=i[r];if(a)return a}return null}function Wi(){let e=0;for(const t of this)++e;return e}function Vi(){return!this.node()}function $i(e){for(var t=this._groups,n=0,i=t.length;n<i;++n)for(var r=t[n],o=0,a=r.length,l;o<a;++o)(l=r[o])&&e.call(l,l.__data__,o,r);return this}function qi(e){return function(){this.removeAttribute(e)}}function Ki(e){return function(){this.removeAttributeNS(e.space,e.local)}}function Xi(e,t){return function(){this.setAttribute(e,t)}}function Yi(e,t){return function(){this.setAttributeNS(e.space,e.local,t)}}function Zi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttribute(e):this.setAttribute(e,n)}}function Qi(e,t){return function(){var n=t.apply(this,arguments);n==null?this.removeAttributeNS(e.space,e.local):this.setAttributeNS(e.space,e.local,n)}}function Ji(e,t){var n=Pe(e);if(arguments.length<2){var i=this.node();return n.local?i.getAttributeNS(n.space,n.local):i.getAttribute(n)}return this.each((t==null?n.local?Ki:qi:typeof t=="function"?n.local?Qi:Zi:n.local?Yi:Xi)(n,t))}function Ue(e){return e.ownerDocument&&e.ownerDocument.defaultView||e.document&&e||e.defaultView}function tr(e){return function(){this.style.removeProperty(e)}}function er(e,t,n){return function(){this.style.setProperty(e,t,n)}}function nr(e,t,n){return function(){var i=t.apply(this,arguments);i==null?this.style.removeProperty(e):this.style.setProperty(e,i,n)}}function ir(e,t,n){return arguments.length>1?this.each((t==null?tr:typeof t=="function"?nr:er)(e,t,n??"")):rr(this.node(),e)}function rr(e,t){return e.style.getPropertyValue(t)||Ue(e).getComputedStyle(e,null).getPropertyValue(t)}function sr(e){return function(){delete this[e]}}function or(e,t){return function(){this[e]=t}}function ar(e,t){return function(){var n=t.apply(this,arguments);n==null?delete this[e]:this[e]=n}}function lr(e,t){return arguments.length>1?this.each((t==null?sr:typeof t=="function"?ar:or)(e,t)):this.node()[e]}function He(e){return e.trim().split(/^|\\s+/)}function re(e){return e.classList||new We(e)}function We(e){this._node=e,this._names=He(e.getAttribute("class")||"")}We.prototype={add:function(e){var t=this._names.indexOf(e);t<0&&(this._names.push(e),this._node.setAttribute("class",this._names.join(" ")))},remove:function(e){var t=this._names.indexOf(e);t>=0&&(this._names.splice(t,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(e){return this._names.indexOf(e)>=0}};function Ve(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.add(t[i])}function $e(e,t){for(var n=re(e),i=-1,r=t.length;++i<r;)n.remove(t[i])}function ur(e){return function(){Ve(this,e)}}function cr(e){return function(){$e(this,e)}}function hr(e,t){return function(){(t.apply(this,arguments)?Ve:$e)(this,e)}}function fr(e,t){var n=He(e+"");if(arguments.length<2){for(var i=re(this.node()),r=-1,o=n.length;++r<o;)if(!i.contains(n[r]))return!1;return!0}return this.each((typeof t=="function"?hr:t?ur:cr)(n,t))}function dr(){this.textContent=""}function gr(e){return function(){this.textContent=e}}function pr(e){return function(){var t=e.apply(this,arguments);this.textContent=t??""}}function yr(e){return arguments.length?this.each(e==null?dr:(typeof e=="function"?pr:gr)(e)):this.node().textContent}function mr(){this.innerHTML=""}function _r(e){return function(){this.innerHTML=e}}function vr(e){return function(){var t=e.apply(this,arguments);this.innerHTML=t??""}}function wr(e){return arguments.length?this.each(e==null?mr:(typeof e=="function"?vr:_r)(e)):this.node().innerHTML}function xr(){this.nextSibling&&this.parentNode.appendChild(this)}function br(){return this.each(xr)}function Sr(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function Tr(){return this.each(Sr)}function Cr(e){var t=typeof e=="function"?e:Be(e);return this.select(function(){return this.appendChild(t.apply(this,arguments))})}function Ar(){return null}function Dr(e,t){var n=typeof e=="function"?e:Be(e),i=t==null?Ar:typeof t=="function"?t:Le(t);return this.select(function(){return this.insertBefore(n.apply(this,arguments),i.apply(this,arguments)||null)})}function Nr(){var e=this.parentNode;e&&e.removeChild(this)}function Mr(){return this.each(Nr)}function Ir(){var e=this.cloneNode(!1),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function Fr(){var e=this.cloneNode(!0),t=this.parentNode;return t?t.insertBefore(e,this.nextSibling):e}function kr(e){return this.select(e?Fr:Ir)}function Er(e){return arguments.length?this.property("__data__",e):this.node().__data__}function Or(e){return function(t){e.call(this,t,this.__data__)}}function Rr(e){return e.trim().split(/^|\\s+/).map(function(t){var n="",i=t.indexOf(".");return i>=0&&(n=t.slice(i+1),t=t.slice(0,i)),{type:t,name:n}})}function zr(e){return function(){var t=this.__on;if(t){for(var n=0,i=-1,r=t.length,o;n<r;++n)o=t[n],(!e.type||o.type===e.type)&&o.name===e.name?this.removeEventListener(o.type,o.listener,o.options):t[++i]=o;++i?t.length=i:delete this.__on}}}function Pr(e,t,n){return function(){var i=this.__on,r,o=Or(t);if(i){for(var a=0,l=i.length;a<l;++a)if((r=i[a]).type===e.type&&r.name===e.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=n),r.value=t;return}}this.addEventListener(e.type,o,n),r={type:e.type,name:e.name,value:t,listener:o,options:n},i?i.push(r):this.__on=[r]}}function Br(e,t,n){var i=Rr(e+""),r,o=i.length,a;if(arguments.length<2){var l=this.node().__on;if(l){for(var c=0,s=l.length,h;c<s;++c)for(r=0,h=l[c];r<o;++r)if((a=i[r]).type===h.type&&a.name===h.name)return h.value}return}for(l=t?Pr:zr,r=0;r<o;++r)this.each(l(i[r],t,n));return this}function qe(e,t,n){var i=Ue(e),r=i.CustomEvent;typeof r=="function"?r=new r(t,n):(r=i.document.createEvent("Event"),n?(r.initEvent(t,n.bubbles,n.cancelable),r.detail=n.detail):r.initEvent(t,!1,!1)),e.dispatchEvent(r)}function Lr(e,t){return function(){return qe(this,e,t)}}function jr(e,t){return function(){return qe(this,e,t.apply(this,arguments))}}function Gr(e,t){return this.each((typeof t=="function"?jr:Lr)(e,t))}function*Ur(){for(var e=this._groups,t=0,n=e.length;t<n;++t)for(var i=e[t],r=0,o=i.length,a;r<o;++r)(a=i[r])&&(yield a)}var Hr=[null];function $(e,t){this._groups=e,this._parents=t}function Wr(){return this}$.prototype={constructor:$,select:fi,selectAll:mi,selectChild:bi,selectChildren:Ai,filter:Di,data:Ei,enter:Ni,exit:Ri,join:zi,merge:Pi,selection:Wr,order:Bi,sort:Li,call:Gi,nodes:Ui,node:Hi,size:Wi,empty:Vi,each:$i,attr:Ji,style:ir,property:lr,classed:fr,text:yr,html:wr,raise:br,lower:Tr,append:Cr,insert:Dr,remove:Mr,clone:kr,datum:Er,on:Br,dispatch:Gr,[Symbol.iterator]:Ur};function Ft(e){return typeof e=="string"?new $([[document.querySelector(e)]],[document.documentElement]):new $([[e]],Hr)}function Vr(e){let t;for(;t=e.sourceEvent;)e=t;return e}function Ke(e,t){if(e=Vr(e),t===void 0&&(t=e.currentTarget),t){var n=t.ownerSVGElement||t;if(n.createSVGPoint){var i=n.createSVGPoint();return i.x=e.clientX,i.y=e.clientY,i=i.matrixTransform(t.getScreenCTM().inverse()),[i.x,i.y]}if(t.getBoundingClientRect){var r=t.getBoundingClientRect();return[e.clientX-r.left-t.clientLeft,e.clientY-r.top-t.clientTop]}}return[e.pageX,e.pageY]}const $r={passive:!1},pt={capture:!0,passive:!1};function se(e){e.stopImmediatePropagation()}function at(e){e.preventDefault(),e.stopImmediatePropagation()}function qr(e){var t=e.document.documentElement,n=Ft(e).on("dragstart.drag",at,pt);"onselectstart"in t?n.on("selectstart.drag",at,pt):(t.__noselect=t.style.MozUserSelect,t.style.MozUserSelect="none")}function Kr(e,t){var n=e.document.documentElement,i=Ft(e).on("dragstart.drag",null);t&&(i.on("click.drag",at,pt),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in n?i.on("selectstart.drag",null):(n.style.MozUserSelect=n.__noselect,delete n.__noselect)}var kt=e=>()=>e;function oe(e,{sourceEvent:t,subject:n,target:i,identifier:r,active:o,x:a,y:l,dx:c,dy:s,dispatch:h}){Object.defineProperties(this,{type:{value:e,enumerable:!0,configurable:!0},sourceEvent:{value:t,enumerable:!0,configurable:!0},subject:{value:n,enumerable:!0,configurable:!0},target:{value:i,enumerable:!0,configurable:!0},identifier:{value:r,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:l,enumerable:!0,configurable:!0},dx:{value:c,enumerable:!0,configurable:!0},dy:{value:s,enumerable:!0,configurable:!0},_:{value:h}})}oe.prototype.on=function(){var e=this._.on.apply(this._,arguments);return e===this._?this:e};function Xr(e){return!e.ctrlKey&&!e.button}function Yr(){return this.parentNode}function Zr(e,t){return t??{x:e.x,y:e.y}}function Qr(){return navigator.maxTouchPoints||"ontouchstart"in this}function Jr(){var e=Xr,t=Yr,n=Zr,i=Qr,r={},o=te("start","drag","end"),a=0,l,c,s,h,w=0;function d(y){y.on("mousedown.drag",g).filter(i).on("touchstart.drag",_).on("touchmove.drag",v,$r).on("touchend.drag touchcancel.drag",x).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function g(y,A){if(!(h||!e.call(this,y,A))){var D=S(this,t.call(this,y,A),y,A,"mouse");D&&(Ft(y.view).on("mousemove.drag",b,pt).on("mouseup.drag",p,pt),qr(y.view),se(y),s=!1,l=y.clientX,c=y.clientY,D("start",y))}}function b(y){if(at(y),!s){var A=y.clientX-l,D=y.clientY-c;s=A*A+D*D>w}r.mouse("drag",y)}function p(y){Ft(y.view).on("mousemove.drag mouseup.drag",null),Kr(y.view,s),at(y),r.mouse("end",y)}function _(y,A){if(e.call(this,y,A)){var D=y.changedTouches,I=t.call(this,y,A),M=D.length,P,k;for(P=0;P<M;++P)(k=S(this,I,y,A,D[P].identifier,D[P]))&&(se(y),k("start",y,D[P]))}}function v(y){var A=y.changedTouches,D=A.length,I,M;for(I=0;I<D;++I)(M=r[A[I].identifier])&&(at(y),M("drag",y,A[I]))}function x(y){var A=y.changedTouches,D=A.length,I,M;for(h&&clearTimeout(h),h=setTimeout(function(){h=null},500),I=0;I<D;++I)(M=r[A[I].identifier])&&(se(y),M("end",y,A[I]))}function S(y,A,D,I,M,P){var k=o.copy(),B=Ke(P||D,A),W,H,lt;if((lt=n.call(y,new oe("beforestart",{sourceEvent:D,target:d,identifier:M,active:a,x:B[0],y:B[1],dx:0,dy:0,dispatch:k}),I))!=null)return W=lt.x-B[0]||0,H=lt.y-B[1]||0,function ce(vt,Ut,he){var Ht=B,wt;switch(vt){case"start":r[M]=ce,wt=a++;break;case"end":delete r[M],--a;case"drag":B=Ke(he||Ut,A),wt=a;break}k.call(vt,y,new oe(vt,{sourceEvent:Ut,subject:lt,target:d,identifier:M,active:wt,x:B[0]+W,y:B[1]+H,dx:B[0]-Ht[0],dy:B[1]-Ht[1],dispatch:k}),I)}}return d.filter=function(y){return arguments.length?(e=typeof y=="function"?y:kt(!!y),d):e},d.container=function(y){return arguments.length?(t=typeof y=="function"?y:kt(y),d):t},d.subject=function(y){return arguments.length?(n=typeof y=="function"?y:kt(y),d):n},d.touchable=function(y){return arguments.length?(i=typeof y=="function"?y:kt(!!y),d):i},d.on=function(){var y=o.on.apply(o,arguments);return y===o?d:y},d.clickDistance=function(y){return arguments.length?(w=(y=+y)*y,d):Math.sqrt(w)},d}function Xe(e=8,t="id-"){const n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",i=n+"0123456789-_";let r=n.charAt(Math.floor(Math.random()*n.length));for(let o=1;o<e;o++)r+=i.charAt(Math.floor(Math.random()*i.length));return`${t}${r}`}let Ye=class An{constructor(t,n,i,r=Xe(),o=[]){T(this,"id");T(this,"data");T(this,"children");T(this,"style");T(this,"edgesOut");T(this,"edgesIn");T(this,"defaultCircleRadius",10);T(this,"x");T(this,"y");T(this,"vx");T(this,"vy");T(this,"fx");T(this,"fy");T(this,"weight");T(this,"frozen");T(this,"visible");T(this,"expanded");T(this,"isChild");T(this,"childrenDepth");T(this,"isParent");T(this,"parentNode");T(this,"_original_object");T(this,"_deepest_node_clone");T(this,"_subgraph");T(this,"_circleRadius",this.defaultCircleRadius);T(this,"_circleRadiusCollapsed",this.defaultCircleRadius);T(this,"_dirty");T(this,"domID");this.id=t,this.domID=r,this.data=n??{},this.style=i??{},this.children=[],this.isParent=!1,this.setChildren(o),this._dirty=!0,this.frozen=!1,this.visible=!0,this.expanded=!1,this.isChild=!1,this.childrenDepth=0,this.edgesOut=new Set,this.edgesIn=new Set}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}registerEdgeOut(t){this.edgesOut.add(t)}registerEdgeIn(t){this.edgesIn.add(t)}emptyEdges(){this.edgesOut.clear(),this.edgesIn.clear()}getConnectedNodes(){return[...this.edgesOut].map(t=>t.to)}getConnectingNodes(){return[...this.edgesIn].map(t=>t.from)}getEdgesOut(){return[...this.edgesOut]}getEdgesIn(){return[...this.edgesIn]}getStyle(){return this.style}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){this.style={...this.style,...t},this.markDirty()}getGraphElement(){return document?document.getElementById(`node-${this.domID}`):null}toDict(t=!1){const n={id:this.id,data:this.data,style:this.style,weight:this.weight};return t||(n.x=this.x,n.y=this.y,n.vx=this.vx,n.vy=this.vy,n.fx=this.fx,n.fy=this.fy),this.hasChildren()&&(n.children=this.children.map(i=>i.toDict(t))),n}toSimulationDTO(){return{id:this.id,data:this.data,style:this.style,weight:this.weight,_circleRadius:this._circleRadius,x:this.x,y:this.y,vx:this.vx,vy:this.vy,fx:this.fx,fy:this.fy}}clone(){const t={...this.data},n={...this.style},i=new An(this.id,t,n);return i.x=this.x,i.y=this.y,i.vx=this.vx,i.vy=this.vy,i.fx=this.fx,i.fy=this.fy,i.weight=this.weight,i.frozen=this.frozen,i.visible=this.visible,i.expanded=this.expanded,i.isChild=this.isChild,i.childrenDepth=this.childrenDepth,i.isParent=this.isParent,i.parentNode=this.parentNode,i._circleRadius=this._circleRadius,i.children=this.children.map(r=>r.clone()),i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}freeze(){this.frozen=!0,this.fx=this.x,this.fy=this.y}unfreeze(){this.frozen=!1,this.fx=void 0,this.fy=void 0}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}toggleExpand(t){t===void 0?this.expanded?this.collapse():this.expand():t?this.expand():this.collapse(),this.markDirty()}expand(){this.expanded=!0,this._original_object&&(this._original_object.expanded=!0)}collapse(){this.expanded=!1,this._original_object&&(this._original_object.expanded=!1)}degree(){return this.edgesOut.size+this.edgesIn.size}setCircleRadius(t){this._circleRadius=t}getCircleRadius(){return this._circleRadius}setCircleRadiusCollapsed(t){this._circleRadiusCollapsed=t}getCircleRadiusCollapsed(){return this._circleRadiusCollapsed}setChildren(t){this.children=t,this.hasChildren()?this.isParent=!0:this.isParent=!1}hasChildren(){return this.children.length>0}markAsChild(t,n){this.isChild=!0,this.childrenDepth=n,this.parentNode=t}markAsParent(){this.isParent=!0}setSubgraph(t){this._subgraph=t}getSubgraph(){return this._subgraph}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setDeepestNodeClone(t){this._deepest_node_clone=t}getDeepestNodeClone(){return this._deepest_node_clone}};class Et{constructor(t,n,i,r,o,a=null,l){T(this,"id");T(this,"from");T(this,"to");T(this,"directed");T(this,"data");T(this,"style");T(this,"visible");T(this,"isSynthetic");T(this,"isCrossCluster");T(this,"syntheticTerminalNode");T(this,"syntheticSourceNode");T(this,"_original_object");T(this,"_subgraphFromNode");T(this,"_subgraphToNode");T(this,"_dirty");T(this,"domID");this.id=t,this.domID=Xe(),this.from=n,this.to=i,this.directed=a,this.data=r??{},this.style=o??{},this.visible=!0,this._dirty=!0,this.isSynthetic=l!==void 0,this.syntheticTerminalNode=l,this.from.registerEdgeOut(this),this.to.registerEdgeIn(this)}get source(){return this.from}get target(){return this.to}getData(){return this.data}setData(t){this.data=t,this.markDirty()}updateData(t){this.data={...this.data,...t},this.markDirty()}getStyle(){return this.style}getEdgeStyle(){var t;return((t=this.style)==null?void 0:t.edge)??{}}getLabelStyle(){var t;return((t=this.style)==null?void 0:t.label)??{}}setStyle(t){this.style=t,this.markDirty()}updateStyle(t){const n=this.style,i=t;this.style={...n,...i,edge:{...n.edge,...i.edge},label:{...n.label,...i.label}},this.markDirty()}getGraphElement(){return document?document.getElementById(`edge-${this.domID}`):null}setFrom(t){this.from=t}setTo(t){this.to=t}toDict(){return{id:this.id,from:this.from.id,to:this.to.id,data:this.data,style:this.style}}toSimulationDTO(){return{id:this.id,from:{id:this.from.id},to:{id:this.to.id},data:this.data,style:this.style,directed:this.directed}}clone(){const t={...this.data},n={...this.style},i=new Et(this.id,this.from.clone(),this.to.clone(),t,n,this.directed);return i.visible=this.visible,i}markDirty(){this._dirty=!0}clearDirty(){this._dirty=!1}isDirty(){return this._dirty}toggleVisibility(t){t?this.show():this.hide(),this.markDirty()}show(){this.visible=!0}hide(){this.visible=!1}setOriginalObject(t){this._original_object=t}getOriginalObject(){return this._original_object}setSubgraphFromNode(t){this._subgraphFromNode=t}setSubgraphToNode(t){this._subgraphToNode=t}getSubgraphFromNode(){return this._subgraphFromNode}getSubgraphToNode(){return this._subgraphToNode}}function ts(e){return new Worker(self.location.href,{name:e==null?void 0:e.name})}function es(){return new ts}const ns=(e,t,n,i,r)=>new Promise((o,a)=>{const l=es();l.postMessage({source:"simulation-worker-wrapper",nodes:e,edges:t,options:n,canvasBCR:i}),l.onmessage=c=>{const{type:s,progress:h,nodes:w,edges:d,elapsedTime:g}=c.data;if(s==="tick"&&typeof h=="number"){r==null||r(h,g);return}s==="done"&&(o({nodes:w,edges:d}),l.terminate())},l.onerror=a});var Ot=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function is(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var yt={exports:{}};yt.exports;var Ze;function rs(){return Ze||(Ze=1,(function(e,t){var n=200,i="__lodash_hash_undefined__",r=800,o=16,a=9007199254740991,l="[object Arguments]",c="[object Array]",s="[object AsyncFunction]",h="[object Boolean]",w="[object Date]",d="[object Error]",g="[object Function]",b="[object GeneratorFunction]",p="[object Map]",_="[object Number]",v="[object Null]",x="[object Object]",S="[object Proxy]",y="[object RegExp]",A="[object Set]",D="[object String]",I="[object Undefined]",M="[object WeakMap]",P="[object ArrayBuffer]",k="[object DataView]",B="[object Float32Array]",W="[object Float64Array]",H="[object Int8Array]",lt="[object Int16Array]",ce="[object Int32Array]",vt="[object Uint8Array]",Ut="[object Uint8ClampedArray]",he="[object Uint16Array]",Ht="[object Uint32Array]",wt=/[\\\\^$.*+?()[\\]{}|]/g,Ps=/^\\[object .+?Constructor\\]$/,Bs=/^(?:0|[1-9]\\d*)$/,O={};O[B]=O[W]=O[H]=O[lt]=O[ce]=O[vt]=O[Ut]=O[he]=O[Ht]=!0,O[l]=O[c]=O[P]=O[h]=O[k]=O[w]=O[d]=O[g]=O[p]=O[_]=O[x]=O[y]=O[A]=O[D]=O[M]=!1;var nn=typeof Ot=="object"&&Ot&&Ot.Object===Object&&Ot,Ls=typeof self=="object"&&self&&self.Object===Object&&self,xt=nn||Ls||Function("return this")(),rn=t&&!t.nodeType&&t,bt=rn&&!0&&e&&!e.nodeType&&e,sn=bt&&bt.exports===rn,fe=sn&&nn.process,on=(function(){try{var u=bt&&bt.require&&bt.require("util").types;return u||fe&&fe.binding&&fe.binding("util")}catch{}})(),an=on&&on.isTypedArray;function js(u,f,m){switch(m.length){case 0:return u.call(f);case 1:return u.call(f,m[0]);case 2:return u.call(f,m[0],m[1]);case 3:return u.call(f,m[0],m[1],m[2])}return u.apply(f,m)}function Gs(u,f){for(var m=-1,C=Array(u);++m<u;)C[m]=f(m);return C}function Us(u){return function(f){return u(f)}}function Hs(u,f){return u==null?void 0:u[f]}function Ws(u,f){return function(m){return u(f(m))}}var Vs=Array.prototype,$s=Function.prototype,Wt=Object.prototype,de=xt["__core-js_shared__"],Vt=$s.toString,Z=Wt.hasOwnProperty,ln=(function(){var u=/[^.]+$/.exec(de&&de.keys&&de.keys.IE_PROTO||"");return u?"Symbol(src)_1."+u:""})(),un=Wt.toString,qs=Vt.call(Object),Ks=RegExp("^"+Vt.call(Z).replace(wt,"\\\\$&").replace(/hasOwnProperty|(function).*?(?=\\\\\\()| for .+?(?=\\\\\\])/g,"$1.*?")+"$"),$t=sn?xt.Buffer:void 0,cn=xt.Symbol,hn=xt.Uint8Array;$t&&$t.allocUnsafe;var fn=Ws(Object.getPrototypeOf,Object),dn=Object.create,Xs=Wt.propertyIsEnumerable,Ys=Vs.splice,nt=cn?cn.toStringTag:void 0,qt=(function(){try{var u=ye(Object,"defineProperty");return u({},"",{}),u}catch{}})(),Zs=$t?$t.isBuffer:void 0,gn=Math.max,Qs=Date.now,pn=ye(xt,"Map"),St=ye(Object,"create"),Js=(function(){function u(){}return function(f){if(!rt(f))return{};if(dn)return dn(f);u.prototype=f;var m=new u;return u.prototype=void 0,m}})();function it(u){var f=-1,m=u==null?0:u.length;for(this.clear();++f<m;){var C=u[f];this.set(C[0],C[1])}}function to(){this.__data__=St?St(null):{},this.size=0}function eo(u){var f=this.has(u)&&delete this.__data__[u];return this.size-=f?1:0,f}function no(u){var f=this.__data__;if(St){var m=f[u];return m===i?void 0:m}return Z.call(f,u)?f[u]:void 0}function io(u){var f=this.__data__;return St?f[u]!==void 0:Z.call(f,u)}function ro(u,f){var m=this.__data__;return this.size+=this.has(u)?0:1,m[u]=St&&f===void 0?i:f,this}it.prototype.clear=to,it.prototype.delete=eo,it.prototype.get=no,it.prototype.has=io,it.prototype.set=ro;function X(u){var f=-1,m=u==null?0:u.length;for(this.clear();++f<m;){var C=u[f];this.set(C[0],C[1])}}function so(){this.__data__=[],this.size=0}function oo(u){var f=this.__data__,m=Kt(f,u);if(m<0)return!1;var C=f.length-1;return m==C?f.pop():Ys.call(f,m,1),--this.size,!0}function ao(u){var f=this.__data__,m=Kt(f,u);return m<0?void 0:f[m][1]}function lo(u){return Kt(this.__data__,u)>-1}function uo(u,f){var m=this.__data__,C=Kt(m,u);return C<0?(++this.size,m.push([u,f])):m[C][1]=f,this}X.prototype.clear=so,X.prototype.delete=oo,X.prototype.get=ao,X.prototype.has=lo,X.prototype.set=uo;function ut(u){var f=-1,m=u==null?0:u.length;for(this.clear();++f<m;){var C=u[f];this.set(C[0],C[1])}}function co(){this.size=0,this.__data__={hash:new it,map:new(pn||X),string:new it}}function ho(u){var f=Yt(this,u).delete(u);return this.size-=f?1:0,f}function fo(u){return Yt(this,u).get(u)}function go(u){return Yt(this,u).has(u)}function po(u,f){var m=Yt(this,u),C=m.size;return m.set(u,f),this.size+=m.size==C?0:1,this}ut.prototype.clear=co,ut.prototype.delete=ho,ut.prototype.get=fo,ut.prototype.has=go,ut.prototype.set=po;function ct(u){var f=this.__data__=new X(u);this.size=f.size}function yo(){this.__data__=new X,this.size=0}function mo(u){var f=this.__data__,m=f.delete(u);return this.size=f.size,m}function _o(u){return this.__data__.get(u)}function vo(u){return this.__data__.has(u)}function wo(u,f){var m=this.__data__;if(m instanceof X){var C=m.__data__;if(!pn||C.length<n-1)return C.push([u,f]),this.size=++m.size,this;m=this.__data__=new ut(C)}return m.set(u,f),this.size=m.size,this}ct.prototype.clear=yo,ct.prototype.delete=mo,ct.prototype.get=_o,ct.prototype.has=vo,ct.prototype.set=wo;function xo(u,f){var m=ve(u),C=!m&&_e(u),N=!m&&!C&&wn(u),E=!m&&!C&&!N&&bn(u),R=m||C||N||E,F=R?Gs(u.length,String):[],z=F.length;for(var q in u)R&&(q=="length"||N&&(q=="offset"||q=="parent")||E&&(q=="buffer"||q=="byteLength"||q=="byteOffset")||_n(q,z))||F.push(q);return F}function ge(u,f,m){(m!==void 0&&!Zt(u[f],m)||m===void 0&&!(f in u))&&pe(u,f,m)}function bo(u,f,m){var C=u[f];(!(Z.call(u,f)&&Zt(C,m))||m===void 0&&!(f in u))&&pe(u,f,m)}function Kt(u,f){for(var m=u.length;m--;)if(Zt(u[m][0],f))return m;return-1}function pe(u,f,m){f=="__proto__"&&qt?qt(u,f,{configurable:!0,enumerable:!0,value:m,writable:!0}):u[f]=m}var So=zo();function Xt(u){return u==null?u===void 0?I:v:nt&&nt in Object(u)?Po(u):Ho(u)}function yn(u){return Tt(u)&&Xt(u)==l}function To(u){if(!rt(u)||Go(u))return!1;var f=xe(u)?Ks:Ps;return f.test(qo(u))}function Co(u){return Tt(u)&&xn(u.length)&&!!O[Xt(u)]}function Ao(u){if(!rt(u))return Uo(u);var f=vn(u),m=[];for(var C in u)C=="constructor"&&(f||!Z.call(u,C))||m.push(C);return m}function mn(u,f,m,C,N){u!==f&&So(f,function(E,R){if(N||(N=new ct),rt(E))Do(u,f,R,m,mn,C,N);else{var F=C?C(me(u,R),E,R+"",u,f,N):void 0;F===void 0&&(F=E),ge(u,R,F)}},Sn)}function Do(u,f,m,C,N,E,R){var F=me(u,m),z=me(f,m),q=R.get(z);if(q){ge(u,m,q);return}var V=E?E(F,z,m+"",u,f,R):void 0,Ct=V===void 0;if(Ct){var be=ve(z),Se=!be&&wn(z),Cn=!be&&!Se&&bn(z);V=z,be||Se||Cn?ve(F)?V=F:Ko(F)?V=Eo(F):Se?(Ct=!1,V=Io(z)):Cn?(Ct=!1,V=ko(z)):V=[]:Xo(z)||_e(z)?(V=F,_e(F)?V=Yo(F):(!rt(F)||xe(F))&&(V=Bo(z))):Ct=!1}Ct&&(R.set(z,V),N(V,z,C,E,R),R.delete(z)),ge(u,m,V)}function No(u,f){return Vo(Wo(u,f,Tn),u+"")}var Mo=qt?function(u,f){return qt(u,"toString",{configurable:!0,enumerable:!1,value:Qo(f),writable:!0})}:Tn;function Io(u,f){return u.slice()}function Fo(u){var f=new u.constructor(u.byteLength);return new hn(f).set(new hn(u)),f}function ko(u,f){var m=Fo(u.buffer);return new u.constructor(m,u.byteOffset,u.length)}function Eo(u,f){var m=-1,C=u.length;for(f||(f=Array(C));++m<C;)f[m]=u[m];return f}function Oo(u,f,m,C){var N=!m;m||(m={});for(var E=-1,R=f.length;++E<R;){var F=f[E],z=void 0;z===void 0&&(z=u[F]),N?pe(m,F,z):bo(m,F,z)}return m}function Ro(u){return No(function(f,m){var C=-1,N=m.length,E=N>1?m[N-1]:void 0,R=N>2?m[2]:void 0;for(E=u.length>3&&typeof E=="function"?(N--,E):void 0,R&&Lo(m[0],m[1],R)&&(E=N<3?void 0:E,N=1),f=Object(f);++C<N;){var F=m[C];F&&u(f,F,C,E)}return f})}function zo(u){return function(f,m,C){for(var N=-1,E=Object(f),R=C(f),F=R.length;F--;){var z=R[++N];if(m(E[z],z,E)===!1)break}return f}}function Yt(u,f){var m=u.__data__;return jo(f)?m[typeof f=="string"?"string":"hash"]:m.map}function ye(u,f){var m=Hs(u,f);return To(m)?m:void 0}function Po(u){var f=Z.call(u,nt),m=u[nt];try{u[nt]=void 0;var C=!0}catch{}var N=un.call(u);return C&&(f?u[nt]=m:delete u[nt]),N}function Bo(u){return typeof u.constructor=="function"&&!vn(u)?Js(fn(u)):{}}function _n(u,f){var m=typeof u;return f=f??a,!!f&&(m=="number"||m!="symbol"&&Bs.test(u))&&u>-1&&u%1==0&&u<f}function Lo(u,f,m){if(!rt(m))return!1;var C=typeof f;return(C=="number"?we(m)&&_n(f,m.length):C=="string"&&f in m)?Zt(m[f],u):!1}function jo(u){var f=typeof u;return f=="string"||f=="number"||f=="symbol"||f=="boolean"?u!=="__proto__":u===null}function Go(u){return!!ln&&ln in u}function vn(u){var f=u&&u.constructor,m=typeof f=="function"&&f.prototype||Wt;return u===m}function Uo(u){var f=[];if(u!=null)for(var m in Object(u))f.push(m);return f}function Ho(u){return un.call(u)}function Wo(u,f,m){return f=gn(f===void 0?u.length-1:f,0),function(){for(var C=arguments,N=-1,E=gn(C.length-f,0),R=Array(E);++N<E;)R[N]=C[f+N];N=-1;for(var F=Array(f+1);++N<f;)F[N]=C[N];return F[f]=m(R),js(u,this,F)}}function me(u,f){if(!(f==="constructor"&&typeof u[f]=="function")&&f!="__proto__")return u[f]}var Vo=$o(Mo);function $o(u){var f=0,m=0;return function(){var C=Qs(),N=o-(C-m);if(m=C,N>0){if(++f>=r)return arguments[0]}else f=0;return u.apply(void 0,arguments)}}function qo(u){if(u!=null){try{return Vt.call(u)}catch{}try{return u+""}catch{}}return""}function Zt(u,f){return u===f||u!==u&&f!==f}var _e=yn((function(){return arguments})())?yn:function(u){return Tt(u)&&Z.call(u,"callee")&&!Xs.call(u,"callee")},ve=Array.isArray;function we(u){return u!=null&&xn(u.length)&&!xe(u)}function Ko(u){return Tt(u)&&we(u)}var wn=Zs||Jo;function xe(u){if(!rt(u))return!1;var f=Xt(u);return f==g||f==b||f==s||f==S}function xn(u){return typeof u=="number"&&u>-1&&u%1==0&&u<=a}function rt(u){var f=typeof u;return u!=null&&(f=="object"||f=="function")}function Tt(u){return u!=null&&typeof u=="object"}function Xo(u){if(!Tt(u)||Xt(u)!=x)return!1;var f=fn(u);if(f===null)return!0;var m=Z.call(f,"constructor")&&f.constructor;return typeof m=="function"&&m instanceof m&&Vt.call(m)==qs}var bn=an?Us(an):Co;function Yo(u){return Oo(u,Sn(u))}function Sn(u){return we(u)?xo(u):Ao(u)}var Zo=Ro(function(u,f,m){mn(u,f,m)});function Qo(u){return function(){return u}}function Tn(u){return u}function Jo(){return!1}e.exports=Zo})(yt,yt.exports)),yt.exports}var ss=rs(),Rt=is(ss);function os(e){var t=0,n=e.children,i=n&&n.length;if(!i)t=1;else for(;--i>=0;)t+=n[i].value;e.value=t}function as(){return this.eachAfter(os)}function ls(e,t){let n=-1;for(const i of this)e.call(t,i,++n,this);return this}function us(e,t){for(var n=this,i=[n],r,o,a=-1;n=i.pop();)if(e.call(t,n,++a,this),r=n.children)for(o=r.length-1;o>=0;--o)i.push(r[o]);return this}function cs(e,t){for(var n=this,i=[n],r=[],o,a,l,c=-1;n=i.pop();)if(r.push(n),o=n.children)for(a=0,l=o.length;a<l;++a)i.push(o[a]);for(;n=r.pop();)e.call(t,n,++c,this);return this}function hs(e,t){let n=-1;for(const i of this)if(e.call(t,i,++n,this))return i}function fs(e){return this.eachAfter(function(t){for(var n=+e(t.data)||0,i=t.children,r=i&&i.length;--r>=0;)n+=i[r].value;t.value=n})}function ds(e){return this.eachBefore(function(t){t.children&&t.children.sort(e)})}function gs(e){for(var t=this,n=ps(t,e),i=[t];t!==n;)t=t.parent,i.push(t);for(var r=i.length;e!==n;)i.splice(r,0,e),e=e.parent;return i}function ps(e,t){if(e===t)return e;var n=e.ancestors(),i=t.ancestors(),r=null;for(e=n.pop(),t=i.pop();e===t;)r=e,e=n.pop(),t=i.pop();return r}function ys(){for(var e=this,t=[e];e=e.parent;)t.push(e);return t}function ms(){return Array.from(this)}function _s(){var e=[];return this.eachBefore(function(t){t.children||e.push(t)}),e}function vs(){var e=this,t=[];return e.each(function(n){n!==e&&t.push({source:n.parent,target:n})}),t}function*ws(){var e=this,t,n=[e],i,r,o;do for(t=n.reverse(),n=[];e=t.pop();)if(yield e,i=e.children)for(r=0,o=i.length;r<o;++r)n.push(i[r]);while(n.length)}function zt(e,t){e instanceof Map?(e=[void 0,e],t===void 0&&(t=Ss)):t===void 0&&(t=bs);for(var n=new mt(e),i,r=[n],o,a,l,c;i=r.pop();)if((a=t(i.data))&&(c=(a=Array.from(a)).length))for(i.children=a,l=c-1;l>=0;--l)r.push(o=a[l]=new mt(a[l])),o.parent=i,o.depth=i.depth+1;return n.eachBefore(Cs)}function xs(){return zt(this).eachBefore(Ts)}function bs(e){return e.children}function Ss(e){return Array.isArray(e)?e[1]:null}function Ts(e){e.data.value!==void 0&&(e.value=e.data.value),e.data=e.data.data}function Cs(e){var t=0;do e.height=t;while((e=e.parent)&&e.height<++t)}function mt(e){this.data=e,this.depth=this.height=0,this.parent=null}mt.prototype=zt.prototype={constructor:mt,count:as,each:ls,eachAfter:cs,eachBefore:us,find:hs,sum:fs,sort:ds,path:gs,ancestors:ys,descendants:ms,leaves:_s,links:vs,copy:xs,[Symbol.iterator]:ws};function As(e,t){return e.parent===t.parent?1:2}function ae(e){var t=e.children;return t?t[0]:e.t}function le(e){var t=e.children;return t?t[t.length-1]:e.t}function Ds(e,t,n){var i=n/(t.i-e.i);t.c-=i,t.s+=n,e.c+=i,t.z+=n,t.m+=n}function Ns(e){for(var t=0,n=0,i=e.children,r=i.length,o;--r>=0;)o=i[r],o.z+=t,o.m+=t,t+=o.s+(n+=o.c)}function Ms(e,t,n){return e.a.parent===t.parent?e.a:n}function Pt(e,t){this._=e,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=t}Pt.prototype=Object.create(mt.prototype);function Is(e){for(var t=new Pt(e,0),n,i=[t],r,o,a,l;n=i.pop();)if(o=n._.children)for(n.children=new Array(l=o.length),a=l-1;a>=0;--a)i.push(r=n.children[a]=new Pt(o[a],a)),r.parent=n;return(t.parent=new Pt(null,0)).children=[t],t}function Qe(){var e=As,t=1,n=1,i=null;function r(s){var h=Is(s);if(h.eachAfter(o),h.parent.m=-h.z,h.eachBefore(a),i)s.eachBefore(c);else{var w=s,d=s,g=s;s.eachBefore(function(x){x.x<w.x&&(w=x),x.x>d.x&&(d=x),x.depth>g.depth&&(g=x)});var b=w===d?1:e(w,d)/2,p=b-w.x,_=t/(d.x+b+p),v=n/(g.depth||1);s.eachBefore(function(x){x.x=(x.x+p)*_,x.y=x.depth*v})}return s}function o(s){var h=s.children,w=s.parent.children,d=s.i?w[s.i-1]:null;if(h){Ns(s);var g=(h[0].z+h[h.length-1].z)/2;d?(s.z=d.z+e(s._,d._),s.m=s.z-g):s.z=g}else d&&(s.z=d.z+e(s._,d._));s.parent.A=l(s,d,s.parent.A||w[0])}function a(s){s._.x=s.z+s.parent.m,s.m+=s.parent.m}function l(s,h,w){if(h){for(var d=s,g=s,b=h,p=d.parent.children[0],_=d.m,v=g.m,x=b.m,S=p.m,y;b=le(b),d=ae(d),b&&d;)p=ae(p),g=le(g),g.a=s,y=b.z+x-d.z-_+e(b._,d._),y>0&&(Ds(Ms(b,s,w),s,y),_+=y,v+=y),x+=b.m,_+=d.m,S+=p.m,v+=g.m;b&&!le(g)&&(g.t=b,g.m+=x-v),d&&!ae(p)&&(p.t=d,p.m+=_-S,w=s)}return w}function c(s){s.x*=t,s.y=s.depth*n}return r.separation=function(s){return arguments.length?(e=s,r):e},r.size=function(s){return arguments.length?(i=!1,t=+s[0],n=+s[1],r):i?null:[t,n]},r.nodeSize=function(s){return arguments.length?(i=!0,t=+s[0],n=+s[1],r):i?[t,n]:null},r}function Bt(e,t){const n={};for(const a of e)n[a.id]=[];for(const{source:a,target:l}of t)n[a.id]||(n[a.id]=[]),n[a.id].push(l.id);const i=new Set,r=new Set,o=a=>{if(!i.has(a)&&(i.add(a),r.add(a),n[a]))for(const l of n[a]){if(!i.has(l)&&o(l))return!0;if(r.has(l))return!0}return r.delete(a),!1};return e.some(a=>o(a.id))}function Je(e,t){const n=new Set(t.map(i=>i.target.id));for(const i of e)if(!n.has(i.id))return i;return e[0]}function Fs(e,t){const n=new Map;for(const c of e)n.set(c.id,[]);for(const c of t)n.get(c.from.id)||console.log(c),n.get(c.from.id).push(c.to);const i=new Map,r=new Map;function o(c,s=new Set){if(r.has(c))return new Set(r.get(c));const h=new Set;for(const w of n.get(c.id)??[])if(!s.has(w)){s.add(w),h.add(w);const d=o(w,s);for(const g of d)h.add(g)}return r.set(c,h),i.set(c,h.size),h}for(const c of e)i.has(c)||o(c);let a=null,l=-1;for(const c of e){const s=i.get(c)??0;s>l&&(l=s,a=c)}return a??e[0]}function ks(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Min-max distance root undefined."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let w=0;for(const d of n.get(h.id))w=Math.max(w,1+(a.get(d.id)||0));a.set(h.id,w)}let l=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,l=s)}return l??e[0]}function Es(e,t){const n=new Map,i=new Map;for(const s of e)n.set(s.id,[]),i.set(s.id,0);for(const s of t)s.directed!==!1&&(n.get(s.from.id).push(s.to),i.set(s.to.id,(i.get(s.to.id)||0)+1));const r=[],o=e.filter(s=>i.get(s.id)===0);for(;o.length;){const s=o.shift();r.push(s);for(const h of n.get(s.id))i.set(h.id,i.get(h.id)-1),i.get(h.id)===0&&o.push(h)}if(r.length!==e.length)return console.warn("Graph has a cycle! Cannot minimize DAG height."),e[0];const a=new Map;for(let s=r.length-1;s>=0;s--){const h=r[s];let w=0;for(const d of n.get(h.id))w=Math.max(w,1+(a.get(d.id)??0));a.set(h.id,w)}let l=null,c=1/0;for(const s of e){const h=a.get(s.id);h<c&&(c=h,l=s)}return l??e[0]}const ue={type:"tree",rootId:void 0,rootIdAlgorithmFinder:"MaxReachability",strength:.25,radial:!1,radialGap:750,horizontal:!1,flipEdgeDirection:!1};class j{constructor(t,n,i,r={}){T(this,"graph");T(this,"simulation");T(this,"simulationForces");T(this,"options");T(this,"originalForceStrength");T(this,"canvasBCR");T(this,"levels");T(this,"positionedNodesByID");this.graph=t,this.simulation=n,this.simulationForces=i,this.options=Rt({},ue,r),this.originalForceStrength={link:this.simulationForces.link.strength(),charge:this.simulationForces.charge.strength(),gravity:this.simulationForces.gravity.strength()},this.positionedNodesByID=new Map,this.levels={};const o=this.graph.getNodes(),a=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges();if(Bt(o,a)){this.graph.notifier.warning("Tree layout unavailable","The graph contains a cycle, so it cannot be displayed as a tree.");return}this.setSizes(),this.update(),this.registerForces()}update(){const t=this.graph.getNodes(),n=this.options.flipEdgeDirection?this.flipEdgeDirection(this.graph.getEdges()):this.graph.getEdges(),{levels:i}=this.buildLevels(t,n,void 0,this.options.rootIdAlgorithmFinder),{nodes:r,nodeById:o}=this.buildTree(t,n,this.options,this.canvasBCR);this.positionedNodesByID=o,this.levels=i,r&&this.setNodePositions(r,this.options)}flipEdgeDirection(t){return t.forEach(n=>{const i=n.from;n.setFrom(n.to),n.setTo(i)}),t}setSizes(){const t=this.graph.renderer.getCanvas();if(!t)throw new Error("Canvas element is not defined in the graph renderer.");this.canvasBCR=t.getBoundingClientRect()}setNodePositions(t,n){for(const i of t){const r=this.graph.getMutableNode(i.data.id);if(r)if(n.radial){const o=i.x??0,a=i.y??0;r.x=a*Math.cos(o-Math.PI/2),r.y=a*Math.sin(o-Math.PI/2),r.fx=r.x,r.fy=r.y}else n.horizontal?(r.x=i.y,r.fx=i.y,r.y=i.x,delete r.fy):(r.x=i.x,r.y=i.y,r.fy=i.y,delete r.fx)}}unsetNodePositions(){this.graph.getMutableNodes().forEach(t=>{delete t.fy,delete t.fx})}registerForces(){const t=this.options.strength??.1;if(this.options.radial){const n=Ee(i=>(this.levels[i.id]??1)*100,0,0).strength(t);this.simulation.force("tree-radial",n)}else this.simulation.force("tree-y",Re(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.x)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.y)??0}).strength(t)),this.simulation.force("tree-x",Oe(n=>{var i,r;return this.options.horizontal?((i=this.positionedNodesByID.get(n.id))==null?void 0:i.y)??0:((r=this.positionedNodesByID.get(n.id))==null?void 0:r.x)??0}).strength(t));j.adjustOtherSimulationForces(this.simulationForces,this.options)}unregisterLayout(){this.unregisterForces(),this.unsetNodePositions()}unregisterForces(){this.simulation.force("tree-radial",null),this.simulation.force("tree-y",null),this.simulation.force("tree-x",null),j.resetOtherSimulationForces(this.simulationForces,this.originalForceStrength)}static registerForcesOnSimulation(t,n,i,r,o,a,l=this){const c=Rt({},ue,o),s=c.strength??.1,h=a.width,w=a.height,d=[h/2,w/2];if(Bt(t,n))return;const{levels:g}=l.buildLevelsStatic(t,n,void 0,c.rootIdAlgorithmFinder),{nodeById:b}=l.buildTreeStatic(t,n,c,a);if(c.radial){const p=Ee(_=>(g[_.id]??1)*100,d[0],d[1]).strength(s);i.force("tree-radial",p)}else i.force("tree-y",Re(p=>{var _,v;return c.horizontal?((_=b.get(p.id))==null?void 0:_.x)??0:((v=b.get(p.id))==null?void 0:v.y)??0}).strength(s)),i.force("tree-x",Oe(p=>{var _,v;return c.horizontal?((_=b.get(p.id))==null?void 0:_.y)??0:((v=b.get(p.id))==null?void 0:v.x)??0}).strength(s));l.adjustOtherSimulationForces(r,c)}static adjustOtherSimulationForces(t,n){n!=null&&n.radial?(t.link.strength(0),t.charge.strength(0),t.gravity.strength(0)):(t.link.strength(0),t.charge.strength(0),t.gravity.strength(1e-5))}static resetOtherSimulationForces(t,n){t.link.strength(n.link),t.charge.strength(n.charge),t.gravity.strength(n.gravity)}static simulationDone(t,n,i,r){const o=Rt({},ue,r);for(const a of t)o.radial?(a.fx=a.x,a.fy=a.y):o.horizontal?(a.fx=a.x,delete a.fy):(a.fy=a.y,delete a.fx)}buildTree(t,n,i,r){return j.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Bt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const p of t){const _=p;_.children=[],o.set(p.id,_)}for(const p of n){const _=o.get(p.source.id),v=o.get(p.target.id);_&&v&&(_.children.push(v),v.parent=_)}const a=i.rootId||j.findRootId(t,n,i.rootIdAlgorithmFinder),l=o.get(a);if(!l)throw new Error(`Root node with id "${a}" not found.`);const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,w=Qe();i.radial?w.size([s,h]):w.size([s,h]).separation((p,_)=>{var x,S;const v=((S=(x=p.parent)==null?void 0:x.children)==null?void 0:S.length)??1;return p.parent===_.parent?1.5/v:1.5});const d=zt(l),g=w(d),b=new Map;return g.descendants().forEach(p=>{b.set(p.data.id,p)}),{root:g,nodes:g.descendants(),nodeById:b}}buildLevels(t,n,i,r){return j.buildLevelsStatic(t,n,i,r)}static buildLevelsStatic(t,n,i,r){if(!t.length)return{levels:{},maxDepth:0,nodeCountPerLevel:{}};const o=i||j.findRootId(t,n,r),a={[o]:0},l={};for(const d of t)l[d.id]=[];for(const{source:d,target:g}of n)l[d.id].push(g.id);const c=[o];let s=0;for(;s<c.length;){const d=c[s++],g=a[d];for(const b of l[d]||[])b in a||(a[b]=g+1,c.push(b))}const h=Math.max(...Object.values(a)),w={};for(const d of Object.values(a))w[d]=(w[d]||0)+1;return{levels:a,maxDepth:h,nodeCountPerLevel:w}}static findRootId(t,n,i){switch(i){case"FirstZeroInDegree":return Je(t,n).id;case"MaxReachability":return Fs(t,n).id;case"MinMaxDistance":return ks(t,n).id;case"MinHeight":return Es(t,n).id;default:return Je(t,n).id}}}class _t extends j{constructor(t,n,i,r){super(t,n,i,{...r,type:"tree"})}static registerForcesOnSimulation(t,n,i,r,o,a){j.registerForcesOnSimulation(t,n,i,r,o,a,_t)}buildTree(t,n,i,r){return _t.buildTreeStatic(t,n,i,r)}static buildTreeStatic(t,n,i,r){if(!t.length)return{root:null,nodes:[],nodeById:new Map};if(Bt(t,n))return console.warn("Cycle detected in graph. Tree layout will not be computed."),{root:null,nodes:[],nodeById:new Map};const o=new Map;for(const p of t){const _=p;_.children=[],o.set(p.id,_)}if(!i.rootId||!o.get(i.rootId))throw new Error("Ego Tree can only be created with a rootId");const a=i.rootId,l=o.get(a);if(l.children=[],!l)throw new Error(`Root node with id "${a}" not found.`);for(const p of n){const _=o.get(p.source.id),v=o.get(p.target.id);_&&v&&(p.source.id===l.id?(l.children.push(v),v.parent=l):p.target.id===l.id&&(l.children.push(_),_.parent=l))}const c=i.radialGap,s=i.radial?2*Math.PI:r.width,h=i.radial?c:r.height,w=Qe();i.radial?w.size([s,h]):w.size([s,h]).separation((p,_)=>{var x,S;const v=((S=(x=p.parent)==null?void 0:x.children)==null?void 0:S.length)??1;return p.parent===_.parent?1.5/v:1.5});const d=zt(l),g=w(d),b=new Map;return g.descendants().forEach(p=>{b.set(p.data.id,p)}),{root:g,nodes:g.descendants(),nodeById:b}}}function Os(e){var n;const t=(n=e.getData())==null?void 0:n.label;return typeof t=="string"?t:""}const tt={d3Alpha:1,d3AlphaMin:.001,d3AlphaDecay:.05,d3AlphaTarget:0,d3VelocityDecay:.45,d3LinkDistance:40,d3LinkStrength:null,d3ManyBodyStrength:-150,d3ManyBodyTheta:.9,d3CollideRadius:12,d3CollideStrength:1,d3CollideIterations:1,d3GravityStrength:.1,d3GravityStrengthConnected:.001,enabled:!0,cooldownTime:2e3,useWorker:!0,warmupTicks:"auto",freezeNodesOnDrag:!0,gridSnappingEnabled:!1,gridSize:50,fitViewOnExpandCollapse:!1,layout:{type:"force"},callbacks:{onInit:()=>{},onStart:()=>{},onStop:()=>{},onTick:()=>{}}};class et{constructor(t,n={}){T(this,"simulation");T(this,"graph");T(this,"canvas");T(this,"graphInteraction");T(this,"layout");T(this,"canvasBCR");T(this,"animationFrameId",null);T(this,"startSimulationTime",0);T(this,"engineRunning",!1);T(this,"slowTickThresholdReached",!1);T(this,"avgTickDuration",0);T(this,"SLOW_TICK_THRESHOLD",33);T(this,"dragInProgress",!1);T(this,"dragSelection",[]);T(this,"totalTickCount",0);T(this,"options");T(this,"callbacks");T(this,"simulationForces");T(this,"scaledForces",{d3ManyBodyStrength:tt.d3ManyBodyStrength,d3CollideStrength:tt.d3CollideStrength});if(this.graph=t,this.options=Rt({},tt,n),this.callbacks=this.options.callbacks??{},this.canvas=this.graph.renderer.getCanvas(),!this.canvas)throw new Error("Canvas element is not defined in the graph renderer.");if(this.canvasBCR=this.canvas.getBoundingClientRect(),this.graphInteraction=this.graph.renderer.getGraphInteraction(),!this.graphInteraction)throw new Error("Graph interaction is not available.");const i=et.initSimulationForces(this.options,this.canvasBCR);this.simulation=i.simulation,this.simulationForces=i.simulationForces,this.scaledForces.d3ManyBodyStrength=this.options.d3ManyBodyStrength||tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=this.options.d3CollideStrength||tt.d3CollideStrength,this.options.layout.type==="tree"?this.layout=new j(this.graph,this.simulation,this.simulationForces,this.options.layout):this.options.layout.type==="egoTree"&&(this.layout=new _t(this.graph,this.simulation,this.simulationForces,this.options.layout)),this.callbacks.onInit&&this.callbacks.onInit(this)}static initSimulationForces(t,n){const i={link:Vn(),charge:ai(),collide:Hn(),gravity:li()},r=oi().force("link",i.link).force("charge",i.charge).force("collide",i.collide).force("gravity",i.gravity);return this.initSimulationForceGravity(i.gravity,t,n),this.initSimulationForceLink(i.link,t),this.initSimulationForceCharge(i.charge,t),this.initSimulationForceCollide(i.collide,t),r.alphaMin(t.d3AlphaMin),r.alphaDecay(t.d3AlphaDecay),r.alphaTarget(0),r.velocityDecay(t.d3VelocityDecay),{simulation:r,simulationForces:i}}static initSimulationForceGravity(t,n,i){t.x(i.width/2).y(i.height/2).strength(r=>(r.degree()??0)===0?n.d3GravityStrength:n.d3GravityStrengthConnected)}static initSimulationForceLink(t,n){t.distance(i=>{const r=i.__clusterAnchorDistance;if(r!=null)return r;const o=Os(i);if(!o||o==="")return n.d3LinkDistance;const a=o.length*10;return Math.max(n.d3LinkDistance,a)}),n.d3LinkStrength&&t.strength(n.d3LinkStrength)}static initSimulationForceCharge(t,n){t.theta(n.d3ManyBodyTheta).strength(i=>{const r=i,o=n.d3ManyBodyStrength,a=r.expanded?r.getCircleRadiusCollapsed():r.getCircleRadius(),l=10+Math.sqrt(Math.max(0,a-10));let c=r.weight??1;return c*=r.isParent?10:1,o*(l*l)/100*c})}static initSimulationForceCollide(t,n){t.radius(i=>{const r=i;return r.expanded?1.2*r.getCircleRadius()+20:r.getCircleRadius()?1.2*r.getCircleRadius():n.d3CollideRadius}).strength(n.d3CollideStrength)}static initSimulationForceClusterRadialConstraint(t,n){t.strength(n.d3CollideStrength)}update(){this.layout&&this.layout.update();const t=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(t);const n=this.simulation.force("link");n&&n.id(i=>i.id).links(this.getActiveEdges()),this.restart()}getActiveEdges(){const t=new Set(this.graph.getMutableNodes().filter(a=>a.visible).map(a=>a.id)),n=a=>{let l=a;for(;l&&!t.has(l.id);)l=l.parentNode;return l},i=(a,l)=>a<l?`${a}|${l}`:`${l}|${a}`,r=[],o=new Set;for(const a of this.graph.getMutableEdges()){if(!a.visible)continue;const l=a.source,c=a.target;if(!l.isChild&&!c.isChild){r.push(a),o.add(i(l.id,c.id));continue}if(l.isChild&&c.isChild)continue;const s=l.isChild?c:l,h=n(l.isChild?l:c);if(!h||h.id===s.id)continue;const w=i(s.id,h.id);o.has(w)||(o.add(w),r.push(this.clusterAnchorLink(s,h)))}return r}clusterAnchorLink(t,n){return{id:`cluster-anchor-${t.id}-${n.id}`,source:t,target:n,__clusterAnchorDistance:n.getCircleRadius()+this.options.d3LinkDistance}}scaleSimulationOptions(){const t=et.scaleSimulationOptions(this.options,this.canvasBCR,this.graph.getNodeCount());this.scaledForces.d3ManyBodyStrength=t.d3ManyBodyStrength??tt.d3ManyBodyStrength,this.scaledForces.d3CollideStrength=t.d3CollideStrength??tt.d3CollideStrength}static scaleSimulationOptions(t,n,i){const r=i/(n.width*n.height),o=Math.min(2,75e-6/r);return{d3ManyBodyStrength:t.d3ManyBodyStrength*o,d3CollideStrength:t.d3ManyBodyStrength*o}}applyScalledSimulationOptions(){et.initSimulationForceCharge(this.simulationForces.charge,this.options),et.initSimulationForceCollide(this.simulationForces.collide,this.options)}enable(){this.avgTickDuration=0,this.options.enabled=!0,this.start(!1)}disable(){this.options.enabled=!1,this.stop()}pause(){this.engineRunning=!1,this.slowTickThresholdReached=!1}restart(){this.startSimulationTime=new Date().getTime(),this.engineRunning=!0,this.slowTickThresholdReached=!1}async start(t=!0){if(t&&await this.runSimulationWorkerRouter(),!this.options.enabled){this.engineRunning=!1;return}this.engineRunning=!0,this.slowTickThresholdReached=!1,this.callbacks.onStart&&this.callbacks.onStart(this),this.animationFrameId===null&&this.startAnimationLoop()}stop(){this.engineRunning=!1,this.animationFrameId!==null&&(cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)}startAnimationLoop(){const t=()=>{this.animationFrameId=requestAnimationFrame(t),this.simulationTick()};this.engineRunning=!0,this.simulation.alpha(.01).restart(),this.animationFrameId=requestAnimationFrame(t)}simulationTick(){if(this.engineRunning){!this.dragInProgress&&(new Date().getTime()-this.startSimulationTime>this.options.cooldownTime||this.options.d3AlphaMin>0&&this.simulation.alpha()<this.options.d3AlphaMin)&&(this.engineRunning=!1,this.simulation.stop(),this.callbacks.onStop&&this.callbacks.onStop(this)),this.totalTickCount++;const t=performance.now();this.simulation.tick(),this.graph.nextTick(),this.updateTickMetrics(performance.now()-t),this.callbacks.onTick&&this.callbacks.onTick(this),this.graphInteraction.simulationTick(),this.totalTickCount%10===0&&this.graphInteraction.simulationSlowTick()}}updateTickMetrics(t){var n;this.avgTickDuration=this.avgTickDuration*.9+t*.1,this.avgTickDuration>this.SLOW_TICK_THRESHOLD&&(this.slowTickThresholdReached=!0,this.disable(),(n=this.graph.UIManager.graphControls)==null||n.updatePhysicSimulationIndicator(!1),this.graph.UIManager.showNotification({level:"warning",title:"Physics engine running slow",message:"The physic has been disabled."}))}async waitForSimulationStop(){if(this.engineRunning)return new Promise(t=>{const n=this.callbacks.onStop;this.callbacks.onStop=i=>{n==null||n(i),this.callbacks.onStop=n,t()}})}isEnabled(){return this.options.enabled}applyComputedPositions(t){const n=new Map(t.map(i=>[i.id,i]));for(const i of this.graph.getMutableNodes()){const r=n.get(i.id);r&&(i.x=r.x,i.y=r.y,i.fx=typeof r.fx=="number"?r.fx:void 0,i.fy=typeof r.fy=="number"?r.fy:void 0)}}async computeGraph(t={}){var h;const{runSimulation:n}=await Promise.resolve().then(function(){return zs}),i=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!i)return;const r=this.graph.getMutableNodes(),o=this.graph.getNodes(),a=this.graph.getEdges(),{callbacks:l,...c}=this.options;Object.assign(c,t);const{nodes:s}=n(o,a,c,i);this.applyComputedPositions(s),this.graph.updateData(r,void 0,!1)}async runSimulationWorkerRouter(t={}){if(this.options.useWorker)try{await this.runSimulationWorker(t);return}catch(n){this.options.useWorker=!1,console.warn("[Pivotick] Simulation Web Worker unavailable (often a CSP blocking blob workers); falling back to the main thread. Set `simulation.useWorker: false` to silence this.",n)}await this.computeGraph(t),this.graph.updateLayoutProgress(100,0,"done")}async runSimulationWorker(t={}){var h;const n=(h=this.canvas)==null?void 0:h.getBoundingClientRect();if(!n)return;const i=this.graph.getMutableNodes(),r=this.graph.getNodes().map(w=>w.toSimulationDTO()),o=this.graph.getEdges().map(w=>w.toSimulationDTO()),a=(w,d)=>{this.graph.updateLayoutProgress(w,d,"simulation")},{callbacks:l,...c}=this.options;Object.assign(c,t);const{nodes:s}=await ns(r,o,c,n,a);this.graph.updateLayoutProgress(100,0,"rendering"),this.applyComputedPositions(s),this.graph.updateData(i,void 0,!1),this.graph.updateLayoutProgress(100,0,"done")}reheat(t=.7){this.restart(),this.simulation.alpha(t).restart()}refreshForcesAndReheat(t=.5){if(!this.options.enabled)return;const n=this.graph.getMutableNodes().filter(i=>i.visible);this.simulation.nodes(n),this.reheat(t)}createDragBehavior(){return Jr().filter(()=>!this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement",(t,n)=>{this.graphInteraction.hasActiveMultiselection()?this.dragSelection=this.graphInteraction.getSelectedNodes().map(i=>{const{node:r}=i;return r.freeze(),{node:r,dx:r.x-n.x,dy:r.y-n.y}}):(this.dragSelection=[],n.freeze())}).on("drag.draggedelement",(t,n)=>{if(!this.dragInProgress&&this.isEnabled()&&(this.dragInProgress=!0,this.restart(),this.simulation.alphaTarget(.3).restart()),this.graphInteraction.hasActiveMultiselection())this.dragSelection.forEach(({node:i,dx:r,dy:o})=>{const a=this.applySnap(t.x+r),l=this.applySnap(t.y+o);i.fx=a,i.fy=l,i.x=a,i.y=l});else{const i=this.applySnap(t.x),r=this.applySnap(t.y);n.fx=i,n.fy=r,n.x=i,n.y=r}if(this.graphInteraction.dragging(t.sourceEvent,t.subject),!this.engineRunning||!this.isEnabled()){const i=this.graphInteraction.hasActiveMultiselection()?this.dragSelection.map(r=>r.node):[n];this.graph.nextTickFor(i)}}).on("end.draggedelement",(t,n)=>{!t.active&&this.dragInProgress&&(this.dragInProgress=!1,this.restart(),this.simulation.alphaTarget(this.options.d3AlphaTarget).restart()),this.options.freezeNodesOnDrag||(this.graphInteraction.hasActiveMultiselection()?(this.dragSelection.forEach(({node:i})=>i.unfreeze()),this.dragSelection=[]):n.unfreeze()),this.graphInteraction.dragended(t.sourceEvent,t.subject)})}isDragging(){return this.dragInProgress}toggleGridSnapping(){this.options.gridSnappingEnabled=!this.options.gridSnappingEnabled}toggleFreezeNodesOnDrag(){this.options.freezeNodesOnDrag=!this.options.freezeNodesOnDrag}isFreezeNodesOnDrag(){return this.options.freezeNodesOnDrag}toggleFitViewOnExpandCollapse(){this.options.fitViewOnExpandCollapse=!this.options.fitViewOnExpandCollapse}isFitViewOnExpandCollapse(){return this.options.fitViewOnExpandCollapse}applySnap(t){return this.options.gridSnappingEnabled?Math.round(t/this.options.gridSize)*this.options.gridSize:t}getForceSimulation(){return this.simulationForces}getSimulation(){return this.simulation}async changeLayout(t,n={}){var i;this.layout&&((i=this.layout)==null||i.unregisterLayout(),this.layout=void 0),n=n??{},n.layout=n.layout??{},n.layout.type=t,t==="force"?this.applyScalledSimulationOptions():t==="tree"&&(this.layout=new j(this.graph,this.simulation,this.simulationForces,n.layout)),this.options.layout.type=t,this.update(),this.pause(),await this.runSimulationWorkerRouter(n),this.restart(),await this.waitForSimulationStop(),this.graph.renderer.fitAndCenterWhenSettled()}}const tn=1e4,Lt=2e4,jt=.15*Lt;self.onmessage=e=>{var p,_,v,x;if(e.data.source!=="simulation-worker-wrapper")return;const{nodes:t,edges:n,options:i,canvasBCR:r}=e.data,o=t.map(S=>{const y=new Ye(S.id,S.data,S.style);return y.setCircleRadius(S._circleRadius??10),typeof S.x=="number"&&(y.x=S.x),typeof S.y=="number"&&(y.y=S.y),typeof S.fx=="number"&&(y.fx=S.fx),typeof S.fy=="number"&&(y.fy=S.fy),y}),a=new Map(o.map(S=>[S.id,S]));(p=i.layout)==null||p.type;const{simulation:l,simulationForces:c}=et.initSimulationForces(i,r),s=[];for(const S of n){const y=a.get(S.from.id),A=a.get(S.to.id);if(y&&A){const D=S.style??{};s.push(new Et(S.id,y,A,S.data,D,S.directed))}}l.nodes(o);const h=l.force("link");h&&h.id(S=>S.id).links(s),((_=i.layout)==null?void 0:_.type)==="tree"?j.registerForcesOnSimulation(o,s,l,c,i.layout,r,j):((v=i.layout)==null?void 0:v.type)==="egoTree"&&j.registerForcesOnSimulation(o,s,l,c,i.layout,r,_t);let w=i.warmupTicks||Lt;w=w==="auto"?Lt:w,w=w-jt;let d=.3;l.alphaTarget(d);const g=new Date().getTime();let b;for(let S=0;S<w&&!(new Date().getTime()-g>tn||new Date().getTime()-g>i.cooldownTime||Gt(i,l,d)&&new Date().getTime()-g>i.cooldownTime*.15);++S)S%5===0&&(b=en(S,new Date().getTime()-g,i),postMessage({type:"tick",progress:b,elapsedTime:new Date().getTime()-g})),l.tick();d=0,l.alphaTarget(d),l.alpha(1);for(let S=0;S<jt&&!(Gt(i,l,d)&&new Date().getTime()-g>i.cooldownTime*.15);++S)l.tick(),S%5===0&&(b=en(w+S,new Date().getTime()-g,i),postMessage({type:"tick",progress:b,elapsedTime:new Date().getTime()-g}));postMessage({type:"tick",progress:1,elapsedTime:new Date().getTime()-g}),((x=i.layout)==null?void 0:x.type)==="tree"&&j.simulationDone(o,s,l,i.layout),postMessage({type:"done",nodes:o.map(S=>S.toDict()),edges:s.map(S=>S.toDict())})};function Rs(e,t,n,i){var g,b,p,_;const r=e.map(v=>{const x=new Ye(v.id,v.getData(),v.getStyle());return x.weight=v.weight||1,x.setCircleRadius(v.getCircleRadius()),typeof v.x=="number"&&(x.x=v.x),typeof v.y=="number"&&(x.y=v.y),typeof v.fx=="number"&&(x.fx=v.fx),typeof v.fy=="number"&&(x.fy=v.fy),x}),o=new Map(r.map(v=>[v.id,v]));(g=n.layout)==null||g.type;const{simulation:a,simulationForces:l}=et.initSimulationForces(n,i),c=[];for(const v of t){const x=o.get(v.from.id),S=o.get(v.to.id);if(x&&S){const y=v.getStyle()??{};c.push(new Et(v.id,x,S,v.getData(),y,v.directed))}}a.nodes(r);const s=a.force("link");s&&s.id(v=>v.id).links(c),(((b=n.layout)==null?void 0:b.type)==="tree"||((p=n.layout)==null?void 0:p.type)==="egoTree")&&j.registerForcesOnSimulation(r,c,a,l,n.layout,i,j);let h;n.warmupTicks==="auto"||n.warmupTicks==null?h=Lt:h=n.warmupTicks,h=h-jt;let w=.3;a.alphaTarget(w);const d=new Date().getTime();for(let v=0;v<h&&!(new Date().getTime()-d>tn||new Date().getTime()-d>n.cooldownTime||Gt(n,a,w)&&new Date().getTime()-d>n.cooldownTime*.15);++v)a.tick();w=0,a.alphaTarget(w),a.alpha(1);for(let v=0;v<jt&&!(Gt(n,a,w)&&new Date().getTime()-d>n.cooldownTime*.15);++v)a.tick();return((_=n.layout)==null?void 0:_.type)==="tree"&&j.simulationDone(r,c,a,n.layout),{nodes:r,edges:c}}function en(e,t,n){return t/n.cooldownTime}function Gt(e,t,n){return e.d3AlphaMin>0&&t.alpha()-n<e.d3AlphaMin}var zs=Object.freeze({__proto__:null,runSimulation:Rs})})();\n', tn = typeof self < "u" && self.Blob && new Blob([Tn], { type: "text/javascript;charset=utf-8" });
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
    const { type: o, progress: h, nodes: w, edges: d, elapsedTime: g } = c.data;
    if (o === "tick" && typeof h == "number") {
      r == null || r(h, g);
      return;
    }
    o === "done" && (s({ nodes: w, edges: d }), l.terminate());
  }, l.onerror = a;
});
var Ot = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ts(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var vt = { exports: {} };
vt.exports;
var en;
function Cs() {
  return en || (en = 1, (function(e, t) {
    var n = 200, i = "__lodash_hash_undefined__", r = 800, s = 16, a = 9007199254740991, l = "[object Arguments]", c = "[object Array]", o = "[object AsyncFunction]", h = "[object Boolean]", w = "[object Date]", d = "[object Error]", g = "[object Function]", b = "[object GeneratorFunction]", p = "[object Map]", v = "[object Number]", _ = "[object Null]", x = "[object Object]", S = "[object Proxy]", y = "[object RegExp]", A = "[object Set]", D = "[object String]", k = "[object Undefined]", N = "[object WeakMap]", P = "[object ArrayBuffer]", F = "[object DataView]", B = "[object Float32Array]", W = "[object Float64Array]", V = "[object Int8Array]", it = "[object Int16Array]", Kt = "[object Int32Array]", lt = "[object Uint8Array]", St = "[object Uint8ClampedArray]", Yt = "[object Uint16Array]", Tt = "[object Uint32Array]", ut = /[\\^$.*+?()[\]{}|]/g, Dn = /^\[object .+?Constructor\]$/, Mn = /^(?:0|[1-9]\d*)$/, O = {};
    O[B] = O[W] = O[V] = O[it] = O[Kt] = O[lt] = O[St] = O[Yt] = O[Tt] = !0, O[l] = O[c] = O[P] = O[h] = O[F] = O[w] = O[d] = O[g] = O[p] = O[v] = O[x] = O[y] = O[A] = O[D] = O[N] = !1;
    var xe = typeof Ot == "object" && Ot && Ot.Object === Object && Ot, Nn = typeof self == "object" && self && self.Object === Object && self, ct = xe || Nn || Function("return this")(), be = t && !t.nodeType && t, ht = be && !0 && e && !e.nodeType && e, Se = ht && ht.exports === be, Zt = Se && xe.process, Te = (function() {
      try {
        var u = ht && ht.require && ht.require("util").types;
        return u || Zt && Zt.binding && Zt.binding("util");
      } catch {
      }
    })(), Ce = Te && Te.isTypedArray;
    function kn(u, f, m) {
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
      for (var m = -1, C = Array(u); ++m < u; )
        C[m] = f(m);
      return C;
    }
    function Fn(u) {
      return function(f) {
        return u(f);
      };
    }
    function En(u, f) {
      return u == null ? void 0 : u[f];
    }
    function On(u, f) {
      return function(m) {
        return u(f(m));
      };
    }
    var Rn = Array.prototype, zn = Function.prototype, Ct = Object.prototype, Qt = ct["__core-js_shared__"], At = zn.toString, K = Ct.hasOwnProperty, Ae = (function() {
      var u = /[^.]+$/.exec(Qt && Qt.keys && Qt.keys.IE_PROTO || "");
      return u ? "Symbol(src)_1." + u : "";
    })(), De = Ct.toString, Pn = At.call(Object), Bn = RegExp(
      "^" + At.call(K).replace(ut, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), Dt = Se ? ct.Buffer : void 0, Me = ct.Symbol, Ne = ct.Uint8Array;
    Dt && Dt.allocUnsafe;
    var ke = On(Object.getPrototypeOf, Object), Ie = Object.create, jn = Ct.propertyIsEnumerable, Ln = Rn.splice, Z = Me ? Me.toStringTag : void 0, Mt = (function() {
      try {
        var u = ee(Object, "defineProperty");
        return u({}, "", {}), u;
      } catch {
      }
    })(), Gn = Dt ? Dt.isBuffer : void 0, Fe = Math.max, Un = Date.now, Ee = ee(ct, "Map"), ft = ee(Object, "create"), Vn = /* @__PURE__ */ (function() {
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
        var C = u[f];
        this.set(C[0], C[1]);
      }
    }
    function Wn() {
      this.__data__ = ft ? ft(null) : {}, this.size = 0;
    }
    function $n(u) {
      var f = this.has(u) && delete this.__data__[u];
      return this.size -= f ? 1 : 0, f;
    }
    function qn(u) {
      var f = this.__data__;
      if (ft) {
        var m = f[u];
        return m === i ? void 0 : m;
      }
      return K.call(f, u) ? f[u] : void 0;
    }
    function Hn(u) {
      var f = this.__data__;
      return ft ? f[u] !== void 0 : K.call(f, u);
    }
    function Xn(u, f) {
      var m = this.__data__;
      return this.size += this.has(u) ? 0 : 1, m[u] = ft && f === void 0 ? i : f, this;
    }
    Q.prototype.clear = Wn, Q.prototype.delete = $n, Q.prototype.get = qn, Q.prototype.has = Hn, Q.prototype.set = Xn;
    function X(u) {
      var f = -1, m = u == null ? 0 : u.length;
      for (this.clear(); ++f < m; ) {
        var C = u[f];
        this.set(C[0], C[1]);
      }
    }
    function Kn() {
      this.__data__ = [], this.size = 0;
    }
    function Yn(u) {
      var f = this.__data__, m = Nt(f, u);
      if (m < 0)
        return !1;
      var C = f.length - 1;
      return m == C ? f.pop() : Ln.call(f, m, 1), --this.size, !0;
    }
    function Zn(u) {
      var f = this.__data__, m = Nt(f, u);
      return m < 0 ? void 0 : f[m][1];
    }
    function Qn(u) {
      return Nt(this.__data__, u) > -1;
    }
    function Jn(u, f) {
      var m = this.__data__, C = Nt(m, u);
      return C < 0 ? (++this.size, m.push([u, f])) : m[C][1] = f, this;
    }
    X.prototype.clear = Kn, X.prototype.delete = Yn, X.prototype.get = Zn, X.prototype.has = Qn, X.prototype.set = Jn;
    function rt(u) {
      var f = -1, m = u == null ? 0 : u.length;
      for (this.clear(); ++f < m; ) {
        var C = u[f];
        this.set(C[0], C[1]);
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
      var m = It(this, u), C = m.size;
      return m.set(u, f), this.size += m.size == C ? 0 : 1, this;
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
    function li(u) {
      return this.__data__.has(u);
    }
    function ui(u, f) {
      var m = this.__data__;
      if (m instanceof X) {
        var C = m.__data__;
        if (!Ee || C.length < n - 1)
          return C.push([u, f]), this.size = ++m.size, this;
        m = this.__data__ = new rt(C);
      }
      return m.set(u, f), this.size = m.size, this;
    }
    ot.prototype.clear = oi, ot.prototype.delete = si, ot.prototype.get = ai, ot.prototype.has = li, ot.prototype.set = ui;
    function ci(u, f) {
      var m = re(u), C = !m && ie(u), M = !m && !C && Be(u), E = !m && !C && !M && Le(u), R = m || C || M || E, I = R ? In(u.length, String) : [], z = I.length;
      for (var H in u)
        R && // Safari 9 has enumerable `arguments.length` in strict mode.
        (H == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        M && (H == "offset" || H == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        E && (H == "buffer" || H == "byteLength" || H == "byteOffset") || // Skip index properties.
        ze(H, z)) || I.push(H);
      return I;
    }
    function Jt(u, f, m) {
      (m !== void 0 && !Ft(u[f], m) || m === void 0 && !(f in u)) && te(u, f, m);
    }
    function hi(u, f, m) {
      var C = u[f];
      (!(K.call(u, f) && Ft(C, m)) || m === void 0 && !(f in u)) && te(u, f, m);
    }
    function Nt(u, f) {
      for (var m = u.length; m--; )
        if (Ft(u[m][0], f))
          return m;
      return -1;
    }
    function te(u, f, m) {
      f == "__proto__" && Mt ? Mt(u, f, {
        configurable: !0,
        enumerable: !0,
        value: m,
        writable: !0
      }) : u[f] = m;
    }
    var fi = Ci();
    function kt(u) {
      return u == null ? u === void 0 ? k : _ : Z && Z in Object(u) ? Ai(u) : Fi(u);
    }
    function Oe(u) {
      return dt(u) && kt(u) == l;
    }
    function di(u) {
      if (!J(u) || ki(u))
        return !1;
      var f = se(u) ? Bn : Dn;
      return f.test(zi(u));
    }
    function gi(u) {
      return dt(u) && je(u.length) && !!O[kt(u)];
    }
    function pi(u) {
      if (!J(u))
        return Ii(u);
      var f = Pe(u), m = [];
      for (var C in u)
        C == "constructor" && (f || !K.call(u, C)) || m.push(C);
      return m;
    }
    function Re(u, f, m, C, M) {
      u !== f && fi(f, function(E, R) {
        if (M || (M = new ot()), J(E))
          yi(u, f, R, m, Re, C, M);
        else {
          var I = C ? C(ne(u, R), E, R + "", u, f, M) : void 0;
          I === void 0 && (I = E), Jt(u, R, I);
        }
      }, Ge);
    }
    function yi(u, f, m, C, M, E, R) {
      var I = ne(u, m), z = ne(f, m), H = R.get(z);
      if (H) {
        Jt(u, m, H);
        return;
      }
      var $ = E ? E(I, z, m + "", u, f, R) : void 0, gt = $ === void 0;
      if (gt) {
        var ae = re(z), le = !ae && Be(z), Ve = !ae && !le && Le(z);
        $ = z, ae || le || Ve ? re(I) ? $ = I : Pi(I) ? $ = bi(I) : le ? (gt = !1, $ = _i(z)) : Ve ? (gt = !1, $ = xi(z)) : $ = [] : Bi(z) || ie(z) ? ($ = I, ie(I) ? $ = ji(I) : (!J(I) || se(I)) && ($ = Di(z))) : gt = !1;
      }
      gt && (R.set(z, $), M($, z, C, E, R), R.delete(z)), Jt(u, m, $);
    }
    function mi(u, f) {
      return Oi(Ei(u, f, Ue), u + "");
    }
    var vi = Mt ? function(u, f) {
      return Mt(u, "toString", {
        configurable: !0,
        enumerable: !1,
        value: Gi(f),
        writable: !0
      });
    } : Ue;
    function _i(u, f) {
      return u.slice();
    }
    function wi(u) {
      var f = new u.constructor(u.byteLength);
      return new Ne(f).set(new Ne(u)), f;
    }
    function xi(u, f) {
      var m = wi(u.buffer);
      return new u.constructor(m, u.byteOffset, u.length);
    }
    function bi(u, f) {
      var m = -1, C = u.length;
      for (f || (f = Array(C)); ++m < C; )
        f[m] = u[m];
      return f;
    }
    function Si(u, f, m, C) {
      var M = !m;
      m || (m = {});
      for (var E = -1, R = f.length; ++E < R; ) {
        var I = f[E], z = void 0;
        z === void 0 && (z = u[I]), M ? te(m, I, z) : hi(m, I, z);
      }
      return m;
    }
    function Ti(u) {
      return mi(function(f, m) {
        var C = -1, M = m.length, E = M > 1 ? m[M - 1] : void 0, R = M > 2 ? m[2] : void 0;
        for (E = u.length > 3 && typeof E == "function" ? (M--, E) : void 0, R && Mi(m[0], m[1], R) && (E = M < 3 ? void 0 : E, M = 1), f = Object(f); ++C < M; ) {
          var I = m[C];
          I && u(f, I, C, E);
        }
        return f;
      });
    }
    function Ci(u) {
      return function(f, m, C) {
        for (var M = -1, E = Object(f), R = C(f), I = R.length; I--; ) {
          var z = R[++M];
          if (m(E[z], z, E) === !1)
            break;
        }
        return f;
      };
    }
    function It(u, f) {
      var m = u.__data__;
      return Ni(f) ? m[typeof f == "string" ? "string" : "hash"] : m.map;
    }
    function ee(u, f) {
      var m = En(u, f);
      return di(m) ? m : void 0;
    }
    function Ai(u) {
      var f = K.call(u, Z), m = u[Z];
      try {
        u[Z] = void 0;
        var C = !0;
      } catch {
      }
      var M = De.call(u);
      return C && (f ? u[Z] = m : delete u[Z]), M;
    }
    function Di(u) {
      return typeof u.constructor == "function" && !Pe(u) ? Vn(ke(u)) : {};
    }
    function ze(u, f) {
      var m = typeof u;
      return f = f ?? a, !!f && (m == "number" || m != "symbol" && Mn.test(u)) && u > -1 && u % 1 == 0 && u < f;
    }
    function Mi(u, f, m) {
      if (!J(m))
        return !1;
      var C = typeof f;
      return (C == "number" ? oe(m) && ze(f, m.length) : C == "string" && f in m) ? Ft(m[f], u) : !1;
    }
    function Ni(u) {
      var f = typeof u;
      return f == "string" || f == "number" || f == "symbol" || f == "boolean" ? u !== "__proto__" : u === null;
    }
    function ki(u) {
      return !!Ae && Ae in u;
    }
    function Pe(u) {
      var f = u && u.constructor, m = typeof f == "function" && f.prototype || Ct;
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
      return De.call(u);
    }
    function Ei(u, f, m) {
      return f = Fe(f === void 0 ? u.length - 1 : f, 0), function() {
        for (var C = arguments, M = -1, E = Fe(C.length - f, 0), R = Array(E); ++M < E; )
          R[M] = C[f + M];
        M = -1;
        for (var I = Array(f + 1); ++M < f; )
          I[M] = C[M];
        return I[f] = m(R), kn(u, this, I);
      };
    }
    function ne(u, f) {
      if (!(f === "constructor" && typeof u[f] == "function") && f != "__proto__")
        return u[f];
    }
    var Oi = Ri(vi);
    function Ri(u) {
      var f = 0, m = 0;
      return function() {
        var C = Un(), M = s - (C - m);
        if (m = C, M > 0) {
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
          return At.call(u);
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
    var ie = Oe(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Oe : function(u) {
      return dt(u) && K.call(u, "callee") && !jn.call(u, "callee");
    }, re = Array.isArray;
    function oe(u) {
      return u != null && je(u.length) && !se(u);
    }
    function Pi(u) {
      return dt(u) && oe(u);
    }
    var Be = Gn || Ui;
    function se(u) {
      if (!J(u))
        return !1;
      var f = kt(u);
      return f == g || f == b || f == o || f == S;
    }
    function je(u) {
      return typeof u == "number" && u > -1 && u % 1 == 0 && u <= a;
    }
    function J(u) {
      var f = typeof u;
      return u != null && (f == "object" || f == "function");
    }
    function dt(u) {
      return u != null && typeof u == "object";
    }
    function Bi(u) {
      if (!dt(u) || kt(u) != x)
        return !1;
      var f = ke(u);
      if (f === null)
        return !0;
      var m = K.call(f, "constructor") && f.constructor;
      return typeof m == "function" && m instanceof m && At.call(m) == Pn;
    }
    var Le = Ce ? Fn(Ce) : gi;
    function ji(u) {
      return Si(u, Ge(u));
    }
    function Ge(u) {
      return oe(u) ? ci(u) : pi(u);
    }
    var Li = Ti(function(u, f, m) {
      Re(u, f, m);
    });
    function Gi(u) {
      return function() {
        return u;
      };
    }
    function Ue(u) {
      return u;
    }
    function Ui() {
      return !1;
    }
    e.exports = Li;
  })(vt, vt.exports)), vt.exports;
}
var As = Cs();
const zt = /* @__PURE__ */ Ts(As);
function Ds(e) {
  var t = 0, n = e.children, i = n && n.length;
  if (!i) t = 1;
  else for (; --i >= 0; ) t += n[i].value;
  e.value = t;
}
function Ms() {
  return this.eachAfter(Ds);
}
function Ns(e, t) {
  let n = -1;
  for (const i of this)
    e.call(t, i, ++n, this);
  return this;
}
function ks(e, t) {
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
function Os(e) {
  return this.eachBefore(function(t) {
    t.children && t.children.sort(e);
  });
}
function Rs(e) {
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
function Ps() {
  for (var e = this, t = [e]; e = e.parent; )
    t.push(e);
  return t;
}
function Bs() {
  return Array.from(this);
}
function js() {
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
function* Gs() {
  var e = this, t, n = [e], i, r, s;
  do
    for (t = n.reverse(), n = []; e = t.pop(); )
      if (yield e, i = e.children)
        for (r = 0, s = i.length; r < s; ++r)
          n.push(i[r]);
  while (n.length);
}
function Xt(e, t) {
  e instanceof Map ? (e = [void 0, e], t === void 0 && (t = Ws)) : t === void 0 && (t = Vs);
  for (var n = new xt(e), i, r = [n], s, a, l, c; i = r.pop(); )
    if ((a = t(i.data)) && (c = (a = Array.from(a)).length))
      for (i.children = a, l = c - 1; l >= 0; --l)
        r.push(s = a[l] = new xt(a[l])), s.parent = i, s.depth = i.depth + 1;
  return n.eachBefore(qs);
}
function Us() {
  return Xt(this).eachBefore($s);
}
function Vs(e) {
  return e.children;
}
function Ws(e) {
  return Array.isArray(e) ? e[1] : null;
}
function $s(e) {
  e.data.value !== void 0 && (e.value = e.data.value), e.data = e.data.data;
}
function qs(e) {
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
  count: Ms,
  each: Ns,
  eachAfter: Is,
  eachBefore: ks,
  find: Fs,
  sum: Es,
  sort: Os,
  path: Rs,
  ancestors: Ps,
  descendants: Bs,
  leaves: js,
  links: Ls,
  copy: Us,
  [Symbol.iterator]: Gs
};
function Hs(e, t) {
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
function Pt(e, t) {
  this._ = e, this.parent = null, this.children = null, this.A = null, this.a = this, this.z = 0, this.m = 0, this.c = 0, this.s = 0, this.t = null, this.i = t;
}
Pt.prototype = Object.create(xt.prototype);
function Zs(e) {
  for (var t = new Pt(e, 0), n, i = [t], r, s, a, l; n = i.pop(); )
    if (s = n._.children)
      for (n.children = new Array(l = s.length), a = l - 1; a >= 0; --a)
        i.push(r = n.children[a] = new Pt(s[a], a)), r.parent = n;
  return (t.parent = new Pt(null, 0)).children = [t], t;
}
function Cn() {
  var e = Hs, t = 1, n = 1, i = null;
  function r(o) {
    var h = Zs(o);
    if (h.eachAfter(s), h.parent.m = -h.z, h.eachBefore(a), i) o.eachBefore(c);
    else {
      var w = o, d = o, g = o;
      o.eachBefore(function(x) {
        x.x < w.x && (w = x), x.x > d.x && (d = x), x.depth > g.depth && (g = x);
      });
      var b = w === d ? 1 : e(w, d) / 2, p = b - w.x, v = t / (d.x + b + p), _ = n / (g.depth || 1);
      o.eachBefore(function(x) {
        x.x = (x.x + p) * v, x.y = x.depth * _;
      });
    }
    return o;
  }
  function s(o) {
    var h = o.children, w = o.parent.children, d = o.i ? w[o.i - 1] : null;
    if (h) {
      Ks(o);
      var g = (h[0].z + h[h.length - 1].z) / 2;
      d ? (o.z = d.z + e(o._, d._), o.m = o.z - g) : o.z = g;
    } else d && (o.z = d.z + e(o._, d._));
    o.parent.A = l(o, d, o.parent.A || w[0]);
  }
  function a(o) {
    o._.x = o.z + o.parent.m, o.m += o.parent.m;
  }
  function l(o, h, w) {
    if (h) {
      for (var d = o, g = o, b = h, p = d.parent.children[0], v = d.m, _ = g.m, x = b.m, S = p.m, y; b = he(b), d = ce(d), b && d; )
        p = ce(p), g = he(g), g.a = o, y = b.z + x - d.z - v + e(b._, d._), y > 0 && (Xs(Ys(b, o, w), o, y), v += y, _ += y), x += b.m, v += d.m, S += p.m, _ += g.m;
      b && !he(g) && (g.t = b, g.m += x - _), d && !ce(p) && (p.t = d, p.m += v - S, w = o);
    }
    return w;
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
function Bt(e, t) {
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
    for (const w of n.get(c.id) ?? [])
      if (!o.has(w)) {
        o.add(w), h.add(w);
        const d = s(w, o);
        for (const g of d) h.add(g);
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
    let w = 0;
    for (const d of n.get(h.id))
      w = Math.max(w, 1 + (a.get(d.id) || 0));
    a.set(h.id, w);
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
    let w = 0;
    for (const d of n.get(h.id))
      w = Math.max(w, 1 + (a.get(d.id) ?? 0));
    a.set(h.id, w);
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
    if (Bt(s, a)) {
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
    const c = zt({}, fe, s), o = c.strength ?? 0.1, h = a.width, w = a.height, d = [h / 2, w / 2];
    if (Bt(t, n))
      return;
    const { levels: g } = l.buildLevelsStatic(t, n, void 0, c.rootIdAlgorithmFinder), { nodeById: b } = l.buildTreeStatic(t, n, c, a);
    if (c.radial) {
      const p = Ke(
        (v) => (g[v.id] ?? 1) * 100,
        d[0],
        d[1]
      ).strength(o);
      i.force("tree-radial", p);
    } else
      i.force("tree-y", Ze((p) => {
        var v, _;
        return c.horizontal ? ((v = b.get(p.id)) == null ? void 0 : v.x) ?? 0 : ((_ = b.get(p.id)) == null ? void 0 : _.y) ?? 0;
      }).strength(o)), i.force("tree-x", Ye((p) => {
        var v, _;
        return c.horizontal ? ((v = b.get(p.id)) == null ? void 0 : v.y) ?? 0 : ((_ = b.get(p.id)) == null ? void 0 : _.x) ?? 0;
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
    if (Bt(t, n))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const s = /* @__PURE__ */ new Map();
    for (const p of t) {
      const v = p;
      v.children = [], s.set(p.id, v);
    }
    for (const p of n) {
      const v = s.get(p.source.id), _ = s.get(p.target.id);
      v && _ && (v.children.push(_), _.parent = v);
    }
    const a = i.rootId || L.findRootId(t, n, i.rootIdAlgorithmFinder), l = s.get(a);
    if (!l)
      throw new Error(`Root node with id "${a}" not found.`);
    const c = i.radialGap, o = i.radial ? 2 * Math.PI : r.width, h = i.radial ? c : r.height, w = Cn();
    i.radial ? w.size([o, h]) : w.size([o, h]).separation((p, v) => {
      var x, S;
      const _ = ((S = (x = p.parent) == null ? void 0 : x.children) == null ? void 0 : S.length) ?? 1;
      return p.parent === v.parent ? 1.5 / _ : 1.5;
    });
    const d = Xt(l), g = w(d), b = /* @__PURE__ */ new Map();
    return g.descendants().forEach((p) => {
      b.set(p.data.id, p);
    }), {
      root: g,
      nodes: g.descendants(),
      nodeById: b
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
    for (const { source: d, target: g } of n)
      l[d.id].push(g.id);
    const c = [s];
    let o = 0;
    for (; o < c.length; ) {
      const d = c[o++], g = a[d];
      for (const b of l[d] || [])
        b in a || (a[b] = g + 1, c.push(b));
    }
    const h = Math.max(...Object.values(a)), w = {};
    for (const d of Object.values(a))
      w[d] = (w[d] || 0) + 1;
    return {
      levels: a,
      maxDepth: h,
      nodeCountPerLevel: w
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
    if (Bt(t, n))
      return console.warn("Cycle detected in graph. Tree layout will not be computed."), {
        root: null,
        nodes: [],
        nodeById: /* @__PURE__ */ new Map()
      };
    const s = /* @__PURE__ */ new Map();
    for (const p of t) {
      const v = p;
      v.children = [], s.set(p.id, v);
    }
    if (!i.rootId || !s.get(i.rootId))
      throw new Error("Ego Tree can only be created with a rootId");
    const a = i.rootId, l = s.get(a);
    if (l.children = [], !l)
      throw new Error(`Root node with id "${a}" not found.`);
    for (const p of n) {
      const v = s.get(p.source.id), _ = s.get(p.target.id);
      v && _ && (p.source.id === l.id ? (l.children.push(_), _.parent = l) : p.target.id === l.id && (l.children.push(v), v.parent = l));
    }
    const c = i.radialGap, o = i.radial ? 2 * Math.PI : r.width, h = i.radial ? c : r.height, w = Cn();
    i.radial ? w.size([o, h]) : w.size([o, h]).separation((p, v) => {
      var x, S;
      const _ = ((S = (x = p.parent) == null ? void 0 : x.children) == null ? void 0 : S.length) ?? 1;
      return p.parent === v.parent ? 1.5 / _ : 1.5;
    });
    const d = Xt(l), g = w(d), b = /* @__PURE__ */ new Map();
    return g.descendants().forEach((p) => {
      b.set(p.data.id, p);
    }), {
      root: g,
      nodes: g.descendants(),
      nodeById: b
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
  d3GravityStrengthConnected: 1e-3,
  enabled: !0,
  cooldownTime: 2e3,
  useWorker: !0,
  warmupTicks: "auto",
  freezeNodesOnDrag: !0,
  gridSnappingEnabled: !1,
  gridSize: 50,
  fitViewOnExpandCollapse: !1,
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
    T(this, "avgTickDuration", 0);
    T(this, "SLOW_TICK_THRESHOLD", 33);
    // ms of tick compute+render (≈30fps budget)
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
      charge: Dr(),
      collide: ur(),
      gravity: Mr()
      // clusterRadialConstraint: ForceClusterRadial(),
    }, r = Ar().force("link", i.link).force("charge", i.charge).force("collide", i.collide).force("gravity", i.gravity);
    return this.initSimulationForceGravity(i.gravity, t, n), this.initSimulationForceLink(i.link, t), this.initSimulationForceCharge(i.charge, t), this.initSimulationForceCollide(i.collide, t), r.alphaMin(t.d3AlphaMin), r.alphaDecay(t.d3AlphaDecay), r.alphaTarget(0), r.velocityDecay(t.d3VelocityDecay), {
      simulation: r,
      simulationForces: i
    };
  }
  static initSimulationForceGravity(t, n, i) {
    t.x(i.width / 2).y(i.height / 2).strength((r) => (r.degree() ?? 0) === 0 ? n.d3GravityStrength : n.d3GravityStrengthConnected);
  }
  static initSimulationForceLink(t, n) {
    t.distance((i) => {
      const r = i.__clusterAnchorDistance;
      if (r != null) return r;
      const s = ea(i);
      if (!s || s === "")
        return n.d3LinkDistance;
      const a = s.length * 10;
      return Math.max(n.d3LinkDistance, a);
    }), n.d3LinkStrength && t.strength(n.d3LinkStrength);
  }
  static initSimulationForceCharge(t, n) {
    t.theta(n.d3ManyBodyTheta).strength((i) => {
      const r = i, s = n.d3ManyBodyStrength, a = r.expanded ? r.getCircleRadiusCollapsed() : r.getCircleRadius(), l = 10 + Math.sqrt(Math.max(0, a - 10));
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
    const t = new Set(
      this.graph.getMutableNodes().filter((a) => a.visible).map((a) => a.id)
    ), n = (a) => {
      let l = a;
      for (; l && !t.has(l.id); ) l = l.parentNode;
      return l;
    }, i = (a, l) => a < l ? `${a}|${l}` : `${l}|${a}`, r = [], s = /* @__PURE__ */ new Set();
    for (const a of this.graph.getMutableEdges()) {
      if (!a.visible) continue;
      const l = a.source, c = a.target;
      if (!l.isChild && !c.isChild) {
        r.push(a), s.add(i(l.id, c.id));
        continue;
      }
      if (l.isChild && c.isChild) continue;
      const o = l.isChild ? c : l, h = n(l.isChild ? l : c);
      if (!h || h.id === o.id) continue;
      const w = i(o.id, h.id);
      s.has(w) || (s.add(w), r.push(this.clusterAnchorLink(o, h)));
    }
    return r;
  }
  /**
   * A force-only link tying an external node to an expanded cluster it connects
   * into. Not a real Edge — never rendered, never registered on the nodes — just
   * the `{source, target, distance}` the link force needs. Its distance is the
   * cluster radius (plus the base link distance) so the node rests outside the bubble.
   * @private
   */
  clusterAnchorLink(t, n) {
    return {
      id: `cluster-anchor-${t.id}-${n.id}`,
      source: t,
      target: n,
      __clusterAnchorDistance: n.getCircleRadius() + this.options.d3LinkDistance
    };
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
    this.startSimulationTime = (/* @__PURE__ */ new Date()).getTime(), this.engineRunning = !0, this.slowTickThresholdReached = !1;
  }
  /**
   * Start the simulation with rendering on each animation frame.
   */
  async start(t = !0) {
    if (t && await this.runSimulationWorkerRouter(), !this.options.enabled) {
      this.engineRunning = !1;
      return;
    }
    this.engineRunning = !0, this.slowTickThresholdReached = !1, this.callbacks.onStart && this.callbacks.onStart(this), this.animationFrameId === null && this.startAnimationLoop();
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
    if (this.engineRunning) {
      !this.dragInProgress && ((/* @__PURE__ */ new Date()).getTime() - this.startSimulationTime > this.options.cooldownTime || this.options.d3AlphaMin > 0 && this.simulation.alpha() < this.options.d3AlphaMin) && (this.engineRunning = !1, this.simulation.stop(), this.callbacks.onStop && this.callbacks.onStop(this)), this.totalTickCount++;
      const t = performance.now();
      this.simulation.tick(), this.graph.nextTick(), this.updateTickMetrics(performance.now() - t), this.callbacks.onTick && this.callbacks.onTick(this), this.graphInteraction.simulationTick(), this.totalTickCount % 10 === 0 && this.graphInteraction.simulationSlowTick();
    }
  }
  updateTickMetrics(t) {
    var n;
    this.avgTickDuration = this.avgTickDuration * 0.9 + t * 0.1, this.avgTickDuration > this.SLOW_TICK_THRESHOLD && (this.slowTickThresholdReached = !0, this.disable(), (n = this.graph.UIManager.graphControls) == null || n.updatePhysicSimulationIndicator(!1), this.graph.UIManager.showNotification({
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
  // Match computed positions to live nodes by id: the layout is handed a
  // different (and differently ordered) node set than the full node map, so
  // they can't be aligned by array index.
  applyComputedPositions(t) {
    const n = new Map(t.map((i) => [i.id, i]));
    for (const i of this.graph.getMutableNodes()) {
      const r = n.get(i.id);
      r && (i.x = r.x, i.y = r.y, i.fx = typeof r.fx == "number" ? r.fx : void 0, i.fy = typeof r.fy == "number" ? r.fy : void 0);
    }
  }
  async computeGraph(t = {}) {
    var h;
    const { runSimulation: n } = await Promise.resolve().then(() => ia), i = (h = this.canvas) == null ? void 0 : h.getBoundingClientRect();
    if (!i) return;
    const r = this.graph.getMutableNodes(), s = this.graph.getNodes(), a = this.graph.getEdges(), { callbacks: l, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: o } = n(
      s,
      a,
      c,
      i
    );
    this.applyComputedPositions(o), this.graph.updateData(r, void 0, !1);
  }
  async runSimulationWorkerRouter(t = {}) {
    if (this.options.useWorker)
      try {
        await this.runSimulationWorker(t);
        return;
      } catch (n) {
        this.options.useWorker = !1, console.warn(
          "[Pivotick] Simulation Web Worker unavailable (often a CSP blocking blob workers); falling back to the main thread. Set `simulation.useWorker: false` to silence this.",
          n
        );
      }
    await this.computeGraph(t), this.graph.updateLayoutProgress(100, 0, "done");
  }
  async runSimulationWorker(t = {}) {
    var h;
    const n = (h = this.canvas) == null ? void 0 : h.getBoundingClientRect();
    if (!n) return;
    const i = this.graph.getMutableNodes(), r = this.graph.getNodes().map((w) => w.toSimulationDTO()), s = this.graph.getEdges().map((w) => w.toSimulationDTO()), a = (w, d) => {
      this.graph.updateLayoutProgress(w, d, "simulation");
    }, { callbacks: l, ...c } = this.options;
    Object.assign(c, t);
    const { nodes: o } = await Ss(
      r,
      s,
      c,
      n,
      a
    );
    this.graph.updateLayoutProgress(100, 0, "rendering"), this.applyComputedPositions(o), this.graph.updateData(i, void 0, !1), this.graph.updateLayoutProgress(100, 0, "done");
  }
  /**
   * Restart the simulation with a bit of heat
   */
  reheat(t = 0.7) {
    this.restart(), this.simulation.alpha(t).restart();
  }
  /**
   * Re-read the node-dependent force accessors and reheat.
   *
   * d3-force caches per-node radius/strength when a force is initialised (i.e.
   * when nodes are set), not on every tick — so mutating a node's radius after
   * the sim is running has no effect until the forces are re-initialised.
   * Re-setting the nodes does that; the reheat then lets collision/charge
   * re-lay-out with the new sizes. Used when a custom node measures its size
   * after the initial layout has already cooled. No-op when disabled.
   */
  refreshForcesAndReheat(t = 0.5) {
    if (!this.options.enabled) return;
    const n = this.graph.getMutableNodes().filter((i) => i.visible);
    this.simulation.nodes(n), this.reheat(t);
  }
  /**
   * @private
   */
  createDragBehavior() {
    return ws().filter(() => !this.graph.editing.connectManager.isActiveAndNotIdle()).on("start.draggedelement", (t, n) => {
      this.graphInteraction.hasActiveMultiselection() ? this.dragSelection = this.graphInteraction.getSelectedNodes().map((i) => {
        const { node: r } = i;
        return r.freeze(), {
          node: r,
          dx: r.x - n.x,
          dy: r.y - n.y
        };
      }) : (this.dragSelection = [], n.freeze());
    }).on("drag.draggedelement", (t, n) => {
      if (!this.dragInProgress && this.isEnabled() && (this.dragInProgress = !0, this.restart(), this.simulation.alphaTarget(0.3).restart()), this.graphInteraction.hasActiveMultiselection())
        this.dragSelection.forEach(({ node: i, dx: r, dy: s }) => {
          const a = this.applySnap(t.x + r), l = this.applySnap(t.y + s);
          i.fx = a, i.fy = l, i.x = a, i.y = l;
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
  toggleFitViewOnExpandCollapse() {
    this.options.fitViewOnExpandCollapse = !this.options.fitViewOnExpandCollapse;
  }
  isFitViewOnExpandCollapse() {
    return this.options.fitViewOnExpandCollapse;
  }
  applySnap(t) {
    return this.options.gridSnappingEnabled ? Math.round(t / this.options.gridSize) * this.options.gridSize : t;
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
    this.layout && ((i = this.layout) == null || i.unregisterLayout(), this.layout = void 0), n = n ?? {}, n.layout = n.layout ?? {}, n.layout.type = t, t === "force" ? this.applyScalledSimulationOptions() : t === "tree" && (this.layout = new L(this.graph, this.simulation, this.simulationForces, n.layout)), this.options.layout.type = t, this.update(), this.pause(), await this.runSimulationWorkerRouter(n), this.restart(), await this.waitForSimulationStop(), this.graph.renderer.fitAndCenterWhenSettled();
  }
}
const An = 1e4, Vt = 2e4, Wt = 0.15 * Vt;
self.onmessage = (e) => {
  var p, v, _, x;
  if (e.data.source !== "simulation-worker-wrapper") return;
  const { nodes: t, edges: n, options: i, canvasBCR: r } = e.data, s = t.map((S) => {
    const y = new bn(S.id, S.data, S.style);
    return y.setCircleRadius(S._circleRadius ?? 10), typeof S.x == "number" && (y.x = S.x), typeof S.y == "number" && (y.y = S.y), typeof S.fx == "number" && (y.fx = S.fx), typeof S.fy == "number" && (y.fy = S.fy), y;
  }), a = new Map(s.map((S) => [S.id, S]));
  (p = i.layout) == null || p.type;
  const { simulation: l, simulationForces: c } = et.initSimulationForces(i, r), o = [];
  for (const S of n) {
    const y = a.get(S.from.id), A = a.get(S.to.id);
    if (y && A) {
      const D = S.style ?? {};
      o.push(new Ht(S.id, y, A, S.data, D, S.directed));
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
  ) : ((_ = i.layout) == null ? void 0 : _.type) === "egoTree" && L.registerForcesOnSimulation(
    s,
    o,
    l,
    c,
    i.layout,
    r,
    bt
  );
  let w = i.warmupTicks || Vt;
  w = w === "auto" ? Vt : w, w = w - Wt;
  let d = 0.3;
  l.alphaTarget(d);
  const g = (/* @__PURE__ */ new Date()).getTime();
  let b;
  for (let S = 0; S < w && !((/* @__PURE__ */ new Date()).getTime() - g > An || (/* @__PURE__ */ new Date()).getTime() - g > i.cooldownTime || $t(i, l, d) && (/* @__PURE__ */ new Date()).getTime() - g > i.cooldownTime * 0.15); ++S)
    S % 5 === 0 && (b = rn(S, (/* @__PURE__ */ new Date()).getTime() - g, i), postMessage({ type: "tick", progress: b, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - g })), l.tick();
  d = 0, l.alphaTarget(d), l.alpha(1);
  for (let S = 0; S < Wt && !($t(i, l, d) && (/* @__PURE__ */ new Date()).getTime() - g > i.cooldownTime * 0.15); ++S)
    l.tick(), S % 5 === 0 && (b = rn(w + S, (/* @__PURE__ */ new Date()).getTime() - g, i), postMessage({ type: "tick", progress: b, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - g }));
  postMessage({ type: "tick", progress: 1, elapsedTime: (/* @__PURE__ */ new Date()).getTime() - g }), ((x = i.layout) == null ? void 0 : x.type) === "tree" && L.simulationDone(
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
  var g, b, p, v;
  const r = e.map((_) => {
    const x = new bn(_.id, _.getData(), _.getStyle());
    return x.weight = _.weight || 1, x.setCircleRadius(_.getCircleRadius()), typeof _.x == "number" && (x.x = _.x), typeof _.y == "number" && (x.y = _.y), typeof _.fx == "number" && (x.fx = _.fx), typeof _.fy == "number" && (x.fy = _.fy), x;
  }), s = new Map(r.map((_) => [_.id, _]));
  (g = n.layout) == null || g.type;
  const { simulation: a, simulationForces: l } = et.initSimulationForces(n, i), c = [];
  for (const _ of t) {
    const x = s.get(_.from.id), S = s.get(_.to.id);
    if (x && S) {
      const y = _.getStyle() ?? {};
      c.push(new Ht(_.id, x, S, _.getData(), y, _.directed));
    }
  }
  a.nodes(r);
  const o = a.force("link");
  o && o.id((_) => _.id).links(c), (((b = n.layout) == null ? void 0 : b.type) === "tree" || ((p = n.layout) == null ? void 0 : p.type) === "egoTree") && L.registerForcesOnSimulation(
    r,
    c,
    a,
    l,
    n.layout,
    i,
    L
  );
  let h;
  n.warmupTicks === "auto" || n.warmupTicks == null ? h = Vt : h = n.warmupTicks, h = h - Wt;
  let w = 0.3;
  a.alphaTarget(w);
  const d = (/* @__PURE__ */ new Date()).getTime();
  for (let _ = 0; _ < h && !((/* @__PURE__ */ new Date()).getTime() - d > An || (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime || $t(n, a, w) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++_)
    a.tick();
  w = 0, a.alphaTarget(w), a.alpha(1);
  for (let _ = 0; _ < Wt && !($t(n, a, w) && (/* @__PURE__ */ new Date()).getTime() - d > n.cooldownTime * 0.15); ++_)
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
function $t(e, t, n) {
  return e.d3AlphaMin > 0 && t.alpha() - n < e.d3AlphaMin;
}
const ia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  runSimulation: na
}, Symbol.toStringTag, { value: "Module" }));
export {
  na as runSimulation
};
