/* BASIC IMPORT */
const express = require('express');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const database = require('./database');
const databaseDB = require('./databaseDB');
const { reset } = require('nodemon');

/* EXPRESS SETUP */
const app = express();
var port = 3004;

/* BODY PARSER */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/* CORS */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Home page
app.get('/', (req,res) => {
  let html = "<html><body><a href=\"/employees\">Employees</a><br/>";
  html += "<a href=\"/depts\">Departments</a><br/>";
  html += "<a href=\"/employeesMongoDB\">Employees (MongoDB)</a><br/></html>";
  res.send(html)
})

/* MYSQL */
// GET /employees - show all employee's details
app.get('/employees', (req,res) => {
  database.getEmployees()
    .then(data => {
      let html = ejs.renderFile('views/employees.ejs', {data: data}, function(err,str){
        res.send(str);
      });
      
    })
    .catch(error=>{
      console.log("Error: "+error);
    })
})

// GET /employees/edit/:eid - edit employee's details
app.get('/employees/edit/:eid', (req,res) => {
  database.getEmployee(req.params.eid)
    .then(data => {
      let html = ejs.renderFile('views/employeesEdit.ejs', {data: data}, function (err,str){
        res.send(str);
      });
    })
    .catch(error=>{
      console.log("Error "+error);
    })
})

// POST /employees/edit/:eid - post results
app.post('/employees/edit/:eid', (req, res) => {
  let eid = req.body.eid;
  let name = req.body.ename;
  let role = req.body.role;
  let salary = req.body.salary;

  let errorMsg = [];
  // Check name length - more than 5 chars
  if (name.length < 5) errorMsg.push("Employee name must be at least 5 characters");
  // Check role - only Manager or Employee
  if (!(role == "Manager") && !(role == "Employee")) errorMsg.push("Role can be either Manager or Employee");
  // Check salary - more than 0
  if (salary < 0) errorMsg.push("Salary must be > 0");

  // Send back the form if there's an error message
  if (errorMsg.length > 0){
    database.getEmployee(eid)
      .then(data => {
        data.errorMsg = errorMsg;
        let html = ejs.renderFile('views/employeesEdit.ejs', {data: data}, function (err,str){
          res.send(str);
        });
      })
      .catch(error=>{
        console.log("Error "+error);
      })
  } else {
    console.log('success')
    database.setEmployee(eid, name, role, salary)
      .then(
        res.redirect('/employees')
      )
      .catch(error=>{
        console.log("Error "+error);
      })
  }
})

// [INNOVATE] GET /employees/add - add an employee to MySQL database
app.get('/employees/add', (req, res)=> {
  data = [];
  let html = ejs.renderFile('views/employeesAdd.ejs', {data: data}, function(err, str){
    res.send(str);
  })
})

// [INNOVATE] POST /employees/add - add an employee to MySQL database;
app.post('/employees/add', (req, res)=>{
  let eid = req.body.eid;
  let ename = req.body.ename;
  let role = req.body.role;
  let salary = req.body.salary;

  let errorMsg = [];
  // Check eid - must be exactly four characters, start with an E, and no duplicates
  database.getEID()
    .then(data => {
      data.forEach(element => {
        if (eid == element.eid) errorMsg.push("EID should not already exist in the database");
      })
    })
    .then(data => {
      // Check name length - more than 5 chars
      if (ename.length < 5) errorMsg.push("Employee name must be at least 5 characters");
      // Check role - only Manager or Employee
      if (!(role == "Manager") && !(role == "Employee")) errorMsg.push("Role can be either Manager or Employee");
      // Check salary - more than 0
      if (salary < 0) errorMsg.push("Salary must be > 0");

      // Send back the form if there's an error message
      if (errorMsg.length > 0){
        ejs.renderFile('views/employeesAdd.ejs', {data: errorMsg}, function (err,str){
          res.send(str);
        })
      } else {
        database.addEmployee(eid, ename, role, salary)
          .then(
            res.redirect('/employees')
          )
      }
    })
  
})

// [INNOVATE] GET /employees/delete - delete an employee in MySQL and MongoDB (if any exists)
app.get('/employees/delete/:eid', (req, res) => {
  let eid = req.params.eid;

  // delete employee
  database.deleteEmployee(eid)
    .then(data => {
      // find all eid, to find if the employee exists in mongoDB as well
      databaseDB.findAllEID()
        .then(data => {
          data.forEach(element => {
            if (element._id == eid){
              databaseDB.deleteEmployee(eid)
            }
          })
        })
    })
    .then(data => {
      res.redirect('/employees')
    })
    .catch(error=>{
      let errorMsg = eid + " is in a department and can't be deleted"
      ejs.renderFile('views/error.ejs', {data: errorMsg}, function(err, str){
        res.send(str);
      })
    })
  }
)

// GET /depts - show all department's details
app.get('/depts', (req,res) => {
  database.getDepartments()
    .then(data => {
      let html = ejs.renderFile('views/departments.ejs', {data: data}, function(err,str){
        res.send(str);
      });
      
    })
    .catch(error=>{
      console.log("Error: "+error);
    })
})

