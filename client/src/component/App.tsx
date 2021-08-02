import { BrowserRouter, Switch, Route } from "react-router-dom";
import Chat from "./Chat";
import Home from "./Home";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/chat/:username">
                    <Chat />
                </Route>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </BrowserRouter>
    );
}