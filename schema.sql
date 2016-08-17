DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  published_at DATE NOT NULL,
  fiction BOOLEAN NOT NULL
);

DROP TABLE IF EXISTS authors;

CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
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
  books (image_url, title, description, published_at, fiction)
VALUES
  ('http://i.imgur.com/oyQPrQKt.gif', 'Wealth of Nations', 'The Wealth of Nations is a clearly written account of economics at the dawn of the Industrial Revolution. The book was a landmark work in the history and economics as it was comprehensive and an accurate characterization of the economic mechanisms at work in modern economics. Smith believed in a Meritocracy. Smith emphasized the advancement that one could take based on their will to better themselves. This is simply one of the most important books ever written on the subject of economics.', now(), false),
  ('http://i.imgur.com/4oRxld2t.jpg', 'White Fang', 'Two men are out in the wild of the north. Their dogs disappear as they are lured by a she-wolf and eaten by the pack. They only have three bullets left and Bill, one of the men, uses them to try to save one of their dogs; he misses and is eaten with the dog. Only Henry and two dogs are left; he makes a fire, trying to drive away the wolves. They draw in close, and he is almost eaten, saved only by a company of men who were traveling nearby.', now(), true),
  ('http://i.imgur.com/4rEwlYwt.jpg', 'Snow Crash', 'In reality, Hiro Protagonist delivers pizza for Uncle Enzo’s CosoNostra Pizza Inc., but in the Metaverse he’s a warrior prince. Plunging headlong into the enigma of a new computer virus that’s striking down hackers everywhere, he races along the neon-lit streets on a search-and-destroy mission for the shadowy virtual villain threatening to bring about infocalypse. Snow Crash is a mind-altering romp through a future America so bizarre, so outrageous…you’ll recognize it immediately.', now(), true),
  ('http://i.imgur.com/APTy0mLt.jpg', 'Cryptonomicon', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui sint, cumque cupiditate corporis ab voluptatum earum magni. Qui ut hic quod nobis placeat cupiditate assumenda itaque enim unde quas. Iste.', now(), true),
  ('http://i.imgur.com/w2q0wM1t.jpg', 'Anathem', 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui sint, cumque cupiditate corporis ab voluptatum earum magni. Qui ut hic quod nobis placeat cupiditate assumenda itaque enim unde quas. Iste.', now(), true);







INSERT INTO
  authors (image_url, name, description)
VALUES
  ('http://i.imgur.com/hmkzBBwt.jpg', 'Adam Smith', 'He was an economist and philosopher who wrote what is considered the "bible of capitalism," The Wealth of Nations, in which he details the first system of political economy.'),
  ('http://i.imgur.com/ktNNx1It.jpg', 'Neal Stephenson', 'He is an American writer and game designer known for his works of speculative fiction. His novels have been variously categorized as science fiction, historical fiction, cyberpunk, and "postcyberpunk".'),
  ('http://i.imgur.com/iU1AQ8xt.jpg' ,'Jack London', 'Jack London was born John Griffith Chaney on January 12, 1876, in San Francisco, California. After working in the Klondike, London returned home and began publishing stories. His novels, including The Call of the Wild, White Fang and Martin Eden, placed London among the most popular American authors of his time. London, who was also a journalist and an outspoken socialist, died in 1916.');


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
