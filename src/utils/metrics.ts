export class AccuracyMetrics {
    
    static calculateBLEU(reference: string, hypothesis: string): number {
      const refWords = reference.split(" ");
      const hypWords = hypothesis.split(" ");
      const matches = refWords.filter(word => hypWords.includes(word)).length;
      return (matches / refWords.length) * 100;
    }
  
    static calculateExactMatch(reference: string, hypothesis: string): number {
      return reference.trim().toLowerCase() === hypothesis.trim().toLowerCase() ? 100 : 0;
    }
  
    static calculateIntentAccuracy(expectedIntent: string, predictedIntent: string): number {
      return expectedIntent === predictedIntent ? 100 : 0;
    }
  
    static calculateEntityAccuracy(expectedEntities: string[], predictedEntities: string[]): number {
      const matches = expectedEntities.filter(entity => predictedEntities.includes(entity)).length;
      return (matches / expectedEntities.length) * 100;
    }
    
  }
  