import { Hero } from "./sections/Hero.js";
import { Playground } from "./sections/Playground.js";
import { Footer } from "./sections/Footer.js";

export function App() {
  return (
    <>
      <main>
        <Hero />
        <Playground />
      </main>
      <Footer />
    </>
  );
}
