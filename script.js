
// Haetaan ilmoittautumislomake
const form = document.getElementById("registrationForm");

if (form) {

    // Haetaan tarvittavat HTML-elementit
    const birthDate = document.getElementById("birthDate");
    const guardianSection = document.getElementById("guardianSection");
    const errorSummary = document.getElementById("errorSummary");
    const successMessage = document.getElementById("successMessage");

    // Lasketaan henkilön ikä syntymäajan perusteella
    function calculateAge(date) {
        const today = new Date();
        const birthday = new Date(date);

        let age = today.getFullYear() - birthday.getFullYear();

        const monthDifference =
            today.getMonth() - birthday.getMonth();

        if (
            monthDifference < 0 ||
            (monthDifference === 0 &&
             today.getDate() < birthday.getDate())
        ) {
            age--;
        }

        return age;
    }

    // Näytetään huoltajan tiedot alle 18-vuotiaille
    function checkAge() {

        if (!birthDate.value) {
            guardianSection.hidden = true;
            return;
        }

        const age = calculateAge(birthDate.value);

        if (age >= 0 && age < 18) {
            guardianSection.hidden = false;
        } else {
            guardianSection.hidden = true;
        }
    }

    birthDate.addEventListener("change", checkAge);

    // Valitaan kurssi automaattisesti kurssisivulta
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCourse = urlParams.get("kurssi");

    const courseSelect = document.getElementById("course");

    if (["A", "B", "T"].includes(selectedCourse)) {
        courseSelect.value = selectedCourse;
    }

    // Näytetään virheilmoitus kentän yhteydessä
    function showError(fieldId, message) {

        const errorElement =
            document.getElementById(fieldId + "Error");

        const field = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (field) {
            field.setAttribute("aria-invalid", "true");
        }
    }

    // Poistetaan virheilmoitus
    function clearError(fieldId) {

        const errorElement =
            document.getElementById(fieldId + "Error");

        const field = document.getElementById(fieldId);

        if (errorElement) {
            errorElement.textContent = "";
        }

        if (field) {
            field.removeAttribute("aria-invalid");
        }
    }

    // Tarkistetaan, onko kentässä sisältöä
    function checkRequired(fieldId, message) {

        const field = document.getElementById(fieldId);

        if (!field.value.trim()) {
            showError(fieldId, message);
            return false;
        }

        clearError(fieldId);
        return true;
    }

    // Tarkistetaan puhelinnumeron muoto
    function checkPhone(fieldId, message) {

        const field = document.getElementById(fieldId);

        const phonePattern = /^[+0-9\s()-]{6,20}$/;

        if (!phonePattern.test(field.value.trim())) {
            showError(fieldId, message);
            return false;
        }

        clearError(fieldId);
        return true;
    }

    // Tarkistetaan sähköpostiosoite
    function checkEmail(fieldId, message) {

        const field = document.getElementById(fieldId);

        if (!field.validity.valid || !field.value.trim()) {
            showError(fieldId, message);
            return false;
        }

        clearError(fieldId);
        return true;
    }

    // Tarkistetaan aiemmat ajokortit
    function checkLicenses() {

        const licenses = document.querySelectorAll(
            'input[name="previousLicenses"]'
        );

        const noneSelected = document.querySelector(
            'input[name="previousLicenses"][value="none"]'
        );

        const otherSelected = document.querySelectorAll(
            'input[name="previousLicenses"]:checked:not([value="none"])'
        );

        const error = document.getElementById("licensesError");

        const hasSelection = Array.from(licenses).some(
            license => license.checked
        );

        if (!hasSelection) {
            error.textContent =
                "Valitse vähintään yksi vaihtoehto.";
            return false;
        }

        if (noneSelected.checked && otherSelected.length > 0) {
            error.textContent =
                "Valitse joko ei aiempia ajokortteja tai aiemmat ajokortit.";
            return false;
        }

        error.textContent = "";
        return true;
    }

    // Tarkistetaan, onko teoriakurssin kieli valittu
    function checkEnglish() {

        const selected = document.querySelector(
            'input[name="english"]:checked'
        );

        const error = document.getElementById("englishError");

        if (!selected) {
            error.textContent = "Valitse kyllä tai en.";
            return false;
        }

        error.textContent = "";
        return true;
    }

    // Tarkistetaan lomakkeen kaikki tiedot
    function validateForm() {

        let valid = true;

        // Henkilötiedot
        if (!checkRequired("firstName", "Anna etunimesi.")) {
            valid = false;
        }

        if (!checkRequired("lastName", "Anna sukunimesi.")) {
            valid = false;
        }

        // Syntymäaika
        const date = new Date(birthDate.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!birthDate.value) {
            showError("birthDate", "Anna syntymäaikasi.");
            valid = false;
        } else if (
            Number.isNaN(date.getTime()) ||
            date >= today
        ) {
            showError(
                "birthDate",
                "Anna kelvollinen menneisyydessä oleva syntymäaika."
            );
            valid = false;
        } else {
            clearError("birthDate");
        }

        if (!checkPhone("phone", "Anna kelvollinen puhelinnumero.")) {
            valid = false;
        }

        if (!checkEmail("email", "Anna kelvollinen sähköpostiosoite.")) {
            valid = false;
        }

        // Kurssin valinta
        if (!checkRequired("course", "Valitse kurssi.")) {
            valid = false;
        }

        if (!checkLicenses()) {
            valid = false;
        }

        if (!checkEnglish()) {
            valid = false;
        }

        // Huoltajan tiedot, jos ilmoittautuja on alle 18-vuotias
        checkAge();

        if (!guardianSection.hidden) {

            if (!checkRequired(
                "guardianName",
                "Anna huoltajan nimi."
            )) {
                valid = false;
            }

            if (!checkPhone(
                "guardianPhone",
                "Anna kelvollinen huoltajan puhelinnumero."
            )) {
                valid = false;
            }

            if (!checkEmail(
                "guardianEmail",
                "Anna kelvollinen huoltajan sähköpostiosoite."
            )) {
                valid = false;
            }
        }

        // Tietojen oikeellisuuden vahvistaminen
        const confirmInfo = document.getElementById("confirmInfo");
        const confirmError =
            document.getElementById("confirmInfoError");

        if (!confirmInfo.checked) {
            confirmError.textContent =
                "Vahvista tietojen oikeellisuus.";
            valid = false;
        } else {
            confirmError.textContent = "";
        }

        return valid;
    }

    // Lomakkeen lähettäminen
    form.addEventListener("submit", function(event) {

        event.preventDefault();

        successMessage.hidden = true;
        errorSummary.hidden = true;

        if (!validateForm()) {

            errorSummary.textContent =
                "Lomakkeessa on virheitä. Tarkista punaisella merkityt kohdat ja korjaa ne.";

            errorSummary.hidden = false;
            errorSummary.focus();

            return;
        }

        // Näytetään onnistumisviesti
        const firstName =
            document.getElementById("firstName").value;

        const courseName =
            courseSelect.options[courseSelect.selectedIndex].text;

        successMessage.textContent =
            "Kiitos " + firstName +
            "! Ilmoittautumispyyntösi kurssille " +
            courseName +
            " on valmis. Autokoulu Ajokaista vahvistaa kurssipaikkasi puhelimitse. Huomioithan, että tämä lomake on harjoitusversio eikä tietoja lähetetä autokoulun järjestelmään.";

        successMessage.hidden = false;
        successMessage.focus();

        // Siirrytään onnistumisviestin kohdalle
        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // Tyhjennetään lomake uuden ilmoittautumisen varalta
        form.reset();
        guardianSection.hidden = true;

    });

    // Kun käyttäjä muuttaa kenttää, poistetaan sen vanha virheilmoitus
    form.addEventListener("input", function(event) {

        const field = event.target;

        if (field.id) {
            clearError(field.id);
        }

        errorSummary.hidden = true;
    });

    form.addEventListener("change", function(event) {

        const field = event.target;

        if (field.id) {
            clearError(field.id);
        }

        if (field.name === "previousLicenses") {
            document.getElementById("licensesError").textContent = "";
        }

        if (field.name === "english") {
            document.getElementById("englishError").textContent = "";
        }

        if (field.id === "birthDate") {
            checkAge();
        }

        errorSummary.hidden = true;
    });

}
