const conn = require('../connection/')
const router = require('express').Router()
const path = require('path')
const multer = require('multer')
const mumeta = require('music-metadata')
const util = require('util')
const fs = require('fs')
const albumArt = require('album-art')


// __dirname: alamat folder file userRouter.js
const rootdir = path.join(__dirname,'/../..')
const photosdir = path.join(rootdir, '/upload/music')

const folder = multer.diskStorage(
    {
        destination: function (req, file, cb){
            cb(null, photosdir)
        },
        filename: function (req, file, cb){
            // Waktu upload, nama field, extension file
            cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
        }
    }
)

const upstore = multer(
    {
        storage: folder,
        limits: {
            fileSize: 50000000 // Byte , default 1MB
        },
        fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.(mp3)$/)){ // will be error if the extension name is not one of these
                return cb(new Error('Please upload an mp3 file.')) 
            }
    
            cb(undefined, true)
        }
    }
)

//Test Upload Biasa
router.post('/album', (req, res) => {
    const qry1 = `INSERT INTO album SET ?`
    
    conn.query(qry1, req.body, (err, result) => {
        if(err){
            return res.send(err)
        }
    })

    res.send('Berhasil!')
})


//Upload MP3s
router.post('/album/uploads', upstore.array('mu', 20), (req, res) => {

    const qry1 = `INSERT INTO album (album_name, album_artist, genre, price, picture, release_date, upload_date) VALUES (?)`
    const qry2 = `INSERT INTO track (album_id, track_name, track_duration) VALUES (?)`
    album_id = 0

        //NGESAVE ALBUM ID

        //INSERT ALBUM
        mumeta.parseFile(`upload/music/${req.files[0].filename}`, {native: true})
        .then(metadata=>{

            //Catch Album Metadata Required For Album Table
            albumqry = []
            album = util.inspect(metadata.common.album).replace(/'/g,"")
            album_artist = util.inspect(metadata.common.albumartist).replace(/'/g,"")
            genre = util.inspect(metadata.common.genre[0]).replace(/'/g,"")

            albumArt(album_artist, {album: album}, (err, art) => {
                if(err) console.log(err)
                album_art = art

                albumqry.push(album)
                albumqry.push(album_artist)
                albumqry.push(genre)
                albumqry.push(500000)
                albumqry.push(album_art)
                albumqry.push('2016-01-17 17:26:09')
                albumqry.push('2016-01-17 17:26:09')

                conn.query(qry1, [albumqry], (err, result) => {
                    if(err) return res.send(err)

                    album_id = result.insertId

                    for(x in req.files){
                        mumeta.parseFile(`upload/music/${req.files[x].filename}`, {native: true})
                        .then(metadata=>{
                            track_name = util.inspect(metadata.common.title).replace(/'/g,"")
                            track_duration = parseInt(util.inspect(metadata.format.duration))
                            
                            trackqry = []

                            trackqry.push(album_id)
                            trackqry.push(track_name)
                            trackqry.push(track_duration)

                            conn.query(qry2, [trackqry], (err, result2) => {
                                if(err) return res.send(err)
                            })
                        })
                    }    
                })
            })
        })
    res.send('Success!')
})


// imageData = util.inspect(metadata.common.picture[0].data)

// fs.writeFile('upload/artwork/image.jpeg', new Buffer(imageData, "base64"), (err) => {
//     if(err) console.log(err)

//     console.log('Saved!')
// })

//Upload MP3
router.post('/album/upload', upstore.single('mu'), (req, res) => {
    const qry1 = `UPDATE album SET picture = '${req.file.filename}'
                    WHERE album_id = 1`

    conn.query(qry1, (err, result) => {
        if(err) return res.send(err)

        mumeta.parseFile(`upload/music/${req.file.filename}`, {native: true})
        .then(metadata=>{
            console.log(util.inspect(metadata, { showHidden: false, depth: null }))
        })

        res.send({
            message: 'Upload berhasil',
            filename: req.file.filename
        })
    })
})


// // CREATE ONE USER
// router.post('/users', (req, res) => {

//     // tanda tanya akan di ganti oleh variabel data
//     const sql = `INSERT INTO users SET ?`
//     const sql2 = `SELECT id, name, email, username, verified FROM users WHERE id = ?`
//     const data = req.body

//     // Cek apakah email valid
//     if(!isEmail(data.email)){
//         return res.send('Email is not valid')
//     }

//     // Mengubah password dalam bentuk hash
//     data.password = bcrypt.hashSync(data.password, 8)

//     // Insert data
//     conn.query(sql, data, (err, result1) => {
//         // Terdapat error ketika insert
//         if(err){
//             return res.send(err)
//         }

        

//         // Read data by user id untuk di kirim sebagai respon
//         conn.query(sql2, result1.insertId, (err, result2) => {
//             if(err){
//                 return res.send(err)
//             }

//             var user = result2[0]

//             mailVerify(user)

//             res.send(result2)
//         })
//     })
// })

// // UPLOAD AVATAR
// router.post('/users/avatar', upstore.single('apatar'), (req, res) => {
//     const sql = `SELECT * FROM users WHERE username = ?`
//     const sql2 = `UPDATE users SET avatar = '${req.file.filename}'
//                     WHERE username = '${req.body.uname}'`
//     const data = req.body.uname

//     conn.query(sql, data, (err, result) => {
//         if(err) return res.send(err)

//         const user = result[0]

//         if(!user) return res.send('User not found')

//         conn.query(sql2, (err, result2) => {
//             if(err) return res.send(err)

//             res.send({
//                 message: 'Upload berhasil',
//                 filename: req.file.filename
//             })
//         })
//     })
// })

// // ACCESS IMAGE
// router.get('/users/avatar/:imageName', (req, res) => {
//     // Letak folder photo
//     const options = {
//         root: photosdir
//     }

//     // Filename / nama photo
//     const fileName = req.params.imageName

//     res.sendFile(fileName, options, function(err){
//         if(err) return res.send(err)
        
//     })

// })

// // DELETE IMAGE
// router.delete('/users/avatar', (req, res)=> {
//     const sql = `SELECT * FROM users WHERE username = '${req.body.uname}'`
//     const sql2 = `UPDATE users SET avatar = null WHERE username = '${req.body.uname}'`

//     conn.query(sql, (err, result) => {
//         if(err) return res.send(err)

//         // nama file
//         const fileName = result[0].avatar

//         // alamat file
//         const imgpath = photosdir + '/' + fileName

//         // delete image
//         fs.unlink(imgpath, (err) => {
//             if(err) return res.send(err)

//             // ubah jadi null
//             conn.query(sql2, (err, result2) => {
//                 if(err) res.send(err)

//                 res.send('Delete berhasil')
//             })
//         })
//     })
// })

// // READ PROFILE
// router.get('/users/profile/:username', (req, res) => {
//     const sql = `SELECT username, name, email, avatar
//                 FROM users WHERE username = ?`
//     const data = req.params.username

//     conn.query(sql, data, (err, result) => {
//         // Jika ada error dalam menjalankan query, akan dikirim errornya
//         if(err) return res.send(err)

//         const user = result[0]

//         // jika user tidak di temukan
//         if(!user) return res.send('User not found')

//         res.send({
//             username: user.username,
//             name : user.name,
//             email: user.email,
//             avatar: `localhost:2019/users/avatar/${user.avatar}`
//         })
//     })
// })

// // UPDATE PROFILE
// router.patch('/users/profile/:uname', (req, res) => {
//     const sql = `UPDATE users SET ? WHERE username = ?`
//     const sql2 = `SELECT username, name ,email 
//                     FROM users WHERE username = '${req.params.uname}'`
//     const data = [req.body, req.params.uname]

//     // UPDATE (Ubah data user di database)
//     conn.query(sql, data, (err, result) => {
//         if(err) return res.send(err)

//         // SELECT (Ambil user dari database)
//         conn.query(sql2, (err, result) => {
//             // result SELECT adalah array
//             if(err) return res.send(err)

//             // Kirim usernya dalam bentuk object
//             res.send(result[0])
//         })
//     })
// })

// // VERIFY USER
// router.get('/verify', (req, res) => {
//     const sql = `UPDATE users SET verified = true 
//                 WHERE username = '${req.query.uname}'`

//     conn.query(sql, (err, result) => {
//         if(err) return res.send(err)

//         res.send('<h1>Verifikasi berhasil</h1>')
//     })
// })

module.exports = router