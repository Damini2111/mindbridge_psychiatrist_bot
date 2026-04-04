import bcrypt
from flask import request, jsonify
from db_connection import get_db_connection

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
        
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, password_hash FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()

        if user and bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            return jsonify({"message": "Login successful", "user_id": user[0]})
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    except Exception as e:
        print("❌ Error during login:", e)
        return jsonify({"message": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
