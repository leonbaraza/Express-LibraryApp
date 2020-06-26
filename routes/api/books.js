const express = require('express')
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
        if(book == null){
            res.status(404).json({message: `Cannot find book with id of ${req.params.id}`})
        }
        res.json(book)
    } catch (err) {
        res.status(400).json({ Error: `Book of id ${req.params.id} not found. Ensure you gave the correct id`})
    }
})

// Add a new book
router.post('/', async (req, res) => {
    let book  = new Book({
        title: req.body.title.trim(),
        author: req.body.author,
        publishDate: new Date(req.body.publish_date),
        pageCount: req.body.page_count,
        description: req.body.description.trim()
    })
    saveCover(book, req.body.cover)
    try {
        await book.save()
        res.json(book)
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update an existing book
router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title  = req.body.title.trim(),
        book.author = req.body.author,
        book.publishDate = new Date(req.body.publish_date),
        book.pageCount = req.body.page_count,
        book.description = req.body.description.trim()

        if (book.cover != null && book.cover !== '') {
            saveCover(book, req.body.cover)            
        }

        await book.save()
        res.json(book)
    } catch (err) {
        res.status(400).json({ Error: err.message})
    }
})


router.delete('/:id', getBook, async(req, res) => {
    try {
        await res.book.remove()
        res.json({ message: 'Book was successfully removed' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


async function getBook(req, res, next){
    let book
    try {
        book = await Book.findById(req.params.id)
        if(book == null){
            res.status(404).json({message: `Cannot find book with id of ${req.params.id}`})
        }
    } catch (err) {
        res.status(500).json({ message:err.message })
    }
    res.book = book
    next()
}

module.exports = router