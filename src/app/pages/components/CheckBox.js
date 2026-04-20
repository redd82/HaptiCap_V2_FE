import React from 'react';
import { Checkbox as MuiCheckbox, FormControlLabel } from '@mui/material';

export default function CheckBox(props) {
    return (
        <FormControlLabel
            label={props.labelname || ''}
            control={
                <MuiCheckbox
                    id={props.id}
                    name={props.name}
                    defaultChecked={!!props.defaultChecked}
                    disabled={props.disabled}
                    onChange={(e) => props.parentCallback(e.target)}
                />
            }
        />
    );
}