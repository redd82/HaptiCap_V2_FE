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
        //SystemDebug(debugmessages,debugvalues);
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
        // console.log(x);
        // console.log(y);
        let clicked = getLatLongFromXY(x, y, mapData);
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
  
// ArStuff
function getLatLongFromXY(x, y,mapData)
{
    // Calculate the distance between LatLonNorthWest and LatLonSouthEast
    onLoad(mapData);

    // the middle point
    LatLonMidPoint[0] = (LatLonNorthWest[0] + LatLonSouthEast[0]) / 2;
    LatLonMidPoint[1] = (LatLonNorthWest[1] + LatLonSouthEast[1]) / 2;

    // calculate the real world sizes by getting the hypotenuse in meters and the Beta angle in degrees
    let realWorldHypotenuse = CalculateDistance(LatLonNorthWest[0], LatLonNorthWest[1], LatLonSouthEast[0], LatLonSouthEast[1]);
    let realWorldBeta = Math.abs(CalculateBearing(LatLonNorthWest[0], LatLonNorthWest[1], LatLonSouthEast[0], LatLonSouthEast[1]) - (180 - Rotation));
    // the triangle values of the real life triangle    //[lengthA, lengthB, hypotenuse, betaAngle, alphaAngle];
    let realWorldTriangle = CalculateTriangleFromHypotenuse(realWorldHypotenuse,realWorldBeta);
    
    // set the offset X/Y based on the 0.0 being the center of the for quadrants.
    const centeredX = x -(ImageSize[0] /2);
    const centeredY = (ImageSize[1] /2) - y;
    
    // compass offset bearings
    const compass = ToAdjustedCompass();    //[north, east, south, west] with rotation added/substracted
    // scale x/y and add half a pixel for centering
    const realX = (Math.abs(centeredX) * (realWorldTriangle[1]/ImageSize[0])) + ( (realWorldTriangle[1]/ImageSize[0]) / 2 ); // calculate the distance in meters from the X pixel count, also add half an X length to get the center of the pixel
    const realY = (Math.abs(centeredY) * (realWorldTriangle[0]/ImageSize[1])) + ( (realWorldTriangle[0]/ImageSize[1]) / 2 ); // the same with Y
    
    // temp data
    let latlonDlon =[0,0];
    let latlonDlat =[0,0];
    // quadrant logic>
    if((centeredX  < 0) && (centeredY > 0))      // -x +y
    {
        latlonDlon  = CalculateDestination(LatLonMidPoint[0], LatLonMidPoint[1], realX, compass[3]);
        latlonDlat = CalculateDestination(latlonDlon[0], latlonDlon[1], realY, compass[0]);
    }    
    if((centeredX > 0) && (centeredY < 0))    // +x -y
    {
        latlonDlon  = CalculateDestination(LatLonMidPoint[0], LatLonMidPoint[1], realX, compass[1]);
        latlonDlat = CalculateDestination(latlonDlon[0], latlonDlon[1], realY, compass[2]);
    }
    if((centeredX < 0) && (centeredY < 0)) //-x -y
    {
        latlonDlon  = CalculateDestination(LatLonMidPoint[0], LatLonMidPoint[1], realX, compass[3]);
        latlonDlat = CalculateDestination(latlonDlon[0], latlonDlon[1], realY, compass[2]);
    }
    if((centeredX > 0) && (centeredY > 0)) //+x +y
    {
        latlonDlon = CalculateDestination(LatLonMidPoint[0], LatLonMidPoint[1], realX, compass[1]);
        latlonDlat = CalculateDestination(latlonDlon[0], latlonDlon[1], realY, compass[0]);
    }

    if((centeredX === 0) && (centeredY === 0)) // dead center
    {
        latlonDlon  = LatLonMidPoint;
        latlonDlat = LatLonMidPoint;
    }
    // alrighty then, create a latlon point and send it back
    const latlonDestination = [latlonDlat[0].toFixed(RoundingDecimals), latlonDlon[1].toFixed(RoundingDecimals)];
    return latlonDestination;

}

function getXYFromLatLon(lat, lon, mapData, imageWidth, imageHeight, topLeftPosition){
    onLoad(mapData);
    // console.log({imageWidth, imageHeight});
    // console.log(topLeftPosition.top);      
    const NWLat = LatLonNorthWest[0];
    const NWLng = LatLonNorthWest[1];
    const SELat = LatLonSouthEast[0];
    const SELng = LatLonSouthEast[1];

    const x = (((lon - NWLng) / (SELng - NWLng)) * imageWidth) + topLeftPosition.left;
    const y = (((NWLat - lat) / (NWLat - SELat)) * imageHeight) + topLeftPosition.top;
    return { x, y };
}
  

