//load all variables inside .env and store inside object config
import dotenv from 'dotenv'
//load .env variables
dotenv.config();
//save .env variables inside object config
export const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
}