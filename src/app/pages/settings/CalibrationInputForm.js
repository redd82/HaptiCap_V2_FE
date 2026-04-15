import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert, Box, Button, Checkbox, CircularProgress,
    FormControlLabel, Grid, Stack, TextField, Typography,
} from '@mui/material';
import { CommsContext } from '../../contexts/CommsContext';

export default function CalibrationInputForm() {
    const { fetchCalData, getServerHost } = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [calibrating, setCalibrating] = useState(false);
    const [calibrationData, setCalibrationData] = useState({ compassOffset: '' });

    async function sendSettings(overrides = {}) {
        let serverHost = getServerHost();
        const payloadData = { ...calibrationData, ...overrides };
        let json = JSON.stringify({
            compassCalibrated: payloadData.compassCalibrated,
            compassCalibrationMode: payloadData.compassCalibrationMode,
            compassOffset: payloadData.compassOffset,
            magOffsetX: payloadData.magOffsetX, magOffsetY: payloadData.magOffsetY,
            magOffsetZ: payloadData.magOffsetZ, magSoftIron: payloadData.magSoftIron,
            magScaleFacY: payloadData.magScaleFacY, magScaleFacZ: payloadData.magScaleFacZ,
            gyroBiasX: payloadData.gyroBiasX, gyroBiasY: payloadData.gyroBiasY,
            gyroOffsetX: payloadData.gyroOffsetX, gyroOffsetY: payloadData.gyroOffsetY,
            gyroOffsetZ: payloadData.gyroOffsetZ, accelOffsetX: payloadData.accelOffsetX,
            accelOffsetY: payloadData.accelOffsetY, accelOffsetZ: payloadData.accelOffsetZ,
            accSoftIron: payloadData.accSoftIron,
        });
        console.log(json);
        try {
            const response = await axios.post(serverHost + '/settings/calibration_form', json, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response);
            setError('');
            setSuccess('');
            if (response.status === 200) {
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
        const keyMap = {
            compassOffset: 'compassOffset',
            compassCalibrationMode: 'compassCalibrationMode',
            magBiasX: 'magOffsetX', magBiasY: 'magOffsetY', magBiasZ: 'magOffsetZ',
            magSoftIron: 'magSoftIron', gyroOffsetX: 'gyroOffsetX',
            gyroOffsetY: 'gyroOffsetY', gyroOffsetZ: 'gyroOffsetZ',
            accelOffsetX: 'accelOffsetX', accelOffsetY: 'accelOffsetY',
            accelOffsetZ: 'accelOffsetZ', accSoftIron: 'accSoftIron',
        };
        const key = keyMap[event.target.name];
        if (key) setCalibrationData((prev) => ({ ...prev, [key]: event.target.value }));
    };

    const handleCheckBoxChange = (checkBoxValue) => {
        setCalibrationData((prev) => ({ ...prev, [checkBoxValue.name]: checkBoxValue.checked }));
    };

    const handleButton = (event) => {
        if (event === 'calibrateCompass') {
            setCalibrating(true);
            setSuccess('Compass calibration requested. Move sensor in a figure-8 and keep this page open.');
            sendSettings({ compassCalibrationMode: true, compassCalibrated: false });
        }
    };

    useEffect(() => {
        let isMounted = true;
        fetchCalData().then((r) => {
            if (!isMounted) return;
            setCalibrationData(r);
            console.log(r);
            setLoading(false);
        });

        const interval = setInterval(() => {
            fetchCalData().then((data) => {
                if (!isMounted) return;
                setCalibrationData(data);
                if (calibrating && data?.compassCalibrated) {
                    setCalibrating(false);
                    setSuccess('Compass calibration completed. New values loaded.');
                }
            });
        }, 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [fetchCalData, calibrating]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const calField = (label, name, stateKey) => (
        <Grid item xs={12} sm={6}>
            <TextField
                label={label}
                name={name}
                value={calibrationData[stateKey] ?? ''}
                onChange={handleInputUpdate}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
            />
        </Grid>
    );

    return (
        <Box component="form">
            <Typography variant="h6" gutterBottom>Calibration</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        label="Compass Calibrated"
                        control={
                            <Checkbox
                                name="compassCalibrated"
                                checked={!!calibrationData.compassCalibrated}
                                onChange={(e) => handleCheckBoxChange(e.target)}
                            />
                        }
                    />
                </Grid>
                {calField('Compass Cal. Mode', 'compassCalibrationMode', 'compassCalibrationMode')}
                {calField('Compass Offset', 'compassOffset', 'compassOffset')}
                {calField('Magnetometer Offset X', 'magBiasX', 'magOffsetX')}
                {calField('Magnetometer Offset Y', 'magBiasY', 'magOffsetY')}
                {calField('Magnetometer Offset Z', 'magBiasZ', 'magOffsetZ')}
                {calField('Mag. Soft Iron', 'magSoftIron', 'magSoftIron')}
                {calField('Gyro Offset X', 'gyroOffsetX', 'gyroOffsetX')}
                {calField('Gyro Offset Y', 'gyroOffsetY', 'gyroOffsetY')}
                {calField('Gyro Offset Z', 'gyroOffsetZ', 'gyroOffsetZ')}
                {calField('Accel Offset X', 'accelOffsetX', 'accelOffsetX')}
                {calField('Accel Offset Y', 'accelOffsetY', 'accelOffsetY')}
                {calField('Accel Offset Z', 'accelOffsetZ', 'accelOffsetZ')}
                {calField('Accel. Soft Iron', 'accSoftIron', 'accSoftIron')}
            </Grid>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button variant="contained" onClick={sendSettings} type="button">Apply Changes</Button>
                <Button variant="outlined" onClick={() => handleButton('calibrateCompass')} type="button">
                    {calibrating ? 'Calibrating...' : 'Calibrate Compass'}
                </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
        </Box>
    );
}
