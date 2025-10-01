import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Plane, Anchor, Tangent as Tank, Star, Calendar, MapPin, Award, ChevronRight, X, Cpu, Target, Globe, Zap } from 'lucide-react';

interface MilitaryEvent {
  year: number;
  title: string;
  description: string;
  category: 'formation' | 'war' | 'achievement' | 'modernization';
  significance: string;
  details: string;
}


export function AboutPage() {
  const [selectedEvent, setSelectedEvent] = useState<MilitaryEvent | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');

  const militaryEvents: MilitaryEvent[] = [
    {
      year: 1947,
      title: 'Independence & Armed Forces Formation',
      description: 'Formation of independent Indian Armed Forces',
      category: 'formation',
      significance: 'Birth of sovereign military',
      details: 'Following India\'s independence, the Indian Armed Forces were formally established, inheriting British Indian Army assets and reorganizing into three distinct services under unified command.'
    },
    {
      year: 1962,
      title: 'Sino-Indian War',
      description: 'Border conflict with China',
      category: 'war',
      significance: 'Military modernization catalyst',
      details: 'The 1962 conflict highlighted the need for military modernization, leading to significant reforms in equipment, training, and strategic thinking that shaped modern Indian defense doctrine.'
    },
    {
      year: 1965,
      title: 'Second Indo-Pakistani War',
      description: 'Second war with Pakistan',
      category: 'war',
      significance: 'Demonstrated air power importance',
      details: 'The war showcased the critical role of air superiority and led to the expansion of the Indian Air Force with modern fighter aircraft and improved tactics.'
    },
    {
      year: 1971,
      title: 'Bangladesh Liberation War',
      description: 'Liberation of Bangladesh',
      category: 'war',
      significance: 'Decisive military victory',
      details: 'The war resulted in the creation of Bangladesh and demonstrated India\'s military capabilities through coordinated land, sea, and air operations, including the largest surrender since WWII.'
    },
    {
      year: 1974,
      title: 'Operation Smiling Buddha',
      description: 'India\'s first nuclear test',
      category: 'achievement',
      significance: 'Nuclear capability demonstration',
      details: 'India conducted its first nuclear test, making it the sixth nation to possess nuclear weapons and establishing regional strategic balance.'
    },
    {
      year: 1984,
      title: 'Operation Blue Star',
      description: 'Golden Temple operation',
      category: 'achievement',
      significance: 'Counter-terrorism expertise',
      details: 'Military operation demonstrating specialized counter-terrorism capabilities and urban warfare tactics.'
    },
    {
      year: 1987,
      title: 'Operation Pawan - Sri Lanka',
      description: 'Peacekeeping mission in Sri Lanka',
      category: 'achievement',
      significance: 'International peacekeeping role',
      details: 'Large-scale peacekeeping operation showcasing India\'s ability to project power and maintain stability in the region.'
    },
    {
      year: 1999,
      title: 'Kargil War Victory',
      description: 'Victory in Kargil conflict',
      category: 'war',
      significance: 'High-altitude warfare mastery',
      details: 'Successful recapture of Kargil peaks demonstrated expertise in high-altitude warfare and precision operations in challenging terrain.'
    },
    {
      year: 2008,
      title: '26/11 Response',
      description: 'Mumbai terror attack response',
      category: 'achievement',
      significance: 'Urban counter-terrorism',
      details: 'Military and security forces response to the Mumbai attacks led to enhanced counter-terrorism protocols and inter-agency coordination.'
    },
    {
      year: 2016,
      title: 'Surgical Strikes',
      description: 'Cross-border counter-terrorism strikes',
      category: 'achievement',
      significance: 'Precision strike capability',
      details: 'Precision surgical strikes across the LoC demonstrated India\'s ability to conduct targeted operations while maintaining strategic restraint.'
    },
    {
      year: 2019,
      title: 'Balakot Air Strikes',
      description: 'Air strikes on terrorist camps',
      category: 'achievement',
      significance: 'Long-range precision strikes',
      details: 'Pre-emptive air strikes using precision-guided munitions showcased India\'s upgraded strike capabilities and intelligence coordination.'
    },
    {
      year: 2020,
      title: 'Galwan Valley Standoff',
      description: 'Border confrontation with China',
      category: 'achievement',
      significance: 'Border security resolved',
      details: 'Successful resolution of border tensions through military preparedness and diplomatic engagement, demonstrating modern border management capabilities.'
    },
    {
      year: 2024,
      title: 'AI Integration Initiative',
      description: 'Artificial Intelligence in defense',
      category: 'modernization',
      significance: 'Next-generation warfare',
      details: 'Integration of AI systems like Indra-Netra for enhanced surveillance, reconnaissance, and decision-making in modern warfare scenarios.'
    }
  ];

  const militaryBranches = [
    {
      name: 'Indian Army',
      nameHindi: 'भारतीय थलसेना',
      personnel: 1200000,
      established: 1947,
      motto: 'Service Before Self',
      headquarters: 'New Delhi',
      icon: Tank,
      color: 'from-green-600 to-green-700',
      achievements: ['Largest volunteer army in the world', 'UN peacekeeping missions', 'High-altitude warfare expertise'],
      equipment: ['Arjun Main Battle Tanks', 'T-90 Tanks', 'BrahMos Missiles', 'Pinaka MBRL']
    },
    {
      name: 'Indian Navy',
      nameHindi: 'भारतीय नौसेना',
      personnel: 67000,
      established: 1947,
      motto: 'Śaṃ No Varuṇaḥ (May the Ocean be auspicious)',
      headquarters: 'New Delhi',
      icon: Anchor,
      color: 'from-blue-600 to-blue-700',
      achievements: ['Indigenous aircraft carrier', 'Blue water navy capabilities', 'Maritime security leadership'],
      equipment: ['INS Vikrant', 'INS Vikramaditya', 'Scorpene Submarines', 'P-8I Maritime Aircraft']
    },
    {
      name: 'Indian Air Force',
      nameHindi: 'भारतीय वायु सेना',
      personnel: 140000,
      established: 1947,
      motto: 'Nabhaḥ spṛśaṃ dīptam (Touch the Sky with Glory)',
      headquarters: 'New Delhi',
      icon: Plane,
      color: 'from-sky-600 to-sky-700',
      achievements: ['Fourth largest air force', 'Multi-role combat aircraft', 'Strategic airlift capabilities'],
      equipment: ['Rafale Fighters', 'Tejas LCA', 'Su-30MKI', 'C-17 Globemaster']
    }
  ];

  const indigenousProjects = [
    {
      name: 'Tejas Light Combat Aircraft',
      type: 'Fighter Aircraft',
      status: 'Operational',
      description: 'Indigenous multi-role fighter aircraft',
      achievements: 'Successfully inducted, export orders received'
    },
    {
      name: 'Arjun Main Battle Tank',
      type: 'Armored Vehicle',
      status: 'Operational',
      description: 'Indigenous main battle tank',
      achievements: 'Superior performance in desert trials'
    },
    {
      name: 'INS Vikrant',
      type: 'Aircraft Carrier',
      status: 'Operational',
      description: 'Indigenous aircraft carrier',
      achievements: 'First indigenously built aircraft carrier'
    },
    {
      name: 'BrahMos Missile',
      type: 'Cruise Missile',
      status: 'Operational',
      description: 'Supersonic cruise missile',
      achievements: 'World\'s fastest operational cruise missile'
    }
  ];

  const aiIntegration = [
    {
      title: 'Indra-Netra Surveillance',
      description: 'Real-time military vehicle detection using computer vision',
      status: 'Active',
      impact: 'Enhanced border monitoring efficiency'
    },
    {
      title: 'Predictive Maintenance',
      description: 'AI-powered equipment maintenance scheduling',
      status: 'Deployed',
      impact: 'Reduced equipment downtime by 40%'
    },
    {
      title: 'Tactical Decision Support',
      description: 'AI-assisted battlefield decision making',
      status: 'Testing',
      impact: 'Faster strategic response times'
    },
    {
      title: 'Cyber Defense Systems',
      description: 'AI-powered cybersecurity for military networks',
      status: 'Active',
      impact: 'Enhanced network security posture'
    }
  ];

  const tabs = [
    { id: 'timeline', label: 'Military Timeline', icon: Calendar },
    { id: 'branches', label: 'Armed Forces', icon: Shield },
    { id: 'equipment', label: 'Equipment', icon: Target },
    { id: 'ai', label: 'AI Integration', icon: Cpu },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timeline':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Indian Military Timeline</h3>
              <p className="text-gray-400">Major milestones in India's defense history</p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-green-600"></div>
              
              <div className="space-y-6">
                {militaryEvents.map((event, index) => (
                  <motion.div
                    key={event.year}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start"
                  >
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                      event.category === 'formation' ? 'bg-blue-600' :
                      event.category === 'war' ? 'bg-red-600' :
                      event.category === 'achievement' ? 'bg-green-600' :
                      'bg-purple-600'
                    }`}>
                      <span className="text-white font-bold text-sm">{event.year.toString().slice(-2)}</span>
                    </div>
                    
                    {/* Event card */}
                    <div className="ml-6 flex-1">
                      <div 
                        className="bg-slate-800 p-4 rounded-lg cursor-pointer hover:bg-slate-700 transition-all"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            event.category === 'formation' ? 'bg-blue-600/20 text-blue-400' :
                            event.category === 'war' ? 'bg-red-600/20 text-red-400' :
                            event.category === 'achievement' ? 'bg-green-600/20 text-green-400' :
                            'bg-purple-600/20 text-purple-400'
                          }`}>
                            {event.category.toUpperCase()}
                          </span>
                          <span className="text-orange-500 text-sm font-medium">{event.year}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'branches':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Indian Armed Forces</h3>
              <p className="text-gray-400">Three pillars of national defense</p>
            </div>

            <div className="space-y-6">
              {militaryBranches.map((branch, index) => {
                const Icon = branch.icon;
                return (
                  <motion.div
                    key={branch.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`bg-gradient-to-r ${branch.color} p-6 rounded-2xl text-white`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-white/20 p-3 rounded-lg">
                        <Icon className="h-8 w-8" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold mb-1">{branch.name}</h4>
                        <p className="text-lg opacity-90 mb-4">{branch.nameHindi}</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Personnel:</span>
                                <span className="font-bold">{branch.personnel.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Established:</span>
                                <span className="font-bold">{branch.established}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Headquarters:</span>
                                <span className="font-bold">{branch.headquarters}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm opacity-90 italic">"{branch.motto}"</p>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold mb-2">Key Achievements:</h5>
                            <ul className="text-sm space-y-1">
                              {branch.achievements.map((achievement, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <Star className="h-3 w-3 mt-1 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary statistics */}
            <div className="bg-slate-800 p-6 rounded-2xl">
              <h4 className="text-xl font-bold text-white mb-4">Combined Force Strength</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">1.4M+</div>
                  <div className="text-gray-400">Total Active Personnel</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">3</div>
                  <div className="text-gray-400">Service Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500">77+</div>
                  <div className="text-gray-400">Years of Service</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Indigenous Defense Equipment</h3>
              <p className="text-gray-400">Make in India defense initiatives</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {indigenousProjects.map((project, index) => (
                <motion.div
                  key={project.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800 p-6 rounded-2xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white">{project.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'Operational' ? 'bg-green-600 text-white' :
                      project.status === 'Testing' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-orange-500 font-semibold">{project.type}</div>
                    <p className="text-gray-400 text-sm">{project.description}</p>
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="text-green-400 text-sm font-semibold mb-1">Key Achievement:</div>
                      <div className="text-gray-300 text-sm">{project.achievements}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-2xl text-white">
              <h4 className="text-xl font-bold mb-4">Make in India Defense</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">₹75,000+ Cr</div>
                  <div className="text-sm opacity-90">Indigenous Production Value</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm opacity-90">Self-Reliance Target</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">200+</div>
                  <div className="text-sm opacity-90">Defense Companies</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">AI Integration in Defense</h3>
              <p className="text-gray-400">Modernizing military capabilities with artificial intelligence</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {aiIntegration.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-orange-500 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-white">{project.title}</h4>
                    <div className={`w-3 h-3 rounded-full ${
                      project.status === 'Active' ? 'bg-green-500 animate-pulse' :
                      project.status === 'Deployed' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></div>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{project.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Status:</span>
                      <span className={`font-semibold ${
                        project.status === 'Active' ? 'text-green-500' :
                        project.status === 'Deployed' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="text-orange-500 font-semibold text-sm">Impact:</div>
                      <div className="text-gray-300 text-sm">{project.impact}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Indra-Netra Highlight */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-2xl text-white">
              <div className="flex items-center space-x-3 mb-4">
                <Cpu className="h-8 w-8" />
                <div>
                  <h4 className="text-xl font-bold">Indra-Netra: AI Surveillance Excellence</h4>
                  <p className="opacity-90">Advanced military vehicle detection system</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-2xl font-bold">94.7%</div>
                  <div className="text-sm opacity-90">Detection Accuracy</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-2xl font-bold">30 FPS</div>
                  <div className="text-sm opacity-90">Real-time Processing</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm opacity-90">Continuous Monitoring</div>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="text-2xl font-bold">4+</div>
                  <div className="text-sm opacity-90">Vehicle Types</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Military Achievements</h3>
              <p className="text-gray-400">Distinguished service and recognition</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 p-6 rounded-2xl">
                <Globe className="h-8 w-8 text-blue-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">UN Peacekeeping</h4>
                <p className="text-gray-400 text-sm mb-3">
                  India is the largest contributor to UN peacekeeping operations with over 200,000 personnel deployed.
                </p>
                <div className="text-blue-500 font-semibold">200,000+ Personnel Deployed</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <Award className="h-8 w-8 text-green-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Param Vir Chakra</h4>
                <p className="text-gray-400 text-sm mb-3">
                  India's highest military decoration, awarded for most conspicuous bravery in the presence of the enemy.
                </p>
                <div className="text-green-500 font-semibold">21 Recipients</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <Target className="h-8 w-8 text-orange-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Nuclear Triad</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Successfully developed and deployed nuclear weapons across land, sea, and air platforms.
                </p>
                <div className="text-orange-500 font-semibold">Complete Capability</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <Zap className="h-8 w-8 text-purple-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Missile Technology</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Advanced missile systems including BrahMos, Agni series, and Prithvi missiles.
                </p>
                <div className="text-purple-500 font-semibold">World-Class Systems</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <MapPin className="h-8 w-8 text-red-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Border Management</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Securing 15,106 km of land borders and 7,516 km of coastline with advanced technology.
                </p>
                <div className="text-red-500 font-semibold">22,622 km Total</div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl">
                <Users className="h-8 w-8 text-indigo-500 mb-3" />
                <h4 className="text-lg font-bold text-white mb-2">Women in Forces</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Progressive inclusion of women in combat roles and leadership positions across all services.
                </p>
                <div className="text-indigo-500 font-semibold">Breaking Barriers</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-orange-600 p-6 rounded-2xl text-white">
              <h4 className="text-xl font-bold mb-4 text-center">International Recognition</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold mb-2">Military Exercises</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Exercise Malabar (India-US-Japan-Australia)</li>
                    <li>• Exercise Vajra Prahar (India-US)</li>
                    <li>• Exercise Indra (India-Russia)</li>
                    <li>• Exercise Garuda (India-France)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Defense Partnerships</h5>
                  <ul className="space-y-1 text-sm">
                    <li>• Major Defense Partner (US)</li>
                    <li>• Strategic Partnership (Russia)</li>
                    <li>• Defense Cooperation Agreement (France)</li>
                    <li>• Military Technology Partnership (Israel)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Indian Armed Forces</h1>
          <p className="text-xl text-orange-300 mb-4">भारतीय सशस्त्र बल</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive overview of India's military heritage, capabilities, and modernization journey 
            including the integration of advanced AI systems like Indra-Netra.
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                    <p className="text-orange-500 font-semibold">{selectedEvent.year}</p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Overview</h4>
                    <p className="text-gray-300">{selectedEvent.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Historical Significance</h4>
                    <p className="text-gray-300">{selectedEvent.significance}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Details</h4>
                    <p className="text-gray-300">{selectedEvent.details}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedEvent.category === 'formation' ? 'bg-blue-600/20 text-blue-400' :
                      selectedEvent.category === 'war' ? 'bg-red-600/20 text-red-400' :
                      selectedEvent.category === 'achievement' ? 'bg-green-600/20 text-green-400' :
                      'bg-purple-600/20 text-purple-400'
                    }`}>
                      {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}