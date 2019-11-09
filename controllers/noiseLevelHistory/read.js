const noiseLevelHistory = require("../../models").noiseLevelHistory;
const NoiseLevelHistory = new noiseLevelHistory();

module.exports = async (req, res, next) => {
    try {
        const foundNoiseLevelHistory = await NoiseLevelHistory.read(req.query);
        res.status(200).json(foundNoiseLevelHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}