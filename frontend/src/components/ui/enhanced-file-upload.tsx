"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { Button, cn } from "@nextui-org/react";
import Image from "next/image";
import { CameraCapture } from "./camera-capture";
import { isCameraSupported } from "@/lib/utils";

type Props = {
    onChange?: (files: File[]) => void;
    isMultiple?: boolean;
    maxFiles?: number;
    value?: File[];
};

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 20,
        y: -20,
        opacity: 0.9,
    },
};

// Removed unused secondaryVariant

export const EnhancedFileUpload = ({
    onChange,
    isMultiple = true,
    maxFiles = 5,
    value = []
}: Props) => {
    const [files, setFiles] = useState<File[]>(value);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync internal state with external value prop
    React.useEffect(() => {
        setFiles(value);
    }, [value]);

    const handleFileChange = (newFiles: File[]) => {
        console.log("handleFileChange called with:", newFiles.length, "files");
        const totalFiles = files.length + newFiles.length;

        if (totalFiles > maxFiles) {
            const allowedFiles = newFiles.slice(0, maxFiles - files.length);
            const updatedFiles = [...files, ...allowedFiles];
            console.log("Updated files (limited):", updatedFiles.length);
            setFiles(updatedFiles);
            onChange?.(updatedFiles);
        } else {
            const updatedFiles = [...files, ...newFiles];
            console.log("Updated files:", updatedFiles.length);
            setFiles(updatedFiles);
            onChange?.(updatedFiles);
        }
    };

    const handleCameraCapture = (file: File) => {
        console.log("Camera capture - file received:", file.name, file.size);
        if (files.length < maxFiles) {
            const updatedFiles = [...files, file];
            console.log("Camera capture - updated files:", updatedFiles.length);
            setFiles(updatedFiles);
            onChange?.(updatedFiles);
        } else {
            console.log("Camera capture - max files reached");
        }
        setShowCamera(false);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onChange?.(updatedFiles);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const { getRootProps, isDragActive } = useDropzone({
        multiple: isMultiple,
        noClick: true,
        onDrop: handleFileChange,
        onDropRejected: (error) => {
            console.log(error);
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: maxFiles - files.length,
    });

    return (
        <div className="w-full space-y-4">
            {/* Upload Area */}
            <div className="w-full" {...getRootProps()}>
                <motion.div
                    whileHover="animate"
                    className="p-6 sm:p-8 md:p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                >
                    <input
                        ref={fileInputRef}
                        id="file-upload-handle"
                        type="file"
                        multiple={isMultiple}
                        accept="image/*"
                        onChange={(e) =>
                            handleFileChange(Array.from(e.target.files || []))
                        }
                        className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center text-center">
                        {!files.length && (
                            <motion.div
                                layoutId="file-upload"
                                variants={mainVariant}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className={cn(
                                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-24 w-24 mx-auto rounded-md mb-4",
                                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                                )}
                            >
                                {isDragActive ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-neutral-600 flex flex-col items-center"
                                    >
                                        <Upload className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                                    </motion.p>
                                ) : (
                                    <Upload className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
                                )}
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                    اسحب الصور هنا أو
                                </p>
                                <p className="text-neutral-400 dark:text-neutral-600 text-xs">
                                    يمكنك رفع حتى {maxFiles} صور (حد أقصى 5 ميجابايت لكل صورة)
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Button
                                    variant="bordered"
                                    size="sm"
                                    onPress={handleClick}
                                    startContent={<ImageIcon size={16} />}
                                    className="w-full sm:w-auto"
                                >
                                    اختر من الجهاز
                                </Button>
                                
                                {isCameraSupported() && (
                                    <Button
                                        variant="bordered"
                                        size="sm"
                                        onPress={() => setShowCamera(true)}
                                        startContent={<Camera size={16} />}
                                        className="w-full sm:w-auto"
                                        isDisabled={files.length >= maxFiles}
                                    >
                                        التقط صورة
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* File Preview Grid */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">
                                الصور المرفوعة ({files.length}/{maxFiles})
                            </h4>
                            {files.length > 0 && (
                                <Button
                                    variant="light"
                                    size="sm"
                                    onPress={() => {
                                        setFiles([]);
                                        onChange?.([]);
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    حذف الكل
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {files.map((file, index) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square"
                                >
                                    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="solid"
                                        color="danger"
                                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onPress={() => removeFile(index)}
                                    >
                                        <X size={14} />
                                    </Button>

                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                        {file.name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Capture Modal */}
            <CameraCapture
                isOpen={showCamera}
                onCapture={handleCameraCapture}
                onClose={() => setShowCamera(false)}
            />
        </div>
    );
};
