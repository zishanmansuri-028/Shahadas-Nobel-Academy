const form = document.getElementById('admissionForm');

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
formatIndianMobile(document.getElementById('fatherMobile'));

/* ==================================== */
/*       CLASS XX PERCENTAGE FORMAT     */
/* ==================================== */
const classSelect = document.getElementById("classSelect");
const marksLabel = document.getElementById("marksLable");

classSelect.addEventListener("change", function () {
    const selectedText = this.options[this.selectedIndex].text;

    if (selectedText.includes("11th")) marksLabel.textContent = "Class 10th Percentage * (If result is not declared, enter 0)";
    else if (selectedText.includes("12th")) marksLabel.textContent = "Class 10th Percentage * (If result is not declared, enter 0)";
    else marksLabel.textContent = "Previous Class Percentage * (If result is not declared, enter 0)";
});

/* ==================================== */
/*     MARKS AUTO PERCENT FORMAT (%)    */
/* ==================================== */
const marksInput = document.getElementById('marks');

marksInput.addEventListener('input', () => {
    let digits = marksInput.value.replace(/[^0-9]/g, '');

    if (digits === '') {
        marksInput.value = '';
        return;
    }

    if (+digits > 100) digits = '100';

    marksInput.value = digits + '%';

    const pos = marksInput.value.indexOf('%');
    marksInput.setSelectionRange(pos, pos);
});

marksInput.addEventListener('keydown', (e) => {
    // % ke baad cursor jaane se roko
    const value = marksInput.value;
    const percentIndex = value.indexOf('%');

    if (percentIndex !== -1 && marksInput.selectionStart > percentIndex) {
        e.preventDefault();
        marksInput.setSelectionRange(percentIndex, percentIndex);
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

let finalAmount = 14900; // default ₹149
let referralApplied = false;

const referralInput = document.getElementById('referralCode');
const applyBtn = document.getElementById('applyReferral');
const discountMsg = document.getElementById('discountMsg');
const priceDisplay = document.getElementById('priceDisplay');

applyBtn.addEventListener('click', () => {
    const code = referralInput.value.trim().toUpperCase();
    
    const validCodes = ["NOBEL2026", "KHALEEK77", "VISHAL26"];
    
    if (validCodes.includes(code)) {
        finalAmount = 10000; // ₹100
        referralApplied = true;

        discountMsg.style.color = "green";
        discountMsg.textContent = "✅ Referral Applied! You saved ₹49";

        priceDisplay.innerHTML = `
            Registration Fee: 
            <span style="text-decoration:line-through; color:red;">₹149</span> 
            <span style="color:green;"> ₹100</span>
        `;

        // lock after apply
        referralInput.disabled = true;
        applyBtn.disabled = true;

    }
    else if (code === "ZIS28") {
        finalAmount = 0; // 0
        referralApplied = true;

        discountMsg.style.color = "green";
        discountMsg.textContent = "✅ Referral Applied! Free Registration";

        priceDisplay.innerHTML = `
            Registration Fee: 
            <span style="text-decoration:line-through; color:red;">₹149</span> 
            <span style="color:green;"> ₹0</span>
        `;

        // lock after apply
        referralInput.disabled = true;
        applyBtn.disabled = true;

    }
    else {
        finalAmount = 14900;
        referralApplied = false;

        discountMsg.style.color = "red";
        discountMsg.textContent = "❌ Invalid Referral Code";

        priceDisplay.innerHTML = `Registration Fee: ₹149`;
    }
});

form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    const required = ['fullName', 'dob', 'gender', 'classSelect', 'school', 'marks', 'studentMobile', 'email', 'fatherName', 'fatherMobile', 'street', 'pincode', 'city'];

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value || el.value.trim() === '') {
            el.classList.add('error');
            valid = false;
        } else {
            el.classList.remove('error');
        }
    });

    const terms = document.getElementById('acceptTerms');
    if (!terms.checked) {
        alert("Please accept declaration");
        return;
    }

    if (!valid) return;

    // 🆓 Skip payment if free
    if (finalAmount === 0) {
    submitFormToSheet("FREE_ZIS28");
    return;
    }
    
    // 💳 RAZORPAY PAYMENT
    const options = {
        key: "rzp_live_SVQoHL2MtmHEzO", // 🔥 Replace this
        amount: finalAmount, // ₹149 (in paise)
        currency: "INR",
        name: "Shahada's Nobel Academy",
        description: "N-SET Registration Fee",

        handler: function (response) {
            // ✅ PAYMENT SUCCESS
            submitFormToSheet(response.razorpay_payment_id);
        },

        prefill: {
            name: document.getElementById("fullName").value,
            email: document.getElementById("email").value,
            contact: document.getElementById("studentMobile").value.replace(/\D/g, '')
        },

        theme: {
            color: "#0f172a"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();

    // ❌ Payment failed
    rzp.on('payment.failed', function () {
        alert("Payment failed. Please try again.");
    });
});

function submitFormToSheet(paymentId) {

    const form = document.getElementById('admissionForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.btn-loader');

    // 🔥 SHOW LOADING AFTER PAYMENT SUCCESS
    submitBtn.disabled = true;
    btnText.textContent = "Submitting...";
    loader.classList.remove('hidden');

    // Add payment ID
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "paymentId";
    input.value = paymentId;
    form.appendChild(input);

    fetch("https://script.google.com/macros/s/AKfycbyWnq84-Ia62qkW5t9U1MbJF-3J85vt3Xnd6y1TNu_oSZGlrFApgyufoXrlVqvUQZq3/exec", {
        method: "POST",
        body: new FormData(form)
    })
    .then(() => {
        document.getElementById('successOverlay').classList.remove('hidden');

        form.reset();
        ageInput.value = '';

        setTimeout(() => {
            window.location.href = "index.html";
        }, 5000);
    })
    .catch(() => {
        alert("Submission failed. Try again.");

        // ❌ RESET BUTTON IF ERROR
        submitBtn.disabled = false;
        btnText.textContent = "Submit Application";
        loader.classList.add('hidden');
    });
}

/* ============================= */
/*          RESET BUTTON         */
/* ============================= */
document.getElementById('resetBtn').onclick = () => {
    if (confirm('Reset form?')) {
        form.reset();
        ageInput.value = '';
    }

// Show sliding alert on page load
window.addEventListener('load', () => {
    const alertBar = document.getElementById('topAlert');

    setTimeout(() => {
        alertBar.classList.add('show');
    }, 500); // slide down after 0.5s

    // Optional: auto hide after 6 seconds
    setTimeout(() => {
        alertBar.classList.remove('show');
    }, 6000);
});

};
