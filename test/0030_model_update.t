#try


    model.set 'default',
        default: true
        columns:
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
        data:
            1:
                label:'admin'
                id_session:0
            2:
                label:'user'
                id_session:0

    model.set 'session',
        columns:
            id_session: undefined
            id_user: '-> user'
            id:
                type         : 'DECIMAL'
                size         : 20
                pk           : true

    assert.equal(model.pk('user'), 'id')

    model.assert()
    db.do "DROP TABLE #{i}" for i in ['user', 'session']
    model.assert()

    assert.deepEqual db.objects('SELECT * FROM user WHERE id IN (1, 2) ORDER BY id'), [{id:1, label:'admin', id_session:0}, {id:2, label:'user', id_session:0}], "user data skewed";

    sum = model.assert()

    assert.equal(sum, 0, "Unneeded actions performed")

#catch e

#    say e.stack
#    throw e