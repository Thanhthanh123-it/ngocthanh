const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const menuLinks = document.querySelectorAll(".menu-link");

// Updates the theme icon based on current theme and sidebar state
const updateThemeIcon = () => {
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent = sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
};

// Apply dark theme if saved or system prefers, then update icon
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
updateThemeIcon();

// Toggle between themes on theme button click
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
});

// Toggle sidebar collapsed state on buttons click
sidebarToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
  });
});

// Expand the sidebar when the search form is clicked
searchForm.addEventListener("click", () => {
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    searchForm.querySelector("input").focus();
  }
});

// Expand sidebar by default on large screens
if (window.innerWidth > 768) sidebar.classList.remove("collapsed");

// Content switching logic
const contents = document.querySelectorAll(".main-content .content");
menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const contentId = link.getAttribute("data-content");
    contents.forEach(content => {
      content.style.display = content.classList.contains(contentId) ? "block" : "none";
    });
    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Initialize Memory Card Game if Analytics is selected
    if (contentId === "analytics") {
      initializeMemoryGame();
    }
    // Initialize Drawing App if Notifications is selected
    if (contentId === "notifications") {
      initializeDrawingApp();
    }
    if (contentId === "favourites") {
      initializePiano();
    }
  });
});

// Memory Card Game JavaScript
function initializeMemoryGame() {
  const cards = document.querySelectorAll(".memory-game-wrapper .card");
  let matched = 0;
  let cardOne, cardTwo;
  let disableDeck = false;

  function flipCard({target: clickedCard}) {
    if (cardOne !== clickedCard && !disableDeck) {
      clickedCard.classList.add("flip");
      if (!cardOne) {
        return cardOne = clickedCard;
      }
      cardTwo = clickedCard;
      disableDeck = true;
      let cardOneImg = cardOne.querySelector(".back-view img").src,
          cardTwoImg = cardTwo.querySelector(".back-view img").src;
      matchCards(cardOneImg, cardTwoImg);
    }
  }

  function matchCards(img1, img2) {
    if (img1 === img2) {
      matched++;
      if (matched == 8) {
        setTimeout(() => {
          return shuffleCard();
        }, 1000);
      }
      cardOne.removeEventListener("click", flipCard);
      cardTwo.removeEventListener("click", flipCard);
      cardOne = cardTwo = "";
      return disableDeck = false;
    }
    setTimeout(() => {
      cardOne.classList.add("shake");
      cardTwo.classList.add("shake");
    }, 400);

    setTimeout(() => {
      cardOne.classList.remove("shake", "flip");
      cardTwo.classList.remove("shake", "flip");
      cardOne = cardTwo = "";
      disableDeck = false;
    }, 1200);
  }

  function shuffleCard() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
    arr.sort(() => Math.random() > 0.5 ? 1 : -1);
    cards.forEach((card, i) => {
      card.classList.remove("flip");
      let imgTag = card.querySelector(".back-view img");
      imgTag.src = `images/img-${arr[i]}.png`;
      card.addEventListener("click", flipCard);
    });
  }

  // Remove existing event listeners to prevent duplicates
  cards.forEach(card => {
    card.removeEventListener("click", flipCard);
    card.addEventListener("click", flipCard);
  });

  shuffleCard();
}

