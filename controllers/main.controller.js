var testModel = require('../models/test.model');
var request = require('request');
var cheerio = require('cheerio')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var scraping = false;
var authToken = ''
var csvHeader = [
    { id: 'country', title: 'Country' },
    { id: 'keyword', title: "KeyWord" },
    { id: 'name', title: "Name" },
    { id: 'link', title: "Partidos jugados (total)" },
    { id: 'image', title: "Sample Image" },
    { id: 'first_name', title: "Nacionalidad" },
    { id: 'last_name', title: "Equipo" },
    { id: 'username', title: "Selección nacional" },
    { id: 'location', title: "Edad" },
    { id: 'company', title: "Edad" },
    { id: 'url', title: "Edad" },
    { id: 'website', title: "Personal website" }
]
var countries = [
    'IN',
    'AU',
    'AR',
    'BR',
    'CN',
    'FR',
    'DE',
    'IT',
    'ID',
    'JP',
    'KR',
    'MX',
    'NG',
    'PL',
    'ZA',
    'RU',
    'ES',
    'TR',
    'SE',
    'US',
    'CA',
];
var keywords = [
    'Cute',
    'Abstract',
    'Ethereal',
    'Minimalist',
    'Extravagant',
    'Stylised',
    'Spontaneous',
    'Pop',
    'Sensual',
    'Erotic',
    'Sensuous',
    'Manga',
    'Anime',
    'Graffiti',
    'Street',
    'Kawaii',
    'Spiritual',
    'Impressionist',
    'Parody',
    'Surreal',
    'Dark',
    'Outrageous',
    'Satire',
    'Slapstick',
    'Deadpan',
    'Self-Deprecating',
    'Edgy'
]
class mainController {

    async start(req, res) {
        console.log('-start-');
        for (let i = 0; i < countries.length; i++) {
            let countryCode = countries[i];
            for (let j = 0; j < keywords.length; j++) {
                let keyword = keywords[j];
                let requestUrl = `https://www.behance.net/search?content=projects&country=${countryCode}&search=${keyword}`
                let result = await sendRequest(requestUrl);
                let $ = cheerio.load(result);
                let data = $('script#beconfig-store_state');
                data = data.get()[0].children[0].data
                data = JSON.parse(data)
                let { projects } = data.search.content;
                // projects = projects.slice(0, 20);
                let temp = {};
                projects.forEach(element => {
                    let { name, owners, covers } = element;
                    let { first_name, last_name, username, location, company, url, country, website } = owners[0]
                    let item = {
                        country,
                        keyword,
                        name,
                        image: covers['max_808'],
                        link: element.url,
                        first_name,
                        last_name, username,
                        location, company,
                        url,
                        website
                    }
                    if (!temp[username]) {
                        temp[username] = item;
                    }
                });

                temp = Object.values(temp);
                temp = temp.slice(0, 20)
                console.log(temp.length)
                if (temp.length) {
                    let csvWriter = createCsvWriter({
                        path: `./result.csv`,
                        header: csvHeader,
                        append: true
                    });
                    await csvWriter.writeRecords(temp)       // returns a promise
                        .then(() => {
                            console.log(countryCode, keyword, 'added');
                        });
                }
            }
        }
        res.send('projects');
    }
}

function sendRequest(url) {
    return new Promise((resolve, reject) => {
        let options = {
            url: url,
            method: "GET",
        };
        request(options, (err, res, body) => {
            if (err) console.log(err);
            resolve(body);
        });
    });
}

module.exports = mainController;