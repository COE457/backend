const noiseLevelHistory = require("../../models").noiseLevelHistory;
const NoiseLevelHistory = new noiseLevelHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedNoiseLevelHistory = await NoiseLevelHistory.destroy(req.body);
        res.status(200).json(deletedNoiseLevelHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}