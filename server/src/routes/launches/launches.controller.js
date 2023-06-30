const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById
} = require('../../models/launches.model');
// function getUpcomingLaunches(req, res) {
//   return res.status(200).json(Array.from(launches.values()).filter(launch => launch.upcoming));
// }
const {
  getPagination,
} = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  //for (const value of launches.values()) {...}
  const {skip, limit} = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  let launch = req.body;

  if (!launch.launchDate || !launch.mission || !launch.target
    || !launch.rocket) {
    return res.status(400).json({
      error: "Missing launch property."
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  // if (launch.launchDate.toString() === 'Invalid Date') {
  if (isNaN(launch.launchDate)) { //Is equivalent to isNaN(launch.launchDate.valueOf()) valueOf() returns Nan if date is not valid or milliseconds if its value.
    return res.status(400).json({
      error: "Invalid launch date."
    });
  }
  try {
    await scheduleNewLaunch(launch);
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  console.log("Aborting launch: ", launchId);

  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    return res.status(404).json({
      error: "Launch not found",
    })
  }

  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(500).json({
      error: "Launch was not aborted",
    })
  }
  return res.status(200).json({
    ok: true
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
};