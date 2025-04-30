"use client";

import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import {
    Upload,
    X,
    FileImage,
    AlertCircle,
    Lungs,
    CheckCircle,
    AlertTriangle,
} from "./components/Icons";

function App() {
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [processingStarted, setProcessingStarted] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingComplete, setProcessingComplete] = useState(false);
    const [result, setResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const server = "http://127.0.0.1:5000";
    const fileInputRef = useRef(null);

    // Class name mapping to human-readable format
    const classDisplayNames = {
        lung_aca: "Adenocarcinoma",
        lung_n: "Normal Lung",
        lung_scc: "Squamous Cell Carcinoma",
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        e.preventDefault();

        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Reset states
        setProcessingStarted(true);
        setProcessingProgress(0);
        setProcessingComplete(false);
        setResult(null);
        setError(null);
        setFileName(file.name);

        // Validate file
        if (!file.type.match("image.*")) {
            setError("Please upload an image file");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);

        // Upload and process
        const formData = new FormData();
        formData.append("image", file);

        axios
            .post(`${server}/predict`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProcessingProgress(percent);
                },
            })
            .then((response) => {
                const data = response.data;
                const maxScore = Math.max(...data.scores);

                // Format the result for display
                const formattedResult = {
                    predictedClass: data.predicted_class_name,
                    displayName: classDisplayNames[data.predicted_class_name],
                    confidence: maxScore,
                    isNormal: data.predicted_class_name === "lung_n",
                    scores: data.scores.map((score, index) => ({
                        className:
                            classDisplayNames[
                                ["lung_aca", "lung_n", "lung_scc"][index]
                            ],
                        score: score,
                    })),
                    quality:
                        maxScore > 0.9
                            ? "Excellent"
                            : maxScore > 0.7
                            ? "Good"
                            : "Fair",
                };

                setProcessingProgress(100);
                setTimeout(() => {
                    setProcessingComplete(true);
                    setResult(formattedResult);
                }, 500);
            })
            .catch((error) => {
                setError(error.response?.data?.error || "Analysis failed");
                setProcessingStarted(false);
            });
    };

    const handleRemoveImage = () => {
        setImage(null);
        setFileName("");
        setUploadProgress(0);
        setIsUploading(false);
        setProcessingStarted(false);
        setProcessingProgress(0);
        setProcessingComplete(false);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">
                    <Lungs className="logo-icon" />
                    <h1>LungScan AI</h1>
                </div>
                <nav>
                    <ul>
                        <li>
                            <a href="#about">About</a>
                        </li>
                        <li>
                            <a href="#technology">Technology</a>
                        </li>
                        <li>
                            <a href="#contact">Contact</a>
                        </li>
                    </ul>
                </nav>
            </header>

            <main>
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>Advanced Lung Cancer Detection</h1>
                        <p>
                            Using state-of-the-art deep learning technology to
                            detect early signs of lung cancer from CT scan
                            images with high accuracy.
                        </p>
                    </div>
                </section>

                <section className="upload-section">
                    <div className="card">
                        <h2>Upload CT Scan Image</h2>

                        {error && (
                            <div className="error-message">
                                <AlertTriangle className="error-icon" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div
                            className={`upload-area ${
                                dragActive ? "active" : ""
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {!image ? (
                                <div className="upload-placeholder">
                                    <div className="upload-icon-container">
                                        <Upload className="upload-icon" />
                                    </div>
                                    <div>
                                        <p className="upload-title">
                                            Drag and drop your lung CT scan
                                            image
                                        </p>
                                        <p className="upload-subtitle">
                                            or click to browse from your
                                            computer
                                        </p>
                                    </div>
                                    <button
                                        className="button button-secondary"
                                        onClick={triggerFileInput}
                                    >
                                        <FileImage className="button-icon" />
                                        Select Image
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <p className="upload-formats">
                                        Supported formats: JPEG, PNG, DICOM
                                    </p>
                                </div>
                            ) : (
                                <div className="image-preview-container">
                                    <div className="image-preview">
                                        <img
                                            src={image || "/placeholder.svg"}
                                            alt="Lung CT scan preview"
                                            className="preview-image"
                                        />
                                        <button
                                            className="remove-button"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="remove-icon" />
                                        </button>
                                    </div>

                                    <div className="file-info">
                                        <p className="file-name">{fileName}</p>
                                        {processingStarted &&
                                            !processingComplete && (
                                                <div className="upload-progress">
                                                    <div className="progress-text">
                                                        <span>
                                                            Analyzing...
                                                        </span>
                                                        <span>
                                                            {processingProgress}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${processingProgress}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {processingComplete && result && (
                        <div className="results-container">
                            <div className="card results-card">
                                <h2 className="results-title">
                                    <CheckCircle className="results-icon" />
                                    Processing Complete
                                </h2>

                                <div
                                    className={`result-alert ${
                                        result.isNormal
                                            ? "result-negative"
                                            : "result-positive"
                                    }`}
                                >
                                    <AlertCircle className="alert-icon" />
                                    <h3>Analysis Result</h3>
                                    <p className="result-classification">
                                        {result.isNormal
                                            ? "No suspicious nodules detected"
                                            : `Potential ${result.displayName} detected`}
                                    </p>
                                </div>

                                <div className="result-metrics">
                                    <div className="metric-card">
                                        <p className="metric-label">
                                            Confidence
                                        </p>
                                        <p className="metric-value">
                                            {(result.confidence * 100).toFixed(
                                                1
                                            )}
                                            %
                                        </p>
                                    </div>
                                    <div className="metric-card">
                                        <p className="metric-label">
                                            Scan Quality
                                        </p>
                                        <p className="metric-value">
                                            {result.quality}
                                        </p>
                                    </div>
                                </div>

                                <div className="result-details">
                                    <h3>Detailed Analysis</h3>
                                    <ul className="score-details">
                                        {result.scores.map((item, index) => (
                                            <li key={index}>
                                                <span className="class-name">
                                                    {item.className}:
                                                </span>
                                                <span className="class-score">
                                                    {(item.score * 100).toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="medical-note">
                                        {result.isNormal
                                            ? "No concerning patterns found. Routine checkups recommended."
                                            : "Consult a medical professional for further evaluation."}
                                    </p>
                                </div>
                            </div>

                            <div className="action-container">
                                <button
                                    className="button button-secondary"
                                    onClick={handleRemoveImage}
                                >
                                    Upload New Image
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="info-section" id="about">
                    <div className="info-content">
                        <h2>About Our Technology</h2>
                        <p>
                            Our deep learning model has been trained on
                            thousands of CT scan images to detect early signs of
                            lung cancer with high accuracy. The model can
                            identify suspicious nodules and provide a
                            probability score to help medical professionals make
                            informed decisions.
                        </p>
                        <p>
                            <strong>Note:</strong> This tool is designed to
                            assist medical professionals and should not be used
                            as a replacement for professional medical advice.
                        </p>
                    </div>
                </section>
            </main>

            <footer>
                <div className="footer-content">
                    <p>
                        &copy; {new Date().getFullYear()} LungScan AI. All
                        rights reserved.
                    </p>
                    <div className="footer-links">
                        <a href="#privacy">Privacy Policy</a>
                        <a href="#terms">Terms of Service</a>
                        <a href="#contact" id="contact">
                            Contact Us
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
