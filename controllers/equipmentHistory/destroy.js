const equipmentHistory = require("../../models").equipmentHistory;
const EquipmentHistory = new equipmentHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedEquipmentHistory = await EquipmentHistory.destroy(req.body);
        res.status(200).json(deletedEquipmentHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}