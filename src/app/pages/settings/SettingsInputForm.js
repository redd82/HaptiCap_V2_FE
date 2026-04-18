import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Box, Button, Checkbox, CircularProgress,
    FormControlLabel, Grid, Stack, TextField, Typography,
} from '@mui/material';
import { CommsContext } from '../../contexts/CommsContext';

export default function SettingsInputForm() {
    const { fetchSettings, getServerHost, restartHaptiCap } = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [settingsData, setSettingsData] = useState({ clientSSID: '' });

    async function onSubmit() {
        let serverHost = getServerHost();
        let json = JSON.stringify({
            asAP: settingsData.asAP, clientSSID: settingsData.clientSSID,
            clientPasswd: settingsData.clientPasswd, connectionTimeOut: settingsData.connectionTimeOut,
            deviceName: settingsData.deviceName, apPasswd: settingsData.apPasswd,
                httpPort: parseInt(settingsData.httpPort, 10) || 80,
                gpsPollSec: parseInt(settingsData.gpsPollSec, 10) || 1,
                targetReached: parseInt(settingsData.targetReached, 10) || 10,
                compPollMs: parseInt(settingsData.compPollMs, 10) || 100,
                compOffset: parseFloat(settingsData.compOffset) || 0,
                HOME_LAT: parseFloat(settingsData.HOME_LAT) || 0,
                HOME_LON: parseFloat(settingsData.HOME_LON) || 0,
                WAYPOINT_LAT: parseFloat(settingsData.WAYPOINT_LAT) || 0,
                WAYPOINT_LON: parseFloat(settingsData.WAYPOINT_LON) || 0,
                declAngleRad: parseFloat(settingsData.declAngleRad) || 0,
                sleepMins: parseInt(settingsData.sleepMins, 10) || 5,
                touchThreshold: parseInt(settingsData.touchThreshold, 10) || 50,
            touchEnabled: settingsData.touchEnabled, maxDistance: settingsData.maxDistance,
            maxDistance: parseInt(settingsData.maxDistance, 10) || 500,
            maxDelay: parseInt(settingsData.maxDelay, 10) || 1000,
            timeZoneOffset: parseInt(settingsData.timeZoneOffset, 10) || 0,
            ftpEnabled: settingsData.ftpEnabled,
        });
        console.log(json);
        try {
            const response = await axios.post(serverHost + '/settings/settings_form', json, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response);
            setError('');
            setSuccess('');
            if (response.statusText === 'OK') {
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

    const handleInputUpdate = (event) => {
        setSettingsData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        setSettingsData((prev) => ({ ...prev, [checkBoxValue.name]: checkBoxValue.checked }));
    };

    const handleButton = (event) => {
        if (event === 'restartHaptiCap') restartHaptiCap();
    };

    useEffect(() => {
        fetchSettings().then((r) => {
            setSettingsData(r);
            setLoading(false);
        });
    }, [fetchSettings]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const field = (label, name) => (
        <Grid item xs={12} sm={6}>
            <TextField
                label={label}
                name={name}
                defaultValue={settingsData[name] ?? ''}
                onChange={handleInputUpdate}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
            />
        </Grid>
    );

    const check = (label, name) => (
        <Grid item xs={12} sm={6}>
            <FormControlLabel
                label={label}
                control={
                    <Checkbox
                        name={name}
                        defaultChecked={!!settingsData[name]}
                        onChange={(e) => handleCheckBoxChange(e.target)}
                    />
                }
            />
        </Grid>
    );

    return (
        <Box component="form">
            <Typography variant="h6" gutterBottom>Settings</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {check('Access Point Mode', 'asAP')}
                {field('Client SSID', 'clientSSID')}
                {field('Client Password', 'clientPasswd')}
                {field('Connection Timeout', 'connectionTimeOut')}
                {field('Device Name', 'deviceName')}
                {field('AP Password', 'apPasswd')}
                {field('HTTP Port', 'httpPort')}
                {field('GPS Poll (sec)', 'gpsPollSec')}
                {field('Target Reached', 'targetReached')}
                {field('Compass Poll (ms)', 'compPollMs')}
                {field('Compass Offset', 'compOffset')}
                {field('Home Latitude', 'HOME_LAT')}
                {field('Home Longitude', 'HOME_LON')}
                {field('Waypoint Latitude', 'WAYPOINT_LAT')}
                {field('Waypoint Longitude', 'WAYPOINT_LON')}
                {field('Declination Angle (rad)', 'declAngleRad')}
                {field('Sleep (mins)', 'sleepMins')}
                {field('Touch Threshold', 'touchThreshold')}
                {check('Touch Enabled', 'touchEnabled')}
                {field('Max Distance', 'maxDistance')}
                {field('Max Delay', 'maxDelay')}
                {field('Time Zone Offset', 'timeZoneOffset')}
                {check('FTP Enabled', 'ftpEnabled')}
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={onSubmit} type="button">Apply Changes</Button>
                <Button variant="outlined" onClick={() => handleButton('restartHaptiCap')} type="button">
                    Restart HaptiCap
                </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
        </Box>
    );
}
