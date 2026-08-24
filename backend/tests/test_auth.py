from fastapi.testclient import TestClient


def test_register_login_and_profile(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "email": "ana@example.com",
            "password": "Password123",
            "currency": "pen",
            "monthly_salary": "4200.00",
        },
    )
    assert response.status_code == 201
    token = response.json()["access_token"]

    me = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ana@example.com"
    assert me.json()["profile"]["currency"] == "PEN"

    login = client.post(
        "/auth/login", json={"email": "ana@example.com", "password": "Password123"}
    )
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"


def test_duplicate_email_is_rejected(client: TestClient) -> None:
    payload = {
        "email": "ana@example.com",
        "password": "Password123",
        "currency": "PEN",
        "monthly_salary": "0.00",
    }
    assert client.post("/auth/register", json=payload).status_code == 201
    assert client.post("/auth/register", json=payload).status_code == 409
