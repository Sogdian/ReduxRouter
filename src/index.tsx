//Reducer (редьюсер)
//Middleware (Посредник)
//Enhancers (Усилитель)

//редюсер — это функция, которая принимает текущее состояние хранилища и экшен для вычисления нового состояния хранилища на основе этих данных.
//Последовательность выглядит так:
    //создаём экшен,
    //вызывая генератор экшенов addBook →
    //передаём в него объект book →
    //срабатывает функция, указанная в поле prepare.
    //Она добавляет к объекту book поле key с уникальным значением и возвращает полученный объект в качестве поля payload.
    //Эти данные помещаются в экшен и при вызове функции-редьюсера, указанной в поле reducer, будут доступны в поле action.payload.

//константы для описания типов экшенов — значения их полей type
import {type} from "@testing-library/user-event/dist/type";
import {
    Action, AnyAction,
    configureStore,
    createAction,
    createReducer,
    createSlice,
    Middleware,
    PayloadAction, ThunkMiddleware
} from "@reduxjs/toolkit";

const ADD_BOOK = "ADD_BOOK";
    //ADD_BOOK - литеральный строковый тип
const REMOVE_BOOK = "REMOVE_BOOK";

//типы данных (для наших экшенов) передаваемых вместе с экшеном в поле payload
    type TBook = {
        id: string;
        title: string;
        author: string;
    };
    type TAddBookAction = {
        type: typeof ADD_BOOK;
        book: TBook;
    };
    type TRemoveBookAction = {
        type: typeof REMOVE_BOOK,
        id: string
    }

//генераторы экшенов
    const addBook = createAction<TBook, 'ADD_BOOK'>('ADD_BOOK');
        //первым параметром типа в createAction указывается тип данных, передаваемых вместе с экшеном в поле payload.
        //вторым параметром типа — тип значения, хранимого в поле type экшена.
        //аргументом передаётся само значение для поля type .
    const removeBook = createAction<string, 'REMOVE_BOOK'>('REMOVE_BOOK');

//Редьюсер
    //тип данных, за работу с которыми он отвечает
    type TBooksState = {
        books: Array<TBook>;
    };
    //Начальное состояние этих данных, которое будет записано в хранилище на старте приложения
    const initialState: TBooksState = {
        books: [] //Изначально список книг будет пустым
    };

    //редюсер для обработки наших экшенов
    export const liveTableReducer = createReducer(initialState, (builder) => {
        //Функция createReducer принимает два аргумента:
            //объект с начальным состоянием редьюсера,
            //лямбда-функция, или стрелочная функция, с аргументом builder — для описания действий, которые нужно произвести с хранилищем при получении каждого из экшенов.
        builder
            .addCase(addBook, (state, action) => {
                //Метод addCase объекта builder обрабатывает экшен
                    //первым аргументом генератор экшенов для того экшена, который нужно обработать
                    //вторым аргументом — функцию-редьюсер для обработки этого экшена
                state.books.push(action.payload);
            })
            .addCase(removeBook, (state, action) => {
                state.books = state.books.filter(b => b.id !== action.id);
            })
    });

