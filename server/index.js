const express = require('express')
const path = require("path");
const compression = require("compression")

const port = process.env.PORT || 3001
const app = express()

app.use(compression())

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})