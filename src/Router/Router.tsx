//BrowserRouter
    //Это роутер для современных браузеров, который использует HTML5 pushState (pushState, replaceState и popState API).
//NativeRouter
    //Для React Native есть эквивалент BrowserRouter — NativeRouter.

//HashRouter
    //HashRouter — компонент роутера, который использует хеш в URL-адресе для управления маршрутизацией в приложении
    //HashRouter добавляет хеш в URL-адрес после знака #, например, http://example.com/#/path.

//MemoryRouter
    // MemoryRouter — специальный компонент роутера из библиотеки React Router.
    //В отличие от других роутеров он хранит информацию о текущем маршруте непосредственно в памяти, а не в URL-адресе браузера

//StaticRouter
    //StaticRouter — это компонент маршрутизатора, специально предназначенный для использования в серверном рендеринге приложений на React.

//Предзагрузка данных

//Обработка состояний загрузки
    //useNavigation - позволяет узнать текущее состояние приложения: простаивает оно или загружается.
    //Этот хук возвращает информацию о состоянии навигации на странице, даёт доступ к объекту location и помогает отслеживать состояния форм.
    //Хук useNavigation работает только с новыми функциями создания маршрутов.
    //Вы можете использовать этот хук, чтобы показать индикатор загрузки или отключить определённые элементы интерфейса, пока приложение загружает данные
    import {Navigate, NavLink, Route, RouteProps, Routes, useNavigation} from "react-router-dom";
    function App() {
        const navigation = useNavigation();
        //navigation.state: состояние загрузки данных при маршрутизации.
            //Возможны три состояния: простаивает (idle), отправляется форма (submitting) или загружаются данные (loading).
        //navigation.location: информация о URL страницы, на которую переходит пользователь. Также можно получить с помощью хука useLocation.
        //navigation.formData: данные, отправляемые из формы.
        //navigation.formAction: URL, по которому будет отправлена форма.
        //navigation.formMethod: метод, которым отправляется форма, — POST, PUT, PATCH или DELETE.
    }

    //GET
    //idle → loading → idle

    //POST, PUT, PATCH или DELETE
    //idle → submitting → loading → idle

//Размещаем ссылки
    //Компонент Link
    //который выполняет операцию, аналогичную знакомым тегам <a> из стандартного HTML
    //У компонента Link есть пропс to для описания URL, по которому следует перейти.

    //pages/login.jsx
    import React from 'react';
    import { Link } from 'react-router-dom';
    import styles from './login.module.css';

    export function LoginPage() {
        return (
            <>
                <div className={styles.wrapper}>
                    <form className={styles.form}>
                        <h1 className={styles.heading}>Вход</h1>
                        <Link to='/list'>
                            //пропс to для описания URL, по которому следует перейти.
                            Войти
                        </Link>
                    </form>
                </div>

                <h1>Отели:</h1>
                <div className="list">
                    {
                        HOTELS.map(({ img, title }, index) => (
                            <div key={index}>
                                <figure>
                                    <Link to={`/hotel/${index}`} style={{ textDecoration: 'none', color: 'inherit' }}> {/* Используйте Link для перехода */}
                                        <img width={200} src={img} alt="Слон на закате" />
                                        <figcaption>{title}</figcaption>
                                    </Link>
                                </figure>
                            </div>
                        ))
                    }
                </div>
            </>
        );
    }

    //Компонент NavLink
    //в его пропс className можно передать функцию
    //Эта функция в качестве параметра принимает объект.
    //Поле isActive объекта принимает значение true, когда ссылка совпадает с текущим URL в браузере, то есть становится активной.
    //<NavLink to={`/list/${id}`} className={({isActive}) => isActive ? styles.activeChat : styles.chat} >

    //Точно такую же функцию можно передать в NavLink в качестве значения пропса children, что упрощает стилизацию компонентов, вложенных в компонент NavLink.
    //<NavLink to={`/list/${id}`}>
    //    {({isActive}) => (
    //        <span className={isActive ? styles.active: ""}>{recipientName}</span>
    //    )}
    //</NavLink>

