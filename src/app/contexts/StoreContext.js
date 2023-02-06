import React, {createContext, useContext, useEffect} from 'react';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    const serverHost = 'http://localhost:8081';
    let storedData = [];

    function storeData(data, index){
        console.log(data + ' at index ' + index);
        storedData[index] = data;
    }

    function fetchData(index){
        console.log('fetched data ' + storedData[index]);
        return storedData[index];
    }

    function getServerHost(){
        return serverHost;
    }

    const contextData = {
        storeData:storeData,
        fetchData:fetchData,
        getServerHost:getServerHost,
    };


    return (
        <StoreContext.Provider value={contextData}>
            {children}
        </StoreContext.Provider>
    );
}