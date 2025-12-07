/**
 * SERVEROVÁ VALIDÁCIA - Gym Rezervačný Systém
 * Funkcie na validáciu dát na strane servera
 * 
 * Tieto funkcie sú voľané v app.js pri spracovaní POST requestov
 */

/**
 * Validácia údajov trénera
 * @param {object} trener - Objekt s properties: name, specialization
 * @returns {array} Pole chýb (prázdne ak je všetko OK)
 */
function validujNovehoTrenera(trener) {
    const errors = [];
    const { name, specialization } = trener;

    // Validácia mena
    if (!name || name.trim() === "") {
        errors.push("Meno trénera je povinné");
    } else if (name.trim().length < 2) {
        errors.push("Meno musí mať aspoň 2 znaky");
    } else if (name.trim().length > 100) {
        errors.push("Mno nesmie prekročiť 100 znakov");
    }

    // Validácia špecializácie
    if (!specialization || specialization.trim() === "") {
        errors.push("Špecializácia je povinná");
    } else if (specialization.trim().length < 3) {
        errors.push("Špecializácia musí mať aspoň 3 znaky");
    } else if (specialization.trim().length > 100) {
        errors.push("Špecializácia nesmie prekročiť 100 znakov");
    }

    return errors;
}

/**
 * Validácia údajov tréningového kurzu
 * @param {object} trening - Objekt s properties: title, start_at, end_at, capacity, trainer_id
 * @returns {array} Pole chýb (prázdne ak je všetko OK)
 */
function validujNovyTrening(trening) {
    const errors = [];
    const { title, start_at, end_at, capacity, trainer_id } = trening;

    // Validácia názvu tréningového kurzu
    if (!title || title.trim() === "") {
        errors.push("Názov tréningového kurzu je povinný");
    } else if (title.trim().length < 3) {
        errors.push("Názov musí mať aspoň 3 znaky");
    } else if (title.trim().length > 100) {
        errors.push("Názov nesmie prekročiť 100 znakov");
    }

    // Validácia času začatia
    if (!start_at || start_at.trim() === "") {
        errors.push("Čas začatia je povinný");
    }

    // Validácia času konca
    if (!end_at || end_at.trim() === "") {
        errors.push("Čas konca je povinný");
    }

    // Validácia vzťahu medzi časom začatia a konca
    if (start_at && end_at && start_at.trim() !== "" && end_at.trim() !== "") {
        const startDate = new Date(start_at.replace("T", " "));
        const endDate = new Date(end_at.replace("T", " "));
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push("Neplatný formát času");
        } else if (endDate <= startDate) {
            errors.push("Čas konca musí byť neskôr ako čas začatia");
        }
    }

    // Validácia kapacity
    if (!capacity || capacity === "") {
        errors.push("Kapacita je povinná");
    } else if (isNaN(Number(capacity))) {
        errors.push("Kapacita musí byť číslo");
    } else if (Number(capacity) < 1) {
        errors.push("Kapacita musí byť aspoň 1");
    } else if (Number(capacity) > 1000) {
        errors.push("Kapacita nesmie prekročiť 1000");
    }

    // Validácia ID trénera (ak je zadané, musí byť číslo)
    if (trainer_id && trainer_id !== "" && isNaN(Number(trainer_id))) {
        errors.push("ID trénera musí byť číslo");
    }

    return errors;
}

/**
 * Validácia údajov rezervácie
 * @param {object} rezervacia - Objekt s properties: session_id, client_name, note
 * @returns {array} Pole chýb (prázdne ak je všetko OK)
 */
function validujNovuRezervaciju(rezervacia) {
    const errors = [];
    const { session_id, client_name, note } = rezervacia;

    // Validácia ID tréningového kurzu
    if (!session_id || session_id === "") {
        errors.push("Výber tréningového kurzu je povinný");
    } else if (isNaN(Number(session_id))) {
        errors.push("Neplatné ID tréningového kurzu");
    }

    // Validácia mena klienta
    if (!client_name || client_name.trim() === "") {
        errors.push("Meno klienta je povinné");
    } else if (client_name.trim().length < 2) {
        errors.push("Meno klienta musí mať aspoň 2 znaky");
    } else if (client_name.trim().length > 100) {
        errors.push("Meno klienta nesmie prekročiť 100 znakov");
    }

    // Validácia poznámky (voliteľne)
    if (note && note.trim().length > 500) {
        errors.push("Poznámka nesmie prekročiť 500 znakov");
    }

    return errors;
}

/**
 * Exportovanie validačných funkcií pre použitie v app.js
 */
module.exports = {
    validujNovehoTrenera,
    validujNovyTrening,
    validujNovuRezervaciju,
};