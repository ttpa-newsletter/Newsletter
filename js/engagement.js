/* =========================================================
   TTPA MULTIMEDIA NEWSLETTER — VISITOR ENGAGEMENT
   ========================================================= */

const SUPABASE_URL =
    "https://rqwqfemnvlalxfnffwjr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ipcA95xbsoN7sQywyqTvYQ_OT0ZSLgZ";


/* =========================================================
   ANONYMOUS VISITOR ID
   ========================================================= */

function getVisitorId() {

    let visitorId =
        localStorage.getItem("ttpaVisitorId");

    if (!visitorId) {

        visitorId = crypto.randomUUID();

        localStorage.setItem(
            "ttpaVisitorId",
            visitorId
        );
    }

    return visitorId;
}


/* =========================================================
   PAGE KEY
   ========================================================= */

function getPageKey() {

    let path = window.location.pathname;


    /*
       Homepage
    */

    if (
        path === "/" ||
        path === "/index.html" ||
        path.endsWith("/Newsletter/") ||
        path.endsWith("/Newsletter/index.html")
    ) {
        return "home";
    }


    /*
       Remove leading slash
    */

    path = path.replace(/^\/+/, "");


    /*
       Remove GitHub Pages project folder name.
       This keeps local and online page keys identical.
    */

    path = path.replace(/^Newsletter\/?/, "");


    /*
       Remove index.html or .html
    */

    path = path.replace(/\/index\.html$/, "");

    path = path.replace(/\.html$/, "");


    /*
       Convert folders into a simple page key.
    */

    return path.replace(/\//g, "-");
}

/* =========================================================
   SUPABASE RPC HELPER
   ========================================================= */

async function callSupabaseFunction(
    functionName,
    parameters = {}
) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
        {
            method: "POST",

            headers: {

                "apikey":
                    SUPABASE_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_KEY}`,

                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify(parameters)
        }
    );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(message);
    }


    const text =
        await response.text();


    if (!text) {
        return null;
    }


    return JSON.parse(text);
}


/* =========================================================
   RECORD PAGE VISIT
   ========================================================= */

async function recordPageVisit() {

    try {

        await callSupabaseFunction(
            "record_visit",
            {
                p_visitor_id:
                    getVisitorId(),

                p_page_key:
                    getPageKey()
            }
        );

    }

    catch (error) {

        console.error(
            "Visitor recording error:",
            error
        );
    }
}

/* =========================================================
   ACTIVE READING TIME
   ========================================================= */

let activeReadingSeconds = 0;

let lastReaderActivity =
    Date.now();


/*
 * A reader is treated as active when:
 * 1. this browser tab is visible, and
 * 2. there has been some reader activity
 *    during the previous two minutes.
 */

function markReaderActive() {

    lastReaderActivity =
        Date.now();

}


function readerIsActive() {

    const idleMilliseconds =
        Date.now() -
        lastReaderActivity;

    return (
        document.visibilityState === "visible" &&
        idleMilliseconds < 120000
    );

}


/*
 * Send accumulated active-reading seconds
 * to Supabase.
 */

async function sendActiveReadingTime() {

    if (activeReadingSeconds <= 0) {
        return;
    }


    const secondsToSend =
        activeReadingSeconds;

    activeReadingSeconds = 0;


    try {

        await callSupabaseFunction(
            "add_active_reading_time",
            {
                p_visitor_id:
                    getVisitorId(),

                p_page_key:
                    getPageKey(),

                p_seconds:
                    secondsToSend
            }
        );

    }

    catch (error) {

        /*
         * Restore the unsent seconds so that
         * they can be attempted again.
         */

        activeReadingSeconds +=
            secondsToSend;

        console.error(
            "Active reading time error:",
            error
        );

    }

}


/*
 * Measure reading activity in 5-second units.
 */

function initialiseActiveReadingTime() {

    const activityEvents = [
        "scroll",
        "mousemove",
        "mousedown",
        "keydown",
        "touchstart"
    ];


    activityEvents.forEach(
        function (eventName) {

            document.addEventListener(
                eventName,
                markReaderActive,
                {
                    passive: true
                }
            );

        }
    );


    document.addEventListener(
        "visibilitychange",
        function () {

            if (
                document.visibilityState ===
                "visible"
            ) {

                markReaderActive();

            }

            else {

                sendActiveReadingTime();

            }

        }
    );


    /*
     * Every five seconds, add five seconds
     * when the reader is considered active.
     */

    setInterval(
        function () {

            if (readerIsActive()) {

                activeReadingSeconds += 5;

            }

        },
        5000
    );


    /*
     * Send accumulated time to Supabase
     * every 30 seconds.
     */

    setInterval(
        sendActiveReadingTime,
        30000
    );

}
/* =========================================================
   HOME PAGE VISITOR COUNTER
   ========================================================= */

async function updateHomeVisitorCounter() {

    const counter =
        document.getElementById(
            "homeVisitorCount"
        );


    /*
       Visitors are still recorded on every page,
       but the public total is displayed only
       where this element exists.
    */

    if (!counter) {
        return;
    }


    try {

        const total =
            await callSupabaseFunction(
                "get_home_visitor_count"
            );


        counter.textContent =
            total ?? "—";

    }

    catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        counter.textContent = "—";
    }
}


/* =========================================================
   PAGE REACTIONS
   ========================================================= */

async function submitReaction(reaction) {

    const status =
        document.getElementById(
            "reactionStatus"
        );

    const upButton =
        document.getElementById(
            "reactionUp"
        );

    const downButton =
        document.getElementById(
            "reactionDown"
        );


    if (!upButton || !downButton) {
        return;
    }


    try {

        upButton.disabled = true;
        downButton.disabled = true;


        await callSupabaseFunction(
            "record_reaction",
            {
                p_visitor_id:
                    getVisitorId(),

                p_page_key:
                    getPageKey(),

                p_page_title:
                    document.title,

                p_reaction:
                    reaction
            }
        );


        localStorage.setItem(
            "ttpaReaction:" + getPageKey(),
            reaction
        );


        upButton.classList.toggle(
            "selected",
            reaction === "up"
        );


        downButton.classList.toggle(
            "selected",
            reaction === "down"
        );


        if (status) {

            status.textContent =
                "Thank you for your feedback.";
        }

    }

    catch (error) {

        console.error(
            "Reaction error:",
            error
        );


        if (status) {

            status.textContent =
                "Unable to record feedback at present.";
        }

    }

    finally {

        upButton.disabled = false;
        downButton.disabled = false;
    }
}


/* =========================================================
   INITIALISE PAGE REACTIONS
   ========================================================= */

function initialisePageReactions() {

    const upButton =
        document.getElementById(
            "reactionUp"
        );

    const downButton =
        document.getElementById(
            "reactionDown"
        );


    if (!upButton || !downButton) {
        return;
    }


    const previous =
        localStorage.getItem(
            "ttpaReaction:" + getPageKey()
        );


    if (previous === "up") {

        upButton.classList.add(
            "selected"
        );
    }


    if (previous === "down") {

        downButton.classList.add(
            "selected"
        );
    }


    upButton.addEventListener(
        "click",
        function () {

            submitReaction("up");
        }
    );


    downButton.addEventListener(
        "click",
        function () {

            submitReaction("down");
        }
    );
}


/* =========================================================
   PRIVATE COMMENTS / CORRECTIONS / SUGGESTIONS
   ========================================================= */

function initialisePrivateFeedback() {

    const form =
        document.getElementById(
            "privateFeedbackForm"
        );


    if (!form) {
        return;
    }


    const typeField =
        document.getElementById(
            "feedbackType"
        );

    const commentField =
        document.getElementById(
            "feedbackComment"
        );

    const status =
        document.getElementById(
            "feedbackStatus"
        );

    const submitButton =
        document.getElementById(
            "feedbackSubmit"
        );


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const feedbackType =
                typeField.value;


            const comment =
                commentField.value.trim();


            if (comment.length < 2) {

                status.textContent =
                    "Please enter your comment.";

                return;
            }


            try {

                submitButton.disabled = true;

                status.textContent =
                    "Submitting...";


                await callSupabaseFunction(
                    "submit_feedback",
                    {
                        p_visitor_id:
                            getVisitorId(),

                        p_page_key:
                            getPageKey(),

                        p_page_title:
                            document.title,

                        p_feedback_type:
                            feedbackType,

                        p_comment:
                            comment
                    }
                );


                status.textContent =
                    "Thank you. Your feedback has been submitted privately to the Editor.";


                commentField.value = "";

            }

            catch (error) {

                console.error(
                    "Feedback submission error:",
                    error
                );


                status.textContent =
                    "Unable to submit feedback at present. Please try again later.";

            }

            finally {

                submitButton.disabled = false;
            }
        }
    );
}

/* =========================================================
   CREATE ENGAGEMENT INTERFACE AUTOMATICALLY
   ========================================================= */

function createEngagementInterface() {

    /*
       If the page already contains the engagement
       interface, do nothing. This prevents duplicates.
    */

    if (
        document.querySelector(
            ".visitor-engagement"
        )
    ) {
        return;
    }


    /*
       Create the complete engagement section.
    */

    const engagementSection =
        document.createElement("section");


    engagementSection.className =
        "visitor-engagement";


    engagementSection.innerHTML = `

        <div class="reaction-box">

            <p class="reaction-question">
                Was this page useful?
            </p>

            <div class="reaction-buttons">

                <button type="button"
                        id="reactionUp"
                        class="reaction-button"
                        aria-label="Useful">
                    👍
                </button>

                <button type="button"
                        id="reactionDown"
                        class="reaction-button"
                        aria-label="Not useful">
                    👎
                </button>

            </div>

            <p id="reactionStatus"
               class="reaction-status">
            </p>

        </div>


        <div class="private-feedback-box">

            <h3>
                Comments / Corrections / Suggestions
            </h3>

            <p>
                Your message will be submitted privately
                to the Editor and will not be displayed
                publicly on this page.
            </p>


            <form id="privateFeedbackForm">

                <label for="feedbackType">
                    Type of Feedback
                </label>

                <select id="feedbackType"
                        required>

                    <option value="general">
                        General Comment
                    </option>

                    <option value="addition">
                        Suggestion / Addition
                    </option>

                    <option value="correction">
                        Correction
                    </option>

                    <option value="deletion">
                        Suggestion for Deletion
                    </option>

                </select>


                <label for="feedbackComment">
                    Your Message
                </label>

                <textarea
                    id="feedbackComment"
                    rows="5"
                    placeholder="Please enter your comment, correction or suggestion..."
                    required></textarea>


                <button
                    type="submit"
                    id="feedbackSubmit"
                    class="feedback-submit-button">

                    Submit Privately

                </button>


                <p id="feedbackStatus"
                   class="feedback-status">
                </p>

            </form>

        </div>

    `;


    /*
       Place the engagement panel immediately
       before the footer.
    */

    const footer =
        document.querySelector("footer");


    if (footer) {

        footer.parentNode.insertBefore(
            engagementSection,
            footer
        );

    }

    else {

        document.body.appendChild(
            engagementSection
        );
    }
}
/* =========================================================
   INITIALISE ENGAGEMENT SYSTEM
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        createEngagementInterface();
        /*
           Every page visit is now recorded
           for the future Editor Dashboard.
        */

        await recordPageVisit();


        /*
           Public visitor total is shown only
           on pages containing homeVisitorCount.
        */

        updateHomeVisitorCounter();


        /*
           Initialise 👍 / 👎 controls
           when present on the page.
        */

        initialisePageReactions();


        /*
           Initialise private feedback form
           when present on the page.
        */

        initialisePrivateFeedback();


        /*
           Measure active reading time while
           the visitor is viewing this page.
        */

        initialiseActiveReadingTime();

    }
);