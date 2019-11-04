const child = require("../../models").child;
const Child = new child();

module.exports = async (req, res, next) => {
    try {
        const foundChild = await Child.read(req.query);
        res.status(200).json(foundChild);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}