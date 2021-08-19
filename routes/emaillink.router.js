const express = require('express');
const multiparty = require('multiparty');
const fs = require('fs');
const xlsx = require('node-xlsx');
const { sendMail } = require('../core/mailer');
const { sendMessage } = require('../core/smslinker');

const {
  getEmailLinksBySurvey,
  getEmailLinkById,
  createEmailLink,
  updateEmailLink,
  deleteEmailLink,
  setSendingFlag,
} = require('../database/emaillinks');
const { defaultContactsFilePath } = require('../constants/defaultValues');
const { createEmailLinkContacts, getEmailLinkContactsByLinkId, setContactStatus, getEmailLinkContactByLinkIdAndEmail, setEmailOpenById, checkIfContactExist, getEmailLinksCompletedResponses, getEmailLinksTotalResponses, addContactByLink_id, deleteConactByLink_idAndEmail, updateContactByIdAndLink_id } = require('../database/emaillinks_contacts');

var router = express.Router();

const getEmailLinksProc = (req, res, next) => {
  const { survey } = req.query;
  getEmailLinksBySurvey(survey)
    .then(emailLinks => {
      getEmailLinksCompletedResponses(survey)
        .then(emailLinksCompletedResponse => {
          getEmailLinksTotalResponses(survey)
            .then(emailLinksTotalResponses => {
              res.status(200).json({ emailLinks: emailLinks, emailLinksCompletedResponse: emailLinksCompletedResponse, emailLinksTotalResponses: emailLinksTotalResponses })
            })
        })
        .catch(err => {
          console.log(err)
          res.status(500).json({
            code: "emaillink/fetch-error",
            message: "It couldn't fetch all emaillinks.",
          });
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "emaillink/fetch-error",
        message: "It couldn't fetch all emaillinks.",
      });
    })
};

const getEmailLinkProc = (req, res, next) => {
  const id = req.params.id;
  getEmailLinkById(id)
    .then(emailLink => {
      if (emailLink) {
        getEmailLinkContactsByLinkId(emailLink.link_id)
          .then(contacts => {
            res.json({
              ...emailLink,
              contacts,
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              code: "emaillink_contacts/get-contacts",
              message: "It couldn't get the link by id.",
            });
          })
      } else {
        res.status(500).json({
          code: "emaillink/not-found",
          message: "It couldn't get the link by id.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        code: "emaillink/fetch-error",
        message: "It couldn't get the link by id.",
      });
    })
}

const addEmailLinkProc = (req, res, next) => {
  //console.log("hello:", req.body)
  if (req.body.mode && req.body.contact_members) {
    const user_id = req.jwtUser.id;
    let {
      mode,
      survey_id,
      name,
      email_content,
      sender_name,
      sender_email,
      close_quota,
      close_date,
      link_id,
      contact_members
    } = req.body;
    close_quota = close_quota ? close_quota : null;
    close_date = close_date.length ? close_date : null;
    createEmailLink(name, survey_id, user_id, link_id, email_content, sender_name, sender_email, close_quota, close_date, mode)
      .then(result => {
        console.log("smsLink:", result)
        const contactRows = [];
        for (let i = 0; i < contact_members.length; i++) {
          contactRows.push([link_id, contact_members[i].email_address, contact_members[i].first_name,
            contact_members[i].last_name]);
        }
        createEmailLinkContacts(contactRows)
          .then(linked_members => {
            res.status(200).json(result)
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              code: "emaillink-contacts/create-error",
              message: "It couldn't create new email link.",
            });
          });

      })
      .catch(err => {
        console.log(err)
        res.status(500).json({
          code: "smslink/create-error",
          message: "It couldn't create new SMS link."
        })
      })
  }

  else {
    const user_id = req.jwtUser.id;

    var options = {
      autoFiles: true,
      uploadDir: defaultContactsFilePath,
    }

    const form = new multiparty.Form(options);
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          code: "emaillink/parse-error",
          message: "It couldn't create new email link.",
        });
      } else {
        const file = files.file[0];
        const name = file.originalFilename;
        const ext = name.substr((name.lastIndexOf('.') + 1));
        const newname = 'contacts_' + (Date.now().toString()) + '.' + ext;
        const newpath = defaultContactsFilePath + '/' + newname;

        fs.rename(file.path, newpath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({
              code: "emaillink/fs-rename-error",
              message: "It couldn't create new email link.",
            });
          } else {
            const worksheets = xlsx.parse(newpath);
            const rows = worksheets[0].data;
            const firstRow = rows[0];

            if (!(firstRow[0] == "Email Address" && firstRow[1] == "First Name" && firstRow[2] == "Last Name")) {
              res.status(500).send({
                code: "emaillink/not-found-email-link",
                message: "It couldn't parse the contact file because this has the wrong format.",
              });
            } else {
              let {
                mode,
                name,
                survey_id,
                link_id,
                email_content,
                sender_name,
                sender_email,
                close_quota,
                close_date,
              } = JSON.parse(fields.item[0]);

              const contactRows = [];
              for (let i = 1; i < rows.length; i++) {
                contactRows.push([link_id, rows[i][0], rows[i][1], rows[i][2]]);
              }
              close_quota = close_quota ? close_quota : null;
              close_date = close_date.length ? close_date : null;
              console.log("contactRows-->", contactRows);
              createEmailLinkContacts(contactRows)
                .then(result => {
                  createEmailLink(name, survey_id, user_id, link_id, email_content, sender_name, sender_email, close_quota, close_date, mode ? mode : newname)
                    .then(emailLink => {
                      if (emailLink) {
                        res.status(200).json(emailLink);
                      } else {
                        res.status(500).json({
                          code: "emaillink/create-error",
                          message: "It couldn't create new email link.",
                        });
                      }
                    })
                    .catch(err => {
                      console.log(err);
                      res.status(500).json({
                        code: "emaillink/create-error",
                        message: "It couldn't create new email link.",
                      });
                    });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    code: "emaillink-contacts/create-error",
                    message: "It couldn't create new email link.",
                  });
                });
            }
          }
        });
      }
    });
  }
};

