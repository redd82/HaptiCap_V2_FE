import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

export default function Header({ title, themeMode, onToggleThemeMode, onOpenMenu }) {
    return (
        <Box sx={{ px: { xs: 1.5, md: 3 }, pt: 2 }}>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    color: 'text.primary',
                }}
            >
                <Toolbar>
                    <IconButton edge="start" aria-label="open navigation menu" onClick={onOpenMenu} sx={{ mr: 1 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
                        {title || 'HaptiCap'}
                    </Typography>
                    <IconButton aria-label="toggle color mode" onClick={onToggleThemeMode}>
                        {themeMode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}