function CalculateTriangleFromHypotenuse(hypotenuse, betaAngle) {
    // Convert beta angle to radians
    let betaRadians = ToRadians(betaAngle);
    // Calculate length of leg A and B using trigonometric functions
    let lengthB = hypotenuse * Math.sin(betaRadians);
    let lengthA = hypotenuse * Math.cos(betaRadians);
    // Calculate angle alpha
    let alphaAngle = 90 - betaAngle; 
    // Return array with all values
    return [lengthA, lengthB, hypotenuse, betaAngle, alphaAngle];
}
function calculateTriangleFromLegs(lengthA, lengthB) {
    // Calculate length of hypotenuse using Pythagorean theorem
    let lengthHypotenuse = Math.sqrt(lengthA ** 2 + lengthB ** 2);
    // Calculate angle beta
    let betaRadians = Math.atan(lengthA / lengthB);
    let betaAngle = (betaRadians * 180) / Math.PI;
    // Calculate angle alpha
    let alphaAngle = 90 - betaAngle;
    // Return array with all values
    return [lengthA, lengthB, lengthHypotenuse, betaAngle, alphaAngle];
}
  function CalculateBearing(lat1, lon1, lat2, lon2) {
    // convert lat/lon to radians
    lat1 = ToRadians(lat1);
    lon1 = ToRadians(lon1);
    lat2 = ToRadians(lat2);
    lon2 = ToRadians(lon2);
  
    let deltaLambda = lon2 - lon1;
    let dPhi = Math.log(Math.tan(lat2/2.0+Math.PI/4.0)/Math.tan(lat1/2.0+Math.PI/4.0));
  
    if (Math.abs(deltaLambda) > Math.PI) {
      if (deltaLambda > 0.0) {
        deltaLambda = -(2.0 * Math.PI - deltaLambda);
      } else {
        deltaLambda = (2.0 * Math.PI + deltaLambda);
      }
    }
    // calculate bearing in radians
    let bearing = Math.atan2(deltaLambda, dPhi);
    // convert bearing to degrees and make sure it's positive
    bearing = (ToDegrees(bearing) + 360) % 360;
    // debug
    //let debugmessage = ["CalculateBearing; Input; Lat1","CalculateBearing; Input; Lon1","CalculateBearing; Input; Lat2","CalculateBearing; Input; Lon2","CalculateBearing; Output; Bearing"];
    //let debugvalues = [lat1, lon1, lat2, lon2, bearing];
    //SystemDebug(debugmessage, debugvalues);
    return bearing;
  }
  
function CalculateDistance(lat1,lon1,lat2,lon2){

    // convert to radians
    const phi1 = ToRadians(lat1);
    const phi2 = ToRadians(lat2);
    const deltaPhi = ToRadians((lat2 - lat1));
    const deltaLambda = ToRadians((lon2 - lon1));
      
    const a = Math.sin(deltaPhi / 2) ** 2
            + Math.cos(phi1) * Math.cos(phi2)
            * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Radius * c;

    // debug stuff
    let debugmessage = ["CalculateDistance; Input; Lat1","CalculateDistance; Input; Lon1","CalculateDistance; Input; Lat2","CalculateDistance; Input; Lon2",
                    "CalculateDistance; Output; Distance"];
    let debugvalues = [lat1,lon1,lat2,lon2,distance];
    SystemDebug(debugmessage,debugvalues);

    return distance;
}

