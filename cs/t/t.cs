
#db.do ('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT)')
#db.do ("ALTER TABLE test ADD COLUMN price NUMERIC (10,   2)  NOT    NULL DEFAULT '0'")
#db.do ('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTO_INCREMENT, label TEXT)')
#db.do ('DELETE FROM test')
#db.do ('DROP TABLE test')
#db.do ("INSERT INTO test (label) VALUES ('foo')")
#db.do ("INSERT INTO test (label) VALUES ('bar')")

#darn (db.do_object 'SELECT id, label AS "user.label" FROM test', [])

try

#    w = new WishTableColumns [{name:'id', type:'integer', pk:true, autoincrement: true}, {name:'label', type:'text'}], {table:'test', debug:true}
#    w.realize()

#    (new WishTableData [{id:1, label:'foo'}], {table:'test', debug:false}).realize()
#    (new WishTableData [{id:1, label:'bar'}], {table:'test', debug:false}).realize()
#    (new WishTableData [{id:1, label:'bar'}], {table:'test', debug:false}).realize()

#    (db.do 'SELECT * FROM test', (i) -> darn i)

#    (new WishTableKeys [{name:'label', parts:'label,id'}], {table:'test', debug:true}).realize()

    def model.default_columns,
        id:
            type         : 'INTEGER'
            pk           : true
            autoincrement: true
        id_session:
            type         : 'DECIMAL'
            size         : 20
            ref          : 'session'

    model.set 'user',
        columns:
            label: 'varchar'
        keys:
            label: 'label'

    model.set 'session',
        columns:
            id_session: undefined
            id_user: '-> user'
            id:
                type         : 'DECIMAL'
                size         : 20
                pk           : true


    darn model.tables

catch error

    say error.stack