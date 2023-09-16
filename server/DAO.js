const sqlite = require('sqlite3');
const models = require('./Models.js');
const db = require('./db');


//GET getAllPublishedPages
function getAllPublishedPages() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT pagesTable.ID, usersTable.ID as userID, username, pagesTable.type, title, creationDate, pubblicationDate  FROM pagesTable, usersTable
        WHERE usersTable.ID = pagesTable.authorID
        AND pagesTable.type = "published"
        ORDER BY pagesTable.pubblicationDate`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                const pages = rows.map((row) => {
                    return new models.Page(row.ID, row.userID, row.username, row.type, row.title, row.creationDate, row.pubblicationDate);
                });
                resolve(pages);
            }
        });
    });
}

//GET getAllpages
function getAllPages() {
    //No need to check the userID 
    return new Promise((resolve, reject) => {
        const sql = `SELECT pagesTable.ID, usersTable.ID as userID, username, pagesTable.type, title, creationDate, pubblicationDate  FROM pagesTable, usersTable
        WHERE usersTable.ID = pagesTable.authorID ORDER BY pubblicationDate`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                const pages = rows.map((row) => {
                    return new models.Page(row.ID, row.userID, row.username, row.type, row.title, row.creationDate, row.pubblicationDate);
                });
                resolve(pages);
            }
        });
    });
}

//GET getPageByID
function getPageByID(pageID) {
    return new Promise(async (resolve, reject) => {
        //FETCHING PAGE
        let page = {}
        const sqlPage = `SELECT pagesTable.ID, usersTable.ID as userID, usersTable.username, pagesTable.type, pagesTable.title, pagesTable.creationDate, pagesTable.pubblicationDate 
                     FROM pagesTable, usersTable 
                     WHERE usersTable.ID = pagesTable.authorID 
                     AND pagesTable.ID = ?;`
        db.get(sqlPage, [pageID], (err, row) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                page =  new models.Page(row.ID, row.userID, row.username, row.type, row.title, row.creationDate, row.pubblicationDate);
                //FETCHING CONTENT
                let contents = []
                const sqlContent = "SELECT * FROM contentTable WHERE contentTable.pageID = ?"
                db.all(sqlContent, [pageID], (err, rows) => {
                    if (err) {
                        reject({status:500, message:"Database error"});
                    } else {
                        contents = rows.map((row) => new models.Content(row.ID, row.type, row.content, row.position));
                        resolve({page:  page, content: contents})
                    }
                });
            }
        });
    });
}

//DELETE deletePage
function deletePage(pageID, userID, role) {
    return new Promise((resolve, reject) => {
        //check if the user is the author of the page
        const sqlCheck = `SELECT * FROM pagesTable WHERE pagesTable.ID = ?`;
        db.get(sqlCheck, [pageID], (err, row) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                if (row.authorID == userID || role == "admin") {
                    //delete page                                
                    const sql = `DELETE FROM pagesTable WHERE pagesTable.ID = ?`;
                    db.run(sql, [pageID], (err) => {

                        if (err) {
                            reject({status:500, message:"Database error"});
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    reject({status:403, message:"You can't delete this page"});
                }
            }
        })
    });
}

//POST createPage
function createPage(page, userID) {
    return new Promise((resolve, reject) => {
        //creating page
        const sqlPage = `INSERT INTO pagesTable (authorID, type, title, creationDate, pubblicationDate) VALUES (?, ?, ?, ?, ?)`;
        db.run(sqlPage, [userID, page.page.type, page.page.title, page.page.creationDate, page.page.pubblicationDate], function (err) {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                //get last inserted id
                const sqlLastID = `SELECT max(ID) as lastID FROM pagesTable`;
                db.get(sqlLastID, [], (err, row) => {
                    if (err) {
                        reject({status:500, message:"Database error"});
                    } else {
                        page.page.id = row.lastID
                        //creating content
                        const sqlContent = `INSERT INTO contentTable (pageID, type, content, position) VALUES (?, ?, ?, ?)`;
                        page.content.forEach((content) => {
                            db.run(sqlContent, [page.page.id, content.type, content.content, content.position], function (err) {
                                if (err) {
                                    reject({status:500, message:"Database error"});
                                } else {
                                    resolve(true);
                                }
                            });
                        });
                    }
                });
            }
        });  
    });
}

//PUT updatePageByID
function updatePageByID(PageID, page, userID, role) {
    return new Promise((resolve, reject) => {
        //check if the user is the author of the page
        const sqlCheck = `SELECT * FROM pagesTable WHERE pagesTable.ID = ?`;
        db.get(sqlCheck, [PageID], (err, row) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                if (row.authorID == userID ||  role == "admin") {
                    //updating page
                    const sqlPage = `UPDATE pagesTable SET type = ?, title = ?, pubblicationDate = ? WHERE pagesTable.ID = ?`;
                    db.run(sqlPage, [page.page.type, page.page.title, page.page.pubblicationDate, PageID], function (err) {
                        if (err) {
                            reject({status:500, message:"Database error"});
                        } else {
                            //updating content
                            const sqlContentUp = `UPDATE contentTable SET type = ?, content = ?, position = ? WHERE contentTable.ID = ?`;
                            page.lists.up.forEach((content) => {
                                db.run(sqlContentUp, [content.type, content.content, content.position, content.id], function (err) {
                                    if (err) 
                                        reject({status:500, message:"Database error"});
                                });
                            });

                            //creating content
                            const sqlContentCreate = `INSERT INTO contentTable (pageID, type, content, position) VALUES (?, ?, ?, ?)`;
                            page.lists.add.forEach((content) => {
                                db.run(sqlContentCreate, [PageID, content.type, content.content, content.position], function (err) {
                                    if (err)
                                        reject({status:500, message:"Database error"});
                                });
                            })

                            //deleting content
                            const sqlContentDel = `DELETE FROM contentTable WHERE contentTable.ID = ?`;
                            page.lists.del.forEach((content) => {
                                db.run(sqlContentDel, [content.id], function (err) {
                                    if (err) 
                                        reject({status:500, message:"Database error"});
                                });
                            })

                        }
                    });

                    resolve(true);
                } else {
                    reject({status:403, message:"You can't update this page"});
                }
            }
        })
    });

}

//GET getAllImages
function getAllImages() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM imagesTable`;
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                const images = rows.map((row) => {
                    return new models.Image(row.ID, row.link);
                });
                resolve(images);
            }
        });
    });
}

