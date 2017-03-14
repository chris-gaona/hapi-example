'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
const Path = require('path');

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

server.register(require('vision'), () => {
   server.views({
       engines: {
           hbs: require('handlebars')
       },
       relativeTo: __dirname,
       layout: true,
       path: 'views'
   });

   server.route({
       method: 'GET',
       path: '/{name?}',
       handler: function (request, reply) {
           reply.view('home', {
               name: request.params.name || 'World'
           });
       }
   })
});

// serve static files
server.register(require('inert'), () => {
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: Path.join(__dirname, 'public')
            }
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }

        console.log(`Started at: ${server.info.uri}`)
    });
});

// server.register({
//     register: [require('inert'), require('good')],
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