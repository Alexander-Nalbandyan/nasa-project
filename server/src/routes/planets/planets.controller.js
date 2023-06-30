const {getAllPlanets} = require('../../models/planets.model');
async function httpGetAllPlanets(req, res) {
  // Return isn't mandatory as it isn't used by express it is just used here
  // to make sure that response is set only once.
  return res.status(200).json(await getAllPlanets());
}

module.exports = {
  httpGetAllPlanets
};