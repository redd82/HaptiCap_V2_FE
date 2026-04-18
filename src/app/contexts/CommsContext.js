import React, {createContext, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const CommsContext = createContext({});
export default function CommsContextProvider({ children }) {
    const serverHostRef = useRef('');
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
            const response = await axios.get(getServerHost() + '/hapticap.json', {
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
            const response = await axios.get(getServerHost() + '/caldata.json', {
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
            const response = await axios.get(getServerHost() + '/debug.json', {
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
            const response = await axios.get(getServerHost() + '/data.json', {
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
            const response = await axios.get(getServerHost() + '/getGPSTimeDate', {
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
            const response = await axios.get(getServerHost() + '/getGPSTime', {
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
            const response = await axios.get(getServerHost() + '/getGPSDate', {
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
            const response = await axios.get(getServerHost() + '/getGPSPosition', {
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
            const response = await axios.get(getServerHost() + '/getCompassHeading', {
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
            const response = await axios.get(getServerHost() + '/getGPSPositionCompassHeading', {
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
            const response = await axios.get(getServerHost() + '/getDeviceName', {
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
            const response = await axios.get(getServerHost() + '/getSensorData', {
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
            const response = await axios.get(getServerHost() + '/setHome', {
                headers: {
                    "Content-Type": "application/json",
                    
                }, withCredentials: false,
            });
            return response.data;
        } catch (e) {
            return defaultData;
        }
    }

    async function setNorth() {
        try {
            const response = await axios.get(getServerHost() + '/setNorth', {
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
            const response = await axios.get(getServerHost() + '/listFiles', {
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
            const response = await axios.get(getServerHost() + '/restart', {
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
        serverHostRef.current = hostAddress || window.location.origin;
        // console.log('Host Address (from index.html) set to:' + hostAddress);
    }

    function getServerHost(){
        return serverHostRef.current || window.location.origin;
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
        setNorth:setNorth,
        listFiles:listFiles,
        restartHaptiCap:restartHaptiCap,
    };


    return (
        <CommsContext.Provider value={contextData}>
            {children}
        </CommsContext.Provider>
    );
}