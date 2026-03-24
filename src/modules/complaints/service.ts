import { supabase } from "../../config/supabase";

// ── 1. Submit complaint ───────────────────────────────────────────────
export const submitComplaint = async (payload: {
  providerLicenceId: string;
  category: string;
  description: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  attachments?: string[];
}) => {
  // Generate reference number: CMP-YYYY-XXXXX
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("Complaint")
    .select("*", { count: "exact", head: true });

  const sequence = String((count ?? 0) + 1).padStart(5, "0");
  const refNumber = `CMP-${year}-${sequence}`;

  const { data, error } = await supabase
    .from("Complaint")
    .insert([
      {
        refNumber,
        status: "open",
        category: payload.category,
        provider: payload.providerLicenceId,
        description: payload.description,
        userId: payload.contact.email, // using email as userId for now
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Return exactly what the frontend expects
  return { referenceNumber: refNumber, complaint: data };
};

// ── 2. Get all complaints ─────────────────────────────────────────────
export const getAllComplaints = async (filters: {
  status?: string;
  category?: string;
  provider?: string;
  page?: number;
  limit?: number;
}) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("Complaint").select("*", { count: "exact" });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.ilike("category", `%${filters.category}%`);
  if (filters.provider) query = query.ilike("provider", `%${filters.provider}%`);

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

// ── 3. Get complaint by ID ────────────────────────────────────────────
export const getComplaintById = async (id: string) => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Complaint not found");
  return data;
};

// ── 4. Track complaint by reference number ────────────────────────────
export const trackComplaint = async (refNumber: string) => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("*")
    .eq("refNumber", refNumber)
    .single();

  if (error || !data) {
    return {
      found: false,
      message: "No complaint found with that reference number",
    };
  }

  // Calculate days open
  const submittedAt = new Date(data.createdAt);
  const now = new Date();
  const daysOpen = Math.ceil(
    (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Map your status values to what the frontend expects
  const statusMap: Record<string, string> = {
    "open": "submitted",
    "in-progress": "in_review",
    "escalated": "escalated",
    "resolved": "resolved",
    "closed": "closed",
  };

  return {
    found: true,
    referenceNumber: data.refNumber,
    providerName: data.provider,
    category: data.category,
    description: data.description,
    status: statusMap[data.status] ?? "submitted",
    submittedAt: data.createdAt,
    resolvedAt: data.status === "resolved" ? data.createdAt : null,
    daysOpen,
  };
};
// ── 5. Update complaint status ────────────────────────────────────────
export const updateComplaintStatus = async (id: string, status: string) => {
  const validStatuses = ["open", "in-progress", "resolved", "closed", "escalated"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("Complaint")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Complaint not found");
  return data;
};

// ── 6. Complaint stats ────────────────────────────────────────────────
export const getComplaintStats = async () => {
  const [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { count: closed },
    { count: escalated },
  ] = await Promise.all([
    supabase.from("Complaint").select("*", { count: "exact", head: true }),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "in-progress"),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "closed"),
    supabase.from("Complaint").select("*", { count: "exact", head: true }).eq("status", "escalated"),
  ]);

  const totalCount = total ?? 0;
  const resolvedCount = resolved ?? 0;

  return {
    total: totalCount,
    open: open ?? 0,
    inProgress: inProgress ?? 0,
    resolved: resolvedCount,
    closed: closed ?? 0,
    escalated: escalated ?? 0,
    resolutionRate:
      totalCount > 0
        ? Number(((resolvedCount / totalCount) * 100).toFixed(1))
        : 0,
  };
};

// ── 7. Complaints by category ─────────────────────────────────────────
export const getComplaintsByCategory = async () => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("category");

  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.category] = (grouped[item.category] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// ── 8. Complaints by provider ─────────────────────────────────────────
export const getComplaintsByProvider = async () => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("provider");

  if (error) throw new Error(error.message);

  const grouped: Record<string, number> = {};
  for (const item of data ?? []) {
    grouped[item.provider] = (grouped[item.provider] ?? 0) + 1;
  }

  return Object.entries(grouped)
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count);
};

// ── 9. Recent complaints ──────────────────────────────────────────────
export const getRecentComplaints = async (limit = 5) => {
  const { data, error } = await supabase
    .from("Complaint")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
};