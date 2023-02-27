const pool = require("../database")

const postModel = {
    addPostInfo: async(userID, postForumID, dateTime, postText, location) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, postForumID, dateTime, postText, location];
            await conn.query("INSERT INTO post(userID, postForumID, dateTime, postText, location) VALUES (?, ?, ?, ?, ?)", data);
        }finally{
            conn.release();
        }
    },
    addPostPhoto: async(postID, postCloudFrontUrl) => {
        const conn = await pool.getConnection();
        try{
            const data = [postID, postCloudFrontUrl];
            await conn.query("INSERT INTO postPhoto(postID, photo) VALUES (?, ?)", data);
        }finally{
            conn.release();
        }
    },
    addComment:async(commentPostID, commentUserID, commentDateTime, commentText) => {
        const conn = await pool.getConnection();
        try{
            const data = [commentPostID, commentUserID, commentDateTime, commentText]
            await conn.query("INSERT INTO postComment(postID, userID, dateTime, commentText) VALUES (?, ?, ?, ?)", data);
        }finally{
            conn.release();
        }
    },
    getPostID: async(userID, dateTime) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, dateTime]
            const [[result]] = await conn.query("SELECT postID FROM post WHERE userID = ? AND dateTime = ?", data);
            return result
        }finally{
            conn.release();
        }
    },
    getPostPhoto: async(postID) => {
        const conn = await pool.getConnection();
        try{
            const [result] = await conn.query("SELECT photo FROM postPhoto WHERE postID = ?", [postID]);
            return result
        }finally{
            conn.release();
        }
    },
    getAllPosts: async() => {
        const conn = await pool.getConnection();
        try{
            const sql = `
            SELECT
                post.postID, post.userID AS postUserID, post.dateTime AS postDateTime,
                post.postText, post.location, post.likes, postForum.forum,
                user.name AS postUserName, user.avatar AS postUserAvatar
            FROM post
            INNER JOIN postForum ON post.postForumID = postForum.forumID
            INNER JOIN user ON post.userID = user.userID
            ORDER BY post.postID DESC
            `;
            const [result] = await conn.query(sql);
            return result
        }finally{
            conn.release();
        }
    },
    getChooseForumPosts: async(forum) => {
        const conn = await pool.getConnection();
        try{
            const sql = `
            SELECT
                post.postID, post.userID AS postUserID, post.dateTime AS postDateTime,
                post.postText, post.location, post.likes, postForum.forum,
                user.name AS postUserName, user.avatar AS postUserAvatar
            FROM post
            INNER JOIN postForum ON post.postForumID = postForum.forumID
            INNER JOIN user ON post.userID = user.userID
            WHERE postForum.forumID = ?
            ORDER BY post.dateTime DESC
            `;
            const [result] = await conn.query(sql, [forum]);
            return result
        }finally{
            conn.release();
        }
    },
    getAllComments: async(postID) => {
        const conn = await pool.getConnection();
        try{
            const sql = `
            SELECT
                postComment.commentID, postComment.userID AS postCommentUserID, postComment.dateTime AS postCommentDateTime, 
                postComment.commentText, user.name AS postCommentUserName, user.avatar AS postCommentAvatar
            FROM postComment
            INNER JOIN user ON postComment.userID = user.userID
            WHERE postID = ?
            `;
            const [result] = await conn.query(sql, [postID]);
            return result
        }finally{
            conn.release();
        }
    },
    searchForum:async(postForumID) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT forum FROM postForum WHERE forumID = ?", [postForumID]);
            return result
        }finally{
            conn.release();
        }
    },
    deletePost: async(deletePostID) => {
        const conn = await pool.getConnection();
        try{
            const deletePostPhoto = "DELETE FROM postPhoto WHERE postID = ?";
            await conn.query(deletePostPhoto, [deletePostID]);
            const deletePostComment = "DELETE FROM postComment WHERE postID = ?";
            await conn.query(deletePostComment, [deletePostID]);
            const deletePost = "DELETE FROM post WHERE postID = ?";
            await conn.query(deletePost, [deletePostID]);
        }finally{
            conn.release();
        }
    },
    deleteComment: async(deleteCommentID) => {
        const conn = await pool.getConnection();
        try{
            const deletePostComment = "DELETE FROM postComment WHERE commentID = ?";
            await conn.query(deletePostComment, [deleteCommentID]);
        }finally{
            conn.release();
        }
    }
}

module.exports = postModel
