const objectHistory = require("../../models").objectHistory;
const ObjectHistory = new objectHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedObjectHistory = await ObjectHistory.destroy(req.body);
        res.status(200).json(deletedObjectHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}