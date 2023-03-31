import React, {useContext, useState} from 'react';
import Popup from 'reactjs-popup';
import styles from '../../../styles/pages/UseMap.module.css';


export default function PositionModal({position, text}){
    const [error, setError] = useState("")
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);


    document.documentElement.style.setProperty('--modal-pos-top', (position.top) + "px");
    document.documentElement.style.setProperty('--modal-pos-left', (position.left) + "px");

    return(
        <>
            <Popup  trigger={<div className={styles['popup-modal']}>
                <div>
                    {text[0]}
                </div> 
                <div>
                    {text[1]}
                </div>
                <div>
                    {text[3]}
                </div>
                <div>
                    {text[4]}
                </div>
                 </div>} position="left top" modal nested>
            </Popup>
        </>
    );
}