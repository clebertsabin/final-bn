import express from "express";
import { Request, Response } from "express";
import { use } from "passport";
import { AppDataSource } from "../db/db";
import { User } from "../models/User";
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google Authentication Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback Route
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
      try {
        const user = req.user as unknown as User; // Cast req.user to User type
  
        // Create a plain object for JWT payload
        const payload = {
          id: user.id,
          email: user.email,
          type: user.type,
          FirstName: user.FirstName,
          LastName: user.LastName
        };
  
        // Sign the JWT token
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1h' }
        );
  
        // You might want to store the token in the user record
        if (user.refreshToken) {
          const userRepository = AppDataSource.getRepository(User);
          user.refreshToken = token;
          await userRepository.save(user);
        }
  
        // Send the token in the response
        res.redirect(`${process.env.FRONT_END_URL}?token=${token}`);
      } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({
          success: false,
          message: 'Error generating authentication token'
        });
      }
    }
  );
  

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});
export default  router;
