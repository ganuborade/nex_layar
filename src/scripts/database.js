console.log("database.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
            if (window.showToast) {
                window.showToast("All fields are required!", "error");
            } else {
                alert("All fields are required!");
            }
            return;
        }

        // Show loading state
        let loadingToast;
        if (window.showToast) {
            loadingToast = window.showToast("Sending your message...", "loading");
        }

        const submitBtn = form.querySelector("button[type='submit']");
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }

        const data = { name, email, message };

        try {
            const response = await apiFetch("/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (loadingToast) loadingToast.remove();

            if (response.ok && result.success) {
                if (window.showToast) {
                    window.showToast(result.message || "Message sent successfully!", "success");
                } else {
                    alert(result.message || "Message sent successfully!");
                }
                form.reset();

                // Refresh admin messages if the admin view exists
                if (window.refreshAdminMessages) {
                    window.refreshAdminMessages();
                }
            } else {
                throw new Error(result.message || "Failed to send message.");
            }
        } catch (error) {
            if (loadingToast) loadingToast.remove();
            console.error("Contact Form Error:", error);
            const errMsg = error.message || "Could not reach the server. Please try again.";
            if (window.showToast) {
                window.showToast(errMsg, "error");
            } else {
                alert(errMsg);
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    });
});
