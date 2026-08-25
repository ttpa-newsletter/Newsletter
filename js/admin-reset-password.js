/* =========================================================
   TTPA NEWSLETTER — ADMIN PASSWORD RESET
   ========================================================= */


const RESET_SUPABASE_URL =
    "https://rqwqfemnvlalxfnffwjr.supabase.co";

const RESET_SUPABASE_KEY =
    "sb_publishable_ipcA95xbsoN7sQywyqTvYQ_OT0ZSLgZ";


/* ---------------------------------------------------------
   READ RECOVERY TOKEN FROM URL
   --------------------------------------------------------- */

function getRecoveryAccessToken() {

    const hash =
        window.location.hash.substring(1);

    const params =
        new URLSearchParams(hash);

    return params.get("access_token");
}


/* ---------------------------------------------------------
   UPDATE PASSWORD
   --------------------------------------------------------- */

async function updatePassword(
    accessToken,
    newPassword
) {

    const response = await fetch(
        `${RESET_SUPABASE_URL}/auth/v1/user`,
        {
            method: "PUT",

            headers: {
                "apikey":
                    RESET_SUPABASE_KEY,

                "Authorization":
                    `Bearer ${accessToken}`,

                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                password: newPassword
            })
        }
    );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.msg ||
            data.message ||
            "Unable to update password."
        );

    }


    return data;
}


/* ---------------------------------------------------------
   PAGE INITIALISATION
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const form =
            document.getElementById(
                "resetPasswordForm"
            );


        const newPassword =
            document.getElementById(
                "newPassword"
            );


        const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );


        const button =
            document.getElementById(
                "resetPasswordButton"
            );


        const status =
            document.getElementById(
                "resetPasswordStatus"
            );


        const accessToken =
            getRecoveryAccessToken();


        if (!accessToken) {

            status.className =
                "reset-status error";

            status.textContent =
                "This password-reset link is invalid or has expired. Please request a new recovery email.";

            button.disabled =
                true;

            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {


                event.preventDefault();


                const password =
                    newPassword.value;


                const confirmation =
                    confirmPassword.value;


                if (password.length < 8) {

                    status.className =
                        "reset-status error";

                    status.textContent =
                        "Please use a password of at least 8 characters.";

                    return;
                }


                if (password !== confirmation) {

                    status.className =
                        "reset-status error";

                    status.textContent =
                        "The two passwords do not match.";

                    return;
                }


                try {

                    button.disabled =
                        true;

                    status.className =
                        "reset-status";

                    status.textContent =
                        "Updating password...";


                    await updatePassword(
                        accessToken,
                        password
                    );


                    status.className =
                        "reset-status success";

                    status.textContent =
                        "Password updated successfully. You may now sign in to the Admin page.";


                    newPassword.value = "";
                    confirmPassword.value = "";


                    /*
                     * Remove the recovery token from
                     * the visible address bar.
                     */

                    history.replaceState(
                        null,
                        "",
                        "admin-reset-password.html"
                    );

                }

                catch (error) {

                    console.error(
                        "Password reset error:",
                        error
                    );


                    status.className =
                        "reset-status error";


                    status.textContent =
                        error.message;

                }

                finally {

                    button.disabled =
                        false;

                }


            }
        );


    }
);