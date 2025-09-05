from flask import Flask, render_template, Response, jsonify, request
from flask_cors import CORS
import cv2
import json
import threading
import time
from datetime import datetime
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables
camera = None
is_running = False
lock = threading.Lock()
emotion_data = []
current_emotion = "No face detected"

# Simple emotion detection using OpenCV's face detection
# Since facial_emotion_recognition might not be available, we'll simulate it
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Mock emotions for demonstration (replace with actual emotion recognition)
emotions = ["Happy", "Sad", "Angry", "Surprised", "Neutral", "Fear", "Disgust"]

def detect_emotion_mock(frame):
    """Mock emotion detection - replace with actual emotion recognition"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) > 0:
        # Simulate emotion detection
        import random
        emotion = random.choice(emotions)
        confidence = random.uniform(0.7, 0.95)
        
        # Draw rectangle around face
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
            cv2.putText(frame, f"{emotion} ({confidence:.2f})", 
                       (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
        
        return frame, emotion, confidence
    else:
        return frame, "No face detected", 0.0

def initialize_camera():
    """Initialize camera with error handling"""
    global camera
    try:
        # Try different camera indices
        for i in range(3):
            test_camera = cv2.VideoCapture(i)
            if test_camera.isOpened():
                ret, frame = test_camera.read()
                if ret:
                    camera = test_camera
                    # Set camera properties for better performance
                    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                    camera.set(cv2.CAP_PROP_FPS, 30)
                    print(f"Camera initialized successfully on index {i}")
                    return True
                else:
                    test_camera.release()
            else:
                test_camera.release()
        
        print("No working camera found")
        return False
    except Exception as e:
        print(f"Error initializing camera: {e}")
        return False

def generate_frames():
    """Generate video frames with emotion detection"""
    global current_emotion, emotion_data
    
    if not initialize_camera():
        return
    
    frame_count = 0
    
    try:
        while True:
            with lock:
                if not is_running:
                    break
            
            success, frame = camera.read()
            if not success:
                print("Failed to read frame")
                break
            
            # Flip frame horizontally for mirror effect
            frame = cv2.flip(frame, 1)
            
            # Detect emotion every 5 frames for performance
            if frame_count % 5 == 0:
                frame, emotion, confidence = detect_emotion_mock(frame)
                current_emotion = emotion
                
                # Store emotion data
                if emotion != "No face detected":
                    emotion_data.append({
                        'timestamp': datetime.now().isoformat(),
                        'emotion': emotion,
                        'confidence': confidence
                    })
                    
                    # Keep only last 100 records
                    if len(emotion_data) > 100:
                        emotion_data = emotion_data[-100:]
            
            frame_count += 1
            
            # Add timestamp and current emotion to frame
            cv2.putText(frame, f"Current: {current_emotion}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(frame, datetime.now().strftime("%H:%M:%S"), 
                       (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Encode frame
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            
            time.sleep(0.033)  # ~30 FPS
            
    except Exception as e:
        print(f"Error in generate_frames: {e}")
    finally:
        if camera:
            camera.release()

@app.route('/api/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/start', methods=['POST'])
def start():
    """Start emotion detection"""
    global is_running
    with lock:
        if not is_running:
            is_running = True
            return jsonify({'status': 'started', 'message': 'Emotion detection started'})
        else:
            return jsonify({'status': 'already_running', 'message': 'Already running'})

@app.route('/api/stop', methods=['POST'])
def stop():
    """Stop emotion detection"""
    global is_running, camera
    with lock:
        is_running = False
        if camera:
            camera.release()
            camera = None
    return jsonify({'status': 'stopped', 'message': 'Emotion detection stopped'})

@app.route('/api/status')
def status():
    """Get current status"""
    return jsonify({
        'is_running': is_running,
        'current_emotion': current_emotion,
        'total_detections': len(emotion_data)
    })

@app.route('/api/emotions')
def get_emotions():
    """Get emotion history"""
    return jsonify(emotion_data[-20:])  # Return last 20 emotions

@app.route('/api/stats')
def get_stats():
    """Get emotion statistics"""
    if not emotion_data:
        return jsonify({'message': 'No data available'})
    
    # Calculate emotion frequency
    emotion_counts = {}
    for record in emotion_data:
        emotion = record['emotion']
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Calculate percentages
    total = len(emotion_data)
    emotion_percentages = {emotion: (count/total)*100 
                          for emotion, count in emotion_counts.items()}
    
    return jsonify({
        'total_detections': total,
        'emotion_counts': emotion_counts,
        'emotion_percentages': emotion_percentages,
        'most_common': max(emotion_counts.items(), key=lambda x: x[1])[0] if emotion_counts else None
    })

if __name__ == '__main__':
    print("Starting Face Emotion Detection Server...")
    print("Make sure your camera is connected and not being used by other applications")
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)