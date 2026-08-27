// src/pages/ServiceProvider/AIAssistant.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Star,
  FileText,
  TrendingUp,
  Zap,
  ChevronLeft,
  Compass,
  Rocket,
  Lightbulb,
  Calendar,
  CheckCircle,
  CreditCard,
  User,
} from 'lucide-react';
import Sidebar from '../../layout/Sidebar';
import Navbar from '../../components/Navbar';
import ReviewAnalysis from '../../components/ai/ReviewAnalysis';
import PriceSuggestion from '../../components/ai/PriceSuggestion';
import DescriptionGenerator from '../../components/ai/DescriptionGenerator';
import bookingService from '../../api/bookingService';
import ratingService from '../../api/ratingService';
import apiClient from '../../api/apiClient';
import subscriptionService from '../../services/subscriptionService';

// ── Helper Functions ──

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Skeleton Components ──

function FeatureCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-full rounded bg-gray-200" />
          <div className="mt-1 h-4 w-2/3 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ── Components ──

function FeatureCard({ icon: Icon, title, description, color, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 w-full"
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`inline-flex rounded-xl ${color} p-3 mb-4`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {badge && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium" style={{ color: '#056db3' }}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-4 flex items-center text-sm font-medium" style={{ color: '#056db3' }}>
          <span>Get started</span>
          <ArrowLeft className="ml-1 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function OnboardingCard({ step, title, description, icon: Icon, isCompleted, onStart }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl border ${
      isCompleted 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 bg-white'
    } transition-all hover:shadow-md`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        isCompleted 
          ? 'bg-green-100 text-green-600' 
          : 'bg-blue-50 text-[#056db3]'
      }`}>
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <span className="text-sm font-bold">{step}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {!isCompleted && (
        <button 
          onClick={onStart}
          className="shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#045a94]"
          style={{ backgroundColor: '#056db3' }}
        >
          Start
        </button>
      )}
      {isCompleted && (
        <span className="shrink-0 text-xs font-medium text-green-600">
          Done
        </span>
      )}
    </div>
  );
}

// ── Main Component ──

