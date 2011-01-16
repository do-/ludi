class WishTableData extends Wish

    adjust_options: () ->
        @options.pk = pk = model.pk @options.table
        @options.get_key = (i) -> i[pk]
        @options.pks = '-1'

    clarify_demands: (item) ->
        @options.pks += (',' + item[@options.pk]) if item[@options.pk]?

    explore_existing: () ->
        sql = "SELECT * FROM #{@options.table} WHERE 1=1"
        params = []
        sql += " AND #{@options.pk} IN (#{@options.pks})" if @options.pks isnt '-1'
        db.do [sql, params], (i) => @existing[@options.get_key(i)] = i

    update_demands: (old, young) ->
        def young, old
        for i of young
            continue unless young[i]?
            young[i] += ''

    schedule_modifications: (old, young) ->
        (@todo.update ?= []).push (young)

    create: (items) ->
        db.insert @options.table, items

    update: (items) ->
        db.update @options.table, items
