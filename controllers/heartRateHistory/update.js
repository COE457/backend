const heartRateHistory = require("../../models").heartRateHistory;
const HeartRateHistory = new heartRateHistory();


module.exports = async (req, res, next) => {
    try {
        const updatedHeartRateHistory = await HeartRateHistory.update(req.body);
        res.status(201).json(updatedHeartRateHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}