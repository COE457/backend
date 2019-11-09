const lightSensorHistory = require("../../models").lightSensorHistory;
const LightSensorHistory = new lightSensorHistory();

module.exports = async (req, res, next) => {
    try {
        const newAtmosphere = await LightSensorHistory.create(req.body);
        res.status(201).json(newAtmosphere);
    } catch (err) {
        let status =
            (err.error == "duplicateLocation" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}