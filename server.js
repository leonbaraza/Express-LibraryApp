// --------------------- load configuration based on env --------------------
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
// --------------------- load configuration based on env --------------------

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const path = require('path');

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static(path.join(__dirname,'public')));

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

// --------------------- Views Routes --------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))