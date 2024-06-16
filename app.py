from flask import Flask, request, jsonify, render_template
import mlflow.pyfunc
import pandas as pd

app = Flask(__name__)

# Load the saved modeldf
model = mlflow.pyfunc.load_model("model")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Extract features from the request
    features = {
        'Age': float(request.form['age']),
        'Gender': request.form['gender'],
        'Education Level': request.form['education'],
        'Job Title': request.form['job_title'],
        'Years of Experience': float(request.form['experience'])
    }
    
    # Convert features to the format required by the model
    input_data = prepare_input(features)
    
    # Get prediction
    prediction = model.predict(input_data)
    
    return jsonify({'prediction': prediction.tolist()[0]})

def prepare_input(features):
    # Convert form data into a DataFrame
    input_df = pd.DataFrame([features])
    # Ensure the format matches the training data
    return input_df

if __name__ == "__main__":
    app.run(debug=True)
