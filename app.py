import os
from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# Database Configuration
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "Roor@123")  # Default password from project
DB_NAME = os.environ.get("DB_NAME", "portfolio_db")

def init_db():
    """Initializes the database and tables if they do not exist."""
    try:
        # First connect without specifying database to create it
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        cursor.close()
        conn.close()

        # Connect to actual database and create tables
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("Database Connection & Schema Verified Successfully!")
        return True
    except Exception as e:
        print("Database Connection/Schema Verification Error:", e)
        return False

# Initialize database at startup
init_db()

def get_db_connection():
    """Create a new database connection."""
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )

@app.after_request
def add_cors_headers(response):
    """Injects CORS headers for cross-origin frontend requests."""
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

@app.route("/")
def home():
    return "Flask Running Successfully"

@app.route("/contact", methods=["POST", "OPTIONS"])
def contact():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        # Attempt initialization in case DB was offline during startup
        init_db()

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

        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
        INSERT INTO contacts(name, email, message)
        VALUES(%s, %s, %s)
        """
        values = (name, email, message)

        cursor.execute(sql, values)
        conn.commit()
        cursor.close()
        conn.close()

        print("Data Inserted Successfully")

        return jsonify({
            "success": True,
            "message": "Message Sent Successfully"
        })

    except Exception as e:
        print("Error in /contact route:", e)
        return jsonify({
            "success": False,
            "message": f"Database connection or query failed: {str(e)}"
        }), 500

@app.route("/api/messages", methods=["GET", "OPTIONS"])
def get_messages():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        init_db()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC")
        
        # Map output to dictionaries for compatibility with standard driver outputs
        columns = [col[0] for col in cursor.description]
        messages = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()

        for msg in messages:
            if msg.get("created_at"):
                msg["created_at"] = msg["created_at"].strftime("%Y-%m-%d %H:%M:%S")

        return jsonify({
            "success": True,
            "messages": messages
        })
    except Exception as e:
        print("Error in /api/messages GET route:", e)
        return jsonify({
            "success": False,
            "message": f"Database query failed: {str(e)}"
        }), 500

@app.route("/api/messages/<int:msg_id>", methods=["DELETE", "OPTIONS"])
def delete_message(msg_id):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM contacts WHERE id = %s", (msg_id,))
        conn.commit()
        
        rowcount = cursor.rowcount
        cursor.close()
        conn.close()

        if rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Message not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Message deleted successfully"
        })
    except Exception as e:
        print("Error in /api/messages DELETE route:", e)
        return jsonify({
            "success": False,
            "message": f"Database operation failed: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(debug=True)