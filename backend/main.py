from fastapi import FastAPI
from typing import List
import yfinance as yf
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# List of stocks for MVP
STOCKS = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN"]
# Expanded universe for top 5 search (can be further expanded)
ALL_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "BRK-B", "UNH", "JNJ", "V", "XOM", "PG", "MA", "LLY", "HD", "MRK", "AVGO", "CVX", "COST", "ABBV", "ADBE", "PEP", "KO", "WMT", "BAC", "MCD", "CRM", "ACN", "TMO", "LIN", "ABT", "DIS", "CSCO", "DHR", "VZ", "NKE", "TXN", "WFC", "BMY", "NEE", "PM", "AMGN", "MDT", "UNP", "HON", "ORCL", "IBM", "QCOM", "LOW", "SBUX", "RTX", "INTC", "AMAT", "CVS", "GS", "BLK", "GE", "CAT", "AXP", "SPGI", "PLD", "ISRG", "LMT", "TGT", "SYK", "C", "NOW", "DE", "AMT", "MO", "ADI", "MDLZ", "MMC", "GILD", "ZTS", "CB", "ADP", "CI", "DUK", "SO", "ELV", "PNC", "TFC", "USB", "BDX", "SHW", "CL", "ICE", "NSC", "GM", "FDX", "ITW", "APD", "EW", "AON", "FISV", "HUM", "PGR", "PSA", "EMR", "ETN", "AIG"
]

def get_last_5_trading_days(data):
    closes = data['Close'].dropna()
    last_5 = closes.tail(6)  # Need 6 to get 5 changes
    days = []
    prev_close = None
    for date, close in last_5.items():
        if prev_close is not None:
            dollar_change = close - prev_close
            percent_change = ((close - prev_close) / prev_close) * 100 if prev_close != 0 else 0
            days.append({
                'date': date.strftime('%Y-%m-%d'),
                'close': round(close, 2),
                'dollar_change': round(dollar_change, 2),
                'percent_change': round(percent_change, 2)
            })
        prev_close = close
    return days[-5:]  # Only last 5 changes


def get_signal(ticker: str, short_window: int = 10, long_window: int = 50):
    data = yf.download(ticker, period="6mo", interval="1d")
    if data.empty or len(data) < long_window:
        return {"ticker": ticker, "signal": "no data", "trend_percent": None, "daily_changes": []}
    data["SMA_short"] = data["Close"].rolling(window=short_window).mean()
    data["SMA_long"] = data["Close"].rolling(window=long_window).mean()
    sma_short = data["SMA_short"].iloc[-1]
    sma_long = data["SMA_long"].iloc[-1]
    if pd.isna(sma_short) or pd.isna(sma_long) or sma_long == 0:
        return {"ticker": ticker, "signal": "no data", "trend_percent": None, "daily_changes": []}
    trend_percent = ((sma_short - sma_long) / sma_long) * 100
    if sma_short > sma_long:
        signal = "likely up"
    else:
        signal = "likely down"
    daily_changes = get_last_5_trading_days(data)
    return {
        "ticker": ticker,
        "signal": signal,
        "trend_percent": round(trend_percent, 2),
        "daily_changes": daily_changes
    }

@app.get("/recommendations")
def recommendations():
    results = [get_signal(ticker) for ticker in STOCKS]
    return {"recommendations": results}

@app.get("/recommendation/{ticker}")
def recommendation(ticker: str):
    return get_signal(ticker.upper())

@app.get("/top5up")
def top5up():
    signals = []
    for ticker in ALL_STOCKS:
        try:
            data = yf.download(ticker, period="6mo", interval="1d")
            if data.empty or len(data) < 50:
                continue
            sma_short = data["Close"].rolling(window=10).mean().iloc[-1]
            sma_long = data["Close"].rolling(window=50).mean().iloc[-1]
            if pd.isna(sma_short) or pd.isna(sma_long) or sma_long == 0:
                continue
            trend_percent = ((sma_short - sma_long) / sma_long) * 100
            if sma_short > sma_long:
                daily_changes = get_last_5_trading_days(data)
                signals.append({
                    "ticker": ticker,
                    "signal": "likely up",
                    "trend_percent": round(trend_percent, 2),
                    "daily_changes": daily_changes
                })
        except Exception:
            continue  # Ignore stocks with any errors
    # Sort by trend_percent descending, take top 5
    top5 = sorted(signals, key=lambda x: x["trend_percent"], reverse=True)[:5]
    return {"top5up": top5} 