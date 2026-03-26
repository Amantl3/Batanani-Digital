import { supabase } from "../../config/supabase";

// ── 1. Main stats overview ────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [
    { count: totalComplaints },
    { count: activeComplaints }, // Count: open + pending + in_progress
    { count: resolvedComplaints },
    { count: totalLicences },
    { count: pendingLicences },
    { count: approvedLicences },
    { count: unreadNotifications },
    { data: recentComplaints },
    { data: recentLicences },
  ] = await Promise.all([
    supabase.from("Complaint").select("*", { count: "exact", head: true }),
    // Fix: Using .or with .ilike to catch all active states regardless of case
    supabase.from("Complaint")
      .select("*", { count: "exact", head: true })
      .or('status.ilike.open,status.ilike.pending,status.ilike.in_progress,status.ilike.new'),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).ilike("status", "resolved"),
    supabase.from("Licence").select("*", { count: "exact", head: true }),
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "pending"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "approved"),
    supabase.from("Notification").select("*", { count: "exact", head: true }).eq("read", false),
    supabase.from("Complaint").select("*").order("createdAt", { ascending: false }).limit(5),
    supabase.from("Licence").select("*").order("createdAt", { ascending: false }).limit(5),
  ]);

  return {
    complaints: {
      total: totalComplaints ?? 0,
      open: activeComplaints ?? 0,
      resolved: resolvedComplaints ?? 0,
    },
    licences: {
      total: totalLicences ?? 0,
      pending: pendingLicences ?? 0,
      approved: approvedLicences ?? 0,
    },
    notifications: {
      unread: unreadNotifications ?? 0,
    },
    recentComplaints: recentComplaints ?? [],
    recentLicences: recentLicences ?? [],
  };
};

// ── 2. Dashboard summary (metric cards) ──────────────────────────────
export const getDashboardSummary = async () => {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1).toISOString();
  const prevYearStart = new Date(currentYear - 1, 0, 1).toISOString();
  const prevYearEnd = new Date(currentYear - 1, 11, 31).toISOString();
  const quarterStart = new Date(
    currentYear,
    Math.floor(new Date().getMonth() / 3) * 3,
    1
  ).toISOString();

  const [
    { count: activeLicences },
    { count: newThisQuarter },
    { count: complaintsYTD },
    { count: prevYearComplaints },
    { count: totalComplaints },
    { count: resolvedComplaints },
    { count: unreadNotifications },
  ] = await Promise.all([
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "approved"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).gte("createdAt", quarterStart),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).gte("createdAt", yearStart),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).gte("createdAt", prevYearStart).lte("createdAt", prevYearEnd),
    supabase.from("Complaint").select("*", { count: "exact", head: true }),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).ilike("status", "resolved"),
    supabase.from("Notification").select("*", { count: "exact", head: true }).eq("read", false),
  ]);

  const ytdCount = complaintsYTD ?? 0;
  const prevCount = prevYearComplaints ?? 0;
  const totalCount = totalComplaints ?? 0;
  const resolvedCount = resolvedComplaints ?? 0;

  const complaintChangeVsLastYear =
    prevCount > 0
      ? (((ytdCount - prevCount) / prevCount) * 100).toFixed(1) + "%"
      : "N/A";

  const resolutionRate =
    totalCount > 0
      ? ((resolvedCount / totalCount) * 100).toFixed(1) + "%"
      : "0%";

  return {
    activeLicences: {
      value: activeLicences ?? 0,
      newThisQuarter: newThisQuarter ?? 0,
      trend: (newThisQuarter ?? 0) > 0 ? "up" : "stable",
    },
    complaintsYTD: {
      value: ytdCount,
      changeVsLastYear: complaintChangeVsLastYear,
      trend: ytdCount < prevCount ? "down" : "up",
    },
    resolutionRate: {
      value: resolutionRate,
      totalResolved: resolvedCount,
      totalComplaints: totalCount,
    },
    notifications: {
      unread: unreadNotifications ?? 0,
    },
  };
};

