'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { MapPin, Star, Users, Download, ChevronDown, Coffee, ArrowRight } from 'lucide-react';
import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

// Animation variants for consistent motion
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 100,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 15,
      stiffness: 100,
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and redirect to feed
    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/feed');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="bg-gradient-to-b from-primary-lighter to-primary-light">
      {/* Top Navigation Buttons */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-end gap-3">
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-primary hover:text-primary-dark font-semibold transition text-sm"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition text-sm shadow-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Hero Section - Full Height */}
      <section className="scroll-section px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-40">
        <div className="max-w-6xl mx-auto text-center pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Logo */}
            <motion.div variants={scaleIn} className="mb-8">
              <div className="inline-flex items-center gap-4 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center shadow-2xl glow-effect">
                  <Coffee className="w-14 h-14 text-white" strokeWidth={2} />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeInUp} className="mb-6">
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
                Beany
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={fadeInLeft} className="mb-8">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Your Next
                <span className="block text-primary mt-2">Favorite Coffee Spot</span>
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div variants={fadeInRight} className="mb-12">
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                Explore local coffee shops, share your experiences, and connect with friends who love coffee.
              </p>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={fadeInUp}
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <div className="animate-bounce">
                <ChevronDown className="w-10 h-10 text-primary" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Scroll to explore</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Discover Section - Full Height */}
      <SectionWrapper id="discover-section" bgClass="bg-gradient-to-br from-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              className="order-2 md:order-1"
            >
              <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Discover
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Find coffee shops near you with detailed maps, reviews, and directions. Explore new spots and hidden gems in your area.
                </p>
                <div className="mt-8 flex items-center text-primary font-semibold">
                  <span className="mr-2">Find your spot</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              transition={{ delay: 0.2 }}
              className="order-1 md:order-2 flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center glow-effect-strong">
                  <MapPin className="w-32 h-32 md:w-40 md:h-40 text-primary opacity-80" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Share Section - Full Height */}
      <SectionWrapper id="share-section" bgClass="bg-gradient-to-bl from-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center glow-effect-strong">
                  <Star className="w-32 h-32 md:w-40 md:h-40 text-primary opacity-80" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                  <Star className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Share
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Rate and review your favorite drinks to help the community discover great coffee. Share photos and experiences.
                </p>
                <div className="mt-8 flex items-center text-primary font-semibold">
                  <span className="mr-2">Share your experience</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Connect Section - Full Height */}
      <SectionWrapper id="connect-section" bgClass="bg-gradient-to-br from-primary/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              className="order-2 md:order-1"
            >
              <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-lg">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Connect
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Follow friends, see where they go, and plan coffee meetups together. Build your coffee community.
                </p>
                <div className="mt-8 flex items-center text-primary font-semibold">
                  <span className="mr-2">Join the community</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={scaleIn}
              transition={{ delay: 0.2 }}
              className="order-1 md:order-2 flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center glow-effect-strong">
                  <Users className="w-32 h-32 md:w-40 md:h-40 text-primary opacity-80" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Section - Full Height */}
      <SectionWrapper id="cta-section">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bg-white rounded-3xl shadow-2xl p-10 md:p-16 text-center glow-effect"
          >
            <motion.h3 variants={fadeInUp} className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Ready to start exploring?
            </motion.h3>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-10">
              Join thousands of coffee lovers discovering the best local spots
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/auth/signup"
                className="px-10 py-5 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                Sign Up Free
              </Link>
              <Link
                href="/auth/signin"
                className="px-10 py-5 bg-white text-primary rounded-full font-bold text-lg hover:bg-primary-lighter transition-all duration-300 shadow-xl border-2 border-primary hover:-translate-y-1"
              >
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Install Section */}
      <SectionWrapper id="install-section" addPadding>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-10 md:p-14 border border-primary/20"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-3 mb-8">
              <Download className="w-10 h-10 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Install the App</h3>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-lg text-gray-700 mb-8 text-center">
              Add Beany to your home screen for the best experience
            </motion.p>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
              {/* iOS Instructions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                  <span>🍎</span>
                  <span>iPhone or iPad</span>
                </h4>
                <ol className="text-sm text-gray-600 space-y-2 ml-5">
                  <li>Visit in <strong>Safari</strong></li>
                  <li>Tap <strong>Share</strong> button</li>
                  <li>Tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong></li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                  <span>🤖</span>
                  <span>Android</span>
                </h4>
                <ol className="text-sm text-gray-600 space-y-2 ml-5">
                  <li>Visit in <strong>Chrome</strong></li>
                  <li>Tap <strong>three dots</strong> menu</li>
                  <li>Tap <strong>"Install App"</strong></li>
                </ol>
              </div>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-xs text-gray-500 text-center mt-6 italic">
              Reinstall anytime to update the icon
            </motion.p>
          </motion.div>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Built with Next.js, TypeScript, and Tailwind CSS</p>
      </footer>
    </div>
  );
}

// Reusable section wrapper
function SectionWrapper({
  id,
  bgClass = "",
  addPadding = false,
  children,
}: {
  id?: string;
  bgClass?: string;
  addPadding?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section
      ref={ref}
      id={id}
      className={`scroll-section px-6 md:px-12 lg:px-24 xl:px-32 2xl:px-40 ${bgClass} ${addPadding ? 'pb-20' : ''}`}
    >
      {children}
    </section>
  );
}
