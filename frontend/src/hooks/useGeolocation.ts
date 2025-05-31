"use client";

import { useState, useCallback, useMemo, useRef } from 'react';
import { isPalestineCoordinate, findNearestPalestineCity } from '@/lib/utils';

interface GeolocationState {
    loading: boolean;
    error: string | null;
    coordinates: { lat: number; lng: number } | null;
    nearestCity: string | null;
    isInPalestine: boolean;
    accuracy: number | null;
    timestamp: number | null;
    attempts: number;
    isWatching: boolean;
}

interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    desiredAccuracy?: number; // Desired accuracy in meters
    maxAttempts?: number;
    useWatchPosition?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
    const [state, setState] = useState<GeolocationState>({
        loading: false,
        error: null,
        coordinates: null,
        nearestCity: null,
        isInPalestine: false,
        accuracy: null,
        timestamp: null,
        attempts: 0,
        isWatching: false,
    });

    const watchId = useRef<number | null>(null);
    const bestPosition = useRef<GeolocationPosition | null>(null);

    const defaultOptions: PositionOptions = useMemo(() => ({
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 60000, // Reduced to 1 minute for fresher data
        ...options,
    }), [options]);

    const processPosition = useCallback((position: GeolocationPosition) => {
        const { accuracy } = position.coords;
        const desiredAccuracy = options.desiredAccuracy || 100; // Default 100 meters

        // Check if this position is better than the previous one
        const isBetterPosition = !bestPosition.current ||
            (accuracy < (bestPosition.current.coords.accuracy || Infinity)) ||
            (accuracy <= desiredAccuracy &&
             (!bestPosition.current.coords.accuracy || bestPosition.current.coords.accuracy > desiredAccuracy));

        if (isBetterPosition) {
            bestPosition.current = position;
        }

        const currentPosition = bestPosition.current;
        if (!currentPosition) return;

        const { latitude: lat, longitude: lng, accuracy: acc } = currentPosition.coords;

        const isInPalestine = isPalestineCoordinate(lat, lng);
        const nearestCity = isInPalestine ? findNearestPalestineCity(lat, lng) : null;

        const newAttempts = state.attempts + 1;

        setState(prev => ({
            ...prev,
            loading: false,
            error: null,
            coordinates: { lat, lng },
            nearestCity,
            isInPalestine,
            accuracy: acc || null,
            timestamp: currentPosition.timestamp,
            attempts: newAttempts,
        }));

        // If we have good accuracy or reached max attempts, stop trying
        const maxAttempts = options.maxAttempts || 3;
        if ((acc && acc <= desiredAccuracy) || newAttempts >= maxAttempts) {
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
                setState(prev => ({ ...prev, isWatching: false }));
            }
        }
    }, [options.desiredAccuracy, options.maxAttempts, state.attempts]);

    const handleError = useCallback((error: GeolocationPositionError) => {
        let errorMessage = 'حدث خطأ في تحديد الموقع';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'تم رفض الإذن للوصول إلى الموقع. يرجى السماح بالوصول للموقع في إعدادات المتصفح';
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'معلومات الموقع غير متاحة حالياً. تأكد من تفعيل خدمات الموقع';
                break;
            case error.TIMEOUT:
                errorMessage = 'انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى';
                break;
            default:
                errorMessage = 'حدث خطأ غير معروف في تحديد الموقع';
                break;
        }

        setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
            isWatching: false,
        }));

        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    }, []);

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'الموقع الجغرافي غير مدعوم في هذا المتصفح',
                loading: false,
            }));
            return;
        }

        // Reset state
        setState(prev => ({
            ...prev,
            loading: true,
            error: null,
            attempts: 0,
            isWatching: !!options.useWatchPosition
        }));
        bestPosition.current = null;

        if (options.useWatchPosition) {
            // Use watchPosition for continuous updates and better accuracy
            watchId.current = navigator.geolocation.watchPosition(
                processPosition,
                handleError,
                defaultOptions
            );
        } else {
            // Use getCurrentPosition with multiple attempts
            navigator.geolocation.getCurrentPosition(
                processPosition,
                handleError,
                defaultOptions
            );
        }
    }, [defaultOptions, options.useWatchPosition, processPosition, handleError]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const stopWatching = useCallback(() => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
            setState(prev => ({ ...prev, isWatching: false, loading: false }));
        }
    }, []);

    const reset = useCallback(() => {
        stopWatching();
        bestPosition.current = null;
        setState({
            loading: false,
            error: null,
            coordinates: null,
            nearestCity: null,
            isInPalestine: false,
            accuracy: null,
            timestamp: null,
            attempts: 0,
            isWatching: false,
        });
    }, [stopWatching]);

    // Cleanup on unmount
    const cleanup = useCallback(() => {
        if (watchId.current) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    }, []);

    return {
        ...state,
        getCurrentLocation,
        clearError,
        reset,
        stopWatching,
        cleanup,
        isSupported: !!navigator.geolocation,
        // Helper methods for accuracy assessment
        isHighAccuracy: state.accuracy !== null && state.accuracy <= 50,
        isMediumAccuracy: state.accuracy !== null && state.accuracy > 50 && state.accuracy <= 100,
        isLowAccuracy: state.accuracy !== null && state.accuracy > 100,
        accuracyText: state.accuracy
            ? `دقة الموقع: ${Math.round(state.accuracy)} متر`
            : null,
    };
};
