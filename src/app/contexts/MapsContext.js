import React, {createContext, useContext, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {UtilityContext} from "./UtilityContext";
import { CommsContext } from './CommsContext';

export const MapsContext = createContext({});
export default function MapsContextProvider({ children }) {
    const { sortData } = useContext(UtilityContext);
    const { getServerHost } = useContext(CommsContext);

    let selectedMap = {};
    const navigate = useNavigate();

    async function fetchMapList() {
        try {
            const response = await axios.get(getServerHost() + '/mapData.json', {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response;
        } catch (e) {
            setTimeout(() => navigate('/'), 1000);
        }
    }

    function setSelelectedMap(map){
        selectedMap = map;
    }

    function getSelectedMap(){
        return selectedMap;
    }


    useEffect( () => {

    }, []);

    const contextData = {
        fetchMapList:fetchMapList,
        setSelelectedMap:setSelelectedMap,
        getSelectedMap:getSelectedMap,
    };

    return (
        <MapsContext.Provider value={contextData}>
            {children}
        </MapsContext.Provider>
    );
}