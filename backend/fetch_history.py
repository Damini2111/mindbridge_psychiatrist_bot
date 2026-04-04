from flask import request, jsonify
from db_connection import get_db_connection

@app.route("/history/<int:user_id>", methods=["GET"])
def history(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Database connection failed"}), 500
        
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT score, source, logged_at
            FROM stress_logs
            WHERE user_id = %s
            ORDER BY logged_at DESC
            """,
            (user_id,)
        )

        rows = cursor.fetchall()
        
        history_data = [
            {
                "stress_level": r[0],
                "source": r[1],
                "time": str(r[2])
            }
            for r in rows
        ]

        return jsonify(history_data)
    except Exception as e:
        print("❌ Error fetching history:", e)
        return jsonify({"message": "Internal server error"}), 500
    finally:
        cursor.close()
        conn.close()
