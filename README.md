# cs3130-project-helper

This helper is a discord bot for ZAP: the Zoom Attendance Project for CS 3130 at the University of Utah. Automatically reports weather at current time, 1 hour prior, and 2 hours prior to scheduled class times.

### Current Features
* /weather discord command: Gets current weather/temp for the city as provided in .env
  * Optional 'datetime' parameter uses natural language parsing to provide historical data with hour precision
  * For example: `/weather last Friday` returns weather at this time last Friday
* ~~/covid command: gets new cases and 7 day avg new cases totals from https://coronavirus.utah.edu.~~ _DEPRECATED_
  * _(No longer implemented due to lapse of support from University of Utah coronavirus website)_
* Scheduled updates: Reports weather ~~and covid data~~ automatically at class times
  * Note: Schedule is hard-coded in (see planned features)
  * Minute-precision of historical datapoints in scheduled reports
  * Run `/subscribe` or `/unsubscribe` to configure which channels to report to
* Dockerized: It's simple to get the helper running on any system with docker installed

### Planned Features
* Make class schedules configured from file

### How to Use
Create a .env file and add the following variables:
* DISCORD_API_KEY=[your discord application token]
* INTENTS=[discord permissions needed]
* APPLICATION_ID=[your discord app id]
* OPENWEATHER_CITY_ID=[openweathermap city id for weather data]
* OPENWEATHER_TOKEN=[your openweathermap api token]
* DATA_DIRECTORY=[path to a persistent directory to store subscribed channel]

#### To register commands with discord:
1. `cd cs3130-project-helper/src`
2. `DISCORD_API_KEY=<your API key> APPLICATION_ID=<discord app id> node deploy-commands.js`

#### To start the bot:
1. Make sure you have docker and docker-compose installed
2. Clone and `cd cs3130-project-helper`
3. Configure .env file (see [.env.example](./.env.example))
4. Make a persistent data directory with `mkdir data`
5. `docker-compose up -d`
