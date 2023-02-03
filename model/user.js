const pool = require("../database")

const userModel = {
    checkSignupEmail: async(email) => {
        const conn = await pool.getConnection()
        try{
            const [[result]] = await conn.query("SELECT email FROM user WHERE email=?",[email])
            return result
        }finally{
            conn.release()
        }
    },
    signup: async(name, email, pwHash) => {
        const conn = await pool.getConnection()
        try{
            const newData = [name, email, pwHash]
            await conn.query("INSERT INTO user(name, email, password) VALUES (?, ?, ?)",newData)
        }finally{
            conn.release()
        }
    },
    signin: async(email) => {
        const conn = await pool.getConnection()
        try{
            const [[result]] = await conn.query("SELECT userID, name, email, password FROM user WHERE email=?",[email])
            return result
        }finally{
            conn.release()
        }
    }
}
module.exports = userModel 