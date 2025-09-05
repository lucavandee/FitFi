// Lokale toast wrapper; gebruikt 'sonner' indien aanwezig, valt terug op alert()
let impl: any;
try {
  // dynamische import om bundling-problemen te vermijden als sonner niet is geïnstalleerd
  // @ts-ignore
  impl = await import("sonner").then((m: any) => m.toast || m.default);
} catch {
  impl = null;
}

export const toast = {
  success: (m: string) => (impl ? impl.success(m) : alert(m)),
  error: (m: string) => (impl ? impl.error(m) : alert(m)),
  info: (m: string) => (impl ? impl.info(m) : alert(m)),
  message: (m: string) => (impl ? impl.message(m) : alert(m)),
};

export default toast;