const express = require('express')

const albumRouter = require('./routers/albumRouter')

const app = express()
const port = process.env.port || 2019

app.use(express.json())
app.use(albumRouter)

app.listen(port, () => {
    console.log('Berhasil Running di ' + port);
    
})