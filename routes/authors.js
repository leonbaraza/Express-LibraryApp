const express = require('express')
const router = express.Router()

const Author = require('../models/Author')
const Books = require('../models/Book')
const Book = require('../models/Book')

// Get all authors
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name.trim() !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors, 
            searchOptions: req.query 
        })
    } catch (err){
        res.redirect('/')
    }
    
})

// Get new authors
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// Create author 
router.post('/', (req, res, next) => {
    req.author = new Author()
    next()
}, saveAndRedirect('new', 'Creating'))

// Get a single author
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author:req.params.id  }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch {
        res.redirect('/authors')
    }
})

// Get edit author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch (error) {
        res.redirect('/authors')
    }
})
// update author
router.put('/:id', async (req, res, next) => {
    req.author = await Author.findById(req.params.id)
    next()
}, saveAndRedirect('edit', 'Editing'))

// Delete author
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove();
        res.redirect('/authors')
    } catch (err) {
        if (author == null){
            res.redirect('/')
        } else{
            res.redirect(`/authors/${author.id}`)
        }
    }
})

function saveAndRedirect(path, action) {
    return async(req, res) => {
        let author = req.author
        author.name = req.body.name.trim()
        try {
            await author.save();
            res.redirect(`/authors/${author.id}`)
        } catch (err) {
            if (author == null){
                res.redirect('/')
            } else{
                res.render(`authors/${path}`, { 
                    author: author,
                    errMessage: `Error ${action} author` 
                })
            }
        }
    }
}

module.exports = router