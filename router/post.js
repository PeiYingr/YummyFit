const express = require("express");
const postRouter = express.Router();
const postModel = require("../model/post");
const photoModel = require("../model/photo");
const multer = require("multer");
const AWS = require("aws-sdk");
// Create a token generator with the default settings:
const randtoken = require("rand-token");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });
const JwtSecret = process.env.JWT_SECRET_KEY;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEYID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
const s3 = new AWS.S3();
const upload = multer();

//add new post
let postCloudFrontUrl;
postRouter.post("/", upload.array("images", 3), async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const userName = userCookie.name;
            const imageFiles = req.files;
            const dateTime = req.body.dateTime;
            const postForumID = req.body.forum;
            const postText = req.body.postText;
            const location = req.body.location;
            if(postText == ""){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Post text can't be empty!"
                });
            }else{
                let avatar;
                const avatarResult = await photoModel.getAvatar(userID);
                if (avatarResult){
                    avatar = avatarResult.avatar
                }else{
                    avatar = null;
                }
                await postModel.addPostInfo(userID, postForumID, dateTime, postText, location);
                const postIDResult = await postModel.getPostID(userID, dateTime);
                const postID = postIDResult.postID;
                const postForum = await postModel.searchForum(postForumID);
                if(imageFiles[0]){
                    handleUploads(req, res)
                    async function handleUploads(req, res) {
                        await uploadFiles(imageFiles, postID);
                        const postPhoto = await postModel.getPostPhoto(postID);
                        let response = {
                            "data": {
                                "userID": userID,
                                "postID": postID,
                                "postUserID": userID,
                                "postUserAvatar": avatar,
                                "postUserName": userName,
                                "postDateIime": dateTime,
                                "postForum": postForum,
                                "postText": postText,
                                "postLocation": location,
                                "postPhoto": postPhoto
                            }
                        };
                        res.status(200).json(response);
                    }
                    async function uploadFiles(imageFiles ,postID) {
                        let promises = [];
                        for (let i = 0; i < imageFiles.length; i++) {
                            // Generate a 32 character alpha-numeric token as file name
                            const token = randtoken.generate(32);
                            const params = {
                                Bucket: "peiprojectbucket",
                                Key: "userPost/" + token, // S3 folder name + file name(檔案名稱)
                                Body: imageFiles[i].buffer, // 檔案內容
                                ContentType: imageFiles[i].mimetype, // 檔案類型
                            };
                            promises.push(
                                new Promise(async (resolve, reject) => {
                                    try{
                                        const data = await s3.upload(params).promise();
                                        postCloudFrontUrl = data.Location.replace(
                                            "https://peiprojectbucket.s3.amazonaws.com",
                                            "https://dle57qor2pt0d.cloudfront.net"
                                        );
                                        postCloudFrontUrl = postCloudFrontUrl.replace(
                                            "https://peiprojectbucket.s3.us-west-2.amazonaws.com",
                                            "https://dle57qor2pt0d.cloudfront.net"
                                        );
                                        await postModel.addPostPhoto(postID, postCloudFrontUrl);
                                        resolve(postCloudFrontUrl);
                                    }catch (error) {
                                        reject(error);
                                    }
                                })
                            );
                        }
                        return Promise.all(promises);
                    }
                }else{
                    let response = {
                        "data": {
                            "userID": userID,
                            "postID": postID,
                            "postUserID": userID,
                            "postUserAvatar": avatar,
                            "postUserName": userName,
                            "postDateIime": dateTime,
                            "postForum": postForum,
                            "postText": postText,
                            "postLocation": location,
                        }
                    };
                    res.status(200).json(response);
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

// get post, comment, like data
postRouter.get("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const forum = req.query.forum || "";
            let postPage = req.query.postPage || 0;
            postPage = Number(postPage);
            let nextPostPage;
            let postInfo;
            let allData=[];
            let response;
            if(forum == "all"){
                postInfo = await postModel.getAllPosts(postPage);
            }else{
                postInfo = await postModel.getChooseForumPosts(forum, postPage);
            }
            if(postInfo[0]){
                if(postInfo.length > 3){
                    nextPostPage = postPage + 1;
                    postInfo = postInfo.slice(0, 3)
                }else{
                    nextPostPage = null;
                }
                await getPostData(userID, postInfo, allData);
                response = {
                    "nextPostPage":nextPostPage,
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

// delete post data
postRouter.delete("/", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const deletePostID = req.query.postID || "";
            const postUserID = await postModel.findPostUserID(deletePostID);
            if(userID == postUserID.userID){
                await postModel.deletePost(deletePostID);
                let response= {
                    "ok": true
                }
                res.status(200).json(response);   
            }else{
                res.status(400).json({
                    "error": true,
                    "message": "The post does not exist or does not belong to this member."
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

//add new comment
postRouter.post("/comment", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const commentUserID = userCookie.userID;
            const commentInfo = req.body;
            const commentPostID = commentInfo.postID;
            const commentText = commentInfo.comment;
            const commentDateTime = commentInfo.dateTime;
            if(commentText == ""){
                res.status(400).json({ 			
                    "error": true,
                    "message": "Comment text can't be empty!"
                }); 
            }else{
                let response;
                await postModel.addComment(commentPostID, commentUserID, commentDateTime, commentText);
                const result =  await postModel.getAllComments(commentPostID);
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

// delete comment data
postRouter.delete("/comment", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const commentPostID = req.query.postID || "";
            const deleteCommentID = req.query.commentID || "";
            const commentUserID = await postModel.findCommentUserID(deleteCommentID);
            if(userID == commentUserID.userID){
                await postModel.deleteComment(deleteCommentID);
                const result =  await postModel.getAllComments(commentPostID);
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
                res.status(400).json({
                    "error": true,
                    "message": "The comment does not exist or does not belong to this member."
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

//add new like
postRouter.post("/like", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const likeUserID = userCookie.userID;
            const likePostID = req.body.postID;
            await postModel.addLike(likePostID , likeUserID);
            const result =  await postModel.getAllLikes(likePostID);
            let response;
            if(result[0]){
                response = {
                    "data": result
                }
            }else{
                response = {
                    "data":  null
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
        })
    }
})

// delete like
postRouter.delete("/like", async(req, res) => {
    try{
        const cookie = req.headers.cookie;
        if (cookie){
            const token = cookie.replace("token=","");
            const userCookie = jwt.verify(token, JwtSecret);
            const userID = userCookie.userID;
            const deleteLikePostID = req.query.postID || "";
            const deleteLikeID = req.query.likeID || "";
            const likeUserID = await postModel.findLikeUserID(deleteLikeID);
            if(userID == likeUserID.userID){
                await postModel.deleteLike(deleteLikeID);
                const result =  await postModel.getAllLikes(deleteLikePostID);
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
                res.status(400).json({
                    "error": true,
                    "message": "The like does not exist or does not belong to this member."
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

async function getPostData(userID, postInfo, allData){
    for(let i=0 ;i < postInfo.length ;i++){
        const postPhoto = await postModel.getPostPhoto(postInfo[i].postID);
        let photos;
        if(postPhoto[0]){
            photos = postPhoto;
        }else{
            photos =null;
        }
        const getAllComments = await postModel.getAllComments(postInfo[i].postID);
        let comments;
        if (getAllComments[0]){
            comments = []
            for(let i=0 ;i < getAllComments.length ;i++){
                const oneComment = {
                    "commentID": getAllComments[i].commentID,
                    "postCommentUserID": getAllComments[i].postCommentUserID,
                    "postCommentUserName": getAllComments[i].postCommentUserName,
                    "postCommentDateTime": getAllComments[i].postCommentDateTime,
                    "commentText": getAllComments[i].commentText,
                    "postCommentAvatar": getAllComments[i].postCommentAvatar
                }
                comments.push(oneComment)
            }
        }else{
            comments = null;
        }
        const getAllLikes = await postModel.getAllLikes(postInfo[i].postID);
        let likes;
        if (getAllLikes[0]){
            likes = []
            for(let i=0 ;i < getAllLikes.length ;i++){
                const oneLike = {
                    "postLikeID": getAllLikes[i].postLikeID,
                    "postLikeUserID": getAllLikes[i].postLikeUserID,
                    "postLikeUserName": getAllLikes[i].postLikeUserName,
                    "postLikeAvatar": getAllLikes[i].postLikeAvatar
                }
                likes.push(oneLike)
            }
        }else{
            likes = null;
        }
        const oneData = {
            "userID": userID,
            "postID": postInfo[i].postID,
            "postUserID": postInfo[i].postUserID,
            "postUserAvatar": postInfo[i].postUserAvatar,
            "postUserName": postInfo[i].postUserName,
            "postDateIime": postInfo[i].postDateTime,
            "postForum": postInfo[i].forum,
            "postText": postInfo[i].postText,
            "postLocation": postInfo[i].location,
            "postPhoto": photos,
            "postLike": likes,
            "postComment": comments
        }
        allData.push(oneData);
    }
}

module.exports = postRouter