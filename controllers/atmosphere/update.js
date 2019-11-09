const atmosphere = require("../../models").atmosphere;
const Atmosphere = new atmosphere();

module.exports = async (req, res, next) => {
    try {
        const updatedAtmosphere = await Atmosphere.update(req.body);
        res.status(201).json(updatedAtmosphere);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}