const AIAssistant = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] = useState(null);
  const [providerBookings, setProviderBookings] = useState([]);
  const [providerRatings, setProviderRatings] = useState({ totalRatings: 0, averageScore: 0 });
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [onboardingSteps, setOnboardingSteps] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();

    let id = null;

    if (storedUser) {
      id = storedUser.provider_id ||
           storedUser.service_provider_id ||
           storedUser.id ||
           localStorage.getItem('providerId');
    }

    if (!id) {
      id = localStorage.getItem('providerId') ||
           localStorage.getItem('serviceProviderId') ||
           localStorage.getItem('userId');
    }

    if (id) {
      setProviderId(Number(id));
      fetchProviderData(Number(id));
    } else {
      setLoading(false);
      setError('No provider ID found. Please ensure you are logged in as a service provider.');
    }
  }, []);

  const fetchProviderData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Fetch provider profile data using /providers endpoint
      try {
        const response = await apiClient.get(`/providers/${id}`);
        setProviderData(response.data);
      } catch (err) {
        console.warn('Provider fetch failed:', err);
        // Fallback: use user data
        try {
          const userResponse = await apiClient.get('/users/me');
          if (userResponse.data) {
            const userData = userResponse.data;
            setProviderData({
              id: id,
              user_id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone_number: userData.phone_number,
              city: userData.city || userData.location,
              service_category: 'General Services',
              hourly_rate: 0,
              bio: '',
              total_jobs_completed: 0,
            });
          }
        } catch (userErr) {
          console.error('Failed to fetch user data:', userErr);
          setError('Could not load your profile data. Please try again.');
        }
      }

      // ✅ Fetch bookings using existing bookingService
      try {
        const bookings = await bookingService.listProviderBookings(id);
        setProviderBookings(bookings || []);
      } catch (e) {
        console.warn('Failed to fetch bookings:', e);
        setProviderBookings([]);
      }

      // ✅ Fetch ratings using existing ratingService
      try {
        const ratings = await ratingService.getProviderAverageRating(id);
        setProviderRatings(ratings || { totalRatings: 0, averageScore: 0 });
      } catch (e) {
        console.warn('Failed to fetch ratings:', e);
        setProviderRatings({ totalRatings: 0, averageScore: 0 });
      }

      // ✅ Fetch subscription data using subscriptionService
      try {
        const subResponse = await subscriptionService.getCurrent();
        setSubscriptionData(subResponse.data || {
          provider_id: id,
          plan: 'free',
          is_active: true,
          commission_rate: 10.0,
          has_subscription: false
        });
      } catch (e) {
        console.warn('Failed to fetch subscription:', e);
        setSubscriptionData({
          provider_id: id,
          plan: 'free',
          is_active: true,
          commission_rate: 10.0,
          has_subscription: false
        });
      }

      // ✅ Fetch availability using /providers/{id}/availability endpoint
      try {
        const availResponse = await apiClient.get(`/providers/${id}/availability`);
        setAvailabilityData(availResponse.data || []);
      } catch (e) {
        console.warn('Failed to fetch availability:', e);
        setAvailabilityData([]);
      }

    } catch (error) {
      console.error('Error fetching provider data:', error);
      setError('Failed to load your profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Calculate onboarding progress dynamically ──
  useEffect(() => {
    if (!providerData) return;

    const completedBookings = providerBookings.filter(
      b => b.status === 'Completed' || b.status === 'Paid'
    );

    const hasReviews = providerRatings && providerRatings.totalRatings > 0;
    const hasSubscription = subscriptionData && subscriptionData.is_active && subscriptionData.has_subscription;
    const hasAvailability = availabilityData && availabilityData.length > 0;
    const hasProfile = Boolean(
      providerData?.bio || 
      providerData?.service_category || 
      providerData?.hourly_rate
    );

    const steps = [
      {
        step: 1,
        title: 'Complete Your Profile',
        description: 'Add your bio, skills, and service details to attract more clients.',
        icon: User,
        isCompleted: hasProfile,
        action: '/provider/profile',
      },
      {
        step: 2,
        title: 'Set Your Availability',
        description: 'Define your working hours so clients can book you easily.',
        icon: Calendar,
        isCompleted: hasAvailability,
        action: '/provider/availability',
      },
      {
        step: 3,
        title: 'Optimize Your Pricing',
        description: 'Use AI to find the perfect price point for your services.',
        icon: TrendingUp,
        isCompleted: providerData?.hourly_rate > 0,
        action: '/provider/ai-assistant',
      },
      {
        step: 4,
        title: 'Subscribe to Premium',
        description: 'Get lower commission rates and priority access to jobs.',
        icon: CreditCard,
        isCompleted: hasSubscription,
        action: '/provider/subscription',
      },
      {
        step: 5,
        title: 'Get Your First Review',
        description: 'Complete a job and ask your client for feedback.',
        icon: Star,
        isCompleted: hasReviews || completedBookings.length > 0,
        action: '/provider/my-jobs',
      },
    ];

    setOnboardingSteps(steps);
  }, [providerData, providerBookings, providerRatings, subscriptionData, availabilityData]);

  const tools = [
    {
      id: 'description',
      icon: FileText,
      title: 'Smart Profile Generator',
      description: 'Turn your bio into a professional, client-attracting service description with AI.',
      color: 'bg-[#056db3]',
      component: DescriptionGenerator,
      category: 'profile',
    },
    {
      id: 'pricing',
      icon: TrendingUp,
      title: 'Market Price Optimizer',
      description: 'Get AI-powered pricing recommendations based on real market data and trends.',
      color: 'bg-emerald-500',
      component: PriceSuggestion,
      category: 'pricing',
    },
    {
      id: 'reviews',
      icon: Star,
      title: 'Review Intelligence',
      description: 'Analyze client feedback and get actionable insights to improve your service quality.',
      color: 'bg-amber-500',
      component: ReviewAnalysis,
      category: 'growth',
    },
  ];

  // Find the selected tool data
  const activeTool = tools.find(tool => tool.id === selectedTool);
  const ActiveComponent = activeTool?.component;

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="provider" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="px-8 pb-8 pt-28">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-200 animate-pulse" />
                  <div>
                    <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-1 h-4 w-96 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
              </div>
              <div>
                <div className="h-6 w-48 rounded bg-gray-200 animate-pulse mb-4" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <FeatureCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="provider" />
        <div className="flex-1 ml-72">
          <Navbar />
          <div className="flex items-center justify-center h-96 px-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md border border-gray-100">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-4xl">
                ⚠️
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">Something went wrong</h2>
              <p className="mt-2 text-gray-500">{error}</p>
              <button
                onClick={() => {
                  if (providerId) {
                    fetchProviderData(providerId);
                  } else {
                    window.location.reload();
                  }
                }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-colors hover:bg-[#045a94]"
                style={{ backgroundColor: '#056db3' }}
              >
                <Sparkles className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!providerId) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="provider" />
        <div className="flex-1 ml-72">
          <Navbar />
          <div className="flex items-center justify-center h-96 px-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md border border-gray-100">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-4xl">
                🔍
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">Provider Profile Not Found</h2>
              <p className="mt-2 text-gray-500">
                We couldn't find your provider profile. Please make sure you're logged in as a provider.
              </p>
              <Link
                to="/provider"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-colors hover:bg-[#045a94]"
                style={{ backgroundColor: '#056db3' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = onboardingSteps.filter(s => s.isCompleted).length;

  // ── Tool Selection View ──
  if (!selectedTool) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="provider" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="px-8 pb-8 pt-28">
            <div className="max-w-6xl mx-auto">
              {/* ── Header ── */}
              <div className="mb-8">
                <Link
                  to="/provider"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#056db3] text-white shadow-lg shadow-[#056db3]/25">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">Your AI Co-pilot</h1>
                      <p className="text-gray-500">
                        Your personal guide to success on Sasafix — from getting started to growing your business.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm border border-blue-100" style={{ color: '#056db3' }}>
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Co-pilot Active</span>
                  </div>
                </div>
              </div>

              {/* ── Onboarding Journey ── */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="h-5 w-5" style={{ color: '#056db3' }} />
                  <h2 className="text-lg font-semibold text-gray-800">Your Onboarding Journey</h2>
                  <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {completedCount}/{onboardingSteps.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {onboardingSteps.map((step) => (
                    <OnboardingCard
                      key={step.step}
                      {...step}
                      onStart={() => {
                        if (step.step === 3) {
                          setSelectedTool('pricing');
                        } else if (step.step === 4) {
                          window.location.href = '/provider/subscription';
                        } else {
                          window.location.href = step.action;
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── Tool Cards ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5" style={{ color: '#056db3' }} />
                  <h2 className="text-lg font-semibold text-gray-800">AI Tools</h2>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {tools.map((tool) => (
                    <FeatureCard
                      key={tool.id}
                      icon={tool.icon}
                      title={tool.title}
                      description={tool.description}
                      color={tool.color}
                      onClick={() => setSelectedTool(tool.id)}
                    />
                  ))}
                </div>
              </div>

              {/* ── Quick Tips ── */}
              <div className="mt-8 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#056db3] text-white">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">💡 Pro Tip</h4>
                    <p className="text-sm text-gray-600">
                      Complete your profile first, then optimize your pricing. Providers with complete profiles get <strong>3x more bookings</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Tool Detail View ──
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="px-8 pb-8 pt-28">
          <div className="max-w-4xl mx-auto">
            {/* ── Back Button ── */}
            <div className="mb-6">
              <button
                onClick={() => setSelectedTool(null)}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#056db3] transition-colors group"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Co-pilot
              </button>

              <div className="mt-4 flex items-center gap-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${activeTool.color} text-white`}>
                  <activeTool.icon className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{activeTool.title}</h1>
                  <p className="text-sm text-gray-500">{activeTool.description}</p>
                </div>
              </div>
            </div>

            {/* ── Component ── */}
            <div className="mt-4">
              {ActiveComponent && (
                <ActiveComponent
                  providerId={providerId}
                  serviceCategory={providerData?.service_category || "General Services"}
                  location={providerData?.city || "Nairobi"}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAssistant;