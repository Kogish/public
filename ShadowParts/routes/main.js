module.exports = function(app, shopData) {
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId) {
          res.redirect('./login')
        } else { next (); }
    }
    const { check, validationResult } = require('express-validator');
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/components',function(req,res){
      res.render('components.ejs', shopData);
  });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });
    app.get('/logout', redirectLogin, (req,res) => {
      req.session.destroy(err => {
      if (err) {
        return res.redirect('./')
      }
      res.send('you are now logged out. <a href='+'./'+'>Home</a>');
      })
  })

    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', [check('email').isEmail()], function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          res.redirect('./register'); }
      else { 

        // Saving data in database
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // saving data in database
           let sqlquery = "INSERT INTO usercredentials (username, first_name, last_name, email, hashedPassword) VALUES (?,?,?,?,?)";
           // execute sql query
           let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' These user details are added to database, name: '+ req.body.username + ' price '+ req.body.email);
             });
        })
        res.send(' Hello '+ req.sanitize(req.body.first) + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email);                                                                              
 } }); 
  
    app.get('/list', function(req, res) {
        let sqlquery = "SELECT name FROM cars"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableCars:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });
    app.get('/listusers', function(req, res) {
        // Query database to get all the users
        let sqlquery = "SELECT * FROM usercredentials";

        // Execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            let newData = Object.assign({}, shopData, {Outputlist:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO Cars (name, price, bodytype, fuel, description) VALUES (?,?,?,?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price, req.body.bodytype, req.body.fuel, req.body.description];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
       });    

       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });       
    app.get('/login', function (req,res) {
        res.render('login.ejs', shopData);
        });
    
        app.post('/signedin', function(req, res) {
            // Compare the form data with the data stored in the database
            let sqlquery = "SELECT hashedPassword FROM usercredentials WHERE username = ?"; // query database to get the hashed password for the user
            // execute sql query
            let username = (req.body.username);
            db.query(sqlquery, username, (err, result) => {
              if (err) {
                return console.error(err.message);
              }
              else if (result.length == 0) {
                // No user found with that username
                res.send('Invalid username or password');
              }
              else {
                // User found, compare the passwords
                let hashedPassword = result[0].hashedPassword;
                const bcrypt = require('bcrypt');
                bcrypt.compare((req.body.password), hashedPassword, function(err, result) {
                  if (err) {
                    // Handle error
                    return console.error(err.message);
                  }
                  else if (result == true) {
                    req.session.userId = (req.body.username)
                    // The passwords match, login successful
                    res.send('Welcome, ' + (req.body.username) + '!' + '<a href='+'./'+'> Home</a>');
        
        
                  }
                  else {
                    //  login failed
                    res.send('Invalid username or password');
                  }
                });
              }
            });
          });
          // main.js
          const express = require('express');
const fetch = require('node-fetch');

const port = 3000;

app.get('/CarsforSale', async (req, res) => {
    const apiUrl = 'https://car-data.p.rapidapi.com/cars?limit=10&page=0';

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'd6a58236c5msha79cdeee766136fp14f8cejsnc0c1a6bfff8d',
                'X-RapidAPI-Host': 'car-data.p.rapidapi.com'
            }
        });

        const data = await response.json();
        res.json(data); // Send the data as a JSON response
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

          


}
