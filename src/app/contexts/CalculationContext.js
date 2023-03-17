import React, {createContext, useContext} from 'react';
import { message } from 'antd';
import { DebugContext } from './DebugContext';

export const CalculationContext = createContext({});
export default function CalculationContextProvider({ children }) {
const {SystemDebug} = useContext(DebugContext);

const Debug = 1;       // debug mode, 1 is on, 0 is off
const RoundingDecimals = 6; // round to x decimals

const HtmlSources =["https://www.movable-type.co.uk/scripts/latlong.html",
                    "https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php",
                    "https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees",
                    "https://developers.google.com/kml/documentation/kmlreference#groundoverlay",
                    "https://www.omnicalculator.com/math/right-triangle-side-angle",
                    "https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy",
                    "https://codepen.io/pen/",
                    "https://pganssle.github.io/HaptiCap/"];


const Radius = 6371e3; //radius of planet we are on (Earth)

let LatLonNorthWest = [0,0];    // latitude Degrees, longitude Degrees
let LatLonSouthEast = [0,0];
let LatLonMidPoint  = [0,0]; 

let ImageSize = [1920,1080];    // pixels
let RealWorld = [0,0];          // real world distance Leg A and B (triangle)
let Scales    = [1,1];          // Scale from pixels to meters (0/A width, 1/B Height)

let Rotation = [0,0];           // Rotation is in DecimalDegrees / Radians
let MapSouth = 0;               // the map south is a bearing (degrees)  based on the rotation value.

function getSources() // function that reutns a array of html pages used as project sources
{
    return HtmlSources;
}

function getGlobals() // function returns the global values, should not be needed other then a debug-ish type call
{
    let output = [  Radius,
                    LatLonNorthWest[0],LatLonNorthWest[1],
                    LatLonSouthEast[0],LatLonSouthEast[1],
                    LatLonMidPoint[0],LatLonMidPoint[1],
                    ImageSize[0], ImageSize[1],
                    RealWorld[0], RealWorld[1],
                    Scales[0],Scales[1],
                    Rotation[0],Rotation[1],
                    MapSouth];
    return output;
}



//    {   KML
//          kmlfilenaam:0 R, 
//          kaartnaam:1 R, 
//          north:2 R, 
//          south:3 R, 
//          west:4 R, 
//          east:5 R, 
//          rotation:6 R, 
//        Imgage
//          imagenaam:7R, 
//          imagewidth:8R, 
//          imageheight:9R, 
//        ID        
//          id:10R/C?,
//        DataConversion
//          realworldheight:11C, 
//          realworldwidth:12C, 
//          scaleheight:13C, 
//          scalewidth:14C,
//    });


/* when using North, West, South, East
let North = 50.656633;  // Latitude
let West  = 14.657694;  // Longitude  
let South = 50.629909;  // Latitude
let East  = 14.717431;  // Longitude
let Rotation = 0.3858;  // Rotation in Decimal Degrees

triangle legs should aproximate
A           2971 M
B           4211 M
Hypotoneuse 5248.246354 M
Angle Alpha 35.2
Angle Beta  54.8

*/

function OnLoad(north, west, south, east, rotation, imageHeight, imageWidth) // theese are inputs from kml//json file
{
    try
    {
        // okay, set the latitude/longitude points up for use
        CalculateMapPoints(north, west, south, east);
        // setup the map south for usage
        CalculateMapSouth(rotation);
        // Setup Rotation in Degrees and Radians
        Rotation[0] = rotation;
        Rotation[1] = ConvertDDToRadians(rotation);
        // setup the image width/height array
        ImageSize[0] = imageWidth;
        ImageSize[1] = imageHeight;
        // calculate real world hypotenuse
        let RealWorldHypotenuse = CalculateDistance(north, west, south, east);
        // calculate inner angle beta
        let angleBeta = MapSouth - CalculateBearing(LatLonNorthWest[0],LatLonNorthWest[1],LatLonSouthEast[0],LatLonSouthEast[1]);
        // calculate real world legs A and B
        let temp = CalculateTriangle(RealWorldHypotenuse,angleBeta);
        RealWorld[0] = temp[0];
        RealWorld[1] = temp[1];
        // scale real world legs to pixels 
        Scales[0] = RealWorld[0] / ImageSize[0];
        Scales[1] = RealWorld[1] / ImageSize[1];
        // TODO debug stuff



        return 0;
    }
    catch(exception)
    {
        console.log("the function OnLoad failed with an exception.");
        console.log(exception);
        return 1;
    }
}


function CalculateMapSouth(rotation) //Rotation is in Decimal Degrees
{
    let degrees = parseFloat(rotation);
    let offsetFromNorth = (360 - degrees) % 360;
    let offsetFromSouth = (offsetFromNorth + 180) % 360;
    offsetFromSouth.toFixed(2);

    let debugmessage = ["CalculateMapSouth; Input","CalculateMapSouth; Output"];
    let debugvalues = [rotation,offsetFromSouth];
    SystemDebug(debugmessage, debugvalues);

    MapSouth = offsetFromSouth;
}
function CalculateMapPoints(North, West, South, East)  //Nort West South East are in degrees
{
    // function to set the global variables (no return)
    LatLonNorthWest[0] = North;
    LatLonNorthWest[1] = West;
 
    LatLonSouthEast[0] = South;
    LatLonSouthEast[1] = East;

    // use the midpoint function to determine the middle of the map
    LatLonMidPoint = CalculateMidpoint(North, West, South, East);
  
    // todo add debug stuff
}


// function to find and return the coordinates (x/y/) 
//where one clicked on the image.
// if html is set to true, return html string
function CalculateImageCoords(event, html) {
    try{
        let x = event.clientX;
        let y = event.clientY;
        let coordinates = [x,y];

        //debug("CalculateImageCoords; Input: " + event);
        //debug("CalculateImageCoords; Output: X:" + x + " Y:" + y);
        
        // incase the boolean html is set, output the text to the html element
        // <p id="ClickedCoordinates">Coordinates:</p>
        if(html == true)
        {
            document.getElementById("ClickedCoordinates").innerHTML = "Coordinates X:" + x + " Y:" + y;
        }

        // do magic to change the x/y coords into lat/lon
        return coordinates; 
    }
    catch(exception){
        
        let error = [-99,-99]; // set values to -99 as to denote an error but not return a null value

        //debug("CalculateImageCoords; " + exception);
        //debug("CalculateImageCoords; Input: " + event);
        //debug("CalculateImageCoords; Output: ERROR - X:-99 Y:-99");

        return error;
    }
  }


// Distance
// This uses the ‘haversine’ formula to calculate the great-circle distance between two points – 
// that is, the shortest distance over the earth’s surface – giving an ‘as-the-crow-flies’ distance 
// between the points (ignoring any hills they fly over, of course!).
function CalculateDistance(lat1,lon1,lat2,lon2){
    let debugmessage;
    let debugvalues;
    // lat lon are given in degrees, convert back to radians
    
    let phi1 = lat1 * Math.PI/180; 
    let phi2 = lat2 * Math.PI/180;
    let deltaphi = (lat2-lat1) * Math.PI/180;
    let deltalambda = (lon2-lon1) * Math.PI/180;

    let a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let distance = Radius * c; // in metres
    distance.toFixed(RoundingDecimals);

    debugmessage = ["CalculateDistance; Input; Lat1","CalculateDistance; Input; Lon1","CalculateDistance; Input; Lat2","CalculateDistance; Input; Lon2",
                    "CalculateDistance; Output; Distance"];
    debugvalues = [lat1,lon1,lat2,lon2,distance];
    SystemDebug(debugmessage,debugvalues);

    return distance;
}

// Bearing
// In general, your current heading will vary as you follow a great circle path (orthodrome);
// the final heading will differ from the initial heading by varying degrees according to distance and latitude
// (if you were to go from say 35°N,45°E (≈ Baghdad) to 35°N,135°E (≈ Osaka), 
// you would start on a heading of 60° and end up on a heading of 120°!).
//
// This formula is for the initial bearing (sometimes referred to as forward azimuth) which if followed in a straight line 
// along a great-circle arc will take you from the start point to the end point:1
function CalculateBearing(lat1,lon1,lat2,lon2)
{
    let debugmessage;
    let debugvalues;

    let phi1 = lat1;
    let phi2 = lat2;
    let deltaLambda = lon2 - lon1;
  
    let y = Math.sin(deltaLambda) * Math.cos(phi2);
    let x = Math.cos(phi1) * Math.sin(phi2) -
            Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
    let theta = Math.atan2(y, x);
    let bearing = (theta * 180 / Math.PI + 360) % 360; // in degrees
  
    //debug stuff
    debugmessage = ["CalculateBearing; Input; Lat1","CalculateBearing; Input; Lon1","CalculateBearing; Input; Lat2","CalculateBearing; Input; Lon2","CalculateBearing; Output; Bearing"];
    debugvalues = [lat1, lon1, lat2, lon2, bearing];
    SystemDebug(debugmessage, debugvalues);

    return bearing;  // NOTE bearing is returned in DEGREES!
}

// Destination
// Given a start point and a distance d along constant bearing θ, this will calculate the destina­tion point. 
// If you maintain a constant bearing along a rhumb line, you will gradually spiral in towards one of the poles. 
function CalculateDestination(lat1,lon1,distance,bearing, convertToRadians)
{
    let debugmessage;
    let debugvalues;

    // if bearing is given in degrees, and the ConverToRaidian boolean is set to true convert it too radians
    if(convertToRadians == true ){bearing = ToRadians(bearing); }
    //NOTE BEARING MUST BE IN RADIANS!!!!
    let lat2 =  Math.asin(Math.sin(lat1) * Math.cos(distance / Radius) +
                Math.cos(lat1) * Math.sin(distance / Radius) * Math.cos(bearing));
    let lon2 =  lon1 + Math.atan2(Math.sin(bearing) * Math.sin(distance / Radius) * Math.cos(lat1),
                Math.cos(distance / Radius) - Math.sin(lat1) * Math.sin(lat2));

    // debug messages
    debugmessage = ["CalculateDestination; Input; Lat1","CalculateDestination; Input; Lon1",
                    "CalculateDestination; Input; distance","CalculateDestination; Input; bearing",
                    "CalculateDestination; Input; ConvertToRadians",
                    "CalculateDestination; Output; Lat2","CalculateDestination; Output; Lon2",];

    debugvalues = [lat1, lon1, distance, bearing, lat2, lon2];
    SystemDebug(debugmessage,debugvalues);

    let destination = [lat2,lon2];
    return destination;
}

function CalculateMidpoint(lat1,lon1,lat2,lon2, Compass)
{
    // chatgpt generated (partially)
    let x1 = lat1 * Math.PI / 180;
    let x2 = lat2 * Math.PI / 180;
    let dx = (lat2 - lat1) * Math.PI / 180;
    let dy = (lon2 - lon1) * Math.PI / 180;
  
    let Bx = Math.cos(x2) * Math.cos(dy);
    let By = Math.cos(x2) * Math.sin(dy);
  
    let x3 = Math.atan2(Math.sin(x1) + Math.sin(x2),
                          Math.sqrt((Math.cos(x1) + Bx) * (Math.cos(x1) + Bx) + By * By));
    let y3 = lon1 + Math.atan2(By, Math.cos(x1) + Bx);
  
    let lat3 = x3 * 180 / Math.PI;
    let lon3 = y3 * 180 / Math.PI;

    if(Compass = false)
    {
        //The longitude can be normalised to −180…+180 using (lon+540)%360-180
        lon3  =(lon3 +540)%360-180;
    }
    // create an array
    let midpoint = [lat3.toFixed(RoundingDecimals),lon3.toFixed(RoundingDecimals)];
    // debug messages
    let debugmessage =[ "CalulateMidpoint; Input: Lat1","CalulateMidpoint; Input: Lon1","CalulateMidpoint; Input: Lat2",
                        "CalulateMidpoint; Input: Lon2","CalulateMidpoint; Input: Compass"];
    let debugvalues = [lat1, lon1, lat2, lon2, Compass];
    SystemDebug(debugmessage,debugvalues);

    return midpoint;
}


// convert decimal degrees to radians, cauz.. we need that
function ToRadians(degrees)
{
    let debugmessage;
    let debugvalues;

    let radians = (degrees* Math.PI)/ 180;
    radians = Number(radians.toFixed(RoundingDecimals));
    // debug values
    debugmessage = ["ConvertToRadians; Input; DD","ConvertToRadians; Output; radians"]
    debugvalues = [degrees,radians];
    SystemDebug(debugmessage,debugvalues);

    return radians;
}


function CalculateTriangle(hypotenuse, betaAngle) {
    let debugmessage;
    let debugvalues;

    // Convert beta angle to radians
    let betaRadians = (betaAngle * Math.PI) / 180;
    // Calculate length of leg A and B using trigonometric functions
    let lengthA = hypotenuse * Math.sin(betaRadians);
    let lengthB = hypotenuse * Math.cos(betaRadians);
    // Calculate angle alpha
    let alphaAngle = 90 - betaAngle;

    // debug stuff
    debugmessage = ["CalculateTriangle; Input; Hypotenuse","CalculateTriangle; Input; betaAngle", 
                    "CalculateTriangle; Output; lengthA", "CalculateTriangle; Output; lengthB", "CalculateTriangle; Output; Hypotenuse", 
                    "CalculateTriangle; Output; betaAngle", "CalculateTriangle; Output; alphaAngle"]
    debugvalues = [hypotenuse, betaAngle, lengthA, lengthB, hypotenuse, betaAngle, alphaAngle];
    SystemDebug(debugmessage,debugvalues);
   
    // Return array with all values
    return [lengthA, lengthB, hypotenuse, betaAngle, alphaAngle];
}

function calculateTriangleFromLegs(lengthA, lengthB) {
    let debugmessage;
    let debugvalues;

    // Calculate length of hypotenuse using Pythagorean theorem
    let lengthHypotenuse = Math.sqrt(lengthA ** 2 + lengthB ** 2);
    // Calculate angle beta
    let betaRadians = Math.atan(lengthA / lengthB);
    let betaAngle = (betaRadians * 180) / Math.PI;
    // Calculate angle alpha
    let alphaAngle = 90 - betaAngle;

    // debugging
    debugmessage = ["CalculateTriangleFromLegs; Input; lengthA","CalculateTriangleFromLegs; Input; lengthB", 
                    "CalculateTriangleFromLegs; Output; lengthA", "CalculateTriangleFromLegs; Output; lengthB", 
                    "CalculateTriangleFromLegs; Output; lengthHypotenuse", "CalculateTriangleFromLegs; Output; betaAngle", 
                    "CalculateTriangleFromLegs; Output; alphaAngle"]
    debugvalues = [lengthA,lengthB,lengthA, lengthB, lengthHypotenuse, betaAngle, alphaAngle];
    SystemDebug(debugmessage,debugvalues);

    // Return array with all values
    return [lengthA, lengthB, lengthHypotenuse, betaAngle, alphaAngle];
}

function ConvertDDToRadians(DD)
{
    let radians = (DD* Math.PI)/ 180;
    radians = Number(radians.toFixed(RoundingDecimals));
    return radians;
}

const contextData = 
{
    
    OnLoad:OnLoad,
    //CalculateDistance:CalculateDistance,
    //CalculateDestination:CalculateDestination,
    //CalculateMidpoint:CalculateMidpoint,
    //CalculateBearing:CalculateBearing,
    //ConvertDMSToDD:ConvertDMSToDD,
    //ConvertDDToDMS:ConvertDDToDMS,
    //CalculateTriangleHypotoneuse:CalculateTriangleHypotoneuse,
    //CalculateTriangleLegs:CalculateTriangleLegs,
}

return (
    <CalculationContext.Provider value={contextData}>
        {children}
    </CalculationContext.Provider>
);
}