//PUT modifyTitleWebSite
function modifyWebsiteTitle(title, role) {
    return new Promise((resolve, reject) => {
        if(role == "admin") {
            const sql = `UPDATE settings SET value = ? WHERE name = "title"`;
            db.run(sql, [title], function (err) {
                if (err) {
                    reject({status:500, message:"Database error"});
                } else {
                    resolve(true);
                }
            });
        } else {
            reject({status:403, message:"You can't modify the title of the website"});
        }
    });
}

//GET websiteTitle
function getWebsiteTitle() {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM settings WHERE name = "title"`;
        db.get(sql, [], (err, row) => {
            if (err) {
                reject({status:500, message:"Database error"});
            } else {
                resolve(row.value);
            }
        });
    });
}

//PUT setAuthor
function setAuthor(pageID, username, role) {
    return new Promise((resolve, reject) => {
        if(role != "admin") {
            reject({status:403, message:"You can't modify the author of the page"});            
        } else {
            //check if user exists and return ID of the user
            const sqlUser = `SELECT * FROM usersTable WHERE username = ?`;
            db.get(sqlUser, [username], (err, row) => {
                if (err) {
                    reject({status:500, message:"Database error"});
                } else {
                    if(row) {
                        //update page
                        const sql = `UPDATE pagesTable SET authorID = ? WHERE pagesTable.ID = ?`;
                        db.run(sql, [row.ID, pageID], function (err) {
                            if (err) {
                                reject({status:500, message:"Database error"});
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        reject({status:404, message:"User doesn't exist"});
                    }
                }
            })
        }
    });
}
//EXPORTS
module.exports = {
    getWebsiteTitle,
    modifyWebsiteTitle,
    getAllPublishedPages,
    getPageByID,
    getAllPages,
    deletePage, 
    updatePageByID,
    createPage,
    getAllImages,
    setAuthor
};
