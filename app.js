const createError = require("http-errors");
const express = require("express");
const path = require("path");

// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const parent = require("./models").parent;
const Parent = new parent();


Parent.update({
  "_id": "2f6f93f84a7d8b7fe1b8b32edd01cc3d",
  "_rev": "1-3acdaad61d6f1178d3d3ccbbe30bd640",
  password: "123"
}).then(parent => {
  console.log(parent);
}).catch(e => {
  console.log(e);
});

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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
  res.render("error");
});

module.exports = app;
