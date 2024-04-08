const express = require("express");
const router = express.Router();
const Content = require("../models/post");

//* Home page --------->>>
router.route("").get(async (req, res) => {
  try {
    const locals = {
      title: "Bharat Blog",
      description: "Bharat Blog description for the blog",
    };
    // const data = await Content.find();

    let perPage = 8;
    let page = req.query.page || 1;

    const data = await Content.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const countData = await Content.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasPage = nextPage <= Math.ceil(countData / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

//* Reading page ------>>>>
router.route("/read/:id").get(async (req, res) => {
  try {
    const slag = req.params.id;
    const data = await Content.findById({ _id: slag });
    const locals = {
      title: data.title,
      description: "Bharat Blog description for the blog",
    };
    res.render("read", {
      locals,
      data,
    });
  } catch (error) {
    console.log(error);
  }
});

//* About page -------->>>
router.route("/about").get((req, res) => {
  res.render("about");
});

router.route("/contact").get((req, res) => {
  res.render("contact");
})

module.exports = router;
