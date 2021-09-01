var express = require('express');
var {createPillar, getPillars, updatePillarById, deletePillars} = require('../database/pillars');

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


const updatePillarProc = (req, res, next) => {
  const { pillar_id, name } = req.body;
  updatePillarById(pillar_id, name )
    .then(pillar => {
      if (pillar) {
        res.json(pillar);
      } else {
        console.log(err);
        res.status(500).json({
          code: "pillars/update-error",
          message: "It couldn't update the pillar.",
        });
      }
    })
}
const deletePillarProc = (req, res, next) => {
  const ids = req.body.ids;

  if (ids.length == 0) {
    res.status(200).json([]);
  } else {
    deletePillars(ids)
      .then(deletedPillars => {
        res.status(200).json(deletedPillars)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "users/delete-error",
          message: "It couldn't delete users.",
        });
      });
  }
}

router.get('/', getPillarsProc);
router.post('/', addPillarProc);
router.post('/update', updatePillarProc);
router.delete('/',deletePillarProc)

module.exports = router;
