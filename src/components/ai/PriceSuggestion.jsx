// src/components/ai/PriceSuggestion.jsx

import React, { useState } from 'react';
import aiService from '../../api/aiService';
import { TrendingUp, RefreshCw, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const PriceSuggestion = ({ providerId, serviceCategory, location, currentRate, onPriceUpdate }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.getPriceSuggestion(
        providerId,
        serviceCategory,
        location
      );
      setSuggestion(result);
      setHasLoaded(true);
    } catch (err) {
      setError(err.detail || 'Failed to get price suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: '#056db3' }} />
          <h3 className="text-xl font-bold text-gray-800">💰 Price Optimization</h3>
        </div>
        <button
          onClick={handleGetSuggestion}
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
              <DollarSign className="h-4 w-4" />
              Check Market Rate
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Compare your pricing against real market data to ensure you're competitive.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {!hasLoaded && !isLoading && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
            📊
          </div>
          <p className="mt-3 text-gray-500">
            Click "Check Market Rate" to get AI-powered pricing recommendations.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <RefreshCw className="h-7 w-7 animate-spin" style={{ color: '#056db3' }} />
          </div>
          <p className="mt-3 text-gray-500">Analyzing market data...</p>
        </div>
      )}

      {suggestion && !isLoading && (
        <div className={`mt-3 p-4 rounded-lg border ${
          suggestion.in_range
            ? 'bg-green-50 border-green-300'
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Your Rate:</span>
              <p className="text-lg font-bold text-gray-800">
                KES {suggestion.proposed_price?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Market Average:</span>
              <p className="text-lg font-bold text-gray-800">
                KES {suggestion.market_avg?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-500">Market Range:</span>
              <p className="text-gray-700">
                {suggestion.market_low && suggestion.market_high
                  ? `KES ${suggestion.market_low.toLocaleString()} - KES ${suggestion.market_high.toLocaleString()}`
                  : 'Not enough data'
                }
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            suggestion.in_range
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {suggestion.in_range ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Your price is within market range
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                Your price is outside market range
              </>
            )}
          </div>

          {suggestion.suggestion && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">💡 AI Suggestion:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{suggestion.suggestion}</p>
            </div>
          )}

          {onPriceUpdate && (
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => onPriceUpdate(suggestion.proposed_price)}
              >
                Keep Current Rate
              </button>
              {suggestion.market_avg && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-[#056db3] hover:bg-[#045a94] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => onPriceUpdate(suggestion.market_avg)}
                >
                  <DollarSign className="h-4 w-4" />
                  Adjust to Market Rate
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceSuggestion;