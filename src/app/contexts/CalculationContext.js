import React, {createContext, useContext, useState} from 'react';
import { message } from 'antd';
import { DebugContext } from './DebugContext';

export const CalculationContext = createContext({});
export default function CalculationContextProvider({ children }) {
const {SystemDebug, debugLevel} = useContext(DebugContext);
const [mapData, setMapData] = useState({});
const [boundingBoxMap, setBoundingBoxMap] = useState({})
const RoundingDecimals = 8; // round to x decimals


let Radius = 6371000;          //radius of planet we are on (Earth)

let LatLonNorthWest = [0,0];    // latitude Degrees, longitude Degrees
let LatLonSouthEast = [0,0];

let LatLonMidPoint  = [0,0];    // calculated map point

let ImageName = "";             // the name of the image. i.e.  "map.jpg"
let ImageSize = [1920,1080];    // pixels

let Rotation = 0;               // Rotation is in DecimalDegrees

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
    haversine(Radius, mapData.north, mapData.west, mapData.south, mapData.east);
    // set the basic values we need
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
function calculateImageCoords(event, boundingBox) 
{
    try{
        let e = event.target;
        let dim = e.getBoundingClientRect();
        let x = event.clientX - dim.left;
        let y = event.clientY - dim.top;
        console.log(x);
        console.log(y);
        let xOffset = x - (mapData.imageWidth/2);
        let yOffset = (mapData.imageHeight/2) - y;
        //temp = calculateBoundingBox(mapData.north, mapData.west, mapData.south, mapData.east, mapData.rotation)
        let clicked = convertXYtoLatLon(x,y,boundingBox, mapData.imageWidth, mapData.imageHeight)
        // temp = getLatLongFromXY(xOffset, yOffset, mapData);
        console.log(boundingBox);
        console.log("getClickCoords; Output: X:" + x + " Y:" + y);
        let coordinates = [0,0,0,0];
        coordinates[0] = x;
        coordinates[1] = y;
        coordinates[2] = boundingBox;
        coordinates[3] = clicked;
        return coordinates; 
    }
    catch(exception){
        // well something went blah.
        console.log(exception);
        return 1;
    }
  }

// function haversine(R, lat1, lon1, lat2, lon2){
//     // Haversine
//     // formula: 	a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
//     // c = 2 ⋅ atan2( √a, √(1−a) )
//     // d = R ⋅ c
//     // where 	φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
//     // note that angles need to be in radians to pass to trig functions!
//     // JavaScript: 	

//     const φ1 = lat1 * Math.PI/180; // φ, λ in radians
//     const φ2 = lat2 * Math.PI/180;
//     const Δφ = (lat2-lat1) * Math.PI/180;
//     const Δλ = (lon2-lon1) * Math.PI/180;
    
//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
//     const d = R * c; // in metres
//     SystemDebug(["haversine"],[d]);
// }

function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;
  
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c;
  
    return distance;
  }

