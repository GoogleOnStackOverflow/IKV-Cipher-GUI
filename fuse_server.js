const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const child_process = require('child_process');
var server = require('http').Server(app);
var io = require('socket.io')(server);

const FUSE_PROCESS = './fusexmp';
const MOUNTED_DATA = './mounted'

var now_mounting = [];

const initMountingList = () => {
  if(fs.readdirSync('./').indexOf(MOUNTED_DATA.slice(2,MOUNTED_DATA.length)) === -1)
    fs.writeFileSync(MOUNTED_DATA,'[]');
  var mount_string = fs.readFileSync(MOUNTED_DATA);
  now_mounting = JSON.parse(mount_string);
}

const getDirectories = (srcpath) => {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.lstatSync(path.join(srcpath, file)).isDirectory();
  });
}

const indexOfPath = (array, _path) => {
  for(var i=0; i<array.length; i++){
    if(array[i]!== undefined && array[i].path === _path)
      return i;
  }

  return -1;
}

app.get('/path/*', (req,res) => {
	console.log(req.path);
	var toReturn = JSON.stringify(getDirectories(decodeURIComponent(req.path.slice(6,req.path.length))));
	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.send(toReturn);
});

app.get('/valid/*', (req,res) => {
  var result = fs.readdirSync(decodeURIComponent(req.path.slice(7,req.path.length)))
	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.send((result.length===0)?true:false);
});

app.post('/path/*', (req,res) => {
	console.log(req.path);
  try{
	 fs.mkdirSync(decodeURIComponent(req.path.slice(5,req.path.length)));
  }catch(e){
    console.error(e);
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.status(500);
    res.send(e);
  }

	res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.sendStatus(200);
});

app.get('*', (req, res) => {
	//res.send('AAAA');
	res.sendFile(path.join(__dirname,'/build/index.html'));
});

initMountingList();

var expressPort = (process.env.PORT || 13428);
server.listen(expressPort, function () {
	console.log(`Device listening on http://localhost:${expressPort}`);
});

io.on('connection', (socket) => {
  socket.emit('init', { mounted_list: now_mounting });
  socket.on('create', (data) => {
    var _path = data['path'];
    console.log(`Creating Path : ${_path}`);
    fs.mkdirSync(decodeURIComponent(_path));

    socket.emit('create',{created_path: _path});
  });

  socket.on('mount', (data) => {
    var req_path = decodeURIComponent(data['path']);
    var mount_point = (req_path[req_path.length-1] === '/')? req_path.slice(0, req_path.length-1) : req_path;
    console.log(`Got Mount command, mounting: ${mount_point}`);
    
    var mount_loc_path = mount_point.slice(0,mount_point.lastIndexOf('/')+1);
    var mount_folder_name = mount_point.slice(mount_point.lastIndexOf('/')+1,mount_point.length);
    var mir_folder_name = '.' + mount_folder_name;

    var mount_mir = mount_loc_path + mir_folder_name;
    console.log(`Mounting Mirro: ${mount_mir}`);

    if(fs.readdirSync(mount_loc_path).indexOf(mir_folder_name) === -1){
      console.log('Mirror not exists, creating...');
      fs.mkdirSync(mount_mir);
    }

    child_process.execFileSync(FUSE_PROCESS,[mount_mir, mount_point]);
    var to_add = { path: mount_point, mounted: true };
    var to_search_index = indexOfPath(now_mounting, mount_point);
    if(to_search_index === -1){
      now_mounting.push(to_add);
    }else{
      now_mounting[to_search_index] = to_add;
    }
    fs.writeFileSync(MOUNTED_DATA,JSON.stringify(now_mounting));

    socket.emit('mount',{server_mounted_list: now_mounting});
  });

  socket.on('unmount', (data) => {
    var req_path = decodeURIComponent(data['path']);
    var mount_point = (req_path[req_path.length-1] === '/')? req_path.slice(0, req_path.length-1) : req_path;
    console.log(`Got Unmount command, unmounting: ${mount_point}`);
    
    child_process.spawnSync('fusermount',['-u',mount_point]);
    var to_add = { path: mount_point, mounted: false };
    var to_search_index = indexOfPath(now_mounting, mount_point);

    if(to_search_index === -1){
      now_mounting.push(to_add);
    }else{
      now_mounting[to_search_index] = to_add;
    }
    fs.writeFileSync(MOUNTED_DATA,JSON.stringify(now_mounting));

    socket.emit('mount',{server_mounted_list: now_mounting});
  });

});