from flask import request, jsonify
from db_connection import get_db_connection

@app.route("/save_stress", methods=["POST"])
def save_stress():
    data = request.json

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
        
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO stress_logs (user_id, score, source)
            VALUES (%s, %s, %s)
            """,
            (data["user_id"], data["stress_level"], data.get("source", "Manual"))
        )

        conn.commit()
        return jsonify({"message": "Stress record saved"})
    except Exception as e:
        print("❌ Error saving stress record:", e)
        return jsonify({"message": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
