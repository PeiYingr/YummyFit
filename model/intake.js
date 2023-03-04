const pool = require("../database")

const intakeModel = {
    addFoodIntake:async(mealRecordID, foodName, amount) => {
        const conn = await pool.getConnection();
        try{
            const newData = [mealRecordID, foodName, amount]
            await conn.query("INSERT INTO intake(mealRecordID, foodName, amount) VALUES (?, ?, ?)",newData);
        }finally{
            conn.release();
        }
    },
    searchMealIntake:async(mealRecordID) => {
        const conn = await pool.getConnection();
        try{
            const data = [mealRecordID];
            const sql = `
            SELECT
                mealRecord.userID, mealRecord.date, intake.intakeID, intake.foodName,
                intake.amount, food.kcal, food.protein, food.fat, food.carbs
            FROM intake
            INNER JOIN mealRecord ON mealRecord.mealRecordID = intake.mealRecordID
            INNER JOIN food ON food.name = intake.foodName
            WHERE intake.mealRecordID = ?
            `;
            const [result] = await conn.query(sql, data);
            return result
        }finally{
            conn.release();
        }
    },
    deleteIntakeFood:async(deleteIntakeID) => {
        const conn = await pool.getConnection();
        try{
            const sql = "DELETE FROM intake WHERE intakeID = ?";
            await conn.query(sql, [deleteIntakeID]);
        }finally{
            conn.release();
        }
    },
    searchDailyIntake:async(dailyMealRecordIDList) => {
        const conn = await pool.getConnection();
        try{
            const sql = `
            SELECT
                mealRecord.userID, mealRecord.date, intake.intakeID, intake.foodName,
                intake.amount,food.kcal, food.protein, food.fat, food.carbs
            FROM intake
            INNER JOIN mealRecord ON mealRecord.mealRecordID = intake.mealRecordID
            INNER JOIN food ON food.name = intake.foodName
            WHERE intake.mealRecordID IN (?)
            `;
            const [result] = await conn.query(sql, [dailyMealRecordIDList]);
            return result
        }finally{
            conn.release();
        }
    },
    findThisOwnFoodIntake:async(userID, foodName) => {
        const conn = await pool.getConnection();
        try{
            const findThisOwnFoodData = [userID, foodName];
            const findThisOwnFoodIntakeID = `
            SELECT 
                intakeID
            FROM intake
            INNER JOIN mealRecord ON mealRecord.mealRecordID = intake.mealRecordID
            WHERE mealRecord.userID = ? AND intake.foodName = ?;
            `;
            const [result] = await conn.query(findThisOwnFoodIntakeID,  findThisOwnFoodData);
            return result
        }finally{
            conn.release();
        }
    },
}

module.exports = intakeModel