function CalculateDestination(lat1, lon1, distance, bearing)
{
    // commented values are achieved when inputs are:
    // let latlon = CalculateDestination(50.664001, 14.665833, 1000, 35)
    const lat1Radians = ToRadians(lat1); // 0.884863026166094
    const lon1Radians = ToRadians(lon1); // 0.2559699262718819
    const bearingRadians = ToRadians(bearing); // 0.6108652381980153
    const dR = distance / Radius; // 0.0001569880806451613
    const lat2 = Math.asin(Math.sin(lat1Radians) * Math.cos(dR) + Math.cos(lat1Radians) * Math.sin(dR) * Math.cos(bearingRadians)); // 0.8848749385940086
    const lon2 = lon1Radians + Math.atan2(Math.sin(bearingRadians) * Math.sin(dR) * Math.cos(lat1Radians), Math.cos(dR) - Math.sin(lat1Radians) * Math.sin(lat2)); // 0.2559777519360667
    const lat2Degrees = ToDegrees(lat2);  // 50.6640011262601
    const lon2Degrees = ToDegrees(lon2);; // 14.665832972723158

    console.log("lat1Radians:"+ lat1Radians);
    console.log("lon1Radians:"+ lon1Radians);
    console.log("bearingradians:"+ bearingRadians);
    console.log("dR:"+ dR);
    console.log("lat2:"+ lat2);
    console.log("lon2:"+ lon2);
    console.log("lat2degrees:"+lat2Degrees);
    console.log("lon2degrees"+ lon2Degrees);

    return [lat2Degrees, lon2Degrees];
}
function CalculateMidpoint(lat1,lon1,lat2,lon2)
{
    //Compass = true;
    // chatgpt generated (partially)
    let x1 = ToRadians(lat1);
    let x2 = ToRadians(lat2);
    let dx = ToRadians((lat2 - lat1));
    let dy = ToRadians((lon2 - lon1));
  
    let Bx = Math.cos(x2) * Math.cos(dy);
    let By = Math.cos(x2) * Math.sin(dy);
  
    let x3 = Math.atan2(Math.sin(x1) + Math.sin(x2),
                        Math.sqrt((Math.cos(x1) + Bx) * (Math.cos(x1) + Bx) + By * By));
    let y3 = lon1 + Math.atan2(By, Math.cos(x1) + Bx);
  //fix this function
    let lat3 = ToDegrees(x3);
    let lon3 = ToDegrees(y3);

   // if(Compass = false)
   // {
        //The longitude can be normalised to −180…+180 using (lon+540)%360-180
    //    lon3  =(lon3 +540)%360-180;
   // }
    // create an array
    let midpoint = [lat3.toFixed(RoundingDecimals),lon3.toFixed(RoundingDecimals)];
    // debug messages
    //let debugmessage =[ "CalulateMidpoint; Input: Lat1","CalulateMidpoint; Input: Lon1","CalulateMidpoint; Input: Lat2",
    //                    "CalulateMidpoint; Input: Lon2","CalulateMidpoint; Input: Compass"];
    //let debugvalues = [lat1, lon1, lat2, lon2, Compass];
    //SystemDebug(debugmessage,debugvalues);

    return midpoint;
}

// convert degrees to radians, cauz.. we need that
function ToRadians(degrees)
{
    let radians = degrees * Math.PI / 180;
    // radians = Number(radians.toFixed(RoundingDecimals));
    // debug values
    //let debugmessage = ["ToRadians; Input; degrees","ToRadians; Output; radians"]
    //let debugvalues = [degrees,radians];
    //SystemDebug(debugmessage,debugvalues);

    return radians;
}
// convert radians to degrees, cauz.. we need that
function ToDegrees(radians)
{
    let degrees = radians * 180 / Math.PI;
    // debug stuff
    //let debugmessage = ["ToDegrees; Input; radians","ToDegrees; Output; degrees"]
    //let debugvalues = [radians,degrees];
    //SystemDebug(debugmessage,debugvalues);

    return degrees;
  }
// This function takes a rotation angle in degrees and returns an array of adjusted bearings in degrees.
function ToAdjustedCompass() {
    // Check if the input value is within the valid range (-180 to 180 degrees)
    if (Rotation < -180 || Rotation > 180) {
      // If the input is out of range, return an error message
      return "Error: Rotation angle must be between -180 and 180 degrees";
    }
  
    // Convert the rotation angle from degrees to radians
    var radians = ToRadians(Rotation);
  
    // Calculate the adjusted bearings (relative to north)
    var north = (0 + radians) % (2 * Math.PI);   // Calculate the bearing when facing north
    var east = (Math.PI / 2 + radians) % (2 * Math.PI);  // Calculate the bearing when facing east
    var south = (Math.PI + radians) % (2 * Math.PI);  // Calculate the bearing when facing south
    var west = (3 * Math.PI / 2 + radians) % (2 * Math.PI);  // Calculate the bearing when facing west
  
    // Convert the adjusted bearings from radians to degrees
    north = ToDegrees(north);
    east  = ToDegrees(east);
    south = ToDegrees(south);
    west  = ToDegrees(west);
  
    // Return an array with the adjusted bearings
    return [north, east, south, west];
  }

const contextData = 
{
    getXYFromLatLon:getXYFromLatLon,
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