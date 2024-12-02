
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- create tables with SQL commands here 

-- stores data of the web app
CREATE TABLE IF NOT EXISTS blog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, 
    subtitle TEXT NOT NULL,
    author TEXT NOT NULL
);

-- stores data of article draft
CREATE TABLE IF NOT EXISTS draft (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, 
    subtitle TEXT NOT NULL,
    body TEXT NOT NULL,
    created INT,
    modified INT
);

-- stores data of published articles
CREATE TABLE IF NOT EXISTS publish (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, 
    subtitle TEXT NOT NULL,
    body TEXT NOT NULL,
    created INT,
    published INT
);

-- stores data of comments and id of which published article it belongs to
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INT,
    text TEXT NOT NULL,
    date INT
);

-- stores data of likes and id of which published article it belongs to
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INT,
    likes INT
);

--insert default data 
INSERT INTO blog (title, subtitle, author) VALUES ('My Blog', 'CM2040 - Databases, Networks and the Web', 'LY Wong');

COMMIT;

