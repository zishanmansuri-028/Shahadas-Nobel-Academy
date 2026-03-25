const form = document.getElementById('jobapplicationForm');

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
// apply to inputs
formatIndianMobile(document.getElementById('mobile'));

/* ============================= */
/* EXPERIENCE: TYPE BEFORE years */
/* ============================= */
const expInput = document.getElementById('experience');

expInput.addEventListener('input', () => {
    let digits = expInput.value.replace(/\D/g, '');

    if (digits === '') {
        expInput.value = '';
        return;
    }

    expInput.value = digits + ' years';

    // force cursor before " years"
    expInput.setSelectionRange(digits.length, digits.length);
});

expInput.addEventListener('click', () => {
    const pos = expInput.value.indexOf(' years');
    if (pos !== -1) {
        expInput.setSelectionRange(pos, pos);
    }
});

/* ============================= */
/*      PINCODE AUTO DETECT      */
/* ============================= */
document.getElementById('pincode').addEventListener('input', e => {
    if (e.target.value.length !== 6) return;
    fetch(`https://api.postalpincode.in/pincode/${e.target.value}`)
        .then(r => r.json())
        .then(d => {
            if (d[0].Status === 'Success') {
                state.value = d[0].PostOffice[0].State;
                district.value = d[0].PostOffice[0].District;
            }
        })
        .catch(() => {
            state.value = '';
            district.value = '';
        });
});

/* ============================= */
/*         SUBMIT BUTTON         */
/* ============================= */
form.addEventListener('submit', e => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.btn-loader');

    let valid = true;
    const required = ['fullName', 'dob', 'gender', 'mobile', 'email', 'qualification', 'experience', 'organization', 'street', 'pincode', 'city'];

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!el.value || el.value.trim() === '') {
            el.classList.add('error');
            valid = false;
        } else el.classList.remove('error');
    });

    const email = document.getElementById('email');
    if (!/^\S+@\S+\.\S+$/.test(email.value)) {
        email.classList.add('error');
        valid = false;
    }

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

    fetch("https://script.google.com/macros/s/AKfycbxsDxSy3vCu0q5muzNxk7doF7UGrP1sZom99plHwoI2CB8ceLMq_HBNw8ZtcdCFDVvl/exec", {
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