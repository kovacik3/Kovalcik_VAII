# Rezervačný portál posilňovne

Webová aplikácia pre manažment trénerov, tréningov a rezervácií v posilňovni.  
Používateľ si vie pozrieť ponuku tréningov, trénerov a vytvoriť rezerváciu na konkrétny tréning.

---

## Inicializácia databázy a seedovanie užívateľov

- Importuj databázovú schému:
  - otvor `MySQL/schema.sql` a spusti ho v MySQL Workbench **alebo** importuj cez CLI do databázy, ktorú máš nastavenú v `DB_NAME`.
  - poznámka: v schéme je `CREATE SCHEMA IF NOT EXISTS gym_rezervacie2` + `USE gym_rezervacie2`. Ak používaš iný názov DB, zlaď to s `DB_NAME`.
- Vytvor `.env` v root priečinku so základnými premennými: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SESSION_SECRET`, a predvolenými účtami vrátane všetkých potrebných údajov: `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `TRAINER_EMAIL`, `TRAINER_USERNAME`, `TRAINER_PASSWORD`, `USER_ONE_EMAIL`, `USER_ONE_USERNAME`, `USER_ONE_PASSWORD`, `USER_TWO_EMAIL`, `USER_TWO_USERNAME`, `USER_TWO_PASSWORD`.
- **POVINNÉ:** `SESSION_SECRET` musí byť **silný náhodný reťazec** (odporúčané 32+ znakov). Slúži na podpis session cookie – slabá hodnota je bezpečnostné riziko.
- Nainštaluj závislosti cez `npm install`.
- Spusti `npm run seed` na vloženie (alebo aktualizáciu) admina, trénera a dvoch bežných užívateľov (`user1` a `user2`). Skript zmení heslá pre existujúce e-maily a vypíše výsledky v konzole.
- Po úspešnom seedovaní sa môžeš prihlásiť pomocou štandardných účtov:
  - **admin:** admin@gym.local / admin123 (`role: admin`)
  - **trainer:** trainer@gym.local / trainer123 (`role: trainer`)
  - **user1:** user1@gym.local / userone123 (`role: user`)
  - **user2:** user2@gym.local / usertwo123 (`role: user`)

Ak chceš experimentovať s inými prihlasovacími údajmi, zmeň hodnoty v `.env` a znovu spusti `npm run seed`.

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
  - zoznam rezervácií (join s tréningom)
  - **user** vidí iba svoje rezervácie
  - **admin/trainer** vidí všetky rezervácie

- `GET /rezervacie/new?treningId=:id`
  - formulár na vytvorenie rezervácie na konkrétny tréning
  - dostupné iba pre rolu **user** (admin/trainer nemôžu vytvárať rezervácie)

- `POST /rezervacie/new`
  - vytvorí rezerváciu
  - validácia na serveri:
    - session_id (povinné, číslo, musí existovať v tabuľke `sessions`)
    - poznámka (max. dĺžka, voliteľná)
  - "meno klienta" sa **nezadáva** vo formulári – server ho berie z profilu prihláseného používateľa (preferuje `username`, fallback na e-mail)

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

- Implementovaná v `src/validators/*` (export cez `src/validators/index.js`).
- Používané funkcie:
  - `validateTrainer(body)`
  - `validateTraining(body)`
  - `validateReservation(body)`
  - `validateRegistration(body)`
  - `validateProfileUpdate(body)`
- Každý POST route volá príslušnú validačnú funkciu ešte pred zápisom do databázy.

Poznámka: súbor `src/validacia-server.js` je len backward-compatible wrapper (ak by sa niekde používali staré názvy funkcií), no aktuálne controllery používajú priamo `src/validators`.
- Ak sú chyby:
  - údaje sa neuložia
  - formulár sa zobrazí znova s vypísanými chybami a pôvodnými hodnotami.

---

