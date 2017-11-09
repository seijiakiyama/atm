import { MongoClient } from 'mongodb';

var db;
var database = {
  getDb,
  create,
  update,
  find,
  bulkOp
};
export default database;

function getDb() {
  if (!db) {
    //use fixed db for now
    return MongoClient
     .connect('mongodb://atm:atmadmin@ds243055.mlab.com:43055/atm');
  }
  return Promise.resolve(db);
}

function create(collectionName, data, options) {
  return getDb()
    .then((db) => {
      return db.collection(collectionName).insertOne(data, options);
    });
}

function find(collectionName, data, options) {
  return getDb()
    .then((db) => {
      return db.collection(collectionName).find(data, options)
        .toArray();
    });
}

function update(collectionName, query, op, options) {
  return getDb()
    .then((db) => {
      return db.collection(collectionName).update(query, op, options);
    });
}

function bulkOp(collectionName, bulkOp, options) {
  return getDb()
    .then((db) => {
      return db.collection(collectionName).bulkWrite(bulkOp, options);
    });
}
