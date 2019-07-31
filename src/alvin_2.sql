-- RDMS
-- Relational Database Management System
-- Sebuah database, dimana menyimpan data dalam bentuk table
-- dan antar table bisa memiliki hubungan (relasi)

-- SQL = Bahasa yang digunakan untuk menjalankan database management system

-- MySQL = Database management system


-- PRIMARY KEY : Kolom yang memiliki data unique, sebagai patokan untuk setiap baris data

-- FOREIGN KEY : Kolom yang menyimpan primary key milik tabel lain

-- DECIMAL(X, Y) 
-- X = Banyak karakter angka keseluruhan
-- Y = Banyak karakter angka setelah tanda koma

-- DECIMAL (3,1) : 12,3

-- DDL (Data Definition Language)

-- SHOW DATABASES
SHOW DATABASES;

-- CREATE NEW DATABASE
CREATE DATABASE coffee_store;

-- USE DATABASE
USE coffee_store;

-- SHOW TABLES (mongodb : Collection)
SHOW TABLES;

SELECT * FROM customers;

-- CREATE TABLE
CREATE TABLE products (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30),
    price DECIMAL(3, 2), 
    origin VARCHAR(20)
);

-- Melihat informasi sebuah tabel
DESC products;

CREATE TABLE customers (
	id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    gender ENUM('M', 'F'),
    phone_number VARCHAR(12)
);

CREATE TABLE orders (
	id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    customer_id INT,
    order_time DATETIME,
    CONSTRAINT FK_ProductID
    -- kolom 'product_id' menyimpan data dari kolom 'id' di tabel 'products'
    FOREIGN KEY(product_id) REFERENCES products(id)
    -- ketika suatu data di hapus di tabel asal (products), maka dari disini akan ikut terhapus
    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_CustomerID
    -- kolom 'customer_id' menyimpan data dari kolom 'id' di tabel 'customers'
    FOREIGN KEY(customer_id) REFERENCES customers(id)
    -- ketika suatu data di hapus di tabel asal (customers), maka dari disini akan ikut terhapus
    ON DELETE CASCADE ON UPDATE CASCADE

);

-- ADD COLUMN
-- Menambahkan kolom (terakhir) dengan nama 'founder'
ALTER TABLE products
ADD COLUMN founder VARCHAR(20);

-- Menambahkan kolom description setelah kolom name
ALTER TABLE products
ADD COLUMN description VARCHAR(30) AFTER name;

-- REMOVE COLUMN
-- Menghapus kolom founder dari tabel products
ALTER TABLE PRODUCTS
DROP COLUMN founder;

-- DELETE TABLE
-- Menghapus tabel untuk_dihapus
DROP TABLE untuk_dihapus;

CREATE TABLE untuk_dihapus (
	ktp INT AUTO_INCREMENT PRIMARY KEY,
    untuk VARCHAR(20),
    dihapus INT
);

DESC products;

-- RENAME COLUMN
ALTER TABLE products
CHANGE origin asal VARCHAR(20);

-- CHANGE COLUMN DATA TYPE
ALTER TABLE products
MODIFY origin VARCHAR(25);


-- DML QUERY (Data Manipulation Language)

ALTER TABLE products
CHANGE origin coffee_origin VARCHAR(20);

DESC products;

-- INSERT DATA
INSERT INTO products (price, name, coffee_origin)
VALUES (2.50,'Espresso',  'Brazil');

INSERT INTO products (name, price, coffee_origin)
VALUES
('Macchiato',3.00,'Brazil'),
('Cappuccino',3.50,'Costa Rica'),
('Latte',3.50,'Indonesia'),
('Americano',3.00,'Brazil'),
('Flat White',3.50,'Indonesia'),
('Filter',3.00,'India'),
('Kopi Susu Keluarga',3.00,'Family Mart');

-- READ DATA
-- Memilih semua kolom dari tabel products
SELECT * FROM products;

-- Menampilkan kolom name dan coffee_origin dari tabel products;
SELECT name, coffee_origin FROM products;

SELECT coffee_origin, name FROM products;

-- WHERE
-- Menampilkan semua kolom yang nilai 'coffee_origin' = 'Brazil'
SELECT * FROM products WHERE coffee_origin = 'Brazil';
-- Menampilkan hanya kolom name untuk harga di atas 3.00
SELECT name FROM products WHERE price > 3.00;

-- AND
-- Pilih data yang harganya 3.00 dan berasar dari Brazil
SELECT * FROM products
WHERE price = 3.00
AND coffee_origin = 'Brazil';

