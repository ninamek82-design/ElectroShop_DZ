const productsContainer = document.getElementById("productsContainer");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("searchInput");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const cartCount = document.getElementById("cartCount");
const cartCountMobile = document.getElementById("cartCountMobile");

let currentCategory = "all";
let currentSearch = "";
let currentCart = [];
let toastTimeout;

window.addEventListener("load", function () {
  document.body.classList.add("page-loaded");
  currentCart = getCartFromUrl();
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

function updateCurrentUrl() {
  const encodedCart = encodeCart(currentCart);

  const newUrl =
    encodedCart && currentCart.length > 0
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

function showToast(message) {
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(function () {
    toast.classList.remove("show");
  }, 2200);
}

function displayProducts(productsList) {
  productsContainer.innerHTML = "";

  if (productsList.length === 0) {
    productsContainer.innerHTML =
      '<p class="no-products">Aucun produit trouvé.</p>';
    return;
  }

  productsList.forEach(function (product, index) {
    const productCard = document.createElement("article");
    productCard.classList.add("product-card");

    const baseDelay = index * 0.22;

    productCard.innerHTML = `
      <img 
        src="${product.image}" 
        alt="${product.name}" 
        class="product-image"
        style="animation-delay: ${baseDelay}s;"
      />

      <div class="product-content">
        <span 
          class="product-category animated-item"
          style="animation-delay: ${baseDelay + 0.10}s;"
        >
          ${product.category}
        </span>

        <h3 
          class="animated-item"
          style="animation-delay: ${baseDelay + 0.18}s;"
        >
          ${product.name}
        </h3>

        <p 
          class="product-description animated-item"
          style="animation-delay: ${baseDelay + 0.26}s;"
        >
          ${product.description}
        </p>

        <p 
          class="product-price animated-item"
          style="animation-delay: ${baseDelay + 0.34}s;"
        >
          ${product.price.toLocaleString()} DA
        </p>

        <button 
          class="add-to-cart-btn animated-item" 
          data-id="${product.id}"
          style="animation-delay: ${baseDelay + 0.42}s;"
        >
          Ajouter au panier
        </button>
      </div>
    `;

    productCard.style.animationDelay = `${baseDelay}s`;
    productsContainer.appendChild(productCard);
  });

  addCartButtonsEvents();
}

function filterProducts() {
  let filteredProducts = products;

  if (currentCategory !== "all") {
    filteredProducts = filteredProducts.filter(function (product) {
      return product.category === currentCategory;
    });
  }

  if (currentSearch.trim() !== "") {
    filteredProducts = filteredProducts.filter(function (product) {
      return product.name.toLowerCase().includes(currentSearch.toLowerCase());
    });
  }

  displayProducts(filteredProducts);
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });

    this.classList.add("active");
    currentCategory = this.dataset.category;
    filterProducts();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", function () {
    currentSearch = this.value;
    filterProducts();
  });
}

function addCartButtonsEvents() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const productId = Number(this.dataset.id);

      const selectedProduct = products.find(function (product) {
        return product.id === productId;
      });

      if (!selectedProduct) return;

      const existingProduct = currentCart.find(function (item) {
        return item.id === productId;
      });

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        currentCart.push({
          ...selectedProduct,
          quantity: 1
        });
      }

      updateCurrentUrl();
      updateInternalLinks();
      updateCartCount();

      showToast(`${selectedProduct.name} ajouté au panier !`);
    });
  });
}

displayProducts(products);