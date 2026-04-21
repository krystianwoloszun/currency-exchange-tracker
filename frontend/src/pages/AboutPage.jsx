import "./AboutPage.css";

export default function AboutPage() {
    return (
        <div className="about-page">
            <header className="about-header">
                <h1>O aplikacji</h1>
                <p>Nowoczesne narzędzie do śledzenia kursów walut i cen złota.</p>
            </header>

            <main className="about-layout">
                <section className="about-main">
                    <h2>Czym jest KursyWalut?</h2>
                    <p>
                        Aplikacja <strong>KursyWalut</strong> to kompleksowe rozwiązanie full-stackowe, które pozwala na bieżąco monitorować
                        notowania walut oraz ceny złota publikowane przez Narodowy Bank Polski (NBP).
                        Projekt łączy w sobie wydajny backend w technologii Spring Boot oraz nowoczesny, responsywny interfejs stworzony w React.
                    </p>

                    <h3>Główne funkcjonalności:</h3>
                    <ul>
                        <li><strong>Aktualne kursy:</strong> Pobieranie najnowszych danych z tabeli A NBP.</li>
                        <li><strong>Kalkulator walutowy:</strong> Szybkie przeliczanie kwot między PLN a wybraną walutą.</li>
                        <li><strong>Historia notowań:</strong> Przeglądanie zmian kursów i cen złota na interaktywnych wykresach w wybranym zakresie dat.</li>
                        <li><strong>Bezpieczeństwo:</strong> System rejestracji i logowania oparty o tokeny JWT (JSON Web Token).</li>
                    </ul>

                    <h3>Wykorzystane technologie:</h3>
                    <p>
                        <strong>Backend:</strong> Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, H2 Database. <br />
                        <strong>Frontend:</strong> React 19, Vite, CSS Modules, Chart.js.
                    </p>

                    <div className="hosting-note">
                        <h4>Ważna informacja o hostingu</h4>
                        <p>
                            Aplikacja korzysta z darmowej architektury serwerowej (Render). Ze względu na to, przy dłuższym braku aktywności,
                            serwer backendowy przechodzi w stan uśpienia. Jeśli dane nie ładują się od razu, wykonaj dowolną akcję
                            (np. spróbuj się zalogować lub zarejestrować) – serwer "obudzi się" w ciągu kilkunastu sekund.
                        </p>
                    </div>

                    <div className="github-section">
                        <h3>Open Source</h3>
                        <p>
                            Projekt jest oprogramowaniem typu Open Source. Kod źródłowy jest dostępny publicznie w serwisie GitHub.
                            Zachęcam do przeglądania kodu, zgłaszania uwag lub własnych usprawnień!
                        </p>
                        <a
                            href="https://github.com/krystianwoloszun/kursywalut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="github-button"
                        >
                            Zobacz projekt na GitHub
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
