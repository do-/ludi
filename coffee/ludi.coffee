say  = (s) -> print s + "\n"

darn = (o) -> say json o; o

debug = (s, o) -> say s + ': ' + json o; o

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


