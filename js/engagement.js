/* =========================================================
   TTPA NEWSLETTER — ENGAGEMENT
   ========================================================= */

const SUPABASE_URL = "https://rqwqfemnvlalxfnffwjr.supabase.co";

const SUPABASE_KEY = "sb_publishable_ipcA95xbsoN7sQywyqTvYQ_OT0ZSLgZ";


/* ---------------------------------------------------------
   CREATE / RETRIEVE ANONYMOUS VISITOR ID
   --------------------------------------------------------- */

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


/* ---------------------------------------------------------
   SUPABASE RPC HELPER
   --------------------------------------------------------- */

async function callSupabaseFunction(
    functionName,
    parameters = {}
) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
        {
            method: "POST",

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization":
                    `Bearer ${SUPABASE_KEY}`,
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(parameters)
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


/* ---------------------------------------------------------
   RECORD HOME VISIT + SHOW VISITOR COUNT
   --------------------------------------------------------- */

async function initialiseHomeCounter() {

    const counter =
        document.getElementById(
            "homeVisitorCount"
        );

    if (!counter) {
        return;
    }

    try {

        const visitorId =
            getVisitorId();


        await callSupabaseFunction(
            "record_visit",
            {
                p_visitor_id: visitorId,
                p_page_key: "home"
            }
        );


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

        counter.textContent =
            "—";
    }

}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    initialiseHomeCounter
);
/* ---------------------------------------------------------
   PAGE REACTIONS
   --------------------------------------------------------- */

function getPageKey() {

    const path = window.location.pathname;

    if (
        path === "/" ||
        path.endsWith("/index.html")
    ) {
        return "home";
    }

    return path
        .replace(/^\/+/, "")
        .replace(/\.html$/, "")
        .replace(/\//g, "-");
}


async function submitReaction(reaction) {

    const status =
        document.getElementById("reactionStatus");

    const upButton =
        document.getElementById("reactionUp");

    const downButton =
        document.getElementById("reactionDown");

    if (!upButton || !downButton) {
        return;
    }

    try {

        upButton.disabled = true;
        downButton.disabled = true;

        await callSupabaseFunction(
            "record_reaction",
            {
                p_visitor_id: getVisitorId(),
                p_page_key: getPageKey(),
                p_page_title: document.title,
                p_reaction: reaction
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


function initialisePageReactions() {

    const upButton =
        document.getElementById("reactionUp");

    const downButton =
        document.getElementById("reactionDown");

    if (!upButton || !downButton) {
        return;
    }


    const previous =
        localStorage.getItem(
            "ttpaReaction:" + getPageKey()
        );


    if (previous === "up") {
        upButton.classList.add("selected");
    }

    if (previous === "down") {
        downButton.classList.add("selected");
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


document.addEventListener(
    "DOMContentLoaded",
    initialisePageReactions
);

/* ---------------------------------------------------------
   PRIVATE PAGE FEEDBACK
   --------------------------------------------------------- */

function initialisePrivateFeedback() {

    const form =
        document.getElementById("privateFeedbackForm");

    if (!form) {
        return;
    }

    const typeField =
        document.getElementById("feedbackType");

    const commentField =
        document.getElementById("feedbackComment");

    const status =
        document.getElementById("feedbackStatus");

    const submitButton =
        document.getElementById("feedbackSubmit");


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
                        p_visitor_id: getVisitorId(),
                        p_page_key: getPageKey(),
                        p_page_title: document.title,
                        p_feedback_type: feedbackType,
                        p_comment: comment
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


document.addEventListener(
    "DOMContentLoaded",
    initialisePrivateFeedback
);