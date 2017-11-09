export default {
  database: getDatabaseAdapter()
}

function getDatabaseAdapter() {
  if (false) {
    //return require(customAdapterPath);
  } else {
    return require('./adapters/mongodbAdapter');
  }
}
