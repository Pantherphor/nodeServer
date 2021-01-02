//dependancies

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

// ping handler
handlers.ping = function(data, callback){
 callback(200);
}

// not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

module.exports = handlers;