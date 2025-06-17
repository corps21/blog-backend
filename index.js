import express from 'express'
import connectDb from "./connectDb.js"
import { configDotenv } from 'dotenv'
import { userRouter, healthRouter } from './routes/index.js'
const app = express()
configDotenv({
    path: './.env'
})
const connection = connectDb(process.env.MONGODB_URI, process.env.MONGODB_PASS)

// global middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routes
app.use("/api/v1/health", healthRouter)
app.use("/api/v1/user",userRouter)

// connecting database
connection().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server starting at http://localhost:${process.env.PORT || 8000}`)
    })
}).catch(err => console.log("Error while making connection to database ", err))

