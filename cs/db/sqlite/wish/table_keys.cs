
WishTableKeys::explore_existing = () ->

    len = 1 + @options.table.length

    db.do ["SELECT * FROM sqlite_master WHERE type = 'index' and tbl_name = ? AND sql IS NOT NULL", @options.table], (i) =>

        return unless m = i.sql.match(/\((.*)\)/)

        item =
            global_name: i.name.toLowerCase()
            parts      : m[1].replace(/\s/g, '')

        @existing[item.name = item.global_name.substr len] = item




