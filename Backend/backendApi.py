from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import tensorflow as tf
import tempfile
from werkzeug.utils import secure_filename

# ─── 1) Load your model for inference ────────────────────────────────────────
model = tf.keras.models.load_model('lung_cancer_model.h5', compile=False)

# ─── 2) Preprocessing helper to mirror training ──────────────────────────────
def preprocess_image_bgr_noscale(path, img_size=128):
    """
    Reads an image as BGR uint8 [0–255], resizes to (img_size, img_size),
    and adds a batch dimension—NO RGB conversion, NO scaling.
    """
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Could not read image at {path!r}")
    img = cv2.resize(img, (img_size, img_size))
    return np.expand_dims(img, axis=0)

# ─── 3) Inference function ──────────────────────────────────────────────────
def predict_image(path, img_size=128, class_names=None):
    x = preprocess_image_bgr_noscale(path, img_size=img_size)
    preds = model.predict(x)
    cls_idx = int(np.argmax(preds, axis=1)[0])
    scores = preds.flatten().tolist()
    return cls_idx, scores

# ─── 4) Flask server setup ─────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)
# Must match training order
class_names = ['lung_aca', 'lung_n', 'lung_scc']

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided.'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename.'}), 400

    # Secure and save to a temporary file
    filename = secure_filename(file.filename)
    suffix = os.path.splitext(filename)[1]
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    file.save(tmp.name)
    tmp_path = tmp.name
    tmp.close()

    try:
        cls_idx, scores = predict_image(tmp_path, img_size=128, class_names=class_names)
        result = {
            'predicted_class_index': cls_idx,
            'predicted_class_name': class_names[cls_idx],
            'scores': scores
        }
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(tmp_path)

    return jsonify(result)
    
@app.route("/keep-alive", methods=["GET"])
def keep_alive():
    return "Server is alive!", 200

if __name__ == '__main__':
    # When deploying, consider disabling debug and adjusting host/port
    app.run(host='0.0.0.0', port=5000, debug=True)
