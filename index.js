// const unirest = require('unirest');
//
// const API_KEY = 'eb947e1303e5a7637621d56264a04cab';

const Twitter = require('twitter');
const mongoose = require('mongoose');
const stdio = require('stdio');

const params = stdio.getopt({
    'consumer_key': {args: 1, description: 'User name'},
    'consumer_secret': {args: 1, description: 'User surname'},
    'access_token_key': {args: 1, description: 'User age'},
    'access_token_secret': {args: 1, description: 'If he is redhead'}
});

mongoose.connect('mongodb://localhost/emailing', function(err) {
    if (err) { throw err; }
});

const userSchema = new mongoose.Schema({
    lang : { type : String },
    name : { type : String },
    screen_name : { type : String },
    description : { type : String },
    url : { type : String },
    email : { type : String, index: true, unique: true },
    tags: { type: Array },
    date : { type : Date, default : Date.now }
});

mongoose.model('users', userSchema);

const userModel = mongoose.model('users');

const emailRegex = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

const client = new Twitter({
    consumer_key: params.consumer_key,
    consumer_secret: params.consumer_secret,
    access_token_key: params.access_token_key,
    access_token_secret: params.access_token_secret
});

const fields = [
    'name',
    'screen_name',
    'description',
    'url',
    'email'
];

var users = 0;

userModel.count({}, function(err, count){
    users = count;
});

const locales = [
    'en',
    'fr'
];

const keywords = [
    'forex',
    'trading',
    'trader',
    'CFD'
];

const scanner = function() {
    client.stream('statuses/filter', {track: keywords.join()},  function(stream) {
        stream.on('data', function(tweet) {
            if(locales.indexOf(tweet.user.lang) > -1) {
                let email = null;

                if(tweet.user.description !== null) {
                    var matched = tweet.user.description.match(emailRegex);

                    if(matched !== null) {
                        email = matched[0];
                    }
                }

                let user = {
                    lang: tweet.user.lang,
                    name: tweet.user.name,
                    screen_name: tweet.user.screen_name,
                    description: tweet.user.description,
                    url: tweet.user.url,
                    email: email,
                    tags: keywords
                };

                if(user.email !== null) {
                    let userInstance = new userModel(user);

                    userModel.findOne({
                        email: user.email
                    }, function(err, result) {
                        if(result === null) {
                            users++;
                            userInstance.save(function(err) {
                                if(err) { console.log(err.message); }
                            });
                        }
                    });
                }

                console.log(users + " mails =====> " + JSON.stringify(user));
            }
        });

        stream.on('error', function(error) {
            console.log(error);
        });
    });
};

scanner();

// var smtp = require('smtp-protocol');
//
// var server = smtp.createServer(function (req) { });
//
// server.listen(9025);
//
// var lists = [
//     {
//         first_name: 'Mathieu',
//         last_name: 'Darnis'
//     }
// ];
//
// var patterns = [
//     // firstname
//     function(first_name, last_name) { return first_name.toLowerCase(); },
//     // lastname
//     function(first_name, last_name) { return last_name.toLowerCase(); },
//     // firstnamelastname
//     function(first_name, last_name) { return first_name.toLowerCase() + '' + last_name.toLowerCase(); },
//     // firstname.lastname
//     function(first_name, last_name) { return first_name.toLowerCase() + '.' + last_name.toLowerCase(); },
//     // f.lastname
//     function(first_name, last_name) { return first_name.toLowerCase().substr(0, 1) + '.' + last_name.toLowerCase(); },
//     // flastname
//     function(first_name, last_name) { return first_name.toLowerCase().substr(0, 1) + '' + last_name.toLowerCase(); },
//     // firstname.l
//     function(first_name, last_name) { return first_name.toLowerCase() + '.' + last_name.toLowerCase().substr(0, 1); },
//     // firstnamel
//     function(first_name, last_name) { return first_name.toLowerCase() + '' + last_name.toLowerCase().substr(0, 1); },
//     // fl
//     function(first_name, last_name) { return first_name.toLowerCase().substr(0, 1) + '' + last_name.toLowerCase().substr(0, 1); },
//     // f.l
//     function(first_name, last_name) { return first_name.toLowerCase().substr(0, 1) + '.' + last_name.toLowerCase().substr(0, 1); },
//     // l-f
//     function(first_name, last_name) { return last_name.toLowerCase().substr(0, 1) + '-' + first_name.toLowerCase().substr(0, 1); },
//     // f-l
//     function(first_name, last_name) { return first_name.toLowerCase().substr(0, 1) + '-' + last_name.toLowerCase().substr(0, 1); },
//     // lastnamefirstname
//     function(first_name, last_name) { return last_name.toLowerCase() + '' + first_name.toLowerCase(); },
//     // lastname.firstname
//     function(first_name, last_name) { return last_name.toLowerCase() + '.' + first_name.toLowerCase(); },
//     // lastname.f
//     function(first_name, last_name) { return last_name.toLowerCase() + '.' + first_name.toLowerCase().substr(0, 1); },
//     // lastnamef
//     function(first_name, last_name) { return last_name.toLowerCase() + '' + first_name.toLowerCase().substr(0, 1); },
//     // lastname-firstname
//     function(first_name, last_name) { return first_name.toLowerCase() + '-' + last_name.toLowerCase(); },
//     // lastname-f
//     function(first_name, last_name) { return last_name.toLowerCase() + '.' + first_name.toLowerCase().substr(0, 1); }
// ];
//
// var smtpLists = [
//     {
//     //     smtp: 'smtp.free.fr',
//         domain: 'free.fr',
//     //     port: 25
//     },
//     // {
//     //     smtp: 'smtp.laposte.net',
//     //     domain: 'laposte.net',
//     //     port: 25
//     // },
//     // {
//     //     smtp: 'smtp.live.com',
//     //     domain: 'live.com',
//     //     port: 465
//     // },
//     {
//     //     smtp: 'smtp.gmail.com',
//         domain: 'gmail.com',
//     //     port: 465
//     }
// ];
//
// var emailAssembly = function(username, domain) {
//     return username + '@' + domain;
// };
//
// lists.forEach(function(list) {
//     smtpLists.forEach(function(smtpItem) {
//         patterns.forEach(function(func) {
//             let email = emailAssembly(func(list.first_name, list.last_name), smtpItem.domain);
//
//             unirest.get("http://apilayer.net/api/check?access_key=" + API_KEY + "&email=" + encodeURIComponent(email) + "&smtp=1&format=1")
//                 .header("Accept", "application/json")
//                 .end(function (result) {
//                     console.log(result.body);
//
//                     // console.log(result.body.isValid);
//                 });
//         });
//
//         // smtp.connect(smtpItem.smtp, smtpItem.port, function(client) {
//         //     patterns.forEach(function(func) {
//         //         client.verify(emailAssembly(func(list.first_name, list.last_name), smtpItem.domain), function(err, code, lines) {
//         //             console.log(err, code, lines);
//         //         });
//         //     })
//         // });
//     });
// });
//
//
//
// // smtp.connect('localhost', 9025, function(client) {
// //     client.login('nicolasmsav', 'nickleus', 'PLAIN', function(err, code, lines) {
// //         console.log(err, code, lines);
// //     });
// // });