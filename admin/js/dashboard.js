
document.addEventListener("DOMContentLoaded", async () => {

    const message = document.getElementById("dashboardMessage");
    const adminEmail = document.getElementById("adminEmail");

    function showMessage(text, type = "error") {
        message.textContent = text;
        message.className = `message ${type}`;
    }

    // Check Supabase configuration
    if (typeof supabaseClient === "undefined") {
        showMessage("Supabase configuration is missing.");
        return;
    }

    try {

        // 1. Verify login session
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        if (!session) {
            window.location.replace("index.html");
            return;
        }

        const user = session.user;

        // 2. Verify administrator access
        const { data: admin, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", user.id)
                .maybeSingle();

        if (adminError) {
            console.error("Admin verification failed:", adminError);
            showMessage(
                "Unable to verify administrator access. Please check database permissions."
            );
            return;
        }

        if (!admin) {
            await supabaseClient.auth.signOut();
            window.location.replace("index.html");
            return;
        }

        // 3. Display administrator information
        adminEmail.textContent = user.email || "Administrator";

        document.getElementById("year").textContent =
            new Date().getFullYear();

        // 4. Enable dashboard navigation
        const navButtons = document.querySelectorAll(".nav-item");
        const sections = document.querySelectorAll(".content-section");

        navButtons.forEach(button => {

            button.addEventListener("click", () => {

                const target = button.dataset.section;

                navButtons.forEach(item =>
                    item.classList.remove("active")
                );

                sections.forEach(section =>
                    section.classList.remove("active")
                );

                button.classList.add("active");

                const selectedSection =
                    document.getElementById(target);

                if (selectedSection) {
                    selectedSection.classList.add("active");
                }
            });

        });

        // 5. Sign out
        document.getElementById("logoutButton")
            .addEventListener("click", async () => {

                const { error } =
                    await supabaseClient.auth.signOut();

                if (error) {
                    showMessage("Unable to sign out: " + error.message);
                    return;
                }

                window.location.replace("index.html");
            });

        showMessage("Dashboard loaded successfully.", "success");

        console.log("Administrator authenticated:", user.email);

    } catch (error) {

        console.error("Dashboard initialization error:", error);

        showMessage(
            "Dashboard initialization failed: " + error.message
        );

    }

});
