import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const CommsContext = createContext({});
export default function CommsContextProvider({ children }) {
    let serverHost = '';
    const navigate = useNavigate();
    const [defaultTimeDateData, setDefaultTimeDateData] = useState({GPSTime: '00:00', GPSDate: '00-00-00'});
    const [defaultPositionData, setDefaultPositionData] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    const [defaultHeadingData, setDefaultheadingData] = useState({CompassHeading: 0.0});
    const [defaultPositionHeadingData, setDefaultPositionHeadingData] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000, CompassHeading: 0.0});
    const [defaultData, setDefaultData] = useState({});
    const [defaultDeviceName, setDefaultDeviceName] = useState("Hapticap Default Name");
    const [currentPosition, setCurrentPosition] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000});
    const [currentPositionHeadingData, setCurrentPositionHeadingData] = useState({GPSLat: 0.00000000, GPSLon: 0.00000000, CompassHeading: 0.0});
    const [currentHeading, setCurrentHeading] = useState({CompassHeading: 0.0});
    const [storedData, updateStoredData] = useState([]);

    function storeData(data, index){
        console.log(data + ' at index ' + index);
        updateStoredData( arr => [...arr, `${arr.length}`]);
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
            setCurrentPosition(response.data);
            // console.log(response.data);
            return response.data;
        } catch (e) {
            return defaultPositionData;
        }
    }

    async function fetchCompassHeading() {
        try {
            const response = await axios.get(serverHost + '/getCompassHeading', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            setCurrentHeading(response.data);
            // console.log(response.data);
            return response.data;
        } catch (e) {
            return defaultHeadingData;
        }
    }

    async function fetchPositionCompassHeading() {
        try {
            const response = await axios.get(serverHost + '/getGPSPositionCompassHeading', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            setCurrentPositionHeadingData(response.data);
            // console.log(response.data);
            return response.data;
        } catch (e) {
            return defaultPositionHeadingData;
        }
    }

    function getCurrentPosition(){
        return currentPosition;
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
        getCurrentPosition:getCurrentPosition,
        fetchCompassHeading:fetchCompassHeading,
        fetchPositionCompassHeading:fetchPositionCompassHeading,
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