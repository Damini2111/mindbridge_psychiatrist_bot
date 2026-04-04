from flask import Flask, request, jsonify
import bcrypt
from db_connection import get_db_connection

app = Flask(__name__)

# ------------------------
# REGISTER API
# ------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    display_name = data.get("name") # Using 'name' from input for compatibility
    email = data.get("email")
    password = data.get("password")

    if not display_name or not email or not password:
        return jsonify({"message": "All fields required"}), 400

    # Hash password with bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
        
    cursor = conn.cursor()

    try:
        # Check existing user
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "User already exists"}), 409

        # Insert user
        cursor.execute(
            "INSERT INTO users (display_name, email, password_hash) VALUES (%s, %s, %s)",
            (display_name, email, hashed_password)
        )
        user_id = cursor.lastrowid

        conn.commit()
        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id
        })
    except Exception as e:
        print("❌ Error during registration:", e)
        return jsonify({"message": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
