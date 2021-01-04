//dependancies

const { CallTracker } = require('assert');
const { truncate } = require('fs');
const { type } = require('os');
var _data = require('./data');
var helpers = require('./helpers');

// define the hanlders
var handlers = {};

//users handler
handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

//countainer for the users submethods
handlers._users = {};

//users -post
handlers._users.post = function(data, callback){
   
    //check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement){
        //make sure user does not already exist
        _data.read('user', phone, function(err, data){
            if(err){
                //hash password
                var hashedPassword = helpers.hash(password);
                
                //create the user object
                if(hashedPassword){
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };
    
                    //store user
                    _data.create('users', phone, userObject, function(err){
                        if(!err){
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the new user'});
                        }
                    });
                }else{
                    callback(500, {'Error': 'Could not hash the user\'s password'});
                };
               
            }else{
                //user alredy exists
                callback(400, {'Error' : 'User with this phne number already exist'});
            }
        }); 
    }else{
        callback(400, {'Error' : 'Missing required field(s)'})
    }
};

//users -get
//@TODO: only let an authenticated user access their object and this use should not be able to access anyone elses data
handlers._users.get = function(data, callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
    if(phone){
        //Lookup the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
                //remove hashedPassword
                delete data.hashedPassword;
                callback(200, data);
            }else{
                callback(404);
            }
        })
    }else{
        callback(400, {'Error': 'Missing requered field'});
    }
};

//users -put
//required data: phone
//@TODO: only authenticated users PUT data to only there own acconts
handlers._users.put = function(data, callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    //check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   
    //error if phone is invalid
    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
           //lookup user
           _data.read('users', phone, function(err, userData){
               if(!err && userData){
                // update the fields necessary
                if(firstName){
                    userData.firstName = firstName;
                }
                if(lastName){
                    userData.lastName = lastName;
                }
                if(password){
                    userData.hashedPassword = helpers.hash(password);
                }

                //store the new updates
                _data.update('users', phone, userData, function(err){
                    if(!err){
                        callback(200)
                    }else{
                        console.log(err);
                        callback(500, {'Error' : 'Could not update the user'});
                    }
                })
               }else{
                callback(400, {'Error' : 'The specified user does not exist'});
               }
           }) 
        }else{
            callback(400, {'Error' : 'Missing fields to update'});
        }
    }else{
         callback(400, {'Error': 'Missing required field'});
    }
};

//users -delete
//@TODO: Cleanup any other data files associated with this user
handlers._users.delete = function(data, callback){
    //Check that the phone number is valid
    var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
    if(phone){
        //Lookup the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
                _data.delete('users', phone, function(err){
                    if(!err){
                        callback(200);
                    }else{
                        callback(500, {'Error': 'Could not delete the specified user'});
                    }
                });
            }else{
                callback(400, {'Error' : 'Could not fine the specified user'});
            }
        })
    }else{
        callback(400, {'Error': 'Missing requered field'});
    }
};

//Tokens handlers
handlers.tokens = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
};

//Container for the tokens methods
handlers._tokens = {};

//Tokens - Post
// required data: phone, password 
handlers._tokens.post = function(data, callback){
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   
    if(phone && password){
        //lookup the user who matches that phone number
        _data.read('users', phone, function(err, userData){
            if(!err && userData){
                //hash the sent pass and compare it to the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    //if valid, create a new token with a random name. set epiration date to 1 hour into the future
                     var tokenId = helpers.createRandomString(20);

                     var expires = Date.now() + 1000 * 60 * 60;
                     var tokenObject = {
                        'phone' : phone,
                        'id': tokenId,
                        'expires' : expires
                     };

                     //store the token
                     _data.create('tokens', tokenId, tokenObject, function(err){
                        if(!err){
                            callback(200, tokenObject);
                        }else{
                            callback(500, {'Error' : 'Could not create a new token'});
                        }
                     });
                }else{
                    callback(400, {'Error':'Password did not match the specified user\s stored password'});
                }
            }else{
                callback(400, {'Error': 'Could not find the specified user'});
            }
        })

    }else{
        callback(400, {'Error' : 'Missing required fields(s)'})
    }
};

//Tokens - Get
//required data: ID
handlers._tokens.get = function(data, callback){
    //Check that the id number is valid
    var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
    if(id){
        //Lookup the user
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                callback(200, tokenData);
            }else{
                callback(404);
            }
        })
    }else{
        callback(400, {'Error': 'Missing requered field'});
    }
};

//Tokens - Put
//required data: Id, extend
//Optional data: none
handlers._tokens.put = function(data, callback){
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        //lookup the token
        _data.read('tokens', id, function(err, tokenData){
            if(!err && tokenData){
                // check to the make sure the token is not already expired
                if(tokenData.expires > Date.now()){
                    //set the expiration and hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    
                    // store the new updates
                    _data.update('tokens', id, tokenData, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            callback(400, {'Error': 'Could not update the token\'s exparation'});
                        }
                    });
                }else{
                    callback(400, {'Error':'The token has already expired and cannot be extended'});
                }
            }else{
                callback(400, {'Error':'Specified token not exist'});
            }
        });
    }else{
        callback(400, {'Error':'Missing required filed(s) or field(s) are invalid'});
    }
};

//Tokens - Delete
//required data: id
handlers._tokens.delete = function(data, callback){
 //Check that the id number is valid
 var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
 if(id){
     //Lookup the token
     _data.read('tokens', id, function(err, data){
         if(!err && data){
             _data.delete('tokens', id, function(err){
                 if(!err){
                     callback(200);
                 }else{
                     callback(500, {'Error': 'Could not delete the specified token'});
                 }
             });
         }else{
             callback(400, {'Error' : 'Could not fine the specified token'});
         }
     })
 }else{
     callback(400, {'Error': 'Missing requered field'});
 }
};


// ping handler
handlers.ping = function(data, callback){
 callback(200);
}

// not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

module.exports = handlers;