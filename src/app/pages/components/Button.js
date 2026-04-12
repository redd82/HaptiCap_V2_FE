import React from 'react';
import styles from '../../styles/components/Button.module.css'

export default function Button(props, styleName) {
    // console.log(props)
    return (
        <div className={styles[styleName]}>
            <label className="info-label" htmlFor="workOrderDone"> </label>
            <button
                className={styles['apply-button']}
                onClick={(e) => { props.parentCallback(props.buttonName);}}
                type="button"> {props.buttonText}
            </button>
        </div>
    );
}