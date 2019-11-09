const roomTempHistory = require("../../models").roomTempHistory;
const RoomTempHistory = new roomTempHistory();

module.exports = async (req, res, next) => {
    try {
        const updatedRoomTempHistory = await RoomTempHistory.update(req.body);
        res.status(201).json(updatedRoomTempHistory);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}