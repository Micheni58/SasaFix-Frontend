// src/components/ai/PriceSuggestion.jsx

import React, { useState, useEffect } from 'react';
import aiService from '../../api/aiService';
import apiClient from '../../api/apiClient';
import { TrendingUp, RefreshCw, CheckCircle, AlertCircle, DollarSign, Loader2, Edit2 } from 'lucide-react';

const PriceSuggestion = ({ providerId, serviceCategory, location, currentRate, onPriceUpdate }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [providerData, setProviderData] = useState(null);
  const [hourlyRate, setHourlyRate] = useState(null);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [editRateValue, setEditRateValue] = useState('');
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Fetch provider data on mount
  useEffect(() => {
    const fetchProviderRate = async () => {
      if (!providerId) return;
      
      setIsFetching(true);
      try {
        // ✅ Use /providers (matches backend pattern)
        const response = await apiClient.get(`/providers/${providerId}`);
        const data = response.data;
        setProviderData(data);
        
        // Set the hourly rate if it exists
        if (data.hourly_rate) {
          setHourlyRate(data.hourly_rate);
          setEditRateValue(data.hourly_rate.toString());
        } else {
          setHourlyRate(null);
          setEditRateValue('');
        }
      } catch (err) {
        console.warn('Failed to fetch provider rate:', err);
        setError('Could not load your current rate. You can still check market rates.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProviderRate();
  }, [providerId]);

  const handleGetSuggestion = async () => {
    // Check if provider has a rate set
    if (!hourlyRate || hourlyRate === 0) {
      setError('Please set your hourly rate first before checking market rates.');
      setIsEditingRate(true);
      return;
    }

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
      setError(err.detail || 'Failed to get price suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRate = async () => {
    const newRate = parseFloat(editRateValue);
    if (isNaN(newRate) || newRate <= 0) {
      setError('Please enter a valid rate (must be greater than 0).');
      return;
    }

    setIsSavingRate(true);
    setError(null);

    try {
      // ✅ Use /providers (matches backend pattern)
      const response = await apiClient.patch(`/providers/${providerId}`, {
        hourly_rate: newRate
      });
      
      if (response.data) {
        setHourlyRate(newRate);
        setIsEditingRate(false);
        setError(null);
        
        if (onPriceUpdate) {
          onPriceUpdate(newRate);
        }
      }
    } catch (err) {
      console.error('Failed to update rate:', err);
      setError('Failed to save your rate. Please try again.');
    } finally {
      setIsSavingRate(false);
    }
  };

  const handleEditRate = () => {
    setIsEditingRate(true);
    setEditRateValue(hourlyRate ? hourlyRate.toString() : '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditingRate(false);
    setEditRateValue(hourlyRate ? hourlyRate.toString() : '');
    setError(null);
  };

  const handleAcceptSuggestion = (rate) => {
    if (onPriceUpdate) {
      onPriceUpdate(rate);
    }
    setHourlyRate(rate);
    setEditRateValue(rate.toString());
  };

  // Show loading state while fetching
  if (isFetching) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5" style={{ color: '#056db3' }} />
          <h3 className="text-xl font-bold text-gray-800">💰 Price Optimization</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#056db3' }} />
          <span className="ml-3 text-gray-500">Loading your rate...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: '#056db3' }} />
          <h3 className="text-xl font-bold text-gray-800">💰 Price Optimization</h3>
        </div>
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading || !hourlyRate || hourlyRate === 0}
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

      {/* Current Rate Display */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Your Current Rate:</span>
            {isEditingRate ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">KES</span>
                <input
                  type="number"
                  value={editRateValue}
                  onChange={(e) => setEditRateValue(e.target.value)}
                  className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#056db3] focus:border-transparent"
                  placeholder="Enter rate"
                  min="0"
                  step="100"
                  disabled={isSavingRate}
                />
                <button
                  onClick={handleUpdateRate}
                  disabled={isSavingRate}
                  className="px-3 py-1 bg-[#056db3] text-white text-sm rounded-lg hover:bg-[#045a94] transition-colors disabled:opacity-50"
                >
                  {isSavingRate ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSavingRate}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xl font-bold text-gray-800">
                  {hourlyRate && hourlyRate > 0 
                    ? `KES ${hourlyRate.toLocaleString()}/hour`
                    : 'Not set yet'
                  }
                </p>
                <button
                  onClick={handleEditRate}
                  className="text-[#056db3] hover:text-[#045a94] transition-colors"
                  title="Edit rate"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {(!hourlyRate || hourlyRate === 0) && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">No rate set</span>
            </div>
          )}
        </div>
        {(!hourlyRate || hourlyRate === 0) && (
          <p className="text-xs text-amber-600 mt-2">
            Please set your hourly rate to get market comparisons.
          </p>
        )}
      </div>

      {error && (
        <div className={`${error.includes('Please set your hourly rate') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'} p-3 rounded-lg border`}>
          {error.includes('Please set your hourly rate') ? '⚠️' : '❌'} {error}
        </div>
      )}

      {!hasLoaded && !isLoading && !error && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
            📊
          </div>
          <p className="mt-3 text-gray-500">
            {hourlyRate && hourlyRate > 0 
              ? 'Click "Check Market Rate" to get AI-powered pricing recommendations.'
              : 'Set your rate above first to get market comparisons.'
            }
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
                {suggestion.market_avg 
                  ? `KES ${suggestion.market_avg.toLocaleString()}`
                  : 'No data yet'
                }
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-sm text-gray-500">Market Range:</span>
              <p className="text-gray-700">
                {suggestion.market_low && suggestion.market_high
                  ? `KES ${suggestion.market_low.toLocaleString()} - KES ${suggestion.market_high.toLocaleString()}`
                  : 'Not enough market data available yet. Complete more jobs to generate data.'
                }
              </p>
            </div>
          </div>

          {suggestion.market_avg ? (
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
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              Limited market data available. Your rate will be set as a baseline.
            </div>
          )}

          {suggestion.suggestion && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">💡 AI Suggestion:</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{suggestion.suggestion}</p>
            </div>
          )}

          {suggestion.market_avg && onPriceUpdate && (
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => handleAcceptSuggestion(suggestion.proposed_price)}
              >
                Keep Current Rate
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-[#056db3] hover:bg-[#045a94] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                onClick={() => handleAcceptSuggestion(suggestion.market_avg)}
              >
                <DollarSign className="h-4 w-4" />
                Set Market Rate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceSuggestion;