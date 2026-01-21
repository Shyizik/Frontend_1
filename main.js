/* =========================================
   ЛОГІКА 3D СЛАЙДЕРА (Bookshelf Project)
   Використовує бібліотеку GSAP для анімацій
   ========================================= */

// --- Ініціалізація та очікування завантаження зображень ---
// imagesLoaded: бібліотека, що гарантує, що всі картинки завантажені перед стартом скрипта
const { gsap, imagesLoaded } = window;

// Вибір основних DOM-елементів (кнопки, картки, фон)
const buttons = {
    prev: document.querySelector(".btn--left"),
    next: document.querySelector(".btn--right"),
};
const cardsContainerEl = document.querySelector(".cards__wrapper");
const appBgContainerEl = document.querySelector(".app__bg");
const cardInfosContainerEl = document.querySelector(".info__wrapper");

// --- Події кнопок навігації ---
// При кліку викликається функція swapCards з аргументом напрямку
buttons.next.addEventListener("click", () => swapCards("right"));
buttons.prev.addEventListener("click", () => swapCards("left"));

// --- Основна функція зміни карток ---
function swapCards(direction) {
    // Вибираємо поточні, попередні та наступні елементи для карток, фону та тексту
    const currentCardEl = cardsContainerEl.querySelector(".current--card");
    const previousCardEl = cardsContainerEl.querySelector(".previous--card");
    const nextCardEl = cardsContainerEl.querySelector(".next--card");

    const currentBgImageEl = appBgContainerEl.querySelector(".current--image");
    const previousBgImageEl = appBgContainerEl.querySelector(".previous--image");
    const nextBgImageEl = appBgContainerEl.querySelector(".next--image");

    // Зміна текстової інформації
    changeInfo(direction);
    // Зміна класів (CSS) для анімації переходу
    swapCardsClass();

    // Видаляємо слухачі подій, щоб уникнути багів під час анімації
    removeCardEvents(currentCardEl);

    // Логіка для напрямку "Вправо"
    function swapCardsClass() {
        // Видаляємо поточні класи
        currentCardEl.classList.remove("current--card");
        previousCardEl.classList.remove("previous--card");
        nextCardEl.classList.remove("next--card");

        currentBgImageEl.classList.remove("current--image");
        previousBgImageEl.classList.remove("previous--image");
        nextBgImageEl.classList.remove("next--image");

        // Зсуваємо класи в залежності від напрямку (циклічний список)
        currentCardEl.style.zIndex = "50";
        currentBgImageEl.style.zIndex = "-2";

        if (direction === "right") {
            // Рух вперед: Next стає Current
            previousCardEl.style.zIndex = "20";
            nextCardEl.style.zIndex = "30";

            nextCardEl.classList.add("current--card");
            currentCardEl.classList.add("previous--card");
            previousCardEl.classList.add("next--card");

            nextBgImageEl.classList.add("current--image");
            currentBgImageEl.classList.add("previous--image");
            previousBgImageEl.classList.add("next--image");
        } else if (direction === "left") {
            // Рух назад: Previous стає Current
            previousCardEl.style.zIndex = "30";
            nextCardEl.style.zIndex = "20";

            previousCardEl.classList.add("current--card");
            nextCardEl.classList.add("previous--card");
            currentCardEl.classList.add("next--card");

            previousBgImageEl.classList.add("current--image");
            nextBgImageEl.classList.add("previous--image");
            currentBgImageEl.classList.add("next--image");
        }
    }
}

