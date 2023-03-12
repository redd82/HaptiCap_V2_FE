import React, {createContext} from 'react';
import axios from 'axios';
import { message } from 'antd';

export const CalculationContext = createContext({});
export default function CalculationContextProvider({ children }) {

const Debug = 1;       // debug mode, 1 is on, 0 is off
const RoundingDecimals = 6; // round to x decimals

// HTML Sources

//Source: https://www.movable-type.co.uk/scripts/latlong.html
//Source: https://www.calculatorsoup.com/calculators/conversions/convert-decimal-degrees-to-degrees-minutes-seconds.php
//Source: https://www.latlong.net/degrees-minutes-seconds-to-decimal-degrees
//Source: https://developers.google.com/kml/documentation/kmlreference#groundoverlay
//Source: https://www.omnicalculator.com/math/right-triangle-side-angle
//Source: https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_event_mouse_clientxy


// where:
//          φ is latitude, 
//          λ is longitude,
//          Radius is earth’s radius (mean radius = 6,371km);
//
// note that angles need to be in radians to pass to trig functions!

// variables needed for calculations
let Radius = 6371e3; //radius of planet Earth

let North = 50.656633;  // Latitude
let West  = 14.657694;  // Longitude  
let South = 50.629909;  // Latitude
let East  = 14.717431;  // Longitude
let Rotation = 0.3858;  // Rotation in Decimal Degrees

let ScaleHeight = 1; // scale of pixel to meter; default, one pixel height is one meter
let ScaleWidth = 1;  // scale of pixel to meter; default, one pixel width  is one meter
let MapSouth = 180;  // asume the map north is equal to the true north

// debug function; logs to console, input/output to/from functions if global debug has been set to 1
function debug(message)
{
    if(Debug == 1){console.log(message);}
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
Hypotoneuse 5154 M
Angle Alpha 35.2
Angle Beta  54.8

*/
function ReturnGlobals()
{
    let output = [  Radius,North, West, South, East, Rotation,
                    ScaleHeight, ScaleWidth, MapSouth];
    debug("ReturnGlobals; Output: Radius:       " + output[0]);
    debug("ReturnGlobals; Output: North:        " + output[1]);
    debug("ReturnGlobals; Output: West:         " + output[2]);
    debug("ReturnGlobals; Output: South:        " + output[3]);
    debug("ReturnGlobals; Output: East:         " + output[4]);
    debug("ReturnGlobals; Output: Rotation:     " + output[5]);
    debug("ReturnGlobals; Output: ScaleHeight:  " + output[6]);
    debug("ReturnGlobals; Output: ScaleWidth:   " + output[7]);
    debug("ReturnGlobals; Output: MapSouth:     " + output[8]);

    return output;
}

function CalculateMapSouth(rotation)
{
    // calculate bearing and substract rotation to get map south
    let output = 0;
    // logic for rotation positive
    if ((rotation >= 0) && (rotation <= 180)) {output = (180 - Math.abs(rotation))%360;}
    // logic for rotation negative
    if((rotation < 0)   && (rotation <= -180)){output = (180 + Math.abs(rotation))%360;}
    debug("CalculateMapSouth; Input:  " + rotation);
    debug("CalculateMapSouth; Output: " + output);
    MapSouth = output;
}

function DataConversion(North, West, South, East, Rotation, ImageHeight, ImageWidth)
{
    // calculated values
    let RealWorldHypotoneuse = CalculateDistance(North,West,South,East);
    CalculateMapSouth(Rotation);
    let beta = Math.abs(MapSouth - CalculateBearing(North, West, South, East)[1]);
    // Calculate leg A and B length (real world longitude and latitude)
    let legs = CalculateTriangleLegs(beta, RealWorldHypotoneuse , false);
    //let legs = CalculateTriangleLegs(54.95, RealWorldHypotoneuse , false);
    // scale X = real world leg A / image height
    // scale Y = real world leg b / image width
    ScaleHeight = Math.abs(legs[0] / ImageHeight);
    ScaleWidth  = Math.abs(legs[1] / ImageWidth);
    let output = [legs[0], legs[1], ScaleHeight, ScaleWidth];
    // debug messages
    debug("DataConversion; input: North:" + North + " West:" + West+ " South:" + South + " East:" + East);
    debug("DataConversion; input: Rotation:" + Rotation + " ImageHeight:" + ImageHeight + " ImageWidth:" + ImageWidth);
    debug("DataConversion; output: ScaleHeight:" + ScaleHeight + " ScaleWidth:" + ScaleWidth + " MapSouth:"+ MapSouth);
    debug("DataConversion; internal Values: Realworld Leg A:" + legs[0] + " Realworld Leg B:" + legs[1] );
    debug("DataConversion; internal Values: β:" + beta + " RealWorldHypotoneuse:" + RealWorldHypotoneuse);
    return output;
}

// function to find and return the coordinates (x/y/) 
//where one clicked on the image.
// if html is set to true, return html string
function CalculateImageCoords(event, html) {
    try{
        let x = event.clientX;
        let y = event.clientY;
        let coordinates = [x,y];
        debug("CalculateImageCoords; Input: " + event);
        debug("CalculateImageCoords; Output: X:" + x + " Y:" + y);
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
        debug("CalculateImageCoords; " + exception);
        debug("CalculateImageCoords; Input: " + event);
        debug("CalculateImageCoords; Output: ERROR - X:-99 Y:-99");
        return error;
    }
  }


// Distance
// This uses the ‘haversine’ formula to calculate the great-circle distance between two points – 
// that is, the shortest distance over the earth’s surface – giving an ‘as-the-crow-flies’ distance 
// between the points (ignoring any hills they fly over, of course!).
function CalculateDistance(lat1,lon1,lat2,lon2){

    let phi1 = lat1 * Math.PI/180; // φ, λ in radians
    let phi2 = lat2 * Math.PI/180;
    let deltaphi = (lat2-lat1) * Math.PI/180;
    let deltalambda = (lon2-lon1) * Math.PI/180;

    let a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    let distance = Radius * c; // in metres
    distance.toFixed(RoundingDecimals);

    debug("CalculateBearing; Input: Latitude1 " + lat1 + " Longitude 1 " + lon1);
    debug("CalculateBearing; Input: Latitude2 " + lat2 + " Longitude 2 " + lon2);
    debug("CalculateBearing; Output: Distance " + distance);
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
    let y = Math.sin(lon2-lon1) * Math.cos(lat2);
    let x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
    //let z = Math.atan2(y, x);  // in 180/-180 degrees
    let bearing = [0,0];

    bearing[0] = (Math.atan2(y, x)).toFixed(RoundingDecimals);
    bearing[1] = ((Math.atan2(y, x)*180/Math.PI + 360) % 360).toFixed(RoundingDecimals);

    debug("CalculateBearing; Input: Latitude1 " + lat1 + " Longitude 1 " +lon1);
    debug("CalculateBearing; Input: Latitude2 " + lat2 + " Longitude 2 " +lon2);
    debug("CalculateBearing; Output: 180/-180 heading:" + bearing[0]);
    debug("CalculateBearing; Output: 360 heading:" + bearing[1]);
    return bearing;
}

// Destination
// Given a start point and a distance d along constant bearing θ, this will calculate the destina­tion point. 
// If you maintain a constant bearing along a rhumb line, you will gradually spiral in towards one of the poles. 
function CalculateDestination(lat1,lon1,distance,bearing)
{
    let lat2 = Math.asin( Math.sin(lat1)*Math.cos(distance/Radius) +
                            Math.cos(lat1)*Math.sin(distance/Radius)*Math.cos(bearing) );
    let lon2 = lon1 + Math.atan2( Math.sin(bearing)*Math.sin(distance/Radius)*Math.cos(lat1),
                                    Math.cos(distance/Radius)-Math.sin(lat1)*Math.sin(lat2));
    // debug messages
    debug("CalculateDestination; Output: Latitude " + lat1 + " Longitude " + lon2);
    debug("CalculateDestination; Output: Distance " + distance  + " Bearing "+ bearing);
    debug("CalculateDestination; Output: Latitude " + lat2 + " Longitude " + lon2 );
    
    let destination = [lat2,lon2];
    return destination;
}

// A and B would usually be given in pixels, therefore scale is almost always true
// if A and B are given in meters then you do not need to scale it.
function CalculateTriangleHypotoneuse(A,B, Scale)
{
        //Source: https://www.omnicalculator.com/math/right-triangle-side-angle
        // leg A == Vertical
        // leg B == Horizontal
        // α ==  angle α/Hypotoneuse
        // β == angle β/Hypotoneuse

        if(Scale == true) // A and B are given in pixels
        {
            A = A * ScaleHeight;
            B = B * ScaleWidth;
        } //A and be have now been set in meters

        let hypotoneuse = Math.sqrt(Math.pow(A,2) + Math.pow(B,2));
        hypotoneuse = hypotoneuse.toFixed(RoundingDecimals);

        debug("CalculateTriangleHypotoneuse; Input: A " + A + " B " + B + " Scale " + Scale);
        debug("CalculateTriangleHypotoneuse; Output: hypotoneuse " + hypotoneuse);

        return hypotoneuse; // in meters
}

// of boolean 'scale' is true, then recalculate the leg lengths from pixels to meters
// input hypotoneuse is in meters, β is in degrees. 
function CalculateTriangleLegs(Beta, Hypotoneuse, Scale)
{
    let A = Hypotoneuse * Math.cos(Beta);
    let B = Hypotoneuse * Math.sin(Beta);


    if(Scale == true )
    {
        A = A * ScaleHeight;    // convert from pixels to meters
        B = B * ScaleWidth;     // convert from pixels to meters
    } // output is now in meters

    debug("CalculateTriangleLegs; Input: β " + Beta +" Hypotoneuse " + Hypotoneuse + " Scale "+ Scale );
    debug("CalculateTriangleLegs; Output: A "+ A + " B " + B );
    
    let legs = [A,B];
    //let legs = [A.toFixed(RoundingDecimals),B.toFixed(RoundingDecimals)];
    return legs;

    /* when using North, West, South, East
    let North = 50.656633;  // Latitude
    let West  = 14.657694;  // Longitude  
    let South = 50.629909;  // Latitude
    let East  = 14.717431;  // Longitude
    let Rotation = 0.3858;  // Rotation in Decimal Degrees

    triangle legs should aproximate
        A           2971 M
        B           4211 M
        Hypotoneuse 5154 M
        Angle Alpha 35.2
        Angle Beta  54.8

*/
}



const contextData = 
{
    DataConversion:DataConversion,
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