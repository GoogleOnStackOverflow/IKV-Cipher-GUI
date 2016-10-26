import React, { Component } from 'react';
import Request from 'react-http-request';
import Spinner from 'react-spinkit';
import {Well, Jumbotron, ButtonGroup, DropdownButton, Button, ButtonToolbar, MenuItem, Modal, FormControl, HelpBlock, FormGroup, ControlLabel} from 'react-bootstrap';
import PathSep from './PathSep';

import { HOST_NAME, SERVER_PORT } from '../constants';

const concatPath = (array) => {
  var path = '/';
  for(var i=1; i<array.length; i++){
    path+=array[i]+'/'
  }

  return path;
}

class Path extends Component {
  constructor() {
    super();
    this.state = {
      paths:['/'],
      mountable: false,
      creating: false,
      mounting:false
    }
  }

  handleSelect(id, eventKey) {
    if(eventKey !== '_CREATE_FOLDER_'){
          if(id === this.state.paths.length -1){
        this.setState({
          paths: this.state.paths.concat([eventKey])
        })
      }else{
        this.setState({
          paths: (this.state.paths.slice(0,id+1)).concat([eventKey]),
        })
      }
    }
  }

  handleClear() {
    this.setState({
      paths: ['/'],
      mountable: false,
      creating: false,
      mounting: false
    })
  }

  handleCreate() {
    this.setState({
      creating:!this.state.creating
    })
  }

  handleMount(){
    this.setState({
      mounting:!this.state.mounting
    })
  }

  render() {
    console.log(this.state.paths);
    let _ind = 0
    return (
      <div>
        <Jumbotron>
          <h1>User Control Pannel</h1>
          <p>Web UI for IKV Cipher File System</p>
        </Jumbotron>
        <h3>Choose the directory</h3>
        <Well>
        <ButtonToolbar>
          <ButtonGroup>{
            this.state.paths.map((_path) => {
              return (
                <PathSep 
                  id={_ind} 
                  selected={this.state.paths[_ind+1]}
                  path={concatPath(this.state.paths.slice(0,_ind+1))}
                  onSelect={this.handleSelect.bind(this,_ind++)}
                  onCreate={this.handleCreate.bind(this)}
                />
              );
            })
          }
          </ButtonGroup>
          </ButtonToolbar>
          <ButtonToolbar>
          <ButtonGroup className="pull-right">
            <Request
              url={`http://${HOST_NAME}:${SERVER_PORT}/valid/${concatPath(this.state.paths)}`}
              method='get'
              accept='application/json'
              verbose={true}
            >{
              ({error, result, loading}) => {
                if (loading) {
                  return <Spinner spinnerName="double-bounce" />;
                } else if(error) {
                  return <div>"503 Internal Error\n"{ JSON.stringify(error) }</div>;
                } else{
                  console.log(result.text);
                  if(result.text === 'true'){
                    return (
                      <Button 
                        bsStyle='success' 
                        onClick={this.handleMount.bind(this)}
                      >
                        Mount Here
                      </Button>
                    );
                  }else{
                    return null;
                  }
                }
              }
            }</Request>
            <Button onClick={this.handleClear.bind(this)}>Clear</Button>
          </ButtonGroup>
          </ButtonToolbar>
        </Well>
        <Create show={this.state.creating} onHide={this.handleCreate.bind(this)} path={concatPath(this.state.paths)}/>
        <Mounting show={this.state.mounting} onHide={this.handleMount.bind(this)} path={concatPath(this.state.paths)}/>
      </div>
    );
  } 
}


class Create extends Component {
  constructor() {
    super();
    this.state = {
      folder_name:'',
      submit:false
    }
  }


  handleChange(e) {
    this.setState({ folder_name: e.target.value });
  }

  handleSubmit(){
    if(this.state.submit){
      this.setState({folder_name:''})
    }
    this.setState({submit: !this.state.submit})
  }

  render() {
    return (
      <Modal {...this.props} bsSize="small" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Create Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Create Folder under {this.props.path}</h4>
          {!this.state.submit?(
            <form>
              <FormGroup
                controlId="formBasicText"
              >
                <ControlLabel>Enter the folder name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.folder_name}
                  placeholder="Folder Name"
                  onChange={this.handleChange.bind(this)}
                />
                <FormControl.Feedback />
                <HelpBlock>The Folder name should not duplicate</HelpBlock>
              </FormGroup>
              {
                (this.state.folder_name==='') ? null:(
                  <Button bsStyle="success" type="submit" onClick={this.handleSubmit.bind(this)}>
                    Submit
                  </Button>
                )
              }
            </form>
          ):(
            <Request
              url={`http://${HOST_NAME}:${SERVER_PORT}/path/${this.props.path}${this.state.folder_name}`}
              method='post'
              accept='application/json'
              verbose={true}
            >{
              ({error, result, loading}) => {
                if (loading) {
                  return <Spinner spinnerName="double-bounce" />;
                } else if(error) {
                  return (
                    <div>
                      <p> Sorry, Somethings wrong. You can retry or create it by the native app of QNAP</p>
                      <p> {JSON.stringify(error)} </p>
                      <Button bsStyle='warning' onClick={this.handleSubmit.bind(this)}>Retry</Button>
                    </div>
                  );
                } else{
                  return (
                    <div>
                      <p> Folder Created, Tap Done and Cancle to return </p>
                      <Button bsStyle='success' onClick={this.handleSubmit.bind(this)}>Done</Button>
                    </div>
                  );
                }
              }
            }</Request>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancle</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class Mounting extends Component {
  constructor() {
    super();
    this.state = {
      mounting:false,
      path:''
    }
  }

  handleMounting(){
    this.setState({mounting: !this.state.mounting})
  }

  render() {
    if(this.props.path!==this.state.path){
      this.setState({
        mounting:false,
        path: this.props.path
      })
    }
    
    return (
      <Modal {...this.props} bsSize="small" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Mount Your Cipher File System</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {(!this.state.mounting)?(
            <div>
              <h4>Are you sure to mount at {this.props.path} ?</h4>
              <Button bsStyle='success' onClick={this.handleMounting.bind(this)}>Yes</Button>
              <Button onClick={this.props.onHide}>No</Button>
            </div>
          ):(
            <Request
              url={`http://${HOST_NAME}:${SERVER_PORT}/mount/${this.props.path}`}
              method='post'
              accept='application/json'
              verbose={true}
            >{
              ({error, result, loading}) => {
                if (loading) {
                  return <Spinner spinnerName="double-bounce" />;
                } else if(error) {
                  return (
                    <div>
                      <p> Sorry, Somethings wrong. You can retry or create it by the native app of QNAP</p>
                      <p> {JSON.stringify(error)} </p>
                      <Button bsStyle='warning' onClick={this.handleMounting.bind(this)}>Retry</Button>
                    </div>
                  );
                } else{
                  return (
                    <div>
                      <p> Mounted, Tap Done and Cancle to return </p>
                      <Button bsStyle='success' onClick={this.handleMounting.bind(this)}>Done</Button>
                    </div>
                  );
                }
              }
            }</Request>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Cancle</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Path;