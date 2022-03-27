const axios = require('axios');
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

exports.getCovidData = getCovidData;
exports.getWeatherData = getWeatherData;
exports.getWeatherDataHistorical = getWeatherDataHistorical;

/**
 * 
 * @returns { String, String, String }
 */
 async function getCovidData() {
    const html = await axios({
                            method: 'get',
                            url: 'https://coronavirus.utah.edu', 
                            responseType: 'document',
                        })
                            .then((response) => response.data)
                            .catch(console.error);

    // convert html to DOM document
    const document = new JSDOM(html).window.document;

    // totals are on row 5 of data table
    const totals = document.getElementsByClassName('row-5 odd')[0].cells

    return { dt: Date.now(),
            newCases: totals[1].textContent, 
            weeklyAvg: totals[2].textContent 
        };
}

/**
 * 
 * @param {String} token 
 * @param {String} cityId 
 * @returns { }
 */
 async function getWeatherData(token, cityId) {

    // use current time
    const time = Math.floor(Date.now() / 1000);

    // request current JSON from API
    const nowJson = await axios.get(`https://api.openweathermap.org/data/2.5/weather?id=${cityId}&dt=${time}&APPID=${token}`)
                            .then((response) => response.data)
                            .catch(console.error);
    
    // get current time and temp info
    const tm0 = new Date(nowJson.dt * 1000);
    const tm0_temp = (((nowJson.main.temp - 273) * 9/5) + 32).toFixed(2);

    // get city and current nominal weather
    const city = nowJson.name;
    const weathers = Array.from(nowJson.weather, w => w.description).join(', ');

    return { dt: tm0,
            city: city,
            temp: tm0_temp,
            weather: weathers
        };
}

/**
 * 
 * @param {String} token 
 * @param {String} cityId 
 * @param {Date} datetime 
 * @returns 
 */
async function getWeatherDataHistorical(token, cityId, datetime) {
    // convert to unix time in seconds
    const time = Math.floor(datetime.getTime() / 1000);

    // request historical JSON from API
    const histJson = await axios.get(`http://history.openweathermap.org/data/2.5/history/city?id=${cityId}&start=${time}&cnt=1&APPID=${token}&type=hour`)
                            .then((response) => response.data)
                            .catch(console.error);
    
    // get historical time and temp info
    const tm0 = new Date(histJson.dt * 1000);
    const tm0_temp = (((histJson.main.temp - 273) * 9/5) + 32).toFixed(2);

    // get city and nominal weather
    const city = histJson.name;
    const weathers = Array.from(histJson.weather, w => w.description).join(', ');

    return { dt: tm0,
            city: city,
            temp: tm0_temp,
            weather: weathers
        };
}