class WishTableKeys extends Wish

    clarify_demands: (item) ->
        item.global_name = "#{@options.table}_#{item.name}"

    schedule_modifications: (old, young) ->
        (@todo.recreate ?= []).push (young)

    create: (items)   -> db.do "CREATE INDEX #{item.global_name} ON #{@options.table} (#{item.parts})" for item in items

    drop: (item)      -> db.do "DROP INDEX #{item.global_name}"

    recreate: (items) ->
        @drop   item for item in items
        @create items
