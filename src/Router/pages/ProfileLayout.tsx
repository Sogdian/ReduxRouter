import { Link, Outlet } from "react-router-dom"

export function ProfileLayout() {
    return (
        <>
            <nav>
                <ul>
                    <li><Link to="/profile">Профиль</Link></li>
                    <li><Link to="/profile/edit">Редактировать профиль</Link></li>
                    <li><Link to="/profile/archive">Архивные чаты</Link></li>
                </ul>
            </nav>

            <Outlet /> //На место компонента Outlet рендерится сопоставленный дочерний маршрут. Это очень похоже на работу пропса children, только с маршрутизацией.
        </>
    )
}