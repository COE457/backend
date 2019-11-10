const lightSensorHistory = require("../../models").lightSensorHistory;
const LightSensorHistory = new lightSensorHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedLightSensorHistory = await LightSensorHistory.update(req.body);
        res.status(201).json(updatedLightSensorHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}