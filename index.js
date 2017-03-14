'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const Path = require('path');
const Joi = require('joi');

const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

function handler(request, reply) {
    // hapi automatically makes assumptions about the content-type header based on what I put in the reply
    // examples below:
    // reply('hello hapi');
    // reply({hello: 'hapi'});
    // reply(require('fs').createReadStream(__filename));
    // reply(new Error('oops'));
    // reply(Boom.notFound());

    // can modify the response header
    // resp object is chainable
    reply('hello world')
        .code(418)
        .type('text-plain')
        .header('hello', 'world')
        // set cookie header
        .state('hello', 'world');
}

let goodOptions = {
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            // can set log: ['error'] to only show error tagged log events
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout']
    }
};

// // lifecycle extension events are registered in the following way:
// // first argument is event name
// // second arguments is the function to be executed for the event
// server.ext('onRequest', (request, reply) => {
//     // passes on to the route handler
//     reply.continue();
// });
//
// server.ext('onRequest', (request, reply) => {
//     request.setUrl('/')
//     request.setMethod('GET')
//     reply.continue()
// })
//
// server.ext('onRequest', (request, reply) => {
//     console.log('onRequest')
//     reply.continue()
// })
//
// server.ext('onPreAuth', (request, reply) => {
//     console.log('onPreAuth')
//     reply.continue()
// })
//
// server.ext('onPostAuth', (request, reply) => {
//     console.log('onPostAuth')
//     reply.continue()
// })
//
// server.ext('onPreHandler', (request, reply) => {
//     console.log('onPreHandler')
//     reply.continue()
// })
//
// server.ext('onPostHandler', (request, reply) => {
//     console.log('onPostHandler')
//     reply.continue()
// })
//
// server.ext('onPreResponse', (request, reply) => {
//     console.log('onPreResponse')
//     reply.continue()
// })

// server.route({
//     method: ['POST', 'PUT'],
//     path: '/',
//     config: {
//       payload: {
//           output: 'data',
//           // hapi automatically parses data; defaults to true
//           parse: true,
//           // only allow the following
//           allow: 'application/json'
//       }
//     },
//     handler: function (request, reply) {
//        reply(request.payload);
//     }
// });
//
// server.start((err) => {
//     if (err) {
//         throw err;
//     }
//
//     console.log(`Started at: ${server.info.uri}`)
// });

// creates view engine with vision (handlebars)
server.register(require('vision'), () => {
   server.views({
       engines: {
           hbs: require('handlebars')
       },
       relativeTo: __dirname,
       layout: true,
       path: 'views'
   });

   // this extension will watch for any errors
   server.ext('onPreResponse', (request, reply) => {
       let resp = request.response;
       // if response is error of any kind Hapi will convert to Boom object with isBoom as true
       if (!resp.isBoom) return reply.continue();

       // gives template access to error code and error message
       reply.view('error', resp.output.payload)
           .code(resp.output.statusCode);
   });

   server.route({
       method: 'GET',
       path: '/{name?}',
       // uses Joi module for validation
       validate: {
           // expects params to be an object
           params: Joi.object({
               // expects id to be a number
               id: Joi.number()
           }),
           // expects payload to be an object
           // add unknown function to not cause errors if another key/value is on payload that is not specified here
           payload: Joi.object({
               id: Joi.number(),
               email: Joi.string()
           }).unknown(),
           // add validation to query
           query: Joi.object({
               id: Joi.number()
           })
       },
       handler: function (request, reply) {
           reply(Boom.badRequest());
           // reply.view('home', {
           //     name: request.params.name || 'World'
           // });
       }
   });

    server.start((err) => {
        if (err) {
            throw err;
        }

        console.log(`Started at: ${server.info.uri}`)
    });
});

// // serve static files
// server.register(require('inert'), () => {
//     server.route({
//         method: 'GET',
//         path: '/{param*}',
//         handler: {
//             directory: {
//                 path: Path.join(__dirname, 'public')
//             }
//         }
//     });
//
//     server.start((err) => {
//         if (err) {
//             throw err;
//         }
//
//         console.log(`Started at: ${server.info.uri}`)
//     });
// });

// // uses good module to add console reporting
// server.register({
//     register: require('good'),
//     options: goodOptions
// }, err => {
//     if (err) {
//         return console.error(err);
//     }
//
//     // use a ? (ie /{userId?}) to make the parameter optional
//     // use a wildcard * (ie /{userId*} to make the paramater match anything. userId will contain the entire wildcard url
//     server.route({
//         method: 'GET',
//         path: '/users/{userId?}',
//         handler: handler
//     });
//
//     server.start((err) => {
//         if (err) {
//             throw err;
//         }
//
//         console.log(`Started at: ${server.info.uri}`)
//     });
// });