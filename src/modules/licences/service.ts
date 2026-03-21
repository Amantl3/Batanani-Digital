import { supabase } from "../../config/supabase";

// ── 1. Get all licences (with search, filter, pagination) ─────────────
export const getAllLicences = async (filters: {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("Licence").select("*", { count: "exact" });

  if (filters.search) {
    query = query.or(
      `companyName.ilike.%${filters.search}%,id.ilike.%${filters.search}%`
    );
  }
  if (filters.type) {
    query = query.ilike("type", `%${filters.type}%`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    results: data ?? [],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
};

// ── 2. Get single licence by ID ───────────────────────────────────────
export const getLicenceById = async (id: string) => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Licence not found");

  return data;
};

// ── 3. Create new licence application ────────────────────────────────
export const createLicence = async (payload: {
  type: string;
  companyName: string;
  userId: string;
}) => {
  // Generate licence number: LIC-YYYY-XXXX
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("Licence")
    .select("*", { count: "exact", head: true });

  const sequence = String((count ?? 0) + 1).padStart(4, "0");
  const licenceNumber = `LIC-${year}-${sequence}`;

  const { data, error } = await supabase
    .from("Licence")
    .insert([
      {
        id: licenceNumber,
        type: payload.type,
        companyName: payload.companyName,
        userId: payload.userId,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ── 4. Update licence status ──────────────────────────────────────────
export const updateLicenceStatus = async (
  id: string,
  status: string
) => {
  const validStatuses = ["pending", "approved", "rejected", "expired", "suspended"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("Licence")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Licence not found");

  return data;
};

// ── 5. Delete licence ─────────────────────────────────────────────────
export const deleteLicence = async (id: string) => {
  const { error } = await supabase.from("Licence").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "Licence deleted successfully" };
};

// ── 6. Licence stats summary ──────────────────────────────────────────
export const getLicenceStats = async () => {
  const [
    { count: total },
    { count: approved },
    { count: pending },
    { count: rejected },
    { count: expired },
    { count: suspended },
  ] = await Promise.all([
    supabase.from("Licence").select("*", { count: "exact", head: true }),
    supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "expired"),
    supabase.from("Licence").select("*", { count: "exact", head: true }).eq("status", "suspended"),
  ]);

  const totalCount = total ?? 0;
  const approvedCount = approved ?? 0;

  return {
    total: totalCount,
    approved: approvedCount,
    pending: pending ?? 0,
    rejected: rejected ?? 0,
    expired: expired ?? 0,
    suspended: suspended ?? 0,
    approvalRate:
      totalCount > 0
        ? Number(((approvedCount / totalCount) * 100).toFixed(1))
        : 0,
  };
};

// ── 7. Licences by type breakdown ─────────────────────────────────────
export const getLicencesByType = async () => {
  const { data, error } = await supabase.from("Licence").select("type, status");
  if (error) throw new Error(error.message);

  const grouped: Record<string, { total: number; approved: number; pending: number }> = {};

  for (const item of data ?? []) {
    if (!grouped[item.type]) {
      grouped[item.type] = { total: 0, approved: 0, pending: 0 };
    }
    grouped[item.type].total++;
    if (item.status === "approved") grouped[item.type].approved++;
    if (item.status === "pending") grouped[item.type].pending++;
  }

  return Object.entries(grouped)
    .map(([type, counts]) => ({ type, ...counts }))
    .sort((a, b) => b.total - a.total);
};

// ── 8. Recently issued licences ───────────────────────────────────────
export const getRecentLicences = async (limit = 5) => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("status", "approved")
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
};

// ── 9. Pending licences (awaiting review) ────────────────────────────
export const getPendingLicences = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("status", "pending")
    .order("createdAt", { ascending: true }); // oldest first = most urgent

  if (error) throw new Error(error.message);
  return {
    total: data?.length ?? 0,
    results: data ?? [],
  };
};

// ── 10. Licences expiring soon ────────────────────────────────────────
export const getExpiringSoonLicences = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("status", "approved");

  if (error) throw new Error(error.message);

  const now = new Date();

  const withExpiry = (data ?? []).map((licence) => {
    const expiryDate = new Date(licence.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { ...licence, expiryDate: expiryDate.toISOString(), daysUntilExpiry };
  });

  return {
    expiredAlready: withExpiry
      .filter((l) => l.daysUntilExpiry <= 0)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    expiringIn30Days: withExpiry
      .filter((l) => l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 30)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    expiringIn60Days: withExpiry
      .filter((l) => l.daysUntilExpiry > 30 && l.daysUntilExpiry <= 60)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    expiringIn90Days: withExpiry
      .filter((l) => l.daysUntilExpiry > 60 && l.daysUntilExpiry <= 90)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
  };
};

// ── 11. Licences issued this month ────────────────────────────────────
export const getLicencesIssuedThisMonth = async () => {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const { data, error, count } = await supabase
    .from("Licence")
    .select("*", { count: "exact" })
    .gte("createdAt", monthStart)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);

  return {
    total: count ?? 0,
    results: data ?? [],
  };
};

// ── 12. Verify licence (public check) ────────────────────────────────
export const verifyLicence = async (licenceId: string) => {
  const { data, error } = await supabase
    .from("Licence")
    .select("id, companyName, type, status, createdAt")
    .eq("id", licenceId)
    .single();

  if (error || !data) {
    return {
      valid: false,
      message: "Licence not found or invalid",
    };
  }

  return {
    valid: data.status === "approved",
    licenceId: data.id,
    companyName: data.companyName,
    type: data.type,
    status: data.status,
    issuedDate: data.createdAt,
    message:
      data.status === "approved"
        ? "This is a valid BOCRA licence"
        : `Licence status is: ${data.status}`,
  };
};

// ── 13. Licence renewal tracking ─────────────────────────────────────
export const getLicenceRenewals = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("status", "approved");

  if (error) throw new Error(error.message);

  const now = new Date();

  const withExpiry = (data ?? []).map((licence) => {
    const expiryDate = new Date(licence.createdAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let renewalStatus = "not-due";
    if (daysUntilExpiry <= 0) renewalStatus = "overdue";
    else if (daysUntilExpiry <= 30) renewalStatus = "due-soon";
    else if (daysUntilExpiry <= 90) renewalStatus = "upcoming";

    return {
      ...licence,
      expiryDate: expiryDate.toISOString(),
      daysUntilExpiry,
      renewalStatus,
    };
  });

  // Group by renewal status
  return {
    overdue: withExpiry.filter((l) => l.renewalStatus === "overdue"),
    dueSoon: withExpiry.filter((l) => l.renewalStatus === "due-soon"),
    upcoming: withExpiry.filter((l) => l.renewalStatus === "upcoming"),
    notDue: withExpiry.filter((l) => l.renewalStatus === "not-due"),
    summary: {
      totalOverdue: withExpiry.filter((l) => l.renewalStatus === "overdue").length,
      totalDueSoon: withExpiry.filter((l) => l.renewalStatus === "due-soon").length,
      totalUpcoming: withExpiry.filter((l) => l.renewalStatus === "upcoming").length,
      totalNotDue: withExpiry.filter((l) => l.renewalStatus === "not-due").length,
    },
  };
};

// ── 14. Licence history / audit trail ────────────────────────────────
export const getLicenceHistory = async (id: string) => {
  // Fetch the licence itself
  const { data: licence, error: licenceError } = await supabase
    .from("Licence")
    .select("*")
    .eq("id", id)
    .single();

  if (licenceError || !licence) throw new Error("Licence not found");

  // Build a timeline from the data we have
  const timeline = [
    {
      event: "Application submitted",
      description: `${licence.companyName} applied for a ${licence.type} licence`,
      status: "submitted",
      date: licence.createdAt,
    },
  ];

  // Add status events based on current status
  if (licence.status === "approved") {
    timeline.push({
      event: "Application approved",
      description: `${licence.type} licence approved for ${licence.companyName}`,
      status: "approved",
      date: licence.createdAt,
    });
  }

  if (licence.status === "rejected") {
    timeline.push({
      event: "Application rejected",
      description: `${licence.type} licence application was rejected`,
      status: "rejected",
      date: licence.createdAt,
    });
  }

  if (licence.status === "suspended") {
    timeline.push({
      event: "Licence suspended",
      description: `${licence.companyName} licence has been suspended`,
      status: "suspended",
      date: licence.createdAt,
    });
  }

  if (licence.status === "expired") {
    timeline.push({
      event: "Licence expired",
      description: `${licence.companyName} licence has expired`,
      status: "expired",
      date: licence.createdAt,
    });
  }

  // Check expiry
  const expiryDate = new Date(licence.createdAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    licence,
    expiryDate: expiryDate.toISOString(),
    daysUntilExpiry,
    timeline: timeline.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };
};

// ── 15. Search licences by user/owner ────────────────────────────────
export const getLicencesByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("Licence")
    .select("*")
    .eq("userId", userId)
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);

  const results = data ?? [];

  // Summary for this user
  const summary = {
    total: results.length,
    approved: results.filter((l) => l.status === "approved").length,
    pending: results.filter((l) => l.status === "pending").length,
    rejected: results.filter((l) => l.status === "rejected").length,
    expired: results.filter((l) => l.status === "expired").length,
    suspended: results.filter((l) => l.status === "suspended").length,
  };

  return { userId, summary, licences: results };
};

