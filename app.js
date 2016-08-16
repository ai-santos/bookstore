const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const database = require('./database');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// index route
app.get('/', function(req, res, next){
  res.render('index', {})
});

//get all books
app.get('/books', function(req, res, next){
  database.getAllBooksWithAuthorsAndGenres()
    .then(function(books){
      res.render('books/index', {
        books: books,
      })
    })
    .catch(function(error){
      throw error;
    })
});

//get books by id
app.get('/books/:book_id', function(req, res, next){
  const { book_id } = req.params;

  database.getBooksById(book_id)
    .then(function(book){
      res.render('books/show', {
        book: book,
      })
    })
    .catch(function(error){
      throw error;
    })
});

//test routes
app.get('/test', function(req, res, next){
  database.getAllGenres()
    .then(function(data){
      res.json(data)
    })
    .catch(function(error){
      res.json({ERROR: error})
    })
});

//get all authors
app.get('/authors', function(req, res, next){
  database.getAllAuthors()
    .then(function(authors){
      res.render('authors/index', {
        authors: authors,
      })
    })
    .catch(function(error){
      throw error;
    })
});


//get authors by bookId
app.get('/authors/:book_id', function(req, res){
  const { book_id } = req.params;

  database.getAuthorsByBookId(book_id)
    .then(function(authors){
      res.render('authors/show', {
        authors: authors,
      })
    })
    .catch(function(error){
      throw error;
    })
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
