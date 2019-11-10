const heartRateHistory = require("../../models").heartRateHistory;
const HeartRateHistory = new heartRateHistory();


module.exports = async (req, res, next) => {
    try {
        const deletedHeartRateHistory = await HeartRateHistory.destroy(req.body);
        res.status(200).json(deletedHeartRateHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}