// GET /depts/delete/:did - delete department
app.get('/depts/delete/:did', (req, res) => {
  database.deleteDepartment(req.params.did)
    .then(data => {
      res.redirect('/depts');
    })
    .catch(error=>{
      let errorMsg = req.params.did + "has Employees and cannot be deleted"
      ejs.renderFile('views/error.ejs', {data: errorMsg}, function(err, str){
        res.send(str);
      })
    })
  }
)

/* MONGODB */

// GET /employeesMongoDB - display all employees in MongoDB
app.get('/employeesMongoDB', (req, res) => {
  databaseDB.findAll()
    .then(data => {
      let html = ejs.renderFile('views/employeesMongoDB.ejs', {data: data}, function(err, str){
        res.send(str);
      })
    })
    .catch(error => {
      console.log(error)
    })
})

// GET /employeesMongoDB/add - add an employee in MongoDB (if exists in MySQL)
app.get('/employeesMongoDB/add', (req, res) => {
  data = [];
  let html = ejs.renderFile('views/employeesMongoDB_Add.ejs', {data: data}, function(err, str){
    res.send(str);
  })
})

// POST /employeesMongoDB/add - add an employee to MongoDB
app.post('/employeesMongoDB/add', (req,res) => {
  let eid = req.body.eid;
  let phone = req.body.phone;
  let email = req.body.email;

  let errorMsg = [];
  // if eid is not exactly 4 characters
  if (eid.length != 4) errorMsg.push("EID must be 4 characters");
  // if phone numebr is not more than 5 chracters
  if (phone.length < 5) errorMsg.push("Phone must be >5 characters");
  // check if @ and . exists or not
  if (!email.includes("@") || !email.includes(".")) errorMsg.push("Email must be a valid email address (@ and . included)");

  if (errorMsg.length > 0){
    let html = ejs.renderFile('views/employeesMongoDB_Add.ejs', {data: errorMsg}, function (err,str){
      res.send(str);
      return;
    });
  } else {
    // for processing mysql and mongoDB EIDs
  let sqlEID = [];
  let mongoDBEID = [];

    // ACCESS ALL EID FROM MYSQL
    database.getEID()
      .then(data => {
        data.forEach(element => {
          sqlEID.push(element.eid);
        });  
      })
      .then(data => {
        // ACCESS ALL EID FROM MONGODB
        databaseDB.findAllEID()
          .then(data => {
            data.forEach(element => {
              mongoDBEID.push(element._id)
            })
            // CHECK IF EMPLOYEE IN MONGODB
            if (mongoDBEID.indexOf(eid) > -1) {
              let dataError = "Error: EID "+eid+" already exists in MongoDB";
              let html = ejs.renderFile('views/employeesMongoDB_AddError.ejs', {data: dataError}, function(err, str){
                res.send(str);
              })
              return;
            }
            // CHECK IF EMPLOYEE NOT IN MYSQL
            if (sqlEID.indexOf(eid) == -1){
              let dataError = "Employee "+eid+" doesn't exist in MySQL DB";
              let html = ejs.renderFile('views/employeesMongoDB_AddError.ejs', {data: dataError}, function(err, str){
                res.send(str);
              })
              return;
            }
            databaseDB.insertNew(eid, phone, email);
            res.redirect('/employeesMongoDB');
          }
          )
      }
      )
  }
})

// [INNOVATE] GET /employeesMongoDB/edit/:eid - edit employee's details from MongoDB
app.get('/employeesMongoDB/edit/:eid', (req,res) => {
  databaseDB.findOneFromEID(req.params.eid)
    .then(data => {
      let html = ejs.renderFile('views/employeesMongoDB_Edit.ejs', {data: data}, function (err,str){
        res.send(str);
      });
    })
    .catch(error=>{
      console.log("Error "+error);
    })
})

// [INNOVATE] POST /employees/edit/:eid - post results
app.post('/employeesMongoDB/edit/:eid', (req, res) => {
  let eid = req.body._id;
  let phone = req.body.phone;
  let email = req.body.email;

  let errorMsg = [];
  // if phone numebr is not more than 5 chracters
  if (phone.length < 5) errorMsg.push("Phone must be >5 characters");
  // check if @ and . exists or not
  if (!email.includes("@") || !email.includes(".")) errorMsg.push("Email must be a valid email address (@ and . included)");

  if (errorMsg.length > 0){
    let data = {
      _id: eid,
      phone: phone,
      email: email,
      errorMsg: errorMsg
    }
    ejs.renderFile('views/employeesMongoDB_Edit.ejs', {data: data}, function (err,str){
      res.send(str);
      return;});
  } else {
    databaseDB.updateEmployee(req.body)
      .then(
        res.redirect('/employeesMongoDB')
      )
      .catch(error=>{
        console.log("Error "+error);
      })
  }
})

// [INNOVATE] GET /depts/delete/:did - delete department
app.get('/employeesMongoDB/delete/:eid', (req, res) => {
  databaseDB.deleteEmployee(req.params.eid)
    .then(data => {
      res.redirect('/employeesMongoDB');
    })
    .catch(error=>{
      let errorMsg = error;
      ejs.renderFile('views/error.ejs', {data: errorMsg}, function(err, str){
        res.send(str);
      })
    })
  }
)

app.listen(port, () => {
    console.log("reading on port "+port);
})