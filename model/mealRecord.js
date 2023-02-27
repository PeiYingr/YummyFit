const pool = require("../database")

const mealRecordModel = {
    searchMealRecord:async(userID, date, meal) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, date, meal]
            const [[result]] = await conn.query("SELECT mealRecordID FROM mealRecord WHERE userID = ? AND date = ? AND meal = ?", data);
            return result
        }finally{
            conn.release();
        }
    },
    addMealRecord:async(userID, date, meal) => {
        const conn = await pool.getConnection();
        try{
            const newData = [userID, date, meal]
            await conn.query("INSERT INTO mealRecord(userID, date, meal) VALUES (?, ?, ?)", newData);
        }finally{
            conn.release();
        }
    },
    searchDailyRecord:async(userID, date) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, date]
            const [result] = await conn.query("SELECT mealRecordID FROM mealRecord WHERE userID = ? AND date = ?", data);
            return result
        }finally{
            conn.release();
        }
    },
}

module.exports = mealRecordModel