import * as express from "express";
import * as types from "./types";

// Messages
const messages: types.Message[] = [];

// Message Subscribers
const subscribers: express.Response[] = [];

// Create Express App
const app = express();

// Use JSON middleware
app.use(express.json());

// Chat Endpoint
app
    .route("/chat")

    .get((request, response) => {
        response.header("Content-Type", "text/event-stream");
        addHandlerForConnectionClose(request, response);
        sendCurrentMessages(response);
        addSubscriber(response);
    })

    .post((request, response) => {
        const message = request.body;

        if(types.isMessage(message)) {
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
        currentResponse => currentResponse === response 
    );

    subscribers.splice(indexInSubscribers, 1);
}

function sendCurrentMessages(response: express.Response) {
    const messagesAsString = JSON.stringify(messages);

    response.write(
        "event: current-messages\n"
        + `data: ${messagesAsString}`
    );
}

function addSubscriber(response: express.Response) {
    subscribers.push(response);
}

function addMessageToMessages(message: types.Message) {
    messages.push(message);
}

function broadcastMessageToSubscribers(message: types.Message) {
    const messageString = JSON.stringify(message);

    subscribers.forEach(response => {
        response.write(
            "event: message\n"
            + `data: ${messageString}`
        );
    });
}

function sendReceivedMessageResponse(
    response: express.Response,
    message: types.Message
) {
    response
        .status(200)
        .json(message);
}

function sendErrorMessageBodyResponse(response: express.Response) {
    response
        .status(400)
        .end("Received Message does not have the required fields");
}