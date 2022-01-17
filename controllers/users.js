const router = require("express").Router();
const bcrypt = require("bcrypt");

const { User } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post("/", async (req, res) => {
  const { name, username, password } = req.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({ name, username, passwordHash });
  res.json(newUser);
});

const userFinder = async (req, res, next) => {
  req.user = await User.findOne({
    where: {
      username: req.params.username,
    },
  });
  next();
};

router.put("/:username", userFinder, async (req, res) => {
  req.user.username = req.body.username;
  await req.user.save();
  res.json(req.user);
});

module.exports = router;
