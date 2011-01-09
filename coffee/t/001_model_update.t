def model.default_columns,
    id:
        name         : 'id'
        type         : 'INTEGER'
        pk           : true
        autoincrement: true
    id_session:
        name         : 'id_session'
        type         : 'DECIMAL'
        size         : 20
        ref          : 'session'

model.set 'user',
    columns:
        label: 'varchar'
    keys:
        label: 'label'
    data:[
        {
            id:1
            label:'admin'
        }
    ]

model.set 'session',
    columns:
        id_session: undefined
        id_user: '-> user'
        id:
            type         : 'DECIMAL'
            size         : 20
            pk           : true

model.assert()

assert.deepEqual db.objects('SELECT * FROM user WHERE id = 1'), [{id:1, label:'admin'}], "user data skewed";