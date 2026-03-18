import styles from "./NavigationBanner.module.css";

const navItems = [
    {id: "calculator", label: "Kalkulator"},
];

export default function NavigationBanner({onLogout}) {
    return (
        <header className={styles.banner}>
            <nav className={styles.nav} aria-label="Nawigacja aplikacji">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`${styles.navButton} ${styles.navButtonActive}`}
                        aria-current="page"
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
