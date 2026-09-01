/* =========================================================
   TTPA NEWSLETTER — EDITOR ADMINISTRATION
   ========================================================= */


const ADMIN_SUPABASE_URL =
    "https://rqwqfemnvlalxfnffwjr.supabase.co";

const ADMIN_SUPABASE_KEY =
    "sb_publishable_ipcA95xbsoN7sQywyqTvYQ_OT0ZSLgZ";


/* =========================================================
   ADMIN AUTHENTICATION
   ========================================================= */


/* ---------------------------------------------------------
   LOGIN
   --------------------------------------------------------- */

async function loginAdmin(email, password) {

    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
            method: "POST",

            headers: {
                "apikey":
                    ADMIN_SUPABASE_KEY,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.error_description ||
            data.msg ||
            data.message ||
            "Unable to sign in."
        );
    }


    return data;
}


/* ---------------------------------------------------------
   VERIFY ADMINISTRATOR
   --------------------------------------------------------- */

async function verifyAdmin(accessToken) {

    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/rest/v1/rpc/is_ttpa_admin`,
        {
            method: "POST",

            headers: {
                "apikey":
                    ADMIN_SUPABASE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json"
            },

            body: "{}"
        }
    );


    if (!response.ok) {

        throw new Error(
            "Unable to verify administrator access."
        );
    }


    return await response.json();
}


/* ---------------------------------------------------------
   READ ADMIN ACCESS TOKEN
   --------------------------------------------------------- */

function getAdminAccessToken() {

    return sessionStorage.getItem(
        "ttpaAdminAccessToken"
    );
}


/* ---------------------------------------------------------
   SHOW ADMIN DASHBOARD
   --------------------------------------------------------- */

function showAdminDashboard() {

    const loginCard =
        document.querySelector(
            ".admin-login-card"
        );

    const dashboard =
        document.getElementById(
            "adminDashboard"
        );


    if (loginCard) {

        loginCard.style.display =
            "none";
    }


    if (dashboard) {

        dashboard.hidden =
            false;
    }
}


/* =========================================================
   SECURE EDITOR DASHBOARD DATA
   ========================================================= */

async function fetchAdminDashboard() {

    const accessToken =
        getAdminAccessToken();


    if (!accessToken) {

        throw new Error(
            "Administrator session is not available."
        );
    }


    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/rest/v1/rpc/get_editor_dashboard`,
        {
            method: "POST",

            headers: {
                "apikey":
                    ADMIN_SUPABASE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json",

                "Accept":
                    "application/json"
            },

            body: "{}"
        }
    );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Unable to load administrator dashboard."
        );
    }


    return await response.json();
}


/* =========================================================
   DISPLAY HELPERS
   ========================================================= */


/* ---------------------------------------------------------
   FORMAT ACTIVE READING TIME
   --------------------------------------------------------- */

