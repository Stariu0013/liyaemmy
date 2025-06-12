import React, {useState} from "react";
import {useTranslation} from "react-i18next";

export const Navbar = () => {
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="navbar">
            <div className="container">
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === "light" ? t("darkMode") : t("lightMode")}
                </button>

                <h1>{t("appTitle")}</h1>

                <div className="language-switcher">
                    <button onClick={() => changeLanguage("en")}>EN</button>
                    <button onClick={() => changeLanguage("uk")}>UK</button>
                </div>
            </div>
        </div>
    )
}