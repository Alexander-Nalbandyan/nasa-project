const http = require('http');
require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');
const server = http.createServer(app);
const PORT  = process.env.PORT || 8000; // env variables can be specified in scripts as prefix.


async function startServer() {
  await mongoConnect();
  //This pattern can be used to do any initial steps before starting to listen for incoming requests. like loading db etc.
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  })
}

startServer();
