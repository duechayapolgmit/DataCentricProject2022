/* BASIC INFO */
var express = require('express');
var app = express();
var port = 3004;
var pmysql = require('promise-mysql')

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

app.get('/', (req,res) => {
    pool.query('SELECT * FROM employee')
        .then((data)=>{
            console.log(data)
        })
        .catch(error => {
            console.log(error);
        })
})

const MongoClient = require('mongodb').MongoClient

// Connect URL
const url = 'mongodb://127.0.0.1:27017'

// Connect to MongoDB
MongoClient.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) {
      return console.log(err)
    }

    // Specify the database you want to access
    const db = client.db('employeesDB')

    console.log(`MongoDB Connected: ${url}`)
  }
)

app.listen(port, () => {
    console.log("reading on port "+port);
})