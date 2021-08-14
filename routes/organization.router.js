const express = require('express');
const {
  getOrganizations, 
  createOrganization,
  deleteOrganizations,
} = require('../database/organizations');

const router = express.Router();

const getOrganizationsProc = (req, res, next) => {
  getOrganizations()
    .then(organizations => {
      res.json(organizations);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: 'organizations/get-organizations-error',
        message: "It couldn't get organizations.",
      })
    });
}

const addOrganizationProc = (req, res, next) => {
  const {name} = req.body;

  createOrganization(name)
    .then(result => {
      if (result.success == true) {
        var organization = result.organization;
        res.status(200).json(organization);
      } else {
        res.status(500).json({
          code: "organizations/duplicated-name",
          message: "There is a organization with the same name.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "organizations/create-organization-error",
        message: "It couldn't create new organization.",
      });
    });
}

const deleteOrganizationProc = (req, res, next) => {
  const ids = req.body.ids;

  if (ids.length == 0) {
    res.status(200).json([]);
  } else {
    deleteOrganizations(ids)
      .then(deletedOrganizations => {
        res.status(200).json(deletedOrganizations)
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "organizations/delete-error",
          message: "It couldn't delete organizations.",
        });
      });
  }
}

router.get('/', getOrganizationsProc);
router.post('/', addOrganizationProc);
router.delete('/', deleteOrganizationProc);

module.exports = router;
