const objectHistory = require("../../models").objectHistory;
const ObjectHistory = new objectHistory();

module.exports = async (req, res, next) => {
    try {
        const foundObjectHistory = await ObjectHistory.read(req.query);
        res.status(200).json(foundObjectHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}