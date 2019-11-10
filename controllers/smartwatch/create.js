const smartwatch = require("../../models").smartwatch;
const Smartwatch = new smartwatch();

module.exports = async (req, res, next) => {
    try {
        const newSmarwatch = await Smartwatch.create(req.body);
        res.status(201).json(newSmarwatch);
    } catch (err) {
        let status =
            (err.error == "duplicateSerialNumber" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}