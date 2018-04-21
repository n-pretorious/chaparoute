var axios = require('axios');
var request = require('request');
var restify = require('restify');
var builder = require('botbuilder');
var datetime = require('node-datetime');
var NodeGeocoder = require('node-geocoder');


var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyDCJpc1WMopfQIThVwfnZf4k5egV6_D2jo', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

const login = async () => await axios({
    method: "POST",
    headers: {
        "ACCEPT": "application/json"
    },
    url: "https://identity.whereismytransport.com/connect/token",
    data: {
        client_id: "d42c8405-47b8-4e29-ae73-9264b3802326",
        client_secret: "tJ9HgCoPSUunzdfO23fEPpfVKkqVAiwbeshZvE9hvRc=",
        grant_type: "client_credentials",
        scope: "transportapi:all"
    }
})

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, async () => {
    // try {
    //   const response = await login()
    //   console.log(response)
    // } catch (e) {
    //   console.log(e);
    // } finally {
    //   console.log('%s listening to %s', server.name, server.url);
    // }
    console.log('%s listening to %s', server.name, server.url);
});

const apiToken =
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBBNDU1OTA5OTQwQjJGQTQ5OEJGNTgyMzhBNkU3N0Y0MTFGM0NEOTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJDa1ZaQ1pRTEw2U1l2MWdqaW01MzlCSHp6WkkifQ.eyJuYmYiOjE1MjQyNjY1NTIsImV4cCI6MTUyNDI3MDE1MiwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tIiwiYXVkIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6ImQ0MmM4NDA1LTQ3YjgtNGUyOS1hZTczLTkyNjRiMzgwMjMyNiIsImNsaWVudF90ZW5hbnQiOiJkOTBlMjNiZi1jOWM1LTQzMjEtODAyNS0xNDNhNGFhYzBhNjQiLCJqdGkiOiJhNWY4MDQyZmQ0YWE1MDc1OGZkYjQxMTJlYWFlNjFhMSIsInNjb3BlIjpbInRyYW5zcG9ydGFwaTphbGwiXX0.Wdmgos5fAsfie2pmkzOx3ULYfukmPYWFwaHDzdYIuJfmJrRWQBo1Kt2uDCpYd1Fh6R9UxEn-HLgQ-4JKBpdzQLGZvUbIe6CN9anHQV9Niv8ewYkkVa_9GwlvYmYJy1OeUW1nBRErAy9-PeQFQdyEXirCPjMQ1YukXakz-7UQBoKFAVJk_57B0BYix5FhUp1Ss4Tispn8mxre7-w1xDX9DqecJmtdkRAfR5QZuv3dWRx39s2oZaaXcZbfl297EJL8uoaEzKNA4cuyEUt1KZJEEhJa1YANKGJDHGG23s412d51SPNJVppKq-aNs2li67fdE4WrB1Iwckh1KMad5vPeRw"

const getCoordinates = async (location) => {
    return await geocoder.geocode(location)
}

// getCoordinates('test')
Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: "4641d403-baae-4f07-86fb-a3db56d0b95e",
    appPassword: "wcaoKBCTN38{pfvSY749%%~"
});

// export class ChatConnector implements IConnector, IBotStorage {
//   appId:,
//   appPassword:,
// }

Listen for messages from users
server.post('/api/messages', connector.listen());
// listen(): (req: any, res: any) => void;

var userStore = [];
var bot = new builder.UniversalBot(connector, async (session) => [
    // await login()
    // session.beginDialog('route')
]);

