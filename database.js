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
      console.log('data', data)

      const genres = data[0]
      const authors = data[1]
      books.forEach(function(book){
        book.authors = authors.filter(author => author.book_id === book.id)
        book.genres = genres.filter(genre => genre.book_id === book.id)
      })

      console.log('Books 2nd', books)
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

const associateAuthorsWithBook = function(authorIds, bookId){
  authorIds = Array.isArray(authorIds) ? authorIds : [authorIds]
  let queries = authorIds.map(authorId => {
    const sql = `
      INSERT INTO
        author_books(book_id, author_id)
      VALUES
        ($1, $2)
    `
    return db.none(sql, [bookId, authorId])
  })
  return Promise.all(queries)
}

const associateGenresWithBook = function(genreIds, bookId){
  genreIds = Array.isArray(genreIds) ? genreIds : [genreIds]

  console.log('IDs', genreIds, bookId);

  let queries = genreIds.map(genreId => {
    let sql = `
      INSERT INTO
        book_genres(book_id, genre_id)
      VALUES
        ($1, $2)
    `
    return db.none(sql, [bookId, genreId])
  })
  return Promise.all(queries)
}

const createAuthor = function(attributes){
  console.log(attributes)
  const sql = `
    INSERT INTO
      authors(image_url, name, description)
    VALUES
      ($1, $2, $3)
    RETURNING
      id
  `
  return db.one(sql, ['', attributes.name, attributes.description])
}

const createBook = function(attributes){
  const sql = `
    INSERT INTO
      books(title, description, published_at, fiction)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      id
  `
  var queries = [
    db.one(sql, [
      attributes.book.title,
      attributes.book.description,
      'now()',
      true
    ])
  ]
  // also create the authors
  attributes.book.authors.forEach(author =>
    queries.push(createAuthor(author))
  )

  console.log('queries', queries);

  return Promise.all(queries)
    .then(authorIds => {
      authorIds = authorIds.map(x => x.id)
      const bookId = authorIds.shift()
      return Promise.all([
        associateAuthorsWithBook(authorIds, bookId),
        associateGenresWithBook(attributes.book.genres, bookId),
      ]).then(function(){
        return bookId;
      })
    })
}

const searchForBooks = function(options){
  console.log(options)

  const variables = []
  let sql = `
    SELECT
      DISTINCT(books.*)
    FROM
      books
  `
  if (options.search_query){
    let search_query = options.search_query
      .toLowerCase()
      .replace(/^ */, '%')
      .replace(/ *$/, '%')
      .replace(/ +/g, '%')

    variables.push(search_query)
    sql += `
        WHERE
      LOWER(books.title) LIKE $${variables.length}
    `
  }
  console.log('----->', sql, variables)
  return db.any(sql, variables)
}


const searchForBook = searchTerm => {
  const sql = `
    SELECT
      DISTINCT(books.*)
    FROM
      books
    JOIN
      book_author
    ON
      authors.id=book_author.author_id
    JOIN
      books
    ON
      book_author.book_id=books.id
    WHERE
      authors.author LIKE '$1%';
  `
  return db.any(sql, [searchTerm])
}

const searchForAuthor = searchTerm => {
  const sql = `
    SELECT
      DISTINCT(authors.*)
    FROM
      authors
    JOIN
      book_author
    ON
      books.id=book_author.book_id
    JOIN
      authors
    ON
      book_author.author_id=authors.id
    WHERE
      authors.author LIKE '$1%';
  `
  return db.any(sql, [searchTerm])
}

module.exports = {
  pgp: pgp,
  db: db,
  getAllBooks: getAllBooks,
  getAllBooksWithAuthorsAndGenres: getAllBooksWithAuthorsAndGenres,
  getAllAuthors: getAllAuthors,
  getAllGenres: getAllGenres,
  createAuthor:createAuthor,
  createBook: createBook,
  getGenresByBookIds: getGenresByBookIds,
  getBookById: getBookById,
  getBooksByGenreId: getBooksByGenreId,
  getBooksByAuthorId: getBooksByAuthorId,
  getAuthorById: getAuthorById,
  getAuthorsByBookIds: getAuthorsByBookIds,
  getBookWithGenresAndAuthorsById: getBookWithGenresAndAuthorsById,
  searchForBooks: searchForBooks,
  searchForBook: searchForBook,
  searchForAuthor: searchForAuthor,
};
