// this creates nad exports the configuration variables

const { type } = require("os");
const { env } = require("process");

//container for all the environments
var environments = {};

//staging default
environments.staging={
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecrit' : 'thisIsASecrit'

};

//production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecrit' : 'thisIsAlsoASecrit'
};

//determine whick env was passes as a commmant-line 
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check tahat the current enviroment is one of the environments above, if not, default to stating
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export the module
module.exports = environmentToExport;