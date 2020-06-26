// --------------------- load configuration based on env --------------------
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// --------------------- load configuration based on env --------------------

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')

const homeApi = require('./routes/api/index')
const booksApi = require('./routes/api/books')

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
// For values from the form
app.use(express.json());
// app.use(express.urlencoded({ limit: '10mb', extended: false }));

// --------------------- Database connection --------------------
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database'))

// --------------------- Database connection --------------------

// --------------------- Views Routes --------------------
app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter);

// --------------------- API Routes ----------------------
app.use('/api/index', homeApi)
app.use('/api/books', booksApi)

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})

// --------------------- Views Routes --------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))