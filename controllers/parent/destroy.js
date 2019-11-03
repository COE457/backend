const parent = require("../../models").parent;
const Parent = new parent();

module.exports = async (req, res, next) => {
    try {
        const deletedParent = await Parent.destroy(req.body);
        res.status(200).json(deletedParent);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}