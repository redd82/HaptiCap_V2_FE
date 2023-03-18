import React, {createContext, useContext, useState} from 'react';
import { message } from 'antd';
import { DebugContext } from './DebugContext';

export const CalculationContext = createContext({});
export default function CalculationContextProvider({ children }) {
const {SystemDebug, debugLevel} = useContext(DebugContext);
const [mapData, setMapData] = useState({});
debugLevel(1);

const RoundingDecimals = 8; // round to x decimals

const HtmlSources =["https://stackoverflow.com/a/29296049/14198287",
                    "https://www.movable-type.co.uk/scripts/latlong.html",
                    "https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php",
                    "https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees",
                    "https://developers.google.com/kml/documentation/kmlreference#groundoverlay",
                    "https://www.omnicalculator.com/math/right-triangle-side-angle",
                    "https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy",
                    "https://codepen.io/pen/",
                    "https://pganssle.github.io/HaptiCap/"];


let Radius = 6371000;          //radius of planet we are on (Earth)

let LatLonNorthWest = [0,0];    // latitude Degrees, longitude Degrees
let LatLonSouthEast = [0,0];

let LatLonMidPoint  = [0,0];    // calculated map point

let ImageName = "";             // the name of the image. i.e.  "map.jpg"
let ImageSize = [1920,1080];    // pixels

let Rotation = 0;               // Rotation is in DecimalDegrees

function getSources() // function that reutns a array of html pages used as project sources
{
    return HtmlSources;
}

function getGlobals() // function returns the global values, should not be needed other then a debug-ish type call
{
    let output = [  
                    Radius,
                    LatLonNorthWest[0],LatLonNorthWest[1],
                    LatLonSouthEast[0],LatLonSouthEast[1],
                    LatLonMidPoint[0],LatLonMidPoint[1],
                    ImageSize[0], ImageSize[1],
                    Rotation[0],Rotation[1],
                ];
    return output;
}

// function onLoad(north, west, south, east, rotation, imagename ,imageheight, imagewidth, mapData)
function onLoad(mapData)
{
    // set the basic values we need
        haversine(Radius, mapData.north, mapData.west, mapData.south, mapData.east);
    try{
        setMapData(mapData);
        LatLonNorthWest[0] = mapData.north;
        LatLonNorthWest[1] = mapData.west;
        LatLonSouthEast[0] = mapData.south;
        LatLonSouthEast[1] = mapData.east;
        ImageSize[0] = mapData.imageWidth;
        ImageSize[1] = mapData.imageHeight;
        Rotation = mapData.rotation;
        ImageName = mapData.pngFile;
        Radius = mapData.radius;

        let debugmessages = ["mapData: ","OnLoad NorthWest: ","OnLoad SouthEast: ", "ImageSize: "]
        let debugvalues = [mapData, LatLonNorthWest,LatLonSouthEast, ImageSize];
        SystemDebug(debugmessages,debugvalues);
        return 0;
    }
    catch(exception){
        // well something went blah.
        console.log(exception);
        return 1;
    }
}

// function to find and return the coordinates (x/y/) 
//where one clicked on the image.
// if html is set to true, return html string
function calculateImageCoords(event, html) 
{
    try{
        let x = event.clientX;
        let y = event.clientY;
        //let coordinates = [x,y];
        let temp = [0,0];
        temp = getLatLongFromXY(x, y);
        
        let coordinates = [0,0,0,0];
        coordinates[0] = x;
        coordinates[1] = y;
        coordinates[2] = temp[0];
        coordinates[3] = temp[1];
        
        // incase the boolean html is set, output the text to the html element
        // <p id="ClickedCoordinates">Coordinates:</p>
        if(html == true)
        {
            document.getElementById("ClickedCoordinates").innerHTML = "Coordinates X:" + coordinates[0] + "/" + coordinates[2]+" Y:" + coordinates[1] + "/" + coordinates[3];
        }

        // return the coordinates and the X/Y position
        return coordinates; 

        // optional return only latlon;
        // return temp;
    }
    catch(exception){
        // well something went blah.
        console.log(exception);
        return 1;
    }
  }

function haversine(R, lat1, lon1, lat2, lon2){
    // Haversine
    // formula: 	a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
    // c = 2 ⋅ atan2( √a, √(1−a) )
    // d = R ⋅ c
    // where 	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
    // note that angles need to be in radians to pass to trig functions!
    // JavaScript: 	

    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    const d = R * c; // in metres
    console.log(d);
}


function getLatLongFromXY(x, y,mapData)
{
    // Calculate the distance between LatLonNorthWest and LatLonSouthEast
    // Load the map data from the function call into the 'global' values in this context.
    onLoad(mapData);
    const dLat = LatLonNorthWest[0] - LatLonSouthEast[0];
    const dLon = LatLonNorthWest[1] - LatLonSouthEast[1];
    const hypotenuseLength = Math.sqrt(dLat ** 2 + dLon ** 2);
  
    // Calculate the angle of rotation in radians
    const rotationRadians = ToRadians(Rotation);
      
    // Calculate the coordinates of the center of the hypotenuse
    LatLonMidPoint[0] = (LatLonNorthWest[0] + LatLonSouthEast[0]) / 2;
    LatLonMidPoint[1] = (LatLonNorthWest[1] + LatLonSouthEast[1]) / 2;
    
    // Calculate the distance between the center of the hypotenuse and the input pixel
    const dx = x - ImageSize[0] / 2;
    const dy = ImageSize[1] / 2 - y;
    const distanceFromCenter = Math.sqrt(dx ** 2 + dy ** 2);
    
    // Calculate the angle between the input pixel and the center of the hypotenuse
    const angleFromCenterRadians = Math.atan2(dy, dx);
      
    // Calculate the angle of the hypotenuse with respect to North
    const hypotenuseAngleRadians = Math.atan2(dLon, dLat) + rotationRadians - Math.PI / 2;
      
    // Calculate the latitude and longitude of the input pixel
    const lat = LatLonMidPoint[0] + (distanceFromCenter / hypotenuseLength) * Math.cos(hypotenuseAngleRadians + angleFromCenterRadians);
    const lon = LatLonMidPoint[1] + (distanceFromCenter / hypotenuseLength) * Math.sin(hypotenuseAngleRadians + angleFromCenterRadians);
      
    let debugmessages = ["(Click)x: ","(Click)y: ", "LatLonNorthWest[0]: ", "LatLonSouthEast[0]: ", "LatLonNorthWest[1]: ", "LatLonSouthEast[1]: ",
     "LatLonMidPoint[0]: ", "LatLonMidPoint[1]: ",  "ImageSize[0](width): ", "ImageSize[1](height): ", "dLat: ", "dLon: ", "hypotenuseLength: "]
    let debugvalues = [x, y, LatLonNorthWest[0], LatLonSouthEast[0], LatLonNorthWest[1], LatLonSouthEast[1], LatLonMidPoint[0], LatLonMidPoint[1], ImageSize[0], ImageSize[1], dLat, dLon, hypotenuseLength];
    SystemDebug(debugmessages,debugvalues);
     return [lat, lon];
}

// convert degrees to radians, cauz.. we need that
function ToRadians(degrees)
{
    let radians = (degrees* Math.PI)/ 180;
    radians = Number(radians.toFixed(RoundingDecimals));
    // debug values
    let debugmessage = ["ToRadians; Input; degrees","ToRadians; Output; radians"]
    let debugvalues = [degrees,radians];
    SystemDebug(debugmessage,debugvalues);

    return radians;
}
// convert radians to degrees, cauz.. we need that
function ToDegrees(radians)
{
    let degrees = radians * (180 / Math.PI);
    // debug stuff
    let debugmessage = ["ToDegrees; Input; radians","ToDegrees; Output; degrees"]
    let debugvalues = [radians,degrees];
    SystemDebug(debugmessage,debugvalues);

    return degrees;
  }

const contextData = 
{
    getGlobals:getGlobals,
    getLatLongFromXY:getLatLongFromXY,
    getSources:getSources,
    onLoad:onLoad,
    calculateImageCoords:calculateImageCoords,
}

return (
    <CalculationContext.Provider value={contextData}>
        {children}
    </CalculationContext.Provider>
);
}