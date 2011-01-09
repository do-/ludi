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



id = db.set 'user', {label:'admin', id_session: [0]}, 'label'

o = db.object(['SELECT * FROM user WHERE id = ?', id])

assert.deepEqual o, {id:id, label:'admin', id_session: 0}, "insert by db.set failed";	


db.set 'user', {label:'admin', id_session: [-1]}, 'label'

o = db.object(['SELECT * FROM user WHERE id = ?', id])

assert.deepEqual o, {id:id, label:'admin', id_session: 0}, "non-mandatory update by db.set";	



db.set 'user', {label:'admin', id_session: -1}, 'label'

o = db.object(['SELECT * FROM user WHERE id = ?', id])

assert.deepEqual o, {id:id, label:'admin', id_session: -1}, "failed mandatory update by db.set";



db.delete 'user', id

assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 0,  "delete by pk failed";
