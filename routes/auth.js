import express from "express";
import bcrypt from "bcryptjs";
import user from "../models/user.js";
import {
  signAccessToken,
  signRefreshToken,
  authRequired,
} from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, username });
  const payload = { id: user._id, username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ id: user._id, username });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ message: "Invalid" });
  const payload = { id: user._id, username: user.username };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ id: user._id, username: user.username });
});

router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    const accessToken = signAccessToken({ id: payload.id, username: payload.username });
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({});
  } catch {
    return res.sendStatus(401);
  }
});

router.post("/logout", (_req, res) => {
  res
    .cookie("accessToken", "", { maxAge: 0 })
    .cookie("refreshToken", "", { maxAge: 0, path: "/api/auth/refresh" })
    .json({});
});

router.put("/me/max", authRequired, async (req, res) => {
  const { benchMax, deadliftMax, squatMax } = req.body;
  await User.findByIdAndUpdate(req.user.id, { benchMax, deadliftMax, squatMax });
  res.json({ ok: true });
});

export default router;