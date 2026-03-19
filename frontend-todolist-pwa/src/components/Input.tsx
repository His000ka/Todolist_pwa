import { forwardRef } from "react";
import "./Input.css";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
  return (
    <input 
      ref={ref} 
      {...props} 
      className="custom-input" 
    />
  );
});

Input.displayName = "Input";
export default Input;