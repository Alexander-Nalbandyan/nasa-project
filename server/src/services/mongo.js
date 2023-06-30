const mongoose = require('mongoose');

const MONGO_URL= process.env.MONGO_URL //db will be created on first save.

mongoose.connection.once('open', () => { //With once() it guarantees that the event will be triggered only once.
  console.log("Mongo connection is ready!");
})

mongoose.connection.on('error', (err) => { //Errors can be triggered anytime and many times.
  console.error(`Mongo error: ${err}`);
})

async function mongoConnect() {
  await mongoose.connect(MONGO_URL, {
    //All following are options for mongodb driver which is used by mongoose to talk to mongo dbs.
    //The driver is provided by the company of mongodb creater.
    //!!! Note: It turned out that following options are no more supported and driver behaves like those options are set.
    // useNewUrlParser: true,
    // useFindAndModify: false, //To not use outdated update function
    // useCreateIndex: true, //Which will use createIndex() function instead of ensureIndex() function.
    // useUnifiedTopology: true //To use new way of talking to mongo clusters called UnifiedTopology.
  });
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}
module.exports = {
  mongoConnect,
  mongoDisconnect
}

