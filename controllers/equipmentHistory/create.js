const equipmentHistory = require("../../models").equipmentHistory;
const EquipmentHistory = new equipmentHistory();

module.exports = async (req, res, next) => {
    try {
        const newEquipmentHistory = await EquipmentHistory.create(req.body);
        res.status(201).json(newEquipmentHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateDate" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}