say  = (s) -> print s + "\n"

darn = (o) -> say Dumper o; o

eq = (a, b) ->
    return true   if not a? and not b?
    return false  if a? != b?
    return false  if typeof a isnt typeof b
    return '' + a is '' + b if typeof a isnt 'object'
    for i of a
        return false if not eq a[i], b[i]
    for i of b
        return false if not eq a[i], b[i]
    true