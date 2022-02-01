const scraper = require('./scrapers.js');
const moment = require('moment');

class Weather {

    constructor(token, cityId) {
        this.token = token;
        this.cityId = cityId;
        this.data = [];
    }

    async poll() {
        const w = await scraper.getWeatherData(this.token, this.cityId);
        this.data.push(w);
    }

    clear() {
        this.data = [];
    }

    /**
     * Returns weather closest to dt, dt - 1 hour, and dt - 2 hours.
     * Weather must have been polled at least three times already.
     * Prunes cached data older than 24h before the requested dt.
     * @param {Number} dt - Unix time in milliseconds
     */
    get(dt) {
        if (this.data.length < 3) return (null, null, null);

        var w0 = this.data[0];
        var w1 = this.data[0];
        var w2 = this.data[0];

        // times shortened for testing!!!

        var dt0 = moment(dt);
        var dt1 = moment(dt).subtract(1, 'minute');
        var dt2 = moment(dt).subtract(2, 'minutes');

        const prunedt = moment(dt).subtract(1, 'day');
        var pruneIdx = 0;

        var bestDelta0 = Math.abs(dt0.diff(moment(w0.dt)));
        var bestDelta1 = Math.abs(dt1.diff(moment(w1.dt)));
        var bestDelta2 = Math.abs(dt2.diff(moment(w2.dt)));

        this.data.forEach((w, i) => {
            const currentMoment = moment(w.dt);

            const currentDelta0 = Math.abs(dt0.diff(currentMoment));
            const currentDelta1 = Math.abs(dt1.diff(currentMoment));
            const currentDelta2 = Math.abs(dt2.diff(currentMoment));

            if (currentDelta0 < bestDelta0) {
                w0 = w;
                bestDelta0 = currentDelta0;
            }

            if (currentDelta1 < bestDelta1) {
                w1 = w;
                bestDelta1 = currentDelta1;
            } 

            if (currentDelta2 < bestDelta2) {
                w2 = w;
                bestDelta2 = currentDelta2;
            }

            if (currentMoment.isBefore(prunedt) && i > pruneIdx) {
                pruneIdx = i;
            }
        });

        this.prune(pruneIdx);

        return [w0, w1, w2];
    }

    prune(startIdx) {
        this.data = this.data.slice(startIdx);
    }
}

module.exports.Weather = Weather;