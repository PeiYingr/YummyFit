const pool = require("../database")

const intakeModel = {    
    addFoodIntake:async(userID, date, meal, foodName, amount) => {
        const conn = await pool.getConnection();
        try{
            const newData = [userID, date, meal, foodName, amount]
            await conn.query("INSERT INTO intake(userID, date, meal, foodName, amount) VALUES (?, ?, ?, ?, ?)",newData);
        }finally{
            conn.release();
        }
    },
    searchMealIntake:async(userID, date, meal) => {
        const conn = await pool.getConnection();
        try{
            const data = [userID, date, meal];
            const sql = `
            SELECT
                intake.userID, intake.date, intake.foodName, intake.amount,
                food.kcal, food.protein, food.fat, food.carbs,
                userFood.kcal AS userFoodKcal, userFood.protein AS userFoodProtein, 
                userFood.fat AS userFoodFat, userFood.carbs AS userFoodCarbs
            FROM intake
            LEFT JOIN food ON food.name = intake.foodName
            LEFT JOIN userFood ON userFood.name = intake.foodName
            WHERE intake.userID = ? AND date = ? AND meal = ?
            `;
            const [result] = await conn.query(sql, data);
            return result
        }finally{
            conn.release();
        }
    },
    deleteIntakeFood:async(userID, date, meal, food, amount) => {
        const conn = await pool.getConnection();
        try{
            const deleteIntakeData = [userID, date, meal, food, amount];
            const sql = "DELETE FROM intake WHERE userID = ? AND date = ? AND meal = ? AND foodName = ? AND amount = ?";
            await conn.query(sql, deleteIntakeData);
        }finally{
            conn.release();
        }
    },
    searchDailyIntake:async(userID, date) => {
        const conn = await pool.getConnection();
        try{
            const dailyIntakeInfo = [userID, date];
            const sql = `
            SELECT
                intake.userID, intake.date, intake.foodName, intake.amount,
                food.kcal, food.protein, food.fat, food.carbs,
                userFood.kcal AS userFoodKcal, userFood.protein AS userFoodProtein, 
                userFood.fat AS userFoodFat, userFood.carbs AS userFoodCarbs
            FROM intake
            LEFT JOIN food ON food.name = intake.foodName
            LEFT JOIN userFood ON userFood.name = intake.foodName
            WHERE intake.userID = ? AND date = ?
            `;
            const [result] = await conn.query(sql, dailyIntakeInfo);
            return result
        }finally{
            conn.release();
        }
    },
}

module.exports = intakeModel