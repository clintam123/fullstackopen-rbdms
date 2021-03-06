const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = require("express").Router();
const { User, Session } = require("../models");
const { SECRET } = require("../util/config");
const { userFromToken } = require("../util/middleware");

router.post("/login", async (req, res) => {
  const body = req.body;
  const user = await User.findOne({
    where: {
      username: body.username,
    },
  });

  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  const token = jwt.sign(userForToken, SECRET);

  await Session.create({ token, userId: user.id });

  res.status(200).send({ token, username: user.username, name: user.name });
});

router.delete("/logout", userFromToken, async (req, res) => {
  await Session.destroy({
    where: {
      userId: req.user.id,
    },
  });

  res.status(200).send({
    message: "token revoken",
  });
});

module.exports = router;
