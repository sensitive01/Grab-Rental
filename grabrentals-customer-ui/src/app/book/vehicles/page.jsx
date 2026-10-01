import { redirect } from "next/navigation";

export default async function VehiclesSearchPage({ searchParams }) {
  const resolved = await searchParams;
  const query = resolved ? new URLSearchParams(resolved).toString() : "";
  redirect(query ? `/outstation/select-vehicle?${query}` : "/outstation/select-vehicle");
}
