const databaseName = process.env.NODE_ENV ? 'bookstoredb-test' : 'bookstoredb'
const connectionString = `postgres://${process.env.USER}@localhost:5432/${databaseName}`
const pgp = require('pg-promise')();
const db = pgp(connectionString);
const faker = require('faker');

// make querys here

const truncateAllTable = function(){
  return db.none(`
    TRUNCATE
      author_books,
      authors,
      book_genres,
      books,
      genres
  `)
}

const generateFakeBooks = function(){
  return getAllGenres()
    .then(genres => {
      var queries = [];
      for(let i = 30; i >= 0; i--){
        queries.push(createBook({
          title: faker.name.title(),
          description: faker.lorem.paragraphs(2),
          published_at: faker.date.past(),
          fiction: faker.random.boolean(),
          image_url: faker.image.image(100, 100),
          authors: [
            {
              name: faker.name.findName(),
              description: faker.lorem.paragraphs(1),
              image_url: faker.image.image(100, 100),
            }
          ],
          genres: [
            faker.random.arrayElement(genres).id,
            faker.random.arrayElement(genres).id,
            faker.random.arrayElement(genres).id
          ]
        }))
      }
      return Promise.all(queries)
    })
}

const PAGE_SIZE=10
const pageToOffset = function(page){
  page = page || 1
  return (page-1)*PAGE_SIZE;
}
const getAllBooks = function(page){
  const offset = pageToOffset(page)
  return db.any("select * from books LIMIT $1 OFFSET $2", [PAGE_SIZE, offset]);
}

const getAllAuthors = function(page){
  const offset = pageToOffset(page)
  return db.any('select * from authors LIMIT $1 OFFSET $2', [PAGE_SIZE, offset]);
}

const getAllGenres = function(page){
  const offset = pageToOffset(page)
  return db.any('select * from genres LIMIT $1 OFFSET $2', [PAGE_SIZE, offset]);
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

const getAllBooksWithAuthorsAndGenres = function(page){
  return getAllBooks(page).then(function(books){
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
      return books
    })
  })
}

const getAllBooksForAllGenres = function(){
  return getAllBooks().then(function(books){
    const bookIds = books.map(book => book.id)

    return getGenresByBookIds(bookIds).then(function(data){
      console.log('data', data)

      books.forEach(function(book){
        book.authors = authors.filter(author => author.book_id === book.id)
        book.genres = genres.filter(genre => genre.book_id === book.id)
      })

      console.log('Books 2nd', books)
      return books
    })
  })
}

const getAuthorById = function(id){
  return db.one('select authors.* from authors where id=$1', [id]);
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
  const sql = `
    INSERT INTO
      authors(image_url, name, description)
    VALUES
      ($1, $2, $3)
    RETURNING
      id
  `
  return db.one(sql, [attributes.image_url, attributes.name, attributes.description])
}

const createBook = function(attributes){
  const sql = `
    INSERT INTO
      books (title, description, published_at, fiction, image_url)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      id
  `
  var queries = [
    db.one(sql, [
      attributes.title,
      attributes.description,
      'now()',
      attributes.fiction,
      attributes.image_url
    ])
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

const searchForBooks = function(options){
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
      JOIN
        author_books
      ON
        books.id = author_books.book_id
      JOIN
        authors
      ON
        authors.id = author_books.author_id
      JOIN
        book_genres
      ON
        books.id = book_genres.book_id
      JOIN
        genres
      ON
        genres.id = book_genres.genre_id
      WHERE
        LOWER(books.title) LIKE $${variables.length}
      OR
        LOWER(authors.name) LIKE $${variables.length}
      OR
        LOWER(genres.name) LIKE $${variables.length}
    `
  }

  if (options.page){
    variables.push(PAGE_SIZE)
    variables.push(pageToOffset(options.page))
    sql += `
      LIMIT $${variables.length-1}
      OFFSET $${variables.length}
    `
  }
  console.log('SEARCH QUERY', sql, variables)
  return db.any(sql, variables)
}

module.exports = {
  pgp: pgp,
  db: db,
  truncateAllTable: truncateAllTable,
  getAllBooks: getAllBooks,
  getAllBooksWithAuthorsAndGenres: getAllBooksWithAuthorsAndGenres,
  getAllAuthors: getAllAuthors,
  getAllGenres: getAllGenres,
  getAllBooksForAllGenres: getAllBooksForAllGenres,
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
  generateFakeBooks: generateFakeBooks,
};
