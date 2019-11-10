const heartRateHistory = require("../../models").heartRateHistory;
const HeartRateHistory = new heartRateHistory();

module.exports = async (req, res, next) => {
    try {
        const newHeartRateHistory = await HeartRateHistory.create(req.body);
        res.status(201).json(newHeartRateHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateDate" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}