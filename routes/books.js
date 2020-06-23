const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Author = require('../models/Author')
const Book = require('../models/Book')

const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title : req.body.title.trim(),
        author: req.body.author,
        publishDate: new Date(req.body.publish_date),
        pageCount: req.body.page_count,
        coverImageName: fileName,
        description: req.body.description.trim()
    })
    try {
        const newBook = await book.save()
        res.redirect('books')
        // res.redirect(`/books/${newBook.id}`)
    } catch (err) {
        if (book.coverImageName !=null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})


// Create books 
// router.post('/', (req, res, next) => {
//     req.book = new Book()
//     next()
// }, saveBookAndRedirect('new'))

// update books
router.put('/', (req, res) => {

})

// Delete books
router.delete('/', (req, res) => {

})


async function renderNewPage(res, book, hasError=false) {
    try{
        const author = await Author.find({})
        const params = {
            book : new Book(),
            author : author 
        }
        if (hasError) {
            params.errMessage = 'Error creating book'
        }
        res.render('books/new', params)
    } catch (err) {
        res.redirect('/books')
    }
}

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err =>{
        if(err)console.error(err)
    })
}


function saveBookAndRedirect(path) {
    return async(req, res) => {
        let book = req.book
        book.title = req.body.title.trim()
        book.author = req.body.author
        book.publishDate = new Date(req.body.publish_date)
        book.pageCount = req.body.page_count
        book.description = req.body.description.trim()
        try {
            book = await book.save();
            res.redirect('books')
            // res.redirect(`/books/${book.id}`)
        } catch (err) {
            res.render(`books/${path}`, { 
                book: book,
                errMessage: `Error creating book` 
            })
        }
    }
}


module.exports = router