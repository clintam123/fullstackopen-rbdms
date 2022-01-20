const router = require("express").Router();
const bcrypt = require("bcrypt");

const { User, Blog, Readinglist } = require("../models");

router.get("/", async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: ["title", "url", "author", "likes"],
    },
  });

  res.json(users);
});

router.get("/:id", async (req, res) => {
  const where = {
    user_id: req.params.id,
  };

  if (req.query.read) {
    where.read = req.query.read === "false" ? false : true;
  }

  const user = await User.findByPk(req.params.id, {
    include: {
      model: Blog,
      as: "readings",
      attributes: { exclude: ["userId"] },
      through: {
        attributes: [],
      },
      include: {
        model: Readinglist,
        where,
        attributes: ["read", "id"],
      },
    },
  });
  res.json(user);
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
