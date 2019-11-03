/**
 * @file errorMessages.js
 * @description unified error messages are saved here to be recycled 
 */
module.exports = {
    missingKeys: { //  error for wrong parameters
        error: "missingKeys",
        message: "not all required keys were found"
    },
    duplicate: (field, name) => { //  error for duplicate entry 
        return({
            error: `duplicate${field}`,
            message: `${name} already exists in the database`,
            entry: name
        })
    },
    notInTheDataBase: (name) => {
        return({
            error: `notInTheDataBase`,
            message: `${name} not in the database`,
            entry: name
        })
    },
    databaseError: (err) => {
        return({
            error: `databaseError`,
            databaseError: err
        })
    }
}