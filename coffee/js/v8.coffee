json   = (o) -> JSON.stringify (o)

def    = (o, d) ->

    for i of d

        continue if typeof o[i] isnt 'undefined'

        o[i] ?= d[i]

    return o

over    = (o, d) ->

    o[i] = d[i] for i of d

    return o
