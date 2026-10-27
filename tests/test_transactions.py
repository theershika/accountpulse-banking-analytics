import pytest


def transaction(client, kind, amount, **extra):
    return client.post(f"/api/transactions/{kind}", json={"amount": amount, **extra})


def test_simulated_deposit_withdrawal_balance_and_history(registered_client):
    assert transaction(registered_client, "deposit", "1250.50", category="Salary").status_code == 201
    withdrawal = transaction(registered_client, "withdrawal", "250.25", category="Food")

    assert withdrawal.status_code == 201
    assert registered_client.get("/api/me").get_json()["checkingBalance"] == pytest.approx(1000.25)
    history = registered_client.get("/api/transactions").get_json()
    assert len(history) == 2
    assert {item["type"] for item in history} == {"deposit", "withdrawal"}
    assert {item["category"] for item in history} == {"Salary", "Food"}


@pytest.mark.parametrize("amount", [0, "0", -1, "-5.00", "not-money", "NaN", "Infinity", None])
def test_zero_negative_and_invalid_transaction_amounts_are_rejected(registered_client, amount):
    response = transaction(registered_client, "deposit", amount)
    assert response.status_code == 400
    assert registered_client.get("/api/me").get_json()["checkingBalance"] == 0


def test_withdrawal_rejects_insufficient_balance(registered_client):
    response = transaction(registered_client, "withdrawal", 1)
    assert response.status_code == 422
    assert response.get_json()["error"] == "Insufficient simulated balance."
    assert registered_client.get("/api/transactions").get_json() == []


def test_invalid_transaction_type_is_rejected(registered_client):
    assert transaction(registered_client, "purchase", 20).status_code == 400


def test_account_and_transaction_history_are_isolated(client, app, create_user):
    first = client
    first.post("/api/auth/register", json={"name": "Alice", "email": "alice@example.test", "password": "secure-password-123"})
    transaction(first, "deposit", 100)
    _, bob_number = create_user("bob@example.test", name="Bob")

    second = app.test_client()
    assert second.post("/api/auth/login", json={"email": "bob@example.test", "password": "secure-password-123"}).status_code == 200
    assert second.get("/api/me").get_json()["checkingBalance"] == 0
    assert second.get("/api/transactions").get_json() == []
    assert transaction(second, "deposit", 40).status_code == 201
    assert first.get("/api/me").get_json()["checkingBalance"] == 100
    assert bob_number != first.get("/api/me").get_json()["accountNumber"]


def test_transfer_updates_each_account_with_private_history(client, app, create_user):
    client.post("/api/auth/register", json={"name": "Alice", "email": "alice@example.test", "password": "secure-password-123"})
    transaction(client, "deposit", 100)
    _, recipient_number = create_user("bob@example.test")

    assert client.post("/api/transfers", json={"accountNumber": recipient_number, "amount": 35}).status_code == 201
    bob = app.test_client()
    bob.post("/api/auth/login", json={"email": "bob@example.test", "password": "secure-password-123"})
    assert client.get("/api/me").get_json()["checkingBalance"] == 65
    assert bob.get("/api/me").get_json()["checkingBalance"] == 35
    assert [row["type"] for row in bob.get("/api/transactions").get_json()] == ["transfer_in"]
