const express = require("express");
const intakeRouter = express.Router();  
const mealRecordModel = require("../model/mealRecord");
const intakeModel = require("../model/intake");
const foodModel = require("../model/food");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

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
            }else if(Number(amount) <= 0){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter correct amount of food."
                }); 
            }else if(isNaN(amount)){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Please enter correct amount of food."
                }); 
            }else{
                const foodResult = await foodModel.searchIfFoodExist(userID, foodName);
                if(foodResult){
                    let mealRecordID;
                    let mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
                    if (mealRecordIDSearch == undefined){
                        await mealRecordModel.addMealRecord(userID, date, meal);
                        mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
                    }
                    mealRecordID = mealRecordIDSearch.mealRecordID;
                    await intakeModel.addFoodIntake(mealRecordID, foodName, amount);
                    const result = await intakeModel.searchMealIntake(mealRecordID);
                    let allData=[];
                    let response;
                    if(result[0]){
                        await responseMealData(result, allData);
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
            let mealRecordID;
            let allData=[];
            let response;
            let mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
            if (mealRecordIDSearch){
                mealRecordID = mealRecordIDSearch.mealRecordID;
                const result = await intakeModel.searchMealIntake(mealRecordID);
                if(result[0]){
                    await responseMealData(result, allData);
                    response = {
                        "data": allData
                    }
                }else{
                    response= {
                        "data": null
                    }
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
            const deleteIntakeID = req.body.intakeID;
            await intakeModel.deleteIntakeFood(deleteIntakeID);
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

// get daily & week intake data
intakeRouter.get("/daily", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const date = req.query.date || "";
            const weekDates = await findWeeklyDate(date);
            const daily = await calculateDailyIntake(userID, date);
            let weekKcal = [];
            let weekProteinPercentage = [];
            let weekFatPercentage  = [];
            let weekCarbsPercentage  = [];
            for(let i = 0; i < weekDates.length ;i++){
                const daily = await calculateDailyIntake(userID, weekDates[i]);
                if(daily){
                    weekKcal.push(daily.totalKcal);
                    weekProteinPercentage.push(daily.proteinPercentage);
                    weekFatPercentage.push(daily.fatPercentage);
                    weekCarbsPercentage.push(daily.carbsPercentage);
                }else{
                    weekKcal.push(0);
                    weekProteinPercentage.push(0);
                    weekFatPercentage.push(0);
                    weekCarbsPercentage.push(0);
                }
            }
            response = {
                "data": {
                    "daily": daily,
                    "week": {
                        "weekDates": weekDates,
                        "weekKcal": weekKcal,
                        "weekProteinPercentage": weekProteinPercentage,
                        "weekFatPercentage": weekFatPercentage,
                        "weekCarbsPercentage": weekCarbsPercentage
                    }
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

async function responseMealData(result, allData){
    for(let i=0; i<result.length ;i++){
        let protein;
        let fat;
        let carbs;
        let kcal;
        protein = Math.round(((result[i].amount/100)*result[i].protein + Number.EPSILON) * 100) / 100,
        fat = Math.round(((result[i].amount/100)*result[i].fat + Number.EPSILON) * 100) / 100,
        carbs = Math.round(((result[i].amount/100)*result[i].carbs + Number.EPSILON) * 100) / 100,
        kcal = Math.round(((result[i].amount/100)*result[i].kcal + Number.EPSILON) * 10) / 10
        const oneData = {
            "userID": result[i].userID,
            "date": result[i].date,
            "intakeID": result[i].intakeID,
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

async function findWeeklyDate(date){
    // 將選擇的日期轉換為 Date 物件
    const intakeDate = new Date(date.slice(0, 4), date.slice(4, 6)-1, date.slice(6));
    // 依次取得往前七天的日期
    let dates = [];
    for(let i = 0; i < 7; i++){
        const currentDate = new Date(intakeDate.getTime() - i * 24 * 60 * 60 * 1000);
        const formattedDate = currentDate.getFullYear().toString() + amendZero(currentDate.getMonth() + 1) + amendZero(currentDate.getDate());
        dates.push(formattedDate);
    }
    function amendZero(number) {
        if(number < 10){
            return "0" + number.toString();
        }else{
            return number.toString();
        }
    }
    dates.reverse();
    return dates
}

async function calculateDailyIntake(userID, date){
    let daily;
    const dailyMealRecordID = await mealRecordModel.searchDailyRecord(userID, date);
    let response;
    let dailyMealRecordIDList = [];
    if(dailyMealRecordID[0]){
        for(let x=0 ; x < dailyMealRecordID.length ; x++){
            dailyMealRecordIDList.push(dailyMealRecordID[x].mealRecordID);
        }
        const result = await intakeModel.searchDailyIntake(dailyMealRecordIDList);
        if(result[0]){
            let totalKcal = 0;
            let totalProtein = 0;
            let totalFat = 0;
            let totalCarbs = 0;
            let protein;
            let fat;
            let carbs;
            let kcal;
            for(let i=0 ; i < result.length ; i++){
                protein = (result[i].amount/100)*result[i].protein;
                fat = (result[i].amount/100)*result[i].fat;
                carbs = (result[i].amount/100)*result[i].carbs;
                kcal = (result[i].amount/100)*result[i].kcal;                    
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
            daily = {
                "totalProtein":totalProtein,
                "totalFat":totalFat,
                "totalCarbs":totalCarbs,
                "totalKcal":totalKcal,
                "proteinPercentage":proteinPercentage,
                "fatPercentage": fatPercentage,
                "carbsPercentage":carbsPercentage
            };
        }else{
            daily = null;
        }
    }else{
        daily = null;
    }
    return daily
}

module.exports = intakeRouter