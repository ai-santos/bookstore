DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  published_at DATE NOT NULL,
  image_url VARCHAR(255) NOT NULL,
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

DROP TABLE IF EXISTS books_authors;

CREATE TABLE books_authors (
  books_id INTEGER NOT NULL,
  authors_id INTEGER NOT NULL
);

DROP TABLE IF EXISTS books_genres;

CREATE TABLE books_genres (
  books_id INTEGER NOT NULL,
  genres_id INTEGER NOT NULL
);

--fixture data

INSERT INTO
  books (title, published_at, fiction)
VALUES
  ('Wealth of Nations', now(), false),
  ('White Fang', now(), true)

INSERT INTO
  genres (name)
VALUES
  ('Economics'),
  ('Fastasy'),
  ('Horror'),
  ('Sci-fi')

INSERT INTO
  books.id, genres.id
FROM
  books
CROSS JOIN
  genres
WHERE
  books.title = 'Wealth of Nations'
AND
  genres.name = 'Fantasy'
