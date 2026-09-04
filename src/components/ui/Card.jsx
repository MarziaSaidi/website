import { forwardRef } from "react";

const Card = forwardRef(function Card({ className = "", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`hover-lift bg-surface-elevated border border-border rounded-lg shadow-soft p-8 md:p-12 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
