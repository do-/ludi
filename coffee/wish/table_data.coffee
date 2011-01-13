class WishTableData extends Wish

    adjust_options: () ->
        pk = model.pk @options.table
        @options.get_key = (i) -> i[pk]
        @options.key  ?= 'id'
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

    create: (items) ->
        return if items.length == 0;
        cols = []; qsts = []
        for i of items[0]
            cols.push i
            qsts.push '?'
        sql = "INSERT INTO #{@options.table} (#{cols}) VALUES (#{qsts})"
        for item in items
            db.do [sql, (item[col] for col in cols)]

    update: (items) ->
        return if items.length == 0;
        cols = []; qsts = []
        for i of items[0]
            continue if i is 'id'
            cols.push i
            qsts.push "#{i}=?"
        cols.push 'id'
        sql = "UPDATE #{@options.table} SET #{qsts} WHERE id=?"
        for item in items
            db.do [sql, (item[col] for col in cols)]

