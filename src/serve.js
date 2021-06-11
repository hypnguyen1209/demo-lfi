const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const app = express()
const logs = _ => require('./logs.json').map(item => {
    return {
        name: item.name,
        cre: (new Date(item.cre)).toLocaleString()
    }
})
let log = logs()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const writeFile = (data, name) => {
    return new Promise(resolve => {
        fs.writeFile(__dirname + `${name}`, data, err => {
            if (!err) {
                resolve()
            }
        })
    })
}
const readFile = file => {
    return new Promise(resolve => {
        fs.readFile(__dirname + `/../public/${file}`, { encoding: 'utf8' }, (err, data) => {
            if (!err) {
                resolve(data)
            }
        })
    })
}
app.get('/', (req, res) => {
    res.redirect('/all')
})

app.get('/all', async (req, res) => {
    res.render('index', {
        state: 1,
        file: log
    })
})

app.get('/view', async (req, res) => {
    try {
        let { file } = req.query
        let data = await readFile(file)
        res.render('index', {
            state: 3,
            text: data
        })
    } catch (error) {
        res.send('File Invalid')
    }
})

app.get('/create', (req, res) => {
    res.render('index', {
        state: 2
    })
})

app.post('/submit', async (req, res) => {
    try {
        let { name_file, text } = req.body
        if (!log.includes(name_file)) {
            await writeFile(text, `/../public/${name_file}`)
            log.push({
                name: name_file,
                cre: (new Date(Date.now())).toLocaleString()
            })
            await writeFile(JSON.stringify(log), '/../src/logs.json')
            res.status(302).redirect('/')
        }
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})

app.get(/\/public\/(.+?)$/, (req, res) => {
    res.status(403).json({
        statusCode: 403,
        message: 'Forbidden'
    })
})

app.listen(process.env.PORT || 6500, () => {
    console.log('Running...')
})