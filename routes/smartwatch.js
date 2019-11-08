/**
 * @file smartwatch.js
 * 
 * sets up the needed routes for the CRUD controllers for 
 * Smartwatch
 */

let express = require('express');

let router = express.Router(); //  router object

//getting the filename without extention and using it to import the appropriate controller 
let file = __filename.split('/')[__filename.split('/').length - 1];
const controller = require('../controllers/' + file.split('.')[0]);

router.post('/create',controller.create); //  create request
router.delete('/destroy',controller.destroy); //  delete request
router.put('/update',controller.update); //  update (edit) request
router.get('/read',controller.read); //  read request


module.exports = router; //  exporting the router object