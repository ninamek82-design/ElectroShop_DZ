const signupForm = document.getElementById("signupForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

window.addEventListener("load", function () {
  document.body.classList.add("page-loaded");
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", function () {
    mobileMenu.classList.toggle("show");
  });
}

function showError(input, message) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.querySelector(".error-message");

  input.classList.add("error");
  errorMessage.textContent = message;
}

function clearError(input) {
  const formGroup = input.closest(".form-group");
  const errorMessage = formGroup.querySelector(".error-message");

  input.classList.remove("error");
  errorMessage.textContent = "";
}

function showTermsError(message) {
  const termsError = document.querySelector(".terms-error");
  termsError.textContent = message;
}

function clearTermsError() {
  const termsError = document.querySelector(".terms-error");
  termsError.textContent = "";
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^(0)(5|6|7)[0-9\s]{8,12}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  clearError(firstNameInput);
  clearError(lastNameInput);
  clearError(emailInput);
  clearError(phoneInput);
  clearError(passwordInput);
  clearError(confirmPasswordInput);
  clearTermsError();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (firstName.length < 2) {
    showError(firstNameInput, "Le prénom doit contenir au moins 2 caractères.");
    isValid = false;
  }

  if (lastName.length < 2) {
    showError(lastNameInput, "Le nom doit contenir au moins 2 caractères.");
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError(emailInput, "Veuillez entrer une adresse email valide.");
    isValid = false;
  }

  if (!validatePhone(phone)) {
    showError(phoneInput, "Veuillez entrer un numéro algérien valide.");
    isValid = false;
  }

  if (password.length < 6) {
    showError(passwordInput, "Le mot de passe doit contenir au moins 6 caractères.");
    isValid = false;
  }

  if (confirmPassword !== password) {
    showError(confirmPasswordInput, "Les mots de passe ne correspondent pas.");
    isValid = false;
  }

  if (!termsInput.checked) {
    showTermsError("Vous devez accepter les conditions.");
    isValid = false;
  }

  if (!isValid) return;

  const newUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    password: password
  };

  fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newUser)
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data.success) {
        showToast(data.message);
        return;
      }

      showToast("Compte créé avec succès !");
      signupForm.reset();

      setTimeout(function () {
        window.location.href = "login.html";
      }, 1800);
    })
    .catch(function () {
      showToast("Erreur serveur.");
    });
});