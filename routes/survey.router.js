var express = require('express');
var {
  createSurvey, 
  getMySurveys, 
  getSharedSurveys,
  getSurveyById, 
  updateSurvey, 
  deleteSurveys, 
  copySurveys, 
  shareSurvey,
  activeSurvey,
  setMutliResponsesSurvey,
  getAllSurveys} = require('../database/surveys');
var {copyResultsBySurvey, getResultDatesBySurvey} = require('../database/results');
const { getWebLinkByLinkId } = require('../database/weblinks');
const { getEmailLinkByLinkId } = require('../database/emaillinks');
const { requiresAdmin } = require('./router.common');

var router = express.Router();

const getMySurveyListProc = (req, res, next) => {
  const user_id = req.jwtUser.id;

  getMySurveys(user_id)
    .then(surveys => {
      res.status(200).json(surveys);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/fetch-my-list-error",
        message: "It couldn't fetch my surveys.",
      });
    })
};

const getAllSurveyListProc = (req, res, next) => {
  const user_id = req.jwtUser.id;

  getAllSurveys(user_id)
    .then(surveys => {
      res.status(200).json(surveys);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/fetch-my-list-error",
        message: "It couldn't fetch my surveys.",
      });
    })
};

const getSharedSurveyListProc = (req, res, next) => {
  const user_id = req.jwtUser.id;

  getSharedSurveys(user_id)
    .then(surveys => {
      res.status(200).json(surveys);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/fetch-shared-list-error",
        message: "Shared surveys cannot be fetched.",
      });
    })
}

const addSurveyProc = (req, res, next) => {
  var {title, category} = req.body;
  const user_id = req.jwtUser.id;

  if (!category.length) category = null;

  createSurvey(title, user_id, category)
    .then(survey => {
      if (survey) { 
        res.status(200).json(survey); 
      } else {
        res.status(500).json({
          code: "survey/create-error",
          message: "It couldn't create new survey.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/create-error",
        message: "It couldn't create new survey.",
      });
    });
};

const deleteSurveysProc = (req, res, next) => {
  const surveys_ids = req.body.ids;

  if (surveys_ids.length == 0) {
    res.status(200).json({ids: []});
  } else {
    deleteSurveys(surveys_ids)
      .then(() => {
        res.status(200).json({ids: surveys_ids})
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "survey/delete-error",
          message: "It couldn't delete surveys.",
        });
      });
  }
}

const getSurveyProc = (req, res, next) => {
  const survey_id = req.params.id;
  const user_id = req.jwtUser.id;

  getSurveyById(survey_id, user_id)
    .then(survey => {
      if (survey.is_deleted) {
        res.status(500).json({
          code: "survey/get-deleted-survey",
          message: "This survey was deleted.",
        });
      } else {
        getResultDatesBySurvey(survey_id)
          .then(results => {
            survey.results = results;
            res.status(200).json(survey);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              code: "result/get-listerror",
              message: "It couldn't fetch the survey.",
            });
          })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/fetch-error",
        message: "It couldn't fetch the survey.",
      });
    });
};

