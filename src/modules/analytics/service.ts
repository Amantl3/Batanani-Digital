import { supabase } from '../../config/supabase';

export const getDashboardSummary = async () => {
  // We use { count: 'exact', head: true } to get the number of rows 
  // without downloading all the actual data (much faster).
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
    // Add mock deltas for the UI "trends"
    licenceDelta: 12,
    complaintDelta: -3,
    userDelta: 8
  };
};

export const getMarketShareData = async () => {
  // This groups your licences by type for the Pie Chart
  const { data, error } = await supabase.from('Licence').select('type');
  if (error) return [];

  const groups = data.reduce((acc: any, curr: any) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(groups).map(key => ({
    name: key,
    value: groups[key]
  }));
};