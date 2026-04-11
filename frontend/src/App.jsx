import {useMemo, useState} from "react";
import CurrencyPage from "./pages/CurrencyPage";
import HistoryPage from "./pages/HistoryPage";
import GoldPage from "./pages/GoldPage";
import AboutPage from "./pages/AboutPage";
import Login from "./components/Login";
import Register from "./components/Register";
import NavigationBanner from "./components/NavigationBanner";
import {clearToken, getToken} from "./auth/token";
import styles from "./App.module.css";

function App() {
    const [token, setTokenState] = useState(() => getToken());
    const [currentPage, setCurrentPage] = useState("calculator");
    const [authView, setAuthView] = useState("login");
    const isAuthed = useMemo(() => Boolean(token), [token]);

    const setToken = (t) => setTokenState(t);

    const logout = () => {
        clearToken();
        setToken(null);
        setCurrentPage("calculator");
    };

    const renderPage = () => {
        switch (currentPage) {
            case "about":
                return <AboutPage/>;
            case "gold":
                return <GoldPage onUnauthorized={logout}/>;
            case "history":
                return <HistoryPage onUnauthorized={logout}/>;
            case "calculator":
            default:
                return <CurrencyPage onUnauthorized={logout}/>;
        }
    };

    return (
        <div className="App">
            {isAuthed ? (
                <div className={styles.authed}>
                    <NavigationBanner currentPage={currentPage} onNavigate={setCurrentPage} onLogout={logout}/>
                    <div className={styles.content}>
                        {renderPage()}
                    </div>
                    <footer className={styles.footer}>
                        <span>© 2026 Krystian Woloszun. All Rights Reserved.</span>
                    </footer>
                </div>
            ) : (
                <div className={styles.authed}>
                    <NavigationBanner/>
                    <div className={styles.page}>
                        {authView === "register" ? (
                            <Register onBackToLogin={() => setAuthView("login")}/>
                        ) : (
                            <Login onLogin={(t) => setToken(t)} onGoToRegister={() => setAuthView("register")}/>
                        )}
                    </div>
                    <footer className={styles.footer}>
                        <span>© 2026 Krystian Woloszun. All Rights Reserved.</span>
                    </footer>
                </div>
            )}
        </div>
    );
}

export default App;
