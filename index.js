#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config()

import serverlessMysql from "serverless-mysql"

const write = process.argv[2] === 'write'

const mysql = serverlessMysql({
  config: {
    host     : process.env.MYSQL_HOST,
    database : process.env.MYSQL_DATABASE,
    port     : process.env.MYSQL_PORT,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD
  }
})

const getJoinDates = async () => {
  const query = 'SELECT email, dateJoined FROM users WHERE dateJoined IS NOT NULL'
  let result = await mysql.query(query)

  return result
}

const writeDays = async (days, email) => {
  const readQuery = `SELECT id, name, resturlaubVorjahr, jahresurlaubInsgesamt, jahresUrlaubAusgegeben, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR FROM vacations WHERE email LIKE '${email}' AND disabled LIKE 0 AND approved LIKE 2 AND type LIKE 'vacation' ORDER BY submitted_datetime DESC LIMIT 1`
  const result = await mysql.query(readQuery)

  if (result[0]) {
    let { 
      resturlaubVorjahr: daysLastYear, 
      jahresurlaubInsgesamt: daysEarned, 
      jahresUrlaubAusgegeben: daysSpent, 
      restjahresurlaubInsgesamt: daysAvailable,
      beantragt: daysRequested,
      resturlaubJAHR: daysLeft
    } = result[0]

    console.log('')
    console.log(email)
    console.log(daysLastYear, daysEarned, daysSpent, daysAvailable, daysRequested, daysLeft)

    daysLastYear = daysLeft
    daysEarned = days
    daysSpent = 0
    daysAvailable = days + daysLeft
    daysRequested = 0
    daysLeft = daysAvailable

    console.log(daysLastYear, daysEarned, daysSpent, daysAvailable, daysRequested, daysLeft)

    // DEBUG
    console.log(`HAD ${daysLastYear} + EARNED ${daysEarned} = HAS ${daysAvailable} days`)

    if (write) {
      const writeQuery = `INSERT INTO vacations (name, email, resturlaubVorjahr, jahresurlaubInsgesamt, jahresUrlaubAusgegeben, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, note, submitted_datetime, submitted_by, approved, approval_datetime, disabled) VALUES ('${result[0].name}', '${email}', ${daysLastYear}, ${daysEarned}, ${daysSpent}, ${daysAvailable}, ${daysRequested}, ${daysLeft}, 'vacation', 'System Update for 2021', '${new Date().toISOString().replace('T', ' ').split('Z')[0]}', 'ndomino', 2, '${new Date().toISOString().replace('T', ' ').split('Z')[0]}', 0);`
      const writeResult = await mysql.query(writeQuery)
      if (writeResult) {
        console.log('Write Success...')
      }
    }
  }
}

const getDaysEarned = years => {
  if (years === 0 || years === 1) {
    return 26
  } else if (years === 2) {
    return 27
  } else if (years === 3) {
    return 28
  } else if (years === 4) {
    return 29
  } else if (years >= 5) {
    return 30
  } else {
    return 26
  }
}

const joinDates = await getJoinDates()

joinDates.map(async user => {
  const dateJoined = new Date(user.dateJoined)
  const dateNow = new Date()

  const yearsService = Math.floor((dateNow - dateJoined) / 31536000000)

  const daysEarned = getDaysEarned(yearsService)

  await writeDays(daysEarned, user.email)

})

await mysql.end()

process.exit(0)
