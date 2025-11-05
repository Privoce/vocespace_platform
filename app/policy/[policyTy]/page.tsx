"use client";

import { PrivacyPolicy } from "./privacy";
import { TeamsPolicy } from "./teams";
import { notFound } from "next/navigation";

const validPolicyTypes = ["privacy", "terms", "teams"];

export default function Page({ params }: { params: { policyTy: string } }) {
  return (
    <div style={{ height: "100vh", overflowY: "scroll", width: "100vw" }}>
      {params.policyTy === "privacy" ? (
        <PrivacyPolicy />
      ) : params.policyTy === "teams" ? (
        <TeamsPolicy />
      ) : (
        <PrivacyPolicy />
      )}
    </div>
  );
}
