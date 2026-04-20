import React, {useContext, useEffect, useState} from 'react';

import {useNavigate} from "react-router-dom";
import axios from 'axios';
import {FilePicker} from 'react-file-picker';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {CommsContext} from "../../contexts/CommsContext";
import { StoreContext } from '../../contexts/StoreContext';
import { MapsContext } from '../../contexts/MapsContext';

const DEFAULT_MAP_DATA = {
    id: '',
    name: '',
    country: '',
    area: '',
    pngFile: '',
    imageWidth: '',
    imageHeight: '',
    kmlFile: '',
    realWorldHeight: '',
    realWorldWidth: '',
    scaleHeight: '',
    scaleWidth: '',
    north: '',
    west: '',
    south: '',
    east: '',
    rotation: '',
    radius: 6371000,
};

export default function MapInputForm({map, newMap}) {
    const { XMLParser } = require("fast-xml-parser");
    const navigate = useNavigate();
    const {getServerHost} = useContext(CommsContext);
    const {fetchKMLFile, requestMap, sendMapInfoToESP} = useContext(MapsContext);
    const {setHomeToUseMap} = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editMap, setEditMap] = useState(newMap);
    const [mapData, setMapData] = useState(map || DEFAULT_MAP_DATA);
    const [pngUploaded, setPngUploaded] = useState(false);
    const [kmlUploaded, setKmlUploaded] = useState(false);
    const [useMap, setUseMap] = useState (false);
    let maxFileSize = 1.7;

    async function uploadMapFile(fileToUpload) {
        setError("");
        let serverHost = getServerHost();
        let formData = new FormData();
        if(checkFields(fileToUpload)){
            formData.append('file', fileToUpload);
            console.log(fileToUpload);
            console.log(formData);
            try {
                setSuccess("Uploading file....");
                setLoading(true);
                const response = await axios.post(serverHost + '/upload-file', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                });
                console.log(response);
                return [fileToUpload, response];
            } catch (e) {
                setError(e.response.data.message);
                if (e.response.status >= 401) {
                } else if (e.response.status === 400) {
                    setError(e.response.data.message);
                }
            }
        }else{
            setError("Check missing input.");
        }
    }

    async function processFileData(fileToUpload, uploadResponse){
        let serverHost = getServerHost();
        console.log(fileToUpload.name);
        let fileType = fileToUpload.type;
        if(uploadResponse.data === "Wrong filetype."){
            setError("Upload failed.");
            setLoading(false);
        } else {
            switch (fileType.toLowerCase()) {
                case "image/png" :
                    const response = await axios.get(serverHost + "/maps/" + fileToUpload.name , { responseType: 'blob' });
                    console.log(response);
                    const blob = response.data;
                    const image = new Image();
                    image.src = URL.createObjectURL(blob);
                    image.onload = function() {
                        setMapData({...mapData, pngFile: fileToUpload.name, imageHeight: this.height, imageWidth: this.width});
                    }
                    console.log(fileToUpload.name);
                    console.log("png uploaded");
                    setPngUploaded(true);
                    setSuccess("PNG File uploaded.");
                    setLoading(false);
                    break;
                case "application/vnd.google-earth.kml+xml" :
                    console.log("kml uploaded");
                    let kmlDataArray = await extractKMLData("/maps/" + fileToUpload.name);
                    console.log(kmlDataArray);
                    setMapData({...mapData, kmlFile: fileToUpload.name, north: kmlDataArray[0].north, west: kmlDataArray[0].west, south: kmlDataArray[0].south, east: kmlDataArray[0].east, rotation: kmlDataArray[0].rotation });
                    setKmlUploaded(true);
                    setSuccess("KML File uploaded.");
                    setLoading(false);
                    break;
                default :
                    setSuccess("");
                    setLoading(false);
                    setError("Wrong filetype upload.");
                    break;
            }
        }
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
        const latLonBox = result.kml.Document.Folder.GroundOverlay.LatLonBox;

        const waypoints = result.kml.Document.Folder.Folder.Placemark;
        
        return [latLonBox, waypoints];
    };

    async function extractKMLData(fileName){
        let response = await fetchKMLFile(fileName);
        console.log(response);
        let kml = response.data;
        let kmlDataArray = putKMLDataInArray(kml);
        console.log(kmlDataArray);
        console.log(kmlDataArray[0]);
        return kmlDataArray;
    }

    async function sendMapInfo(type){
        console.log(mapData);
        let json = JSON.stringify({id: mapData.id, name: mapData.name, country: mapData.country, area: mapData.area, pngFile: mapData.pngFile, imageWidth: mapData.imageWidth, imageHeight: mapData.imageHeight,
                                    kmlFile: mapData.kmlFile, realWorldHeight: mapData.realWorldHeight, realWorldWidth: mapData.realWorldWidth, scaleHeight: mapData.scaleHeight, scaleWidth: mapData.scaleWidth,
                                    north: mapData.north, west: mapData.west, south: mapData.south, east: mapData.east, rotation: mapData.rotation, radius: mapData.radius});
        return await sendMapInfoToESP(json,type);
    }

    async function clearMap(){
        const serverHost = getServerHost();
        setMapData({...mapData, id: mapData.id, name: "Click here to add map", country: "NoMap", area: "NoMap", pngFile: "NoMap.png", kmlFile: "NoMap.kml", radius: 63713000});
        let json = JSON.stringify({id: mapData.id, name: "Click here to add map", country: "NoMap", area: "NoMap", pngFile: mapData.pngFile, kmlFile: mapData.kmlFile, radius: mapData.radius});
        console.log(json);
        try{
            await axios.post(serverHost + '/navigation/clear-map', json, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setError("");
            setSuccess("");               
            setTimeout(500);
            setSuccess("Map clear sent.");
            setError("");
        }   catch (e){
            setError(e.response.data.message);
            if(e.response.status >= 401) {

            }else if(e.response.status === 400){
                setError(e.response.data.message);
            }
        }
    }

    function editSelectedMap(){
        setEditMap(true);
    }

    async function saveChangesSelectedMap(){
        setEditMap(false);
        const response = await sendMapInfo("update");
        console.log(response[0]);
        setSuccess(response[1]);
        setError(response[2]);
    }

    async function useSelectedMap() {
        const response = await requestMap(mapData, kmlUploaded);
        const selectedMapData = response?.[0]?.data;
        const fallbackMapData = (mapData && mapData.pngFile) ? mapData : null;
        const resolvedMapData = (selectedMapData && selectedMapData.pngFile) ? selectedMapData : fallbackMapData;

        if (!resolvedMapData) {
            const backendError = response?.[2] || selectedMapData?.message || selectedMapData?.error;
            setError(backendError || "Map payload is incomplete (missing pngFile).");
            setSuccess("");
            return;
        }

        setMapData(resolvedMapData);
        setHomeToUseMap(resolvedMapData);
        if (!selectedMapData || !selectedMapData.pngFile) {
            const backendError = response?.[2] || selectedMapData?.message || selectedMapData?.error;
            setError(backendError || "");
            setSuccess("Loaded map using local data.");
        } else {
            setSuccess(response[1]);
            setError(response[2]);
        }
        setUseMap(true);
    }

    function checkFields(fileToUpload) {
        console.log(fileToUpload);
        if(mapData.name === '' || mapData.country === '' || mapData.area === '' || fileToUpload.name === 'current.png'){
            return false;
        }else{

        }
        return true;
    }

    const handleInputUpdate = (event) => {
        const value = event?.target?.value;
        // console.log(event?.target?.value);
        if (event.target.name === "name") {
            setMapData({...mapData, name: value});
        }
        if (event.target.name === "country") {
            setMapData({...mapData, country: value});
        }
        if (event.target.name === "area") {
            setMapData({...mapData, area: value});
        }
        if (event.target.name === "radius") {
            setMapData({...mapData, radius: value});
        }
    };

    function setEditMapToFalse(){
        setEditMap(false);
    }

    useEffect( () => {
        setMapData(map || DEFAULT_MAP_DATA);
        setLoading(false);
    },[map]);

    useEffect(() => {
        if (useMap) {
            // console.log("navigate to usemap");
            navigate("../use-map", { state: {mapData} });   //id: map.id, name: map.name, country: map.country
        }
            }, [mapData, navigate, useMap]);

    return (
        <Box component="form">
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField label="ID" value={mapData.id ?? ''} fullWidth size="small" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Name (short)"
                        name="name"
                        defaultValue={mapData.name}
                        onChange={handleInputUpdate}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !editMap }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Country"
                        name="country"
                        defaultValue={mapData.country}
                        onChange={handleInputUpdate}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !editMap }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Area"
                        name="area"
                        defaultValue={mapData.area}
                        onChange={handleInputUpdate}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !editMap }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="World Map Radius (m)"
                        name="radius"
                        defaultValue={mapData.radius}
                        onChange={handleInputUpdate}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !editMap }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Map (.png)" value={mapData.pngFile ?? ''} fullWidth size="small" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="KML map" value={mapData.kmlFile ?? ''} fullWidth size="small" InputProps={{ readOnly: true }} />
                </Grid>
            </Grid>

            {editMap && !loading && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <FilePicker
                        maxSize={maxFileSize}
                        extensions={['png']}
                        onChange={FileObject => (uploadMapFile(FileObject)).then(r => {
                            if (r && r[0] && r[1]) {
                                processFileData(r[0], r[1]);
                            }
                        })}
                        onError={errMsg => (setError(errMsg))}
                    >
                        <Button type="button" variant="outlined">Upload PNG map file</Button>
                    </FilePicker>
                    {pngUploaded && (
                        <FilePicker
                            extensions={['kml']}
                            onChange={FileObject => (uploadMapFile(FileObject)).then(r => {
                                if (r && r[0] && r[1]) {
                                    processFileData(r[0], r[1]);
                                }
                            })}
                            onError={errMsg => (setError(errMsg))}
                        >
                            <Button type="button" variant="outlined">Upload KML map file</Button>
                        </FilePicker>
                    )}
                </Stack>
            )}

            {editMap ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    {!loading && (
                        <Button variant="contained" onClick={saveChangesSelectedMap} type="button">Save Changes</Button>
                    )}
                    {!kmlUploaded && !loading && (
                        <Button variant="outlined" onClick={setEditMapToFalse} type="button">Cancel</Button>
                    )}
                </Stack>
            ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={editSelectedMap} type="button">Edit Map</Button>
                    {mapData.area !== "NoMap" && (
                        <Button variant="outlined" onClick={useSelectedMap} type="button">Use Selected Map</Button>
                    )}
                    {mapData.area !== "NoMap" && (
                        <Button color="error" variant="outlined" onClick={clearMap} type="button">Delete Map</Button>
                    )}
                </Stack>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} />
                </Box>
            )}
            {error !== "" && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {success !== "" && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
            {!loading && error === "" && success === "" && <Typography variant="body2" sx={{ mt: 1 }}>&nbsp;</Typography>}
        </Box>
    );
}