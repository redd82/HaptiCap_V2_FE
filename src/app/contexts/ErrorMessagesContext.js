import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const ErrorMessagesContext = createContext({});
export default function ErrorMessagesContextProvider({ children }) {
    let serverHost = '';
    const navigate = useNavigate();
    const [defaultData, setDefaultData] = useState({});
    let storedData = [];

    function storeData(data, index){
        console.log(data + ' at index ' + index);
        storedData[index] = data;
    }

    async function fetchSettings() {
        try {
            const response = await axios.get(serverHost + '/hapticap.json', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
        }
    }

    const contextData = {
        storeData:storeData,
        fetchSettings:fetchSettings,
    };


    return (
        <ErrorMessagesContext.Provider value={contextData}>
            {children}
        </ErrorMessagesContext.Provider>
    );
}