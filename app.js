// ============================================================
// StudyFlow
// Cloud-backed Study Tracker
// No Pause: Start -> Finish Session
// ============================================================


// ============================================================
// SUPABASE
// ============================================================

const supabaseClient =
    window.studyflowSupabase;


// ============================================================
// AUTH ELEMENTS
// ============================================================

const authScreen =
    document.querySelector("#auth-screen");

const loginForm =
    document.querySelector("#auth-login-form");

const signupForm =
    document.querySelector("#auth-signup-form");

const showSignupButton =
    document.querySelector("#show-signup");

const showLoginButton =
    document.querySelector("#show-login");

const loginButton =
    document.querySelector("#login-button");

const signupButton =
    document.querySelector("#signup-button");

const loginError =
    document.querySelector("#login-error");

const signupError =
    document.querySelector("#signup-error");


// ============================================================
// AUTH STATE
// ============================================================

let currentUser = null;

let appBooted = false;

let bootInProgress = false;


// ============================================================
// CLOUD DATA
// ============================================================

let subjects = [];

let studySessions = [];


// ============================================================
// ACTIVE TIMER STATE
// ============================================================

let currentSubjectId = null;

let sessionStartedAt = null;

let timerInterval = null;

let isRunning = false;


// ============================================================
// CALENDAR STATE
// ============================================================

let calendarMonth =
    new Date().getMonth();

let calendarYear =
    new Date().getFullYear();

let selectedCalendarDate =
    getTodayDate();


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// DATE HELPERS
// ============================================================

function getTodayDate() {

    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(
            now.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            now.getDate()
        ).padStart(2, "0")
    );
}


function dateFromString(dateString) {

    return new Date(
        dateString + "T00:00:00"
    );
}


function formatHistoryDate(dateString) {

    return dateFromString(
        dateString
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function getDateDaysAgo(daysAgo) {

    const date = new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() - daysAgo
    );

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );
}


function getStartOfToday() {

    const date = new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


function getStartOfTomorrow() {

    const date =
        getStartOfToday();

    date.setDate(
        date.getDate() + 1
    );

    return date;
}


// ============================================================
// TIME
// ============================================================

function formatTime(totalSeconds) {

    totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(totalSeconds) || 0
            )
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


// ============================================================
// ELEMENTS
// ============================================================

const pages =
    document.querySelectorAll(".page");

const navButtons =
    document.querySelectorAll(".nav-button");

const timerDisplays =
    document.querySelectorAll(".timer");

const timerLabels =
    document.querySelectorAll(".timer-label");

const currentSubjectDisplays =
    document.querySelectorAll(".current-subject");

const startButtons =
    document.querySelectorAll(".start-button");

const finishButtons =
    document.querySelectorAll(".finish-button");

const manualButtons =
    document.querySelectorAll(".manual-button");


const subjectModal =
    document.querySelector(".subject-modal");

const subjectSelectionList =
    document.querySelector("#subject-selection-list");

const subjectModalDescription =
    document.querySelector("#subject-modal-description");

const modalAddSubjectButton =
    document.querySelector("#modal-add-subject");


const addSubjectModal =
    document.querySelector(".add-subject-modal");

const newSubjectInput =
    document.querySelector("#new-subject-name");

const subjectFormError =
    document.querySelector("#subject-form-error");

const closeAddSubjectButton =
    document.querySelector(".close-add-subject");

const saveSubjectButton =
    document.querySelector(".save-subject");


const manualModal =
    document.querySelector(".manual-modal");

const manualSubject =
    document.querySelector("#manual-subject");

const manualHours =
    document.querySelector("#manual-hours");

const manualMinutes =
    document.querySelector("#manual-minutes");

const closeManualButton =
    document.querySelector(".close-manual");

const saveManualButton =
    document.querySelector(".save-manual");


const subjectList =
    document.querySelector("#subject-list");

const historyList =
    document.querySelector("#history-list");


const calendarGrid =
    document.querySelector("#calendar-grid");

const calendarMonthTitle =
    document.querySelector(".calendar-month-title");

const previousMonthButton =
    document.querySelector("#previous-month");

const nextMonthButton =
    document.querySelector("#next-month");

const todayButton =
    document.querySelector("#today-button");

const selectedDateElement =
    document.querySelector("#selected-date");

const selectedTotalElement =
    document.querySelector("#selected-total");

const calendarSubjects =
    document.querySelector("#calendar-subjects");

const selectedDayBadge =
    document.querySelector("#selected-day-badge");


// ============================================================
// HIDE ANY OLD PAUSE BUTTON
// ============================================================
//
// Your old HTML may still contain pause buttons.
// We simply hide them so you don't have to edit index.html.
// ============================================================

document
    .querySelectorAll(".pause-button")
    .forEach(button => {

        button.style.display = "none";

    });


// ============================================================
// AUTH
// ============================================================

showSignupButton.addEventListener(
    "click",
    () => {

        loginForm.style.display =
            "none";

        signupForm.style.display =
            "block";

        loginError.textContent = "";

        loginError.className =
            "auth-error";

    }
);


showLoginButton.addEventListener(
    "click",
    () => {

        signupForm.style.display =
            "none";

        loginForm.style.display =
            "block";

        signupError.textContent = "";

        signupError.className =
            "auth-error";

    }
);


// ============================================================
// LOGIN
// ============================================================

loginButton.addEventListener(
    "click",
    async () => {

        loginError.textContent = "";

        loginError.className =
            "auth-error";


        const email =
            document
                .querySelector("#login-email")
                .value
                .trim();


        const password =
            document
                .querySelector("#login-password")
                .value;


        if (
            !email ||
            !password
        ) {

            loginError.textContent =
                "Please enter your email and password.";

            return;
        }


        loginButton.disabled =
            true;

        loginButton.textContent =
            "Logging in...";


        const {
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            loginError.textContent =
                error.message;

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Log In";

            return;
        }


        loginButton.disabled =
            false;

        loginButton.textContent =
            "Log In";

    }
);


// ============================================================
// SIGN UP
// ============================================================

signupButton.addEventListener(
    "click",
    async () => {

        signupError.textContent = "";

        signupError.className =
            "auth-error";


        const displayName =
            document
                .querySelector("#signup-display-name")
                .value
                .trim();


        const username =
            document
                .querySelector("#signup-username")
                .value
                .trim()
                .toLowerCase();


        const email =
            document
                .querySelector("#signup-email")
                .value
                .trim();


        const password =
            document
                .querySelector("#signup-password")
                .value;


        if (
            !displayName ||
            !username ||
            !email ||
            !password
        ) {

            signupError.textContent =
                "Please fill in every field.";

            return;
        }


        if (
            !/^[a-z0-9_]{3,20}$/.test(
                username
            )
        ) {

            signupError.textContent =
                "Username must be 3–20 characters and use only letters, numbers, or underscores.";

            return;
        }


        if (
            password.length < 6
        ) {

            signupError.textContent =
                "Your password must be at least 6 characters.";

            return;
        }


        signupButton.disabled =
            true;

        signupButton.textContent =
            "Creating account...";


        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signUp({
                    email,
                    password,
                    options: {
                        data: {
                            display_name:
                                displayName,
                            username:
                                username
                        }
                    }
                });


        if (error) {

            signupError.textContent =
                error.message;

            signupButton.disabled =
                false;

            signupButton.textContent =
                "Create Account";

            return;
        }


        if (!data.session) {

            signupError.className =
                "auth-success";

            signupError.textContent =
                "Account created! Check your email, verify it, then log in.";

        }


        signupButton.disabled =
            false;

        signupButton.textContent =
            "Create Account";

    }
);


// ============================================================
// AUTH STATE
// ============================================================

supabaseClient.auth.onAuthStateChange(
    (
        event,
        session
    ) => {

        if (
            event === "SIGNED_OUT"
        ) {

            currentUser =
                null;

            appBooted =
                false;

            subjects = [];

            studySessions = [];

            resetTimerState();

            authScreen.classList.remove(
                "hidden"
            );

            updateAllViews();

            return;
        }


        if (
            event === "SIGNED_IN"
        ) {

            authScreen.classList.add(
                "hidden"
            );


            setTimeout(
                () => {

                    bootCloudApp(
                        session?.user ||
                        null
                    );

                },
                0
            );

            return;
        }


        if (
            event === "USER_UPDATED"
        ) {

            setTimeout(
                () => {

                    bootCloudApp(
                        session?.user ||
                        null
                    );

                },
                0
            );

        }

    }
);


// ============================================================
// INITIAL AUTH CHECK
// ============================================================

async function initializeAuth() {

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .getSession();


    if (error) {

        console.error(
            "Unable to check auth session:",
            error
        );

        return;
    }


    if (
        data.session?.user
    ) {

        currentUser =
            data.session.user;

        authScreen.classList.add(
            "hidden"
        );

        await bootCloudApp(
            data.session.user
        );

    } else {

        authScreen.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// CLOUD BOOT
// ============================================================

async function bootCloudApp(
    sessionUser = null
) {

    if (
        bootInProgress
    ) {

        return;
    }


    bootInProgress =
        true;


    try {

        if (
            sessionUser
        ) {

            currentUser =
                sessionUser;

        }


        if (
            !currentUser
        ) {

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .getUser();


            if (error) {

                console.error(
                    "Could not retrieve user:",
                    error
                );

                return;
            }


            currentUser =
                data.user ||
                null;

        }


        if (
            !currentUser
        ) {

            return;
        }


        const subjectsLoaded =
            await loadCloudSubjects(
                currentUser.id
            );


        const sessionsLoaded =
            await loadAllCloudSessions(
                currentUser.id
            );


        if (
            !subjectsLoaded ||
            !sessionsLoaded
        ) {

            return;
        }


        /*
         * If the app was reopened while an
         * active session still exists, remove
         * that stale live row for now.
         *
         * Later we'll build proper recovery.
         */

        await clearActiveSession();


        appBooted =
            true;


        updateAllViews();

    } finally {

        bootInProgress =
            false;

    }

}


// ============================================================
// LOAD SUBJECTS
// ============================================================

async function loadCloudSubjects(
    userId
) {

    if (!userId) {
        return false;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("subjects")
            .select(
                "id,user_id,name,created_at,updated_at"
            )
            .eq(
                "user_id",
                userId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Could not load subjects:",
            error
        );

        return false;
    }


    subjects =
        data || [];


    return true;
}


// ============================================================
// LOAD STUDY SESSIONS
// ============================================================

async function loadAllCloudSessions(
    userId
) {

    if (!userId) {
        return false;
    }


    const allSessions = [];

    const pageSize = 1000;

    let from = 0;


    while (true) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("study_sessions")
                .select(
                    [
                        "id",
                        "user_id",
                        "subject_id",
                        "started_at",
                        "ended_at",
                        "duration_seconds",
                        "created_at"
                    ].join(",")
                )
                .eq(
                    "user_id",
                    userId
                )
                .order(
                    "started_at",
                    {
                        ascending: true
                    }
                )
                .range(
                    from,
                    from +
                    pageSize -
                    1
                );


        if (error) {

            console.error(
                "Could not load study sessions:",
                error
            );

            return false;
        }


        allSessions.push(
            ...(data || [])
        );


        if (
            !data ||
            data.length <
                pageSize
        ) {

            break;
        }


        from +=
            pageSize;

    }


    studySessions =
        allSessions;


    return true;
}


// ============================================================
// ACTIVE SESSION
// ============================================================

async function createActiveSession() {

    if (
        !currentUser ||
        !currentSubjectId ||
        !sessionStartedAt
    ) {

        return false;
    }


    const {
        error
    } =
        await supabaseClient
            .from("active_sessions")
            .upsert(
                {
                    user_id:
                        currentUser.id,

                    subject_id:
                        currentSubjectId,

                    status:
                        "active",

                    started_at:
                        new Date(
                            sessionStartedAt
                        ).toISOString(),

                    accumulated_seconds:
                        0,

                    updated_at:
                        new Date().toISOString()

                },
                {
                    onConflict:
                        "user_id"
                }
            );


    if (error) {

        console.error(
            "Could not create active session:",
            error
        );

        return false;
    }


    return true;
}


async function clearActiveSession() {

    if (
        !currentUser
    ) {

        return false;
    }


    const {
        error
    } =
        await supabaseClient
            .from("active_sessions")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Could not clear active session:",
            error
        );

        return false;
    }


    return true;
}


