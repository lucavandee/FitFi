/**
 * Agent loader fallback voor als directe agent import faalt
 */
import agent from "./agent";

export async function loadNovaAgent() {
  return agent;
}

export default { loadNovaAgent };