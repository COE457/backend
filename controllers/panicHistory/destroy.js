const panicHistory = require("../../models").panicHistory;
const PanicHistory = new panicHistory();


module.exports = async (req, res, next) => {
    try {
        const deletedPanicHistory = await PanicHistory.destroy(req.body);
        res.status(200).json(deletedPanicHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}