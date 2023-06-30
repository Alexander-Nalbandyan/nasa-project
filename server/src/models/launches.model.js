const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo'); //In each layer to should try to talk to layer below to not cause complex network or circular dependencies.
const axios = require('axios');

// const launches = new Map(); //It has the advantage of returning keys in the same order they were put in comparison to POJOS.
const DEFAULT_FLIGHT_NUMBER = 100;
// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Kepler Exploration 1", //name
//   rocket: 'Explorer IS1', //rocket.name
//   launchDate: new Date("April 4, 2030"), //date_local
//   target: 'Kepler-442 b', //Not available in the API.
//   customers : ["NASA", 'ZTM'], //payloads.customers
//   upcoming: true, //upcoming
//   success: true //success
// };
//
// // launches.set(launch.flightNumber, launch);
// //launches.get(launch.flightNumber) === launch
// saveLaunch(launch);

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL,
      {
        query: '',
        options: {
          pagination: false,
          populate: [
            {
              path: 'rocket',
              select: {
                name: 1
              }
            },
            {
              path: 'payloads',
              select: {
                customers: 1
              }
            }
          ]
        }
      });

  if (response.status !== 200) {
    console.log("Failed to download launch data");
    throw new Error("Downloading launch data failed.");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payload = launchDoc['payloads'];
    const customers = payload.flatMap(p => p['customers']);
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'], //
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };
    console.log(`${launch.flightNumber} => ${launch.mission}`);

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  });
  if (firstLaunch) {
    console.log("Launches data already loaded!");
  } else {
    await populateLaunches();
  }
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesDatabase
      .find({}, {_id: 0, __v: 0})
      .sort({flightNumber: 1})
      .skip(skip)
      .limit(limit);
}

async function saveLaunch(launch) {
  // await launches.updateOne({ //It also updates the object properties when saving them into mongo.
  await launchesDatabase.findOneAndUpdate({ //This one does not update the object properties.
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true,
  });
}

async function getLatestFlightNumber() {
  const launchWithLatestFlightNumber = await launchesDatabase.findOne({}, {flightNumber: 1})
    .sort('-flightNumber');
  if (!launchWithLatestFlightNumber) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return launchWithLatestFlightNumber.flightNumber
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({keplerName: launch.target});
  if (!planet) {
    throw new Error('No matching planet found');
  }
  const newFlightNumber = await getLatestFlightNumber() + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['NASA', 'ZTM'],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}

// function addNewLaunch(launch) {
//   latestFlightNumber +=1;
//   launch = Object.assign(launch, {
//     success: true,
//     upcoming: true,
//     customers: ['NASA', 'ZTM'],
//     flightNumber: latestFlightNumber
//   });
//   launches.set(latestFlightNumber, launch); //Object.assign() returns new object with given properties overridden in case if they exist already or just added if they are missing.
// }


//Returns one document matching given filter.
async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

//Checks whether launch exists with given id.
async function existsLaunchWithId(id) {
  return await findLaunch({flightNumber: id});
}

//Aborts launch with given id.
async function abortLaunchById(launchId) {
  const abortedResult = await launchesDatabase.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false,
  });
  return abortedResult.modifiedCount === 1;
  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

//It is good practice to keep the same order of definition in the export.
module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
  loadLaunchesData,
}