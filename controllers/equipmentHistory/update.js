const equipmentHistory = require("../../models").equipmentHistory;
const EquipmentHistory = new equipmentHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedEquipmentHistory = await EquipmentHistory.update(req.body);
        res.status(201).json(updatedEquipmentHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}