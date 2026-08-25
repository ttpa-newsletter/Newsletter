/* =========================================================
   TTPA NEWSLETTER — ADMIN LOGIN
   ========================================================= */


const ADMIN_SUPABASE_URL =
    "https://rqwqfemnvlalxfnffwjr.supabase.co";

const ADMIN_SUPABASE_KEY =
    "sb_publishable_ipcA95xbsoN7sQywyqTvYQ_OT0ZSLgZ";



/* ---------------------------------------------------------
   LOGIN
   --------------------------------------------------------- */

async function loginAdmin(email, password) {

    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
            method: "POST",

            headers: {
                "apikey": ADMIN_SUPABASE_KEY,
                "Content-Type": "application/json"
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
   CONFIRM THAT THE SIGNED-IN USER IS A TTPA ADMIN
   --------------------------------------------------------- */

async function verifyAdmin(accessToken) {

    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/rest/v1/rpc/is_ttpa_admin`,
        {
            method: "POST",

            headers: {
                "apikey": ADMIN_SUPABASE_KEY,

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
   LOGIN FORM
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const form =
            document.getElementById(
                "adminLoginForm"
            );


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


                    /*
                     * Keep privileged session only for
                     * this browser tab/session.
                     */

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
/* -----------------------------------------------------
   SHOW ADMIN DASHBOARD
   ----------------------------------------------------- */

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
);
/* =========================================================
   TTPA ADMIN — REPORT LOADING
   ========================================================= */


/* ---------------------------------------------------------
   READ ADMIN ACCESS TOKEN
   --------------------------------------------------------- */

function getAdminAccessToken() {

    return sessionStorage.getItem(
        "ttpaAdminAccessToken"
    );

}


/* ---------------------------------------------------------
   ADMIN TABLE FETCH
   --------------------------------------------------------- */

async function adminFetchTable(
    tableName,
    query = ""
) {

    const accessToken =
        getAdminAccessToken();


    if (!accessToken) {

        throw new Error(
            "Administrator session is not available."
        );

    }


    const response = await fetch(
        `${ADMIN_SUPABASE_URL}/rest/v1/${tableName}${query}`,
        {
            method: "GET",

            headers: {

                "apikey":
                    ADMIN_SUPABASE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Accept":
                    "application/json"
            }
        }
    );


    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            "Unable to load administrator report."
        );

    }


    return await response.json();

}



/* ---------------------------------------------------------
   UNIQUE VISITOR COUNT
   --------------------------------------------------------- */

function countUniqueVisitors(visits) {

    const uniqueVisitors =
        new Set();


    visits.forEach(function (visit) {

        if (visit.visitor_id) {

            uniqueVisitors.add(
                visit.visitor_id
            );

        }

    });


    return uniqueVisitors.size;

}

/* ---------------------------------------------------------
   PAGE-WISE VISITOR REPORT
   --------------------------------------------------------- */

function buildVisitorReport(visits) {

    const pageMap = {};


    visits.forEach(function (visit) {

        const key =
            visit.page_key ||
            "unknown-page";


        if (!pageMap[key]) {

            pageMap[key] = {
                page: key,
                visitors: new Set(),
                visitDays: 0
            };

        }


        if (visit.visitor_id) {

            pageMap[key].visitors.add(
                visit.visitor_id
            );

        }


        pageMap[key].visitDays++;

    });


    return Object.values(pageMap)
        .map(function (page) {

            return {
                page: page.page,

                uniqueVisitors:
                    page.visitors.size,

                visitDays:
                    page.visitDays
            };

        })
        .sort(function (a, b) {

            return b.uniqueVisitors -
                   a.uniqueVisitors;

        });

}



/* ---------------------------------------------------------
   RENDER PAGE-WISE VISITORS
   --------------------------------------------------------- */

function renderVisitorTable(visits) {

    const tableBody =
        document.getElementById(
            "adminVisitorTable"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    const report =
        buildVisitorReport(visits);


    if (report.length === 0) {

        tableBody.innerHTML =
            `
            <tr>
                <td colspan="3">
                    No visitor statistics are available yet.
                </td>
            </tr>
            `;

        return;

    }


    report.forEach(function (page) {

        const row =
            document.createElement("tr");


        const pageCell =
            document.createElement("td");

        pageCell.textContent =
            page.page;


        const visitorCell =
            document.createElement("td");

        visitorCell.textContent =
            page.uniqueVisitors;


        const visitDayCell =
            document.createElement("td");

        visitDayCell.textContent =
            page.visitDays;


        row.appendChild(pageCell);
        row.appendChild(visitorCell);
        row.appendChild(visitDayCell);


        tableBody.appendChild(row);

    });

}

/* ---------------------------------------------------------
   REACTION TOTALS
   --------------------------------------------------------- */

function countReactions(reactions) {

    let up = 0;
    let down = 0;


    reactions.forEach(function (reaction) {

        if (reaction.reaction === "up") {
            up++;
        }

        if (reaction.reaction === "down") {
            down++;
        }

    });


    return {
        up: up,
        down: down
    };

}



/* ---------------------------------------------------------
   PAGE-WISE REACTION REPORT
   --------------------------------------------------------- */

function buildReactionReport(reactions) {

    const pageMap = {};


    reactions.forEach(function (reaction) {

        const key =
            reaction.page_key ||
            "unknown-page";


        if (!pageMap[key]) {

            pageMap[key] = {

                title:
                    reaction.page_title ||
                    key,

                up: 0,
                down: 0

            };

        }


        if (reaction.reaction === "up") {

            pageMap[key].up++;

        }


        if (reaction.reaction === "down") {

            pageMap[key].down++;

        }

    });


    return Object.values(pageMap)
        .sort(function (a, b) {

            return a.title.localeCompare(
                b.title,
                undefined,
                {
                    sensitivity: "base"
                }
            );

        });

}



/* ---------------------------------------------------------
   RENDER PAGE-WISE REACTIONS
   --------------------------------------------------------- */

function renderReactionTable(reactions) {

    const tableBody =
        document.getElementById(
            "adminReactionTable"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    const report =
        buildReactionReport(reactions);


    if (report.length === 0) {

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


    report.forEach(function (page) {

        const row =
            document.createElement("tr");


        const titleCell =
            document.createElement("td");

        titleCell.textContent =
            page.title;


        const upCell =
            document.createElement("td");

        upCell.textContent =
            page.up;


        const downCell =
            document.createElement("td");

        downCell.textContent =
            page.down;


        row.appendChild(titleCell);
        row.appendChild(upCell);
        row.appendChild(downCell);


        tableBody.appendChild(row);

    });

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
   RENDER PRIVATE FEEDBACK
   --------------------------------------------------------- */

function renderFeedbackTable(feedbackRows) {

    const tableBody =
        document.getElementById(
            "adminFeedbackTable"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


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


    feedbackRows.forEach(function (feedback) {

        const row =
            document.createElement("tr");


        const dateCell =
            document.createElement("td");

        dateCell.textContent =
            formatFeedbackDate(
                feedback.created_at
            );


        const pageCell =
            document.createElement("td");

        pageCell.textContent =
            feedback.page_title ||
            feedback.page_key ||
            "";


        const typeCell =
            document.createElement("td");

        typeCell.textContent =
            feedback.feedback_type ||
            "";


        const commentCell =
            document.createElement("td");

        commentCell.textContent =
            feedback.comment ||
            "";


        row.appendChild(dateCell);
        row.appendChild(pageCell);
        row.appendChild(typeCell);
        row.appendChild(commentCell);


        tableBody.appendChild(row);

    });

}



/* ---------------------------------------------------------
   LOAD ALL ADMIN REPORTS
   --------------------------------------------------------- */

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


        const [
            visits,
            reactions,
            feedback
        ] = await Promise.all([

            adminFetchTable(
                "visit_events",
                "?select=visitor_id,page_key,visit_date,created_at"
            ),

            adminFetchTable(
                "page_reactions",
                "?select=page_key,page_title,reaction,created_at"
            ),

            adminFetchTable(
                "page_feedback",
                "?select=page_key,page_title,feedback_type,comment,created_at&order=created_at.desc"
            )

        ]);


        const reactionTotals =
            countReactions(reactions);


        const visitorCount =
            countUniqueVisitors(visits);


        const visitorElement =
            document.getElementById(
                "adminVisitorCount"
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


        if (visitorElement) {

            visitorElement.textContent =
                visitorCount;

        }


        if (upElement) {

            upElement.textContent =
                reactionTotals.up;

        }


        if (downElement) {

            downElement.textContent =
                reactionTotals.down;

        }


        if (feedbackElement) {

            feedbackElement.textContent =
                feedback.length;

        }


 renderVisitorTable(
    visits
);


renderReactionTable(
    reactions
);


renderFeedbackTable(
    feedback
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



/* ---------------------------------------------------------
   ADMIN DASHBOARD CONTROLS
   --------------------------------------------------------- */

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



document.addEventListener(
    "DOMContentLoaded",
    initialiseAdminDashboardControls
);
/* =========================================================
   RESTORE ADMIN DASHBOARD IF SESSION EXISTS
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


document.addEventListener(
    "DOMContentLoaded",
    restoreAdminSession
);
/* =========================================================
   TEMPORARY LOCAL DASHBOARD PREVIEW
   Remove before publication
   ========================================================= */

function enableLocalDashboardPreview() {

    const host =
        window.location.hostname;

    const isLocal =
        host === "127.0.0.1" ||
        host === "localhost";


    if (!isLocal) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    if (
        params.get("preview") !==
        "dashboard"
    ) {
        return;
    }


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


    /*
     * DEMO VALUES ONLY
     * These are not Supabase data.
     */

    const visitor =
        document.getElementById(
            "adminVisitorCount"
        );

    const up =
        document.getElementById(
            "adminUpCount"
        );

    const down =
        document.getElementById(
            "adminDownCount"
        );

    const feedback =
        document.getElementById(
            "adminFeedbackCount"
        );


    if (visitor) {
        visitor.textContent = "125";
    }

    if (up) {
        up.textContent = "48";
    }

    if (down) {
        down.textContent = "3";
    }

    if (feedback) {
        feedback.textContent = "12";
    }
/* -----------------------------------------------------
   SAMPLE PAGE-WISE VISITOR DATA
   ----------------------------------------------------- */

const visitorTable =
    document.getElementById(
        "adminVisitorTable"
    );

if (visitorTable) {

    visitorTable.innerHTML = `
        <tr>
            <td>Home</td>
            <td>125</td>
            <td>186</td>
        </tr>

        <tr>
            <td>Current Issue</td>
            <td>84</td>
            <td>112</td>
        </tr>

        <tr>
            <td>Archives</td>
            <td>61</td>
            <td>79</td>
        </tr>

        <tr>
            <td>In Fond Remembrance</td>
            <td>52</td>
            <td>68</td>
        </tr>

        <tr>
            <td>Historical Records</td>
            <td>38</td>
            <td>46</td>
        </tr>
    `;

}


/* -----------------------------------------------------
   SAMPLE PAGE-WISE REACTION DATA
   ----------------------------------------------------- */

const reactionTable =
    document.getElementById(
        "adminReactionTable"
    );

if (reactionTable) {

    reactionTable.innerHTML = `
        <tr>
            <td>Home</td>
            <td>18</td>
            <td>1</td>
        </tr>

        <tr>
            <td>Current Issue</td>
            <td>12</td>
            <td>0</td>
        </tr>

        <tr>
            <td>Archives</td>
            <td>8</td>
            <td>1</td>
        </tr>

        <tr>
            <td>In Fond Remembrance</td>
            <td>7</td>
            <td>1</td>
        </tr>

        <tr>
            <td>Historical Records</td>
            <td>3</td>
            <td>0</td>
        </tr>
    `;

}

    const status =
        document.getElementById(
            "adminReportStatus"
        );

/* -----------------------------------------------------
   SAMPLE PRIVATE FEEDBACK DATA
   ----------------------------------------------------- */

const feedbackTable =
    document.getElementById(
        "adminFeedbackTable"
    );

if (feedbackTable) {

    feedbackTable.innerHTML = `
        <tr>
            <td>25 Aug 2026</td>
            <td>Current Issue</td>
            <td>Suggestion</td>
            <td>
                Very useful presentation. 
                Please continue the audio narration facility.
            </td>
        </tr>

        <tr>
            <td>24 Aug 2026</td>
            <td>Archives</td>
            <td>Appreciation</td>
            <td>
                The Stalwarts archive is informative 
                and easy to navigate.
            </td>
        </tr>

        <tr>
            <td>23 Aug 2026</td>
            <td>Procedures</td>
            <td>Suggestion</td>
            <td>
                Please include more step-by-step guidance 
                for pension-related procedures.
            </td>
        </tr>
    `;

}
    if (status) {

        status.textContent =
            "Local dashboard preview — sample data only.";

    }

}


document.addEventListener(
    "DOMContentLoaded",
    enableLocalDashboardPreview
);