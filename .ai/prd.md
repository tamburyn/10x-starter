# Dokument wymagań produktu (PRD) - BangProof B2B

## 1. Przegląd produktu
Platforma B2B dla sklepu na Shopify umożliwiająca realizację zamówień oraz rezerwację produktów. System zapewnia:
- Aktualizację danych o dostępności produktów w czasie rzeczywistym dzięki integracji z Shopify i Big Query.
- Backend zbudowany w oparciu o n8n, sterowany za pomocą webhooków, co umożliwia automatyzację procesów.
- Proces rejestracji i logowania, który pobiera kompletne dane firmy i użytkownika bez dodatkowych kroków autoryzacyjnych.
- Automatyczne wystawianie proformy w systemie wFirma po zakończeniu procesu zakupu, a następnie wysyłkę faktury po realizacji zamówienia.

## 2. Problem użytkownika
Klienci B2B potrzebują szybkiego i niezawodnego systemu, który:
- Zapewnia dostęp do aktualnych informacji o stanach magazynowych i możliwościach produkcyjnych.
- Umożliwia łatwą rezerwację oraz zakup produktów bez skomplikowanych procesów.
- Automatyzuje procesy związane z wystawianiem dokumentów sprzedażowych (proformy, faktury).
- Umożliwia łatwą rejestrację oraz logowanie, minimalizując bariery dostępu.

## 3. Wymagania funkcjonalne
- System umożliwia rezerwację oraz zakup produktów.
- Dane o stanach magazynowych i możliwościach produkcyjnych są pobierane w czasie rzeczywistym z Shopify oraz Big Query za pomocą webhooków.
- Backend oparty jest na n8n, który zarządza automatyzacją procesów poprzez webhooki.
- Proces rejestracji i logowania obejmuje pobieranie pełnych danych firmy i użytkownika.
- Po zakończeniu zakupu system automatycznie wysyła dane do webhooka, aby wystawić proformę w systemie wFirma.
- Po realizacji zamówienia system wysyła dane do odpowiedniego webhooka w celu wystawienia faktury.
- Specyfikacja integracji z systemem wFirma obejmuje: format danych, częstotliwość wywołań oraz mechanizmy potwierdzania transakcji (do dalszego ustalenia).

## 4. Granice produktu
- Produkt skupia się na integracji danych z Shopify i Big Query oraz automatyzacji procesów zamówień i dokumentacji sprzedażowej poprzez backend n8n.
- System nie obejmuje ręcznej weryfikacji stanów magazynowych czy zarządzania logistycznego.
- Szczegóły dotyczące integracji z systemem wFirma nie są ostatecznie ustalone i mogą być rozwijane w kolejnych iteracjach.
- Procesy związane z wewnętrzną obsługą magazynu (np. fizyczne zarządzanie zapasami) nie są zawarte w zakresie produktu.

## 5. Historyjki użytkowników
US-001: Rejestracja i logowanie
- Tytuł: Rejestracja i logowanie użytkownika
- Opis: Użytkownik (klient B2B) rejestruje się oraz loguje, podając pełne dane firmy i dane osobowe bez dodatkowych kroków autoryzacyjnych.
- Kryteria akceptacji:
  - Użytkownik może podać wszystkie wymagane dane firmy i dane osobowe.
  - System umożliwia natychmiastowe logowanie po pomyślnej rejestracji.
  - Użytkownik otrzymuje potwierdzenie rejestracji i logowania.

US-002: Podgląd stanów magazynowych
- Tytuł: Podgląd aktualnych stanów magazynowych i możliwości produkcyjnych
- Opis: Po zalogowaniu użytkownik ma dostęp do interfejsu prezentującego dane o dostępności produktów oraz szacowane terminy realizacji, pobierane w czasie rzeczywistym.
- Kryteria akceptacji:
  - Interfejs wyświetla aktualne dane z Shopify i Big Query.
  - Dane są aktualizowane w czasie rzeczywistym z informacją o dostępności i szacowanych terminach.
  - Użytkownik może łatwo zidentyfikować, które produkty są dostępne do rezerwacji lub zakupu.

US-003: Rezerwacja produktów
- Tytuł: Rezerwacja wybranych produktów
- Opis: Użytkownik może zarezerwować produkty, które chce zakupić, aby zabezpieczyć je przed wykupieniem przez innych klientów.
- Kryteria akceptacji:
  - Użytkownik wybiera produkty do rezerwacji.
  - System potwierdza rezerwację poprzez komunikat oraz aktualizację statusu produktu.
  - Rezerwacja obowiązuje przez określony czas (do ustalenia) i ulega automatycznemu wygaśnięciu.

US-004: Zakup produktów
- Tytuł: Zakup produktów
- Opis: Użytkownik przechodzi do procesu zakupu wybranych (dostępnych lub zarezerwowanych) produktów. Proces obejmuje weryfikację dostępności oraz finalizację zamówienia.
- Kryteria akceptacji:
  - Użytkownik może wybrać produkty z listy dostępnych lub zarezerwowanych.
  - System weryfikuje dostępność produktów przed potwierdzeniem zakupu.
  - Po potwierdzeniu, użytkownik otrzymuje potwierdzenie zamówienia z informacją o dalszych krokach.

US-005: Automatyczne wystawianie proformy i faktury
- Tytuł: Automatyczne wystawienie dokumentów sprzedażowych
- Opis: Po zakończeniu procesu zakupu, system automatycznie wystawia proformę w systemie wFirma. Po realizacji zamówienia, system wysyła dane do webhooka w celu wystawienia faktury.
- Kryteria akceptacji:
  - Po zakończeniu zakupu system wysyła dane do webhooka integrującego się z systemem wFirma w celu wystawienia proformy.
  - Po realizacji zamówienia system wysyła dane do odpowiedniego webhooka, uruchamiając proces wystawienia faktury.
  - Wszystkie dane przesyłane w webhookach są zgodne z ustalonym (choć jeszcze nie ostatecznym) formatem i zawierają wszystkie niezbędne informacje.

## 6. Metryki sukcesu
- Minimum 90% użytkowników kończy proces rejestracji i logowania.
- Dokładność danych o stanach magazynowych i możliwościach produkcyjnych na poziomie 98%.
- Skrócenie czasu obsługi zamówienia o co najmniej 30% dzięki automatyzacji.
- Automatyczne wystawienie proformy i faktury dla 100% zakończonych zamówień.
- Uzyskanie średniej oceny interfejsu użytkownika na poziomie co najmniej 4/5 w badaniach satysfakcji.
