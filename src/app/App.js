// import logo from './media/logo.svg';
import React, {useContext} from 'react';
import {Route, Routes} from 'react-router-dom';
import Main from "./pages/Main";
import 'normalize.css';
import {CommsContext} from "./contexts/CommsContext";
// import './App.css';

function App(props) {
  const {setServerHost} = useContext(CommsContext);
  setServerHost(props.hostAddress);
  return (
    <div className="App">
        <Routes>
            <Route path="*" element={<Main />}/>
        </Routes>
    </div>
  );
}

export default App;
