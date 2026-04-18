import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function PositionModal({ position, text }) {
    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                zIndex: 10,
                p: 1,
                borderRadius: 1.5,
                minWidth: 90,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
            }}
        >
            {Array.isArray(text) && text.filter(Boolean).map((line, i) => (
                <Typography key={i} variant="caption" display="block">{String(line)}</Typography>
            ))}
        </Paper>
    );
}