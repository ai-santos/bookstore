DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  published_at DATE NOT NULL,
  fiction BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS authors;

CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS genres;

CREATE TABLE genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS author_books;

CREATE TABLE author_books (
  book_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL
);

DROP TABLE IF EXISTS book_genres;

CREATE TABLE book_genres (
  book_id INTEGER NOT NULL,
  genre_id INTEGER NOT NULL
);




--fixture data
INSERT INTO
  genres (name, description)
VALUES
  ('Economics', 'BLAH BLAH'),
  ('Fantasy', 'BLAH BLAH'),
  ('Horror', 'BLAH BLAH'),
  ('Sci-Fi', 'BLAH BLAH');

INSERT INTO
  books (title, description, published_at, fiction)
VALUES
  ('Wealth of Nations', '', now(), false),
  ('White Fang', '', now(), true),
  ('Snow Crash', '', now(), true),
  ('Cryptonomicon', '', now(), true),
  ('Anathem', '', now(), true);

INSERT INTO
  authors (name, description)
VALUES
  ('Adam Smith', ''),
  ('Neal Stephenson', ''),
  ('Jack London', '');


INSERT INTO
  author_books
SELECT
  books.id, authors.id
FROM
  books
CROSS JOIN
  authors
WHERE
  books.title = 'Wealth of Nations'
AND
  authors.name = 'Adam Smith';


INSERT INTO
  author_books
SELECT
  books.id, authors.id
FROM
  books
CROSS JOIN
  authors
WHERE
  books.title = 'White Fang'
AND
  authors.name = 'Jack London';


INSERT INTO
  author_books
SELECT
  books.id, authors.id
FROM
  books
CROSS JOIN
  authors
WHERE
  books.title = 'Snow Crash'
AND
  authors.name = 'Neal Stephenson';


INSERT INTO
  author_books
SELECT
  books.id, authors.id
FROM
  books
CROSS JOIN
  authors
WHERE
  books.title = 'Cryptonomicon'
AND
  authors.name = 'Neal Stephenson';


INSERT INTO
  author_books
SELECT
  books.id, authors.id
FROM
  books
CROSS JOIN
  authors
WHERE
  books.title = 'Anathem'
AND
  authors.name = 'Neal Stephenson';



INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Wealth of Nations'
AND
  genres.name = 'Economics';


INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'White Fang'
AND
  genres.name = 'Fantasy';



INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Snow Crash'
AND
  genres.name = 'Sci-Fi';



INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Cryptonomicon'
AND
  genres.name = 'Horror';


INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Cryptonomicon'
AND
  genres.name = 'Sci-Fi';



INSERT INTO
  book_genres
SELECT
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Anathem'
AND
  genres.name = 'Fantasy';










-- QUERIES

-- give me all the books for a specific author
SELECT
  *
FROM
  books
JOIN
  author_books
ON
  books.id = author_books.book_id
JOIN
  authors
ON
  authors.id = author_books.author_id
WHERE
  authors.name = 'Adam Smith'
;

-- give me all the books with a title like X

SELECT
  *
FROM
  books
WHERE
  title LIKE '%ite%';




-- give me all the books for a specific genre
SELECT
  books.*
FROM
  books
JOIN
  book_genres
ON
  books.id = book_genres.book_id
JOIN
  genres
ON
  genres.id = book_genres.genre_id
WHERE
  genres.name IN ('Economics', 'Horror')
;

-- give me all the books for a specific genre
SELECT
  books.*
FROM
  books
JOIN
  book_genres
ON
  books.id = book_genres.book_id
JOIN
  genres
ON
  genres.id = book_genres.genre_id
JOIN
  author_books
ON
  books.id = author_books.book_id
JOIN
  authors
ON
  authors.id = author_books.author_id
WHERE
  genres.name IN ('Economics', 'Sci-Fi')
AND
  authors.name LIKE '%Adam%'
;
