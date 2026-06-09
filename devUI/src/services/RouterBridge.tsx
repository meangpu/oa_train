import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalVar from "./GlobalVar";

export default function RouterBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    useGlobalVar.getState().setRouterNavigate((to: string) => navigate(to));
    return () => {
      useGlobalVar.getState().setRouterNavigate(null);
    };
  }, [navigate]);

  return null;
}

