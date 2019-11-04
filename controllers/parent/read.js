const parent = require("../../models").parent;
const Parent = new parent();

module.exports = async (req, res, next) => {
    try {
        const foundParent = await Parent.read(req.query);
        res.status(200).json(foundParent);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}