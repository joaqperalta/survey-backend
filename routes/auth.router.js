const express = require('express');
const jwt = require('jsonwebtoken');

const {
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  getUserByEmail,
  getUserById,
  resetPassword,
  updateUserNameById,
  updateUserPasswordById,
} = require('../database/users');
const forgotPasswordEmail = require('../mail-template/forgot-password');
const crypt = require('../core/encryption');
const { sendMail } = require('../core/mailer');
const { updateUserProfileById, getUserProfileById } = require('../database/users_profiles');

require('dotenv').config();

var router = express.Router();

const loginUserProc = (req, res, next) => {
  const {email, password} = req.query;

  signInWithEmailAndPassword(email, password)
    .then (rows => {
      if (rows.length == 1) {
        var user = rows[0];

        const payload = {
          id: user.id,
          name: user.name,
        };

        // Sign token
        jwt.sign(
          payload,
          process.env.TOKEN_SECRET_KEY,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (err) {
              console.log(err);
            } else {
              user.accessToken = 'Bearer ' + token;

              res.status(200).json({user});
            }
          }
        );
      } else {
        res.status(200).json({
          code: "auth/wrong-password",
          message: "The password is invalid or the user does not have a password.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        code: "auth/login-error",
        message: "It couldn't login user with this credential.",
      });
    });
}

const registerUserProc = (req, res, next) => {
  const {name, email, password} = req.body;

  createUserWithEmailAndPassword(name, email, password)
    .then(result => {
      if (result.success == true) {
        var user = result.rows[0];

        const payload = {
          id: user.id,
          name: user.name,
        };

        // Sign token
        jwt.sign(
          payload,
          process.env.TOKEN_SECRET_KEY,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (err) {
              console.log(err);
            } else {
              user.accessToken = 'Bearer ' + token;

              res.status(200).json({user});
            }
          }
        );
      } else {
        res.status(200).json({
          code: "auth/duplicated-email",
          message: "The same email exists.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({
        code: "auth/create-user-error",
        message: "It couldn't create new user.",
      });
    });
};

const forgotPasswordProc = (req, res, next) => {
  const {email} = req.query;

  getUserByEmail(email)
  .then(async user => {
    if (user) {
      const resetPasswordLink = process.env.FRONTEND_URL + `/user/reset-password?token=` + crypt.encrypt(user.email);


      var mailOptions = {
        from: 'SurveyWizardSite <noreply@surveywizardsite.com>',
        to: user.email,
        subject: 'Survey Link',
        html: forgotPasswordEmail(user.name, resetPasswordLink),
        envelope: {
          from: 'SurveyWizardSite <noreply@surveywizardsite.com>',
          to: user.email,
        }
      };

      await sendMail(mailOptions);

      res.status(200).json(null);
    } else {
      res.status(200).json({
        code: "auth/not-found-email",
        message: "Your email is not registered."
      });
    }
  })
  .catch(err => {
    console.log(err);
    res.status(401).json({
      code: "auth/get-user-error",
      message: "Your email is not registered."
    });
  })
}

const resetPasswordProc = (req, res, next) => {
  const {resetPasswordCode, newPassword} = req.body;

  // const email = crypt.decrypt('resetPasswordCode');
  try {
    const email = crypt.decrypt(resetPasswordCode);

    resetPassword(email, newPassword)
      .then(user => {
        if (user) {
          res.status(200).json(null);
        } else {
          res.status(200).json({
            code: "auth/wrong-token",
            message: "There is wrong token.",
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(401).json({
          code: "auth/reset-password-query-error",
          message: "It couldn't reset the password."
        })
      });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      code: "auth/reset-password-code-error",
      message: "Wrong reset password code!"
    });
  }
  
}

const getCurrentUserProc = (req, res, next) => {
  const user_id = req.jwtUser.id;
  getUserById(user_id)
    .then (user => {
      if (user) {
        const payload = {
          id: user.id,
          name: user.name,
        };

        // Sign token
        jwt.sign(
          payload,
          process.env.TOKEN_SECRET_KEY,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (err) {
              console.log(err);
              res.status(401).json({
                code: "auth/get-access-token-error",
                message: "It couldn't get current user."
              });
            } else {
              user.accessToken = 'Bearer ' + token;
              res.status(200).json(user);
            }
          }
        );
      } else {
        console.log(err);
        res.status(401).json({
          code: "auth/get-user-query-error",
          message: "Wrong User Id!"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(401).json({
        code: "auth/get-current-user-error",
        message: "It couldn't get current user.",
      });
    })
}

const getCurrentUserProfileProc = (req, res, next) => {
  const user_id = req.jwtUser.id;

  getUserProfileById(user_id)
    .then(user_profile => {
      res.json(user_profile);
    })
    .catch(err => {
      console.log(err);
      res.status(401).json({
        code: "auth/get-user-profile-error",
        message: "It couldn't get your profile.",
      });
    })
}

const updateCurrentUserProc = (req, res, next) => {
  const {
    name, 
    location,
    birthday,
    gender,
    short_description,
    long_description,
  } = req.body;

  const user_id = req.jwtUser.id;

  updateUserNameById(user_id, name)
    .then(user => {
      updateUserProfileById(user_id, {location, birthday, gender, short_description, long_description})
        .then(user_profile => {
          res.json({
            name,
            ...user_profile,
          });
        })
        .catch(err => {
          console.log(err);
          res.status(401).json({
            code: "auth/update-user-profile-error",
            message: "It couldn't update your profile.",
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(401).json({
        code: "auth/update-username-error",
        message: "It couldn't update your profile.",
      });
    })
}

const updatePasswordProc = (req, res, next) => {
  const {password} = req.body;
  const user_id = req.jwtUser.id;

  updateUserPasswordById(user_id, password)
    .then(user => {
      if (user) {
        console.log(user);
        res.json({
          password: user.password,
        });
      } else {
        res.status(401).json({
          code: "auth/not-found-user",
          message: "It couldn't udpate your password",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(401).json({
        code: "auth/update-password-error",
        message: "It couldn't update your password.",
      });
    })

}

router.get('/me/profile', getCurrentUserProfileProc);
router.get('/me', getCurrentUserProc);
router.put('/me', updateCurrentUserProc);
router.get('/login', loginUserProc);
router.post('/signup', registerUserProc);
router.get('/forgot-password', forgotPasswordProc);
router.post('/reset-password', resetPasswordProc);
router.put('/password', updatePasswordProc);

module.exports = router;
