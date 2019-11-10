const panicHistory = require("../../models").panicHistory;
const PanicHistory = new panicHistory();

module.exports = async (req, res, next) => {
    try {
        const newPanicHistory = await PanicHistory.create(req.body);
        res.status(201).json(newPanicHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateDate" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}