/**
 * @file child.js
 *
 * @description used to make CRUD operations unified for all Child docTypes
 */

const db = require("../db"); //  for database
const errors = require("../utils/errorMessages"); //  for unified error messages


class Child {
  constructor() {
    //  setting the required keys
    this.columns = ["name"];
    this.owner = ["Parent", "Smartwatch"];
  }
  /**
   * @function create
   * @param {Object} body
   * @fires db.find
   * @fires db.insert
   * @returns Promise.resolve or Promise.reject
   * @description adds a new child to the database iff the name was not a duplicate and the body contains all required keys
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
        //  grabbing all names in db
        var names = await db.find({
          selector: { docType: "Child" },
          fields: ["name"]
        });
      } catch (err) {
        //  catch db errors
        reject(errors.databaseError(err));
        return;
      }

      //  checking for duplicate name
      if (names.docs.map(item => item.name).includes(body.name)) {
        reject(errors.duplicate("Name", body.name)); //  reject duplicate entry
        return; //  exiting the function
      }

      try {
        //  parent from db
        var parent = await db.get(body.Parent);
        var watch = await db.get(body.Smartwatch)
      } catch (err) {
        //  if parent doesn't exist
        reject(errors.notInTheDataBase(body.Parent));
        return;
      }



      //  delete extra keys from body
      let keys = Object.keys(body); //  body keys
      keys.forEach(item => {
        if (!this.columns.concat(this.owner).includes(item)) {
          delete body[item]; //  if the key was not in the "restricted", delete it
        }
      });

      body.docType = "Child"; //  adding document type to body

      //  adding entry to db
      try {
        var newChild = await db.insert(body);

        //  activating smartwatch
        const smartwatch = require('./smartwatch');
        const Smartwatch = new smartwatch();
        Smartwatch.update({_id: body.Smartwatch, active: true}).catch(err => {
          console.log('err: ', err);

        });
        resolve(newChild); //  resolving the promise and returning newChild
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
   * @description removes child based on _id and _rev or name
   *
   *
   * @todo fix warnings
   * @todo cascade deletion when ./child.js is ready
   */
  destroy(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id && body._rev) {
        //  if id was provided
        try {
          const deletedChild = await db.destroy(body._id, body._rev); //  directly attempt to destroy
          resolve(deletedChild);
        } catch (err) {
          //  catch db errors
          reject(errors.databaseError(err));
          return;
        }
      } else if (body.name) {
        //  if name but not id was provided, find id and rev
        try {
          const target = await db.find({
            selector: {
              docType: "Child",
              name: body.name
            },
            fields: ["_id", "_rev", "Smartwatch"]
          });
          if (target.docs.length == 0) {
            //  reject in case of no results
            reject(errors.notInTheDataBase(body.name));
            return;
          }
          const _id = target.docs[0]._id;
          const _rev = target.docs[0]._rev;
          const watch = target.docs[0].Smartwatch;
          const deletedChild = await db.destroy(_id, _rev); //  attempt to destroy

          //  deactivating smartwatch
          const smartwatch = require('./smartwatch');
          const Smartwatch = new smartwatch();
          Smartwatch.update({_id: watch, active: false}).catch(err => {
            console.log('err: ', err);
          });
          
          resolve(deletedChild);
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
   * @description lists children based on _id, or other attributes
   */
  read(body) {
    return new Promise(async (resolve, reject) => {
      if (body._id) {
        try {
          //  if id was provided
          const foundChild = await db.get(body._id); //  get the child that matches the id
          resolve(foundChild); //  return and resolve promise
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
        selector.docType = "Child"; //  search only Child docs

        //  add the "selector" key to the whole thing
        selector = { selector: selector };
        const foundChildren = await db.find(selector); //  get all matches
        resolve(foundChildren); //  return and resolve promise
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
   * @description updates child based on _id and _rev or name
   */
  update(body) {
    return new Promise(async (resolve, reject) => {
      if (!((body._id && body._rev) || body.name)) {
        //  in case not enough parameters were provided
        reject(errors.missingKeys); //  reject and return
        return;
      }

      // finding the document that will be edited
      let search = //  setting up the search term based on available data
        body._id && body._rev
          ? {
              docType: "Child",
              _id: body._id
            }
          : {
              docType: "Child",
              name: body.name
            };

      //  deleting the rev in the body to avoid conflicts
      delete body._rev;

      //  deleting Parent to prevent changing parent
      if (body.Parent) delete body.Parent;

      try {
        var target = await db //  finding Children
          .find({
            //  find all children with name
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
        //  in case name needs to be changed
        if (body.newName) {
          body.name = body.newName;
          delete body.newName;
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

        const updatedChild = await db.insert(tmpBody); //  attempt edit
        resolve(updatedChild); //  resolve and return
      }
    });
  }
}

module.exports = Child;
