// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import {
  Pill,
  Bell,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Clock,
  Heart,
  Check,
  Smartphone,
  ArrowRight,
  Menu,
  X,
  Star
} from 'lucide-react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Bell className="text-indigo-600" size={32} />,
      title: "Smart Reminders",
      description: "Never miss a dose with customizable notifications and alerts tailored to your schedule."
    },
    {
      icon: <Calendar className="text-purple-600" size={32} />,
      title: "Medicine Schedule",
      description: "Organize all your medications in one place with easy-to-view daily schedules."
    },
    {
      icon: <Users className="text-pink-600" size={32} />,
      title: "Caregiver Support",
      description: "Link family members or caregivers to monitor your adherence remotely."
    },
    {
      icon: <TrendingUp className="text-blue-600" size={32} />,
      title: "Adherence Tracking",
      description: "Track your medication adherence with detailed statistics and visual progress."
    },
    {
      icon: <Shield className="text-green-600" size={32} />,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected with industry-standard security."
    },
    {
      icon: <Smartphone className="text-orange-600" size={32} />,
      title: "Works Everywhere",
      description: "Access on any device - mobile, tablet, or desktop. Your data syncs seamlessly."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient",
      content: "This app has changed my life! I used to forget my medications constantly, but now I'm 100% adherent.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Caregiver",
      content: "Being able to monitor my mother's medications remotely gives me so much peace of mind.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Healthcare Provider",
      content: "I recommend this app to all my patients. The adherence tracking really helps improve health outcomes.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <Pill className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MediRemind
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition-colors">Testimonials</a>
              <button 
                onClick={onLogin}
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                Log In
              </button>
              <button 
                onClick={onGetStarted}
                className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-indigo-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-600 hover:text-indigo-600 py-2">Features</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-indigo-600 py-2">How It Works</a>
              <a href="#testimonials" className="block text-gray-600 hover:text-indigo-600 py-2">Testimonials</a>
              <button 
                onClick={onLogin}
                className="block w-full text-left text-gray-600 hover:text-indigo-600 py-2 font-medium"
              >
                Log In
              </button>
              <button 
                onClick={onGetStarted}
                className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                #1 Medicine Reminder App
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Never Miss a
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Dose </span>
                Again
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                The smart way to manage your medications. Get reminders, track adherence, 
                and connect with caregivers—all in one beautiful app.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button 
                  onClick={onLogin}
                  className="px-8 py-4 bg-white text-gray-800 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-500 transition-all"
                >
                  Log In
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 border-2 border-white flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👤</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Trusted by 10,000+ users</p>
                </div>
              </div>
            </div>

            {/* Right Content - Animated Mockup */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-6">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-800">Today's Schedule</h3>
                      <p className="text-sm text-gray-500">Thursday, Nov 28</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                      <Bell className="text-white" size={20} />
                    </div>
                  </div>

                  {/* Mock Medicine Cards */}
                  {[
                    { name: "Aspirin", time: "08:00 AM", status: "taken", color: "green" },
                    { name: "Vitamin D", time: "12:00 PM", status: "taken", color: "green" },
                    { name: "Blood Pressure Med", time: "08:00 PM", status: "pending", color: "indigo" }
                  ].map((med, i) => (
                    <div 
                      key={i} 
                      className={`p-4 rounded-xl border-2 ${
                        med.status === 'taken' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-indigo-200 bg-indigo-50'
                      } animate-pulse`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Pill size={16} className={med.status === 'taken' ? 'text-green-600' : 'text-indigo-600'} />
                            <span className="font-semibold text-gray-800">{med.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-600">{med.time}</span>
                          </div>
                        </div>
                        {med.status === 'taken' && (
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="text-green-600" size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Mock Progress */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Today's Progress</span>
                      <span className="text-sm font-bold text-indigo-600">67%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Healthy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make medication management simple and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-block p-3 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Simple as 1-2-3
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes, stay healthy for life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up & Add Medicines",
                description: "Create your free account and add your medications with dosage and schedule.",
                icon: <Pill size={32} />
              },
              {
                step: "2",
                title: "Set Reminders",
                description: "Customize notification times and get alerts when it's time to take your medicine.",
                icon: <Bell size={32} />
              },
              {
                step: "3",
                title: "Track & Improve",
                description: "Mark doses as taken, view your adherence, and connect caregivers for support.",
                icon: <TrendingUp size={32} />
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full text-white text-2xl font-bold mb-6 mx-auto">
                    {item.step}
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-3 bg-indigo-50 rounded-xl mb-4 text-indigo-600">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-indigo-300" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="text-white mx-auto mb-6" size={64} />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of people who never miss a dose. Start your journey today—completely free.
          </p>
          <button 
            onClick={onGetStarted}
            className="group px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                  <Pill className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold">MediRemind</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted companion for medication management and health tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={onLogin} className="hover:text-white transition-colors">Log In</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Sign Up</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MediRemind. All rights reserved. Made with ❤️ for better health.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;