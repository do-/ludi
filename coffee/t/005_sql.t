try

    model.set 'default',
        default: true
        columns:
            id:
                type           : 'INTEGER'
                pk             : true
                autoincrement  : true
            id_session:
                type           : 'DECIMAL'
                size           : 20
                ref            : 'session'
                actual_deleted : [null, -2]
    model.set 'user',
        options:
            order: 'label'
        columns:
            label: 'varchar {10}'
        keys:
            label: 'label'
        data:
            1:
                label:'admin'
                id_session:null
            2:
                label:'user'
                id_session:null

    model.set 'session',
        columns:
            id_session: undefined
            id_user: '-> user'
            id:
                type         : 'DECIMAL'
                size         : 20
                pk           : true
        data:
            1:
                id_user:1
                
    model.assert()
    db.do "DELETE FROM #{i}" for i in ['user', 'session']
    model.assert()

    assert.deepEqual(db.arrays(sql 'user:id,label'), [["admin","1"],["user","2"]], "SQL 1")
    
    assert.deepEqual(db.objects(sql 'user'), [{"label":"admin","id":"1","id_session":null},{"label":"user","id":"2","id_session":null}], "SQL 2")

    assert.deepEqual(db.object(sql(
        'user',    {id: 1}
        '<- session'
    )), {"label":"admin","id":"1","id_session":null,"session":{"id":"1","id_user":"1"}}, "SQL 3")

    assert.deepEqual(db.object(sql(
        'user',    1
        'session'
    )), {"label":"admin","id":"1","id_session":null,"session":{"id":null,"id_user":null}}, "SQL 4")

    assert.deepEqual(db.objects(sql(
        'session',
        'user',    {id_session: null, COLUMNS:['UPPER(label) AS name']}
    )), [{"id":"1","id_user":"1","name":"ADMIN"}], "SQL 4")

    assert.equal(db.int(sql(
        'user:COUNT(*)',
    )), 2, "SQL 5")        

catch e

    say e.stack
    throw e    
    
    