// ── 3. Complaints by category ─────────────────────────────────────────
export const getComplaintsByCategory = async () => {
  const { data, error } = await supabase.from("Complaint").select("category");
  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.category] = (grouped[item.category] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// ── 4. Complaints by provider ─────────────────────────────────────────
export const getComplaintsByProvider = async () => {
  const { data, error } = await supabase.from("Complaint").select("provider");
  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.provider] = (grouped[item.provider] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count);
};

// ── 5. Licences by sector (donut chart) ──────────────────────────────
export const getLicencesBySector = async () => {
  const { data, error } = await supabase.from("Licence").select("type");
  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.type] = (grouped[item.type] ?? 0) + 1;
  }

  const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

  return Object.entries(grouped)
    .map(([sector, count]) => ({
      sector,
      count,
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

// ── 6. Monthly licence applications (bar chart) ───────────────────────
export const getMonthlyTrends = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("createdAt")
    .order("createdAt", { ascending: true });

  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    const month = new Date(item.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    grouped[month] = (grouped[month] ?? 0) + 1;
  }

  return Object.entries(grouped).map(([month, count]) => ({ month, count }));
};

// ── 7. Complaint resolution rate (progress bars) ──────────────────────
export const getComplaintResolutionRate = async () => {
  const [
    { count: total },
    { count: resolved },
    { count: escalated },
    { count: resolvedRecent },
  ] = await Promise.all([
    supabase.from("Complaint").select("*", { count: "exact", head: true }),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).ilike("status", "resolved"),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).ilike("status", "escalated"),
    supabase
      .from("Complaint")
      .select("*", { count: "exact", head: true })
      .ilike("status", "resolved")
      .gte("createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const totalCount = total ?? 0;
  const resolvedCount = resolved ?? 0;
  const escalatedCount = escalated ?? 0;
  const resolvedRecentCount = resolvedRecent ?? 0;

  const resolvedWithin30Days =
    totalCount > 0
      ? Number(((resolvedRecentCount / totalCount) * 100).toFixed(1))
      : 0;

  const escalatedCasesClosed =
    escalatedCount > 0
      ? Number(((resolvedCount / escalatedCount) * 100).toFixed(1))
      : 0;

  const overallResolutionRate =
    totalCount > 0
      ? Number(((resolvedCount / totalCount) * 100).toFixed(1))
      : 0;

  return {
    resolvedWithin30Days: {
      value: resolvedWithin30Days,
      percentage: resolvedWithin30Days + "%",
    },
    escalatedCasesClosed: {
      value: escalatedCasesClosed,
      percentage: escalatedCasesClosed + "%",
    },
    overallResolutionRate: {
      value: overallResolutionRate,
      percentage: overallResolutionRate + "%",
    },
    totals: {
      total: totalCount,
      resolved: resolvedCount,
      escalated: escalatedCount,
    },
  };
};

// ── 8. Top providers with most complaints ─────────────────────────────
export const getTopProviders = async () => {
  const { data, error } = await supabase.from("Complaint").select("provider");
  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.provider] = (grouped[item.provider] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// ── 9. Daily complaints last 7 days ───────────────────────────────────
export const getDailyComplaintsLast7Days = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("Complaint")
    .select("createdAt")
    .gte("createdAt", sevenDaysAgo.toISOString());

  if (error) throw new Error(error.message);

  const days: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    days[key] = 0;
  }

  for (const item of data ?? []) {
    const key = new Date(item.createdAt).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (days[key] !== undefined) {
      days[key]++;
    }
  }

  return Object.entries(days).map(([day, count]) => ({ day, count }));
};

// ── 10. Complaint resolution time ─────────────────────────────────────
export const getResolutionTime = async () => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("createdAt, status")
    .ilike("status", "resolved");

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return {
      averageDays: 0,
      totalResolved: 0,
      message: "No resolved complaints yet",
    };
  }

  const now = new Date();
  const totalDays = data.reduce((sum, item) => {
    const created = new Date(item.createdAt);
    const days = Math.ceil(
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + days;
  }, 0);

  const averageDays = Number((totalDays / data.length).toFixed(1));

  return {
    averageDays,
    totalResolved: data.length,
    message: `Average resolution time: ${averageDays} days`,
  };
};

// ── 11. Licence approval rate ─────────────────────────────────────────
export const getLicenceApprovalRate = async () => {
  const [
    { count: total },
    { count: approved },
    { count: pending },
    { count: rejected },
  ] = await Promise.all([
    supabase.from("Licence").select("*", { count: "exact", head: true }),
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "approved"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "pending"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).ilike("status", "rejected"),
  ]);

  const totalCount = total ?? 0;
  const approvedCount = approved ?? 0;

  return {
    total: totalCount,
    approved: approvedCount,
    pending: pending ?? 0,
    rejected: rejected ?? 0,
    approvalRate:
      totalCount > 0
        ? Number(((approvedCount / totalCount) * 100).toFixed(1))
        : 0,
  };
};

