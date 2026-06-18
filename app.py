from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="portfolio_db"
)

@app.route('/contact', methods=['POST'])
def contact():
    data = request.json

    cursor = db.cursor()

    sql = """
    INSERT INTO contacts(name, email, message)
    VALUES (%s, %s, %s)
    """

    values = (
        data['name'],
        data['email'],
        data['message']
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()

    return jsonify({"message": "Message sent successfully!"})

if __name__ == '__main__':
    app.run(debug=True)