const getSurveyByWebLinkProc = (req, res, next) => {
  const weblink_id = req.query.id;

  getWebLinkByLinkId(weblink_id)
    .then(weblink => {
      if (weblink) {
        if (weblink.close_date) {
          const close_date = new Date(weblink.close_date);
          const today_date = new Date();
          if (today_date > close_date) {
            res.json({
              success: false,
              code: "survey/over-deadline",
              message: "The deadline has passed."
            });
            return;
          }
        }
        if (!weblink.is_active) {
          res.json({
            success: false,
            code: "survey/inactivate-survey",
            message: "This survey is not active yet."
          });
        } else {
          getSurveyById(weblink.survey_id, null)
            .then(survey => {
              if (survey.is_deleted) {
                res.json({
                  success: false,
                  code: "survey/deleted-survey",
                  message: "This survey was deleted.",
                });
              } else {
                res.json({
                  success: true,
                  survey,
                })
              }
            })
            .catch(err => {
              console.log(err);
              res.status(401).json({
                code: "survey/fetch-error",
                message: "It couldn't fetch the survey.",
              });
            });
        }
      } else {
        res.json({
          success: false,
          code: "survey/not-found-web-link",
          message: "It couldn't find this survey."
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.json({
        success: false,
        code: "survey/fetch-weblink-error",
        message: "It couldn't fetch the survey."
      });
      return null;
    });
}

const getSurveyByEmailLinkProc = (req, res, next) => {
  const emaillink_id = req.query.id;

  getEmailLinkByLinkId(emaillink_id)
  .then(emaillink => {
    if (emaillink) {
      if (emaillink.close_date) {
        const close_date = new Date(emaillink.close_date);
        const today_date = new Date();
        if (today_date > close_date) {
          res.json({
            success: false,
            code: "survey/over-deadline",
            message: "The deadline has passed."
          });
          return;
        }
      }
      getSurveyById(emaillink.survey_id, null)
      .then(survey => {
        if (survey.is_deleted) {
          res.json({
            success: false,
            code: "survey/deleted-survey",
            message: "This survey was deleted.",
          });
        } else {
          res.json({
            success: true,
            survey,
          })
        }
      })
      .catch(err => {
        console.log(err);
        res.status(401).json({
          code: "survey/fetch-error",
          message: "It couldn't fetch the survey.",
        });
      });
    } else {
      res.json({
        success: false,
        code: "survey/not-found-email-link",
        message: "It couldn't find the survey."
      });
      return null;
    }
  })
  .catch(err => {
    console.error(err);
    res.status(401).json({
      code: "survey/fetch-emaillink-error",
      message: "It couldn't fetch the survey."
    });
    return null;
  });
}

const updateSurveyProc = (req, res, next) => {
  const survey_id = req.params.id;
  const {json} = req.body;

  updateSurvey(survey_id, json)
    .then(survey => {
      if (survey.is_deleted) {
        res.status(500).json({
          code: "survey/get-deleted-survey",
          message: "This survey was deleted.",
        });
      } else {
        res.status(200).json(survey);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/fetch-error",
        message: "It couldn't fetch the survey.",
      });
    });
};

const copySurveysProc = (req, res, next) => {
  const surveys_ids = req.body.ids;
  const with_responses = req.body.with;
  const user_id = req.jwtUser.id;

  surveys_ids.sort();

  if (surveys_ids.length == 0) {
    res.status(200).json([]);
  } else {
    copySurveys(user_id, surveys_ids)
      .then(async (surveys) => {
        surveys.forEach(survey => {
          survey.responses = 0
        });

        if (with_responses === true) {
          for (let i = 0; i < surveys_ids.length; i ++) {
            const survey_id = surveys_ids[i];
            await copyResultsBySurvey(survey_id, surveys[i].id)
              .then((results) => {
                surveys[i].responses = results.length
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  code: "survey/copy-results-error",
                  message: "It couldn't copy surveys.",
                });
              });
          }
          res.status(200).json(surveys.reverse())
        } else {
          res.status(200).json(surveys.reverse())
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "survey/copy-error",
          message: "It couldn't copy surveys.",
        });
      });
  }
}

const shareSurveyProc = (req, res, next) => {
  const survey_id = req.params.id;
  shareSurvey(survey_id)
    .then(survey => {
      res.status(200).json(survey);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/wrong-survey-id",
        message: "It couldn't share/unshare survey."
      })
    })
}

const activeSurveyProc = (req, res, next) => {
  const survey_id = req.params.id;
  activeSurvey(survey_id)
    .then(survey => {http://localhost:3000/share/e/run?id=gxblsppv
      res.status(200).json(survey);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/wrong-survey-id",
        message: "It couldn't activate/inactivate survey."
      })
    })
}

const setMultiResponsesSurveyProc = (req, res, next) => {
  const survey_id = req.params.id;
  setMutliResponsesSurvey(survey_id)
    .then(survey => {
      res.status(200).json(survey);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "survey/wrong-survey-id",
        message: "It couldn't set/unset multi-responses."
      })
    })
}

router.post('/copy', copySurveysProc);
router.get('/shared', getSharedSurveyListProc);
router.get('/w/share', getSurveyByWebLinkProc);
router.get('/e/share', getSurveyByEmailLinkProc);
router.get('/all', requiresAdmin, getAllSurveyListProc);
router.put('/:id/share', shareSurveyProc);
router.put('/:id/active', activeSurveyProc);
router.put('/:id/multi-responses', setMultiResponsesSurveyProc);
router.get('/:id', getSurveyProc);
router.put('/:id', updateSurveyProc);
router.get('/', getMySurveyListProc);
router.post('/', addSurveyProc);
router.delete('/', deleteSurveysProc);


module.exports = router;