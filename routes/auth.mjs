import { Router } from "express";
import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import { hashPassword } from "../utils/hashPassword.mjs";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, nickname, email, password } = await req.body;
    const hashedPassword = await hashPassword(password);

    // check username valid ot not
    const usernameValid = await User.findOne({ username: username });
    if (usernameValid) {
      return res.status(400).json({ usernameError: "Username is not available!" });
    }

    const emailValid = await User.findOne({ email: email });
    if (emailValid) {
      return res.status(400).json({ emailError: "Email already registred!" });
    }

    const newUser = new User({
      username,
      nickname,
      email,
      password: hashedPassword,
    });

    //   save and send response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error._message });
    console.error("There is Error : ", error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // cek user with email
    if (!user) {
      return res.status(400).json({ emailError: "Email not registred!" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // cek password
    if (!validPassword) {
      return res.status(400).json({ passwordError: "Password is wrong!" });
    }

    // send response user data without password and updatedAt
    const { password, updatedAt, ...other } = user._doc;

    res.status(200).json(other);
  } catch (error) {
    console.error("There is error : ", error);
    res.status(500).json(error);
  }
});

export default router;
