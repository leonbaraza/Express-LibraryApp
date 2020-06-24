const express = require('express')
const router = express.Router()

const Author = require('../models/Author')
const Book = require('../models/Book')

const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']


// Get all books
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title!= null && req.query.title.trim() !== ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try {
        books = await query.exec()
        res.render('books/index', {
            books,
            searchOptions : req.query
        })
    } catch (err) {
        res.redirect('/')
    }
})

// Get new books
router.get('/new', async(req, res) => {
    renderNewPage(res, new Book())
})

// Create books 
router.post('/', async (req, res, next) => {
    req.book = new Book()
    next()
}, saveBookAndRedirect('new'))


// Get a single book 
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
                                .populate('author')
                                .exec()
        res.render('books/show',{
            book:book
        })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch (err) {
        res.redirect('/')
    }
})

// update books
router.put('/:id', async (req, res, next) => {
    let book
    try{
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
        res.redirect(`/books/${book.id}`)
    } catch (err) {
        if (book != null) {
            renderEditPage(res, book, true)
        } else{
            res.redirect('/')
        }        
    }
})

// Delete books
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if (book == null){
            res.redirect('/')
        } else{
            res.redirect(`/books/${author.id}`, 
                            { errMessage: 'Could not remove book'
                        })
        }
    }
})


function saveBookAndRedirect(path) {
    return async(req, res) => {
        let book = req.book
        book.title  = req.body.title.trim(),
        book.author = req.body.author,
        book.publishDate = new Date(req.body.publish_date),
        book.pageCount = req.body.page_count,
        book.description = req.body.description.trim()
        
        if (book.cover != null || book.cover !== '') {
            saveCover(book, req.body.cover)            
        }
        try {
            await book.save()
            res.redirect(`/books/${book.id}`)
        } catch (err) {
            renderNewPage(res, book, true)
        }
    }
}

async function renderNewPage(res, book, form, hasError=false) {
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError=false) {
    renderFormPage(res, book, 'edit', hasError)
}
async function renderFormPage(res, book, form, hasError=false) {
    try{
        const author = await Author.find({})
        const params = {
            book : book,
            author : author 
        }
        if (hasError) {
            if (form = 'edit'){
                params.errMessage = 'Error Updating book'
            } else {
                params.errMessage = 'Error creating book'
            }       
        }
        res.render(`books/${form}`, params)
    } catch (err) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded, next) {
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}


module.exports = router