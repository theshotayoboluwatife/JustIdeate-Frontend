import { createRoot } from "react-dom/client";
import mixpanel from "mixpanel-browser";
import App from "./App";
import "./index.css";

// Initialize Mixpanel
mixpanel.init("3146faf412b099495dfa04c021a8296a", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

createRoot(document.getElementById("root")!).render(<App />);
