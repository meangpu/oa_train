import { useState } from "react";

interface ButtonCooldownProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  cooldownDuration?: number; // in milliseconds
  disabled?: boolean;
}

const ButtonCooldown = ({
  onClick,
  children,
  className = "",
  cooldownDuration = 2000,
  disabled = false,
}: ButtonCooldownProps) => {
  const [isCooldown, setIsCooldown] = useState(false);

  const handleClick = () => {
    if (isCooldown || disabled) return;

    setIsCooldown(true);
    onClick();

    setTimeout(() => {
      setIsCooldown(false);
    }, cooldownDuration);
  };

  return (
    <button
      className={className}
      onClick={handleClick}
      disabled={isCooldown || disabled}
    >
      {children}
    </button>
  );
};

export default ButtonCooldown;
