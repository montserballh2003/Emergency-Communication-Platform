"use client";

import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Divider } from '@nextui-org/react';
import { MapPin, Target, Crosshair, CheckCircle, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { PreciseLocationMap } from '@/components/ui/precise-location-map';

export function LocationAccuracyTest() {
    const [testResults, setTestResults] = useState<Array<{
        timestamp: number;
        coordinates: { lat: number; lng: number };
        accuracy: number;
        method: string;
    }>>([]);

    // Test with high accuracy
    const {
        loading: loadingHigh,
        coordinates: coordsHigh,
        accuracy: accuracyHigh,
        getCurrentLocation: getLocationHigh,
        clearError: clearErrorHigh,
    } = useGeolocation({
        enableHighAccuracy: true,
        desiredAccuracy: 50,
        maxAttempts: 3,
        timeout: 20000,
    });

    // Test with watch position
    const {
        loading: loadingWatch,
        coordinates: coordsWatch,
        accuracy: accuracyWatch,
        isWatching,
        getCurrentLocation: getLocationWatch,
        stopWatching,
        clearError: clearErrorWatch,
    } = useGeolocation({
        enableHighAccuracy: true,
        desiredAccuracy: 30,
        maxAttempts: 5,
        useWatchPosition: true,
        timeout: 25000,
    });

    // Test with standard accuracy
    const {
        loading: loadingStandard,
        coordinates: coordsStandard,
        accuracy: accuracyStandard,
        getCurrentLocation: getLocationStandard,
        clearError: clearErrorStandard,
    } = useGeolocation({
        enableHighAccuracy: false,
        desiredAccuracy: 100,
        maxAttempts: 2,
        timeout: 10000,
    });

    const runHighAccuracyTest = () => {
        clearErrorHigh();
        getLocationHigh();
    };

    const runWatchPositionTest = () => {
        clearErrorWatch();
        getLocationWatch();
    };

    const runStandardTest = () => {
        clearErrorStandard();
        getLocationStandard();
    };

    const addTestResult = (coordinates: { lat: number; lng: number }, accuracy: number, method: string) => {
        setTestResults(prev => [...prev, {
            timestamp: Date.now(),
            coordinates,
            accuracy,
            method
        }]);
    };

    React.useEffect(() => {
        if (coordsHigh && accuracyHigh) {
            addTestResult(coordsHigh, accuracyHigh, 'High Accuracy');
        }
    }, [coordsHigh, accuracyHigh]);

    React.useEffect(() => {
        if (coordsWatch && accuracyWatch) {
            addTestResult(coordsWatch, accuracyWatch, 'Watch Position');
        }
    }, [coordsWatch, accuracyWatch]);

    React.useEffect(() => {
        if (coordsStandard && accuracyStandard) {
            addTestResult(coordsStandard, accuracyStandard, 'Standard');
        }
    }, [coordsStandard, accuracyStandard]);

    const getAccuracyColor = (accuracy: number) => {
        if (accuracy <= 50) return 'text-green-600';
        if (accuracy <= 100) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getAccuracyIcon = (accuracy: number) => {
        if (accuracy <= 50) return <CheckCircle className="text-green-600" size={16} />;
        if (accuracy <= 100) return <AlertCircle className="text-yellow-600" size={16} />;
        return <AlertCircle className="text-red-600" size={16} />;
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Target className="text-blue-600" />
                        اختبار دقة تحديد الموقع
                    </h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    {/* Test Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            color="primary"
                            variant="flat"
                            onPress={runHighAccuracyTest}
                            isLoading={loadingHigh}
                            startContent={<Target size={16} />}
                        >
                            اختبار الدقة العالية
                        </Button>
                        
                        <Button
                            color="secondary"
                            variant="flat"
                            onPress={runWatchPositionTest}
                            isLoading={loadingWatch}
                            startContent={<Crosshair size={16} />}
                        >
                            {isWatching ? 'إيقاف التتبع' : 'اختبار التتبع المستمر'}
                        </Button>
                        
                        <Button
                            color="default"
                            variant="flat"
                            onPress={runStandardTest}
                            isLoading={loadingStandard}
                            startContent={<MapPin size={16} />}
                        >
                            اختبار الدقة العادية
                        </Button>
                    </div>

                    {isWatching && (
                        <Button
                            color="warning"
                            variant="flat"
                            onPress={stopWatching}
                            size="sm"
                        >
                            إيقاف التتبع المستمر
                        </Button>
                    )}

                    <Divider />

                    {/* Current Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* High Accuracy Result */}
                        <Card className="border">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-semibold">الدقة العالية</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                {coordsHigh ? (
                                    <div className="space-y-2 text-xs">
                                        <div>خط العرض: {coordsHigh.lat.toFixed(6)}</div>
                                        <div>خط الطول: {coordsHigh.lng.toFixed(6)}</div>
                                        <div className={`flex items-center gap-1 ${getAccuracyColor(accuracyHigh || 0)}`}>
                                            {getAccuracyIcon(accuracyHigh || 0)}
                                            دقة: {accuracyHigh ? Math.round(accuracyHigh) : 'غير محدد'} متر
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-xs">لم يتم تحديد الموقع بعد</div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Watch Position Result */}
                        <Card className="border">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-semibold">التتبع المستمر</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                {coordsWatch ? (
                                    <div className="space-y-2 text-xs">
                                        <div>خط العرض: {coordsWatch.lat.toFixed(6)}</div>
                                        <div>خط الطول: {coordsWatch.lng.toFixed(6)}</div>
                                        <div className={`flex items-center gap-1 ${getAccuracyColor(accuracyWatch || 0)}`}>
                                            {getAccuracyIcon(accuracyWatch || 0)}
                                            دقة: {accuracyWatch ? Math.round(accuracyWatch) : 'غير محدد'} متر
                                        </div>
                                        {isWatching && (
                                            <div className="text-blue-600 text-xs">🔄 يتم التتبع...</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-xs">لم يتم تحديد الموقع بعد</div>
                                )}
                            </CardBody>
                        </Card>

                        {/* Standard Result */}
                        <Card className="border">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-semibold">الدقة العادية</h3>
                            </CardHeader>
                            <CardBody className="pt-0">
                                {coordsStandard ? (
                                    <div className="space-y-2 text-xs">
                                        <div>خط العرض: {coordsStandard.lat.toFixed(6)}</div>
                                        <div>خط الطول: {coordsStandard.lng.toFixed(6)}</div>
                                        <div className={`flex items-center gap-1 ${getAccuracyColor(accuracyStandard || 0)}`}>
                                            {getAccuracyIcon(accuracyStandard || 0)}
                                            دقة: {accuracyStandard ? Math.round(accuracyStandard) : 'غير محدد'} متر
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-xs">لم يتم تحديد الموقع بعد</div>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    {/* Map Display */}
                    {(coordsHigh || coordsWatch || coordsStandard) && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">عرض الموقع على الخريطة</h3>
                            <PreciseLocationMap
                                coordinates={coordsWatch || coordsHigh || coordsStandard || null}
                                accuracy={accuracyWatch || accuracyHigh || accuracyStandard || null}
                                className="h-64"
                                showAccuracyCircle={true}
                                allowManualAdjustment={false}
                            />
                        </div>
                    )}

                    {/* Test Results History */}
                    {testResults.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">سجل نتائج الاختبار</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {testResults.slice(-10).reverse().map((result) => (
                                    <div key={result.timestamp} className="bg-gray-50 p-2 rounded text-xs">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{result.method}</span>
                                            <span className={getAccuracyColor(result.accuracy)}>
                                                {Math.round(result.accuracy)}م
                                            </span>
                                        </div>
                                        <div className="text-gray-600 font-mono">
                                            {result.coordinates.lat.toFixed(6)}, {result.coordinates.lng.toFixed(6)}
                                        </div>
                                        <div className="text-gray-500">
                                            {new Date(result.timestamp).toLocaleTimeString('ar-EG')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
