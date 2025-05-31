"use client";

import React, { useState, useEffect } from 'react';
import { Button, Select, SelectItem, Switch } from '@nextui-org/react';
import { MapPin, Loader2, AlertCircle, CheckCircle, Target, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EmergencyMap } from './emergency-map';
import { PreciseLocationMap } from './precise-location-map';

interface LocationSelectorProps {
    value: string;
    onChange: (location: string) => void;
    error?: string;
    isInvalid?: boolean;
}

// Palestinian cities organized by region
const palestinianLocations = {
    westBank: [
        "القدس",
        "القدس الشرقية",
        "رام الله",
        "البيرة",
        "بيت لحم",
        "بيت جالا",
        "بيت ساحور",
        "الخليل",
        "نابلس",
        "جنين",
        "طولكرم",
        "قلقيلية",
        "أريحا",
        "سلفيت",
        "طوباس"
    ],
    gaza: [
        "غزة",
        "خان يونس",
        "رفح",
        "دير البلح",
        "بيت لاهيا",
        "بيت حانون",
        "جباليا"
    ],
    historic: [
        "حيفا",
        "يافا",
        "عكا",
        "الناصرة",
        "صفد",
        "طبريا",
        "بئر السبع",
        "الرملة",
        "اللد"
    ]
};

// Flatten all locations for the selector
const locations = [
    ...palestinianLocations.westBank,
    ...palestinianLocations.gaza,
    ...palestinianLocations.historic
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
    value,
    onChange,
    error,
    isInvalid,
}) => {
    const [showMap, setShowMap] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
    const [usePreciseLocation, setUsePreciseLocation] = useState(false);
    const [useHighAccuracy, setUseHighAccuracy] = useState(true);
    const [preciseCoordinates, setPreciseCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const {
        loading,
        error: geoError,
        coordinates,
        nearestCity,
        isInPalestine,
        accuracy,
        attempts,
        isWatching,
        getCurrentLocation,
        clearError,
        stopWatching,
        isSupported,
        isHighAccuracy,
        isMediumAccuracy,
        accuracyText,
    } = useGeolocation({
        enableHighAccuracy: useHighAccuracy,
        desiredAccuracy: useHighAccuracy ? 50 : 100,
        maxAttempts: 3,
        useWatchPosition: usePreciseLocation,
        timeout: usePreciseLocation ? 20000 : 15000,
    });

    const handleDetectLocation = () => {
        clearError();
        setPreciseCoordinates(null);
        getCurrentLocation();
    };

    const handleUseDetectedLocation = () => {
        if (nearestCity) {
            console.log("Using detected location:", nearestCity);
            onChange(nearestCity);
            setDetectedLocation(nearestCity);
            if (coordinates) {
                setPreciseCoordinates(coordinates);
            }
            setShowMap(true);
        }
    };

    const handleUsePreciseLocation = () => {
        if (coordinates) {
            // Use coordinates as a custom location identifier
            const locationString = `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
            onChange(locationString);
            setDetectedLocation(`موقع دقيق: ${nearestCity || 'غير محدد'}`);
            setPreciseCoordinates(coordinates);
            setShowMap(true);
        }
    };

    const handleStopWatching = () => {
        stopWatching();
    };

    const handlePreciseLocationUpdate = (newCoordinates: { lat: number; lng: number }) => {
        setPreciseCoordinates(newCoordinates);
        const locationString = `${newCoordinates.lat.toFixed(6)},${newCoordinates.lng.toFixed(6)}`;
        onChange(locationString);
    };

    const handleManualSelection = (selectedLocation: string) => {
        console.log("Manual location selected:", selectedLocation);
        onChange(selectedLocation);
        setDetectedLocation(null);
        setShowMap(true);
    };

    useEffect(() => {
        if (value) {
            setShowMap(true);
        }
    }, [value]);

    // Cleanup geolocation watching on unmount
    useEffect(() => {
        return () => {
            if (isWatching) {
                stopWatching();
            }
        };
    }, [isWatching, stopWatching]);

    return (
        <div className="space-y-4">
            {/* Location Detection Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                    <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-2">
                            تحديد الموقع التلقائي
                        </h4>
                        <p className="text-sm text-blue-700 mb-3">
                            اضغط على الزر أدناه لتحديد موقعك الحالي تلقائياً
                        </p>

                        {/* Location Detection Options */}
                        <div className="flex flex-col gap-3 mb-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700">دقة عالية (GPS)</span>
                                <Switch
                                    size="sm"
                                    isSelected={useHighAccuracy}
                                    onValueChange={setUseHighAccuracy}
                                    color="primary"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700">تتبع مستمر للموقع</span>
                                <Switch
                                    size="sm"
                                    isSelected={usePreciseLocation}
                                    onValueChange={setUsePreciseLocation}
                                    color="primary"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="bordered"
                                color="primary"
                                onPress={handleDetectLocation}
                                isLoading={loading}
                                isDisabled={!isSupported || loading}
                                startContent={loading ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
                                size="sm"
                            >
                                {loading ? 'جاري تحديد الموقع...' : 'تحديد موقعي الحالي'}
                            </Button>

                            {isWatching && (
                                <Button
                                    variant="flat"
                                    color="warning"
                                    onPress={handleStopWatching}
                                    size="sm"
                                    startContent={<Crosshair size={16} />}
                                >
                                    إيقاف التتبع
                                </Button>
                            )}
                        </div>

                        {/* Geolocation Results */}
                        <AnimatePresence>
                            {coordinates && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3"
                                >
                                    {isInPalestine ? (
                                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="text-green-600" size={16} />
                                                <span className="text-sm font-medium text-green-800">
                                                    تم تحديد موقعك في فلسطين
                                                </span>
                                            </div>

                                            {/* Location Details */}
                                            <div className="space-y-2 mb-3">
                                                <p className="text-sm text-green-700">
                                                    أقرب مدينة: <strong>{nearestCity}</strong>
                                                </p>
                                                <div className="text-xs text-green-600 space-y-1">
                                                    <div>خط العرض: {coordinates.lat.toFixed(6)}</div>
                                                    <div>خط الطول: {coordinates.lng.toFixed(6)}</div>
                                                    {accuracy && (
                                                        <div className={`flex items-center gap-1 ${
                                                            isHighAccuracy ? 'text-green-600' :
                                                            isMediumAccuracy ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                isHighAccuracy ? 'bg-green-500' :
                                                                isMediumAccuracy ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} />
                                                            {accuracyText}
                                                        </div>
                                                    )}
                                                    {attempts > 1 && (
                                                        <div className="text-gray-500">
                                                            محاولات التحديد: {attempts}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    color="success"
                                                    variant="flat"
                                                    onPress={handleUseDetectedLocation}
                                                >
                                                    استخدام المدينة
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    color="primary"
                                                    variant="flat"
                                                    onPress={handleUsePreciseLocation}
                                                    startContent={<Target size={14} />}
                                                >
                                                    استخدام الموقع الدقيق
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="text-orange-600" size={16} />
                                                <span className="text-sm font-medium text-orange-800">
                                                    الموقع المحدد خارج فلسطين
                                                </span>
                                            </div>
                                            <p className="text-sm text-orange-700">
                                                يرجى اختيار موقعك يدوياً من القائمة أدناه
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {geoError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 bg-red-50 border border-red-200 rounded-md p-3"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertCircle className="text-red-600" size={16} />
                                        <span className="text-sm font-medium text-red-800">
                                            خطأ في تحديد الموقع
                                        </span>
                                    </div>
                                    <p className="text-sm text-red-700">{geoError}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isSupported && (
                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="text-gray-600" size={16} />
                                    <span className="text-sm text-gray-700">
                                        تحديد الموقع غير مدعوم في هذا المتصفح
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Location Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    أو اختر موقعك يدوياً (إجباري) *
                </label>
                <Select
                    label="من فضلك اختر موقعك"
                    selectedKeys={value ? [value] : []}
                    onSelectionChange={(keys) => {
                        const selectedLocation = Array.from(keys)[0] as string;
                        if (selectedLocation) {
                            handleManualSelection(selectedLocation);
                        }
                    }}
                    errorMessage={error}
                    isInvalid={isInvalid}
                    className="w-full"
                >
                    {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                            {location}
                        </SelectItem>
                    ))}
                </Select>
            </div>

            {/* Location Indicator */}
            {detectedLocation && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-md p-3"
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={16} />
                        <span className="text-sm text-green-800">
                            تم تحديد الموقع تلقائياً: <strong>{detectedLocation}</strong>
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Map Preview */}
            <AnimatePresence>
                {showMap && value && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        <label className="text-sm font-medium text-gray-700">
                            معاينة الموقع على الخريطة
                        </label>
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                            {preciseCoordinates ? (
                                <PreciseLocationMap
                                    coordinates={preciseCoordinates}
                                    accuracy={accuracy}
                                    nearestCity={nearestCity}
                                    className="h-48 sm:h-56 md:h-64"
                                    onLocationUpdate={handlePreciseLocationUpdate}
                                    allowManualAdjustment={true}
                                    showAccuracyCircle={true}
                                />
                            ) : (
                                <EmergencyMap
                                    location={value}
                                    className="h-48 sm:h-56 md:h-64"
                                />
                            )}
                        </div>

                        {preciseCoordinates && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-center">
                                    <span>الإحداثيات الدقيقة:</span>
                                    <span className="font-mono">
                                        {preciseCoordinates.lat.toFixed(6)}, {preciseCoordinates.lng.toFixed(6)}
                                    </span>
                                </div>
                                {accuracy && (
                                    <div className="flex justify-between items-center mt-1">
                                        <span>دقة الموقع:</span>
                                        <span className={`font-medium ${
                                            isHighAccuracy ? 'text-green-600' :
                                            isMediumAccuracy ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {Math.round(accuracy)} متر
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
