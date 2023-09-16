'use strict';

const db = require('./db');
const crypto = require('crypto');

exports.getUserById = (id) => {
  console.log("-----> GET USER BY ID")
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usersTable WHERE id=?';
      db.get(sql, [id], (err, row) => {
        if (err)
          reject({status:500, message:"Database error"});
        else if (row === undefined)
          resolve({status:404, message: 'User not found.' });
        else {
          // By default, the local strategy looks for "username": 
          // for simplicity, instead of using "email", we create an object with that property.
          const user = { id: row.id, username: row.email, name: row.name }
          resolve(user);
        }
      });
    });
};

exports.getUser = (email, password) => {
  console.log("-----> GET USER")
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usersTable WHERE email=?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject({status:500, message:"Database error"});
        } else if (row === undefined) {
          resolve(false);
        }
        else {
          const user = { id: row.ID, username: row.email, username_name: row.username, role: row.type };
  
          // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { // WARN: it is 64 and not 32 (as in the week example) in the DB
            if (err) reject({status:401, message:err});
            if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
              resolve(false);
            else
              resolve(user);
          });
        }
      });
    });
};