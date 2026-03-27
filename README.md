# Batanani Digital: Integrated Regulatory Management System

### Our Solution
Batanani Digital is a comprehensive regulatory ecosystem built for the Botswana Communications Regulatory Authority (BOCRA). The platform digitizes the entire lifecycle of regulatory compliance—from public consumer grievances to commercial licensing and administrative oversight.

* **Unified Licensing Portal:** A digital storefront where entities can view active license categories (Telecommunications, Postal, Broadcasting) and submit formal applications with supporting documentation.
* **Regulated Complaint Flow:** A citizen-centric module that enforces statutory compliance, such as verifying the mandatory 14-day provider contact period before allowing a formal escalation.
* **Administrative Command Center:** A secure, high-visibility dashboard for BOCRA officials to review, approve, or decline pending applications and complaints.
* **Live Analytics Engine:** The dashboard synchronizes with the database in real-time, ensuring that metrics for pending cases, approval rates, and provider performance are updated instantly upon every new submission.

### Tech Stack

**Frontend**
* **React + Vite:** Core UI library for high-speed performance and modular component architecture.
* **TanStack Query (React Query):** Manages server-state and powers the "Live Update" feel of the dashboard via automated refetching.
* **Tailwind CSS:** Professional, responsive styling aligned with BOCRA’s official branding.
* **Zod + React Hook Form:** Strict client-side validation for complex multi-step application forms.

**Backend**
* **NestJS:** A scalable Node.js framework providing the enterprise-grade architecture required for regulatory tools.
* **PostgreSQL:** Relational database for maintaining strict data relationships and audit trails.
* **Railway:** Cloud infrastructure platform for hosting, database management, and CI/CD.

### System Architecture & API

The system utilizes Role-Based Access Control (RBAC) to ensure a secure boundary between public users and BOCRA administrators.

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/licenses` | Returns all available license types and requirements. | Public |
| `POST` | `/api/licenses/apply` | Submits a commercial license application. | Public |
| `POST` | `/api/complaints` | Submits a validated consumer grievance. | Public |
| `GET` | `/api/admin/dashboard` | Fetches live stats (pending vs. resolved). | Admin |
| `PATCH` | `/api/admin/evaluate/:id` | Action to Approve or Disapprove a submission. | Admin |

### Database Schema

The relational design ensures that every complaint or license application is linked to a specific provider and an administrative decision history.

**Complaints & Licenses**
* `id`: Primary Key (UUID)
* `type`: Enum (Complaint, License_Application)
* `status`: Enum (Pending, Approved, Disapproved, Resolved)
* `referenceNumber`: Unique String (e.g., CMP-2026-001)
* `payload`: JSONB (Stores flexible form data for different license types)
* `createdAt`: Timestamp

**Admin Audit Log**
* `id`: Primary Key
* `targetId`: Foreign Key (Link to License/Complaint)
* `action`: String (APPROVE/DISAPPROVE)
* `remarks`: Text (Required for disapprovals)
* `adminId`: Foreign Key

### Local Development

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Amantl3/Batanani-Digital.git](https://github.com/Amantl3/Batanani-Digital.git)
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and provide your backend URL:
    ```env
    VITE_API_URL=[https://batanani-digital-production.up.railway.app/api](https://batanani-digital-production.up.railway.app/api)
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

### Production Access
The live application is hosted on Railway and can be accessed via the following production URL:
`https://batanani-digital-production.up.railway.app`
