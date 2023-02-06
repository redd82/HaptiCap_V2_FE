import React from 'react';
import styles from '../../styles/Content.module.css';

export default function UseMap({title, imagesource}){

    return(
        <div>
            <img className={styles['map']} src={imagesource} usemap='#gridmap' alt=""></img>
        </div>
    );
}