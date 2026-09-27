import { describe, expect, it, vi } from "vitest";
import { veegronde } from "../veegronde";

describe("veegronde", () => {
  it("classificeert en schrijft alle onbewerkte rijen, en stopt zodra een ronde niets teruggeeft", async () => {
    const onbewerkteRijen = [
      { id: "v1", name: "Shirt FAY Men color Blue", category: "accessory" },
      { id: "v2", name: "PUMA Tackle L sneakers uniseks", category: "bottom" },
      { id: "v3", name: "Slim fit jeans", category: "bottom" },
    ];
    const haalOnbewerkt = vi
      .fn()
      .mockResolvedValueOnce({ data: onbewerkteRijen, error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    const schrijf = vi.fn().mockResolvedValue({ data: 3, error: null });

    const resultaat = await veegronde(1000, { haalOnbewerkt, schrijf });

    expect(resultaat).toEqual({ gevonden: 3, geschreven: 3 });
    // Twee pogingen: de portie van 3, dan de lege ronde die de lus stopt.
    expect(haalOnbewerkt).toHaveBeenCalledTimes(2);
    expect(schrijf).toHaveBeenCalledTimes(1);
    // Bewijst echt gedrag: de rijen zijn door de echte classificeerRij
    // gehaald (niet doorgegeven of gestubd), met dezelfde uitkomst als de
    // classificatie.test.ts-tests voor deze exacte namen.
    expect(schrijf).toHaveBeenCalledWith([
      { product_id: "v1", category: "top", is_fashion: true },
      { product_id: "v2", category: "footwear", is_fashion: true },
      { product_id: "v3", category: "bottom", is_fashion: true },
    ]);
  });

  it("doet niets bij een schone catalogus (eerste ronde al leeg)", async () => {
    const haalOnbewerkt = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const schrijf = vi.fn();

    const resultaat = await veegronde(1000, { haalOnbewerkt, schrijf });

    expect(resultaat).toEqual({ gevonden: 0, geschreven: 0 });
    expect(haalOnbewerkt).toHaveBeenCalledTimes(1);
    expect(schrijf).not.toHaveBeenCalled();
  });

  it("herhaalt over meerdere volle porties voor de laatste, kleinere ronde", async () => {
    const maakRij = (i: number) => ({ id: `r${i}`, name: "Slim fit jeans", category: "bottom" });
    const portie1 = Array.from({ length: 2 }, (_, i) => maakRij(i));
    const portie2 = [maakRij(99)];
    const haalOnbewerkt = vi
      .fn()
      .mockResolvedValueOnce({ data: portie1, error: null })
      .mockResolvedValueOnce({ data: portie2, error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    const schrijf = vi.fn().mockResolvedValueOnce({ data: 2, error: null }).mockResolvedValueOnce({ data: 1, error: null });

    const resultaat = await veegronde(2, { haalOnbewerkt, schrijf });

    expect(resultaat).toEqual({ gevonden: 3, geschreven: 3 });
    expect(haalOnbewerkt).toHaveBeenCalledTimes(3);
    expect(haalOnbewerkt).toHaveBeenNthCalledWith(1, 2);
    expect(schrijf).toHaveBeenCalledTimes(2);
  });

  it("gooit door bij een leesfout, zonder te schrijven", async () => {
    const haalOnbewerkt = vi.fn().mockResolvedValueOnce({ data: null, error: { message: "connectiefout" } });
    const schrijf = vi.fn();

    await expect(veegronde(1000, { haalOnbewerkt, schrijf })).rejects.toThrow("connectiefout");
    expect(schrijf).not.toHaveBeenCalled();
  });

  it("gooit door bij een schrijffout", async () => {
    const haalOnbewerkt = vi.fn().mockResolvedValueOnce({
      data: [{ id: "v1", name: "Slim fit jeans", category: "bottom" }],
      error: null,
    });
    const schrijf = vi.fn().mockResolvedValueOnce({ data: null, error: { message: "zet_classificatie faalde" } });

    await expect(veegronde(1000, { haalOnbewerkt, schrijf })).rejects.toThrow("zet_classificatie faalde");
  });
});
