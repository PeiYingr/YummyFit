const express = require("express");
const foodRouter = express.Router();    //產生router物件，存入變數
const foodModel = require("../model/food");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

// fuzzy match(search) of public & own food
foodRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const foodNameInput = req.query.keyword || "";
            if(foodNameInput !== " "){
                const token = cookie.replace("token=","");
                const userCookie = jwt.verify(token, JwtSecret);
                const userID = userCookie.userID;
                const publicResult = await foodModel.searchPublicFood(foodNameInput);
                const ownResult = await foodModel.searchOwnFood(userID, foodNameInput);
                const result = publicResult.concat(ownResult);
                if (result[0]){
                    res.status(200).json(result);
                }else{
                    res.status(200).json({ 			
                        "error": true,
                        "message": "No Data"
                    });
                }
            }else{
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter food name"
                });  
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
        })
    }
})

//add new(own) food to data
foodRouter.post("/userfood", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const newFoodInfo = req.body;
            const name = newFoodInfo.name;
            const protein = newFoodInfo.protein;
            const fat = newFoodInfo.fat;
            const carbs = newFoodInfo.carbs;
            if( name == "" || protein == "" || fat == "" || carbs == "" ){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter new food information incompletely."
                });  
            }else if(Number(protein)<0 || Number(fat)<0 || Number(carbs)<0){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Enter correct amount of nutrients."
                }); 
            }else{
                const publicResult = await foodModel.searchIfPublicFoodExist(name);
                const ownResult = await foodModel.searchIfOwnFoodExist(name);
                if(publicResult || ownResult){
                    res.status(400).json({
                        "error": true,
                        "message": "Already have the same food name."
                    });
                }else{
                    const kcal = protein*4 + carbs*4 + fat*9;
                    await foodModel.addNewFood(userID, name, kcal, protein, fat, carbs);
                    res.status(200).json({
                        "ok": true
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
        })
    }
})

//get own food data
foodRouter.get("/userfood", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const result = await foodModel.searchOwnAllFood(userID);
            let response;
            if(result[0]){
                response = {
                    "data": result
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

// delete own food data
foodRouter.delete("/userfood", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const deleteIntakeInfo = req.body;
            const foodName = deleteIntakeInfo.foodName;
            await foodModel.deleteOwnFood(userID, foodName);
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

module.exports = foodRouter