-- OR
-- Pilih data yang harganya kurang dari 3.00 atau berasal dari Indonesia
SELECT * FROM products
WHERE price < 3.00
OR coffee_origin = 'Indonesia';

select * from customers;

-- (> < >= <=)
SELECT name, price FROM products
WHERE price >= 3.50;

-- Pilih customer yang tidak memiliki phone_number
SELECT * FROM customers
WHERE phone_number IS NULL;

-- Pilih customer yg tidak memiliki nama belakang namun memiliki nomor telepon
SELECT first_name, last_name, phone_number FROM customers
WHERE last_name IS NULL AND phone_number IS NOT NULL;


-- UPDATE DATA
-- Agar bisa update dimana where bisa berpatokan dengan semua kolom
SET SQL_SAFE_UPDATES = 0;

select * from products;
-- Mengubah coffee_origin 'India' menjadi 'Sri Lanka' yang miliki id 7
UPDATE products
SET coffee_origin = 'Colombia'
WHERE id = 7;

-- Ubah origin menjadi 'Ethiopia' dan harganya jadi 3.25 untuk yg berasal dari 'Brazil'
UPDATE products
SET price = 3.30, coffee_origin = 'Brazil'
WHERE coffee_origin = 'Ethiopia';

-- DELETE DATA
select * from products;

DELETE FROM products
WHERE id = 2;

-- Tampilkan nama depan, nomor tlp semua perempuan yang nama belakangnya bluth
SELECT first_name, phone_number FROM customers
WHERE gender = 'F'
AND last_name = 'Bluth';

-- Tampilkan nama product yang harganya di atas 3.00 atau yang dari Indonesia
SELECT name FROM products
WHERE price > 3.00
OR coffee_origin = 'Indonesia';

-- Tampilkan semua laki - laki yang tidak memiliki nomor tlp
SELECT * FROM customers
WHERE gender = 'M'
AND phone_number IS NULL;


-- In , Not In
-- Tampilkan customer yang punya nama belakang Taylor / Bluth / Armstrong
SELECT * FROM customers
WHERE last_name ='Blut' OR last_name = 'Taylor' OR last_name ='Amstrong';

SELECT * FROM customers
WHERE last_name IN ('Taylor', 'Bluth', 'Armstrong');

-- Tampilkan customer yang nama depannya bukan Katie / John / George
SELECT * FROM customers
WHERE first_name NOT IN ('Katie', 'John', 'George');

-- BETWEEN
-- Munculkan data order dari 1 januari - 6 januari
SELECT * FROM orders
WHERE order_time BETWEEN '2017-01-01' AND '2017-01-07';

-- Munculkan data order untuk cust id 5 sampai 11
SELECT * FROM orders
WHERE customer_id BETWEEN 5 AND 11;


-- LIKE
-- % berapapun jumlah karakter
-- _ satu buah karakter

SELECT * FROM customers;

-- first_name mengandung huruf 'o', dimana jumlah karakter sebelum dan sesudah 'o' tidak di batasi
SELECT * FROM customers
WHERE first_name LIKE '_o%'; -- Go blog

-- first_name mengandung huruf 'o', namun hanya boleh memiliki satu karakter sebelum dan sesudah huruf 'o'
SELECT * FROM customers
WHERE first_name LIKE '_o_';


-- ORDER (DEFAULT: ASC / DESC)
-- Di urutkan berdasarkan harga ASCENDING
SELECT * FROM products
ORDER BY price;

-- Diurutkan berdasarkan harga DESCENDING
SELECT * FROM products
ORDER BY price DESC;


-- DISTINCT
SELECT * FROM products;
-- Menampilkan nilai secara unique untuk kolom tertentu
SELECT DISTINCT price, coffee_origin FROM products;

-- Menampilkan product apa yang pernah di beli oleh customer
SELECT DISTINCT customer_id, product_id FROM orders
ORDER BY customer_id;


-- LIMIT

-- Menampilkan 3 baris data teratas
SELECT * FROM products
LIMIT 3;

-- Tampilkan 10 data customer yang sudah di urutkan berdasarkan nama depan
SELECT * FROM customers
ORDER BY first_name
LIMIT 10;

-- ALIAS
-- Mengganti nama kolom hanya ketika di tampilkan, tp tidak mengganti nama aslinya
SELECT
	first_name AS nama_depan,
    last_name AS `nama belakang`,
    gender AS 'Jenis klmn',
    phone_number AS 'No Tlp'
FROM customers;


























