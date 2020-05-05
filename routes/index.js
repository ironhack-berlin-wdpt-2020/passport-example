const express = require('express');
const router = express.Router();

const loggedInUser = require('../helpers/middlewares').loggedInUser
const userIsAdmin = require('../helpers/middlewares').userIsAdmin

const axios = require('axios')

/* GET home page */
router.get('/', (req, res) => {

  // req.user // passport makes this available 
  res.render('index', { user: req.user });

});

router.get('/countries', (req, res) => {

  axios.get('https://restcountries.eu/rest/v2/lang/es').then((response) => {
    // console.log the API response
    console.log("response.data", response.data)
    res.render('countries', { countries: response.data })
  })

})

// here user needs to be logged in
router.get('/books', loggedInUser, (req, res) => {

  res.send('here be books')
});

// here user needs to be logged in && be an admin
router.get('/movies', loggedInUser, userIsAdmin, (req, res) => {
  res.send('here be movies')
});

module.exports = router;
