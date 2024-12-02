const express = require("express");
const router = express.Router();
const assert = require('assert');

/**
 * @desc Generate all articles
 * Renders the user home page
 */
router.get('/home', (req, res, next) => {
  // retrieve data of blog setting
  global.db.all("SELECT * FROM blog;", function (err, result) {
    if (err) {
      next(err); //send the error on to the error handler
    } else {
      let edit = result[0];
      // retrieve all articles, sort in descending order (time)
      global.db.all("SELECT * FROM publish ORDER BY published DESC;", function (err, result) {
        if (err) {
          next(err); //send the error on to the error handler
        } else {
          res.render('user/index', { edit: edit, articles: result });
          next();
        }
      });
    }
  });
});

/**
 * @desc Renders the page for individual articles
 */
router.get("/home/:id", (req, res, next) => {
  // when the article is published, add the likes counter into the database
  global.db.run(
    "INSERT INTO likes (article_id, likes) VALUES (?, 0);",
    [req.params.id],
    function (err, result) {
      if (err) {
        next(err); // send the error on to the error handler
      } else {
        // retrieve data of blog setting
        global.db.all("SELECT * FROM blog;", function (err, result) {
          if (err) {
            next(err); // send the error on to the error handler
          } else {
            let edit = result[0];
            // retrieve data of published article with req.params.id
            global.db.all(
              "SELECT * FROM publish WHERE id = ?;",
              [req.params.id],
              function (err, result) {
                if (err) {
                  next(err); //send the error on to the error handler
                } else {
                  let article = result[0];
                  // retrieve data of comments of published article with req.params.id
                  // sort in descending order (time)
                  global.db.all(
                    "SELECT * FROM comments WHERE article_id = ? ORDER BY date DESC;",
                    [req.params.id],
                    function (err, result) {
                      if (err) {
                        next(err); // send the error on to the error handler
                      } else {
                        let comments = result;
                        // retrieve data of likes of published article with req.params.id
                        global.db.all(
                          "SELECT * FROM likes WHERE article_id = ?;",
                          [req.params.id],
                          function (err, result) {
                            if (err) {
                              next(err); // send the error on to the error handler
                            } else {
                              res.render('user/show', {edit: edit, article: article, comments: comments, likes: result[0]});
                              next();
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          } 
        });
      }
    }
  );
});

/**
 * @desc Add a new comment or like to the database depending on req.body 
 * for individual articles
 */
router.post("/home/:id", (req, res, next) => {
  const date = new Date();
  const dateString = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  if (req.body.comment) {
    // add a new comment to the database
    global.db.run(
      "INSERT INTO comments (article_id, text, date) VALUES (?, ?, ?);",
      [req.params.id, req.body.comment, dateString],
      function (err) {
        if (err) {
          next(err); // send the error on to the error handler
        } else {
          res.redirect(`/user/home/${req.params.id}`);
          next();
        }
      }
    );
  } else {
    // retrieve current value of likes
    global.db.all(
      "SELECT * from likes WHERE article_id = ?;",
      [req.params.id],
      function (err, row) {
        if (err) {
          next(err); // send the error on to the error handler
        } else {
          const current = row[0].likes;
          const incr = current + 1;
          // update the database with the incremented value
          global.db.run(
            "UPDATE likes SET likes = ? WHERE article_id = ?;", 
            [incr, req.params.id],
            function (err) {
              if (err) {
                next(err); // send the error on to the error handler
              } else {
                res.redirect(`/user/home/${req.params.id}`);
                next();
              }
            }
          );
        }
      }
    );
  }
});

module.exports = router;
