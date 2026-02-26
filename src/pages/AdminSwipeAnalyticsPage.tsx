import React from 'react';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, TrendingDown, Heart, X, Eye, Users, Image as ImageIcon, BarChart3, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface SwipeStats {
  photo_id: string | number;
  photo_url: string;
  gender: string;
  mood_tags: string[];
  total_swipes: number;
  likes: number;
  dislikes: number;
  like_rate: number;
  unique_users: number;
}

interface GlobalStats {
  total_swipes: number;
  total_users: number;
  avg_swipes_per_user: number;
  avg_like_rate: number;
  male_photos_count: number;
  female_photos_count: number;
}

export default function AdminSwipeAnalyticsPage() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const { data: globalStats, isLoading: globalLoading } = useQuery({
    queryKey: ['admin-swipe-global-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_swipe_global_stats');
      if (error) throw error;
      return data as GlobalStats;
    },
    enabled: isAdmin,
  });

  const { data: photoStats, isLoading: photoLoading } = useQuery({
    queryKey: ['admin-swipe-photo-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_swipe_photo_stats');
      if (error) throw error;
      return data as SwipeStats[];
    },
    enabled: isAdmin,
  });

  if (adminLoading || globalLoading || photoLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--ff-color-primary-600)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Geen toegang</h1>
          <p className="text-gray-600">Je hebt geen admin rechten</p>
        </div>
      </div>
    );
  }

  const sortedPhotos = photoStats?.sort((a, b) => b.like_rate - a.like_rate) || [];
  const topPhotos = sortedPhotos.slice(0, 10);
  const worstPhotos = sortedPhotos.slice(-10).reverse();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-12">
      <Helmet>
        <title>Swipe Analytics — Admin — FitFi</title>
      </Helmet>

      <div className="ff-container max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <BarChart3 className="inline-block w-10 h-10 mr-3 text-[var(--ff-color-primary-600)]" />
            Swipe Analytics
          </h1>
          <p className="text-xl text-gray-600">
            Inzicht in mood photo performance en gebruikersgedrag
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-gray-500">Total Swipes</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">
                {globalStats.total_swipes?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-gray-500">Unique Users</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">
                {globalStats.total_users?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <span className="text-sm font-medium text-gray-500">Avg Swipes/User</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">
                {globalStats.avg_swipes_per_user?.toFixed(1) || 0}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Percent className="w-8 h-8 text-pink-600" />
                <span className="text-sm font-medium text-gray-500">Avg Like Rate</span>
              </div>
              <div className="text-3xl font-bold text-[var(--color-text)]">
                {globalStats.avg_like_rate?.toFixed(0) || 0}%
              </div>
            </div>
          </div>
        )}

        {/* Gender Distribution */}
        {globalStats && (
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8 shadow-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              Photo Distribution
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {globalStats.male_photos_count || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">Male Photos</div>
              </div>
              <div className="text-center p-6 bg-pink-50 rounded-xl">
                <div className="text-4xl font-bold text-pink-600 mb-2">
                  {globalStats.female_photos_count || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">Female Photos</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performing Photos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Top 10 Best Performing Photos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topPhotos.map((photo, idx) => (
              <div
                key={photo.photo_id}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={photo.photo_url}
                        alt={`Photo ${photo.photo_id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-[var(--ff-color-primary-600)]">
                        #{idx + 1}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {photo.gender}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Like Rate</span>
                        <span className="text-lg font-bold text-green-600">
                          {photo.like_rate?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Swipes</span>
                        <span className="text-sm font-semibold">{photo.total_swipes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Unique Users</span>
                        <span className="text-sm font-semibold">{photo.unique_users}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-sm">
                          <Heart className="w-4 h-4 text-green-600" />
                          {photo.likes}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <X className="w-4 h-4 text-red-600" />
                          {photo.dislikes}
                        </span>
                      </div>
                      {photo.mood_tags && photo.mood_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.mood_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performing Photos */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-red-600" />
            Bottom 10 Photos (Need Improvement)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {worstPhotos.map((photo, idx) => (
              <div
                key={photo.photo_id}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={photo.photo_url}
                        alt={`Photo ${photo.photo_id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-red-600">
                        #{sortedPhotos.length - idx}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {photo.gender}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Like Rate</span>
                        <span className="text-lg font-bold text-red-600">
                          {photo.like_rate?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Swipes</span>
                        <span className="text-sm font-semibold">{photo.total_swipes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Unique Users</span>
                        <span className="text-sm font-semibold">{photo.unique_users}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-sm">
                          <Heart className="w-4 h-4 text-green-600" />
                          {photo.likes}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <X className="w-4 h-4 text-red-600" />
                          {photo.dislikes}
                        </span>
                      </div>
                      {photo.mood_tags && photo.mood_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.mood_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-12 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl p-8 border border-[var(--ff-color-primary-200)]">
          <h3 className="text-xl font-bold mb-4">💡 Recommendations</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[var(--ff-color-primary-600)] font-bold">•</span>
              <span>Consider replacing photos with {'<'}30% like rate</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ff-color-primary-600)] font-bold">•</span>
              <span>Top performing photos show clear style direction - add similar content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ff-color-primary-600)] font-bold">•</span>
              <span>Monitor unique users count to ensure diverse feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--ff-color-primary-600)] font-bold">•</span>
              <span>Aim for 50%+ like rate across all photos for optimal recommendation quality</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
