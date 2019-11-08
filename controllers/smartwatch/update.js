const smartwatch = require("../../models").smartwatch;
const Smartwatch = new smartwatch();

module.exports = async (req, res, next) => {
    try {
        const updatedSmartwatch = await Smartwatch.update(req.body);
        res.status(201).json(updatedChild);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}