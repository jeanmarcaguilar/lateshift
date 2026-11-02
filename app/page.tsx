import Hero from "@/components/hero/Hero";
// The home page no longer needs the database, so it can't crash if a key is wrong.
export default function Home() {
  return <main><Hero /></main>;
}