class WishTableData extends Wish

    adjust_options: () ->
        @options.pk = pk = model.pk @options.table
        @options.get_key = (i) -> i[pk]
        @options.ids = '-1'

    clarify_demands: (item)             ->
        @options.ids += (',' + item.id) if item.id?

    explore_existing: () ->
        sql = "SELECT * FROM #{@options.table} WHERE 1=1"
        params = []
        sql += " AND id IN (#{@options.ids})" if @options.ids isnt '-1'
        db.do [sql, params], (i) => @existing[@options.get_key(i)] = i

    update_demands: (old, young) ->
        def young, old
        for i of young
            continue unless young[i]?
            young[i] += ''

    schedule_modifications: (old, young) ->
        (@todo.update ?= []).push (young)

    _make_param_batch: (items, cols) ->
        batch = []
        for item in items
            p = []
            for col in cols
                p.push item[col]
            batch.push p
        return batch

    create: (items) ->
        return if items.length == 0;
        cols = []; qsts = []
        for i of items[0]
            cols.push i
            qsts.push '?'
        sql = "INSERT INTO #{@options.table} (#{cols}) VALUES (#{qsts})"
        db.do([
            "INSERT INTO #{@options.table} (#{cols}) VALUES (#{qsts})"
            @_make_param_batch items, cols
        ])

    update: (items) ->
        return if items.length == 0;
        cols = []; qsts = []
        for i of items[0]
            continue if i is @options.pk
            cols.push i
            qsts.push "#{i}=?"
        cols.push @options.pk
        db.do([
            "UPDATE #{@options.table} SET #{qsts} WHERE #{@options.pk}=?"
            @_make_param_batch items, cols
        ])