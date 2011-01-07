class WishTableColumns extends Wish

    adjust_dimension: (col, key, value)         ->
        if (col[key] < value) then col[key] = value

    adjust_dimensions_for_char: (old, young)    ->
        @adjust_dimension young, 'size', old.size

    adjust_dimensions_for_decimal: (old, young) ->
        @adjust_dimension young, 'scale', old.scale
        @adjust_dimension young, 'size' , old.size + young.scale - old.scale

    adjust_dimensions: (old, young, tests) ->
        type = old.type
        return if type isnt young.type
        for t in ['char', 'decimal']
            continue if type.search t.toUpperCase() < 0
            @['adjust_dimensions_for_' + t] old, young

    update_demands: (old, young) ->
        @adjust_dimensions(old, young)

    adjust_field_options: (item)    ->
        item.pk            ?= false
        item.autoincrement ?= false
        item.default        = if item.default? then '' + item.default else null
        item.nullable      ?= (not item.default?) and not (item.autoincrement)
        item.type           = item.type.toUpperCase()
        item.type           = 'DECIMAL' if item.type is 'NUMERIC'
        switch item.type
            when 'DECIMAL'
                item.size  ?= 10
                item.scale ?= 0
            when 'VARCHAR'
                item.size  ?= 255
                item.scale  = null
            else
                item.size   = null
                item.scale  = null
