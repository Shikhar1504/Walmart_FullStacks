from flask import Flask, request, jsonify
import joblib
import numpy as np
import xgboost as xgb
import pandas as pd

app = Flask(__name__)

# === Load pre-trained model, imputer, and confidence scaler ===
model = joblib.load("suggested_price_xgb_model_cleaned.pkl")
imputer = joblib.load("imputer_cleaned.pkl")
scaler = joblib.load("confidence_scaler.pkl")  # NEW: Load saved scaler

# === Features used in training ===
selected_features = [
    'cost', 'currentPrice', 'originalPrice', 'margin',
    'stock', 'maxStock', 'minStockLevel', 'daysUntilExpiry', 'isPerishable',
    'priceFactors.expirationUrgency', 'priceFactors.stockLevel', 'priceFactors.timeOfDay',
    'priceFactors.demandForecast', 'priceFactors.competitorPrice', 
    'priceFactors.seasonality', 'priceFactors.marketTrend',
    'clearanceRate', 'wasteReduction'
]

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    # Ensure all selected features are present
    input_data = {feature: data.get(feature, np.nan) for feature in selected_features}
    input_df = pd.DataFrame([input_data])

    # Convert all fields to numeric
    for col in selected_features:
        input_df[col] = pd.to_numeric(input_df[col], errors='coerce')

    # Impute missing values
    X_imputed = imputer.transform(input_df)

    # Predict suggested price
    suggested_price = model.predict(X_imputed)[0]

    # === Confidence Score Calculation ===
    booster = model.get_booster()
    n_trees = booster.num_boosted_rounds()

    tree_preds = []
    for i in range(n_trees):
        pred = booster.predict(
            xgb.DMatrix(X_imputed),
            iteration_range=(i, i + 1),
            output_margin=True
        )
        tree_preds.append(pred)

    tree_preds = np.array(tree_preds).T  # shape: (1, n_trees)
    std_dev = np.std(tree_preds, axis=1)
    inv_std = 1 / (std_dev + 1e-6)
    log_inv_std = np.log1p(inv_std)

    # Normalize using saved scaler
    confidence_norm = scaler.transform(log_inv_std.reshape(-1, 1))
    ml_score = 0.70 + (confidence_norm.flatten() ** 0.3) * (0.99 - 0.70)

    return jsonify({
        "suggestedPrice": round(float(suggested_price), 2),
        "mlScore": round(float(ml_score[0]), 3)
    })

if __name__ == "__main__":
    app.run(debug=True)
