import React from 'react';
import {useNavigate} from "react-router-dom";
import styles from '../../../styles/Content.module.css';

export default function MapData({id, map}) {
    const navigate = useNavigate();
    function handleClick(){
        navigate("../select-map", { replace: true, state: {map} });   //id: map.id, name: map.name, country: map.country
    }
    //console.log(map);

    return (
        <tbody>
            <tr className={styles['standard-tr']} key={map.id} onClick={handleClick}>
            <td className={styles['standard-td']}>{map.id}</td>
            <td className={styles['standard-td']}>{map.name}</td>
            <td className={styles['standard-td']}>{map.country}</td>
            <td className={styles['standard-td']}>{map.area}</td>
            </tr>
        </tbody>
    );
}