const express = require("express");
const intakeRouter = express.Router();  
const intakeModel = require("../model/intake");
const foodModel = require("../model/food");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

function responseMealData(result, allData){
    for(let i=0; i<result.length ;i++){
        let protein;
        let fat;
        let carbs;
        let kcal;
        if(result[i].kcal){
            protein = Math.round(((result[i].amount/100)*result[i].protein + Number.EPSILON) * 100) / 100,
            fat = Math.round(((result[i].amount/100)*result[i].fat + Number.EPSILON) * 100) / 100,
            carbs = Math.round(((result[i].amount/100)*result[i].carbs + Number.EPSILON) * 100) / 100,
            kcal = Math.round(((result[i].amount/100)*result[i].kcal + Number.EPSILON) * 10) / 10
        }else{
            protein = Math.round(((result[i].amount/100)*result[i].userFoodProtein + Number.EPSILON) * 100) / 100,
            fat = Math.round(((result[i].amount/100)*result[i].userFoodFat + Number.EPSILON) * 100) / 100,
            carbs = Math.round(((result[i].amount/100)*result[i].userFoodCarbs + Number.EPSILON) * 100) / 100,
            kcal = Math.round(((result[i].amount/100)*result[i].userFoodKcal + Number.EPSILON) * 10) / 10
        }
        const oneData = {
            "userID": result[i].userID,
            "date": result[i].date,
            "foodName": result[i].foodName,
            "amount": result[i].amount,
            "protein": protein,
            "fat": fat,
            "carbs": carbs,
            "kcal": kcal
        }
        allData.push(oneData);
    };
}

// add food intake data
intakeRouter.post("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const intakeInfo = req.body;
            const date = intakeInfo.date;
            const meal = intakeInfo.meal;
            const foodName = intakeInfo.foodName;
            const amount = intakeInfo.amount;
            if (foodName == "" || amount == ""){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter name and amount of food."
                }); 
            }else if(Number(amount)<0){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter correct amount of food."
                }); 
            }else{
                const publicResult = await foodModel.searchIfPublicFoodExist(foodName);
                const ownResult = await foodModel.searchIfOwnFoodExist(foodName);
                if(publicResult || ownResult){
                    await intakeModel.addFoodIntake(userID, date, meal, foodName, amount);
                    const result = await intakeModel.searchMealIntake(userID, date, meal);
                    let allData=[];
                    let response;
                    if(result[0]){
                        responseMealData(result, allData);
                        response = {
                            "data": allData
                        }
                    }else{
                        response= {
                            "data": null
                        }
                    }
                    res.status(200).json(response);              
                }else{
                    res.status(400).json({
                        "error": true,
                        "message": "Food data not exist."
                    });
                }
            }
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied.Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
})

// get meal intake data
intakeRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const meal = req.query.meal || "";
            const date = req.query.date || "";
            const result = await intakeModel.searchMealIntake(userID, date, meal);
            let allData=[];
            let response;
            if(result[0]){
                responseMealData(result, allData);
                response = {
                    "data": allData
                }
            }else{
                response= {
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
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

// delete food intake data
intakeRouter.delete("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const deleteIntakeInfo = req.body;
            const date = deleteIntakeInfo.date;
            const meal = deleteIntakeInfo.meal;
            const foodName = deleteIntakeInfo.foodName;
            const amount = deleteIntakeInfo.amount;
            await intakeModel.deleteIntakeFood(userID, date, meal, foodName, amount);
            let response= {
                "ok": true
            }
            res.status(200).json(response);        
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied.Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

// get daily intake data
intakeRouter.get("/daily", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const date = req.query.date || "";
            const result = await intakeModel.searchDailyIntake(userID, date);
            let response;
            if(result[0]){
                let totalKcal = 0;
                let totalProtein = 0;
                let totalFat = 0;
                let totalCarbs = 0;
                let protein;
                let fat;
                let carbs;
                let kcal;
                for(let i=0; i<result.length ;i++){
                    if(result[i].kcal){
                        protein = (result[i].amount/100)*result[i].protein;
                        fat = (result[i].amount/100)*result[i].fat;
                        carbs = (result[i].amount/100)*result[i].carbs;
                        kcal = (result[i].amount/100)*result[i].kcal;                    
                    }else{
                        protein = (result[i].amount/100)*result[i].userFoodProtein;
                        fat = (result[i].amount/100)*result[i].userFoodFat;
                        carbs = (result[i].amount/100)*result[i].userFoodCarbs;
                        kcal = (result[i].amount/100)*result[i].userFoodKcal;   
                    }
                    totalProtein = totalProtein + protein;
                    totalFat = totalFat + fat;
                    totalCarbs = totalCarbs + carbs;
                    totalKcal = totalKcal + kcal;
                };
                totalProtein = Math.round((totalProtein + Number.EPSILON) * 100) / 100;
                totalFat = Math.round((totalFat + Number.EPSILON)* 100) / 100;
                totalCarbs = Math.round((totalCarbs + Number.EPSILON)* 100) / 100;
                totalKcal = Math.round(totalKcal);
                const proteinPercentage = Math.round((totalProtein*4/totalKcal)*100);
                const fatPercentage = Math.round((totalFat*9/totalKcal)*100);
                const carbsPercentage = 100 - proteinPercentage - fatPercentage;      
                response = {
                    "data": {
                        "totalProtein":totalProtein,
                        "totalFat":totalFat,
                        "totalCarbs":totalCarbs,
                        "totalKcal":totalKcal,
                        "proteinPercentage":proteinPercentage,
                        "fatPercentage": fatPercentage,
                        "carbsPercentage":carbsPercentage
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
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

module.exports = intakeRouter