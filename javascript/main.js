const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const backToTop = document.getElementById("backToTop");

window.addEventListener("load", function () {
  document.body.classList.add("page-loaded");

  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    heroContent.style.opacity = "1";
  }
});

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", function () {
    mobileMenu.classList.toggle("show");
  });
}

const hiddenElements = document.querySelectorAll(
  ".hidden-section, .hidden-left, .hidden-right"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show-section");
      }
    });
  },
  {
    threshold: 0.2
  }
);

hiddenElements.forEach((el) => observer.observe(el));

const clickableCards = document.querySelectorAll(".clickable-card");
clickableCards.forEach((card) => {
  card.addEventListener("click", function () {
    const link = card.getAttribute("data-link");
    if (link) {
      document.body.classList.remove("page-loaded");
      setTimeout(() => {
        window.location.href = link;
      }, 300);
    }
  });
});

const pageLinks = document.querySelectorAll("a");

pageLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    if (
      href &&
      !href.startsWith("#") &&
      !href.startsWith("http") &&
      !this.hasAttribute("target")
    ) {
      e.preventDefault();
      document.body.classList.remove("page-loaded");

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
  });
});

window.addEventListener("scroll", function () {
  if (backToTop) {
    if (window.scrollY > 300) {
      backToTop.style.display = "block";
    } else {
      backToTop.style.display = "none";
    }
  }
});

if (backToTop) {
  backToTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}