const updateEmailLinkProc = (req, res, next) => {
  const emaillink_id = req.params.id;
  let {
    name,
    email_content,
    sender_name,
    sender_email,
    close_quota,
    close_date,
    contact_members,
    mode
  } = req.body;

  close_quota = close_quota.length ? close_quota : null;
  close_date = close_date.length ? close_date : null;
  if (mode == "sms" || mode == "facebook" || mode == "twitter" || mode == "email") {
    updateEmailLink(emaillink_id, name, email_content, sender_name, sender_email, close_quota, close_date)
      .then(emailLink => {
        if (emailLink) {          
          res.status(200).json(emailLink);
        } else {
          res.status(500).json({
            code: "emaillink/update-filter-error",
            message: "It couldn't find the email link.",
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "emaillink/update-filter-error",
          message: "It couldn't update the email link.",
        });
      });
  }
  else {
    updateEmailLink(emaillink_id, name, email_content, sender_name, sender_email, close_quota, close_date)
      .then(emailLink => {
        if (emailLink) {
          res.status(200).json(emailLink);
        } else {
          res.status(500).json({
            code: "emaillink/update-filter-error",
            message: "It couldn't find the email link.",
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          code: "emaillink/update-filter-error",
          message: "It couldn't update the email link.",
        });
      });
  }
}

const deleteEmailLinkProc = (req, res, next) => {
  const emailLink_id = req.params.id;

  deleteEmailLink(emailLink_id)
    .then(result => {
      if (result) {
        res.json({ id: emailLink_id });
      } else {
        res.status(500).send({
          code: "emaillink/not-found-id",
          message: "It couldn't delete the email link.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: "emaillink/delete-error",
        message: "It couldn't delete the email link.",
      });
    })
};

const sendEmailProc = (req, res, next) => {
  const id = req.params.id;
  let email = req.query.email;

  getEmailLinkById(id)
    .then(link => {
      if (link) {
        if (email) {
          getEmailLinkContactByLinkIdAndEmail(link.link_id, email)
            .then(async contact => {
              const email_address = contact.email_address;
              const first_name = contact.first_name;

              link.email_content = link.email_content.replace("{EmailAddress}", link.sender_email);
              link.email_content = link.email_content.replace("{FirstName}", first_name);
              switch (link.contacts_file) {
                case "sms":
                  link.email_content = link.email_content.replace("<p>", "");
                  link.email_content = link.email_content.replace("</p>", "");
                  link.email_content = link.email_content.replace("&amp;", "&"); break;
                case "facebook":
                case "twitter":
                default:
                  link.email_content += `<img src='${req.protocol + '://' + req.get('host')}/link/email/${contact.id}/email-logo.jpg' />`
              }
              console.log("emailContent-->", link.email_content)

              // sending part
              if (link.contacts_file == 'sms') {
                var mailOptions = {
                  body: link.email_content,
                  from: process.env.SENDER_PHONE_NUMBER,
                  to: "+"+email_address.trim()
                };
                try {
                  const success = await sendMessage(mailOptions);
                  const newContact = await setContactStatus(contact.id, success);
                  res.send(newContact);
                } catch (err) {
                  //console.log(err);
                  res.status(500).send({
                    code: "emaillink/sending-email-failed",
                    message: "The email cannot be sent.",
                  });
                }
              }
              else if (link.contacts_file == 'facebook') {
                // facebook sending code here
              }
              else if (link.contacts_file == 'twitter') {
                // twitter sending code here
              }
              else {
                var mailOptions = {
                  from: 'SurveyWizardSite <noreply@surveywizardsite.com>',
                  to: email_address,
                  subject: 'Survey Link From SurveyWizardSite',
                  html: link.email_content
                };

                try {
                  const success = await sendMail(mailOptions);
                  const newContact = await setContactStatus(contact.id, success);

                  res.send(newContact);
                } catch (err) {
                  console.log(err);
                  res.status(500).send({
                    code: "emaillink/sending-email-failed",
                    message: "The email cannot be sent.",
                  });
                }
              }
            })
            .catch(err => {
              console.log(err);
              res.status(500).send({
                code: "emaillink_contacts/get-emaillink-contact-error",
                message: "It couldn't get the contact from this email link.",
              });
            })
        } else {
          getEmailLinkContactsByLinkId(link.link_id)
            .then(async contacts => {
              for (let contact of contacts) {
                const email_address = contact.email_address;
                const first_name = contact.first_name;

                link.email_content = link.email_content.replace("{EmailAddress}", link.sender_email);
                link.email_content = link.email_content.replace("{FirstName}", first_name);
                switch (link.contacts_file) {
                  case "sms":
                    link.email_content = link.email_content.replace("<p>", "");
                    link.email_content = link.email_content.replace("</p>", "");
                    link.email_content = link.email_content.replace("&amp;", "&"); break;
                  case "facebook":
                  case "twitter":
                  default:
                    link.email_content += `<img src='${req.protocol + '://' + req.get('host')}/link/email/${contact.id}/email-logo.jpg' />`
                }

                // sending part
                if (link.contacts_file == 'sms') {
                  var mailOptions = {
                    body: link.email_content,
                    from: process.env.SENDER_PHONE_NUMBER,
                    to: "+"+email_address.trim()
                  };
                  try {
                    const success = await sendMessage(mailOptions);
                    const newContact = await setContactStatus(contact.id, success);
                    res.send(newContact);
                  } catch (err) {
                    //console.log(err);
                    res.status(500).send({
                      code: "emaillink/sending-email-failed",
                      message: "The email cannot be sent.",
                    });
                  }
                }
                else if (link.contacts_file == 'facebook') {
                  // facebook sending code here
                }
                else if (link.contacts_file == 'twitter') {
                  // twitter sending code here
                }
                else {
                  var mailOptions = {
                    from: 'SurveyWizardSite <noreply@surveywizardsite.com>',
                    to: email_address,
                    subject: 'Survey Link From SurveyWizardSite',
                    html: link.email_content
                  };

                  try {
                    const success = await sendMail(mailOptions);
                    console.log("success->>", success)
                    await setContactStatus(contact.id, success);
                  } catch (err) {
                    console.log(err);
                    res.status(500).send({
                      code: "emaillink/sending-email-failed",
                      message: "The email cannot be sent.",
                    });
                  }
                }
              }

              setSendingFlag(id, true)
                .then(result => {
                  if (result) {
                    res.status(200).json({
                      success: true,
                      id: result.id,
                    });
                  } else {
                    res.status(500).send({
                      code: "emaillink/update-sending-flag-error",
                      message: "The email cannot be sent.",
                    });
                  }
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).send({
                    code: "emaillink/not-found-email-link",
                    message: "The email cannot be sent.",
                  });
                });
            })
            .catch(err => {
              console.log(err);
              res.status(500).send({
                code: "emaillink_contacts/get-emaillinks-contacts-error",
                message: "It couldn't get the contacts from this email link.",
              });
            });
        }
      } else {
        res.status(500).send({
          code: "emaillink/not-found-email-link",
          message: "The email cannot be sent.",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: "emaillink/get-email-link-error",
        message: "The email cannot be sent.",
      });
    })
}

const trackEmailProc = (req, res, next) => {
  const contact_id = req.params.id;

  setEmailOpenById(contact_id)
    .then(contact => {
      res.render('email-logo', {});
    })
    .catch(() => {
      res.render('email-logo', {});
    })
}

const checkEmailProc = (req, res, next) => {
  const link_id = req.query.share;
  const email_address = req.query.email;

  checkIfContactExist(link_id, email_address)
    .then(contact => {
      if (contact) {
        res.json(contact);
      } else {
        res.status(401).send({
          code: "emaillink_contact/not-found-contact",
          message: "This email has not been invited",
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(401).send({
        code: "emaillink_contact/check-error",
        message: "This email has not been invited",
      });
    })
}

const addContactProc = (req, res, next) => {
  const { emaillink_id, link_id, email, firstname, lastname } = req.body
  addContactByLink_id(link_id, email, firstname, lastname)
    .then(contact => {
      getEmailLinkById(emaillink_id)
        .then(emailLink => {
          if (emailLink) {
            getEmailLinkContactsByLinkId(emailLink.link_id)
              .then(contacts => {
                res.json({
                  ...emailLink,
                  contacts,
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  code: "emaillink_contacts/get-contacts",
                  message: "It couldn't get the link by id.",
                });
              })
          } else {
            res.status(500).json({
              code: "emaillink/not-found",
              message: "It couldn't get the link by id.",
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            code: "emaillink/fetch-error",
            message: "It couldn't get the link by id.",
          });
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({
        code: 'contact/add-error',
        message: "It couldn't add the contact."
      })
    })
}

const deleteContactProc = (req, res, next) => {
  const { id, link_id, contact } = req.body;
  deleteConactByLink_idAndEmail(link_id, contact)
    .then(contact => {
      getEmailLinkById(id)
        .then(emailLink => {
          if (emailLink) {
            getEmailLinkContactsByLinkId(emailLink.link_id)
              .then(contacts => {
                res.json({
                  ...emailLink,
                  contacts,
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  code: "emaillink_contacts/get-contacts",
                  message: "It couldn't get the link by id.",
                });
              })
          } else {
            res.status(500).json({
              code: "emaillink/not-found",
              message: "It couldn't get the link by id.",
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            code: "emaillink/fetch-error",
            message: "It couldn't get the link by id.",
          });
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send({
        code: 'contact/delete-error',
        message: "It couldn't delete this contact."
      })
    })
}

const updateContactProc = (req, res, next) => {
  const id = req.params.id;
  const { emaillink_id, link_id, email, firstname, lastname } = req.body;
  updateContactByIdAndLink_id(id, link_id, email, firstname, lastname)
    .then(contact => {
      getEmailLinkById(emaillink_id)
        .then(emailLink => {
          if (emailLink) {
            getEmailLinkContactsByLinkId(emailLink.link_id)
              .then(contacts => {
                res.json({
                  ...emailLink,
                  contacts,
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  code: "emaillink_contacts/get-contacts",
                  message: "It couldn't get the link by id.",
                });
              })
          } else {
            res.status(500).json({
              code: "emaillink/not-found",
              message: "It couldn't get the link by id.",
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            code: "emaillink/fetch-error",
            message: "It couldn't get the link by id.",
          });
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send({
        code: 'contact/update-error',
        message: "It couldn't update this contact."
      })
    })

}


router.get('/check', checkEmailProc);
router.get('/:id/email-logo.jpg', trackEmailProc);
router.get('/:id/send', sendEmailProc);
router.post('/:id', getEmailLinkProc);
router.put('/:id', updateEmailLinkProc);
router.delete('/:id', deleteEmailLinkProc);
router.get('/', getEmailLinksProc);
router.post('/', addEmailLinkProc);
router.post('/contact/add', addContactProc);
router.delete('/contact/delete', deleteContactProc);
router.put('/contact/:id', updateContactProc);

module.exports = router;
