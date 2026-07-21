import type { ReactNode } from "react";

type CollapsibleRecommendationBoxProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function CollapsibleRecommendationBox({
  title,
  children,
  className,
}: CollapsibleRecommendationBoxProps) {
  const recommendationClassName = [
    "recommendation-box",
    "recommendation-collapsible",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <details className={recommendationClassName}>
      <summary className="recommendation-summary">
        <strong className="recommendation-title">
          <img src="/recommendation-robot.png" alt="" aria-hidden="true" />
          <span>{title}</span>
        </strong>
        <span className="recommendation-chevron" aria-hidden="true" />
      </summary>
      <div className="recommendation-content">
        <div className="recommendation-content-inner">{children}</div>
      </div>
    </details>
  );
}
