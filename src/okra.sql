USE okra;

SELECT * FROM album;
SELECT * FROM track;
SELECT * FROM users;
SELECT * FROM trans_detail;
SELECT * FROM trans;

SELECT * FROM album ORDER BY album_id DESC;

SELECT u.user_id, d.td_id, d.trans_type, COUNT(t.id) AS total_album,  SUM(a.price) AS total_harga FROM users u
JOIN trans t ON u.user_id = t.user_id
JOIN trans_detail d ON t.td_id = d.td_id
JOIN album a ON a.album_id = t.album_id
WHERE d.trans_type != 'cart' AND u.user_id = 2
GROUP BY d.td_id;


SELECT t.track_number, a.album_artist, t.track_name, a.picture, t.track_duration, t.mp3
FROM album a JOIN track t ON a.album_id = t.album_id WHERE a.album_id = 1;

-- ALBUM TRACK JOIN SELECT
SELECT t.track_number, a.album_artist, t.track_name, a.picture, t.track_duration, t.mp3
FROM album a JOIN track t ON a.album_id = t.album_id
ORDER BY t.track_number;

-- TRANSACTION JOIN SELECT
SELECT d.trans_type, a.album_name, a.album_artist, a.price
FROM users u
JOIN trans t ON u.user_id = t.user_id
JOIN album a ON t.album_id = a.album_id
JOIN trans_detail d ON t.td_id = d.td_id;

-- -----
SELECT a.album_artist, a.album_name, a.price, t.qty
FROM users u
JOIN trans t ON u.user_id = t.user_id
JOIN trans_detail d ON t.td_id = d.td_id
JOIN album a ON a.album_id = t.album_id
WHERE u.user_id = 2 AND d.trans_type = 'cart';

SELECT * FROM trans;
SELECT * FROM trans_detail;

INSERT INTO trans_detail (trans_type, trans_date) VALUES ('cart', 'sekarang');
INSERT INTO trans (user_id, album_id, td_id) VALUES (2,1,1); 

UPDATE album
SET deleted = 1
WHERE album_id = 5;
-- ----

SELECT * FROM users WHERE username = 'test' OR email = 'test@gmail.com';
SELECT * FROM track ORDER BY track_duration;
SELECT * FROM album ORDER BY upload_date;

DROP TABLE album;
DROP TABLE track;
DROP TABLE users;
DROP TABLE trans_detail;
DROP TABLE trans;

UPDATE album SET stock = 0 WHERE album_id = 4;

DELETE FROM album WHERE album_id > 0;
ALTER TABLE album AUTO_INCREMENT = 1;
DELETE FROM track WHERE track_id > 0;
ALTER TABLE track AUTO_INCREMENT = 1;
DELETE FROM users WHERE user_id > 0;
ALTER TABLE users AUTO_INCREMENT = 1;

DELETE FROM trans WHERE id > 0;
ALTER TABLE trans AUTO_INCREMENT = 1;

DELETE FROM trans_detail WHERE td_id > 0;
ALTER TABLE trans AUTO_INCREMENT = 1;

-- CREATE TABLES

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

CREATE TABLE users(
user_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
username VARCHAR(100) NOT NULL,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL,
password VARCHAR(100) NOT NULL,
user_type VARCHAR(100) NOT NULL,
profile_picture VARCHAR(100)
);

CREATE TABLE trans_detail(
td_id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
trans_type VARCHAR(100) NOT NULL,
trans_date VARCHAR(100) NOT NULL,
picture VARCHAR(100)
);

CREATE TABLE trans(
id INT unsigned AUTO_INCREMENT NOT NULL PRIMARY KEY,
user_id INT unsigned,
album_id INT unsigned,
td_id INT unsigned,
qty INT NOT NULL,
CONSTRAINT FK_UserUTA
FOREIGN KEY(user_id) REFERENCES users(user_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_AlbumUTA
FOREIGN KEY(album_id) REFERENCES album(album_id)
ON DELETE CASCADE ON UPDATE CASCADE,
CONSTRAINT FK_TransDetailUTA
FOREIGN KEY(td_id) REFERENCES trans_detail(td_id)
ON DELETE CASCADE ON UPDATE CASCADE
);