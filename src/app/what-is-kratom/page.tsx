import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import FreeSamplePopup from "./FreeSamplePopup";

export const metadata: Metadata = {
  title: "What Is Kratom? 10 Things You've Heard That Deserve More Nuance",
  description:
    "You searched 'what is kratom' and got FDA warnings on one side and Reddit praise on the other. Here's the straight, nuanced answer — what it is, how it works, why product quality decides everything, and how to try it responsibly.",
  alternates: { canonical: "/what-is-kratom" },
};

function SampleCTA({ label = "Try a YUM sample — free" }: { label?: string }) {
  return (
    <div className="my-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-yum-pink/10 to-yum-cyan/5">
      <div className="grid sm:grid-cols-2 items-center">
        <div className="relative h-48 sm:h-full min-h-[180px]">
          <Image
            src="/images/sample-bg-14ml.jpg"
            alt="YUM Bubble Gum kratom extract sample bottle"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </div>
        <div className="p-6 sm:p-8 text-center sm:text-left">
          <p className="uppercase tracking-[0.25em] text-yum-gold text-[11px] mb-2">No commitment</p>
          <p className="text-white text-lg sm:text-xl font-semibold mb-4 leading-snug">
            Taste what a <span className="text-yum-pink">clean, standardized</span> extract is
            actually like.
          </p>
          <Link
            href="/free-sample"
            className="inline-block rounded-full bg-yum-pink hover:bg-yum-pink-light transition px-7 py-3.5 font-bold text-white"
          >
            {label} →
          </Link>
          <p className="text-white/40 text-xs mt-3">Full 14ml bottle · just cover shipping</p>
        </div>
      </div>
    </div>
  );
}

