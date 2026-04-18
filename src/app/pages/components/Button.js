import React from 'react';
import { Button as MuiButton } from '@mui/material';

export default function Button(props) {
    return (
        <MuiButton
            variant="contained"
            onClick={() => props.parentCallback(props.buttonName)}
            type="button"
            sx={{ mt: 1 }}
        >
            {props.buttonText}
        </MuiButton>
    );
}