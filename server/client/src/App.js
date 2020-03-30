import React from 'react';
import './App.css'
import Content from './component/Content/Content';
import CreateForm from './component/CreateForm/CreateForm';
import { Switch, Route } from 'react-router';


const App = () => {
  return (
    <div className="container">
      <Switch>
        <Route exact path='/session/:session_id/:username' component={Content} />
        <Route exact path='/' component={CreateForm} />
      </Switch>
    </div>
  );
}

export default App;
