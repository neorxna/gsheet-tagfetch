const {google} = require('googleapis');
const privatekey = require("./privatekey.json");

const hostname = process.env.HOST_HOSTNAME

let jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']);

jwtClient.authorize((err, tokens) => {
    if (err) {
      console.error(err);
      return;
    } else {

      const sheets = google.sheets({version: 'v4', auth: jwtClient});

      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: `${hostname}`
      }, (err, response) => {
        if (err) {
          console.error(err);
        } else {
          const dataRows = response.data.values.slice(1, response.data.values.length)       
          for (const row of dataRows) {
            console.log(`export TAG_${row[0].toUpperCase()}=${row[1]}`)
          }
        }
      })
   }
})
