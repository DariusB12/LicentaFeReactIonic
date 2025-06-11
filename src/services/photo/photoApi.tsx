import {baseUrl, configToken} from "../../assets";

const photoApiUrl = `http://${baseUrl}/photo`;



export const fetchImageApi = async (filename:string, token:string|null): Promise<string | null> => {
    try {
        const res = await fetch(`${photoApiUrl}/${filename}`, configToken(token));

        if (!res.ok) {
            console.error("Failed to fetch image");
            return null;
        }

        const blob = await res.blob();
        return URL.createObjectURL(blob); //RETURN THE GENERATED URL
    } catch (err) {
        console.error("Error fetching image:", err);
        return null;
    }
};
