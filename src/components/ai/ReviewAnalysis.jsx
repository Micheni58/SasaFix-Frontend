// src/components/ai/ReviewAnalysis.jsx

import React, { useState } from 'react';
import aiService from '../../api/aiService';
import { RefreshCw, TrendingUp } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';

const ReviewAnalysis = ({ providerId, providerName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadAnalysis = async () => {
    if (!providerId) {
      setError('Provider ID is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.getReviewAnalysis(providerId);
      setAnalysis(result);
      setHasLoaded(true);
    } catch (err) {
      setError(err.detail || 'Failed to load review analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <h3 className="text-xl font-bold text-gray-800">Review Insights</h3>
        </div>
        <button
          onClick={loadAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#045a94] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#056db3' }}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Generate Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {!hasLoaded && !isLoading && !error && (
        <div className="text-center py-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
            ⭐
          </div>
          <p className="mt-4 text-gray-500">
            Click "Generate Insights" to analyze your client reviews and get AI-powered feedback.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <RefreshCw className="h-8 w-8 animate-spin" style={{ color: '#056db3' }} />
          </div>
          <p className="mt-4 text-gray-500">Analyzing your reviews...</p>
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
              📝 <strong>{analysis.total_reviews}</strong> Reviews
            </span>
            {analysis.average_rating && analysis.average_rating > 0 && (
              <span className="bg-yellow-100 px-3 py-1 rounded-full flex items-center gap-1">
                ⭐ {analysis.average_rating.toFixed(1)} / 5.0
              </span>
            )}
            {analysis.total_jobs_completed !== undefined && analysis.total_jobs_completed > 0 && (
              <span className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                🏆 {analysis.total_jobs_completed} Jobs
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>💡</span> AI Feedback:
            </h4>
            <MarkdownRenderer content={analysis.analysis} />
          </div>

          {analysis.total_reviews === 0 && (
            <div className="p-4 bg-blue-50 rounded-lg text-blue-700 text-center border border-blue-200">
              🌟 No reviews yet. Keep delivering great service and reviews will follow!
            </div>
          )}

          {/* Personalized encouragement based on review count */}
          {analysis.total_reviews > 0 && analysis.total_reviews < 3 && (
            <div className="p-4 bg-amber-50 rounded-lg text-amber-700 text-sm border border-amber-200">
              💡 <strong>Tip:</strong> You have {analysis.total_reviews} review{analysis.total_reviews > 1 ? 's' : ''}. 
              Ask your clients to leave reviews after each completed job to build more social proof!
            </div>
          )}

          {analysis.total_reviews >= 3 && analysis.total_reviews < 10 && (
            <div className="p-4 bg-green-50 rounded-lg text-green-700 text-sm border border-green-200">
              ✅ <strong>Great start!</strong> You have {analysis.total_reviews} reviews. 
              Keep up the good work and maintain your high standards!
            </div>
          )}

          {analysis.total_reviews >= 10 && (
            <div className="p-4 bg-purple-50 rounded-lg text-purple-700 text-sm border border-purple-200">
              🎉 <strong>Excellent!</strong> You have {analysis.total_reviews} reviews. 
              You're building a strong reputation on Sasafix!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewAnalysis;