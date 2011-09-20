#try

    model.set 'default',
        default: true
        columns:
            id:
                type         : 'int'
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

    model.assert()

    db.do "DELETE FROM user"

    id = db.insert_id 'user',
        label: 'admin'

    assert.equal db.integer(['SELECT COUNT(*) FROM user WHERE label = ?',  'admin']), 1,  "the right record is not found";
    assert.equal db.integer(['SELECT id       FROM user WHERE label = ?',  'admin']), id, "wrong insert id";
    assert.equal db.integer(['SELECT COUNT(*) FROM user WHERE label <> ?', 'admin']), 0,  "wrong records found";

    db.update 'user',
        id   : id
        label: 'user'

    assert.equal db.integer(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 1,  "the right record is not found";
    assert.equal db.integer(['SELECT id       FROM user WHERE label = ?',  'user']), id, "wrong insert id";
    assert.equal db.integer(['SELECT COUNT(*) FROM user WHERE label <> ?', 'user']), 0,  "wrong records found";

    db.delete 'user',
        id   : id
        label: 'foo'

    cnt = db.integer(['SELECT COUNT(*) FROM user WHERE label = ?',  'user'])

    assert.equal cnt, 0,  "delete record failed";
    assert.equal typeof cnt, 'number',  "not a number returned";



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

    assert.equal db.scalar(['SELECT id FROM user WHERE id >= 5 ORDER BY id',  [5, [0, 1]]]), 5,  "offset / limit / found 1";
    assert.equal db.found(), 2,  "offset / limit / found 2";
    assert.equal db.scalar(['SELECT id FROM user WHERE id >= 5 ORDER BY id',  [5, [1, 1]]]), 6,  "offset / limit / found 3";
    assert.equal db.found(), 2,  "offset / limit / found 4";

    db.do ('DELETE FROM user')

#catch e

#    say e.stack
#    throw e

