import base64
from datetime import datetime, timezone

from analytics import analyse_transactions


def test_empty_analytics_reports_no_stored_data():
    data = analyse_transactions([])
    assert data["empty"] is True
    assert data["charts"] == {}


def test_pandas_numpy_analysis_monthly_report_and_matplotlib_charts():
    rows = [
        {"amount": 1000, "transaction_date": datetime(2026, 1, 5, tzinfo=timezone.utc), "transaction_type": "deposit", "category": "Income", "account_id": 1},
        {"amount": 120, "transaction_date": datetime(2026, 1, 15, tzinfo=timezone.utc), "transaction_type": "withdrawal", "category": "Food", "account_id": 1},
        {"amount": 80, "transaction_date": datetime(2026, 2, 1, tzinfo=timezone.utc), "transaction_type": "transfer_out", "category": "Bills", "account_id": 1},
    ]
    data = analyse_transactions(rows)

    assert data["empty"] is False
    assert data["summary"]["totalDeposits"] == 1000
    assert data["summary"]["totalWithdrawals"] == 200
    assert data["summary"]["averageTransactionAmount"] == 400
    assert data["summary"]["monthly"] == {"2026-01": 1120, "2026-02": 80}
    for image in data["charts"].values():
        assert base64.b64decode(image).startswith(b"\x89PNG\r\n\x1a\n")


def test_analytics_endpoints_include_monthly_report_and_unusual_flags(registered_client):
    registered_client.post("/api/transactions/deposit", json={"amount": 60000, "category": "Salary"})
    registered_client.post("/api/transactions/withdrawal", json={"amount": 50000, "category": "Purchase"})

    overview = registered_client.get("/api/analytics").get_json()
    detailed = registered_client.get("/api/analytics/full").get_json()
    assert overview["totalDeposits"] == 60000
    assert overview["totalWithdrawals"] == 50000
    assert len(overview["unusual"]) == 2
    assert detailed["summary"]["monthly"]
    assert detailed["summary"]["totalTransactions"] == 2
