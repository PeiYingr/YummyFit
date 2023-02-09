const express = require("express");
const targetRouter = express.Router();
const targetModel = require("../model/target");
const jwt = require("jsonwebtoken");
const JwtSecret = process.env.JWT_SECRET_KEY;

//add or edit target data
targetRouter.post("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const targetInfo = req.body;
            const targetKcal = targetInfo.targetKcal;
            const targetProtein = targetInfo.targetProtein;
            const targetFat = targetInfo.targetFat;
            const targetCarbs = targetInfo.targetCarbs;
            if(targetKcal == "" || Number(targetKcal)<0 || !Number.isInteger(Number(targetKcal))){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter an integer Calories."
                }); 
            }else if(targetProtein == "" || Number(targetProtein)<0 || !Number.isInteger(Number(targetProtein))){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter an integer percentage of protein."
                }); 
            }else if(targetFat == "" || Number(targetFat)<0 || !Number.isInteger(Number(targetFat))){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter an integer percentage of fat."
                }); 
            }else if(targetCarbs == "" || Number(targetCarbs)<0 || !Number.isInteger(Number(targetCarbs))){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter an integer percentage of carbs."
                }); 
            }else if( Number(targetProtein)+Number(targetFat)+Number(targetCarbs) !== 100 ){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Percentages not adding up to 100%."
                }); 
            }else{
                await targetModel.updateTarget(userID, targetKcal, targetProtein, targetFat, targetCarbs);
                const proteinAmount = Math.round(((targetKcal*targetProtein/100)/4 + Number.EPSILON) * 100) / 100;
                const fatAmount = Math.round(((targetKcal*targetFat/100)/9 + Number.EPSILON) * 100) / 100;
                const carbsAmount = Math.round(((targetKcal*targetCarbs/100)/4 + Number.EPSILON) * 100) / 100;
                let response= {
                    "data": {
                        "targetKcal": targetKcal,
                        "targetProtein": targetProtein,
                        "targetFat": targetFat,
                        "targetCarbs": targetCarbs,
                        "proteinAmount": proteinAmount,
                        "fatAmount": fatAmount,
                        "carbsAmount": carbsAmount
                    }
                }
                res.status(200).json(response); 
            }
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
        });
    }
})

// get target data
targetRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const result = await targetModel.getTarget(userID);
            const proteinAmount = Math.round(((result.targetKcal*result.targetProtein/100)/4 + Number.EPSILON) * 100) / 100;
            const fatAmount = Math.round(((result.targetKcal*result.targetFat/100)/9 + Number.EPSILON) * 100) / 100;
            const carbsAmount = Math.round(((result.targetKcal*result.targetCarbs/100)/4 + Number.EPSILON) * 100) / 100;
            let response;
            if (result.targetKcal && result.targetProtein && result.targetFat && result.targetCarbs){
                response = {
                    "data": {
                        "targetKcal": result.targetKcal,
                        "targetProtein": result.targetProtein,
                        "targetFat": result.targetFat,
                        "targetCarbs": result.targetCarbs,
                        "proteinAmount": proteinAmount,
                        "fatAmount": fatAmount,
                        "carbsAmount": carbsAmount
                    }
                }                
            }else{
                response = {
                    "data": null
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
        });
    }
})

module.exports = targetRouter