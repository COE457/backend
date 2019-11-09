const lightSensorHistory = require("../../models").lightSensorHistory;
const LightSensorHistory = new lightSensorHistory();

module.exports = async (req, res, next) => {
    try {
        const foundLightSensorHistory = await LightSensorHistory.read(req.query);
        res.status(200).json(foundLightSensorHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}