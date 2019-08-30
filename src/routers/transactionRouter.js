const conn = require('../connection/')
const router = require('express').Router()

router.post('/cart', (req, res) => {

    const insertqry = `INSERT INTO users SET ?`
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
            const data = {td_id: result[0].td_id, user_id: req.body.user_id, album_id: req.body.album_id}
            
            conn.query(addtocartqry, data, (err, result2) => {
                if(err) return res.send(err)

                res.send('Success!')
            })
        }else{
            conn.query(newcartqry, dataX, (err, result1) => {
                if(err) return res.send(err)

                const dataY = {td_id: result1.insertId, user_id: req.body.user_id, album_id: req.body.album_id}

                conn.query(addtocartqry, dataY, (err, result3) => {
                    if(err) return res.send(err)

                    res.send('Success!')
                })
            })
        }

    })

})


module.exports = router