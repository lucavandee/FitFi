/**
 * Dev-friendly mock Nova agent
 * Provides a simple async generator that yields text streams
 */

export interface MockAgent {
  greet(name: string): Promise<string>;
  chat(message: string): AsyncGenerator<string, void, unknown>;
}

class DevNovaAgent implements MockAgent {
  async greet(name: string): Promise<string> {
    await this.delay(500);
    return `Hoi ${name}! 👋 Ik ben Nova, jouw AI-stylist. Ik help je graag met het vinden van de perfecte outfits die bij jouw stijl passen. Waar kan ik je mee helpen?`;
  }

  async* chat(message: string): AsyncGenerator<string, void, unknown> {
    const responses = [
      "Dat is een interessante vraag! ",
      "Laat me even nadenken... ",
      "Op basis van jouw stijlprofiel zou ik aanraden om ",
      "te kijken naar outfits die ",
      "jouw persoonlijkheid weerspiegelen. ",
      "Wat dacht je van een combinatie van ",
      "casual en elegant? ",
      "Dat zou perfect bij je passen! ✨"
    ];

    for (const chunk of responses) {
      await this.delay(100 + Math.random() * 200);
      yield chunk;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export both as default and named export for compatibility
const agent = new DevNovaAgent();
export default agent;
export { agent };