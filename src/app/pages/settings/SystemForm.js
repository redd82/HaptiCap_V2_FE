import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import { CommsContext } from '../../contexts/CommsContext';

function ReadOnlyField({ label, value }) {
    return (
        <Grid item xs={12} sm={6}>
            <TextField
                label={label}
                value={value ?? ''}
                disabled
                fullWidth
                size="small"
                variant="filled"
                InputLabelProps={{ shrink: true }}
            />
        </Grid>
    );
}

export default function SystemForm() {
    const { fetchSensorData, setHome } = useContext(CommsContext);
    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchSensorData();
            setSensorData(data);
            setLoading(false);
        };

        fetchData();
        const interval = setInterval(() => {
            fetchSensorData().then((r) => setSensorData(r));
        }, 1000);

        return () => clearInterval(interval);
    }, [fetchSensorData]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, p: 4 }}>
                <CircularProgress size={20} />
                <Typography>Getting data</Typography>
            </Box>
        );
    }

    return (
        <Box component="form">
            <Typography variant="h6" gutterBottom>System Info</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <ReadOnlyField label="Number of Satellites" value={sensorData.nrOfSatellites} />
                <ReadOnlyField label="Current Position Lat" value={sensorData.ownLat} />
                <ReadOnlyField label="Current Position Lon" value={sensorData.ownLon} />
                <ReadOnlyField label="Compass Heading" value={sensorData.compassHeading} />
                <ReadOnlyField label="Compass Cardinal Heading" value={sensorData.compassCardinal} />
                <ReadOnlyField label="Homebase Lat" value={sensorData.homeBaseLat} />
                <ReadOnlyField label="Homebase Lon" value={sensorData.homeBaseLon} />
                <ReadOnlyField label="Homebase Bearing" value={sensorData.homeBaseBearing} />
                <ReadOnlyField label="Homebase Direction" value={sensorData.homeBaseCardinal} />
                <ReadOnlyField label="Homebase Distance" value={sensorData.homeBaseDistance} />
                <ReadOnlyField label="Waypoint Lat" value={sensorData.wayPointLat} />
                <ReadOnlyField label="Waypoint Lon" value={sensorData.wayPointLon} />
                <ReadOnlyField label="Waypoint Bearing" value={sensorData.wayPointBearing} />
                <ReadOnlyField label="Waypoint Direction" value={sensorData.wayPointCardinal} />
                <ReadOnlyField label="Waypoint Distance" value={sensorData.wayPointDistance} />
            </Grid>
            <Button variant="contained" onClick={() => setHome()} type="button" sx={{ mb: 2 }}>
                Set Home
            </Button>
        </Box>
    );
}
