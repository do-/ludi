def model.default.columns,
    id:
        type         : 'INTEGER'
        pk           : true
        autoincrement: true
    id_session:
        type         : 'DECIMAL'
        size         : 20
        ref          : 'session'
        filter       : 0,

model.set 'user',
    columns:
        label: 'varchar'
    keys:
        label: 'label'
    data:
        1:
            label:'admin'
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

assert.deepEqual db.objects('SELECT * FROM user WHERE id = 1'), [{id:1, label:'admin', id_session:0}], "user data skewed";

sum = model.assert()

assert.equal(sum, 0, "Unneeded actions performed")