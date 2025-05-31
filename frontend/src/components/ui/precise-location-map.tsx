"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Button } from "@nextui-org/react";
import { MapPin, Target, Crosshair } from "lucide-react";
import { getMapStyle, markerStyles, getCoordinateRegion } from "@/lib/map-styles";

interface PreciseLocationMapProps {
    coordinates: { lat: number; lng: number } | null;
    accuracy?: number | null;
    nearestCity?: string | null;
    className?: string;
    onLocationUpdate?: (coordinates: { lat: number; lng: number }) => void;
    allowManualAdjustment?: boolean;
    showAccuracyCircle?: boolean;
}

export function PreciseLocationMap({ 
    coordinates, 
    accuracy, 
    nearestCity,
    className = "",
    onLocationUpdate,
    allowManualAdjustment = false,
    showAccuracyCircle = true
}: PreciseLocationMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const accuracyCircle = useRef<string | null>(null);
    const [isManualMode, setIsManualMode] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || !coordinates) return;

        // Initialize map if it doesn't exist
        if (!map.current) {
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: getMapStyle('default'),
                center: [coordinates.lng, coordinates.lat],
                zoom: 16, // Higher zoom for precise location
                attributionControl: false,
                // Set bounds to Palestine region
                maxBounds: [
                    [34.0, 29.0], // Southwest corner
                    [36.0, 33.5]  // Northeast corner
                ]
            });

            // Add navigation controls
            map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

            // Add Palestinian context attribution
            map.current.addControl(
                new maplibregl.AttributionControl({
                    customAttribution: 'خريطة فلسطين الدقيقة - Precise Palestine Map'
                }),
                'bottom-right'
            );
        }

        // Update map center
        map.current.setCenter([coordinates.lng, coordinates.lat]);

        // Remove existing marker and accuracy circle
        if (marker.current) {
            marker.current.remove();
        }
        if (accuracyCircle.current && map.current.getSource(accuracyCircle.current)) {
            map.current.removeLayer(accuracyCircle.current);
            map.current.removeSource(accuracyCircle.current);
        }

        // Add accuracy circle if accuracy is available and showAccuracyCircle is true
        if (accuracy && showAccuracyCircle && map.current.isStyleLoaded()) {
            const circleId = `accuracy-circle-${Date.now()}`;
            accuracyCircle.current = circleId;

            map.current.addSource(circleId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [coordinates.lng, coordinates.lat]
                    },
                    properties: {}
                }
            });

            map.current.addLayer({
                id: circleId,
                type: 'circle',
                source: circleId,
                paint: {
                    'circle-radius': Math.max(10, Math.min(50, accuracy / 2)), // Simple radius based on accuracy
                    'circle-color': accuracy <= 50 ? '#10b981' : accuracy <= 100 ? '#f59e0b' : '#ef4444',
                    'circle-opacity': 0.2,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': accuracy <= 50 ? '#10b981' : accuracy <= 100 ? '#f59e0b' : '#ef4444',
                    'circle-stroke-opacity': 0.8
                }
            });
        }

        // Add precise location marker with Palestinian styling
        const markerColor = accuracy && accuracy <= 50 ? markerStyles.precise.color :
                           accuracy && accuracy <= 100 ? "#f59e0b" : markerStyles.emergency.color;

        marker.current = new maplibregl.Marker({
            color: markerColor,
            scale: markerStyles.precise.scale,
            draggable: allowManualAdjustment && isManualMode
        })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map.current);

        // Handle manual location adjustment
        if (allowManualAdjustment && isManualMode && marker.current) {
            marker.current.on('dragend', () => {
                if (marker.current && onLocationUpdate) {
                    const lngLat = marker.current.getLngLat();
                    onLocationUpdate({ lat: lngLat.lat, lng: lngLat.lng });
                }
            });
        }

        // Determine the Palestinian region
        const region = getCoordinateRegion(coordinates.lat, coordinates.lng);

        // Add popup with detailed Palestinian context information
        const popupContent = `
            <div style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 10px; min-width: 220px; border-radius: 8px;">
                <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937; font-size: 16px;">
                    📍 ${nearestCity || 'الموقع الحالي'}
                </div>
                <div style="font-size: 13px; color: #059669; margin-bottom: 6px; font-weight: 500;">
                    ${region}
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 6px;">
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 3px;">
                        خط العرض: <span style="font-family: monospace; color: #374151;">${coordinates.lat.toFixed(6)}</span>
                    </div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">
                        خط الطول: <span style="font-family: monospace; color: #374151;">${coordinates.lng.toFixed(6)}</span>
                    </div>
                </div>
                ${accuracy ? `
                    <div style="font-size: 12px; margin-top: 8px; padding: 6px 8px; border-radius: 6px; background-color: ${
                        accuracy <= 50 ? '#ecfdf5' : accuracy <= 100 ? '#fffbeb' : '#fef2f2'
                    }; color: ${
                        accuracy <= 50 ? '#065f46' : accuracy <= 100 ? '#92400e' : '#991b1b'
                    }; border: 1px solid ${
                        accuracy <= 50 ? '#d1fae5' : accuracy <= 100 ? '#fef3c7' : '#fecaca'
                    };">
                        🎯 دقة الموقع: ${Math.round(accuracy)} متر
                        <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">
                            ${accuracy <= 50 ? 'دقة عالية جداً' : accuracy <= 100 ? 'دقة جيدة' : 'دقة منخفضة'}
                        </div>
                    </div>
                ` : ''}
                <div style="font-size: 10px; color: #9ca3af; margin-top: 8px; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 4px;">
                    🇵🇸 فلسطين
                </div>
            </div>
        `;

        new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false
        })
            .setLngLat([coordinates.lng, coordinates.lat])
            .setHTML(popupContent)
            .addTo(map.current);

        // Cleanup function
        return () => {
            if (marker.current) {
                marker.current.remove();
                marker.current = null;
            }
            if (accuracyCircle.current && map.current && map.current.getSource(accuracyCircle.current)) {
                map.current.removeLayer(accuracyCircle.current);
                map.current.removeSource(accuracyCircle.current);
                accuracyCircle.current = null;
            }
        };
    }, [coordinates, accuracy, nearestCity, allowManualAdjustment, isManualMode, showAccuracyCircle, onLocationUpdate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    const toggleManualMode = () => {
        setIsManualMode(!isManualMode);
        if (marker.current) {
            marker.current.setDraggable(!isManualMode);
        }
    };

    const centerOnLocation = () => {
        if (map.current && coordinates) {
            map.current.flyTo({
                center: [coordinates.lng, coordinates.lat],
                zoom: 18,
                duration: 1000
            });
        }
    };

    if (!coordinates) {
        return (
            <div className={`w-full ${className || 'h-64'} rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50`}>
                <div className="text-center text-gray-500">
                    <MapPin className="mx-auto mb-2" size={24} />
                    <p className="text-sm">لا توجد إحداثيات متاحة</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={mapContainer}
                className={`w-full ${className || 'h-64'} rounded-lg border border-gray-200`}
                style={{ direction: 'ltr' }}
            />
            
            {/* Map Controls */}
            <div className="absolute top-2 left-2 flex flex-col gap-2">
                <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onPress={centerOnLocation}
                    isIconOnly
                    className="bg-white/90 backdrop-blur-sm"
                >
                    <Target size={16} />
                </Button>
                
                {allowManualAdjustment && (
                    <Button
                        size="sm"
                        variant={isManualMode ? "solid" : "flat"}
                        color={isManualMode ? "warning" : "default"}
                        onPress={toggleManualMode}
                        isIconOnly
                        className="bg-white/90 backdrop-blur-sm"
                    >
                        <Crosshair size={16} />
                    </Button>
                )}
            </div>

            {/* Accuracy Indicator */}
            {accuracy && (
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                    <div className={`flex items-center gap-2 ${
                        accuracy <= 50 ? 'text-green-700' : 
                        accuracy <= 100 ? 'text-yellow-700' : 'text-red-700'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            accuracy <= 50 ? 'bg-green-500' : 
                            accuracy <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        دقة: {Math.round(accuracy)}م
                    </div>
                </div>
            )}

            {isManualMode && (
                <div className="absolute top-2 right-2 bg-orange-100 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-800">
                    اسحب العلامة لتعديل الموقع
                </div>
            )}
        </div>
    );
}
