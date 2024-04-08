require("dotenv").config();

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Content = require("../models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decode.userId;
    next();
  } catch (error) {
    console.log(error);
  }
};

router.route("/admin").get((req, res) => {
  try {
    const locals = {
      title: "Bharat Blog",
      description: "Bharat Blog description for the blog",
    };
    const token = req.cookies.token;
    if(token) {
      return res.redirect('/dashboard');
    }
    res.render("admin/index", { locals, layout: "layouts/admin" });
  } catch (error) {
    console.error(error);
  }
});

//! admin login ------->>>>>>>>
router.route("/login").post(async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });

    if (!userExists) {
      return res.status(400).json({
        message: "Invalid username or password",
      });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: userExists._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: 86400, // expires in 24 hours
      }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 86400000),
      httpOnly: true,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
  }
});

//! dashboard ------->>>>>>>>
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Bharat Blog description for the blog",
    };

    const data = await Content.aggregate([{ $sort: { createdAt: -1 } }]);
    res.render("admin/dashboard", { locals, data, layout: "layouts/admin" });
  } catch (error) {
    console.error(error);
  }
});

//! Add new post ------->>>>>
router.route("/add-post").get(authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add post",
      description: "Bharat Blog description for the blog",
    };

    res.render("admin/add-post", { locals, layout: "layouts/admin" });
  } catch (error) {
    console.log(error);
  }
});

router.route("/add-post").post(authMiddleware, async (req, res) => {
  try {
    console.log(req.body);

    const { title, body } = req.body;
    const newPost = new Content({ title, body });

    await Content.create(newPost);

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

//! Edit post ------->>>>>>>>
router.route("/edit-post/:id").get(authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit post",
      description: "Bharat Blog description for the blog",
    };

    const data = await Content.findOne({ _id: req.params.id });
    
    res.render("admin/edit-post", { locals, data, layout: "layouts/admin" });
  } catch (error) {
    console.error(error);
  }
});

router.route("/edit-post/:id").put(authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit post",
      description: "Bharat Blog description for the blog",
    };

    await Content.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.error(error);
  }
});

//! Delete post --------->>>>>>>>
router.route("/delete-post/:id").delete(authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Delete post",
      description: "Bharat Blog description for the blog",
    };

    const data = await Content.deleteOne({ _id: req.params.id });
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
  }
});

//! Register user ------->>>>>>>>
router.route("/register").post(async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    console.log(req.body);

    const userExist = await User.findOne({ username });
    if (userExist) {
      return res.send("user already exists");
    }

    if(password != confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const haspassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: haspassword,
    });

    res.status(200).json({ "User created": user });
  } catch (error) {
    console.log(error);
  }
});

//! Logout user ------->>>>>>>>
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/admin");
});

module.exports = router;
