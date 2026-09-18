/**
 * Society of Access Alumni Nepal (SAAN)
 * Core client script for navigation, interactive map, directory filters, and dialogs.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initMapExplorer();
  initCategoryFilters();
  initModalDialogs();
  initContactForm();
  initVolunteerForm();
});

function initMobileNav() {
  const toggleBtn = document.querySelector(".nav-toggle-btn");
  const drawer = document.querySelector(".mobile-nav-drawer");
  if (!toggleBtn || !drawer) return;

  const toggleNav = (open) => {
    const isExpanded = open ?? toggleBtn.getAttribute("aria-expanded") !== "true";
    toggleBtn.setAttribute("aria-expanded", String(isExpanded));
    drawer.classList.toggle("open", isExpanded);

    if (isExpanded) {
      const firstLink = drawer.querySelector("a, button");
      if (firstLink) firstLink.focus();
    }
  };

  toggleBtn.addEventListener("click", () => toggleNav());

  // Close when pressing Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) {
      toggleNav(false);
      toggleBtn.focus();
    }
  });

  // Close when clicking a nav link in the drawer
  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleNav(false));
  });
}

function initMapExplorer() {
  const infoTitle = document.getElementById("province-info-title");
  const infoDistricts = document.getElementById("province-info-districts");
  const infoHub = document.getElementById("province-info-hub");
  const infoLead = document.getElementById("province-info-lead");
  const pillButtons = document.querySelectorAll(".province-pill-btn");

  if (!infoTitle) return;

  const provinceData = {
    koshi: {
      name: "Koshi Province",
      districts: "14 Districts",
      hub: "Biratnagar, Dharan, Ilam",
      lead: "Eastern Regional Hub"
    },
    madhesh: {
      name: "Madhesh Province",
      districts: "8 Districts",
      hub: "Janakpurdham, Birgunj, Lahan",
      lead: "Southern Terai Cultural Hub"
    },
    bagmati: {
      name: "Bagmati Province",
      districts: "13 Districts",
      hub: "Kathmandu Valley, Hetauda, Chitwan",
      lead: "Central Capital & Innovation Hub"
    },
    gandaki: {
      name: "Gandaki Province",
      districts: "11 Districts",
      hub: "Pokhara, Gorkha, Baglung",
      lead: "Central Himalayan Hub"
    },
    lumbini: {
      name: "Lumbini Province",
      districts: "12 Districts",
      hub: "Butwal, Nepalgunj, Dang",
      lead: "Western Terai & Valley Hub"
    },
    karnali: {
      name: "Karnali Province",
      districts: "10 Districts",
      hub: "Birendranagar (Surkhet), Jumla",
      lead: "Mountain & Mid-Hill Communities"
    },
    sudurpashchim: {
      name: "Sudurpashchim Province",
      districts: "9 Districts",
      hub: "Dhangadhi, Dadeldhura, Mahendranagar",
      lead: "Far-Western Regional Hub"
    }
  };

  const mapSvg = document.querySelector(".nepal-vector-map");

  const selectProvince = (key) => {
    if (!key) return;
    const normalizedKey = key.toLowerCase().trim();
    const data = provinceData[normalizedKey];
    if (!data) return;

    infoTitle.textContent = data.name;
    if (infoDistricts) infoDistricts.textContent = data.districts;
    if (infoHub) infoHub.textContent = data.hub;
    if (infoLead) infoLead.textContent = data.lead;

    // Update Pill Buttons
    pillButtons.forEach((btn) => {
      const isActive = btn.dataset.province === normalizedKey;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    // Update Map Paths
    document.querySelectorAll(".province-path").forEach((path) => {
      const isActive = path.dataset.province === normalizedKey;
      path.classList.toggle("active", isActive);
      if (isActive) {
        path.setAttribute("fill", "#BFDBFE");
        path.setAttribute("stroke", "#1D4ED8");
        path.setAttribute("stroke-width", "3.5");
      } else {
        path.setAttribute("fill", "#E9EEF3");
        path.setAttribute("stroke", "#CBD2D9");
        path.setAttribute("stroke-width", "2");
      }
    });
  };

  // Attach button events
  pillButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectProvince(btn.dataset.province);
    });
  });

  // Attach SVG clicks directly to paths and hub nodes
  document.querySelectorAll(".province-path, .map-node").forEach((elem) => {
    elem.style.cursor = "pointer";
    elem.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = elem.closest("[data-province]");
      const key = target ? target.dataset.province : elem.dataset.province;
      if (key) selectProvince(key);
    });
  });

  // Event delegation on map container
  if (mapSvg) {
    mapSvg.addEventListener("click", (e) => {
      const provTarget = e.target.closest("[data-province]");
      if (provTarget && provTarget.dataset.province) {
        selectProvince(provTarget.dataset.province);
      }
    });
  }

  // Initialize on load
  selectProvince("bagmati");
}

function initCategoryFilters() {
  const filterContainers = document.querySelectorAll("[data-filter-group]");

  filterContainers.forEach((container) => {
    const buttons = container.querySelectorAll(".filter-btn");
    const targetGridId = container.dataset.filterTarget;
    const targetGrid = document.getElementById(targetGridId);
    const emptyState = document.getElementById(`${targetGridId}-empty`);

    if (!targetGrid) return;

    const cards = targetGrid.querySelectorAll("[data-category]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        const selectedCat = btn.dataset.category;
        let visibleCount = 0;

        cards.forEach((card) => {
          const cardCat = card.dataset.category || "";
          const match = selectedCat === "all" || cardCat.split(",").map(c => c.trim()).includes(selectedCat);
          card.style.display = match ? "" : "none";
          if (match) visibleCount++;
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? "block" : "none";
        }
      });
    });
  });
}

function initModalDialogs() {
  const triggers = document.querySelectorAll("[data-modal-target]");
  let lastFocusedElement = null;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = trigger.dataset.modalTarget;
      const modal = document.getElementById(modalId);
      if (!modal) return;

      lastFocusedElement = document.activeElement;
      openModal(modal);
    });
  });

  function openModal(modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    const closeBtn = modal.querySelector(".modal-close-btn");
    if (closeBtn) closeBtn.focus();

    const onKeydown = (e) => {
      if (e.key === "Escape") {
        closeModal(modal);
      }
    };

    modal._keydownHandler = onKeydown;
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (modal._keydownHandler) {
      document.removeEventListener("keydown", modal._keydownHandler);
    }
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest(".modal-close-btn")) {
        closeModal(modal);
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  const alertBox = document.getElementById("form-status-alert");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate fields
    const fields = [
      { id: "sender-name", minLen: 2 },
      { id: "sender-email", email: true },
      { id: "sender-province", minLen: 1 },
      { id: "sender-reason", minLen: 1 },
      { id: "sender-subject", minLen: 3 },
      { id: "sender-message", minLen: 10 }
    ];

    fields.forEach((f) => {
      const input = document.getElementById(f.id);
      if (!input) return;
      const group = input.closest(".form-group");
      const val = input.value.trim();
      let fieldValid = true;

      if (f.minLen && val.length < f.minLen) {
        fieldValid = false;
      }
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        fieldValid = false;
      }

      if (group) {
        group.classList.toggle("has-error", !fieldValid);
      }
      if (!fieldValid) isValid = false;
    });

    if (isValid) {
      const name = document.getElementById("sender-name") ? document.getElementById("sender-name").value.trim() : "";
      const email = document.getElementById("sender-email") ? document.getElementById("sender-email").value.trim() : "";
      const provinceElem = document.getElementById("sender-province");
      const province = provinceElem && provinceElem.selectedIndex >= 0 ? provinceElem.options[provinceElem.selectedIndex].text : "";
      const reasonElem = document.getElementById("sender-reason");
      const reason = reasonElem && reasonElem.selectedIndex >= 0 ? reasonElem.options[reasonElem.selectedIndex].text : "";
      const subject = document.getElementById("sender-subject") ? document.getElementById("sender-subject").value.trim() : "";
      const message = document.getElementById("sender-message") ? document.getElementById("sender-message").value.trim() : "";

      const mailtoSubject = encodeURIComponent(`[SAAN Contact] ${subject}`);
      const mailtoBody = encodeURIComponent(
        `SAAN Contact & Inquiry Form\n` +
        `===========================\n` +
        `Full Name: ${name}\n` +
        `Sender Email: ${email}\n` +
        `Province: ${province}\n` +
        `Purpose: ${reason}\n` +
        `Subject: ${subject}\n\n` +
        `Message Details:\n${message}\n\n` +
        `Sent via SAAN Website Contact Portal`
      );

      window.location.href = `mailto:societyofaccessalumninepal@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      if (alertBox) {
        alertBox.style.display = "block";
        alertBox.className = "alert alert-success";
        alertBox.innerHTML = `
          <strong>Thank you for contacting SAAN!</strong><br>
          Your email application has opened with your inquiry addressed to <code>societyofaccessalumninepal@gmail.com</code>. We look forward to connecting with you.
        `;
        form.reset();
        alertBox.focus();
      }
    }
  });
}

function initVolunteerForm() {
  const form = document.getElementById("volunteer-form");
  const alertBox = document.getElementById("volunteer-alert");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("vol-name");
    const emailInput = document.getElementById("vol-email");
    const provinceSelect = document.getElementById("vol-province");
    const interestSelect = document.getElementById("vol-interest");
    const notesInput = document.getElementById("vol-notes");

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const province = provinceSelect && provinceSelect.selectedIndex >= 0 ? provinceSelect.options[provinceSelect.selectedIndex].text : "";
    const interest = interestSelect && interestSelect.selectedIndex >= 0 ? interestSelect.options[interestSelect.selectedIndex].text : "";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!name || !email || !provinceSelect || !provinceSelect.value || !interestSelect || !interestSelect.value) {
      return;
    }

    const mailtoSubject = encodeURIComponent(`SAAN Volunteer Registration: ${name} (${province})`);
    const mailtoBody = encodeURIComponent(
      `Volunteer Application Details\n` +
      `=============================\n` +
      `Full Name: ${name}\n` +
      `Email Address: ${email}\n` +
      `Province: ${province}\n` +
      `Area of Volunteer Interest: ${interest}\n` +
      `Background / Cohort Notes: ${notes || "None provided"}\n\n` +
      `Sent via SAAN Get Involved Volunteer Portal`
    );

    window.location.href = `mailto:societyofaccessalumninepal@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

    if (alertBox) {
      alertBox.style.display = "block";
      alertBox.className = "alert alert-success";
      alertBox.innerHTML = `
        <strong>Thank you for stepping forward to volunteer!</strong><br>
        Your email application has opened with your registration details addressed to <code>societyofaccessalumninepal@gmail.com</code>. Once sent, our provincial team will reach out.
      `;
      form.reset();
      alertBox.focus();
    }
  });
}
