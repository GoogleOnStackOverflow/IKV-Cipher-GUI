// Import components from 3rd party modules
import React, { Component } from 'react';
import request from 'superagent';
import { Button } from 'react-bootstrap';
import io from 'socket.io-client';

// Import components
import { CreateModel , MountModel } from './CheckModel';
import PathForm from './PathForm';
import PathBtnGroup from './PathBtnGroup';
import MountList from './MountList';

// Import global constants
import { HOST_NAME , SERVER_PORT } from '../constants';

// Create socket io client
let socket = io(`http://${HOST_NAME}:${SERVER_PORT}`);

// Core part of the mounting
class Mounter extends Component {

  // Init states
  constructor() {
  	super();
    this.state = {
      	now_browsing: '/', 
      	now_list:[],
      	creatable: false,
      	mountable: false,
      	show_mount: false,
      	show_create: false,
        valid: true,
      	mounted_list:[]
    };

    // Get the init data from server
    this.handleClear();
  }

  componentDidMount() {
    // Called when connection established
    socket.on('init', this._initialize.bind(this));

    // Called when server created a new folder
    socket.on('create', this._handleCreated.bind(this));

    // Called when server mounted a path
    socket.on('mount', this._handleMounted.bind(this));
  }

  // Socket.io emit event listeners
  _initialize(data) {
    var {mounted_list} = data;
    this.setState({mounted_list});
  }

  _handleCreated(data) {
    this.handleNowBrChange(this.state.now_browsing);
  }

  _handleMounted(data) {
  	var {server_mounted_list} = data;
    console.log(`Got emit mounted: ${server_mounted_list}`);
  	this.setState({mounted_list: server_mounted_list});
  }

  // Called when the text in the form for path changed
  handleNowBrChange(str) {
    // Change the UI text and store the text in the status
    this.setState({now_browsing: str});

    // slice the path and the filter 
    var to_browse = str.slice(0,str.lastIndexOf('/')+1);
    var filter_w = str.slice(str.lastIndexOf('/')+1, str.length);

    // Renew and check if the path is mountable
    this.handleMountable(to_browse);

    // Send request to the server to check if the path valid, 
    // if the filter name can be created as a new folder, and dir list under the path
    request
      .get(`http://${HOST_NAME}:${SERVER_PORT}/path/${to_browse}`)
      .set('Accept', 'application/json')
      .end(function(err, res){
        if(res){
          var list = JSON.parse(res.text);
          var temp = [];
          for(var i=0 ; i<list.length; i++){
            if(list[i].indexOf(filter_w) === 0)
              temp.push(list[i]);
          }
          if(filter_w!=='' && temp.indexOf(filter_w) === -1){
            return this.setState({
              now_list: temp,
              valid: true,
              creatable: true
            });
          }else{
            return this.setState({
              now_list: temp,
              valid: true,
              creatable: false
            });
          }

        }else{
          return this.setState({
            now_list:[],
            valid: false,
            creatable: false
          });
        }
      }.bind(this));
  }

  // Check if the path mountable
  handleMountable(_path){
    return request
      .get(`http://${HOST_NAME}:${SERVER_PORT}/valid/${_path}`)
      .set('Accept', 'application/json')
      .end(function(err, res){
        if(res.text === 'true'){
          return this.setState({mountable: true});
        }else{
          return this.setState({mountable: false});
        }
      }.bind(this));
  }

  // handle function for the form UI
  hadleFormOnChange(e){
    var str = e.target.value;
    this.handleNowBrChange(str);
  }

  // handle function for the clear button
  // which reset the text in the form
  handleClear() {
    this.handleNowBrChange('/');
  }

  // handle function for the sub-directories list buttons
  // when click on the button, change the browsing target to the clicked folder
  handleButtonOnClick(_path){
    var {now_browsing} = this.state;
    var now_path = (now_browsing[now_browsing.length-1] === '/')?now_browsing:now_browsing.slice(0,now_browsing.lastIndexOf('/')+1)
    now_path = now_path + _path + '/';
    this.handleNowBrChange(now_path);
  }

  // handle function for 'create folder' button, which open the creating model
  createOnShow(){
    this.setState({show_create:true});
  }

  // handle function for closing the create model
  createOnHide(){
    this.setState({show_create:false});
  }

  // ask server to create folder by the path written by the user in the form
  handleOnCreate(){
    socket.emit('create',{path: this.state.now_browsing});
    this.setState({show_create:false});
  }

  // handle function for 'mount here' button, which open the creating model
  mountOnShow(){
    this.setState({show_mount:true});
  }

  // handle function for closing the mounting model
  mountOnHide(){
    this.setState({show_mount:false});
  }

  // Send event to server to mount at the path
  handleOnMount(){
    socket.emit(
      'mount',
      {path: this.state.now_browsing.slice(0,this.state.now_browsing.lastIndexOf('/')+1)}
    );
    this.setState({show_mount:false});
  }

  // Mount / Unmount a mounted path
  handleChangeMount(data,mounted){
    console.log(`path: ${data} Mounted: ${mounted}`);
    if(mounted){
      socket.emit('unmount', {path: data});
    }else{
      socket.emit('mount', {path: data});
    }
  }

  render() {
    return (
      <div>
        <h3> To create new cipher paths, choose from below </h3>
        <PathForm state={this.state.valid?'success':'error'} path={this.state.now_browsing} onChange={this.hadleFormOnChange.bind(this)} />
        {
          (this.state.now_list.length === 0)? 
            null : 
            <PathBtnGroup 
              paths={this.state.now_list} 
              onClick={this.handleButtonOnClick.bind(this)} /
            >
        }        
        <Button 
          bsStyle='success' 
          disabled={!this.state.mountable} 
          onClick={this.mountOnShow.bind(this)}
        >
          Mount Here
        </Button>
        
        <Button 
          bsStyle='warning' 
          disabled={!this.state.creatable} 
          onClick={this.createOnShow.bind(this)}
        >
          Create Folder
        </Button> 
        
        <Button 
          onClick={this.handleClear.bind(this)}
        >
          Clear
        </Button>

        <div>
          <h3>Mounted Folders in your System</h3>
          <MountList mountList={this.state.mounted_list} changeMount={this.handleChangeMount} />
        </div>
        
        <CreateModel 
          show={this.state.show_create} 
          onHide={this.createOnHide.bind(this)} 
          onCheck={this.handleOnCreate.bind(this)} 
          path={this.state.now_browsing}/
        >
        <MountModel 
          show={this.state.show_mount} 
          onHide={this.mountOnHide.bind(this)} 
          onCheck={this.handleOnMount.bind(this)} 
          path={this.state.now_browsing.slice(0,this.state.now_browsing.lastIndexOf('/')+1)}/
        >
      </div>
    );
  }
}

export default Mounter;