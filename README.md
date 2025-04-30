# 🫁 Lung and Colon Cancer Classification Web App

This is a full-stack web application that classifies histopathological images into **lung_aca**, **lung_scc**, or **lung_n** categories using a Convolutional Neural Network (CNN). The model was trained on real-world cancer image data and served via a Flask backend with a React frontend for user interaction.
![image](https://github.com/user-attachments/assets/4d082229-1155-408e-8f2d-4ea47b914339)


## 🧠 Model Training

- **Dataset:**  
  [Lung and Colon Cancer Histopathological Images](https://www.kaggle.com/datasets/andrewmvd/lung-and-colon-cancer-histopathological-images)

- **Classes:**  
  - `lung_aca` — Lung Adenocarcinoma  
  - `lung_scc` — Lung Squamous Cell Carcinoma  
  - `lung_n` — Normal lung tissue  

- **Preprocessing:**  
  - Images resized to `128x128`  
  - BGR format (no RGB conversion)  
  - No pixel scaling (raw uint8 values used during training)

- **Architecture:**  
  A custom CNN consisting of convolutional layers with max pooling, followed by dense layers with batch normalization and dropout.  
  The model was trained using categorical crossentropy loss and the Adam optimizer.  
  See `model.png` for a visual representation of the architecture.

## 📦 Model Download

Download the trained `.h5` model file from the link below and place it inside the `backend` directory:

[Download lung_cancer_model.h5](https://drive.google.com/file/d/1nfdXUg0Czbm-JBRPM9AQzRPFQEztvgxR/view?usp=sharing) 

## 📓 Training Notebook

The complete model training process is available in the `training.ipynb` notebook, including:

- Dataset preprocessing
- Model architecture and training loop
- Evaluation metrics (accuracy, confusion matrix, classification report)
- Final model saving (`.h5` and `.keras`)

## 🚀 How to Run the App

### Start the Backend (Flask)
```
cd Backend
pip install -r requirements.txt
python app.py
```
### Start the Frontend (React)
```
cd Frontend
npm install
npm start
```
