let axios = require('axios');
var request = require('request');
var restify = require('restify');
var builder = require('botbuilder');
var datetime = require('node-datetime');
var NodeGeocoder = require('node-geocoder');
var request = require('request');
var VisaAPIClient = require('./visaapiclient.js');
var randomstring = require('randomstring');


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
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBBNDU1OTA5OTQwQjJGQTQ5OEJGNTgyMzhBNkU3N0Y0MTFGM0NEOTIiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJDa1ZaQ1pRTEw2U1l2MWdqaW01MzlCSHp6WkkifQ.eyJuYmYiOjE1MjQzMjAyNjgsImV4cCI6MTUyNDMyMzg2OCwiaXNzIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tIiwiYXVkIjoiaHR0cHM6Ly9pZGVudGl0eS53aGVyZWlzbXl0cmFuc3BvcnQuY29tL3Jlc291cmNlcyIsImNsaWVudF9pZCI6ImQ0MmM4NDA1LTQ3YjgtNGUyOS1hZTczLTkyNjRiMzgwMjMyNiIsImNsaWVudF90ZW5hbnQiOiJkOTBlMjNiZi1jOWM1LTQzMjEtODAyNS0xNDNhNGFhYzBhNjQiLCJqdGkiOiJhZWFmOTBhNzk2ZDBhODA0ZjQwM2U2OWQ1Y2M4YzBhYSIsInNjb3BlIjpbInRyYW5zcG9ydGFwaTphbGwiXX0.jVODNRrzY_j3pyss28jrNUQG1IA-C9CZD-oKswBSOiJQWaI7bL8x38zj9JJaloZ3npWWv0UZoADsjldJJl_4NnzmUpLln7mfJ3nK6DQ9GFE-9WH9L-thAI8NBO8Z4qXDIs7npMWUzqsW3vWzyUfHRgYY3DEoyArHwFV8xBY7VQ6J0_deO1soxeyEuZY_HWng3iVx5syHO7xwaAXgypG1ddWGuGvu-p4VLvAFDBSU-1vNgVSwGpQRF6IkoAaDYLrZpo6Q5Cx1o2e1DD1edCKn9LWK3l88zpTaCz5DQ9tJdoYKI6csUvn8u7Wedwf8bTHvKa8bQ_sbCj8nxaQNAgOs0w"

const getCoordinates = async (location) => {
    return await geocoder.geocode(location)
}

// getCoordinates('test')
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: "a7133575-aebf-4f9f-8950-851555110ef9",
  appPassword: "modEIB93?_$yedeGWYL364="
});

// Listen for messages from users
server.post('/api/messages', connector.listen());

var userStore = [];
var bot = new builder.UniversalBot(connector, async (session) => [
    // await login()
    session.beginDialog('greetings')
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
                        legs.forEach(leg => {
                            if (leg.type === 'Walking') {
                                leg.directions.forEach(walk => {
                                    routes = routes + `${walk.instruction}\n`
                                })
                            }
                            if (leg.type === 'Transit') {
                              // console.log(Object.keys(leg))
                                routes = routes + `Take a bus to ${leg.vehicle.headsign}, Duration: ${leg.duration}.\n`
                            }
                        })
                    }
                    console.log(routes)
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
    function(session, args) {
      welcome_subtitle = 'Tap to pay your transport with Visa';
      menuOptions = [{
          value: 'visa_pay',
          title: "visa_pay"
      }];
      builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
          listStyle: builder.ListStyle.button
      });
    },
    function(session, results) {
        if (results.response.entity == 'visa_pay') {
            builder.Prompts.text(session, `Enter account to send to`);
        }
    },
    async (session, results, next) => {
      if (results.response){
        session.userData.account_no = results.response;
        builder.Prompts.text(session, `Enter amount`);
        next()
      }
    },
    async (session, results, args, next) => {
       session.userData.amount = results.response;
       session.send(`Kindly confirm the account details, A/C NO:${session.userData.account_no}, Amount: ${session.userData.amount}`)
       welcome_subtitle = 'Proceed';
       menuOptions = [{
           value: 'yes',
           title: "yes"
       },{
         value:'no',
         titel:'no',
       }];
       builder.Prompts.choice(session, welcome_subtitle, menuOptions, {
           listStyle: builder.ListStyle.button
       });
       next()
    },
    function(session, results, args) {
      if (results.response.entity == 'yes'){
        var visaAPIClient = new VisaAPIClient();
        var strDate = new Date().toISOString().replace(/\..+/, '');
        var pushFundsRequest = JSON.stringify({
            "systemsTraceAuditNumber": 792155,
            "retrievalReferenceNumber": "330000550000",
            "localTransactionDateTime": strDate,
            "acquiringBin": 408972,
            "acquirerCountryCode": "840",
            "senderAccountNumber": session.userData.account_no,
            "senderCountryCode": "KEN",
            "transactionCurrencyCode": "KES",
            "senderName": "John Smith",
            "senderAddress": "44 Market St.",
            "senderCity": "San Francisco",
            "senderStateCode": "CA",
            "recipientName": "Adam Smith",
            "recipientPrimaryAccountNumber": "4761100090708271",
            "amount": "200.00",
            "businessApplicationId": "AA",
            "transactionIdentifier": 381228649430011,
            "merchantCategoryCode": 6012,
            "sourceOfFundsCode": "03",
            "cardAcceptor": {
              "name": "Acceptor 2",
              "terminalId": "13655392",
              "idCode": "VMT200911026070",
              "address": {
                "country": "KEN",
              }
            },
            "feeProgramIndicator": "123"
          });

        var baseUri = 'visadirect/';
        var resourcePath = 'fundstransfer/v1/pushfundstransactions';
        visaAPIClient.doMutualAuthRequest(baseUri + resourcePath, pushFundsRequest, 'POST', {},
        function(err, responseBody) {
         let response = ''
          if(!err) {
            response = `${JSON.parse(responseBody).transactionIdentifier}, transaction successfull`;
            session.send(response)
          } else {
            console.log(err);
          }
        });
      }
    }
]);
