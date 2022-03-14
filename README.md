# cs3130-project-helper

This helper is a discord bot for ZAP: the Zoom Attendance Project for CS 3130 at the University of Utah.

**Current Features**
* /weather command: gets current weather/temp for the provided city, and temperature for ~1hr ago and ~2hrs ago.
* ~~/covid command: gets new cases and 7 day avg new cases totals from https://coronavirus.utah.edu.~~ DEPRECATED
* scheduled updates: poll weather ~~and covid data~~ automatically at class times
  * Note: Hard-coded in (see planned features)
* minutely weather data: save weather data for minute-precision of historical datapoints

**Planned Features**
* make class schedules configured from file

**How to Use**  
Create a .env file and add the following variables:
* DISCORD_API_KEY=[your discord application token]
* INTENTS=[discord permissions needed]
* APPLICATION_ID=[your discord app id]
* OPENWEATHER_CITY_ID=[openweathermap city id for weather data]
* OPENWEATHER_TOKEN=[your openweathermap api token]
* DATA_DIRECTORY=[path to a persistent directory to store subscribed channel]

Run `node deploy-commands.js` to register commands with Discord, then `node index.js` to start the bot.
