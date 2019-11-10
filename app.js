const createError = require("http-errors");
const express = require("express");
const path = require("path");


//  importing routes
const parentRouter = require('./routes/parent');
const childRouter = require('./routes/child');
const locationHistoryRouter = require('./routes/locationHistory');
const smartwatchRouter = require('./routes/smartwatch');
const heartRateHistoryRouter = require('./routes/heartratehistory');
const equipmentHistoryRouter = require('./routes/equipmenthistory');
const panicHistoryRouter = require('./routes/panichistory');
const lightSensorRouter = require('./routes/lightSensorHistory');
const atmosphereRouter = require('./routes/atmosphere');
const roomTempRouter = require('./routes/roomTempHistory');
const noiseLevelRouter = require('./routes/noiseLevelHistory');


const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));




//  using routes
app.use('/API/parent', parentRouter);
app.use('/API/child', childRouter);
app.use('/API/locationHistory', locationHistoryRouter);
app.use('/API/smartwatch', smartwatchRouter);
app.use('/API/heartratehistory', heartRateHistoryRouter);
app.use('/API/equipmenthistory', equipmentHistoryRouter);
app.use('/API/panichistory', panicHistoryRouter);
app.use('/API/lightSensorHistory', lightSensorRouter);
app.use('/API/atmosphere', atmosphereRouter);
app.use('/API/roomTempHistory', roomTempRouter);
app.use('/API/noiseLevelHistory', noiseLevelRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
