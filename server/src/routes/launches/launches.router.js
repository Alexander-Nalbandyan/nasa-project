const express = require('express');
const {launches} = require("../../models/launches.model");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch
} = require('./launches.controller');

let launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLaunch);
launchesRouter.delete('/:id', httpAbortLaunch);
module.exports = launchesRouter;
