import React from 'react';
import { Well , Button , Grid , Col , Row } from 'react-bootstrap';

const LongH5 = (props) => {
  var paths = props.path.split('/');
  var temp = [];
  var q=0;
  for(var i=0; i<paths.length; i++){
    temp[q] = (temp[q] === undefined) ? '' : temp[q];
    if(temp[q].length <= 52){
      temp[q] = temp[q] + '/' + paths[i];
    }else{
      temp[q] = temp[q]+'/';
      ++q;
    }
  }
  for(i=0; i<temp.length; i++){
    temp[i] = temp[i].slice(1,temp[i].length);
  }

  return(
    <div>
    {
      temp.map((_path) => {
        return [<h5>{_path}</h5>]
      })
    }
    </div>
  );
}

const MountedItem = (props) => {
  return (
    <Well>
      <Grid>
        <Row className="show-grid">
        <Col sm={12} md={8}>
          <LongH5 path={props.path} />
        </Col>
        <Col sm={6} md={3}>
          <Button className='pull-right' onClick={props.changeMount}>{props.mounted?'Unmount':'Mount'}</Button>
        </Col>
        </Row>
      </Grid>
    </Well>
  );
}

const MountList = (props) => {
  return (
    <div>
      <h4> Mounted </h4>
      {
        props.mountList.map((_mount) => {
          return [
            _mount.mounted?
              <MountedItem 
                path={_mount.path} 
                mounted={_mount.mounted} 
                changeMount={props.changeMount.bind(this,_mount.path,_mount.mounted)}
              />:
              null
          ]
        })
      }
      <h4> Mounted but unmount </h4>
      {
        props.mountList.map((_mount) => {
          return [
            !_mount.mounted?
              <MountedItem 
                path={_mount.path} 
                mounted={_mount.mounted} 
                changeMount={props.changeMount.bind(this,_mount.path,_mount.mounted)}
              />:
              null
          ]
        })
      }
    </div>
  );
}

export default MountList