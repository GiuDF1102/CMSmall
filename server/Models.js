'use strict';
const dayjs = require('dayjs');

// CREATE TABLE pagesTable (
//     "pageID" INTEGER PRIMARY KEY AUTOINCREMENT,
//     "authorID" INTEGER NOT NULL,
//     "type" TEXT NOT NULL,
//     "title" TEXT NOT NULL,
//     "creationDate" DATE NOT NULL,
//     "pubblicationDate" DATE
// );


// CREATE TABLE contentTable (
//     "contentID" INTEGER PRIMARY KEY AUTOINCREMENT,
//     "pageID" NOT NULL,
//     "type" TEXT NOT NULL,
//     "content" TEXT,
//     "position" INTEGER NOT NULL
// );

// CREATE TABLE usersTable (
//     "userID"  INTEGER PRIMARY KEY AUTOINCREMENT,
//     "username" TEXT NOT NULL,
//     "email"  TEXT NOT NULL,
//     "type" TEXT NOT NULL,
//     "salt"  TEXT,
//     "password"  TEXT
// );

// CREATE TABLE imagesTable (
//     "imageID" INTEGER PRIMARY KEY AUTOINCREMENT,
//     "link" TEXT NOT NULL
// );

// CREATE TABLE contentImagesTable (
//     "contentImageID" INTEGER PRIMARY KEY AUTOINCREMENT,
//     "pageID" NOT NULL,
//     "type" TEXT NOT NULL,
//     "content" INTEGER NOT NULL,
//     "position" INTEGER NOT NULL
// );

function Page(id, userID, username, type, title, creationDate, pubblicationDate) {
    this.id = id;
    this.userID = userID;
    this.username = username;
    this.type = type;
    this.title = title;
    this.creationDate = creationDate;
    this.pubblicationDate = pubblicationDate;
}

function User(id, type, email, username, salt, password) {
    this.id = id;
    this.type = type;
    this.email = email;
    this.username = username;
    this.salt = salt;
    this.password = password;
}

function Content(id, type, content, position) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.position = position;
}


function Image (id, link) {
    this.id = id;
    this.link = link;
}

module.exports = {
    Page,
    User,
    Content,
    Image
};