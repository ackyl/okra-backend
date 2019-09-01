const conn = require('../connection/')
const router = require('express').Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')

const rootdir = path.join(__dirname,'/../..')
const photosdir = path.join(rootdir, '/upload/image/bukti')

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

//ADD TO CART
router.post('/cart', (req, res) => {

    const selectqry = `SELECT d.td_id
    FROM users u
    JOIN trans t ON u.user_id = t.user_id
    JOIN trans_detail d ON t.td_id = d.td_id
    WHERE u.user_id = ${req.body.user_id} AND d.trans_type = 'cart'`

    const newcartqry = `INSERT INTO trans_detail SET ?`

    const addtocartqry = `INSERT INTO trans SET ?`

    const trans_type = 'cart'
    const trans_date = new Date().toLocaleString("en-US", {timeZone: 'Asia/Bangkok'})
    const dataX = {trans_type: trans_type, trans_date: trans_date}

    conn.query(selectqry, (err, result) => {
        if(err) return res.send(err)
        
        if(result[0]){
            const data = {td_id: result[0].td_id, user_id: req.body.user_id, album_id: req.body.album_id, qty: req.body.qty}
            
            conn.query(addtocartqry, data, (err, result2) => {
                if(err) return res.send(err)

                res.send('Success!')
            })
        }else{
            conn.query(newcartqry, dataX, (err, result1) => {
                if(err) return res.send(err)

                const dataY = {td_id: result1.insertId, user_id: req.body.user_id, album_id: req.body.album_id, qty: req.body.qty}

                conn.query(addtocartqry, dataY, (err, result3) => {
                    if(err) return res.send(err)

                    res.send('Success!')
                })
            })
        }

    })

})

//GET ALL ITEMS IN CART
router.get('/cart/:id', (req, res) => {
    const query = `
        SELECT a.picture, a.album_artist, a.album_name, a.price, t.qty, t.id, a.stock, a.album_id, d.td_id
        FROM users u
        JOIN trans t ON u.user_id = t.user_id
        JOIN trans_detail d ON t.td_id = d.td_id
        JOIN album a ON a.album_id = t.album_id
        WHERE u.user_id = ${req.params.id} AND d.trans_type = 'cart';
    `

    conn.query(query, (err,result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

//REMOVE FROM CART
router.delete('/cart/:id', (req, res) => {
    const sql = `DELETE FROM trans WHERE id = ${req.params.id}`

    conn.query(sql, (err, result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

//CHANGE STOCK IN ALBUM
router.patch('/stock/:id', (req, res) => {
    const sql = `UPDATE album SET ? WHERE album_id = ${req.params.id}`
    const data = req.body

    conn.query(sql, data, (err, result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

//CHECKOUT
router.patch('/trans/:id', (req, res) => {
    const sql = `UPDATE trans_detail SET ? WHERE td_id = ${req.params.id}`
    const data = {trans_type: 'in progress'}

    conn.query(sql, data, (err, result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

//GET TRANS
router.get('/trans/:id', (req, res) => {
    const sql = `SELECT u.user_id, d.td_id, d.trans_type, d.picture, COUNT(t.id) AS total_album,  SUM(a.price*t.qty) AS total_harga FROM users u
    JOIN trans t ON u.user_id = t.user_id
    JOIN trans_detail d ON t.td_id = d.td_id
    JOIN album a ON a.album_id = t.album_id
    WHERE d.trans_type != 'cart' AND u.user_id = ${req.params.id}
    GROUP BY d.td_id`

    conn.query(sql, (err, result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

router.get('/trans/detail/:id', (req, res) => {
    const sql = `SELECT a.album_artist, a.album_name, a.price, t.qty, d.trans_type, d.picture AS d_picture, a.picture
    FROM users u
    JOIN trans t ON u.user_id = t.user_id
    JOIN trans_detail d ON t.td_id = d.td_id
    JOIN album a ON a.album_id = t.album_id
    WHERE d.td_id = ${req.params.id}`

    conn.query(sql, (err,result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

router.get('/trans/detailz/:id', (req, res) => {
    const sql = `SELECT t.qty, d.trans_type, d.picture, d.td_id, COUNT(t.id) AS total_album,  SUM(a.price*t.qty) AS total_harga
    FROM users u
    JOIN trans t ON u.user_id = t.user_id
    JOIN trans_detail d ON t.td_id = d.td_id
    JOIN album a ON a.album_id = t.album_id
    WHERE d.td_id = ${req.params.id}`

    conn.query(sql, (err,result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

//ACCESS IMAGE
router.get('/trans/bukti/:image', (req, res) => {
    const options = {
        root: photosdir
    }

    const fileName = req.params.image

    res.sendFile(fileName, options, function(err){
        if(err) return res.send(err)
    })
})

//Upload Bukti
router.post('/trans/bukti', upstore.single('bukti'), (req, res) => {
    const sql = `UPDATE trans_detail SET picture = '${req.body.picture}'
                WHERE td_id = '${req.body.td_id}'`

    conn.query(sql, (err, result) => {
        if(err) return res.send(err)

        res.send({
            message: 'Upload berhasil'
        })
    })
})

//GET VERIFY FOR ADMIN
router.get('/verify', (req, res) => {
    const query = `
        SELECT u.username, d.td_id, COUNT(t.id) AS total_album,  SUM(a.price*t.qty) AS total_harga
        FROM users u
        JOIN trans t ON u.user_id = t.user_id
        JOIN trans_detail d ON t.td_id = d.td_id
        JOIN album a ON a.album_id = t.album_id
        WHERE d.trans_type = 'in progress' AND d.picture IS NOT NULL
        GROUP BY d.td_id
    `

    conn.query(query, (err,result) => {
        if(err) res.send(err)

        res.send(result)
    })
})

module.exports = router