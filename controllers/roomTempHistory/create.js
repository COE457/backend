const roomTempHistory = require("../../models").roomTempHistory;
const RoomTempHistory = new roomTempHistory();

module.exports = async (req, res, next) => {
    try {
        const newRoomTempHistory = await RoomTempHistory.create(req.body);
        res.status(201).json(newRoomTempHistory);
    } catch (err) {
        let status =
            (err.error == "duplicateLocation" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}