const roomTempHistory = require("../../models").roomTempHistory;
const RoomTempHistory = new roomTempHistory();

module.exports = async (req, res, next) => {
    try {
        const foundRoomTempHistory = await RoomTempHistory.read(req.query);
        res.status(200).json(foundRoomTempHistory);
    } catch (err) {
        let status = (err.error == "databaseError") ? 500 : 500;
        res.status(status).send(err);
    }
}