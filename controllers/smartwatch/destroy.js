const smartwatch = require("../../models").smartwatch;
const Smartwatch = new smartwatch();

module.exports = async (req, res, next) => {
    try {
        const deletedSmartwatch = await Smartwatch.destroy(req.body);
        res.status(200).json(deletedSmartwatch);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}