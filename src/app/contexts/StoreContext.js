import React, {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

export const StoreContext = createContext({});
export default function StoreContextProvider({ children }) {
    const navigate = useNavigate();
    const [loadedMap, setLoadedMap] = useState();
    const [storedData, setStoredData] = useState([]);

    const HtmlSources =["https://stackoverflow.com/a/29296049/14198287",
                        "https://www.movable-type.co.uk/scripts/latlong.html",
                        "https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php",
                        "https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees",
                        "https://developers.google.com/kml/documentation/kmlreference#groundoverlay",
                        "https://www.omnicalculator.com/math/right-triangle-side-angle",
                        "https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy",
                        "https://codepen.io/pen/",
                        "https://pganssle.github.io/HaptiCap/",
                        "https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy",
                        "https://en.wikipedia.org/wiki/NATO_Joint_Military_Symbology",
                        "https://medium.com/trabe/processing-gpx-tracks-using-javascript-c2b0afa71e55"];

    function getSources() // function that reutns a array of html pages used as project sources
    {
        return HtmlSources;
    }


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
        getSources:getSources,
    };

    return (
        <StoreContext.Provider value={contextData}>
            {children}
        </StoreContext.Provider>
    );
}