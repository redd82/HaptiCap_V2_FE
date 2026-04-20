import React from 'react';
import { FormControl, MenuItem, Select } from '@mui/material';

export default function ComboBox(props) {
    return (
        <FormControl size="small" fullWidth>
            <Select
                name={props.name}
                onChange={props.handleChange}
                defaultValue={props.newItem ? '' : (props.selected || '')}
                displayEmpty
            >
                {props.newItem ? (
                    <MenuItem value="">Select Item</MenuItem>
                ) : (
                    <MenuItem value={props.selected || ''}>{props.selected}</MenuItem>
                )}
                {props.list && props.list.map((item, index) => (
                    <MenuItem key={index} value={item.itemName}>{item.itemName}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}