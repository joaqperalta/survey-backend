const express = require('express');
const { getWebLinksBySurvey, createWebLink, updateWebLink, deleteWebLink,getWebLinksCompletedResponses,getWebLinksTotalResponses } = require('../database/weblinks');

var router = express.Router();

const getWebLinksProc = (req, res, next) => {
  const {survey} = req.query;
  getWebLinksBySurvey(survey)
  .then(webLinks => {
    getWebLinksCompletedResponses(survey)
    .then(weblinksCompletedResponse => {
      getWebLinksTotalResponses(survey)
      .then(webLinksTotalResponses=>{
        res.status(200).json({webLinks:webLinks,webLinksTotalResponses:webLinksTotalResponses,weblinksCompletedResponse:weblinksCompletedResponse});
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({
        code: "weblink/fetch-error",
        message: "It couldn't fetch all weblinks.",
      });
      })
    })
    .catch(err=>{
      console.log(err)
      res.status(500).json({
        code: "weblink/fetch-error",
        message: "It couldn't fetch all weblinks.",
      });
    })
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      code: "weblink/fetch-error",
      message: "It couldn't fetch all weblinks.",
    });
  })
};

const addWebLinkProc = (req, res, next) => {
  var { 
    name,
    survey_id,
    link_id,
    close_quota,
    close_date,
    is_active,
    is_multiple
  } = req.body;

  close_quota = close_quota.length ? close_quota : null;
  close_date = close_date.length ? close_date : null;

  const user_id = req.jwtUser.id;

  createWebLink(name, survey_id, user_id, link_id, close_quota, close_date, is_active, is_multiple)
    .then(webLink => {
      if (webLink) {
        res.status(200).json(webLink); 
      } else {
        res.status(500).json({
          code: "weblink/create-error",
          message: "It couldn't create new web link.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "weblink/create-error",
        message: "It couldn't create new web link.",
      });
    });
};

const updateWebLinkProc = (req, res, next) => {
  const webLink_id = req.params.id;
  var { 
    name,
    close_quota,
    close_date,
    is_active,
    is_multiple
  } = req.body;
  close_quota = close_quota? close_quota : null;
  close_date = close_date.length ? close_date : null;

  updateWebLink(webLink_id, name, close_quota, close_date, is_active, is_multiple)
  .then (webLink => {
    if (webLink) {
      res.status(200).json(webLink); 
    } else {
      res.status(500).json({
        code: "weblink/update-filter-error",
        message: "It couldn't find the web link.",
      });
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      code: "weblink/update-filter-error",
      message: "It couldn't update the web link.",
    });
  })
}

const deleteWebLinkProc = (req, res, next) => {
  const webLink_id = req.params.id;

  deleteWebLink(webLink_id)
    .then(result => {
      if (result) {
        res.json({id: webLink_id});
      } else {  
        res.status(500).send({
          code: "weblink/not-found-id",
          message: "It couldn't delete the web link.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: "weblink/delete-error",
        message: "It couldn't delete the web link.",
      });
    })
};

router.put('/:id', updateWebLinkProc);
router.delete('/:id', deleteWebLinkProc);
router.get('/', getWebLinksProc);
router.post('/', addWebLinkProc);

module.exports = router;