// ============================================================
// NAVIGATION
// ============================================================

navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const pageName =
                    button.dataset.page;


                navButtons.forEach(
                    nav => {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                pages.forEach(
                    page => {

                        page.classList.remove(
                            "active"
                        );

                    }
                );


                const target =
                    document.querySelector(
                        `#${pageName}-page`
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );

                }


                if (
                    pageName ===
                    "statistics"
                ) {

                    renderStatistics();

                }


                if (
                    pageName ===
                    "calendar"
                ) {

                    updateCalendar();

                }

            }
        );

    }
);


// ============================================================
// SUBJECT HELPERS
// ============================================================

function getSubjectById(id) {

    return subjects.find(
        subject =>
            subject.id === id
    );
}


// ============================================================
// SUBJECT RENDERING
// ============================================================

function renderSubjects() {

    subjectList.innerHTML =
        "";


    if (
        subjects.length === 0
    ) {

        subjectList.innerHTML = `

            <div class="empty-subjects">

                <strong>
                    No subjects yet
                </strong>

                Add your first subject
                to start studying.

                <br>

                <button
                    data-action="add-subject"
                >
                    + Add Subject
                </button>

            </div>

        `;

        return;
    }


    subjects.forEach(
        subject => {

            const todaySeconds =
                getTodaySubjectTime(
                    subject.id
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject";

            card.dataset.subjectId =
                subject.id;


            card.innerHTML = `

                <div class="subject-name">

                    ${escapeHtml(
                        subject.name
                    )}

                </div>


                <div class="subject-time">

                    ${formatTime(
                        todaySeconds
                    )}

                </div>


                <div class="subject-actions">

                    <button
                        class="add-subject-time"
                        data-action="add-time"
                        data-subject-id="${subject.id}"
                    >
                        + Add time
                    </button>


                    <button
                        class="reset-subject"
                        data-action="reset"
                        data-subject-id="${subject.id}"
                    >
                        Reset
                    </button>


                    <button
                        class="delete-subject"
                        data-action="delete"
                        data-subject-id="${subject.id}"
                    >
                        Delete
                    </button>

                </div>


                <div
                    class="delete-warning"
                    data-delete-warning="${subject.id}"
                ></div>

            `;


            subjectList.appendChild(
                card
            );

        }
    );

}


// ============================================================
// ADD SUBJECT
// ============================================================

function openAddSubjectModal() {

    subjectFormError.textContent =
        "";

    newSubjectInput.value =
        "";

    addSubjectModal.classList.add(
        "show"
    );


    setTimeout(
        () => {

            newSubjectInput.focus();

        },
        50
    );

}


function closeAddSubjectModal() {

    addSubjectModal.classList.remove(
        "show"
    );

}


async function addNewSubject() {

    if (!currentUser) {

        subjectFormError.textContent =
            "You're not signed in yet. Please log in again.";

        return;
    }


    const name =
        newSubjectInput.value.trim();


    if (!name) {

        subjectFormError.textContent =
            "Please enter a subject name.";

        return;
    }


    const duplicate =
        subjects.some(
            subject =>
                subject.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (duplicate) {

        subjectFormError.textContent =
            "You already have this subject.";

        return;
    }


    saveSubjectButton.disabled =
        true;

    saveSubjectButton.textContent =
        "Adding...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("subjects")
                .insert(
                    {
                        user_id:
                            currentUser.id,

                        name
                    }
                )
                .select(
                    "id,user_id,name,created_at,updated_at"
                )
                .single();


        if (error) {

            console.error(
                "Could not add subject:",
                error
            );

            subjectFormError.textContent =
                error.message;

            return;
        }


        subjects.push(
            data
        );


        subjects.sort(
            (
                a,
                b
            ) =>
                new Date(
                    a.created_at
                ) -
                new Date(
                    b.created_at
                )
        );


        closeAddSubjectModal();

        renderSubjects();

        renderSubjectSelection();

        renderManualSubjectOptions();

        updateAllViews();

    } finally {

        saveSubjectButton.disabled =
            false;

        saveSubjectButton.textContent =
            "Add Subject";

    }

}


document
    .querySelector(
        "#dashboard-add-subject"
    )
    .addEventListener(
        "click",
        openAddSubjectModal
    );


modalAddSubjectButton.addEventListener(
    "click",
    () => {

        subjectModal.classList.remove(
            "show"
        );

        openAddSubjectModal();

    }
);


closeAddSubjectButton.addEventListener(
    "click",
    closeAddSubjectModal
);


saveSubjectButton.addEventListener(
    "click",
    addNewSubject
);


newSubjectInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            addNewSubject();

        }


        if (
            event.key ===
            "Escape"
        ) {

            closeAddSubjectModal();

        }

    }
);


