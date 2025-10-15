"use client";
import { HomeHeader } from "./home/header";
import { DisplaySpaces } from "./home/main";
import styles from "@/styles/home.module.scss";
import { HomeSearch } from "./home/search";
import { HomeFooter } from "./home/footer";

export default function Home() {
  return (
    <main className={styles.main}>
      <HomeHeader />
      <HomeSearch />
      <DisplaySpaces />
      <HomeFooter />
    </main>
  );
}
