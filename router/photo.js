const express = require("express");
const photoRouter = express.Router();  
const photoModel = require("../model/photo");
const multer = require("multer");
const AWS = require("aws-sdk");
// Create a token generator with the default settings:
const randtoken = require("rand-token");
const jwt = require("jsonwebtoken");
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
let cloudFrontUrl;
photoRouter.post("/avatar", upload.single("image"), async(req, res) => {
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
                    }else{;
                        cloudFrontUrl = data.Location.replace("https://peiprojectbucket.s3.amazonaws.com","http://dle57qor2pt0d.cloudfront.net");
                        cloudFrontUrl = cloudFrontUrl.replace("https://peiprojectbucket.s3.us-west-2.amazonaws.com","http://dle57qor2pt0d.cloudfront.net");
                        await photoModel.addAvatar(userID, cloudFrontUrl);
                        let response = {
                            "data": cloudFrontUrl
                        }
                        res.status(200).json(response);
                    }
                });       
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
                "message": "Access Denied.Please Login."
            });        
        } 
    }catch{
        return res.status(500).json({ 			
            "error": true,
            "message": "Server error" 
        });
    }
});

module.exports = photoRouter