import { I18nProvider } from "./i18n/I18nContext";
import { Topbar } from "./components/Topbar";
import { Minimap } from "./components/Minimap";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Websites } from "./components/Websites";
import { LabTeaser } from "./components/LabTeaser";
import { Films } from "./components/Films";
import { Principles } from "./components/Principles";
import { Releases } from "./components/Releases";
import { Contact } from "./components/Contact";
import { AsciiCoda } from "./components/AsciiCoda";
import { Marquee } from "./components/Marquee";
import { Footer } from "./components/Footer";
import { StickyHire } from "./components/StickyHire";

function Site() {
  return (
    <>
      <div className="glow" aria-hidden="true" />
      <div className="gridlines" aria-hidden="true" />
      <div className="dotgrid" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Topbar />
      <Minimap />
      <main>
        <Hero />
        <Projects />
        <Websites />
        <LabTeaser />
        <Films />
        <Principles />
        <Releases />
        <Contact />
      </main>
      <AsciiCoda />
      <Marquee />
      <Footer />
      <StickyHire />
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
