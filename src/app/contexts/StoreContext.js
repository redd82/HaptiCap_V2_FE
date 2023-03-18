import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    const navigate = useNavigate();
    const [loadedMap, setLoadedMap] = useState();
    const [storedData, setStoredData] = useState([]);

    function storeData(data, index){
        // for(let i = 0;  )



        setStoredData({...storedData, data});
    }

    function getLoadedMapData(){
        return loadedMap;
    }

    function setHomeToUseMap(data){
        console.log("setHomeToUseMap called");
        setLoadedMap(data);
    }

    const contextData = {
        storeData:storeData,
        setHomeToUseMap:setHomeToUseMap,
        getLoadedMapData:getLoadedMapData,
    };

    return (
        <StoreContext.Provider value={contextData}>
            {children}
        </StoreContext.Provider>
    );
}