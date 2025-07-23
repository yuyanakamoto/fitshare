import express from "express";
import Post from "../models/Post.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// create post
router.post("/", authRequired, async (req, res) => {
  const post = await Post.create({ ...req.body, userId: req.user.id, username: req.user.username });
  req.app.get("io").emit("newPost", post);
  res.json(post);
});

// like toggle
router.post("/:id/like", authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const idx = post.likedBy.findIndex((u) => u.toString() === req.user.id);
  if (idx >= 0) post.likedBy.splice(idx, 1);
  else post.likedBy.push(req.user.id);
  await post.save();
  req.app.get("io").emit("likeUpdated", { postId: post._id, likedBy: post.likedBy });
  res.json(post);
});

// get likes list
router.get("/:id/likes", authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("likedBy", "username");
  res.json(post.likedBy.map((u) => ({ userId: u._id, username: u.username })));
});

// comment CRUD
router.post("/:id/comments", authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const comment = { userId: req.user.id, username: req.user.username, text: req.body.text };
  post.comments.push(comment);
  await post.save();
  const newComment = post.comments[post.comments.length - 1];
  req.app.get("io").emit("newComment", { postId: post._id, comment: newComment });
  res.json(newComment);
});

router.put("/:postId/comments/:commentId", authRequired, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);
  if (comment.userId.toString() !== req.user.id) return res.sendStatus(403);
  comment.text = req.body.text;
  await post.save();
  req.app.get("io").emit("updateComment", { postId: post._id, comment });
  res.json(comment);
});

router.delete("/:postId/comments/:commentId", authRequired, async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const comment = post.comments.id(req.params.commentId);
  if (comment.userId.toString() !== req.user.id) return res.sendStatus(403);
  comment.remove();
  await post.save();
  req.app.get("io").emit("deleteComment", { postId: post._id, commentId: req.params.commentId });
  res.json({});
});

export default router;
