// Import the dependend modules
const express = require('express');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

// Construct a express / socket.io server
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Global constants
const FUSE_PROCESS = './fusexmp';
const MOUNTED_DATA = './mounted'

// Global variables
var now_mounting = [];

/***********************************************************************/
/* Helper functions                                                    */
/***********************************************************************/

// Read data from the fs file and get the mount history
// Which is in a JSON string format
const initMountingList = () => {
  if(fs.readdirSync('./').indexOf(MOUNTED_DATA.slice(2,MOUNTED_DATA.length)) === -1)
    fs.writeFileSync(MOUNTED_DATA,'[]');
  var mount_string = fs.readFileSync(MOUNTED_DATA);
  now_mounting = JSON.parse(mount_string);
}

// Get a array of dir names under the path
const getDirectories = (srcpath) => {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.lstatSync(path.join(srcpath, file)).isDirectory();
  });
}

// Find the index of the first object which has path:_path
const indexOfPath = (array, _path) => {
  for(var i=0; i<array.length; i++){
    if(array[i]!== undefined && array[i].path === _path)
      return i;
  }

  return -1;
}

/***********************************************************************/
/* Express server events                                               */
/***********************************************************************/

// Called when asking the sub-directories under a path
app.get('/path/*', (req,res) => {
	console.log(`Client browsing under path: ${req.path}`);
  // slice the /path/ string, get directories under the path
	var toReturn = JSON.stringify(getDirectories(decodeURIComponent(req.path.slice(6,req.path.length))));

  // This is set to allow a access origin response
	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.send(toReturn);
});

// Called when asking if a path is mountable
// which means it's empty
app.get('/valid/*', (req,res) => {
  //slice the /valid/ string, get all items under the path
  var result = fs.readdirSync(decodeURIComponent(req.path.slice(7,req.path.length)));

  // This is set to allow a access origin response
	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  // If the path is empty, send valid message
  res.send((result.length===0)?true:false);
});

// Never used, try to build the web code for this but failed
// TODO: Merge the web server and file system server (this)
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname,'/build/index.html'));
});

// Call the function to read the init state last time saved before server shut down
initMountingList();

var expressPort = (process.env.PORT || 13428);
server.listen(expressPort, function () {
	console.log(`Device listening on http://localhost:${expressPort}`);
});

/***********************************************************************/
/* Socket.io events                                                    */
/***********************************************************************/

io.on('connection', (socket) => {
  // Initializing the app by sending the mounted list
  socket.emit('init', { mounted_list: now_mounting });

  // Called when client asking to create a path
  // After creating, send message to all client to renew the browsing list
  socket.on('create', (data) => {
    var _path = data['path'];
    console.log(`Creating Path : ${_path}`);

    // Create the path
    fs.mkdirSync(decodeURIComponent(_path));

    socket.emit('create',{created_path: _path});
  });

  // Called when client asking to mount the path
  // After mounting, send message to all client to renew the mounted list
  socket.on('mount', (data) => {
    var req_path = decodeURIComponent(data['path']);

    // Cut the last '/'
    var mount_point = (req_path[req_path.length-1] === '/')? req_path.slice(0, req_path.length-1) : req_path;
    console.log(`Got Mount command, mounting: ${mount_point}`);
    
    // Generate the mirror path, where the data really stored
    var mount_loc_path = mount_point.slice(0,mount_point.lastIndexOf('/')+1);
    var mount_folder_name = mount_point.slice(mount_point.lastIndexOf('/')+1,mount_point.length);
    var mir_folder_name = '.' + mount_folder_name;

    var mount_mir = mount_loc_path + mir_folder_name;
    console.log(`Mounting Mirror: ${mount_mir}`);

    // If the storage path doesn't exists, create it
    if(fs.readdirSync(mount_loc_path).indexOf(mir_folder_name) === -1){
      console.log('Mirror not exists, creating...');
      fs.mkdirSync(mount_mir);
    }

    // Call the filesystem to mount
    child_process.execFileSync(FUSE_PROCESS,[mount_mir, mount_point]);

    // Create a mounted history object
    var to_add = { path: mount_point, mounted: true };

    // Search if mounted before, if so, edit it, else add it to the list
    var to_search_index = indexOfPath(now_mounting, mount_point);
    if(to_search_index === -1){
      now_mounting.push(to_add);
    }else{
      now_mounting[to_search_index] = to_add;
    }

    // Update the list stored in the fs
    fs.writeFileSync(MOUNTED_DATA,JSON.stringify(now_mounting));

    socket.emit('mount',{server_mounted_list: now_mounting});
  });

  // Called when client asking to unmount the path
  // After unmounting, send message to all client to renew the mounted list
  socket.on('unmount', (data) => {
    var req_path = decodeURIComponent(data['path']);

    // Cut the last '/'
    var mount_point = (req_path[req_path.length-1] === '/')? req_path.slice(0, req_path.length-1) : req_path;
    console.log(`Got Unmount command, unmounting: ${mount_point}`);
    
    // Execute the unmount command
    child_process.spawnSync('fusermount',['-u',mount_point]);

    // Edit the mounted history
    var to_add = { path: mount_point, mounted: false };
    var to_search_index = indexOfPath(now_mounting, mount_point);

    if(to_search_index === -1){
      now_mounting.push(to_add);
    }else{
      now_mounting[to_search_index] = to_add;
    }

    // Update the history file
    fs.writeFileSync(MOUNTED_DATA,JSON.stringify(now_mounting));

    socket.emit('mount',{server_mounted_list: now_mounting});
  });

});