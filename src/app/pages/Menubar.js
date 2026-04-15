import React from 'react';
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { useLocation, useNavigate } from 'react-router-dom';

const links = [
    { label: 'Home', path: '/', icon: HomeRoundedIcon },
    { label: 'Navigation', path: '/navigation/map-list', icon: NavigationRoundedIcon },
    { label: 'System', path: '/system/system-info', icon: SettingsRoundedIcon },
    { label: 'TAK', path: '/system/tak', icon: SettingsRoundedIcon },
];

export default function Menubar({ open, onClose }) {
    const navigate = useNavigate();
    const location = useLocation();

    function handleSelect(path) {
        navigate(path);
        onClose();
    }

    return (
        <Drawer anchor="left" open={open} onClose={onClose}>
            <Box sx={{ width: 300, height: '100%', backgroundColor: 'background.paper' }} role="presentation">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}>
                    <Typography variant="h6">Menu</Typography>
                    <IconButton onClick={onClose} aria-label="close menu">
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
                <Divider />
                <List>
                    {links.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'));

                        return (
                            <ListItemButton
                                key={item.path}
                                selected={isActive}
                                onClick={() => handleSelect(item.path)}
                                sx={{
                                    mx: 1,
                                    my: 0.5,
                                    borderRadius: 2,
                                }}
                            >
                                <Icon fontSize="small" style={{ marginRight: 12 }} />
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
}