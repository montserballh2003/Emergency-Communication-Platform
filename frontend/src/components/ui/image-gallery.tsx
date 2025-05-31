"use client";

import { useState } from "react";
import { Image, Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
    images: { id: number; image: string }[];
    className?: string;
}

export function ImageGallery({ images, className = "" }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (index: number) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImageIndex(null);
    };

    const goToPrevious = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const goToNext = () => {
        if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    if (!images || images.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                لا توجد صور مرفقة
            </div>
        );
    }

    return (
        <>
            <div className={`space-y-4 ${className}`}>
                <h3 className="text-lg font-semibold text-right">
                    الصور المرفقة ({images.length})
                </h3>
                
                {/* Image Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" dir="ltr">
                    {images.map((imageItem, index) => (
                        <div
                            key={imageItem.id}
                            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
                            onClick={() => openModal(index)}
                        >
                            <Image
                                src={imageItem.image || "/placeholder.svg"}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                size="full"
                classNames={{
                    base: "bg-black bg-opacity-95 z-[100000]",
                    body: "p-0",
                    wrapper: "items-center justify-center z-[100000]"
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                            },
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            transition: {
                                duration: 0.2,
                                ease: "easeIn",
                            },
                        },
                    }
                }}
            >
                <ModalContent>
                    <ModalBody className="relative flex items-center justify-center min-h-screen">
                        {selectedImageIndex !== null && (
                            <>
                                {/* Close Button */}
                                <Button
                                    isIconOnly
                                    variant="light"
                                    className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20"
                                    onClick={closeModal}
                                >
                                    <X className="w-6 h-6" />
                                </Button>

                                {/* Navigation Buttons */}
                                {images.length > 1 && (
                                    <>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 disabled:opacity-50 bg-black bg-opacity-30 rounded-full"
                                            onClick={document.documentElement.dir === 'rtl' ? goToNext : goToPrevious}
                                            disabled={document.documentElement.dir === 'rtl' ? selectedImageIndex === images.length - 1 : selectedImageIndex === 0}
                                        >
                                            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                                        </Button>

                                        <Button
                                            isIconOnly
                                            variant="light"
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 disabled:opacity-50 bg-black bg-opacity-30 rounded-full"
                                            onClick={document.documentElement.dir === 'rtl' ? goToPrevious : goToNext}
                                            disabled={document.documentElement.dir === 'rtl' ? selectedImageIndex === 0 : selectedImageIndex === images.length - 1}
                                        >
                                            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                        </Button>
                                    </>
                                )}

                                {/* Image Counter */}
                                {images.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                        {selectedImageIndex + 1} / {images.length}
                                    </div>
                                )}

                                {/* Main Image */}
                                <div className="max-w-full max-h-full p-8">
                                    <Image
                                        src={images[selectedImageIndex].image || "/placeholder.svg"}
                                        alt={`صورة ${selectedImageIndex + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                            </>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
}
