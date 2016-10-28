import React from 'react';
import { Well , Button } from 'react-bootstrap';

const PathBtnGroup = (props) => {
  return (
    <Well>
      {
        props.paths.map( (_path) => {
          return [<Button onClick={props.onClick.bind(this,_path)}>{_path}</Button>];
        })
      }
    </Well>
  );
}

export default PathBtnGroup