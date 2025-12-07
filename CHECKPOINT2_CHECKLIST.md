# CHECKLIST - DRUHÝ CHECKPOINT VAII

## Povinné požiadavky na Termín 2 (max. 10 bodov)

Táta aplikácia implementuje kompletný rezervačný systém pre posilňovňu s CRUD operáciami, validáciou a responzívnym dizajnom.

---

## ✅ 1. Uloženie projektu v GIT - **100% HOTOVO**
- [x] Projekt je v Git repozitári (`Kovalcik_VAII`)
- [x] Pravidelné commity s popismi
- [x] README.md s kompletným návodom na inštaláciu (310 riadkov)
  - [x] Požiadavky (Node.js, MySQL)
  - [x] Inštalácia a klonovanie
  - [x] SQL schéma pre všetky tabuľky

---

## ⚠️ 2. CSS pravidlá (14/20+ hotovo, potrebuje rozšírenie)

### Hotové CSS pravidlá (14 - všetky extern v `public/css/styles.css`):
- [x] 1. `body` - margin, font-family, background-color
- [x] 2. `.container` - max-width: 960px, margin: auto, padding
- [x] 3. `.header` - background-color: #1a1919, color: white
- [x] 4. `.header-inner` - flexbox (flex-wrap, align-items, justify-content)
- [x] 5. `.logo` - margin
- [x] 6. `.nav a` - color, margin, text-decoration, font-weight
- [x] 7. `.nav a:hover` - text-decoration: underline (hover efekt)
- [x] 8. `.main` - padding
- [x] 9. `.footer` - background, color, padding, margin-top
- [x] 10. `.table` - width: 100%, border-collapse, background
- [x] 11. `.table th, .table td` - border, padding
- [x] 12. `.table th` - background-color, text-align
- [x] 13. `.list` - background, padding, border-radius, list-style
- [x] 14. `.list li` - margin-bottom

### **Chýbajúce CSS pravidlá (potrebných 6+):**
- [ ] `.form-group` - margin-bottom, display: flex/block, width
- [ ] `input` - padding, border, border-radius, font-size
- [ ] `input:focus` - outline, border-color, box-shadow
- [ ] `button` - padding, background-color, color, border, cursor: pointer
- [ ] `button:hover` - background-color change, transition
- [ ] `.error-message` alebo `.alert` - color: red, background, padding, border
- [ ] `label` - display, font-weight, margin-bottom
- [ ] `textarea` - padding, border, font-family, resize
- [ ] `@media (max-width: 768px)` - responzívny dizajn pre mobily
- [ ] `@media (max-width: 480px)` - malé obrazovky

**STATUS: 14/20 (70%) - POTREBUJE +6 PRAVIDIEL**

---

## ⚠️ 3. Rozloženie webu (layout) a responzívny dizajn - **80% HOTOVO**

### Hotové:
- [x] **Header** (`partials/header.ejs`)
  - [x] Logo a názov
  - [x] Navigácia (Domov, Tréneri, Tréningy, Moje rezervácie)
  - [x] Flexbox layout
  - [x] Tmavé pozadie
  
- [x] **Footer** (`partials/footer.ejs`)
  - [x] Copyright s dynamickým rokom
  - [x] Tmavé pozadie ako header

- [x] **Container layout**
  - [x] Max-width: 960px
  - [x] Centrované s auto margins
  - [x] Padding: 16px

### Chýba:
- [X] **Responzívny dizajn (@media queries)**
  - [X] Tablet (768px a menej)
  - [X] Mobil (480px a menej)
  - [X] Flexbox úpravy pre malé obrazovky

**STATUS: 100% - POTREBUJE @MEDIA QUERIES**

---

## ✅ 4. CRUD operácie na strane servera - **100% HOTOVO**

Všetky operácie sú implementované v `src/app.js` s kompletnou logiku a chybovým spracovaním.

### TRÉNERИ (TRAINERS):
- [x] **CREATE** - `POST /treneri/new` - vloženie s validáciou (name, specialization)
- [x] **READ** - `GET /treneri` - zoznam všetkých trénerov
- [x] **UPDATE** - `POST /treneri/:id/edit` - úprava s validáciou
- [x] **DELETE** - `POST /treneri/:id/delete` - vymazanie z DB

### TRÉNINGY:
- [x] **CREATE** - `POST /treningy/new` - vloženie s komplexnou validáciou
  - [x] Kontrola: title, start_at, end_at, capacity
  - [x] Validácia: start_at < end_at, capacity > 0
  - [x] DateTime konverzia pre MySQL
  
- [x] **READ** - `GET /treningy` - zoznam s LEFT JOIN na trainers
  - [x] Zobrazuje ID, title, časy, kapacitu, meno trénera
  
