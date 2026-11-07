
// =================================
// VYOM KARNA STUDIOS
// Website Interactions
// =================================

// Mobile navigation menu

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", function () {
    const isOpen = navigation.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close mobile menu after selecting a link

document.querySelectorAll(".navigation a").forEach(function (link) {
    link.addEventListener("click", function () {
        navigation.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});

// Automatically update copyright year

document.getElementById("year").textContent =
    new Date().getFullYear();

console.log("Vyom Karna Studios website loaded successfully!");