bot.dialog('greetings', [
    function(session) {
        session.send('Welcome to ChapaRoute!'),
            builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function(session, results) {
        session.send(`Hello ${results.response}!`);
        session.beginDialog('languagePicker');
    },
]);

bot.dialog('languagePicker', [
    function(session, args) {
        welcome_subtitle = 'Choose language/Chagua lugha!';
        menuOptions = [{
            value: 'English',
            title: "en"
        }, {
            value: 'Kiswahili',
            title: "ksw"
        }];
        builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
            listStyle: builder.ListStyle.button
        });
    },
    function(session, results) {
        var locale = results.response.entity;
        session.preferredLocale(locale);
        if (results.response.entity == 'English') {
            session.send("Hurray! Language updated.");
        } else {
            session.send("Karibu sana!");
        }
        session.beginDialog('route');
    },
]);

bot.dialog('route', [
    function(session, args) {
        welcome_subtitle = 'Choose Option';
        menuOptions = [{
            value: '1) Pick Route?',
            title: "Pick_Route"
        }, {
            value: '2) Live Help',
            title: "Live_Help"
        }];
        builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
            listStyle: builder.ListStyle.button
        });
    },
    function(session, results) {
        if (results.response.entity == '1) Pick Route?') {
            builder.Prompts.text(session, `Please enter your current location`);
        } else {
            session.send(`We are connecting you to our next agent. This may take a while, kindly hold...`);
        }
    },
    async (session, results, next) => {
        if (results.response) {
            var curr = await getCoordinates(`${results.response}`);
            session.userData.trip = {}
            session.userData.trip.start = curr[0]
            next()
        }
    },
    function(session, results) {
        builder.Prompts.text(session, `Please enter your destination`);
    },
    async (session, results, next) => {
        if (results.response) {
            var des = await getCoordinates(`${results.response}`);
            session.userData.trip.end = des[0]
            next()
        }
    },
    async (session) => {
        console.log(session.userData.trip)
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://platform.whereismytransport.com/api/journeys',
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                data: {
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [
                            [`${session.userData.trip.start.longitude}`, `${session.userData.trip.start.latitude}`],
                            [`${session.userData.trip.end.longitude}`, `${session.userData.trip.end.latitude}`]
                            // edited the above to .end.
                        ]
                    }
                }
            })

            const itineraries = response.data.itineraries
            let counter = 0

            if (itineraries.length > 0) {
                itineraries.forEach(itinerary => {
                    counter = counter + 1
                    let routes = ''
                    const legs = itinerary.legs
                    if (legs.length > 0) {
                        console.log(legs)
                        legs.forEach(leg => {
                            console.log(counter)
                            if (leg.type === 'Walking') {
                                leg.directions.forEach(walk => {
                                    routes = routes + `${walk.instruction}\n`
                                })
                            }
                            if (leg.type === 'Transit') {
                                routes = routes + `Take a bus to ${leg.vehicle.headsign}, @ ${leg.fare.cost.amount}(${leg.fare.cost.currencyCode}). Duration: ${leg.duration}.\n`
                                // date.format('hh:mm')
                            }
                        })
                    }
                    const result = `Option ${counter}:` + `\n${routes}`
                    session.send(result)
                })
            }
        } catch (error) {
            console.log(error.data)
        }
        session.beginDialog('visa')
    }

]);

bot.dialog('visa', [
  function(session){
    welcome_subtitle = 'Tap to pay your transport with Visa';
    menuOptions = [{
        value: 'visa_pay',
        title: "visa_pay"
    }];
    builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
        listStyle: builder.ListStyle.button
    });
    if (session.response == 'visa_pay'){

    }
    function createPaymentRequest() {
  if (!fare) {
    throw new Error('Fare amount is missing');
  }
  // PaymentMethodData[]
  var paymentMethods = [{
    supportedMethods: [payments.'visaleg'],
    data: {
      mode: process.env.PAYMENTS_LIVEMODE === 'true' ? null : 'TEST',
      merchantId: process.env.PAYMENTS_MERCHANT_ID,
      supportedNetworks: ['visa', 'mastercard'],
      supportedTypes: ['credit']
    }
  }];
},
  // function(session, results){
  //   response.result.entity == 'Visa Direct Pay'
  // },

]);
