import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const ErrorMessagesContext = createContext({});
export default function ErrorMessagesContextProvider({ children }) {
    let serverHost = '';
    const navigate = useNavigate();
    const [defaultData, setDefaultData] = useState({});
    const [storedData, setStoredData] = useState({});

    function storeData(data, index){
        console.log(data + ' at index ' + index);
        setStoredData({...storedData, index: data});
    }

    function getStoredData(index){
        return storedData.index;
    }

    const contextData = {
        storeData:storeData,
        getStoredData:getStoredData,
    };


    return (
        <ErrorMessagesContext.Provider value={contextData}>
            {children}
        </ErrorMessagesContext.Provider>
    );
}