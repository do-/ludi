
#db.do ('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT)')
#db.do ("ALTER TABLE test ADD COLUMN price NUMERIC (10,   2)  NOT    NULL DEFAULT '0'")
#db.do ('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTO_INCREMENT, label TEXT)')
#db.do ('DELETE FROM test')
#db.do ("INSERT INTO test (label) VALUES ('foo')")
#db.do ("INSERT INTO test (label) VALUES ('bar')")

#darn (db.do_object 'SELECT id, label AS "user.label" FROM test', [])

try


    (db.do 'SELECT * FROM sqlite_master', (i) -> darn i)


    w = new WishTableColumns [{name:'id', type:'integer', pk:true, autoincrement: true}, {name:'bar', type:'int', nullable:true, default: 1}], {table:'test2', debug:true}
    w.realize()

#    (new WishTableData [{id:1, label:'foo'}], {table:'test', debug:false}).realize()
#    (new WishTableData [{id:1, label:'bar'}], {table:'test', debug:false}).realize()
#    (new WishTableData [{id:1, label:'bar'}], {table:'test', debug:false}).realize()
#
#    (db.do 'SELECT * FROM test', (i) -> darn i)

catch error

    say error.stack