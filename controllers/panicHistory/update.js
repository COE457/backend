const panicHistory = require("../../models").panicHistory;
const PanicHistory = new panicHistory();


module.exports = async (req, res, next) => {
    try {
        const updatedPanicHistory = await PanicHistory.update(req.body);
        res.status(201).json(updatedPanicHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}