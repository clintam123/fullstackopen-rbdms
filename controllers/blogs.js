const router = require("express").Router();
const { Op } = require("sequelize");

const { Blog, User } = require("../models");
const { userFromToken } = require("../util/middleware");

router.get("/", async (req, res) => {
  let where = {};
  if (req.query.search) {
    where = {
      [Op.or]: [
        {
          title: {
            [Op.substring]: req.query.search,
          },
        },
        {
          author: {
            [Op.substring]: req.query.search,
          },
        },
      ],
    };
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ["userId"] },
    include: {
      model: User,
      attributes: ["name", "username"],
    },
    where,
    order: [["likes", "DESC"]],
  });
  res.json(blogs);
});

router.post("/", userFromToken, async (req, res) => {
  const blog = await Blog.create({ ...req.body, userId: req.user.id });
  res.json(blog);
});

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

router.delete("/:id", blogFinder, userFromToken, async (req, res) => {
  const user = req.user;
  if (user.id === req.blog.userId) {
    if (req.blog) {
      await req.blog.destroy();
    }
    res.status(204).end();
  } else {
    response.status(401).end();
  }
});

router.put("/:id", blogFinder, userFromToken, async (req, res) => {
  const user = req.user;
  if (user.id === req.blog.userId) {
    if (req.blog) {
      req.blog.likes = req.body.likes;
      await req.blog.save();
      res.json(req.blog);
    } else {
      res.status(404).end();
    }
  } else {
    response.status(401).end();
  }
});

module.exports = router;
