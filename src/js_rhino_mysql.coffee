_db = null;

Db::__connect  = (o) ->
    Packages.java.lang.Class.forName 'com.mysql.jdbc.Driver'
    _db = Packages.java.sql.DriverManager.getConnection("jdbc:mysql://#{o.host}/#{o.db}", o.user, o.password)

Db::_insertId = () -> db.integer "SELECT LAST_INSERT_ID()"
