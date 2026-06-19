console.log("database.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Message:", message);

        const data = {
            name,
            email,
            message
        };

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

            form.reset();

        } catch (error) {

            console.error(error);

            alert("Error sending data");
        }

    });

});