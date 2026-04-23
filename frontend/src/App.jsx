import { useEffect, useState } from "react";
import CurrencyPage from "./pages/CurrencyPage";
import HistoryPage from "./pages/HistoryPage";
import GoldPage from "./pages/GoldPage";
import AboutPage from "./pages/AboutPage";
import Login from "./components/Login";
import Register from "./components/Register";
import NavigationBanner from "./components/NavigationBanner";
import { apiFetch, AuthError } from "./api/apiFetch";
import { API_BASE_URL } from "./config/apiBaseUrl";
import styles from "./App.module.css";

function App() {
    const [isAuthed, setIsAuthed] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [currentPage, setCurrentPage] = useState("calculator");
    const [authView, setAuthView] = useState("login");

    useEffect(() => {
        let mounted = true;

        const checkAuth = async () => {
            try {
                await apiFetch(`${API_BASE_URL}/currency/available`);
                if (!mounted) return;
                setIsAuthed(true);
            } catch (error) {
                if (!mounted) return;
                if (error instanceof AuthError) {
                    setIsAuthed(false);
                    return;
                }
                setIsAuthed(false);
            } finally {
                if (mounted) setAuthChecking(false);
            }
        };

        checkAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const handleLogin = () => {
        setIsAuthed(true);
    };

    const logout = async () => {
        try {
            await apiFetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
            });
        } catch {
            // Force a local logout even if the backend is temporarily unavailable.
        }

        setIsAuthed(false);
        setCurrentPage("calculator");
        setAuthView("login");
    };

    const renderPage = () => {
        switch (currentPage) {
            case "about":
                return <AboutPage />;
            case "gold":
                return <GoldPage onUnauthorized={logout} />;
            case "history":
                return <HistoryPage onUnauthorized={logout} />;
            case "calculator":
            default:
                return <CurrencyPage onUnauthorized={logout} />;
        }
    };

    return (
        <div className="App">
            {authChecking ? (
                <div className={styles.authed}>
                    <NavigationBanner />
                    <div className={styles.page}>
                        <p>Sprawdzanie sesji...</p>
                    </div>
                    <footer className={styles.footer}>
                        <span>© 2026 Krystian Woloszun. All Rights Reserved.</span>
                    </footer>
                </div>
            ) : isAuthed ? (
                <div className={styles.authed}>
                    <NavigationBanner currentPage={currentPage} onNavigate={setCurrentPage} onLogout={logout} />
                    <div className={styles.content}>
                        {renderPage()}
                    </div>
                    <footer className={styles.footer}>
                        <span>© 2026 Krystian Woloszun. All Rights Reserved.</span>
                    </footer>
                </div>
            ) : (
                <div className={styles.authed}>
                    <NavigationBanner />
                    <div className={styles.page}>
                        {authView === "register" ? (
                            <Register onBackToLogin={() => setAuthView("login")} />
                        ) : (
                            <Login onLogin={handleLogin} onGoToRegister={() => setAuthView("register")} />
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