// ── 12. User activity summary ─────────────────────────────────────────
export const getUserActivitySummary = async () => {
  const [{ data: complaintUsers }, { data: licenceUsers }] = await Promise.all([
    supabase.from("Complaint").select("userId"),
    supabase.from("Licence").select("userId"),
  ]);

  const activity: Record<string, number> = {};
  for (const item of complaintUsers ?? []) {
    activity[item.userId] = (activity[item.userId] ?? 0) + 1;
  }
  for (const item of licenceUsers ?? []) {
    activity[item.userId] = (activity[item.userId] ?? 0) + 1;
  }

  return Object.entries(activity)
    .map(([userId, totalActions]) => ({ userId, totalActions }))
    .sort((a, b) => b.totalActions - a.totalActions)
    .slice(0, 10);
};

// ── 13. Expiring licences ─────────────────────────────────────────────
export const getExpiringLicences = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .ilike("status", "approved");

  if (error) throw new Error(error.message);

  const now = new Date();

  const withExpiry = (data ?? []).map((licence) => {
    const expiryDate = new Date(licence.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { ...licence, expiryDate, daysUntilExpiry };
  });

  return {
    expiredAlready: withExpiry.filter((l) => l.daysUntilExpiry <= 0),
    expiringIn30Days: withExpiry.filter(
      (l) => l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 30
    ),
    expiringIn60Days: withExpiry.filter(
      (l) => l.daysUntilExpiry > 30 && l.daysUntilExpiry <= 60
    ),
    expiringIn90Days: withExpiry.filter(
      (l) => l.daysUntilExpiry > 60 && l.daysUntilExpiry <= 90
    ),
  };
};

// ── 14. Search & filter complaints ────────────────────────────────────
export const searchComplaints = async (filters: {
  provider?: string;
  category?: string;
  status?: string;
}) => {
  let query = supabase.from("Complaint").select("*");

  if (filters.provider) {
    query = query.ilike("provider", `%${filters.provider}%`);
  }
  if (filters.category) {
    query = query.ilike("category", `%${filters.category}%`);
  }
  if (filters.status) {
    query = query.ilike("status", filters.status);
  }

  const { data, error } = await query.order("createdAt", { ascending: false });
  if (error) throw new Error(error.message);

  return {
    total: data?.length ?? 0,
    results: data ?? [],
  };
};

// ── 15. Recent activity feed ──────────────────────────────────────────
export const getRecentActivity = async () => {
  const [
    { data: complaints },
    { data: licences },
    { data: notifications },
  ] = await Promise.all([
    supabase
      .from("Complaint")
      .select("id, refNumber, status, category, provider, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5),
    supabase
      .from("Licence")
      .select("id, type, companyName, status, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5),
    supabase
      .from("Notification")
      .select("id, message, read, createdAt")
      .order("createdAt", { ascending: false })
      .limit(5),
  ]);

  return [
    ...(complaints ?? []).map((c) => ({
      type: "complaint",
      description: `Complaint ${c.refNumber} — ${c.category} against ${c.provider}`,
      status: c.status,
      createdAt: c.createdAt,
    })),
    ...(licences ?? []).map((l) => ({
      type: "licence",
      description: `${l.companyName} applied for ${l.type} licence`,
      status: l.status,
      createdAt: l.createdAt,
    })),
    ...(notifications ?? []).map((n) => ({
      type: "notification",
      description: n.message,
      status: n.read ? "read" : "unread",
      createdAt: n.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);
};
