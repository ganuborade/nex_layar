from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Flask Running Successfully"

@app.route("/contact", methods=["POST"])
def contact():

    print("CONTACT ROUTE HIT")

    data = request.get_json()

    print("Received Data:", data)

    return jsonify({
        "success": True,
        "message": "Data Received Successfully"
    })

if __name__ == "__main__":
    app.run(debug=True)