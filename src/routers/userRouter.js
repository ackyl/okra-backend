const conn = require('../connection/')
const isEmail = require('validator/lib/isEmail')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const path = require('path')
const rootdir = path.join(__dirname,'/../..')
const photosdir = path.join(rootdir, '/upload/image')


router.post('/users', (req, res) => {

    const insertqry = `INSERT INTO users SET ?`
    const selectqry = `SELECT * FROM users WHERE username = '${req.body.username}' OR email = '${req.body.email}'`
    const data = req.body

    if(!isEmail(data.email)){
        return res.send('Email is not valid')
    }

    data.password = bcrypt.hashSync(data.password, 8)

    conn.query(selectqry, (err, result) => {
        if(err) return res.send(err)

        if(result[0]){
            return res.send('Email atau username sudah terpakai.')
        }else{

            conn.query(insertqry, data, (err,result1) => {
                if(err) return res.send(err)

                res.send('Your account has been created.')
            })
        }
    })

})


router.get('/users/pp/:image', (req, res) => {
    const options = {
        root: photosdir
    }

    const fileName = req.params.image

    res.sendFile(fileName, options, function(err){
        if(err) return res.send(err)
        
    })

})



router.get('/users/:username', (req, res) => {
    const sql = `SELECT username, name, email, profile_picture
                FROM users WHERE username = ?`
    const data = req.params.username

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        const user = result[0]

        if(!user) return res.send('User not found')

        res.send({
            username: user.username,
            name : user.name,
            email: user.email,
            avatar: `localhost:2019/users/pp/${user.profile_picture}`
        })
    })
})

module.exports = router