// ============================================================
// SESSION DATE HELPERS
// ============================================================

function getSessionsForDate(
    dateString
) {

    return studySessions.filter(
        session => {

            const date =
                new Date(
                    session.started_at
                );


            const localDate =
                date.getFullYear() +
                "-" +
                String(
                    date.getMonth() + 1
                ).padStart(2, "0") +
                "-" +
                String(
                    date.getDate()
                ).padStart(2, "0");


            return (
                localDate ===
                dateString
            );

        }
    );

}


function getTodaySubjectTime(
    subjectId
) {

    return getSessionsForDate(
        getTodayDate()
    )
    .filter(
        session =>
            session.subject_id ===
            subjectId
    )
    .reduce(
        (
            total,
            session
        ) =>
            total +
            Number(
                session.duration_seconds
            ),
        0
    );

}


// ============================================================
// SUBJECT CARD ACTIONS
// ============================================================

subjectList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        if (
            action ===
            "add-subject"
        ) {

            openAddSubjectModal();

            return;
        }


        const subjectId =
            button.dataset.subjectId;


        if (!subjectId) {
            return;
        }


        if (
            action ===
            "add-time"
        ) {

            openManualModal(
                subjectId
            );

            return;
        }


        if (
            action ===
            "reset"
        ) {

            resetSubject(
                subjectId,
                button
            );

            return;
        }


        if (
            action ===
            "delete"
        ) {

            showDeleteWarning(
                subjectId,
                button
            );

            return;
        }


        if (
            action ===
            "cancel-delete"
        ) {

            cancelDelete(
                subjectId
            );

            return;
        }


        if (
            action ===
            "confirm-delete"
        ) {

            permanentlyDeleteSubject(
                subjectId
            );

        }

    }
);


// ============================================================
// RESET SUBJECT
// ============================================================

async function resetSubject(
    subjectId,
    button
) {

    if (
        currentSubjectId ===
        subjectId &&
        isRunning
    ) {

        return;
    }


    if (
        button.dataset.confirming !==
        "true"
    ) {

        button.dataset.confirming =
            "true";

        button.textContent =
            "Confirm?";


        setTimeout(
            () => {

                button.dataset.confirming =
                    "false";

                button.textContent =
                    "Reset";

            },
            3000
        );


        return;
    }


    button.disabled =
        true;

    button.textContent =
        "Resetting...";


    try {

        const start =
            getStartOfToday()
                .toISOString();


        const end =
            getStartOfTomorrow()
                .toISOString();


        const {
            error
        } =
            await supabaseClient
                .from("study_sessions")
                .delete()
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "subject_id",
                    subjectId
                )
                .gte(
                    "started_at",
                    start
                )
                .lt(
                    "started_at",
                    end
                );


        if (error) {

            console.error(
                "Could not reset subject:",
                error
            );

            return;
        }


        await loadAllCloudSessions(
            currentUser.id
        );


        updateAllViews();

    } finally {

        button.disabled =
            false;

        button.textContent =
            "Reset";

        button.dataset.confirming =
            "false";

    }

}


// ============================================================
// DELETE SUBJECT
// ============================================================

function showDeleteWarning(
    subjectId,
    button
) {

    if (
        currentSubjectId ===
        subjectId &&
        isRunning
    ) {

        return;
    }


    const subject =
        getSubjectById(
            subjectId
        );


    if (!subject) {
        return;
    }


    const card =
        button.closest(
            ".subject"
        );


    const warning =
        card.querySelector(
            `[data-delete-warning="${subjectId}"]`
        );


    warning.innerHTML = `

        <div class="delete-warning-box">

            ⚠️ <strong>
                Delete ${escapeHtml(
                    subject.name
                )}?
            </strong>

            <br><br>

            All study time recorded for
            this subject, including history,
            will be permanently deleted.

        </div>


        <div class="delete-confirm-actions">

            <button
                class="cancel-delete"
                data-action="cancel-delete"
                data-subject-id="${subjectId}"
            >
                Cancel
            </button>


            <button
                class="confirm-delete"
                data-action="confirm-delete"
                data-subject-id="${subjectId}"
            >
                Delete Permanently
            </button>

        </div>

    `;


    button.style.display =
        "none";

}


function cancelDelete(
    subjectId
) {

    const card =
        subjectList.querySelector(
            `[data-subject-id="${subjectId}"]`
        );


    if (!card) {
        return;
    }


    const warning =
        card.querySelector(
            `[data-delete-warning="${subjectId}"]`
        );


    const deleteButton =
        card.querySelector(
            ".delete-subject"
        );


    warning.innerHTML =
        "";


    deleteButton.style.display =
        "inline-block";

}


