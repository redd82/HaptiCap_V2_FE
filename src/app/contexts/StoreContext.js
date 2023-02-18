import React, {createContext} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    //const serverHost = '%HOSTIP%';          // 
    let serverHost = '';
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
            return response.data;
        } catch (e) {
            //setTimeout(() => navigate('/settings'), 1000);
        }
    }

    async function fetchCalData() {
        try {
            const response = await axios.get(serverHost + '/caldata.json', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            //setTimeout(() => navigate('/settings'), 1000);
        }
    }

    async function fetchDebugSettings() {
        try {
            const response = await axios.get(serverHost + '/debug.json', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            //setTimeout(() => navigate('/settings'), 1000);
        }
    }

    async function restartHaptiCap() {
        try {
            const response = await axios.get(serverHost + '/restart', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            //setTimeout(() => navigate('/settings'), 1000);
        }
    }

    function setServerHost(hostAddress){
        serverHost = hostAddress;
        // console.log('Host Address set to:' + hostAddress);
    }

    function getServerHost(){
        return serverHost;
    }

    const contextData = {
        storeData:storeData,
        fetchSettings:fetchSettings,
        fetchCalData:fetchCalData,
        fetchDebugSettings:fetchDebugSettings,
        getServerHost:getServerHost,
        setServerHost:setServerHost,
        restartHaptiCap:restartHaptiCap,
    };


    return (
        <StoreContext.Provider value={contextData}>
            {children}
        </StoreContext.Provider>
    );
}