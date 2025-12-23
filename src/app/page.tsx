import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Products from "@/components/Products";
import Testimonials from "@/components/Testimonials";
import PocketSize from "@/components/PocketSize";
import Comparison from "@/components/Comparison";
import LabTested from "@/components/LabTested";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-yum-dark">
      <Navbar />
      <Hero />
      <About />
      <Products />
      <Testimonials />
      <PocketSize />
      <Comparison />
      <LabTested />
      <FAQ />
      <Newsletter />
      <Footer />
    </main>
  );
}
