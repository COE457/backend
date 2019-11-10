const atmosphere = require("../../models").atmosphere;
const Atmophere = new atmosphere();

module.exports = async (req, res, next) => {
    try {
        const newAtmosphere = await Atmophere.create(req.body);
        res.status(201).json(newAtmosphere);
    } catch (err) {
        let status =
            (err.error == "duplicateLocation" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}