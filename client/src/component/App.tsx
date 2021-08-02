import { BrowserRouter, Switch, Route } from "react-router-dom";

export default function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/chat">Chat</Route>
                <Route path="/">Home</Route>
            </Switch>
        </BrowserRouter>
    );
}