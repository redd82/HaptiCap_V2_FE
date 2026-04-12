import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Box, Button, Checkbox, CircularProgress, Divider,
    FormControlLabel, Grid, Stack, TextField, Typography,
} from '@mui/material';
import { CommsContext } from '../../contexts/CommsContext';
import { CalculationContext } from '../../contexts/CalculationContext';
import { MapsContext } from '../../contexts/MapsContext';
import { DebugContext } from '../../contexts/DebugContext';

export default function DebugInputForm() {
    const { XMLParser } = require('fast-xml-parser');
    const { fetchDebugSettings, getServerHost, listFiles } = useContext(CommsContext);
    const { DataConversion } = useContext(CalculationContext);
    const { fetchKMLFile } = useContext(MapsContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [debugSettingsData, setDebugSettingsData] = useState({});
    const [mapDataDebug, setMapDataDebug] = useState({});
    const [outputDebug, setOutputDebug] = useState({ outLegs0: 1, outlegs1: 1, scaleHeight: 1, scaleWidth: 1 });
    const [kmlData] = useState([]);

    async function applyChanges() {
        let serverHost = getServerHost();
        console.log(debugSettingsData);
        let json = JSON.stringify({
            debug2Serial: debugSettingsData.debug2Serial,
            debugGPS2Serial: debugSettingsData.debugGPS2Serial,
            debugHaptic: debugSettingsData.debugHaptic,
        });
        console.log(json);
        try {
            const response = await axios.post(serverHost + '/settings/debug_form', json, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response);
            setError('');
            setSuccess('');
            if (response.status === 200) {
                setTimeout(500);
                setSuccess('Settings changed');
            } else {
                setError('Error');
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Error');
            if (e.response?.status === 400) setError(e.response.data.message);
        }
    }

    const handleCheckBoxChange = (checkBoxValue) => {
        setDebugSettingsData((prev) => ({ ...prev, [checkBoxValue.name]: checkBoxValue.checked }));
    };

    const handleInputUpdate = (event) => {
        setDebugSettingsData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const listFilesButton = async () => {
        try {
            const result = await listFiles();
            setMapDataDebug(result);
        } catch (e) {
            setError('Error listing files');
        }
    };

    const runDataConversion = () => {
        if (typeof DataConversion === 'function') {
            const result = DataConversion(mapDataDebug);
            setOutputDebug(result);
        }
    };

    const extractKMLData = (xmlData) => {
        try {
            const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
            const parsed = parser.parse(xmlData);
            const placemarks = parsed?.kml?.Document?.Folder?.Placemark ?? [];
            const arr = Array.isArray(placemarks) ? placemarks : [placemarks];
            return arr.map((pm) => ({
                name: pm.name,
                coordinates: pm.Point?.coordinates ?? pm.LineString?.coordinates ?? '',
            }));
        } catch (e) {
            setError('Error parsing KML');
            return [];
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = extractKMLData(e.target.result);
            kmlData.push(...result);
            setMapDataDebug(result);
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        fetchDebugSettings().then((r) => {
            setDebugSettingsData(r);
            setLoading(false);
        });
    }, [fetchDebugSettings]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form">
            <Typography variant="h6" gutterBottom>Debug Settings</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <FormControlLabel
                        label="Debug to Serial"
                        control={
                            <Checkbox
                                name="debug2Serial"
                                defaultChecked={!!debugSettingsData.debug2Serial}
                                onChange={(e) => handleCheckBoxChange(e.target)}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControlLabel
                        label="GPS Debug to Serial"
                        control={
                            <Checkbox
                                name="debugGPS2Serial"
                                defaultChecked={!!debugSettingsData.debugGPS2Serial}
                                onChange={(e) => handleCheckBoxChange(e.target)}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FormControlLabel
                        label="Debug Haptic"
                        control={
                            <Checkbox
                                name="debugHaptic"
                                defaultChecked={!!debugSettingsData.debugHaptic}
                                onChange={(e) => handleCheckBoxChange(e.target)}
                            />
                        }
                    />
                </Grid>
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button variant="contained" onClick={applyChanges} type="button">Apply Changes</Button>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>KML / File Tools</Typography>
            <Stack spacing={2} sx={{ mb: 2 }}>
                <Button variant="outlined" component="label" type="button">
                    Upload KML File
                    <input type="file" hidden accept=".kml" onChange={handleFileUpload} />
                </Button>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={listFilesButton} type="button">List Files</Button>
                    <Button variant="outlined" onClick={runDataConversion} type="button">Run Data Conversion</Button>
                </Stack>
            </Stack>
            {mapDataDebug && Object.keys(mapDataDebug).length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Output:</Typography>
                    <Box
                        component="pre"
                        sx={{ fontSize: 12, p: 1, bgcolor: 'action.hover', borderRadius: 1, overflow: 'auto' }}
                    >
                        {JSON.stringify(mapDataDebug, null, 2)}
                    </Box>
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
        </Box>
    );
}
