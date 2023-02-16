const pool = require("../database")

const userModel = {
    checkSignupEmail: async(email) => {
        const conn = await pool.getConnection()
        try{
            const [[result]] = await conn.query("SELECT userID, name, email FROM user WHERE email=?",[email])
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
    },
    googleUserSignup: async(name, googleEmail, avatar) => {
        const conn = await pool.getConnection()
        try{
            const newData = [name, googleEmail, avatar]
            await conn.query("INSERT INTO user(name, email, avatar) VALUES (?, ?, ?)", newData)
        }finally{
            conn.release()
        }
    },
    googleUserUpdate: async(name, googleEmail) => {
        const conn = await pool.getConnection()
        try{
            const data = [name, googleEmail]
            await conn.query("UPDATE user SET name = ? WHERE email = ?", data)
        }finally{
            conn.release()
        }
    }
}
module.exports = userModel 