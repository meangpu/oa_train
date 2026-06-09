import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { useEventHandlers } from "./services/GlobalVar";
import { useDevSetup } from "./services/DevSetup";
import { mainNavLinks } from "./components/NavData";
import RouterBridge from "./services/RouterBridge";

function App() {
  useEventHandlers();
  useDevSetup();

  return (
    <HashRouter>
      <RouterBridge />
      <Routes>
        <Route element={<Layout />}>
          {mainNavLinks.map(({ path, component: Component }) =>
            Component ? (
              <Route key={path} path={path} element={<Component />} />
            ) : null
          )}
          <Route path='*' element={<div>Page Not Found</div>} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
