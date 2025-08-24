export type NovaReply =
  | { type: "text"; message: string }
  | { type: "tips"; title: string; bullets: string[] }
  | {
      type: "outfits";
      title: string;
      items: Array<{ name: string; description: string; price?: number }>;
    };

export type NovaAgent = {
  ask(input: string, ctx?: Record<string, unknown>): Promise<NovaReply>;
  greet(name: string): Promise<string>;
  memory: typeof NovaMemory;
  tools: typeof NovaTools;
};

// Simple memory interface for future expansion
export const NovaMemory = {
  readProfile() {
    try {
      return JSON.parse(localStorage.getItem("fitfi.profile") || "null");
    } catch {
      return null;
    }
  },
  writeProfile(p: any) {
    localStorage.setItem("fitfi.profile", JSON.stringify(p));
  },
  readHistory() {
    try {
      return JSON.parse(sessionStorage.getItem("nova.history") || "[]");
    } catch {
      return [];
    }
  },
  writeHistory(h: any[]) {
    sessionStorage.setItem("nova.history", JSON.stringify(h.slice(-30)));
  },
};

// Mock tools for future expansion
export const NovaTools = {
  async searchOutfits(
    query: string,
  ): Promise<Array<{ name: string; description: string; price?: number }>> {
    // Mock outfit suggestions based on query
    const mockOutfits = [
      {
        name: "Casual Chic Look",
        description: "Beige linnen broek + wit katoenen shirt",
        price: 89.99,
      },
      {
        name: "Smart Casual Ensemble",
        description: "Navy blazer + beige chino + witte sneakers",
        price: 159.99,
      },
      {
        name: "Weekend Comfort",
        description: "Oversized trui + mom jeans + canvas sneakers",
        price: 79.99,
      },
    ];

    // Simple filtering based on query
    if (query.includes("zomer") || query.includes("summer")) {
      return mockOutfits.filter(
        (outfit) =>
          outfit.description.includes("linnen") ||
          outfit.description.includes("katoen") ||
          outfit.description.includes("licht"),
      );
    }

    if (query.includes("werk") || query.includes("business")) {
      return mockOutfits.filter(
        (outfit) =>
          outfit.description.includes("blazer") ||
          outfit.description.includes("smart"),
      );
    }

    return mockOutfits.slice(0, 2);
  },
};

const agent: NovaAgent = {
  async ask(input: string, ctx?: Record<string, unknown>) {
    const q = String(input || "")
      .toLowerCase()
      .trim();

    if (!q) {
      return {
        type: "text",
        message:
          'Vertel me kort wat je zoekt (bijv. "zomerse outfit in beige").',
      };
    }

    // Enhanced routing met meer context awareness
    if (q.includes("zomer") || q.includes("zomerse") || q.includes("summer")) {
      if (q.includes("beige") || q.includes("nude") || q.includes("camel")) {
        return {
          type: "tips",
          title: "Zomerse outfit in beige – Nova's suggesties",
          bullets: [
            "Lichte linnen broek in warm beige + wit katoenen T-shirt",
            "Beige overshirt of dun vest voor koelere avonden",
            "Witte canvas sneakers of suède loafers in cognac",
            "Accessoires: dun leren riem en zonnebril (bruin/amber)",
            "Tip: Laag-op-laag in verschillende beige tinten voor depth",
          ],
        };
      }

      return {
        type: "tips",
        title: "Zomerse outfit inspiratie",
        bullets: [
          "Lichte, ademende stoffen zoals linnen en katoen",
          "Neutrale kleuren: wit, beige, lichtblauw, zacht groen",
          "Comfortabele schoenen: canvas sneakers of sandalen",
          "Minimale accessoires voor een clean look",
        ],
      };
    }

    if (q.includes("werk") || q.includes("kantoor") || q.includes("business")) {
      const outfits = await NovaTools.searchOutfits(q);
      return {
        type: "outfits",
        title: "Smart business outfits voor jou",
        items: outfits,
      };
    }

    if (
      q.includes("outfit") ||
      q.includes("look") ||
      q.includes("combinatie")
    ) {
      // Check for specific occasions
      if (q.includes("date") || q.includes("romantisch")) {
        return {
          type: "tips",
          title: "Date night outfit tips",
          bullets: [
            "Kies iets waarin je je zelfverzekerd voelt",
            "Voeg één statement piece toe (bijv. mooie oorbellen)",
            "Comfortabele schoenen waar je op kunt lopen",
            "Kleur die je huid laat stralen",
          ],
        };
      }

      if (q.includes("weekend") || q.includes("casual")) {
        return {
          type: "tips",
          title: "Weekend casual styling",
          bullets: [
            "High-waist jeans + oversized trui of shirt",
            "Sneakers of comfortabele boots",
            "Denim jacket of cardigan als laag",
            "Crossbody tas voor hands-free comfort",
          ],
        };
      }

      return {
        type: "text",
        message:
          "Top! Wil je casual, smart casual of formeel? Noem evt. kleur(en) en gelegenheid, dan maak ik het concreet.",
      };
    }

    if (q.includes("kleur") || q.includes("color")) {
      return {
        type: "tips",
        title: "Kleur combinatie tips",
        bullets: [
          "Neutrale basis: zwart, wit, grijs, navy, beige",
          "Accent kleuren: één felle kleur per outfit",
          "Monochroom: verschillende tinten van dezelfde kleur",
          "Complementair: kleuren tegenover elkaar op kleurenwiel",
        ],
      };
    }

    if (q.includes("help") || q.includes("hulp")) {
      return {
        type: "text",
        message:
          'Ik kan je helpen met outfit ideeën! Probeer: "outfit voor kantoor", "zomerse look", "date night styling", of "kleur combinaties".',
      };
    }

    // Fallback met context awareness
    const profile = ctx?.profile || NovaMemory.readProfile();
    const userName = profile?.name || "daar";

    return {
      type: "text",
      message: `Hoi ${userName}! Ik kan outfits en styling tips voor je vinden. Noem een gelegenheid, seizoen of kleur en ik help je verder 👍`,
    };
  },

  async greet(name: string) {
    const profile = NovaMemory.readProfile();
    let greeting = `Hoi ${name}! Ik ben Nova 👋`;

    if (profile?.answers?.stylePreferences) {
      const topPref = profile.answers.stylePreferences[0];
      greeting += ` Ik zie dat je van ${topPref} stijl houdt!`;
    }

    greeting += " Waar kan ik je mee helpen?";
    return greeting;
  },

  memory: NovaMemory,
  tools: NovaTools,
};

export default agent;
export { agent };
