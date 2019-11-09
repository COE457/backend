const roomTempHistory = require("../../models").roomTempHistory;
const RoomTempHistory = new roomTempHistory();

module.exports = async (req, res, next) => {
    try {
        const deletedRoomTempHistory = await RoomTempHistory.destroy(req.body);
        res.status(200).json(deletedRoomTempHistory);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}