const pool = require("../database")

const foodModel = {
    searchFood: async(userID, foodNameInput) => {
        const conn = await pool.getConnection();
        try{
            const foodData = [userID, `%${foodNameInput}%`]
            const [result] = await conn.query("SELECT name FROM food WHERE (userID IS NULL OR userID = ?) AND name LIKE ? ", foodData);
            return result
        }finally{
            conn.release();
        }
    },
    searchIfFoodExist:async(userID, foodName) => {
        const conn = await pool.getConnection();
        try{
            const foodData = [userID, foodName]
            const [[result]] = await conn.query("SELECT name FROM food WHERE ((userID IS NULL OR userID = ?)) AND name = ?", foodData)
            return result
        }finally{
            conn.release();
        }
    },
    addNewFood: async(userID, name, kcal, protein, fat, carbs) => {
        const conn = await pool.getConnection();
        try{
            const newFoodData = [userID, name, kcal, protein, fat, carbs]
            await conn.query("INSERT INTO food(userID, name, kcal, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?)", newFoodData);
        }finally{
            conn.release();
        }
    },
    searchOwnAllFood:async(userID) => {
        const conn = await pool.getConnection();
        try{
            const [result] = await conn.query("SELECT * FROM food WHERE userID = ?",[userID])
            return result
        }finally{
            conn.release();
        }
    },
    findThisOwnFoodName:async(deleteFoodID) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT name FROM food WHERE foodID = ?",[deleteFoodID])
            return result
        }finally{
            conn.release();
        }
    },
    deleteOwnFood:async(userID, foodName) => {
        const conn = await pool.getConnection();
        try{
            const deleteOwnFoodData = [userID, foodName];
            const sql = "DELETE FROM food WHERE userID = ? AND name = ?";
            await conn.query(sql, deleteOwnFoodData);
        }finally{
            conn.release();
        }
    },
}

module.exports = foodModel