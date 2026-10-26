const testimonialCards = Array.from(
  document.querySelectorAll(".testimonial-card"),
);
const testimonialTrack = document.querySelector(".testimonial-track");

if (testimonialTrack) {
  testimonialCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    testimonialTrack.appendChild(clone);
  });
}

const revealTestimonials = () => {
  testimonialCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    card.classList.toggle("is-visible", isVisible);
  });
};

window.addEventListener("scroll", revealTestimonials, { passive: true });
window.addEventListener("load", revealTestimonials);
window.addEventListener("resize", revealTestimonials);

const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));

galleryCards.forEach((card) => {
  card.addEventListener("click", () => {
    galleryCards.forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
  });
});

const pricingCards = Array.from(document.querySelectorAll(".pricing-card"));

pricingCards.forEach((card) => {
  card.addEventListener("click", () => {
    pricingCards.forEach((item) => item.classList.remove("is-selected"));
    card.classList.add("is-selected");
  });
});

const virtualPrices = Array.from(
  document.querySelectorAll(".virtual-prices strong[data-duration]"),
);

function updateVirtualPricing() {
  const duration = document.querySelector(
    'input[name="virtual-duration"]:checked',
  )?.value;

  if (!duration) {
    return;
  }

  virtualPrices.forEach((price) => {
    price.hidden = price.dataset.duration !== duration;
  });
}

document
  .querySelectorAll('input[name="virtual-duration"]')
  .forEach((option) => {
    option.addEventListener("change", updateVirtualPricing);
  });

updateVirtualPricing();

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));

function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 180;
  let currentSectionId = "";

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollPosition >= top && scrollPosition < bottom) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    link.classList.toggle("active", targetId === currentSectionId);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

window.addEventListener("scroll", updateActiveNavLink, { passive: true });
window.addEventListener("resize", updateActiveNavLink);
window.addEventListener("load", updateActiveNavLink);

const groupSessions = document.getElementById("group-sessions");
const groupSessionPrice = document.getElementById("group-session-price");
const groupSessionThumb = document.querySelector(".session-slider-thumb");
const groupSessionFill = document.querySelector(".session-slider-fill");
const groupSessionMarkers = Array.from(
  document.querySelectorAll(".session-presets span"),
);
const groupSessionOptions = [5, 8, 10, 12];
const groupPrices = {
  2: [300, 480, 550, 600],
  3: [325, 520, 600, 660],
  4: [275, 550, 500, 540],
};
let groupPriceAnimation;

function updateGroupPricing() {
  if (
    !groupSessions ||
    !groupSessionPrice ||
    !groupSessionThumb ||
    !groupSessionFill
  ) {
    return;
  }

  const optionIndex = Number(groupSessions.value);
  const sessionCount = groupSessionOptions[optionIndex];
  const groupSize = document.querySelector(
    'input[name="group-size"]:checked',
  )?.value;
  const prices = groupPrices[groupSize];

  if (sessionCount === undefined || !prices) {
    return;
  }

  groupSessionMarkers.forEach((marker, index) => {
    marker.classList.toggle("is-active", index === optionIndex);
  });

  const progress = `${(optionIndex / (groupSessionOptions.length - 1)) * 100}%`;
  groupSessionThumb.style.left = progress;
  groupSessionFill.style.width = progress;
  groupSessionPrice.textContent = `$${prices[optionIndex]}`;
  groupSessions.setAttribute("aria-valuetext", `${sessionCount} sessions`);

  if (
    groupSessionPrice.animate &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    groupPriceAnimation?.cancel();
    groupPriceAnimation = groupSessionPrice.animate(
      [
        { opacity: 0.55, transform: "translateY(3px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 350, easing: "ease-out" },
    );
  }
}

if (groupSessions) {
  groupSessions.addEventListener("input", updateGroupPricing);
}

document.querySelectorAll('input[name="group-size"]').forEach((option) => {
  option.addEventListener("change", updateGroupPricing);
});

updateGroupPricing();

const form = document.getElementById("intake-form");
const intakeStatus = document.getElementById("intake-status");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const endpoint = form.dataset.endpoint;
    const turnstileToken = form.querySelector(
      '[name="cf-turnstile-response"]',
    )?.value;

    if (!endpoint || endpoint.includes("PASTE_YOUR_GOOGLE_APPS_SCRIPT")) {
      intakeStatus.textContent = "The intake form is not configured yet.";
      intakeStatus.className = "form-status error";
      return;
    }

    if (!turnstileToken) {
      intakeStatus.textContent =
        "Please complete the security check before submitting.";
      intakeStatus.className = "form-status error";
      return;
    }

    submitButton.disabled = true;
    intakeStatus.textContent = "Sending your intake...";
    intakeStatus.className = "form-status";

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(new FormData(form)),
      });

      form.reset();
      intakeStatus.textContent =
        "Your request was sent. We will follow up by email shortly.";
      intakeStatus.className = "form-status success";
    } catch (error) {
      intakeStatus.textContent =
        "We could not send your intake. Please try again or email us directly.";
      intakeStatus.className = "form-status error";
    } finally {
      submitButton.disabled = false;
    }
  });
}
