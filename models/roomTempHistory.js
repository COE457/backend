/**
 * @file roomTempHistory.js
 *
 * @description used to make CRUD operations unified for all RoomTempHistory docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages


class RoomTempHistory {
  constructor() {
    //  setting the required keys
    this.columns = ["date","reading", "location"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new roomTempHistory to the database iff the location was not a duplicate and the body contains all required keys
   */

  //  performs creation based on this.column
  create(body) {
    return new Promise(async (resolve, reject) => {
      //  checking for missing keys
      if (
        !this.columns
          // .concat(this.owner)
          .every(item => Object.keys(body).includes(item))
      ) {
        reject(errors.missingKeys); //  exit the function and return a promise reject
        return; //  exiting the function
      }


      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.concat(this.owner).includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "RoomTempHistory"; //  adding document type to body

      //  adding entry to db
      try {
        var newRoomTempHistory = await db.insert(body);
        resolve(newRoomTempHistory); //  resolving the promise and returning newRoomTempHistory
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
   * @description removes roomTempHistory based on _id and _rev or date
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./roomTempHistory.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedRoomTempHistory = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedRoomTempHistory);
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
              docType: "RoomTempHistory",
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
          const deletedRoomTempHistory = await db.destroy(_id, _rev); //  attempt to destroy
          resolve(deletedRoomTempHistory);
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
   * @description lists roomTempHistorys based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {


      //  if trying to find range
      body.descending = (body.startkey || body.endkey)? false:true;
      if(body.startkey) body.startkey = Number(body.startkey); //  making sure keys are numbers 
      if(body.endkey) body.endkey = Number(body.endkey);

      // if(!body.startkey && !body.endkey) {//  to get only the data of a certain smartwatch
      //   body.startkey = [body.Atmosphere, {}];
      //   body.endkey = [body.Atmosphere];
      // }

      //  default vs custom behaviour
      let page = !isNaN(body.page)? body.page : 0;
      let rows = !isNaN(body.rows)? body.rows : 5;

      //  from page and rows to skips and limits
      body.skip = page * rows;
      body.limit = Number(rows);

      try{
        const result = await db.view('sortedSensors', 'RoomTempHistory', body);
        resolve(result);
      } catch (err) {
        reject(errors.databaseError(err));
      }
    });
  }

  /**
   * @function update
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description updates roomTempHistory based on _id and _rev or location
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
              docType: "RoomTempHistory",
              _id: body._id
            }
          : {
              docType: "RoomTempHistory",
              date: body.date,
              reading:body.reading
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Atmosphere to prevent changing atmosphere
      if (body.Atmosphere) delete body.Atmosphere;

      try {
        var target = await db //  finding RoomTempHistorys
          .find({
            //  find all roomTempHistorys with location
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

        const updatedRoomTempHistory = await db.insert(tmpBody); //  attempt edit
        resolve(updatedRoomTempHistory); //  resolve and return
      }
    });
  }
}

module.exports = RoomTempHistory;