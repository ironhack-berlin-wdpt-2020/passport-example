const express = require('express');
const router = express.Router();

const passport = require('passport')

// User model
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcrypt = require('bcrypt');
const bcryptSalt = 10;

const loggedInUser = require('../helpers/middlewares').loggedInUser
const userIsAdmin = require('../helpers/middlewares').userIsAdmin

const nodemailer = require('nodemailer')

// SMTP 
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'tester123.peterpan@gmail.com',
    pass: '89675rutitgzrvuz'
  }
});




router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});


// POST /signup
router.post('/signup', (req, res, next) => {

  const email = req.body.email
  const password = req.body.password

  // creates a 4 digit random token
  const tokenArr = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)) // [ 1, 4, 5, 8 ]
  const token = tokenArr.join(''); // "1458"

  transporter.sendMail({
    from: '"My Awesome Project " <myawesome@project.com>',
    to: email,
    subject: 'Subject',
    text: `Hey this is the link you need to click: http://localhost:3000/verify-email-link/${token}`,
    html: `Hey this is the link you need to click: http://localhost:3000/verify-email-link/${token}`
    // aternatively, send the token itself for the user to type it
    // text: `Hey this is your token `${token}`,
    // html: `Hey this is your token `${token}`,
  })
    .then(() => {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(req.body.password, salt);

      let user = new User({ email: req.body.email, password: hashPass, token: token })
      return user.save()

    }).then((theUser) => {
      req.login(theUser, () => { res.redirect('/') }) // theUser now has an _id because we stored it into the database
    })



})

router.get('/verify-email-link/:token', (req, res) => {
  if (req.user.token === req.params.token) {
    req.user.verifiedEmail = true
    req.user.save().then(() => {
      // more professional : res.redirect and set a flash message before
      res.send('successfully verified your email')
    })
  }
})

router.get('/verify-email', (req, res) => {
  res.render('auth/verify')
})

router.post('/verify-email', (req, res) => {
  console.log(req.user)
  if (req.user.token === req.body.token) {
    req.user.verifiedEmail = true
    req.user.save().then(() => {
      // more professional : res.redirect and set a flash message before
      res.send('successfully verified your email')
    })
  }
})

router.get('/login', (req, res) => {
  //console.log(req.flash('error'))

  // req.flash('message') // <= this is always an array

  // redirect to homepage if already logged in
  if (req.user) {
    res.redirect('/')
  }

  res.render('auth/login', { errorArr: req.flash('message') })
})

// use LocalStrategy for authentication
router.post('/login', passport.authenticate('local', {
  successRedirect: '/', // pick up the redirectBackTo parameter and after login redirect the user there. ( default / )
  failureRedirect: '/login',
  failureFlash: true,
  // passReqToCallback: true
}))

router.get("/auth/slack", passport.authenticate("slack"));
router.get(
  "/auth/slack/callback",
  passport.authenticate("slack", {
    successRedirect: "/",
    failureRedirect: "/login" // here you would navigate to the classic login page
  })
);

router.get('/logout', (req, res) => {
  req.logout() // this one deletes the user from the session
  res.render('auth/logout');
})


module.exports = router;