async function permanentlyDeleteSubject(
    subjectId
) {

    if (
        currentSubjectId ===
        subjectId &&
        isRunning
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("subjects")
            .delete()
            .eq(
                "id",
                subjectId
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Could not delete subject:",
            error
        );

        return;
    }


    subjects =
        subjects.filter(
            subject =>
                subject.id !==
                subjectId
        );


    studySessions =
        studySessions.filter(
            session =>
                session.subject_id !==
                subjectId
        );


    renderSubjects();

    renderSubjectSelection();

    renderManualSubjectOptions();

    updateAllViews();

}


// ============================================================
// SUBJECT SELECTION
// ============================================================

function renderSubjectSelection() {

    subjectSelectionList.innerHTML =
        "";


    if (
        subjects.length ===
        0
    ) {

        subjectModalDescription.textContent =
            "You need to add a subject first.";

        return;
    }


    subjectModalDescription.textContent =
        "Choose a subject to start your session.";


    subjects.forEach(
        subject => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "subject-option";

            button.textContent =
                subject.name;

            button.dataset.subjectId =
                subject.id;


            button.addEventListener(
                "click",
                () => {

                    startStudySession(
                        subject.id
                    );

                }
            );


            subjectSelectionList.appendChild(
                button
            );

        }
    );

}


function openSubjectSelection() {

    renderSubjectSelection();

    subjectModal.classList.add(
        "show"
    );

}


startButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                if (
                    isRunning
                ) {

                    return;
                }


                if (
                    subjects.length ===
                    0
                ) {

                    openAddSubjectModal();

                    return;
                }


                openSubjectSelection();

            }
        );

    }
);


// ============================================================
// TIMER
// ============================================================

function getCurrentSessionSeconds() {

    if (
        !currentSubjectId ||
        !sessionStartedAt
    ) {

        return 0;
    }


    return Math.floor(
        (
            Date.now() -
            sessionStartedAt
        ) / 1000
    );
}


function updateTimerDisplay() {

    const time =
        formatTime(
            getCurrentSessionSeconds()
        );


    timerDisplays.forEach(
        display => {

            display.textContent =
                time;

        }
    );

}


function startTimerInterval() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(
            updateTimerDisplay,
            250
        );

}


// ============================================================
// START SESSION
// ============================================================

async function startStudySession(
    subjectId
) {

    if (
        !currentUser
    ) {

        return;
    }


    const subject =
        getSubjectById(
            subjectId
        );


    if (!subject) {
        return;
    }


    subjectModal.classList.remove(
        "show"
    );


    currentSubjectId =
        subjectId;


    sessionStartedAt =
        Date.now();


    isRunning =
        true;


    currentSubjectDisplays.forEach(
        display => {

            display.textContent =
                subject.name;

        }
    );


    startButtons.forEach(
        button => {

            button.style.display =
                "none";

        }
    );


    finishButtons.forEach(
        button => {

            button.style.display =
                "inline-block";

        }
    );


    /*
     * Hide any old Pause buttons.
     */

    document
        .querySelectorAll(
            ".pause-button"
        )
        .forEach(
            button => {

                button.style.display =
                    "none";

            }
        );


    startTimerInterval();

    updateTimerDisplay();


    const activeCreated =
        await createActiveSession();


    if (
        !activeCreated
    ) {

        console.warn(
            "Timer is running locally, but the live session could not be uploaded."
        );

    }

}


// ============================================================
// FINISH SESSION
// ============================================================

finishButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            finishStudySession
        );

    }
);


async function finishStudySession() {

    if (
        !currentSubjectId ||
        !sessionStartedAt
    ) {

        return;
    }


    const subjectId =
        currentSubjectId;


    const startedAtTimestamp =
        sessionStartedAt;


    const studiedSeconds =
        getCurrentSessionSeconds();


    if (
        studiedSeconds <= 0
    ) {

        await clearActiveSession();

        resetTimerState();

        return;
    }


    finishButtons.forEach(
        button => {

            button.disabled =
                true;

            button.textContent =
                "Saving...";

        }
    );


    try {

        const startedAt =
            new Date(
                startedAtTimestamp
            );


        const endedAt =
            new Date();


        /*
         * IMPORTANT:
         *
         * started_at is the REAL time the student
         * clicked Start.
         *
         * ended_at is the REAL time they clicked Finish.
         *
         * duration_seconds is the actual elapsed
         * study time.
         *
         * Since Pause no longer exists, these three
         * values are perfectly consistent.
         */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("study_sessions")
                .insert(
                    {

                        user_id:
                            currentUser.id,

                        subject_id:
                            subjectId,

                        started_at:
                            startedAt.toISOString(),

                        ended_at:
                            endedAt.toISOString(),

                        duration_seconds:
                            Math.floor(
                                studiedSeconds
                            )

                    }
                )
                .select(
                    [
                        "id",
                        "user_id",
                        "subject_id",
                        "started_at",
                        "ended_at",
                        "duration_seconds",
                        "created_at"
                    ].join(",")
                )
                .single();


        if (error) {

            console.error(
                "Could not save study session:",
                error
            );

            return;
        }


        studySessions.push(
            data
        );


        studySessions.sort(
            (
                a,
                b
            ) =>
                new Date(
                    a.started_at
                ) -
                new Date(
                    b.started_at
                )
        );


        /*
         * Remove the live session.
         */

        await clearActiveSession();


        resetTimerState();


        updateAllViews();

    } finally {

        finishButtons.forEach(
            button => {

                button.disabled =
                    false;

                button.textContent =
                    "Finish Session";

            }
        );

    }

}


// ============================================================
// ACTIVE SESSION CREATION
// ============================================================

async function createActiveSession() {

    if (
        !currentUser ||
        !currentSubjectId ||
        !sessionStartedAt
    ) {

        return false;
    }


    const {
        error
    } =
        await supabaseClient
            .from("active_sessions")
            .upsert(
                {

                    user_id:
                        currentUser.id,

                    subject_id:
                        currentSubjectId,

                    status:
                        "active",

                    started_at:
                        new Date(
                            sessionStartedAt
                        ).toISOString(),

                    accumulated_seconds:
                        0,

                    updated_at:
                        new Date().toISOString()

                },
                {
                    onConflict:
                        "user_id"
                }
            );


    if (error) {

        console.error(
            "Could not create active session:",
            error
        );

        return false;
    }


    return true;
}


// ============================================================
// CLEAR ACTIVE SESSION
// ============================================================

async function clearActiveSession() {

    if (
        !currentUser
    ) {

        return false;
    }


    const {
        error
    } =
        await supabaseClient
            .from("active_sessions")
            .delete()
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Could not clear active session:",
            error
        );

        return false;
    }


    return true;
}


// ============================================================
// RESET TIMER
// ============================================================

function resetTimerState() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    currentSubjectId =
        null;


    sessionStartedAt =
        null;


    isRunning =
        false;


    currentSubjectDisplays.forEach(
        display => {

            display.textContent =
                "No subject selected";

        }
    );


    startButtons.forEach(
        button => {

            button.style.display =
                "inline-block";

        }
    );


    finishButtons.forEach(
        button => {

            button.style.display =
                "none";

            button.disabled =
                false;

            button.textContent =
                "Finish Session";

        }
    );


    document
        .querySelectorAll(
            ".pause-button"
        )
        .forEach(
            button => {

                button.style.display =
                    "none";

            }
        );


    updateTimerDisplay();

}


