CREATE DATABASE okra;
USE okra;

SELECT * FROM album;
SELECT * FROM track;
SELECT * FROM genre;
SELECT * FROM album_genre;

SELECT * FROM users;
SELECT * FROM transactions;
SELECT * FROM users_trans_album;

SELECT t.track_number, a.album_artist, t.track_name, a.picture, t.track_duration, t.mp3  FROM album a JOIN track t ON a.album_id = t.album_id WHERE a.album_id = 1;

SELECT * FROM users WHERE username = 'test' OR email = 'test@gmail.com';

SELECT * FROM track ORDER BY track_duration;

SELECT * FROM album ORDER BY upload_date;

SELECT * FROM album a JOIN track t ON a.album_id = t.album_id;

SELECT a.album_name, a.album_artist, t.track_number, t.track_name
FROM album a JOIN track t ON a.album_id = t.album_id
WHERE a.album_name = 'Cosmic Surgery'
ORDER BY t.track_number;

DROP TABLE album;
DROP TABLE track;
DROP TABLE genre;
DROP TABLE album_genre;
DROP TABLE users_trans_album;
DROP TABLE users;

ALTER TABLE album AUTO_INCREMENT = 1;
ALTER TABLE track AUTO_INCREMENT = 1;

DELETE FROM album WHERE album_id > 0;
DELETE FROM track WHERE track_id > 0;
DELETE FROM genre WHERE genre_id > 0;

INSERT INTO genre (genre) VALUES('Jazz');

SELECT * FROM genre WHERE genre = 'Jazz';

CREATE TABLE album(
album_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
album_name VARCHAR(100) NOT NULL,
album_artist VARCHAR(100) NOT NULL,
genre VARCHAR(100) NOT NULL,
release_year INT NOT NULL,
picture VARCHAR(100),
price INT NOT NULL,
stock INT,
upload_date VARCHAR(100) NOT NULL,
deleted BOOL
);

CREATE TABLE track(
track_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
album_id INT UNSIGNED,
track_number INT NOT NULL,
track_name VARCHAR(100) NOT NULL,
track_duration INT NOT NULL,
mp3 VARCHAR(100),
CONSTRAINT FK_TrackId
FOREIGN KEY(album_id) REFERENCES album(album_id)
ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE genre(
genre_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
genre VARCHAR(100)
);

CREATE TABLE album_genre(
album_genre_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
album_id INT UNSIGNED,
genre_id INT UNSIGNED,
CONSTRAINT FK_AlbumGenreAlbumId
FOREIGN KEY(album_id) REFERENCES album(album_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_AlbumGenreGenreId
FOREIGN KEY(genre_id) REFERENCES genre(genre_id)
ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE users(
user_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
username VARCHAR(100) NOT NULL,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
user_type VARCHAR(100) NOT NULL,
profile_picture VARCHAR(100)
);

SELECT * FROM users;

CREATE TABLE transactions(
transaction_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
transaction_type VARCHAR(100) NOT NULL,
transaction_date VARCHAR(100) NOT NULL,
picture VARCHAR(100)
);

CREATE TABLE users_trans_album(
id INT unsigned AUTO_INCREMENT NOT NULL PRIMARY KEY,
user_id INT unsigned,
album_id INT unsigned,
transaction_id INT unsigned,
CONSTRAINT FK_UserUTA
FOREIGN KEY(user_id) REFERENCES users(user_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_AlbumUTA
FOREIGN KEY(album_id) REFERENCES album(album_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_TransactionUTA
FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id)
ON DELETE CASCADE ON UPDATE CASCADE
);



-- ------------------------------------------------------





CREATE TABLE users(
user_id INT unsigned AUTO_INCREMENT NOT NULL PRIMARY KEY,
username VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
user_type VARCHAR(100) NOT NULL
);

SELECT * FROM users;

CREATE TABLE transactions(
transaction_id INT unsigned AUTO_INCREMENT NOT NULL PRIMARY KEY,
transaction_status VARCHAR(100) NOT NULL,
transaction_date datetime NOT NULL,
picture VARCHAR(100)
);

SELECT * FROM transactions;



CREATE TABLE cart(
cart_id INT unsigned AUTO_INCREMENT NOT NULL PRIMARY KEY,
user_id INT unsigned,
album_id INT unsigned,
transaction_id INT unsigned,
CONSTRAINT FK_UserID
FOREIGN KEY(user_id) REFERENCES users(user_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_AlbumId
FOREIGN KEY(album_id) REFERENCES album(album_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_TransactionId
FOREIGN KEY(transaction_id) REFERENCES transactions(transaction_id)
);

SELECT * FROM cart;

-- SELECT JOIN 3
SELECT t.transaction_status, a.album_name, a.album_artist, a.price
FROM users u
JOIN cart c ON u.user_id = c.user_id
JOIN album a ON c.album_id = a.album_id
JOIN transactions t ON c.transaction_id = t.transaction_id
WHERE t.transaction_status = 'cart';


