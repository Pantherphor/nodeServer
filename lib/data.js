//file to stotring and editing data

//dependencies
var fs = require('fs');
var path = require('path');

//container for the modile to be expoted
var lib = {};

// base dir of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//write data to file
lib.create = function(dir, file, data, callback){
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(error, fileDescriptor){
        if(!error && fileDescriptor){
            // convert data to string
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, function(error){
                if(!error){
                    fs.close(fileDescriptor, function(error){
                     if(!error){
                        callback(false);
                     }else{
                         callback('Error closing new file');
                     }   
                    })
                }else{
                    callback('Error writing to new file');
                }
            })
        }else{
            callback('Could not create new file, it may already exist');
        }
    })
};


//read data from a file
lib.read = function(dir, file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data){
        callback(err,data);
    })
}

//update data inside a file
lib.update = function(dir, file, data, callback){
    //open the file for writing 
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
        if(!err && fileDescriptor){
            //convert data to string
            var stringData = JSON.stringify(data);

            // truncate the file
            fs.truncate(fileDescriptor, function(err){
                if(!err){
                    //write the file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error closing existing file');
                                }
                            });
                        }else{
                            callback('Error writing to existing file');
                        }
                    })
                }else{
                    callback('Error truncating file');
                }
            })
        }else{
            callback('Could not open the file for updating, it may not exist yet');
        }
    })
}

//Delete a file
lib.delete = function(dir, file, callback){
    //unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false);
        }else{
            callback('Error delete file');
        }
    })
}

//export the module
module.exports = lib;