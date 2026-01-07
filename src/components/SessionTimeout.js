import { useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SessionTimeout = ({ timeoutMins = 3 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    console.log("Session expired due to inactivity");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Only set the timer if the user is NOT on the login page
    if (location.pathname !== "/") {
    //   timerRef.current = setTimeout(logout, timeoutMins * 60 * 1000);
    // Now you can pass seconds directly as a prop
        timerRef.current = setTimeout(logout, timeoutMins * 1000);
    }
  }, [logout, location.pathname, timeoutMins]);

  useEffect(() => {
    // List of events that count as "activity"
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup: remove listeners and clear timeout when component unmounts
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return null; // This component doesn't render anything UI-wise
};

export default SessionTimeout;
