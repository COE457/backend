const atmosphere = require("../../models").atmosphere;
const Atmosphere = new atmosphere();

module.exports = async (req, res, next) => {
    try {
        const foundAtmosphere = await Atmosphere.read(req.query);
        res.status(200).json(foundAtmosphere);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}