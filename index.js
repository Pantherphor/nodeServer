
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

    //now send the response
    res.end('Hello world\n');

    //log the request path
    console.log('Request received on path: '+trimmedPath+ ' with this method '+method+' and queryStrings: ',queryString);
    console.log('Request received with these headers', headers);
    console.log('this is the payload: '+buffer);
  });
});

//start the server and have it listen on port 3000
server.listen(3000, function(){
  console.log("The server is listerning on port:3000");
});
