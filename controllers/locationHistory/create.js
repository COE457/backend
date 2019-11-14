const locationHistory = require("../../models").locationHistory;
const LocationHistory = new locationHistory();

module.exports = async (req, res, next) => {
    try {
        const newLocationHistory = await LocationHistory.create(req.body);
        res.status(201).json(newLocationHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateName" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}