- [x] **UPDATE** - `POST /treningy/:id/edit` - úprava s validáciou
- [x] **DELETE** - `POST /treningy/:id/delete` - vymazanie s cascading (na FK)

### REZERVÁCIE (RESERVATIONS):
- [x] **CREATE** - `POST /rezervacie/new` - vloženie s validáciou
  - [x] Kontrola: session_id, client_name
  - [x] Overenie existencie session v DB
  
- [x] **READ** - `GET /rezervacie` - zoznam s JOIN na sessions
  - [x] Zobrazuje client_name, note, session_title, čas
  
- [x] **DELETE** - `POST /rezervacie/:id/delete` - vymazanie
- [ ] UPDATE - (nie je v požiadavkách)

**STATUS: 100% - VŠETKY POTREBNÉ CRUD OPERÁCIE SÚ HOTOVÉ**

---

## ✅ 5. Grafické rozhranie k CRUD operáciám - **100% HOTOVO**

### Formuláre pre CREATE:
- [x] `treneri-new.ejs` - formulár s 2 poľami (name, specialization)
- [x] `treningy-new.ejs` - formulár s datetime-local, capacity, trainer_id
- [x] `rezervacie-new.ejs` - formulár s client_name, note, skrytý session_id

### Formuláre pre UPDATE:
- [x] `treneri-edit.ejs` - editácia mena a špecializácie
- [x] `treningy-edit.ejs` - editácia všetkých atribútov

### Tlačidlá a akcie pre DELETE:
- [x] Inline formuláre s POST metódou
- [x] Konfirmácia dialóg: `onclick="return confirm('Naozaj zmazať...?')"`
- [x] Tlačidlá v tabuľkách

### Zoznamové stránky:
- [x] `treneri.ejs` - tabuľka s columns: Meno, Špecializácia, Akcie
- [x] `sessions.ejs` - tabuľka s columns: Názov, Časy, Kapacita, Tréner, Akcie
- [x] `rezervacie.ejs` - zoznam s columns: Klient, Poznámka, Tréning, Čas, Akcie
- [x] `index.ejs` - domovská stránka

### Chybové správy:
- [x] Zobrazovanie chýb v EJS šablónach (color: red)
- [x] Zachovanie formulárových údajov pri chybe

**STATUS: 100% - VŠETKY ŠABLÓNY SÚ HOTOVÉ**

---

## ❌ 6. Validácia na strane KLIENTA - **0% HOTOVO - URGENTNE POTREBNÉ**

### Súbor `public/js/validation.js` - **CHÝBA CELÝ**

Potrebné prvky:
- [ ] Minimálne 50 riadkov JavaScriptu
- [ ] Validačné funkcie:
  - [ ] `validateName(name)` - nie je prázdne, min. 2-3 znaky
  - [ ] `validateSpecialization(spec)` - nie je prázdne
  - [ ] `validateCapacity(num)` - je kladné číslo, > 0
  - [ ] `validateDateTime(start, end)` - start < end
  - [ ] `validateEmail(email)` - ak bude potrebný
  - [ ] `validateClientName(name)` - nie je prázdne
  
- [ ] Event listeners:
  - [ ] `addEventListener('submit')` na formuláry
  - [ ] `addEventListener('input')` pre real-time validáciu
  - [ ] `addEventListener('blur')` pre validáciu po opustení
  
- [ ] DOM manipulácia:
  - [ ] `document.querySelector()`, `getElementById()`
  - [ ] `classList.add('error')`, `classList.remove('error')`
  - [ ] Dynamické vytvorenie `<span>` elementov na chyby
  - [ ] `.textContent` miesto `.innerHTML` pre bezpečnosť
  
- [ ] Real-time feedback:
  - [ ] Zobrazenie/skrytie chybových správ
  - [ ] Zmena farby border-u pri chybe
  - [ ] Zákaz submitu ak sú chyby

**PRIORITA: VYSOKÁ - CHÝBAJÚ 2 BODY ZA TOTO**

---

## ⚠️ 7. Validácia na strane SERVERA - **70% HOTOVO**

### Hotové (v `src/app.js`):
- [x] Validácia v `POST /treneri/new`:
  - [x] Kontrola: name a specialization nie sú prázdne
  - [x] `trim()` pre odstránenie whitespace
  - [x] Chybové správy sa vracajú do formulára
  
- [x] Validácia v `POST /sessions/new`:
  - [x] Kontrola všetkých povinných polí
  - [x] `isNaN()` a `Number()` konverzia
  - [x] Kontrola: `start_at >= end_at` (chyba)
  - [x] Kapacita musí byť > 0
  - [x] DateTime konverzia: "YYYY-MM-DDTHH:MM" → "YYYY-MM-DD HH:MM:SS"
  
