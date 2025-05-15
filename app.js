// app.js
document.addEventListener("DOMContentLoaded", () => {
  // --- UI Utility Functions ---

  // Toast Notification System
  const toastContainer = document.getElementById("toast-container");

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {string} type - The type of toast: 'success', 'error', 'warning', 'info'
   * @param {number} duration - How long to show the toast in ms (default: 5000)
   */
  function showToast(message, type = "info", duration = 5000) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="message">${message}</span>
      <button class="close-btn" aria-label="Dismiss">&times;</button>
      <div class="progress"></div>
    `;

    toastContainer.appendChild(toast);

    // Set the animation duration
    toast.querySelector(".progress").style.animationDuration = `${duration}ms`;

    // Add click handler to close button
    toast.querySelector(".close-btn").addEventListener("click", () => {
      toast.remove();
    });

    // Auto-remove after duration
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toast.remove();
      }
    }, duration);
  }

  // Room Control Modal Functions
  function showModal(roomId) {
    const modal = document.getElementById("room-control-modal");
    const homeView = document.getElementById("home-view");
    const room = rooms.find(
      (r) => r.name.toLowerCase().replace(/\s+/g, "-") === roomId
    );

    if (room) {
      // Set room name in modal title
      const modalTitle = document.getElementById("room-modal-title");
      if (modalTitle) modalTitle.textContent = room.name;

      // Set initial values
      const brightnessRange = document.getElementById("modal-brightness-range");
      const tempRange = document.getElementById("modal-temp-range");
      const modeSelect = document.getElementById("modal-mode-select");
      const occupancyToggle = document.getElementById("modal-occupancy-toggle");

      if (brightnessRange) brightnessRange.value = room.brightness;
      if (tempRange) tempRange.value = room.temp;
      if (modeSelect) modeSelect.value = room.mode;
      if (occupancyToggle) occupancyToggle.checked = room.occupancy;

      // Store current room ID for saving changes
      modal.dataset.roomId = roomId;
    }

    modal.style.display = "flex";
    homeView.classList.add("blurred");
  }

  function closeModal() {
    const modal = document.getElementById("room-control-modal");
    const homeView = document.getElementById("home-view");
    modal.style.display = "none";
    homeView.classList.remove("blurred");
  }

  // Setup modal close button
  const roomModalClose = document.getElementById("room-modal-close");
  if (roomModalClose) {
    roomModalClose.addEventListener("click", closeModal);
  }

  // Setup modal cancel button
  const roomModalCancelBtn = document.getElementById("modal-cancel-btn");
  if (roomModalCancelBtn) {
    roomModalCancelBtn.addEventListener("click", closeModal);
  }

  // Setup apply button
  const roomModalApplyBtn = document.getElementById("modal-apply-btn");
  if (roomModalApplyBtn) {
    roomModalApplyBtn.addEventListener("click", () => {
      const modal = document.getElementById("room-control-modal");
      const roomId = modal.dataset.roomId;
      const roomIndex = rooms.findIndex(
        (r) => r.name.toLowerCase().replace(/\s+/g, "-") === roomId
      );

      if (roomIndex !== -1) {
        // Get values from modal inputs
        const brightnessRange = document.getElementById(
          "modal-brightness-range"
        );
        const tempRange = document.getElementById("modal-temp-range");
        const modeSelect = document.getElementById("modal-mode-select");
        const occupancyToggle = document.getElementById(
          "modal-occupancy-toggle"
        );

        // Update room settings
        rooms[roomIndex].brightness = parseInt(brightnessRange.value);
        rooms[roomIndex].temp = parseInt(tempRange.value);
        rooms[roomIndex].mode = modeSelect.value;
        rooms[roomIndex].occupancy = occupancyToggle.checked;

        // Save changes
        saveRooms(rooms);
        renderRoomCards();
        showToast(`Updated settings for ${rooms[roomIndex].name}`, "success");
      }

      closeModal();
    });
  }

  // Close modal when clicking outside
  const roomControlModal = document.getElementById("room-control-modal");
  if (roomControlModal) {
    roomControlModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });
  }

  // Modal Dialog System
  const modalBackdrop = document.getElementById("modal-container");
  const modalTitle = document.getElementById("modal-title");
  const modalBody = document.getElementById("modal-body");
  const modalFooter = document.getElementById("modal-footer");
  const modalConfirmBtn = document.getElementById("modal-confirm");
  const modalCancelBtn = document.getElementById("modal-cancel");
  const modalCloseBtn = document.getElementById("modal-close");

  /**
   * Show a modal dialog
   * @param {string} title - Modal title
   * @param {string|HTMLElement} content - Modal content (HTML string or DOM element)
   * @param {Object} options - Additional options
   * @param {Function} options.onConfirm - Callback when confirm button is clicked
   * @param {Function} options.onCancel - Callback when cancel button is clicked
   * @param {string} options.confirmText - Text for the confirm button
   * @param {string} options.cancelText - Text for the cancel button
   * @param {boolean} options.showCancel - Whether to show the cancel button
   * @param {string} options.confirmClass - CSS class for the confirm button
   */
  function showModal(title, content, options = {}) {
    const defaultOptions = {
      onConfirm: () => {},
      onCancel: () => {},
      confirmText: "Confirm",
      cancelText: "Cancel",
      showCancel: true,
      confirmClass: "btn-primary",
    };

    const settings = { ...defaultOptions, ...options };

    // Set title and content
    modalTitle.textContent = title;

    if (typeof content === "string") {
      modalBody.innerHTML = content;
    } else {
      modalBody.innerHTML = "";
      modalBody.appendChild(content);
    }

    // Set up buttons
    modalConfirmBtn.textContent = settings.confirmText;
    modalConfirmBtn.className = settings.confirmClass;
    modalCancelBtn.textContent = settings.cancelText;
    modalCancelBtn.style.display = settings.showCancel ? "block" : "none";

    // Clear previous event listeners
    const newConfirmBtn = modalConfirmBtn.cloneNode(true);
    const newCancelBtn = modalCancelBtn.cloneNode(true);
    const newCloseBtn = modalCloseBtn.cloneNode(true);

    modalConfirmBtn.parentNode.replaceChild(newConfirmBtn, modalConfirmBtn);
    modalCancelBtn.parentNode.replaceChild(newCancelBtn, modalCancelBtn);
    modalCloseBtn.parentNode.replaceChild(newCloseBtn, modalCloseBtn);

    // Update references
    const confirmBtn = document.getElementById("modal-confirm");
    const cancelBtn = document.getElementById("modal-cancel");
    const closeBtn = document.getElementById("modal-close");

    // Add event listeners
    confirmBtn.addEventListener("click", () => {
      settings.onConfirm();
      hideModal();
    });

    cancelBtn.addEventListener("click", () => {
      settings.onCancel();
      hideModal();
    });

    closeBtn.addEventListener("click", () => {
      settings.onCancel();
      hideModal();
    });

    // Show the modal
    modalBackdrop.classList.add("visible");

    // Add keyboard support
    document.addEventListener("keydown", handleModalKeydown);
  }

  function hideModal() {
    modalBackdrop.classList.remove("visible");
    document.removeEventListener("keydown", handleModalKeydown);
  }

  function handleModalKeydown(e) {
    if (e.key === "Escape") {
      hideModal();
    } else if (e.key === "Enter") {
      document.getElementById("modal-confirm").click();
    }
  }

  /**
   * Create a loading spinner element
   * @param {string} size - Size of the spinner: 'small', 'medium', 'large'
   * @returns {HTMLElement} The spinner element
   */
  function createSpinner(size = "medium") {
    const sizes = {
      small: "20px",
      medium: "40px",
      large: "60px",
    };

    const spinner = document.createElement("div");
    spinner.className = "loader";
    spinner.style.width = sizes[size];
    spinner.style.height = sizes[size];

    // Use SVG or CSS-based spinner
    spinner.innerHTML = `
      <svg viewBox="0 0 50 50" style="width: 100%; height: 100%;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" opacity="0.25"></circle>
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="60, 150" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;

    return spinner;
  }

  /**
   * Add a loading overlay to an element
   * @param {HTMLElement} element - The element to add the overlay to
   * @param {string} message - Optional message to show
   * @returns {HTMLElement} The overlay element
   */
  function showLoading(element, message = "") {
    element.classList.add("loading-container");

    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";

    const loadingContent = document.createElement("div");
    loadingContent.style.textAlign = "center";

    const spinner = createSpinner("medium");
    loadingContent.appendChild(spinner);

    if (message) {
      const messageEl = document.createElement("div");
      messageEl.textContent = message;
      messageEl.style.marginTop = "10px";
      messageEl.style.color = "var(--text)";
      loadingContent.appendChild(messageEl);
    }

    overlay.appendChild(loadingContent);
    element.appendChild(overlay);

    return overlay;
  }

  /**
   * Remove a loading overlay
   * @param {HTMLElement} element - The element that has the overlay
   */
  function hideLoading(element) {
    element.classList.remove("loading-container");
    const overlay = element.querySelector(".loading-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Create skeleton loading placeholders
   * @param {string} type - The type of skeleton: 'card', 'text', 'title'
   * @param {number} count - How many to create
   * @returns {DocumentFragment} Fragment containing the skeletons
   */
  function createSkeletons(type, count = 1) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = `skeleton skeleton-${type}`;
      fragment.appendChild(skeleton);
    }

    return fragment;
  }

  // Make utility functions globally available
  window.UI = {
    toast: showToast,
    modal: showModal,
    hideModal,
    showLoading,
    hideLoading,
    createSpinner,
    createSkeletons,
  };

  // View switching
  const views = document.querySelectorAll(".view");
  const navButtons = document.querySelectorAll(".bottom-nav button");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.view;
      views.forEach((v) =>
        v.id === target
          ? v.classList.add("active")
          : v.classList.remove("active")
      );
      navButtons.forEach((b) =>
        b === btn ? b.classList.add("active") : b.classList.remove("active")
      );
    });
  });

  // Highlight the Home button on initial load
  navButtons[0].classList.add("active");

  // Setup history navigation and back buttons
  let navigationHistory = ["home-view"];

  // Initialise all back buttons with ripple effect and functionality
  document.querySelectorAll(".back-btn").forEach((backBtn) => {
    // Make sure back buttons are keyboard accessible
    backBtn.setAttribute("tabindex", "0");

    // Add keyboard navigation
    backBtn.addEventListener("keydown", function (e) {
      // Spacebar or Enter triggers click
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.click();
      }

      // Escape key also goes back
      if (e.key === "Escape") {
        e.preventDefault();
        this.click();
      }
    });

    // Add ripple effect to all back buttons
    backBtn.addEventListener("touchstart", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Add click handler to all back buttons except room control view (which has special handling)
    if (!backBtn.closest("#room-control-view")) {
      backBtn.addEventListener("click", function () {
        // Default behavior: go back to home view
        const currentView = this.closest(".view").id;

        // If we have a history, go back to previous view
        if (navigationHistory.length > 1) {
          // Remove current view
          navigationHistory.pop();
          // Get previous view
          const prevView = navigationHistory[navigationHistory.length - 1];
          switchView(prevView);
        } else {
          // Fallback to home view
          switchView("home-view");
        }
      });
    }
  });

  // --- Room Data Management ---
  function getRooms() {
    return (
      JSON.parse(localStorage.getItem("rooms")) || [
        {
          name: "Living Room",
          mode: "Dimmed Warm",
          brightness: 70,
          temp: 3000,
          occupancy: false,
        },
        {
          name: "Bedroom",
          mode: "Off",
          brightness: 0,
          temp: 2700,
          occupancy: false,
        },
      ]
    );
  }
  function saveRooms(rooms) {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }
  let rooms = getRooms();

  // --- Savings & Eco Mode Management ---
  function getSavingsData() {
    return (
      JSON.parse(localStorage.getItem("savings")) || {
        ecoMode: false,
        weeklySavings: [2.3, 1.8, 2.7, 2.0, 3.1, 2.5, 1.9], // kWh saved for last 7 days
        ecoTips: [
          "Turn off lights when leaving a room",
          "Lower brightness levels when possible",
          "Use warmer colour temperatures at night",
          "Schedule automatic dimming during peak hours",
          "Take advantage of natural light during daytime",
        ],
      }
    );
  }

  function saveSavingsData(data) {
    localStorage.setItem("savings", JSON.stringify(data));
  }

  let savingsData = getSavingsData();

  // Initialise eco mode toggle from saved data
  document
    .querySelector('button[data-view="home-view"]')
    .addEventListener("click", () => {
      const ecoToggle = document.getElementById("eco-toggle");
      if (ecoToggle) {
        ecoToggle.checked = savingsData.ecoMode;
      }
    });

  // Update eco mode toggle handler
  document.addEventListener("DOMContentLoaded", () => {
    const ecoToggle = document.getElementById("eco-toggle");

    if (ecoToggle) {
      ecoToggle.checked = savingsData.ecoMode;
      ecoToggle.addEventListener("change", (e) => {
        savingsData.ecoMode = e.target.checked;
        saveSavingsData(savingsData);

        // Apply eco mode settings to rooms
        if (e.target.checked) {
          rooms = rooms.map((room) => ({
            ...room,
            brightness: Math.min(room.brightness, 70), // Cap brightness at 70%
            temp: Math.min(room.temp, 3500), // Cap colour temperature
          }));
          saveRooms(rooms);
          renderRoomCards();
        }
      });
    }
  });

  // Render savings view content
  document
    .querySelector('button[data-view="savings-view"]')
    .addEventListener("click", () => {
      // Calculate total savings
      const totalWeeklySavings = savingsData.weeklySavings.reduce(
        (sum, day) => sum + day,
        0
      );
      const savingsSummary = document.querySelector(
        ".savings-summary p strong"
      );

      if (savingsSummary) {
        savingsSummary.textContent = totalWeeklySavings.toFixed(1) + " kWh";
      }

      // Render eco tips
      const ecoTipsList = document.querySelector(".eco-tips ul");

      if (ecoTipsList) {
        ecoTipsList.innerHTML = "";
        savingsData.ecoTips.forEach((tip) => {
          const li = document.createElement("li");
          li.textContent = tip;
          ecoTipsList.appendChild(li);
        });
      }

      // Render basic chart
      renderSavingsChart();
    });

  // Simple chart rendering function
  function renderSavingsChart() {
    const chartContainer = document.querySelector(".savings-chart");
    if (!chartContainer) return;

    const maxSaving = Math.max(...savingsData.weeklySavings);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    chartContainer.innerHTML = `
      <div class="chart">
        ${savingsData.weeklySavings
          .map(
            (saving, i) => `
          <div class="chart-bar">
            <div class="bar-fill" style="height: ${
              (saving / maxSaving) * 100
            }%"></div>
            <div class="bar-label">${days[i]}</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }
  // --- Room Card Rendering ---
  const cardsContainer = document.querySelector(".room-cards");

  // Enhanced renderRoomCards with loading state
  const originalRenderRoomCards = function renderRoomCards() {
    cardsContainer.innerHTML = ""; // Eco + Settings stack
    const stack = document.createElement("div");
    stack.className = "card-stack";
    // Create Eco Mode card with enhanced toggle
    const ecoCard = document.createElement("article");
    ecoCard.className = "room-card eco-card";
    ecoCard.innerHTML = `
      <div class="card-header"><h2>Eco Mode</h2></div>
      <div class="card-content">
        <p>Optimise energy usage by reducing brightness and temperature</p>
        <div class="toggle-container">
          <label class="switch">
            <input type="checkbox" id="eco-toggle" />
            <span class="slider eco-slider"></span>
          </label>
        </div>
      </div>
    `;

    // Get saved eco mode setting
    const savingsData = getSavingsData ? getSavingsData() : { ecoMode: false };
    const ecoToggle = ecoCard.querySelector("#eco-toggle");
    ecoToggle.checked = savingsData.ecoMode;
    // Add eco toggle functionality
    ecoToggle.addEventListener("change", (e) => {
      const isEcoOn = e.target.checked;

      // Update toggle visual appearance
      const slider = ecoToggle.nextElementSibling;
      if (isEcoOn) {
        slider.style.backgroundColor = "#4CAF50"; // Green when on
        slider.style.transition =
          "background-color 0.3s ease, transform 0.3s ease";
      } else {
        slider.style.backgroundColor = "#f44336"; // Red when off
        slider.style.transition =
          "background-color 0.3s ease, transform 0.3s ease";
      }

      if (
        typeof getSavingsData === "function" &&
        typeof saveSavingsData === "function"
      ) {
        const data = getSavingsData();
        data.ecoMode = isEcoOn;
        saveSavingsData(data);
      }

      // Apply eco settings to rooms
      if (isEcoOn) {
        rooms = rooms.map((room) => ({
          ...room,
          brightness: Math.min(room.brightness, 70),
          temp: Math.min(room.temp, 3500),
        }));
        saveRooms(rooms);
        showToast("Eco Mode activated", "success");
      } else {
        showToast("Eco Mode deactivated", "info");
      }

      // Re-render cards with updated settings
      renderRoomCards();
    });
    stack.appendChild(ecoCard);
    const settingsCard = document.createElement("article");
    settingsCard.className = "room-card settings-card";
    settingsCard.innerHTML = `<button class="settings-btn" aria-label="Settings">⚙️ Settings</button>`;
    stack.appendChild(settingsCard);
    cardsContainer.appendChild(stack);
    // Room cards
    rooms.forEach((room) => {
      const card = document.createElement("article");
      card.className = "room-card";
      card.dataset.room = room.name.toLowerCase().replace(/\s+/g, "-");
      card.innerHTML = `
        <div class="card-header"><h2>${room.name}</h2></div>
        <p class="lighting-mode"><span class="mode-label">Lighting Mode:</span> <em class="mode-value">${
          room.mode
        }</em></p>
        <div class="icon-row">
          <span class="icon bulb-icon ${
            room.mode === "Off" ? "" : "active"
          }">💡</span>
          <button class="occupancy-toggle icon occupancy-icon" aria-pressed="${
            room.occupancy
          }" aria-label="Toggle occupancy">👥</button>
        </div>
        <button class="adjust-btn">Adjust</button>
      `;
      cardsContainer.appendChild(card);

      // Add occupancy toggle functionality
      const occupancyToggle = card.querySelector(".occupancy-toggle");
      occupancyToggle.addEventListener("click", () => {
        const roomKey = card.dataset.room;
        const roomIndex = rooms.findIndex(
          (r) => r.name.toLowerCase().replace(/\s+/g, "-") === roomKey
        );
        if (roomIndex !== -1) {
          rooms[roomIndex].occupancy = !rooms[roomIndex].occupancy;
          occupancyToggle.setAttribute(
            "aria-pressed",
            rooms[roomIndex].occupancy
          );
          occupancyToggle.classList.toggle(
            "active",
            rooms[roomIndex].occupancy
          );
          saveRooms(rooms);
        }
      });

      // Add adjust button functionality
      const adjustBtn = card.querySelector(".adjust-btn");
      adjustBtn.addEventListener("click", () => {
        showModal(card.dataset.room);
      });
    });
    // Add card
    const addCard = document.createElement("article");
    addCard.className = "room-card add-card";
    addCard.innerHTML = `<button id="add-room-btn">+ Add</button>`;
    cardsContainer.appendChild(addCard);
    // More card
    const moreCard = document.createElement("article");
    moreCard.className = "room-card more-card";
    moreCard.innerHTML = `<button id="more-rooms-btn">&gt; More</button>`;
    cardsContainer.appendChild(moreCard);
    // Attach adjust listeners
    cardsContainer.querySelectorAll(".adjust-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        showRoomControl(btn.closest(".room-card").dataset.room);
      });
    });
    // Add room listener
    cardsContainer
      .querySelector("#add-room-btn")
      .addEventListener("click", () => {
        const roomNamePrompt = () => {
          window.UI.modal(
            "Add New Room",
            `<div>
              <label for="new-room-name">Room Name:</label>
              <input type="text" id="new-room-name" class="full-width" placeholder="Enter room name">
            </div>`,
            {
              confirmText: "Add Room",
              onConfirm: () => {
                const nameInput = document.getElementById("new-room-name");
                const name = nameInput?.value?.trim();

                if (!name) {
                  window.UI.toast("Please enter a room name", "error");
                  setTimeout(roomNamePrompt, 500);
                  return;
                }

                if (
                  rooms.some((r) => r.name.toLowerCase() === name.toLowerCase())
                ) {
                  window.UI.toast(
                    "A room with this name already exists",
                    "error"
                  );
                  setTimeout(roomNamePrompt, 500);
                  return;
                }

                rooms.push({
                  name,
                  mode: "Off",
                  brightness: 0,
                  temp: 2700,
                  occupancy: false,
                });
                saveRooms(rooms);
                window.UI.toast(`Room "${name}" has been added`, "success");
                renderRoomCards();
              },
            }
          );

          // Focus the input after modal is shown
          setTimeout(() => {
            document.getElementById("new-room-name")?.focus();
          }, 100);
        };

        roomNamePrompt();
      });
  };

  // Replace with enhanced version that includes loading states
  function renderRoomCards() {
    // Show loading state
    window.UI.showLoading(cardsContainer, "Loading rooms...");

    // Simulate network delay (remove in production)
    setTimeout(() => {
      // Run the original function
      originalRenderRoomCards();

      // Remove loading state
      window.UI.hideLoading(cardsContainer);

      // Enhance with visual effects
      rooms.forEach((room) => {
        const cardSelector = `.room-card[data-room="${room.name
          .toLowerCase()
          .replace(/\s+/g, "-")}"]`;
        const card = document.querySelector(cardSelector);
        if (card) {
          updateRoomCardVisuals(card, room);
        }
      });
    }, 300); // Short delay for demo purposes
  }

  renderRoomCards();

  // --- Lighting Mode Visual Simulation ---
  function updateRoomCardVisuals(card, room) {
    const bulbIcon = card.querySelector(".bulb-icon");
    if (!bulbIcon) return;

    // Update visual appearance based on lighting mode
    switch (room.mode) {
      case "Dimmed Warm":
        bulbIcon.style.textShadow = `0 0 15px rgba(255, 200, 100, ${
          room.brightness / 100
        })`;
        bulbIcon.style.opacity = 0.4 + room.brightness / 200; // Base opacity + brightness factor
        break;
      case "Cool White":
        bulbIcon.style.textShadow = `0 0 15px rgba(200, 220, 255, ${
          room.brightness / 100
        })`;
        bulbIcon.style.opacity = 0.4 + room.brightness / 200;
        break;
      case "Productivity":
        bulbIcon.style.textShadow = `0 0 15px rgba(220, 240, 255, ${
          room.brightness / 100
        })`;
        bulbIcon.style.opacity = 0.4 + room.brightness / 200;
        break;
      case "Off":
        bulbIcon.style.textShadow = "none";
        bulbIcon.style.opacity = 0.4;
        break;
    }

    // Add class to indicate state
    bulbIcon.classList.toggle("active", room.mode !== "Off");
  }

  // Apply to room cards when rendered
  function enhanceRenderRoomCards() {
    const originalRenderRoomCards = renderRoomCards;

    renderRoomCards = function () {
      originalRenderRoomCards();

      // After cards are rendered, enhance with visual effects
      rooms.forEach((room) => {
        const cardSelector = `.room-card[data-room="${room.name
          .toLowerCase()
          .replace(/\s+/g, "-")}"]`;
        const card = document.querySelector(cardSelector);
        if (card) {
          updateRoomCardVisuals(card, room);
        }
      });
    };
  }

  enhanceRenderRoomCards();
  // Live preview in room control view with feedback
  document.getElementById("mode-select")?.addEventListener("change", (e) => {
    previewLightingChange();

    // Show feedback about mode change
    const modeName = e.target.value;
    let modeDescription = "";

    switch (modeName) {
      case "Dimmed Warm":
        modeDescription = "Warm, cosy lighting perfect for relaxation";
        break;
      case "Cool White":
        modeDescription = "Bright, neutral lighting for everyday activities";
        break;
      case "Productivity":
        modeDescription = "Bright, cool lighting to boost focus and alertness";
        break;
      case "Off":
        modeDescription = "Lights turned off";
        break;
    }

    window.UI.toast(`${modeName}: ${modeDescription}`, "info", 2000);
  });

  document
    .getElementById("brightness-range")
    ?.addEventListener("input", previewLightingChange);

  document
    .getElementById("brightness-range")
    ?.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value > 80) {
        window.UI.toast(
          "Tip: Lowering brightness can save energy",
          "info",
          2000
        );
      }
    });

  document
    .getElementById("temp-range")
    ?.addEventListener("input", previewLightingChange);

  function previewLightingChange() {
    if (!tempRoomState) return;

    updateTempRoomStateFromControls();

    // Create visual preview
    const controlSheet = document.querySelector(".control-sheet");
    const previewEl =
      document.getElementById("lighting-preview") ||
      document.createElement("div");

    if (!document.getElementById("lighting-preview")) {
      previewEl.id = "lighting-preview";
      previewEl.className = "lighting-preview";
      previewEl.innerHTML = "💡";
      controlSheet.querySelector(".control-body").prepend(previewEl);
    }

    // Apply visual effects based on current control settings
    const brightness = tempRoomState.brightness;
    const mode = tempRoomState.mode;

    switch (mode) {
      case "Dimmed Warm":
        previewEl.style.textShadow = `0 0 25px rgba(255, 200, 100, ${
          brightness / 100
        })`;
        previewEl.style.opacity = 0.4 + brightness / 150;
        break;
      case "Cool White":
        previewEl.style.textShadow = `0 0 25px rgba(200, 220, 255, ${
          brightness / 100
        })`;
        previewEl.style.opacity = 0.4 + brightness / 150;
        break;
      case "Productivity":
        previewEl.style.textShadow = `0 0 25px rgba(220, 240, 255, ${
          brightness / 100
        })`;
        previewEl.style.opacity = 0.4 + brightness / 150;
        break;
      case "Off":
        previewEl.style.textShadow = "none";
        previewEl.style.opacity = 0.4;
        break;
    }
  }

  // --- Room List View ---
  const roomSearchInput = document.getElementById("room-search-input");
  const roomSearchButton = roomSearchInput?.nextElementSibling;
  const roomList = document.querySelector(".room-list");

  function renderRoomList(searchTerm = "") {
    if (!roomList) return;

    roomList.innerHTML = "";
    const filteredRooms = rooms.filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredRooms.forEach((room) => {
      const li = document.createElement("li");
      li.className = "room-item";
      li.innerHTML = `
        <span class="icon bulb-icon ${
          room.mode === "Off" ? "" : "active"
        }">💡</span>
        <label>${room.name}</label>
        <span class="lighting-mode">${room.mode}</span>
        <button class="adjust-btn">Adjust</button>
      `;
      li.querySelector(".adjust-btn").addEventListener("click", () => {
        showRoomControl(room.name.toLowerCase().replace(/\s+/g, "-"));
      });
      roomList.appendChild(li);
    });
  }

  // Initialise room list when view becomes active
  document
    .querySelector('button[data-view="rooms-view"]')
    .addEventListener("click", () => {
      renderRoomList();
    });

  // Search functionality
  if (roomSearchInput && roomSearchButton) {
    roomSearchButton.addEventListener("click", () => {
      renderRoomList(roomSearchInput.value);
    });

    roomSearchInput.addEventListener("input", () => {
      renderRoomList(roomSearchInput.value);
    });
  }

  // --- Schedule Management ---
  function getSchedule() {
    return JSON.parse(localStorage.getItem("schedule")) || [];
  }

  function saveSchedule(schedule) {
    localStorage.setItem("schedule", JSON.stringify(schedule));
  }

  let schedule = getSchedule();
  // Create a working copy of the schedule that will only be saved to localStorage when Save is clicked
  let tempSchedule = [...schedule];
  let scheduleChanged = false;
  const scheduleBody = document.querySelector(".schedule-table tbody");
  // Track when switching away from schedule view
  navButtons.forEach((btn) => {
    if (btn.dataset.view !== "schedule-view") {
      btn.addEventListener("click", (event) => {
        // Store the target view in case we need to prevent navigation
        const targetView = btn.dataset.view;

        // If changes were made but not saved, ask user
        if (scheduleChanged) {
          // Prevent the default navigation temporarily
          event.preventDefault();
          event.stopPropagation();

          window.UI.modal(
            "Unsaved Schedule Changes",
            "You have unsaved changes to your schedule. What would you like to do?",
            {
              confirmText: "Discard Changes",
              cancelText: "Stay & Save",
              confirmClass: "btn-danger",
              onConfirm: () => {
                // Reset temp schedule to match the saved schedule
                tempSchedule = JSON.parse(JSON.stringify(schedule));
                scheduleChanged = false;

                // Now navigate to the target view
                views.forEach((v) =>
                  v.id === targetView
                    ? v.classList.add("active")
                    : v.classList.remove("active")
                );
                navButtons.forEach((b) =>
                  b.dataset.view === targetView
                    ? b.classList.add("active")
                    : b.classList.remove("active")
                );
              },
              onCancel: () => {
                // Stay on schedule view
                views.forEach((v) =>
                  v.id === "schedule-view"
                    ? v.classList.add("active")
                    : v.classList.remove("active")
                );
                navButtons.forEach((b) =>
                  b.dataset.view === "schedule-view"
                    ? b.classList.add("active")
                    : b.classList.remove("active")
                );
              },
            }
          );
        } else {
          // No changes, let the navigation proceed normally
        }
      });
    }
  });
  function renderSchedule() {
    if (!scheduleBody) return;

    scheduleBody.innerHTML = "";
    tempSchedule.forEach((slot, index) => {
      const row = document.createElement("tr");
      row.dataset.index = index;
      row.innerHTML = `
        <td>${slot.day}</td>
        <td>${slot.startTime}</td>
        <td>${slot.mode}</td>
        <td>${slot.endTime}</td>
        <td><button class="edit-btn" aria-label="Edit">✏️</button></td>
        <td><input type="checkbox" ${slot.enabled ? "checked" : ""}></td>
      `;

      // Add Edit button functionality for existing slots
      row.querySelector(".edit-btn").addEventListener("click", () => {
        editScheduleSlot(index);
      });

      // Add toggle functionality without auto-saving
      row
        .querySelector("input[type=checkbox]")
        .addEventListener("change", (e) => {
          tempSchedule[index].enabled = e.target.checked;
          scheduleChanged = true;
          updateSaveButtonStatus();
        });

      scheduleBody.appendChild(row);
    });
  }

  // Function to update save button appearance
  function updateSaveButtonStatus() {
    const saveBtn = document.getElementById("save-schedule-btn");
    if (scheduleChanged) {
      saveBtn.classList.add("unsaved"); // Add class for styling
    } else {
      saveBtn.classList.remove("unsaved");
    }
  }
  // Initialise schedule when view becomes active
  document
    .querySelector('button[data-view="schedule-view"]')
    .addEventListener("click", () => {
      // Reset tempSchedule to match the saved schedule when returning to view
      tempSchedule = JSON.parse(JSON.stringify(schedule));
      scheduleChanged = false;
      renderSchedule();
      updateSaveButtonStatus();
    });

  // Prevent data loss when navigating away from schedule view
  function checkUnsavedChanges() {
    if (scheduleChanged) {
      return confirm(
        "You have unsaved changes to your schedule. Leave anyway?"
      );
    }
    return true;
  }

  // Add navigation protection to other view buttons
  document
    .querySelectorAll('.bottom-nav button:not([data-view="schedule-view"])')
    .forEach((btn) => {
      btn.addEventListener(
        "click",
        (e) => {
          if (!checkUnsavedChanges()) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        },
        true
      ); // Use capture phase to intercept before view change
    });
  // Add new schedule slot
  document.getElementById("add-slot-btn").addEventListener("click", () => {
    const newRow = document.createElement("tr");
    newRow.className = "new-schedule-row";
    newRow.innerHTML = `
      <td><select class="new-day">
        <option>Monday</option>
        <option>Tuesday</option>
        <option>Wednesday</option>
        <option>Thursday</option>
        <option>Friday</option>
        <option>Saturday</option>
        <option>Sunday</option>
        <option>Everyday</option>
      </select></td>
      <td><input type="time" class="new-start-time"></td>
      <td><select class="new-mode">
        <option>Dimmed Warm</option>
        <option>Cool White</option>
        <option>Productivity</option>
        <option>Off</option>
      </select></td>
      <td><input type="time" class="new-end-time"></td>
      <td><button class="edit-btn" aria-label="Edit">✏️</button></td>
      <td><input type="checkbox" class="new-enabled" checked></td>
    `; // Add listeners to all form fields to detect changes
    const addChangeListener = (element) => {
      element.addEventListener("change", () => {
        scheduleChanged = true;
        updateSaveButtonStatus();

        // Visual feedback for required fields
        const startTime = newRow.querySelector(".new-start-time");
        const endTime = newRow.querySelector(".new-end-time");

        if (startTime.value && !endTime.value) {
          endTime.style.borderColor = "var(--unsaved-color)";
        } else {
          endTime.style.borderColor = "";
        }

        if (endTime.value && !startTime.value) {
          startTime.style.borderColor = "var(--unsaved-color)";
        } else {
          startTime.style.borderColor = "";
        }
      });
    };

    addChangeListener(newRow.querySelector(".new-day"));
    addChangeListener(newRow.querySelector(".new-start-time"));
    addChangeListener(newRow.querySelector(".new-mode"));
    addChangeListener(newRow.querySelector(".new-end-time"));
    addChangeListener(newRow.querySelector(".new-enabled"));

    scheduleBody.appendChild(newRow);
  });
  // Edit schedule slot
  function editScheduleSlot(index) {
    const slot = tempSchedule[index];
    const row = scheduleBody.querySelector(`tr[data-index="${index}"]`);

    row.innerHTML = `
      <td><select>
        <option ${slot.day === "Monday" ? "selected" : ""}>Monday</option>
        <option ${slot.day === "Tuesday" ? "selected" : ""}>Tuesday</option>
        <option ${slot.day === "Wednesday" ? "selected" : ""}>Wednesday</option>
        <option ${slot.day === "Thursday" ? "selected" : ""}>Thursday</option>
        <option ${slot.day === "Friday" ? "selected" : ""}>Friday</option>
        <option ${slot.day === "Saturday" ? "selected" : ""}>Saturday</option>
        <option ${slot.day === "Sunday" ? "selected" : ""}>Sunday</option>
        <option ${slot.day === "Everyday" ? "selected" : ""}>Everyday</option>
      </select></td>
      <td><input type="time" value="${slot.startTime}"></td>
      <td><select>
        <option ${
          slot.mode === "Dimmed Warm" ? "selected" : ""
        }>Dimmed Warm</option>
        <option ${
          slot.mode === "Cool White" ? "selected" : ""
        }>Cool White</option>
        <option ${
          slot.mode === "Productivity" ? "selected" : ""
        }>Productivity</option>
        <option ${slot.mode === "Off" ? "selected" : ""}>Off</option>
      </select></td>
      <td><input type="time" value="${slot.endTime}"></td>
      <td><button class="save-slot-btn" aria-label="Save">💾</button></td>
      <td><input type="checkbox" ${slot.enabled ? "checked" : ""}></td>
    `;

    // Add save button functionality for edited slots
    row.querySelector(".save-slot-btn").addEventListener("click", () => {
      const day = row.querySelector("td:nth-child(1) select").value;
      const startTime = row.querySelector("td:nth-child(2) input").value;
      const mode = row.querySelector("td:nth-child(3) select").value;
      const endTime = row.querySelector("td:nth-child(4) input").value;
      const enabled = row.querySelector("td:nth-child(6) input").checked;

      if (day && startTime && endTime) {
        tempSchedule[index] = { day, startTime, mode, endTime, enabled };
        scheduleChanged = true;
        renderSchedule();
        updateSaveButtonStatus();
      }
    });
  }
  // Clear all schedule slots
  document.getElementById("clear-all-btn").addEventListener("click", () => {
    window.UI.modal(
      "Clear Schedule",
      "Are you sure you want to clear all schedule slots? (Changes will not be saved until you click Save)",
      {
        confirmText: "Clear All",
        cancelText: "Cancel",
        confirmClass: "btn-danger",
        onConfirm: () => {
          tempSchedule = [];
          scheduleChanged = true;
          renderSchedule();
          updateSaveButtonStatus();
          window.UI.toast("All schedule slots have been cleared", "info");
        },
      }
    );
  }); // Save schedule
  document.getElementById("save-schedule-btn").addEventListener("click", () => {
    // Check for any new schedule entries that need to be added
    const newScheduleRows = Array.from(
      document.querySelectorAll(".new-schedule-row")
    );
    let invalidEntries = false;

    if (newScheduleRows.length > 0) {
      newScheduleRows.forEach((row) => {
        const day = row.querySelector(".new-day").value;
        const startTime = row.querySelector(".new-start-time").value;
        const mode = row.querySelector(".new-mode").value;
        const endTime = row.querySelector(".new-end-time").value;
        const enabled = row.querySelector(".new-enabled").checked;

        if (day && startTime && endTime) {
          tempSchedule.push({ day, startTime, mode, endTime, enabled });
        } else if (startTime || endTime) {
          // If they've started filling out the row but didn't complete it
          invalidEntries = true;
        }
      });
    }

    if (invalidEntries) {
      window.UI.modal(
        "Incomplete Entries",
        "Some new schedule entries are incomplete and will not be saved. Would you like to continue?",
        {
          confirmText: "Save Anyway",
          cancelText: "Go Back & Fix",
          onConfirm: () => saveScheduleWithFeedback(),
        }
      );
    } else {
      saveScheduleWithFeedback();
    }

    function saveScheduleWithFeedback() {
      // Show saving indicator
      const saveBtn = document.getElementById("save-schedule-btn");
      const originalText = saveBtn.textContent;
      saveBtn.innerHTML = `<span class="saving-indicator">Saving...</span>`;
      saveBtn.disabled = true;

      // Simulate network delay (remove in production)
      setTimeout(() => {
        schedule = JSON.parse(JSON.stringify(tempSchedule)); // Deep copy
        saveSchedule(schedule);
        scheduleChanged = false;
        renderSchedule(); // Rerender to update the list and remove new-schedule-row entries
        updateSaveButtonStatus();

        // Reset button
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;

        // Show success message
        window.UI.toast("Schedule saved successfully!", "success");
      }, 600);
    }
  });
  // Apply to all weekdays
  document
    .getElementById("apply-weekdays-btn")
    .addEventListener("click", () => {
      const selectedSlots = Array.from(
        scheduleBody.querySelectorAll('input[type="checkbox"]:checked')
      )
        .map((checkbox) => parseInt(checkbox.closest("tr").dataset.index))
        .filter((index) => !isNaN(index));

      if (selectedSlots.length === 0) {
        window.UI.toast(
          "Please select at least one schedule slot to apply to weekdays",
          "warning"
        );
        return;
      }

      // Show loading state
      const applyBtn = document.getElementById("apply-weekdays-btn");
      const originalText = applyBtn.textContent;
      applyBtn.textContent = "Applying...";
      applyBtn.disabled = true;

      const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const newSchedule = [...tempSchedule];

      // Simulate network delay (remove in production)
      setTimeout(() => {
        selectedSlots.forEach((index) => {
          const slot = tempSchedule[index];
          weekdays.forEach((day) => {
            if (day !== slot.day) {
              newSchedule.push({
                ...slot,
                day,
              });
            }
          });
        });
        tempSchedule = newSchedule;
        scheduleChanged = true;
        renderSchedule();
        updateSaveButtonStatus();

        // Restore button state
        applyBtn.textContent = originalText;
        applyBtn.disabled = false;

        window.UI.toast(
          "Applied selected schedules to all weekdays!",
          "success"
        );
      }, 400); // Short delay for feedback
    });
  // --- Room Control Overlay Logic ---
  let currentRoomKey = null;
  let tempRoomState = null;
  let previousView = "home-view"; // Track previous view for better back navigation;

  function switchView(id) {
    // Store previous view before switching
    const currentActiveView = document.querySelector(".view.active");
    if (currentActiveView && id !== currentActiveView.id) {
      previousView = currentActiveView.id;
    }
    document
      .querySelectorAll(".view")
      .forEach((v) =>
        v.id === id ? v.classList.add("active") : v.classList.remove("active")
      );

    // Update nav buttons to match current view
    document.querySelectorAll(".bottom-nav button").forEach((btn) => {
      if (btn.dataset.view === id) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  function showRoomControl(key) {
    currentRoomKey = key;
    const room = rooms.find(
      (r) => r.name.toLowerCase().replace(/\s+/g, "-") === key
    );
    tempRoomState = { ...room };
    document.getElementById("control-room-name").textContent = room.name;
    document.getElementById("mode-select").value = room.mode;
    document.getElementById("brightness-range").value = room.brightness;
    document.getElementById("temp-range").value = room.temp;
    document.getElementById("occupancy-toggle").checked = room.occupancy; // Add remove button if not present
    let removeBtn = document.getElementById("remove-room-btn");
    if (!removeBtn) {
      removeBtn = document.createElement("button");
      removeBtn.id = "remove-room-btn";
      removeBtn.textContent = "Remove Room";
      removeBtn.style = "margin-top:12px;background:#e74c3c;color:#fff;";
      document.querySelector(".control-footer").appendChild(removeBtn);
      removeBtn.addEventListener("click", () => {
        const roomName = rooms.find(
          (r) => r.name.toLowerCase().replace(/\s+/g, "-") === currentRoomKey
        )?.name;
        window.UI.modal(
          "Remove Room",
          `Are you sure you want to remove ${
            roomName || "this room"
          }? This action cannot be undone.`,
          {
            confirmText: "Remove",
            cancelText: "Cancel",
            confirmClass: "btn-danger",
            onConfirm: () => {
              rooms = rooms.filter(
                (r) =>
                  r.name.toLowerCase().replace(/\s+/g, "-") !== currentRoomKey
              );
              saveRooms(rooms);
              renderRoomCards();
              switchView("home-view");
              window.UI.toast(`${roomName || "Room"} was removed`, "success");
            },
          }
        );
      });
    }
    switchView("room-control-view");
  }
  // --- Modal Controls Logic ---
  function updateTempRoomStateFromControls() {
    tempRoomState.mode = document.getElementById("mode-select").value;
    tempRoomState.brightness = parseInt(
      document.getElementById("brightness-range").value,
      10
    );
    tempRoomState.temp = parseInt(
      document.getElementById("temp-range").value,
      10
    );
    tempRoomState.occupancy =
      document.getElementById("occupancy-toggle").checked;
  }
  document.getElementById("apply-btn").onclick = function () {
    updateTempRoomStateFromControls();
    // Update UI only, not saved to storage
    const idx = rooms.findIndex(
      (r) => r.name.toLowerCase().replace(/\s+/g, "-") === currentRoomKey
    );
    if (idx !== -1) {
      rooms[idx] = { ...tempRoomState };
      renderRoomCards();
    }
    switchView("home-view");
  };
  document.getElementById("save-btn").onclick = function () {
    updateTempRoomStateFromControls();

    // Show loading indicator
    const saveBtn = this;
    const originalText = saveBtn.textContent;
    saveBtn.innerHTML = `<span class="saving-indicator">Saving...</span>`;
    saveBtn.disabled = true;

    // Simulate network delay (remove in production)
    setTimeout(() => {
      const idx = rooms.findIndex(
        (r) => r.name.toLowerCase().replace(/\s+/g, "-") === currentRoomKey
      );
      if (idx !== -1) {
        const roomName = rooms[idx].name;
        rooms[idx] = { ...tempRoomState };
        saveRooms(rooms);
        renderRoomCards();
        showToast(
          `Settings for ${roomName} saved successfully`,
          "success"
        );
      }

      // Reset button state
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;

      switchView("home-view");
    }, 600); // Short delay to show loading state
  };
  // Configure room control back button
  const roomControlBackBtn = document.querySelector(
    "#room-control-view .back-btn"
  );

  // Make sure back button is keyboard accessible
  roomControlBackBtn.setAttribute("tabindex", "0");

  // Add keyboard navigation
  roomControlBackBtn.addEventListener("keydown", function (e) {
    // Spacebar or Enter triggers click
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this.click();
    }

    // Escape key also goes back (standard UX pattern)
    if (e.key === "Escape") {
      e.preventDefault();
      this.click();
    }
  });
  // Room control back button behavior
  roomControlBackBtn.onclick = function () {
    // Check for unsaved changes
    let hasChanges = false;

    if (currentRoomKey && tempRoomState) {
      const room = rooms.find(
        (r) => r.name.toLowerCase().replace(/\s+/g, "-") === currentRoomKey
      );

      // Compare current values with saved values
      const currentMode = document.getElementById("mode-select").value;
      const currentBrightness = parseInt(
        document.getElementById("brightness-range").value,
        10
      );
      const currentTemp = parseInt(
        document.getElementById("temp-range").value,
        10
      );
      const currentOccupancy =
        document.getElementById("occupancy-toggle").checked;

      hasChanges =
        currentMode !== room.mode ||
        currentBrightness !== room.brightness ||
        currentTemp !== room.temp ||
        currentOccupancy !== room.occupancy;
    }

    // If changes were made, confirm before navigating back
    if (hasChanges) {
      // Add haptic feedback for mobile devices if supported
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(100); // Light vibration to indicate important action
      }

      window.UI.modal(
        "Unsaved Changes",
        "You have unsaved changes to your room settings. What would you like to do?",
        {
          confirmText: "Discard Changes",
          cancelText: "Keep Editing",
          confirmClass: "btn-danger",
          onConfirm: () => {
            // User confirmed to discard changes - reset to last saved state
            if (currentRoomKey) {
              const room = rooms.find(
                (r) =>
                  r.name.toLowerCase().replace(/\s+/g, "-") === currentRoomKey
              );
              document.getElementById("mode-select").value = room.mode;
              document.getElementById("brightness-range").value =
                room.brightness;
              document.getElementById("temp-range").value = room.temp;
              document.getElementById("occupancy-toggle").checked =
                room.occupancy;
            }

            // Navigate back using history
            if (navigationHistory.length > 1) {
              navigationHistory.pop();
              const prevView = navigationHistory[navigationHistory.length - 1];
              switchView(prevView);
            } else {
              switchView("home-view"); // Fallback
            }
          },
        }
      );
      // If user cancels, stay on current view and keep changes
    } else {
      // No changes, navigate back using history
      if (navigationHistory.length > 1) {
        navigationHistory.pop();
        const prevView = navigationHistory[navigationHistory.length - 1];
        switchView(prevView);
      } else {
        switchView("home-view"); // Fallback
      }
    }
  }; // --- Help Button Functionality ---
  const helpButtons = document.querySelectorAll(".help-btn");

  helpButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const viewId = btn.closest(".view").id;
      let title = "";
      let helpMessage = "";
      switch (viewId) {
        case "home-view":
          title = "Home Dashboard Help";
          helpMessage =
            "View and control rooms at a glance. Click Adjust to change settings for a specific room.";
          break;
        case "rooms-view":
          title = "Rooms Overview Help";
          helpMessage =
            "See all rooms and search for specific ones. Click Adjust to change settings.";
          break;
        case "savings-view":
          title = "Savings View Help";
          helpMessage =
            "Track your energy savings over time and get eco-friendly tips to reduce consumption.";
          break;
        case "schedule-view":
          title = "Schedule Management Help";
          helpMessage =
            "Set up automated lighting schedules. Add time slots, toggle them on/off, and apply to multiple days.";
          break;
        case "room-control-view":
          title = "Room Control Help";
          helpMessage =
            "Adjust brightness, colour temperature, lighting mode, and occupancy detection for this room.";
          break;
        default:
          title = "Smart Adaptive Lighting";
          helpMessage =
            "Control your home lighting system for comfort and energy efficiency.";
      }

      window.UI.modal(title, helpMessage, {
        confirmText: "Understood",
        showCancel: false,
        confirmClass: "btn-primary",
      });
    });
  });

  // Modal dialog messages
  if (hasChanges) {
    window.UI.modal(
      "Unsaved Changes",
      "You have unsaved changes to your room settings. What would you like to do?",
      {
        confirmText: "Discard Changes",
        cancelText: "Keep Editing",
        confirmClass: "btn-danger",
        onConfirm: () => {
          // ...existing code...
        },
      }
    );
  }

  // Schedule-related messages
  if (invalidEntries) {
    window.UI.modal(
      "Incomplete Entries",
      "Some new schedule entries are incomplete and will not be saved. Would you like to continue?",
      {
        confirmText: "Save Anyway",
        cancelText: "Go Back & Fix",
        onConfirm: () => saveScheduleWithFeedback(),
      }
    );
  }

  // Room removal confirmation
  window.UI.modal(
    "Remove Room",
    `Are you sure you want to remove ${roomName || "this room"}? This action cannot be undone.`,
    {
      confirmText: "Remove",
      cancelText: "Cancel",
      confirmClass: "btn-danger",
      onConfirm: () => {
        // ...existing code...
      },
    }
  );

  // Toast messages
  showToast(`Updated settings for ${rooms[roomIndex].name}`, "success");
  showToast("Tip: Lowering brightness can save energy", "info", 2000);
  showToast("Schedule saved successfully!", "success");
  showToast("Applied selected schedules to all weekdays!", "success");
  showToast(`Settings for ${roomName} saved successfully`, "success");
  showToast(`${roomName || "Room"} was removed`, "success");
  showToast("Please enter a room name", "error");
  showToast("A room with this name already exists", "error");
  showToast(`Room "${name}" has been added`, "success");
  showToast("All schedule slots have been cleared", "info");
  showToast("Please select at least one schedule slot to apply to weekdays", "warning");
});
