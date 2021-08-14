const express = require('express');
const jwt = require('jsonwebtoken');

const { verify } = require('../core/verify-token');

const authRouter = require('./auth.router');
const surveyRouter = require('./survey.router');
const categoryRouter = require('./category.router');
const resultRouter = require('./result.router');
const reportRouter = require('./report.router');
const weblinkRouter = require('./weblink.router');
const emaillinkRouter = require('./emaillink.router');
const userRouter = require('./user.router');
const organizationRouter = require('./organization.router');
const pillarRouter = require('./pillar.router');
const dashboardRouter = require('./dashboard.router');

require('dotenv').config();

const router = express.Router();

// Token verfication middleware
router.use((req, res, next) => {
  const token = verify(req);
  if (token) {
    req.jwtUser = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  }
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', authRouter);
router.use('/survey', surveyRouter);
router.use('/category', categoryRouter);
router.use('/result', resultRouter);
router.use('/report', reportRouter);
router.use('/link/web', weblinkRouter);
router.use('/link/email', emaillinkRouter);
router.use('/user', userRouter);
router.use('/organization', organizationRouter);
router.use('/pillar', pillarRouter);
router.use('/dashboard', dashboardRouter);

module.exports = router;
