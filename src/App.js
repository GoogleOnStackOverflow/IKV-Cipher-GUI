import React, { Component } from 'react';
import { CreateModel , MountModel } from './components/CheckModel';
import PathForm from './components/PathForm';
import PathBtnGroup from './components/PathBtnGroup';

class App extends Component {
  render() {
    return (
      <div>
        <PathForm state='success' path='foooo' onChange={(e)=>{console.log(e.target.value);}} onClear={()=>{console.log('clear!');}} />
        <PathBtnGroup paths={['a','b','c','aaaa']} onClick={(data)=>{console.log(data);}} />
      </div>
    );
  }
}

export default App;
