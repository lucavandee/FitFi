// src/utils/share.ts
// Handige helpers voor share payloads — consistent met urls.ts

import urls from "@/utils/urls";

export type ShareDataInput = {
  title: string;
  text: string;
  /** Optioneel pad ("/something") of volledige URL; default = homepage */
  path?: string;
  /** Extra query-params (bv. { ref: 'achievement' }) */
  params?: Record<string, string>;
};

export function buildShareUrl(path?: string, params?: Record<string, string>) {
  return urls.buildShareUrl(path, params);
}

/** Basis share payload met veilige defaults (linkt naar homepage als geen pad is opgegeven). */
export function makeShareData(input: ShareDataInput) {
  const { title, text, path, params } = input;
  const shareUrl = buildShareUrl(path, params);
  return { title, text, shareUrl };
}

/** Veelgebruikt: achievement share. */
export function makeAchievementShare(achievementTitle?: string) {
  return makeShareData({
    title: "Mijn stijlprofiel is af! 🎯",
    text:
      achievementTitle
        ? `Ik heb zojuist mijn stijlprofiel ontdekt met FitFi! 🎨 Achievement unlocked: ${achievementTitle}`
        : "Ik heb zojuist mijn stijlprofiel ontdekt met FitFi! 🎨",
    params: { ref: "achievement" }
  });
}

/** Veelgebruikt: invite/referral share. */
export function makeInviteShare(userId: string) {
  return makeShareData({
    title: "Join mijn FitFi — AI-styling die bij je past",
    text: "Ontdek je stijl met mijn invite. Start gratis en ontvang outfits die wél werken.",
    params: { ref: userId }
  });
}

export default {
  buildShareUrl,
  makeShareData,
  makeAchievementShare,
  makeInviteShare,
};