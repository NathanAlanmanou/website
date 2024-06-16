import streamlit as st
import pandas as pd
import joblib

# Load the trained model
model = joblib.load('/mnt/data/salary_predictor_model.joblib')

# Streamlit app
st.title('Salary Predictor')

# Input fields
age = st.number_input('Age', min_value=0, max_value=100, value=25)
gender = st.selectbox('Gender', ['Male', 'Female'])
education_level = st.selectbox('Education Level', ["Bachelor's", "Master's", 'PhD'])
job_title = st.text_input('Job Title', 'Software Engineer')
years_of_experience = st.number_input('Years of Experience', min_value=0, max_value=50, value=5)

# Prediction
if st.button('Predict Salary'):
    input_data = pd.DataFrame({
        'Age': [age],
        'Gender': [gender],
        'Education Level': [education_level],
        'Job Title': [job_title],
        'Years of Experience': [years_of_experience]
    })
    
    prediction = model.predict(input_data)
    st.write(f'Predicted Salary: ${prediction[0]:,.2f}')

if __name__ == '__main__':
    st.run()
