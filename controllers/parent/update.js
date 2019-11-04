const parent = require("../../models").parent;
const Parent = new parent();

module.exports = async (req, res, next) => {
    try {
        const updatedParent = await Parent.update(req.body);
        res.status(201).json(updatedParent);
    } catch (err) {
        let status =
            (err.error == "notInTheDataBase" || err.error == "missingKeys") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}