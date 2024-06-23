// pages/not-found.js

import React from 'react';
import { Link } from 'react-router-dom';

import styles from './not-found.module.css';
import pageNotFound from "../images/404.svg";

export const NotFoundPage= () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <img alt="page not found" src={pageNotFound} />
                <br />
                <Link to='/list' className={styles.link}>Перейти в список чатов</Link>
            </div>
        </div>
    );
};