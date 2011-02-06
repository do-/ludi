var print;
print = function(s) {
  return Packages.java.lang.System.err.print(s);
};
Db.prototype._get_scalar = function(i) {
  return db.__s(i, 0);
};
Db.prototype._get_array = function(i) {
  var j, _ref, _results;
  _results = [];
  for (j = 0, _ref = i.getMetaData().getColumnCount() - 1; (0 <= _ref ? j <= _ref : j >= _ref); (0 <= _ref ? j += 1 : j -= 1)) {
    _results.push(db.__s(i, j));
  }
  return _results;
};
Db.prototype._get_object = function(i) {
  return db._get_hash_getter(i, db._last_field_names);
};
Db.prototype.prepare = function(sql) {
  return _db.prepareStatement(sql);
};
Db.prototype.execute = function(ps, params) {
  var i, result, v, _ref;
  log.on('db.execute', {
    label: json(params)
  });
  if (params.length > 0) {
    for (i = 1, _ref = params.length; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
      v = params[i - 1];
      if (is_array(v)) {
        v = v[0];
      }
      if (v === null) {
        ps.setNull(i, 12);
      } else {
        ps.setString(i, "" + v);
      }
    }
  }
  try {
    result = ps.executeQuery();
  } catch (e) {
    result = ps.executeUpdate();
  }
  log.off('db.execute');
  return result;
};
Db.prototype.__s = function(rs, i) {
  var v;
  v = rs.getString(i + 1);
  if (v == null) {
    return null;
  }
  return "" + v;
};
Db.prototype["do"] = function(qp, callback, options) {
  var p, param_list, params, prepared_query, query, result, _i, _len, _ref, _ref2;
  log.on('db.do', {
    label: json(qp)
  });
  (_ref = this._gen_hash_accessor) != null ? _ref : this._gen_hash_accessor = 'db.__s(rs,$1)';
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
  var fieldNames, i, md, row, rs, _ref;
  db._last_rs = rs = this.execute(prepared_query, params);
  if (callback == null) {
    return;
  }
  md = rs.getMetaData();
  db._last_field_names = fieldNames = (function() {
    var _ref, _results;
    _results = [];
    for (i = 0, _ref = md.getColumnCount() - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      _results.push("" + md.getColumnLabel(i + 1).toLowerCase());
    }
    return _results;
  })();
  (_ref = options.row) != null ? _ref : options.row = this._get_object;
  if (options.idx != null) {
    result.idx = {};
    options.idxidx = fieldNames.indexOf(options.idx);
  }
  while (rs.next()) {
    row = options.row(rs, fieldNames);
    if (typeof row === 'function') {
      options.row = row;
      row = options.row(rs);
    }
    if (options.idx != null) {
      result.idx[i[options.idxidx]] = row;
    }
    result = callback(row, result);
    if (options.one) {
      break;
    }
  }
  rs.close();
  return result;
};