console.clear();

const { gsap } = window;

const buttons = {
    prev: document.querySelector(".btn--left"),
    next: document.querySelector(".btn--right"),
};
const cardsContainerEl = document.querySelector(".cards__wrapper");
const appBgContainerEl = document.querySelector(".app__bg");
const cardInfosContainerEl = document.querySelector(".info__wrapper");

buttons.next.addEventListener("click", () => swapCards("right"));
buttons.prev.addEventListener("click", () => swapCards("left"));

// Ініціалізація, без очікування картинок
function init() {
    let tl = gsap.timeline();

    // Показуємо картки
    tl.from(".card", {
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
    
    initCardEvents();
}

// Запускаємо init
init();

function swapCards(direction) {
    const currentCardEl = cardsContainerEl.querySelector(".current--card");
    const previousCardEl = cardsContainerEl.querySelector(".previous--card");
    const nextCardEl = cardsContainerEl.querySelector(".next--card");

    const currentBgImageEl = appBgContainerEl.querySelector(".current--image");
    const previousBgImageEl = appBgContainerEl.querySelector(".previous--image");
    const nextBgImageEl = appBgContainerEl.querySelector(".next--image");

    changeInfo(direction);
    swapCardsClass();
    removeCardEvents(currentCardEl);

    function swapCardsClass() {
        currentCardEl.classList.remove("current--card");
        previousCardEl.classList.remove("previous--card");
        nextCardEl.classList.remove("next--card");

        currentBgImageEl.classList.remove("current--image");
        previousBgImageEl.classList.remove("previous--image");
        nextBgImageEl.classList.remove("next--image");

        currentCardEl.style.zIndex = "50";
        currentBgImageEl.style.zIndex = "-2";

        if (direction === "right") {
            previousCardEl.style.zIndex = "20";
            nextCardEl.style.zIndex = "30";

            nextCardEl.classList.add("current--card");
            currentCardEl.classList.add("previous--card");
            previousCardEl.classList.add("next--card");

            nextBgImageEl.classList.add("current--image");
            currentBgImageEl.classList.add("previous--image");
            previousBgImageEl.classList.add("next--image");
        } else if (direction === "left") {
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

function changeInfo(direction) {
    let currentInfoEl = cardInfosContainerEl.querySelector(".current--info");
    let previousInfoEl = cardInfosContainerEl.querySelector(".previous--info");
    let nextInfoEl = cardInfosContainerEl.querySelector(".next--info");

    gsap.timeline()
        .to([buttons.prev, buttons.next], {
            duration: 0.2,
            opacity: 0.5,
            pointerEvents: "none",
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
        .call(() => initCardEvents())
        .fromTo(
            direction === "right" ? nextInfoEl.querySelectorAll(".text") : previousInfoEl.querySelectorAll(".text"),
            { opacity: 0, translateY: "40px" },
            { duration: 0.4, stagger: 0.1, translateY: "0px", opacity: 1 }
        )
        .to([buttons.prev, buttons.next], {
            duration: 0.2,
            opacity: 1,
            pointerEvents: "all",
        });

    function swapInfosClass(direction) {
        currentInfoEl.classList.remove("current--info");
        previousInfoEl.classList.remove("previous--info");
        nextInfoEl.classList.remove("next--info");

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

function updateCard(e) {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const centerPosition = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    let angle = Math.atan2(e.pageX - centerPosition.x, 0) * (35 / Math.PI);
    gsap.set(card, { "--current-card-rotation-offset": `${angle}deg` });
}

function resetCardTransforms(e) {
    const card = e.currentTarget;
    gsap.set(card, { "--current-card-rotation-offset": 0 });
}

function initCardEvents() {
    const currentCardEl = cardsContainerEl.querySelector(".current--card");
    if(currentCardEl) {
        currentCardEl.addEventListener("pointermove", updateCard);
        currentCardEl.addEventListener("pointerout", resetCardTransforms);
    }
}

function removeCardEvents(card) {
    if(card) card.removeEventListener("pointermove", updateCard);
}
