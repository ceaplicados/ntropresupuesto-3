import { BrowserRouter, Routes, Route } from "react-router-dom";
import Federal from "./pages/Federal";
import Estado from "./pages/Estado";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Federal />} />
        <Route path="JAL" element={<Estado estado="14" />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App
