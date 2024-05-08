const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/:id", userController.getUser);
router.post("/new", userController.createUser);
router.post("/login", userController.loginUser);
router.get("/proxy-profile-image", userController.proxyProfileImage);

module.exports = router;
