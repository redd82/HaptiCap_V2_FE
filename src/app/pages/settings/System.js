import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const systemTabs = [
    { label: 'System Info', path: '/system/system-info' },
    { label: 'Debug', path: '/system/debugform' },
    { label: 'Settings', path: '/system/settingsform' },
    { label: 'Calibration', path: '/system/calibrationform' },
    { label: 'TAK', path: '/system/takform' },
];

export default function System() {
    const location = useLocation();
    const navigate = useNavigate();
    const activeTab = systemTabs.findIndex((tab) => location.pathname.startsWith(tab.path));

    function handleTabChange(_, newIndex) {
        navigate(systemTabs[newIndex].path);
    }

    return (
        <Box>
            <Tabs
                value={activeTab >= 0 ? activeTab : 0}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
                {systemTabs.map((tab) => (
                    <Tab key={tab.path} label={tab.label} />
                ))}
            </Tabs>
            <Outlet />
        </Box>
    );
}