import {useMemo, useState} from "react";
import CurrencyPage from "./pages/CurrencyPage";
import HistoryPage from "./pages/HistoryPage";
import Login from "./components/Login";
import NavigationBanner from "./components/NavigationBanner";
import {clearToken, getToken} from "./auth/token";
import styles from "./App.module.css";

function App() {
    const [token, setTokenState] = useState(() => getToken());
    const [currentPage, setCurrentPage] = useState("calculator");
    const isAuthed = useMemo(() => Boolean(token), [token]);

    const setToken = (t) => setTokenState(t);

    const logout = () => {
        clearToken();
        setToken(null);
        setCurrentPage("calculator");
    };

    const renderPage = () => {
        switch (currentPage) {
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
                </div>
            ) : (
                <div className={styles.page}>
                    <Login onLogin={(t) => setToken(t)}/>
                </div>
            )}
        </div>
    );
}

export default App;
