const pmysql = require('promise-mysql')

/* CONNECTION POOL FOR MYSQL */
pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2022'
})
    .then(p => {
        pool = p
    })
    .catch(e=>{
        console.log("pool error: "+e)
})

module.exports = {
    // Get employees - for /employees
    getEmployees: function(){
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employee')
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    // Get employee - for /employee/edit/:eid
    getEmployee: function(eid){
        return new Promise((resolve, reject) => {
            pool.query('SELECT * FROM employee WHERE eid='+pmysql.escape(eid))
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    // Set an employee with specific fields
    setEmployee: function(eid, name, role, salary){
        return new Promise((resolve,reject)=>{
            pool.query('UPDATE employee SET ename='+pmysql.escape(name)+", role="+pmysql.escape(role)+", salary="+pmysql.escape(salary)+" WHERE eid="+pmysql.escape(eid))
            .then(data => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
        })
    },
    // Get departments - for /depts
    getDepartments: function(){
        return new Promise((resolve, reject) => {
            pool.query('SELECT d.did "did", d.dname "dname", d.budget "budget", l.county "county" from dept d join location l on d.lid = l.lid')
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    deleteDepartment: function(did){
        return new Promise((resolve, reject) => {
            pool.query('DELETE FROM dept WHERE did='+pmysql.escape(did))
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                    console.log('reject')
                })
        })
    },
    // get all employee's EID -- for mongoDB
    getEID: function(){
        return new Promise((resolve, reject) => {
            pool.query('SELECT eid FROM employee')
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error)
                })
        })
    }
}