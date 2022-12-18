import { Router } from "express";
import Post from "../models/Post.mjs";
import User from "../models/User.mjs";

const router = Router();

// create a post
router.post("/", async (req, res) => {
  const { userId, ...post } = req.body;

  try {
    // get user
    const user = await User.findById(userId);
    // save the post
    const savedPost = await Post.create({
      author: {
        id: user._id,
        username: user.username,
      },
      ...post,
    });
    // send response success
    res.status(200).json(savedPost);
  } catch (error) {
    // send response error
    res.status(500).json(error);
  }
});

// udpate post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const { userId, ...other } = req.body;
    // check the post
    if (post.author.id == userId) {
      // update the post
      await post.updateOne({ $set: other });
      // send message success
      res.status(200).json({ message: "your post has been updated" });
    } else {
      res.status(403).json({ message: "you can update only your post!" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // delete the post
    if (post.author.id == req.body.userId) {
      await post.deleteOne();
      res.status(200).json({ message: "your post has been deleted" });
    } else {
      res.status(403).json({ message: "you can delete only your post" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// like and dislike post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // if the user has not liked the post
    if (!post.likes.includes(req.body.userId)) {
      // like the post
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({ message: "post has been liked" });
    } else {
      // dislike the post
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json({ message: "post has been disliked" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// user post
router.get("/profile/:username", async (req, res) => {
  try {
    // search post by username
    const post = await Post.find({ "author.username": req.params.username });

    // send post
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// timeline post
router.get("/timeline/:userId", async (req, res) => {
  try {
    // get current user
    const user = await User.findById(req.params.userId);
    // get current posts of user
    const userPosts = await Post.find({
      "author.id": user._id,
    });
    // get friend posts
    const friendPosts = await Promise.all(
      user.followings.map((friendId) => {
        return Post.find({ "author.id": friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
