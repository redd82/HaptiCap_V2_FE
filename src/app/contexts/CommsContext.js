import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const CommsContext = createContext({});
export default function CommsContextProvider({ children }) {
    let serverHost = '';
    const navigate = useNavigate();
    const [defaultTimeDateData, setDefaultTimeDateData] = useState({GPSTime: '00:00', GPSDate: '00-00-00'});
    const [defaultPositionData, setDefaultPositionData] = useState({GPSLat:"", GPSLon: ""});
    const [defaultData, setDefaultData] = useState({});
    const [defaultDeviceName, setDefaultDeviceName] = useState("Hapticap Default Name")
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

    async function fetchCalData() {
        try {
            const response = await axios.get(serverHost + '/caldata.json', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
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
            return defaultData;
        }
    }

    async function fetchData() {
        try {
            const response = await axios.get(serverHost + '/data.json', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
        }
    }

    async function fetchTimeDate() {
        try {
            const response = await axios.get(serverHost + '/getGPSTimeDate', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultTimeDateData;
        }
    }

    async function fetchTime() {
        try {
            const response = await axios.get(serverHost + '/getGPSTime', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultTimeDateData;
        }
    }

    async function fetchDate() {
        try {
            const response = await axios.get(serverHost + '/getGPSDate', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultTimeDateData;
        }
    }

    async function fetchPosition() {
        try {
            const response = await axios.get(serverHost + '/getGPSPosition', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultPositionData;
        }
    }

    async function fetchDeviceName() {
        try {
            const response = await axios.get(serverHost + '/getDeviceName', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultDeviceName;
        }
    }


    async function fetchSensorData() {
        try {
            const response = await axios.get(serverHost + '/getSensorData', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
        }
    }


    async function setHome() {
        try {
            const response = await axios.get(serverHost + '/setHome', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
        }
    }

    async function listFiles() {
        try {
            const response = await axios.get(serverHost + '/listFiles', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
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
            return defaultData;
        }
    }

    function setServerHost(hostAddress){
        serverHost = hostAddress;
        // console.log('Host Address (from index.html) set to:' + hostAddress);
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
        fetchTimeDate:fetchTimeDate,
        fetchTime:fetchTime,
        fetchDate:fetchDate,
        fetchPosition:fetchPosition,
        fetchDeviceName:fetchDeviceName,
        fetchData:fetchData,
        fetchSensorData:fetchSensorData,
        setHome:setHome,
        listFiles:listFiles,
        restartHaptiCap:restartHaptiCap,
    };


    return (
        <CommsContext.Provider value={contextData}>
            {children}
        </CommsContext.Provider>
    );
}