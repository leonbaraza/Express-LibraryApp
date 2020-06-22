const express = require('express')
const router = express.Router()

// Get all authors
router.get('/', (req, res) => {
    res.render('authors/index')
})

// Get new authors
router.get('/new', (req, res) => {
    res.render('authors/new')
})

// Create author 
router.post('/', (req, res) => {
    res.send('Created successful')
})

// update author
router.put('/', (req, res) => {

})

// Delete author
router.delete('/', (req, res) => {

})


module.exports = router