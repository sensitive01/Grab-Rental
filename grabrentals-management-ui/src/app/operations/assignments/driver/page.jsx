"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DriverAssignmentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/operations/assignments/vehicle");
  }, [router]);

  return null;
}
