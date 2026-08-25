import LivingWorld from "./components/scene/LivingWorld";
import "./App.css";

function App() {
  return (
    <main className="app">
      <LivingWorld />

      <div className="intro">
        <p>PRTUSR</p>
        <span>Initializing system...</span>
      </div>

      <div className="scroll-space" />
    </main>
  );
}

export default App;
