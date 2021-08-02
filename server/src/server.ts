import * as express from "express";
import * as types from "./types";
import * as cors from "cors";

// Usernames
const usernames = new Set<string>();

// Messages
const messages: types.Message[] = [];

// Message Subscribers
const subscribers: types.Subscriber[] = [];

// Create Express App
const app = express();

// Use JSON and CORS middleware
app.use(cors());
app.use(express.text());

// Username Endpoint
app
    .route("/username")

    .post((request, response) => {
        const username = request.body;

        if(isUsernameTaken(username))
            sendUsernameTakenErrorResponse(response);

        else {
            usernames.add(username);
            sendReceivedUsernameResponse(response, username);
        }
    })

// Chat Endpoint
app.use("/chat/:username", (request, response, next) => {
    if(! isUsernameTaken(request.params.username))
        response
            .status(403)
            .end("Username has not been registered");

    else next();
});

app
    .route("/chat/:username")

    .get((request, response) => {
        response.header("Content-Type", "text/event-stream");
        response.flushHeaders();
        addHandlerForConnectionClose(request, response);
        sendCurrentMessages(response);
        addSubscriber(request.params.username, response);
    })

    .post((request, response) => {
        const messageString = request.body;

        if(typeof messageString === "string") {
            const message = { 
                username: request.params.username, 
                message: messageString 
            };

            addMessageToMessages(message);
            broadcastMessageToSubscribers(message);
            sendReceivedMessageResponse(response, message);
        }
        else sendErrorMessageBodyResponse(response);
    })

// Begin Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log("Server Started at http://localhost:5000");
})

// Helper functions

function isUsernameTaken(username: string): boolean {
    return usernames.has(username);
}

function sendUsernameTakenErrorResponse(response: express.Response) {
    response
        .status(406)
        .end("Username has already been taken");
}

function sendReceivedUsernameResponse(
    response: express.Response,
    username: string
) {
    response
        .status(200)
        .end(username);
}

function addHandlerForConnectionClose(
    request: express.Request,
    response: express.Response
) {
    request.on("close", () => {
        response.end("\n\n");
        removeSubscriber(response);
    });
}

function removeSubscriber(response: express.Response) {
    const indexInSubscribers = subscribers.findIndex(
        subscriber => subscriber.response === response 
    );

    subscribers.splice(indexInSubscribers, 1);
}

function sendCurrentMessages(response: express.Response) {
    const messagesAsString = JSON.stringify(messages);

    response.write(
        "event: currentMessages\n"
        + `data: ${messagesAsString}\n\n`
    );
}

function addSubscriber(username: string, response: express.Response) {
    const subscriber: types.Subscriber = { username, response }
    subscribers.push(subscriber);
}

function addMessageToMessages(message: types.Message) {
    messages.push(message);
}

function broadcastMessageToSubscribers(message: types.Message) {
    const messageString = JSON.stringify(message);

    subscribers.forEach(({ username, response }) => {
        response.write(
            "event: message\n"
            + `data: ${messageString}\n\n`
        );
    });
}

function sendReceivedMessageResponse(
    response: express.Response,
    message: types.Message
) {
    response
        .status(200)
        .end(message.message);
}

function sendErrorMessageBodyResponse(response: express.Response) {
    response
        .status(400)
        .end("Received Message is not a string");
}