"""
Публичный API: получение данных сайта (настройки, животные, новости, волонтёры, благодарности, сборы).
Также принимает заявки с формы обратной связи.
Маршрут передаётся через query-параметр: ?route=settings / animals / news / ...
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p21863386_volunteer_hands_kine")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    route = params.get("route", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        if route == "settings":
            cur.execute(f"SELECT key, value FROM {SCHEMA}.site_settings")
            rows = cur.fetchall()
            data = {r[0]: r[1] for r in rows}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "animals":
            cur.execute(f"SELECT id, name, type, age, status, description, image_url FROM {SCHEMA}.animals WHERE is_active=TRUE ORDER BY sort_order, id")
            cols = ["id", "name", "type", "age", "status", "description", "image_url"]
            data = [dict(zip(cols, r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "news":
            cur.execute(f"SELECT id, title, content, published_at FROM {SCHEMA}.news WHERE is_active=TRUE ORDER BY published_at DESC, id DESC")
            rows = cur.fetchall()
            data = [{"id": r[0], "title": r[1], "content": r[2], "published_at": r[3].strftime("%d %B %Y") if r[3] else ""} for r in rows]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "volunteers":
            cur.execute(f"SELECT id, name, role, since_year, icon FROM {SCHEMA}.volunteers WHERE is_active=TRUE ORDER BY sort_order, id")
            cols = ["id", "name", "role", "since_year", "icon"]
            data = [dict(zip(cols, r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "thanks":
            cur.execute(f"SELECT id, name, type, contribution FROM {SCHEMA}.thanks WHERE is_active=TRUE ORDER BY sort_order, id")
            cols = ["id", "name", "type", "contribution"]
            data = [dict(zip(cols, r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "donations":
            cur.execute(f"SELECT id, title, description, current_amount, target_amount FROM {SCHEMA}.donations WHERE is_active=TRUE ORDER BY sort_order, id")
            cols = ["id", "title", "description", "current_amount", "target_amount"]
            data = [dict(zip(cols, r)) for r in cur.fetchall()]
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(data, ensure_ascii=False)}

        if route == "contact" and method == "POST":
            body = json.loads(event.get("body") or "{}")
            name = body.get("name", "").strip()
            contact = body.get("contact", "").strip()
            subject = body.get("subject", "").strip()
            message = body.get("message", "").strip()
            if not name or not contact or not message:
                return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните обязательные поля"}, ensure_ascii=False)}
            cur.execute(
                f"INSERT INTO {SCHEMA}.contact_requests (name, contact, subject, message) VALUES (%s, %s, %s, %s)",
                (name, contact, subject, message)
            )
            conn.commit()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True}, ensure_ascii=False)}

        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"}, ensure_ascii=False)}

    finally:
        cur.close()
        conn.close()