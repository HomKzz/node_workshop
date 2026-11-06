var express = require("express");
var router = express.Router();
var userSchema = require("../models/users.model");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var tokenMiddleware = require("../middleware/token.middleware");
require("dotenv").config();

/* GET users listing. */
router.post("/register", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    // console.log("username: ", username);
    // console.log("password: ", password);
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    let checkUser = await userSchema.findOne({ username: username });
    if (checkUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let user = new userSchema({
      username: username,
      password: bcrypt.hashSync(password, 10),
    });
    await user.save();
    res.status(201).json({ message: "success" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let user = await userSchema.findOne({ username: username });
    //console.log("user: ", user);
    if(!user){
      return res.status(400).json({ message: "User not found" });
    }
    let isMatch = bcrypt.compareSync(password, user.password);
    if(!isMatch){
      return res.status(400).json({ message: "Wrong password" });
    }
    if(!user.isApproved){
      return res.status(400).json({ message: "User not approved" });
    }

    let token = jwt.sign(
      {userId: user._id, username: user.username, role: user.role },
      process.env.jwtSecret,
      { expiresIn: "24h" }
    );
    res.status(200).json({ message: "success", token: token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:id/approve", tokenMiddleware , async function (req, res, next) {
  try{
    let { id } = req.params;
    let { role } = req.auth;
   // console.log("role: ", role);
    if(role !== "admin"){
      return res.status(403).json({ message: "Forbidden" });
    }
    let user = await userSchema.findById(id);
    if(!user){
      return res.status(400).json({ message: "User not found" });
    }
    user.isApproved = true;
    await user.save();
    res.status(200).json({ message: "success" });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
