// import logo from './media/logo.svg';
import React, {useContext} from 'react';
import {Route, Routes} from 'react-router-dom';
import Main from "./pages/Main";
import 'normalize.css';
import {StoreContext} from "./contexts/StoreContext";
// import './App.css';

function App(props) {
  const {setServerHost} = useContext(StoreContext);
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
