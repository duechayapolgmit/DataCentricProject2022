const MongoClient = require('mongodb').MongoClient

// Connect URL
const url = 'mongodb://127.0.0.1:27017'

// Connect to MongoDB
var db;
var coll;
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
    db = client.db('employeesDB')
    coll = db.collection('employees')

    console.log(`MongoDB Connected: ${url}`)
  }
)

module.exports = {
    // Find ALL documents in MongoDB
    findAll: function(){
        return new Promise((resolve, reject)=> {
            var cursor = coll.find()
            cursor.toArray()
                .then((docs)=>{
                    resolve(docs)
                })
                .catch((error)=>{
                    reject(error)
                })
        })
    },
    // Find ALL EIDs in the collection
    findAllEID: function(){
      return new Promise((resolve, reject) => {
        var cursor = coll.find( {}, {"_id":1} );
        cursor.toArray()
          .then((docs)=>{
              resolve(docs)
          })
          .catch((error)=>{
              reject(error)
          })
        })
    },
    // Add new document to the collection
    insertNew: function(eid, phone, email){
      return new Promise((resolve, reject) => {
        var cursor = coll.insertOne({_id: eid, phone: phone, email: email})
          .then((docs)=>{
              resolve(docs)
          })
          .catch((error)=>{
              reject(error)
          })
        })
    },
    // INNOVATE - Delete a document in the collection
    deleteEmployee: function(eid){
      return new Promise((resolve, reject) => {
        var cursor = coll.deleteOne({_id:eid})
          .then((docs)=>{
              resolve(docs)
          })
          .catch((error)=>{
              reject(error)
          })
        })
    }
}