function formatReadingTime(seconds) {

    const totalSeconds =
        Math.max(
            0,
            Math.round(
                Number(seconds) || 0
            )
        );


    if (totalSeconds < 60) {

        return `${totalSeconds} sec`;
    }


    const hours =
        Math.floor(
            totalSeconds / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const remainingSeconds =
        totalSeconds % 60;


    if (hours > 0) {

        return (
            `${hours} hr ` +
            `${minutes} min ` +
            `${remainingSeconds} sec`
        );
    }


    return (
        `${minutes} min ` +
        `${remainingSeconds} sec`
    );
}


/* ---------------------------------------------------------
   FORMAT FEEDBACK DATE
   --------------------------------------------------------- */

function formatFeedbackDate(dateValue) {

    if (!dateValue) {

        return "";
    }


    const date =
        new Date(dateValue);


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

/* ---------------------------------------------------------
   FRIENDLY PAGE NAMES
   --------------------------------------------------------- */

function getFriendlyPageName(pageKey) {

    const exactNames = {

        /* Main website */

        "home":
            "Home",

        "about":
            "About",

        "archives":
            "Archives",

        "archives-stalwarts":
            "Stalwarts Archive",

        "forms":
            "Downloadable Forms",

        "gallery":
            "Gallery",

        "government-orders":
            "Government Orders",

        "government-orders-go-file-1":
            "Government Order – File 1",

        "historical-records":
            "Historical Records",

        "in-fond-remembrance":
            "In Fond Remembrance",

        "procedures":
            "Procedures",

        "pdf":
            "PDF Edition",

        "videos":
            "Videos",


        /* Sep–Oct 2026 issue */

        "issues-2026-Sep-Oct":
            "Sep–Oct 2026 — Issue Contents",

        "issues-2026-Sep-Oct-welcome-note":
            "Sep–Oct 2026 — Welcome Note",

        "issues-2026-Sep-Oct-stalwarts":
            "Sep–Oct 2026 — Reminiscence of Dedicated Stalwarts",

        "issues-2026-Sep-Oct-dr-r-ramamurthi":
            "Sep–Oct 2026 — Dr. R. Ramamurthi",

        "issues-2026-Sep-Oct-activities":
            "Sep–Oct 2026 — Activities of TTPA at a Glance",

        "issues-2026-Sep-Oct-minutes":
            "Sep–Oct 2026 — Minutes of Meetings",

        "issues-2026-Sep-Oct-family":
            "Sep–Oct 2026 — Welcome to Our Pensioners’ Family",

        "issues-2026-Sep-Oct-spotlight":
            "Sep–Oct 2026 — Pensioners in the Spotlight",

        "issues-2026-Sep-Oct-lead":
            "Sep–Oct 2026 — Called to Lead Once More",

        "issues-2026-Sep-Oct-webinars":
            "Sep–Oct 2026 — Distinguished Voices in Webinars",

        "issues-2026-Sep-Oct-athletes":
            "Sep–Oct 2026 — Athletes Are Made, Not Born",

        "issues-2026-Sep-Oct-together-again":
            "Sep–Oct 2026 — Together Again: Memories & Milestones",

        "issues-2026-Sep-Oct-family-milestones":
            "Sep–Oct 2026 — Celebrating Family Milestones",

        "issues-2026-Sep-Oct-remembrance":
            "Sep–Oct 2026 — In Fond Remembrance",

        "issues-2026-Sep-Oct-community-hub":
            "Sep–Oct 2026 — Community Hub",

        "issues-2026-Sep-Oct-editors-corner":
            "Sep–Oct 2026 — Editor’s Corner",

        "issues-2026-Sep-Oct-editors-message":
            "Sep–Oct 2026 — Editor’s Message",

        "issues-2026-Sep-Oct-brain-teaser":
            "Sep–Oct 2026 — Brain Teaser",

        "issues-2026-Sep-Oct-acknowledgement":
            "Sep–Oct 2026 — Acknowledgement",

        "issues-2026-Sep-Oct-newsletter-objectives":
            "Sep–Oct 2026 — Newsletter Objectives",

        "issues-2026-Sep-Oct-general-secretary-message":
            "Sep–Oct 2026 — General Secretary’s Message",

        "issues-2026-Sep-Oct-president-foreword":
            "Sep–Oct 2026 — President’s Foreword"
    };


    if (exactNames[pageKey]) {

        return exactNames[pageKey];
    }


    /* Jul–Aug 2026 pages */

    if (
        pageKey.startsWith(
            "issues-2026-Jul-Aug-"
        )
    ) {

        const articleName =
            pageKey.replace(
                "issues-2026-Jul-Aug-",
                ""
            );

        return (
            "Jul–Aug 2026 — " +
            articleName
                .replace(/-/g, " ")
                .replace(
                    /\b\w/g,
                    function (letter) {
                        return letter.toUpperCase();
                    }
                )
        );
    }


    if (
        pageKey ===
        "issues-2026-Jul-Aug"
    ) {

        return "Jul–Aug 2026 — Issue Contents";
    }


    /* Procedure pages */

    if (
        pageKey.startsWith(
            "procedures-"
        )
    ) {

        const procedureName =
            pageKey.replace(
                "procedures-",
                ""
            );

        return (
            "Procedure — " +
            procedureName
                .replace(/-/g, " ")
                .replace(
                    /\b\w/g,
                    function (letter) {
                        return letter.toUpperCase();
                    }
                )
        );
    }


    /* Safe fallback for future pages */

    return pageKey
        .replace(/-/g, " ")
        .replace(
            /\b\w/g,
            function (letter) {
                return letter.toUpperCase();
            }
        );
}
/* =========================================================
   PAGE-WISE VISITOR AND READING-TIME REPORT
   ========================================================= */

function renderDashboardVisitorTable(pageVisits) {

    const tableBody =
        document.getElementById(
            "adminVisitorTable"
        );


    if (!tableBody) {

        return;
    }


    tableBody.innerHTML =
        "";


    if (pageVisits.length === 0) {

        tableBody.innerHTML =
            `
            <tr>
                <td colspan="5">
                    No visitor statistics are available yet.
                </td>
            </tr>
            `;

        return;
    }


    pageVisits.forEach(
        function (page) {

            const row =
                document.createElement(
                    "tr"
                );


            const pageCell =
                document.createElement(
                    "td"
                );

            pageCell.textContent =
    getFriendlyPageName(
        page.page_key ||
        "unknown-page"
    );


            const visitorCell =
                document.createElement(
                    "td"
                );

            visitorCell.textContent =
                page.unique_visitors ?? 0;


            const visitDayCell =
                document.createElement(
                    "td"
                );

            visitDayCell.textContent =
                page.total_visit_days ?? 0;


            const totalReadingCell =
                document.createElement(
                    "td"
                );

            totalReadingCell.textContent =
                formatReadingTime(
                    page.total_active_seconds ??
                    0
                );


            const averageReadingCell =
                document.createElement(
                    "td"
                );

            averageReadingCell.textContent =
                formatReadingTime(
                    page.average_active_seconds ??
                    0
                );


            row.appendChild(
                pageCell
            );

            row.appendChild(
                visitorCell
            );

            row.appendChild(
                visitDayCell
            );

            row.appendChild(
                totalReadingCell
            );

            row.appendChild(
                averageReadingCell
            );


            tableBody.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   PAGE-WISE REACTION REPORT
   ========================================================= */

function renderDashboardReactionTable(
    pageReactions
) {

    const tableBody =
        document.getElementById(
            "adminReactionTable"
        );


    if (!tableBody) {

        return;
    }


    tableBody.innerHTML =
        "";


    if (pageReactions.length === 0) {

        tableBody.innerHTML =
            `
            <tr>
                <td colspan="3">
                    No reactions have been recorded yet.
                </td>
            </tr>
            `;

        return;
    }


    pageReactions.forEach(
        function (page) {

            const row =
                document.createElement(
                    "tr"
                );


            const titleCell =
                document.createElement(
                    "td"
                );

            titleCell.textContent =
                page.page_title ||
                page.page_key ||
                "Unknown page";


            const upCell =
                document.createElement(
                    "td"
                );

            upCell.textContent =
                page.thumbs_up ?? 0;


            const downCell =
                document.createElement(
                    "td"
                );

            downCell.textContent =
                page.thumbs_down ?? 0;


            row.appendChild(
                titleCell
            );

            row.appendChild(
                upCell
            );

            row.appendChild(
                downCell
            );


            tableBody.appendChild(
                row
            );
        }
    );
}
/* ---------------------------------------------------------
   UPDATE FEEDBACK EDITORIAL STATUS
   --------------------------------------------------------- */

async function updateFeedbackStatus(
    feedbackId,
    newStatus
) {

    const accessToken =
        getAdminAccessToken();


    if (!accessToken) {

        throw new Error(
            "Administrator session is not available."
        );
    }


    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/rest/v1/rpc/update_feedback_status`,
        {
            method: "POST",

            headers: {
                "apikey":
                    ADMIN_SUPABASE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                p_feedback_id:
                    feedbackId,

                p_status:
                    newStatus
            })
        }
    );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Unable to update feedback status."
        );
    }
}

/* =========================================================
   PRIVATE FEEDBACK REPORT
   ========================================================= */

function renderFeedbackTable(
    feedbackRows
) {

    const tableBody =
        document.getElementById(
            "adminFeedbackTable"
        );


    if (!tableBody) {

        return;
    }


    tableBody.innerHTML =
        "";


    if (feedbackRows.length === 0) {

        tableBody.innerHTML =
            `
            <tr>
                <td colspan="4">
                    No private feedback has been submitted yet.
                </td>
            </tr>
            `;

        return;
    }


    feedbackRows.forEach(
        function (feedback) {

            const row =
                document.createElement(
                    "tr"
                );


            const dateCell =
                document.createElement(
                    "td"
                );

            dateCell.textContent =
                formatFeedbackDate(
                    feedback.created_at
                );


            const pageCell =
                document.createElement(
                    "td"
                );

            pageCell.textContent =
                feedback.page_title ||
                feedback.page_key ||
                "";


            const typeCell =
                document.createElement(
                    "td"
                );

           typeCell.textContent =
    {
        general:
            "General Comment",

        addition:
            "Suggestion / Addition",

        correction:
            "Correction",

        deletion:
            "Suggestion for Deletion"
    }[
        feedback.feedback_type
    ] ||
    feedback.feedback_type ||
    "";


            const commentCell =
                document.createElement(
                    "td"
                );

            commentCell.textContent =
                feedback.comment ||
                "";
const statusCell =
    document.createElement(
        "td"
    );

const statusSelect =
    document.createElement(
        "select"
    );


const statusOptions = [
    {
        value: "pending",
        label: "Pending"
    },
    {
        value: "reviewed",
        label: "Reviewed"
    },
    {
        value: "action_taken",
        label: "Action Taken"
    },
    {
        value: "no_action_required",
        label: "No Action Required"
    }
];


statusOptions.forEach(
    function (optionData) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            optionData.value;

        option.textContent =
            optionData.label;

        statusSelect.appendChild(
            option
        );
    }
);


statusSelect.value =
    feedback.editorial_status ||
    "pending";


statusSelect.addEventListener(
    "change",
    async function () {

        const previousStatus =
            feedback.editorial_status ||
            "pending";

        statusSelect.disabled =
            true;

        try {

            await updateFeedbackStatus(
                feedback.id,
                statusSelect.value
            );

            feedback.editorial_status =
                statusSelect.value;
        }

        catch (error) {

            console.error(
                "Feedback status update error:",
                error
            );

            statusSelect.value =
                previousStatus;

            alert(
                "Unable to update feedback status."
            );
        }

        finally {

            statusSelect.disabled =
                false;
        }
    }
);


statusCell.appendChild(
    statusSelect
);

            row.appendChild(
                dateCell
            );

            row.appendChild(
                pageCell
            );

            row.appendChild(
                typeCell
            );

            row.appendChild(
                commentCell
            );
row.appendChild(
    statusCell
);

            tableBody.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   LOAD EDITOR DASHBOARD
   ========================================================= */

async function loadAdminReports() {

    const status =
        document.getElementById(
            "adminReportStatus"
        );


    try {

        if (status) {

            status.textContent =
                "Loading reports...";
        }


        const dashboardData =
            await fetchAdminDashboard();


        const summary =
            dashboardData.summary || {};


        const visitorElement =
            document.getElementById(
                "adminVisitorCount"
            );

        const visitDayElement =
            document.getElementById(
                "adminVisitDayCount"
            );

        const totalReadingElement =
            document.getElementById(
                "adminTotalReadingTime"
            );

        const averageReadingElement =
            document.getElementById(
                "adminAverageReadingTime"
            );

        const upElement =
            document.getElementById(
                "adminUpCount"
            );

        const downElement =
            document.getElementById(
                "adminDownCount"
            );

        const feedbackElement =
            document.getElementById(
                "adminFeedbackCount"
            );
const pendingFeedbackElement =
    document.getElementById(
        "adminPendingFeedbackCount"
    );

        if (visitorElement) {

            visitorElement.textContent =
                summary.unique_visitors ??
                0;
        }


        if (visitDayElement) {

            visitDayElement.textContent =
                summary.total_visit_days ??
                0;
        }


        if (totalReadingElement) {

            totalReadingElement.textContent =
                formatReadingTime(
                    summary.total_active_seconds ??
                    0
                );
        }


        if (averageReadingElement) {

            averageReadingElement.textContent =
                formatReadingTime(
                    summary.average_active_seconds ??
                    0
                );
        }


        if (upElement) {

            upElement.textContent =
                summary.thumbs_up ??
                0;
        }


        if (downElement) {

            downElement.textContent =
                summary.thumbs_down ??
                0;
        }


        if (feedbackElement) {

            feedbackElement.textContent =
                summary.feedback_count ??
                0;
        }

if (pendingFeedbackElement) {

    pendingFeedbackElement.textContent =
        summary.pending_feedback_count ??
        0;
}
        renderDashboardVisitorTable(
            dashboardData.page_visits ||
            []
        );


        renderDashboardReactionTable(
            dashboardData.page_reactions ||
            []
        );


        renderFeedbackTable(
            dashboardData.feedback ||
            []
        );


        if (status) {

            status.textContent =
                "Reports updated.";
        }

    }

    catch (error) {

        console.error(
            "Admin report error:",
            error
        );


        if (status) {

            status.textContent =
                "Unable to load administrator reports.";
        }
    }
}


/* =========================================================
   ADMIN LOGIN FORM
   ========================================================= */

function initialiseAdminLogin() {

    const form =
        document.getElementById(
            "adminLoginForm"
        );


    if (!form) {

        return;
    }


    const emailField =
        document.getElementById(
            "adminEmail"
        );

    const passwordField =
        document.getElementById(
            "adminPassword"
        );

    const loginButton =
        document.getElementById(
            "adminLoginButton"
        );

    const status =
        document.getElementById(
            "adminLoginStatus"
        );


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            status.className =
                "admin-status";

            status.textContent =
                "Signing in...";

            loginButton.disabled =
                true;


            try {

                const session =
                    await loginAdmin(
                        emailField.value.trim(),
                        passwordField.value
                    );


                const isAdmin =
                    await verifyAdmin(
                        session.access_token
                    );


                if (isAdmin !== true) {

                    sessionStorage.removeItem(
                        "ttpaAdminAccessToken"
                    );

                    sessionStorage.removeItem(
                        "ttpaAdminRefreshToken"
                    );


                    throw new Error(
                        "This account is not authorised for TTPA administration."
                    );
                }


                sessionStorage.setItem(
                    "ttpaAdminAccessToken",
                    session.access_token
                );

                sessionStorage.setItem(
                    "ttpaAdminRefreshToken",
                    session.refresh_token
                );


                status.className =
                    "admin-status success";

                status.textContent =
                    "Login successful. Administrator access confirmed.";


                passwordField.value =
                    "";


                showAdminDashboard();


                await loadAdminReports();

            }

            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                status.className =
                    "admin-status error";

                status.textContent =
                    error.message;
            }

            finally {

                loginButton.disabled =
                    false;
            }
        }
    );
}


/* =========================================================
   DASHBOARD CONTROLS
   ========================================================= */

function initialiseAdminDashboardControls() {

    const refreshButton =
        document.getElementById(
            "refreshAdminReports"
        );

    const signOutButton =
        document.getElementById(
            "adminSignOut"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                loadAdminReports();
            }
        );
    }


    if (signOutButton) {

        signOutButton.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    "ttpaAdminAccessToken"
                );

                sessionStorage.removeItem(
                    "ttpaAdminRefreshToken"
                );


                window.location.reload();
            }
        );
    }
}


/* =========================================================
   RESTORE EXISTING ADMIN SESSION
   ========================================================= */

async function restoreAdminSession() {

    const accessToken =
        getAdminAccessToken();


    if (!accessToken) {

        return;
    }


    try {

        const isAdmin =
            await verifyAdmin(
                accessToken
            );


        if (isAdmin !== true) {

            sessionStorage.removeItem(
                "ttpaAdminAccessToken"
            );

            sessionStorage.removeItem(
                "ttpaAdminRefreshToken"
            );

            return;
        }


        showAdminDashboard();


        await loadAdminReports();

    }

    catch (error) {

        console.error(
            "Unable to restore admin session:",
            error
        );


        sessionStorage.removeItem(
            "ttpaAdminAccessToken"
        );

        sessionStorage.removeItem(
            "ttpaAdminRefreshToken"
        );
    }
}


/* =========================================================
   INITIALISE ADMINISTRATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initialiseAdminLogin();

        initialiseAdminDashboardControls();

        restoreAdminSession();
    }
);