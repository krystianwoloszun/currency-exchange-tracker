import styles from "./NavigationBanner.module.css";

const navItems = [
    {id: "calculator", label: "Kalkulator"},
    {id: "history", label: "Historia"},
];

export default function NavigationBanner({currentPage, onNavigate, onLogout}) {
    return (
        <header className={styles.banner}>
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
            </nav>

            <button type="button" className={styles.logoutButton} onClick={onLogout}>
                Logout
            </button>
        </header>
    );
}
