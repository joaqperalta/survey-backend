const accountSid = process.env.SMS_ACCOUNT_SID;
const authToken = process.env.SMS_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendMessage = (messageOptions) => {
    return new Promise((resolve, reject) => {
        client.messages
            .create(messageOptions)
            .then(message => {console.log("SMSmessage sending success->>", message); resolve(true);})
            .catch(err => {console.log("SMSmessage sending errors->>", err); reject(err);});
    })
}

module.exports = {
    sendMessage,
}