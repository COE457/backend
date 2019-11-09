const createError = require("http-errors");
const express = require("express");
const path = require("path");


//  importing routes
const parentRouter = require('./routes/parent');
const childRouter = require('./routes/child');
const lightSensorRouter = require('./routes/lightSensorHistory');
const atmosphereRouter = require('./routes/atmosphere');
const roomTempHistory = require('./routes/roomTempHistory');
const noiseLevelHistory = require('./routes/noiseLevelHistory');

const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));




//  using routes
app.use('/API/parent', parentRouter);
app.use('/API/child', childRouter);
app.use('/API/lightSensorRouter', lightSensorRouter);
app.use('/API/atmosphere', atmosphereRouter);
app.use('/API/roomTempHistory', roomTempHistory);
app.use('/API/noiseLevelHistory', noiseLevelHistory);

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
