import {
  ChartBarIcon,
  InboxIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

export const useFormResultsSecondNavigation = (formId) => {
  const router = useRouter();
  return [
    {
      id: "summary",
      onClick: () => {
        router.push(`/forms/${formId}/results/summary`);
      },
      Icon: ChartBarIcon,
      label: "Résumé",
    },
    {
      id: "responses",
      onClick: () => {
        router.push(`/forms/${formId}/results/responses`);
      },
      Icon: InboxIcon,
      label: "Réponses",
    },
    {
      id: "insights",
      onClick: () => {
        router.push(`/forms/${formId}/results/insights`);
      },
      Icon: ArrowTrendingUpIcon,
      label: "Aperçus",
    },
  ];
};
