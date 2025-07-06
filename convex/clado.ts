import { action } from "./_generated/server";
import { v } from "convex/values";

const cladoApiKey = process.env.CLADO_API_KEY;

export const deepSearch = action({
    args: { query: v.string() },
    handler: async (_, { query }) => {
        if (!cladoApiKey) {
            throw new Error("Clado API key not set in environment variables.");
        }

        // This is a placeholder for the actual Clado API endpoint.
        // You will need to replace this with the correct endpoint.
        const url = `https://api.clado.com/v1/deepsearch?query=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${cladoApiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Clado API request failed with status ${response.status}`);
        }

        return response.json();
    },
});
