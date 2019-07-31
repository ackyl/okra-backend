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
const testingdir = path.join(rootdir, '/upload/testing')

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

    const qry1 = `INSERT INTO album (album_name, album_artist, genre, release_year, picture, price, upload_date) VALUES (?)`
    const qry2 = `INSERT INTO track (album_id, track_number, track_name, track_duration, mp3) VALUES (?)`
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
            timestamp = new Date().toISOString().slice(0,19).replace('T', ' ');
            price = 500000

            albumArt(album_artist, {album: album_name}, (err, art) => {
                if(err) console.log(err)
                
                picture = art

                albumqry = []
                albumqry.push(album_name)
                albumqry.push(album_artist)
                albumqry.push(genre)
                albumqry.push(release_year)
                albumqry.push(picture)
                albumqry.push(price)
                albumqry.push(timestamp)

                conn.query(qry1, [albumqry], (err, result) => {
                    if(err) return res.send(err)

                    album_id = result.insertId

                    for(x in req.files){
                        mumeta.parseFile(`upload/music/${req.files[x].filename}`, {native: true})
                        .then(metadata=>{
                            track_name = util.inspect(metadata.common.title).replace(/'/g,"")
                            track_duration = parseInt(util.inspect(metadata.format.duration))
                            track_number = util.inspect(metadata.common.track).slice(6,7)

                            trackqry = []
                            trackqry.push(album_id)
                            trackqry.push(track_number)
                            trackqry.push(track_name)
                            trackqry.push(track_duration)
                            trackqry.push(`upload/music/${req.files[x].filename}`)

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

//Testing Ground
mumeta.parseFile(`upload/testing/test.mp3`, {native: true})
    .then(metadata=>{
        console.log(util.inspect(metadata, { showHidden: false, depth: null }) + '\n\n')
        console.log(util.inspect(metadata.common.track).slice(6,7))
        console.log(util.inspect(metadata.common.year))
        var timestamp = new Date().toISOString().slice(0,19).replace('T', ' ');
        console.log(timestamp)
        console.log('2016-01-17 17:26:09')
    })

module.exports = router