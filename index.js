const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
app.use(bodyParser.urlencoded({ extended: true }));

// items in the global namespace are accessible throught out the node application
global.db = new sqlite3.Database('./database.db', function (err) {
  if (err) {
    console.error(err);
    process.exit(1); // bail out if we can't connect to the DB
  } else {
    console.log("Database connected");
    global.db.run("PRAGMA foreign_keys=ON"); // this tells SQLite to pay attention to foreign key constraints
  }
});

// require user.js file inside routes folder
const userRoutes = require('./routes/user');
// this adds all the userRoutes to the app under the path /user
app.use('/user', userRoutes);

// require author.js file inside routes folder
const authorRoutes = require('./routes/author');
// this adds all the authorRoutes to the app under the path /author
app.use('/author', authorRoutes);

// set the app to use ejs for rendering
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});




