const connectionString = `postgres://${process.env.USER}@localhost:5432/bookstoredb`
const pgp = require('pg-promise')();

const db = pgp(connectionString);

// make querys here

const getAllBooks = function(id){
  return db.any("select * from books");
}

const getAllBooksWithAuthorsAndGenres = function(){
  return getAllBooks().then(function(books){
    console.log('GOT BOOKS', books)
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
    console.log('bookIds', bookIds)
    return db.any(sql, [bookIds])
      .then(function(authors){
        books.forEach(book => {
          console.log('BOOK', book)
          book.authors = authors.filter(author => author.book_id === book.id);
        })
        return books
      })
      .catch(function(error){
        console.error(error)
        throw error;
      })
  })
}
module.exports = {
  pgp: pgp,
  db: db,
  getAllBooks: getAllBooks,
  getAllBooksWithAuthorsAndGenres: getAllBooksWithAuthorsAndGenres,
};
