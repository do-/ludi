class Log

    constructor: () ->
        @stack   = []
        @handler = {'': undefined}

    on: (type, o) ->
        o        ?= {}
        o.__dt    = new Date
        o.__type  = type
        o.__level = @stack.length
        @stack.push o
        @get_handler(type)?.on?(o)

    off: (type, n) ->
        n        ?= {}
        n.__dt    = new Date
        n.__type  = type
        while @stack.length > 0
            o = @stack.pop()
            n.__duration = n.__dt.getTime() - o.__dt.getTime()
            def n, o
            if @stack.length > 0
                last = @stack[@stack.length - 1]
                o.__details ?= {}
                d = (last.__details ?= {})
                net = n.__duration
                for k of o.__details
                    net -= (v = o.__details[k])
                    d[k] ?= 0
                    d[k] += v
                d[type] ?= 0
                d[type] += net
            @get_handler(type)?.off?(o,n)
            break if o.__type is type

    get_handler: (type) ->
        type_verbatim = type
        for i in [1 .. 10]
            type_config = @handler[type]
            if !type_config?
                type = type.replace /\.?\w+$/, ''
                continue
            return @handler[type_verbatim] ?= type_config

    tree_printer: (pad, max) ->
        @.pad = " ".by pad
        @.off = (o, n) ->
            say sprintf "%s #{@pad.by max - n.__level}%6d#{@pad.by n.__level}    %s %s", n.__dt, n.__duration, o.__type, (if o.__type isnt n.__type then '[ABORT]' else (n.label ?= "").replace /\s+/g, ' ')
        @

    table_printer: () ->
        @format = '%50s %8.1f ms %3d %%'
        @bar    = "-".by 68
        @.off = (o, n) ->
            _d     = n.__details
            d      = ({label: i, value: _d[i]} for i of _d).sort((a, b) -> a.value-b.value)
            sum    = 0
            total  = n.__duration
            line   = (i) => sprintf @format, i.label, i.value, Math.round 100 * i.value / total
            say @bar
            for i in d
                sum += i.value
                say line i
            say line {label: "OTHER " + n.__type, value: total - sum}
            say @bar
            say line {label: "TOTAL " + n.__type, value: total}
            say @bar
        @

log = new Log

#log.handler[''] = new log.tree_printer 5, 5