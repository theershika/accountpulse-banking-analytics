"""Stored-data analytics and charts for the educational AccountPulse simulation."""
from io import BytesIO
import base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

def analyse_transactions(rows):
    """Return no invented values: empty input produces explicit empty analytics."""
    frame = pd.DataFrame(rows)
    if frame.empty:
        return {"empty": True, "message": "No stored transactions are available yet.", "charts": {}, "summary": {}}
    frame["amount"] = pd.to_numeric(frame["amount"])
    frame["transaction_date"] = pd.to_datetime(frame["transaction_date"])
    frame["month"] = frame["transaction_date"].dt.to_period("M").astype(str)
    outflow = frame.transaction_type.isin(["withdrawal", "transfer_out"])
    deposits = frame.transaction_type.isin(["deposit", "transfer_in"])
    summary = {"totalDeposits": float(frame.loc[deposits,"amount"].sum()), "totalWithdrawals": float(frame.loc[outflow,"amount"].sum()), "totalTransactions": int(len(frame)), "averageTransactionAmount": float(np.mean(frame.amount)), "netSimulatedCashFlow": float(frame.loc[deposits,"amount"].sum()-frame.loc[outflow,"amount"].sum()), "monthly": frame.groupby("month").amount.sum().to_dict(), "byType": frame.groupby("transaction_type").amount.sum().to_dict(), "byCategory": frame.loc[outflow].groupby("category").amount.sum().to_dict()}
    def chart(kind):
        fig, ax = plt.subplots(figsize=(7,3.5)); return fig, ax
    charts={}
    fig,ax=chart("flow"); ax.bar(["Deposits","Withdrawals"],[summary["totalDeposits"],summary["totalWithdrawals"]],color=["#16a34a","#dc2626"]); ax.set(title="Deposits versus Withdrawals",ylabel="INR (₹)"); charts["deposits_vs_withdrawals"]=_png(fig)
    fig,ax=chart("month"); monthly=pd.Series(summary["monthly"]); monthly.plot(ax=ax,marker="o"); ax.set(title="Monthly Transaction Trends",xlabel="Month",ylabel="INR (₹)"); charts["monthly_trends"]=_png(fig)
    fig,ax=chart("types"); frame.groupby("transaction_type").size().plot(kind="bar",ax=ax); ax.set(title="Transaction Counts by Type",xlabel="Transaction type",ylabel="Transaction count"); charts["transaction_counts"]=_png(fig)
    return {"empty":False,"summary":summary,"charts":charts,"explanations":{"deposits_vs_withdrawals":"Compares simulated INR credits and debits.","monthly_trends":"Shows actual stored transaction value by month.","transaction_counts":"Shows the number of stored records by transaction type."}}
def _png(fig):
    data=BytesIO(); fig.tight_layout(); fig.savefig(data,format="png",dpi=120); plt.close(fig); return base64.b64encode(data.getvalue()).decode()
