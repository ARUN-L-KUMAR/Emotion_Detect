import React, { useState, useEffect, useRef } from 'react';
import { Camera, Play, Square, BarChart3, Eye, Activity, Clock, TrendingUp } from 'lucide-react';

interface EmotionData {
  timestamp: string;
  emotion: string;
  confidence: number;
}

interface Stats {
  total_detections: number;
  emotion_counts: Record<string, number>;
  emotion_percentages: Record<string, number>;
  most_common: string;
}

interface Status {
  is_running: boolean;
  current_emotion: string;
  total_detections: number;
}

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('No face detected');
  const [emotions, setEmotions] = useState<EmotionData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLImageElement>(null);

  const API_BASE = 'http://localhost:5000/api';

  // Fetch status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/status`);
        const data: Status = await response.json();
        setCurrentEmotion(data.current_emotion);
        setIsRunning(data.is_running);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    const interval = setInterval(fetchStatus, 1000);
    fetchStatus(); // Initial fetch

    return () => clearInterval(interval);
  }, []);

  // Fetch emotions periodically when running
  useEffect(() => {
    if (!isRunning) return;

    const fetchEmotions = async () => {
      try {
        const response = await fetch(`${API_BASE}/emotions`);
        const data: EmotionData[] = await response.json();
        setEmotions(data);
      } catch (err) {
        console.error('Failed to fetch emotions:', err);
      }
    };

    const interval = setInterval(fetchEmotions, 2000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const startDetection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/start`, { method: 'POST' });
      const data = await response.json();
      if (data.status === 'started' || data.status === 'already_running') {
        setIsRunning(true);
      }
    } catch (err) {
      setError('Failed to start detection. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const stopDetection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stop`, { method: 'POST' });
      const data = await response.json();
      if (data.status === 'stopped') {
        setIsRunning(false);
        setCurrentEmotion('No face detected');
      }
    } catch (err) {
      setError('Failed to stop detection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch statistics.');
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      'Happy': 'text-yellow-600 bg-yellow-100',
      'Sad': 'text-blue-600 bg-blue-100',
      'Angry': 'text-red-600 bg-red-100',
      'Surprised': 'text-purple-600 bg-purple-100',
      'Neutral': 'text-gray-600 bg-gray-100',
      'Fear': 'text-orange-600 bg-orange-100',
      'Disgust': 'text-green-600 bg-green-100',
    };
    return colors[emotion] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Eye className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Face Emotion Detection</h1>
          </div>
          <p className="text-gray-600 text-lg">AI-powered real-time emotion recognition system</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Feed Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <Camera className="w-6 h-6 mr-2" />
                  Live Camera Feed
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={startDetection}
                    disabled={isRunning || loading}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </button>
                  <button
                    onClick={stopDetection}
                    disabled={!isRunning || loading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </button>
                </div>
              </div>

              {/* Video Display */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {isRunning ? (
                  <img
                    ref={videoRef}
                    src={`${API_BASE}/video_feed`}
                    alt="Video Feed"
                    className="w-full h-full object-cover"
                    onError={() => setError('Failed to load video feed')}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Click Start to begin emotion detection</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Emotion Display */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Current Emotion:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEmotionColor(currentEmotion)}`}>
                    {currentEmotion}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Detection:</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Detections:</span>
                  <span className="font-semibold">{emotions.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Emotions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Emotions
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emotions.length > 0 ? (
                  emotions.slice(-10).reverse().map((emotion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getEmotionColor(emotion.emotion)}`}>
                        {emotion.emotion}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(emotion.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No emotions detected yet</p>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Statistics
                </h3>
                <button
                  onClick={fetchStats}
                  className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>
              
              {stats ? (
                <div className="space-y-3">
                  <div className="text-center p-3 bg-indigo-50 rounded">
                    <p className="text-sm text-gray-600">Most Common Emotion</p>
                    <p className={`text-lg font-semibold ${getEmotionColor(stats.most_common)}`}>
                      {stats.most_common}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(stats.emotion_percentages).map(([emotion, percentage]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{emotion}:</span>
                        <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Click refresh to load statistics</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Getting Started:</h4>
              <ul className="space-y-1">
                <li>• Make sure your camera is connected</li>
                <li>• Click "Start" to begin detection</li>
                <li>• Position your face in front of the camera</li>
                <li>• View real-time emotion analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Real-time emotion detection</li>
                <li>• Emotion history tracking</li>
                <li>• Statistical analysis</li>
                <li>• Live video feed with annotations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;