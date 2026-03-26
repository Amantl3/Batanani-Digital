// src/modules/analytics/service.ts
import { supabase } from '../../config/supabase';

// ------------------------------
// DASHBOARD SUMMARY (existing)
export const getDashboardSummary = async () => {
  const [licences, complaints, apps, users] = await Promise.all([
    supabase.from('Licence').select('*', { count: 'exact', head: true }),
    supabase.from('Complaint').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('Licence').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalLicences: licences.count || 0,
    activeComplaints: complaints.count || 0,
    pendingApps: apps.count || 0,
    portalUsers: users.count || 0,
    licenceDelta: 12,
    complaintDelta: -3,
    userDelta: 8
  };
};

// ------------------------------
// MARKET SHARE (existing)
export const getMarketShareData = async () => {
  const { data, error } = await supabase.from('Licence').select('type');
  if (error || !data) return [];

  const groups = data.reduce((acc: any, curr: any) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(groups).map(key => ({
    name: key,
    value: groups[key]
  }));
};

// ------------------------------
// COMPLAINTS ANALYTICS
export const getComplaintsAnalytics = async () => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // --- Fetch all complaints ---
  const { data: allComplaints, error } = await supabase
    .from('Complaint')
    .select('region, createdAt');

  if (error) throw new Error(error.message);

  const totalComplaints = allComplaints.length;

  // --- Monthly counts ---
  const thisMonth = allComplaints.filter(c =>
    new Date(c.createdAt) >= startOfThisMonth
  );

  const lastMonth = allComplaints.filter(c => {
    const date = new Date(c.createdAt);
    return date >= startOfLastMonth && date < startOfThisMonth;
  });

  const monthlyChange =
    lastMonth.length === 0
      ? 0
      : ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100;

  // --- Group by region ---
  const regionMap: Record<string, number> = {};
  const lastMonthMap: Record<string, number> = {};

  allComplaints.forEach(c => {
    regionMap[c.region] = (regionMap[c.region] || 0) + 1;
  });

  lastMonth.forEach(c => {
    lastMonthMap[c.region] = (lastMonthMap[c.region] || 0) + 1;
  });

  // --- Activity level helper ---
  const getActivityLevel = (count: number) => {
    if (count >= 200) return 'HIGH';
    if (count >= 100) return 'MEDIUM';
    if (count >= 50) return 'LOW';
    return 'MINIMAL';
  };

  // --- Regions breakdown ---
  const regions = Object.keys(regionMap).map(region => {
    const count = regionMap[region];
    const prev = lastMonthMap[region] || 0;
    const change = prev === 0 ? 0 : ((count - prev) / prev) * 100;

    return {
      name: region,
      complaints: count,
      change: Math.round(change),
      activityLevel: getActivityLevel(count)
    };
  });

  // --- Average per region ---
  const averagePerRegion =
    regions.length === 0
      ? 0
      : Math.round(totalComplaints / regions.length);

  // --- Top region ---
  const topRegion =
    regions.length === 0
      ? null
      : regions.reduce((max, r) =>
          r.complaints > max.complaints ? r : max
        );

  // --- Coordinates for heatmap ---
  const coords: Record<string, { lat: number; lng: number }> = {
    Gaborone: { lat: -24.6282, lng: 25.9231 },
    Francistown: { lat: -21.17, lng: 27.507 },
    Maun: { lat: -19.9833, lng: 23.4167 },
    Serowe: { lat: -22.3833, lng: 26.7167 },
    Kanye: { lat: -24.9833, lng: 25.35 },
    Mochudi: { lat: -24.4167, lng: 26.15 },
  };

  const heatmap = Object.keys(regionMap).map(region => ({
    region,
    count: regionMap[region],
    lat: coords[region]?.lat || 0,
    lng: coords[region]?.lng || 0
  }));

  return {
    totalComplaints,
    monthlyChange: Math.round(monthlyChange),
    averagePerRegion,
    topRegion,
    regions,
    heatmap,
    lastUpdated: new Date()
  };
};