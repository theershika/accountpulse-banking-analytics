def test_regular_user_cannot_access_admin_summary(registered_client):
    response = registered_client.get("/api/admin/summary")
    assert response.status_code == 403
    assert response.get_json()["error"] == "Administrator access required."


def test_admin_can_access_summary(client, create_user):
    create_user("admin@example.test", name="Admin", role="admin")
    assert client.post("/api/auth/login", json={"email": "admin@example.test", "password": "secure-password-123"}).status_code == 200

    response = client.get("/api/admin/summary")
    assert response.status_code == 200
    assert response.get_json() == {"users": 1, "accounts": 1, "totalBalance": 0.0, "transactions": 0}
