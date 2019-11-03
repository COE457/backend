const parent = require("../../models").parent;
const Parent = new parent();

module.exports = async (req, res, next) => {
    console.log(req.body);
    try {
        const newParent = await Parent.create(req.body);
        res.status(201).json(newParent);
    } catch(err) {
        res("error");
    }  finally {
        next();
    }
    


}