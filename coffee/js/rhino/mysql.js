var _db;
_db = null;
Db.prototype.__connect = function(o) {
  Packages.java.lang.Class.forName('com.mysql.jdbc.Driver');
  return _db = Packages.java.sql.DriverManager.getConnection("jdbc:mysql://" + o.host + "/" + o.db, o.user, o.password);
};
Db.prototype._insertId = function() {
  return db.integer("SELECT LAST_INSERT_ID()");
};