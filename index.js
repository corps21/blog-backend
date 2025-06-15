
const express = require('express')
const app = express()
const port = 3000
const connectDb = require("./connectDb")
const connection = connectDb(`mongodb+srv://spyderauto1234:${process.env.MONGODB_PASS}@cluster0.gxbusxu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

console.log(process.env.MONGODB_PASS)

// connection().then(() => {
//     app.listen(port, () => {
//         console.log(`Sever starting at http://localhost:${port}`)
//     })
// }).catch(err => console.log("Error while making connection to database ", err))

