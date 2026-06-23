import { I18nProvider } from "./i18n/I18nContext";
import { useLenis } from "./lib/useLenis";
import { Topbar } from "./components/Topbar";
import { Hero } from "./components/Hero";
import { Principles } from "./components/Principles";
import { Projects } from "./components/Projects";
import { Stack } from "./components/Stack";
import { Releases } from "./components/Releases";
import { Contact } from "./components/Contact";
import { Marquee } from "./components/Marquee";
import { Footer } from "./components/Footer";

function Site() {
  useLenis();
  return (
    <>
      <div className="glow" aria-hidden="true" />
      <div className="gridlines" aria-hidden="true" />
      <div className="dotgrid" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Topbar />
      <main>
        <Hero />
        <Principles />
        <Projects />
        <Stack />
        <Releases />
        <Contact />
      </main>
      <Marquee />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Site />
    </I18nProvider>
  );
}
