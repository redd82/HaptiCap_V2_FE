import React, {useContext, useEffect, useState, useRef} from 'react';
import {useForm} from 'react-hook-form';
import axios from 'axios';
import styles from '../../styles/pages/InputForm.module.css';
// import stylesContent from '../../styles/Content.module.css'
import {CommsContext} from "../../contexts/CommsContext";
import { CalculationContext } from '../../contexts/CalculationContext';
import { MapsContext } from '../../contexts/MapsContext';
import Checkbox from "../components/CheckBox";
import Button from "../components/Button";
import { message } from 'antd';
import { convertLegacyProps } from 'antd/es/button/button';
import parser from 'fast-xml-parser';
import { DebugContext } from '../../contexts/DebugContext';

export default function DebugInputForm({}) {
    const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
    const DATEFORMAT = 'yyyy-MM-dd';
    const {storeData, fetchDebugSettings, getServerHost, listFiles} = useContext(CommsContext);
    const {SystemDebug} = useContext(DebugContext);
    const {DataConversion, CalculateDistance} = useContext(CalculationContext);
    const {fetchKMLFile} = useContext(MapsContext);
    const [loading, setLoading] = useState(true);
    const {register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [readOnly, setReadOnly] = useState(true);
    const [debugSettingsData, setDebugSettingsData] = useState({});
    const [mapDataDebug, setMapDataDebug] = useState({});
    const [outputDebug,setOutputDebug] = useState([{outLegs0 : 1, outlegs1: 1, scaleHeight: 1, scaleWidth: 1}]);
    const [kmlData, setKmlData] = useState([]);
    let newFaultTemp = {};
    let debugEnabled = 1;

    async function applyChanges(){
        let serverHost = getServerHost();
            console.log(debugSettingsData);
            let json = JSON.stringify({debug2Serial: debugSettingsData.debug2Serial, debugGPS2Serial: debugSettingsData.debugGPS2Serial, debugHaptic: debugSettingsData.debugHaptic});
                console.log(json);
            try{
                const response = await axios.post(serverHost + '/settings/debug_form', json, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log(response);
                setError("");
                setSuccess("");               
                if(response.status === 200){
                    setTimeout(500);
                    setSuccess("Settings changed");
                }else{
                    setError("Error");
                }
            }   catch (e){
                setError(e.response.data.message);
                if(e.response.status >= 401) {

                }else if(e.response.status === 400){
                    setError(e.response.data.message);
                }
            }
        }

    const addObjectToArray = obj => {
        //setCarFaultList(current => [...current, obj]);
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        console.log(checkBoxValue.checked);
        if(checkBoxValue.name === 'debug2Serial') {
            setDebugSettingsData({...debugSettingsData, debug2Serial: checkBoxValue.checked});
        }
        if(checkBoxValue.name === 'debugGPS2Serial') {
            setDebugSettingsData({...debugSettingsData, debugGPS2Serial: checkBoxValue.checked});
        }
        if(checkBoxValue.name === 'debugHaptic') {
            setDebugSettingsData({...debugSettingsData, debugHaptic: checkBoxValue.checked});
        }
    };

    function setCheckboxes(){
        
    }

    function listFilesButton(){
        listFiles();
    }


    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        if (event.target.name === "Radius") {
            setMapDataDebug({...mapDataDebug, radius: value});
        }
        if (event.target.name === "North") {
            setMapDataDebug({...mapDataDebug, north: value});
        }
        if (event.target.name === "West") {
            setMapDataDebug({...mapDataDebug, west: value});
        }
        if (event.target.name === "South") {
            setMapDataDebug({...mapDataDebug, south: value});
        }
        if (event.target.name === "East") {
            setMapDataDebug({...mapDataDebug, east: value});
        }
        if (event.target.name === "Rotation") {
            setMapDataDebug({...mapDataDebug, rotation: value});
        }
        if (event.target.name === "ImageHeigt") {
            setMapDataDebug({...mapDataDebug, imageHeight: value});
        }
        if (event.target.name === "ImageWidth") {
            setMapDataDebug({...mapDataDebug, imageWidth: value});
        }
    };
    /*
        name: "Test",
        area: "Test", 
        country: "Test", 
        pngFile: "/maps/Home.png",
        pngWidth: "",
        pngHeight: "", 
        kmlFile: "",
        realWorldHeight: "",
        realWorldWidth: "",
        scaleHeight: "",
        scaleWidth:"",
        north: "50.656633",
        west: "14.657694",
        south: "50.629909",
        east: "14.717431",
        rotation: "0.3858",
        radius: ""
    */

    function runDataConversion(){
        let output = [];
        output = DataConversion(mapDataDebug.north, mapDataDebug.west, mapDataDebug.south, mapDataDebug.east, mapDataDebug.rotation, mapDataDebug.imageHeight, mapDataDebug.imageWidth);
        setOutputDebug({...outputDebug, outLegs0: output[0], outlegs1: output[1], scaleHeight: output[2], scaleWidth: output[3]});
        console.log(output);
    } 

    async function getKMLFile(){
        let fileName = "/maps/BW12.kml"
        let response = await fetchKMLFile(fileName);
        const kml = response.data;
        //putKMLDataInArray(kml);
        extractKMLData(kml);
    }

    async function extractKMLData(kml){
        //console.log(kml);
        //let response = await fetchKMLFile(fileName);
        //let kml = response.data;
        let kmlArrayData = putKMLDataInArray(kml);
        console.log(kmlArrayData);
        let latlonBox = kmlArrayData[0];
        let rotation = 0;
        console.log(latlonBox);
        if (typeof latlonBox.rotation !== 'undefined'){
            rotation = latlonBox.rotation;
        }
        setMapDataDebug({...mapDataDebug, north: latlonBox.north, west: latlonBox.west, south: latlonBox.south, east: latlonBox.east, rotation: rotation });
        console.log("setMapDataDebug");
        console.log(mapDataDebug);
        //sendMapInfo("update");
    }

    function putKMLDataInArray(kmlData){
        const parser = new XMLParser();
        const options = {
            attributeNamePrefix: '',
            ignoreAttributes: false,
            ignoreNameSpace: false,
            parseNodeValue: true,
            parseAttributeValue: true,
            trimValues: true
        };

        const result = parser.parse(kmlData, options);
        console.log(result);
        let latLonBox = result.kml.Document.Folder.GroundOverlay.LatLonBox;
        let href = result.kml.Document.Folder.GroundOverlay.Icon.href;
        console.log(latLonBox.rotation);
        console.log(latLonBox);
        console.log(href);
        return [latLonBox, href];
    };

    useEffect( () => {
        fetchDebugSettings().then(r => {
            setDebugSettingsData(r);
            setCheckboxes(r);
        });
        setLoading(false);
    }, []);

    if(loading){
        return <div className={styles['loading-text']}>Loading Data... Please Wait...</div>
    }

    return (
        <form className={styles['info-form']}>
                <label className={styles['info-label']} htmlFor="debug2Serial">Serial</label>
                <Checkbox id='1' parentCallback={handleCheckBoxChange} disabled={false} name="debug2Serial" labelname="" defaultChecked={debugSettingsData.debug2Serial}/>
                <label className={styles['info-label']} htmlFor="debugGPS2Serial">GPS2Serial</label>  
                <Checkbox id='2' parentCallback={handleCheckBoxChange} disabled={false} name="debugGPS2Serial" labelname="" defaultChecked={debugSettingsData.debugGPS2Serial}/>
                <label className={styles['info-label']} htmlFor="debugHaptic">Haptic</label> 
                <Checkbox id='3' parentCallback={handleCheckBoxChange} disabled={false} name="debugHaptic" labelname="" defaultChecked={debugSettingsData.debugHaptic}/>
                <label className={styles['info-label']} htmlFor="fileList">Files:</label>
                <button className={styles['apply-button']} onClick={listFilesButton} type="button"> List files </button>
                <button className={styles['apply-button']} onClick={applyChanges} type="button"> Apply Changes </button>
            <div className={styles['empty-grid-space-4']}/>
            <div className={styles['error-message']}>
                {(error !== "") ? (
                    <div className={styles['error']}>{error}</div>
                ) : ((success !== "") ? (
                    <div className={styles['success']}>{success}</div>
                ) : (
                    <div className={styles['no-error']}></div>
                    )
                )}
            </div>
            
            <h3>Debugging input fields for testing functions</h3>
            {/* const Radius = 6371e3; //radius of planet Earth
                const North = 50.656633;  // Latitude
                const West  = 14.657694;  // Longitude  
                const South = 50.629909;  // Latitude
                const East  = 14.717431;  // Longitude
                const Rotation = 0.3858;  // Rotation in Decimal Degrees

                const ScaleHeight = 1; // scale of pixel to meter; default, one pixel height is one meter
                const ScaleWidth = 1;  // scale of pixel to meter; default, one pixel width  is one meter
                const MapSouth = 180;  // asume the map north is equal to the true north
                id: 1,
                name: "Test",
                area: "Test", 
                country: "Test", 
                pngFile: "/maps/Home.png",
                pngWidth: "",
                pngHeight: "", 
                kmlFile: "",
                realWorldHeight: "",
                realWorldWidth: "",
                scaleHeight: "",
                scaleWidth:"",
                north: 50.656633,
                west: 14.657694,
                south: 50.629909,
                east: 14.717431,
                rotation: 0.3858
                
                */}
            <br/>
                <label className={styles['info-label']} htmlFor="Radius">Radius (m)</label>
                <input className={styles['info-input']} name="Radius" type="text" id="Radius" defaultValue={mapDataDebug.radius} onChange={handleInputUpdate} />           
                
                <label className={styles['info-label']} htmlFor="North">North</label>
                <input className={styles['info-input']} name="North" type="text" id="North" defaultValue={mapDataDebug.north} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="West">West</label>
                <input className={styles['info-input']} name="West" type="text" id="West" defaultValue={mapDataDebug.west} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="South">South</label>
                <input className={styles['info-input']} name="South" type="text" id="South" defaultValue={mapDataDebug.south} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="East">East</label>
                <input className={styles['info-input']} name="East" type="text" id="East" defaultValue={mapDataDebug.east} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="Rotation">Rotation</label>
                <input className={styles['info-input']} name="Rotation" type="text" id="Rotation" defaultValue={mapDataDebug.rotation} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="ImageHeigt">ImageHeigt</label>
                <input className={styles['info-input']} name="ImageHeigt" type="text" id="ImageHeigt" defaultValue={mapDataDebug.imageHeight} onChange={handleInputUpdate} />  

                <label className={styles['info-label']} htmlFor="ImageWidth">ImageWidth</label>
                <input className={styles['info-input']} name="ImageWidth" type="text" id="ImageWidth" defaultValue={mapDataDebug.imageWidth} onChange={handleInputUpdate} />  

                {/* <label className={styles['info-label']} htmlFor="MapSouth">MapSouth</label>
                <input className={styles['info-input']} name="MapSouth" type="text" id="MapSouth" defaultValue={mapDataDebug.} onChange={handleInputUpdate} />   */}
                <h4>Output</h4>
                <div className={styles['empty-grid-space-1']}/>
                <label className={styles['info-label']} htmlFor="Legs0">Legs[0]</label>
                <label className={styles['valueRO']} htmlFor="Legs0">{outputDebug.outLegs0}</label>
                
                <label className={styles['info-label']} htmlFor="Legs1">Legs[1]</label>
                <label className={styles['valueRO']} htmlFor="Legs1">{outputDebug.outlegs1}</label>

                <label className={styles['info-label']} htmlFor="ScaleHeight">ScaleHeight</label>
                <label className={styles['valueRO']} htmlFor="ScaleHeight">{outputDebug.scaleHeight}</label>

                <label className={styles['info-label']} htmlFor="ScaleWidth">ScaleWidth</label>
                <label className={styles['valueRO']} htmlFor="ScaleWidth">{outputDebug.scaleWidth}</label>
                <button className={styles['apply-button']} onClick={runDataConversion} type="button"> Calculate </button>
                <button className={styles['apply-button']} onClick={getKMLFile} type="button"> Get KML File </button>
                    {/* //let output = [legs[0], legs[1], ScaleHeight, ScaleWidth]; */}
        </form>
    );
}