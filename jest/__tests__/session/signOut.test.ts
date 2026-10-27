/**
 * @jest-environment jsdom
 */

import { handleSignOut } from "@/_utils/handleSignOut";
import logSessionEnd from "@/_lib/supabase/logSessionEnd";
import { signOut } from "next-auth/react";

jest.mock("@/_lib/supabase/logSessionEnd");
jest.mock("next-auth/react");

describe("handleSignOut", () => {
  beforeEach(() => {
    (logSessionEnd as jest.Mock).mockImplementation(() => Promise.resolve());
  });

  it("calls logSessionEnd and signOut", async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);
    await handleSignOut("s1");
    expect(logSessionEnd).toHaveBeenCalledWith("s1");
    expect(signOut).toHaveBeenCalledWith({ redirect: true, callbackUrl: "/login" });
  });
});
