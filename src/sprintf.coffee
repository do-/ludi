sprintf = (f, v...) -> __sprintfer.get_template(f)(v)

class Sprintfer

    constructor: ()   ->
        @cache = {}
        @re1   = /(\%[^\%a-z]*[a-z])/

    get_template: (f) ->
        @cache[f] ?= @compile_template(f)

    compile_template: (f) ->
        code = ''
        n    = 0
        for i in f.split @re1
            continue if i.length == 0
            code += '+' if code.length > 0
            if i.match @re1
                e = "new String(v[#{n++}])"
                m = i.match /([1-9]\d*)/
                if m?
                    lr = if i.match /\-/  then 'rpad' else 'lpad'
                    p  = if i.match /\D0/ then ',"0"' else ''
                    e += ".#{lr}(#{m[1]}#{p})"
                code += e
            else
                code += json i.replace(/\%\%/g, '%')
         t = null
         eval "t = function(v){return #{code}}"
         t

__sprintfer = new Sprintfer