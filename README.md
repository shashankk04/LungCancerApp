# 🫁 Lung and Colon Cancer Classification Web App

This is a full-stack web application that classifies histopathological images into **lung_aca**, **lung_scc**, or **lung_n** categories using a Convolutional Neural Network (CNN). The model was trained on real-world cancer image data and served via a Flask backend with a React frontend for user interaction.

---

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

---
