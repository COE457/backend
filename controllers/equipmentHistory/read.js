const equipmentHistory = require("../../models").equipmentHistory;
const EquipmentHistory = new equipmentHistory();

module.exports = async (req, res, next) => {
    try {
        const foundEquipmentHistory = await EquipmentHistory.read(req.query);
        res.status(200).json(foundEquipmentHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}