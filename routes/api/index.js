const express = require('express')
const router = express.Router()

const Book = require('./../../models/Book')

router.get('/', async(req, res) => {
    try {
        const books = await Book.find().sort({
            createdAt: 'desc'
        }).exec()
        res.json(books)
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
})


module.exports = router