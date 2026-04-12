import React from 'react';
import styles from '../../styles/Content.module.css';
import { Outlet } from 'react-router-dom';

export default function Navigation() {
    return (
        <div>
            <main>
                <div className={styles['outlet-maps']}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}