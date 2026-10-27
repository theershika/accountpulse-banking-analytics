def register(client, email="person@example.test", name="Person", password="secure-password-123"):
    return client.post("/api/auth/register", json={"email": email, "name": name, "password": password})


def test_registration_creates_logged_in_zero_balance_account(client):
    response = register(client)

    assert response.status_code == 201
    data = response.get_json()
    assert data["email"] == "person@example.test"
    assert data["checkingBalance"] == 0
    assert data["accountNumber"].startswith("AP")
    assert client.get("/api/me").status_code == 200


def test_registration_rejects_invalid_input_and_duplicate_email(client):
    assert register(client, password="short").status_code == 400
    assert register(client).status_code == 201
    assert register(client).status_code == 409


def test_login_logout_and_authentication_required(client):
    register(client)
    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/me").status_code == 401
    assert client.post("/api/auth/login", json={"email": "person@example.test", "password": "wrong"}).status_code == 401

    response = client.post("/api/auth/login", json={"email": "person@example.test", "password": "secure-password-123"})
    assert response.status_code == 200
    assert response.get_json()["email"] == "person@example.test"


def test_protected_transaction_routes_require_authentication(client):
    assert client.get("/api/transactions").status_code == 401
    assert client.post("/api/transactions/deposit", json={"amount": 10}).status_code == 401
