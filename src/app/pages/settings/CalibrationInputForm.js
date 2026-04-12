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
    const [calibrationData, setCalibrationData] = useState({ compassOffset: '' });

    async function sendSettings() {
        let serverHost = getServerHost();
        let json = JSON.stringify({
            compassCalibrated: calibrationData.compassCalibrated,
            compassCalibrationMode: calibrationData.compassCalibrationMode,
            compassOffset: calibrationData.compassOffset,
            magOffsetX: calibrationData.magOffsetX, magOffsetY: calibrationData.magOffsetY,
            magOffsetZ: calibrationData.magOffsetX, magSoftIron: calibrationData.magSoftIron,
            magScaleFacY: calibrationData.magScaleFacY, magScaleFacZ: calibrationData.magScaleFacZ,
            gyroBiasX: calibrationData.gyroBiasX, gyroBiasY: calibrationData.gyroBiasY,
            gyroOffsetX: calibrationData.gyroOffsetX, gyroOffsetY: calibrationData.gyroOffsetY,
            gyroOffsetZ: calibrationData.gyroOffsetZ, accelOffsetX: calibrationData.accelOffsetX,
            accelOffsetY: calibrationData.accelOffsetY, accelOffsetZ: calibrationData.accelOffsetZ,
            accSoftIron: calibrationData.accSoftIron,
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
            setCalibrationData((prev) => ({ ...prev, compassCalibrationMode: true }));
            sendSettings();
        }
    };

    useEffect(() => {
        fetchCalData().then((r) => {
            setCalibrationData(r);
            console.log(r);
            setLoading(false);
        });
    }, [fetchCalData]);

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
                defaultValue={calibrationData[stateKey] ?? ''}
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
                                defaultChecked={!!calibrationData.compassCalibrated}
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
                    Calibrate Compass
                </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
        </Box>
    );
}
