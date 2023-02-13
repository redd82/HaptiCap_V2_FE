import React, {createContext, useContext, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    const serverHost = 'http://192.168.17.105';
    const navigate = useNavigate();

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
            //console.log(response.data);
            return response.data;
        } catch (e) {
            //setTimeout(() => navigate('/settings'), 1000);
        }
    }

    function getServerHost(){
        return serverHost;
    }

    const contextData = {
        storeData:storeData,
        fetchSettings:fetchSettings,
        getServerHost:getServerHost,
    };


    return (
        <StoreContext.Provider value={contextData}>
            {children}
        </StoreContext.Provider>
    );
}