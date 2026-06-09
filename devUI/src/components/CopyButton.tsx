import { FaRegCopy } from "react-icons/fa";
import { copyToClipboard } from "@/services/Utils";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  stopPropagation?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  className = "px-0.5 py-0.5 text-white rounded-sm hover:text-grey",
  stopPropagation = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    copyToClipboard(textToCopy);
  };

  return (
    <button className={className} onClick={handleClick}>
      <FaRegCopy />
    </button>
  );
};

export default CopyButton;
