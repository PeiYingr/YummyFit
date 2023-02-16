const express = require("express");
const authRouter = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const userModel = require("../model/user")
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://yummy-fit.com/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

authRouter.get("/google", 
    passport.authenticate("google", { session: false, scope: ["email", "profile"] })
);

authRouter.get("/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/"}), async(req, res) => {
    try{
        const googleEmail = req.user.email;
        const name = req.user.displayName;
        const avatar = req.user.picture;
        const result = await userModel.checkSignupEmail(googleEmail);
        if (result == null) {
            await userModel.googleUserSignup(name, googleEmail, avatar);
            const googleAccountSignin = await userModel.checkSignupEmail(googleEmail);
            const user = {
                "userID": googleAccountSignin.userID,
                "name": googleAccountSignin.name, 
                "email": googleAccountSignin.email
            }
            const token = jwt.sign(user, JwtSecret);
            res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 3600000 * 24 * 7) });
            res.redirect("/");
        }else{
            await userModel.googleUserUpdate(name, googleEmail);
            const googleAccountSignin = await userModel.checkSignupEmail(googleEmail);
            const user = {
                "userID": googleAccountSignin.userID,
                "name": googleAccountSignin.name, 
                "email": googleAccountSignin.email
            }
            const token = jwt.sign(user, JwtSecret);
            res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 3600000 * 24 * 7) });
            res.redirect("/");
        }
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
  },
)

module.exports = authRouter;
