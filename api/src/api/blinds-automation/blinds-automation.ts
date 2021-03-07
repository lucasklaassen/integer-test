'use strict';

const middy = require('middy');
const got = require('got');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc'); // dependent on utc plugin
const timezone = require('dayjs/plugin/timezone');
const { jsonBodyParser, httpHeaderNormalizer, doNotWaitForEmptyEventLoop } = require('middy/middlewares');
import { httpJsonApiErrorHandler, cors } from '../../lib/middlewares';

const blindsAutomation = async () => {
  const { body } = await got.post(
    `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.blindsApiKey}`,
    {
      json: {
        email: process.env.blindsUsername,
        password: process.env.blindsPassword,
        returnSecureToken: true,
      },
      responseType: 'json',
    }
  );

  const accessToken = body.idToken;

  dayjs.extend(utc);
  dayjs.extend(timezone);

  dayjs.tz.setDefault('America/Los_Angeles');

  console.log('hour', dayjs().hour());
  console.log('minute', dayjs().minute());

  // if (dayjs().hour() === 7 && dayjs().minute() > 1) {
  const weatherResponse = await got(
    `http://api.openweathermap.org/data/2.5/weather?lat=49.045920&lon=-122.239110&appid=9830be9b09c4e23cdd8c11ac0addd64e`
  );

  const currentUTC = Math.floor(Date.now() / 1000);

  const windResponse = await got(
    `https://api.stormglass.io/v2/weather/point?lat=49.045920&lng=-122.239110&params=windSpeed,gust&source=sg&start=${currentUTC}&end=${currentUTC}`,
    {
      headers: {
        Authorization: process.env.STORM_GLASS_API_KEY,
      },
    }
  );

  const windResponseJson = JSON.parse(windResponse.body);

  console.log('the wind was', windResponse.body);

  let windGust = 0;
  let windSpeed = 0;

  try {
    const windResults = windResponseJson.hours[0];
    windGust = windResults.gust.sg;
    windSpeed = windResults.windSpeed.sg;
  } catch (error) {
    console.log('Error setting wind', error);
  }

  const hardRainWeatherTypes = [
    302,
    312,
    313,
    314,
    321,
    500,
    501,
    502,
    503,
    504,
    511,
    520,
    521,
    522,
    531,
    600,
    601,
    602,
    611,
    612,
    613,
    615,
    616,
    620,
    621,
    622,
  ];

  const bodyJson = JSON.parse(weatherResponse.body);

  const weatherId = bodyJson.weather[0].id;

  console.log('The weather was:', weatherResponse.body);

  console.log('weatherId', weatherId);
  console.log('windGust', windGust);
  console.log('windSpeed', windSpeed);

  const isRaining = Boolean(hardRainWeatherTypes.includes(weatherId));
  const openBlinds = Boolean(!isRaining && windGust < 3 && windSpeed < 3);

  const title = openBlinds ? 'Blinds opened' : 'Blinds closed';
  const message = `Raining: ${isRaining}, Wind Speed (m/s): ${windSpeed}, Wind Gust Speed (m/s): ${windGust}`;

  await got(
    `https://www.pushsafer.com/api?k=${process.env.PUSH_SAFE_KEY}&d=a&t=${encodeURIComponent(
      title
    )}&m=${encodeURIComponent(message)}`
  );

  if (openBlinds) {
    await got(`https://api.rollapp.tech/users/login`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const upCommand = '0xdd';
    // const downCommand = '0xee';

    console.log('Raising Blinds');

    for (let i = 2; i < 5; i += 1) {
      try {
        await got.post(`https://api.rollapp.tech/command`, {
          json: {
            payload: {
              serial: process.env.blindsSerial,
              data: {
                bank: 0,
                address: i,
                cmd: upCommand,
              },
            },
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'json',
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
  // }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        success: true,
      },
    }),
  };
};

const blindsAutomationHandler = middy(blindsAutomation)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(doNotWaitForEmptyEventLoop({ runOnError: true }))
  .use(httpJsonApiErrorHandler())
  .use(cors());

module.exports.blindsAutomation = blindsAutomationHandler;
