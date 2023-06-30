const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    // default: 100,
    // min: 100,
    // max: 999
  },
  launchDate: {
    type: Date,
    required: true
  },
  mission: {
    type: String,
    required: true
  },
  rocket: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: false
    // type: mongoose.ObjectId, The references are not supported by mongo and if we start using them we will need to implement the whole logic ourselves
    // and it become more complex instead with mongo approach if acceptable we just keep relevant info denormalized inside the collection to avoid additional lookups.
    // ref: 'Planet'
  },
  upcoming: {
    type: Boolean,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  customers: [String]
});

//Following code connects launchesSchema to "launches" collection in mongodb.
//It returns an model object.
module.exports = mongoose.model('Launch', launchesSchema); //First argument should be singular which will be lowercased and pluralized before using as collection name.


