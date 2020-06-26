const express = require('express')
const { route } = require('.')
const router = express.Router()

const Book = require('./../../models/Book')

router.get('/', async (req, res) => {    
    let query = Book.find()

    if (req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    if (req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query = query.lte('publishDate', new RegExp(req.query.publishedBefore, 'i'))
    }

    if (req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query = query.gte('publishDate', new RegExp(req.query.publishedAfter, 'i'))
    }
    
    try {
        books = await query.exec()
        res.json({
            searchOptions: req.query,
            books:books            
        })
    } catch (err) {
        res.json({ message: err.message })
    }
})

// books by id
router.get('/:id', async (req, res) => {
    try {
        book = await Book.findById(req.params.id)
                        .populate('author')
                        .exec()
        res.json(book)
    } catch (err) {
        res.status(400).json({ Error: `Book of id ${req.params.id} not found. Ensure you gave the correct id`})
    }
})


module.exports = router