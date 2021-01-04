//helpers for various tasks

// dependecies
const { strict } = require('assert');
var crypto = require('crypto');
var config = require('./config');

//container for all the helpers
var helpers = {};

//create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecrit)
        .update(str)
        .digest('hex');
        return hash;
    }else{
        return false;
    }

};

//parse json object to an object  in all cases, without throwing
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return{};
    }
};

//create a string of a random alphanumeric charectors, of a given lenght
helpers.createRandomString = function(strLenght){
    strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
    if(strLenght){
        //define all the characters that could go into a string
        var possibleCharacters = 'abcdefghijkmnopqrsotuvwxyz0123456789';
        
        //start the final string
        var str = '';
        
        for(i = 1; i <= strLenght; i++){
            //get a random character from the possibleCharaters string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            //appand this charater to the final string
            str+= randomCharacter;
        }
        //return the string
        return str;
    }else{
        return false;
    }
};


//export the module
module.exports = helpers;