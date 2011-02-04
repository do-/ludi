class Wish

    constructor: (@items, @options) ->
#        @options.debug = 1
        @items = clone @items
        @is_virgin = true

    adjust_options: () ->
        @options.get_key ?= (o) -> o.name

    clarify_demands:        (item)             ->
    explore_existing:       ()                 ->
    update_demands:         (old, young)       ->
    schedule_modifications: (old, young)       ->
    schedule_cleanup:       ()                 ->

    realize: () ->
        @adjust_options()
        debug '\n\nItems to realize', @items if @options.debug
        @clarify_demands i for i in @items
        @split_layers()
        debug 'Layers', @layers if @options.debug
        sum = 0
        for i in @layers
            sum += @scan_layer i
        sum

    split_layers: () ->
        key_cnt   = {}
        @layers   = []
        for item in @items
            key           = @options.get_key item
            key_cnt[key] ?= 0
            (@layers[key_cnt[key]++] ?= {})[key] = item
        @layers   = [{}] if @layers.length == 0

    plan_todo: (layer, key) ->
        debug ' Key to analyze', key if @options.debug
        young = layer[key]
        debug ' Item to analyze', young if @options.debug
        unless (old = @existing[key])?
            say ' Not found in existing' if @options.debug
            return @todo.create.push young
        @found[key] = true
        @update_demands old, young
        debug '  Old to compare', old   if @options.debug
        debug '  New to compare', young if @options.debug
        if eq old, young
            say ' No difference found' if @options.debug
            return
        say ' *** IT DIFFERS ***' if @options.debug
        @schedule_modifications old, young
        return                              unless @is_virgin
        @is_virgin = false

    scan_layer: (layer) ->
        debug 'The layer is', layer if @options.debug
        @existing = {}
        @explore_existing()
        debug 'Existing items are', @existing if @options.debug
        @todo     = {create: []}
        @found = {}
        @plan_todo layer, key for key of layer
        @schedule_cleanup()
        debug 'Todo list', @todo if @options.debug
        sum = 0
        for action of @todo
            todo = @todo[action]
            len = todo.length
            continue if len == 0
            sum += len
            @[action] todo
        sum
