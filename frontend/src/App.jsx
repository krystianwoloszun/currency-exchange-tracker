import { useMemo, useState } from "react";
import CurrencyPage from "./pages/CurrencyPage";
import Login from "./components/Login";
import { clearToken, getToken } from "./auth/token";
import styles from "./App.module.css";

function App() {
  const [token, setTokenState] = useState(() => getToken());
  const isAuthed = useMemo(() => Boolean(token), [token]);

  const setToken = (t) => setTokenState(t);

  const logout = () => {
    clearToken();
    setToken(null);
  };

  return (
    <div className="App">
      {isAuthed ? (
        <div className={styles.authed}>
          <div className={styles.topBar}>
            <button onClick={logout}>Logout</button>
          </div>
          <div className={styles.content}>
            <CurrencyPage onUnauthorized={logout} />
          </div>
        </div>
      ) : (
        <div className={styles.page}>
          <Login onLogin={(t) => setToken(t)} />
        </div>
      )}
    </div>
  );
}

export default App;
