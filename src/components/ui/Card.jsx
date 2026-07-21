import { forwardRef } from "react";

const Card = forwardRef(function Card({ className = "", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`hover-lift bg-paper border border-border rounded-lg shadow-soft p-8 md:p-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
