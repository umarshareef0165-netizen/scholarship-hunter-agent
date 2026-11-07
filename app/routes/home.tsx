import HunterHome from "@/components/hunter/HunterHome";
import { APP_TITLE } from "@/lib/app-config";

const SEO_TITLE = `${APP_TITLE} - Match your profile to real scholarships, track deadlines, and draft applications`;
const SEO_DESCRIPTION =
  "Scholarship Hunter is an agent-native app that matches a student's profile to real, verified scholarship programmes, tracks their deadlines, and drafts application material with the agent.";

export function meta() {
  return [
    { title: SEO_TITLE },
    {
      name: "description",
      content: SEO_DESCRIPTION,
    },
    { property: "og:title", content: SEO_TITLE },
    { property: "og:description", content: SEO_DESCRIPTION },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: SEO_TITLE },
    { name: "twitter:description", content: SEO_DESCRIPTION },
  ];
}

export default function HomeRoute() {
  return <HunterHome />;
}
