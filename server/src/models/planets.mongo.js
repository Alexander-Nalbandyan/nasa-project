const mongoose = require('mongoose');

const planetsSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
    // minLength: 10,
    // maxLength: 100,
    // match: /^Kepler-.*$/
  }
});

module.exports = mongoose.model('Planet', planetsSchema);