import React, { useContext, useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import Menubar from './Menubar';
import Routing from '../router/Routing';
import Footer from './Footer';
import Header from './Header';
import DateContextProvider from '../contexts/DateContext';
import { CommsContext } from '../contexts/CommsContext';
import MapsContextProvider from '../contexts/MapsContext';
import CalculationContextProvider from '../contexts/CalculationContext';
import UtilityContextProvider from '../contexts/UtilityContext';

export default function Main(props) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [deviceData, setDeviceData] = useState({ deviceName: '' });
    const { fetchDeviceName } = useContext(CommsContext);

    useEffect(() => {
        fetchDeviceName().then((response) => {
            setDeviceData(response);
        });
    }, [fetchDeviceName]);

    return (
        <CalculationContextProvider>
            <UtilityContextProvider>
                <MapsContextProvider>
                    <DateContextProvider>
                        <Box
                            sx={{
                                minHeight: '100vh',
                                display: 'flex',
                                flexDirection: 'column',
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'radial-gradient(circle at top right, #1d3340 0%, #101A23 52%, #0D141B 100%)'
                                        : 'radial-gradient(circle at top right, #d7efe8 0%, #f4f7f9 50%, #eef3f7 100%)',
                            }}
                        >
                            <Header
                                title={deviceData.deviceName}
                                themeMode={props.themeMode}
                                onToggleThemeMode={props.onToggleThemeMode}
                                onOpenMenu={() => setIsDrawerOpen(true)}
                            />
                            <Menubar open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
                            <Box sx={{ px: { xs: 1.5, md: 3 }, pb: 2, pt: 1.5, flex: 1 }}>
                                <Paper sx={{ p: 2, minHeight: { xs: 'calc(100vh - 196px)', md: 'calc(100vh - 208px)' } }}>
                                    <Routing />
                                </Paper>
                            </Box>
                            <Footer />
                        </Box>
                    </DateContextProvider>
                </MapsContextProvider>
            </UtilityContextProvider>
        </CalculationContextProvider>
    );
}