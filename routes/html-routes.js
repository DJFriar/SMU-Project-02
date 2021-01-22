// Requiring path to so we can use relative routes to our HTML files
const path = require("path");
const db = require("../models");
//const sequelize = require("sequelize");

// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");
// const { query } = require("express");

module.exports = function (app) {
  app.get("/", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/members");
    }
    res.render("signup");
    //res.sendFile(path.join(__dirname, "../public/signup.html"));
  });

  app.get("/login", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/members");
    }
    res.render("login");
    //res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  app.get("/profile", (req, res) => {
    // Get all profiles
    db.Park.findAll({}).then(data => {
      const newArray = data.map(element => {
        return element.dataValues;
      });
      const hbsObject = {
        parks: newArray
      };
      console.log(hbsObject);
      res.render("profile", hbsObject);
    });
  });

  app.get("/parks", (req, res) => {
    // Get all parks
    db.Park.findAll({}).then(data => {
      const newArray = data.map(element => {
        return element.dataValues;
      });
      const hbsObject = {
        parks: newArray
      };
      //console.log(hbsObject);
      res.render("parks", hbsObject);
    });
  });

  app.get("/parks/search", (req, res) => {
    let parkName;
    let statesArr;
    let queryStringTwo = "Select * From parks Where";

    if (req.query.name) {
      parkName = req.query.name;
      queryStringTwo += ` locate('${parkName}', name)>0`;
    }
    if (req.query.states) {
      statesArr = req.query.states.split(",");
      statesArr.forEach((state, index) => {
        if (index === 0 && parkName) {
          queryStringTwo += ` AND locate('${state}', states)>0`;
        } else if (index === 0 && !parkName) {
          queryStringTwo += ` locate('${state}', states)>0`;
        } else {
          queryStringTwo += ` OR locate('${state}', states)>0`;
        } 
      });
    }

    console.log(queryStringTwo + ";");

    //const queryString = `Select * From parks Where locate('${parkName}', name)>0;`;

    db.sequelize.query(queryStringTwo, {
      type: db.sequelize.QueryTypes.SELECT
    })
      .then((results) => {
        const hbsObject = {
          parks: results
        };
        // We don't need spread here, since only the results will be returned for select queriesx
        res.render("parks", hbsObject);
      });

  app.get("/parks/:parkid", (req, res) => {
    // Get all parks
    db.Park.findAll({
      where: {
        parkid: req.params.parkid
      }
    }).then(data => {
      const newArray = data.map(element => {
        return element.dataValues;
      });
      const hbsObject = {
        parks: newArray
      };
      console.log(hbsObject);
      res.render("park-detail", hbsObject);
    });
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/members", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/members.html"));
  });
};