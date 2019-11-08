const smartwatch = require("../../models").smartwatch;
const Smartwatch = new smartwatch();

module.exports = async (req, res, next) => {
    try {
        const foundSmartwatch = await Smartwatch.read(req.query);
        res.status(200).json(foundSmartwatch);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}