- [x] Validácia v `POST /rezervacie/new`:
  - [x] Kontrola: session_id a client_name
  - [x] Overenie existencie session v DB pred uložením
  
- [x] Bezpečnosť:
  - [x] **Parametrizované dotazy** - `?` placeholders (`await db.query(sql, [params])`)
  - [x] **Ochrana proti SQL Injection** - žiadne string concatenation
  - [x] Trim dát pred uložením
  - [x] Type conversion kde treba

### Chýba:
  - [ ] Minimálna/maximálna dĺžka stringov
  - [ ] Formáty (email, phone, etc.)
  - [ ] Overenie duplicity (napr. tréner s rovnakým menom)
  - [ ] Kontrola rozsahu čísel (capacity: 1-200)

**STATUS: 70% - ZÁKLADNÁ VALIDÁCIA JE OK, CHÝBA POKROČILÁ A ORGANIZÁCIA**

---

## ❌ 8. Netriviálny JavaScript - **0% HOTOVO - URGENTNE POTREBNÉ**

### Súbor `public/js/validation.js` - **CHÝBA CELÝ**

Potrebné prvky (minimálne 50 riadkov):

```
Minimálna štruktúra:
1. Validačné funkcie (20-30 riadkov)
   - validateName()
   - validateCapacity()
   - validateDateTime()
   - atď.

2. Event listeners (15-20 riadkov)
   - DOMContentLoaded
   - form.addEventListener('submit')
   - inputs.addEventListener('input')

3. Display error/success funkcie (5-10 riadkov)
   - showError()
   - clearError()
   - updateFieldStyle()

CELKEM: 50+ riadkov
```

**PRIORITA: VYSOKÁ - CHÝBAJÚ 2 BODY**

---

## 📊 SÚHRN STAVU

| # | Požiadavka | Stav | Hotovo | Chýba | Body |
|----|-----------|------|--------|-------|------|
| 1 | Git | ✅ | 100% | - | +1 |
| 2 | CSS | ⚠️ | 70% (14/20) | 6+ pravidiel | +0.5 |
| 3 | Layout | ⚠️ | 80% | @media queries | +0.5 |
| 4 | CRUD server | ✅ | 100% | - | +2 |
| 5 | GUI CRUD | ✅ | 100% | - | +2 |
| 6 | Validácia klient | ❌ | 0% | `validation.js` | 0 |
| 7 | Validácia server | ⚠️ | 70% | `validators.js` + pokročilé | +1 |
| 8 | JavaScript netriviálny | ❌ | 0% | `validation.js` | 0 |
| | | | | **SPOLU** | **~7/10** |

### **CELKOVÝ STAV: ~55-60% BODOV**

---

## 🎯 PRIORITA OPRAVY (podľa váhy bodov)

### 1. **KRITICKÁ (2 body) - JavaScript Validácia**
   - [ ] Vytvoriť `public/js/validation.js` (50+ riadkov)
   - [ ] Real-time validácia na všetkých formulároch
   - [ ] Event listeners a DOM manipulácia
   - **Deadline: ASAP** ⚠️

### 2. **VYSOKÁ (1 bod) - CSS rozšírenie**
   - [ ] Doplniť CSS pravidlá na 20+ (form-group, input, button, atď.)
   - [ ] Pridať hover efekty a transitions
   - **Deadline: ASAP** ⚠️

### 3. **VYSOKÁ (1 bod) - Responzívny dizajn**
   - [ ] Pridať @media queries (768px, 480px)
   - [ ] Flexbox úpravy pre mobily
   - [ ] Testovanie na rôznych obrazovkách

### 4. **STREDNÁ - Organizácia kódu**
   - [ ] Vytvoriť `src/validators.js` pre lepšiu štruktúru
   - [ ] Pokročilá validácia (min/max length, formáty)

### 5. **NIŽŠIA - Doladenie**
   - [ ] CSS vizuál (farby, shadows, gradients)
   - [ ] UX zlepšenia (disabling buttons, loading states)
   - [ ] Dodatočné bezpečnostné prvky

---

## ✨ POZNÁMKY

- **Pozitívum**: Všetky CRUD operácie a GUI sú hotové - solídny základ
- **Problém**: Chýba JavaScript validácia na klientovi - to je viditeľné a študenti to musia mať
- **Pozitívum**: Serverová validácia a parametrizované dotazy sú správne
- **Problém**: CSS a responzívny dizajn sú minimálne - potrebuje rozšírenie
