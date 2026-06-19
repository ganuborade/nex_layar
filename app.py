from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Database Connection
try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Roor@123",   # Change if needed
        database="portfolio_db"
    )
    print("Database Connected Successfully!")
except Exception as e:
    print("Database Error:", e)


@app.route("/")
def home():
    return "Flask Running Successfully"


@app.route("/contact", methods=["POST"])
def contact():
    try:
        print("Contact Route Called")

        data = request.get_json()

        print("Received Data:", data)

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

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
        })


if __name__ == "__main__":
    app.run(debug=True)