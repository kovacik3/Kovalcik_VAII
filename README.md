# Rezervačný portál posilňovne

Webová aplikácia pre manažment trénerov, tréningov a rezervácií v posilňovni.  
Používateľ si vie pozrieť ponuku tréningov, trénerov a vytvoriť rezerváciu na konkrétny tréning.

---

## Použité technológie

- **Backend:** Node.js, Express
- **Frontend:** EJS šablóny, HTML5, CSS3, Bootstrap 5, JavaScript
- **Databáza:** MySQL (mysql2 + connection pool)

---

## Hlavné funkcie

- CRUD pre **trénerov** (treneri):
  - vytvorenie nového trénera
  - úprava existujúceho trénera
  - zmazanie trénera
  - výpis všetkých trénerov

- CRUD pre **tréningy** (treningy / sessions):
  - vytvorenie tréningu so začiatkom, koncom, kapacitou a trénerom
  - úprava tréningu
  - zmazanie tréningu
  - výpis všetkých tréningov

- **Rezervácie**:
  - vytvorenie rezervácie na konkrétny tréning
  - výpis všetkých rezervácií
  - zmazanie rezervácie

- **Úvodná stránka**:
  - zobrazenie najbližších (max 3) nadchádzajúcich tréningov
  - preklik na detail rezervácie

---

## Stránky a routy

### Domov

- `GET /`
  - načíta 3 najbližšie tréningy z tabuľky `sessions`
  - zobrazuje názov tréningu, deň v týždni a čas začiatku

### Tréneri

- `GET /treneri`
  - zoznam všetkých trénerov

- `GET /treneri/new`
  - formulár na pridanie trénera

- `POST /treneri/new`
  - vytvorí nového trénera
  - validácia na serveri: meno, špecializácia

- `GET /treneri/:id/edit`
  - formulár na úpravu existujúceho trénera

- `POST /treneri/:id/edit`
  - aktualizuje trénera
  - opäť serverová validácia

- `POST /treneri/:id/delete`
  - zmaže trénera

### Tréningy

- `GET /treningy`
  - zoznam všetkých tréningov
  - join s tabuľkou trénerov (ak má tréning priradeného trénera)

- `GET /treningy/new`
  - formulár na pridanie tréningu

- `POST /treningy/new`
  - vytvorí nový tréning
  - validácia na serveri:
    - názov (dĺžka)
    - začiatok a koniec (formát, koniec po začiatku)
    - kapacita (1–1000)
    - trainer_id (ak je zadané, musí byť číslo)

- `GET /treningy/:id/edit`
  - formulár na úpravu tréningu

- `POST /treningy/:id/edit`
  - aktualizuje tréning
  - rovnaké pravidlá validácie ako pri vytvorení

- `POST /treningy/:id/delete`
  - zmaže tréning

### Rezervácie

- `GET /rezervacie`
  - zoznam všetkých rezervácií (join s tréningom)

- `GET /rezervacie/new?treningId=:id`
  - formulár na vytvorenie rezervácie na konkrétny tréning

- `POST /rezervacie/new`
  - vytvorí rezerváciu
  - validácia na serveri:
    - session_id (povinné, číslo, musí existovať v tabuľke `sessions`)
    - meno klienta (dĺžka)
    - poznámka (max. dĺžka, voliteľná)

- `POST /rezervacie/:id/delete`
  - zmaže rezerváciu

---

## Validácia formulárov

### Klientská validácia

- Prebieha v prehliadači pomocou JavaScriptu (`/js/form-validation.js`).
- Kontroluje:
  - povinné polia
  - základné formáty (napr. prázdne stringy, dĺžky)
- Výsledok sa zobrazuje priamo vo formulári.

### Serverová validácia

- Implementovaná v súbore `validacia-server.js`.
- Funkcie:
  - `validujNovehoTrenera(body)`
  - `validujNovyTrening(body)`
  - `validujNovuRezervaciju(body)`
- Každý POST route volá príslušnú validačnú funkciu ešte pred zápisom do databázy.
- Ak sú chyby:
  - údaje sa neuložia
  - formulár sa zobrazí znova s vypísanými chybami a pôvodnými hodnotami.

---

