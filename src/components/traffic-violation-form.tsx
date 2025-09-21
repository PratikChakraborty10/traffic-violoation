"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Camera, Video, CheckCircle, Loader2, X } from "lucide-react";
import { uploadMultipleFiles, generateIncidentId, submitTrafficViolation } from "@/lib/api";

interface LocationData {
  city: string;
  state: string;
  latitude: string;
  longitude: string;
}

interface FormData {
  location: LocationData;
  description: string;
  media: File[];
}

export function TrafficViolationForm() {
  const [formData, setFormData] = useState<FormData>({
    location: { city: "", state: "", latitude: "", longitude: "" },
    description: "",
    media: [],
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [incidentId, setIncidentId] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-request location on component mount
  useEffect(() => {
    // Auto-request location when component mounts
    getCurrentLocation();
    
    return () => {
      stopCamera();
    };
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Using OpenStreetMap Nominatim for reverse geocoding
          const response = await fetch(
            `/api/geocode?latitude=${latitude}&longitude=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("OpenStreetMap geocoding result:", data);

          // Extract city with better fallbacks
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            data.address?.hamlet ||
            data.address?.suburb ||
            data.address?.county ||
            data.address?.city_district ||
            "Location detected";

          // Extract state with better fallbacks
          const state =
            data.address?.state ||
            data.address?.province ||
            data.address?.region ||
            data.address?.county ||
            data.address?.state_district ||
            "GPS coordinates available";

          console.log("Extracted location:", { city, state });

          setFormData((prev) => ({
            ...prev,
            location: {
              city,
              state,
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            },
          }));
        } catch (error) {
          console.error("Geocoding error:", error);
          // Fallback to coordinates with better labels
          setFormData((prev) => ({
            ...prev,
            location: {
              city: "Location detected",
              state: "GPS coordinates available",
              latitude: latitude.toFixed(6),
              longitude: longitude.toFixed(6),
            },
          }));
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to retrieve your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access denied. Please enable location permission in your browser settings and refresh the page.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please try again.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const startCamera = async () => {
    try {
      // Stop any existing camera first
      stopCamera();
      
      console.log("Starting camera...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Camera stream loaded, video ready");
          setIsCameraReady(true);
        };
        
        videoRef.current.onerror = (error) => {
          console.error("Video element error:", error);
          setIsCameraReady(false);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraReady(false);
    }
  };

  const capturePhoto = async () => {
    console.log("Attempting to capture photo...", {
      hasVideoRef: !!videoRef.current,
      hasStream: !!streamRef.current,
      isCameraReady,
      videoWidth: videoRef.current?.videoWidth,
      videoHeight: videoRef.current?.videoHeight
    });

    if (!videoRef.current || !streamRef.current || !isCameraReady) {
      console.error("Camera not ready for photo capture");
      setSubmitError("Camera is not ready. Please wait for camera to load or try again.");
      return;
    }

    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error("Video dimensions not available");
      setSubmitError("Camera video not ready. Please wait a moment and try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      console.error("Could not get canvas context");
      setSubmitError("Failed to capture photo. Please try again.");
      return;
    }

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    console.log("Capturing photo with dimensions:", canvas.width, "x", canvas.height);

    try {
      context.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("Photo captured, blob size:", blob.size);
            const file = new File([blob], `photo-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            
            // Check file size before adding to form
            if (!validateFileSize(file)) {
              setSubmitError("Photo is too large (max 10MB). Please try capturing a smaller image.");
              return;
            }
            
            // Clear existing media and add only this photo
            setFormData((prev) => ({
              ...prev,
              media: [file], // Replace all media with just this photo
            }));
            
            console.log("Photo added to form data");
            setSubmitError(""); // Clear any previous errors
          } else {
            console.error("Failed to create blob from canvas");
            setSubmitError("Failed to process photo. Please try again.");
          }
        },
        "image/jpeg",
        0.8
      );

      // Stop camera after capture
      stopCamera();
    } catch (error) {
      console.error("Error during photo capture:", error);
      setSubmitError("Failed to capture photo. Please try again.");
    }
  };

  const startVideoRecording = async () => {
    try {
      // Stop any existing camera first
      stopCamera();
      
      console.log("Starting video recording...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: true,
      });
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log("Video stream loaded, starting recording");
          setIsCameraReady(true);
        };
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: "video/webm",
        });
        
        // Check file size before adding to form
        if (!validateFileSize(file)) {
          setSubmitError("Video is too large (max 10MB). Please try recording a shorter video.");
          stopCamera();
          return;
        }
        
        // Clear existing media and add only this video
        setFormData((prev) => ({ 
          ...prev, 
          media: [file] // Replace all media with just this video
        }));
        
        console.log("Video recorded and added to form data");
        stopCamera();
      };

      // Start recording after a short delay to ensure video is ready
      setTimeout(() => {
        if (mediaRecorder.state === 'inactive') {
          mediaRecorder.start();
          setIsRecording(true);
        }
      }, 500);

    } catch (error) {
      console.error("Error starting video recording:", error);
      setIsCameraReady(false);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        // Explicitly release the track to free up camera resources
        track.enabled = false;
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      // Clear event listeners
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onerror = null;
    }
    
    // Reset all camera states
    setIsRecording(false);
    setIsCameraReady(false);
    mediaRecorderRef.current = null;
    
    console.log("Camera stopped and cleaned up");
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitProgress("");
    setCurrentStep(0);

    try {
      // Validate media files first
      if (formData.media.length === 0) {
        setSubmitError("Please capture one photo or video as evidence");
        return;
      }

      if (formData.media.length !== 1) {
        setSubmitError("Please capture exactly one photo or video as evidence");
        return;
      }

      // Check file size before proceeding
      const mediaFile = formData.media[0];
      if (!validateFileSize(mediaFile)) {
        setSubmitError("File size must not exceed 10MB. Please capture a smaller photo or video.");
        return;
      }

      // Step 1: Generate incident ID
      setCurrentStep(1);
      setSubmitProgress("Generating unique incident ID...");
      const incidentIdResult = await generateIncidentId();
      if (!incidentIdResult.success || !incidentIdResult.incidentId) {
        setSubmitError(incidentIdResult.error || "Failed to generate incident ID");
        return;
      }

      const newIncidentId = incidentIdResult.incidentId;
      setCurrentStep(2);
      setSubmitProgress("Incident ID generated successfully");

      // Step 2: Upload media files
      setCurrentStep(3);
      setSubmitProgress("Uploading media file to cloud storage...");
      console.log("Starting media upload for", formData.media.length, "files");
      const uploadResult = await uploadMultipleFiles(formData.media, newIncidentId);
      
      if (uploadResult.errors.length > 0) {
        console.error("Media upload errors:", uploadResult.errors);
        setSubmitError(`Failed to upload media files: ${uploadResult.errors.join(", ")}`);
        return;
      }

      if (uploadResult.urls.length === 0) {
        setSubmitError("No media files were successfully uploaded");
        return;
      }

      console.log("Successfully uploaded media URLs:", uploadResult.urls);
      const mediaUrls = uploadResult.urls;
      setCurrentStep(4);
      setSubmitProgress("Media file uploaded successfully");

      // Step 3: Submit form data to database
      setCurrentStep(5);
      setSubmitProgress("Submitting report to database...");
      const submissionData = {
        incident_id: newIncidentId,
        description: formData.description,
        city: formData.location.city,
        state: formData.location.state,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude),
        media_urls: mediaUrls
      };

      const result = await submitTrafficViolation(submissionData);
      
      if (result.success) {
        setCurrentStep(6);
        setSubmitProgress("Report submitted successfully!");
        setIncidentId(newIncidentId);
        setIsSubmitted(true);
        // Stop camera and release permissions after successful submission
        stopCamera();
      } else {
        setSubmitError(result.error || "Failed to submit report");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // File size validation function
  const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    return file.size <= maxSize;
  };

  const resetForm = () => {
    setFormData({
      location: { city: "", state: "", latitude: "", longitude: "" },
      description: "",
      media: [],
    });
    setIsSubmitted(false);
    setIncidentId("");
    setSubmitError("");
    setSubmitProgress("");
    setCurrentStep(0);
    // Ensure camera is stopped and permissions are released
    stopCamera();
  };

  if (isSubmitted) {
    return (
      <Card className="w-full shadow-lg border-0 bg-white">
        <CardContent className="pt-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Report Submitted Successfully
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Thank you for helping make our roads safer. Your report has been
              received and will be reviewed by the authorities within 24 hours.
            </p>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8 border border-emerald-200">
              <Label className="text-sm font-medium text-slate-600 uppercase tracking-wide">
                Your Incident ID
              </Label>
              <p className="text-3xl font-mono font-bold text-emerald-600 mt-2">
                {incidentId}
              </p>
              <p className="text-sm text-slate-600 mt-3">
                Save this ID to track your report status and receive updates
              </p>
            </div>

            <Button
              onClick={resetForm}
              className="w-full sm:w-auto px-8 py-3 text-base font-medium"
            >
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900">
          Report Incident Details
        </CardTitle>
        <p className="text-slate-600">
          Please provide accurate information to help authorities investigate
          the violation.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between">
              <Label className="text-lg font-semibold text-slate-900">
                Location Information
              </Label>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex w-full md:w-auto items-center gap-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                {isGettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isGettingLocation
                  ? "Getting Location..."
                  : "Refresh Location"}
              </Button>
            </div>
            
            {isGettingLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Auto-detecting location...</strong> Please allow location access when prompted by your browser.
                </p>
              </div>
            )}

            {locationError && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  {locationError}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-slate-700"
                >
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  placeholder="Auto-filled from location"
                  disabled
                  className="bg-slate-50 text-slate-600"
                  required
                />
              </div>
              <div>
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-slate-700"
                >
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.location.state}
                  placeholder="Auto-filled from location"
                  disabled
                  className="bg-slate-50 text-slate-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="latitude"
                  className="text-sm font-medium text-slate-700"
                >
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  value={formData.location.latitude}
                  placeholder="Auto-filled from location"
                  disabled
                  className="bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <Label
                  htmlFor="longitude"
                  className="text-sm font-medium text-slate-700"
                >
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  value={formData.location.longitude}
                  placeholder="Auto-filled from location"
                  disabled
                  className="bg-slate-50 text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <Label
              htmlFor="description"
              className="text-lg font-semibold text-slate-900"
            >
              Incident Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Please describe the traffic violation in detail. Include information such as vehicle type, license plate (if visible), time of incident, and specific violation observed."
              className="min-h-[140px] resize-none border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              maxLength={1000}
              required
            />
            <p className="text-sm text-slate-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold text-slate-900">
              Evidence Capture <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-slate-600">
              Capture either a photo OR video directly from your device camera for
              evidence. <span className="text-red-600 font-medium">One media file is required.</span>
            </p>
            
            {formData.media.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Current media:</strong> {formData.media[0].type.startsWith('image/') ? 'Photo' : 'Video'} 
                  {formData.media[0].type.startsWith('image/') 
                    ? ' - You can replace it with a video if needed' 
                    : ' - You can replace it with a photo if needed'
                  }
                </p>
              </div>
            )}

            {/* Camera Controls */}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={isRecording ? stopVideoRecording : startVideoRecording}
                className={`flex items-center gap-2 ${
                  isRecording
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <Video className="w-4 h-4" />
                {isRecording ? "Stop Recording" : "Record Video"}
              </Button>
            </div>

            {/* Camera Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg bg-slate-100 hidden"
                style={{ display: streamRef.current ? "block" : "none" }}
              />
               {streamRef.current && !isRecording && (
                 <div className="flex justify-center gap-3 mt-3">
                   <Button
                     type="button"
                     onClick={capturePhoto}
                     disabled={!isCameraReady}
                     className={`${isCameraReady ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}
                   >
                     {isCameraReady ? 'Capture Photo' : 'Camera Loading...'}
                   </Button>
                   <Button type="button" variant="outline" onClick={stopCamera}>
                     Cancel
                   </Button>
                 </div>
               )}
               
               {streamRef.current && !isCameraReady && (
                 <div className="text-center mt-2">
                   <p className="text-sm text-amber-600">
                     Camera is loading... Please wait
                   </p>
                 </div>
               )}
            </div>

            {/* Media Preview */}
            {formData.media.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Captured Evidence:
                </p>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    {formData.media[0].type.startsWith("image/") ? (
                      <Camera className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Video className="w-5 h-5 text-purple-600" />
                    )}
                    <div>
                      <span className="text-sm font-medium text-slate-700 truncate block max-w-[200px]">
                        {formData.media[0].name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {(formData.media[0].size / (1024 * 1024)).toFixed(1)}MB • 
                        {formData.media[0].type.startsWith("image/") ? " Photo" : " Video"}
                        {!validateFileSize(formData.media[0]) && (
                          <span className="text-red-600 font-medium"> (Too large - max 10MB)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedia(0)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {submitError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Stepper */}
          {isSubmitting && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-blue-800">Submitting Report</h3>
                </div>
                
                {/* Stepper */}
                <div className="space-y-3">
                  {[
                    { step: 1, title: "Generating Incident ID", description: "Creating unique identifier" },
                    { step: 2, title: "Incident ID Ready", description: "ID generated successfully" },
                    { step: 3, title: "Uploading Media", description: "Saving photo/video to cloud" },
                    { step: 4, title: "Media Uploaded", description: "File saved successfully" },
                    { step: 5, title: "Submitting Report", description: "Saving to database" },
                    { step: 6, title: "Complete", description: "Report submitted successfully" }
                  ].map((item, index) => {
                    const isCompleted = currentStep > item.step;
                    const isCurrent = currentStep === item.step;
                    
                    return (
                      <div key={item.step} className="flex items-center space-x-3">
                        {/* Step Circle */}
                        {(() => {
                          let circleClass = 'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ';
                          let circleContent;
                          
                          if (isCompleted) {
                            circleClass += 'bg-green-500 text-white';
                            circleContent = <CheckCircle className="w-5 h-5" />;
                          } else if (isCurrent) {
                            circleClass += 'bg-blue-500 text-white';
                            circleContent = <Loader2 className="w-4 h-4 animate-spin" />;
                          } else {
                            circleClass += 'bg-gray-200 text-gray-500';
                            circleContent = item.step;
                          }
                          
                          return (
                            <div className={circleClass}>
                              {circleContent}
                            </div>
                          );
                        })()}
                        
                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {item.title}
                          </p>
                          <p className={`text-xs ${
                            isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Progress Line */}
                        {index < 5 && (
                          <div className={`w-px h-8 ml-4 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Current Status */}
                {submitProgress && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium">{submitProgress}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg"
            disabled={
              isSubmitting ||
              !formData.location.latitude ||
              !formData.description.trim() ||
              formData.media.length !== 1
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting Report...
              </>
            ) : (
              "Submit Traffic Violation Report"
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By submitting this report, you confirm that the information provided
            is accurate to the best of your knowledge.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
