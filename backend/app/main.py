# main.py
from fastapi import FastAPI
from app.routes import analysis, alerts, admin

app = FastAPI()

# Include routes
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crowd Management API!"}
