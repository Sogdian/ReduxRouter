//index.js

import {StrictMode} from "react";
import * as ReactDOM from "react-dom/client";
import {
    Navigate,
    RouterProvider,
} from "react-router-dom";
import { router } from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router}>
            <App />
            <Route path="/profile">
                {!loggedIn ? <Navigate to="/login" /> : <ProfilePage />}
            </Route>
        </RouterProvider>
    </StrictMode>
);