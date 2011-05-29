try

    model.set 'default',
        default: true
        columns:
            id:
                type         : 'int'
                pk           : true
                autoincrement: true

    model.set 'plan',
        columns:
            year:   'int'
            month:  'int'
            amount: 'int'
        keys:
            ym:     'year,month'

    model.assert()
    
    db.do ('DELETE FROM plan')

    sql = 'SELECT month, amount FROM plan WHERE year = 2011 ORDER BY month'
    cnt = 'SELECT COUNT(*) FROM plan'
    




    plan = [
        {month:"1", amount:"100"}
        {month:"2", amount:"200"}
    ]    

    db.put 'plan', plan, 'month', {year:"2011"};

    fact = db.objects(sql)

    assert.deepEqual fact, plan, "1st plan storing failed";    
    assert.equal db.integer(cnt), 2, "Wrong record number";    

    plan = [
        {month:"2", amount:"250"}
        {month:"3", amount:"100"}
    ]    

    db.put 'plan', plan, 'month', {year:"2011"};
    
    fact = db.objects(sql)

    assert.deepEqual fact, plan, "2nd plan storing failed";    
    assert.equal db.integer(cnt), 2, "Wrong record number";    








    db.do ('DROP TABLE plan')
    
    model.set 'plan',
        columns:
            id_session:
                type           : 'DECIMAL'
                size           : 20
                ref            : 'session'
                actual_deleted : [null, -2]

    model.assert()

    sql = 'SELECT month, amount FROM plan WHERE year = 2011 AND id_session IS NULL ORDER BY month'
    cnt = 'SELECT COUNT(*) FROM plan'





    plan = [
        {month:"1", amount:"100"}
        {month:"2", amount:"200"}
    ]    

    db.put 'plan', plan, 'month', {year:"2011"};

    fact = db.objects(sql)

    assert.deepEqual fact, plan, "1st plan storing failed";    
    assert.equal db.integer(cnt), 2, "Wrong record number";    

    plan = [
        {month:"2", amount:"250"}
        {month:"3", amount:"100"}
    ]    

    db.put 'plan', plan, 'month', {year:"2011"};
    
    fact = db.objects(sql)

    assert.deepEqual fact, plan, "2nd plan storing failed";    
    assert.equal db.integer(cnt), 3, "Wrong record number";    




    plan = [
        {month:"1", amount:"100"}
        {month:"2", amount:"250"}
        {month:"3", amount:"100"}
    ]    

    db.put 'plan', plan, 'month', {year:"2011"};
    
    fact = db.objects(sql)

    assert.deepEqual fact, plan, "3rd plan storing failed";    
    assert.equal db.integer(cnt), 3, "Wrong record number";    






    
    

catch e

    say e.stack
    throw e    
    
    