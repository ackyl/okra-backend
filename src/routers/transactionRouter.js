const conn = require('../connection/')
const router = require('express').Router()

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
        SELECT a.picture, a.album_artist, a.album_name, a.price, t.qty, t.id, a.stock, a.album_id
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


module.exports = router