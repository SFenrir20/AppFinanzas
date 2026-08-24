from fastapi.testclient import TestClient

from tests.conftest import register_user


def test_expense_and_card_payment_update_balances_transactionally(client: TestClient) -> None:
    headers = register_user(client)
    account = client.post(
        "/accounts", json={"name": "BCP", "currency": "PEN", "balance": "1000.00"}, headers=headers
    ).json()
    card = client.post(
        "/cards",
        json={"name": "Visa", "currency": "PEN", "credit_limit": "500.00", "billing_day": 15},
        headers=headers,
    ).json()

    cash_expense = client.post(
        "/expenses",
        json={
            "description": "Groceries",
            "amount": "100.00",
            "category": "Food",
            "source": "account",
            "bank_account_id": account["id"],
        },
        headers=headers,
    )
    assert cash_expense.status_code == 201

    card_expense = client.post(
        "/expenses",
        json={
            "description": "Shoes",
            "amount": "200.00",
            "category": "Clothes",
            "source": "card",
            "credit_card_id": card["id"],
        },
        headers=headers,
    )
    assert card_expense.status_code == 201

    payment = client.post(
        "/card-payments",
        json={
            "bank_account_id": account["id"],
            "credit_card_id": card["id"],
            "amount": "150.00",
        },
        headers=headers,
    )
    assert payment.status_code == 201

    accounts = client.get("/accounts", headers=headers).json()
    cards = client.get("/cards", headers=headers).json()
    summary = client.get("/summary", headers=headers).json()
    assert accounts[0]["balance"] == "750.00"
    assert cards[0]["current_balance"] == "50.00"
    assert summary["monthly_expense"] == "300.00"
    assert summary["credit_used"] == "50.00"
    assert summary["credit_available"] == "450.00"


def test_user_cannot_spend_from_another_users_account(client: TestClient) -> None:
    owner_headers = register_user(client, "owner@example.com")
    other_headers = register_user(client, "other@example.com")
    account = client.post(
        "/accounts",
        json={"name": "Owner bank", "currency": "PEN", "balance": "300.00"},
        headers=owner_headers,
    ).json()

    response = client.post(
        "/expenses",
        json={
            "description": "Invalid",
            "amount": "50.00",
            "category": "Test",
            "source": "account",
            "bank_account_id": account["id"],
        },
        headers=other_headers,
    )
    assert response.status_code == 404
    assert client.get("/accounts", headers=owner_headers).json()[0]["balance"] == "300.00"


def test_failed_card_payment_rolls_back_balances(client: TestClient) -> None:
    headers = register_user(client)
    account = client.post(
        "/accounts", json={"name": "Wallet", "currency": "PEN", "balance": "20.00"}, headers=headers
    ).json()
    card = client.post(
        "/cards",
        json={"name": "Visa", "currency": "PEN", "credit_limit": "300.00", "billing_day": 10},
        headers=headers,
    ).json()
    assert (
        client.post(
            "/expenses",
            json={
                "description": "Dinner",
                "amount": "50.00",
                "category": "Food",
                "source": "card",
                "credit_card_id": card["id"],
            },
            headers=headers,
        ).status_code
        == 201
    )

    response = client.post(
        "/card-payments",
        json={
            "bank_account_id": account["id"],
            "credit_card_id": card["id"],
            "amount": "30.00",
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert client.get("/accounts", headers=headers).json()[0]["balance"] == "20.00"
    assert client.get("/cards", headers=headers).json()[0]["current_balance"] == "50.00"
