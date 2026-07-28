import BuildSection from '@/components/BuildSection';
import ContactSection from '@/components/ContactSection';
import EatSection from '@/components/EatSection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LifeSection from '@/components/LifeSection';
import WorkSection from '@/components/WorkSection';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <WorkSection />
      <EatSection />
      <BuildSection />
      <LifeSection />
      <ContactSection />
      <Footer />
    </>
  );
}
