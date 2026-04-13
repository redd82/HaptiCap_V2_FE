import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function Navigation() {
    return (
        <Box component="main" sx={{ m: 0 }}>
            <Outlet />
        </Box>
    );
}