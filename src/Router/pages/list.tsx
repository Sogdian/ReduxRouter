// pages/list.jsx
import React, { useEffect, useState } from 'react';
import { ChatsList } from '../components/chats-list';
import listStyles from './list.module.css';
import { getChats } from '../services/api';
import { useLoaderData } from "react-router-dom";
import { Outlet } from 'react-router-dom'; // добавим импорт компонента для указания места отрисовки компонента вложенного роута

export const ListPage = () => {
    const [data, setData] = useState([]); // здесь будем хранить список чатов
    const [loading, setLoading] = useState(false); // состояние для загрузки данных
    const { chats } = useLoaderData();

    // добавим состояние загрузки, большой объём данных может подгружаться довольно долго
    const content = loading ? (
        'loading'
    ) : data && data.length ? (
        <ChatsList chats={data} />
    ) : null;

    setLoading(true);

    try {
        const chats = await getChats();
        setData(chats);
        } catch(err) {
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // загрузим список чатов
        getChatsData();
    }, []);

    return (
        <>
            <header>
                <ul className="list">
                    <li><Link to="/">Главная страница</Link></li>
                    <li><Link to="/hotel-list">Список отелей</Link></li>
                </ul>
            </header>

            <div className={listStyles.container}>
                <div className={listStyles.list}>
                    {content}
                </div>
                {/* добавим Outlet, чтобы пометить, где отрисовывать компонент вложенного роута */}
                <Outlet />
            </div>
        </>

    );
};

export async function loader({ params, request }) {
    const  chats = await getChats();
    return  {chats};
};