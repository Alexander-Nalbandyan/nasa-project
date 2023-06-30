const {parse} = require("csv-parse");
const fs = require("fs");
const path = require('path');
const planets = require('./planets.mongo');
//It is advised to use stream api for handling large data.

let habitablePlanets = []
function isHabitablePlanet(planet) {
  return planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6;
}

/*
  var promise = new Promise((resolve, reject) => {
    resolve(42);
  });
  promise.then((result) => {
    console.log(result); //Will print 42.
  });

  const result = await promise; //will wait until promise is ready to provide result and will assign 42 to result.
  console.log(result); //This code line will not be executed until promise is finished.
 */

async function savePlanet(planet) {
  try {
    await planets.updateOne({
        keplerName: planet.kepler_name
      }, {
        keplerName: planet.kepler_name
      },
      {
        upsert: true //By default it is false which means that if it exists then it won't do anything.
      });
  } catch (err) {
    console.log(`Could not save planet: ${err}`);
  }
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
      .pipe(parse( {
        comment: '#',
        columns: true, // To return rows as js objects with key value pairs instead of just arrays.

      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data);
          await savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('close', async () => { //We can chain the on's here because each one returns original EventEmitter.
        const habitablePlanetsCount = (await getAllPlanets()).length;
        console.log(`Loaded planets Total number: ${habitablePlanetsCount}`);
        resolve();
      })
  })
}

async function getAllPlanets() {
  return await planets.find({
    // keplerName: "test"
  }, // "keplerName -anotherField"
    // For project there are 2 approaches either passing an object with field names and 0|1 value or list of columns space separated.
    // And fields which should be excluded from result should be put with minus sign in front.
    // {keplerName: 1}
    {_id: 0, __v: 0}
  );
}

module.exports = {
  loadPlanetsData,
  getAllPlanets
};