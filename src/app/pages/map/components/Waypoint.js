import React from 'react';
import {useNavigate} from "react-router-dom";
import styles from '../../../styles/Content.module.css';

export default function Waypoint({id, waypoint}) {
    const navigate = useNavigate();
    function handleClick(){
        navigate("../select-waypoint", { replace: true, state: {waypoint} });   //id: map.id, name: map.name, country: map.country
    }

    return (
        <tbody>
            <tr className={styles['standard-tr']} key={waypoint.id} onClick={handleClick}>
            <td className={styles['standard-td']}>{waypoint.id}</td>
            <td className={styles['standard-td']}>{waypoint.latt}</td>
            <td className={styles['standard-td']}>{waypoint.lon}</td>
            </tr>
        </tbody>
    );
}