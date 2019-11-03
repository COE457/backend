const Parent = require("../../models").parent;

module.exports = (req, res, next) => {
    Parent.read(req.body);
}