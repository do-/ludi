try

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
                filter       : 0

    model.set 'user',
        columns:
            label: 'varchar'
        keys:
            label: 'label'

    model.assert()

    db.do "DELETE FROM user"

    id = db.insert_id 'user', 
        label: 'admin'

    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'admin']), 1,  "the right record is not found";
    assert.equal db.scalar(['SELECT id       FROM user WHERE label = ?',  'admin']), id, "wrong insert id";
    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label <> ?', 'admin']), 0,  "wrong records found";

    db.update 'user', 
        id   : id
        label: 'user'

    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 1,  "the right record is not found";
    assert.equal db.scalar(['SELECT id       FROM user WHERE label = ?',  'user']), id, "wrong insert id";
    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label <> ?', 'user']), 0,  "wrong records found";

    db.delete 'user', 
        id   : id
        label: 'foo'

    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 0,  "delete record failed";



    id = db.get_id 'user', {label:'admin', id_session: [0]}, 'label'
    o = db.object(['SELECT * FROM user WHERE id = ?', id])
    assert.deepEqual o, {id:id, label:'admin', id_session: 0}, "insert by db.get_id failed";    


    db.get_id 'user', {label:'admin', id_session: [-1]}, 'label'
    o = db.object(['SELECT * FROM user WHERE id = ?', id])
    assert.deepEqual o, {id:id, label:'admin', id_session: 0}, "non-mandatory update by db.get_id"; 



    db.get_id 'user', {label:'admin', id_session: -1}, 'label'
    o = db.object(['SELECT * FROM user WHERE id = ?', id])
    assert.deepEqual o, {id:id, label:'admin', id_session: -1}, "failed mandatory update by db.get_id";



    db.delete 'user', id
    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 0,  "delete by pk failed";

    id1 = db.insert_id 'user', 
        label: 'admin'
        id_session: -1

    o = db.object ['SELECT * FROM user WHERE id = ?', id1]


    id2 = (db.clone 'user', o, {id_session: 0}).id

    assert.notEqual id1, id2, "wrong clone ID"
    assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ? AND id IN (?, ?)',  ['admin', id1, id2]]), 2,  "cloning failed";
    assert.deepEqual db.array(['SELECT MIN(id_session), MAX(id_session) FROM user WHERE label = ? AND id IN (?, ?)',  ['admin', id1, id2]]), [-1, 0],  "cloning failed";

    db.do ('DELETE FROM user')

catch e

    say e.stack
    throw e