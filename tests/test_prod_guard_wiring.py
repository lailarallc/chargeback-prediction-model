"""The prod guard sits in front of every Postgres read in the pipeline.

src/pipeline/db.py connects to DATABASE_URL, which .env points at
localhost:5432 -- a `fly proxy` tunnel to production when one is open. These
tests fake a flyctl listener and assert nothing connects.
"""

import pytest

from src.pipeline import db, prod_guard


@pytest.fixture
def fly_tunnel(monkeypatch):
    seen = []
    monkeypatch.delenv("ALLOW_PROD_DB", raising=False)
    monkeypatch.setenv("DATABASE_URL", "postgresql://localhost:5432/db")
    monkeypatch.setattr(prod_guard, "_listener", lambda port: seen.append(port) or "flyctl")
    monkeypatch.setattr(db.psycopg2, "connect", lambda *a, **kw: pytest.fail("connected"))
    return seen


def test_connection_refuses_fly_tunnel(fly_tunnel):
    with pytest.raises(prod_guard.ProdDatabaseError):
        with db.connection():
            pass
    assert fly_tunnel == [5432]


def test_query_to_df_refuses_fly_tunnel(fly_tunnel):
    with pytest.raises(prod_guard.ProdDatabaseError):
        db.query_to_df("SELECT 1")
