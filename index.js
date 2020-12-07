
// this is the primary file for the API

//Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// server shoul respond to all requests with a string
var server = http.createServer(function(req, res)
{
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
      'payload' : buffer
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
});

//start the server and have it listen on port 3000
server.listen(3000, function(){
  console.log("The server is listerning on port:3000");
});

// define the hanlders
var handlers = {};

//sample handler
handlers.sample = function(data, callback){
  //callback a http status code and a payload object
  callback(406, {'name' : 'sample handler'});
};

// not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

// define a request router
var router = {
  'sample' : handlers.sample
};
