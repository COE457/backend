const locationHistory = require("../../models").locationHistory;
const LocationHistory = new locationHistory();

module.exports = async (req, res, next) => {
    try {
        const foundLocationHistory = await LocationHistory.read(req.query);
        res.status(200).json(foundLocationHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}