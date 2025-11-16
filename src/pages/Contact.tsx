import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import GradientText from '../components/ui/GradientText';
import AnimatedBackground from '../components/AnimatedBackground';
import { Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/auth';
import { api } from '../lib/api';
import { supabase } from '../lib/db';

export default function Contact() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          name: `${currentUser.first_name} ${currentUser.last_name}`,
          email: currentUser.email || ''
        }));
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create ticket directly in Supabase instead of using backend API
      const ticketData = {
        user_id: user ? user.id : null,
        user_email: formData.email,
        user_name: formData.name,
        subject: `${formData.subject.charAt(0).toUpperCase() + formData.subject.slice(1)} - ${formData.name}`,
        description: formData.message,
        category: formData.subject,
        priority: 'normal',
        status: 'open'
      };

      const { data, error } = await supabase
        .from('support_tickets')
        .insert(ticketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        setError('Failed to send message. Please try again.');
      } else {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Error submitting contact form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10">
        <section className="pt-40 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get in <GradientText>Touch</GradientText>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Have questions? Our team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
          </div>
        </section>

        <section className="pb-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-neon-green/10 border border-neon-green/50 rounded-lg text-neon-green">
                    Message sent successfully! We'll respond within 24 hours.
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="rules">Rules Clarification</option>
                      <option value="payout">Payout Issue</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{loading ? 'Sending...' : 'Send Message'}</span>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-electric-blue rounded-full flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Email Support</h3>
                <p className="text-gray-400 mb-2">
                  For urgent queries:
                </p>
                <a
                  href="mailto:urgent.fund8r@gmail.com"
                  className="text-electric-blue hover:text-electric-blue/80 font-semibold"
                >
                  urgent.fund8r@gmail.com
                </a>
                <p className="text-gray-400 mt-4 mb-2">
                  For partnership inquiries:
                </p>
                <a
                  href="mailto:partners.fund8r@gmail.com"
                  className="text-electric-blue hover:text-electric-blue/80 font-semibold"
                >
                  partners.fund8r@gmail.com
                </a>
              </div>

              <div className="glass-card p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyber-purple to-neon-green rounded-full flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Support Hours</h3>
                <div className="space-y-2 text-gray-400">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="text-white">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday:</span>
                    <span className="text-white">Limited</span>
                  </div>
                  <p className="text-sm mt-4">
                    All times are in EST/EDT
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 bg-gradient-to-br from-electric-blue/10 to-cyber-purple/10 border-electric-blue/30">
                <h3 className="text-xl font-bold mb-3">Before You Contact</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Check out our FAQ page for quick answers to common questions.
                </p>
                <a
                  href="/faq"
                  className="text-electric-blue hover:text-electric-blue/80 font-semibold inline-flex items-center space-x-1"
                >
                  <span>Visit FAQ</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
