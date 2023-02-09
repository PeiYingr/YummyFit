const pool = require("../database")

const targetModel = {
    updateTarget: async(userID, targetKcal, targetProtein, targetFat, targetCarbs) => {
        const conn = await pool.getConnection()
        try{
            const targetData = [targetKcal, targetProtein, targetFat, targetCarbs, userID]
            const sql = `
            UPDATE user 
                SET targetKcal = ?, targetProtein = ?, targetFat = ?, targetCarbs = ?
            WHERE userID = ?
            `;
            await conn.query(sql , targetData);
        }finally{
            conn.release()
        }
    },
    getTarget: async(userID) => {
        const conn = await pool.getConnection();
        try{
            const [[result]] = await conn.query("SELECT targetKcal, targetProtein, targetFat, targetCarbs FROM user WHERE userID = ?", [userID]);
            return result
        }finally{
            conn.release();
        }
    }

}

module.exports = targetModel