export default function WhatIsKratomPage() {
  return (
    <main className="relative bg-[#080808] text-white">
      <FreeSamplePopup />

      <div className="pointer-events-none absolute top-0 -left-32 w-[32rem] h-[32rem] rounded-full bg-yum-pink/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-[60rem] -right-32 w-[32rem] h-[32rem] rounded-full bg-yum-cyan/10 blur-[130px]" />

      <article className="relative mx-auto max-w-2xl px-5 py-14 sm:py-20">
        {/* ── Hero ── */}
        <header className="mb-10">
          <p className="uppercase tracking-[0.3em] text-white/40 text-xs mb-5">The honest answer</p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] mb-6 text-balance">
            What Is Kratom? 10 Things You&rsquo;ve Heard That Deserve More Nuance
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            You typed &ldquo;what is kratom&rdquo; into Google and got a wall of FDA warnings, a Mayo
            Clinic page calling it &ldquo;unsafe and ineffective,&rdquo; and a DEA fact sheet that reads
            like a 1985 public-service announcement. Then you scrolled to Reddit and found thousands of
            adults saying it changed their lives. So which is it — dangerous substance or useful
            botanical? The honest answer is more nuanced than any headline admits.
          </p>
        </header>

        {/* hero image */}
        <figure className="mb-12 overflow-hidden rounded-3xl border border-white/10">
          <div className="relative aspect-[16/10]">
            <Image
              src="/images/product-1.png"
              alt="DrinkYUM kratom extract beverages"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        </figure>

        <div className="space-y-6 text-white/80 text-[17px] leading-[1.75]">
          <h2 className="text-2xl font-bold text-white pt-2">
            Why your search results look like a warning label
          </h2>
          <p>
            When you Google &ldquo;what is kratom,&rdquo; the algorithm prioritizes authoritative medical
            and government sources. Those sources have real credibility — but their mandate is risk
            communication. No agency gets rewarded for saying &ldquo;well, it depends on the product
            quality and how you use it.&rdquo; Their job is to lead with danger.
          </p>
          <p>
            Meanwhile, millions of adults use kratom regularly without incident. The gap between the two
            stories isn&rsquo;t a conspiracy — it&rsquo;s the difference between a warning label and lived
            experience. You&rsquo;re right to be confused. Let&rsquo;s work through it.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">The plant, in plain English</h2>
          <p>
            Kratom (<em>Mitragyna speciosa</em>) is a tree in the coffee family, native to Southeast
            Asia. For centuries, laborers in Thailand and Malaysia chewed the leaves the way you might
            reach for a strong coffee — to feel a bit more awake, a bit more at ease through a long day.
          </p>
          <p>
            The leaves contain <strong>alkaloids</strong> — chiefly mitragynine, plus a trace of
            7-hydroxymitragynine. These interact with receptors in the body, which is why scary headlines
            call it &ldquo;opioid-like.&rdquo; But that framing skips the nuance: mitragynine&rsquo;s
            effect profile is genuinely different, and how it behaves depends almost entirely on{" "}
            <em>dose</em> and <em>product quality.</em> Small amounts: energizing and clear. Larger
            amounts: more relaxed. Same plant, different serving.
          </p>

          <SampleCTA />

          <h2 className="text-2xl font-bold text-white pt-4">
            The part nobody tells you: the product matters more than the plant
          </h2>
          <p>
            Here&rsquo;s what the FDA warnings and the Reddit hype both leave out. Most bad kratom
            experiences aren&rsquo;t about kratom — they&rsquo;re about <em>bad kratom.</em> Loose green
            powder from a smoke shop is bitter, gritty, inconsistent batch-to-batch, and impossible to
            dose accurately. Mystery &ldquo;liquid gold&rdquo; shots hide what&rsquo;s inside. When your
            product is a guess, your experience is a guess.
          </p>
          <p>
            <strong>A good extract fixes the two biggest problems: consistency and dosing.</strong> It
            standardizes the active alkaloids so every serving is the same strength — and you stop
            playing &ldquo;was that too much or not enough?&rdquo; The catch: extracts vary wildly in
            quality. Which is exactly where most first-timers get burned.
          </p>

          {/* lifestyle image break */}
          <figure className="my-10 overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-square sm:aspect-[4/3]">
              <Image
                src="/images/cloak/lifestyle-beachforward.jpg"
                alt="A YUM botanical extract shot at the beach"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
            <figcaption className="bg-white/[0.03] px-5 py-3 text-center text-white/50 text-sm">
              The right product turns a gamble into something you actually look forward to.
            </figcaption>
          </figure>

          <h2 className="text-2xl font-bold text-white pt-2">
            5 things that separate a good extract from a bad one
          </h2>
          <ol className="space-y-4 list-none pl-0">
            <li>
              <span className="text-yum-pink font-semibold">1. Third-party lab testing.</span> A real
              brand publishes a Certificate of Analysis per batch — alkaloid content plus screens for
              heavy metals, salmonella, and mold. No lab results? Assume there aren&rsquo;t any.
            </li>
            <li>
              <span className="text-yum-pink font-semibold">2. Standardized dosing.</span> The label
              should state the exact mitragynine per serving. &ldquo;Extra strength&rdquo; is a marketing
              word, not a dose.
            </li>
            <li>
              <span className="text-yum-pink font-semibold">3. A short, clean ingredient list.</span>{" "}
              Kratom extract, water, natural flavor. Long lists of synthetic additives — especially
              concentrated 7-OH gimmicks — are a red flag.
            </li>
            <li>
              <span className="text-yum-pink font-semibold">4. It&rsquo;s genuinely drinkable.</span> Raw
              extract is punishingly bitter. If you dread it, you&rsquo;ll rush the dose to get it over
              with — which is how people take too much.
            </li>
            <li>
              <span className="text-yum-pink font-semibold">5. Transparent US sourcing.</span> A company
              that&rsquo;ll tell you where the leaf came from beats a faceless bag from behind a counter.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-white pt-4">Where YUM comes in</h2>
          <p>
            We built <strong className="text-white">DrinkYUM</strong> because we were tired of the only
            two options: gritty powder that tastes like a lawn, or mystery shots with no idea what was
            inside. So we made the extract we actually wanted to drink — and it checks every box above.
          </p>

          {/* feature cards with images */}
          <div className="grid sm:grid-cols-2 gap-4 not-prose my-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="relative aspect-square">
                <Image src="/images/lab-tested.png" alt="Lab-tested every batch" fill className="object-contain p-6" sizes="320px" />
              </div>
              <div className="p-5 pt-0">
                <p className="font-semibold text-white">Lab-tested every batch</p>
                <p className="text-white/60 text-sm mt-1">Alkaloid content and contaminant screens you can actually see.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="relative aspect-square">
                <Image src="/images/sample-tb-14ml.jpg" alt="Tropical Breeze — easy to drink" fill className="object-cover" sizes="320px" />
              </div>
              <div className="p-5">
                <p className="font-semibold text-white">Actually easy to drink</p>
                <p className="text-white/60 text-sm mt-1">Bubble Gum & Tropical Breeze — no bitter extract aftertaste.</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            <li>✓ <strong>Standardized servings</strong> — same strength every time, so you find your level and stay there.</li>
            <li>✓ <strong>Short, honest ingredient list</strong> — no synthetic filler, no 7-OH tricks.</li>
            <li>✓ <strong>Transparent US sourcing</strong> — we&rsquo;ll tell you where the leaf came from.</li>
          </ul>
          <p>
            We won&rsquo;t tell you kratom is a miracle — anyone who does is selling you something. What
            we&rsquo;ll tell you is that <em>if</em> you&rsquo;re going to try it, the product you pick
            matters more than almost anything else you&rsquo;ll read today.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">If it&rsquo;s your first time</h2>
          <p>
            Start with <strong>half a serving</strong> and wait 30–45 minutes before deciding if you want
            more. Try it with and without food to see what your body prefers. Don&rsquo;t combine it with
            alcohol or sedatives. It&rsquo;s for adults 21+ and isn&rsquo;t intended for daily use. Boring
            advice — and it&rsquo;ll save you a bad first impression.
          </p>

          {/* Final close */}
          <div className="my-12 overflow-hidden rounded-3xl border border-yum-pink/30">
            <div className="relative aspect-[16/9]">
              <Image src="/images/free-sample-hero.png" alt="Claim your free YUM sample" fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-snug">
                  The fastest way to answer &ldquo;is it for me?&rdquo; — taste it.
                </h2>
                <p className="text-white/80 mb-5 max-w-md text-sm sm:text-base">
                  A full 14ml YUM bottle, on us — you just cover shipping. One per customer.
                </p>
                <Link
                  href="/free-sample"
                  className="inline-block rounded-full bg-yum-pink hover:bg-yum-pink-light transition px-10 py-4 font-bold text-white text-lg"
                >
                  Claim your free sample →
                </Link>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs leading-relaxed pt-4 border-t border-white/10">
            This article is for general education and is not medical advice. Kratom is not approved by the
            FDA to diagnose, treat, cure, or prevent any disease. Must be 21+. Not intended for daily use.
            Consult a healthcare provider before use, especially if pregnant, nursing, or taking medication.
          </p>
        </div>
      </article>
    </main>
  );
}
