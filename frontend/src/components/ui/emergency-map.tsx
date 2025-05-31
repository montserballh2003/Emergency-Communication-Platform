"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { palestineCoordinates, palestineCenter } from "@/lib/utils";
import { getMapStyle, markerStyles, getCoordinateRegion } from "@/lib/map-styles";

interface EmergencyMapProps {
    location: string;
    className?: string;
}

export function EmergencyMap({ location, className = "" }: EmergencyMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Get coordinates for the location, fallback to Palestine center
        const coordinates = palestineCoordinates[location] || palestineCenter;

        // Initialize map with Palestinian styling
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: getMapStyle('emergency'),
            center: coordinates,
            zoom: 12,
            attributionControl: false,
            // Set bounds to Palestine region
            maxBounds: [
                [34.0, 29.0], // Southwest corner (extended for Gaza)
                [36.0, 33.5]  // Northeast corner (extended for northern Palestine)
            ]
        });

        // Add RTL text support for Arabic labels
        map.current.on('load', () => {
            if (map.current) {
                // Add custom attribution for Palestinian context
                map.current.addControl(
                    new maplibregl.AttributionControl({
                        customAttribution: 'خريطة فلسطين - Palestine Map'
                    }),
                    'bottom-right'
                );
            }
        });

        // Add marker for the emergency location with Palestinian styling
        new maplibregl.Marker({
            color: markerStyles.emergency.color,
            scale: markerStyles.emergency.scale
        })
            .setLngLat(coordinates)
            .addTo(map.current);

        // Determine the region for context
        const region = getCoordinateRegion(coordinates[1], coordinates[0]);

        // Add popup with location name and Palestinian context
        const popupContent = `
            <div style="font-family: 'Tajawal', sans-serif; direction: rtl; padding: 8px 12px; min-width: 150px;">
                <div style="font-weight: 600; font-size: 16px; color: #dc2626; margin-bottom: 4px;">
                    🚨 حالة طوارئ
                </div>
                <div style="font-weight: 600; font-size: 14px; color: #1f2937; margin-bottom: 2px;">
                    ${location}
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                    ${region}
                </div>
                <div style="font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 4px;">
                    الإحداثيات: ${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}
                </div>
            </div>
        `;

        new maplibregl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
            className: 'palestine-emergency-popup'
        })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);

        // Cleanup function
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [location]);

    return (
        <div
            ref={mapContainer}
            className={`w-full ${className || 'h-64'} rounded-lg border border-gray-200`}
            style={{ direction: 'ltr' }}
        />
    );
}
