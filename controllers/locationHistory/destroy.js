const child = require("../../models").child;
const Child = new child();

module.exports = async (req, res, next) => {
    try {
        const deletedChild = await Child.destroy(req.body);
        res.status(200).json(deletedChild);
    } catch (err) {
        let status =
            (err.error == "missingKeys" || err.error == "notInTheDataBase") ? 400 :
                (err.error == "databaseError") ? 500 :
                    500;
        res.status(status).send(err);
    }
}