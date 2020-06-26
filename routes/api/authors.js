const express = require('express')
const router = express.Router()

const Author = require('./../../models/Author')
const { model } = require('./../../models/Author')

router.get('/', async (req, res) => {
    searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const author = await Author.find(searchOptions)
        res.json(author)
    } catch (err) {
        res.status(500).json({ Error: err.message })
    }
})

router.get('/:id', getSingleAuthor, (req, res) => {
    res.json(res.author)
})

router.delete('/:id', getSingleAuthor, async (req, res) => {
    try {
        await res.author.remove()
        res.json({ message: 'Author successfully deleted' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})


async function getSingleAuthor(req, res, next) {
    let author
    try {
        author = await Author.findById(req.params.id)
        if (author == null) {
            res.status(404).json({ message: `Author with id of ${id} not found`})
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
    res.author = author
    next()
}

module.exports = router