const locationHistory = require("../../models").locationHistory;
const LocationHistory = new locationHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedLocationHistory = await LocationHistory.destroy(req.body);
        res.status(200).json(deletedLocationHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}