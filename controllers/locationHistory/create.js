const child = require("../../models").child;
const Child = new child();

module.exports = async (req, res, next) => {
    try {
        const newChild = await Child.create(req.body);
        res.status(201).json(newChild);
    } catch (err) {
        let status =
            (err.error == "duplicateName" || err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}