const atmosphere = require("../../models").atmosphere;
const Atmosphere = new atmosphere();

module.exports = async (req, res, next) => {
    try {
        const deletedAtmosphere = await Atmosphere.destroy(req.body);
        res.status(200).json(deletedAtmosphere);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}