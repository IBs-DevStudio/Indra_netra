import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Image, Shield, TrendingUp, Clock, DollarSign, Eye, Plane, Anchor, Tangent as Tank } from 'lucide-react';

export function LandingPage() {
  const [stats, setStats] = useState({
    personnel: 0,
    accuracy: 0,
    responseTime: 0,
    costReduction: 0
  });

  // Animate statistics on mount
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        const progress = Math.min(step / steps, 1);
        
        setStats({
          personnel: Math.round(1400000 * progress),
          accuracy: Math.round(94.7 * progress * 10) / 10,
          responseTime: Math.round(65 * progress),
          costReduction: Math.round(40 * progress)
        });

        step++;
        if (progress >= 1) clearInterval(timer);
      }, increment);
    };

    animateStats();
  }, []);

  const militaryBranches = [
    {
      name: 'Indian Army',
      nameHindi: 'भारतीय थलसेना',
      personnel: '1,200,000',
      icon: Tank,
      color: 'from-green-600 to-green-700'
    },
    {
      name: 'Indian Navy', 
      nameHindi: 'भारतीय नौसेना',
      personnel: '67,000',
      icon: Anchor,
      color: 'from-blue-600 to-blue-700'
    },
    {
      name: 'Indian Air Force',
      nameHindi: 'भारतीय वायु सेना',
      personnel: '140,000',
      icon: Plane,
      color: 'from-sky-600 to-sky-700'
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Real-time Detection',
      description: '24/7 automated monitoring with instant threat identification',
      stat: 'Sub-second response'
    },
    {
      icon: Shield,
      title: 'Enhanced Security',
      description: 'Advanced AI reduces human error in surveillance operations',
      stat: '87% error reduction'
    },
    {
      icon: TrendingUp,
      title: 'Strategic Advantage',
      description: 'Faster decision making with AI-powered intelligence',
      stat: '65% faster response'
    },
    {
      icon: DollarSign,
      title: 'Cost Efficiency',
      description: 'Reduced manpower needs while increasing effectiveness',
      stat: '40% cost reduction'
    }
  ];

  const features = [
    {
      title: 'Live Detection',
      description: 'Real-time camera monitoring',
      path: '/detection',
      icon: Camera,
      color: 'bg-red-600'
    },
    {
      title: 'Image Analysis',
      description: 'Batch process uploaded images',
      path: '/analysis', 
      icon: Image,
      color: 'bg-blue-600'
    },
    {
      title: 'Surveillance',
      description: 'Multi-stream monitoring',
      path: '/surveillance',
      icon: Shield,
      color: 'bg-purple-600'
    },
    {
      title: 'Analytics',
      description: 'Comprehensive reporting',
      path: '/analytics',
      icon: TrendingUp,
      color: 'bg-green-600'
    }
  ];

  const majorEvents = [
    { year: 1947, event: 'Armed Forces Formation' },
    { year: 1962, event: 'Indo-China War' },
    { year: 1971, event: 'Bangladesh Liberation' },
    { year: 1999, event: 'Kargil Victory' },
    { year: 2016, event: 'Surgical Strikes' },
    { year: 2024, event: 'AI Integration' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative px-4 py-20 text-center"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Eye className="h-16 w-16 text-orange-500 mr-4" />
              <div>
                <h1 className="text-6xl font-bold text-white mb-2">Indra-Netra</h1>
                <p className="text-2xl text-orange-300">(इन्द्र नेत्र)</p>
              </div>
            </div>
            <h2 className="text-3xl font-semibold text-gray-200 mb-6">
              India's AI-Powered Military Vehicle Detection System
            </h2>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="text-5xl font-bold text-orange-500 mb-2">
                {stats.personnel.toLocaleString()}+
              </div>
              <div className="text-gray-300">Personnel Protected by AI Surveillance</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/detection"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Live Detection
              </Link>
              <Link
                to="/analysis"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Analyze Images
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </motion.section>

      {/* Indian Armed Forces Section */}
      <section className="px-4 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-4"
          >
            Indian Armed Forces
          </motion.h2>
          <p className="text-center text-gray-400 mb-12">भारतीय सशस्त्र बल</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {militaryBranches.map((branch, index) => {
              const Icon = branch.icon;
              return (
                <motion.div
                  key={branch.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className={`bg-gradient-to-br ${branch.color} p-8 rounded-2xl text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
                >
                  <Icon className="h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{branch.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{branch.nameHindi}</p>
                  <div className="text-3xl font-bold">{branch.personnel}</div>
                  <div className="text-sm opacity-90">Active Personnel</div>
                </motion.div>
              );
            })}
          </div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="bg-slate-800 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Major Military Milestones</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {majorEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="text-orange-500 font-bold text-lg">{event.year}</div>
                  <div className="text-gray-300 text-sm">{event.event}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-12"
          >
            How Indra-Netra Enhances Defense
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="bg-slate-800 p-6 rounded-2xl hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Icon className="h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 mb-4">{benefit.description}</p>
                  <div className="text-green-500 font-bold">{benefit.stat}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Overview */}
      <section className="px-4 py-16 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Powered by Advanced AI</h2>
            <p className="text-gray-400">TensorFlow.js integration with real-time processing</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-800 p-6 rounded-2xl text-center"
            >
              <div className="text-3xl font-bold text-orange-500 mb-2">{stats.accuracy}%</div>
              <div className="text-white font-semibold mb-2">Detection Accuracy</div>
              <div className="text-gray-400 text-sm">Military vehicle identification precision</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-800 p-6 rounded-2xl text-center"
            >
              <div className="text-3xl font-bold text-green-500 mb-2">30 FPS</div>
              <div className="text-white font-semibold mb-2">Real-time Processing</div>
              <div className="text-gray-400 text-sm">Live video analysis speed</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-slate-800 p-6 rounded-2xl text-center"
            >
              <div className="text-3xl font-bold text-blue-500 mb-2">4+</div>
              <div className="text-white font-semibold mb-2">Vehicle Types</div>
              <div className="text-gray-400 text-sm">Tanks, Jets, Ships, Helicopters</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-12"
          >
            System Capabilities
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                >
                  <Link
                    to={feature.path}
                    className="block bg-slate-800 p-6 rounded-2xl hover:bg-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                  >
                    <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-orange-500 mr-2" />
            <span className="text-white font-bold text-xl">Indra-Netra (इन्द्र नेत्र)</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-Powered Military Vehicle Detection System for Enhanced Border Security
          </p>
          <p className="text-gray-500 text-sm">
            Demo system for educational purposes. Not affiliated with Indian Armed Forces.
          </p>
        </div>
      </footer>
    </div>
  );
}