//Слайсы
    //Слайсы не добавляют какие-то новые функции, но помогают сократить количество кода.
    const bookSlice = createSlice({
        //Функция createSlice принимает объект с опциями:
            // В поле name этого объекта указывается уникальное название для слайса.
            // В поле initialState указывается начальное состояние хранилища, за которое отвечает слайс.
            // В поле reducers можно сразу описывать редьюсеры и экшены, которые они обрабатывают.
        name: 'book',
        initialState,
        reducers: {
            //Названия этих полей (addBook и removeBook) станут названиями для соответствующих генераторов экшенов
            addBook: (state, action: PayloadAction<TBook>) => {
                state.books.push(action.payload);
            },
            removeBook: (state, action: PayloadAction<string> => {
                state.books = state.books.filter(b => b.id !== action.id);
            }
        }
    });
    export const { addBook, removeBook } = bookSlice.actions;
    export const reducer = bookSlice.reducer;

//Кастомизация генераторов экшенов в слайсе
    import { nanoid } from "@reduxjs/toolkit";
    type TBookWithKey = TBook & { key: string };
    const bookSlice2 = createSlice({
        name: 'book',
        initialState,
        reducers: {
            addBook: {
                reducer: (state, action: PayloadAction<TBookWithKey>) => {
                    state.books.push(action.payload);
                },
                prepare: (book: TBook) => {
                    const key = nanoid();
                    return { payload: {...book, key } };
                }
            },
        }
    }

//Обработка внешних экшенов в слайсе
    type TMoveParams = {
        from: number;
        to: number;
    }
    //есть генератор экшенов
    const moveBook = createAction<TMoveParams, 'MOVE_BOOK'>('MOVE_BOOK');
    //обработать его в слайсе
    const bookSlice = createSlice({
        name: 'book',
        initialState,
        reducers: {
            addBook: {
                reducer: (state, action: PayloadAction<TBookWithKey>) => {
                    state.books.push(action.payload);
                },
                prepare: (book: TBook) => {
                    const key = nanoid();
                    return { payload: {...book, key } };
                }
            },
            removeBook: (state, action: PayloadAction<string> => {
                state.books = state.books.filter(b => b.id !== action.id);
            }
        },
        extraReducers: (builder) => { //Редьюсеры для обработки внешних экшенов
            builder.addCase(moveBook, (state, action) => {
                state.books.splice(
                    action.payload.to,
                    0,
                    state.books.splice(action.payload.from, 1)[0]
                );
            }
        }
    });
//Взаимодействие со слайсом из функционального компонента
    //хранилище мы конфигурируем в файле src/services/store.ts
    import { reducer as bookReducer } from "./bookSlice";
    export const store = configureStore({
        reducer: {
            library: bookReducer
        }
    });
    //типизировать хуки useSelector и useDispatch, подключить стор с помощью компонента Provider
    //В компоненте мы можем воспользоваться этим хуками для получения данных из слайса и диспатча нужных экшенов
    import { useSelector, useDispatch } from "../hooks/store";
    import { addBook } from "../services/bookSlice";
import {RootState} from "@reduxjs/toolkit/query";
    const SomeComponent = () => {
        const books = useSelector(store => store.library.books);
        const dispatch = useDispatch();
        const handleAddBook = () => {
            const book = {
                id: "978-5-9775-6839-5",
                title: "React. Сборник рецептов",
                author: "Дэвид Гриффит"
            }
            dispatch(addBook(book));
        };
        return (
            <div>
                <ul>
                    {books.map(book => (
                        <li key={book.id}>
                            <p>{book.title}</p>
                            <p>{book.author}</p>
                        </li>
                    ))}
                </ul>
                <button type="button" onClick={handleAddBook}>Добавить книгу</button>
            </div>
        );
    };

//Селекторы
    export const getBooks = (state: RootState) => state.library.books;
    const books = useSelector(getBooks);

//Cоздать необходимые селекторы прямо в слайсе и экспортировать их потом, деструктурировав из поля bookSlice.selectors :
    const bookSlice = createSlice({
        name: 'book',
        initialState,
        reducers: {
            addBook: {
                reducer: (state, action: PayloadAction<TBookWithKey>) => {
                    state.books.push(action.payload);
                },
                prepare: (book: TBook) => {
                    const key = nanoid();
                    return { payload: {...book, key } };
                }
            },
            removeBook: (state, action: PayloadAction<string> => {
                state.books = state.books.filter(b => b.id !== action.id);
            }
        },
        selectors: {
            getBooks: (state) => state.books,
        },
        extraReducers: (builder) => {
            builder.addCase(moveBook, (state, action) => {
                state.books.splice(
                    action.payload.to,
                    0,
                    state.books.splice(action.payload.from, 1)[0]
                );
            }
        }
    });
    export const { getBook } = bookSlice.selectors;


//Собственный посредник
    //создайте экшены для запуска и остановки таймера
    import { createAction } from "@reduxjs/toolkit";
    export const startTicker = createAction('START_TICKER');
    export const stopTicker = createAction('STOP_TICKER');
    type TickerStore = {
        ticker: number;
    }
    const initialState: TickerStore = {
        ticker: 0
    };
    const tickerSlice = createSlice({
        //Хранить значение счётчика и предоставлять экшен updateTicker для обновления счётчика по таймеру
        name: 'tickerSlice',
        initialState,
        reducers: {
            updateTicker: (state) => {
                state.ticker = state.ticker + 1;
            }
        },
        selectors: {
            getTicker: (state) => state.ticker
            //Через селектор getTicker компоненты смогут получать значение счётчика и отображать его.
        }
    });
    export const { updateTicker } = tickerSlice.actions;
    export const tickerReducer = tickerSlice.reducer;
    export const { getTicker } = tickerSlice.selectors;

    //корневой редюсер
    import { combineReducers } from "@reduxjs/toolkit";
import {useEffect} from "react";
        //Функция combineReducers получает точно такой же объект, какой передаётся в опции reducer при вызове функции configureStore
        //Обычно функция configureStore сама вызывает функцию combineReducers для того, чтобы сформировать корневой редюсер.
    const rootReducer = combineReducers({
        tickerSlice: tickerReducer;
    });
    export const RootState = ReturnType<typeof rootReducer>;

    //собственный посредник
    const TICKER_PERIOD = 3000;
    export const tickerMiddleware = (): Middleware<unknown, RootState> => {
        //ticketMiddleware - фактически генератор экшенов для посредника.
        return (store) => {
            let timer = 0;
            return (next) => (action) => {
                if (startTicker.match(action)) { //посредник
                    timer = setInterval(
                        () => store.dispatch(updateTicker()),
                        TICKER_PERIOD
                    );
                } else if (stopTicker.match(action)) {
                    clearInterval(timer);
                } else {
                    next(action);
                }
            }
        }
    }

    //Посредник периодически обновляет счётчик, отправляя в редюсер экшен updateTicker
    const SomeComponent = () => {
        const ticker = useSelector(getTicker);
        const diaptch = useDispatch();
        useEffect(() => {
            dispatch(useStartTicker());

            rteturn () => dispatch(stopTicker());
        }, []);

        return (
            <p>Счётчик: {ticker}</p>
        );
    };

//В библиотеке redux-thunk есть готовый посредник, который позволяет отправлять в качестве экшена функцию
    function createThunkMiddleware<
        State = any,
        BasicAction extends Action = AnyAction,
        ExtraThunkArg = undefined
        >(extraArgument?: ExtraThunkArg) {
        const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> =
            //Функция принимает три параметра:
                //первые два — функции dispatch и getState, которые при необходимости позволяют ей отправлять экшены и обращаться к данным в хранилище;
                //третий параметр — extraArgument с дополнительными данными, если они потребуются.
            ({ dispatch, getState }) =>
                next =>
                    action => {
                        if (typeof action === 'function') {
                            //если да — просто вызывает эту функцию;
                            return action(dispatch, getState, extraArgument)
                        }
                        //если нет — передаёт экшен дальше по цепочке.
                        return next(action)
                    };
        return middleware;
    }
    export const thunk = createThunkMiddleware();
    export const withExtraArgument = createThunkMiddleware;

//Асинхронные экшены
    import { createAsyncThunk } from "@reduxjs/toolklit";
    export const getBooks = createAsyncThunk(
        "books/getAll",
        async () => {
            return api.getBooks();
        },
    );

    //слайс для работы с асинхронным экшеном getBooks:
    type TBooksState = {
        books: Array<TBook>;
        loading: boolean;
        error: string | null;
    };
    const initialState: TBooksState = {
        books: [],
        loading: false,
        error: null
    };
    const bookSlice = createSlice({
        name: "book",
        initialState,
        reducers: {},
        selectors: {
            getBooksSelector: (state) => state,
        },
        extraReducers: (builder) => {
            builder
                .addCase(getBooks.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(getBooks.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                })
                .addCase(getBooks.fulfilled, (state, action) => {
                    state.loading = false;
                    state.books = action.payload;
                }
        }
    });
    export { reducer } = bookSlice.reducer;
    export { getBookSelector } = bookSlice.selectors;
    //Теперь в компоненте мы можем легко отследить состояние запроса и вывести при необходимости прелоадер
    const SomeComponent = () => {
        const {books, loading, error} = useSelector(getBooksSelector);
        if (loading) {
            return <Preloader />;
        }
        if (!loading && error) {
            return (
                <p className="error">Запрос завершился с ошибкой: {error}</p>
            );
        }
        if (!loading && books.length === 0) {
            return (
                <p className="message">Нет ни одной книги</p>
            );
        }
        return (
            <section>
                {books.map(book => (
                    <article key={book.id}>
                        <p>{book.title}</p>
                        <p>{book.author}</p>
                    </article>
                )}
            </section>
        );
    };

//Формы в Redux
    //Типы данных для работы с формой:
        //почту и пароль пользователя
    export type TLoginData = {
        email: string,
        password: string
    }
    // Этот тип описывает конкретное поле формы:
        // field — содержит название поля (в нашем случае email или password)
        // value — значение для этого поля
    export type TFieldType<T> = {
        field: keyof T;
        value: string;
    }
    //Очередь за асинхронным экшеном для отправки запросов авторизации на сервер:
    export const login = createAsyncThunk(
        "auth/login",
        async ({email, password}: TLoginData) => {
            return apiLogin(email, password);
            //Функция apiLogin выполняет запрос на сервер на основе данных, которые пользователь вводит в форме.
        }
    );
    //слайс для работы с этим асинхронным экшеном
    import {TFieldType, TLoginData} from "../utils/types.ts";
    import {createSlice, PayloadAction} from "@reduxjs/toolkit";
    import { login} from "./actions.ts";
    type TAuthState = {
        form: TLoginData;
        error: string | null;
        sending: boolean;
    }
    const initialState: TAuthState = {
        //Слайс хранит в поле form данные формы
        form: {
            email: "",
            password: ""
        },
        //в поле error — ошибку от сервера в случае неуспешного выполнения запроса
        error: null,
        //в поле sending — флаг состояния запроса.
        sending: false,

    };
    const authSlice = createSlice({
        name: "auth",
        initialState,
        reducers: {
            setFormValue: (state, action: PayloadAction<TFieldType<TLoginData>>) => {
                state.form[action.payload.field] = action.payload.value;
            }
        },
        selectors: {
            sendingSelector: (state) => state.sending,
            sendErrorSelector: (state) => state.error,
            authSelector: (state) => state.form,
        },
        extraReducers: (builder) => {
            builder
                .addCase(login.pending, (state) => {
                    state.error = null;
                    //Флаг sending поднимается перед отправкой запроса, при обработке экшена login.pending, и сбрасывается при завершении запроса.
                    state.sending = true;
                })
                .addCase(login.rejected, (state, action) => {
                    state.sending = false;
                    state.error = action.error.message ?? null;
                })
                .addCase(login.fulfilled, (state) => {
                    state.sending = false;
                })
        }
    });
    export const reducer  = authSlice.reducer;
    export const { setFormValue } = authSlice.actions;
    export const {
        sendingSelector,
        sendErrorSelector,
        authSelector
    } = authSlice.selectors;
    //сконфигрурировать стор
    import {configureStore} from "@reduxjs/toolkit";
    import {reducer as authReducer} from "./authSlice.ts";
    import {
        useDispatch as dispatchHook,
        useSelector as selectorHook
    } from 'react-redux';
    import type { TypedUseSelectorHook } from 'react-redux'

    export const store = configureStore({
        reducer: {
            auth: authReducer
        }
    });
    export type RootState = ReturnType<typeof store.getState>;
    export type AppDispatch = typeof store.dispatch;
    export const useDispatch: () => AppDispatch = dispatchHook;
    export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
    //App
    import App from './App.tsx'
    import './index.css'
    import {Provider} from "react-redux";
    import {store} from "./services/store.ts";
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <Provider store={store}>
                <App />
            </Provider>
        </React.StrictMode>,
    )
    //Работа с формой
    //Компонент для поля ввода
    //Он будет выводить поле ввода с меткой и сообщением об ошибке валидации, если что-то введено неправильно
    import {ForwardedRef, InputHTMLAttributes} from "react";
    import styles from "./login.module.css";
    interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
        inputRef?: ForwardedRef<HTMLInputElement>,
        error?: string,
        value?: string
        className: string
    }
    export const Input = (
        {
            inputRef,
            error = "",
            value = "",
            className,
            ...props
        }: InputProps
    ) => {
        return (
            <label className={styles.label}>
                <input
                    className={className}
                    ref={inputRef} //inputRef — реф для доступа к его дочернему элементу <input>;
                    {...props}
                    value={value}
                />
                <span className={styles.error}>
                    {error || ""} //error — ошибку валидации;
                </span>
            </label>
        )
    };
    //кастомный хук
    export function useFormWithValidation<T>(
        selector: (state: RootState) => T,
        setFormValue: ActionCreatorWithPayload<TFieldType<T>>,
        validators: TFormValidators<T>
    ): TUseFormWithValidation<T> {
        const values = useSelector(selector);
        const [errors, setErrors] =
            React.useState<TErrorState<T>>(initError<T>(values));
        const [isValid, setIsValid] = React.useState(false);
        const dispatch = useDispatch();

        const handleChange = (evt: ChangeEvent<HTMLInputElement>) => {
            const input = evt.target;
            const value = input.value;
            const name = input.name as keyof T;
            const isValid = validators[name]?.validator(value) ?? true;
            dispatch(setFormValue({ field: name, value}));
            setErrors({
                ...errors,
                [name]: !isValid ? validators[name]!.message : undefined
            });
            setIsValid(isValid);
        };
        return { values, handleChange, errors, isValid };
    }
    // Функция initError создаёт объект с такими же ключами, как у того,
    //  с которым работает хук, но с пустыми строками в значениях
    function initError<T>(a: T): TErrorState<T> {
        return Object.keys(a as object).reduce((acc, k) => {
            acc[k as keyof T] = ""; return acc
        }, {} as TErrorState<T>);
    }
