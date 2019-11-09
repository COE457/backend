const heartRateHistory = require("../../models").heartRateHistory;
const HeartRateHistory = new heartRateHistory();


module.exports = async (req, res, next) => {
    try {
        const foundHeartRateHistory = await HeartRateHistory.read(req.query);
        res.status(200).json(foundHeartRateHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}