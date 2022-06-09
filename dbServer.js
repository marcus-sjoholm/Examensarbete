require("dotenv").config()

const mysql = require("mysql")
const { host, userName, password, database, port, startPort } = credentials()
const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const path = require("path")

const dataBase = mysql.createPool({
    connectionLimit: 10,
    host: host,
    user: userName,
    password: password,
    database: database,
    port: port
})


function credentials() {
    const host = process.env.host
    const userName = process.env.userName
    const password = process.env.password
    const database = process.env.database
    const port = process.env.port
    const startPort = process.env.startPort
    return { host, userName, password, database, port, startPort }
}

function errorHandler(error) {
    if (error) throw (error)
}

dataBase.getConnection((error, connection) => {
    errorHandler(error)
    console.log("Database connection was sucessful, thread id: " + connection.threadId)
})

app.use(express.json())

app.listen(startPort,
    () => console.log(`Server started on port: ${startPort}`))

app.get('/', function(request, response){
response.sendFile(path.join(__dirname + '/login.html'))
})

//CREATE USER
app.post("/createUser", async (request, response) => {
    const user = request.body.user
    const cryptPassword = await bcrypt.hash(request.body.password, 10);
    //const password = request.body.password

    dataBase.getConnection(async (error, connection) => {
        errorHandler(error)

        const search = "SELECT * FROM usertable WHERE user = ?"
        const searchQuery = mysql.format(search, [user])

        const insert = "INSERT INTO usertable VALUES (0,?,?)"
        const insertQuery = mysql.format(insert, [user, cryptPassword])

        connection.query(searchQuery, async (error, result) => {
            errorHandler(error)
            console.log(">> Search result <<")
            console.log(result.length)

            if (result.length != 0) {
                connection.release()
                console.log(">> User already exist <<")
                response.sendStatus(409)
            }
            else {
                connection.query(insertQuery, (error, result) => {
                    connection.release()

                    errorHandler(error)
                    console.log(">> Created user <<")
                    console.log(result.insertId)
                    response.sendStatus(201)
                })
            }
        })
    })
})

//LOGIN USER
app.post("/login", (request, response) => {
    const user = request.body.user
    const password = request.body.password

    dataBase.getConnection(async (error, connection) => {
        errorHandler(error)

        const sqlSearch = "SELECT * FROM usertable WHERE user = ?"
        const search_query = mysql.format(sqlSearch, [user])

        connection.query(search_query, async (error, result) => {

            connection.release()

            errorHandler(error)

            if (result.length == 0) {
                console.log(">> User does not exist <<")
                response.sendStatus(404)
            }
            else {

                const cryptPassword = result[0].password

                if (await bcrypt.compare(password, cryptPassword)) {
                    console.log(">> Login was successful <<")
                    response.send(`${user} logged in!`)
                    response.redirect('/index')
                }
                else {
                    console.log(">> Password incorrect <<")
                    response.send(">> Password incorrect <<")
                }
            }
        })
    })
})
