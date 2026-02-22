import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { complaintAPI } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mic, Image, MapPin, Loader2, X } from 'lucide-react';
import axios from 'axios';

const AI_SERVICE_URL = 'http://localhost:5001';

export default function SubmitComplaint() {
  const { user } = useAuth();
  const { refreshData } = useData();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Voice Recording
  const handleVoiceStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToAI(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleVoiceStop = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendAudioToAI = async (audioBlob) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await axios.post(`${AI_SERVICE_URL}/voice-complaint`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.transcribed_text) {
        const text = response.data.transcribed_text;
        const dept = response.data.department;
        const lang = response.data.language_detected;

        setDescription(prev => prev + (prev ? ' ' : '') + text);
        setAiAnalysis(prev => ({
          ...prev,
          voiceAnalysis: {
            department: dept,
            language: lang,
            priority: response.data.priority,
            sentiment: response.data.sentiment
          }
        }));

        alert(`🎤 Voice Recognized!\n📝 Text: "${text}"\n🌍 Language: ${lang}\n📂 Department: ${dept}`);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Failed to process voice. Make sure AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  // Image Upload
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Send to AI for classification
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${AI_SERVICE_URL}/classify-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadedImage(file);
      const aiResult = response.data;
      setAiAnalysis(prev => ({ ...prev, imageAnalysis: aiResult }));

      // Show AI classification result
      const detected = aiResult.detected || 'Unknown';
      const confidence = (aiResult.confidence * 100).toFixed(1);
      const dept = aiResult.department || 'General';

      alert(`📸 Image Analyzed!\n✅ Detected: ${detected}\n📊 Confidence: ${confidence}%\n📂 Department: ${dept}`);
    } catch (error) {
      console.error('Image classification error:', error);
      alert('Failed to classify image. Make sure AI service is running.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setAiAnalysis(prev => ({ ...prev, imageAnalysis: null }));
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!location) {
      if (!confirm("No location detected. Proceed without precise location?")) {
        return;
      }
    }

    try {
      setLoading(true);
      console.log('🔵 [SUBMIT] Starting submission...');
      console.log('🔵 [SUBMIT] User:', user._id);
      console.log('🔵 [SUBMIT] Description:', description.substring(0, 50) + '...');

      // Get AI analysis first
      console.log('🤖 [SUBMIT] Calling AI service for analysis...');
      let aiAnalysisResult = null;
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-complaint`, {
          text: description,
          latitude: location?.latitude || 13.0827,
          longitude: location?.longitude || 80.2707,
          userId: user._id
        });
        aiAnalysisResult = aiResponse.data;
        console.log('✅ [SUBMIT] AI analysis received:', aiAnalysisResult);
      } catch (aiError) {
        console.error('⚠️ [SUBMIT] AI service failed, using fallback:', aiError);
        aiAnalysisResult = {
          department: 'General',
          priority: 1,
          sentiment: { sentiment: 'neutral' },
          hotspot: { is_hotspot: false },
          duplicate: { is_duplicate: false }
        };
      }

      // Upload image if exists
      let imageUrl = null;
      if (uploadedImage) {
        console.log('📸 [SUBMIT] Uploading image...');
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('userId', user._id);

        try {
          const uploadResponse = await complaintAPI.uploadImage(formData);
          imageUrl = uploadResponse.data.imageUrl;
          console.log('✅ [SUBMIT] Image uploaded:', imageUrl);
        } catch (err) {
          console.error('❌ [SUBMIT] Image upload failed:', err);
        }
      }

      // Merge AI results: valid image analysis overrides text analysis for Department
      let finalDepartment = aiAnalysisResult.department;
      if (aiAnalysis?.imageAnalysis?.department && aiAnalysis.imageAnalysis.department !== 'General') {
        console.log('📸 [SUBMIT] Overriding Text Dept (' + finalDepartment + ') with Image Dept (' + aiAnalysis.imageAnalysis.department + ')');
        finalDepartment = aiAnalysis.imageAnalysis.department;
      }

      // Submit complaint with merged AI analysis
      const payload = {
        userId: user._id,
        description,
        latitude: location?.latitude || 13.0827,
        longitude: location?.longitude || 80.2707,
        department: finalDepartment,
        priority: aiAnalysisResult.priority,
        imageUrl,
        aiAnalysis: {
          sentiment: aiAnalysisResult.sentiment?.sentiment || 'neutral',
          isHotspot: aiAnalysisResult.hotspot?.is_hotspot || false,
          isDuplicate: aiAnalysisResult.duplicate?.is_duplicate || false,
          imageClassification: aiAnalysis?.imageAnalysis,
          voiceAnalysis: aiAnalysis?.voiceAnalysis
        }
      };

      console.log('📤 [SUBMIT] Sending payload to backend:', payload);
      const response = await complaintAPI.create(payload);

      console.log('✅ [SUBMIT] Complaint saved to MongoDB:', response.data);

      // Trigger global data refresh so other pages (My Complaints, Stats) update
      await refreshData();

      const savedData = response.data.data || response.data;

      alert(`Complaint submitted successfully!
Department: ${savedData.department}
Priority: ${savedData.priority}
Sentiment: ${aiAnalysisResult.sentiment?.sentiment || 'neutral'}

✓ Saved to MongoDB
✓ Assigned to Officer: ${savedData.assignedOfficer}`);

      console.log('🔄 [SUBMIT] Navigating to dashboard...');
      navigate('/citizen/dashboard');
    } catch (error) {
      console.error("❌ [SUBMIT] Submission failed:", error);
      console.error("❌ [SUBMIT] Error details:", error.response?.data);
      alert("Failed to submit complaint. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Complaint</h1>
        <p className="text-gray-600">Describe your issue and get AI analysis</p>
      </div>

      <div className="max-w-3xl">
        <Card className="mb-6 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complaint Description
          </label>
          <Textarea
            placeholder="Describe your complaint in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full mb-4"
          />

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="outline"
              onClick={recording ? handleVoiceStop : handleVoiceStart}
              disabled={loading}
            >
              <Mic size={18} className={`mr-2 ${recording ? 'text-red-500 animate-pulse' : ''}`} />
              {recording ? 'Stop Recording' : 'Voice Input'}
            </Button>

            <Button variant="outline" onClick={handleImageClick} disabled={loading}>
              <Image size={18} className="mr-2" />
              Upload Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              variant={location ? "success" : "outline"}
              onClick={handleLocation}
              disabled={locating || loading}
            >
              {locating ? <Loader2 size={18} className="mr-2 animate-spin" /> : <MapPin size={18} className="mr-2" />}
              {location ? "Location Set" : "Get Location"}
            </Button>
          </div>

          {/* AI Analysis Display - Voice */}
          {aiAnalysis?.voiceAnalysis && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                <Mic size={16} className="mr-2" />
                🎤 Voice Analysis
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Language:</span>
                  <span className="ml-2 font-medium text-blue-700">{aiAnalysis.voiceAnalysis.language}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium text-blue-700">{aiAnalysis.voiceAnalysis.department}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className="ml-2 font-medium text-blue-700">{aiAnalysis.voiceAnalysis.priority}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sentiment:</span>
                  <span className="ml-2 font-medium text-blue-700">{aiAnalysis.voiceAnalysis.sentiment?.sentiment || 'None'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview and Analysis */}
          {imagePreview && (
            <div className="mb-4">
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-lg border" />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>

              {aiAnalysis?.imageAnalysis && (
                <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
                    <Image size={16} className="mr-2" />
                    📸 Image Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Detected:</span>
                      <span className="ml-2 font-medium text-green-700">{aiAnalysis.imageAnalysis.detected}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <span className="ml-2 font-medium text-green-700">
                        {(aiAnalysis.imageAnalysis.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2 font-medium text-green-700">{aiAnalysis.imageAnalysis.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Model:</span>
                      <span className="ml-2 font-medium text-green-700">{aiAnalysis.imageAnalysis.model}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final AI Summary */}
          {(aiAnalysis?.voiceAnalysis || aiAnalysis?.imageAnalysis) && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">
                🤖 AI Analysis Summary
              </h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-600">Final Department:</span>
                  <span className="ml-2 font-bold text-yellow-900">
                    {aiAnalysis.imageAnalysis?.department || aiAnalysis.voiceAnalysis?.department || 'General'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Priority Level:</span>
                  <span className="ml-2 font-bold text-yellow-900">
                    {aiAnalysis.voiceAnalysis?.priority || 1} / 5
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ This information will be automatically saved with your complaint
                </p>
              </div>
            </div>
          )}

          {location && (
            <div className="text-sm text-gray-500 mb-4">
              📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Processing with AI...
              </>
            ) : (
              "Submit Complaint"
            )}
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
