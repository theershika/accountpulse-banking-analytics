"""Pytest fixtures for an isolated AccountPulse database."""
import importlib
import importlib.machinery
import importlib.util
import os
import sys
import tempfile
from pathlib import Path

import pytest


# This is set before importing app.py, whose module-level application is created
# immediately.  The temporary file is never the application's normal database.
TEST_DB = Path(tempfile.gettempdir()) / "accountpulse_pytest.sqlite"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB.as_posix()}"
os.environ["SECRET_KEY"] = "accountpulse-pytest-secret"
# The managed Windows runner blocks SQLAlchemy's optional C extensions.


def _use_sqlalchemy_python_sources():
    """Avoid optional SQLAlchemy .pyd files blocked by this Windows policy."""
    spec = importlib.util.find_spec("sqlalchemy")
    if not spec or not spec.submodule_search_locations:
        return
    source_only = (
        (importlib.machinery.SourceFileLoader, importlib.machinery.SOURCE_SUFFIXES),
        (importlib.machinery.SourcelessFileLoader, importlib.machinery.BYTECODE_SUFFIXES),
    )
    for root in spec.submodule_search_locations:
        for directory, _, _ in os.walk(root):
            sys.path_importer_cache[directory] = importlib.machinery.FileFinder(directory, *source_only)


_use_sqlalchemy_python_sources()


@pytest.fixture()
def app():
    module = importlib.import_module("app")
    application = module.create_app()
    application.config.update(TESTING=True)

    with application.app_context():
        module.db.drop_all()
        module.db.create_all()

    yield application

    with application.app_context():
        module.db.session.remove()
        module.db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def registered_client(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.test", "password": "secure-password-123"},
    )
    assert response.status_code == 201
    return client


@pytest.fixture()
def create_user(app):
    def factory(email, name="User", password="secure-password-123", role="user"):
        module = importlib.import_module("app")
        with app.app_context():
            customer = module.Customer(
                email=email,
                name=name,
                password_hash=module.generate_password_hash(password),
                role=role,
            )
            module.db.session.add(customer)
            module.db.session.flush()
            account = module.Account(customer_id=customer.id, number=f"AP{1000 + customer.id}")
            module.db.session.add(account)
            module.db.session.commit()
            return customer.id, account.number

    return factory
