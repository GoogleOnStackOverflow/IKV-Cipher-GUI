import React, { Component } from 'react';
import request from 'superagent';
import { Button } from 'react-bootstrap';
import { CreateModel , MountModel } from './CheckModel';
import PathForm from './PathForm';
import PathBtnGroup from './PathBtnGroup';
import MountList from './MountList';
import io from 'socket.io-client';
import { HOST_NAME , SERVER_PORT } from '../constants';

let socket = io(`http://${HOST_NAME}:${SERVER_PORT}`);

class Mounter extends Component {

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

    this.handleClear();
  }

  componentDidMount() {
    socket.on('init', this._initialize.bind(this));
    socket.on('create', this._handleCreated.bind(this));
    socket.on('mount', this._handleMounted.bind(this));
  }

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

  handleNowBrChange(str) {
    this.setState({now_browsing: str});
    var to_browse = str.slice(0,str.lastIndexOf('/')+1);
    var filter_w = str.slice(str.lastIndexOf('/')+1, str.length);

    this.handleMountable(to_browse);

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

  handleNowList(_path) {
    return request
      .get(`http://${HOST_NAME}:${SERVER_PORT}/path/${_path}`)
      .set('Accept', 'application/json')
      .end(function(err, res){
        if(res){
          var list = JSON.parse(res.text);
          return this.setState({
            now_list: list,
            valid: true
          });
        }else{
          return this.setState({
            now_list:[],
            valid: false
          });
        }
      }.bind(this));
  }

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

  hadleFormOnChange(e){
    var str = e.target.value;
    this.handleNowBrChange(str);
  }

  handleClear() {
    this.handleNowBrChange('/');
  }

  handleButtonOnClick(_path){
    var {now_browsing} = this.state;
    var now_path = (now_browsing[now_browsing.length-1] === '/')?now_browsing:now_browsing.slice(0,now_browsing.lastIndexOf('/')+1)
    now_path = now_path + _path + '/';
    this.handleNowBrChange(now_path);
  }

  createOnShow(){
    this.setState({show_create:true});
  }

  createOnHide(){
    this.setState({show_create:false});
  }

  handleOnCreate(){
    socket.emit('create',{path: this.state.now_browsing});
    this.setState({show_create:false});
  }

  mountOnShow(){
    this.setState({show_mount:true});
  }

  mountOnHide(){
    this.setState({show_mount:false});
  }

  handleOnMount(){
    socket.emit(
      'mount',
      {path: this.state.now_browsing.slice(0,this.state.now_browsing.lastIndexOf('/')+1)}
    );
    this.setState({show_mount:false});
  }

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