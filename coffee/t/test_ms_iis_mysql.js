/*
    http://www.JSON.org/json2.js
    2011-01-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var clone, darn, debug, def, eq, is_array, json, over, say;
json = function(o) {
  return JSON.stringify(o);
};
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
  Db.prototype.integer = function(qp) {
    return parseInt(this.scalar(qp));
  };
  Db.prototype.number = function(qp) {
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
Db.prototype.connect = function(o) {
  if (eq(o, this.o) && this.ping()) {
    return;
  }
  return this.__connect((this.o = o));
};
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
      if (typeof item[i] === 'undefined') {
        continue;
      }
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
    if ((table.COLUMNS != null) && table.COLUMNS.length > 0) {
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
      if (table.is_abstract) {
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
      table.is_abstract = true;
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
    _ref3 = ['is_abstract', 'default'];
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
var Assert, assert;
Assert = (function() {
  function Assert() {}
  Assert.prototype.ok = function(condition, message, details) {
    say(sprintf("%-60sok", message, condition));
    if (condition) {
      return;
    }
    throw new Error(details);
  };
  Assert.prototype.equal = function(actual, expected, message) {
    return this.ok(eq(actual, expected), message, "" + (json(actual)) + " != " + (json(expected)));
  };
  Assert.prototype.notEqual = function(actual, expected, message) {
    return this.ok(!eq(actual, expected), message, "" + (json(actual)) + " == " + (json(expected)));
  };
  return Assert;
})();
assert = new Assert;
assert.deepEqual = assert.equal;
Db.prototype.ping = function() {
  try {
    return 1 === db.integer("SELECT 1");
  } catch (e) {
    return 0;
  }
};
Db.prototype.escape = function(s) {
  if (s == null) {
    return 'NULL';
  }
  return "'" + (('' + s).replace(/\'/i, "''")) + "'";
};
Db.prototype.quote_name = function(s) {
  return '`' + s + '`';
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
WishTableColumns.prototype.clarify_demands = function(item) {
  var _ref;
  this.adjust_field_options(item);
  item.ref = void 0;
  if (item.type === 'INTEGER') {
    item.type = 'INT';
  }
  if (item.pk) {
    item.nullable = false;
  }
  (_ref = item["default"]) != null ? _ref : item["default"] = (item.type.match(/(CHAR|TEXT)/) ? '' : 0);
  if (item.pk) {
    return item["default"] = void 0;
  }
};
WishTableColumns.prototype.add_sql = function(item) {
  return item.sql = "" + item.name + " " + (this.gen_sql(item));
};
WishTableColumns.prototype.gen_sql = function(item) {
  var sql;
  sql = item.type;
  if (item.size != null) {
    sql += "(" + item.size;
    if (item.scale != null) {
      sql += "," + item.scale;
    }
    sql += ")";
  }
  if (item.pk) {
    sql += " PRIMARY KEY";
  }
  if (item.autoincrement) {
    sql += " AUTO_INCREMENT";
  }
  if ((!item.nullable) && (!item.autoincrement)) {
    sql += " NOT NULL";
  }
  if (item["default"] != null) {
    sql += " DEFAULT '" + item["default"] + "'";
  }
  return sql;
};
WishTableColumns.prototype.schedule_modifications = function(old, young) {
  var _base, _ref;
  return ((_ref = (_base = this.todo).modify) != null ? _ref : _base.modify = []).push(young);
};
WishTableColumns.prototype.def_list = function(verb, items) {
  var item, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    item = items[_i];
    this.add_sql(item);
    _results.push(verb + ' ' + item.sql);
  }
  return _results;
};
WishTableColumns.prototype.create = function(items) {
  var defs, is_create;
  is_create = json(this.existing) === '{}';
  defs = this.def_list((is_create ? '' : 'ADD'), items);
  return db["do"](is_create ? "CREATE TABLE " + this.options.table + " (" + defs + ")" : "ALTER TABLE " + this.options.table + " " + defs);
};
WishTableColumns.prototype.modify = function(items) {
  var def, item, pk, _i, _len, _results;
  _results = [];
  for (_i = 0, _len = items.length; _i < _len; _i++) {
    item = items[_i];
    this.add_sql(item);
    _results.push((function() {
      try {
        return db["do"]("ALTER TABLE " + this.options.table + " MODIFY " + item.sql);
      } catch (e) {
        if (this.existing[item.name].pk) {
          db["do"]("ALTER TABLE " + this.options.table + " DROP PRIMARY KEY");
        }
        pk = item.pk;
        delete item.pk;
        def = this.gen_sql(item);
        db["do"]("ALTER TABLE " + this.options.table + " ADD _ " + def);
        db["do"]("UPDATE " + this.options.table + " SET _ = " + item.name);
        db["do"]("ALTER TABLE " + this.options.table + " DROP " + item.name);
        db["do"]("ALTER TABLE " + this.options.table + " CHANGE _ " + item.name + " " + def);
        if (pk) {
          return db["do"]("ALTER TABLE " + this.options.table + " ADD PRIMARY KEY (" + item.name + ")");
        }
      }
    }).call(this));
  }
  return _results;
};
WishTableColumns.prototype.explore_existing = function() {
  var pk, _ref;
  if (db.objects("SHOW TABLES LIKE '" + this.options.table + "'").length === 0) {
    return {};
  }
  pk = (_ref = db.object("SHOW KEYS FROM " + this.options.table + " WHERE Key_name = 'PRIMARY'")) != null ? _ref.column_name : void 0;
  return db["do"](["SELECT\n    column_name\n    , data_type\n    , column_default\n    , column_comment\n    , is_nullable\n    , numeric_precision\n    , numeric_scale\n    , character_maximum_length\n    , extra\nFROM\n    information_schema.columns\nWHERE\n    table_schema=database()\n    AND table_name = ?", this.options.table], __bind(function(i) {
    var item, _ref, _ref2;
    item = {
      name: i.column_name.toLowerCase(),
      type: i.data_type.toUpperCase(),
      size: ((_ref = i.numeric_precision) != null ? _ref : i.numeric_precision = 0) + ((_ref2 = i.character_maximum_length) != null ? _ref2 : i.character_maximum_length = 0),
      scale: i.numeric_scale,
      pk: i.column_name === pk,
      autoincrement: i.extra === 'auto_increment',
      "default": i.column_default,
      nullable: i.is_nullable === 'YES',
      comment: i.column_comment
    };
    this.existing[item.name] = item;
    return this.adjust_field_options(item);
  }, this));
};
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
WishTableKeys.prototype.explore_existing = function() {
  var len, name, _results;
  len = 1 + this.options.table.length;
  db["do"]("SHOW KEYS FROM " + this.options.table, __bind(function(i) {
    var name, part, _base, _ref, _ref2;
    (_ref = i.key_name) != null ? _ref : i.key_name = i.index_name;
    if (i.key_name === 'PRIMARY') {
      return;
    }
    part = i.column_name;
    if (i.sub_part != null) {
      part += "(" + i.sub_part + ")";
    }
    name = i.key_name.toLowerCase().substr(len);
    return ((_ref2 = (_base = this.existing)[name]) != null ? _ref2 : _base[name] = {
      name: name,
      global_name: this.options.table + '_' + name,
      parts: []
    }).parts.push(part);
  }, this));
  _results = [];
  for (name in this.existing) {
    _results.push(this.existing[name].parts += "");
  }
  return _results;
};
var print;
var __slice = Array.prototype.slice;
String.prototype.__original_split = String.prototype.split;
String.prototype.split = function(re) {
  var m, re2, result, s, src, _results;
  src = re.source;
  if (!(src != null ? src.match(/\(/) : void 0)) {
    return this.__original_split(re);
  }
  result = [];
  src = '(.*?)' + src;
  re2 = new RegExp(src);
  s = this;
  _results = [];
  while (true) {
    m = s.match(re2);
    if (m == null) {
      if (s.length > 0) {
        result.push(s);
      }
      return result;
    }
    result.push(m[1]);
    result.push(m[2]);
    _results.push(s = s.substr(m[1].length + m[2].length));
  }
  return _results;
};
print = function(s) {
  return Response.Write(s);
};
Db.prototype._get_scalar = function(i) {
  return db.__s(i, 0);
};
Db.prototype._get_array = function(i) {
  var j, _ref, _results;
  _results = [];
  for (j = 0, _ref = i.Fields.Count - 1; (0 <= _ref ? j <= _ref : j >= _ref); (0 <= _ref ? j += 1 : j -= 1)) {
    _results.push(db.__s(i, j));
  }
  return _results;
};
Db.prototype._get_object = function(i) {
  return db._get_hash_getter(i, db._last_field_names);
};
Db.prototype.prepare = function(sql) {
  var ps;
  ps = Server.CreateObject("ADODB.Command");
  ps.ActiveConnection = _db;
  ps.CommandText = sql;
  try {
    ps.Prepared = true;
  } catch (e) {
    0;
  }
  return ps;
};
Db.prototype.execute = function(ps, params) {
  var i, result, v, _ref, _ref2;
  log.on('db.execute', {
    label: json(params)
  });
  if (params.length > 0) {
    if (ps.Parameters.Count === 0) {
      for (i = 1, _ref = params.length; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
        ps.Parameters.Append(ps.CreateParameter);
      }
    }
    for (i = 0, _ref2 = params.length - 1; (0 <= _ref2 ? i <= _ref2 : i >= _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
      v = params[i];
      if (is_array(v)) {
        v = v[0];
      }
      ps.Parameters.Item(i).Value = v;
    }
  }
  result = Server.CreateObject("ADODB.Recordset");
  result = ps.Execute();
  log.off('db.execute');
  return result;
};
Db.prototype.__s = function(rs, i) {
  var v;
  v = rs.Fields(i).Value;
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
Db.prototype._close = function() {
  var i, things, _i, _len, _results;
  things = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  _results = [];
  for (_i = 0, _len = things.length; _i < _len; _i++) {
    i = things[_i];
    if (i.State === 1) {
      i.Close();
    }
    _results.push(i = null);
  }
  return _results;
};
Db.prototype._do = function(prepared_query, params, result, callback, options) {
  var fieldNames, i, row, rs, _ref;
  db._last_rs = rs = this.execute(prepared_query, params);
  if (callback == null) {
    return this._close(rs, prepared_query);
  }
  db._last_field_names = fieldNames = (function() {
    var _ref, _results;
    _results = [];
    for (i = 0, _ref = rs.Fields.Count - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
      _results.push("" + rs.Fields.Item(i).Name.toLowerCase());
    }
    return _results;
  })();
  (_ref = options.row) != null ? _ref : options.row = this._get_object;
  if (options.idx != null) {
    result.idx = {};
    options.idxidx = fieldNames.indexOf(options.idx);
  }
  while (!rs.EOF) {
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
    rs.MoveNext();
  }
  this._close(rs, prepared_query);
  return result;
};
var _db;
_db = null;
Db.prototype.__connect = function(o) {
  _db = Server.CreateObject("ADODB.Connection");
  return _db.Open("Provider=MSDASQL.1;Password=" + o.password + ";Persist Security Info=True;User ID=" + o.user + ";Data Source=" + o.db);
};
Db.prototype._insertId = function() {
  return db.integer("SELECT LAST_INSERT_ID()");
};

var name = 'ludi_test';

db.connect ({
	host:		'127.0.0.1'
	, user:		'root'
	, password:	'z'
	, db:		'test'
});

db['do']("DROP DATABASE IF EXISTS " + name);
db['do']("CREATE DATABASE " + name);

db.connect ({
	host:		'127.0.0.1'
	, user:		'root'
	, password:	'z'
	, db:		name
});
var __test;
__test = {};
__test.test_001_model_update = function() {
  var sum;
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
};
__test.test_001_model_update();
__test.test_002_db = function() {
  var cnt, id, id1, id2, o;
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
  assert.equal(db.integer(['SELECT COUNT(*) FROM user WHERE label = ?', 'admin']), 1, "the right record is not found");
  assert.equal(db.integer(['SELECT id       FROM user WHERE label = ?', 'admin']), id, "wrong insert id");
  assert.equal(db.integer(['SELECT COUNT(*) FROM user WHERE label <> ?', 'admin']), 0, "wrong records found");
  db.update('user', {
    id: id,
    label: 'user'
  });
  assert.equal(db.integer(['SELECT COUNT(*) FROM user WHERE label = ?', 'user']), 1, "the right record is not found");
  assert.equal(db.integer(['SELECT id       FROM user WHERE label = ?', 'user']), id, "wrong insert id");
  assert.equal(db.integer(['SELECT COUNT(*) FROM user WHERE label <> ?', 'user']), 0, "wrong records found");
  db["delete"]('user', {
    id: id,
    label: 'foo'
  });
  cnt = db.integer(['SELECT COUNT(*) FROM user WHERE label = ?', 'user']);
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
};
__test.test_002_db();
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
__test.test_003_is_array();
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
    assert.equal(db.integer(cnt), 2, "Wrong record number");
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
    assert.equal(db.integer(cnt), 2, "Wrong record number");
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
    assert.equal(db.integer(cnt), 2, "Wrong record number");
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
    assert.equal(db.integer(cnt), 3, "Wrong record number");
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
    return assert.equal(db.integer(cnt), 3, "Wrong record number");
  } catch (e) {
    say(e.stack);
    throw e;
  }
};
__test.test_004_put();
__test.test_005_sql = function() {
  var i, _i, _len, _ref;
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
  return assert.equal(db.integer(sql('user:COUNT(*)')), 2, "SQL 5");
};
__test.test_005_sql();
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
__test.test_006_string();
