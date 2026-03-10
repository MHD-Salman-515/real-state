import { useNavigate } from "react-router-dom";
import IntroOverlay from "../../components/intro/IntroOverlay.jsx";

export default function Intro() {
  const navigate = useNavigate();

  const handleContinue = () => {
    try {
      localStorage.setItem("creos_intro_seen", "true");
    } catch {
      // ignore storage write errors
    }
    navigate("/auth/login");
  };

  return (
    <IntroOverlay
      open
      onEnter={handleContinue}
      onClose={handleContinue}
    />
  );
}
