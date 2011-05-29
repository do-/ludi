json   = (o) -> JSON.stringify (o)

say    = (s) -> print s + "\n"

darn   = (o) -> say json o; o

debug  = (s, o) -> say s + ': ' + json o; o

def    = (o, d) ->
    for i of d
        continue if typeof o[i] isnt 'undefined'
        o[i] ?= d[i]
    return o

die    = (x) ->
    if is_array x
        throw {message: x[1], field: x[0]}
    else
        throw {message: x}

over    = (o, d) ->
    o[i] = d[i] for i of d
    return o

eq = (a, b) ->
    return true   if not a? and not b?
    return false  if a? != b?
    a = '' + a if typeof a is 'number'
    b = '' + b if typeof b is 'number'
    return false  if typeof a isnt typeof b
    return a is b if typeof a isnt 'object'
    for i of a
        return false if not eq a[i], b[i]
    for i of b
        return false if not eq a[i], b[i]
    true

clone = (o) -> eval json o

is_array = (o) ->
    return false unless o?
    return false unless typeof o is 'object'
    return false unless typeof o.splice is 'function'
    return false unless typeof o.length is 'number'
    return false if o.propertyIsEnumerable('length')
    return true


String.prototype.by   = (n)        -> return '' if n <= 0; s = ''; s += @ for i in [1 .. n]; s
String.prototype.rpad = (len, pad) -> @ + (pad ?= " ").by len - @.length
String.prototype.lpad = (len, pad) -> ((pad ?= " ").by (len - @.length)) + @

Date.prototype.toString = () -> sprintf "%04d-%02d-%02d %02d:%02d:%02d:%03d", @.getFullYear(), 1 + @.getMonth(), @.getDate(), @.getHours(), @.getMinutes(), @.getSeconds(), @.getMilliseconds()
