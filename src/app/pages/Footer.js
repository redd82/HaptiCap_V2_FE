import React, { useContext, useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { CommsContext } from '../contexts/CommsContext';

export default function Footer() {
    const { fetchTimeDate } = useContext(CommsContext);
    const [espTimeDate, setEspTimeDate] = useState({});

    useEffect(() => {
        fetchTimeDate().then((response) => {
            setEspTimeDate(response);
        });
    }, [fetchTimeDate]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTimeDate().then((response) => {
                setEspTimeDate(response);
            });
        }, 60000);

        return () => {
            clearInterval(interval);
        };
    }, [fetchTimeDate]);

    return (
        <Box component="footer" sx={{ px: { xs: 1.5, md: 3 }, pb: 2 }}>
            <Paper sx={{ px: 2, py: 1.25 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                        Date: {espTimeDate.GPSDate || '--'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Time: {espTimeDate.GPSTime || '--'}
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}