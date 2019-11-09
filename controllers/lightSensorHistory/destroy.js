const lightSensorHistory = require("../../models").lightSensorHistory;
const LightSensorHistory = new lightSensorHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedLightSensorHistory = await LightSensorHistory.destroy(req.body);
        res.status(200).json(deletedLightSensorHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}