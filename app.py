from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# Database Connection
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Roor@123",  # Replace with your actual password
        database="portfolio_db"
    )
    print("Database Connected Successfully!")
except Exception as e:
    print("Database Connection Error:", e)
    db = None


@app.route("/")
def home():
    return "Flask Running Successfully"


@app.route("/contact", methods=["POST"])
def contact():
    try:

        data = request.get_json()

        print("Received Data:", data)

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

        if not name or not email or not message:
            return jsonify({
                "success": False,
                "message": "All fields are required"
            }), 400

        cursor = db.cursor()

        sql = """
        INSERT INTO contacts(name, email, message)
        VALUES(%s, %s, %s)
        """

        values = (name, email, message)

        cursor.execute(sql, values)

        db.commit()

        cursor.close()

        print("Data Inserted Successfully")

        return jsonify({
            "success": True,
            "message": "Message Sent Successfully"
        })

    except Exception as e:

        print("Error:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)