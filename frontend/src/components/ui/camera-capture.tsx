"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@nextui-org/react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { isCameraSupported, dataURLtoFile } from '@/lib/utils';
import { toast } from 'sonner';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
    onCapture,
    onClose,
    isOpen,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    const startCamera = useCallback(async () => {
        if (!isCameraSupported()) {
            toast.error('الكاميرا غير مدعومة في هذا المتصفح');
            return;
        }

        setIsLoading(true);
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            let errorMessage = 'فشل في الوصول إلى الكاميرا';
            
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'تم رفض الإذن للوصول إلى الكاميرا. يرجى السماح بالوصول في إعدادات المتصفح';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'لم يتم العثور على كاميرا متاحة';
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'الكاميرا قيد الاستخدام من تطبيق آخر';
                }
            }
            
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [facingMode]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsStreaming(false);
        setCapturedImage(null);
    }, []);

    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
    }, [stopCamera]);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    const confirmPhoto = useCallback(() => {
        if (!capturedImage) return;

        const timestamp = new Date().getTime();
        const file = dataURLtoFile(capturedImage, `emergency-photo-${timestamp}.jpg`);
        console.log("Camera - created file:", file.name, file.size, file.type);
        onCapture(file);
        setCapturedImage(null); // Reset captured image
        onClose();
    }, [capturedImage, onCapture, onClose]);

    const switchCamera = useCallback(() => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        if (isStreaming) {
            stopCamera();
            setTimeout(startCamera, 100);
        }
    }, [isStreaming, stopCamera, startCamera]);

    const handleClose = useCallback(() => {
        stopCamera();
        onClose();
    }, [stopCamera, onClose]);

    // Start camera when component opens
    React.useEffect(() => {
        if (isOpen && !capturedImage) {
            startCamera();
        }
        
        return () => {
            if (!isOpen) {
                stopCamera();
            }
        };
    }, [isOpen, capturedImage, startCamera, stopCamera]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold">التقاط صورة</h3>
                        <Button
                            isIconOnly
                            variant="light"
                            onPress={handleClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    {/* Camera/Preview Area */}
                    <div className="relative aspect-video bg-gray-900">
                        {capturedImage ? (
                            <Image
                                src={capturedImage}
                                alt="Captured"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    playsInline
                                    muted
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                                        <div className="text-white text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                            <p>جاري تشغيل الكاميرا...</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Controls */}
                    <div className="p-4 bg-gray-50">
                        {capturedImage ? (
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="bordered"
                                    onPress={retakePhoto}
                                    startContent={<RotateCcw size={18} />}
                                >
                                    إعادة التقاط
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={confirmPhoto}
                                    startContent={<Check size={18} />}
                                >
                                    تأكيد الصورة
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="bordered"
                                    onPress={switchCamera}
                                    startContent={<RotateCcw size={18} />}
                                    isDisabled={isLoading}
                                >
                                    تبديل الكاميرا
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={capturePhoto}
                                    startContent={<Camera size={18} />}
                                    isDisabled={!isStreaming || isLoading}
                                    size="lg"
                                >
                                    التقاط صورة
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
