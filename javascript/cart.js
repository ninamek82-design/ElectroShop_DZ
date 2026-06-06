const cartItemsContainer = document.getElementById("cartItemsContainer");
const itemsCount = document.getElementById("itemsCount");
const subtotalPrice = document.getElementById("subtotalPrice");
const totalPrice = document.getElementById("totalPrice");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const cartCount = document.getElementById("cartCount");
const cartCountMobile = document.getElementById("cartCountMobile");

let currentCart = [];

window.addEventListener("load", function () {
  document.body.classList.add("page-loaded");
  currentCart = getCartFromUrl();
  displayCartItems();
  updateCartCount();
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
    return [];
  }
}

function getCartFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const cartParam = params.get("cart");

  if (!cartParam) return [];

  const parsedCart = decodeCart(cartParam);
  return Array.isArray(parsedCart) ? parsedCart : [];
}

function buildLinkWithCart(href) {
  if (!href || href.startsWith("#") || href.startsWith("http")) {
    return href;
  }

  const cleanHref = href.split("?")[0];
  const encodedCart = encodeCart(currentCart);

  if (!encodedCart) {
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

function updateCurrentUrl() {
  const encodedCart = encodeCart(currentCart);
  const newUrl = encodedCart
    ? `${window.location.pathname}?cart=${encodedCart}`
    : window.location.pathname;

  window.history.replaceState({}, "", newUrl);
  updateInternalLinks();
  updateCartCount();
}

function animateBadge(badge) {
  if (!badge) return;
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
}

function updateCartCount() {
  const total = currentCart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  if (cartCount) {
    cartCount.textContent = total;
    cartCount.classList.toggle("hidden", total === 0);
    if (total > 0) animateBadge(cartCount);
  }

  if (cartCountMobile) {
    cartCountMobile.textContent = total;
    cartCountMobile.classList.toggle("hidden", total === 0);
    if (total > 0) animateBadge(cartCountMobile);
  }
}

function displayCartItems() {
  cartItemsContainer.innerHTML = "";

  if (currentCart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <h3>Votre panier est vide</h3>
        <p>Ajoutez quelques produits pour commencer vos achats.</p>
        <a href="products.html">Voir les produits</a>
      </div>
    `;

    itemsCount.textContent = "0";
    subtotalPrice.textContent = "0 DA";
    totalPrice.textContent = "0 DA";
    updateCartCount();
    updateInternalLinks();
    return;
  }

  let totalItems = 0;
  let totalAmount = 0;

  currentCart.forEach(function (item, index) {
    totalItems += item.quantity;
    totalAmount += item.price * item.quantity;

    const cartItem = document.createElement("article");
    cartItem.classList.add("cart-item");
    cartItem.style.animationDelay = `${index * 0.12}s`;

    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" />

      <div class="cart-item-info">
        <p class="cart-item-category">${item.category}</p>
        <h3>${item.name}</h3>
        <p class="cart-item-price">${item.price.toLocaleString()} DA</p>
      </div>

      <div class="cart-item-actions">
        <div class="quantity-box">
          <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
        </div>

        <p class="item-total">${(item.price * item.quantity).toLocaleString()} DA</p>

        <button class="remove-btn" data-id="${item.id}">Supprimer</button>
      </div>
    `;

    cartItemsContainer.appendChild(cartItem);
  });

  itemsCount.textContent = totalItems;
  subtotalPrice.textContent = `${totalAmount.toLocaleString()} DA`;
  totalPrice.textContent = `${totalAmount.toLocaleString()} DA`;

  addCartEvents();
  updateCartCount();
  updateInternalLinks();
}

function addCartEvents() {
  const increaseButtons = document.querySelectorAll(".increase-btn");
  const decreaseButtons = document.querySelectorAll(".decrease-btn");
  const removeButtons = document.querySelectorAll(".remove-btn");

  increaseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(this.dataset.id);

      currentCart = currentCart.map(function (item) {
        return item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      });

      updateCurrentUrl();
      displayCartItems();
    });
  });

  decreaseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(this.dataset.id);

      currentCart = currentCart
        .map(function (item) {
          return item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item;
        })
        .filter(function (item) {
          return item.quantity > 0;
        });

      updateCurrentUrl();
      displayCartItems();
    });
  });

  removeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(this.dataset.id);

      currentCart = currentCart.filter(function (item) {
        return item.id !== productId;
      });

      updateCurrentUrl();
      displayCartItems();
    });
  });
}

