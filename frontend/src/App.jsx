import { useMemo, useState } from "react";
import CurrencyPage from "./pages/CurrencyPage";
import Login from "./components/Login";
import { clearToken, getToken } from "./auth/token";

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
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
            <button onClick={logout}>Logout</button>
          </div>
          <CurrencyPage onUnauthorized={logout} />
        </div>
      ) : (
        <Login onLogin={(t) => setToken(t)} />
      )}
    </div>
  );
}

export default App;

