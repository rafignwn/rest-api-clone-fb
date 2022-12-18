import { Router } from "express";
import User from "../models/User.mjs";
import { hashPassword } from "../utils/hashPassword.mjs";

const router = Router();

// get a user
router.get("/", async (req, res) => {
  const id = req.query.id;
  const username = req.query.username;

  try {
    const user = id
      ? await User.findById(id)
      : await User.findOne({ username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (error) {
    res.status(500).send(error);
  }
});

// update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        req.body.password = await hashPassword(req.body.password);
      } catch (error) {
        res.status(500).json(error);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json({ message: "Account has been updated" });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({ message: "you can update only your account!" });
  }
});

// delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Account has been deleted" });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({ message: "you can delete only your account" });
  }
});

// follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!currentUser.followings.includes(user._id)) {
        await user.updateOne({ $push: { followers: currentUser._id } });
        await currentUser.updateOne({ $push: { followings: user._id } });
        res
          .status(200)
          .json({ message: `user ${user.username} has been followed` });
      } else {
        res
          .status(403)
          .json({ message: `you already follow ${user.username}` });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({ message: "you can't follow yourself" });
  }
});

// unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (currentUser.followings.includes(user._id)) {
        await user.updateOne({ $pull: { followers: currentUser._id } });
        await currentUser.updateOne({ $pull: { followings: user._id } });
        res
          .status(200)
          .json({ message: `user ${user.username} has been unfollowed` });
      } else {
        res
          .status(403)
          .json({ message: `you already unfollow ${user.username}` });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({ message: "you can't unfollow yourself" });
  }
});
export default router;
