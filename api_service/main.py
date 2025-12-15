"""
FastAPI Backend Service for Ditto Insurance Data API

This service provides REST API endpoints to:
- Serve scraped insurance plan data
- Provide aggregated statistics for dashboard visualizations
- Support filtering by company, rating ranges
- Enable CORS for frontend access

Endpoints:
    GET / - API information
    GET /health - Health check with data status
    GET /api/data - Get insurance plans with optional filters
    GET /api/statistics - Get aggregated statistics for charts
    GET /api/companies - Get list of all insurance companies
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import os
from typing import Optional, List
from datetime import datetime
import json

app = FastAPI(title="Ditto Insurance Data API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data file path - can be overridden via environment variable
# Default: /app/data/ditto_insurance_data.csv (inside container)
DATA_FILE = os.getenv("DATA_FILE", "/app/data/ditto_insurance_data.csv")

@app.get("/")
async def root():
    return {"message": "Ditto Insurance Data API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        if os.path.exists(DATA_FILE):
            df = pd.read_csv(DATA_FILE)
            return {
                "status": "healthy",
                "records": len(df),
                "last_updated": df["Last Updated"].iloc[0] if len(df) > 0 else None
            }
        return {"status": "no_data", "message": "Data file not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/data")
async def get_data(
    company: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
    limit: Optional[int] = None
):
    """Get insurance data with optional filters"""
    try:
        if not os.path.exists(DATA_FILE):
            raise HTTPException(status_code=404, detail="Data file not found")
        
        df = pd.read_csv(DATA_FILE)
        
        # Apply filters
        if company:
            df = df[df['Company'].str.contains(company, case=False, na=False)]
        
        if min_rating is not None:
            df = df[df['Rating By Ditto'] >= min_rating]
        
        if max_rating is not None:
            df = df[df['Rating By Ditto'] <= max_rating]
        
        if limit:
            df = df.head(limit)
        
        # Convert to JSON, handling NaN values
        data = df.to_dict(orient='records')
        
        # Replace NaN values with None for JSON compatibility
        for record in data:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
        
        return {
            "total": len(data),
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/statistics")
async def get_statistics():
    """Get aggregated statistics for visualizations"""
    try:
        if not os.path.exists(DATA_FILE):
            raise HTTPException(status_code=404, detail="Data file not found")
        
        df = pd.read_csv(DATA_FILE)
        
        # Remove NaN ratings for statistics
        df_with_ratings = df[df['Rating By Ditto'].notna()]
        
        # Company distribution
        company_counts = df['Company'].value_counts().to_dict()
        
        # Rating distribution - combine 0.0-1.9 into single red range, include N/A
        rating_ranges = {
            "4.0-5.0": len(df_with_ratings[(df_with_ratings['Rating By Ditto'] >= 4.0) & (df_with_ratings['Rating By Ditto'] <= 5.0)]),
            "3.0-3.9": len(df_with_ratings[(df_with_ratings['Rating By Ditto'] >= 3.0) & (df_with_ratings['Rating By Ditto'] < 4.0)]),
            "2.0-2.9": len(df_with_ratings[(df_with_ratings['Rating By Ditto'] >= 2.0) & (df_with_ratings['Rating By Ditto'] < 3.0)]),
            "0.0-1.9": len(df_with_ratings[(df_with_ratings['Rating By Ditto'] >= 0.0) & (df_with_ratings['Rating By Ditto'] < 2.0)]),
            "N/A": len(df[df['Rating By Ditto'].isna()]),
        }
        
        # Top companies by average rating
        company_avg_ratings = df_with_ratings.groupby('Company')['Rating By Ditto'].agg(['mean', 'count']).reset_index()
        company_avg_ratings = company_avg_ratings[company_avg_ratings['count'] >= 2]  # At least 2 plans
        company_avg_ratings = company_avg_ratings.sort_values('mean', ascending=False).head(10)
        top_companies = {
            row['Company']: round(row['mean'], 2) 
            for _, row in company_avg_ratings.iterrows()
        }
        
        # Top rated plans - return ALL plans sorted by rating (include N/A ratings at the end)
        # First, get plans with ratings sorted by rating
        plans_with_ratings_df = df_with_ratings.sort_values('Rating By Ditto', ascending=False)[['Company', 'Policy Name', 'Rating By Ditto', 'Plan URL']]
        plans_with_ratings = plans_with_ratings_df.to_dict(orient='records')
        
        # Then, get plans without ratings (N/A)
        plans_without_ratings_df = df[df['Rating By Ditto'].isna()][['Company', 'Policy Name', 'Rating By Ditto', 'Plan URL']]
        plans_without_ratings = plans_without_ratings_df.to_dict(orient='records')
        
        # Combine: rated plans first, then N/A plans
        top_plans = plans_with_ratings + plans_without_ratings
        
        # Replace NaN values with None for JSON serialization
        import numpy as np
        for plan in top_plans:
            if pd.isna(plan.get('Rating By Ditto')):
                plan['Rating By Ditto'] = None
        
        return {
            "total_plans": len(df),
            "plans_with_ratings": len(df_with_ratings),
            "total_companies": df['Company'].nunique(),
            "average_rating": round(df_with_ratings['Rating By Ditto'].mean(), 2),
            "company_distribution": company_counts,
            "rating_distribution": rating_ranges,
            "top_companies_by_rating": top_companies,
            "top_rated_plans": top_plans,
            "last_updated": df["Last Updated"].iloc[0] if len(df) > 0 else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/companies")
async def get_companies():
    """Get list of all companies"""
    try:
        if not os.path.exists(DATA_FILE):
            raise HTTPException(status_code=404, detail="Data file not found")
        
        df = pd.read_csv(DATA_FILE)
        companies = sorted(df['Company'].unique().tolist())
        
        return {"companies": companies, "count": len(companies)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

