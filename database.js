const connectionString = `postgres://${process.env.USER}@localhost:5432/bookstoredb`
const pgp = require('pg-promise')();

const db = pgp(connectionString);

// make querys here

const getAllBooks = function(){
  return db.any("select * from books");
}

const getBookById = function(bookId) {
  return db.one('select books.* from books where id=$1', [bookId]);
}

const getBookWithGenresAndAuthorsById = function(bookId){
  return Promise.all([
    getBookById(bookId),
    getGenresByBookIds([bookId]),
    getAuthorsByBookIds([bookId]),
  ]).then(function(data){
    const book = data[0]
    book.genres = data[1]
    book.authors = data[2]
    return book;
  })
}


const getGenresByBookIds = function(bookId){
  const sql = `
    SELECT
      genres.*,
      book_genres.book_id
    FROM
      genres
    JOIN
      book_genres
    ON
      genres.id = book_genres.genre_id
    WHERE
      book_genres.book_id IN ($1:csv)
  `;
  return db.many(sql, [bookId]);
}

const getAuthorsByBookIds = function(bookId){
  const sql = `
    SELECT
      authors.*,
      author_books.book_id
    FROM
      authors
    JOIN
      author_books
    ON
      authors.id = author_books.author_id
    WHERE
      author_books.book_id IN ($1:csv)
  `;
  return db.many(sql, [bookId]);
}

const getAllBooksWithAuthorsAndGenres = function(){
  return getAllBooks().then(function(books){
    const bookIds = books.map(book => book.id)

    return Promise.all([
      getGenresByBookIds(bookIds),
      getAuthorsByBookIds(bookIds),
    ]).then(function(data){
      const genres = data[0]
      const authors = data[1]
      books.forEach(function(book){
        book.authors = authors.filter(author => author.book_id === book.id)
        book.genres = genres.filter(genre => genre.book_id === book.id)
      })
      return books
    })
  })
}

const getAllAuthors = function(){
  return db.any('select * from authors');
}

const getAuthorById = function(id){
  return db.one('select authors.* from authors where id=$1', [id]);
}

const getAllGenres = function(){
  return db.any('select * from genres');
}

const getBooksByGenreId = function(genre_id){
  const sql = `
    SELECT
      books.*
    FROM
      books
    JOIN
      book_genres
    ON
      books.id = book_genres.book_id
    WHERE
      book_genres.genre_id=$1
  `;
  console.log(sql)
  return db.any(sql, [genre_id]);
}

const getBooksByAuthorId = function(author_id) {
  const sql = `
    SELECT
      books.*
    FROM
      books
    JOIN
      author_books
    ON
      books.id = author_books.book_id
    WHERE
      author_books.author_id=$1
  `;
  console.log(sql)
  return db.any(sql, [author_id]);
}

const createAuthor = function(attributes){
  console.log(attributes)
  const sql = `
    INSERT INTO
      author(name, description)
    VALUES
      ($1, $2)
    RETURNING
      id
  `
  return db.one(sql, [attributes.name, attributes.description])
}

const createBook = function(attributes){
  console.log(attributes)
  const sql = `
    INSERT INTO
      book (title, description, published_at, fiction)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id
  `
  var queries = [
    db.one(sql, [
      attributes.title,
      attributes.description,
      'now()',
      attributes.fiction
    ]) // create the book
  ]
  // also create the authors
  attributes.authors.forEach(author =>
    queries.push(createAuthor(author))
  )

  return Promise.all(queries)
    .then(authorIds => {
      authorIds = authorIds.map(x => x.id)
      const bookId = authorIds.shift()
      return Promise.all([
        associateAuthorsWithBook(authorIds, bookId),
        associateGenresWithBook(attributes.genres, bookId),
      ]).then(function(){
        return bookId;
      })
    })
}

module.exports = {
  pgp: pgp,
  db: db,
  getAllBooks: getAllBooks,
  getAllBooksWithAuthorsAndGenres: getAllBooksWithAuthorsAndGenres,
  getAllAuthors: getAllAuthors,
  getAllGenres: getAllGenres,
<<<<<<< HEAD
  createAuthor:createAuthor,
  createBook: createBook,
=======
  getGenresByBookIds: getGenresByBookIds,
  getBookById: getBookById,
  getBooksByGenreId: getBooksByGenreId,
  getBooksByAuthorId: getBooksByAuthorId,
  getAuthorById: getAuthorById,
  getAuthorsByBookIds: getAuthorsByBookIds,
  getBookWithGenresAndAuthorsById: getBookWithGenresAndAuthorsById,
>>>>>>> 4e55e2c8e6420cbc81092d2993b6a538a773f9aa
};
