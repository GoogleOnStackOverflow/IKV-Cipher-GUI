import React from 'react';
import { Modal , Button } from 'react-bootstrap';

// Checking popups for create folder and mounting

const MountModel = (props) => {
  return (
    <Modal show={props.show} bsSize="small" aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">Mount Your Cipher File System</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Are you sure to mount here?</h4>
        <p>{props.path}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='success' onClick={props.onCheck}>Yes</Button>
        <Button onClick={props.onHide}>No</Button>
      </Modal.Footer>
    </Modal>
  );
}

const CreateModel = (props) => {
  return (
    <Modal show={props.show} bsSize="small" aria-labelledby="contained-modal-title-lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">Create a folder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>Are you sure to create this?</h4>
        <p>{props.path}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='success' onClick={props.onCheck}>Yes</Button>
        <Button onClick={props.onHide}>No</Button>
      </Modal.Footer>
    </Modal>
  );
}

export { CreateModel, MountModel };