/*
function ConvertDDToDMS(DD)
{
    //Source: https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php
    // How to Convert Decimal Degrees to DMS
    // Follow these steps to convert decimal degrees to DMS:
    // For the degrees use the whole number part of the decimal
    // For the minutes multiply the remaining decimal by 60. Use the whole number part of the answer as minutes.
    // For the seconds multiply the new remaining decimal by 60
    
    //156.742
    //0.742*60 = 44.52
    //0.52*60 = 31.2

    // D 156
    // M 44
    // S 31 
    
    const D = Math.floor(DD);
    let temp1 = 60 * (DD - D);
    const M = Math.floor(temp1);
    const S = Math.round(60 *(temp1 - M));

    debug("ConvertDDToDMS; Input: DD " + DD);
    debug("ConvertDDtoDMS; Output: Degrees " + D.toFixed(RoundingDecimals) + " Minutes " + M.toFixed(RoundingDecimals) + " Seconds " + S.toFixed(RoundingDecimals));

    let DMS = [D.toFixed(RoundingDecimals),M.toFixed(RoundingDecimals),S.toFixed(RoundingDecimals)];
    return DMS;
}
function ConvertDMSToDD(D,M,S)
{
    //Source: https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees
    const DD  = D + (M/60) + (S/3600);

    debug("ConvertDDtoDMS; Input: Degrees " + D + " Minutes " + M + " Seconds " + S);
    debug("ConvertDDtoDMS; Output: DD " + DD.toFixed(RoundingDecimals));

    return DD.toFixed(RoundingDecimals);
}*/
// Midpoint
// This is the half-way point along a great circle path between the two points.

