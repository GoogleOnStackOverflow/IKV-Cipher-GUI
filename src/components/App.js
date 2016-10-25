import React, { Component } from 'react';
import {Router, Route, Link} from 'react-router';
import {Navbar, Nav, NavItem, NavDropdown, DropdownButton, MenuItem, CollapsibleNav, Modal, Button, FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';


import Path from './Path'

class App extends Component {



  render() {
    return (
      <Router>
        <Route path="/" component={Header}>
          <Route path="path" component={Path}/>
          <Route path="installation" component={Documents}/>
          <Route path="usage" component={Documents}/>
          <Route path="howitworks" component={Documents}/>
          <Route path="contact" component={Contact}/>
        </Route>
      </Router>
    );
  }
}

class Header extends Component {
  constructor () {
    super();
    this.state = {
      priShow: false,
      conShow: false
    };
  }

  render() {
    let priClose = () => this.setState({ priShow: false });
    let conClose = () => this.setState({ conShow: false });
    
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="path">IKV</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavDropdown eventKey={1} title="Documents" id="basic-nav-dropdown">
                <MenuItem eventKey={2.1}><Link to="installation">Installation</Link></MenuItem>
                <MenuItem eventKey={2.2}><Link to="usage">Usage</Link></MenuItem>
                <MenuItem eventKey={2.3}><Link to="howitworks">How it works</Link></MenuItem>
              </NavDropdown>
              <NavItem eventKey={2} onClick={() => this.setState({ priShow: true})}><Link>Privacy Policy</Link></NavItem>
            </Nav>
            <Nav pullRight>
              <NavItem eventKey={1} onClick={() => this.setState({ conShow: true})}><Link>Contact Us</Link></NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        {this.props.children}
        <PrivacyPolicy show={this.state.priShow} onHide={priClose} />
        <Contact show={this.state.conShow} onHide={conClose} />
      </div>
    )
  }
}

class PrivacyPolicy extends Component {
  render() {
    return (
      <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Privacy Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Private Data</h4>
          <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
          <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
          <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
          <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
          <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.</p>
          <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p>
          <p>Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class Documents extends Component {
  render() {
    return <p>Documents</p>
  }
}

class Contact extends Component {
  render() {
    return (
      <Modal {...this.props} bsSize="large" aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">Contact Us</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Email</h4>
          <form action="mailto:foo@mail.com" method="post" enctype="text/plain">
            <p>Send an Email to: foo@mail.com</p>
            <Button type="submit">
              Send
            </Button>
          </form>
          <h4>Phone</h4>
          <p>+886-2-0000-0000</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default App;
