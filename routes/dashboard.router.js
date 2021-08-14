const express = require('express');
const { getResultDatesBySurveyCreator, getCompletedResponsesBySurveyCreator } = require('../database/results');
const { getSurveyDatesByCreator } = require('../database/surveys');

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

router.get('/myinfo', getMyInfoProc);

module.exports = router;
