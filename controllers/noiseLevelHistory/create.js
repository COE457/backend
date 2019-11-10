const noiseLevelHistory = require("../../models").noiseLevelHistory;
const NoiseLevelHistory = new noiseLevelHistory();

module.exports = async (req, res, next) => {
    try {
        const newNoiseLevelHistory = await NoiseLevelHistory.create(req.body);
        res.status(201).json(newNoiseLevelHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateLocation" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}