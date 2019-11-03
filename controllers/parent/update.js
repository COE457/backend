const Parent = require("../../models").parent;

module.exports = (req, res, next) => {
    Parent.update(req.body);
}