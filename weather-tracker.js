scraper = require('./scrapers.js');

class Weather {

    constructor(token, cityId) {
        this.token = token;
        this.cityId = cityId;
        this.data = [];
    }

    poll() {
        this.data.push(scraper.getWeatherData(this.token, this.cityId));
    }
}