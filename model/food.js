const pool = require("../database")

const foodModel = {
    searchPublicFood: async(foodNameInput) => {
        const conn = await pool.getConnection();
        try{
            const [result] = await conn.query("SELECT name FROM food WHERE name LIKE ? ORDER BY name DESC",[`%${foodNameInput}%`]);
            return result
        }finally{
            conn.release();
        }
    },
    searchOwnFood: async(userID, foodNameInput) => {
        const conn = await pool.getConnection();
        try{
            const ownFoodData = [userID, `%${foodNameInput}%`]
            const [result] = await conn.query("SELECT name FROM userFood WHERE userID = ? AND name LIKE ? ", ownFoodData);
            return result
        }finally{
            conn.release();
        }
    },
    searchIfPublicFoodExist:async(foodName) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT name FROM food WHERE name = ?",[foodName])
            return result
        }finally{
            conn.release();
        }
    },
    searchIfOwnFoodExist:async(foodName) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT name FROM userFood WHERE name = ?",[foodName])
            return result
        }finally{
            conn.release();
        }
    },
    addNewFood: async(userID, name, kcal, protein, fat, carbs) => {
        const conn = await pool.getConnection();
        try{
            const newFoodData = [userID, name, kcal, protein, fat, carbs]
            await conn.query("INSERT INTO userFood(userID, name, kcal, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?)", newFoodData);
        }finally{
            conn.release();
        }
    },
    searchOwnAllFood:async(userID) => {
        const conn = await pool.getConnection();
        try{
            const [result] = await conn.query("SELECT * FROM userFood WHERE userID = ?",[userID])
            return result
        }finally{
            conn.release();
        }
    },
    deleteOwnFood:async(userID, foodName) => {
        const conn = await pool.getConnection();
        try{
            const deleteOwnFoodData = [userID, foodName];
            const sql = "DELETE FROM userFood WHERE userID = ? AND name = ?";
            await conn.query(sql, deleteOwnFoodData);
        }finally{
            conn.release();
        }
    },
}

module.exports = foodModel