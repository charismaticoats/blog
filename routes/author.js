const express = require("express");
const router = express.Router();
const assert = require('assert');

/**
 * @desc Generate all draft and published articles
 * Renders the author home page
 */
router.get("/home", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      let edit = result[0];
      // retrieve all draft articles
      global.db.all("SELECT * FROM draft;", function (err, result) {
        if (err) {
          next(err); // send the error on to the error handler
        } else {
          let draft = result;
          // retrieve all published articles
          global.db.all("SELECT * FROM publish;", function (err, result) {
            if (err) {
              next(err); // send the error on to the error handler
            } else {
              res.render('author/home', { edit: edit, articles: draft, published: result });
              next();
            }
          });
        }
      });
    }
  });
});

/**
 * @desc Renders the blog settings page
 */
router.get("/settings", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      res.render('author/settings', { edit: result[0] });
      next();
    }
  });
});

/**
 * @desc Updates the blog settings
 */
router.post("/settingsupdated", (req, res, next) => {
  global.db.run(
    "UPDATE blog SET title = ?, subtitle = ?, author = ? WHERE id = 1;", 
    [req.body.title, req.body.subtitle, req.body.author],
    function (err, result) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.render('author/updated', { context: 'Settings' });
        next();
      }
    }
  );
});

/**
 * @desc Renders the page for creating a new article
 */
router.get("/new", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      res.render("author/new", { blog: result[0] });
      next();
    }
  });
});

/**
 * @desc Add a new draft article to the database
 * Redirect to the edit page of the article
 */
router.post("/", (req, res, next) => {
  const date = new Date();
  const dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  global.db.run(
    "INSERT INTO draft (title, subtitle, body, created, modified) VALUES (?, ?, ?, ?, ?);",
    [req.body.title, req.body.subtitle, req.body.body, dateString, dateString],
    function (err) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.redirect(`/author/edit/${this.lastID}`);
        next();
      }
    }
  );
});

/**
 * @desc Renders the page to edit individual draft articles
 */
router.get("/edit/:id", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      let blog = result[0];
      // retrieve draft article with req.params.id
      global.db.all(
        "SELECT * FROM draft WHERE id = ?;",
        [req.params.id], 
        function (err, result) {
          if (err) {
            next(err); // send the error on to the error handler
          } else {
            res.render('author/edit', { blog: blog, article: result[0] });
            next();
          }
        }
      );
    }
  });
});

/**
 * @desc Update individual draft articles
 */
router.post("/edit/:id", (req, res, next) => {
  const date = new Date();
  const dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  global.db.run(
    "UPDATE draft SET title = ?, subtitle = ?, body = ?, modified = ? WHERE id = ?;",
    [req.body.title, req.body.subtitle, req.body.body, dateString, req.params.id],
    function (err) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.redirect(`/author/edit/${req.params.id}`);
        next();
      }
    }
  );
});

/**
 * @desc Renders the page to publish individual articles
 */
router.get("/publish/:id", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      let blog = result[0];
      // retrieve draft article with req.params.id
      global.db.all(
        "SELECT * FROM draft WHERE id = ?;",
        [req.params.id], 
        function (err, result) {
          if (err) {
            next(err); // send the error on to the error handler
          } else {
            res.render('author/publish', { blog: blog, article: result[0] });
            next();
          }
        }
      );
    }
  });
});

/**
 * @desc Publish draft articles
 * Redirects to the home page
 */
router.post("/publish/:id", (req, res, next) => {
  // insert data of article from table draft into table publish
  global.db.run(
    "INSERT INTO publish (title, subtitle, body, created, published) SELECT title, subtitle, body, created, modified FROM draft WHERE id = ?;",
    [req.params.id],
    function (err, result) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        // delete data of article from table draft
        global.db.run(
          "DELETE from draft WHERE id = ?;",
          [req.params.id],
          function (err, result) {
            if (err) {
              next(err); //send the error on to the error handler
            } else {
              res.redirect('/author/home');
              next();
            }
          }
        );
      }
    }
  );
});

/**
 * @desc Renders the page to delete individual articles
 */
router.get("/deleted/:id", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      let blog = result[0];
      // retrieve draft article with req.params.id
      global.db.all(
        "SELECT * FROM draft WHERE id = ?;",
        [req.params.id], 
        function (err, result) {
          if (err) {
            next(err); // send the error on to the error handler
          } else {
            res.render('author/delete', { blog: blog, article: result[0] });
            next();
          }
        }
      );
    }
  });
});

/**
 * @desc Delete draft articles
 * Redirects to the home page
 */
router.post("/deleted/:id", (req, res, next) => {
  global.db.run(
    "DELETE from draft WHERE id = ?;",
    [req.params.id],
    function (err, result) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.redirect('/author/home');
        next();
      }
    }
  );
});

/**
 * @desc Renders the page to delete published individual articles
 */
router.get("/publishdeleted/:id", (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); // send the error on to the error handler
    } else {
      let blog = result[0];
      // retrieve data of published article with req.params.id
      global.db.all("SELECT * FROM publish WHERE id = ?;",
      [req.params.id], 
      function (err, result) {
        if (err) {
          next(err); // send the error on to the error handler
        } else {
          res.render('author/publishdeleted', { blog: blog, article: result[0] });
          next();
        }
      });
    }
  });
});

/**
 * @desc Delete published articles
 * Redirects to the home page
 */
router.post("/publishdeleted/:id", (req, res, next) => {
  global.db.run(
    "DELETE from publish WHERE id = ?;",
    [req.params.id],
    function (err, result) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        res.redirect('/author/home');
        next();
      }
    }
  );
});

module.exports = router;