// Drawing App JavaScript
function initializeDrawingApp() {
  const canvas = document.querySelector(".drawing-app-container canvas"),
        toolBtns = document.querySelectorAll(".drawing-app-container .tool"),
        fillColor = document.querySelector(".drawing-app-container #fill-color"),
        sizeSlider = document.querySelector(".drawing-app-container #size-slider"),
        colorBtns = document.querySelectorAll(".drawing-app-container .colors .option"),
        colorPicker = document.querySelector(".drawing-app-container #color-picker"),
        clearCanvas = document.querySelector(".drawing-app-container .clear-canvas"),
        saveImg = document.querySelector(".drawing-app-container .save-img"),
        ctx = canvas.getContext("2d");

  // Global variables with default value
  let prevMouseX, prevMouseY, snapshot,
      isDrawing = false,
      selectedTool = "brush",
      brushWidth = 5,
      selectedColor = "#000";

  const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
  };

  const initializeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
  };

  const drawRect = (e) => {
    if (!fillColor.checked) {
      return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
  };

  const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };

  const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };

  const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    } else if (selectedTool === "rectangle") {
      drawRect(e);
    } else if (selectedTool === "circle") {
      drawCircle(e);
    } else {
      drawTriangle(e);
    }
  };

  // Remove existing event listeners to prevent duplicates
  toolBtns.forEach(btn => {
    btn.removeEventListener("click", () => {});
    btn.addEventListener("click", () => {
      document.querySelector(".drawing-app-container .options .active").classList.remove("active");
      btn.classList.add("active");
      selectedTool = btn.id;
    });
  });

  sizeSlider.removeEventListener("change", () => {});
  sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

  colorBtns.forEach(btn => {
    btn.removeEventListener("click", () => {});
    btn.addEventListener("click", () => {
      document.querySelector(".drawing-app-container .options .selected").classList.remove("selected");
      btn.classList.add("selected");
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
  });

  colorPicker.removeEventListener("change", () => {});
  colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });

  clearCanvas.removeEventListener("click", () => {});
  clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  });

  saveImg.removeEventListener("click", () => {});
  saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  });

  canvas.removeEventListener("mousedown", startDraw);
  canvas.removeEventListener("mousemove", drawing);
  canvas.removeEventListener("mouseup", () => {});
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", drawing);
  canvas.addEventListener("mouseup", () => isDrawing = false);

  // Initialize canvas on load
  initializeCanvas();

  // Re-initialize canvas on window resize
  window.addEventListener("resize", initializeCanvas);
}

// Piano JavaScript
function initializePiano() {
  const pianoKeys = document.querySelectorAll(".piano-wrapper .key"),
        volumeSlider = document.querySelector(".piano-wrapper .volume-slider input"),
        keysCheckbox = document.querySelector(".piano-wrapper .keys-checkbox input");

  let allKeys = [],
      audio = new Audio(`tunes/a.wav`);

  const playTune = (key) => {
    audio.src = `tunes/${key}.wav`;
    audio.play();
    const clickedKey = document.querySelector(`.piano-wrapper [data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => {
      clickedKey.classList.remove("active");
    }, 150);
  };

  pianoKeys.forEach((key) => {
    allKeys.push(key.dataset.key);
    // Ngăn chặn sự kiện trùng lặp
    key.removeEventListener("click", () => {});
    key.addEventListener("click", () => playTune(key.dataset.key));
  });

  const handleVolume = (e) => {
    audio.volume = e.target.value;
  };

  const showHideKeys = () => {
    pianoKeys.forEach((key) => key.classList.toggle("hide"));
  };

  const pressedKey = (e) => {
    // Chỉ xử lý khi Favourites đang hiển thị
    if (document.querySelector(".content.favourites").style.display === "block" && allKeys.includes(e.key)) {
      playTune(e.key);
    }
  };

  // Ngăn chặn sự kiện trùng lặp
  keysCheckbox.removeEventListener("click", showHideKeys);
  volumeSlider.removeEventListener("input", handleVolume);
  document.removeEventListener("keydown", pressedKey);

  keysCheckbox.addEventListener("click", showHideKeys);
  volumeSlider.addEventListener("input", handleVolume);
  document.addEventListener("keydown", pressedKey);

  // Xóa sự kiện keydown khi rời khỏi Favourites
  const menuLinks = document.querySelectorAll(".menu-link");
  menuLinks.forEach(link => {
    link.removeEventListener("click", () => {});
    link.addEventListener("click", (e) => {
      if (link.getAttribute("data-content") !== "favourites") {
        document.removeEventListener("keydown", pressedKey);
      }
    });
  });
}

// === PROFILE SLIDER ===
let currentSlide = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slide').length;
const dots = document.querySelector('.dots');

if (slides && dots) {
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
  }
  updateDots();
}

function updateDots() {
  document.querySelectorAll('.dots span').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = index;
  if (currentSlide < 0) currentSlide = totalSlides - 1;
  if (currentSlide >= totalSlides) currentSlide = 0;
  slides.style.transform = `translateX(-${currentSlide * 310}px)`;
  updateDots();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

setInterval(nextSlide, 3000);
