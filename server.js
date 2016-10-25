const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const getDirectories = (srcpath) => {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
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

app.post('/mount/*', (req,res) => {
  var req_path = decodeURIComponent(req.path.slice(7, req.path.length));
  var mount_point = (req_path[req_path.length-1] === '/')? req_path.slice(0, req_path.length-1) : req_path;
  //fs.readdirSync(decodeURIComponent(req.path.slice(7,req.path.length)));
  var mount_mir = mount_point.slice(0,mount_point.lastIndexOf('/')+1)+'.'+mount_point.slice(mount_point.lastIndexOf('/')+1,mount_point.length);
  console.log(mount_mir);

  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.get('*', (req, res) => {
	//res.send('AAAA');
	res.sendFile(path.join(__dirname,'/build/index.html'));
});

var expressPort = (process.env.PORT || 13428);
app.listen(expressPort, function () {
	console.log(`Device listening on http://localhost:${expressPort}`);
});