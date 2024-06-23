import React from 'react';
import { Link } from 'react-router-dom';
import styles from './login.module.css';

export function LoginPage() {
    return (
        <div className={styles.wrapper}>
            <form className={styles.form}>
                <h1 className={styles.heading}>Вход</h1>
                <Link to='/list'>
                    Войти
                </Link>
            </form>
        </div>
    );
}