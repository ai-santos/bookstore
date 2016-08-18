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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const getPage = function(req){
  let page = parseInt(req.query.page, 10)
  if (isNaN(page) || page < 1) page = 1;
  return page;
}

//get all books
app.get('/', function(req, res, next){
  let page = getPage(req)
  database.getAllBooksWithAuthorsAndGenres(page)
    .then(function(books){
      res.render('books/index', {
        page: page,
        books: books,
      })
    })
    .catch(function(error){
      res.json(error);
    })
});

//get books by id
app.get('/books/:book_id', function(req, res, next){
  const { book_id } = req.params;

  database.getBookWithGenresAndAuthorsById(book_id)
    .then(function(book){
      res.render('books/show', {
        book: book,
      })
    })
    .catch(function(error){
      throw error;
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
app.get('/authors/:authorId', function(req, res){
  const { authorId } = req.params;

  Promise.all([
    database.getAuthorById(authorId),
    database.getBooksByAuthorId(authorId)
  ])
    .then(function(data){
      const author = data[0]
      const books = data[1]
      console.log('books', books)
      // res.json(authors);
      res.render('authors/show', {
        books: books,
        author: author
      })
    })
    .catch(function(error){
      throw error;
    })
})


//get all genres
app.get('/genres', function(req, res, next){
  database.getAllGenres()
    .then(function(genres){
      console.log('Genres', genres);

      res.render('genres/index', {
        genres: genres,
      })
      .catch(function(error){
        throw error;
      })
    })
});

//get genre by genre id
app.get('/genres/:genre_id', function(req, res){
  const{ genre_id } = req.params;

  database.getBooksByGenreId(genre_id)
    .then(function(books){
      console.log('books', books);
      res.render('genres/show', {
        books: books,
      })
      .catch(function(error){
        console.error(error);
        res.render('error',{
          error: error
        })
      })
    })
})

app.get('/new-book', (req,res) => {
  database.getAllGenres()
    .then(function(genres){
      res.render('admin/insert-book-form', {
        genres: genres
      })
    })
    .catch(function(error){
      throw error
    })
});

app.post('/insert-book', (req,res) =>{
  database.createBook(req.body.book)
    .then(function(bookId){
      res.redirect(`/books/${bookId}`)
    })
    .catch(function(error){
      renderError(res, error)
    })
})

app.get('/search-books', (req,res) => {
  let page = getPage(req)

  const searchOptions = {
    search_query: req.query.search_query,
    page: page,
  }

  database.searchForBooks(searchOptions)
    .then(function(books){
      books[0].authors = []
      books[0].genres = []

      res.render('books/search', {
        page: page,
        books: books,
      })
    })
    .catch(function(error){
      throw error
    })
});

//test routes
app.get('/test', function(req, res, next){
  database.getAllGenresWithBooks()
    .then(function(data){
      console.log(data);

      res.json(data)
    })
    .catch(function(error){
      log
      res.json({ERROR: error})
    })
});


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
