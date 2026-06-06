// login.js
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
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

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  clearError(emailInput);
  clearError(passwordInput);

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!validateEmail(email)) {
    showError(emailInput, "Veuillez entrer une adresse email valide.");
    isValid = false;
  }

  if (password.length < 6) {
    showError(passwordInput, "Le mot de passe doit contenir au moins 6 caractères.");
    isValid = false;
  }

  if (!isValid) return;

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data.success) {
        showError(passwordInput, data.message);
        return;
      }

      // حفظ بيانات المستخدم بحيث يُستفاد منها في userMenu.js
      // نفرض أنّ البيانات العائدة تحتوي على الخصائص firstName و lastName
      localStorage.setItem("connected_user", JSON.stringify(data.user));
      localStorage.setItem("electroshop_user", JSON.stringify(data.user));
      localStorage.setItem("connected_email", data.user.email);
      // نستخدم اسم المستخدم لتوليد الحرف الأول عند ظهور الأفاتار
      localStorage.setItem("user_name", data.user.firstName || data.user.email);

      // إعادة توجيه للموقع الرئيسي ليعمل userMenu.js
      window.location.href = "products.html";
    })
    .catch(function () {
      showToast("Erreur serveur.");
    });
});