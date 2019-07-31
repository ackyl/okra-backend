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

//Upload Album
router.post('/album/uploads', upstore.array('mu', 20), (req, res) => {

    const qry1 = `INSERT INTO album (album_name, album_artist, release_year, picture, price, stock, upload_date, deleted) VALUES (?)`
    const qry2 = `INSERT INTO track (album_id, track_number, track_name, track_duration, mp3) VALUES (?)`
    const qry3 = `SELECT genre_id FROM genre WHERE genre = (?)`
    const qry4 = `INSERT INTO genre (genre) VALUES (?)`
    const qry5 = `INSERT INTO album_genre (album_id, genre_id) VALUES (?)`

    album_id = 0

        //NGESAVE ALBUM ID

        //INSERT ALBUM
        mumeta.parseFile(`upload/music/${req.files[0].filename}`, {native: true})
        .then(metadata=>{

            //Catch Album Metadata Required For Album Table
            album_name = util.inspect(metadata.common.album).replace(/'/g,"")
            album_artist = util.inspect(metadata.common.albumartist).replace(/'/g,"")
            genre = util.inspect(metadata.common.genre[0]).replace(/'/g,"")
            release_year = util.inspect(metadata.common.year)
            timestamp = new Date().toLocaleString("en-US", {timeZone: 'Asia/Bangkok'})
            price = 500000
            stock = 100
            deleted = false

            // console.log(timestamp.slice(0,9))
            // console.log(timestamp.slice(11))

            albumArt(album_artist, {album: album_name}, (err, art) => {
                if(err) console.log(err)
                
                picture = art

                albumqry = []
                albumqry.push(album_name)
                albumqry.push(album_artist)
                albumqry.push(release_year)
                albumqry.push(picture)
                albumqry.push(price)
                albumqry.push(stock)
                albumqry.push(timestamp)
                albumqry.push(deleted)

                conn.query(qry1, [albumqry], (err, result) => {
                    if(err) return res.send(err)

                    album_id = result.insertId

                    //Check if such genre exist
                    //If there is, genre_id is that
                    //If not, push then get genre_id

                    conn.query(qry3, genre, (err,result33) => {
                        
                        genreqry = []

                        if(result33[0] == undefined){
                            conn.query(qry4, genre, (err, result44)=> {
                                if(err) res.send(err)

                                genreqry.push(album_id)
                                genreqry.push(result44.insertId)

                                conn.query(qry5, [genreqry], (err, result66) => {
                                    if(err) res.send(err)
                                })
                            })
                        }else{
                            genreqry.push(album_id)
                            genreqry.push(result33[0].genre_id)
                            conn.query(qry5, [genreqry], (err, result55) => {
                                if(err) res.send(err)
                            })
                        }
                    })

                    for(x in req.files){

                        zz = 0

                        mumeta.parseFile(`upload/music/${req.files[x].filename}`, {native: true})
                        .then(metadata=>{
                            track_name = util.inspect(metadata.common.title).replace(/'/g,"")
                            track_duration = parseInt(util.inspect(metadata.format.duration))
                            track_number = parseInt(util.inspect(metadata.common.track).slice(6,8))

                            trackqry = []
                            trackqry.push(album_id)
                            trackqry.push(track_number)
                            trackqry.push(track_name)
                            trackqry.push(track_duration)
                            trackqry.push(`upload/music/${req.files[zz].filename}`)

                            conn.query(qry2, [trackqry], (err, result2) => {
                                if(err) return res.send(err)
                            })

                            zz +=  1
                        })
                    }
                })
            })
        })
    res.send('Success!')
})

//Testing Ground
mumeta.parseFile(`upload/testing/test.mp3`, {native: true})
    .then(metadata=>{
        // timestamp = new Date().toLocaleString("en-US", {timeZone: 'Asia/Bangkok'})
        // console.log(timestamp.slice(0,9))
        // console.log(timestamp.slice(11))

        // timestamp = new Date().toISOString().slice(0,19).replace('T', ' ');
    })

/*
1. Create Album / Register New Album [DONE]
2. Delete Album
3. Create User / Register
4. Login (User Type)
5. Update User / Edit Profile
6. Delete User
7. Create Cart / Add to Cart
8. Checkout / Update Cart
9. View Albums
10. View User Cart
11. View User Transaction
12. View User Transaction History
13. View Tracks on Album
14. View User / View Profile Detail
15. View Users Transaction / Review Bukti Pembayran
16. Update Users Transaction / Update to Accepted or Declined
*/

module.exports = router