json   = (o) -> JSON.stringify (o)

print  = (s) -> system.stdout  (s)

def    = (o, d) ->

    o[i] ?= d[i] for i of d

    return o
