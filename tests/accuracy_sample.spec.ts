import { test, expect } from '@playwright/test';
import { LMStudioClient } from '../src/models/lmStudioClient';
import { NLPUtils } from '../src/utils/nlpMetris';


test.describe('Model Accuracy Tests', () => {
  const client = new LMStudioClient();
  const a = `The author of the book is Robert C. Martin, also known as "Uncle Bob"`

  const testCases = [
    { 
      input: "What is the capital of France?", 
      expected: "The capital of France is Paris.", 
      intent: "location_query",
      entities: ["France", "capital"]
    },
    { 
      input: "Who is the author of the book Clean Code: A Handbook of Agile Software Craftsmanship?", 
      expected: a, 
      intent: "author_query",
      entities: ["Robert C. Martin","Clean Code"]
    },
    { 
      input: "What is the population of Japan?", 
      expected: "The population of Japan is approximately 125 million.", 
      intent: "population_query",
      entities: ["Japan", "population"]
    },
    { 
      input: "What is the boiling point of water?", 
      expected: "The boiling point of water is 100 degrees Celsius at sea level.", 
      intent: "science_query",
      entities: ["boiling point", "water", "100 degrees Celsius"]
    },
    { 
      input: "Convert 10 kilometers to miles.", 
      expected: "10 kilometers is approximately 6.21 miles.", 
      intent: "conversion_query",
      entities: ["10 kilometers", "miles","kilometers"]
    },
    { 
      input: "Who painted the Mona Lisa?", 
      expected: "The Mona Lisa was painted by Leonardo da Vinci.", 
      intent: "art_query",
      entities: ["Mona Lisa", "Leonardo da Vinci"]
    },
    { 
      input: "What is the square root of 144?", 
      expected: "The square root of 144 is 12.", 
      intent: "math_query",
      entities: ["square root", "144", "12"]
    },
    { 
      input: "What is the chemical symbol for gold?", 
      expected: "The chemical symbol for gold is Au.", 
      intent: "chemistry_query",
      entities: ["gold", "Au"]
    },
    { 
      input: "Who won the FIFA World Cup in 2018?", 
      expected: "France won the FIFA World Cup in 2018.", 
      intent: "sports_query",
      entities: ["FIFA World Cup", "2018", "France"]
    },
    { 
      input: "Translate 'hello' to Spanish.", 
      expected: "The Spanish translation of 'hello' is 'hola'.", 
      intent: "translation_query",
      entities: ["hello", "Spanish", "hola"]
    }
];
  

  testCases.forEach((testCase) => {
    test(`Test accuracy for input: "${testCase.input}"`, async ({}) => {
      const modelOutput = await client.getModelResponse(testCase.input);
      //const exactMatchScore = AccuracyMetrics.calculateExactMatch(testCase.expected, modelOutput);
      const similarityScore = await NLPUtils.semanticSimilarity(testCase.expected, modelOutput);
      const perplexityScore = NLPUtils.calculatePerplexity(testCase.expected);
      const response = await NLPUtils.processQuery(testCase.input);
      const receivedEntities = response.entities.map(e => e.toLowerCase().trim());
      const hasAtLeastOneMatch = testCase.entities.some(entity => receivedEntities.includes(entity.toLowerCase().trim()));

      console.log(`Test Input: ${testCase.input}`);
      console.log(`Expected: ${testCase.expected}`);
      console.log(`Model Output: ${modelOutput}`);
      console.log(`Semantic Similarity Score:${similarityScore}`)
      console.log(`Perplexity Score:${perplexityScore}`)
      console.log(`Intent Type:${response.intent}`)
      console.log(`Entity Type:${response.entities.sort()}`)
      console.log(`Received Entities:${receivedEntities}`)
      
      expect(similarityScore).toBeGreaterThan(0.5);
      expect(response.text).toBe(testCase.expected);
      expect(response.intent).toBe(testCase.intent);
      expect(hasAtLeastOneMatch).toBeTruthy();
      expect(perplexityScore).toBeGreaterThan(90);
    });
  });

});