/*
function CalculateMidpoint(lat1,lon2,lat2,lon2, Compass)
{
    const Bx = Math.cos(lat2) * Math.cos(lon2-lon2);
   const By = Math.cos(lat2) * Math.sin(lon2-lon2);
    const φ3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
               Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By ) );
    const λ3 = lon2 + Math.atan2(By, Math.cos(lat1) + Bx);

    if(Compass = false)
    {
        //The longitude can be normalised to −180…+180 using (lon+540)%360-180
        λ3  =(λ3 +540)%360-180;
    }

    let midpoint = [φ3.toFixed(RoundingDecimals),λ3.toFixed(RoundingDecimals)];
    debug("CalculateMidpoint; Input: Latitude1 " + lat1 + " Longitude 1 " +lon2);
    debug("CalculateMidpoint; Input: Latitude2 " + lat2 + " Longitude 2 " +lon2);
    debug("CalculateMidpoint; Input: Compass " + Compass);
    debug("CalculateMidpoint; Output: Latitude " + φ3 + " Longitude " + λ3 );
    return midpoint;
}

  // convert decimal degrees to radians, cauz.. we might need that
function ConvertDDToRadians(DD)
{
    let radians = (DD* Math.PI)/ 180;
    radians = Number(radians.toFixed(RoundingDecimals));
    return radians;
}

*/