'use strict'

const {google} = require('googleapis')
const os = require('os')
const moment = require('moment')
const program = require('commander')

program
.version('0.0.1')
.usage('[options]')
.option('-s, --sheet [sheet name]', "sheet name (defaults to own hostname)")
.option('-i, --spreadsheet-id [id]', "spreadsheet ID (or supply SPREADSHEET_ID in environment)")
.option('-c, --config-sheet-name [sheet name]', "name of the sheet to provide config (defaults to \"'config'\")")
.parse(process.argv)

const hostname = program.sheet || os.hostname()
const spreadsheetId = process.env.SPREADSHEET_ID || program.spreadsheetId
const configSheetName = program.configSheetName || "'config"

const defaults = {
  skipRows: 2,
  updateCell: 'E5',
  prefix: 'export TAG_',
  doUppercase: true
}

if (!spreadsheetId) {
  console.error(`
  No spreadsheet id supplied. Supply with --spreadsheet-id flag or SPREADSHEET_ID env var. 
  Aborting.`)
  process.exit(1)
}

function skipRows (sheet, skipRows) {
  const values = sheet.data.values
  return values.slice(skipRows, values.length)
}

function parseConfig (sheet) {
  try {
    let config = {} 
    for (const row of skipRows(sheet, 1)) {
      if (row[0] && row[0] !== '' && row[1] && row[1] !== '') {
        config[row[0]] = JSON.parse(row[1])
      }
    }
    return Object.assign({}, defaults, config)
  } catch(e) { 
    throw 'Error while parsing config.'
  }
}

const main = async () => {
  const usingEnvCreds = typeof process.env.GOOGLE_APPLICATION_CREDENTIALS !== 'undefined'
  const privatekey = usingEnvCreds ? null : require("./privatekey.json")
  const jwtClient = new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'])

  await jwtClient.authorize()
  .catch (e => {
    throw "Unable to authorize. Check connection?"
  })

  const sheets = google.sheets({
    version: 'v4', 
    auth: jwtClient
  })

  const configSheet = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: configSheetName
  }).catch(e => { 
    throw `Unable to find config sheet: is there a ${configSheetName} sheet?` 
  })
  
  const config = parseConfig(configSheet)
  
  const targetSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${hostname}`
  }).catch(e => {
    throw `Unable to find sheet with hostname: ${hostname}.`
  })

  // Write the timestamp
  const datetimeStamp = moment().format('DD/MM/YYYY HH:mm:ss')
  const writeResult = await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `${hostname}!${config.updateCell}`,
    valueInputOption: 'USER_ENTERED',
    resource: {values: [[datetimeStamp]]}
  })

  const rows = skipRows(targetSheet, config.skipRows)
  for (const row of rows) {
    if (typeof row[0] !== 'undefined' && row[0] !== '') {
      console.log(`${config.prefix}${config.doUppercase ? row[0].toUpperCase() : row[0]}=${row[1]}`)
    }
  }
}

(async ()=> { 
  await main()
  .catch (err => { 
    console.error(err);
    console.error("Aborting.");
    process.exit(1);
  })
})()
