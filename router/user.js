const express = require("express");
const userRouter = express.Router();    //產生router物件，存入變數
const userModel = require("../model/user")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: ".env" });
const JwtSecret=process.env.JWT_SECRET_KEY;

// signup
userRouter.post("/", async(req, res) => {
    try{
        const frontRequest = req.body;
        const name = frontRequest.name;
		const email = frontRequest.email;
		const password  = frontRequest.password;
		if (name == "" || email == "" || password == ""){
            res.status(400).json({ 			
                "error": true,
                "message": "⚠️ Enter your name, Email and password" 
            });
        }else{
			const result = await userModel.checkSignupEmail(email);
			if (result){
                res.status(400).json({ 			
                    "error": true,
                    "message": "⚠️ Sorry! Email has been used!"
                });               
            }else{
				const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-.]+){1,}$/;
                const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4,8}$/;
				const emailResult= email.match(emailRegex);
				const passwordResult = password.match(passwordRegex);
                // 加強密碼安全性
                const salt = await bcrypt.genSalt(10);
			    const pwHash = await bcrypt.hash(password, salt);
				if (emailResult && passwordResult){
					await userModel.signup(name, email, pwHash);
                    // 直接讓使用者導向登入
                    const result = await userModel.signin(email);
                    const user = {
                        "userID":result.userID,
                        "name":result.name, 
                        "email":result.email
                    }
                    const token = jwt.sign(user, JwtSecret);
                    let response = {
                        "ok": true
                    }
                    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 3600000 * 24 * 7) });
                    res.status(200).json(response);                   
                }else{
                    res.status(400).json({ 			
                        "error": true,
                        "message": "⚠️ Invalid Email or password"
                    });                     
                }  
            }
        }		
    }catch{
        return res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

// signin
userRouter.put("/", async(req, res) => {
    try{
        const frontRequest = req.body;
        const email = frontRequest.email;
        const password  = frontRequest.password;
        if (email == "" || password == ""){
            res.status(400).json({ 			
                "error": true,
                "message": "⚠️ Enter your Email and password" 
            });
        }else{
            const result = await userModel.signin(email);
            if (result){
                const checkPassword = bcrypt.compareSync(password, result.password)
                if (email == result.email && checkPassword){
                    const user = {
                        "userID":result.userID,
                        "name":result.name, 
                        "email":result.email
                    }
                    const token = jwt.sign(user, JwtSecret);
                    let response = {
                        "ok": true
                    }
                    res.cookie("token", token, { httpOnly: true, expires: new Date(Date.now() + 3600000 * 24 * 7) });
                    res.status(200).json(response);
                }else{
                    res.status(400).json({ 			
                        "error": true,
                        "message": "⚠️ Wrong Email or password"
                    });   
                }          
            }else{
                res.status(400).json({ 			
                    "error": true,
                    "message": "⚠️ Wrong Email or password"
                }); 
            }
        }        
    }catch{
        return res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

// get signin status/information
userRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","")
            const userCookie = jwt.verify(token, JwtSecret)
            let response = {
                "data": {
                    "userID": userCookie.userID,
                    "name": userCookie.name,
                    "email": userCookie.email
                }
            }
            res.status(200).json(response);
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied.Please Login."
            });        
        }        
    }catch{
        return res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

 // signout 
userRouter.delete("/", async(req, res) => {
	let response = {
		"ok": true
	}
    res.clearCookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json(response);
})

module.exports = userRouter