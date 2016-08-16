const connectionString = `postgres://${process.env.USER}@localhost:5432/bookstoredb`
const pgp = require('pg-promise')();

const db = pgp(connectionString);

// make querys here

const getAllBooks = function(){
  return db.any("select * from books");
}

const getBooksById = function(id) {
  return db.one('select books.* from books where id=$1', [id]);
}

const getGenresByBookId = function(bookId){
  const sql = `
    SELECT
      genres.*
    FROM
      genres
    JOIN
      book_genres
    ON
      genres.id = book_genres.genre_id
    WHERE
      book_genres.book_id=$1
  `;
  return db.many(sql, [bookId]);
}

const getAuthorsByBookId = function(bookId){
  const sql = `
    SELECT
      authors.*
    FROM
      authors
    JOIN
      author_books
    ON
      authors.id = author_books.author_id
    WHERE
      author_books.book_id=$1
  `;
  return db.many(sql, [bookId]);
}

const getAllBooksWithAuthorsAndGenres = function(){
  return getAllBooks().then(function(books){
    const bookIds = books.map(book => book.id)

    const sql = `
      SELECT
        authors.*,
        author_books.book_id
      FROM
        authors
      JOIN
        author_books
      ON
        authors.id=author_books.author_id
      WHERE
        author_books.book_id IN ($1:csv)
    `;

    return db.any(sql, [bookIds])
      .then(function(authors){
        books.forEach(book => book.authors = authors.filter(author => author.book_id === book.id))
        return books
      })
      .catch(function(error){
        throw error;
      })
  })
}

module.exports = {
  pgp: pgp,
  db: db,
  getAllBooks: getAllBooks,
  getAllBooksWithAuthorsAndGenres: getAllBooksWithAuthorsAndGenres,
  getBooksById: getBooksById,
  getGenresByBookId: getGenresByBookId,
  getAuthorsByBookId: getAuthorsByBookId
};
