import React, {createContext} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    const navigate = useNavigate();
    let loadedMap = {};
    let storedData = [];

    function storeData(data, index){
        //console.log(data + ' at index ' + index);
        storedData[index] = data;
    }

    function getLoadedMapData(){
        //console.log("Get loaded map called");
        //console.log(loadedMap);
        return loadedMap;
    }

    function setHomeToUseMap(data){
        console.log("setHomeToUseMap called");
        loadedMap = data;
        //console.log(data);
        //console.log(loadedMap);
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