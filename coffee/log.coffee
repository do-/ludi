class Log

    constructor: () ->
        @stack   = []
        @handler = {'': [undefined, undefined]}

    on: (type, o) ->
        o        ?= {}
        o.__dt    = new Date
        o.__type  = type
        o.__level = @stack.length
        @stack.push o
        @__handle type, 0, o

    off: (type, n) ->
        n        ?= {}
        n.__dt    = new Date
        n.__type  = type
        while @stack.length > 0
            o = @stack.pop()
            n.__duration = n.__dt.getTime() - o.__dt.getTime()
            if @stack.length > 0
                last = @stack[@stack.length - 1]
                o.__details ?= {}
                last.__details ?= {}
                net = n.__duration
                for k of o.__details
                    v = o.__details[k]
                    net -= v
                    last.__details[k] += v
                last.__details[type] += net
            @__handle type, 1, o, n
            break if o.__type is type

    __handle: (type, kind, o, n) ->
        type_verbatim = type
        for i in [1 .. 10]
            type_config = @handler[type]
            if !type_config?
                type = type.replace /\.?\w+$/, ''
                continue
            @handler[type_verbatim] ?= type_config
            break
        h = type_config[kind]
        return unless h?
        return @[h](o, n) unless is_array h
        @[i](o, n) for i in h
        null

    print_tree: (o, n) ->
        now = n.__dt
        s  = now.toUTCString()
        s += ' '
        s += '      ' for i in [0 .. 5 - o.__level]
        d = n.__duration.toString()
        s += ' ' for i in [1 .. (6 - d.length)]
        s += d
        s += '      ' for i in [0 .. o.__level]
        s += o.__type
        s += ' '
        if o.__type isnt n.__type
            s += '[ABORT]'
        else
            c  = n.label
            c ?= o.label
            c ?= ''
            s += c.replace /\s+/g, ' '
        say s

log = new Log