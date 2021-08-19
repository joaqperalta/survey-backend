const express = require('express');
const { 
  getResultDatesBySurveyCreator, 
  getCompletedResponsesBySurveyCreator, 
  getResultDates,
  getCompletedResponses } = require('../database/results');
const { getSurveyDatesByCreator, getSurveyDates } = require('../database/surveys');

var router = express.Router();

const getMyInfoProc = (req, res, next) => {
  const user_id = req.jwtUser.id;

  getSurveyDatesByCreator(user_id)
    .then(surveyDates => {
      getResultDatesBySurveyCreator(user_id)
      .then(resultDates => {
        getCompletedResponsesBySurveyCreator(user_id)
          .then(completedResponses => {
            res.json({
              surveyCount: surveyDates.length,
              totalResponses: resultDates.length,
              completedResponses: completedResponses,
              surveyDates,
              resultDates,
            })
          })
          .catch(err => {
            console.error(err);
            res.status(401).json({
              code: "dashboard/get-result-dates-error",
              message: "It couldn't get your info.",
            });
          })
      })
      .catch(err => {
        console.error(err);
        res.status(401).json({
          code: "dashboard/get-result-dates-error",
          message: "It couldn't get your info.",
        });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(401).json({
        code: "dashboard/get-survey-dates-error",
        message: "It couldn't get your info.",
      });
    })
};

const getTotalInfoProc = (req, res, next) => {

  getSurveyDates()
    .then(surveyDates => {
      getResultDates()
      .then(resultDates => {
        getCompletedResponses()
          .then(completedResponses => {
            res.json({
              surveyCount: surveyDates.length,
              totalResponses: resultDates.length,
              completedResponses: completedResponses,
              surveyDates,
              resultDates,
            })
          })
          .catch(err => {
            console.error(err);
            res.status(401).json({
              code: "dashboard/get-result-dates-error",
              message: "It couldn't get total info.",
            });
          })
      })
      .catch(err => {
        console.error(err);
        res.status(401).json({
          code: "dashboard/get-result-dates-error",
          message: "It couldn't get total info.",
        });
      });
    })
    .catch(err => {
      console.error(err);
      res.status(401).json({
        code: "dashboard/get-survey-dates-error",
        message: "It couldn't get total info.",
      });
    })
};

router.get('/myinfo', getMyInfoProc);
router.get('/totalinfo', getTotalInfoProc);

module.exports = router;
