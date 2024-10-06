import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT

export const DB_STRING = process.env.NODE_ENV==='test'
    ?process.env.TEST_MONGO_URI
    :process.env.DB_STRING


export const JWT_SECRET=process.env.TOKEN_SECRET