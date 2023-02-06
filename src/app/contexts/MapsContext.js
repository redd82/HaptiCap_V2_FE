import React, {createContext, useContext, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {UtilityContext} from "./UtilityContext";

export const MapsContext = createContext({});
export default function MapsContextProvider({ children }) {
    const serverHost = 'http://localhost:8081';
    const { sortData } = useContext(UtilityContext);
    const navigate = useNavigate();

    async function fetchMapList() {
        try {
            const response = await axios.get(serverHost + '/api/maps/all', {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return sortData(response.data.cars);
        } catch (e) {
            setTimeout(() => navigate('/'), 1000);
        }
    }

    async function getMapDataByNumber(number){
        try {
            const response = await axios.get(serverHost + `/api/maps/${number}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response;
        } catch (e) {
            console.error(e);
            setTimeout(() => navigate('/'), 1000);
        }
    }

    async function getMapDataByName(name){
        try {
            const response = await axios.get(serverHost + `/api/maps/${name}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response;
        } catch (e) {
            console.error(e);
            setTimeout(() => navigate('/'), 1000);
        }
    }

    useEffect( () => {

    }, []);

    const contextData = {
        fetchMapList:fetchMapList,
        getMapDataByNumber:getMapDataByNumber,
        getMapDataByName:getMapDataByName,
    };

    return (
        <MapsContext.Provider value={contextData}>
            {children}
        </MapsContext.Provider>
    );
}