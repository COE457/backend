const panicHistory = require("../../models").panicHistory;
const PanicHistory = new panicHistory();


module.exports = async (req, res, next) => {
    try {
        const foundPanicHistory = await PanicHistory.read(req.query);
        res.status(200).json(foundPanicHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}