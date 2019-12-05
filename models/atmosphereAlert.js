/**
 * @file atmosphereAlert.js
 *
 * @description used to make CRUD operations unified for all AtmosphereAlert docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages

class AtmosphereAlert {
  constructor() {
    //  setting the required keys
    this.columns = ["type", "details", "date"];
    this.owner = ["Atmosphere"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new atmosphereAlert to the database iff the location was not a duplicate and the body contains all required keys
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

      body.docType = "AtmosphereAlert"; //  adding document type to body

      //  adding entry to db
      try {
        var newAtmosphereAlert = await db.insert(body);
        resolve(newAtmosphereAlert); //  resolving the promise and returning newAtmosphereAlert
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
   * @description removes atmosphereAlert based on _id and _rev or location
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./atmosphereAlert.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedAtmosphereAlert = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedAtmosphereAlert);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body.location) {
        //  if location but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "AtmosphereAlert",
              location: body.location
            },
            fields: ["_id", "_rev"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body.location));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const deletedAtmosphereAlert = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedAtmosphereAlert);
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
   * @description lists atmosphereAlerts based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundAtmosphereAlert = await db.get(body._id); //  get the atmosphereAlert that matches the id
          resolve(foundAtmosphereAlert); //  return and resolve promise
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
        selector.docType = "AtmosphereAlert"; //  search only AtmosphereAlert docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundAtmosphereAlerts = await db.find(selector); //  get all matches
        resolve(foundAtmosphereAlerts); //  return and resolve promise
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
   * @description updates atmosphereAlert based on _id and _rev or location
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body.location)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
              docType: "AtmosphereAlert",
              _id: body._id
            }
          : {
              docType: "AtmosphereAlert",
              location: body.location
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Parent to prevent changing parent
      if (body.Parent) delete body.Parent;

      try {
        var target = await db //  finding AtmosphereAlerts
          .find({
            //  find all atmosphereAlerts with location
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
        if (body.newLocation) {
          body.location = body.newLocation;
          delete body.newLocation;
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

        const updatedAtmosphereAlert = await db.insert(tmpBody); //  attempt edit
        resolve(updatedAtmosphereAlert); //  resolve and return
      }
    });
  }
}

module.exports = AtmosphereAlert;
