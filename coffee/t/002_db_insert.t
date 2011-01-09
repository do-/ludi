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

db.insert 'user', 
	label: 'admin'

assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label = ?',  'admin']), 1, "the right record is not found";
assert.equal db.scalar(['SELECT COUNT(*) FROM user WHERE label <> ?', 'admin']), 0, "wrong records found";
