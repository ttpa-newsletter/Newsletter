/* =========================================================
   BRAIN TEASER - SPOT THE DIFFERENCES
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const imageArea = document.getElementById("brainImageB");

    if (!imageArea) {
        return;
    }

    const scoreDisplay = document.getElementById("brainScore");
    const messageDisplay = document.getElementById("brainMessage");
    const completePanel = document.getElementById("brainComplete");
    const feedbackPanel = document.getElementById("brainFeedback");
    const playAgainButton = document.getElementById("brainPlayAgain");
/* =========================================================
   BRAIN TEASER VOICE RESPONSES
   ========================================================= */

const brainVoice = {
    wrong: new Audio("../../audio/brain-teaser/not-there.mp3"),
    correct: new Audio("../../audio/brain-teaser/correct-keep-looking.mp3"),
    complete: new Audio("../../audio/brain-teaser/excellent-all-four.mp3")
};

let currentBrainVoice = null;

function playBrainVoice(audio) {

    if (currentBrainVoice) {
        currentBrainVoice.pause();
        currentBrainVoice.currentTime = 0;
    }

    currentBrainVoice = audio;
    audio.currentTime = 0;

    audio.play().catch(function () {
        // The game continues even if audio cannot be played.
    });
}
    const differences = [
        {
            id: "tower",
            x: 94.2,
            y: 22.9,
            rx: 4.2,
            ry: 6.5,
            found: false
        },
        {
            id: "sign",
            x: 50.3,
            y: 30.4,
            rx: 9.0,
            ry: 4.5,
            found: false
        },
        {
            id: "stairs",
            x: 49.7,
            y: 70.1,
            rx: 9.0,
            ry: 5.5,
            found: false
        },
        {
            id: "walkway",
            x: 60.5,
            y: 84.7,
            rx: 4.8,
            ry: 6.0,
            found: false
        }
    ];

    let foundCount = 0;

    function updateScore() {
        scoreDisplay.textContent =
            foundCount + " of " + differences.length + " found";
    }

    function createMarker(x, y) {

        const marker = document.createElement("div");

        marker.className = "brain-found-marker";
        marker.style.left = x + "%";
        marker.style.top = y + "%";

        imageArea.appendChild(marker);
    }

    function completeGame() {

      messageDisplay.textContent =
    "Excellent! You found all 4 differences.";

playBrainVoice(brainVoice.complete);  

        completePanel.hidden = false;
        feedbackPanel.hidden = false;

        completePanel.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

    imageArea.addEventListener("click", function (event) {

        const rect = imageArea.getBoundingClientRect();

        const clickX =
            ((event.clientX - rect.left) / rect.width) * 100;

        const clickY =
            ((event.clientY - rect.top) / rect.height) * 100;

        let correctSelection = false;

        differences.forEach(function (difference) {

            if (difference.found) {
                return;
            }

            const horizontalDistance =
                Math.abs(clickX - difference.x);

            const verticalDistance =
                Math.abs(clickY - difference.y);

            if (
                horizontalDistance <= difference.rx &&
                verticalDistance <= difference.ry
            ) {

                difference.found = true;
                foundCount++;
                correctSelection = true;

                createMarker(
                    difference.x,
                    difference.y
                );

                updateScore();

if (foundCount < differences.length) {

    messageDisplay.textContent =
        "Correct! Keep looking.";

    playBrainVoice(brainVoice.correct);
}
            }
        });

        if (!correctSelection) {

    messageDisplay.textContent =
        "Not there — have another look!";

    playBrainVoice(brainVoice.wrong);
}

        if (foundCount === differences.length) {
            completeGame();
        }
    });

    playAgainButton.addEventListener("click", function () {

        differences.forEach(function (difference) {
            difference.found = false;
        });

        foundCount = 0;

        updateScore();

        messageDisplay.textContent =
            "Take your time and look closely.";

        completePanel.hidden = true;
        feedbackPanel.hidden = true;

        const existingMarkers =
            imageArea.querySelectorAll(".brain-found-marker");

        existingMarkers.forEach(function (marker) {
            marker.remove();
        });

        imageArea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    });
/* =========================================================
   BRAIN TEASER IMAGE ENLARGEMENT
   ========================================================= */

const enlargeButtons =
    document.querySelectorAll(".brain-enlarge-btn");

const lightbox =
    document.getElementById("brainLightbox");

const lightboxImage =
    document.getElementById("brainLightboxImage");

const lightboxTitle =
    document.getElementById("brainLightboxTitle");

const lightboxClose =
    document.getElementById("brainLightboxClose");


enlargeButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        lightboxImage.src =
            button.dataset.image;

        lightboxTitle.textContent =
            button.dataset.title;

        lightbox.hidden = false;

        document.body.style.overflow = "hidden";
    });

});


lightboxClose.addEventListener("click", function () {

    lightbox.hidden = true;

    document.body.style.overflow = "";
});


lightbox.addEventListener("click", function (event) {

    if (event.target === lightbox) {

        lightbox.hidden = true;

        document.body.style.overflow = "";
    }

});
});