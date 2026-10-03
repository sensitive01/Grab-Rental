import { redirect } from "next/navigation";

export default function VendorApprovalRedirectPage() {
  redirect("/admin/vendors?tab=approvals");
}
