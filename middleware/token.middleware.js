const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = function(req, res, next) { 
    try{
        let token = req.headers.authorization; 
        console.log(token);
        if(!token){
            return res.status(401).send({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.jwtSecret);
        req.auth = decoded;
        next();
    }catch (error){
        console.log(error);
        res.status(401).send({ message: "Error in token verification" });

    }
}