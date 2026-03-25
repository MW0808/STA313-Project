import "./App.css";

const sections = [
  "Landing Page",
  "1st Scroll",
  "2nd Scroll",
  "3rd Scroll",
  "4th Scroll",
  "5th Scroll",
  "6th Scroll",
];

function App() {
  return (
    <div className="app">
      {sections.map((title, index) => (
        <section className="panel" key={index}>
          <h1>{title}</h1>
        </section>
      ))}
    </div>
  );
}

export default App;