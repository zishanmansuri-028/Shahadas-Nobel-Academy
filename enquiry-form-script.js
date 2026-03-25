const form = document.getElementById('enquiryform');

/* ============================= */
/*         AGE AUTO DETECT       */
/* ============================= */
const ageInput = document.getElementById('age');
document.getElementById('dob').addEventListener('change', e => {
    const d = new Date(e.target.value);
    const t = new Date();
    let age = t.getFullYear() - d.getFullYear();
    if (d > t) {
        ageInput.value = '';
        alert('Invalid Date of Birth');
        return;
    }
    const thisYearDOB = new Date(d);
    thisYearDOB.setFullYear(t.getFullYear());
    if (t < thisYearDOB) age--;
    ageInput.value = age + ' years';
});

/* ============================= */
/*     INDIAN MOBILE NUMBER      */
/* ============================= */
function formatIndianMobile(input) {
    input.addEventListener('input', () => {
        let digits = input.value.replace(/\D/g, '');

        // remove country code
        if (digits.startsWith('91')) {
            digits = digits.slice(2);
        }

        // remove leading zero
        digits = digits.replace(/^0+/, '');

        if (digits.length === 0) {
            input.value = '';
            return;
        }

        digits = digits.slice(0, 10);

        input.value = ' +91 ' + digits;

        // cursor at end
        input.setSelectionRange(
            input.value.length,
            input.value.length
        );
    });
}
// apply to both inputs
formatIndianMobile(document.getElementById('studentMobile'));

/* ============================= */
/*         SUBMIT BUTTON         */
/* ============================= */
form.addEventListener('submit', e => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.btn-loader');

    let valid = true;
    const required = ['fullName', 'dob', 'gender', 'classSelect', 'studentMobile'];

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!el.value || el.value.trim() === '') {
            el.classList.add('error');
            valid = false;
        } else el.classList.remove('error');
    });

    const terms = document.getElementById('acceptTerms');
    if (!terms.checked) {
        terms.classList.add('error');
        alert('Accept declaration');
        return;
    } else terms.classList.remove('error');

    if (!valid) {
        return;
    }

    /* 🔥 SHOW LOADING STATE */
    submitBtn.disabled = true;
    btnText.textContent = "Submitting...";
    loader.classList.remove('hidden');

    fetch("https://script.google.com/macros/s/AKfycbx_Qn3lwTZmqvciAm9JKIwTQhzy7WaM9Dz390M39NGmQRzRC4umKx96kEytOJasSB-x5w/exec", {
        method: "POST",
        body: new FormData(form)
    })
        .then(() => {
            const overlay = document.getElementById('successOverlay');
            overlay.classList.remove('hidden');

            form.reset();
            ageInput.value = '';

            // redirect after 5 seconds
            setTimeout(() => {
                window.location.href = "index.html";
            }, 5000);
        })
        .catch(() => {
        alert("Submission failed. Try again.");

        /* ❌ RESET BUTTON IF ERROR */
        submitBtn.disabled = false;
        btnText.textContent = "Submit Application";
        loader.classList.add('hidden');
    });
});

/* ============================= */
/*          RESET BUTTON         */
/* ============================= */
document.getElementById('resetBtn').onclick = () => {
    if (confirm('Reset form?')) {
        form.reset();
        ageInput.value = '';
    }

};