// ============================================================
// MANUAL TIME
// ============================================================

function renderManualSubjectOptions(
    selectedId = null
) {

    manualSubject.innerHTML =
        "";


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject.id;


            option.textContent =
                subject.name;


            if (
                selectedId ===
                subject.id
            ) {

                option.selected =
                    true;

            }


            manualSubject.appendChild(
                option
            );

        }
    );

}


function openManualModal(
    presetSubjectId = null
) {

    if (
        subjects.length ===
        0
    ) {

        openAddSubjectModal();

        return;
    }


    renderManualSubjectOptions(
        presetSubjectId
    );


    manualHours.value =
        "";

    manualMinutes.value =
        "";


    manualModal.classList.add(
        "show"
    );

}


manualButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                openManualModal();

            }
        );

    }
);


closeManualButton.addEventListener(
    "click",
    () => {

        manualModal.classList.remove(
            "show"
        );

    }
);


saveManualButton.addEventListener(
    "click",
    async () => {

        if (
            !currentUser
        ) {

            return;
        }


        const subjectId =
            manualSubject.value;


        const hours =
            Number(
                manualHours.value
            ) || 0;


        const minutes =
            Number(
                manualMinutes.value
            ) || 0;


        if (
            hours < 0 ||
            minutes < 0
        ) {

            return;
        }


        if (
            minutes > 59
        ) {

            manualMinutes.value =
                59;

            return;
        }


        const secondsToAdd =
            (
                hours * 3600
            ) +
            (
                minutes * 60
            );


        if (
            secondsToAdd <= 0
        ) {

            return;
        }


        saveManualButton.disabled =
            true;

        saveManualButton.textContent =
            "Adding...";


        try {

            const now =
                new Date();


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("study_sessions")
                    .insert(
                        {

                            user_id:
                                currentUser.id,

                            subject_id:
                                subjectId,

                            started_at:
                                now.toISOString(),

                            ended_at:
                                now.toISOString(),

                            duration_seconds:
                                secondsToAdd

                        }
                    )
                    .select(
                        [
                            "id",
                            "user_id",
                            "subject_id",
                            "started_at",
                            "ended_at",
                            "duration_seconds",
                            "created_at"
                        ].join(",")
                    )
                    .single();


            if (error) {

                console.error(
                    "Could not add manual time:",
                    error
                );

                return;
            }


            studySessions.push(
                data
            );


            manualModal.classList.remove(
                "show"
            );


            updateAllViews();

        } finally {

            saveManualButton.disabled =
                false;

            saveManualButton.textContent =
                "Add Time";

        }

    }
);


// ============================================================
// DASHBOARD
// ============================================================

function getTotalToday() {

    return getSessionsForDate(
        getTodayDate()
    )
    .reduce(
        (
            total,
            session
        ) =>
            total +
            Number(
                session.duration_seconds
            ),
        0
    );

}


function updateTimerLabels() {

    const total =
        formatTime(
            getTotalToday()
        );


    timerLabels.forEach(
        label => {

            label.textContent =
                "Today's study time • " +
                total;

        }
    );

}


function updateDashboardSummary() {

    const days =
        getLastSevenDays();


    const weeklyTotal =
        days.reduce(
            (
                total,
                day
            ) =>
                total +
                day.total,
            0
        );


    const average =
        Math.floor(
            weeklyTotal /
            7
        );


    document.querySelector(
        "#dashboard-total"
    ).textContent =
        formatTime(
            getTotalToday()
        );


    document.querySelector(
        "#dashboard-week"
    ).textContent =
        formatTime(
            weeklyTotal
        );


    document.querySelector(
        "#dashboard-average"
    ).textContent =
        formatTime(
            average
        );

}


// ============================================================
// HISTORY
// ============================================================

function updateHistoryDisplay() {

    const dates =
        [
            ...new Set(
                studySessions.map(
                    session => {

                        const date =
                            new Date(
                                session.started_at
                            );


                        return (
                            date.getFullYear() +
                            "-" +
                            String(
                                date.getMonth() + 1
                            ).padStart(2, "0") +
                            "-" +
                            String(
                                date.getDate()
                            ).padStart(2, "0")
                        );

                    }
                )
            )
        ]
        .sort()
        .reverse();


    if (
        dates.length ===
        0
    ) {

        historyList.innerHTML = `

            <div class="empty-history">

                No previous study days yet.

            </div>

        `;

        return;
    }


    const recent =
        dates.slice(
            0,
            7
        );


    historyList.innerHTML =
        "";


    recent.forEach(
        date => {

            const sessions =
                getSessionsForDate(
                    date
                );


            const total =
                sessions.reduce(
                    (
                        sum,
                        session
                    ) =>
                        sum +
                        Number(
                            session.duration_seconds
                        ),
                    0
                );


            const subjectTotals = {};


            sessions.forEach(
                session => {

                    subjectTotals[
                        session.subject_id
                    ] =
                        (
                            subjectTotals[
                                session.subject_id
                            ] || 0
                        ) +
                        Number(
                            session.duration_seconds
                        );

                }
            );


            const breakdown =
                Object.entries(
                    subjectTotals
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b[1] - a[1]
                )
                .map(
                    (
                        [
                            subjectId,
                            seconds
                        ]
                    ) => {

                        const subject =
                            getSubjectById(
                                subjectId
                            );


                        return (
                            escapeHtml(
                                subject?.name ||
                                "Unknown subject"
                            ) +
                            " " +
                            formatTime(
                                seconds
                            )
                        );

                    }
                )
                .join(" • ");


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-row";


            row.innerHTML = `

                <div>

                    <div class="history-date">

                        ${formatHistoryDate(
                            date
                        )}

                    </div>


                    <div class="history-breakdown">

                        ${breakdown}

                    </div>

                </div>


                <div class="history-total">

                    ${formatTime(
                        total
                    )}

                </div>

            `;


            historyList.appendChild(
                row
            );

        }
    );

}


// ============================================================
// STATISTICS
// ============================================================

function getLastSevenDays() {

    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            getDateDaysAgo(i);


        const sessions =
            getSessionsForDate(
                date
            );


        const subjectTotals = {};


        sessions.forEach(
            session => {

                subjectTotals[
                    session.subject_id
                ] =
                    (
                        subjectTotals[
                            session.subject_id
                        ] || 0
                    ) +
                    Number(
                        session.duration_seconds
                    );

            }
        );


        const total =
            Object.values(
                subjectTotals
            )
            .reduce(
                (
                    sum,
                    seconds
                ) =>
                    sum +
                    Number(seconds),
                0
            );


        days.push({

            date,

            subjects:
                subjectTotals,

            total

        });

    }


    return days;

}


function renderStatistics() {

    const days =
        getLastSevenDays();


    const weeklyTotal =
        days.reduce(
            (
                total,
                day
            ) =>
                total +
                day.total,
            0
        );


    const dailyAverage =
        Math.floor(
            weeklyTotal /
            7
        );


    let bestDay =
        null;

    let bestTotal =
        0;


    days.forEach(
        day => {

            if (
                day.total >
                bestTotal
            ) {

                bestTotal =
                    day.total;

                bestDay =
                    day;

            }

        }
    );


    document.querySelector(
        "#stat-week-total"
    ).textContent =
        formatTime(
            weeklyTotal
        );


    document.querySelector(
        "#stat-daily-average"
    ).textContent =
        formatTime(
            dailyAverage
        );


    document.querySelector(
        "#stat-best-day"
    ).textContent =
        formatTime(
            bestTotal
        );


    document.querySelector(
        "#stat-best-date"
    ).textContent =
        bestDay
            ? formatHistoryDate(
                bestDay.date
            )
            : "—";


    updateWeeklyChart(
        days
    );


    updateSubjectBreakdown(
        days
    );

}


