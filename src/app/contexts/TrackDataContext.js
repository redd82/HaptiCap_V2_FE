import React, {createContext, useContext, useState} from 'react';
import XMLParser from "fast-xml-parser";

export const TrackDataContext = createContext({});
export default function TrackDataContextProvider({ children }) {

const Debug = 1;
const HtmlSources =["https://developers.google.com/kml/documentation",
                    "https://www.topografix.com/gpx_manual.asp",
                    "https://luuka.github.io/GPXParser.js/",
                    "https://docs.vecturagames.com/gpxviewer/doku.php?id=docs:basics",
                    "https://www.w3schools.com/jsref/jsref_indexof.asp",
                    "https://www.w3schools.com/jsref/jsref_includes.asp"];

/*
Example KML

<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2' xmlns:gx='http://www.google.com/kml/ext/2.2' xmlns:kml='http://www.opengis.net/kml/2.2' xmlns:atom='http://www.w3.org/2005/Atom'>
<Document>
	<name>Hapticap Debug.kml</name>
	<Folder>
		<name>Hapticap Debug</name>
		<open>1</open>
		<GroundOverlay>
			<name>Hapticap Debug</name>
			<visibility>1</visibility>
			<Icon>
				<href>bw12finalmapweb.png</href>
				<viewBoundScale>0.75</viewBoundScale>
			</Icon>
			
			<LatLonBox>
					<north>50.656633</north>
					<south>50.629909</south>
					<east>14.717431</east>
					<west>14.657694</west>
					<rotation>0.3858</rotation>
			</LatLonBox>
		</GroundOverlay>
		
		<Placemark>
			<name>North West </name>
			<LookAt>
				<longitude>14.657694</longitude>
				<latitude>50.656633</latitude>
				<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>
			</LookAt>
			<Point>
				<gx:drawOrder>1</gx:drawOrder>
				<coordinates>14.657694,50.656633,0</coordinates>
			</Point>
		</Placemark>
		<Placemark>
			<name>South East </name>
			<LookAt>
				<longitude>14.717431</longitude>
				<latitude>50.629909</latitude>
				<gx:altitudeMode>relativeToSeaFloor</gx:altitudeMode>
			</LookAt>
			<Point>
				<gx:drawOrder>1</gx:drawOrder>
				<coordinates>14.717431,50.629909,0</coordinates>
			</Point>
		</Placemark>			
	</Folder>
</Document>
</kml>

step 1) Find </LatLonBox>
step 2) get data from <LatLonBox>

*/


//---------------------------------------------------------------------------------


function XmlLatLonBoxData(kmlData, debug)
{
    if(debug ==1 ){ console.log(kmlData); }
    return XmlLatLonBoxData(kmlData)
}

function XmlLatLonBoxData(kmlData)
{
    let output = [0,0,0,0,0]; // north, south, east, west, rotation
    kmlData = kmlData.toLowerCase(); // make sure kml data is all lower case so we don't get hungup on Capitols
    
    try{
        if(XmlLatLonBoxValidator(kmlData) == true) {
            // create end tags so we have a complete
            let latlonbox = CreateEndTag("<latlonbox>");
            let north =     CreateEndTag("<north>");
            let south =     CreateEndTag("<south>");
            let west =      CreateEndTag("<west>");
            let east =      CreateEndTag("<east>");
            let rotation =  CreateEndTag("<rotation>");
            // grab the data from thoose elements
            output[0] = XmlElementData(kmlData,north);
            output[1] = XmlElementData(kmlData,south);
            output[2] = XmlElementData(kmlData,east);
            output[3] = XmlElementData(kmlData,west);
            output[4] = XmlElementData(kmlData,rotation);
            return output;
        }
    }catch(e)
    { console.log("Error, some elements do not exist within the kml file, please check l=for latlonbox, north, south, west, east and rotation");}
}

function XmlTagExists(kmlData,tag){
    const tags = CreateEndTag(tag);

    if((kmlData.includes(tags[0]) == true ) && (kmlData.includes(tags[1]) == true)){
        //the start and endtag are in the kml, proceed without caution! (or with, kinda depends on who you are)
        return true;
    }
    else{ return false; }                          // no beginning, or no end :(
}

function CreateEndTag(tag) // create an endtag for a tag (so input <tag> and we create </tag> and return it in an array)
{
    console.log(tag);
    let endtag = tag.slice(1);
    endtag= "</" + endtag;
    let tags = [tag, endtag];
    return tags;
}

function XmlLatLonBoxValidator(kmlData){
    let output = 0;

    let latlonbox = "<LatLonBox>";
    let north = "<north>";
    let south = "<south>";
    let west = "<west>";
    let east = "<east>";
    let rotation = "<rotation>";

    if(XmlTagExists(kmlData,latlonbox) == true)
    {
        console.log("latlonbox");
        if(XmlTagExists(kmlData,north) == true)
        {
            console.log("north");
            if(XmlTagExists(kmlData,south) == true)
            {
                console.log("south");
                if(XmlTagExists(kmlData,west) == true)
                {
                    console.log("west");
                    if(XmlTagExists(kmlData,east) == true)
                    {
                        console.log("east");
                        if(XmlTagExists(kmlData,rotation) == true)
                        {
                            console.log("rotation");
                            // we have all 6 points!!,
                            // or.. like the yellow m&m said to santa..
                            // HE does Exist!
                            output = 1;
                        }
                    }
                }
            }
        }
    }
    return output;
}

function XmlElementData(kmlData, tags)
{
    // find the start and stop point for the substring
    const start = kmlData.indexOf(tags[0]) + tags[0].length;
    const end = kmlData.indexOf(tags[1]);
    // yank the data out of it
    const data = kmlData.substring(start, end);
    // return to me my precious... (data)
    return data;
}

const contextData = 
{
    XmlLatLonBoxData:XmlLatLonBoxData,
    //extractKMLDataFromFile:extractKMLDataFromFile,
}

return (
    <TrackDataContext.Provider value={contextData}>
        {children}
    </TrackDataContext.Provider>
);}