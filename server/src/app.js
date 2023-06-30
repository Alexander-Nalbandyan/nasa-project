const express = require('express');
const cors = require('cors');
const path = require("path");
const morgan = require("morgan");

const api = require('./routes/api');
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


const app = express();
app.use(cors(corsOptions))
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')))

app.use('/v1', api);
// app.use('/v2', v2Router);

app.get('/*', (req, res) => {
  console.log("Loading..sfsfa..")
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})
module.exports = app;