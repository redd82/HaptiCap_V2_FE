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

    async function requestMap(mapData, kmlUploaded){
        let serverHost = getServerHost();
        let json;
        let errorMessage;
        let successMessage;
        if(kmlUploaded){
        json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area, pngFile: "/maps/" + mapData.pngFile,  kmlFile: "/maps/" + mapData.kmlFile});
        //console.log(kmlUploaded);
        } else {
        json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area, pngFile: mapData.pngFile, kmlFile: mapData.kmlFile});
        //console.log(kmlUploaded);
        }
        //console.log(json);
        try{
            const response = await axios.post(serverHost + '/navigation/request-map', json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            //console.log(response);
            errorMessage = "";
            successMessage = "";            
            if(response.status === 200){
                setTimeout(500);
                successMessage = "Map request recieved.";
                errorMessage = "";
            }else{
                errorMessage = "Error";
            }
            return [response, successMessage, errorMessage ];
        }   catch (e){
            errorMessage = e.response.data.message;
            if(e.response.status >= 401) {

            }else if(e.response.status === 400){
                errorMessage = e.response.data.message;
            }
            return [e.response, successMessage, errorMessage];
        }
        
    }

    async function sendMapInfoToESP(json,type){
        console.log(json);
        let serverHost = getServerHost();
        let response;
        let errorMessage;
        let successMessage;
        try{
            if(type === "registration"){
                response = await axios.post(serverHost + '/navigation/register-map', json, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            } else if (type === "update") {
                response = await axios.post(serverHost + '/navigation/update-map', json, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }else{
               response = "error";
            }
            console.log(response);
            errorMessage = "";
            successMessage = "";     
            if(response.status === 200){
                setTimeout(500);
                successMessage = "Map registered/saved.";
                errorMessage = "";
            }else{
                errorMessage = "Error";
            }
            return [response, successMessage, errorMessage ];
        }   catch (e){
            errorMessage = e.response.data.message;
            if(e.response.status >= 401) {

            }else if(e.response.status === 400){
                errorMessage = e.response.data.message;
            }
            return [e.response, successMessage, errorMessage];
        }
    }

    function setSelelectedMap(map){
        selectedMap = map;
    }

    function getSelectedMap(){
        return selectedMap;
    }

    async function fetchKMLFile(fileName) {
        try {
            const response = await axios.get(getServerHost() + fileName, {
                headers: {
                    "Content-Type": "application/vnd.google-earth.kml+xml",
                    
                }, withCredentials: false,
            });
            return response;
        } catch (e) {
            setTimeout(() => navigate('/'), 1000);
        }
    }

    useEffect( () => {

    }, []);

    const contextData = {
        fetchMapList:fetchMapList,
        requestMap:requestMap,
        sendMapInfoToESP:sendMapInfoToESP,
        setSelelectedMap:setSelelectedMap,
        getSelectedMap:getSelectedMap,
        fetchKMLFile:fetchKMLFile,
    };

    return (
        <MapsContext.Provider value={contextData}>
            {children}
        </MapsContext.Provider>
    );
}