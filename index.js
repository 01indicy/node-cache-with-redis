const express = require('express')
const redis = require('redis')
import("node-fetch")
const server = express()
const serverPort = 8080;
const redisPort = 6379;
const redisClient = redis.createClient(redisPort)

async function getData(req,res,next){
    try {
        let response_ = {}
        await redisClient.connect()
        const details = await redisClient.get(req.params.username)
        if (details == null) {
            console.log(`fetching data from api ${new Date()}`)
            const response = await fetch(`https://api.github.com/users/${req.params.username}`)
            const data_ = await response.json()
            await redisClient.setEx(req.params.username,"10",data_.public_repos.toString())
            response_ = data_.public_repos;
        } else {
            console.log(`fetching data redis ${new Date()}`)
            response_ = details;
        }
        await redisClient.disconnect()

        res.send({username:req.params.username,repos:response_})
    } catch (err) {
        console.log(err.message)
        res.send({status:500})
    }
}

server.get('/repos/:username',getData)
server.listen(serverPort,() => console.log(`server is running on port ${serverPort}`))