function calculateBoundingBox(north, west, south, east, rotation) {
    console.log(rotation);
    const NWLat = north;
    const NWLng = west;
    const SELat = south;
    const SELng = east;

    const R = 6371; // Radius of the earth in m
    
    // Calculate center point of bounding box
    const lat = (NWLat + SELat) / 2;
    const lng = (NWLng + SELng) / 2;
    
    // Calculate distance to SW and NE points
    const dLat = (NWLat - SELat) * Math.PI / 180;
    const dLng = (NWLng - SELng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(NWLat * Math.PI / 180) * Math.cos(SELat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    
    const bearing = (Math.atan2(NWLat - SELat, NWLng - SELng) * 180 / Math.PI + 360 + rotation) % 360;
    
    const SWLat = lat - Math.sin(bearing * Math.PI / 180) * d / (2 * Math.PI * R) * 360;
    const SWLng = lng - Math.cos(lat * Math.PI / 180) * Math.cos(bearing * Math.PI / 180) * d / (2 * Math.PI * R) * 360;
    
    const NELat = lat + Math.sin(bearing * Math.PI / 180) * d / (2 * Math.PI * R) * 360;
    const NELng = lng + Math.cos(lat * Math.PI / 180) * Math.cos(bearing * Math.PI / 180) * d / (2 * Math.PI * R) * 360;
    
    console.log(`South West point: (${SWLat}, ${SWLng})`);
    console.log(`North East point: (${NELat}, ${NELng})`);

    let boundingBox = 
    {
        latLonNW: {lat: NWLat, lng: NWLng},
        latLonSE: {lat: SELat, lng: SELng},
        latLonSW: { lat: SWLat, lng: SWLng },
        latLonNE: { lat: NELat, lng: NELng }
    };
    return boundingBox;
}

function convertXYtoLatLon(x,y,boundingBox, imageWidth, imageHeight){
    // const imageWidth = 1000; // Width of the image in pixels
    // const imageHeight = 700; // Height of the image in pixels
    // Convert pixel coordinates to percentage coordinates
    const xPercent = x / imageWidth;
    const yPercent = y / imageHeight;
    console.log(x);
    console.log(y);
    console.log(imageWidth);
    console.log(imageHeight);

    // Convert percentage coordinates to latitude and longitude coordinates
    console.log(boundingBox.latLonNW.lat - boundingBox.latLonSW.lat);
    console.log(boundingBox.latLonNW.lng - boundingBox.latLonSW.lng);
    const latPercent = (boundingBox.latLonSW.lat + (boundingBox.latLonNW.lat - boundingBox.latLonSW.lat)) * yPercent;
    const lngPercent = (boundingBox.latLonSW.lng + (boundingBox.latLonSE.lng - boundingBox.latLonSW.lng)) * xPercent;
    const lat = (boundingBox.latLonSW.lat + (boundingBox.latLonNW.lat - boundingBox.latLonSW.lat));
    const lng = (boundingBox.latLonSW.lng + (boundingBox.latLonSE.lng - boundingBox.latLonSW.lng));


    console.log(boundingBox);
    console.log(xPercent);
    console.log(yPercent);
    // Print the latitude and longitude coordinates to the console
    console.log("LatitudePercent:", latPercent * 100);
    console.log("LongitudePercent:", lngPercent * 100);
    console.log("Latitude:", lat);
    console.log("Longitude:", lng);
}

function convertLatLonToXY(lat, lon, boundingBox, imageWidth, imageHeight, topLeftPosition){
    console.log({imageWidth, imageHeight});
    console.log(topLeftPosition.top);
    const NWLng = boundingBox.latLonNW.lng;
    const SELng = boundingBox.latLonSE.lng;
    const NWLat = boundingBox.latLonNW.lat;
    const SELat = boundingBox.latLonSE.lat;

    const x = (((lon - NWLng) / (SELng - NWLng)) * imageWidth) + topLeftPosition.left;
    const y = (((NWLat - lat) / (NWLat - SELat)) * imageHeight) + topLeftPosition.top;
    return { x, y };
}
  
// ArStuff
function getLatLongFromXY(x, y,mapData)
{
    // Calculate the distance between LatLonNorthWest and LatLonSouthEast
    // Load the map data from the function call into the 'global' values in this context.
    onLoad(mapData);
    let dLat = 0;
    let dLon = 0;
    if(LatLonNorthWest[0] > LatLonSouthEast[0]){
        dLat = LatLonNorthWest[0] - LatLonSouthEast[0];
    }else{
        dLat = LatLonSouthEast[0] - LatLonNorthWest[0];
    }
    if(LatLonNorthWest[1] > LatLonSouthEast[1]){
        dLon = LatLonNorthWest[1] - LatLonSouthEast[1];
    }else{
        dLon = LatLonSouthEast[1] - LatLonNorthWest[1];
    }
    const latPerPx = dLat/mapData.imageHeight;
    const lonPerPx = dLat/mapData.imageWidth;
    SystemDebug(["latPerPx: ", "lonPerPx: "],[latPerPx, lonPerPx]);

    const hypotenuseLength = Math.sqrt(dLat ** 2 + dLon ** 2);
    SystemDebug(["hypotenuseLength: "],[hypotenuseLength]);
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
    calculateBoundingBox:calculateBoundingBox,
    convertXYtoLatLon:convertXYtoLatLon,
    convertLatLonToXY:convertLatLonToXY,
    getGlobals:getGlobals,
    onLoad:onLoad,
    calculateImageCoords:calculateImageCoords,
    getLatLongFromXY:getLatLongFromXY,
}

return (
    <CalculationContext.Provider value={contextData}>
        {children}
    </CalculationContext.Provider>
);
}