const objectHistory = require("../../models").objectHistory;
const ObjectHistory = new objectHistory();

module.exports = async (req, res, next) => {
    try {
        const newObjectHistory = await ObjectHistory.create(req.body);
        res.status(201).json(newObjectHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateName" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}