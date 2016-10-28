import React from 'react';
import { Form , FormGroup , ControlLabel , FormControl , HelpBlock } from 'react-bootstrap';

// Browsing textbox
const PathForm = (props) => {
  return (
    <form>
      <FormGroup
        controlId="formBasicText"
        validationState={props.state}
      >
        <ControlLabel>Enter the path for browsing or choose from below</ControlLabel>
        <FormControl
          type="text"
          value={props.path}
          placeholder="Enter the path"
          onChange={props.onChange}
        />
        <FormControl.Feedback />
        <HelpBlock>Please clear and retry if this block in red</HelpBlock>
      </FormGroup>
    </form>
  );
}

export default PathForm