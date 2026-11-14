// src/API/Parcelapi.js
import { BASE_URL, authHeaders } from "./Shipmentapi";

/** Id of the shipment created on the previous page (survives a page refresh). */
export function getShipmentId(shipment) {
    const fromState = shipment?.shipmentid ?? shipment?.shipmentId ?? shipment?.id;
    if (fromState !== undefined && fromState !== null) return fromState;
    const saved = sessionStorage.getItem("currentShipmentId");
    return saved ? Number(saved) : null;
}

/* ------------------------------------------------------------------ */
/* Images: the API takes productImages as a list of strings.           */
/* There is no upload endpoint yet, so each photo is shrunk and sent   */
/* as a data-URL. When you add a real upload API, change ONLY this     */
/* function so it returns the uploaded file URLs.                      */
/* ------------------------------------------------------------------ */
const fileToDataUrl = (file, maxSide = 1024, quality = 0.7) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error(`Could not read image ${file.name}.`));
        };
        img.src = url;
    });

export const uploadProductImages = (images = []) => Promise.all(images.map((i) => fileToDataUrl(i.file)));

/* ------------------------------------------------------------------ */
/* POST /api/parcel                                                    */
/* { shipmentId, productName, parcelType, numberOfPackages,            */
/*   productImages: [], description }                                  */
/* ------------------------------------------------------------------ */
export async function createParcel({ shipmentId, productName, parcelType, numberOfPackages, productImages = [], description = "" }) {
    if (shipmentId === null || shipmentId === undefined) {
        throw new Error("Shipment not found. Go back and create the shipment first.");
    }

    const res = await fetch(`${BASE_URL}/api/parcel`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({
            shipmentId,
            productName,
            parcelType,
            numberOfPackages,
            productImages,
            description,
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
        const e = new Error(data.message || "Your session has expired. Please sign in again.");
        e.code = "NOT_SIGNED_IN";
        throw e;
    }
    if (res.status === 413) {
        throw new Error("Images are too large for the server. Remove some photos or raise the server's JSON body limit.");
    }
    if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `Could not save "${productName}" (${res.status}).`);
    }
    return data.parcel || data.data || data;
}