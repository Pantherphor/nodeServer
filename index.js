
// this is the primary file for the API

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

//TESTING
//@TODO: detete this later
_data.delete('test', 'newFile', function(err){
  console.log('this was the error', err);
})

// instanciate http server
var httpServer = http.createServer(function(req, res)
{
  unifiedServer(req, res);
});

//start the server and have it listen on port 3000
httpServer.listen(config.httpPort, function(){
  console.log("The server is listerning on port:"+config.httpPort+ " in "+config.envName+ " environment.");
});

//instatiate the https server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res){
  unifiedServer(req, res);
});

//start the https server
httpsServer.listen(config.httpsPort, function(){
  console.log("The server is listerning on port:"+config.httpsPort+ " in "+config.envName+ " environment.");
});

//all the server logic for both http and https server
var unifiedServer = function(req, res){

  //get the  url and parse it
  var parseUrl = url.parse(req.url, true);

  //get path
  var path = parseUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'')

  // get http method
  var method = req.method.toLowerCase();

  //get queryString
  var queryString = parseUrl.query;

  //get headers
  var headers = req.headers;

  //get payload if exist
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();
    //choose handler the request should go
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to sent to he handler
    var data = {
      'trimmedPath' : trimmedPath,
      'queryString' : queryString,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    // route the request to handler specified
    chosenHandler(data, function(statusCode, payload) {
      // use the status code called back by the handler , or default
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //use the payload called back by the handler, or default to an enmpy object
      payload = typeof(payload) == 'object' ? payload : {};

      //convert the payload to a string
      var payloadString = JSON.stringify(payload);

      //return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

     //log the request path
     console.log('Request received on path: '+trimmedPath+ ' with this method '+method+' and queryStrings: ',queryString);
     console.log('Request received with these headers', headers);
     console.log('this is the payload: '+buffer);
     console.log('this is the request Response: ',statusCode, payloadString);
   });
});
};

// define a request router
var router = {
  'ping' : handlers.ping,
  'users' : handlers.users
};
