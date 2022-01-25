scraper = require('./scrapers.js');

class Weather {

    constructor(token, cityId) {
        this.token = token;
        this.cityId = cityId;
        this.data = [];
    }

    async poll() {
        w = await scraper.getWeatherData(this.token, this.cityId);
        this.data.push(w);
    }

    clear() {
        this.data = [];
    }

    /**
     * Returns weather closest to dt, dt - 1 hour, and dt - 2 hours.
     * Weather must have been polled at least three times already.
     * Prunes cached data older than 24h before the requested dt.
     * @param {Number} dt - Unix time in seconds
     */
    get(dt) {
        if (this.data.length < 3) return (null, null, null);

        w0 = this.data[0];
        w1 = this.data[0];
        w2 = this.data[0];

        dt0 = dt;
        dt1 = dt - (1 * 60 * 60);
        dt2 = dt - (2 * 60 * 60);

        prunedt = dt - (24 * 60 * 60);
        pruneIdx = 0;

        bestDelta0 = Math.abs(dt0 - w0.dt);
        bestDelta1 = Math.abs(dt1 - w1.dt);
        bestDelta2 = Math.abs(dt2 - w2.dt);

        this.data.forEach(w, i => {
            currentDelta0 = Math.abs(dt0 - w.dt);
            currentDelta1 = Math.abs(dt1 - w.dt);
            currentDelta2 = Math.abs(dt2 - w.dt);

            if (currentDelta0 < bestDelta0) w0 = w;
            if (currentDelta1 < bestDelta1) w1 = w;
            if (currentDelta2 < bestDelta2) w2 = w;

            if (w.dt < prunedt && i > pruneIdx) pruneIdx = i;
        });

        this.prune(pruneIdx);

        return (w2, w1, w0);
    }

    prune(startIdx) {
        this.data = this.data.slice(startIdx);
    }
}

module.exports.Weather = Weather;