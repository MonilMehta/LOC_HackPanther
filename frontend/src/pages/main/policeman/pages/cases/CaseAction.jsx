import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { Cookies } from 'react-cookie';
import { useLocation } from 'react-router-dom';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const CaseAction = () => {
  // Form field states
  const [notification, setNotification] = useState(null);
  const [caseTitle, setCaseTitle] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [caseStatus, setCaseStatus] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [firImage, setFirImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const location = useLocation();

  // New useEffect to prefill the form using props passed from PublicPortal
  useEffect(() => {
    if (location.state && location.state.reportData) {
      const { title, description, location: loc } = location.state.reportData;
      setCaseTitle(title || '');
      setCaseDescription(description || '');
      if (loc) {
        setStreet(loc.street || '');
        setCity(loc.city || '');
        setStateVal(loc.state || '');
        setPincode(loc.pincode || '');
      }
    }
  }, [location.state]);

  const callGeminiAPI = async (userInput) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: userInput
            }]
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ],
          generationConfig: {
            temperature: 0.1, // Lower temperature for more focused extraction
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const processWithGemini = async (text) => {
    const prompt = `
      You are a legal document analysis system. Extract the following information from this FIR/police report text in JSON format.
      Only extract the fields mentioned below and return ONLY a valid JSON object with these fields.Dont include any ''' or \` or such characters in the JSON object.:
      
      {
        "title": "brief title or subject of the case",
        "description": "main description or details of the incident",
        "location": {
          "street": "street address where incident occurred",
          "city": "city name",
          "state": "state name",
          "pincode": "postal code if available"
        }
      }
      
      If any field is not found, use null as the value. Do not include any explanations or additional text.
      Here's the text to analyze:

      ${text}
    `;

    try {
      const response = await callGeminiAPI(prompt);
      const jsonResponse = JSON.parse(response.replace(/```json|```/g, ''));
      console.log('Gemini response:', jsonResponse);
      try {
        const extractedData = jsonResponse;
        return extractedData;
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        return null;
      }
    } catch (error) {
      console.error('Error processing with Gemini:', error);
      return null;
    }
  };

  // Enhanced OCR processing with progress tracking
  useEffect(() => {
    const processImage = async () => {
      if (firImage) {
        setIsProcessing(true);
        try {
          // First step: OCR
          const result = await Tesseract.recognize(firImage, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                setProgress(Math.round(m.progress * 50)); // First 50% for OCR
              }
            }
          });
          
          setOcrText(result.data.text);
          setProgress(50); // OCR complete

          // Second step: Gemini processing
          const extractedData = await processWithGemini(result.data.text);
          console.log('Extracted data:', extractedData);
          setProgress(75); // Gemini processing complete

          if (extractedData) {
            // Update form fields with extracted data
            setCaseTitle(extractedData.title || '');
            setCaseDescription(extractedData.description || '');
            if (extractedData.location) {
              setStreet(extractedData.location.street || '');
              setCity(extractedData.location.city || '');
              setStateVal(extractedData.location.state || '');
              setPincode(extractedData.location.pincode || '');
            }
            setProgress(100);
            setNotification({
              type: 'success',
              message: 'Document processed successfully!'
            });
            setReportedBy(Cookies.get('id'));
            
          } else {
            setNotification({
              type: 'warning',
              message: 'Could not extract all information. Please fill in the missing details.'
            });
          }
        } catch (error) {
          setNotification({
            type: 'error',
            message: 'Error processing document. Please try again or fill in manually.'
          });
        } finally {
          setIsProcessing(false);
          setProgress(0);
        }
      }
    };

    processImage();
  }, [firImage]);

  const handleFirUpload = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setFirImage(file);
      } else {
        setNotification({
          type: 'error',
          message: 'Please upload an image file'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const caseData = {
      title: caseTitle,
      description: caseDescription,
      status: caseStatus,
      location: { street, city, state: stateVal, pincode },
      ocrText
    };

    try {
      const response = await fetch("http://localhost:8000/api/case/registerCase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData)
      });
      
      const data = await response.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Case created successfully!' });
        // Reset form
        setCaseTitle('');
        setCaseDescription('');
        setCaseStatus('');
        setStreet('');
        setCity('');
        setStateVal('');
        setPincode('');
        setOcrText('');
        setFirImage(null);
      } else {
        throw new Error(data.message || 'Failed to create case');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error.message || 'Error creating case.' 
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Case</CardTitle>
        </CardHeader>
        <CardContent>
          {notification && (
            <Alert variant={notification.type === 'success' ? 'default' : 'destructive'} className="mb-4">
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FIR Upload Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">FIR Upload (Optional - for automatic data extraction)</h3>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFirUpload}
                className="mb-2"
              />
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing image... {progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
              <Input 
                placeholder="Case Title" 
                required 
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)} 
              />
              <Textarea 
                placeholder="Case Description" 
                required 
                className="min-h-[100px]"
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
              />
              <Select 
                required 
                value={caseStatus} 
                onValueChange={setCaseStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Case Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under investigation">Under Investigation</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Location Details</h3>
              <Input 
                placeholder="Street Address" 
                required 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="City" 
                  required 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input 
                  placeholder="State" 
                  required 
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                />
              </div>
              <Input 
                placeholder="Pincode" 
                required 
                type="number" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>

            {ocrText && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Extracted Text</h3>
                <div className="border p-4 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ocrText}</p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full">
              Create Case
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseAction;