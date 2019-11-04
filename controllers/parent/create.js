const parent = require("../../models").parent;
const Parent = new parent();

module.exports = async (req, res, next) => {
    try {
        const newParent = await Parent.create(req.body);
        res.status(201).json(newParent);
    } catch (err) {
        let status =
            (err.error == "duplicateUsername" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}