// accessToken хранится в cookies, refreshToken хранится в localStorage
// Функции setCookie и getCookie используются для управления значениями по ключу

import {useDispatch, useSelector} from "../index";

const host = 'https://norma.nomoreparties.space';

// Вспомогательная функция для обработки полученного ответа с сервера
    function checkResponse(res) {
        return res.ok
            ? res.json()
            : res
                .json()
                .then(err => Promise.reject({ ...err, statusCode: res.status }));
    }

// Метод отправки запроса без обновления токена
    async function request(endpoint, options) {
        try {
            const res = await fetch(`${host}/api/${endpoint}`, {
                headers: {
                    'content-type': 'application/json',
                },
                ...options,
            });
            return await checkResponse(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

// Метод обновления access-токена
    function refreshToken = () => {
        return request('auth/token', {
            method: 'POST',
            body: JSON.stringify({ token: localStorage.getItem('refreshToken') }),
        });
    };

    async function fetchWithRefresh(endpoint, options) {
        try {
            return await request(endpoint, options); // Пользователь делает запрос за защищёнными данными
        } catch (error) {
            // Мы проверяем, авторизован ли он, и получаем ошибку 401 или 403
            if (error.statusCode === 401 || error.statusCode === 403) {
                // Отправляем запрос на обновление access token
                const refreshData = await refreshToken();
                if (!refreshData.success) {
                    return Promise.reject(refreshData);
                }
                // Если всё прошло успешно,
                // устанавливаем в хранилище новую связку access- и refresh-токенов
                setCookie('accessToken', refreshData.accessToken);
                localStorage.setItem('refreshToken', refreshData.refreshToken);

                // Повторяем запрос с новыми accessToken в заголовке
                return await request(endpoint, {
                    ...options,
                    headers: {
                        ...options.headers,
                        authorization: getCookie('accessToken'),
                    },
                });
            }
        }
    }

    async function getUser() {
        // Использование функции fetchWithRefresh
        const dataUser = await fetchWithRefresh('auth/user', {
            headers: {
                authorization: getCookie('accessToken'),
            },
        });
        return dataUser;
    }

//Глобальное состояние
    //Хранить информацию об авторизации мы будем в централизованном хранилище. Для этого создадим срез (slice) пользователя:
    class TUserState {
    }
    const initialState: TUserState = {
        isAuthChecked: false, // флаг для статуса проверки токена пользователя
        isAuthenticated: false,
        data: null,
        loginUserError: null,
        loginUserRequest: false,
    };
    import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
    export const userSlice = createSlice({
        name: 'user',
        initialState,
        extraReducers: (builder) => {
            builder
                .addCase(loginUser.pending, (state) => {
                    state.loginUserRequest = true;
                    state.loginUserError = null;
                })
                .addCase(loginUser.rejected, (state, action) => {
                    state.loginUserRequest = false;
                    state.loginUserError = action.payload;
                    state.isAuthChecked = true;
                })
                .addCase(loginUser.fulfilled, (state, action) => {
                    state.data = action.payload.user;
                    state.loginUserRequest = false;
                    state.isAuthenticated = true;
                    state.isAuthChecked = true;
                }
        }
    });

    //Напишем асинхронный экшен-креатор для авторизации и синхронные экшен-креаторы для изменения данных в хранилище.
    export const loginUser = createAsyncThunk(
        'user/loginUser',
        async ({ email, password }: Omit<TRegisterData, 'name'>) => {
            return await loginUserApi({ email, password })
        }
    )

    //осталось обернуть всё приложение провайдером из библиотеки react-redux
    import './App.css';
    import { BrowserRouter, Routes, Route, Redirect } from 'react-router-dom';
    import { LoginPage, ListPage, NotFound404 } from './pages';
    import { Provider } from 'react-redux';
    import store from '../../services/store';

    export default function App() {
        return (
            <Provider store={store}>
                <BrowserRouter >
                    <Routes>
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/list" element={<ListPage/>}/>
                        <Route path="*" element={<NotFound404/>}/>
                    </Routes>
                </BrowserRouter >
            </Provider >
        );
    }

    //Использование состояния для авторизации в приложении
    //создадим форму авторизации для отправки запроса на сервер
    import React, { ChangeEvent, FormEvent, useState } from 'react';
    import { Navigate} from 'react-router-dom';
    import styles from './login.module.css';
    import { loginUser } from '../../services/slices/user';
    import { authenticatedSelector} from '../../services/selectors';
    import { Button } from '../components/button';
    import { Input } from '../components/input';
    import { PasswordInput } from '../components/password-input';

    export function LoginPage() {
        const dispatch = useDispatch();
        const [userData, setUserData] = useState({
            email: '',
            password: '',
        })
        //С помощью useSelector получаем доступ к данным о состоянии авторизации.
        const isAuthenticated = useSelector(authenticatedSelector);

        const inputsChangeHandler = (e:ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setUserData({
                ...userData,
                [name]: value
            });
        }

        const formSubmitHandler = (e:FormEvent) => {
            e.preventDefault();
            if (!userData.email || !userData.password) {
                return;
            }
            //импортируем наш асинхронный экшен loginUser для отправки данных формы на сервер
            dispatch(loginUser(userData));
        }
        //мы добавили проверку статуса авторизации isAuthenticated из хранилища
        if (isAuthenticated) {
            return (
                <Navigate
                    to={'/list'} //Перенаправляем пользователя на нужную страницу.
                />
            );
        }
        return (
            <div className={styles.wrapper}>
                <form onSubmit={formSubmitHandler} className={styles.form}>
                    <h1 className={styles.heading}>Вход</h1>
                    <Input
                        placeholder="Email"
                        value={form.email}
                        name="email"
                        onChange={inputsChangeHandler}
                    />
                    <PasswordInput
                        placeholder="Пароль"
                        value={form.password}
                        name="password"
                        onChange={inputsChangeHandler}
                    />
                    <Button primary={true}>
                        Войти
                    </Button>
                </form>
            </div>
        );
    }

//Браузерные хранилища (сохранять токен в браузере)
    //Сookie (с англ. печенье). Так называют небольшие данные (не более 4 Кбайт), которые хранятся в браузере.
        //Обычно сервер устанавливает куки в браузер с помощью специального заголовка Set-Cookie. Все куки могут автоматически «прикрепляться» к запросам на сервер. Куки бывают разными — одни работают до закрытия вкладки браузера, другие «живут» по несколько лет. Кроме того, существуют куки, доступ к которым невозможно получить из JavaScript.
    //Local storage (с англ. локальное хранилище).
        //Данные хранятся в нём до тех пор, пока их не удалят вручную.
        //Локальное хранилище работает как постоянная память: после перезагрузки компьютера все данные остаются сохранёнными.

    //Сookie
    //Данные в куках хранятся в виде строки и доступны через document.cookie
    //Выглядят куки так
    "user=Alex; someValue=123; lastVisit=1608393401"

    //установить куку:
    document.cookie = "user=Alex; path=/; max-age=300" //Такая кука будет доступна в течение 5 минут на всех страницах сайт

    //Сохраняем токены
    //Метод API, который отправляет запрос на аутентификацию пользователя
    //Отправляем данные формы на сервер для авторизации
    export const loginUserApi = async (formData) => {
        return request('auth/login', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
    };
    //При успешной авторизации сервер возвращает данные о пользователе, и передаёт токены в теле ответа
    //КАРТИНКА https://practicum.yandex.ru/learn/frontend-developer/courses/bd56befd-d26d-4628-ab73-87f417e66764/sprints/178919/topics/1d309734-fb9c-4c55-8dcb-4c69605dd340/lessons/ba550015-d424-4da6-a00e-a888a6d79438/
    //Теперь сохраним accessToken токен в куку, а refreshToken в локальное хранилище.
    //Сделаем это в асинхронном экшене loginUser внутри среза пользователя
    // Функция setCookie принимает три аргумента: name (имя куки), value (значение куки) и props (объект, содержащий дополнительные свойства куки)
    export function setCookie(name: string, value: string, props: { [key: string]: string | number | Date | boolean } = {}) {
        console.log(props);
        props = {
            path: '/',
            ...props
        };
        let exp = props.expires;
        //Если в объекте props передано значение для свойства expires (время жизни куки), то оно обрабатывается.
        //Если expires - число (предполагается, что это количество секунд), то к текущей дате прибавляется это количество секунд и устанавливается новая дата истечения.
        if (typeof exp == 'number' && exp) {
            const d = new Date();
            d.setTime(d.getTime() + exp * 1000);
            exp = props.expires = d;
        }
        //Если expires - объект типа Date, то он преобразуется в строку в формате UTC.
        if (exp && exp instanceof Date) {
            props.expires = exp.toUTCString();
        }
        //Значение value кодируется с использованием encodeURIComponent, чтобы убедиться, что оно может быть использовано внутри куки без проблем.
        value = encodeURIComponent(value);
        //Создадим строку updatedCookie, которая содержит имя и значение куки.
        let updatedCookie = name + '=' + value;

        //Проходим по всем свойствам объекта props. Каждое переданное свойство и его значение добавлям к строке updatedCookie разеделяя их ";".
        for (const propName in props) {
            updatedCookie += '; ' + propName;
            const propValue = props[propName];
            if (propValue !== true) {
                updatedCookie += '=' + propValue;
            }
        }
        document.cookie = updatedCookie;
    }

    //Сохраним токены внутри среза пользователя
    export const loginUser = createAsyncThunk(
        'user/loginUser',
        async ({ email, password }: Omit<TRegisterData, 'name'>) => {
            const data = await loginUserApi({ email, password }, {rejectWithValue})
            if (!data?.success) {
                return rejectWithValue(data);
            }
            //При сохранении куки мы не указываем дополнительных параметров. Такая кука будет работать до завершения работы браузера
            setCookie('accessToken', data.accessToken);
            //refreshToken останется в хранилище localStorage. Если закрыть браузер и потом опять открыть — придётся заново вводить логин и пароль
            localSotrage.setItem('refreshToken', data.refreshToken);
            return data.user;
        }
    );

    //Отправляем токен в запросах
    //Токен отправляют в заголовке authorization
    //Bearer - Кроме самого токена, заголовок должен содержать схему аутентификации — она сообщает серверу, что проверять наличие прав у пользователя нужно по токену

    //доступ к куке нам потребуется ещё одна функция
    export function getCookie(name: string) {
        const matches = document.cookie.match(
            // eslint-disable-next-line no-useless-escape
            new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    //Получим информацию о пользователе, передадим в заголовок authorization токен со схемой аутентификации из куки:
    //отправляем запрос на роут аутентификации
    async function getUser() {
        //Использование функции fetchWithRefresh
        const dataUser = await fetchWithRefresh('auth/user', {
            headers: {
                authorization: getCookie('accessToken'),
            },
        });
        return dataUser;
    }

//Защищённый маршрут
    //Защищённые маршруты — это маршруты, на которые могут попасть только пользователи с нужным набором прав
    //Главный объект для защиты — маршрут / и компонент экрана ListPage
    import './App.css';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import { LoginPage, ListPage } from './pages';
    import { ProtectedRoute } from './components/protected-route';
    import { Provider } from 'react-redux';

    export default function App() {
        return (
            <Provider store={store}>
                <BrowserRouter >
                    <Routes>
                        <Route path="/login" element={<LoginPage/>} />
                        <Route path="/list" element={<ProtectedRoute><ListPage /></ProtectedRoute>} />
                        //запретим доступ посторонним пользователям. Для этого нужно создать отдельный компонент — ProtectedRoute.
                        //Сам компонент ProtectedRoute должен принимать элемент, который мы хотим отображать по конкретному роуту, передавать элемент будем в пропс children.
                        <Route path="*" element={<NotFound404/>}/>
                    </Routes>
                </BrowserRouter >
            </Provider>
        );
    }

    type ProtectedRouteProps = {
        children: React.ReactElement;
    };

    export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
        const isAuthChecked = useSelector(isAuthCheckedSelector); // isAuthCheckedSelector — селектор получения состояния загрузки пользователя
        const user = useSelector(userDataSelector); // userDataSelector — селектор получения пользователя из store

        return children ;
    }

    //Само значение isAuthChecked внутри хранилища меняется после попытки получить статус авторизации пользователя
    const initialState: TUserState = {
        isAuthChecked: false,
        ...
    };
    export const userSlice = createSlice({
        name: 'user',
        initialState,
        reducers: {
            authChecked: (state) => {
                state.isAuthChecked = true;
            },
            ...
        }
    })
    export const checkUserAuth = createAsyncThunk(
        'user/checkUser',
        (_, { dispatch }) => {
            if (getCookie('accessToken')) {
                dispatch(getUser()).finally(() => {
                    dispatch(authChecked());
                });
            } else {
                dispatch(authChecked());
            }
        }
    );

    //Теперь, если пользователь не прошёл аутентификацию и объекта user в хранилище нет, перенаправим его по маршруту /login:
    import { useSelector} from '../services/store';
    import { isAuthCheckedSelector, userDataSelector } from '../services/store/selectors';
    import { Navigate } from 'react-router';

    export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
        const isAuthChecked = useSelector(isAuthCheckedSelector); // isAuthCheckedSelector — селектор получения состояния загрузки пользователя
        const user = useSelector(userDataSelector); // userDataSelector — селектор получения пользователя из store

        if (!isAuthChecked) { // пока идёт чекаут пользователя, показываем прелоадер
            return <Preloader />;
        }

        if (!user) { // если пользователя в хранилище нет, то делаем редирект
            return <Navigate replace to='/login'/>;
        }

        return children ;
    }

//Выход
    //Функция logoutUser
    // services/utils.ts
    export function deleteCookie(name:string) {
        // Находим куку по ключу token, удаляем её значение,
        // устанавливаем отрицательное время жизни, чтобы удалить сам ключ token
        setCookie(name, null, { expires: -1 });
    }

    // utils/api.ts
    export const logoutApi = () =>
        fetch(`${URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                token: localStorage.getItem('refreshToken')
            })
        }).then((res) => checkResponse<TServerResponse<{}>>(res));

    // services/slices/user/user-slice.ts
    export const userSlice = createSlice({
        name: 'user',
        initialState,
        reducers: {
            authChecked: (state) => {
                state.isAuthChecked = true;
            },
            userLogout: (state) => {
                state.data = null;
            }
        }
        ...
    })

    export const logoutUser = createAsyncThunk(
        'user/logoutUser',
        (_, { dispatch }) => {
            logoutApi()
                .then(() => {
                    localStorage.clear(); // очищаем refreshToken
                    deleteCookie('accessToken'); // очищаем accessToken
                    dispatch(userLogout()); // удаляем пользователя из хранилища
                })
                .catch(() => {
                    console.log('Ошибка выполнения выхода');
                });
        }
    );

    import React, { useEffect, useState, useMemo, useCallback } from 'react';
    import { ChatsList } from '../components/chats-list';
    import listStyles from './list.module.css';
    import { Avatar } from '../components/avatar';
    import { Input } from '../components/input';
    import logoutImage from '../images/logout.svg';
    import { ChatPage } from './chat';
    import { useDispatch } from '../../services/store';

    export const ListPage = ({preparedData}) => {
        const dispatch = useDispatch()
        const imageClickHandler = () => dispatch(logoutUser())

        return (
            <div className={listStyles.container}>
                <div className={listStyles.list}>
                    <div className={listStyles.searchbar}>
                        <Avatar name={'A'} />
                        <Input placeholder="Поиск" onChange={onChange} value={searchValue} />
                        {/* Добавим обработчик событий на иконку выхода */}
                        <img alt="logout" src={logoutImage} onClick={imageClickHandler} />
                    </div>
                    <ChatsList chats={preparedData} />
                </div>
                ...
            </div>
        );
    };