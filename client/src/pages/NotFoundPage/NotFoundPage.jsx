import React from 'react';
import {t} from "i18next";
import {useNavigate} from "react-router-dom";
import styles from './NotFound.module.scss';

const NotFoundPage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/');
    };

    return (
        <div className={styles.notFound}>
            <h1>{t('notFoundTitle')}</h1>
            <p>{t('notFoundMessage')}</p>
            <button className={styles.button} onClick={handleClick}>{t('notFoundHomeLink')}</button>
        </div>

    );
};

export default NotFoundPage;