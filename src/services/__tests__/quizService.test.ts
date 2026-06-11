import { beforeEach, describe, expect, it } from "vitest";
import { quizService } from "../quizService";

// quizService guards on `typeof window` and uses window.localStorage at call
// time, so a minimal stub is enough in the node environment.
function installLocalStorageStub() {
  const store = new Map<string, string>();
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

describe("quizService compat methods (used by useQuizAnswers)", () => {
  beforeEach(() => {
    installLocalStorageStub();
  });

  it("getUserAnswers returns null when nothing was submitted", async () => {
    const result = await quizService.getUserAnswers("user-1");
    expect(result).toBeNull();
  });

  it("submitAnswers stores answers and getUserAnswers returns a QuizSubmission", async () => {
    const ok = await quizService.submitAnswers("user-1", { gender: "male" } as any);
    expect(ok).toBe(true);

    const submission = await quizService.getUserAnswers("user-1");
    expect(submission).not.toBeNull();
    expect(submission!.user_id).toBe("user-1");
    expect(submission!.answers).toMatchObject({ gender: "male" });
    expect(typeof submission!.completed_at).toBe("string");
    expect(typeof submission!.created_at).toBe("string");
  });

  it("resetQuiz clears the stored submission", async () => {
    await quizService.submitAnswers("user-1", { gender: "male" } as any);
    const ok = await quizService.resetQuiz("user-1");
    expect(ok).toBe(true);
    expect(await quizService.getUserAnswers("user-1")).toBeNull();
  });
});