// ── 16. Most common licence types applied for ─────────────────────────
export const getMostCommonLicenceTypes = async () => {
  const { data, error } = await supabase
    .from("Licence")
    .select("type, status");

  if (error) throw new Error(error.message);

  type GroupedType = { total: number; approved: number; pending: number; rejected: number };
  const grouped: Record<string, GroupedType> = {};

  for (const item of data ?? []) {
    if (!grouped[item.type]) {
      grouped[item.type] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    grouped[item.type].total++;
    if (item.status === "approved") grouped[item.type].approved++;
    if (item.status === "pending") grouped[item.type].pending++;
    if (item.status === "rejected") grouped[item.type].rejected++;
  }

  const total = Object.values(grouped).reduce((sum, g) => sum + g.total, 0);

  return Object.entries(grouped)
    .map(([type, counts]) => ({
      type,
      total: counts.total,
      approved: counts.approved,
      pending: counts.pending,
      rejected: counts.rejected,
      percentage:
        total > 0 ? Number(((counts.total / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

// ── 17. Suspended licences list ───────────────────────────────────────
export const getSuspendedLicences = async () => {
  const { data, error, count } = await supabase
    .from("Licence")
    .select("*", { count: "exact" })
    .eq("status", "suspended")
    .order("createdAt", { ascending: false });

  if (error) throw new Error(error.message);

  return {
    total: count ?? 0,
    results: data ?? [],
  };
};