function updateWeeklyChart(
    days
) {

    const chart =
        document.querySelector(
            "#weekly-chart"
        );


    const totals =
        days.map(
            day =>
                day.total
        );


    const maximum =
        Math.max(
            ...totals,
            1
        );


    chart.innerHTML =
        "";


    days.forEach(
        (
            day,
            index
        ) => {

            const total =
                totals[index];


            const percentage =
                (
                    total /
                    maximum
                ) * 100;


            const dayName =
                dateFromString(
                    day.date
                ).toLocaleDateString(
                    "en-IN",
                    {
                        weekday:
                            "short"
                    }
                );


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            column.innerHTML = `

                <div class="chart-value">

                    ${formatTime(
                        total
                    )}

                </div>


                <div
                    class="chart-bar-container"
                >

                    <div
                        class="chart-bar"
                        style="
                            height:
                            ${percentage}%
                        "
                    ></div>

                </div>


                <div class="chart-day">

                    ${dayName}

                </div>

            `;


            chart.appendChild(
                column
            );

        }
    );

}


function updateSubjectBreakdown(
    days
) {

    const container =
        document.querySelector(
            "#subject-breakdown"
        );


    const totals = {};


    days.forEach(
        day => {

            Object.entries(
                day.subjects
            )
            .forEach(
                (
                    [
                        subjectId,
                        seconds
                    ]
                ) => {

                    totals[
                        subjectId
                    ] =
                        (
                            totals[
                                subjectId
                            ] || 0
                        ) +
                        Number(
                            seconds
                        );

                }
            );

        }
    );


    const sorted =
        Object.entries(
            totals
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1]
        );


    const grandTotal =
        sorted.reduce(
            (
                total,
                [
                    ,
                    seconds
                ]
            ) =>
                total +
                Number(seconds),
            0
        );


    if (
        sorted.length ===
        0
    ) {

        container.innerHTML = `

            <div class="empty-history">

                No study data yet.

            </div>

        `;


        return;
    }


    container.innerHTML =
        "";


    sorted.forEach(
        (
            [
                subjectId,
                total
            ]
        ) => {

            const subject =
                getSubjectById(
                    subjectId
                );


            const percentage =
                grandTotal >
                0
                    ? (
                        total /
                        grandTotal
                    ) * 100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "breakdown-row";


            row.innerHTML = `

                <div class="breakdown-header">

                    <span class="breakdown-name">

                        ${escapeHtml(
                            subject?.name ||
                            "Unknown subject"
                        )}

                    </span>


                    <span class="breakdown-time">

                        ${formatTime(
                            total
                        )}

                    </span>

                </div>


                <div class="breakdown-track">

                    <div
                        class="breakdown-fill"
                        style="
                            width:
                            ${percentage}%
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ============================================================
// CALENDAR
// ============================================================

function getCalendarDayTotal(
    dateString
) {

    return getSessionsForDate(
        dateString
    )
    .reduce(
        (
            total,
            session
        ) =>
            total +
            Number(
                session.duration_seconds
            ),
        0
    );

}


function getMonthFirstDay(
    year,
    month
) {

    return new Date(
        year,
        month,
        1
    );

}


function getDaysInMonth(
    year,
    month
) {

    return new Date(
        year,
        month + 1,
        0
    ).getDate();

}


function mondayFirstOffset(
    year,
    month
) {

    const day =
        getMonthFirstDay(
            year,
            month
        ).getDay();


    return day === 0
        ? 6
        : day - 1;

}


function getDateStringFromParts(
    year,
    month,
    day
) {

    return (
        year +
        "-" +
        String(
            month + 1
        ).padStart(2, "0") +
        "-" +
        String(
            day
        ).padStart(2, "0")
    );

}


function getCalendarIntensity(
    totalSeconds,
    monthlyMaximum
) {

    if (
        totalSeconds <= 0 ||
        monthlyMaximum <= 0
    ) {

        return 0;
    }


    const percentage =
        totalSeconds /
        monthlyMaximum;


    if (
        percentage < 0.2
    ) {

        return 1;
    }


    if (
        percentage < 0.4
    ) {

        return 2;
    }


    if (
        percentage < 0.7
    ) {

        return 3;
    }


    return 4;

}


function updateCalendar() {

    if (!calendarGrid) {
        return;
    }


    const firstDay =
        getMonthFirstDay(
            calendarYear,
            calendarMonth
        );


    const daysInMonth =
        getDaysInMonth(
            calendarYear,
            calendarMonth
        );


    const offset =
        mondayFirstOffset(
            calendarYear,
            calendarMonth
        );


    calendarMonthTitle.textContent =
        firstDay.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    let monthlyMaximum =
        0;


    for (
        let day = 1;
        day <=
        daysInMonth;
        day++
    ) {

        const dateString =
            getDateStringFromParts(
                calendarYear,
                calendarMonth,
                day
            );


        monthlyMaximum =
            Math.max(
                monthlyMaximum,
                getCalendarDayTotal(
                    dateString
                )
            );

    }


    calendarGrid.innerHTML =
        "";


    for (
        let i = 0;
        i < offset;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-day empty";


        calendarGrid.appendChild(
            empty
        );

    }


    for (
        let day = 1;
        day <=
        daysInMonth;
        day++
    ) {

        const dateString =
            getDateStringFromParts(
                calendarYear,
                calendarMonth,
                day
            );


        const total =
            getCalendarDayTotal(
                dateString
            );


        const intensity =
            getCalendarIntensity(
                total,
                monthlyMaximum
            );


        const dayButton =
            document.createElement(
                "button"
            );


        dayButton.className =
            "calendar-day";


        dayButton.classList.add(
            `intensity-${intensity}`
        );


        if (
            dateString ===
            getTodayDate()
        ) {

            dayButton.classList.add(
                "today"
            );

        }


        if (
            dateString ===
            selectedCalendarDate
        ) {

            dayButton.classList.add(
                "selected"
            );

        }


        dayButton.innerHTML = `

            <div
                class="calendar-day-number"
            >
                ${day}
            </div>


            <div
                class="calendar-day-total"
            >

                ${
                    total > 0
                        ? formatTime(
                            total
                        )
                        : ""
                }

            </div>

        `;


        dayButton.addEventListener(
            "click",
            () => {

                selectedCalendarDate =
                    dateString;

                updateCalendar();

            }
        );


        calendarGrid.appendChild(
            dayButton
        );

    }


    updateSelectedCalendarDay();

}


function updateSelectedCalendarDay() {

    if (
        !selectedDateElement
    ) {

        return;
    }


    const total =
        getCalendarDayTotal(
            selectedCalendarDate
        );


    selectedDateElement.textContent =
        formatHistoryDate(
            selectedCalendarDate
        );


    selectedTotalElement.textContent =
        formatTime(
            total
        );


    selectedDayBadge.classList.toggle(
        "hidden",
        selectedCalendarDate !==
            getTodayDate()
    );


    calendarSubjects.innerHTML =
        "";


    const sessions =
        getSessionsForDate(
            selectedCalendarDate
        );


    const subjectTotals = {};


    sessions.forEach(
        session => {

            subjectTotals[
                session.subject_id
            ] =
                (
                    subjectTotals[
                        session.subject_id
                    ] || 0
                ) +
                Number(
                    session.duration_seconds
                );

        }
    );


    const entries =
        Object.entries(
            subjectTotals
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1]
        );


    if (
        entries.length ===
        0
    ) {

        calendarSubjects.innerHTML = `

            <div class="calendar-no-subjects">

                No study recorded on
                this day.

            </div>

        `;

        return;
    }


    entries.forEach(
        (
            [
                subjectId,
                seconds
            ]
        ) => {

            const subject =
                getSubjectById(
                    subjectId
                );


            const percentage =
                total > 0
                    ? (
                        seconds /
                        total
                    ) * 100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "calendar-subject-row";


            row.innerHTML = `

                <div
                    class="calendar-subject-info"
                >

                    <div
                        class="calendar-subject-name"
                    >

                        ${escapeHtml(
                            subject?.name ||
                            "Unknown subject"
                        )}

                    </div>


                    <div
                        class="calendar-subject-time"
                    >

                        ${formatTime(
                            seconds
                        )}

                    </div>

                </div>


                <div
                    class="calendar-subject-bar-track"
                >

                    <div
                        class="calendar-subject-bar"
                        style="
                            width:
                            ${percentage}%
                        "
                    ></div>

                </div>

            `;


            calendarSubjects.appendChild(
                row
            );

        }
    );

}


// ============================================================
// CALENDAR BUTTONS
// ============================================================

previousMonthButton.addEventListener(
    "click",
    () => {

        calendarMonth--;


        if (
            calendarMonth < 0
        ) {

            calendarMonth = 11;

            calendarYear--;

        }


        selectedCalendarDate =
            getDateStringFromParts(
                calendarYear,
                calendarMonth,
                1
            );


        updateCalendar();

    }
);


nextMonthButton.addEventListener(
    "click",
    () => {

        calendarMonth++;


        if (
            calendarMonth > 11
        ) {

            calendarMonth = 0;

            calendarYear++;

        }


        selectedCalendarDate =
            getDateStringFromParts(
                calendarYear,
                calendarMonth,
                1
            );


        updateCalendar();

    }
);


todayButton.addEventListener(
    "click",
    () => {

        const today =
            new Date();


        calendarMonth =
            today.getMonth();

        calendarYear =
            today.getFullYear();

        selectedCalendarDate =
            getTodayDate();


        updateCalendar();

    }
);


// ============================================================
// GLOBAL UPDATE
// ============================================================

function updateAllViews() {

    renderSubjects();

    renderSubjectSelection();

    renderManualSubjectOptions();

    updateTimerLabels();

    updateDashboardSummary();

    updateHistoryDisplay();

    renderStatistics();

    updateCalendar();

}


// ============================================================
// INITIAL STATE
// ============================================================

finishButtons.forEach(
    button => {

        button.style.display =
            "none";

    }
);


document
    .querySelectorAll(
        ".pause-button"
    )
    .forEach(
        button => {

            button.style.display =
                "none";

        }
    );


updateTimerDisplay();

initializeAuth();
// ============================================================
// FRIENDS SYSTEM
// ============================================================

const friendsProfileName =
    document.querySelector(
        "#friends-profile-name"
    );

const friendsProfileUsername =
    document.querySelector(
        "#friends-profile-username"
    );

const myFriendCode =
    document.querySelector(
        "#my-friend-code"
    );

const copyFriendCodeButton =
    document.querySelector(
        "#copy-friend-code"
    );

const friendCodeInput =
    document.querySelector(
        "#friend-code-input"
    );

const addFriendButton =
    document.querySelector(
        "#add-friend-button"
    );

const friendFormMessage =
    document.querySelector(
        "#friend-form-message"
    );

const friendRequestsList =
    document.querySelector(
        "#friend-requests-list"
    );

const friendsList =
    document.querySelector(
        "#friends-list"
    );


// ============================================================
// LOAD MY PROFILE
// ============================================================

async function loadMyProfile() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id,display_name,username,friend_code"
            )
            .eq(
                "id",
                currentUser.id
            )
            .single();


    if (error) {

        console.error(
            "Could not load profile:",
            error
        );

        return;
    }


    friendsProfileName.textContent =
        data.display_name ||
        "Student";


    friendsProfileUsername.textContent =
        data.username
            ? "@" + data.username
            : "@username";


    myFriendCode.textContent =
        data.friend_code ||
        "--------";
}


// ============================================================
// COPY FRIEND CODE
// ============================================================

copyFriendCodeButton.addEventListener(
    "click",
    async () => {

        const code =
            myFriendCode.textContent.trim();


        if (
            !code ||
            code === "--------"
        ) {

            return;
        }


        try {

            await navigator.clipboard.writeText(
                code
            );


            const oldText =
                copyFriendCodeButton.textContent;


            copyFriendCodeButton.textContent =
                "Copied!";


            setTimeout(
                () => {

                    copyFriendCodeButton.textContent =
                        oldText;

                },
                1500
            );

        } catch (error) {

            console.error(
                "Could not copy friend code:",
                error
            );

        }

    }
);


// ============================================================
// SEND FRIEND REQUEST
// ============================================================

addFriendButton.addEventListener(
    "click",
    sendFriendRequest
);


friendCodeInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            sendFriendRequest();

        }

    }
);


async function sendFriendRequest() {

    if (!currentUser) {

        return;
    }


    const code =
        friendCodeInput.value
            .trim()
            .toUpperCase();


    friendFormMessage.textContent =
        "";


    if (!code) {

        friendFormMessage.textContent =
            "Enter a friend code.";

        return;
    }


    if (
        code.length !== 8
    ) {

        friendFormMessage.textContent =
            "Friend codes are 8 characters.";

        return;
    }


    addFriendButton.disabled =
        true;

    addFriendButton.textContent =
        "Adding...";


    try {

        // First find the user by friend code.

        const {
            data: profile,
            error: lookupError
        } =
            await supabaseClient
                .rpc(
                    "find_profile_by_friend_code",
                    {
                        target_code: code
                    }
                );


        if (lookupError) {

            console.error(
                "Friend lookup failed:",
                lookupError
            );


            friendFormMessage.textContent =
                lookupError.message;

            return;
        }


        if (
            !profile ||
            profile.length === 0
        ) {

            friendFormMessage.textContent =
                "No StudyFlow user was found with that code.";

            return;
        }


        const targetUser =
            profile[0];


        if (
            targetUser.id ===
            currentUser.id
        ) {

            friendFormMessage.textContent =
                "You can't add yourself.";

            return;
        }


        // Send the request through the database function.

        const {
            error: requestError
        } =
            await supabaseClient
                .rpc(
                    "send_friend_request",
                    {
                        target_user:
                            targetUser.id
                    }
                );


        if (requestError) {

            console.error(
                "Friend request failed:",
                requestError
            );


            friendFormMessage.textContent =
                requestError.message;

            return;
        }


        friendFormMessage.textContent =
            `Friend request sent to ${targetUser.display_name || "user"}!`;


        friendCodeInput.value =
            "";


        await loadFriendRequests();

    } finally {

        addFriendButton.disabled =
            false;

        addFriendButton.textContent =
            "Add";

    }

}


// ============================================================
// LOAD FRIEND REQUESTS
// ============================================================

async function loadFriendRequests() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("friend_requests")
            .select(
                `
                id,
                requester_id,
                addressee_id,
                status,
                created_at
                `
            )
            .or(
                `requester_id.eq.${currentUser.id},addressee_id.eq.${currentUser.id}`
            )
            .eq(
                "status",
                "pending"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load friend requests:",
            error
        );

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        friendRequestsList.innerHTML = `

            <div class="friends-empty">
                No pending friend requests.
            </div>

        `;

        return;
    }


    const otherUserIds =
        [
            ...new Set(
                data.map(
                    request =>

                        request.requester_id ===
                        currentUser.id

                            ? request.addressee_id

                            : request.requester_id
                )
            )
        ];


    const {
        data: profiles,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id,display_name,username,friend_code"
            )
            .in(
                "id",
                otherUserIds
            );


    if (profileError) {

        console.error(
            "Could not load request profiles:",
            profileError
        );

        return;
    }


    const profileMap =
        Object.fromEntries(
            profiles.map(
                profile => [
                    profile.id,
                    profile
                ]
            )
        );


    friendRequestsList.innerHTML =
        "";


    data.forEach(
        request => {

            const isIncoming =
                request.addressee_id ===
                currentUser.id;


            const otherUser =
                profileMap[
                    isIncoming
                        ? request.requester_id
                        : request.addressee_id
                ];


            if (!otherUser) {
                return;
            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "friend-request-card";


            const initial =
                (
                    otherUser.display_name ||
                    "S"
                )
                .charAt(0)
                .toUpperCase();


            if (isIncoming) {

                card.innerHTML = `

                    <div class="friend-main">

                        <div class="friend-avatar">
                            ${escapeHtml(initial)}
                        </div>


                        <div>

                            <div class="friend-name">

                                ${escapeHtml(
                                    otherUser.display_name ||
                                    "Student"
                                )}

                            </div>


                            <div class="friend-username">

                                ${
                                    otherUser.username
                                        ? "@" +
                                          escapeHtml(
                                              otherUser.username
                                          )
                                        : ""
                                }

                            </div>

                        </div>

                    </div>


                    <div class="friend-request-actions">

                        <button
                            class="accept-request"
                            data-request-id="${request.id}"
                        >
                            Accept
                        </button>


                        <button
                            class="decline-request"
                            data-request-id="${request.id}"
                        >
                            Decline
                        </button>

                    </div>

                `;

            } else {

                card.innerHTML = `

                    <div class="friend-main">

                        <div class="friend-avatar">
                            ${escapeHtml(initial)}
                        </div>


                        <div>

                            <div class="friend-name">

                                ${escapeHtml(
                                    otherUser.display_name ||
                                    "Student"
                                )}

                            </div>


                            <div class="friend-username">

                                ${
                                    otherUser.username
                                        ? "@" +
                                          escapeHtml(
                                              otherUser.username
                                          )
                                        : ""
                                }

                            </div>

                        </div>

                    </div>


                    <div class="friend-status">

                        <div class="friend-status-line offline">

                            Request sent

                        </div>

                    </div>

                `;

            }


            friendRequestsList.appendChild(
                card
            );

        }
    );

}


// ============================================================
// ACCEPT / DECLINE REQUEST
// ============================================================

friendRequestsList.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const requestId =
            button.dataset.requestId;


        if (!requestId) {
            return;
        }


        button.disabled =
            true;


        if (
            button.classList.contains(
                "accept-request"
            )
        ) {

            const {
                error
            } =
                await supabaseClient
                    .rpc(
                        "accept_friend_request",
                        {
                            request_id:
                                requestId
                        }
                    );


            if (error) {

                console.error(
                    "Could not accept request:",
                    error
                );

                button.disabled =
                    false;

                return;
            }

        }


        if (
            button.classList.contains(
                "decline-request"
            )
        ) {

            const {
                error
            } =
                await supabaseClient
                    .rpc(
                        "decline_friend_request",
                        {
                            request_id:
                                requestId
                        }
                    );


            if (error) {

                console.error(
                    "Could not decline request:",
                    error
                );

                button.disabled =
                    false;

                return;
            }

        }


        await loadFriendRequests();

        await loadFriends();

    }
);


// ============================================================
// LOAD FRIENDS
// ============================================================

async function loadFriends() {

    if (!currentUser) {
        return;
    }


    const {
        data: friendships,
        error
    } =
        await supabaseClient
            .from("friendships")
            .select(
                "user_a,user_b,created_at"
            )
            .or(
                `user_a.eq.${currentUser.id},user_b.eq.${currentUser.id}`
            );


    if (error) {

        console.error(
            "Could not load friendships:",
            error
        );

        return;
    }


    if (
        !friendships ||
        friendships.length === 0
    ) {

        friendsList.innerHTML = `

            <div class="friends-empty">

                You haven't added any friends yet.

            </div>

        `;

        return;
    }


    const friendIds =
        friendships.map(
            friendship =>

                friendship.user_a ===
                currentUser.id

                    ? friendship.user_b

                    : friendship.user_a
        );


    const {
        data: profiles,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id,display_name,username,friend_code"
            )
            .in(
                "id",
                friendIds
            );


    if (profileError) {

        console.error(
            "Could not load friend profiles:",
            profileError
        );

        return;
    }


    friendsList.innerHTML =
        "";


    profiles.forEach(
        friend => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "friend-card";


            const initial =
                (
                    friend.display_name ||
                    "S"
                )
                .charAt(0)
                .toUpperCase();


            card.innerHTML = `

                <div class="friend-main">

                    <div class="friend-avatar">

                        ${escapeHtml(
                            initial
                        )}

                    </div>


                    <div>

                        <div class="friend-name">

                            ${escapeHtml(
                                friend.display_name ||
                                "Student"
                            )}

                        </div>


                        <div class="friend-username">

                            ${
                                friend.username
                                    ? "@" +
                                      escapeHtml(
                                          friend.username
                                      )
                                    : ""
                            }

                        </div>

                    </div>

                </div>


                <div class="friend-status">

                    <div
                        class="friend-status-line offline"
                    >
                        Offline
                    </div>


                    <div
                        class="friend-status-detail"
                    >
                        Live status coming next
                    </div>

                </div>

            `;


            friendsList.appendChild(
                card
            );

        }
    );

}


// ============================================================
// LOAD EVERYTHING FRIEND-RELATED
// ============================================================

async function loadFriendsPage() {

    if (!currentUser) {
        return;
    }


    await loadMyProfile();

    await loadFriendRequests();

    await loadFriends();

}


// ============================================================
// HOOK FRIENDS INTO APP BOOT
// ============================================================

const originalBootCloudApp =
    bootCloudApp;


bootCloudApp =
    async function(sessionUser = null) {

        await originalBootCloudApp(
            sessionUser
        );


        if (currentUser) {

            /*
             * Load the profile and pending requests here.
             *
             * The actual friend list is owned by
             * friends-live.js so that live status and
             * statistics aren't overwritten by the older
             * friend renderer.
             */

            await loadMyProfile();

            await loadFriendRequests();

        }

    };