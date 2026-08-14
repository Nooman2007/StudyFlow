// ============================================================
// StudyFlow - Live Friends + Friend Statistics
// ============================================================


let liveFriendsChannel = null;

let liveFriendsTimer = null;

let liveFriendStatsTimer = null;


// ============================================================
// FORMAT TIME
// ============================================================

function formatLiveDuration(
    startedAt
) {

    const start =
        new Date(
            startedAt
        ).getTime();


    const elapsed =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    start
                ) / 1000
            )
        );


    return formatSecondsForFriend(
        elapsed
    );
}


function formatSecondsForFriend(
    totalSeconds
) {

    totalSeconds =
        Math.max(
            0,
            Math.floor(
                Number(
                    totalSeconds
                ) || 0
            )
        );


    const hours =
        Math.floor(
            totalSeconds / 3600
        );


    const minutes =
        Math.floor(
            (
                totalSeconds % 3600
            ) / 60
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
// GET LOCAL DAY/WEEK START
// ============================================================

function getLocalStartOfToday() {

    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


function getLocalStartOfWeek() {

    const date =
        getLocalStartOfToday();


    const day =
        date.getDay();


    /*
     * Monday = 0
     * Sunday = 6
     */

    const mondayOffset =
        day === 0
            ? 6
            : day - 1;


    date.setDate(
        date.getDate() -
        mondayOffset
    );


    return date;
}


// ============================================================
// FRIEND IDS
// ============================================================

async function getFriendIds() {

    if (!currentUser) {
        return [];
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("friendships")
            .select(
                "user_a,user_b"
            )
            .or(
                `user_a.eq.${currentUser.id},user_b.eq.${currentUser.id}`
            );


    if (error) {

        console.error(
            "Could not load friendships:",
            error
        );

        return [];
    }


    return (
        data || []
    ).map(
        friendship =>

            friendship.user_a ===
            currentUser.id

                ? friendship.user_b

                : friendship.user_a
    );

}


// ============================================================
// FRIEND PROFILES
// ============================================================

async function getFriendProfiles(
    friendIds
) {

    if (
        friendIds.length === 0
    ) {

        return [];
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
            .in(
                "id",
                friendIds
            );


    if (error) {

        console.error(
            "Could not load friend profiles:",
            error
        );

        return [];
    }


    return data || [];

}


// ============================================================
// FRIEND ACTIVE SESSIONS
// ============================================================

async function getFriendActiveSessions(
    friendIds
) {

    if (
        friendIds.length === 0
    ) {

        return [];
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("active_sessions")
            .select(
                [
                    "user_id",
                    "subject_id",
                    "subject_name",
                    "status",
                    "started_at",
                    "updated_at"
                ].join(",")
            )
            .in(
                "user_id",
                friendIds
            );


    if (error) {

        console.error(
            "Could not load active sessions:",
            error
        );

        return [];
    }


    return data || [];

}


// ============================================================
// FRIEND STATISTICS
// ============================================================

async function getFriendStats(
    friendId
) {

    const todayStart =
        getLocalStartOfToday()
            .toISOString();


    const weekStart =
        getLocalStartOfWeek()
            .toISOString();


    const {
        data,
        error
    } =
        await supabaseClient
            .rpc(
                "get_friend_study_stats",
                {
                    friend_user_id:
                        friendId,

                    today_start:
                        todayStart,

                    week_start:
                        weekStart
                }
            );


    if (error) {

        console.error(
            "Could not load friend stats:",
            error
        );

        return {

            today_seconds:
                0,

            week_seconds:
                0,

            subject_breakdown:
                []

        };

    }


    /*
     * RPC table functions return an array,
     * with one result row.
     */

    return (
        data &&
        data.length > 0
    )
        ? data[0]
        : {

            today_seconds:
                0,

            week_seconds:
                0,

            subject_breakdown:
                []

        };

}


// ============================================================
// RENDER FRIENDS
// ============================================================

async function refreshLiveFriends() {

    if (!currentUser) {
        return;
    }


    const friendsList =
        document.querySelector(
            "#friends-list"
        );

    const dashboardFriendsList =
        document.querySelector(
            "#dashboard-friends-list"
        );


    // Nothing to render anywhere
    if (
        !friendsList &&
        !dashboardFriendsList
    ) {
        return;
    }


    const friendIds =
        await getFriendIds();


    // ==========================================
    // NO FRIENDS
    // ==========================================

    if (
        friendIds.length === 0
    ) {

        if (friendsList) {

            friendsList.innerHTML = `

                <div class="friends-empty">
                    You haven't added any friends yet.
                </div>

            `;

        }


        if (dashboardFriendsList) {

            dashboardFriendsList.innerHTML = `

                <div class="friends-empty">
                    No friends yet.
                </div>

            `;

        }

        return;
    }


    // ==========================================
    // LOAD FRIEND DATA
    // ==========================================

    const profiles =
        await getFriendProfiles(
            friendIds
        );


    const activeSessions =
        await getFriendActiveSessions(
            friendIds
        );


    const activeMap =
        Object.fromEntries(
            activeSessions.map(
                session => [
                    session.user_id,
                    session
                ]
            )
        );


    /*
     * Load all friend statistics
     * in parallel.
     */

    const statsEntries =
        await Promise.all(
            friendIds.map(
                async friendId => {

                    return [

                        friendId,

                        await getFriendStats(
                            friendId
                        )

                    ];

                }
            )
        );


    const statsMap =
        Object.fromEntries(
            statsEntries
        );


    // Clear both containers
    if (friendsList) {
        friendsList.innerHTML = "";
    }

    if (dashboardFriendsList) {
        dashboardFriendsList.innerHTML = "";
    }


    // ==========================================
    // RENDER EACH FRIEND
    // ==========================================

    profiles.forEach(
        friend => {

            const session =
                activeMap[
                    friend.id
                ];


            const stats =
                statsMap[
                    friend.id
                ] || {

                    today_seconds:
                        0,

                    week_seconds:
                        0,

                    subject_breakdown:
                        []

                };


            const isActive =
                session &&
                session.status ===
                    "active" &&
                session.started_at;


            const initial =
                (
                    friend.display_name ||
                    "S"
                )
                    .charAt(0)
                    .toUpperCase();


            // ==================================
            // EXISTING FRIENDS PAGE CARD
            // ==================================

            if (friendsList) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "friend-card";


                card.dataset.friendId =
                    friend.id;


                let subjectBreakdown =
                    [];


                try {

                    subjectBreakdown =
                        Array.isArray(
                            stats.subject_breakdown
                        )

                            ? stats.subject_breakdown

                            : JSON.parse(
                                stats.subject_breakdown ||
                                "[]"
                            );

                } catch {

                    subjectBreakdown =
                        [];

                }


                const topSubjects =
                    subjectBreakdown
                        .slice(
                            0,
                            3
                        )
                        .map(
                            item =>

                                `
                                    <span>
                                        ${escapeHtml(
                                            item.subject_name
                                        )}
                                        ${formatSecondsForFriend(
                                            item.seconds
                                        )}
                                    </span>
                                `
                        )
                        .join(
                            " • "
                        );


                if (isActive) {

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
                                class="friend-status-line online"
                            >
                                🟢 Studying
                            </div>


                            <div
                                class="friend-status-detail"
                            >
                                ${escapeHtml(
                                    session.subject_name ||
                                    "Study session"
                                )}
                            </div>


                            <div
                                class="friend-status-detail live-duration"
                                data-started-at="${session.started_at}"
                            >
                                ${formatLiveDuration(
                                    session.started_at
                                )}
                            </div>

                        </div>


                        <div class="friend-stats">

                            <div class="friend-stat">

                                <div
                                    class="friend-stat-label"
                                >
                                    Today
                                </div>


                                <div
                                    class="friend-stat-value"
                                >
                                    ${formatSecondsForFriend(
                                        stats.today_seconds
                                    )}
                                </div>

                            </div>


                            <div class="friend-stat">

                                <div
                                    class="friend-stat-label"
                                >
                                    This week
                                </div>


                                <div
                                    class="friend-stat-value"
                                >
                                    ${formatSecondsForFriend(
                                        stats.week_seconds
                                    )}
                                </div>

                            </div>

                        </div>


                        ${
                            topSubjects
                                ? `

                                    <div
                                        class="friend-subject-breakdown"
                                    >
                                        ${topSubjects}
                                    </div>

                                  `
                                : ""
                        }

                    `;

                } else {

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
                                ⚪ Offline
                            </div>


                            <div
                                class="friend-status-detail"
                            >
                                Not studying
                            </div>

                        </div>


                        <div class="friend-stats">

                            <div class="friend-stat">

                                <div
                                    class="friend-stat-label"
                                >
                                    Today
                                </div>


                                <div
                                    class="friend-stat-value"
                                >
                                    ${formatSecondsForFriend(
                                        stats.today_seconds
                                    )}
                                </div>

                            </div>


                            <div class="friend-stat">

                                <div
                                    class="friend-stat-label"
                                >
                                    This week
                                </div>


                                <div
                                    class="friend-stat-value"
                                >
                                    ${formatSecondsForFriend(
                                        stats.week_seconds
                                    )}
                                </div>

                            </div>

                        </div>


                        ${
                            topSubjects
                                ? `

                                    <div
                                        class="friend-subject-breakdown"
                                    >
                                        ${topSubjects}
                                    </div>

                                  `
                                : ""
                        }

                    `;

                }


                friendsList.appendChild(
                    card
                );

            }



            // ==================================
            // DASHBOARD FRIEND CARD
            // ==================================

            if (dashboardFriendsList) {

                const dashboardCard =
                    document.createElement(
                        "div"
                    );


                dashboardCard.className =
                    "dashboard-friend-card";


                dashboardCard.dataset.friendId =
                    friend.id;


                if (isActive) {

                    dashboardCard.innerHTML = `

                        <div class="dashboard-friend-header">

                            <div class="dashboard-friend-avatar">
                                ${escapeHtml(
                                    initial
                                )}
                            </div>


                            <div class="dashboard-friend-identity">

                                <div class="dashboard-friend-name">
                                    ${escapeHtml(
                                        friend.display_name ||
                                        "Student"
                                    )}
                                </div>


                                <div class="dashboard-friend-username">

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


                        <div class="dashboard-friend-status online">

                            🟢 Studying

                        </div>


                        <div class="dashboard-friend-subject">

                            ${escapeHtml(
                                session.subject_name ||
                                "Study session"
                            )}

                        </div>


                        <div
                            class="dashboard-friend-live-duration live-duration"
                            data-started-at="${session.started_at}"
                        >
                            ${formatLiveDuration(
                                session.started_at
                            )}
                        </div>


                        <div class="dashboard-friend-times">

                            <div class="dashboard-friend-time">

                                <div class="dashboard-friend-time-label">
                                    Today
                                </div>

                                <div class="dashboard-friend-time-value">
                                    ${formatSecondsForFriend(
                                        stats.today_seconds
                                    )}
                                </div>

                            </div>


                            <div class="dashboard-friend-time">

                                <div class="dashboard-friend-time-label">
                                    This week
                                </div>

                                <div class="dashboard-friend-time-value">
                                    ${formatSecondsForFriend(
                                        stats.week_seconds
                                    )}
                                </div>

                            </div>

                        </div>

                    `;

                } else {

                    dashboardCard.innerHTML = `

                        <div class="dashboard-friend-header">

                            <div class="dashboard-friend-avatar">
                                ${escapeHtml(
                                    initial
                                )}
                            </div>


                            <div class="dashboard-friend-identity">

                                <div class="dashboard-friend-name">
                                    ${escapeHtml(
                                        friend.display_name ||
                                        "Student"
                                    )}
                                </div>


                                <div class="dashboard-friend-username">

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


                        <div class="dashboard-friend-status offline">

                            ⚪ Offline

                        </div>


                        <div class="dashboard-friend-subject">

                            Not studying

                        </div>


                        <div class="dashboard-friend-times">

                            <div class="dashboard-friend-time">

                                <div class="dashboard-friend-time-label">
                                    Today
                                </div>

                                <div class="dashboard-friend-time-value">
                                    ${formatSecondsForFriend(
                                        stats.today_seconds
                                    )}
                                </div>

                            </div>


                            <div class="dashboard-friend-time">

                                <div class="dashboard-friend-time-label">
                                    This week
                                </div>

                                <div class="dashboard-friend-time-value">
                                    ${formatSecondsForFriend(
                                        stats.week_seconds
                                    )}
                                </div>

                            </div>

                        </div>

                    `;

                }


                dashboardFriendsList.appendChild(
                    dashboardCard
                );

            }

        }
    );

}


// ============================================================
// UPDATE LIVE TIMERS
// ============================================================

function updateLiveFriendTimers() {

    document
        .querySelectorAll(
            ".live-duration"
        )
        .forEach(
            element => {

                const startedAt =
                    element.dataset.startedAt;


                if (startedAt) {

                    element.textContent =
                        formatLiveDuration(
                            startedAt
                        );

                }

            }
        );

}


// ============================================================
// REALTIME
// ============================================================

function startLiveFriendsRealtime() {

    if (!currentUser) {
        return;
    }


    if (
        liveFriendsChannel
    ) {

        supabaseClient.removeChannel(
            liveFriendsChannel
        );

        liveFriendsChannel =
            null;

    }


    liveFriendsChannel =
        supabaseClient
            .channel(
                "studyflow-live-sessions-" +
                currentUser.id
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "active_sessions"
                },
                () => {

                    refreshLiveFriends();

                }
            )
            .subscribe(
                (
                    status,
                    error
                ) => {

                    if (
                        status ===
                            "CHANNEL_ERROR" ||
                        status ===
                            "TIMED_OUT"
                    ) {

                        console.error(
                            "Live Friends Realtime error:",
                            status,
                            error
                        );

                    }


                    if (
                        status ===
                        "SUBSCRIBED"
                    ) {

                        console.log(
                            "StudyFlow live friends connected."
                        );

                    }

                }
            );


    clearInterval(
        liveFriendsTimer
    );


    liveFriendsTimer =
        setInterval(
            updateLiveFriendTimers,
            1000
        );


    /*
     * Refresh stats periodically.
     * Stats don't need a database update every second.
     */

    clearInterval(
        liveFriendStatsTimer
    );


    liveFriendStatsTimer =
        setInterval(
            refreshLiveFriends,
            30000
        );

}


// ============================================================
// STOP REALTIME
// ============================================================

function stopLiveFriendsRealtime() {

    clearInterval(
        liveFriendsTimer
    );

    clearInterval(
        liveFriendStatsTimer
    );


    liveFriendsTimer =
        null;

    liveFriendStatsTimer =
        null;


    if (
        liveFriendsChannel
    ) {

        supabaseClient.removeChannel(
            liveFriendsChannel
        );

        liveFriendsChannel =
            null;

    }

}


// ============================================================
// AUTH LISTENER
// ============================================================

supabaseClient.auth.onAuthStateChange(
    (
        event,
        session
    ) => {

        if (
            event ===
                "SIGNED_IN" &&
            session?.user
        ) {

            setTimeout(
                async () => {

                    await refreshLiveFriends();

                    startLiveFriendsRealtime();

                },
                500
            );

        }


        if (
            event ===
            "SIGNED_OUT"
        ) {

            stopLiveFriendsRealtime();

        }

    }
);


// ============================================================
// INITIAL START
// ============================================================

setTimeout(
    async () => {

        if (
            currentUser
        ) {

            await refreshLiveFriends();

            startLiveFriendsRealtime();

        }

    },
    1000
);