// --- Функція зміни текстового опису ---
function changeInfo(direction) {
    const currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
    const previousInfoEl = cardInfosContainerEl.querySelector(".previous--info");
    const nextInfoEl = cardInfosContainerEl.querySelector(".next--info");

    // Анімація зникнення старого тексту (GSAP)
    gsap.timeline()
        .to([buttons.prev, buttons.next], {
            duration: 0.2,
            opacity: 0.5,
            pointerEvents: "none", // Блокуємо кнопки під час анімації
        })
        .to(currentInfoEl.querySelectorAll(".text"), {
            duration: 0.4,
            stagger: 0.1,
            translateY: "-120px",
            opacity: 0,
        })
        .call(() => {
            swapInfosClass(direction);
        })
        .call(() => initCardEvents()) // Повертаємо події
        .fromTo(
            direction === "right"
                ? nextInfoEl.querySelectorAll(".text")
                : previousInfoEl.querySelectorAll(".text"),
            {
                opacity: 0,
                translateY: "40px",
            },
            {
                duration: 0.4,
                stagger: 0.1,
                translateY: "0px",
                opacity: 1,
            }
        )
        .to([buttons.prev, buttons.next], {
            duration: 0.2,
            opacity: 1,
            pointerEvents: "all",
        });

    function swapInfosClass(direction) {
        // Видалення класів
        currentInfoEl.classList.remove("current--info");
        previousInfoEl.classList.remove("previous--info");
        nextInfoEl.classList.remove("next--info");

        // Присвоєння нових класів
        if (direction === "right") {
            currentInfoEl.classList.add("previous--info");
            nextInfoEl.classList.add("current--info");
            previousInfoEl.classList.add("next--info");
        } else if (direction === "left") {
            currentInfoEl.classList.add("next--info");
            nextInfoEl.classList.add("previous--info");
            previousInfoEl.classList.add("current--info");
        }
    }
}

// --- Допоміжні функції для оновлення DOM ---
function updateCard(e) {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const centerPosition = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
    // Розрахунок кута повороту при наведенні миші (ефект паралаксу)
    let angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
    gsap.set(card, {
        "--current-card-rotation-offset": `${angle}deg`,
    });
    const currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
    gsap.set(currentInfoEl, {
        rotateY: `${angle}deg`,
    });
}

function resetCardTransforms(e) {
    const card = e.currentTarget;
    const currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
    gsap.set(card, {
        "--current-card-rotation-offset": 0,
    });
    gsap.set(currentInfoEl, {
        rotateY: 0,
    });
}

// Ініціалізація подій наведення
function initCardEvents() {
    const currentCardEl = cardsContainerEl.querySelector(".current--card");
    currentCardEl.addEventListener("pointermove", updateCard);
    currentCardEl.addEventListener("pointerout", resetCardTransforms);
}
initCardEvents();

function removeCardEvents(card) {
    card.removeEventListener("pointermove", updateCard);
}

// --- Функція ініціалізації при завантаженні ---
function init() {
    let tl = gsap.timeline();

    // Анімація зникнення лоадера
    tl.to(document.querySelector(".loading__wrapper"), {
        duration: 0.8,
        opacity: 0,
        pointerEvents: "none",
    })
    // Початкова анімація появи карток
    .from(".card", {
        duration: 0.8,
        opacity: 0,
        y: 50,
        stagger: 0.1,
    })
    .from(".info", {
        duration: 0.8,
        opacity: 0,
        y: 20,
    }, "-=0.5");
}

// Запуск init() після завантаження всіх картинок
const waitForImages = () => {
    const images = [...document.querySelectorAll("img")];
    const totalImages = images.length;
    let loadedImages = 0;
    const loaderEl = document.querySelector(".loader span");

    gsap.set(cardsContainerEl.children, {
        "--card-translateY-offset": "100vh",
    });

    images.forEach((image) => {
        imagesLoaded(image, (instance) => {
            if (instance.isComplete) {
                loadedImages++;
                let loadProgress = loadedImages / totalImages;
                gsap.to(loaderEl, {
                    duration: 1,
                    scaleX: loadProgress,
                    backgroundColor: `hsl(${loadProgress * 120}, 100%, 50%)`,
                });
                if (totalImages == loadedImages) {
                    gsap.timeline()
                        .to(".loading__wrapper", {
                            duration: 0.8,
                            opacity: 0,
                            pointerEvents: "none",
                        })
                        .call(() => init());
                }
            }
        });
    });
};

waitForImages();
