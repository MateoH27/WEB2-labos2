var express = require('express');
var path = require ('path')
var https = require ('https')
var fs = require ('fs')
//var dotenv = require ('dotenv')
var {createHash} = require('crypto')

const app = express();
const externalUrl = process.env.RENDER_EXTERNAL_URL
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4080;
//dotenv.config()

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); 
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'pug');

app.get('/', function (req, res) {
    let error1 = undefined, error2 = undefined
    res.render('vulnerabilities.pug', {error1, error2});
})

app.get('/xss', function (req, res) {
    var url = req.url;
    let competitionPos = url.indexOf("competition=") + 12;
    let competitorsPos = url.indexOf("competitors=") + 12;
    let competition = url.substring(competitionPos, competitorsPos - 13)
    let competitors = url.substring(competitorsPos)
    let error1 = false, error2 = false
    if (competition.length < 1 || competitors.length < 1) {
        error1 = true
        error2 = false
        res.render('vulnerabilities.pug', {error1, error2})
    } else {
        res.render('xss.pug')
    }
})

app.post('/unsafe', function (req, res) {
    let safe = req.body.sensitive
    let name = req.body.name
    let password = req.body.password
    let error1 = false, error2 = false
    if (name.length < 1 || password.length < 1) {
        error1 = false
        error2 = true
        res.render('vulnerabilities.pug', {error1, error2})
    } else {
        if (safe === undefined) {
            name = encryption(name)
            password = encryption(password)
        }
        res.render('unsafe.pug', {name, password})
    }
})

function encryption(input) {
    return createHash('sha256').update(input).digest("hex")
}

if (externalUrl) {
    const hostname = '0.0.0.0'
    app.listen(PORT, hostname, () => {
      console.log(`Server locally running at https://${hostname}:${PORT}/ and from outside on ${externalUrl}`)
    })
  } else {
    https.createServer({
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }, app).listen(PORT, function() {
      console.log(`Server is running on https://localhost:${PORT}`);
    })
  }