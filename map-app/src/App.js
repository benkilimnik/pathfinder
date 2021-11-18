import './App.css';
import Route from "./Route.js";
import Map from "./Map.js";
import TextBox from "./Textbox.js";

function App() {
  return (
      <div className="App">
        <Map></Map>
        <Route></Route>
        <header className="App-header">
            <p>
                Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                Learn React
            </a>
        </header>
          <TextBox></TextBox>
      </div>
  );
}

export default App;