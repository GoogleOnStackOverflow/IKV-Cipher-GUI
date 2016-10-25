import React, { Component , PropTypes } from 'react';
import Request from 'react-http-request';
import Spinner from 'react-spinkit';
import { DropdownButton, MenuItem, Button } from 'react-bootstrap';

const PathSep = (props) =>{

  return (
  <Request
    url={"http://localhost:13428/path/"+props.path}
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
        var paths = JSON.parse(result.text);
        if(paths.length !== 0){
          return (
            <DropdownButton 
              title={props.selected===undefined? '/Tap to Browse': '/' + props.selected} 
              onSelect={props.onSelect}
            >
              {
                paths.map((_path) => {
                  return [<MenuItem eventKey={_path}>{_path}</MenuItem>];
                })
              }
              <MenuItem divider />
              <MenuItem eventKey="_CREATE_FOLDER_" onClick={props.onCreate}>Create Folder Here</MenuItem>
              {props.children}
            </DropdownButton>
          );
        } else {
          return (
            <Button onClick={props.onCreate}>Create Folder Here</Button>
          );
        }

      }
    }
  }</Request>
  );
}

PathSep.propTypes = {
  id: PropTypes.number.isRequired,
  selected: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
}

export default PathSep