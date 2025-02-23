import { pipeline } from '@xenova/transformers';


export class NLPUtils {
    
    static calculatePerplexity(sentence: string): number {
        const words = sentence.split(" ").length;
        return Math.pow(2, words);  // Approximate complexity based on length
    }

    static async semanticSimilarity(text1: string, text2: string): Promise<number> {
        // Await the pipeline initialization
        const similarityPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
        // Get embeddings and extract tensor values
        const emb1 = await similarityPipeline(text1, { pooling: 'mean', normalize: true });
        const emb2 = await similarityPipeline(text2, { pooling: 'mean', normalize: true });
    
        // Convert DataArray to number[]
        const emb1Array = Array.from(emb1.data);
        const emb2Array = Array.from(emb2.data);
    
        // Compute cosine similarity
        return NLPUtils.cosineSimilarity(emb1Array, emb2Array);
    }
    
    static cosineSimilarity(vec1: number[], vec2: number[]): number {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val ** 2, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val ** 2, 0));
        return dotProduct / (magnitude1 * magnitude2);
    }

    static knowledgeRetention(expected: string, response: string): number {
        const wordsInCommon = expected.split(" ").filter(word => response.includes(word)).length;
        return (wordsInCommon / expected.split(" ").length) * 100;
    }
    
    // Intent classification using simple keyword matching
    private static classifyIntent(query: string): string {
        const lowerQuery = query.toLowerCase();
    
        if (lowerQuery.includes("capital")) return "location_query";
        if (lowerQuery.includes("author") || lowerQuery.includes("book")) return "author_query";
        if (lowerQuery.includes("population")) return "population_query";
        if (lowerQuery.includes("boiling point") || lowerQuery.includes("temperature")) return "science_query";
        if (lowerQuery.includes("convert") || lowerQuery.includes("miles") || lowerQuery.includes("kilometers")) return "conversion_query";
        if (lowerQuery.includes("painted") || lowerQuery.includes("artist")) return "art_query";
        if (lowerQuery.includes("square root")) return "math_query";
        if (lowerQuery.includes("chemical symbol") || lowerQuery.includes("element")) return "chemistry_query";
        if (lowerQuery.includes("fifa") || lowerQuery.includes("world cup") || lowerQuery.includes("won")) return "sports_query";
        if (lowerQuery.includes("translate") || lowerQuery.includes("language")) return "translation_query";
    
        return "unknown_intent";
    }
    
    // Entity extraction using regex patterns (basic implementation)
    private static extractEntities(query: string): string[] {
        const entities: string[] = [];
    
        // Country and location-related entities
        if (/France/i.test(query)) entities.push("France");
        if (/Japan/i.test(query)) entities.push("Japan");
    
        // Keywords related to locations
        if (/capital/i.test(query)) entities.push("capital");
        if (/population/i.test(query)) entities.push("population");
    
        // Book and author-related entities
        if (/Clean Code/i.test(query)) entities.push("Clean Code");
        if (/Robert C\.? Martin/i.test(query)) entities.push("Robert C. Martin");
    
        // Measurement and conversion-related entities
        if (/kilometers?/i.test(query)) entities.push("kilometers");
        if (/miles?/i.test(query)) entities.push("miles");
    
        // Science-related entities
        if (/boiling point/i.test(query)) entities.push("boiling point");
        if (/water/i.test(query)) entities.push("water");
    
        // Art-related entities
        if (/Mona Lisa/i.test(query)) entities.push("Mona Lisa");
        if (/Leonardo da Vinci/i.test(query)) entities.push("Leonardo da Vinci");
    
        // Math-related entities
        if (/square root/i.test(query)) entities.push("square root");
        if (/\b144\b/.test(query)) entities.push("144");
    
        // Chemistry-related entities
        if (/chemical symbol/i.test(query)) entities.push("chemical symbol");
        if (/gold/i.test(query)) entities.push("gold");
        if (/\bAu\b/i.test(query)) entities.push("Au");
    
        // Sports-related entities
        if (/FIFA/i.test(query)) entities.push("FIFA");
        if (/World Cup/i.test(query)) entities.push("World Cup");
        if (/2018/i.test(query)) entities.push("2018");
    
        // Translation-related entities
        if (/translate/i.test(query)) entities.push("translate");
        if (/hello/i.test(query)) entities.push("hello");
        if (/Spanish/i.test(query)) entities.push("Spanish");
        if (/hola/i.test(query)) entities.push("hola");
    
        return entities;
    }
    
      // Process user query and return response, intent, and extracted entities
      static async processQuery(query: string): Promise<{ text: string; intent: string; entities: string[] }> {
        const intent = this.classifyIntent(query);
        const entities = this.extractEntities(query);
        
        // Normalize query to match knowledge base keys
        const normalizedQuery = query.trim().replace(/\s+/g, " ");  
        const response = this.knowledgeBase[normalizedQuery] || "I'm not sure about that.";
    
        return { text: response, intent, entities };
    }

    static async calculateAnswerRelevancy(expected: string, predicted: string): Promise<number> {
        // Load the feature extraction model (MiniLM for sentence embeddings)
        const similarityPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
        // Extract embeddings and convert tensor values to arrays
        const emb1 = await similarityPipeline(expected, { pooling: 'mean', normalize: true });
        const emb2 = await similarityPipeline(predicted, { pooling: 'mean', normalize: true });
    
        const emb1Array = Array.from(emb1.data);
        const emb2Array = Array.from(emb2.data);
    
        // Compute cosine similarity as relevancy score (0 to 1)
        const similarityScore = this.cosineSimilarity(emb1Array, emb2Array);
    
        // Convert to percentage (0 to 100)
        return Math.round(similarityScore * 100);
    }

    private static knowledgeBase: Record<string, string> = {
        "What is the capital of France?": "The capital of France is Paris.",
        "Who is the author of the book Clean Code: A Handbook of Agile Software Craftsmanship?": 
            "The author of Clean Code is Robert C. Martin.",
        "What is the population of Japan?": "The population of Japan is approximately 125 million.",
        "What is the boiling point of water?": "The boiling point of water is 100 degrees Celsius at sea level.",
        "Convert 10 kilometers to miles.": "10 kilometers is approximately 6.21 miles.",
        "Who painted the Mona Lisa?": "The Mona Lisa was painted by Leonardo da Vinci.",
        "What is the square root of 144?": "The square root of 144 is 12.",
        "What is the chemical symbol for gold?": "The chemical symbol for gold is Au.",
        "Who won the FIFA World Cup in 2018?": "France won the FIFA World Cup in 2018.",
        "Translate 'hello' to Spanish.": "The Spanish translation of 'hello' is 'hola'."
    };
}
