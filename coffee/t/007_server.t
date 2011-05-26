try

    model.set 'default',
        default: true
        columns:
            id:
                type           : 'INTEGER'
                pk             : true
                autoincrement  : true
            id_session:
                type           : 'DECIMAL'
                size           : 20
                ref            : 'session'
                actual_deleted : [null, -2]
                
    model.set 'user',
        options:
            order: 'label'
        columns:
            label:    'varchar {255}'
            login:    'varchar {255}'
            password: 'varchar {255}'
        keys:
            label: 'label'
        data:
            1:
                label:'admin'
                login:'admin'
                password:'admin'
                id_session:null
            2:
                label:'user'
                login:'user'
                password:'user'
                id_session:null

    model.set 'session',
        columns:
            id_session: undefined
            id_user: '-> user'
            id:
                type         : 'DECIMAL'
                size         : 20
                pk           : true
        data:
            1:
                id_user:1
                
    model.assert()
    db.do "DELETE FROM #{i}" for i in ['user', 'session']
    model.assert()

	
    type.logon = 
    
        execute: () -> 
    
            if !@REQUEST.login
                throw 'Empty login'
            
            user = db.object sql(
                'user', {login: @REQUEST.login}
                '-> session ON session.id_user = user.id')
            
            if !user?
                throw "Login #{@REQUEST.login} not found"
        
            if !(user.password == @REQUEST.password)
                throw 'Wrong password'
        
            if !(user?.session?.id)
                user.session = 
                    id:      Math.floor(1E10 * Math.random())
                    id_user: user.id
                db.insert 'session', user.session

            return user.session

    server = new Server()
    server.start()	
		
catch e

    say e.stack
    throw e    
