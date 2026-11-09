
// ==========================================
// VYOM KARNA STUDIOS - ADMIN AUTHENTICATION
// ==========================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginMessage = document.getElementById("loginMessage");
const forgotPassword = document.getElementById("forgotPassword");

// Display messages
function showMessage(message, type = "error") {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
}

// Show / Hide password
togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "Hide" : "Show";

    togglePassword.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );
});

// Admin login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const loginButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    loginButton.disabled = true;
    loginButton.textContent = "Signing In...";

    showMessage("");

    try {
        // Step 1: Authenticate with Supabase
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        // Step 2: Verify authorised administrator
        const { data: admin, error: adminError } =
            await supabaseClient
                .from("admin_users")
                .select("user_id")
                .eq("user_id", data.user.id)
                .maybeSingle();

        if (adminError) {
            throw adminError;
        }

        // Step 3: Reject unauthorised accounts
        if (!admin) {
            await supabaseClient.auth.signOut();

            showMessage(
                "You are not authorised to access this dashboard."
            );

            return;
        }

        // Step 4: Successful login
        showMessage("Login successful. Redirecting...", "success");

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Login error:", error);

        showMessage(
            error.message || "Login failed. Please try again."
        );

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Sign In";
    }
});

// Forgot password
forgotPassword.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (!email) {
        showMessage("Please enter your registered email address.");
        emailInput.focus();
        return;
    }

    try {
        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(email);

        if (error) {
            throw error;
        }

        showMessage(
            "Password reset instructions have been sent to your email.",
            "success"
        );

    } catch (error) {
        console.error("Password reset error:", error);
        showMessage(error.message);
    }
});