//Программная навигация
    //Хук useNavigate возвращает функцию, которую мы можем использовать для навигации:
    import { useNavigate } from "react-router-dom";
    const navigate = useNavigate();
    navigate('/destination');
    //Функция принимает два аргумента
        //Если строка начинается с /, то это абсолютный путь. В таком случае при вызове функции текущий путь полностью заменится новым.
        //Если строка не начинается с /, то это относительный путь. Он добавляется к текущему: currentPath + / + destination .
    //Первый аргумент — строка или число. Если мы передаём строку, то выполняется навигация на роут, который соответствует этой строке
        //Если мы передаём число, то выполняется перемещение по истории. Это работает так же, как стрелочки «Назад» и «Вперёд» в браузере:
        //положительное число указывает, на сколько шагов впёред по истории необходимо переместиться;
        //отрицательное число — на сколько шагов назад.
    //Второй аргумент — объект с двумя полями:replace и state.
        //В поле state можно передать объект, который будет помещён в стек истории
        //про replace ниже

    //1 аргумент
    function CustomComponent() {
        const navigate = useNavigate();
        function goBack() {
            navigate(-1);
        }
        function goForward() {
            navigate(1);
        }
        return (
            <div>
                <button onClick={goBack}>go back</button>
                <button onClick={goForward}>go forward</button>
            </div>
        );
    }
    //2 аргумента
    function OldHomePage() {
        const navigate = useNavigate();

        function goToNewPage() {
            navigate('/new-page', { replace: true });
            //В поле replace можно передать true или false.
            //Значение по умолчанию — false. При передаче true мы заменяем текущую позицию в истории на новую.
            //Если передать false или вообще не указывать это поле, то мы добавим новую позицию в историю.
        }

        return (
            <div>
                <button onClick={goToNewPage}>Попробуйте нашу новую страницу</button>
            </div>
        );
    }

//Компонент Navigate
    //<Route path="/profile">
    //    {!loggedIn ? <Navigate to="/login" /> : <ProfilePage />}
    //</Route>

    //Navigate параметры:
        //to — куда мы хотим навигироваться.
        //replace — заменять или нет запись в стеке истории.
        //state — JS-объект с данными, который связан с позицией в истории. Его часто используют в веб-приложениях после авторизации. Например, чтобы авторизованный пользователь не мог вернуться на страницу входа.
    import {Auth} from '../pages/Auth'
    export const Appss = () => {
        console.log('App');
        return (
            <>
                <Routes>
                    <Route path='/' >
                        {Auth ? <Navigate to="/" replace /> : <Navigate to="/sign-in" replace />}
                    </Route>
                    <Route path='/auth' element={<Auth />} />
                </Routes>
            </>
        )
    };

//Динамические маршруты
    import {HomePage, ListPage, ChatPage} from './pages';
    export const Appsss = () => {
        console.log('App');
        return (
            <>
                <Router>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/list" element={<ListPage/>}>
                            {/* добавим роут для просмотра чата */}
                            <Route path=":chatId" element={<ChatPage />} />
                            /* компонент ChatPage содержит переписку и отображается по динамическому маршруту /list/:chatId
                            далее надо получить из URL id чата при помощи хука useParams. */
                        </Route>
                    </Routes>
                </Router>
            </>
        )
    };

//Параметры URL. Хук useParams
    //Хук useParams возвращает объект, который содержит «ключ-значение» для каждого параметра в адресе.
    //В нашем случае этот хук вернёт объект с ключом chatId и значением id переписки.
    //С помощью хука useParams мы получаем значения параметров адреса, в который обёрнут компонент ChatPage

    //Например, когда мы находимся по адресу /list/777, вызов useParams вернёт такой объект:
    {
        chatId: "777"
    }

//RouteProps
    //RouteProps передаёт свойства маршрута  — path, element и другие — в компонент Route
    interface PrivateRouteProps extends RouteProps {
        isAuthenticated: boolean;
        redirectTo: string;
    }

    function PrivateRoute({ isAuthenticated, redirectTo, ...rest }: PrivateRouteProps) {
        if (!isAuthenticated) {
            return <Navigate to={redirectTo} replace />;
        }

        return <Route {...rest} />;
    }

//LinkProps
    //LinkProps передаёт свойства ссылки — to, replace, state и другие — в компонент Link
    import { Link, LinkProps } from 'react-router-dom';
    function CustomLink({ children, ...rest }: LinkProps) {
        return (
            <Link {...rest} className="custom-link">
                {children}
            </Link>
        );
    }

//useParams
    import React from 'react';
    import { useParams } from 'react-router-dom';
    interface Params {
        id: string;
    }
    const UserPage = () => {
        const { id } = useParams<Params>();
        return (
            <div>
                <h1>User Page</h1>
                <p>ID: {id}</p>
            </div>);
    };
