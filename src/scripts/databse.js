console.log("database.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value
        };

        console.log("Sending:", data);

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            console.log(result);

            alert(result.message);

        } catch (error) {

            console.error(error);

            alert("Error sending data");
        }

    });

});