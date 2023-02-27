const pool = require("../database")

const photoModel = {
    addAvatar: async(userID, cloudFrontUrl) => {
        const conn = await pool.getConnection();
        try{
            const data = [cloudFrontUrl, userID];
            await conn.query("UPDATE user SET avatar = ? WHERE userID = ?", data);
        }finally{
            conn.release();
        }
    },
    getAvatar: async(userID) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT avatar FROM user WHERE userID = ?", [userID]);
            return result
        }finally{
            conn.release();
        }
    },
    addMealPhoto: async(mealRecordID, mealCloudFrontUrl) => {
        const conn = await pool.getConnection();
        try{
            const data = [mealRecordID, mealCloudFrontUrl];
            await conn.query("INSERT INTO mealPhoto(mealRecordID, photo) VALUES (?, ?)", data);
        }finally{
            conn.release();
        }
    },
    getMealPhoto: async(mealRecordID) => {
        const conn = await pool.getConnection();
        try{
            const [result] = await conn.query("SELECT mealPhotoID, photo FROM mealPhoto WHERE mealRecordID = ?", [mealRecordID]);
            return result
        }finally{
            conn.release();
        }
    },
    deleteMealPhoto: async(deleteMealPhotoID) => {
        const conn = await pool.getConnection();
        try{
            const sql = "DELETE FROM mealPhoto WHERE mealPhotoID = ?";
            await conn.query(sql, [deleteMealPhotoID]);
        }finally{
            conn.release();
        }
    }
}

module.exports = photoModel