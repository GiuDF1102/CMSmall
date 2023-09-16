'use strict';
const dao = require('./DAO.js');
const userDao = require('./DAO_user'); // module for accessing the user table in the DB
const PORT = 3000;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path')
const { check, validationResult } = require('express-validator');

const app = express();

app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(morgan('tiny'));
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

//--------------------AUTH-----------------------
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUser(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');  
      
    return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));


// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
    callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
// if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
// e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

return callback(null, user); // this will be available in req.user
});


/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}

//-------------------AUTH ROUTES----------------------------
// This route is used for performing login.

app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => { 
      if (err) 
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json({ error: info});
        }
        // success, perform the login and extablish a login session
        req.login(user, (err) => {
          if (err) 
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser() in LocalStratecy Verify Fn
          return res.json(req.user);
        });
    })(req, res, next);
});

// GET /api/sessions/current
// This route CHECKS whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
});
  
// DELETE /api/session/current LOG OUT
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
    req.logout(() => {
        res.status(200).json({});
    });
});

//-------------------PAGES ROUTES----------------------------
//GET getPageByID = gets page by ID and relative content
app.get('/api/page/:pageID', async (req, res) => {
    let pageID = Number(req.params.pageID)
    dao.getPageByID(pageID).then((result) => {
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//GET getAllPages = gets all pages making a distinction between logged in and not logged in users
app.get('/api/pages', isLoggedIn, async (req, res) => {
    //if logged in get all pages
    dao.getAllPages().then((result) => {
        console.log("----> GET ALL PAGES")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//GET getAllPages = gets all pages making a distinction between logged in and not logged in users
app.get('/api/pages/published', async (req, res) => {
    dao.getAllPublishedPages().then((result) => {
        console.log("----> GET ALL PUBLISHED PAGES")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//GET getAllImages = gets all images
app.get('/api/images', isLoggedIn, async (req, res) => {
    dao.getAllImages().then((result) => {
        console.log("----> GET ALL IMAGES")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//POST createPage = creates a new page
app.post('/api/page',
    [
        check("page.title").isLength({ min: 1 }).withMessage("Title must not be empty"),
        check('page.creationDate').isString().withMessage("Creation date not valide or null"),
        check('content').isArray().notEmpty().withMessage("Content must not be empty"),
    ]
, isLoggedIn, async (req, res) => {
    let page = req.body
    const errors = validationResult(req);
    dao.createPage(page, req.user.id).then((result) => {
        console.log("----> CREATE PAGE")
        if(errors.isEmpty()){
            res.json(result);
        }else{
            console.log(errors);
            res.status(422).json(errors.errors[0].msg);
        }
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//PUT updatePageByID = updates page by ID
app.put('/api/page/:pageID', 
    [
        check("page.title").isLength({ min: 1 }).withMessage("Title must not be empty"),
        check('page.creationDate').isString().withMessage("Creation date not valide or null"),
        check('content').isArray().notEmpty().withMessage("Content must not be empty"),
    ]
    ,isLoggedIn, async (req, res) => {
    let pageID = Number(req.params.pageID)
    let page = req.body
    const errors = validationResult(req);
    dao.updatePageByID(pageID, page, req.user.id, req.user.role).then((result) => {
        console.log("----> UPDATE PAGE BY ID")
        if(errors.isEmpty()){
            res.json(result);
        }else{
            res.status(422).json(errors.errors[0].msg);
        }
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//PUT modifyWebsiteTitle
app.put('/api/title',
    [
        check("title").isLength({ min: 1 }).withMessage("Website Title must not be empty")
    ]
    ,isLoggedIn, async (req, res) => {
    let websiteTitle = req.body.title
    const errors = validationResult(req);
    dao.modifyWebsiteTitle(websiteTitle, req.user.role).then((result) => {
        console.log("----> MODIFY WEBSITE TITLE")
        if(errors.isEmpty()){
            res.json(result);
        }else{
            res.status(422).json(errors.errors[0].msg);
        }
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//GET website title
app.get('/api/title', async (req, res) => {
    dao.getWebsiteTitle().then((result) => {
        console.log("----> GET WEBSITE TITLE")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})


//DELETE deletePageByID = deletes page by ID
app.delete('/api/page/:pageID', isLoggedIn, async (req, res) => {
    let pageID = Number(req.params.pageID)
    dao.deletePage(pageID, req.user.id, req.user.role).then((result) => {
        console.log("----> DELETE PAGE BY ID")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

//PUT setAuthor = sets author of a page
app.put('/api/author', isLoggedIn, async (req, res) => {
    let pageID = Number(req.body.pageID)
    let authorID = req.body.authorID
    dao.setAuthor(pageID, authorID, req.user.role).then((result) => {
        console.log("----> SET AUTHOR")
        res.json(result);
    }).catch((err) => {
        res.status(err.status).json(err.message);
    })
})

app.listen(PORT,
    () => { console.log(`Server started on http://localhost:${PORT}/`) });