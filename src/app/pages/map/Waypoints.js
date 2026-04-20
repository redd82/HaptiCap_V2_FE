import React, {useEffect, useState} from 'react';
import { Box, Paper, TextField, Typography } from '@mui/material';

export default function Waypoints({map}) {
    const [loading, setLoading] = useState(true);

    useEffect( () => {
        setLoading(false);
    }, []);

    if(loading){
        return <Typography>Loading Data... Please Wait...</Typography>
    }

    return (
        <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3 }}>
            <Box component="form">
                <TextField label="ID" value={map?.id ?? 1} size="small" fullWidth InputProps={{ readOnly: true }} />
            </Box>
        </Paper>
    );
}