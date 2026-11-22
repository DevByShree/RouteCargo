import { apiRequest } from "./api";
export { rememberCurrentShipment, getRememberedShipment, clearRememberedShipment } from "./currentShipmentStorage.js";

export const BASE_URL = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export async function createShipment({ pickup, destination, pickupDate }) {
    try {
        const data = await apiRequest("/api/shipments", {
            method: "POST",
            body: JSON.stringify({
                pickup: pickup.trim().toLowerCase(),
                destination: destination.trim().toLowerCase(),
                pickupDate,
            }),
        });
        return { shipment: data.shipment || data.data || data };
    } catch (error) {
        if (error.status === 409) {
            return { shipment: error.data.shipment || error.data.data || error.data, existing: true };
        }
        if (error.status === 401 || error.status === 403) error.code = "NOT_SIGNED_IN";
        throw error;
    }
}
const CITIES = [
    "Agra",
    "Ahmedabad",
    "Ahmednagar",
    "Ajmer",
    "Akola",
    "Aligarh",
    "Allahabad (Prayagraj)",
    "Amravati",
    "Amritsar",
    "Anand",
    "Aurangabad",
    "Bareilly",
    "Belgaum",
    "Bengaluru",
    "Bhavnagar",
    "Bhilai",
    "Bhiwandi",
    "Bhopal",
    "Bhubaneswar",
    "Bikaner",
    "Chandigarh",
    "Chennai",
    "Coimbatore",
    "Cuttack",
    "Dehradun",
    "Delhi",
    "Dhanbad",
    "Durgapur",
    "Erode",
    "Faridabad",
    "Ghaziabad",
    "Goa",
    "Gorakhpur",
    "Guntur",
    "Gurgaon",
    "Guwahati",
    "Gwalior",
    "Hubli",
    "Hyderabad",
    "Indore",
    "Jabalpur",
    "Jaipur",
    "Jalandhar",
    "Jalgaon",
    "Jammu",
    "Jamnagar",
    "Jamshedpur",
    "Jodhpur",
    "Kanpur",
    "Kochi",
    "Kolhapur",
    "Kolkata",
    "Kota",
    "Kozhikode",
    "Lucknow",
    "Ludhiana",
    "Madurai",
    "Mangalore",
    "Meerut",
    "Moradabad",
    "Mumbai",
    "Mysore",
    "Nagpur",
    "Nanded",
    "Nashik",
    "Navi Mumbai",
    "Noida",
    "Panaji",
    "Patna",
    "Pimpri-Chinchwad",
    "Pune",
    "Raipur",
    "Rajkot",
    "Ranchi",
    "Salem",
    "Sangli",
    "Satara",
    "Shirdi",
    "Siliguri",
    "Solapur",
    "Surat",
    "Thane",
    "Thiruvananthapuram",
    "Tiruchirappalli",
    "Udaipur",
    "Ujjain",
    "Vadodara",
    "Varanasi",
    "Vasai-Virar",
    "Vijayawada",
    "Visakhapatnam",
    "Warangal",
];

/** Predefined city suggestions (no backend endpoint needed). */
export async function getLocations() {
    return { pickup: CITIES, delivery: CITIES };
}
