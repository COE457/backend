const parent = require("../../models").parent;
const Parent = new parent();

module.exports = (req, res, next) => {
    console.log("HERE");
    console.log(req);
    Parent.create(req.body).then(err => {
        console.log("here");
        console.log(err);
    });
}