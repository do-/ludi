class WishTableDataRooted extends Wish

    adjust_options: () ->
        @options.pk    = model.pk @options.table
        @options.root ?= {}
        @options.key  ?= @options.pk
        code  = 'this.options.get_key = function (i) {return json([0';
        code += (',""+i.' + i) for i in @options.key.split(/\W+/)
        eval code + '])}';

    clarify_demands: (item)             ->
        def item, @options.root

    explore_existing: () ->
        sql = "SELECT * FROM #{@options.table} WHERE 1=1"
        params = []
        for i of @options.root
            sql += " AND #{i} = ?"
            params.push @options.root[i]
        db.do [sql, params], (i) => @existing[@options.get_key(i)] = i

    update_demands: (old, young) ->
        def young, old
        for i of young
            continue unless young[i]?
            young[i] += ''

    schedule_modifications: (old, young) ->
        (@todo.update ?= []).push (young)

    schedule_cleanup: () ->
        list = (@todo.delete ?= [])
        for i of @existing
            continue if @found[i]
            list.push @existing[i]

    create: (items) -> db.insert @options.table, items
    update: (items) -> db.update @options.table, items
    delete: (items) -> db.delete @options.table, items

