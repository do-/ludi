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

assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'user']), 0,  "delete failed";
