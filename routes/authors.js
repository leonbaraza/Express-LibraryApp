const express = require('express')
const router = express.Router()

const Author = require('../models/Author')

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
}, saveAndRedirect('new'))

// update author
router.put('/', (req, res) => {

})

// Delete author
router.delete('/', (req, res) => {

})

function saveAndRedirect(path, action) {
    return async(req, res) => {
        let author = req.author
        author.name = req.body.name.trim()
        try {
            author = await author.save();
            // redirect to that article
            res.redirect('authors')
            // res.redirect(`/authors/${author.id}`)
        } catch (err) {
            res.render(`authors/${path}`, { 
                author: author,
                errMessage: `Error creating author` 
            })
        }
    }
}

module.exports = router