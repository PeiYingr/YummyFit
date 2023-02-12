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
    addMealPhoto: async(userID, date, whichMeal, mealCloudFrontUrl) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, date, whichMeal, mealCloudFrontUrl];
            await conn.query("INSERT INTO mealPhoto(userID, date, meal, photo) VALUES (?, ?, ?, ?)", data);
        }finally{
            conn.release();
        }
    },
    getMealPhoto: async(userID, date, meal) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, date, meal];
            const [result] = await conn.query("SELECT photo FROM mealPhoto WHERE userID = ? AND date = ? AND meal = ?", data);
            return result
        }finally{
            conn.release();
        }
    },
    deleteMealPhoto: async(userID, date, meal, photoUrl) => {
        const conn = await pool.getConnection();
        try{
            const deletePhotoData = [userID, date, meal, photoUrl];
            const sql = "DELETE FROM mealPhoto WHERE userID = ? AND date = ? AND meal = ? AND photo = ?";
            await conn.query(sql, deletePhotoData);
        }finally{
            conn.release();
        }
    }
}

module.exports = photoModel