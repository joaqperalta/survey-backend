var express = require('express');
var {createPillar, getPillars} = require('../database/pillars');

var router = express.Router();

const getPillarsProc = (req, res, next) => {
  getPillars()
  .then(pillars => {
    res.status(200).json(pillars);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      code: "pillar/fetch-error",
      message: "It couldn't fetch all pillars.",
    });
  })
};

const addPillarProc = (req, res, next) => {
  const {name} = req.body;

  createPillar(name)
    .then(pillar => {
      if (pillar) {
        res.status(200).json(pillar); 
      } else {
        res.status(200).json({
          code: "pillar/create-error",
          message: "It couldn't create new pillar.",
        });
      }
    })
    .catch(e => {
      res.status(200).json({
        code: "pillar/create-error",
        message: "It couldn't create new pillar.",
      });
    });
};

router.get('/', getPillarsProc);
router.post('/', addPillarProc);

module.exports = router;
