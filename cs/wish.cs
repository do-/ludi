class Wish

    constructor: (@items, @options) ->
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
        @clarify_demands i for i in @items
        @split_layers()
        @scan_layer      i for i in @layers

    split_layers: () ->
        key_cnt   = {}
        @layers   = []
        for item in @items
            key           = @options.get_key item
            key_cnt[key] ?= 0
            (@layers[key_cnt[key]++] ?= {})[key] = item
        @layers   = [{}] if @layers.length == 0

    plan_todo: (layer, key) ->
        young = layer[key]
        darn young if @options.debug
        return @todo.create.push young      unless (old = @existing[key])?
        @update_demands old, young
        return                              if eq old, young
        @schedule_modifications old, young
        return                              unless @is_virgin
        @schedule_cleanup()
        @is_virgin = false

    scan_layer: (layer) ->
        darn layer if @options.debug
        @existing = {}
        @explore_existing()
        darn @existing if @options.debug
        @todo     = {create: []}
        @plan_todo layer, key for key of layer
        darn @todo if @options.debug
        for action of @todo
            todo = @todo[action]
            @[action] todo if todo.length > 0
