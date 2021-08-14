const express = require('express');
const { REPORT_TYPE } = require('../constants/surveyValue');
const { 
  createReport, 
  getReportsBySurvey, 
  getReportById, 
  getReportByShareId,
  updateReportFilter, 
  updateReportSections, 
  deleteReport, 
  resetReportShareLink 
} = require('../database/reports');

var router = express.Router();

const getReportsProc = (req, res, next) => {
  const {survey} = req.query;
  getReportsBySurvey(survey)
  .then(reports => {
    res.status(200).json(reports);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      code: "report/fetch-error",
      message: "It couldn't fetch all reports.",
    });
  })
};

const addReportProc = (req, res, next) => {
  const { 
    name, 
    type, 
    section,
    filter,
    survey,
  } = req.body;

  const user_id = req.jwtUser.id;

  var sections = [section];

  sections = JSON.stringify(sections);

  createReport(name, survey, user_id, type, filter, sections)
    .then(report => {
      if (report) {
        res.status(200).json(report); 
      } else {        
        res.status(500).json({
          code: "report/create-error",
          message: "It couldn't create new report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "report/create-error",
        message: "It couldn't create new report.",
      });
    });
};

const getReportProc = (req, res, next) => {
  const report_id = req.params.id;

  getReportById(report_id)
    .then(report => {
      if (report) {
        res.json(report);
      } else {
        res.status(500).json({
          code: "report/not-found",
          message: "It couldn't find the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "report/get-report-error",
        message: "It couldn't get the report.",
      });
    })
}

const getShareReportProc = (req, res, next) => {
  const share_id = req.query.id;

  getReportByShareId(share_id)
    .then(report => {
      if (report) {
        res.json(report);
      } else {
        res.status(500).json({
          code: "report/not-found-share-id",
          message: "It couldn't find the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "report/get-report-error",
        message: "It couldn't get the report.",
      });
    })
}

const updateReportProc = (req, res, next) => {
  const report_id = req.params.id;
  const {filter, sections} = req.body;

  if (filter) {
    updateReportFilter(report_id, filter)
    .then (report => {
      if (report) {
        res.status(200).json(report); 
      } else {
        res.status(500).json({
          code: "report/update-filter-error",
          message: "It couldn't find the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "report/update-filter-error",
        message: "It couldn't update the report.",
      });
    })
  } else if (sections) {
    updateReportSections(report_id, JSON.stringify(sections))
    .then (report => {
      if (report) {
        res.status(200).json(report); 
      } else {
        res.status(500).json({
          code: "report/update-section-error",
          message: "It couldn't find the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "report/update-section-error",
        message: "It couldn't update the report.",
      });
    })
  } else {
    res.status(500).json({
      code: "report/param-error",
      message: "It couldn't update the report.",
    });
  }
}

const deleteReportProc = (req, res, next) => {
  const report_id = req.params.id;

  deleteReport(report_id)
    .then(result => {
      if (result) {
        res.json({id: +report_id});
      } else {  
        res.status(500).send({
          code: "report/not-found-id",
          message: "It couldn't delete the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: "report/delete-error",
        message: "It couldn't delete the report.",
      });
    })
};

const resetReportShareLinkProc = (req, res, next) => {
  const report_id = req.params.id;

  resetReportShareLink(report_id)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.status(500).json({
          code: "report/reset-share-link-error",
          message: "It couldn't find the report.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: "report/reset-share-link-error",
        message: "It couldn't reset the link.",
      });
    })
}

router.get('/share', getShareReportProc);
router.get('/:id', getReportProc);
router.put('/:id/reset', resetReportShareLinkProc);
router.put('/:id', updateReportProc);
router.delete('/:id', deleteReportProc);
router.get('/', getReportsProc);
router.post('/', addReportProc);

module.exports = router;
