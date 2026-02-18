import { redirect } from "next/navigation";

/**
 * Legacy route - redirects to unified dashboard
 */
export default function NFTsPage() {
  redirect("/?tab=nfts");
}
