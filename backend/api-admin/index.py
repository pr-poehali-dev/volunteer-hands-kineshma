"""
Админ API: управление контентом сайта (животные, новости, волонтёры, благодарности, сборы, настройки).
Авторизация по паролю через заголовок X-Admin-Token.
"""
import json
import os
import base64
import boto3
import uuid
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p21863386_volunteer_hands_kine")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_admin_password(conn):
    cur = conn.cursor()
    cur.execute(f"SELECT value FROM {SCHEMA}.site_settings WHERE key='admin_password'")
    row = cur.fetchone()
    cur.close()
    return row[0] if row else "admin123"


def auth(event, conn):
    token = event.get("headers", {}).get("X-Admin-Token", "")
    return token == get_admin_password(conn)


def resp(data, code=200):
    return {"statusCode": code, "headers": CORS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    route = params.get("route", "")
    conn = get_conn()

    try:
        # Авторизация (логин)
        if method == "POST" and route == "login":
            body = json.loads(event.get("body") or "{}")
            password = body.get("password", "")
            correct = get_admin_password(conn)
            if password == correct:
                return resp({"ok": True, "token": correct})
            return resp({"error": "Неверный пароль"}, 401)

        if not auth(event, conn):
            return resp({"error": "Unauthorized"}, 401)

        cur = conn.cursor()

        # ---- SETTINGS ----
        if route == "settings" and method == "GET":
            cur.execute(f"SELECT key, value FROM {SCHEMA}.site_settings")
            rows = cur.fetchall()
            return resp({r[0]: r[1] for r in rows})

        if route == "settings" and method == "POST":
            body = json.loads(event.get("body") or "{}")
            for k, v in body.items():
                cur.execute(
                    f"INSERT INTO {SCHEMA}.site_settings (key, value, updated_at) VALUES (%s, %s, NOW()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()",
                    (k, str(v))
                )
            conn.commit()
            return resp({"ok": True})

        # ---- UPLOAD IMAGE ----
        if route == "upload" and method == "POST":
            body = json.loads(event.get("body") or "{}")
            file_data = body.get("file", "")
            file_type = body.get("type", "image/jpeg")
            ext = file_type.split("/")[-1].replace("jpeg", "jpg")
            image_bytes = base64.b64decode(file_data)
            filename = f"animals/{uuid.uuid4().hex}.{ext}"
            s3 = boto3.client(
                "s3",
                endpoint_url="https://bucket.poehali.dev",
                aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
            )
            s3.put_object(Bucket="files", Key=filename, Body=image_bytes, ContentType=file_type)
            access_key = os.environ["AWS_ACCESS_KEY_ID"]
            url = f"https://cdn.poehali.dev/projects/{access_key}/files/{filename}"
            return resp({"ok": True, "url": url})

        # ---- ANIMALS ----
        if route == "animals":
            if method == "GET":
                cur.execute(f"SELECT id, name, type, age, status, description, image_url, is_active, sort_order FROM {SCHEMA}.animals ORDER BY sort_order, id")
                cols = ["id", "name", "type", "age", "status", "description", "image_url", "is_active", "sort_order"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.animals (name, type, age, status, description, image_url, sort_order) VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                    (body["name"], body["type"], body["age"], body.get("status","Ищет дом"), body["description"], body["image_url"], body.get("sort_order",0))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"ok": True, "id": new_id})

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                row_id = body["id"]
                cur.execute(
                    f"UPDATE {SCHEMA}.animals SET name=%s, type=%s, age=%s, status=%s, description=%s, image_url=%s, is_active=%s, sort_order=%s WHERE id=%s",
                    (body["name"], body["type"], body["age"], body["status"], body["description"], body["image_url"], body.get("is_active", True), body.get("sort_order", 0), row_id)
                )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.animals WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        # ---- NEWS ----
        if route == "news":
            if method == "GET":
                cur.execute(f"SELECT id, title, content, published_at, is_active, sort_order FROM {SCHEMA}.news ORDER BY published_at DESC, id DESC")
                cols = ["id", "title", "content", "published_at", "is_active", "sort_order"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.news (title, content, published_at) VALUES (%s,%s,%s) RETURNING id",
                    (body["title"], body["content"], body.get("published_at", "NOW()"))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"ok": True, "id": new_id})

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"UPDATE {SCHEMA}.news SET title=%s, content=%s, published_at=%s, is_active=%s WHERE id=%s",
                    (body["title"], body["content"], body.get("published_at"), body.get("is_active", True), body["id"])
                )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.news WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        # ---- VOLUNTEERS ----
        if route == "volunteers":
            if method == "GET":
                cur.execute(f"SELECT id, name, role, since_year, icon, is_active, sort_order FROM {SCHEMA}.volunteers ORDER BY sort_order, id")
                cols = ["id", "name", "role", "since_year", "icon", "is_active", "sort_order"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.volunteers (name, role, since_year, icon, sort_order) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                    (body["name"], body["role"], body["since_year"], body.get("icon","Heart"), body.get("sort_order",0))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"ok": True, "id": new_id})

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"UPDATE {SCHEMA}.volunteers SET name=%s, role=%s, since_year=%s, icon=%s, is_active=%s, sort_order=%s WHERE id=%s",
                    (body["name"], body["role"], body["since_year"], body.get("icon","Heart"), body.get("is_active",True), body.get("sort_order",0), body["id"])
                )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.volunteers WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        # ---- THANKS ----
        if route == "thanks":
            if method == "GET":
                cur.execute(f"SELECT id, name, type, contribution, is_active, sort_order FROM {SCHEMA}.thanks ORDER BY sort_order, id")
                cols = ["id", "name", "type", "contribution", "is_active", "sort_order"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.thanks (name, type, contribution, sort_order) VALUES (%s,%s,%s,%s) RETURNING id",
                    (body["name"], body["type"], body["contribution"], body.get("sort_order",0))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"ok": True, "id": new_id})

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"UPDATE {SCHEMA}.thanks SET name=%s, type=%s, contribution=%s, is_active=%s, sort_order=%s WHERE id=%s",
                    (body["name"], body["type"], body["contribution"], body.get("is_active",True), body.get("sort_order",0), body["id"])
                )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.thanks WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        # ---- DONATIONS ----
        if route == "donations":
            if method == "GET":
                cur.execute(f"SELECT id, title, description, current_amount, target_amount, is_active, sort_order FROM {SCHEMA}.donations ORDER BY sort_order, id")
                cols = ["id", "title", "description", "current_amount", "target_amount", "is_active", "sort_order"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"INSERT INTO {SCHEMA}.donations (title, description, current_amount, target_amount, sort_order) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                    (body["title"], body["description"], body.get("current_amount",0), body["target_amount"], body.get("sort_order",0))
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return resp({"ok": True, "id": new_id})

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                cur.execute(
                    f"UPDATE {SCHEMA}.donations SET title=%s, description=%s, current_amount=%s, target_amount=%s, is_active=%s, sort_order=%s WHERE id=%s",
                    (body["title"], body["description"], body["current_amount"], body["target_amount"], body.get("is_active",True), body.get("sort_order",0), body["id"])
                )
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.donations WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        # ---- CONTACTS (заявки) ----
        if route == "contacts":
            if method == "GET":
                cur.execute(f"SELECT id, name, contact, subject, message, is_read, created_at FROM {SCHEMA}.contact_requests ORDER BY created_at DESC")
                cols = ["id", "name", "contact", "subject", "message", "is_read", "created_at"]
                return resp([dict(zip(cols, r)) for r in cur.fetchall()])

            if method == "PUT":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"UPDATE {SCHEMA}.contact_requests SET is_read=TRUE WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

            if method == "DELETE":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"DELETE FROM {SCHEMA}.contact_requests WHERE id=%s", (body["id"],))
                conn.commit()
                return resp({"ok": True})

        cur.close()
        return resp({"error": "Not found"}, 404)

    finally:
        conn.close()