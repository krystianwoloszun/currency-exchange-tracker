import styles from "./NavigationBanner.module.css";

const navItems = [
    {id: "calculator", label: "Kalkulator"},
    {id: "history", label: "Historia"},
    {id: "gold", label: "Zloto"},
    {id: "about", label: "O aplikacji"},
];

export default function NavigationBanner({currentPage, onNavigate, onLogout}) {
    const showNavigation = Boolean(onNavigate);
    const showLogout = Boolean(onLogout);

    return (
        <header className={styles.banner}>
            <div className={styles.brandBlock}>
                <span className={styles.eyebrow}>Kursy Walut</span>
                <strong className={styles.title}>Aplikacja NBP</strong>
            </div>

            {showNavigation ? (
                <nav className={styles.nav} aria-label="Nawigacja aplikacji">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`${styles.navButton} ${currentPage === item.id ? styles.navButtonActive : ""}`}
                            aria-current={currentPage === item.id ? "page" : undefined}
                            onClick={() => onNavigate?.(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    {showLogout && (
                        <button
                            type="button"
                            className={`${styles.logoutButton} ${styles.logoutButtonMobile}`}
                            onClick={onLogout}
                        >
                            Wyloguj sie
                        </button>
                    )}
                </nav>
            ) : (
                <div className={styles.bannerInfo}>
                    Zaloguj sie lub utworz konto, aby korzystac z funkcji aplikacji.
                </div>
            )}

            {showLogout && (
                <button
                    type="button"
                    className={`${styles.logoutButton} ${styles.logoutButtonDesktop}`}
                    onClick={onLogout}
                >
                    Wyloguj sie
                </button>
            )}
        </header>
    );
}
