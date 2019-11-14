const locationHistory = require("../../models").locationHistory;
const LocationHistory = new locationHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedLocationHistory = await LocationHistory.update(req.body);
        res.status(201).json(updatedLocationHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}