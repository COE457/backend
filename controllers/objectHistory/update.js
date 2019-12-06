const objectHistory = require("../../models").objectHistory;
const ObjectHistory = new objectHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedObjectHistory = await ObjectHistory.update(req.body);
        res.status(201).json(updatedObjectHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}