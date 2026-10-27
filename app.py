"""AccountPulse synthetic-banking API. Never connect this application to real money."""
from __future__ import annotations
import os, secrets
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from functools import wraps
from flask import Flask, jsonify, request, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint, func
from werkzeug.security import generate_password_hash, check_password_hash
from analytics import analyse_transactions

db = SQLAlchemy()

class Customer(db.Model):
    id=db.Column(db.Integer, primary_key=True); email=db.Column(db.String(120), unique=True, nullable=False, index=True)
    name=db.Column(db.String(120), nullable=False); password_hash=db.Column(db.String(255), nullable=False)
    role=db.Column(db.String(16), nullable=False, default="user"); created_at=db.Column(db.DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
    account=db.relationship("Account", back_populates="customer", uselist=False, cascade="all,delete-orphan")

class Account(db.Model):
    id=db.Column(db.Integer, primary_key=True); customer_id=db.Column(db.Integer, db.ForeignKey("customer.id"), unique=True, nullable=False)
    number=db.Column(db.String(20), unique=True, nullable=False, index=True); balance=db.Column(db.Numeric(14,2), nullable=False, default=Decimal("0.00")); frozen=db.Column(db.Boolean, default=False, nullable=False)
    customer=db.relationship("Customer", back_populates="account"); transactions=db.relationship("Transaction", back_populates="account", cascade="all,delete-orphan")
    __table_args__=(CheckConstraint("balance >= 0", name="account_balance_non_negative"),)

class Transaction(db.Model):
    id=db.Column(db.Integer, primary_key=True); account_id=db.Column(db.Integer, db.ForeignKey("account.id"), nullable=False, index=True)
    kind=db.Column(db.String(20), nullable=False); amount=db.Column(db.Numeric(14,2), nullable=False); category=db.Column(db.String(64), nullable=False, default="General")
    description=db.Column(db.String(255), nullable=False, default=""); reference=db.Column(db.String(32), nullable=False, index=True)
    created_at=db.Column(db.DateTime(timezone=True), default=lambda:datetime.now(timezone.utc), nullable=False)
    account=db.relationship("Account", back_populates="transactions")
    __table_args__=(CheckConstraint("amount > 0", name="transaction_amount_positive"),)

def money(value):
    try:
        amount=Decimal(str(value))
        if not amount.is_finite(): raise ValueError
        amount=amount.quantize(Decimal(".01"))
    except (InvalidOperation, ValueError): raise ValueError("Enter a valid INR amount.")
    if amount <= 0: raise ValueError("Amount must be greater than zero.")
    return amount
def account_json(a):
    return {"id":a.id,"uid":str(a.customer_id),"email":a.customer.email,"displayName":a.customer.name,"role":a.customer.role,"accountNumber":a.number,"checkingBalance":float(a.balance),"savingsBalance":0,"currency":"INR","isFrozen":a.frozen,"createdAt":int(a.customer.created_at.timestamp()*1000),"ifscCode":"APLS000001","micrCode":"560000001","branch":"AccountPulse Educational Branch","upiId":a.customer.email.split("@")[0]+"@accountpulse","tier":"Standard","dailyWithdrawLimit":50000,"dailyWithdrawSpent":0,"twoFactorEnabled":False,"card":{"cardNumber":"6080 0000 0000 "+a.number[-4:],"cardHolder":a.customer.name.upper(),"expiryMonth":"12","expiryYear":"29","cvv":"000","isCardFrozen":False,"network":"RuPay"},"savingsGoals":[]}
def txn_json(t):
    return {"id":str(t.id),"type":t.kind,"amount":float(t.amount),"currency":"INR","category":t.category,"description":t.description,"referenceId":t.reference,"timestamp":int(t.created_at.timestamp()*1000),"balanceAfter":float(t.account.balance)}

def create_app():
    app=Flask(__name__, static_folder="dist", static_url_path="")
    url=os.environ.get("DATABASE_URL")
    if not url and os.environ.get("FLASK_ENV")=="production": raise RuntimeError("DATABASE_URL is required in production.")
    if url and url.startswith("mysql://"): url=url.replace("mysql://","mysql+pymysql://",1)
    app.config.update(SECRET_KEY=os.environ.get("SECRET_KEY", secrets.token_urlsafe(32)), SQLALCHEMY_DATABASE_URI=url or "sqlite:///accountpulse.db", SQLALCHEMY_TRACK_MODIFICATIONS=False, SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax", SESSION_COOKIE_SECURE=os.environ.get("FLASK_ENV")=="production")
    db.init_app(app)
    with app.app_context(): db.create_all()
    def current(): return Account.query.filter_by(customer_id=session.get("customer_id")).first() if session.get("customer_id") else None
    def auth(view):
        @wraps(view)
        def wrapped(*args,**kwargs):
            if not current(): return jsonify(error="Authentication required."),401
            return view(*args,**kwargs)
        return wrapped
    def admin(view):
        @wraps(view)
        def wrapped(*args,**kwargs):
            a=current()
            if not a: return jsonify(error="Authentication required."),401
            if a.customer.role!="admin": return jsonify(error="Administrator access required."),403
            return view(*args,**kwargs)
        return wrapped
    @app.get("/health")
    def health(): db.session.execute(db.text("SELECT 1")); return jsonify(status="ok",service="accountpulse")
    @app.post("/api/auth/register")
    def register():
        d=request.get_json() or {}; email=str(d.get("email","")).strip().lower(); name=str(d.get("name","")).strip(); password=str(d.get("password", ""))
        if not email or "@" not in email or not name or len(password)<12: return jsonify(error="Name, valid email, and a 12-character password are required."),400
        if Customer.query.filter_by(email=email).first(): return jsonify(error="Email is already registered."),409
        c=Customer(email=email,name=name,password_hash=generate_password_hash(password)); db.session.add(c); db.session.flush(); a=Account(customer_id=c.id,number=f"AP{1000+c.id}",balance=Decimal("0.00")); db.session.add(a); db.session.commit(); session.clear(); session["customer_id"]=c.id
        return jsonify(account_json(a)),201
    @app.post("/api/auth/login")
    def login():
        d=request.get_json() or {}; c=Customer.query.filter_by(email=str(d.get("email","")).strip().lower()).first()
        if not c or not check_password_hash(c.password_hash,str(d.get("password", ""))): return jsonify(error="Invalid email or password."),401
        session.clear(); session["customer_id"]=c.id; return jsonify(account_json(c.account))
    @app.post("/api/auth/logout")
    def logout(): session.clear(); return "",204
    @app.get("/api/me")
    @auth
    def me(): return jsonify(account_json(current()))
    @app.get("/api/transactions")
    @auth
    def history(): return jsonify([txn_json(t) for t in Transaction.query.filter_by(account_id=current().id).order_by(Transaction.created_at.desc())])
    @app.post("/api/transactions/<kind>")
    @auth
    def transact(kind):
        if kind not in {"deposit","withdrawal"}: return jsonify(error="Invalid transaction type."),400
        try: amount=money((request.get_json() or {}).get("amount"))
        except ValueError as e: return jsonify(error=str(e)),400
        a=Account.query.filter_by(id=current().id).with_for_update().one(); d=request.get_json() or {}
        if a.frozen: return jsonify(error="Account is frozen."),403
        if kind=="withdrawal" and a.balance<amount: return jsonify(error="Insufficient simulated balance."),422
        a.balance += amount if kind=="deposit" else -amount; t=Transaction(account_id=a.id,kind=kind,amount=amount,category=str(d.get("category") or "General")[:64],description=str(d.get("description") or "")[:255],reference=secrets.token_hex(8)); db.session.add(t); db.session.commit(); return jsonify(txn_json(t)),201
    @app.post("/api/transfers")
    @auth
    def transfer():
        d=request.get_json() or {}
        try: amount=money(d.get("amount"))
        except ValueError as e: return jsonify(error=str(e)),400
        sender=Account.query.filter_by(id=current().id).with_for_update().one(); recipient=Account.query.filter_by(number=str(d.get("accountNumber","")).strip().upper()).with_for_update().first()
        if not recipient or recipient.id==sender.id: return jsonify(error="A different recipient account is required."),400
        if sender.frozen or recipient.frozen: return jsonify(error="Frozen accounts cannot transfer."),403
        if sender.balance<amount: return jsonify(error="Insufficient simulated balance."),422
        sender.balance-=amount; recipient.balance+=amount; ref=secrets.token_hex(8); out=Transaction(account_id=sender.id,kind="transfer_out",amount=amount,category=str(d.get("category") or "Transfer")[:64],description=f"Transfer to {recipient.number}",reference=ref); inc=Transaction(account_id=recipient.id,kind="transfer_in",amount=amount,category=out.category,description=f"Transfer from {sender.number}",reference=ref); db.session.add_all([out,inc]); db.session.commit(); return jsonify(txn_json(out)),201
    @app.get("/api/analytics")
    @auth
    def analytics():
        rows=Transaction.query.filter_by(account_id=current().id).all(); deposits=sum((t.amount for t in rows if t.kind=="deposit"),Decimal()); withdrawals=sum((t.amount for t in rows if t.kind in {"withdrawal","transfer_out"}),Decimal()); cats={}
        for t in rows:
            if t.kind in {"withdrawal","transfer_out"}: cats[t.category]=float(cats.get(t.category,0)+t.amount)
        return jsonify(totalDeposits=float(deposits),totalWithdrawals=float(withdrawals),balance=float(current().balance),transactionCount=len(rows),spendingByCategory=cats,unusual=[txn_json(t) for t in rows if t.amount>=Decimal("50000")])
    @app.get("/api/analytics/full")
    @auth
    def full_analytics():
        rows = [{"amount": float(t.amount), "transaction_date": t.created_at, "transaction_type": t.kind, "category": t.category, "account_id": t.account_id} for t in Transaction.query.filter_by(account_id=current().id).all()]
        return jsonify(analyse_transactions(rows))
    @app.get("/api/admin/summary")
    @admin
    def summary(): return jsonify(users=Customer.query.count(),accounts=Account.query.count(),totalBalance=float(db.session.query(func.coalesce(func.sum(Account.balance),0)).scalar()),transactions=Transaction.query.count())
    @app.cli.command("provision-demo")
    def provision_demo():
        for n in range(1001,1006):
            email=f"demo{n}@accountpulse.local"
            if not Customer.query.filter_by(email=email).first():
                c=Customer(email=email,name=f"Demo User {n}",password_hash=generate_password_hash(secrets.token_urlsafe(18))); db.session.add(c); db.session.flush(); db.session.add(Account(customer_id=c.id,number=str(n),balance=Decimal("0.00")))
        db.session.commit()
    @app.get("/")
    @app.get("/<path:path>")
    def spa(path=""):
        if path and os.path.isfile(os.path.join(app.static_folder,path)): return send_from_directory(app.static_folder,path)
        return send_from_directory(app.static_folder,"index.html") if os.path.exists(os.path.join(app.static_folder,"index.html")) else jsonify(error="Frontend has not been built."),503
    return app
app=create_app()
