const orderItems = document.getElementById("orderItems");
const itemsCount = document.getElementById("itemsCount");
const subtotalPrice = document.getElementById("subtotalPrice");
const totalPrice = document.getElementById("totalPrice");
const commandeForm = document.getElementById("commandeForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const cityInput = document.getElementById("city");
const paymentInput = document.getElementById("payment");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

let currentCart = [];

window.addEventListener("load", function () {
  document.body.classList.add("page-loaded");
  currentCart = getCartFromUrl();
  displayOrderSummary();
  updateInternalLinks();
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", function () {
    mobileMenu.classList.toggle("show");
  });
}

function encodeCart(cart) {
  try {
    return encodeURIComponent(JSON.stringify(cart));
  } catch (error) {
    return "";
  }
}

function decodeCart(value) {
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch (error) {
    try {
      return JSON.parse(value);
    } catch (error2) {
      return [];
    }
  }
}

function getCartFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cartParam = params.get("cart");

  if (!cartParam) return [];

  const parsedCart = decodeCart(cartParam);

  if (!Array.isArray(parsedCart)) return [];

  return parsedCart;
}

function buildLinkWithCart(href) {
  if (!href || href.startsWith("#") || href.startsWith("http")) {
    return href;
  }

  const cleanHref = href.split("?")[0];
  const encodedCart = encodeCart(currentCart);

  if (!encodedCart || currentCart.length === 0) {
    return cleanHref;
  }

  return `${cleanHref}?cart=${encodedCart}`;
}

function updateInternalLinks() {
  const links = document.querySelectorAll("a");

  links.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href) return;

    link.setAttribute("href", buildLinkWithCart(href));
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

function clearAllErrors() {
  clearError(fullNameInput);
  clearError(emailInput);
  clearError(phoneInput);
  clearError(addressInput);
  clearError(cityInput);
  clearError(paymentInput);
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^(0)(5|6|7)[0-9]{8}$/;
  return regex.test(phone.replace(/\s+/g, ""));
}

function showToast(message) {
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

function calculateTotal() {
  return currentCart.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
}

function displayOrderSummary() {
  orderItems.innerHTML = "";

  if (currentCart.length === 0) {
    orderItems.innerHTML =
      '<p style="color:#94a3b8;">Votre panier est vide.</p>';
    itemsCount.textContent = "0";
    subtotalPrice.textContent = "0 DA";
    totalPrice.textContent = "0 DA";
    return;
  }

  let totalItems = 0;
  let totalAmount = 0;

  currentCart.forEach(function (item) {
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;

    totalItems += quantity;
    totalAmount += price * quantity;

    const div = document.createElement("div");
    div.classList.add("order-item");

    div.innerHTML = `
      <div>
        <div class="order-item-name">${item.name}</div>
        <div class="order-item-qty">Quantité: ${quantity}</div>
      </div>
      <div class="order-item-price">
        ${(price * quantity).toLocaleString()} DA
      </div>
    `;

    orderItems.appendChild(div);
  });

  itemsCount.textContent = totalItems;
  subtotalPrice.textContent = `${totalAmount.toLocaleString()} DA`;
  totalPrice.textContent = `${totalAmount.toLocaleString()} DA`;
}

commandeForm.addEventListener("submit", function (e) {
  e.preventDefault();

  clearAllErrors();

  let isValid = true;

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();
  const city = cityInput.value.trim();
  const payment = paymentInput.value.trim();

  if (currentCart.length === 0) {
    showToast("Votre panier est vide.");
    return;
  }

  if (fullName.length < 4) {
    showError(fullNameInput, "Veuillez entrer un nom complet valide.");
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

  if (address.length < 5) {
    showError(addressInput, "Veuillez entrer une adresse valide.");
    isValid = false;
  }

  if (city.length < 2) {
    showError(cityInput, "Veuillez entrer une ville valide.");
    isValid = false;
  }

  if (payment === "") {
    showError(paymentInput, "Veuillez choisir un mode de paiement.");
    isValid = false;
  }

  if (!isValid) return;

  const orderData = {
    customer: {
      fullName: fullName,
      email: email,
      phone: phone,
      address: address,
      city: city,
      payment: payment
    },
    cart: currentCart,
    total: calculateTotal()
  };

  fetch("http://localhost:3000/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data.success) {
        showToast("Erreur lors de l'enregistrement.");
        return;
      }

      currentCart = [];
      showToast("Commande confirmée avec succès !");

      setTimeout(function () {
        window.location.href = "products.html";
      }, 1800);
    })
    .catch(function () {
      showToast("Erreur serveur.");
    });
});