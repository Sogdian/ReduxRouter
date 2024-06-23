import logo from './logo.svg';
import './App.css';

import ReactDOM from "react-dom/client";
import React from "react";
import { store } from "./services/store";
import { Provider } from "react-redux"

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <React.StrictMode>
      <Provider store={store}> //Теперь наше хранилище доступно всем компонентам приложения начиная с компонента App .
        <App />
      </Provider>
    </React.StrictMode>
);

export default App;
