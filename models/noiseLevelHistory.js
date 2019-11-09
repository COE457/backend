/**
 * @file noiseLevelHistory.js
 *
 * @description used to make CRUD operations unified for all NoiseLevelHistory docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages

//  for checking if a atmosphere exists or not
const atmosphere = require("./atmosphere");
const Atmosphere = new atmosphere();

class NoiseLevelHistory {
  constructor() {
    //  setting the required keys
    this.columns = ["date","reading"];
    this.owner = ["Atmosphere"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new noiseLevelHistory to the database iff the location was not a duplicate and the body contains all required keys
   */

  //  performs creation based on this.column
  create(body) {
    return new Promise(async (resolve, reject) => {
      //  checking for missing keys
      if (
        !this.columns
          .concat(this.owner)
          .every(item => Object.keys(body).includes(item))
      ) {
        reject(errors.missingKeys); //  exit the function and return a promise reject
        return; //  exiting the function
      }

      try {
        //  grabbing all locations in db
        var readings = await db.find({
          selector: { docType: "NoiseLevelHistory" },
          fields: ["date","reading"]
        });
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }

      //  checking for duplicate location
      if (readings.docs.map(item => item.date).includes(body.date)) {
        reject(errors.duplicate("date", body.date)); //  reject duplicate entry
        return; //  exiting the function
      }

      try {
        //  grabbing all _id's of Atmospheres in db
        var ids = await db.get(body.Atmosphere);
      } catch (err) {
        //  if atmosphere doesn't exist
        reject(errors.notInTheDataBase(body.Atmoshphere));
        return;
      }

      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.concat(this.owner).includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "NoiseLevelHistory"; //  adding document type to body

      //  adding entry to db
      try {
        var newNoiseLevelHistory = await db.insert(body);
        resolve(newNoiseLevelHistory); //  resolving the promise and returning newNoiseLevelHistory
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }
    });
  }

  /**
   * @function destroy
   * @param {Object} body
   * @fires db.find
   * @fires db.destroy
   * @returns Promise.resolve or Promise.reject
   * @description removes noiseLevelHistory based on _id and _rev or date
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./noiseLevelHistory.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedNoiseLevelHistory = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedNoiseLevelHistory);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body.date) {
        //  if location but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "NoiseLevelHistory",
              location: body.date
            },
            fields: ["_id", "_rev"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body.date));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const deletedNoiseLevelHistory = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedNoiseLevelHistory);
          return;
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
        }
      } else {
        reject(errors.missingKeys);
      }
    });
  }

  /**
   * @function read
   * @param {Object} body
   * @fires db.find
   * @fires db.get
   * @returns Promise.resolve
   * @description lists noiseLevelHistorys based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundNoiseLevelHistory = await db.get(body._id); //  get the noiseLevelHistory that matches the id
          resolve(foundNoiseLevelHistory); //  return and resolve promise
        } catch (err) {
          reject(errors.notInTheDataBase(body._id));
        }
        return;
      } else {
        //  if id was not provided

        //  setup a selector based on regex to find all similar cases
        let selector = Object.keys(body).map(item => {
          return { [item]: { $regex: "(" + body[item] + ")+" } };
        });

        //  assemble the object array into a single object
        selector = Object.assign({}, ...selector);
        selector.docType = "NoiseLevelHistory"; //  search only NoiseLevelHistory docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundNoiseLevelHistorys = await db.find(selector); //  get all matches
        resolve(foundNoiseLevelHistorys); //  return and resolve promise
        return;
      }
    });
  }

  /**
   * @function update
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description updates noiseLevelHistory based on _id and _rev or location
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body.date)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
              docType: "NoiseLevelHistory",
              _id: body._id
            }
          : {
              docType: "NoiseLevelHistory",
              date: body.date,
              reading:body.reading
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Atmosphere to prevent changing atmosphere
      if (body.Atmosphere) delete body.Atmosphere;

      try {
        var target = await db //  finding NoiseLevelHistorys
          .find({
            //  find all noiseLevelHistorys with location
            selector: search
          });
        if (target.docs.length == 0) {
          //  reject in case of no results
          reject(errors.notInTheDataBase(JSON.stringify(search)));
          return;
        }
      } catch (err) {
        //  reject in case of db errors
        reject(errors.databaseError(err));
        return;
      } finally {
        //  in case location needs to be changed
        if (body.newDate) {
          body.date = body.newDate;
          delete body.newDate;
        }
        if (body.newReading){
          body.reading = body.newReading;
          delete body.newReading;
        }

        //  delete extra keys from body
        let keys = Object.keys(body); //  body keys
        let restricted = this.columns
          .concat(this.owner)
          .concat(["_id", "_rev"]); //  allowed keys
        keys.forEach(item => {
          if (!restricted.includes(item)) {
            delete body[item]; //  if the key was not in the "restricted", delete it
          }
        });

        //  setting up a temporary body to keep values that don't need to be changed intact
        let tmpBody = target.docs[0];
        Object.keys(body).forEach(item => {
          tmpBody[item] = body[item];
        });

        const updatedNoiseLevelHistory = await db.insert(tmpBody); //  attempt edit
        resolve(updatedNoiseLevelHistory); //  resolve and return
      }
    });
  }
}

module.exports = NoiseLevelHistory;