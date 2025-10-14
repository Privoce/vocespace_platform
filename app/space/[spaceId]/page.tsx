"use client";
import SpaceAbout from "./about";

export default function Page({ params }: { params: { spaceId: string } }) {
  console.warn("space about page render", params.spaceId);
  return <SpaceAbout spaceId={params.spaceId}></SpaceAbout>;
}
