export const rejectNode = async (state) => {
    const { classification, key } = state;
    
    if (classification === "technical_general") {
        return { 
            answer: `That sounds like a valid technical question, but I currently validatated to only answer questions related to **${key}** documentation. Please ask questions specific to this documentation.` 
        };
    }
    
    return { 
        answer: "Sorry, I can only answer technical, programming, or software-related questions specific to the provided documentation." 
    };
};
