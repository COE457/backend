const noiseLevelHistory = require("../../models").noiseLevelHistory;
const NoiseLevelHistory = new NoiseLevelHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedNoiseLevelHistory = await NoiseLevelHistory.update(req.body);
        res.status(201).json(updatedNoiseLevelHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}