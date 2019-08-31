const conn = require('../connection/')
const isEmail = require('validator/lib/isEmail')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')


const rootdir = path.join(__dirname,'/../..')
const photosdir = path.join(rootdir, '/upload/image')

const folder = multer.diskStorage(
    {
        destination: function (req, file, cb){
            cb(null, photosdir)
        }
        ,
        filename: function (req, file, cb){
            // Waktu upload, nama field, extension file
            cb(null, file.originalname)
        }
    }
)

const upstore = multer(
    {
        storage: folder,
        limits: {
            fileSize: 5000000 // Byte , default 1MB
        },
        fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
                return cb(new Error('Please upload the appropriate image extension (jpg, jpeg, or png)')) 
            }
    
            cb(undefined, true)
        }
    }
)

//Register
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
            return res.send('TAKEN')
        }else{
            conn.query(insertqry, data, (err,result1) => {
                if(err) return res.send(err)

                res.send((result1.insertId).toString())
            })
        }
    })

})

//  LOGIN
router.get('/users/login', (req,res)=>{
    const sql = `SELECT * FROM users WHERE username = ?`
    const data = req.query.username

    conn.query(sql, data, async (err, result) => {
        if (err) return res.send(err)

        const user = result[0]

        if (!user) {
            return res.send('Username not found')
        }

        const match = await bcrypt.compare(req.query.password, result[0].password)
        if (!match) {
            return res.send(`Password incorrect`)
        }

        res.send(user)
    })
})

//Get Users
router.get('/users', (req, res) => {
    const sql = `SELECT * FROM users WHERE ?`
    const id = req.query

    conn.query(sql, id, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

//Access Image
router.get('/users/pp/:image', (req, res) => {
    const options = {
        root: photosdir
    }

    const fileName = req.params.image

    res.sendFile(fileName, options, function(err){
        if(err) return res.send(err)
        
    })
})

//User Details
router.get('/users/:username', (req, res) => {
    const sql = `SELECT * FROM users WHERE username = ?`
    const data = req.params.username

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        if(!result[0]) return res.send('User not found')

        result[0].profile_picture = `localhost:2019/users/pp/${result[0].profile_picture}`

        res.send(result[0])
    })
})

//Edit Profile
router.patch('/users/:id', (req, res) => {
    const sql = `UPDATE users SET ? WHERE user_id = ${req.params.id}`
    const data = req.body

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        res.send(result)
    })
})

//Upload Profile Picture
router.post('/users/pp', upstore.single('pp'), (req, res) => {
    const sql = `SELECT * FROM users WHERE username = ?`
    const sql2 = `UPDATE users SET profile_picture = '${req.body.pp_name}'
                    WHERE username = '${req.body.username}'`
    const data = req.body.username

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        const user = result[0]

        if(!user) return res.send('User not found')

        conn.query(sql2, (err, result2) => {
            if(err) return res.send(err)

            res.send({
                message: 'Upload berhasil'
            })
        })
    })
})


module.exports = router