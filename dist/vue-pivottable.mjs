const Cn = function(t, n, r) {
  const e = String(t).split(".");
  let i = e[0];
  const o = e.length > 1 ? r + e[1] : "", a = /(\d+)(\d{3})/;
  for (; a.test(i); )
    i = i.replace(a, `$1${n}$2`);
  return i + o;
}, Oe = function(t) {
  const r = Object.assign({}, {
    digitsAfterDecimal: 2,
    scaler: 1,
    thousandsSep: ",",
    decimalSep: ".",
    prefix: "",
    suffix: ""
  }, t);
  return function(e) {
    if (isNaN(e) || !isFinite(e))
      return "";
    const i = Cn(
      (r.scaler * e).toFixed(r.digitsAfterDecimal),
      r.thousandsSep,
      r.decimalSep
    );
    return `${r.prefix}${i}${r.suffix}`;
  };
}, Qe = /(\d+)|(\D+)/g, oe = /\d/, qe = /^0/, Rt = (t, n) => {
  if (n !== null && t === null)
    return -1;
  if (t !== null && n === null)
    return 1;
  if (typeof t == "number" && isNaN(t))
    return -1;
  if (typeof n == "number" && isNaN(n))
    return 1;
  const r = Number(t), e = Number(n);
  if (r < e)
    return -1;
  if (r > e)
    return 1;
  if (typeof t == "number" && typeof n != "number")
    return -1;
  if (typeof n == "number" && typeof t != "number")
    return 1;
  if (typeof t == "number" && typeof n == "number")
    return 0;
  if (isNaN(e) && !isNaN(r))
    return -1;
  if (isNaN(r) && !isNaN(e))
    return 1;
  let i = String(t), o = String(n);
  if (i === o)
    return 0;
  if (!oe.test(i) || !oe.test(o))
    return i > o ? 1 : -1;
  for (i = i.match(Qe), o = o.match(Qe); i.length && o.length; ) {
    const a = i.shift(), s = o.shift();
    if (a !== s)
      return oe.test(a) && oe.test(s) ? a.replace(qe, ".0") - s.replace(qe, ".0") : a > s ? 1 : -1;
  }
  return i.length - o.length;
}, cn = function(t) {
  const n = {}, r = {};
  for (const e in t) {
    const i = t[e];
    n[i] = e, typeof i == "string" && (r[i.toLowerCase()] = e);
  }
  return function(e, i) {
    return e in n && i in n ? n[e] - n[i] : e in n ? -1 : i in n ? 1 : e in r && i in r ? r[e] - r[i] : e in r ? -1 : i in r ? 1 : Rt(e, i);
  };
}, De = function(t, n) {
  if (t) {
    if (typeof t == "function") {
      const r = t(n);
      if (typeof r == "function")
        return r;
    } else if (n in t)
      return t[n];
  }
  return Rt;
}, V = Oe(), Ot = Oe({ digitsAfterDecimal: 0 }), at = Oe({
  digitsAfterDecimal: 1,
  scaler: 100,
  suffix: "%"
}), Y = {
  count(t = Ot) {
    return () => function() {
      return {
        count: 0,
        push() {
          this.count++;
        },
        value() {
          return this.count;
        },
        format: t
      };
    };
  },
  uniques(t, n = Ot) {
    return function([r]) {
      return function() {
        return {
          uniq: [],
          push(e) {
            Array.from(this.uniq).includes(e[r]) || this.uniq.push(e[r]);
          },
          value() {
            return t(this.uniq);
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  sum(t = V) {
    return function([n]) {
      return function() {
        return {
          sum: 0,
          push(r) {
            isNaN(parseFloat(r[n])) || (this.sum += parseFloat(r[n]));
          },
          value() {
            return this.sum;
          },
          format: t,
          numInputs: typeof n < "u" ? 0 : 1
        };
      };
    };
  },
  extremes(t, n = V) {
    return function([r]) {
      return function(e) {
        return {
          val: null,
          sorter: De(typeof e < "u" ? e.sorters : null, r),
          push(i) {
            let o = i[r];
            ["min", "max"].includes(t) && (o = parseFloat(o), isNaN(o) || (this.val = Math[t](o, this.val !== null ? this.val : o))), t === "first" && this.sorter(o, this.val !== null ? this.val : o) <= 0 && (this.val = o), t === "last" && this.sorter(o, this.val !== null ? this.val : o) >= 0 && (this.val = o);
          },
          value() {
            return this.val;
          },
          format(i) {
            return isNaN(i) ? i : n(i);
          },
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  quantile(t, n = V) {
    return function([r]) {
      return function() {
        return {
          vals: [],
          push(e) {
            const i = parseFloat(e[r]);
            isNaN(i) || this.vals.push(i);
          },
          value() {
            if (this.vals.length === 0)
              return null;
            this.vals.sort((i, o) => i - o);
            const e = (this.vals.length - 1) * t;
            return (this.vals[Math.floor(e)] + this.vals[Math.ceil(e)]) / 2;
          },
          format: n,
          numInputs: typeof r < "u" ? 0 : 1
        };
      };
    };
  },
  runningStat(t = "mean", n = 1, r = V) {
    return function([e]) {
      return function() {
        return {
          n: 0,
          m: 0,
          s: 0,
          push(i) {
            const o = parseFloat(i[e]);
            if (isNaN(o))
              return;
            this.n += 1, this.n === 1 && (this.m = o);
            const a = this.m + (o - this.m) / this.n;
            this.s = this.s + (o - this.m) * (o - a), this.m = a;
          },
          value() {
            if (t === "mean")
              return this.n === 0 ? 0 / 0 : this.m;
            if (this.n <= n)
              return 0;
            switch (t) {
              case "var":
                return this.s / (this.n - n);
              case "stdev":
                return Math.sqrt(this.s / (this.n - n));
              default:
                throw new Error("unknown mode for runningStat");
            }
          },
          format: r,
          numInputs: typeof e < "u" ? 0 : 1
        };
      };
    };
  },
  sumOverSum(t = V) {
    return function([n, r]) {
      return function() {
        return {
          sumNum: 0,
          sumDenom: 0,
          push(e) {
            isNaN(parseFloat(e[n])) || (this.sumNum += parseFloat(e[n])), isNaN(parseFloat(e[r])) || (this.sumDenom += parseFloat(e[r]));
          },
          value() {
            return this.sumNum / this.sumDenom;
          },
          format: t,
          numInputs: typeof n < "u" && typeof r < "u" ? 0 : 2
        };
      };
    };
  },
  fractionOf(t, n = "total", r = at) {
    return (...e) => function(i, o, a) {
      return {
        selector: { total: [[], []], row: [o, []], col: [[], a] }[n],
        inner: t(...Array.from(e || []))(i, o, a),
        push(s) {
          this.inner.push(s);
        },
        format: r,
        value() {
          return this.inner.value() / i.getAggregator(...Array.from(this.selector || [])).inner.value();
        },
        numInputs: t(...Array.from(e || []))().numInputs
      };
    };
  }
};
Y.countUnique = (t) => Y.uniques((n) => n.length, t);
Y.listUnique = (t) => Y.uniques(
  (n) => n.join(t),
  (n) => n
);
Y.max = (t) => Y.extremes("max", t);
Y.min = (t) => Y.extremes("min", t);
Y.first = (t) => Y.extremes("first", t);
Y.last = (t) => Y.extremes("last", t);
Y.median = (t) => Y.quantile(0.5, t);
Y.average = (t) => Y.runningStat("mean", 1, t);
Y.var = (t, n) => Y.runningStat("var", t, n);
Y.stdev = (t, n) => Y.runningStat("stdev", t, n);
const te = ((t) => ({
  Count: t.count(Ot),
  "Count Unique Values": t.countUnique(Ot),
  "List Unique Values": t.listUnique(", "),
  Sum: t.sum(V),
  "Integer Sum": t.sum(Ot),
  Average: t.average(V),
  Median: t.median(V),
  "Sample Variance": t.var(1, V),
  "Sample Standard Deviation": t.stdev(1, V),
  Minimum: t.min(V),
  Maximum: t.max(V),
  First: t.first(V),
  Last: t.last(V),
  "Sum over Sum": t.sumOverSum(V),
  "Sum as Fraction of Total": t.fractionOf(t.sum(), "total", at),
  "Sum as Fraction of Rows": t.fractionOf(t.sum(), "row", at),
  "Sum as Fraction of Columns": t.fractionOf(t.sum(), "col", at),
  "Count as Fraction of Total": t.fractionOf(t.count(), "total", at),
  "Count as Fraction of Rows": t.fractionOf(t.count(), "row", at),
  "Count as Fraction of Columns": t.fractionOf(t.count(), "col", at)
}))(Y), wn = ((t) => ({
  Compte: t.count(Ot),
  "Compter les valeurs uniques": t.countUnique(Ot),
  "Liste des valeurs uniques": t.listUnique(", "),
  Somme: t.sum(V),
  "Somme de nombres entiers": t.sum(Ot),
  Moyenne: t.average(V),
  Médiane: t.median(V),
  "Variance de l'échantillon": t.var(1, V),
  "Écart-type de l'échantillon": t.stdev(1, V),
  Minimum: t.min(V),
  Maximum: t.max(V),
  Premier: t.first(V),
  Dernier: t.last(V),
  "Somme Total": t.sumOverSum(V),
  "Somme en fraction du total": t.fractionOf(t.sum(), "total", at),
  "Somme en tant que fraction de lignes": t.fractionOf(
    t.sum(),
    "row",
    at
  ),
  "Somme en tant que fraction de colonnes": t.fractionOf(
    t.sum(),
    "col",
    at
  ),
  "Comptage en tant que fraction du total": t.fractionOf(
    t.count(),
    "total",
    at
  ),
  "Comptage en tant que fraction de lignes": t.fractionOf(
    t.count(),
    "row",
    at
  ),
  "Comptage en tant que fraction de colonnes": t.fractionOf(
    t.count(),
    "col",
    at
  )
}))(Y), En = ((t) => ({
  频数: t.count(Ot),
  非重复值的个数: t.countUnique(Ot),
  列出非重复值: t.listUnique(", "),
  求和: t.sum(V),
  求和后取整: t.sum(Ot),
  平均值: t.average(V),
  中位数: t.median(V),
  方差: t.var(1, V),
  样本标准偏差: t.stdev(1, V),
  最小值: t.min(V),
  最大值: t.max(V),
  第一: t.first(V),
  最后: t.last(V),
  两和之比: t.sumOverSum(V),
  和在总计中的比例: t.fractionOf(t.sum(), "total", at),
  和在行合计中的比例: t.fractionOf(t.sum(), "row", at),
  和在列合计中的比例: t.fractionOf(t.sum(), "col", at),
  频数在总计中的比例: t.fractionOf(t.count(), "total", at),
  频数在行合计中的比例: t.fractionOf(t.count(), "row", at),
  频数在列合计中的比例: t.fractionOf(t.count(), "col", at)
}))(Y), We = {
  en: {
    aggregators: te,
    localeStrings: {
      renderError: "An error occurred rendering the PivotTable results.",
      computeError: "An error occurred computing the PivotTable results.",
      uiRenderError: "An error occurred rendering the PivotTable UI.",
      selectAll: "Select All",
      selectNone: "Select None",
      tooMany: "(too many to list)",
      filterResults: "Filter values",
      totals: "Totals",
      vs: "vs",
      by: "by",
      cancel: "Cancel",
      only: "only"
    }
  },
  fr: {
    compareAggregators: {
      Compte: "Count",
      "Compter les valeurs uniques": "Count Unique Values",
      "Liste des valeurs uniques": "List Unique Values",
      Somme: "Sum",
      "Somme de nombres entiers": "Integer Sum",
      Moyenne: "Average",
      Médiane: "Median",
      "Variance de l'échantillon": "Sample Variance",
      "Écart-type de l'échantillon": "Sample Standard Deviation",
      Minimum: "Minimum",
      Maximum: "Maximum",
      Premier: "First",
      Dernier: "Last",
      "Somme Total": "Sum over Sum",
      "Somme en fraction du total": "Sum as Fraction of Total",
      "Somme en tant que fraction de lignes": "Sum as Fraction of Rows",
      "Somme en tant que fraction de colonnes": "Sum as Fraction of Columns",
      "Comptage en tant que fraction du total": "Count as Fraction of Total",
      "Comptage en tant que fraction de lignes": "Count as Fraction of Rows",
      "Comptage en tant que fraction de colonnes": "Count as Fraction of Columns"
    },
    aggregators: wn,
    localeStrings: {
      renderError: "Une erreur est survenue en dessinant le tableau croisé.",
      computeError: "Une erreur est survenue en calculant le tableau croisé.",
      uiRenderError: "Une erreur est survenue en dessinant l'interface du tableau croisé dynamique.",
      selectAll: "Sélectionner tout",
      selectNone: "Ne rien sélectionner",
      tooMany: "(trop de valeurs à afficher)",
      filterResults: "Filtrer les valeurs",
      totals: "Totaux",
      vs: "sur",
      by: "par",
      apply: "Appliquer",
      cancel: "Annuler",
      only: "seul"
    }
  },
  zh: {
    compareAggregators: {
      频数: "Count",
      非重复值的个数: "Count Unique Values",
      列出非重复值: "List Unique Values",
      求和: "Sum",
      求和后取整: "Integer Sum",
      平均值: "Average",
      中位数: "Median",
      方差: "Sample Variance",
      样本标准偏差: "Sample Standard Deviation",
      最小值: "Minimum",
      最大值: "Maximum",
      第一: "First",
      最后: "Last",
      两和之比: "Sum over Sum",
      和在总计中的比例: "Sum as Fraction of Total",
      和在行合计中的比例: "Sum as Fraction of Rows",
      和在列合计中的比例: "Sum as Fraction of Columns",
      频数在总计中的比例: "Count as Fraction of Total",
      频数在行合计中的比例: "Count as Fraction of Rows",
      频数在列合计中的比例: "Count as Fraction of Columns"
    },
    aggregators: En,
    localeStrings: {
      renderError: "展示结果时出错。",
      computeError: "计算结果时出错。",
      uiRenderError: "展示界面时出错。",
      selectAll: "选择全部",
      selectNone: "全部不选",
      tooMany: "(因数据过多而无法列出)",
      filterResults: "输入值帮助筛选",
      totals: "合计",
      vs: "于",
      by: "分组于"
    }
  }
}, Tn = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
], An = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], zt = (t) => `0${t}`.substr(-2, 2), In = {
  bin(t, n) {
    return (r) => r[t] - r[t] % n;
  },
  dateFormat(t, n, r = !1, e = Tn, i = An) {
    const o = r ? "UTC" : "";
    return function(a) {
      const s = new Date(Date.parse(a[t]));
      return isNaN(s) ? "" : n.replace(/%(.)/g, function(l, u) {
        switch (u) {
          case "y":
            return s[`get${o}FullYear`]();
          case "m":
            return zt(s[`get${o}Month`]() + 1);
          case "n":
            return e[s[`get${o}Month`]()];
          case "d":
            return zt(s[`get${o}Date`]());
          case "w":
            return i[s[`get${o}Day`]()];
          case "x":
            return s[`get${o}Day`]();
          case "H":
            return zt(s[`get${o}Hours`]());
          case "M":
            return zt(s[`get${o}Minutes`]());
          case "S":
            return zt(s[`get${o}Seconds`]());
          default:
            return `%${u}`;
        }
      });
    };
  }
};
class Dt {
  constructor(n = {}) {
    this.props = Object.assign({}, Dt.defaultProps, n), this.aggregator = this.props.aggregators[this.props.aggregatorName](
      this.props.vals
    ), this.tree = {}, this.rowKeys = [], this.colKeys = [], this.rowTotals = {}, this.colTotals = {}, this.allTotal = this.aggregator(this, [], []), this.sorted = !1, this.filteredData = [], Dt.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (r) => {
        this.filter(r) && (this.filteredData.push(r), this.processRecord(r));
      }
    );
  }
  filter(n) {
    for (const r in this.props.valueFilter)
      if (n[r] in this.props.valueFilter[r])
        return !1;
    return !0;
  }
  forEachMatchingRecord(n, r) {
    return Dt.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      (e) => {
        if (this.filter(e)) {
          for (const i in n)
            if (n[i] !== (i in e ? e[i] : "null"))
              return;
          r(e);
        }
      }
    );
  }
  arrSort(n) {
    let r;
    const e = (() => {
      const i = [];
      for (r of Array.from(n))
        i.push(De(this.props.sorters, r));
      return i;
    })();
    return function(i, o) {
      for (const a of Object.keys(e || {})) {
        const s = e[a], l = s(i[a], o[a]);
        if (l !== 0)
          return l;
      }
      return 0;
    };
  }
  sortKeys() {
    if (!this.sorted) {
      this.sorted = !0;
      const n = (r, e) => this.getAggregator(r, e).value();
      switch (this.props.rowOrder) {
        case "value_a_to_z":
          this.rowKeys.sort((r, e) => Rt(n(r, []), n(e, [])));
          break;
        case "value_z_to_a":
          this.rowKeys.sort((r, e) => -Rt(n(r, []), n(e, [])));
          break;
        default:
          this.rowKeys.sort(this.arrSort(this.props.rows));
      }
      switch (this.props.colOrder) {
        case "value_a_to_z":
          this.colKeys.sort((r, e) => Rt(n([], r), n([], e)));
          break;
        case "value_z_to_a":
          this.colKeys.sort((r, e) => -Rt(n([], r), n([], e)));
          break;
        default:
          this.colKeys.sort(this.arrSort(this.props.cols));
      }
    }
  }
  getFilteredData() {
    return this.filteredData;
  }
  getColKeys() {
    return this.sortKeys(), this.colKeys;
  }
  getRowKeys() {
    return this.sortKeys(), this.rowKeys;
  }
  processRecord(n) {
    const r = [], e = [];
    for (const a of Array.from(this.props.cols))
      r.push(a in n ? n[a] : "null");
    for (const a of Array.from(this.props.rows))
      e.push(a in n ? n[a] : "null");
    const i = e.join(String.fromCharCode(0)), o = r.join(String.fromCharCode(0));
    this.allTotal.push(n), e.length !== 0 && (this.rowTotals[i] || (this.rowKeys.push(e), this.rowTotals[i] = this.aggregator(this, e, [])), this.rowTotals[i].push(n)), r.length !== 0 && (this.colTotals[o] || (this.colKeys.push(r), this.colTotals[o] = this.aggregator(this, [], r)), this.colTotals[o].push(n)), r.length !== 0 && e.length !== 0 && (this.tree[i] || (this.tree[i] = {}), this.tree[i][o] || (this.tree[i][o] = this.aggregator(this, e, r)), this.tree[i][o].push(n));
  }
  getAggregator(n, r) {
    let e;
    const i = n.join(String.fromCharCode(0)), o = r.join(String.fromCharCode(0));
    return n.length === 0 && r.length === 0 ? e = this.allTotal : n.length === 0 ? e = this.colTotals[o] : r.length === 0 ? e = this.rowTotals[i] : e = this.tree[i][o], e || {
      value() {
        return null;
      },
      format() {
        return "";
      }
    };
  }
}
Dt.forEachRecord = function(t, n, r) {
  let e, i;
  if (Object.getOwnPropertyNames(n).length === 0 ? e = r : e = function(o) {
    for (const a in n) {
      const s = n[a](o);
      s !== null && (o[a] = s);
    }
    return r(o);
  }, typeof t == "function")
    return t(e);
  if (Array.isArray(t))
    return Array.isArray(t[0]) ? (() => {
      const o = [];
      for (const a of Object.keys(t || {})) {
        const s = t[a];
        if (a > 0) {
          i = {};
          for (const l of Object.keys(t[0] || {})) {
            const u = t[0][l];
            i[u] = s[l];
          }
          o.push(e(i));
        }
      }
      return o;
    })() : (() => {
      const o = [];
      for (i of Array.from(t))
        o.push(e(i));
      return o;
    })();
  throw new Error("unknown input format");
};
Dt.defaultProps = {
  aggregators: te,
  locales: We,
  cols: [],
  rows: [],
  vals: [],
  aggregatorName: "Count",
  sorters: {},
  valueFilter: {},
  rowOrder: "key_a_to_z",
  colOrder: "key_a_to_z",
  derivedAttributes: {}
};
const Ce = {
  props: {
    data: {
      type: [Array, Object, Function],
      required: !0
    },
    aggregators: {
      type: Object,
      default: function() {
        return te;
      }
    },
    aggregatorName: {
      type: String,
      default: "Count"
    },
    heatmapMode: String,
    tableColorScaleGenerator: {
      type: Function
    },
    tableOptions: {
      type: Object,
      default: function() {
        return {};
      }
    },
    renderers: Object,
    rendererName: {
      type: String,
      default: "Table"
    },
    locale: {
      type: String,
      default: "en"
    },
    locales: {
      type: Object,
      default: function() {
        return We;
      }
    },
    rowTotal: {
      type: Boolean,
      default: !0
    },
    colTotal: {
      type: Boolean,
      default: !0
    },
    cols: {
      type: Array,
      default: function() {
        return [];
      }
    },
    rows: {
      type: Array,
      default: function() {
        return [];
      }
    },
    vals: {
      type: Array,
      default: function() {
        return [];
      }
    },
    attributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorters: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    derivedAttributes: {
      type: [Function, Object],
      default: function() {
        return {};
      }
    },
    rowOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(t) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(t) !== -1;
      }
    },
    colOrder: {
      type: String,
      default: "key_a_to_z",
      validator: function(t) {
        return ["key_a_to_z", "value_a_to_z", "value_z_to_a"].indexOf(t) !== -1;
      }
    },
    tableMaxWidth: {
      type: Number,
      default: 0,
      validator: function(t) {
        return t >= 0;
      }
    },
    colLimit: {
      type: Number,
      default: 100
    },
    rowLimit: {
      type: Number,
      default: 100
    }
  },
  methods: {
    renderError(t) {
      return t("span", this.locales[this.locale].localeStrings.renderError || "An error occurred rendering the PivotTable results.");
    },
    computeError(t) {
      return t("span", this.locales[this.locale].localeStrings.computeError || "An error occurred computing the PivotTable results.");
    },
    uiRenderError(t) {
      return t("span", this.locales[this.locale].localeStrings.uiRenderError || "An error occurred rendering the PivotTable UI.");
    }
  }
};
function Fn(t) {
  const n = Math.min.apply(Math, t), r = Math.max.apply(Math, t);
  return (e) => {
    const i = 255 - Math.round(255 * (e - n) / (r - n));
    return { backgroundColor: `rgb(255,${i},${i})` };
  };
}
function ie(t = {}) {
  return {
    name: t.name,
    mixins: [
      Ce
    ],
    props: {
      heatmapMode: String,
      tableColorScaleGenerator: {
        type: Function,
        default: Fn
      },
      tableOptions: {
        type: Object,
        default: function() {
          return {
            clickCallback: null
          };
        }
      },
      localeStrings: {
        type: Object,
        default: function() {
          return {
            totals: "Totals"
          };
        }
      }
    },
    methods: {
      spanSize(r, e, i) {
        let o;
        if (e !== 0) {
          let s, l, u = !0;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[e - 1][o] !== r[e][o] && (u = !1);
          if (u)
            return -1;
        }
        let a = 0;
        for (; e + a < r.length; ) {
          let s, l, u = !1;
          for (o = 0, l = i, s = l >= 0; s ? o <= l : o >= l; s ? o++ : o--)
            r[e][o] !== r[e + a][o] && (u = !0);
          if (u)
            break;
          a++;
        }
        return a;
      }
    },
    render(r) {
      let e = null;
      try {
        const g = Object.assign(
          {},
          this.$props,
          this.$attrs.props
        );
        e = new Dt(g);
      } catch (g) {
        if (console && console.error(g.stack))
          return this.computeError(r);
      }
      const i = e.props.cols, o = e.props.rows, a = e.getRowKeys(), s = e.getColKeys(), l = e.getAggregator([], []);
      let u = () => {
      }, c = () => {
      }, f = () => {
      };
      if (t.heatmapMode) {
        const g = this.tableColorScaleGenerator, h = s.map(
          (v) => e.getAggregator([], v).value()
        );
        c = g(h);
        const d = a.map(
          (v) => e.getAggregator(v, []).value()
        );
        if (f = g(d), t.heatmapMode === "full") {
          const v = [];
          a.map(
            (D) => s.map(
              (O) => v.push(e.getAggregator(D, O).value())
            )
          );
          const x = g(v);
          u = (D, O, E) => x(E);
        } else if (t.heatmapMode === "row") {
          const v = {};
          a.map((x) => {
            const D = s.map(
              (O) => e.getAggregator(x, O).value()
            );
            v[x] = g(D);
          }), u = (x, D, O) => v[x](O);
        } else if (t.heatmapMode === "col") {
          const v = {};
          s.map((x) => {
            const D = a.map(
              (O) => e.getAggregator(O, x).value()
            );
            v[x] = g(D);
          }), u = (x, D, O) => v[D](O);
        }
      }
      const p = (g, h, d) => {
        const v = this.tableOptions;
        if (v && v.clickCallback) {
          const x = {};
          let D = {};
          for (let O in i)
            d.hasOwnProperty(O) && (D = i[O], d[O] !== null && (x[D] = d[O]));
          for (let O in o)
            h.hasOwnProperty(O) && (D = o[O], h[O] !== null && (x[D] = h[O]));
          return (O) => v.clickCallback(O, g, x, e);
        }
      };
      return r("table", {
        staticClass: ["pvtTable"]
      }, [
        r(
          "thead",
          [
            i.map((g, h) => r(
              "tr",
              {
                attrs: {
                  key: `colAttrs${h}`
                }
              },
              [
                h === 0 && o.length !== 0 ? r("th", {
                  attrs: {
                    colSpan: o.length,
                    rowSpan: i.length
                  }
                }) : void 0,
                r("th", {
                  staticClass: ["pvtAxisLabel"]
                }, g),
                s.map((d, v) => {
                  const x = this.spanSize(s, v, h);
                  return x === -1 ? null : r("th", {
                    staticClass: ["pvtColLabel"],
                    attrs: {
                      key: `colKey${v}`,
                      colSpan: x,
                      rowSpan: h === i.length - 1 && o.length !== 0 ? 2 : 1
                    }
                  }, d[h]);
                }),
                h === 0 && this.rowTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    rowSpan: i.length + (o.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0
              ]
            )),
            o.length !== 0 ? r(
              "tr",
              [
                o.map((g, h) => r("th", {
                  staticClass: ["pvtAxisLabel"],
                  attrs: {
                    key: `rowAttr${h}`
                  }
                }, g)),
                this.rowTotal ? r("th", { staticClass: ["pvtTotalLabel"] }, i.length === 0 ? this.localeStrings.totals : null) : i.length === 0 ? void 0 : r("th", { staticClass: ["pvtTotalLabel"] }, null)
              ]
            ) : void 0
          ]
        ),
        r(
          "tbody",
          [
            a.map((g, h) => {
              const d = e.getAggregator(g, []);
              return r(
                "tr",
                {
                  attrs: {
                    key: `rowKeyRow${h}`
                  }
                },
                [
                  g.map((v, x) => {
                    const D = this.spanSize(a, h, x);
                    return D === -1 ? null : r("th", {
                      staticClass: ["pvtRowLabel"],
                      attrs: {
                        key: `rowKeyLabel${h}-${x}`,
                        rowSpan: D,
                        colSpan: x === o.length - 1 && i.length !== 0 ? 2 : 1
                      }
                    }, v);
                  }),
                  s.map((v, x) => {
                    const D = e.getAggregator(g, v);
                    return r("td", {
                      staticClass: ["pvVal"],
                      style: u(g, v, D.value()),
                      attrs: {
                        key: `pvtVal${h}-${x}`
                      },
                      on: this.tableOptions.clickCallback ? {
                        click: p(D.value(), g, v)
                      } : {}
                    }, D.format(D.value()));
                  }),
                  this.rowTotal ? r("td", {
                    staticClass: ["pvtTotal"],
                    style: f(d.value()),
                    on: this.tableOptions.clickCallback ? {
                      click: p(d.value(), g, [])
                    } : {}
                  }, d.format(d.value())) : void 0
                ]
              );
            }),
            r(
              "tr",
              [
                this.colTotal ? r("th", {
                  staticClass: ["pvtTotalLabel"],
                  attrs: {
                    colSpan: o.length + (i.length === 0 ? 0 : 1)
                  }
                }, this.localeStrings.totals) : void 0,
                this.colTotal ? s.map((g, h) => {
                  const d = e.getAggregator([], g);
                  return r("td", {
                    staticClass: ["pvtTotal"],
                    style: c(d.value()),
                    attrs: {
                      key: `total${h}`
                    },
                    on: this.tableOptions.clickCallback ? {
                      click: p(d.value(), [], g)
                    } : {}
                  }, d.format(d.value()));
                }) : void 0,
                this.colTotal && this.rowTotal ? r("td", {
                  staticClass: ["pvtGrandTotal"],
                  on: this.tableOptions.clickCallback ? {
                    click: p(l.value(), [], [])
                  } : {}
                }, l.format(l.value())) : void 0
              ]
            )
          ]
        )
      ]);
    },
    renderError(r, e) {
      return this.renderError(r);
    }
  };
}
const Mn = {
  name: "tsv-export-renderers",
  mixins: [Ce],
  render(t) {
    let n = null;
    try {
      const a = Object.assign(
        {},
        this.$props,
        this.$attrs.props
      );
      n = new Dt(a);
    } catch (a) {
      if (console && console.error(a.stack))
        return this.computeError(t);
    }
    const r = n.getRowKeys(), e = n.getColKeys();
    r.length === 0 && r.push([]), e.length === 0 && e.push([]);
    const i = n.props.rows.map((a) => a);
    e.length === 1 && e[0].length === 0 ? i.push(this.aggregatorName) : e.map((a) => i.push(a.join("-")));
    const o = r.map((a) => {
      const s = a.map((l) => l);
      return e.map((l) => {
        const u = n.getAggregator(a, l).value();
        s.push(u || "");
      }), s;
    });
    return o.unshift(i), t("textarea", {
      style: {
        width: "100%",
        height: `${window.innerHeight / 2}px`
      },
      attrs: {
        readOnly: !0
      },
      domProps: {
        value: o.map((a) => a.join("	")).join(`
`)
      }
    });
  },
  renderError(t, n) {
    return this.renderError(t);
  }
}, Ke = {
  Table: ie({ name: "vue-table" }),
  "Table Heatmap": ie({ heatmapMode: "full", name: "vue-table-heatmap" }),
  "Table Col Heatmap": ie({ heatmapMode: "col", name: "vue-table-col-heatmap" }),
  "Table Row Heatmap": ie({ heatmapMode: "row", name: "vue-table-col-heatmap" }),
  "Export Table TSV": Mn
}, Xe = {
  name: "vue-pivottable",
  mixins: [
    Ce
  ],
  computed: {
    rendererItems() {
      return this.renderers || Object.assign({}, Ke);
    }
  },
  methods: {
    createPivottable(t) {
      const n = this.$props;
      return t(this.rendererItems[this.rendererName], {
        props: Object.assign(
          n,
          { localeStrings: n.locales[n.locale].localeStrings }
        )
      });
    },
    createWrapperContainer(t) {
      return t("div", {
        style: {
          display: "block",
          width: "100%",
          "overflow-x": "auto",
          "max-width": this.tableMaxWidth ? `${this.tableMaxWidth}px` : void 0
        }
      }, [
        this.createPivottable(t)
      ]);
    }
  },
  render(t) {
    return this.createWrapperContainer(t);
  },
  renderError(t, n) {
    return this.renderError(t);
  }
}, Nn = {
  name: "draggable-attribute",
  props: {
    open: {
      type: Boolean,
      default: !1
    },
    sortable: {
      type: Boolean,
      default: !0
    },
    draggable: {
      type: Boolean,
      default: !0
    },
    name: {
      type: String,
      required: !0
    },
    attrValues: {
      type: Object,
      required: !1
    },
    valueFilter: {
      type: Object,
      default: function() {
        return {};
      }
    },
    sorter: {
      type: Function,
      required: !0
    },
    localeStrings: {
      type: Object,
      default: function() {
        return {
          selectAll: "Select All",
          selectNone: "Select None",
          tooMany: "(too many to list)",
          // too many values to show
          filterResults: "Filter values",
          only: "only"
        };
      }
    },
    menuLimit: Number,
    zIndex: Number,
    async: Boolean,
    unused: Boolean
  },
  data() {
    return {
      // open: false,
      filterText: "",
      attribute: "",
      values: [],
      filter: {}
    };
  },
  computed: {
    disabled() {
      return !this.sortable && !this.draggable;
    },
    sortonly() {
      return this.sortable && !this.draggable;
    }
  },
  methods: {
    setValuesInFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] = !0, e), {});
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    addValuesToFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] = !0, e), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    removeValuesFromFilter(t, n) {
      const r = n.reduce((e, i) => (e[i] && delete e[i], e), Object.assign({}, this.valueFilter));
      this.$emit("update:filter", { attribute: t, valueFilter: r });
    },
    moveFilterBoxToTop(t) {
      this.$emit("moveToTop:filterbox", { attribute: t });
    },
    toggleValue(t) {
      t in this.valueFilter ? this.removeValuesFromFilter(this.name, [t]) : this.addValuesToFilter(this.name, [t]);
    },
    matchesFilter(t) {
      return t.toLowerCase().trim().includes(this.filterText.toLowerCase().trim());
    },
    selectOnly(t, n) {
      t.stopPropagation(), this.value = n, this.setValuesInFilter(this.name, Object.keys(this.attrValues).filter((r) => r !== n));
    },
    getFilterBox(t) {
      const n = Object.keys(this.attrValues).length < this.menuLimit, e = Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)).sort(this.sorter);
      return t(
        "div",
        {
          staticClass: ["pvtFilterBox"],
          style: {
            display: "block",
            cursor: "initial",
            zIndex: this.zIndex
          },
          on: {
            click: (i) => {
              i.stopPropagation(), this.moveFilterBoxToTop(this.name);
            }
          }
        },
        [
          t(
            "div",
            {
              staticClass: "pvtSearchContainer"
            },
            [
              n || t("p", this.localeStrings.tooMany),
              n && t("input", {
                staticClass: ["pvtSearch"],
                attrs: {
                  type: "text",
                  placeholder: this.localeStrings.filterResults
                },
                domProps: {
                  value: this.filterText
                },
                on: {
                  input: (i) => {
                    this.filterText = i.target.value, this.$emit("input", i.target.value);
                  }
                }
              }),
              t("a", {
                staticClass: ["pvtFilterTextClear"],
                on: {
                  click: () => {
                    this.filterText = "";
                  }
                }
              }),
              t("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.removeValuesFromFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectAll),
              t("a", {
                staticClass: ["pvtButton"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => this.addValuesToFilter(this.name, Object.keys(this.attrValues).filter(this.matchesFilter.bind(this)))
                }
              }, this.localeStrings.selectNone)
            ]
          ),
          n && t(
            "div",
            {
              staticClass: ["pvtCheckContainer"]
            },
            e.map((i) => {
              const o = !(i in this.valueFilter);
              return t(
                "p",
                {
                  class: {
                    selected: o
                  },
                  attrs: {
                    key: i
                  },
                  on: {
                    click: () => this.toggleValue(i)
                  }
                },
                [
                  t("input", {
                    attrs: {
                      type: "checkbox"
                    },
                    domProps: {
                      checked: o
                    }
                  }),
                  i,
                  t("a", {
                    staticClass: ["pvtOnly"],
                    on: {
                      click: (a) => this.selectOnly(a, i)
                    }
                  }, this.localeStrings.only),
                  t("a", {
                    staticClass: ["pvtOnlySpacer"]
                  })
                ]
              );
            })
          )
        ]
      );
    },
    toggleFilterBox(t) {
      if (t.stopPropagation(), !this.attrValues) {
        this.$listeners["no:filterbox"] && this.$emit("no:filterbox");
        return;
      }
      this.openFilterBox(this.name, !this.open), this.moveFilterBoxToTop(this.name);
    },
    openFilterBox(t, n) {
      this.$emit("open:filterbox", { attribute: t, open: n });
    }
  },
  render(t) {
    const n = Object.keys(this.valueFilter).length !== 0 ? "pvtFilteredAttribute" : "", r = this.$scopedSlots.pvtAttr;
    return t(
      "li",
      {
        attrs: {
          "data-id": this.disabled ? void 0 : this.name
        }
      },
      [
        t(
          "span",
          {
            staticClass: ["pvtAttr " + n],
            class: {
              sortonly: this.sortonly,
              disabled: this.disabled
            }
          },
          [
            r ? r({ name: this.name }) : this.name,
            !this.disabled && (!this.async || !this.unused && this.async) ? t("span", {
              staticClass: ["pvtTriangle"],
              on: {
                click: this.toggleFilterBox.bind(this)
              }
            }, "  ▾") : void 0,
            this.open ? this.getFilterBox(t) : void 0
          ]
        )
      ]
    );
  }
}, Ee = {
  props: ["values", "value"],
  model: {
    prop: "value",
    event: "input"
  },
  created() {
    this.$emit("input", this.value || this.values[0]);
  },
  methods: {
    handleChange(t) {
      this.$emit("input", t.target.value);
    }
  },
  render(t) {
    return t(
      "select",
      {
        staticClass: ["pvtDropdown"],
        domProps: {
          value: this.value
        },
        on: {
          change: this.handleChange
        }
      },
      [
        this.values.map((n) => {
          const r = n;
          return t("option", {
            attrs: {
              value: n,
              selected: n === this.value ? "selected" : void 0
            }
          }, r);
        })
      ]
    );
  }
};
var Pn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function jn(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function Rn(t) {
  if (t.__esModule)
    return t;
  var n = t.default;
  if (typeof n == "function") {
    var r = function e() {
      return this instanceof e ? Reflect.construct(n, arguments, this.constructor) : n.apply(this, arguments);
    };
    r.prototype = n.prototype;
  } else
    r = {};
  return Object.defineProperty(r, "__esModule", { value: !0 }), Object.keys(t).forEach(function(e) {
    var i = Object.getOwnPropertyDescriptor(t, e);
    Object.defineProperty(r, e, i.get ? i : {
      enumerable: !0,
      get: function() {
        return t[e];
      }
    });
  }), r;
}
var fn = { exports: {} };
/**!
 * Sortable 1.10.2
 * @author	RubaXa   <trash@rubaxa.org>
 * @author	owenm    <owen23355@gmail.com>
 * @license MIT
 */
function fe(t) {
  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? fe = function(n) {
    return typeof n;
  } : fe = function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, fe(t);
}
function Ln(t, n, r) {
  return n in t ? Object.defineProperty(t, n, {
    value: r,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : t[n] = r, t;
}
function bt() {
  return bt = Object.assign || function(t) {
    for (var n = 1; n < arguments.length; n++) {
      var r = arguments[n];
      for (var e in r)
        Object.prototype.hasOwnProperty.call(r, e) && (t[e] = r[e]);
    }
    return t;
  }, bt.apply(this, arguments);
}
function Mt(t) {
  for (var n = 1; n < arguments.length; n++) {
    var r = arguments[n] != null ? arguments[n] : {}, e = Object.keys(r);
    typeof Object.getOwnPropertySymbols == "function" && (e = e.concat(Object.getOwnPropertySymbols(r).filter(function(i) {
      return Object.getOwnPropertyDescriptor(r, i).enumerable;
    }))), e.forEach(function(i) {
      Ln(t, i, r[i]);
    });
  }
  return t;
}
function $n(t, n) {
  if (t == null)
    return {};
  var r = {}, e = Object.keys(t), i, o;
  for (o = 0; o < e.length; o++)
    i = e[o], !(n.indexOf(i) >= 0) && (r[i] = t[i]);
  return r;
}
function Bn(t, n) {
  if (t == null)
    return {};
  var r = $n(t, n), e, i;
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    for (i = 0; i < o.length; i++)
      e = o[i], !(n.indexOf(e) >= 0) && Object.prototype.propertyIsEnumerable.call(t, e) && (r[e] = t[e]);
  }
  return r;
}
function Vn(t) {
  return Un(t) || zn(t) || Gn();
}
function Un(t) {
  if (Array.isArray(t)) {
    for (var n = 0, r = new Array(t.length); n < t.length; n++)
      r[n] = t[n];
    return r;
  }
}
function zn(t) {
  if (Symbol.iterator in Object(t) || Object.prototype.toString.call(t) === "[object Arguments]")
    return Array.from(t);
}
function Gn() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
var Hn = "1.10.2";
function Et(t) {
  if (typeof window < "u" && window.navigator)
    return !!/* @__PURE__ */ navigator.userAgent.match(t);
}
var Tt = Et(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i), ee = Et(/Edge/i), _e = Et(/firefox/i), Ve = Et(/safari/i) && !Et(/chrome/i) && !Et(/android/i), dn = Et(/iP(ad|od|hone)/i), Wn = Et(/chrome/i) && Et(/android/i), hn = {
  capture: !1,
  passive: !1
};
function $(t, n, r) {
  t.addEventListener(n, r, !Tt && hn);
}
function R(t, n, r) {
  t.removeEventListener(n, r, !Tt && hn);
}
function me(t, n) {
  if (n) {
    if (n[0] === ">" && (n = n.substring(1)), t)
      try {
        if (t.matches)
          return t.matches(n);
        if (t.msMatchesSelector)
          return t.msMatchesSelector(n);
        if (t.webkitMatchesSelector)
          return t.webkitMatchesSelector(n);
      } catch {
        return !1;
      }
    return !1;
  }
}
function Kn(t) {
  return t.host && t !== document && t.host.nodeType ? t.host : t.parentNode;
}
function xt(t, n, r, e) {
  if (t) {
    r = r || document;
    do {
      if (n != null && (n[0] === ">" ? t.parentNode === r && me(t, n) : me(t, n)) || e && t === r)
        return t;
      if (t === r)
        break;
    } while (t = Kn(t));
  }
  return null;
}
var tn = /\s+/g;
function Z(t, n, r) {
  if (t && n)
    if (t.classList)
      t.classList[r ? "add" : "remove"](n);
    else {
      var e = (" " + t.className + " ").replace(tn, " ").replace(" " + n + " ", " ");
      t.className = (e + (r ? " " + n : "")).replace(tn, " ");
    }
}
function C(t, n, r) {
  var e = t && t.style;
  if (e) {
    if (r === void 0)
      return document.defaultView && document.defaultView.getComputedStyle ? r = document.defaultView.getComputedStyle(t, "") : t.currentStyle && (r = t.currentStyle), n === void 0 ? r : r[n];
    !(n in e) && n.indexOf("webkit") === -1 && (n = "-webkit-" + n), e[n] = r + (typeof r == "string" ? "" : "px");
  }
}
function Lt(t, n) {
  var r = "";
  if (typeof t == "string")
    r = t;
  else
    do {
      var e = C(t, "transform");
      e && e !== "none" && (r = e + " " + r);
    } while (!n && (t = t.parentNode));
  var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
  return i && new i(r);
}
function pn(t, n, r) {
  if (t) {
    var e = t.getElementsByTagName(n), i = 0, o = e.length;
    if (r)
      for (; i < o; i++)
        r(e[i], i);
    return e;
  }
  return [];
}
function wt() {
  var t = document.scrollingElement;
  return t || document.documentElement;
}
function _(t, n, r, e, i) {
  if (!(!t.getBoundingClientRect && t !== window)) {
    var o, a, s, l, u, c, f;
    if (t !== window && t !== wt() ? (o = t.getBoundingClientRect(), a = o.top, s = o.left, l = o.bottom, u = o.right, c = o.height, f = o.width) : (a = 0, s = 0, l = window.innerHeight, u = window.innerWidth, c = window.innerHeight, f = window.innerWidth), (n || r) && t !== window && (i = i || t.parentNode, !Tt))
      do
        if (i && i.getBoundingClientRect && (C(i, "transform") !== "none" || r && C(i, "position") !== "static")) {
          var p = i.getBoundingClientRect();
          a -= p.top + parseInt(C(i, "border-top-width")), s -= p.left + parseInt(C(i, "border-left-width")), l = a + o.height, u = s + o.width;
          break;
        }
      while (i = i.parentNode);
    if (e && t !== window) {
      var g = Lt(i || t), h = g && g.a, d = g && g.d;
      g && (a /= d, s /= h, f /= h, c /= d, l = a + c, u = s + f);
    }
    return {
      top: a,
      left: s,
      bottom: l,
      right: u,
      width: f,
      height: c
    };
  }
}
function en(t, n, r) {
  for (var e = Ft(t, !0), i = _(t)[n]; e; ) {
    var o = _(e)[r], a = void 0;
    if (r === "top" || r === "left" ? a = i >= o : a = i <= o, !a)
      return e;
    if (e === wt())
      break;
    e = Ft(e, !1);
  }
  return !1;
}
function ve(t, n, r) {
  for (var e = 0, i = 0, o = t.children; i < o.length; ) {
    if (o[i].style.display !== "none" && o[i] !== T.ghost && o[i] !== T.dragged && xt(o[i], r.draggable, t, !1)) {
      if (e === n)
        return o[i];
      e++;
    }
    i++;
  }
  return null;
}
function Ye(t, n) {
  for (var r = t.lastElementChild; r && (r === T.ghost || C(r, "display") === "none" || n && !me(r, n)); )
    r = r.previousElementSibling;
  return r || null;
}
function q(t, n) {
  var r = 0;
  if (!t || !t.parentNode)
    return -1;
  for (; t = t.previousElementSibling; )
    t.nodeName.toUpperCase() !== "TEMPLATE" && t !== T.clone && (!n || me(t, n)) && r++;
  return r;
}
function nn(t) {
  var n = 0, r = 0, e = wt();
  if (t)
    do {
      var i = Lt(t), o = i.a, a = i.d;
      n += t.scrollLeft * o, r += t.scrollTop * a;
    } while (t !== e && (t = t.parentNode));
  return [n, r];
}
function Xn(t, n) {
  for (var r in t)
    if (t.hasOwnProperty(r)) {
      for (var e in n)
        if (n.hasOwnProperty(e) && n[e] === t[r][e])
          return Number(r);
    }
  return -1;
}
function Ft(t, n) {
  if (!t || !t.getBoundingClientRect)
    return wt();
  var r = t, e = !1;
  do
    if (r.clientWidth < r.scrollWidth || r.clientHeight < r.scrollHeight) {
      var i = C(r);
      if (r.clientWidth < r.scrollWidth && (i.overflowX == "auto" || i.overflowX == "scroll") || r.clientHeight < r.scrollHeight && (i.overflowY == "auto" || i.overflowY == "scroll")) {
        if (!r.getBoundingClientRect || r === document.body)
          return wt();
        if (e || n)
          return r;
        e = !0;
      }
    }
  while (r = r.parentNode);
  return wt();
}
function Yn(t, n) {
  if (t && n)
    for (var r in n)
      n.hasOwnProperty(r) && (t[r] = n[r]);
  return t;
}
function Te(t, n) {
  return Math.round(t.top) === Math.round(n.top) && Math.round(t.left) === Math.round(n.left) && Math.round(t.height) === Math.round(n.height) && Math.round(t.width) === Math.round(n.width);
}
var Jt;
function gn(t, n) {
  return function() {
    if (!Jt) {
      var r = arguments, e = this;
      r.length === 1 ? t.call(e, r[0]) : t.apply(e, r), Jt = setTimeout(function() {
        Jt = void 0;
      }, n);
    }
  };
}
function kn() {
  clearTimeout(Jt), Jt = void 0;
}
function mn(t, n, r) {
  t.scrollLeft += n, t.scrollTop += r;
}
function ke(t) {
  var n = window.Polymer, r = window.jQuery || window.Zepto;
  return n && n.dom ? n.dom(t).cloneNode(!0) : r ? r(t).clone(!0)[0] : t.cloneNode(!0);
}
function rn(t, n) {
  C(t, "position", "absolute"), C(t, "top", n.top), C(t, "left", n.left), C(t, "width", n.width), C(t, "height", n.height);
}
function Ae(t) {
  C(t, "position", ""), C(t, "top", ""), C(t, "left", ""), C(t, "width", ""), C(t, "height", "");
}
var ct = "Sortable" + (/* @__PURE__ */ new Date()).getTime();
function Zn() {
  var t = [], n;
  return {
    captureAnimationState: function() {
      if (t = [], !!this.options.animation) {
        var e = [].slice.call(this.el.children);
        e.forEach(function(i) {
          if (!(C(i, "display") === "none" || i === T.ghost)) {
            t.push({
              target: i,
              rect: _(i)
            });
            var o = Mt({}, t[t.length - 1].rect);
            if (i.thisAnimationDuration) {
              var a = Lt(i, !0);
              a && (o.top -= a.f, o.left -= a.e);
            }
            i.fromRect = o;
          }
        });
      }
    },
    addAnimationState: function(e) {
      t.push(e);
    },
    removeAnimationState: function(e) {
      t.splice(Xn(t, {
        target: e
      }), 1);
    },
    animateAll: function(e) {
      var i = this;
      if (!this.options.animation) {
        clearTimeout(n), typeof e == "function" && e();
        return;
      }
      var o = !1, a = 0;
      t.forEach(function(s) {
        var l = 0, u = s.target, c = u.fromRect, f = _(u), p = u.prevFromRect, g = u.prevToRect, h = s.rect, d = Lt(u, !0);
        d && (f.top -= d.f, f.left -= d.e), u.toRect = f, u.thisAnimationDuration && Te(p, f) && !Te(c, f) && // Make sure animatingRect is on line between toRect & fromRect
        (h.top - f.top) / (h.left - f.left) === (c.top - f.top) / (c.left - f.left) && (l = Qn(h, p, g, i.options)), Te(f, c) || (u.prevFromRect = c, u.prevToRect = f, l || (l = i.options.animation), i.animate(u, h, f, l)), l && (o = !0, a = Math.max(a, l), clearTimeout(u.animationResetTimer), u.animationResetTimer = setTimeout(function() {
          u.animationTime = 0, u.prevFromRect = null, u.fromRect = null, u.prevToRect = null, u.thisAnimationDuration = null;
        }, l), u.thisAnimationDuration = l);
      }), clearTimeout(n), o ? n = setTimeout(function() {
        typeof e == "function" && e();
      }, a) : typeof e == "function" && e(), t = [];
    },
    animate: function(e, i, o, a) {
      if (a) {
        C(e, "transition", ""), C(e, "transform", "");
        var s = Lt(this.el), l = s && s.a, u = s && s.d, c = (i.left - o.left) / (l || 1), f = (i.top - o.top) / (u || 1);
        e.animatingX = !!c, e.animatingY = !!f, C(e, "transform", "translate3d(" + c + "px," + f + "px,0)"), Jn(e), C(e, "transition", "transform " + a + "ms" + (this.options.easing ? " " + this.options.easing : "")), C(e, "transform", "translate3d(0,0,0)"), typeof e.animated == "number" && clearTimeout(e.animated), e.animated = setTimeout(function() {
          C(e, "transition", ""), C(e, "transform", ""), e.animated = !1, e.animatingX = !1, e.animatingY = !1;
        }, a);
      }
    }
  };
}
function Jn(t) {
  return t.offsetWidth;
}
function Qn(t, n, r, e) {
  return Math.sqrt(Math.pow(n.top - t.top, 2) + Math.pow(n.left - t.left, 2)) / Math.sqrt(Math.pow(n.top - r.top, 2) + Math.pow(n.left - r.left, 2)) * e.animation;
}
var Gt = [], Ie = {
  initializeByDefault: !0
}, ne = {
  mount: function(n) {
    for (var r in Ie)
      Ie.hasOwnProperty(r) && !(r in n) && (n[r] = Ie[r]);
    Gt.push(n);
  },
  pluginEvent: function(n, r, e) {
    var i = this;
    this.eventCanceled = !1, e.cancel = function() {
      i.eventCanceled = !0;
    };
    var o = n + "Global";
    Gt.forEach(function(a) {
      r[a.pluginName] && (r[a.pluginName][o] && r[a.pluginName][o](Mt({
        sortable: r
      }, e)), r.options[a.pluginName] && r[a.pluginName][n] && r[a.pluginName][n](Mt({
        sortable: r
      }, e)));
    });
  },
  initializePlugins: function(n, r, e, i) {
    Gt.forEach(function(s) {
      var l = s.pluginName;
      if (!(!n.options[l] && !s.initializeByDefault)) {
        var u = new s(n, r, n.options);
        u.sortable = n, u.options = n.options, n[l] = u, bt(e, u.defaults);
      }
    });
    for (var o in n.options)
      if (n.options.hasOwnProperty(o)) {
        var a = this.modifyOption(n, o, n.options[o]);
        typeof a < "u" && (n.options[o] = a);
      }
  },
  getEventProperties: function(n, r) {
    var e = {};
    return Gt.forEach(function(i) {
      typeof i.eventProperties == "function" && bt(e, i.eventProperties.call(r[i.pluginName], n));
    }), e;
  },
  modifyOption: function(n, r, e) {
    var i;
    return Gt.forEach(function(o) {
      n[o.pluginName] && o.optionListeners && typeof o.optionListeners[r] == "function" && (i = o.optionListeners[r].call(n[o.pluginName], e));
    }), i;
  }
};
function Xt(t) {
  var n = t.sortable, r = t.rootEl, e = t.name, i = t.targetEl, o = t.cloneEl, a = t.toEl, s = t.fromEl, l = t.oldIndex, u = t.newIndex, c = t.oldDraggableIndex, f = t.newDraggableIndex, p = t.originalEvent, g = t.putSortable, h = t.extraEventProperties;
  if (n = n || r && r[ct], !!n) {
    var d, v = n.options, x = "on" + e.charAt(0).toUpperCase() + e.substr(1);
    window.CustomEvent && !Tt && !ee ? d = new CustomEvent(e, {
      bubbles: !0,
      cancelable: !0
    }) : (d = document.createEvent("Event"), d.initEvent(e, !0, !0)), d.to = a || r, d.from = s || r, d.item = i || r, d.clone = o, d.oldIndex = l, d.newIndex = u, d.oldDraggableIndex = c, d.newDraggableIndex = f, d.originalEvent = p, d.pullMode = g ? g.lastPutMode : void 0;
    var D = Mt({}, h, ne.getEventProperties(e, n));
    for (var O in D)
      d[O] = D[O];
    r && r.dispatchEvent(d), v[x] && v[x].call(n, d);
  }
}
var dt = function(n, r) {
  var e = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, i = e.evt, o = Bn(e, ["evt"]);
  ne.pluginEvent.bind(T)(n, r, Mt({
    dragEl: S,
    parentEl: rt,
    ghostEl: N,
    rootEl: k,
    nextEl: jt,
    lastDownEl: de,
    cloneEl: Q,
    cloneHidden: It,
    dragStarted: Yt,
    putSortable: st,
    activeSortable: T.active,
    originalEvent: i,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: mt,
    newDraggableIndex: At,
    hideGhostForTarget: Sn,
    unhideGhostForTarget: xn,
    cloneNowHidden: function() {
      It = !0;
    },
    cloneNowShown: function() {
      It = !1;
    },
    dispatchSortableEvent: function(s) {
      ft({
        sortable: r,
        name: s,
        originalEvent: i
      });
    }
  }, o));
};
function ft(t) {
  Xt(Mt({
    putSortable: st,
    cloneEl: Q,
    targetEl: S,
    rootEl: k,
    oldIndex: Ut,
    oldDraggableIndex: Qt,
    newIndex: mt,
    newDraggableIndex: At
  }, t));
}
var S, rt, N, k, jt, de, Q, It, Ut, mt, Qt, At, ae, st, Vt = !1, be = !1, ye = [], Nt, yt, Fe, Me, on, an, Yt, $t, qt, _t = !1, se = !1, he, ut, Ne = [], Ue = !1, Se = [], we = typeof document < "u", le = dn, sn = ee || Tt ? "cssFloat" : "float", qn = we && !Wn && !dn && "draggable" in document.createElement("div"), vn = function() {
  if (we) {
    if (Tt)
      return !1;
    var t = document.createElement("x");
    return t.style.cssText = "pointer-events:auto", t.style.pointerEvents === "auto";
  }
}(), bn = function(n, r) {
  var e = C(n), i = parseInt(e.width) - parseInt(e.paddingLeft) - parseInt(e.paddingRight) - parseInt(e.borderLeftWidth) - parseInt(e.borderRightWidth), o = ve(n, 0, r), a = ve(n, 1, r), s = o && C(o), l = a && C(a), u = s && parseInt(s.marginLeft) + parseInt(s.marginRight) + _(o).width, c = l && parseInt(l.marginLeft) + parseInt(l.marginRight) + _(a).width;
  if (e.display === "flex")
    return e.flexDirection === "column" || e.flexDirection === "column-reverse" ? "vertical" : "horizontal";
  if (e.display === "grid")
    return e.gridTemplateColumns.split(" ").length <= 1 ? "vertical" : "horizontal";
  if (o && s.float && s.float !== "none") {
    var f = s.float === "left" ? "left" : "right";
    return a && (l.clear === "both" || l.clear === f) ? "vertical" : "horizontal";
  }
  return o && (s.display === "block" || s.display === "flex" || s.display === "table" || s.display === "grid" || u >= i && e[sn] === "none" || a && e[sn] === "none" && u + c > i) ? "vertical" : "horizontal";
}, _n = function(n, r, e) {
  var i = e ? n.left : n.top, o = e ? n.right : n.bottom, a = e ? n.width : n.height, s = e ? r.left : r.top, l = e ? r.right : r.bottom, u = e ? r.width : r.height;
  return i === s || o === l || i + a / 2 === s + u / 2;
}, tr = function(n, r) {
  var e;
  return ye.some(function(i) {
    if (!Ye(i)) {
      var o = _(i), a = i[ct].options.emptyInsertThreshold, s = n >= o.left - a && n <= o.right + a, l = r >= o.top - a && r <= o.bottom + a;
      if (a && s && l)
        return e = i;
    }
  }), e;
}, yn = function(n) {
  function r(o, a) {
    return function(s, l, u, c) {
      var f = s.options.group.name && l.options.group.name && s.options.group.name === l.options.group.name;
      if (o == null && (a || f))
        return !0;
      if (o == null || o === !1)
        return !1;
      if (a && o === "clone")
        return o;
      if (typeof o == "function")
        return r(o(s, l, u, c), a)(s, l, u, c);
      var p = (a ? s : l).options.group.name;
      return o === !0 || typeof o == "string" && o === p || o.join && o.indexOf(p) > -1;
    };
  }
  var e = {}, i = n.group;
  (!i || fe(i) != "object") && (i = {
    name: i
  }), e.name = i.name, e.checkPull = r(i.pull, !0), e.checkPut = r(i.put), e.revertClone = i.revertClone, n.group = e;
}, Sn = function() {
  !vn && N && C(N, "display", "none");
}, xn = function() {
  !vn && N && C(N, "display", "");
};
we && document.addEventListener("click", function(t) {
  if (be)
    return t.preventDefault(), t.stopPropagation && t.stopPropagation(), t.stopImmediatePropagation && t.stopImmediatePropagation(), be = !1, !1;
}, !0);
var Pt = function(n) {
  if (S) {
    n = n.touches ? n.touches[0] : n;
    var r = tr(n.clientX, n.clientY);
    if (r) {
      var e = {};
      for (var i in n)
        n.hasOwnProperty(i) && (e[i] = n[i]);
      e.target = e.rootEl = r, e.preventDefault = void 0, e.stopPropagation = void 0, r[ct]._onDragOver(e);
    }
  }
}, er = function(n) {
  S && S.parentNode[ct]._isOutsideThisEl(n.target);
};
function T(t, n) {
  if (!(t && t.nodeType && t.nodeType === 1))
    throw "Sortable: `el` must be an HTMLElement, not ".concat({}.toString.call(t));
  this.el = t, this.options = n = bt({}, n), t[ct] = this;
  var r = {
    group: null,
    sort: !0,
    disabled: !1,
    store: null,
    handle: null,
    draggable: /^[uo]l$/i.test(t.nodeName) ? ">li" : ">*",
    swapThreshold: 1,
    // percentage; 0 <= x <= 1
    invertSwap: !1,
    // invert always
    invertedSwapThreshold: null,
    // will be set to same as swapThreshold if default
    removeCloneOnHide: !0,
    direction: function() {
      return bn(t, this.options);
    },
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    dragClass: "sortable-drag",
    ignore: "a, img",
    filter: null,
    preventOnFilter: !0,
    animation: 0,
    easing: null,
    setData: function(a, s) {
      a.setData("Text", s.textContent);
    },
    dropBubble: !1,
    dragoverBubble: !1,
    dataIdAttr: "data-id",
    delay: 0,
    delayOnTouchOnly: !1,
    touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
    forceFallback: !1,
    fallbackClass: "sortable-fallback",
    fallbackOnBody: !1,
    fallbackTolerance: 0,
    fallbackOffset: {
      x: 0,
      y: 0
    },
    supportPointer: T.supportPointer !== !1 && "PointerEvent" in window,
    emptyInsertThreshold: 5
  };
  ne.initializePlugins(this, t, r);
  for (var e in r)
    !(e in n) && (n[e] = r[e]);
  yn(n);
  for (var i in this)
    i.charAt(0) === "_" && typeof this[i] == "function" && (this[i] = this[i].bind(this));
  this.nativeDraggable = n.forceFallback ? !1 : qn, this.nativeDraggable && (this.options.touchStartThreshold = 1), n.supportPointer ? $(t, "pointerdown", this._onTapStart) : ($(t, "mousedown", this._onTapStart), $(t, "touchstart", this._onTapStart)), this.nativeDraggable && ($(t, "dragover", this), $(t, "dragenter", this)), ye.push(this.el), n.store && n.store.get && this.sort(n.store.get(this) || []), bt(this, Zn());
}
T.prototype = /** @lends Sortable.prototype */
{
  constructor: T,
  _isOutsideThisEl: function(n) {
    !this.el.contains(n) && n !== this.el && ($t = null);
  },
  _getDirection: function(n, r) {
    return typeof this.options.direction == "function" ? this.options.direction.call(this, n, r, S) : this.options.direction;
  },
  _onTapStart: function(n) {
    if (n.cancelable) {
      var r = this, e = this.el, i = this.options, o = i.preventOnFilter, a = n.type, s = n.touches && n.touches[0] || n.pointerType && n.pointerType === "touch" && n, l = (s || n).target, u = n.target.shadowRoot && (n.path && n.path[0] || n.composedPath && n.composedPath()[0]) || l, c = i.filter;
      if (lr(e), !S && !(/mousedown|pointerdown/.test(a) && n.button !== 0 || i.disabled) && !u.isContentEditable && (l = xt(l, i.draggable, e, !1), !(l && l.animated) && de !== l)) {
        if (Ut = q(l), Qt = q(l, i.draggable), typeof c == "function") {
          if (c.call(this, n, l, this)) {
            ft({
              sortable: r,
              rootEl: u,
              name: "filter",
              targetEl: l,
              toEl: e,
              fromEl: e
            }), dt("filter", r, {
              evt: n
            }), o && n.cancelable && n.preventDefault();
            return;
          }
        } else if (c && (c = c.split(",").some(function(f) {
          if (f = xt(u, f.trim(), e, !1), f)
            return ft({
              sortable: r,
              rootEl: f,
              name: "filter",
              targetEl: l,
              fromEl: e,
              toEl: e
            }), dt("filter", r, {
              evt: n
            }), !0;
        }), c)) {
          o && n.cancelable && n.preventDefault();
          return;
        }
        i.handle && !xt(u, i.handle, e, !1) || this._prepareDragStart(n, s, l);
      }
    }
  },
  _prepareDragStart: function(n, r, e) {
    var i = this, o = i.el, a = i.options, s = o.ownerDocument, l;
    if (e && !S && e.parentNode === o) {
      var u = _(e);
      if (k = o, S = e, rt = S.parentNode, jt = S.nextSibling, de = e, ae = a.group, T.dragged = S, Nt = {
        target: S,
        clientX: (r || n).clientX,
        clientY: (r || n).clientY
      }, on = Nt.clientX - u.left, an = Nt.clientY - u.top, this._lastX = (r || n).clientX, this._lastY = (r || n).clientY, S.style["will-change"] = "all", l = function() {
        if (dt("delayEnded", i, {
          evt: n
        }), T.eventCanceled) {
          i._onDrop();
          return;
        }
        i._disableDelayedDragEvents(), !_e && i.nativeDraggable && (S.draggable = !0), i._triggerDragStart(n, r), ft({
          sortable: i,
          name: "choose",
          originalEvent: n
        }), Z(S, a.chosenClass, !0);
      }, a.ignore.split(",").forEach(function(c) {
        pn(S, c.trim(), je);
      }), $(s, "dragover", Pt), $(s, "mousemove", Pt), $(s, "touchmove", Pt), $(s, "mouseup", i._onDrop), $(s, "touchend", i._onDrop), $(s, "touchcancel", i._onDrop), _e && this.nativeDraggable && (this.options.touchStartThreshold = 4, S.draggable = !0), dt("delayStart", this, {
        evt: n
      }), a.delay && (!a.delayOnTouchOnly || r) && (!this.nativeDraggable || !(ee || Tt))) {
        if (T.eventCanceled) {
          this._onDrop();
          return;
        }
        $(s, "mouseup", i._disableDelayedDrag), $(s, "touchend", i._disableDelayedDrag), $(s, "touchcancel", i._disableDelayedDrag), $(s, "mousemove", i._delayedDragTouchMoveHandler), $(s, "touchmove", i._delayedDragTouchMoveHandler), a.supportPointer && $(s, "pointermove", i._delayedDragTouchMoveHandler), i._dragStartTimer = setTimeout(l, a.delay);
      } else
        l();
    }
  },
  _delayedDragTouchMoveHandler: function(n) {
    var r = n.touches ? n.touches[0] : n;
    Math.max(Math.abs(r.clientX - this._lastX), Math.abs(r.clientY - this._lastY)) >= Math.floor(this.options.touchStartThreshold / (this.nativeDraggable && window.devicePixelRatio || 1)) && this._disableDelayedDrag();
  },
  _disableDelayedDrag: function() {
    S && je(S), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents();
  },
  _disableDelayedDragEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._disableDelayedDrag), R(n, "touchend", this._disableDelayedDrag), R(n, "touchcancel", this._disableDelayedDrag), R(n, "mousemove", this._delayedDragTouchMoveHandler), R(n, "touchmove", this._delayedDragTouchMoveHandler), R(n, "pointermove", this._delayedDragTouchMoveHandler);
  },
  _triggerDragStart: function(n, r) {
    r = r || n.pointerType == "touch" && n, !this.nativeDraggable || r ? this.options.supportPointer ? $(document, "pointermove", this._onTouchMove) : r ? $(document, "touchmove", this._onTouchMove) : $(document, "mousemove", this._onTouchMove) : ($(S, "dragend", this), $(k, "dragstart", this._onDragStart));
    try {
      document.selection ? pe(function() {
        document.selection.empty();
      }) : window.getSelection().removeAllRanges();
    } catch {
    }
  },
  _dragStarted: function(n, r) {
    if (Vt = !1, k && S) {
      dt("dragStarted", this, {
        evt: r
      }), this.nativeDraggable && $(document, "dragover", er);
      var e = this.options;
      !n && Z(S, e.dragClass, !1), Z(S, e.ghostClass, !0), T.active = this, n && this._appendGhost(), ft({
        sortable: this,
        name: "start",
        originalEvent: r
      });
    } else
      this._nulling();
  },
  _emulateDragOver: function() {
    if (yt) {
      this._lastX = yt.clientX, this._lastY = yt.clientY, Sn();
      for (var n = document.elementFromPoint(yt.clientX, yt.clientY), r = n; n && n.shadowRoot && (n = n.shadowRoot.elementFromPoint(yt.clientX, yt.clientY), n !== r); )
        r = n;
      if (S.parentNode[ct]._isOutsideThisEl(n), r)
        do {
          if (r[ct]) {
            var e = void 0;
            if (e = r[ct]._onDragOver({
              clientX: yt.clientX,
              clientY: yt.clientY,
              target: n,
              rootEl: r
            }), e && !this.options.dragoverBubble)
              break;
          }
          n = r;
        } while (r = r.parentNode);
      xn();
    }
  },
  _onTouchMove: function(n) {
    if (Nt) {
      var r = this.options, e = r.fallbackTolerance, i = r.fallbackOffset, o = n.touches ? n.touches[0] : n, a = N && Lt(N, !0), s = N && a && a.a, l = N && a && a.d, u = le && ut && nn(ut), c = (o.clientX - Nt.clientX + i.x) / (s || 1) + (u ? u[0] - Ne[0] : 0) / (s || 1), f = (o.clientY - Nt.clientY + i.y) / (l || 1) + (u ? u[1] - Ne[1] : 0) / (l || 1);
      if (!T.active && !Vt) {
        if (e && Math.max(Math.abs(o.clientX - this._lastX), Math.abs(o.clientY - this._lastY)) < e)
          return;
        this._onDragStart(n, !0);
      }
      if (N) {
        a ? (a.e += c - (Fe || 0), a.f += f - (Me || 0)) : a = {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: c,
          f
        };
        var p = "matrix(".concat(a.a, ",").concat(a.b, ",").concat(a.c, ",").concat(a.d, ",").concat(a.e, ",").concat(a.f, ")");
        C(N, "webkitTransform", p), C(N, "mozTransform", p), C(N, "msTransform", p), C(N, "transform", p), Fe = c, Me = f, yt = o;
      }
      n.cancelable && n.preventDefault();
    }
  },
  _appendGhost: function() {
    if (!N) {
      var n = this.options.fallbackOnBody ? document.body : k, r = _(S, !0, le, !0, n), e = this.options;
      if (le) {
        for (ut = n; C(ut, "position") === "static" && C(ut, "transform") === "none" && ut !== document; )
          ut = ut.parentNode;
        ut !== document.body && ut !== document.documentElement ? (ut === document && (ut = wt()), r.top += ut.scrollTop, r.left += ut.scrollLeft) : ut = wt(), Ne = nn(ut);
      }
      N = S.cloneNode(!0), Z(N, e.ghostClass, !1), Z(N, e.fallbackClass, !0), Z(N, e.dragClass, !0), C(N, "transition", ""), C(N, "transform", ""), C(N, "box-sizing", "border-box"), C(N, "margin", 0), C(N, "top", r.top), C(N, "left", r.left), C(N, "width", r.width), C(N, "height", r.height), C(N, "opacity", "0.8"), C(N, "position", le ? "absolute" : "fixed"), C(N, "zIndex", "100000"), C(N, "pointerEvents", "none"), T.ghost = N, n.appendChild(N), C(N, "transform-origin", on / parseInt(N.style.width) * 100 + "% " + an / parseInt(N.style.height) * 100 + "%");
    }
  },
  _onDragStart: function(n, r) {
    var e = this, i = n.dataTransfer, o = e.options;
    if (dt("dragStart", this, {
      evt: n
    }), T.eventCanceled) {
      this._onDrop();
      return;
    }
    dt("setupClone", this), T.eventCanceled || (Q = ke(S), Q.draggable = !1, Q.style["will-change"] = "", this._hideClone(), Z(Q, this.options.chosenClass, !1), T.clone = Q), e.cloneId = pe(function() {
      dt("clone", e), !T.eventCanceled && (e.options.removeCloneOnHide || k.insertBefore(Q, S), e._hideClone(), ft({
        sortable: e,
        name: "clone"
      }));
    }), !r && Z(S, o.dragClass, !0), r ? (be = !0, e._loopId = setInterval(e._emulateDragOver, 50)) : (R(document, "mouseup", e._onDrop), R(document, "touchend", e._onDrop), R(document, "touchcancel", e._onDrop), i && (i.effectAllowed = "move", o.setData && o.setData.call(e, i, S)), $(document, "drop", e), C(S, "transform", "translateZ(0)")), Vt = !0, e._dragStartId = pe(e._dragStarted.bind(e, r, n)), $(document, "selectstart", e), Yt = !0, Ve && C(document.body, "user-select", "none");
  },
  // Returns true - if no further action is needed (either inserted or another condition)
  _onDragOver: function(n) {
    var r = this.el, e = n.target, i, o, a, s = this.options, l = s.group, u = T.active, c = ae === l, f = s.sort, p = st || u, g, h = this, d = !1;
    if (Ue)
      return;
    function v(X, ht) {
      dt(X, h, Mt({
        evt: n,
        isOwner: c,
        axis: g ? "vertical" : "horizontal",
        revert: a,
        dragRect: i,
        targetRect: o,
        canSort: f,
        fromSortable: p,
        target: e,
        completed: D,
        onMove: function(it, y) {
          return Pe(k, r, S, i, it, _(it), n, y);
        },
        changed: O
      }, ht));
    }
    function x() {
      v("dragOverAnimationCapture"), h.captureAnimationState(), h !== p && p.captureAnimationState();
    }
    function D(X) {
      return v("dragOverCompleted", {
        insertion: X
      }), X && (c ? u._hideClone() : u._showClone(h), h !== p && (Z(S, st ? st.options.ghostClass : u.options.ghostClass, !1), Z(S, s.ghostClass, !0)), st !== h && h !== T.active ? st = h : h === T.active && st && (st = null), p === h && (h._ignoreWhileAnimating = e), h.animateAll(function() {
        v("dragOverAnimationComplete"), h._ignoreWhileAnimating = null;
      }), h !== p && (p.animateAll(), p._ignoreWhileAnimating = null)), (e === S && !S.animated || e === r && !e.animated) && ($t = null), !s.dragoverBubble && !n.rootEl && e !== document && (S.parentNode[ct]._isOutsideThisEl(n.target), !X && Pt(n)), !s.dragoverBubble && n.stopPropagation && n.stopPropagation(), d = !0;
    }
    function O() {
      mt = q(S), At = q(S, s.draggable), ft({
        sortable: h,
        name: "change",
        toEl: r,
        newIndex: mt,
        newDraggableIndex: At,
        originalEvent: n
      });
    }
    if (n.preventDefault !== void 0 && n.cancelable && n.preventDefault(), e = xt(e, s.draggable, r, !0), v("dragOver"), T.eventCanceled)
      return d;
    if (S.contains(n.target) || e.animated && e.animatingX && e.animatingY || h._ignoreWhileAnimating === e)
      return D(!1);
    if (be = !1, u && !s.disabled && (c ? f || (a = !k.contains(S)) : st === this || (this.lastPutMode = ae.checkPull(this, u, S, n)) && l.checkPut(this, u, S, n))) {
      if (g = this._getDirection(n, e) === "vertical", i = _(S), v("dragOverValid"), T.eventCanceled)
        return d;
      if (a)
        return rt = k, x(), this._hideClone(), v("revert"), T.eventCanceled || (jt ? k.insertBefore(S, jt) : k.appendChild(S)), D(!0);
      var E = Ye(r, s.draggable);
      if (!E || or(n, g, this) && !E.animated) {
        if (E === S)
          return D(!1);
        if (E && r === n.target && (e = E), e && (o = _(e)), Pe(k, r, S, i, e, o, n, !!e) !== !1)
          return x(), r.appendChild(S), rt = r, O(), D(!0);
      } else if (e.parentNode === r) {
        o = _(e);
        var L = 0, U, z = S.parentNode !== r, I = !_n(S.animated && S.toRect || i, e.animated && e.toRect || o, g), M = g ? "top" : "left", A = en(e, "top", "top") || en(S, "top", "top"), B = A ? A.scrollTop : void 0;
        $t !== e && (U = o[M], _t = !1, se = !I && s.invertSwap || z), L = ir(n, e, o, g, I ? 1 : s.swapThreshold, s.invertedSwapThreshold == null ? s.swapThreshold : s.invertedSwapThreshold, se, $t === e);
        var J;
        if (L !== 0) {
          var nt = q(S);
          do
            nt -= L, J = rt.children[nt];
          while (J && (C(J, "display") === "none" || J === N));
        }
        if (L === 0 || J === e)
          return D(!1);
        $t = e, qt = L;
        var tt = e.nextElementSibling, W = !1;
        W = L === 1;
        var G = Pe(k, r, S, i, e, o, n, W);
        if (G !== !1)
          return (G === 1 || G === -1) && (W = G === 1), Ue = !0, setTimeout(rr, 30), x(), W && !tt ? r.appendChild(S) : e.parentNode.insertBefore(S, W ? tt : e), A && mn(A, 0, B - A.scrollTop), rt = S.parentNode, U !== void 0 && !se && (he = Math.abs(U - _(e)[M])), O(), D(!0);
      }
      if (r.contains(S))
        return D(!1);
    }
    return !1;
  },
  _ignoreWhileAnimating: null,
  _offMoveEvents: function() {
    R(document, "mousemove", this._onTouchMove), R(document, "touchmove", this._onTouchMove), R(document, "pointermove", this._onTouchMove), R(document, "dragover", Pt), R(document, "mousemove", Pt), R(document, "touchmove", Pt);
  },
  _offUpEvents: function() {
    var n = this.el.ownerDocument;
    R(n, "mouseup", this._onDrop), R(n, "touchend", this._onDrop), R(n, "pointerup", this._onDrop), R(n, "touchcancel", this._onDrop), R(document, "selectstart", this);
  },
  _onDrop: function(n) {
    var r = this.el, e = this.options;
    if (mt = q(S), At = q(S, e.draggable), dt("drop", this, {
      evt: n
    }), rt = S && S.parentNode, mt = q(S), At = q(S, e.draggable), T.eventCanceled) {
      this._nulling();
      return;
    }
    Vt = !1, se = !1, _t = !1, clearInterval(this._loopId), clearTimeout(this._dragStartTimer), ze(this.cloneId), ze(this._dragStartId), this.nativeDraggable && (R(document, "drop", this), R(r, "dragstart", this._onDragStart)), this._offMoveEvents(), this._offUpEvents(), Ve && C(document.body, "user-select", ""), C(S, "transform", ""), n && (Yt && (n.cancelable && n.preventDefault(), !e.dropBubble && n.stopPropagation()), N && N.parentNode && N.parentNode.removeChild(N), (k === rt || st && st.lastPutMode !== "clone") && Q && Q.parentNode && Q.parentNode.removeChild(Q), S && (this.nativeDraggable && R(S, "dragend", this), je(S), S.style["will-change"] = "", Yt && !Vt && Z(S, st ? st.options.ghostClass : this.options.ghostClass, !1), Z(S, this.options.chosenClass, !1), ft({
      sortable: this,
      name: "unchoose",
      toEl: rt,
      newIndex: null,
      newDraggableIndex: null,
      originalEvent: n
    }), k !== rt ? (mt >= 0 && (ft({
      rootEl: rt,
      name: "add",
      toEl: rt,
      fromEl: k,
      originalEvent: n
    }), ft({
      sortable: this,
      name: "remove",
      toEl: rt,
      originalEvent: n
    }), ft({
      rootEl: rt,
      name: "sort",
      toEl: rt,
      fromEl: k,
      originalEvent: n
    }), ft({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), st && st.save()) : mt !== Ut && mt >= 0 && (ft({
      sortable: this,
      name: "update",
      toEl: rt,
      originalEvent: n
    }), ft({
      sortable: this,
      name: "sort",
      toEl: rt,
      originalEvent: n
    })), T.active && ((mt == null || mt === -1) && (mt = Ut, At = Qt), ft({
      sortable: this,
      name: "end",
      toEl: rt,
      originalEvent: n
    }), this.save()))), this._nulling();
  },
  _nulling: function() {
    dt("nulling", this), k = S = rt = N = jt = Q = de = It = Nt = yt = Yt = mt = At = Ut = Qt = $t = qt = st = ae = T.dragged = T.ghost = T.clone = T.active = null, Se.forEach(function(n) {
      n.checked = !0;
    }), Se.length = Fe = Me = 0;
  },
  handleEvent: function(n) {
    switch (n.type) {
      case "drop":
      case "dragend":
        this._onDrop(n);
        break;
      case "dragenter":
      case "dragover":
        S && (this._onDragOver(n), nr(n));
        break;
      case "selectstart":
        n.preventDefault();
        break;
    }
  },
  /**
   * Serializes the item into an array of string.
   * @returns {String[]}
   */
  toArray: function() {
    for (var n = [], r, e = this.el.children, i = 0, o = e.length, a = this.options; i < o; i++)
      r = e[i], xt(r, a.draggable, this.el, !1) && n.push(r.getAttribute(a.dataIdAttr) || sr(r));
    return n;
  },
  /**
   * Sorts the elements according to the array.
   * @param  {String[]}  order  order of the items
   */
  sort: function(n) {
    var r = {}, e = this.el;
    this.toArray().forEach(function(i, o) {
      var a = e.children[o];
      xt(a, this.options.draggable, e, !1) && (r[i] = a);
    }, this), n.forEach(function(i) {
      r[i] && (e.removeChild(r[i]), e.appendChild(r[i]));
    });
  },
  /**
   * Save the current sorting
   */
  save: function() {
    var n = this.options.store;
    n && n.set && n.set(this);
  },
  /**
   * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
   * @param   {HTMLElement}  el
   * @param   {String}       [selector]  default: `options.draggable`
   * @returns {HTMLElement|null}
   */
  closest: function(n, r) {
    return xt(n, r || this.options.draggable, this.el, !1);
  },
  /**
   * Set/get option
   * @param   {string} name
   * @param   {*}      [value]
   * @returns {*}
   */
  option: function(n, r) {
    var e = this.options;
    if (r === void 0)
      return e[n];
    var i = ne.modifyOption(this, n, r);
    typeof i < "u" ? e[n] = i : e[n] = r, n === "group" && yn(e);
  },
  /**
   * Destroy
   */
  destroy: function() {
    dt("destroy", this);
    var n = this.el;
    n[ct] = null, R(n, "mousedown", this._onTapStart), R(n, "touchstart", this._onTapStart), R(n, "pointerdown", this._onTapStart), this.nativeDraggable && (R(n, "dragover", this), R(n, "dragenter", this)), Array.prototype.forEach.call(n.querySelectorAll("[draggable]"), function(r) {
      r.removeAttribute("draggable");
    }), this._onDrop(), this._disableDelayedDragEvents(), ye.splice(ye.indexOf(this.el), 1), this.el = n = null;
  },
  _hideClone: function() {
    if (!It) {
      if (dt("hideClone", this), T.eventCanceled)
        return;
      C(Q, "display", "none"), this.options.removeCloneOnHide && Q.parentNode && Q.parentNode.removeChild(Q), It = !0;
    }
  },
  _showClone: function(n) {
    if (n.lastPutMode !== "clone") {
      this._hideClone();
      return;
    }
    if (It) {
      if (dt("showClone", this), T.eventCanceled)
        return;
      k.contains(S) && !this.options.group.revertClone ? k.insertBefore(Q, S) : jt ? k.insertBefore(Q, jt) : k.appendChild(Q), this.options.group.revertClone && this.animate(S, Q), C(Q, "display", ""), It = !1;
    }
  }
};
function nr(t) {
  t.dataTransfer && (t.dataTransfer.dropEffect = "move"), t.cancelable && t.preventDefault();
}
function Pe(t, n, r, e, i, o, a, s) {
  var l, u = t[ct], c = u.options.onMove, f;
  return window.CustomEvent && !Tt && !ee ? l = new CustomEvent("move", {
    bubbles: !0,
    cancelable: !0
  }) : (l = document.createEvent("Event"), l.initEvent("move", !0, !0)), l.to = n, l.from = t, l.dragged = r, l.draggedRect = e, l.related = i || n, l.relatedRect = o || _(n), l.willInsertAfter = s, l.originalEvent = a, t.dispatchEvent(l), c && (f = c.call(u, l, a)), f;
}
function je(t) {
  t.draggable = !1;
}
function rr() {
  Ue = !1;
}
function or(t, n, r) {
  var e = _(Ye(r.el, r.options.draggable)), i = 10;
  return n ? t.clientX > e.right + i || t.clientX <= e.right && t.clientY > e.bottom && t.clientX >= e.left : t.clientX > e.right && t.clientY > e.top || t.clientX <= e.right && t.clientY > e.bottom + i;
}
function ir(t, n, r, e, i, o, a, s) {
  var l = e ? t.clientY : t.clientX, u = e ? r.height : r.width, c = e ? r.top : r.left, f = e ? r.bottom : r.right, p = !1;
  if (!a) {
    if (s && he < u * i) {
      if (!_t && (qt === 1 ? l > c + u * o / 2 : l < f - u * o / 2) && (_t = !0), _t)
        p = !0;
      else if (qt === 1 ? l < c + he : l > f - he)
        return -qt;
    } else if (l > c + u * (1 - i) / 2 && l < f - u * (1 - i) / 2)
      return ar(n);
  }
  return p = p || a, p && (l < c + u * o / 2 || l > f - u * o / 2) ? l > c + u / 2 ? 1 : -1 : 0;
}
function ar(t) {
  return q(S) < q(t) ? 1 : -1;
}
function sr(t) {
  for (var n = t.tagName + t.className + t.src + t.href + t.textContent, r = n.length, e = 0; r--; )
    e += n.charCodeAt(r);
  return e.toString(36);
}
function lr(t) {
  Se.length = 0;
  for (var n = t.getElementsByTagName("input"), r = n.length; r--; ) {
    var e = n[r];
    e.checked && Se.push(e);
  }
}
function pe(t) {
  return setTimeout(t, 0);
}
function ze(t) {
  return clearTimeout(t);
}
we && $(document, "touchmove", function(t) {
  (T.active || Vt) && t.cancelable && t.preventDefault();
});
T.utils = {
  on: $,
  off: R,
  css: C,
  find: pn,
  is: function(n, r) {
    return !!xt(n, r, n, !1);
  },
  extend: Yn,
  throttle: gn,
  closest: xt,
  toggleClass: Z,
  clone: ke,
  index: q,
  nextTick: pe,
  cancelNextTick: ze,
  detectDirection: bn,
  getChild: ve
};
T.get = function(t) {
  return t[ct];
};
T.mount = function() {
  for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
    n[r] = arguments[r];
  n[0].constructor === Array && (n = n[0]), n.forEach(function(e) {
    if (!e.prototype || !e.prototype.constructor)
      throw "Sortable: Mounted plugin must be a constructor function, not ".concat({}.toString.call(e));
    e.utils && (T.utils = Mt({}, T.utils, e.utils)), ne.mount(e);
  });
};
T.create = function(t, n) {
  return new T(t, n);
};
T.version = Hn;
var ot = [], kt, Ge, He = !1, Re, Le, xe, Zt;
function ur() {
  function t() {
    this.defaults = {
      scroll: !0,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: !0
    };
    for (var n in this)
      n.charAt(0) === "_" && typeof this[n] == "function" && (this[n] = this[n].bind(this));
  }
  return t.prototype = {
    dragStarted: function(r) {
      var e = r.originalEvent;
      this.sortable.nativeDraggable ? $(document, "dragover", this._handleAutoScroll) : this.options.supportPointer ? $(document, "pointermove", this._handleFallbackAutoScroll) : e.touches ? $(document, "touchmove", this._handleFallbackAutoScroll) : $(document, "mousemove", this._handleFallbackAutoScroll);
    },
    dragOverCompleted: function(r) {
      var e = r.originalEvent;
      !this.options.dragOverBubble && !e.rootEl && this._handleAutoScroll(e);
    },
    drop: function() {
      this.sortable.nativeDraggable ? R(document, "dragover", this._handleAutoScroll) : (R(document, "pointermove", this._handleFallbackAutoScroll), R(document, "touchmove", this._handleFallbackAutoScroll), R(document, "mousemove", this._handleFallbackAutoScroll)), ln(), ge(), kn();
    },
    nulling: function() {
      xe = Ge = kt = He = Zt = Re = Le = null, ot.length = 0;
    },
    _handleFallbackAutoScroll: function(r) {
      this._handleAutoScroll(r, !0);
    },
    _handleAutoScroll: function(r, e) {
      var i = this, o = (r.touches ? r.touches[0] : r).clientX, a = (r.touches ? r.touches[0] : r).clientY, s = document.elementFromPoint(o, a);
      if (xe = r, e || ee || Tt || Ve) {
        $e(r, this.options, s, e);
        var l = Ft(s, !0);
        He && (!Zt || o !== Re || a !== Le) && (Zt && ln(), Zt = setInterval(function() {
          var u = Ft(document.elementFromPoint(o, a), !0);
          u !== l && (l = u, ge()), $e(r, i.options, u, e);
        }, 10), Re = o, Le = a);
      } else {
        if (!this.options.bubbleScroll || Ft(s, !0) === wt()) {
          ge();
          return;
        }
        $e(r, this.options, Ft(s, !1), !1);
      }
    }
  }, bt(t, {
    pluginName: "scroll",
    initializeByDefault: !0
  });
}
function ge() {
  ot.forEach(function(t) {
    clearInterval(t.pid);
  }), ot = [];
}
function ln() {
  clearInterval(Zt);
}
var $e = gn(function(t, n, r, e) {
  if (n.scroll) {
    var i = (t.touches ? t.touches[0] : t).clientX, o = (t.touches ? t.touches[0] : t).clientY, a = n.scrollSensitivity, s = n.scrollSpeed, l = wt(), u = !1, c;
    Ge !== r && (Ge = r, ge(), kt = n.scroll, c = n.scrollFn, kt === !0 && (kt = Ft(r, !0)));
    var f = 0, p = kt;
    do {
      var g = p, h = _(g), d = h.top, v = h.bottom, x = h.left, D = h.right, O = h.width, E = h.height, L = void 0, U = void 0, z = g.scrollWidth, I = g.scrollHeight, M = C(g), A = g.scrollLeft, B = g.scrollTop;
      g === l ? (L = O < z && (M.overflowX === "auto" || M.overflowX === "scroll" || M.overflowX === "visible"), U = E < I && (M.overflowY === "auto" || M.overflowY === "scroll" || M.overflowY === "visible")) : (L = O < z && (M.overflowX === "auto" || M.overflowX === "scroll"), U = E < I && (M.overflowY === "auto" || M.overflowY === "scroll"));
      var J = L && (Math.abs(D - i) <= a && A + O < z) - (Math.abs(x - i) <= a && !!A), nt = U && (Math.abs(v - o) <= a && B + E < I) - (Math.abs(d - o) <= a && !!B);
      if (!ot[f])
        for (var tt = 0; tt <= f; tt++)
          ot[tt] || (ot[tt] = {});
      (ot[f].vx != J || ot[f].vy != nt || ot[f].el !== g) && (ot[f].el = g, ot[f].vx = J, ot[f].vy = nt, clearInterval(ot[f].pid), (J != 0 || nt != 0) && (u = !0, ot[f].pid = setInterval((function() {
        e && this.layer === 0 && T.active._onTouchMove(xe);
        var W = ot[this.layer].vy ? ot[this.layer].vy * s : 0, G = ot[this.layer].vx ? ot[this.layer].vx * s : 0;
        typeof c == "function" && c.call(T.dragged.parentNode[ct], G, W, t, xe, ot[this.layer].el) !== "continue" || mn(ot[this.layer].el, G, W);
      }).bind({
        layer: f
      }), 24))), f++;
    } while (n.bubbleScroll && p !== l && (p = Ft(p, !1)));
    He = u;
  }
}, 30), On = function(n) {
  var r = n.originalEvent, e = n.putSortable, i = n.dragEl, o = n.activeSortable, a = n.dispatchSortableEvent, s = n.hideGhostForTarget, l = n.unhideGhostForTarget;
  if (r) {
    var u = e || o;
    s();
    var c = r.changedTouches && r.changedTouches.length ? r.changedTouches[0] : r, f = document.elementFromPoint(c.clientX, c.clientY);
    l(), u && !u.el.contains(f) && (a("spill"), this.onSpill({
      dragEl: i,
      putSortable: e
    }));
  }
};
function Ze() {
}
Ze.prototype = {
  startIndex: null,
  dragStart: function(n) {
    var r = n.oldDraggableIndex;
    this.startIndex = r;
  },
  onSpill: function(n) {
    var r = n.dragEl, e = n.putSortable;
    this.sortable.captureAnimationState(), e && e.captureAnimationState();
    var i = ve(this.sortable.el, this.startIndex, this.options);
    i ? this.sortable.el.insertBefore(r, i) : this.sortable.el.appendChild(r), this.sortable.animateAll(), e && e.animateAll();
  },
  drop: On
};
bt(Ze, {
  pluginName: "revertOnSpill"
});
function Je() {
}
Je.prototype = {
  onSpill: function(n) {
    var r = n.dragEl, e = n.putSortable, i = e || this.sortable;
    i.captureAnimationState(), r.parentNode && r.parentNode.removeChild(r), i.animateAll();
  },
  drop: On
};
bt(Je, {
  pluginName: "removeOnSpill"
});
var vt;
function cr() {
  function t() {
    this.defaults = {
      swapClass: "sortable-swap-highlight"
    };
  }
  return t.prototype = {
    dragStart: function(r) {
      var e = r.dragEl;
      vt = e;
    },
    dragOverValid: function(r) {
      var e = r.completed, i = r.target, o = r.onMove, a = r.activeSortable, s = r.changed, l = r.cancel;
      if (a.options.swap) {
        var u = this.sortable.el, c = this.options;
        if (i && i !== u) {
          var f = vt;
          o(i) !== !1 ? (Z(i, c.swapClass, !0), vt = i) : vt = null, f && f !== vt && Z(f, c.swapClass, !1);
        }
        s(), e(!0), l();
      }
    },
    drop: function(r) {
      var e = r.activeSortable, i = r.putSortable, o = r.dragEl, a = i || this.sortable, s = this.options;
      vt && Z(vt, s.swapClass, !1), vt && (s.swap || i && i.options.swap) && o !== vt && (a.captureAnimationState(), a !== e && e.captureAnimationState(), fr(o, vt), a.animateAll(), a !== e && e.animateAll());
    },
    nulling: function() {
      vt = null;
    }
  }, bt(t, {
    pluginName: "swap",
    eventProperties: function() {
      return {
        swapItem: vt
      };
    }
  });
}
function fr(t, n) {
  var r = t.parentNode, e = n.parentNode, i, o;
  !r || !e || r.isEqualNode(n) || e.isEqualNode(t) || (i = q(t), o = q(n), r.isEqualNode(e) && i < o && o++, r.insertBefore(n, r.children[i]), e.insertBefore(t, e.children[o]));
}
var F = [], gt = [], Ht, St, Wt = !1, pt = !1, Bt = !1, K, Kt, ue;
function dr() {
  function t(n) {
    for (var r in this)
      r.charAt(0) === "_" && typeof this[r] == "function" && (this[r] = this[r].bind(this));
    n.options.supportPointer ? $(document, "pointerup", this._deselectMultiDrag) : ($(document, "mouseup", this._deselectMultiDrag), $(document, "touchend", this._deselectMultiDrag)), $(document, "keydown", this._checkKeyDown), $(document, "keyup", this._checkKeyUp), this.defaults = {
      selectedClass: "sortable-selected",
      multiDragKey: null,
      setData: function(i, o) {
        var a = "";
        F.length && St === n ? F.forEach(function(s, l) {
          a += (l ? ", " : "") + s.textContent;
        }) : a = o.textContent, i.setData("Text", a);
      }
    };
  }
  return t.prototype = {
    multiDragKeyDown: !1,
    isMultiDrag: !1,
    delayStartGlobal: function(r) {
      var e = r.dragEl;
      K = e;
    },
    delayEnded: function() {
      this.isMultiDrag = ~F.indexOf(K);
    },
    setupClone: function(r) {
      var e = r.sortable, i = r.cancel;
      if (this.isMultiDrag) {
        for (var o = 0; o < F.length; o++)
          gt.push(ke(F[o])), gt[o].sortableIndex = F[o].sortableIndex, gt[o].draggable = !1, gt[o].style["will-change"] = "", Z(gt[o], this.options.selectedClass, !1), F[o] === K && Z(gt[o], this.options.chosenClass, !1);
        e._hideClone(), i();
      }
    },
    clone: function(r) {
      var e = r.sortable, i = r.rootEl, o = r.dispatchSortableEvent, a = r.cancel;
      this.isMultiDrag && (this.options.removeCloneOnHide || F.length && St === e && (un(!0, i), o("clone"), a()));
    },
    showClone: function(r) {
      var e = r.cloneNowShown, i = r.rootEl, o = r.cancel;
      this.isMultiDrag && (un(!1, i), gt.forEach(function(a) {
        C(a, "display", "");
      }), e(), ue = !1, o());
    },
    hideClone: function(r) {
      var e = this;
      r.sortable;
      var i = r.cloneNowHidden, o = r.cancel;
      this.isMultiDrag && (gt.forEach(function(a) {
        C(a, "display", "none"), e.options.removeCloneOnHide && a.parentNode && a.parentNode.removeChild(a);
      }), i(), ue = !0, o());
    },
    dragStartGlobal: function(r) {
      r.sortable, !this.isMultiDrag && St && St.multiDrag._deselectMultiDrag(), F.forEach(function(e) {
        e.sortableIndex = q(e);
      }), F = F.sort(function(e, i) {
        return e.sortableIndex - i.sortableIndex;
      }), Bt = !0;
    },
    dragStarted: function(r) {
      var e = this, i = r.sortable;
      if (this.isMultiDrag) {
        if (this.options.sort && (i.captureAnimationState(), this.options.animation)) {
          F.forEach(function(a) {
            a !== K && C(a, "position", "absolute");
          });
          var o = _(K, !1, !0, !0);
          F.forEach(function(a) {
            a !== K && rn(a, o);
          }), pt = !0, Wt = !0;
        }
        i.animateAll(function() {
          pt = !1, Wt = !1, e.options.animation && F.forEach(function(a) {
            Ae(a);
          }), e.options.sort && ce();
        });
      }
    },
    dragOver: function(r) {
      var e = r.target, i = r.completed, o = r.cancel;
      pt && ~F.indexOf(e) && (i(!1), o());
    },
    revert: function(r) {
      var e = r.fromSortable, i = r.rootEl, o = r.sortable, a = r.dragRect;
      F.length > 1 && (F.forEach(function(s) {
        o.addAnimationState({
          target: s,
          rect: pt ? _(s) : a
        }), Ae(s), s.fromRect = a, e.removeAnimationState(s);
      }), pt = !1, hr(!this.options.removeCloneOnHide, i));
    },
    dragOverCompleted: function(r) {
      var e = r.sortable, i = r.isOwner, o = r.insertion, a = r.activeSortable, s = r.parentEl, l = r.putSortable, u = this.options;
      if (o) {
        if (i && a._hideClone(), Wt = !1, u.animation && F.length > 1 && (pt || !i && !a.options.sort && !l)) {
          var c = _(K, !1, !0, !0);
          F.forEach(function(p) {
            p !== K && (rn(p, c), s.appendChild(p));
          }), pt = !0;
        }
        if (!i)
          if (pt || ce(), F.length > 1) {
            var f = ue;
            a._showClone(e), a.options.animation && !ue && f && gt.forEach(function(p) {
              a.addAnimationState({
                target: p,
                rect: Kt
              }), p.fromRect = Kt, p.thisAnimationDuration = null;
            });
          } else
            a._showClone(e);
      }
    },
    dragOverAnimationCapture: function(r) {
      var e = r.dragRect, i = r.isOwner, o = r.activeSortable;
      if (F.forEach(function(s) {
        s.thisAnimationDuration = null;
      }), o.options.animation && !i && o.multiDrag.isMultiDrag) {
        Kt = bt({}, e);
        var a = Lt(K, !0);
        Kt.top -= a.f, Kt.left -= a.e;
      }
    },
    dragOverAnimationComplete: function() {
      pt && (pt = !1, ce());
    },
    drop: function(r) {
      var e = r.originalEvent, i = r.rootEl, o = r.parentEl, a = r.sortable, s = r.dispatchSortableEvent, l = r.oldIndex, u = r.putSortable, c = u || this.sortable;
      if (e) {
        var f = this.options, p = o.children;
        if (!Bt)
          if (f.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(), Z(K, f.selectedClass, !~F.indexOf(K)), ~F.indexOf(K))
            F.splice(F.indexOf(K), 1), Ht = null, Xt({
              sortable: a,
              rootEl: i,
              name: "deselect",
              targetEl: K,
              originalEvt: e
            });
          else {
            if (F.push(K), Xt({
              sortable: a,
              rootEl: i,
              name: "select",
              targetEl: K,
              originalEvt: e
            }), e.shiftKey && Ht && a.el.contains(Ht)) {
              var g = q(Ht), h = q(K);
              if (~g && ~h && g !== h) {
                var d, v;
                for (h > g ? (v = g, d = h) : (v = h, d = g + 1); v < d; v++)
                  ~F.indexOf(p[v]) || (Z(p[v], f.selectedClass, !0), F.push(p[v]), Xt({
                    sortable: a,
                    rootEl: i,
                    name: "select",
                    targetEl: p[v],
                    originalEvt: e
                  }));
              }
            } else
              Ht = K;
            St = c;
          }
        if (Bt && this.isMultiDrag) {
          if ((o[ct].options.sort || o !== i) && F.length > 1) {
            var x = _(K), D = q(K, ":not(." + this.options.selectedClass + ")");
            if (!Wt && f.animation && (K.thisAnimationDuration = null), c.captureAnimationState(), !Wt && (f.animation && (K.fromRect = x, F.forEach(function(E) {
              if (E.thisAnimationDuration = null, E !== K) {
                var L = pt ? _(E) : x;
                E.fromRect = L, c.addAnimationState({
                  target: E,
                  rect: L
                });
              }
            })), ce(), F.forEach(function(E) {
              p[D] ? o.insertBefore(E, p[D]) : o.appendChild(E), D++;
            }), l === q(K))) {
              var O = !1;
              F.forEach(function(E) {
                if (E.sortableIndex !== q(E)) {
                  O = !0;
                  return;
                }
              }), O && s("update");
            }
            F.forEach(function(E) {
              Ae(E);
            }), c.animateAll();
          }
          St = c;
        }
        (i === o || u && u.lastPutMode !== "clone") && gt.forEach(function(E) {
          E.parentNode && E.parentNode.removeChild(E);
        });
      }
    },
    nullingGlobal: function() {
      this.isMultiDrag = Bt = !1, gt.length = 0;
    },
    destroyGlobal: function() {
      this._deselectMultiDrag(), R(document, "pointerup", this._deselectMultiDrag), R(document, "mouseup", this._deselectMultiDrag), R(document, "touchend", this._deselectMultiDrag), R(document, "keydown", this._checkKeyDown), R(document, "keyup", this._checkKeyUp);
    },
    _deselectMultiDrag: function(r) {
      if (!(typeof Bt < "u" && Bt) && St === this.sortable && !(r && xt(r.target, this.options.draggable, this.sortable.el, !1)) && !(r && r.button !== 0))
        for (; F.length; ) {
          var e = F[0];
          Z(e, this.options.selectedClass, !1), F.shift(), Xt({
            sortable: this.sortable,
            rootEl: this.sortable.el,
            name: "deselect",
            targetEl: e,
            originalEvt: r
          });
        }
    },
    _checkKeyDown: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !0);
    },
    _checkKeyUp: function(r) {
      r.key === this.options.multiDragKey && (this.multiDragKeyDown = !1);
    }
  }, bt(t, {
    // Static methods & properties
    pluginName: "multiDrag",
    utils: {
      /**
       * Selects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be selected
       */
      select: function(r) {
        var e = r.parentNode[ct];
        !e || !e.options.multiDrag || ~F.indexOf(r) || (St && St !== e && (St.multiDrag._deselectMultiDrag(), St = e), Z(r, e.options.selectedClass, !0), F.push(r));
      },
      /**
       * Deselects the provided multi-drag item
       * @param  {HTMLElement} el    The element to be deselected
       */
      deselect: function(r) {
        var e = r.parentNode[ct], i = F.indexOf(r);
        !e || !e.options.multiDrag || !~i || (Z(r, e.options.selectedClass, !1), F.splice(i, 1));
      }
    },
    eventProperties: function() {
      var r = this, e = [], i = [];
      return F.forEach(function(o) {
        e.push({
          multiDragElement: o,
          index: o.sortableIndex
        });
        var a;
        pt && o !== K ? a = -1 : pt ? a = q(o, ":not(." + r.options.selectedClass + ")") : a = q(o), i.push({
          multiDragElement: o,
          index: a
        });
      }), {
        items: Vn(F),
        clones: [].concat(gt),
        oldIndicies: e,
        newIndicies: i
      };
    },
    optionListeners: {
      multiDragKey: function(r) {
        return r = r.toLowerCase(), r === "ctrl" ? r = "Control" : r.length > 1 && (r = r.charAt(0).toUpperCase() + r.substr(1)), r;
      }
    }
  });
}
function hr(t, n) {
  F.forEach(function(r, e) {
    var i = n.children[r.sortableIndex + (t ? Number(e) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function un(t, n) {
  gt.forEach(function(r, e) {
    var i = n.children[r.sortableIndex + (t ? Number(e) : 0)];
    i ? n.insertBefore(r, i) : n.appendChild(r);
  });
}
function ce() {
  F.forEach(function(t) {
    t !== K && t.parentNode && t.parentNode.removeChild(t);
  });
}
T.mount(new ur());
T.mount(Je, Ze);
const pr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MultiDrag: dr,
  Sortable: T,
  Swap: cr,
  default: T
}, Symbol.toStringTag, { value: "Module" })), gr = /* @__PURE__ */ Rn(pr);
(function(t, n) {
  (function(e, i) {
    t.exports = i(gr);
  })(typeof self < "u" ? self : Pn, function(r) {
    return (
      /******/
      function(e) {
        var i = {};
        function o(a) {
          if (i[a])
            return i[a].exports;
          var s = i[a] = {
            /******/
            i: a,
            /******/
            l: !1,
            /******/
            exports: {}
            /******/
          };
          return e[a].call(s.exports, s, s.exports, o), s.l = !0, s.exports;
        }
        return o.m = e, o.c = i, o.d = function(a, s, l) {
          o.o(a, s) || Object.defineProperty(a, s, { enumerable: !0, get: l });
        }, o.r = function(a) {
          typeof Symbol < "u" && Symbol.toStringTag && Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a, "__esModule", { value: !0 });
        }, o.t = function(a, s) {
          if (s & 1 && (a = o(a)), s & 8 || s & 4 && typeof a == "object" && a && a.__esModule)
            return a;
          var l = /* @__PURE__ */ Object.create(null);
          if (o.r(l), Object.defineProperty(l, "default", { enumerable: !0, value: a }), s & 2 && typeof a != "string")
            for (var u in a)
              o.d(l, u, (function(c) {
                return a[c];
              }).bind(null, u));
          return l;
        }, o.n = function(a) {
          var s = a && a.__esModule ? (
            /******/
            function() {
              return a.default;
            }
          ) : (
            /******/
            function() {
              return a;
            }
          );
          return o.d(s, "a", s), s;
        }, o.o = function(a, s) {
          return Object.prototype.hasOwnProperty.call(a, s);
        }, o.p = "", o(o.s = "fb15");
      }({
        /***/
        "01f9": (
          /***/
          function(e, i, o) {
            var a = o("2d00"), s = o("5ca1"), l = o("2aba"), u = o("32e9"), c = o("84f2"), f = o("41a0"), p = o("7f20"), g = o("38fd"), h = o("2b4c")("iterator"), d = !([].keys && "next" in [].keys()), v = "@@iterator", x = "keys", D = "values", O = function() {
              return this;
            };
            e.exports = function(E, L, U, z, I, M, A) {
              f(U, L, z);
              var B = function(b) {
                if (!d && b in W)
                  return W[b];
                switch (b) {
                  case x:
                    return function() {
                      return new U(this, b);
                    };
                  case D:
                    return function() {
                      return new U(this, b);
                    };
                }
                return function() {
                  return new U(this, b);
                };
              }, J = L + " Iterator", nt = I == D, tt = !1, W = E.prototype, G = W[h] || W[v] || I && W[I], X = G || B(I), ht = I ? nt ? B("entries") : X : void 0, lt = L == "Array" && W.entries || G, it, y, m;
              if (lt && (m = g(lt.call(new E())), m !== Object.prototype && m.next && (p(m, J, !0), !a && typeof m[h] != "function" && u(m, h, O))), nt && G && G.name !== D && (tt = !0, X = function() {
                return G.call(this);
              }), (!a || A) && (d || tt || !W[h]) && u(W, h, X), c[L] = X, c[J] = O, I)
                if (it = {
                  values: nt ? X : B(D),
                  keys: M ? X : B(x),
                  entries: ht
                }, A)
                  for (y in it)
                    y in W || l(W, y, it[y]);
                else
                  s(s.P + s.F * (d || tt), L, it);
              return it;
            };
          }
        ),
        /***/
        "02f4": (
          /***/
          function(e, i, o) {
            var a = o("4588"), s = o("be13");
            e.exports = function(l) {
              return function(u, c) {
                var f = String(s(u)), p = a(c), g = f.length, h, d;
                return p < 0 || p >= g ? l ? "" : void 0 : (h = f.charCodeAt(p), h < 55296 || h > 56319 || p + 1 === g || (d = f.charCodeAt(p + 1)) < 56320 || d > 57343 ? l ? f.charAt(p) : h : l ? f.slice(p, p + 2) : (h - 55296 << 10) + (d - 56320) + 65536);
              };
            };
          }
        ),
        /***/
        "0390": (
          /***/
          function(e, i, o) {
            var a = o("02f4")(!0);
            e.exports = function(s, l, u) {
              return l + (u ? a(s, l).length : 1);
            };
          }
        ),
        /***/
        "0bfb": (
          /***/
          function(e, i, o) {
            var a = o("cb7c");
            e.exports = function() {
              var s = a(this), l = "";
              return s.global && (l += "g"), s.ignoreCase && (l += "i"), s.multiline && (l += "m"), s.unicode && (l += "u"), s.sticky && (l += "y"), l;
            };
          }
        ),
        /***/
        "0d58": (
          /***/
          function(e, i, o) {
            var a = o("ce10"), s = o("e11e");
            e.exports = Object.keys || function(u) {
              return a(u, s);
            };
          }
        ),
        /***/
        1495: (
          /***/
          function(e, i, o) {
            var a = o("86cc"), s = o("cb7c"), l = o("0d58");
            e.exports = o("9e1e") ? Object.defineProperties : function(c, f) {
              s(c);
              for (var p = l(f), g = p.length, h = 0, d; g > h; )
                a.f(c, d = p[h++], f[d]);
              return c;
            };
          }
        ),
        /***/
        "214f": (
          /***/
          function(e, i, o) {
            o("b0c5");
            var a = o("2aba"), s = o("32e9"), l = o("79e5"), u = o("be13"), c = o("2b4c"), f = o("520a"), p = c("species"), g = !l(function() {
              var d = /./;
              return d.exec = function() {
                var v = [];
                return v.groups = { a: "7" }, v;
              }, "".replace(d, "$<a>") !== "7";
            }), h = function() {
              var d = /(?:)/, v = d.exec;
              d.exec = function() {
                return v.apply(this, arguments);
              };
              var x = "ab".split(d);
              return x.length === 2 && x[0] === "a" && x[1] === "b";
            }();
            e.exports = function(d, v, x) {
              var D = c(d), O = !l(function() {
                var M = {};
                return M[D] = function() {
                  return 7;
                }, ""[d](M) != 7;
              }), E = O ? !l(function() {
                var M = !1, A = /a/;
                return A.exec = function() {
                  return M = !0, null;
                }, d === "split" && (A.constructor = {}, A.constructor[p] = function() {
                  return A;
                }), A[D](""), !M;
              }) : void 0;
              if (!O || !E || d === "replace" && !g || d === "split" && !h) {
                var L = /./[D], U = x(
                  u,
                  D,
                  ""[d],
                  function(A, B, J, nt, tt) {
                    return B.exec === f ? O && !tt ? { done: !0, value: L.call(B, J, nt) } : { done: !0, value: A.call(J, B, nt) } : { done: !1 };
                  }
                ), z = U[0], I = U[1];
                a(String.prototype, d, z), s(
                  RegExp.prototype,
                  D,
                  v == 2 ? function(M, A) {
                    return I.call(M, this, A);
                  } : function(M) {
                    return I.call(M, this);
                  }
                );
              }
            };
          }
        ),
        /***/
        "230e": (
          /***/
          function(e, i, o) {
            var a = o("d3f4"), s = o("7726").document, l = a(s) && a(s.createElement);
            e.exports = function(u) {
              return l ? s.createElement(u) : {};
            };
          }
        ),
        /***/
        "23c6": (
          /***/
          function(e, i, o) {
            var a = o("2d95"), s = o("2b4c")("toStringTag"), l = a(function() {
              return arguments;
            }()) == "Arguments", u = function(c, f) {
              try {
                return c[f];
              } catch {
              }
            };
            e.exports = function(c) {
              var f, p, g;
              return c === void 0 ? "Undefined" : c === null ? "Null" : typeof (p = u(f = Object(c), s)) == "string" ? p : l ? a(f) : (g = a(f)) == "Object" && typeof f.callee == "function" ? "Arguments" : g;
            };
          }
        ),
        /***/
        2621: (
          /***/
          function(e, i) {
            i.f = Object.getOwnPropertySymbols;
          }
        ),
        /***/
        "2aba": (
          /***/
          function(e, i, o) {
            var a = o("7726"), s = o("32e9"), l = o("69a8"), u = o("ca5a")("src"), c = o("fa5b"), f = "toString", p = ("" + c).split(f);
            o("8378").inspectSource = function(g) {
              return c.call(g);
            }, (e.exports = function(g, h, d, v) {
              var x = typeof d == "function";
              x && (l(d, "name") || s(d, "name", h)), g[h] !== d && (x && (l(d, u) || s(d, u, g[h] ? "" + g[h] : p.join(String(h)))), g === a ? g[h] = d : v ? g[h] ? g[h] = d : s(g, h, d) : (delete g[h], s(g, h, d)));
            })(Function.prototype, f, function() {
              return typeof this == "function" && this[u] || c.call(this);
            });
          }
        ),
        /***/
        "2aeb": (
          /***/
          function(e, i, o) {
            var a = o("cb7c"), s = o("1495"), l = o("e11e"), u = o("613b")("IE_PROTO"), c = function() {
            }, f = "prototype", p = function() {
              var g = o("230e")("iframe"), h = l.length, d = "<", v = ">", x;
              for (g.style.display = "none", o("fab2").appendChild(g), g.src = "javascript:", x = g.contentWindow.document, x.open(), x.write(d + "script" + v + "document.F=Object" + d + "/script" + v), x.close(), p = x.F; h--; )
                delete p[f][l[h]];
              return p();
            };
            e.exports = Object.create || function(h, d) {
              var v;
              return h !== null ? (c[f] = a(h), v = new c(), c[f] = null, v[u] = h) : v = p(), d === void 0 ? v : s(v, d);
            };
          }
        ),
        /***/
        "2b4c": (
          /***/
          function(e, i, o) {
            var a = o("5537")("wks"), s = o("ca5a"), l = o("7726").Symbol, u = typeof l == "function", c = e.exports = function(f) {
              return a[f] || (a[f] = u && l[f] || (u ? l : s)("Symbol." + f));
            };
            c.store = a;
          }
        ),
        /***/
        "2d00": (
          /***/
          function(e, i) {
            e.exports = !1;
          }
        ),
        /***/
        "2d95": (
          /***/
          function(e, i) {
            var o = {}.toString;
            e.exports = function(a) {
              return o.call(a).slice(8, -1);
            };
          }
        ),
        /***/
        "2fdb": (
          /***/
          function(e, i, o) {
            var a = o("5ca1"), s = o("d2c8"), l = "includes";
            a(a.P + a.F * o("5147")(l), "String", {
              includes: function(c) {
                return !!~s(this, c, l).indexOf(c, arguments.length > 1 ? arguments[1] : void 0);
              }
            });
          }
        ),
        /***/
        "32e9": (
          /***/
          function(e, i, o) {
            var a = o("86cc"), s = o("4630");
            e.exports = o("9e1e") ? function(l, u, c) {
              return a.f(l, u, s(1, c));
            } : function(l, u, c) {
              return l[u] = c, l;
            };
          }
        ),
        /***/
        "38fd": (
          /***/
          function(e, i, o) {
            var a = o("69a8"), s = o("4bf8"), l = o("613b")("IE_PROTO"), u = Object.prototype;
            e.exports = Object.getPrototypeOf || function(c) {
              return c = s(c), a(c, l) ? c[l] : typeof c.constructor == "function" && c instanceof c.constructor ? c.constructor.prototype : c instanceof Object ? u : null;
            };
          }
        ),
        /***/
        "41a0": (
          /***/
          function(e, i, o) {
            var a = o("2aeb"), s = o("4630"), l = o("7f20"), u = {};
            o("32e9")(u, o("2b4c")("iterator"), function() {
              return this;
            }), e.exports = function(c, f, p) {
              c.prototype = a(u, { next: s(1, p) }), l(c, f + " Iterator");
            };
          }
        ),
        /***/
        "456d": (
          /***/
          function(e, i, o) {
            var a = o("4bf8"), s = o("0d58");
            o("5eda")("keys", function() {
              return function(u) {
                return s(a(u));
              };
            });
          }
        ),
        /***/
        4588: (
          /***/
          function(e, i) {
            var o = Math.ceil, a = Math.floor;
            e.exports = function(s) {
              return isNaN(s = +s) ? 0 : (s > 0 ? a : o)(s);
            };
          }
        ),
        /***/
        4630: (
          /***/
          function(e, i) {
            e.exports = function(o, a) {
              return {
                enumerable: !(o & 1),
                configurable: !(o & 2),
                writable: !(o & 4),
                value: a
              };
            };
          }
        ),
        /***/
        "4bf8": (
          /***/
          function(e, i, o) {
            var a = o("be13");
            e.exports = function(s) {
              return Object(a(s));
            };
          }
        ),
        /***/
        5147: (
          /***/
          function(e, i, o) {
            var a = o("2b4c")("match");
            e.exports = function(s) {
              var l = /./;
              try {
                "/./"[s](l);
              } catch {
                try {
                  return l[a] = !1, !"/./"[s](l);
                } catch {
                }
              }
              return !0;
            };
          }
        ),
        /***/
        "520a": (
          /***/
          function(e, i, o) {
            var a = o("0bfb"), s = RegExp.prototype.exec, l = String.prototype.replace, u = s, c = "lastIndex", f = function() {
              var h = /a/, d = /b*/g;
              return s.call(h, "a"), s.call(d, "a"), h[c] !== 0 || d[c] !== 0;
            }(), p = /()??/.exec("")[1] !== void 0, g = f || p;
            g && (u = function(d) {
              var v = this, x, D, O, E;
              return p && (D = new RegExp("^" + v.source + "$(?!\\s)", a.call(v))), f && (x = v[c]), O = s.call(v, d), f && O && (v[c] = v.global ? O.index + O[0].length : x), p && O && O.length > 1 && l.call(O[0], D, function() {
                for (E = 1; E < arguments.length - 2; E++)
                  arguments[E] === void 0 && (O[E] = void 0);
              }), O;
            }), e.exports = u;
          }
        ),
        /***/
        "52a7": (
          /***/
          function(e, i) {
            i.f = {}.propertyIsEnumerable;
          }
        ),
        /***/
        5537: (
          /***/
          function(e, i, o) {
            var a = o("8378"), s = o("7726"), l = "__core-js_shared__", u = s[l] || (s[l] = {});
            (e.exports = function(c, f) {
              return u[c] || (u[c] = f !== void 0 ? f : {});
            })("versions", []).push({
              version: a.version,
              mode: o("2d00") ? "pure" : "global",
              copyright: "© 2019 Denis Pushkarev (zloirock.ru)"
            });
          }
        ),
        /***/
        "5ca1": (
          /***/
          function(e, i, o) {
            var a = o("7726"), s = o("8378"), l = o("32e9"), u = o("2aba"), c = o("9b43"), f = "prototype", p = function(g, h, d) {
              var v = g & p.F, x = g & p.G, D = g & p.S, O = g & p.P, E = g & p.B, L = x ? a : D ? a[h] || (a[h] = {}) : (a[h] || {})[f], U = x ? s : s[h] || (s[h] = {}), z = U[f] || (U[f] = {}), I, M, A, B;
              x && (d = h);
              for (I in d)
                M = !v && L && L[I] !== void 0, A = (M ? L : d)[I], B = E && M ? c(A, a) : O && typeof A == "function" ? c(Function.call, A) : A, L && u(L, I, A, g & p.U), U[I] != A && l(U, I, B), O && z[I] != A && (z[I] = A);
            };
            a.core = s, p.F = 1, p.G = 2, p.S = 4, p.P = 8, p.B = 16, p.W = 32, p.U = 64, p.R = 128, e.exports = p;
          }
        ),
        /***/
        "5eda": (
          /***/
          function(e, i, o) {
            var a = o("5ca1"), s = o("8378"), l = o("79e5");
            e.exports = function(u, c) {
              var f = (s.Object || {})[u] || Object[u], p = {};
              p[u] = c(f), a(a.S + a.F * l(function() {
                f(1);
              }), "Object", p);
            };
          }
        ),
        /***/
        "5f1b": (
          /***/
          function(e, i, o) {
            var a = o("23c6"), s = RegExp.prototype.exec;
            e.exports = function(l, u) {
              var c = l.exec;
              if (typeof c == "function") {
                var f = c.call(l, u);
                if (typeof f != "object")
                  throw new TypeError("RegExp exec method returned something other than an Object or null");
                return f;
              }
              if (a(l) !== "RegExp")
                throw new TypeError("RegExp#exec called on incompatible receiver");
              return s.call(l, u);
            };
          }
        ),
        /***/
        "613b": (
          /***/
          function(e, i, o) {
            var a = o("5537")("keys"), s = o("ca5a");
            e.exports = function(l) {
              return a[l] || (a[l] = s(l));
            };
          }
        ),
        /***/
        "626a": (
          /***/
          function(e, i, o) {
            var a = o("2d95");
            e.exports = Object("z").propertyIsEnumerable(0) ? Object : function(s) {
              return a(s) == "String" ? s.split("") : Object(s);
            };
          }
        ),
        /***/
        6762: (
          /***/
          function(e, i, o) {
            var a = o("5ca1"), s = o("c366")(!0);
            a(a.P, "Array", {
              includes: function(u) {
                return s(this, u, arguments.length > 1 ? arguments[1] : void 0);
              }
            }), o("9c6c")("includes");
          }
        ),
        /***/
        6821: (
          /***/
          function(e, i, o) {
            var a = o("626a"), s = o("be13");
            e.exports = function(l) {
              return a(s(l));
            };
          }
        ),
        /***/
        "69a8": (
          /***/
          function(e, i) {
            var o = {}.hasOwnProperty;
            e.exports = function(a, s) {
              return o.call(a, s);
            };
          }
        ),
        /***/
        "6a99": (
          /***/
          function(e, i, o) {
            var a = o("d3f4");
            e.exports = function(s, l) {
              if (!a(s))
                return s;
              var u, c;
              if (l && typeof (u = s.toString) == "function" && !a(c = u.call(s)) || typeof (u = s.valueOf) == "function" && !a(c = u.call(s)) || !l && typeof (u = s.toString) == "function" && !a(c = u.call(s)))
                return c;
              throw TypeError("Can't convert object to primitive value");
            };
          }
        ),
        /***/
        7333: (
          /***/
          function(e, i, o) {
            var a = o("0d58"), s = o("2621"), l = o("52a7"), u = o("4bf8"), c = o("626a"), f = Object.assign;
            e.exports = !f || o("79e5")(function() {
              var p = {}, g = {}, h = Symbol(), d = "abcdefghijklmnopqrst";
              return p[h] = 7, d.split("").forEach(function(v) {
                g[v] = v;
              }), f({}, p)[h] != 7 || Object.keys(f({}, g)).join("") != d;
            }) ? function(g, h) {
              for (var d = u(g), v = arguments.length, x = 1, D = s.f, O = l.f; v > x; )
                for (var E = c(arguments[x++]), L = D ? a(E).concat(D(E)) : a(E), U = L.length, z = 0, I; U > z; )
                  O.call(E, I = L[z++]) && (d[I] = E[I]);
              return d;
            } : f;
          }
        ),
        /***/
        7726: (
          /***/
          function(e, i) {
            var o = e.exports = typeof window < "u" && window.Math == Math ? window : typeof self < "u" && self.Math == Math ? self : Function("return this")();
            typeof __g == "number" && (__g = o);
          }
        ),
        /***/
        "77f1": (
          /***/
          function(e, i, o) {
            var a = o("4588"), s = Math.max, l = Math.min;
            e.exports = function(u, c) {
              return u = a(u), u < 0 ? s(u + c, 0) : l(u, c);
            };
          }
        ),
        /***/
        "79e5": (
          /***/
          function(e, i) {
            e.exports = function(o) {
              try {
                return !!o();
              } catch {
                return !0;
              }
            };
          }
        ),
        /***/
        "7f20": (
          /***/
          function(e, i, o) {
            var a = o("86cc").f, s = o("69a8"), l = o("2b4c")("toStringTag");
            e.exports = function(u, c, f) {
              u && !s(u = f ? u : u.prototype, l) && a(u, l, { configurable: !0, value: c });
            };
          }
        ),
        /***/
        8378: (
          /***/
          function(e, i) {
            var o = e.exports = { version: "2.6.5" };
            typeof __e == "number" && (__e = o);
          }
        ),
        /***/
        "84f2": (
          /***/
          function(e, i) {
            e.exports = {};
          }
        ),
        /***/
        "86cc": (
          /***/
          function(e, i, o) {
            var a = o("cb7c"), s = o("c69a"), l = o("6a99"), u = Object.defineProperty;
            i.f = o("9e1e") ? Object.defineProperty : function(f, p, g) {
              if (a(f), p = l(p, !0), a(g), s)
                try {
                  return u(f, p, g);
                } catch {
                }
              if ("get" in g || "set" in g)
                throw TypeError("Accessors not supported!");
              return "value" in g && (f[p] = g.value), f;
            };
          }
        ),
        /***/
        "9b43": (
          /***/
          function(e, i, o) {
            var a = o("d8e8");
            e.exports = function(s, l, u) {
              if (a(s), l === void 0)
                return s;
              switch (u) {
                case 1:
                  return function(c) {
                    return s.call(l, c);
                  };
                case 2:
                  return function(c, f) {
                    return s.call(l, c, f);
                  };
                case 3:
                  return function(c, f, p) {
                    return s.call(l, c, f, p);
                  };
              }
              return function() {
                return s.apply(l, arguments);
              };
            };
          }
        ),
        /***/
        "9c6c": (
          /***/
          function(e, i, o) {
            var a = o("2b4c")("unscopables"), s = Array.prototype;
            s[a] == null && o("32e9")(s, a, {}), e.exports = function(l) {
              s[a][l] = !0;
            };
          }
        ),
        /***/
        "9def": (
          /***/
          function(e, i, o) {
            var a = o("4588"), s = Math.min;
            e.exports = function(l) {
              return l > 0 ? s(a(l), 9007199254740991) : 0;
            };
          }
        ),
        /***/
        "9e1e": (
          /***/
          function(e, i, o) {
            e.exports = !o("79e5")(function() {
              return Object.defineProperty({}, "a", { get: function() {
                return 7;
              } }).a != 7;
            });
          }
        ),
        /***/
        a352: (
          /***/
          function(e, i) {
            e.exports = r;
          }
        ),
        /***/
        a481: (
          /***/
          function(e, i, o) {
            var a = o("cb7c"), s = o("4bf8"), l = o("9def"), u = o("4588"), c = o("0390"), f = o("5f1b"), p = Math.max, g = Math.min, h = Math.floor, d = /\$([$&`']|\d\d?|<[^>]*>)/g, v = /\$([$&`']|\d\d?)/g, x = function(D) {
              return D === void 0 ? D : String(D);
            };
            o("214f")("replace", 2, function(D, O, E, L) {
              return [
                // `String.prototype.replace` method
                // https://tc39.github.io/ecma262/#sec-string.prototype.replace
                function(I, M) {
                  var A = D(this), B = I == null ? void 0 : I[O];
                  return B !== void 0 ? B.call(I, A, M) : E.call(String(A), I, M);
                },
                // `RegExp.prototype[@@replace]` method
                // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
                function(z, I) {
                  var M = L(E, z, this, I);
                  if (M.done)
                    return M.value;
                  var A = a(z), B = String(this), J = typeof I == "function";
                  J || (I = String(I));
                  var nt = A.global;
                  if (nt) {
                    var tt = A.unicode;
                    A.lastIndex = 0;
                  }
                  for (var W = []; ; ) {
                    var G = f(A, B);
                    if (G === null || (W.push(G), !nt))
                      break;
                    var X = String(G[0]);
                    X === "" && (A.lastIndex = c(B, l(A.lastIndex), tt));
                  }
                  for (var ht = "", lt = 0, it = 0; it < W.length; it++) {
                    G = W[it];
                    for (var y = String(G[0]), m = p(g(u(G.index), B.length), 0), b = [], w = 1; w < G.length; w++)
                      b.push(x(G[w]));
                    var P = G.groups;
                    if (J) {
                      var j = [y].concat(b, m, B);
                      P !== void 0 && j.push(P);
                      var H = String(I.apply(void 0, j));
                    } else
                      H = U(y, B, m, b, P, I);
                    m >= lt && (ht += B.slice(lt, m) + H, lt = m + y.length);
                  }
                  return ht + B.slice(lt);
                }
              ];
              function U(z, I, M, A, B, J) {
                var nt = M + z.length, tt = A.length, W = v;
                return B !== void 0 && (B = s(B), W = d), E.call(J, W, function(G, X) {
                  var ht;
                  switch (X.charAt(0)) {
                    case "$":
                      return "$";
                    case "&":
                      return z;
                    case "`":
                      return I.slice(0, M);
                    case "'":
                      return I.slice(nt);
                    case "<":
                      ht = B[X.slice(1, -1)];
                      break;
                    default:
                      var lt = +X;
                      if (lt === 0)
                        return G;
                      if (lt > tt) {
                        var it = h(lt / 10);
                        return it === 0 ? G : it <= tt ? A[it - 1] === void 0 ? X.charAt(1) : A[it - 1] + X.charAt(1) : G;
                      }
                      ht = A[lt - 1];
                  }
                  return ht === void 0 ? "" : ht;
                });
              }
            });
          }
        ),
        /***/
        aae3: (
          /***/
          function(e, i, o) {
            var a = o("d3f4"), s = o("2d95"), l = o("2b4c")("match");
            e.exports = function(u) {
              var c;
              return a(u) && ((c = u[l]) !== void 0 ? !!c : s(u) == "RegExp");
            };
          }
        ),
        /***/
        ac6a: (
          /***/
          function(e, i, o) {
            for (var a = o("cadf"), s = o("0d58"), l = o("2aba"), u = o("7726"), c = o("32e9"), f = o("84f2"), p = o("2b4c"), g = p("iterator"), h = p("toStringTag"), d = f.Array, v = {
              CSSRuleList: !0,
              // TODO: Not spec compliant, should be false.
              CSSStyleDeclaration: !1,
              CSSValueList: !1,
              ClientRectList: !1,
              DOMRectList: !1,
              DOMStringList: !1,
              DOMTokenList: !0,
              DataTransferItemList: !1,
              FileList: !1,
              HTMLAllCollection: !1,
              HTMLCollection: !1,
              HTMLFormElement: !1,
              HTMLSelectElement: !1,
              MediaList: !0,
              // TODO: Not spec compliant, should be false.
              MimeTypeArray: !1,
              NamedNodeMap: !1,
              NodeList: !0,
              PaintRequestList: !1,
              Plugin: !1,
              PluginArray: !1,
              SVGLengthList: !1,
              SVGNumberList: !1,
              SVGPathSegList: !1,
              SVGPointList: !1,
              SVGStringList: !1,
              SVGTransformList: !1,
              SourceBufferList: !1,
              StyleSheetList: !0,
              // TODO: Not spec compliant, should be false.
              TextTrackCueList: !1,
              TextTrackList: !1,
              TouchList: !1
            }, x = s(v), D = 0; D < x.length; D++) {
              var O = x[D], E = v[O], L = u[O], U = L && L.prototype, z;
              if (U && (U[g] || c(U, g, d), U[h] || c(U, h, O), f[O] = d, E))
                for (z in a)
                  U[z] || l(U, z, a[z], !0);
            }
          }
        ),
        /***/
        b0c5: (
          /***/
          function(e, i, o) {
            var a = o("520a");
            o("5ca1")({
              target: "RegExp",
              proto: !0,
              forced: a !== /./.exec
            }, {
              exec: a
            });
          }
        ),
        /***/
        be13: (
          /***/
          function(e, i) {
            e.exports = function(o) {
              if (o == null)
                throw TypeError("Can't call method on  " + o);
              return o;
            };
          }
        ),
        /***/
        c366: (
          /***/
          function(e, i, o) {
            var a = o("6821"), s = o("9def"), l = o("77f1");
            e.exports = function(u) {
              return function(c, f, p) {
                var g = a(c), h = s(g.length), d = l(p, h), v;
                if (u && f != f) {
                  for (; h > d; )
                    if (v = g[d++], v != v)
                      return !0;
                } else
                  for (; h > d; d++)
                    if ((u || d in g) && g[d] === f)
                      return u || d || 0;
                return !u && -1;
              };
            };
          }
        ),
        /***/
        c649: (
          /***/
          function(e, i, o) {
            (function(a) {
              o.d(i, "c", function() {
                return g;
              }), o.d(i, "a", function() {
                return f;
              }), o.d(i, "b", function() {
                return l;
              }), o.d(i, "d", function() {
                return p;
              }), o("a481");
              function s() {
                return typeof window < "u" ? window.console : a.console;
              }
              var l = s();
              function u(h) {
                var d = /* @__PURE__ */ Object.create(null);
                return function(x) {
                  var D = d[x];
                  return D || (d[x] = h(x));
                };
              }
              var c = /-(\w)/g, f = u(function(h) {
                return h.replace(c, function(d, v) {
                  return v ? v.toUpperCase() : "";
                });
              });
              function p(h) {
                h.parentElement !== null && h.parentElement.removeChild(h);
              }
              function g(h, d, v) {
                var x = v === 0 ? h.children[0] : h.children[v - 1].nextSibling;
                h.insertBefore(d, x);
              }
            }).call(this, o("c8ba"));
          }
        ),
        /***/
        c69a: (
          /***/
          function(e, i, o) {
            e.exports = !o("9e1e") && !o("79e5")(function() {
              return Object.defineProperty(o("230e")("div"), "a", { get: function() {
                return 7;
              } }).a != 7;
            });
          }
        ),
        /***/
        c8ba: (
          /***/
          function(e, i) {
            var o;
            o = function() {
              return this;
            }();
            try {
              o = o || new Function("return this")();
            } catch {
              typeof window == "object" && (o = window);
            }
            e.exports = o;
          }
        ),
        /***/
        ca5a: (
          /***/
          function(e, i) {
            var o = 0, a = Math.random();
            e.exports = function(s) {
              return "Symbol(".concat(s === void 0 ? "" : s, ")_", (++o + a).toString(36));
            };
          }
        ),
        /***/
        cadf: (
          /***/
          function(e, i, o) {
            var a = o("9c6c"), s = o("d53b"), l = o("84f2"), u = o("6821");
            e.exports = o("01f9")(Array, "Array", function(c, f) {
              this._t = u(c), this._i = 0, this._k = f;
            }, function() {
              var c = this._t, f = this._k, p = this._i++;
              return !c || p >= c.length ? (this._t = void 0, s(1)) : f == "keys" ? s(0, p) : f == "values" ? s(0, c[p]) : s(0, [p, c[p]]);
            }, "values"), l.Arguments = l.Array, a("keys"), a("values"), a("entries");
          }
        ),
        /***/
        cb7c: (
          /***/
          function(e, i, o) {
            var a = o("d3f4");
            e.exports = function(s) {
              if (!a(s))
                throw TypeError(s + " is not an object!");
              return s;
            };
          }
        ),
        /***/
        ce10: (
          /***/
          function(e, i, o) {
            var a = o("69a8"), s = o("6821"), l = o("c366")(!1), u = o("613b")("IE_PROTO");
            e.exports = function(c, f) {
              var p = s(c), g = 0, h = [], d;
              for (d in p)
                d != u && a(p, d) && h.push(d);
              for (; f.length > g; )
                a(p, d = f[g++]) && (~l(h, d) || h.push(d));
              return h;
            };
          }
        ),
        /***/
        d2c8: (
          /***/
          function(e, i, o) {
            var a = o("aae3"), s = o("be13");
            e.exports = function(l, u, c) {
              if (a(u))
                throw TypeError("String#" + c + " doesn't accept regex!");
              return String(s(l));
            };
          }
        ),
        /***/
        d3f4: (
          /***/
          function(e, i) {
            e.exports = function(o) {
              return typeof o == "object" ? o !== null : typeof o == "function";
            };
          }
        ),
        /***/
        d53b: (
          /***/
          function(e, i) {
            e.exports = function(o, a) {
              return { value: a, done: !!o };
            };
          }
        ),
        /***/
        d8e8: (
          /***/
          function(e, i) {
            e.exports = function(o) {
              if (typeof o != "function")
                throw TypeError(o + " is not a function!");
              return o;
            };
          }
        ),
        /***/
        e11e: (
          /***/
          function(e, i) {
            e.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");
          }
        ),
        /***/
        f559: (
          /***/
          function(e, i, o) {
            var a = o("5ca1"), s = o("9def"), l = o("d2c8"), u = "startsWith", c = ""[u];
            a(a.P + a.F * o("5147")(u), "String", {
              startsWith: function(p) {
                var g = l(this, p, u), h = s(Math.min(arguments.length > 1 ? arguments[1] : void 0, g.length)), d = String(p);
                return c ? c.call(g, d, h) : g.slice(h, h + d.length) === d;
              }
            });
          }
        ),
        /***/
        f6fd: (
          /***/
          function(e, i) {
            (function(o) {
              var a = "currentScript", s = o.getElementsByTagName("script");
              a in o || Object.defineProperty(o, a, {
                get: function() {
                  try {
                    throw new Error();
                  } catch (c) {
                    var l, u = (/.*at [^\(]*\((.*):.+:.+\)$/ig.exec(c.stack) || [!1])[1];
                    for (l in s)
                      if (s[l].src == u || s[l].readyState == "interactive")
                        return s[l];
                    return null;
                  }
                }
              });
            })(document);
          }
        ),
        /***/
        f751: (
          /***/
          function(e, i, o) {
            var a = o("5ca1");
            a(a.S + a.F, "Object", { assign: o("7333") });
          }
        ),
        /***/
        fa5b: (
          /***/
          function(e, i, o) {
            e.exports = o("5537")("native-function-to-string", Function.toString);
          }
        ),
        /***/
        fab2: (
          /***/
          function(e, i, o) {
            var a = o("7726").document;
            e.exports = a && a.documentElement;
          }
        ),
        /***/
        fb15: (
          /***/
          function(e, i, o) {
            if (o.r(i), typeof window < "u") {
              o("f6fd");
              var a;
              (a = window.document.currentScript) && (a = a.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)) && (o.p = a[1]);
            }
            o("f751"), o("f559"), o("ac6a"), o("cadf"), o("456d");
            function s(y) {
              if (Array.isArray(y))
                return y;
            }
            function l(y, m) {
              if (!(typeof Symbol > "u" || !(Symbol.iterator in Object(y)))) {
                var b = [], w = !0, P = !1, j = void 0;
                try {
                  for (var H = y[Symbol.iterator](), et; !(w = (et = H.next()).done) && (b.push(et.value), !(m && b.length === m)); w = !0)
                    ;
                } catch (Ct) {
                  P = !0, j = Ct;
                } finally {
                  try {
                    !w && H.return != null && H.return();
                  } finally {
                    if (P)
                      throw j;
                  }
                }
                return b;
              }
            }
            function u(y, m) {
              (m == null || m > y.length) && (m = y.length);
              for (var b = 0, w = new Array(m); b < m; b++)
                w[b] = y[b];
              return w;
            }
            function c(y, m) {
              if (y) {
                if (typeof y == "string")
                  return u(y, m);
                var b = Object.prototype.toString.call(y).slice(8, -1);
                if (b === "Object" && y.constructor && (b = y.constructor.name), b === "Map" || b === "Set")
                  return Array.from(y);
                if (b === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(b))
                  return u(y, m);
              }
            }
            function f() {
              throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
            }
            function p(y, m) {
              return s(y) || l(y, m) || c(y, m) || f();
            }
            o("6762"), o("2fdb");
            function g(y) {
              if (Array.isArray(y))
                return u(y);
            }
            function h(y) {
              if (typeof Symbol < "u" && Symbol.iterator in Object(y))
                return Array.from(y);
            }
            function d() {
              throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
            }
            function v(y) {
              return g(y) || h(y) || c(y) || d();
            }
            var x = o("a352"), D = /* @__PURE__ */ o.n(x), O = o("c649");
            function E(y, m, b) {
              return b === void 0 || (y = y || {}, y[m] = b), y;
            }
            function L(y, m) {
              return y.map(function(b) {
                return b.elm;
              }).indexOf(m);
            }
            function U(y, m, b, w) {
              if (!y)
                return [];
              var P = y.map(function(et) {
                return et.elm;
              }), j = m.length - w, H = v(m).map(function(et, Ct) {
                return Ct >= j ? P.length : P.indexOf(et);
              });
              return b ? H.filter(function(et) {
                return et !== -1;
              }) : H;
            }
            function z(y, m) {
              var b = this;
              this.$nextTick(function() {
                return b.$emit(y.toLowerCase(), m);
              });
            }
            function I(y) {
              var m = this;
              return function(b) {
                m.realList !== null && m["onDrag" + y](b), z.call(m, y, b);
              };
            }
            function M(y) {
              return ["transition-group", "TransitionGroup"].includes(y);
            }
            function A(y) {
              if (!y || y.length !== 1)
                return !1;
              var m = p(y, 1), b = m[0].componentOptions;
              return b ? M(b.tag) : !1;
            }
            function B(y, m, b) {
              return y[b] || (m[b] ? m[b]() : void 0);
            }
            function J(y, m, b) {
              var w = 0, P = 0, j = B(m, b, "header");
              j && (w = j.length, y = y ? [].concat(v(j), v(y)) : v(j));
              var H = B(m, b, "footer");
              return H && (P = H.length, y = y ? [].concat(v(y), v(H)) : v(H)), {
                children: y,
                headerOffset: w,
                footerOffset: P
              };
            }
            function nt(y, m) {
              var b = null, w = function(re, Dn) {
                b = E(b, re, Dn);
              }, P = Object.keys(y).filter(function(Ct) {
                return Ct === "id" || Ct.startsWith("data-");
              }).reduce(function(Ct, re) {
                return Ct[re] = y[re], Ct;
              }, {});
              if (w("attrs", P), !m)
                return b;
              var j = m.on, H = m.props, et = m.attrs;
              return w("on", j), w("props", H), Object.assign(b.attrs, et), b;
            }
            var tt = ["Start", "Add", "Remove", "Update", "End"], W = ["Choose", "Unchoose", "Sort", "Filter", "Clone"], G = ["Move"].concat(tt, W).map(function(y) {
              return "on" + y;
            }), X = null, ht = {
              options: Object,
              list: {
                type: Array,
                required: !1,
                default: null
              },
              value: {
                type: Array,
                required: !1,
                default: null
              },
              noTransitionOnDrag: {
                type: Boolean,
                default: !1
              },
              clone: {
                type: Function,
                default: function(m) {
                  return m;
                }
              },
              element: {
                type: String,
                default: "div"
              },
              tag: {
                type: String,
                default: null
              },
              move: {
                type: Function,
                default: null
              },
              componentData: {
                type: Object,
                required: !1,
                default: null
              }
            }, lt = {
              name: "draggable",
              inheritAttrs: !1,
              props: ht,
              data: function() {
                return {
                  transitionMode: !1,
                  noneFunctionalComponentMode: !1
                };
              },
              render: function(m) {
                var b = this.$slots.default;
                this.transitionMode = A(b);
                var w = J(b, this.$slots, this.$scopedSlots), P = w.children, j = w.headerOffset, H = w.footerOffset;
                this.headerOffset = j, this.footerOffset = H;
                var et = nt(this.$attrs, this.componentData);
                return m(this.getTag(), et, P);
              },
              created: function() {
                this.list !== null && this.value !== null && O.b.error("Value and list props are mutually exclusive! Please set one or another."), this.element !== "div" && O.b.warn("Element props is deprecated please use tag props instead. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#element-props"), this.options !== void 0 && O.b.warn("Options props is deprecated, add sortable options directly as vue.draggable item, or use v-bind. See https://github.com/SortableJS/Vue.Draggable/blob/master/documentation/migrate.md#options-props");
              },
              mounted: function() {
                var m = this;
                if (this.noneFunctionalComponentMode = this.getTag().toLowerCase() !== this.$el.nodeName.toLowerCase() && !this.getIsFunctional(), this.noneFunctionalComponentMode && this.transitionMode)
                  throw new Error("Transition-group inside component is not supported. Please alter tag value or remove transition-group. Current tag value: ".concat(this.getTag()));
                var b = {};
                tt.forEach(function(j) {
                  b["on" + j] = I.call(m, j);
                }), W.forEach(function(j) {
                  b["on" + j] = z.bind(m, j);
                });
                var w = Object.keys(this.$attrs).reduce(function(j, H) {
                  return j[Object(O.a)(H)] = m.$attrs[H], j;
                }, {}), P = Object.assign({}, this.options, w, b, {
                  onMove: function(H, et) {
                    return m.onDragMove(H, et);
                  }
                });
                !("draggable" in P) && (P.draggable = ">*"), this._sortable = new D.a(this.rootContainer, P), this.computeIndexes();
              },
              beforeDestroy: function() {
                this._sortable !== void 0 && this._sortable.destroy();
              },
              computed: {
                rootContainer: function() {
                  return this.transitionMode ? this.$el.children[0] : this.$el;
                },
                realList: function() {
                  return this.list ? this.list : this.value;
                }
              },
              watch: {
                options: {
                  handler: function(m) {
                    this.updateOptions(m);
                  },
                  deep: !0
                },
                $attrs: {
                  handler: function(m) {
                    this.updateOptions(m);
                  },
                  deep: !0
                },
                realList: function() {
                  this.computeIndexes();
                }
              },
              methods: {
                getIsFunctional: function() {
                  var m = this._vnode.fnOptions;
                  return m && m.functional;
                },
                getTag: function() {
                  return this.tag || this.element;
                },
                updateOptions: function(m) {
                  for (var b in m) {
                    var w = Object(O.a)(b);
                    G.indexOf(w) === -1 && this._sortable.option(w, m[b]);
                  }
                },
                getChildrenNodes: function() {
                  if (this.noneFunctionalComponentMode)
                    return this.$children[0].$slots.default;
                  var m = this.$slots.default;
                  return this.transitionMode ? m[0].child.$slots.default : m;
                },
                computeIndexes: function() {
                  var m = this;
                  this.$nextTick(function() {
                    m.visibleIndexes = U(m.getChildrenNodes(), m.rootContainer.children, m.transitionMode, m.footerOffset);
                  });
                },
                getUnderlyingVm: function(m) {
                  var b = L(this.getChildrenNodes() || [], m);
                  if (b === -1)
                    return null;
                  var w = this.realList[b];
                  return {
                    index: b,
                    element: w
                  };
                },
                getUnderlyingPotencialDraggableComponent: function(m) {
                  var b = m.__vue__;
                  return !b || !b.$options || !M(b.$options._componentTag) ? !("realList" in b) && b.$children.length === 1 && "realList" in b.$children[0] ? b.$children[0] : b : b.$parent;
                },
                emitChanges: function(m) {
                  var b = this;
                  this.$nextTick(function() {
                    b.$emit("change", m);
                  });
                },
                alterList: function(m) {
                  if (this.list) {
                    m(this.list);
                    return;
                  }
                  var b = v(this.value);
                  m(b), this.$emit("input", b);
                },
                spliceList: function() {
                  var m = arguments, b = function(P) {
                    return P.splice.apply(P, v(m));
                  };
                  this.alterList(b);
                },
                updatePosition: function(m, b) {
                  var w = function(j) {
                    return j.splice(b, 0, j.splice(m, 1)[0]);
                  };
                  this.alterList(w);
                },
                getRelatedContextFromMoveEvent: function(m) {
                  var b = m.to, w = m.related, P = this.getUnderlyingPotencialDraggableComponent(b);
                  if (!P)
                    return {
                      component: P
                    };
                  var j = P.realList, H = {
                    list: j,
                    component: P
                  };
                  if (b !== w && j && P.getUnderlyingVm) {
                    var et = P.getUnderlyingVm(w);
                    if (et)
                      return Object.assign(et, H);
                  }
                  return H;
                },
                getVmIndex: function(m) {
                  var b = this.visibleIndexes, w = b.length;
                  return m > w - 1 ? w : b[m];
                },
                getComponent: function() {
                  return this.$slots.default[0].componentInstance;
                },
                resetTransitionData: function(m) {
                  if (!(!this.noTransitionOnDrag || !this.transitionMode)) {
                    var b = this.getChildrenNodes();
                    b[m].data = null;
                    var w = this.getComponent();
                    w.children = [], w.kept = void 0;
                  }
                },
                onDragStart: function(m) {
                  this.context = this.getUnderlyingVm(m.item), m.item._underlying_vm_ = this.clone(this.context.element), X = m.item;
                },
                onDragAdd: function(m) {
                  var b = m.item._underlying_vm_;
                  if (b !== void 0) {
                    Object(O.d)(m.item);
                    var w = this.getVmIndex(m.newIndex);
                    this.spliceList(w, 0, b), this.computeIndexes();
                    var P = {
                      element: b,
                      newIndex: w
                    };
                    this.emitChanges({
                      added: P
                    });
                  }
                },
                onDragRemove: function(m) {
                  if (Object(O.c)(this.rootContainer, m.item, m.oldIndex), m.pullMode === "clone") {
                    Object(O.d)(m.clone);
                    return;
                  }
                  var b = this.context.index;
                  this.spliceList(b, 1);
                  var w = {
                    element: this.context.element,
                    oldIndex: b
                  };
                  this.resetTransitionData(b), this.emitChanges({
                    removed: w
                  });
                },
                onDragUpdate: function(m) {
                  Object(O.d)(m.item), Object(O.c)(m.from, m.item, m.oldIndex);
                  var b = this.context.index, w = this.getVmIndex(m.newIndex);
                  this.updatePosition(b, w);
                  var P = {
                    element: this.context.element,
                    oldIndex: b,
                    newIndex: w
                  };
                  this.emitChanges({
                    moved: P
                  });
                },
                updateProperty: function(m, b) {
                  m.hasOwnProperty(b) && (m[b] += this.headerOffset);
                },
                computeFutureIndex: function(m, b) {
                  if (!m.element)
                    return 0;
                  var w = v(b.to.children).filter(function(et) {
                    return et.style.display !== "none";
                  }), P = w.indexOf(b.related), j = m.component.getVmIndex(P), H = w.indexOf(X) !== -1;
                  return H || !b.willInsertAfter ? j : j + 1;
                },
                onDragMove: function(m, b) {
                  var w = this.move;
                  if (!w || !this.realList)
                    return !0;
                  var P = this.getRelatedContextFromMoveEvent(m), j = this.context, H = this.computeFutureIndex(P, m);
                  Object.assign(j, {
                    futureIndex: H
                  });
                  var et = Object.assign({}, m, {
                    relatedContext: P,
                    draggedContext: j
                  });
                  return w(et, b);
                },
                onDragEnd: function() {
                  this.computeIndexes(), X = null;
                }
              }
            };
            typeof window < "u" && "Vue" in window && window.Vue.component("draggable", lt);
            var it = lt;
            i.default = it;
          }
        )
        /******/
      }).default
    );
  });
})(fn);
var mr = fn.exports;
const vr = /* @__PURE__ */ jn(mr), br = {
  name: "vue-pivottable-ui",
  mixins: [Ce],
  model: {
    prop: "config",
    event: "onRefresh"
  },
  props: {
    async: {
      type: Boolean,
      default: !1
    },
    hiddenAttributes: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromAggregators: {
      type: Array,
      default: function() {
        return [];
      }
    },
    hiddenFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    sortonlyFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    disabledFromDragDrop: {
      type: Array,
      default: function() {
        return [];
      }
    },
    menuLimit: {
      type: Number,
      default: 500
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  computed: {
    appliedFilter() {
      return this.propsData.valueFilter;
    },
    rendererItems() {
      return this.renderers || Object.assign({}, Ke);
    },
    aggregatorItems() {
      var t, n;
      return ((n = (t = this.locales) == null ? void 0 : t[this.locale]) == null ? void 0 : n.aggregators) || this.aggregators || te;
    },
    numValsAllowed() {
      return this.aggregatorItems[this.aggregatorName]([])().numInputs || 0;
    },
    rowAttrs() {
      return this.propsData.rows.filter(
        (t) => !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      );
    },
    colAttrs() {
      return this.propsData.cols.filter(
        (t) => !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      );
    },
    unusedAttrs() {
      return this.propsData.attributes.filter(
        (t) => !this.propsData.rows.includes(t) && !this.propsData.cols.includes(t) && !this.hiddenAttributes.includes(t) && !this.hiddenFromDragDrop.includes(t)
      ).sort(cn(this.unusedOrder));
    }
  },
  data() {
    return {
      propsData: {
        aggregatorName: "",
        rendererName: "",
        rowOrder: "key_a_to_z",
        colOrder: "key_a_to_z",
        vals: [],
        cols: [],
        rows: [],
        attributes: [],
        valueFilter: {},
        renderer: null
      },
      pivotData: [],
      openStatus: {},
      attrValues: {},
      unusedOrder: [],
      zIndices: {},
      maxZIndex: 1e3,
      openDropdown: !1,
      materializedInput: [],
      sortIcons: {
        key_a_to_z: {
          rowSymbol: "↕",
          colSymbol: "↔",
          next: "value_a_to_z"
        },
        value_a_to_z: {
          rowSymbol: "↓",
          colSymbol: "→",
          next: "value_z_to_a"
        },
        value_z_to_a: {
          rowSymbol: "↑",
          colSymbol: "←",
          next: "key_a_to_z"
        }
      }
    };
  },
  beforeUpdated(t) {
    this.materializeInput(t.data);
  },
  watch: {
    aggregatorName: {
      handler(t) {
        this.propsData.aggregatorName = t;
      }
    },
    locale: {
      handler(t) {
        var n, r;
        this.propsData.locale = t, this.propsData.aggregators = (r = (n = this.locales) == null ? void 0 : n[this.locale]) == null ? void 0 : r.aggregator;
      }
    },
    rowOrder: {
      handler(t) {
        this.propsData.rowOrder = t;
      }
    },
    colOrder: {
      handler(t) {
        this.propsData.colOrder = t;
      }
    },
    cols: {
      handler(t) {
        this.propsData.cols = t;
      }
    },
    rows: {
      handler(t) {
        this.propsData.rows = t;
      }
    },
    rendererName: {
      handler(t) {
        this.propsData.rendererName = t;
      }
    },
    appliedFilter: {
      handler(t, n) {
        this.$emit("update:valueFilter", t);
      },
      immediate: !0,
      deep: !0
    },
    valueFilter: {
      handler(t) {
        this.propsData.valueFilter = t;
      },
      immediate: !0,
      deep: !0
    },
    data: {
      handler(t) {
        this.init();
      },
      immediate: !0,
      deep: !0
    },
    attributes: {
      handler(t) {
        this.propsData.attributes = t.length > 0 ? t : Object.keys(this.attrValues);
      },
      deep: !0
    },
    propsData: {
      handler(t) {
        if (this.pivotData.length === 0)
          return;
        const n = {
          derivedAttributes: this.derivedAttributes,
          hiddenAttributes: this.hiddenAttributes,
          hiddenFromAggregators: this.hiddenFromAggregators,
          hiddenFromDragDrop: this.hiddenFromDragDrop,
          sortonlyFromDragDrop: this.sortonlyFromDragDrop,
          disabledFromDragDrop: this.disabledFromDragDrop,
          menuLimit: this.menuLimit,
          attributes: t.attributes,
          unusedAttrs: this.unusedAttrs,
          sorters: this.sorters,
          data: this.materializedInput,
          rowOrder: t.rowOrder,
          colOrder: t.colOrder,
          valueFilter: t.valueFilter,
          rows: t.rows,
          cols: t.cols,
          rendererName: t.rendererName,
          aggregatorName: t.aggregatorName,
          aggregators: this.aggregatorItems,
          vals: t.vals
        };
        this.$emit("onRefresh", n);
      },
      immediate: !1,
      deep: !0
    }
  },
  methods: {
    init() {
      this.materializeInput(this.data), this.propsData.vals = this.vals.slice(), this.propsData.rows = this.rows, this.propsData.cols = this.cols, this.propsData.rowOrder = this.rowOrder, this.propsData.colOrder = this.colOrder, this.propsData.rendererName = this.rendererName, this.propsData.aggregatorName = this.aggregatorName, this.propsData.attributes = this.attributes.length > 0 ? this.attributes : Object.keys(this.attrValues), this.unusedOrder = this.unusedAttrs, Object.keys(this.attrValues).forEach((t) => {
        let n = {};
        const r = this.valueFilter && this.valueFilter[t];
        r && Object.keys(r).length && (n = this.valueFilter[t]), this.updateValueFilter({
          attribute: t,
          valueFilter: n
        });
      });
    },
    assignValue(t) {
      this.$set(this.propsData.valueFilter, t, {});
    },
    propUpdater(t) {
      return (n) => {
        this.propsData[t] = n;
      };
    },
    updateValueFilter({ attribute: t, valueFilter: n }) {
      this.$set(this.propsData.valueFilter, t, n);
    },
    moveFilterBoxToTop({ attribute: t }) {
      this.maxZIndex += 1, this.zIndices[t] = this.maxZIndex + 1;
    },
    openFilterBox({ attribute: t, open: n }) {
      this.$set(this.openStatus, t, n);
    },
    closeFilterBox(t) {
      this.openStatus = {};
    },
    materializeInput(t) {
      if (this.pivotData === t)
        return;
      this.pivotData = t;
      const n = {}, r = [];
      let e = 0;
      Dt.forEachRecord(
        this.pivotData,
        this.derivedAttributes,
        function(i) {
          r.push(i);
          for (const o of Object.keys(i))
            o in n || (n[o] = {}, e > 0 && (n[o].null = e));
          for (const o in n) {
            const a = o in i ? i[o] : "null";
            a in n[o] || (n[o][a] = 0), n[o][a]++;
          }
          e++;
        }
      ), this.materializedInput = r, this.attrValues = n;
    },
    makeDnDCell(t, n, r, e) {
      const i = this.$scopedSlots.pvtAttr;
      return e(
        vr,
        {
          attrs: {
            draggable: "li[data-id]",
            group: "sharted",
            ghostClass: ".pvtPlaceholder",
            filter: ".pvtFilterBox",
            preventOnFilter: !1,
            tag: "td"
          },
          props: {
            value: t
          },
          staticClass: r,
          on: {
            sort: n.bind(this)
          }
        },
        [
          t.map((o) => e(Nn, {
            scopedSlots: i ? {
              pvtAttr: (a) => e("slot", i(a))
            } : void 0,
            props: {
              sortable: this.sortonlyFromDragDrop.includes(o) || !this.disabledFromDragDrop.includes(o),
              draggable: !this.sortonlyFromDragDrop.includes(o) && !this.disabledFromDragDrop.includes(o),
              name: o,
              key: o,
              attrValues: this.attrValues[o],
              sorter: De(this.sorters, o),
              menuLimit: this.menuLimit,
              zIndex: this.zIndices[o] || this.maxZIndex,
              valueFilter: this.propsData.valueFilter[o],
              open: this.openStatus[o],
              async: this.async,
              unused: this.unusedAttrs.includes(o),
              localeStrings: this.locales[this.locale].localeStrings
            },
            domProps: {},
            on: {
              "update:filter": this.updateValueFilter,
              "moveToTop:filterbox": this.moveFilterBoxToTop,
              "open:filterbox": this.openFilterBox,
              "no:filterbox": () => this.$emit("no:filterbox")
            }
          }))
        ]
      );
    },
    rendererCell(t, n) {
      return this.$slots.rendererCell ? n(
        "td",
        {
          staticClass: ["pvtRenderers pvtVals pvtText"]
        },
        this.$slots.rendererCell
      ) : n(
        "td",
        {
          staticClass: ["pvtRenderers"]
        },
        [
          n(Ee, {
            props: {
              values: Object.keys(this.rendererItems),
              value: t
            },
            on: {
              input: (r) => {
                this.propUpdater("rendererName")(r), this.propUpdater("renderer", this.rendererItems[this.rendererName]);
              }
            }
          })
        ]
      );
    },
    aggregatorCell(t, n, r) {
      return this.$slots.aggregatorCell ? r(
        "td",
        {
          staticClass: ["pvtVals pvtText"]
        },
        this.$slots.aggregatorCell
      ) : r(
        "td",
        {
          staticClass: ["pvtVals"]
        },
        [
          r("div", [
            r(Ee, {
              props: {
                values: Object.keys(this.aggregatorItems),
                value: t
              },
              on: {
                input: (e) => {
                  this.propUpdater("aggregatorName")(e);
                }
              }
            }),
            r(
              "a",
              {
                staticClass: ["pvtRowOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("rowOrder")(
                      this.sortIcons[this.propsData.rowOrder].next
                    );
                  }
                }
              },
              this.sortIcons[this.propsData.rowOrder].rowSymbol
            ),
            r(
              "a",
              {
                staticClass: ["pvtColOrder"],
                attrs: {
                  role: "button"
                },
                on: {
                  click: () => {
                    this.propUpdater("colOrder")(
                      this.sortIcons[this.propsData.colOrder].next
                    );
                  }
                }
              },
              this.sortIcons[this.propsData.colOrder].colSymbol
            )
          ]),
          this.numValsAllowed > 0 ? new Array(this.numValsAllowed).fill().map((e, i) => [
            r(Ee, {
              props: {
                values: Object.keys(this.attrValues).filter(
                  (o) => !this.hiddenAttributes.includes(o) && !this.hiddenFromAggregators.includes(o)
                ),
                value: n[i]
              },
              on: {
                input: (o) => {
                  this.propsData.vals.splice(i, 1, o);
                }
              }
            })
          ]) : void 0
        ]
      );
    },
    outputCell(t, n, r) {
      return r(
        "td",
        {
          staticClass: ["pvtOutput"]
        },
        [
          r(Xe, {
            props: Object.assign(t, { tableMaxWidth: this.tableMaxWidth })
          })
        ]
      );
    }
  },
  render(t) {
    if (this.data.length < 1)
      return;
    const n = this.$scopedSlots.output, r = this.$slots.output, e = this.propsData.rendererName, i = this.propsData.aggregatorName, o = this.propsData.vals, a = this.makeDnDCell(
      this.unusedAttrs,
      (d) => {
        const v = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(v) && (!d.from.classList.contains("pvtUnused") || !d.to.classList.contains("pvtUnused")) || (d.from.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: v, open: !1 }), this.unusedOrder.splice(d.oldIndex, 1), this.$emit("dragged:unused", v)), d.to.classList.contains("pvtUnused") && (this.openFilterBox({ attribute: v, open: !1 }), this.unusedOrder.splice(d.newIndex, 0, v), this.$emit("dropped:unused", v)));
      },
      "pvtAxisContainer pvtUnused pvtHorizList",
      t
    ), s = this.makeDnDCell(
      this.colAttrs,
      (d) => {
        const v = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(v) && (!d.from.classList.contains("pvtCols") || !d.to.classList.contains("pvtCols")) || (d.from.classList.contains("pvtCols") && (this.propsData.cols.splice(d.oldIndex, 1), this.$emit("dragged:cols", v)), d.to.classList.contains("pvtCols") && (this.propsData.cols.splice(d.newIndex, 0, v), this.$emit("dropped:cols", v)));
      },
      "pvtAxisContainer pvtHorizList pvtCols",
      t
    ), l = this.makeDnDCell(
      this.rowAttrs,
      (d) => {
        const v = d.item.getAttribute("data-id");
        this.sortonlyFromDragDrop.includes(v) && (!d.from.classList.contains("pvtRows") || !d.to.classList.contains("pvtRows")) || (d.from.classList.contains("pvtRows") && (this.propsData.rows.splice(d.oldIndex, 1), this.$emit("dragged:rows", v)), d.to.classList.contains("pvtRows") && (this.propsData.rows.splice(d.newIndex, 0, v), this.$emit("dropped:rows", v)));
      },
      "pvtAxisContainer pvtVertList pvtRows",
      t
    ), u = Object.assign({}, this.$props, {
      localeStrings: this.localeStrings,
      data: this.materializedInput,
      rowOrder: this.propsData.rowOrder,
      colOrder: this.propsData.colOrder,
      valueFilter: this.propsData.valueFilter,
      rows: this.propsData.rows,
      cols: this.propsData.cols,
      aggregators: this.aggregatorItems,
      rendererName: e,
      aggregatorName: i,
      vals: o
    });
    let c = null;
    try {
      c = new Dt(u);
    } catch (d) {
      if (console && console.error(d.stack))
        return this.computeError(t);
    }
    const f = this.rendererCell(e, t), p = this.aggregatorCell(i, o, t), g = this.outputCell(
      u,
      e.indexOf("Chart") > -1,
      t
    ), h = this.$slots.colGroup;
    return t(
      "table",
      {
        staticClass: ["pvtUi"]
      },
      [
        h,
        t(
          "tbody",
          {
            on: {
              click: this.closeFilterBox
            }
          },
          [
            t("tr", [f, a]),
            t("tr", [p, s]),
            t("tr", [
              l,
              r ? t("td", { staticClass: "pvtOutput" }, r) : void 0,
              n && !r ? t("td", { staticClass: "pvtOutput" }, n({ pivotData: c })) : void 0,
              !r && !n ? g : void 0
            ])
          ]
        )
      ]
    );
  },
  renderError(t, n) {
    return this.uiRenderError(t);
  }
}, yr = {
  aggregatorTemplates: Y,
  aggregators: te,
  derivers: In,
  locales: We,
  naturalSort: Rt,
  numberFormat: Oe,
  getSort: De,
  sortAs: cn,
  PivotData: Dt
}, Sr = {
  TableRenderer: Ke
}, Be = {
  VuePivottable: Xe,
  VuePivottableUi: br
};
typeof window < "u" && window.Vue && window.Vue.use(Xe);
const xr = (t) => {
  for (const n in Be)
    t.component(Be[n].name, Be[n]);
};
export {
  yr as PivotUtilities,
  Sr as Renderer,
  Xe as VuePivottable,
  br as VuePivottableUi,
  xr as default
};
