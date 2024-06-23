import {
    createRoutesFromElements,
    createBrowserRouter,
    Route, Routes,
} from "react-router-dom";

import ListPage , {
    loader as chatLoader,
} from "./pages/list";
import {NotFoundPage} from "./pages/not-found";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Routes>
            <Route path="*" element={<NotFoundPage />} />
                <Route path="/" element={<HomePage/>} />
                    <Route path="/list" loader={chatLoader} element={<ListPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfileLayout/>}>
                    <Route index element={<ProfilePage />} />
                    <Route path="edit" element={<ProfileForm/>} />
                    <Route path="archive" element={<ProfileListPage />} />
            </Route>
        </Routes>
    )
); 