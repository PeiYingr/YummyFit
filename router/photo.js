const express = require("express");
const photoRouter = express.Router();
const mealRecordModel = require("../model/mealRecord");
const photoModel = require("../model/photo");
const multer = require("multer");
const AWS = require("aws-sdk");
// Create a token generator with the default settings:
const randtoken = require("rand-token");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

// 設定 AWS 的訪問金鑰與區域
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
// 建立 S3 物件
const s3 = new AWS.S3();
// 設定 Multer
const upload = multer();

// avatar uploads(update)
let avatarCloudFrontUrl;
photoRouter.patch("/avatar", upload.single("image"), async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const image = req.file; // 取得上傳的照片
            if(image == null){
                res.status(400).json({ 			
                    "error": true,
                    "message": "No file selected." 
                });
            }else{
                // Generate a 32 character alpha-numeric token as file name
                const token = randtoken.generate(32);
                // 設定 S3 物件的參數
                const params = {
                    Bucket: "peiprojectbucket",
                    Key: "avatar/" + token,  // S3 folder name + file name(檔案名稱)
                    Body: image.buffer,       // 檔案內容
                    ContentType: image.mimetype,  // 檔案類型
                };
                s3.upload(params, async(err, data) => {
                    if(err){
                        res.status(500).json({ error: err });
                    }else{
                        avatarCloudFrontUrl = data.Location.replace("https://peiprojectbucket.s3.amazonaws.com","https://dle57qor2pt0d.cloudfront.net");
                        avatarCloudFrontUrl = avatarCloudFrontUrl.replace("https://peiprojectbucket.s3.us-west-2.amazonaws.com","https://dle57qor2pt0d.cloudfront.net");
                        await photoModel.addAvatar(userID, avatarCloudFrontUrl);
                        let response = {
                            "data": avatarCloudFrontUrl
                        }
                        res.status(200).json(response);
                    }
                });       
            }  
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied. Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

// get avatar
photoRouter.get("/avatar", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const result = await photoModel.getAvatar(userID);
            let response;
            if (result){
                response = {
                    "data": result.avatar
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
                "message": "Access Denied. Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

// meal photo uploads
let mealCloudFrontUrl;
photoRouter.post("/meal", upload.array("images", 3), async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const imageFiles = req.files; // 取得上傳的照片
            const date = req.body.date;  // 哪一餐
            const meal = req.body.whichMeal;  // 哪一餐
            if(imageFiles[0] == null){
                res.status(400).json({ 			
                    "error": true,
                    "message": "No file selected." 
                });
            }else{
                let mealRecordID;
                handleUploads(req, res)
                async function handleUploads(req, res) {
                    await uploadFiles(imageFiles);
                    const result = await photoModel.getMealPhoto(mealRecordID);
                    let response;
                    if (result[0]) {
                        response = {
                            "data": result,
                        };
                    } else {
                        response = {
                            "data": null,
                        };
                    }
                    res.status(200).json(response);
                }
                async function uploadFiles(imageFiles) {
                    let mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
                    if (mealRecordIDSearch == undefined){
                        await mealRecordModel.addMealRecord(userID, date, meal);
                        mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
                    }
                    mealRecordID = mealRecordIDSearch.mealRecordID;                    
                    let promises = [];
                    for (let i = 0; i < imageFiles.length; i++) {
                        // Generate a 32 character alpha-numeric token as file name
                        const token = randtoken.generate(32);
                        // 設定 S3 物件的參數
                        const params = {
                            Bucket: "peiprojectbucket",
                            Key: "userMeal/" + token, // S3 folder name + file name(檔案名稱)
                            Body: imageFiles[i].buffer, // 檔案內容
                            ContentType: imageFiles[i].mimetype, // 檔案類型
                        };
                        promises.push(
                            new Promise(async (resolve, reject) => {
                                try{
                                    const data = await s3.upload(params).promise();
                                    mealCloudFrontUrl = data.Location.replace(
                                        "https://peiprojectbucket.s3.amazonaws.com",
                                        "https://dle57qor2pt0d.cloudfront.net"
                                    );
                                    mealCloudFrontUrl = mealCloudFrontUrl.replace(
                                        "https://peiprojectbucket.s3.us-west-2.amazonaws.com",
                                        "https://dle57qor2pt0d.cloudfront.net"
                                    );
                                    await photoModel.addMealPhoto(mealRecordID, mealCloudFrontUrl);
                                    resolve(mealCloudFrontUrl);
                                }catch (error) {
                                    reject(error);
                                }
                            })
                        );
                    }
                    return Promise.all(promises);
                }
            }  
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied. Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

// meal photo
photoRouter.get("/meal", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const meal = req.query.meal || "";
            const date = req.query.date || "";
            let mealRecordID;
            let response;
            let mealRecordIDSearch = await mealRecordModel.searchMealRecord(userID, date, meal);
            if (mealRecordIDSearch){
                mealRecordID = mealRecordIDSearch.mealRecordID;
                const result = await photoModel.getMealPhoto(mealRecordID);
                if (result[0]) {
                    response = {
                        "data": result,
                    };
                } else {
                    response = {
                        "data": null,
                    };
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
                "message": "Access Denied. Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

// delete meal photo
photoRouter.delete("/meal", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const deleteMealPhotoID = req.query.mealPhotoID || "";
            const mealPhotoUserID = await photoModel.findUserID(deleteMealPhotoID);
            if(userID == mealPhotoUserID.userID){
                await photoModel.deleteMealPhoto(deleteMealPhotoID);
                let response= {
                    "ok": true
                }
                res.status(200).json(response);   
            }else{
                res.status(400).json({
                    "error": true,
                    "message": "The meal photo does not exist or does not belong to this member."
                }); 
            }
        }else{
            res.status(403).json({
                "error": true,
                "message": "Access Denied. Please Login."
            });        
        } 
    }catch{
        res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        })
    }
})

module.exports = photoRouter