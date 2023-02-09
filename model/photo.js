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
    }
}

module.exports = photoModel