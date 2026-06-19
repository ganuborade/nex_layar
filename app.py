import os
import sqlite3
from flask import Flask, request, jsonify

# Try to import mysql.connector to check if MySQL library is installed
try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False
    print("Warning: mysql-connector-python is not installed. SQLite will be used as a fallback database.")

app = Flask(__name__, static_folder='.', static_url_path='')

# Database Configuration
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "Roor@123")  # Default password from project
DB_NAME = os.environ.get("DB_NAME", "portfolio_db")

DB_TYPE = "sqlite" # Default to sqlite, will set to mysql if validation succeeds

def init_db():
    """Initializes the database and tables. Tries MySQL first, falls back to SQLite."""
    global DB_TYPE
    
    # Try MySQL if available
    if MYSQL_AVAILABLE:
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
            # Create contacts table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            # Create visitors table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            conn.commit()
            cursor.close()
            conn.close()
            print("Connected to MySQL Successfully! Database: portfolio_db, Tables: contacts, visitors")
            DB_TYPE = "mysql"
            return True
        except Exception as e:
            print(f"MySQL connection/schema setup failed (using SQLite fallback). Error: {e}")
            
    # Fallback SQLite setup
    try:
        conn = sqlite3.connect("portfolio.db")
        cursor = conn.cursor()
        # Create contacts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        # Create visitors table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT NOT NULL,
            visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
        cursor.close()
        conn.close()
        print("Connected to SQLite database successfully! Database file: portfolio.db, Tables: contacts, visitors")
        DB_TYPE = "sqlite"
        return True
    except Exception as e:
        print("SQLite connection/schema setup failed:", e)
        return False


# Initialize database at startup
init_db()

def get_db_connection():
    """Create a new database connection depending on DB_TYPE."""
    if DB_TYPE == "mysql":
        return mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
    else:
        return sqlite3.connect("portfolio.db")

@app.after_request
def add_cors_headers(response):
    """Injects CORS headers for cross-origin frontend requests."""
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

def check_admin_auth():
    """Checks the Authorization header to verify the admin password."""
    auth_header = request.headers.get("Authorization")
    if auth_header == "Tiger123" or auth_header == "Bearer Tiger123":
        return True
    return False

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/contact", methods=["POST", "OPTIONS"])
@app.route("/api/contact", methods=["POST", "OPTIONS"])
def contact():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    try:
        # Re-verify DB status
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

        # Handle parameterized query placeholder differences
        placeholder = "%s" if DB_TYPE == "mysql" else "?"
        sql = f"""
        INSERT INTO contacts(name, email, message)
        VALUES({placeholder}, {placeholder}, {placeholder})
        """
        values = (name, email, message)

        cursor.execute(sql, values)
        conn.commit()
        cursor.close()
        conn.close()

        print(f"Data Inserted Successfully into {DB_TYPE.upper()}")

        return jsonify({
            "success": True,
            "message": "Message Sent Successfully"
        })

    except Exception as e:
        print("Error in /contact route:", e)
        return jsonify({
            "success": False,
            "message": f"Database operation failed: {str(e)}"
        }), 500

@app.route("/api/messages", methods=["GET", "OPTIONS"])
def get_messages():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized access to messages"}), 401

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
                if hasattr(msg["created_at"], "strftime"):
                    msg["created_at"] = msg["created_at"].strftime("%Y-%m-%d %H:%M:%S")
                else:
                    msg["created_at"] = str(msg["created_at"])

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

    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized access to messages"}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        placeholder = "%s" if DB_TYPE == "mysql" else "?"
        cursor.execute(f"DELETE FROM contacts WHERE id = {placeholder}", (msg_id,))
        conn.commit()
        
        cursor.close()
        conn.close()

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

@app.route("/api/visit", methods=["POST", "OPTIONS"])
def record_visit():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    try:
        init_db()
        # Resolve real client IP address (taking proxies into account)
        ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip_address and "," in ip_address:
            ip_address = ip_address.split(",")[0].strip()

        conn = get_db_connection()
        cursor = conn.cursor()
        
        placeholder = "%s" if DB_TYPE == "mysql" else "?"
        cursor.execute(f"INSERT INTO visitors (ip_address) VALUES ({placeholder})", (ip_address,))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True})
    except Exception as e:
        print("Error in /api/visit route:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/public/stats", methods=["GET", "OPTIONS"])
def get_public_stats():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    try:
        init_db()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM visitors")
        total_visits = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT ip_address) FROM visitors")
        unique_visitors = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "total_visits": total_visits,
            "unique_visitors": unique_visitors
        })
    except Exception as e:
        print("Error in /api/public/stats route:", e)
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/stats", methods=["GET", "OPTIONS"])
def get_stats():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    if not check_admin_auth():
        return jsonify({"success": False, "message": "Unauthorized access to visitor statistics"}), 401

    try:
        init_db()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Total page views count
        cursor.execute("SELECT COUNT(*) FROM visitors")
        total_visits = cursor.fetchone()[0]
        
        # 2. Unique visitors count
        cursor.execute("SELECT COUNT(DISTINCT ip_address) FROM visitors")
        unique_visitors = cursor.fetchone()[0]
        
        # 3. List of recent 30 visits
        cursor.execute("SELECT ip_address, visited_at FROM visitors ORDER BY visited_at DESC LIMIT 30")
        columns = [col[0] for col in cursor.description]
        recent_visitors = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        # Format timestamps
        for visitor in recent_visitors:
            if visitor.get("visited_at"):
                if hasattr(visitor["visited_at"], "strftime"):
                    visitor["visited_at"] = visitor["visited_at"].strftime("%Y-%m-%d %H:%M:%S")
                else:
                    visitor["visited_at"] = str(visitor["visited_at"])
                    
        return jsonify({
            "success": True,
            "total_visits": total_visits,
            "unique_visitors": unique_visitors,
            "recent_visitors": recent_visitors
        })
    except Exception as e:
        print("Error in /api/stats route:", e)
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
