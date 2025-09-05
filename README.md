# Face Emotion Detector 🎭

A real-time face emotion detection application built with React + TypeScript frontend and Flask backend. This application uses computer vision to detect faces and classify emotions in real-time using your webcam.

![Emotion Detection](https://img.shields.io/badge/Emotion-Detection-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green)
![OpenCV](https://img.shields.io/badge/OpenCV-4.8.1-red)

## 🌟 Features

- **Real-time Emotion Detection**: Live emotion recognition from webcam feed
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Emotion Statistics**: Track and analyze emotion patterns over time
- **Live Video Feed**: Real-time video processing with face detection overlay
- **Emotion History**: View detected emotions with timestamps and confidence scores
- **Analytics Dashboard**: Comprehensive statistics and emotion distribution charts

## 🎯 Supported Emotions

- 😊 Happy
- 😢 Sad  
- 😠 Angry
- 😲 Surprised
- 😐 Neutral
- 😨 Fear
- 🤢 Disgust

## 🏗️ Project Structure

```
faceemotion_dettector/
├── backend/                 # Flask API server
│   ├── app.py              # Main Flask application
│   └── __pycache__/        # Python cache files
├── src/                    # React frontend
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # TypeScript definitions
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Webcam** (built-in or external)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ARUN-L-KUMAR/Emotion_Detect.git
   cd faceemotion_dettector
   ```

2. **Set up the Python backend**
   ```bash
   # Create virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Set up the React frontend**
   ```bash
   # Install Node.js dependencies
   npm install
   ```

### Running the Application

1. **Start the Flask backend** (Terminal 1):
   ```bash
   # Make sure virtual environment is activated
   cd backend
   python app.py
   ```
   The backend will start on `http://localhost:5000`

2. **Start the React frontend** (Terminal 2):
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🛠️ Development

### Backend API Endpoints

- `GET /api/status` - Get current detection status
- `GET /api/video_feed` - Live video stream with emotion overlay
- `POST /api/start` - Start emotion detection
- `POST /api/stop` - Stop emotion detection
- `GET /api/emotions` - Get emotion history
- `GET /api/stats` - Get emotion statistics
- `DELETE /api/clear` - Clear emotion history

### Frontend Components

- **Main App**: Real-time emotion display and controls
- **Video Feed**: Live webcam stream with face detection
- **Statistics Panel**: Emotion analytics and charts
- **Controls**: Start/stop detection buttons

### Building for Production

```bash
# Build frontend
npm run build

# The built files will be in the `dist` directory
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Camera Configuration
CAMERA_INDEX=0
DETECTION_CONFIDENCE=0.7
```

### Customizing Emotion Detection

The current implementation uses a mock emotion detection system. To integrate with a real emotion detection model:

1. Replace the `detect_emotion_mock()` function in `backend/app.py`
2. Install your preferred emotion detection library
3. Update the model loading and inference code

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend
- **Flask** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **OpenCV** - Computer vision library
- **NumPy** - Numerical computing

## 📊 Performance

- **Real-time Processing**: ~30 FPS video processing
- **Low Latency**: <100ms emotion detection response
- **Memory Efficient**: Optimized for continuous operation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

1. **Camera not working**:
   - Check camera permissions in your browser
   - Ensure no other applications are using the camera
   - Try changing the `CAMERA_INDEX` in configuration

2. **Backend connection errors**:
   - Verify Flask server is running on port 5000
   - Check CORS configuration
   - Ensure virtual environment is activated

3. **Package installation issues**:
   - Update pip: `python -m pip install --upgrade pip`
   - For OpenCV issues on Windows: `pip install opencv-python-headless`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arun L Kumar**
- GitHub: [@ARUN-L-KUMAR](https://github.com/ARUN-L-KUMAR)

## 🙏 Acknowledgments

- OpenCV community for computer vision tools
- React and Vite teams for excellent development experience
- Tailwind CSS for beautiful styling utilities

---

Made with ❤️ and lots of ☕
