var clone, darn, debug, eq, is_array, say;
say = function(s) {
  return print(s + "\n");
};
darn = function(o) {
  say(json(o));
  return o;
};
debug = function(s, o) {
  say(s + ': ' + json(o));
  return o;
};
eq = function(a, b) {
  var i;
  if (!(a != null) && !(b != null)) {
    return true;
  }
  if ((a != null) !== (b != null)) {
    return false;
  }
  if (typeof a === 'number') {
    a = '' + a;
  }
  if (typeof b === 'number') {
    b = '' + b;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a !== 'object') {
    return a === b;
  }
  for (i in a) {
    if (!eq(a[i], b[i])) {
      return false;
    }
  }
  for (i in b) {
    if (!eq(a[i], b[i])) {
      return false;
    }
  }
  return true;
};
clone = function(o) {
  return eval(json(o));
};
is_array = function(o) {
  if (o == null) {
    return false;
  }
  if (typeof o !== 'object') {
    return false;
  }
  if (typeof o.splice !== 'function') {
    return false;
  }
  if (typeof o.length !== 'number') {
    return false;
  }
  if (o.propertyIsEnumerable('length')) {
    return false;
  }
  return true;
};
String.prototype.by = function(n) {
  var i, s;
  if (n <= 0) {
    return '';
  }
  s = '';
  for (i = 1; (1 <= n ? i <= n : i >= n); (1 <= n ? i += 1 : i -= 1)) {
    s += this;
  }
  return s;
};
String.prototype.rpad = function(len, pad) {
  return this + (pad != null ? pad : pad = " ").by(len - this.length);
};
String.prototype.lpad = function(len, pad) {
  return ((pad != null ? pad : pad = " ").by(len - this.length)) + this;
};
Date.prototype.toString = function() {
  return sprintf("%04d-%02d-%02d %02d:%02d:%02d:%03d", this.getFullYear(), 1 + this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds());
};
var Sprintfer, sprintf, __sprintfer;
var __slice = Array.prototype.slice;
sprintf = function() {
  var f, v;
  f = arguments[0], v = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return __sprintfer.get_template(f)(v);
};
Sprintfer = (function() {
  function Sprintfer() {
    this.cache = {};
    this.re1 = /(\%[^\%a-z]*[a-z])/;
  }
  Sprintfer.prototype.get_template = function(f) {
    var _base, _ref;
    return (_ref = (_base = this.cache)[f]) != null ? _ref : _base[f] = this.compile_template(f);
  };
  Sprintfer.prototype.compile_template = function(f) {
    var code, e, i, lr, m, n, p, t, _i, _len, _ref;
    code = '';
    n = 0;
    _ref = f.split(this.re1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (i.length === 0) {
        continue;
      }
      if (code.length > 0) {
        code += '+';
      }
      if (i.match(this.re1)) {
        e = "new String(v[" + (n++) + "])";
        m = i.match(/([1-9]\d*)/);
        if (m != null) {
          lr = i.match(/\-/) ? 'rpad' : 'lpad';
          p = i.match(/\D0/) ? ',"0"' : '';
          e += "." + lr + "(" + m[1] + p + ")";
        }
        code += e;
      } else {
        code += json(i.replace(/\%\%/g, '%'));
      }
    }
    t = null;
    eval("t = function(v){return " + code + "}");
    return t;
  };
  return Sprintfer;
})();
__sprintfer = new Sprintfer;
var Log, log;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Log = (function() {
  function Log() {
    this.stack = [];
    this.handler = {
      '': void 0
    };
  }
  Log.prototype.on = function(type, o) {
    var _ref;
    o != null ? o : o = {};
    o.__dt = new Date;
    o.__type = type;
    o.__level = this.stack.length;
    this.stack.push(o);
    return (_ref = this.get_handler(type)) != null ? typeof _ref.on === "function" ? _ref.on(o) : void 0 : void 0;
  };
  Log.prototype.off = function(type, n) {
    var d, k, last, net, o, v, _ref, _ref2, _ref3, _ref4, _ref5, _results;
    n != null ? n : n = {};
    n.__dt = new Date;
    n.__type = type;
    _results = [];
    while (this.stack.length > 0) {
      o = this.stack.pop();
      n.__duration = n.__dt.getTime() - o.__dt.getTime();
      def(n, o);
      if (this.stack.length > 0) {
        last = this.stack[this.stack.length - 1];
        (_ref = o.__details) != null ? _ref : o.__details = {};
        d = ((_ref2 = last.__details) != null ? _ref2 : last.__details = {});
        net = n.__duration;
        for (k in o.__details) {
          net -= (v = o.__details[k]);
          (_ref3 = d[k]) != null ? _ref3 : d[k] = 0;
          d[k] += v;
        }
        (_ref4 = d[type]) != null ? _ref4 : d[type] = 0;
        d[type] += net;
      }
      if ((_ref5 = this.get_handler(type)) != null) {
        if (typeof _ref5.off === "function") {
          _ref5.off(o, n);
        }
      }
      if (o.__type === type) {
        break;
      }
    }
    return _results;
  };
  Log.prototype.get_handler = function(type) {
    var i, type_config, type_verbatim, _base, _ref;
    type_verbatim = type;
    for (i = 1; i <= 10; i++) {
      type_config = this.handler[type];
      if (!(type_config != null)) {
        type = type.replace(/\.?\w+$/, '');
        continue;
      }
      return (_ref = (_base = this.handler)[type_verbatim]) != null ? _ref : _base[type_verbatim] = type_config;
    }
  };
  Log.prototype.tree_printer = function(pad, max) {
    this.pad = " ".by(pad);
    this.off = function(o, n) {
      var _ref;
      return say(sprintf("%s " + (this.pad.by(max - n.__level)) + "%6d" + (this.pad.by(n.__level)) + "    %s %s", n.__dt, n.__duration, o.__type, (o.__type !== n.__type ? '[ABORT]' : ((_ref = n.label) != null ? _ref : n.label = "").replace(/\s+/g, ' '))));
    };
    return this;
  };
  Log.prototype.table_printer = function() {
    this.format = '%50s %8.1f ms %3d %%';
    this.bar = "-".by(68);
    this.off = function(o, n) {
      var d, i, line, sum, total, _d, _i, _len;
      _d = n.__details;
      d = ((function() {
        var _results;
        _results = [];
        for (i in _d) {
          _results.push({
            label: i,
            value: _d[i]
          });
        }
        return _results;
      })()).sort(function(a, b) {
        return a.value - b.value;
      });
      sum = 0;
      total = n.__duration;
      line = __bind(function(i) {
        return sprintf(this.format, i.label, i.value, Math.round(100 * i.value / total));
      }, this);
      say(this.bar);
      for (_i = 0, _len = d.length; _i < _len; _i++) {
        i = d[_i];
        sum += i.value;
        say(line(i));
      }
      say(line({
        label: "OTHER " + n.__type,
        value: total - sum
      }));
      say(this.bar);
      say(line({
        label: "TOTAL " + n.__type,
        value: total
      }));
      return say(this.bar);
    };
    return this;
  };
  return Log;
})();
log = new Log;
var Db, DbOperator, DbOperatorDelete, DbOperatorInsert, DbOperatorUndelete, DbOperatorUpdate, db;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Db = (function() {
  function Db() {}
  Db.prototype._set = function(record, result) {
    return record;
  };
  Db.prototype._append_s = function(record, result) {
    return result += ',' + record;
  };
  Db.prototype._append_a = function(record, result) {
    result.push(record);
    return result;
  };
  Db.prototype.qp = function(qp) {
    var params, query, _ref;
    _ref = is_array(qp) ? qp : [qp, []], query = _ref[0], params = _ref[1];
    if (is_array(query)) {
      query = (new Sql(query)).get();
    }
    return [query, params];
  };
  Db.prototype.int = function(qp) {
    return parseInt(this.scalar(qp));
  };
  Db.prototype.float = function(qp) {
    return parseFloat(this.scalar(qp));
  };
  Db.prototype.string = function(qp) {
    return new String(this.scalar(qp));
  };
  Db.prototype.one = function(qp, callback) {
    return this["do"](qp, this._set, {
      one: true,
      row: callback
    });
  };
  Db.prototype.scalar = function(qp) {
    return this.one(qp, this._get_scalar);
  };
  Db.prototype.array = function(qp) {
    return this.one(qp, this._get_array);
  };
  Db.prototype.object = function(qp) {
    return this.one(qp, this._get_hash_getter);
  };
  Db.prototype.ids = function(qp) {
    return this["do"](qp, this._append_s, {
      init: '-1',
      row: this._get_scalar
    });
  };
  Db.prototype.column = function(qp) {
    return this["do"](qp, this._append_a, {
      init: [],
      row: this._get_scalar
    });
  };
  Db.prototype.arrays = function(qp) {
    return this["do"](qp, this._append_a, {
      init: [],
      row: this._get_array
    });
  };
  Db.prototype.objects = function(qp, idx) {
    return this["do"](qp, this._append_a, {
      init: [],
      row: this._get_object,
      idx: idx
    });
  };
  return Db;
})();
Db.prototype.insert_id = function(table, record) {
  this.insert(table, record);
  return this._insertId();
};
Db.prototype.clone = function(table, record, over) {
  var i, pk;
  pk = model.pk(table);
  over[pk] = void 0;
  for (i in over) {
    record[i] = over[i];
  }
  record[pk] = this.insert_id(table, record);
  return record;
};
Db.prototype.make_param_batch = function(items, cols) {
  var batch, col, item, p, _i, _j, _len, _len2;
  batch = [];
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    item = items[_i];
    p = [];
    for (_j = 0, _len2 = cols.length; _j < _len2; _j++) {
      col = cols[_j];
      p.push(item[col]);
    }
    batch.push(p);
  }
  return batch;
};
Db.prototype.get_id = function(table, record, key) {
  var fields, i, id, mandatory, mandatory_fields, o, params, pk, v, value, _i, _j, _len, _len2;
  pk = model.pk(table);
  key != null ? key : key = pk;
  if (typeof key !== 'object') {
    key = [key];
  }
  fields = [];
  params = [];
  for (_i = 0, _len = key.length; _i < _len; _i++) {
    i = key[_i];
    fields.push(" AND " + i + "=?");
    params.push(record[i]);
  }
  if (!(id = db.scalar(["SELECT " + pk + " FROM " + table + " WHERE 1=1" + fields, params]))) {
    return this.insert_id(table, record);
  }
  mandatory = {};
  for (i in record) {
    value = record[i];
    if (typeof value === 'object') {
      continue;
    }
    mandatory[i] = value;
  }
  for (_j = 0, _len2 = key.length; _j < _len2; _j++) {
    i = key[_j];
    mandatory[i] = void 0;
  }
  mandatory_fields = (function() {
    var _results;
    _results = [];
    for (i in mandatory) {
      _results.push(i);
    }
    return _results;
  })();
  if (mandatory_fields.length === 0) {
    return id;
  }
  o = db.object(["SELECT " + mandatory_fields + " FROM " + table + " WHERE " + pk + " = ?", id]);
  fields = [];
  params = [];
  for (i in mandatory) {
    v = mandatory[i];
    if (v === void 0) {
      continue;
    }
    if (v != null) {
      v = '' + v;
    }
    if (o[i] === v) {
      continue;
    }
    fields.push("" + i + "=?");
    params.push(v);
  }
  if (fields.length === 0) {
    return id;
  }
  params.push(id);
  db["do"](["UPDATE " + table + " SET " + fields + " WHERE " + pk + " = ?", params]);
  return id;
};
Db.prototype._get_hash_getter = function(i, fieldNames) {
  var c, _base, _name, _ref, _ref2, _ref3;
  c = ((_ref = (_base = ((_ref2 = this._code_cache) != null ? _ref2 : this._code_cache = {}))._get_hash_getter) != null ? _ref : _base._get_hash_getter = {});
  return (_ref3 = c[_name = json(fieldNames)]) != null ? _ref3 : c[_name] = db._gen_hash_getter(fieldNames);
};
Db.prototype._gen_hash_getter = function(fieldNames) {
  var code, fieldName, h, i, last, part, parts, r, _i, _j, _len, _len2, _ref;
  h = {};
  i = 0;
  for (_i = 0, _len = fieldNames.length; _i < _len; _i++) {
    fieldName = fieldNames[_i];
    parts = fieldName.split('.');
    last = parts.pop(0);
    r = h;
    for (_j = 0, _len2 = parts.length; _j < _len2; _j++) {
      part = parts[_j];
      r = ((_ref = r[part]) != null ? _ref : r[part] = {});
    }
    r[last] = i++;
  }
  code = (json(h)).replace(/\:(\d+)/g, ':' + db._gen_hash_accessor);
  var f; eval ('f = function (rs){return ' + code + '}');;
  return f;
};
Db.prototype.insert = function(table, data) {
  log.on('db.insert', {
    label: json([table, data])
  });
  (new DbOperatorInsert(table, data))["do"]();
  return log.off('db.insert');
};
Db.prototype.update = function(table, data) {
  log.on('db.update', {
    label: json([table, data])
  });
  (new DbOperatorUpdate(table, data))["do"]();
  return log.off('db.update');
};
Db.prototype["delete"] = function(table, data) {
  var id;
  log.on('db.delete', {
    label: json([table, data])
  });
  if (typeof data !== 'object') {
    id = data;
    data = {};
    data[model.pk(table)] = id;
  }
  (new DbOperatorDelete(table, data))["do"]();
  return log.off('db.delete');
};
Db.prototype.undelete = function(table, data) {
  var id;
  log.on('db.undelete', {
    label: json([table, data])
  });
  if (typeof data !== 'object') {
    id = data;
    data = {};
    data[model.pk(table)] = id;
  }
  (new DbOperatorUndelete(table, data))["do"]();
  return log.off('db.undelete');
};
Db.prototype.put = function(table, records, key, root) {
  return (new WishTableDataRooted(records, {
    table: table,
    key: key,
    root: root
  })).realize();
};
db = new Db;
DbOperator = (function() {
  function DbOperator(table, data) {
    var has_pk, i, item;
    this.table = table;
    this.data = data;
    this.items = is_array(this.data) ? this.data : [this.data];
    if (data.length === 0) {
      return;
    }
    item = this.items[0];
    this.pk = model.pk(this.table);
    this.cols = [];
    has_pk = false;
    for (i in item) {
      if (i === this.pk) {
        has_pk = true;
        continue;
      }
      this.cols.push(i);
    }
    if (has_pk) {
      this.cols.push(this.pk);
    }
  }
  DbOperator.prototype["do"] = function() {
    var params, sql;
    if (this.items.length === 0) {
      return;
    }
    sql = this.sql();
    params = db.make_param_batch(this.items, this.cols);
    return db["do"]([sql, params]);
  };
  return DbOperator;
})();
DbOperatorInsert = (function() {
  function DbOperatorInsert() {
    DbOperatorInsert.__super__.constructor.apply(this, arguments);
  }
  __extends(DbOperatorInsert, DbOperator);
  DbOperatorInsert.prototype.sql = function() {
    var col, n, q, _i, _len, _ref;
    n = [];
    q = [];
    _ref = this.cols;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      col = _ref[_i];
      n.push(db.quote_name(col));
      q.push('?');
    }
    return "INSERT INTO " + this.table + " (" + n + ") VALUES (" + q + ")";
  };
  return DbOperatorInsert;
})();
DbOperatorUpdate = (function() {
  function DbOperatorUpdate() {
    DbOperatorUpdate.__super__.constructor.apply(this, arguments);
  }
  __extends(DbOperatorUpdate, DbOperator);
  DbOperatorUpdate.prototype.sql = function() {
    var col, n;
    if (this.cols[this.cols.length - 1] !== this.pk) {
      throw "PK is not set";
    }
    this.cols.pop();
    n = (function() {
      var _i, _len, _ref, _results;
      _ref = this.cols;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        col = _ref[_i];
        _results.push(db.quote_name(col) + '=?');
      }
      return _results;
    }).call(this);
    this.cols.push(this.pk);
    return "UPDATE " + this.table + " SET " + n + " WHERE " + (db.quote_name(this.pk)) + "=?";
  };
  return DbOperatorUpdate;
})();
DbOperatorDelete = (function() {
  function DbOperatorDelete() {
    DbOperatorDelete.__super__.constructor.apply(this, arguments);
  }
  __extends(DbOperatorDelete, DbOperator);
  DbOperatorDelete.prototype.sql = function() {
    var a, sql, t;
    this.cols = [this.pk];
    t = model.tables[this.table];
    a = t.actuality_column;
    sql = "DELETE FROM " + this.table;
    if (a != null) {
      sql = "UPDATE " + this.table + " SET " + a + " = " + (db.escape(t.columns[a].actual_deleted[1]));
    }
    return sql + (" WHERE " + (db.quote_name(this.pk)) + "=?");
  };
  return DbOperatorDelete;
})();
DbOperatorUndelete = (function() {
  function DbOperatorUndelete() {
    DbOperatorUndelete.__super__.constructor.apply(this, arguments);
  }
  __extends(DbOperatorUndelete, DbOperator);
  DbOperatorUndelete.prototype.sql = function() {
    var a, sql, t;
    this.cols = [this.pk];
    t = model.tables[this.table];
    a = t.actuality_column;
    if (a == null) {
      throw "actuality_column is not defined for " + this.table;
    }
    return sql = "UPDATE " + this.table + " SET " + a + " = " + (db.escape(t.columns[a].actual_deleted[0])) + " WHERE " + (db.quote_name(this.pk)) + "=?";
  };
  return DbOperatorUndelete;
})();
var Sql, sql;
var __slice = Array.prototype.slice;
sql = function() {
  var things;
  things = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  return (new Sql(things)).get();
};
Sql = (function() {
  function Sql(things) {
    var last, thing, _i, _len;
    this.re_long_identifier = /([a-z_][a-z_0-9]*(?:\.[a-z_][a-z_0-9]*)?)/;
    this.re_short_identifier = /^([a-z_][a-z_0-9]*)$/;
    this.tables = [];
    this.parameters = [];
    this.cols_by_aggr = [[], []];
    last = {};
    for (_i = 0, _len = things.length; _i < _len; _i++) {
      thing = things[_i];
      if (typeof thing === 'object') {
        def(last, thing);
      } else {
        if (("" + thing).match(/^\d+$/)) {
          last[model.pk(last.TABLE)] = thing;
        } else {
          last = {
            TABLE: thing
          };
          this.tables.push(last);
        }
      }
    }
  }
  Sql.prototype.set_default_columns = function(table) {
    var definition, i;
    if (table.COLUMNS != null) {
      return;
    }
    definition = model.tables[table.TABLE];
    if (!(definition != null)) {
      throw "Table '" + table.TABLE + "' is not defined in model";
    }
    return table.COLUMNS = (function() {
      var _results;
      _results = [];
      for (i in definition.columns) {
        _results.push(i);
      }
      return _results;
    })();
  };
  Sql.prototype.globalize_expression = function(table, local_expression) {
    var i, result, _i, _len, _ref;
    if (this.tables.length === 1) {
      return local_expression;
    }
    result = '';
    _ref = local_expression.split(this.re_long_identifier);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      result += i.match(this.re_short_identifier) ? table.ALIAS + '.' + i : i;
    }
    return result;
  };
  Sql.prototype.parse_column = function(table, i) {
    var col, m;
    if (typeof i === 'object') {
      return i;
    }
    col = {};
    m = i.match(/\s+AS\s+(\w+)\s*$/);
    if (m != null) {
      col.ALIAS = m[1];
      i = i.replace(m[0], '');
    } else {
      col.ALIAS = table.COLUMN_ALIAS_PREFIX + i;
    }
    if (table.IS_ROOT && !(table.ORDER != null)) {
      col.ORDER = model.order(table.TABLE, i);
    }
    col.EXPRESSION = this.globalize_expression(table, i);
    col.SELECT = col.EXPRESSION === col.ALIAS && col.ALIAS.match(/^\w+$/) ? col.ALIAS : "" + col.EXPRESSION + " " + (db.quote_name(col.ALIAS));
    col.IS_AGGR = this.is_aggr(col.EXPRESSION);
    this.cols_by_aggr[col.IS_AGGR].push(col);
    return col;
  };
  Sql.prototype.is_aggr = function(x) {
    if (x.match(/(COUNT|MIN|MAX|SUM|STDEV)/) != null) {
      return 1;
    } else {
      return 0;
    }
  };
  Sql.prototype.adjust_join_for_vocabulary = function(table, past_tables) {
    var i, ref, _i, _len;
    if (table.ON != null) {
      return;
    }
    for (_i = 0, _len = past_tables.length; _i < _len; _i++) {
      i = past_tables[_i];
      ref = model.first_found_ref(i.TABLE, table.TABLE);
      if (ref != null) {
        table.ON = "" + i.ALIAS + "." + ref + "=" + table.ALIAS + "." + (model.pk(table.TABLE));
        return;
      }
    }
  };
  Sql.prototype.adjust_join_for_child = function(table, past_tables) {
    var i, ref, _i, _len;
    if (table.ON != null) {
      return;
    }
    for (_i = 0, _len = past_tables.length; _i < _len; _i++) {
      i = past_tables[_i];
      ref = model.first_found_ref(table.TABLE, i.TABLE);
      if (ref != null) {
        table.ON = "" + table.ALIAS + "." + ref + "=" + i.ALIAS + "." + (model.pk(i.TABLE));
        return;
      }
    }
  };
  Sql.prototype.adjust_join = function(table, past_tables) {
    var i, j, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    table.FROM = table.TABLE === table.ALIAS ? table.TABLE : "" + table.TABLE + " " + table.ALIAS;
    if (table.IS_ROOT) {
      return;
    }
    if (table.ON != null) {
      if (!table.ON.match(/\=/)) {
        table.ON += "=" + table.ALIAS + "." + (model.pk(table.TABLE));
      }
    } else {
      switch (table.ROLE) {
        case 'VOCABULARY':
          this.adjust_join_for_vocabulary(table, past_tables);
          break;
        case 'CHILD':
          this.adjust_join_for_child(table, past_tables);
          break;
        default:
          this.adjust_join_for_vocabulary(table, past_tables);
          this.adjust_join_for_child(table, past_tables);
      }
    }
    if (table.ON == null) {
      throw "Unjoined " + table.FROM;
    }
    table.FROM = " " + ((_ref = table.JOIN) != null ? _ref : table.JOIN = 'LEFT') + " JOIN " + table.FROM + " ON ";
    if (table.FILTERS.length > 0) {
      table.FROM += "(";
    }
    table.FROM += table.ON;
    _ref2 = table.FILTERS;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      i = _ref2[_i];
      table.FROM += " AND " + i.EXPRESSION;
      _ref3 = i.VALUES;
      for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
        j = _ref3[_j];
        this.parameters.push(j);
      }
    }
    if (table.FILTERS.length > 0) {
      return table.FROM += ")";
    }
  };
  Sql.prototype.parse_table = function(table) {
    var depth, i, last, m, _i, _len, _ref, _ref2;
    m = table.TABLE.match(/^(\<[\-\=]|[\-\=]\>)\s*/);
    if (m != null) {
      table.TABLE = table.TABLE.replace(m[0], '');
      table.JOIN = m[1].match(/\-/) ? 'LEFT' : 'INNER';
      table.ROLE = m[1].match(/\>/) ? 'VOCABULARY' : 'CHILD';
    }
    m = table.TABLE.match(/\s*\:\s*(.*)$/);
    if (m != null) {
      table.TABLE = table.TABLE.replace(m[0], '');
      last = '';
      table.COLUMNS = [];
      depth = 0;
      _ref = (m[1] + ',').split(/([\(\)\,])/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        switch (i) {
          case "(":
            last += i;
            depth++;
            break;
          case ')':
            last += i;
            depth--;
            break;
          case ',':
            if (depth > 0) {
              last += i;
            } else {
              table.COLUMNS.push(last);
              last = '';
            }
            break;
          default:
            last += i;
        }
      }
    }
    m = table.TABLE.match(/\s*ON\s*(.*)$/);
    if (m != null) {
      table.TABLE = table.TABLE.replace(m[0], '');
      table.ON = m[1];
    }
    m = table.TABLE.match(/\s*AS\s*(.*)$/);
    if (m != null) {
      table.TABLE = table.TABLE.replace(m[0], '');
      table.ALIAS = m[1];
    }
    return (_ref2 = table.ALIAS) != null ? _ref2 : table.ALIAS = table.TABLE;
  };
  Sql.prototype.adjust_columns = function(table) {
    var i;
    this.set_default_columns(table);
    table.COLUMN_ALIAS_PREFIX = table.IS_ROOT ? '' : table.TABLE + '.';
    table.COLUMNS = (function() {
      var _i, _len, _ref, _results;
      _ref = table.COLUMNS;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(this.parse_column(table, i));
      }
      return _results;
    }).call(this);
    return delete table.COLUMN_ALIAS_PREFIX;
  };
  Sql.prototype.count_marx = function(expression) {
    return expression.replace(/[^\?]/g, '').length;
  };
  Sql.prototype.adjust_null_filter_expression = function(expression) {
    var clause;
    if (expression.match(/\s+IS(\s+NOT)?\s+NULL\s*$/)) {
      return [expression, []];
    }
    clause = expression.match(/(NOT|\<\>)/) != null ? ' IS NOT NULL' : ' IS NULL';
    return [expression.replace(/(\s+IS)?(\s+NOT)?(\s+NULL)?\s*$/, clause), []];
  };
  Sql.prototype.adjust_scalar_filter_expression = function(expression, value) {
    if (!(value != null)) {
      return this.adjust_null_filter_expression(expression);
    }
    if (expression.match(/[\<\=\>]/) == null) {
      expression += '=';
    }
    expression += '?';
    return [expression, [value]];
  };
  Sql.prototype.adjust_vector_filter_expression = function(expression, value) {
    var i, _ref;
    if (!is_array(value)) {
      value = [value];
    }
    if (value.length === 0) {
      value = [-1];
    }
    if (expression.match(/\s+IN\s*$/) == null) {
      expression += ' IN';
    }
    expression += '(?';
    for (i = 0, _ref = value.length - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      expression += ',?';
    }
    expression += ')';
    return [expression, value];
  };
  Sql.prototype.adjust_filter_expression = function(expression, value) {
    if ((is_array(value)) || (expression.match(/\s+IN\s*$/) != null)) {
      return this.adjust_vector_filter_expression(expression, value);
    } else {
      return this.adjust_scalar_filter_expression(expression, value);
    }
  };
  Sql.prototype.add_filter = function(table, expression, value) {
    var marx, _ref;
    marx = this.count_marx(expression);
    if (marx === 0) {
      _ref = this.adjust_filter_expression(expression, value), expression = _ref[0], value = _ref[1];
      marx = this.count_marx(expression);
    }
    if (!is_array(value)) {
      value = [value];
    }
    if (marx !== value.length) {
      throw "Paramaters skew: " + value.length + " values given for " + marx + " placeholders in " + expression;
    }
    return table.FILTERS.push({
      EXPRESSION: this.globalize_expression(table, expression),
      VALUES: value,
      IS_AGGR: this.is_aggr(expression)
    });
  };
  Sql.prototype.adjust_filters = function(table) {
    var a, i, t, _ref, _results;
    table.FILTERS = [];
    if (table.IS_ROOT) {
      t = model.tables[table.TABLE];
      a = t.actuality_column;
      if (a != null) {
        (_ref = table[a]) != null ? _ref : table[a] = t.columns[a].actual_deleted[0];
      }
    }
    _results = [];
    for (i in table) {
      if (i.match(/^[A-Z][A-Z_]*$/)) {
        continue;
      }
      _results.push(this.add_filter(table, i, table[i]));
    }
    return _results;
  };
  Sql.prototype.get_select = function() {
    var c, i, result, _i, _j, _len, _len2, _ref;
    result = '';
    _ref = this.cols_by_aggr;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      for (_j = 0, _len2 = c.length; _j < _len2; _j++) {
        i = c[_j];
        if (result) {
          result += ',';
        }
        result += i.SELECT;
      }
    }
    return 'SELECT ' + result;
  };
  Sql.prototype.get_from = function() {
    var result, table, _i, _len, _ref;
    result = ' FROM ';
    _ref = this.tables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      table = _ref[_i];
      result += table.FROM;
    }
    return result;
  };
  Sql.prototype.get_group_by = function() {
    var i, result, _i, _len, _ref;
    if (this.cols_by_aggr[0].length * this.cols_by_aggr[1].length === 0) {
      return '';
    }
    result = '';
    _ref = this.cols_by_aggr[0];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (result) {
        result += ',';
      }
      result += i.EXPRESSION;
    }
    return ' GROUP BY ' + result;
  };
  Sql.prototype.get_where_or_having = function(is_aggr, keyword) {
    var filters, i, j, result, _i, _j, _len, _len2, _ref;
    filters = this.root.FILTERS;
    result = '';
    for (_i = 0, _len = filters.length; _i < _len; _i++) {
      i = filters[_i];
      if (i.IS_AGGR !== is_aggr) {
        continue;
      }
      if (result.length > 0) {
        result += ' AND ';
      }
      result += i.EXPRESSION;
      _ref = i.VALUES;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        j = _ref[_j];
        this.parameters.push(j);
      }
    }
    if (result.length === 0) {
      return '';
    } else {
      return " " + keyword + " " + result;
    }
  };
  Sql.prototype.get_where = function() {
    return this.get_where_or_having(0, 'WHERE');
  };
  Sql.prototype.get_having = function() {
    return this.get_where_or_having(1, 'HAVING');
  };
  Sql.prototype.get_order_by = function() {
    var i, o, _i, _len, _ref;
    if (this.root.ORDER != null) {
      return ' ORDER BY ' + this.globalize_expression(this.root, this.root.ORDER);
    }
    if (this.cols_by_aggr[0].length === 0) {
      return '';
    }
    _ref = this.cols_by_aggr[0];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      if (i.ORDER < 1000000) {
        o = i.EXPRESSION;
      }
    }
    if ((o != null ? o.length : void 0) > 0) {
      return ' ORDER BY ' + o;
    }
    return '';
  };
  Sql.prototype.get_sql_select = function() {
    return this.get_select() + this.get_from() + this.get_where() + this.get_group_by() + this.get_having() + this.get_order_by();
  };
  Sql.prototype.get = function() {
    var past_tables, table, _i, _len, _ref;
    this.root = this.tables[0];
    this.root.IS_ROOT = true;
    past_tables = [];
    this.joined_tables = [];
    _ref = this.tables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      table = _ref[_i];
      this.parse_table(table);
      this.adjust_columns(table);
      this.adjust_filters(table);
      this.adjust_join(table, past_tables);
      past_tables.push(table);
      if (!table.IS_ROOT) {
        this.joined_tables.push(table);
      }
    }
    this.cols_by_aggr[0].sort(function(a, b) {
      return a.ORDER - b.ORDER;
    });
    return [this.get_sql_select(), this.parameters];
  };
  return Sql;
})();
var Model, model;
Model = (function() {
  function Model() {
    this.tables = {};
    this["default"] = [];
    this.types = {
      ref: {
        type: 'INTEGER'
      },
      checkbox: {
        type: 'INTEGER',
        nullable: false,
        "default": 0
      },
      radio: {
        type: 'INTEGER',
        nullable: false,
        "default": -1
      },
      money: {
        type: 'DECIMAL',
        size: 10,
        scale: 2
      }
    };
  }
  Model.prototype.pk = function(name) {
    var column, columns, i;
    columns = this.tables[name].columns;
    for (i in columns) {
      column = columns[i];
      if (column.pk) {
        return column.name;
      }
    }
  };
  Model.prototype.assert = function(options) {
    var col, col_list, columns, data, data_list, i, item, key_list, keys, pk, sum, table, table_name;
    log.on('model.assert');
    options != null ? options : options = {};
    for (table_name in this.tables) {
      options.table = table_name;
      table = this.tables[table_name];
      if (table.abstract) {
        continue;
      }
      columns = table.columns;
      col_list = [];
      for (i in columns) {
        if ((col = columns[i]) == null) {
          continue;
        }
        col_list.push(col);
      }
      sum = (new WishTableColumns(col_list, {
        debug: options.debug,
        table: table_name
      })).realize();
      keys = table.keys;
      key_list = (function() {
        var _results;
        _results = [];
        for (i in keys) {
          _results.push({
            name: i,
            parts: keys[i]
          });
        }
        return _results;
      })();
      sum += (new WishTableKeys(key_list, {
        debug: options.debug,
        table: table_name
      })).realize();
      pk = model.pk(table_name);
      data = table.data;
      data_list = [];
      for (i in data) {
        item = data[i];
        if (item == null) {
          continue;
        }
        item[pk] = i;
        data_list.push(item);
      }
      sum += (new WishTableData(data_list, {
        debug: options.debug,
        table: table_name
      })).realize();
    }
    log.off('model.assert');
    return sum;
  };
  Model.prototype.set = function(name, table) {
    var column, i, key, n, p, proto, protos, t, _base, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    if (table["default"]) {
      table.abstract = true;
    }
    t = ((_ref = (_base = this.tables)[name]) != null ? _ref : _base[name] = {});
    protos = (function() {
      var _i, _len, _ref, _results;
      _ref = this["default"];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(i);
      }
      return _results;
    }).call(this);
    if (table.proto != null) {
      p = table.proto;
      if (typeof p !== 'object') {
        p = [p];
      }
      for (_i = 0, _len = p.length; _i < _len; _i++) {
        i = p[_i];
        protos.push(i);
      }
    }
    protos.push(table);
    for (_j = 0, _len2 = protos.length; _j < _len2; _j++) {
      proto = protos[_j];
      for (key in proto) {
        (_ref2 = t[key]) != null ? _ref2 : t[key] = {};
        over(t[key], proto[key]);
      }
    }
    _ref3 = ['abstract', 'default'];
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      key = _ref3[_k];
      t[key] = table[key];
    }
    for (n in t.columns) {
      column = t.columns[n];
      if (column != null) {
        t.columns[n] = this.parse_column(n, column);
      } else {
        delete t.columns[n];
      }
    }
    delete t.actuality_column;
    for (n in t.columns) {
      column = t.columns[n];
      if (is_array(column.actual_deleted)) {
        t.actuality_column = n;
        break;
      }
    }
    if (t["default"]) {
      return this["default"].push(t);
    }
  };
  Model.prototype.parse_column = function(name, src) {
    var column, m, type, type_name, _base, _ref, _ref2;
    if (typeof src === 'object') {
      src.name = name;
      return src;
    }
    column = {
      name: name
    };
    type_name = (_ref = src.match(/^\s*(\w+)/)) != null ? _ref[1] : void 0;
    type_name != null ? type_name : type_name = 'ref';
    type = ((_ref2 = (_base = this.types)[type_name]) != null ? _ref2 : _base[type_name] = {
      type: type_name.toUpperCase()
    });
    def(column, type);
    if (m = src.match(/\-\>\s*(\w+)(\!?)/)) {
      column.ref = m[1];
      column.nullable = !m[2];
    }
    if (m = src.match(/\'(.*)\'/)) {
      column["default"] = m[1];
    }
    if (m = src.match(/\(\s*(\d+)/)) {
      column.size = m[1];
    }
    if (m = src.match(/\,\s*(\d+)\s*\)/)) {
      column.scale = m[1];
    }
    if (m = src.match(/\{(\d+)\}/)) {
      column.order = m[1];
    }
    if (m = src.match(/\#(.*)/)) {
      column.comment = m[1];
    }
    return column;
  };
  Model.prototype.first_found_ref = function(src, dest) {
    var cols, i;
    cols = this.tables[src].columns;
    for (i in cols) {
      if (dest ? cols[i].ref : void 0) {
        return i;
      }
    }
    return void 0;
  };
  Model.prototype.order = function(table_name, column_name) {
    var result, _ref, _ref2;
    result = (_ref = this.tables[table_name]) != null ? (_ref2 = _ref.columns[column_name]) != null ? _ref2.order : void 0 : void 0;
    return result != null ? result : result = 1000000;
  };
  return Model;
})();
model = new Model;
var Wish;
Wish = (function() {
  function Wish(items, options) {
    this.items = items;
    this.options = options;
    this.items = clone(this.items);
    this.is_virgin = true;
  }
  Wish.prototype.adjust_options = function() {
    var _base, _ref;
    return (_ref = (_base = this.options).get_key) != null ? _ref : _base.get_key = function(o) {
      return o.name;
    };
  };
  Wish.prototype.clarify_demands = function(item) {};
  Wish.prototype.explore_existing = function() {};
  Wish.prototype.update_demands = function(old, young) {};
  Wish.prototype.schedule_modifications = function(old, young) {};
  Wish.prototype.schedule_cleanup = function() {};
  Wish.prototype.realize = function() {
    var i, sum, _i, _j, _len, _len2, _ref, _ref2;
    this.adjust_options();
    if (this.options.debug) {
      debug('\n\nItems to realize', this.items);
    }
    _ref = this.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      this.clarify_demands(i);
    }
    this.split_layers();
    if (this.options.debug) {
      debug('Layers', this.layers);
    }
    sum = 0;
    _ref2 = this.layers;
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      i = _ref2[_j];
      sum += this.scan_layer(i);
    }
    return sum;
  };
  Wish.prototype.split_layers = function() {
    var item, key, key_cnt, _base, _i, _len, _name, _ref, _ref2, _ref3;
    key_cnt = {};
    this.layers = [];
    _ref = this.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      key = this.options.get_key(item);
      (_ref2 = key_cnt[key]) != null ? _ref2 : key_cnt[key] = 0;
      ((_ref3 = (_base = this.layers)[_name = key_cnt[key]++]) != null ? _ref3 : _base[_name] = {})[key] = item;
    }
    if (this.layers.length === 0) {
      return this.layers = [{}];
    }
  };
  Wish.prototype.plan_todo = function(layer, key) {
    var old, young;
    if (this.options.debug) {
      debug(' Key to analyze', key);
    }
    young = layer[key];
    if (this.options.debug) {
      debug(' Item to analyze', young);
    }
    if ((old = this.existing[key]) == null) {
      if (this.options.debug) {
        say(' Not found in existing');
      }
      return this.todo.create.push(young);
    }
    this.found[key] = true;
    this.update_demands(old, young);
    if (this.options.debug) {
      debug('  Old to compare', old);
    }
    if (this.options.debug) {
      debug('  New to compare', young);
    }
    if (eq(old, young)) {
      if (this.options.debug) {
        say(' No difference found');
      }
      return;
    }
    if (this.options.debug) {
      say(' *** IT DIFFERS ***');
    }
    this.schedule_modifications(old, young);
    if (!this.is_virgin) {
      return;
    }
    return this.is_virgin = false;
  };
  Wish.prototype.scan_layer = function(layer) {
    var action, key, len, sum, todo;
    if (this.options.debug) {
      debug('The layer is', layer);
    }
    this.existing = {};
    this.explore_existing();
    if (this.options.debug) {
      debug('Existing items are', this.existing);
    }
    this.todo = {
      create: []
    };
    this.found = {};
    for (key in layer) {
      this.plan_todo(layer, key);
    }
    this.schedule_cleanup();
    if (this.options.debug) {
      debug('Todo list', this.todo);
    }
    sum = 0;
    for (action in this.todo) {
      todo = this.todo[action];
      len = todo.length;
      if (len === 0) {
        continue;
      }
      sum += len;
      this[action](todo);
    }
    return sum;
  };
  return Wish;
})();
var WishTableData;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
WishTableData = (function() {
  function WishTableData() {
    WishTableData.__super__.constructor.apply(this, arguments);
  }
  __extends(WishTableData, Wish);
  WishTableData.prototype.adjust_options = function() {
    var pk;
    this.options.pk = pk = model.pk(this.options.table);
    this.options.get_key = function(i) {
      return i[pk];
    };
    return this.options.pks = '-1';
  };
  WishTableData.prototype.clarify_demands = function(item) {
    if (item[this.options.pk] != null) {
      return this.options.pks += ',' + item[this.options.pk];
    }
  };
  WishTableData.prototype.explore_existing = function() {
    var params, sql;
    sql = "SELECT * FROM " + this.options.table + " WHERE 1=1";
    params = [];
    if (this.options.pks !== '-1') {
      sql += " AND " + this.options.pk + " IN (" + this.options.pks + ")";
    }
    return db["do"]([sql, params], __bind(function(i) {
      return this.existing[this.options.get_key(i)] = i;
    }, this));
  };
  WishTableData.prototype.update_demands = function(old, young) {
    var i, _results;
    def(young, old);
    _results = [];
    for (i in young) {
      if (young[i] == null) {
        continue;
      }
      _results.push(young[i] += '');
    }
    return _results;
  };
  WishTableData.prototype.schedule_modifications = function(old, young) {
    var _base, _ref;
    return ((_ref = (_base = this.todo).update) != null ? _ref : _base.update = []).push(young);
  };
  WishTableData.prototype.create = function(items) {
    return db.insert(this.options.table, items);
  };
  WishTableData.prototype.update = function(items) {
    return db.update(this.options.table, items);
  };
  return WishTableData;
})();
var WishTableDataRooted;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
WishTableDataRooted = (function() {
  function WishTableDataRooted() {
    WishTableDataRooted.__super__.constructor.apply(this, arguments);
  }
  __extends(WishTableDataRooted, Wish);
  WishTableDataRooted.prototype.adjust_options = function() {
    var a, code, i, t, _base, _base2, _base3, _i, _len, _ref, _ref2, _ref3, _ref4;
    this.options.pk = model.pk(this.options.table);
    (_ref = (_base = this.options).root) != null ? _ref : _base.root = {};
    (_ref2 = (_base2 = this.options).actuality) != null ? _ref2 : _base2.actuality = {};
    t = model.tables[this.options.table];
    a = t.actuality_column;
    if (a != null) {
      this.options.actuality[a] = t.columns[a].actual_deleted[0];
    }
    (_ref3 = (_base3 = this.options).key) != null ? _ref3 : _base3.key = this.options.pk;
    code = 'this.options.get_key = function (i) {return json([0';
    _ref4 = this.options.key.split(/\W+/);
    for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
      i = _ref4[_i];
      code += ',""+i.' + i;
    }
    return eval(code + '])}');
  };
  WishTableDataRooted.prototype.clarify_demands = function(item) {
    def(item, this.options.root);
    return over(item, this.options.actuality);
  };
  WishTableDataRooted.prototype.explore_existing = function() {
    var i, params, sql;
    sql = "SELECT * FROM " + this.options.table + " WHERE 1=1";
    params = [];
    for (i in this.options.root) {
      sql += " AND " + i + " = ?";
      params.push(this.options.root[i]);
    }
    return db["do"]([sql, params], __bind(function(i) {
      return this.existing[this.options.get_key(i)] = i;
    }, this));
  };
  WishTableDataRooted.prototype.update_demands = function(old, young) {
    var i, _results;
    def(young, old);
    _results = [];
    for (i in young) {
      if (young[i] == null) {
        continue;
      }
      _results.push(young[i] += '');
    }
    return _results;
  };
  WishTableDataRooted.prototype.schedule_modifications = function(old, young) {
    var _base, _ref;
    return ((_ref = (_base = this.todo).update) != null ? _ref : _base.update = []).push(young);
  };
  WishTableDataRooted.prototype.schedule_cleanup = function() {
    var i, list, _base, _ref, _results;
    list = ((_ref = (_base = this.todo)["delete"]) != null ? _ref : _base["delete"] = []);
    _results = [];
    for (i in this.existing) {
      if (this.found[i]) {
        continue;
      }
      _results.push(list.push(this.existing[i]));
    }
    return _results;
  };
  WishTableDataRooted.prototype.create = function(items) {
    return db.insert(this.options.table, items);
  };
  WishTableDataRooted.prototype.update = function(items) {
    return db.update(this.options.table, items);
  };
  WishTableDataRooted.prototype["delete"] = function(items) {
    return db["delete"](this.options.table, items);
  };
  return WishTableDataRooted;
})();
var WishTableColumns;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
WishTableColumns = (function() {
  function WishTableColumns() {
    WishTableColumns.__super__.constructor.apply(this, arguments);
  }
  __extends(WishTableColumns, Wish);
  WishTableColumns.prototype.adjust_dimension = function(col, key, value) {
    if (col[key] < value) {
      return col[key] = value;
    }
  };
  WishTableColumns.prototype.adjust_dimensions_for_char = function(old, young) {
    return this.adjust_dimension(young, 'size', old.size);
  };
  WishTableColumns.prototype.adjust_dimensions_for_decimal = function(old, young) {
    this.adjust_dimension(young, 'scale', old.scale);
    return this.adjust_dimension(young, 'size', old.size + young.scale - old.scale);
  };
  WishTableColumns.prototype.adjust_dimensions = function(old, young) {
    var t, type, _i, _len, _ref, _results;
    type = old.type;
    if (type !== young.type) {
      return;
    }
    _ref = ['char', 'decimal'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (type.search(t.toUpperCase()) < 0) {
        continue;
      }
      _results.push(this['adjust_dimensions_for_' + t](old, young));
    }
    return _results;
  };
  WishTableColumns.prototype.update_demands = function(old, young) {
    var i, item, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    _ref = [old, young];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _ref2 = ['size', 'scale'];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        i = _ref2[_j];
        if (item[i] == null) {
          continue;
        }
        item[i] = parseInt(item[i]);
      }
    }
    this.adjust_dimensions(old, young);
    _ref3 = [old, young];
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      item = _ref3[_k];
      this.adjust_field_options(item);
      for (i in item) {
        if (i !== 'autoincrement' && i !== 'default' && i !== 'name' && i !== 'nullable' && i !== 'pk' && i !== 'scale' && i !== 'size' && i !== 'type') {
          delete item[i];
        }
      }
    }
    return null;
  };
  WishTableColumns.prototype.adjust_field_options = function(item) {
    var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
    (_ref = item.pk) != null ? _ref : item.pk = false;
    (_ref2 = item.autoincrement) != null ? _ref2 : item.autoincrement = false;
    item["default"] = item["default"] != null ? '' + item["default"] : null;
    (_ref3 = item.nullable) != null ? _ref3 : item.nullable = !(item["default"] != null);
    if (item.autoincrement) {
      item.nullable = false;
    }
    item.type = item.type.toUpperCase();
    if (item.type === 'NUMERIC') {
      item.type = 'DECIMAL';
    }
    switch (item.type) {
      case 'DECIMAL':
        (_ref4 = item.size) != null ? _ref4 : item.size = 10;
        return (_ref5 = item.scale) != null ? _ref5 : item.scale = 0;
      case 'VARCHAR':
        (_ref6 = item.size) != null ? _ref6 : item.size = 255;
        return item.scale = null;
      default:
        item.size = null;
        return item.scale = null;
    }
  };
  return WishTableColumns;
})();
var WishTableKeys;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
WishTableKeys = (function() {
  function WishTableKeys() {
    WishTableKeys.__super__.constructor.apply(this, arguments);
  }
  __extends(WishTableKeys, Wish);
  WishTableKeys.prototype.clarify_demands = function(item) {
    return item.global_name = "" + this.options.table + "_" + item.name;
  };
  WishTableKeys.prototype.schedule_modifications = function(old, young) {
    var _base, _ref;
    return ((_ref = (_base = this.todo).recreate) != null ? _ref : _base.recreate = []).push(young);
  };
  WishTableKeys.prototype.create = function(items) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      _results.push(db["do"]("CREATE INDEX " + item.global_name + " ON " + this.options.table + " (" + item.parts + ")"));
    }
    return _results;
  };
  WishTableKeys.prototype.drop = function(item) {
    return db["do"]("DROP INDEX " + item.global_name);
  };
  WishTableKeys.prototype.recreate = function(items) {
    var item, _i, _len;
    for (_i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      this.drop(item);
    }
    return this.create(items);
  };
  return WishTableKeys;
})();
Db.prototype.escape = function(s) {
  if (s == null) {
    return 'NULL';
  }
  return "'" + (('' + s).replace(/\'/i, "''")) + "'";
};
Db.prototype.quote_name = function(s) {
  return '"' + s + '"';
};
WishTableColumns.prototype.explore_existing = function() {
  var field, fields, i, item, m, re, sql, _i, _j, _len, _len2, _ref, _ref2, _results;
  re = /(\w+\s+\w+(?:\s*\(\s*\d+(?:\s*\,\s*\d+\s*)?\s*\))?(?:\s*PRIMARY\s+KEY|\s*AUTOINCREMENT|\s*NOT\s+NULL\s*DEFAULT\s+(?:\d+|\'.*?\'))*)/i;
  fields = [];
  sql = db.string(["SELECT sql FROM sqlite_master WHERE type = ? AND name = ?", ['table', this.options.table]]);
  sql != null ? sql : sql = '';
  _ref = sql.replace(/CREATE\s+TABLE\s+\w+\s*\((.*)\)\s*$/mi, '$1').split(re);
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    if (re.test(i)) {
      fields.push(i);
    }
  }
  _results = [];
  for (_j = 0, _len2 = fields.length; _j < _len2; _j++) {
    field = fields[_j];
    m = field.match(/^\s*(\w+)\s+(\w+)(?:\s*\(\s*(\d+)(?:\s*\,\s*(\d+)\s*)?\s*\))?/);
    item = {
      name: m[1].toLowerCase(),
      type: m[2].toUpperCase(),
      size: m[3],
      scale: m[4],
      pk: /PRIMARY\s+KEY/i.test(field),
      autoincrement: /AUTOINCREMENT/i.test(field),
      "default": eval((_ref2 = field.match(/DEFAULT\s+(\d+|\'.*?\')/i)) != null ? _ref2[1] : void 0),
      nullable: !(/NOT\s+NULL/i.test(field))
    };
    this.existing[item.name] = item;
    _results.push(this.adjust_field_options(item));
  }
  return _results;
};
WishTableColumns.prototype.clarify_demands = function(item) {
  this.adjust_field_options(item);
  if (item.type.match(/INT/i)) {
    item.type = 'INTEGER';
  }
  item.ref = void 0;
  return item.comment = void 0;
};
WishTableColumns.prototype.add_sql = function(item) {
  item.sql = "" + item.name + " " + item.type;
  if (item.size != null) {
    item.sql += " (" + item.size;
    if (item.scale != null) {
      item.sql += ", " + item.scale;
    }
    item.sql += ")";
  }
  if (item.pk) {
    item.sql += " PRIMARY KEY";
  }
  if (item.autoincrement) {
    item.sql += " AUTOINCREMENT";
  }
  if ((!item.nullable) && (!item.autoincrement)) {
    item.sql += " NOT NULL";
  }
  if (item["default"] != null) {
    return item.sql += " DEFAULT '" + item["default"] + "'";
  }
};
WishTableColumns.prototype.schedule_modifications = function(old, young) {
  return this.todo.create.push(young);
};
WishTableColumns.prototype.create = function(items) {
  var def, defs, event, existed, exprs, i, idx, item, keys, name, names, sql, ts, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref;
  existed = (function() {
    var _results;
    _results = [];
    for (i in this.existing) {
      _results.push(i);
    }
    return _results;
  }).call(this);
  if (existed.length > 0) {
    keys = db.column(["SELECT sql from sqlite_master WHERE type = 'index' AND tbl_name = ? AND sql IS NOT NULL", this.options.table]);
    db["do"]("CREATE TEMP TABLE __buffer AS SELECT * FROM " + this.options.table);
    db["do"]("DROP TABLE " + this.options.table);
  }
  names = [];
  defs = [];
  ts = [];
  idx = {};
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    item = items[_i];
    this.add_sql(item);
    if (item.type === 'TIMESTAMP') {
      ts.push(item.name);
    }
    defs.push(item.sql);
    idx[item.name] = item;
  }
  for (name in this.existing) {
    if (idx[name] != null) {
      continue;
    }
    item = this.existing[name];
    this.add_sql(item);
    if (item.type === 'TIMESTAMP') {
      ts.push(item.name);
    }
    defs.push(item.sql);
    idx[item.name] = item;
  }
  db["do"]("CREATE TABLE " + this.options.table + " (" + defs + ")");
  if (existed.length > 0) {
    exprs = (function() {
      var _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = existed.length; _i < _len; _i++) {
        name = existed[_i];
        def = (_ref = idx[name]) != null ? _ref["default"] : void 0;
        _results.push(def != null ? "IFNULL(" + name + ", '" + def + "')" : name);
      }
      return _results;
    })();
    db["do"]("INSERT INTO  " + this.options.table + " (" + existed + ") SELECT " + exprs + " FROM __buffer");
    db["do"]("DROP TABLE __buffer");
    for (_j = 0, _len2 = keys.length; _j < _len2; _j++) {
      sql = keys[_j];
      db["do"](sql);
    }
  }
  for (_k = 0, _len3 = ts.length; _k < _len3; _k++) {
    name = ts[_k];
    _ref = ['insert', 'update'];
    for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
      event = _ref[_l];
      db["do"]("CREATE TRIGGER " + this.options.table + "_" + name + "_timestamp_" + event + "_trigger AFTER " + event + " ON " + this.options.table + "\n    BEGIN\n        UPDATE " + this.options.table + " SET " + name + " = NOW() WHERE oid = new.oid;\n    END;");
    }
  }
  return db["do"]("VACUUM");
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
WishTableKeys.prototype.explore_existing = function() {
  var len;
  len = 1 + this.options.table.length;
  return db["do"](["SELECT * FROM sqlite_master WHERE type = 'index' and tbl_name = ? AND sql IS NOT NULL", this.options.table], __bind(function(i) {
    var item, m;
    if (!(m = i.sql.match(/\((.*)\)/))) {
      return;
    }
    item = {
      global_name: i.name.toLowerCase(),
      parts: m[1].replace(/\s/g, '')
    };
    return this.existing[item.name = item.global_name.substr(len)] = item;
  }, this));
};
var def, json, over, print;
json = function(o) {
  return JSON.stringify(o);
};
print = function(s) {
  return system.stdout(s);
};
def = function(o, d) {
  var i, _ref;
  for (i in d) {
    if (typeof o[i] !== 'undefined') {
      continue;
    }
    (_ref = o[i]) != null ? _ref : o[i] = d[i];
  }
  return o;
};
over = function(o, d) {
  var i;
  for (i in d) {
    o[i] = d[i];
  }
  return o;
};
Db.prototype._get_scalar = function(i) {
  return i[0];
};
Db.prototype._get_array = function(i) {
  return i;
};
Db.prototype._get_object = function(i) {
  return db._get_hash_getter(i, db._last_rs.fetchNames(0));
};
Db.prototype.prepare = function(sql) {
  var code, f, i, parts, s, _i, _len;
  log.on('db.prepare', {
    label: sql
  });
  parts = (function() {
    var _i, _len, _ref, _results;
    _ref = ("" + sql).split('\?');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      _results.push(i.replace(/'/g, "\\'"));
    }
    return _results;
  })();
  code = "'" + parts.shift() + "'";
  i = 0;
  for (_i = 0, _len = parts.length; _i < _len; _i++) {
    s = parts[_i];
    code += "+db.escape(p[" + (i++) + "])+'" + s + "'";
  }
  code = "f = function (p) {return (" + code + ")}";
  f = null;
  eval(code);
  log.off('db.prepare');
  return f;
};
Db.prototype.execute = function(prepared_query, params) {
  var result, sql;
  log.on('db.execute');
  sql = prepared_query(params);
  result = _db.query(sql);
  log.off('db.execute', {
    label: sql
  });
  return result;
};
Db.prototype.arrays = function(qp) {
  var params, query, result, sql, _ref;
  log.on('db.arrays');
  _ref = this.qp(qp), query = _ref[0], params = _ref[1];
  sql = this.prepare(query);
  params != null ? params : params = [];
  result = (this.execute(sql, params)).fetchArrays();
  log.off('db.arrays', {
    label: sql + " " + json(params + " " + result.length)
  });
  return result;
};
Db.prototype._insertId = function() {
  return _db.insertId();
};
Db.prototype["do"] = function(qp, callback, options) {
  var p, param_list, params, prepared_query, query, result, _i, _len, _ref, _ref2;
  log.on('db.do', {
    label: json(qp)
  });
  (_ref = this._gen_hash_accessor) != null ? _ref : this._gen_hash_accessor = 'rs[$1]';
  options != null ? options : options = {};
  result = options.init;
  _ref2 = this.qp(qp), query = _ref2[0], params = _ref2[1];
  prepared_query = this.prepare(query);
  params != null ? params : params = [];
  if (!is_array(params)) {
    params = [params];
  }
  param_list = params.length > 0 && is_array(params[0]) ? params : [params];
  for (_i = 0, _len = param_list.length; _i < _len; _i++) {
    p = param_list[_i];
    result = this._do(prepared_query, p, result, callback, options);
  }
  log.off('db.do');
  return result;
};
Db.prototype._do = function(prepared_query, params, result, callback, options) {
  var fieldNames, i, row, rs, _i, _len, _ref, _ref2;
  db._last_rs = rs = this.execute(prepared_query, params);
  if (callback == null) {
    return;
  }
  (_ref = options.row) != null ? _ref : options.row = this._get_object;
  fieldNames = rs.fetchNames(0);
  if (options.idx != null) {
    result.idx = {};
    options.idxidx = fieldNames.indexOf(options.idx);
  }
  _ref2 = rs.fetchArrays(0);
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    i = _ref2[_i];
    row = options.row(i, fieldNames);
    if (typeof row === 'function') {
      options.row = row;
      row = options.row(i);
    }
    if (options.idx != null) {
      result.idx[i[options.idxidx]] = row;
    }
    result = callback(row, result);
    if (options.one) {
      break;
    }
  }
  return result;
};
var SQLite, _db;
SQLite = (require('sqlite')).SQLite;
_db = new SQLite;
_db.open(Config.db.file);

var assert, __test;
assert = require("assert");
__test = {};
__test.test_001_model_update = function() {
  var sum;
  try {
    model.set('default', {
      "default": true,
      columns: {
        id: {
          type: 'INTEGER',
          pk: true,
          autoincrement: true
        },
        id_session: {
          type: 'DECIMAL',
          size: 20,
          ref: 'session'
        }
      }
    });
    model.set('user', {
      columns: {
        label: 'varchar'
      },
      keys: {
        label: 'label'
      },
      data: {
        1: {
          label: 'admin',
          id_session: 0
        },
        2: {
          label: 'user',
          id_session: 0
        }
      }
    });
    model.set('session', {
      columns: {
        id_session: void 0,
        id_user: '-> user',
        id: {
          type: 'DECIMAL',
          size: 20,
          pk: true
        }
      }
    });
    assert.equal(model.pk('user'), 'id');
    model.assert();
    assert.deepEqual(db.objects('SELECT * FROM user WHERE id IN (1, 2) ORDER BY id'), [
      {
        id: 1,
        label: 'admin',
        id_session: 0
      }, {
        id: 2,
        label: 'user',
        id_session: 0
      }
    ], "user data skewed");
    sum = model.assert();
    return assert.equal(sum, 0, "Unneeded actions performed");
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
__test.test_002_db = function() {
  var cnt, id, id1, id2, o;
  try {
    model.set('default', {
      "default": true,
      columns: {
        id: {
          type: 'int',
          pk: true,
          autoincrement: true
        },
        id_session: {
          type: 'DECIMAL',
          size: 20,
          ref: 'session'
        }
      }
    });
    model.set('user', {
      columns: {
        label: 'varchar'
      },
      keys: {
        label: 'label'
      }
    });
    model.assert();
    db["do"]("DELETE FROM user");
    id = db.insert_id('user', {
      label: 'admin'
    });
    assert.equal(db.int(['SELECT COUNT(*) FROM user WHERE label = ?', 'admin']), 1, "the right record is not found");
    assert.equal(db.int(['SELECT id       FROM user WHERE label = ?', 'admin']), id, "wrong insert id");
    assert.equal(db.int(['SELECT COUNT(*) FROM user WHERE label <> ?', 'admin']), 0, "wrong records found");
    db.update('user', {
      id: id,
      label: 'user'
    });
    assert.equal(db.int(['SELECT COUNT(*) FROM user WHERE label = ?', 'user']), 1, "the right record is not found");
    assert.equal(db.int(['SELECT id       FROM user WHERE label = ?', 'user']), id, "wrong insert id");
    assert.equal(db.int(['SELECT COUNT(*) FROM user WHERE label <> ?', 'user']), 0, "wrong records found");
    db["delete"]('user', {
      id: id,
      label: 'foo'
    });
    cnt = db.int(['SELECT COUNT(*) FROM user WHERE label = ?', 'user']);
    assert.equal(cnt, 0, "delete record failed");
    assert.equal(typeof cnt, 'number', "not a number returned");
    id = db.get_id('user', {
      label: 'admin',
      id_session: [0]
    }, 'label');
    o = db.object(['SELECT * FROM user WHERE id = ?', id]);
    assert.deepEqual(o, {
      id: id,
      label: 'admin',
      id_session: 0
    }, "insert by db.get_id failed");
    db.get_id('user', {
      label: 'admin',
      id_session: [-1]
    }, 'label');
    o = db.object(['SELECT * FROM user WHERE id = ?', id]);
    assert.deepEqual(o, {
      id: id,
      label: 'admin',
      id_session: 0
    }, "non-mandatory update by db.get_id");
    db.get_id('user', {
      label: 'admin',
      id_session: -1
    }, 'label');
    o = db.object(['SELECT * FROM user WHERE id = ?', id]);
    assert.deepEqual(o, {
      id: id,
      label: 'admin',
      id_session: -1
    }, "failed mandatory update by db.get_id");
    db["delete"]('user', id);
    assert.equal(db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?', 'user']), 0, "delete by pk failed");
    id1 = db.insert_id('user', {
      label: 'admin',
      id_session: -1
    });
    o = db.object(['SELECT * FROM user WHERE id = ?', id1]);
    id2 = (db.clone('user', o, {
      id_session: 0
    })).id;
    assert.notEqual(id1, id2, "wrong clone ID");
    assert.equal(db.scalar(['SELECT COUNT(*) FROM user WHERE label = ? AND id IN (?, ?)', ['admin', id1, id2]]), 2, "cloning failed");
    assert.deepEqual(db.array(['SELECT MIN(id_session), MAX(id_session) FROM user WHERE label = ? AND id IN (?, ?)', ['admin', id1, id2]]), [-1, 0], "cloning failed");
    return db["do"]('DELETE FROM user');
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
__test.test_003_is_array = function() {
  assert.ok(!is_array(void 0), "undefined is considered array");
  assert.ok(!is_array(null), "null is considered array");
  assert.ok(!is_array(true), "true is considered array");
  assert.ok(!is_array(false), "false is considered array");
  assert.ok(!is_array(0), "0 is considered array");
  assert.ok(!is_array(-15), "-15 is considered array");
  assert.ok(!is_array(3.14), "3.14 is considered array");
  assert.ok(!is_array('foo'), "'foo' is considered array");
  assert.ok(!is_array({}), "{} is considered array");
  assert.ok(!is_array({
    foo: 1
  }), "{foo: 1} is considered array");
  assert.ok(is_array([]), "[] is not recognized as an array");
  return assert.ok(is_array([1, 'foo']), "[1, 'foo'] is not recognized as an array");
};
__test.test_004_put = function() {
  var cnt, fact, plan, sql;
  try {
    model.set('default', {
      "default": true,
      columns: {
        id: {
          type: 'int',
          pk: true,
          autoincrement: true
        }
      }
    });
    model.set('plan', {
      columns: {
        year: 'int',
        month: 'int',
        amount: 'int'
      },
      keys: {
        ym: 'year,month'
      }
    });
    model.assert();
    db["do"]('DELETE FROM plan');
    sql = 'SELECT month, amount FROM plan WHERE year = 2011 ORDER BY month';
    cnt = 'SELECT COUNT(*) FROM plan';
    plan = [
      {
        month: "1",
        amount: "100"
      }, {
        month: "2",
        amount: "200"
      }
    ];
    db.put('plan', plan, 'month', {
      year: "2011"
    });
    fact = db.objects(sql);
    assert.deepEqual(fact, plan, "1st plan storing failed");
    assert.equal(db.int(cnt), 2, "Wrong record number");
    plan = [
      {
        month: "2",
        amount: "250"
      }, {
        month: "3",
        amount: "100"
      }
    ];
    db.put('plan', plan, 'month', {
      year: "2011"
    });
    fact = db.objects(sql);
    assert.deepEqual(fact, plan, "2nd plan storing failed");
    assert.equal(db.int(cnt), 2, "Wrong record number");
    db["do"]('DROP TABLE plan');
    model.set('plan', {
      columns: {
        id_session: {
          type: 'DECIMAL',
          size: 20,
          ref: 'session',
          actual_deleted: [null, -2]
        }
      }
    });
    model.assert();
    sql = 'SELECT month, amount FROM plan WHERE year = 2011 AND id_session IS NULL ORDER BY month';
    cnt = 'SELECT COUNT(*) FROM plan';
    plan = [
      {
        month: "1",
        amount: "100"
      }, {
        month: "2",
        amount: "200"
      }
    ];
    db.put('plan', plan, 'month', {
      year: "2011"
    });
    fact = db.objects(sql);
    assert.deepEqual(fact, plan, "1st plan storing failed");
    assert.equal(db.int(cnt), 2, "Wrong record number");
    plan = [
      {
        month: "2",
        amount: "250"
      }, {
        month: "3",
        amount: "100"
      }
    ];
    db.put('plan', plan, 'month', {
      year: "2011"
    });
    fact = db.objects(sql);
    assert.deepEqual(fact, plan, "2nd plan storing failed");
    assert.equal(db.int(cnt), 3, "Wrong record number");
    plan = [
      {
        month: "1",
        amount: "100"
      }, {
        month: "2",
        amount: "250"
      }, {
        month: "3",
        amount: "100"
      }
    ];
    db.put('plan', plan, 'month', {
      year: "2011"
    });
    fact = db.objects(sql);
    assert.deepEqual(fact, plan, "3rd plan storing failed");
    return assert.equal(db.int(cnt), 3, "Wrong record number");
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
__test.test_005_sql = function() {
  var i, _i, _len, _ref;
  try {
    model.set('default', {
      "default": true,
      columns: {
        id: {
          type: 'INTEGER',
          pk: true,
          autoincrement: true
        },
        id_session: {
          type: 'DECIMAL',
          size: 20,
          ref: 'session',
          actual_deleted: [null, -2]
        }
      }
    });
    model.set('user', {
      options: {
        order: 'label'
      },
      columns: {
        label: 'varchar {10}'
      },
      keys: {
        label: 'label'
      },
      data: {
        1: {
          label: 'admin',
          id_session: null
        },
        2: {
          label: 'user',
          id_session: null
        }
      }
    });
    model.set('session', {
      columns: {
        id_session: void 0,
        id_user: '-> user',
        id: {
          type: 'DECIMAL',
          size: 20,
          pk: true
        }
      },
      data: {
        1: {
          id_user: 1
        }
      }
    });
    model.assert();
    _ref = ['user', 'session'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      i = _ref[_i];
      db["do"]("DELETE FROM " + i);
    }
    model.assert();
    assert.deepEqual(db.arrays(sql('user:id,label')), [["admin", "1"], ["user", "2"]], "SQL 1");
    assert.deepEqual(db.objects(sql('user')), [
      {
        "label": "admin",
        "id": "1",
        "id_session": null
      }, {
        "label": "user",
        "id": "2",
        "id_session": null
      }
    ], "SQL 2");
    assert.deepEqual(db.object(sql('user', {
      id: 1
    }, '<- session')), {
      "label": "admin",
      "id": "1",
      "id_session": null,
      "session": {
        "id": "1",
        "id_user": "1"
      }
    }, "SQL 3");
    assert.deepEqual(db.object(sql('user', 1, 'session')), {
      "label": "admin",
      "id": "1",
      "id_session": null,
      "session": {
        "id": null,
        "id_user": null
      }
    }, "SQL 4");
    assert.deepEqual(db.objects(sql('session', 'user', {
      id_session: null,
      COLUMNS: ['UPPER(label) AS name']
    })), [
      {
        "id": "1",
        "id_user": "1",
        "name": "ADMIN"
      }
    ], "SQL 4");
    return assert.equal(db.int(sql('user:COUNT(*)')), 2, "SQL 5");
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
__test.test_006_string = function() {
  try {
    assert.equal("X".by(3), "XXX", "by");
    assert.equal("z".rpad(3), "z  ", "rpad 1");
    assert.equal("z".rpad(3, 'z'), "zzz", "rpad 2");
    assert.equal("z".lpad(3), "  z", "lpad 1");
    assert.equal("z".lpad(3, 'z'), "zzz", "lpad 2");
    assert.equal("2011".lpad(4, '0'), "2011", "lpad 3");
    assert.equal(sprintf("Hello, %s!", 'world'), "Hello, world!", "sprintf 1");
    assert.equal(sprintf("Hello, %6s!", 'world'), "Hello,  world!", "sprintf 2");
    assert.equal(sprintf("Hello, %-6s!", 'world'), "Hello, world !", "sprintf 3");
    return assert.equal(sprintf("Wake on %02d:%02d", 9, 0), "Wake on 09:00", "sprintf 4");
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
require("test").run(__test);
