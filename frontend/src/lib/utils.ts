import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from 'js-cookie';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helper function to clear tokens and redirect
function handleLogout() {
    Cookies.remove('access', { path: '/' });
    Cookies.remove('refresh', { path: '/' });
    if (typeof window !== 'undefined') { // Ensure window is available (for client-side redirect)
        window.location.href = '/auth'; // Or your login page
    }
    // In a real application, you might want to notify other parts of the app
    // or use a router instance if available instead of window.location.href
}

export async function fetcher<T>(
    url: string,
    values: T | null, // Allow null for GET requests or requests with no body
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
    isRetry: boolean = false
): Promise<Response> {
    let accessToken = Cookies.get('access');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        // Handle missing backend URL. Maybe throw an error or return a specific response.
        // For now, logging an error and returning a dummy error response.
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined!");
        return new Response(JSON.stringify({ detail: "Backend URL not configured." }), { status: 500 });
    }

    const requestOptions: RequestInit = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        },
    };

    if (accessToken) {
        (requestOptions.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    }

    if (values !== null && (method === "POST" || method === "PUT" || method === "PATCH")) {
        requestOptions.body = JSON.stringify(values);
    }

    let response = await fetch(backendUrl + url, requestOptions);

    if (response.status === 401 && !isRetry) {
        const refreshToken = Cookies.get('refresh');
        if (!refreshToken) {
            handleLogout();
            // Return the original 401 response if no refresh token is available
            return response;
        }

        try {
            const refreshResponse = await fetch(backendUrl + "/auth/jwt/refresh/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
                const newTokens = await refreshResponse.json();
                Cookies.set('access', newTokens.access, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                if (newTokens.refresh) {
                    Cookies.set('refresh', newTokens.refresh, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
                }
                // Retry the original request with the new access token
                return fetcher(url, values, method, true); // Pass true for isRetry
            } else {
                // Refresh token failed (e.g. also expired or invalid)
                handleLogout();
                // Return the error response from the refresh attempt
                return refreshResponse;
            }
        } catch (error) {
            // Network error during refresh token attempt
            console.error("Refresh token request failed:", error);
            handleLogout();
            // Return an artificial error response to signify session expiration due to refresh failure
            return new Response(JSON.stringify({ detail: "Session expired, and token refresh failed." }), { status: 401 });
        }
    }

    return response;
}


export const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Palestine coordinates mapping for major cities (using Palestinian Arabic names)
export const palestineCoordinates: Record<string, [number, number]> = {
    // West Bank Cities (الضفة الغربية)
    "القدس": [35.2137, 31.7683],           // Jerusalem
    "القدس الشرقية": [35.2370, 31.7857],    // East Jerusalem
    "رام الله": [35.2058, 31.9038],         // Ramallah
    "البيرة": [35.2167, 31.9167],           // Al-Bireh
    "بيت لحم": [35.2007, 31.7054],         // Bethlehem
    "الخليل": [35.0998, 31.5326],          // Hebron
    "نابلس": [35.2444, 32.2211],           // Nablus
    "جنين": [35.3007, 32.4607],            // Jenin
    "طولكرم": [35.0278, 32.3108],          // Tulkarm
    "قلقيلية": [34.9706, 32.1896],         // Qalqilya
    "أريحا": [35.4444, 31.8667],           // Jericho
    "سلفيت": [35.1833, 32.0833],           // Salfit
    "طوباس": [35.3667, 32.3167],           // Tubas
    "بيت جالا": [35.1833, 31.7167],        // Beit Jala
    "بيت ساحور": [35.2167, 31.7000],       // Beit Sahour

    // Gaza Strip Cities (قطاع غزة)
    "غزة": [34.4668, 31.5204],             // Gaza City
    "خان يونس": [34.3061, 31.3469],        // Khan Younis
    "رفح": [34.2467, 31.2989],             // Rafah
    "دير البلح": [34.3500, 31.4167],       // Deir al-Balah
    "بيت لاهيا": [34.5000, 31.5500],       // Beit Lahia
    "بيت حانون": [34.5333, 31.5333],       // Beit Hanoun
    "جباليا": [34.4833, 31.5333],          // Jabalia

    // Historic Palestinian Cities (المدن الفلسطينية التاريخية)
    "حيفا": [34.9896, 32.7940],            // Haifa
    "يافا": [34.7518, 32.0853],            // Jaffa
    "عكا": [35.0833, 32.9167],             // Acre
    "الناصرة": [35.3027, 32.7019],         // Nazareth
    "صفد": [35.4967, 32.9647],             // Safed
    "طبريا": [35.5311, 32.7922],           // Tiberias
    "بئر السبع": [34.7913, 31.2518],       // Beersheba
    "الرملة": [34.8667, 31.9333],          // Ramla
    "اللد": [34.8833, 31.9500],            // Lod
};

// Default center of Palestine (Jerusalem)
export const palestineCenter: [number, number] = [35.2137, 31.7683];

// Emergency type configuration
export const emergencyTypeConfig = {
    M: {
        label: "طبية",
        icon: "Heart",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
    },
    O: {
        label: "إغاثة",
        icon: "HandHeart",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
    },
    D: {
        label: "خطر",
        icon: "AlertTriangle",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
    }
} as const;

export type EmergencyType = keyof typeof emergencyTypeConfig;

// Palestinian territorial boundaries (Historic Palestine)
export const palestineBounds = {
    // Historic Palestine boundaries from the Mediterranean to the Jordan River
    north: 33.3,    // Northern border with Lebanon
    south: 29.5,    // Southern border with Egypt (including Negev)
    east: 35.7,     // Eastern border with Jordan (Jordan River)
    west: 34.2      // Western border (Mediterranean Sea)
};

// Geolocation utilities for Palestine
export const isPalestineCoordinate = (lat: number, lng: number): boolean => {
    return lat >= palestineBounds.south &&
           lat <= palestineBounds.north &&
           lng >= palestineBounds.west &&
           lng <= palestineBounds.east;
};

// Check if coordinates are in Gaza Strip specifically
export const isGazaCoordinate = (lat: number, lng: number): boolean => {
    const gazaBounds = {
        north: 31.6,
        south: 31.2,
        east: 34.6,
        west: 34.2
    };

    return lat >= gazaBounds.south &&
           lat <= gazaBounds.north &&
           lng >= gazaBounds.west &&
           lng <= gazaBounds.east;
};

// Check if coordinates are in West Bank specifically
export const isWestBankCoordinate = (lat: number, lng: number): boolean => {
    const westBankBounds = {
        north: 32.6,
        south: 31.3,
        east: 35.7,
        west: 34.9
    };

    return lat >= westBankBounds.south &&
           lat <= westBankBounds.north &&
           lng >= westBankBounds.west &&
           lng <= westBankBounds.east;
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

export const findNearestPalestineCity = (lat: number, lng: number): string => {
    let nearestCity = "القدس"; // Default to Jerusalem
    let minDistance = Infinity;

    Object.entries(palestineCoordinates).forEach(([city, [cityLng, cityLat]]) => {
        // Use proper geographic distance calculation
        const distance = calculateDistance(lat, lng, cityLat, cityLng);
        if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
        }
    });

    return nearestCity;
};

// Camera utilities
export const isCameraSupported = (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

export function getWebSocketURL(path: string): string {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
        console.error("NEXT_PUBLIC_BACKEND_URL is not defined! Falling back to ws://localhost:8000");
        // In a real app, you might throw an error or handle this case more gracefully
        return `ws://localhost:8000${path.startsWith('/') ? path : '/' + path}`;
    }
    let wsProtocol: string;
    let baseUrl: string;

    if (backendUrl.startsWith('https://')) {
        wsProtocol = 'wss://';
        baseUrl = backendUrl.substring('https://'.length);
    } else if (backendUrl.startsWith('http://')) {
        wsProtocol = 'ws://';
        baseUrl = backendUrl.substring('http://'.length);
    } else {
        // Assuming a protocol-relative URL or just a host:port, default to ws
        // This case might need refinement based on expected NEXT_PUBLIC_BACKEND_URL formats
        console.warn("NEXT_PUBLIC_BACKEND_URL does not have a clear http/https protocol. Assuming ws.");
        wsProtocol = 'ws://';
        baseUrl = backendUrl;
    }

    // Remove trailing slash from baseUrl if present, as path should start with a slash
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    const fullPath = path.startsWith('/') ? path : `/${path}`;
    return `${wsProtocol}${baseUrl}${fullPath}`;
}
