import axios from 'axios';
import Cookie from 'js-cookie';
import React from 'react';
import { Prompt } from 'react-router'
import { Button, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import io from 'socket.io-client';
import { BASE_URL, SOCKET_URI } from '../../constants/api-routes';
import { Notification } from '../notification';
import './ChannelMessages.scss';
import ChatBox from './ChatBox';
import TypingPrompt from './TypingPrompt';

const socket = io(SOCKET_URI);

    socket.on("connect", () => {
        console.log("connect");
    });
    socket.on("status", (status) => {
        console.log("received status: " + status.data);
    });
    socket.on("room_message", (msg) => {
        console.log("message from room: " + msg);
    });








class ChannelMessages extends React.Component {
    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
        this.state = {
            isLoading: false,
            fetchSucceeded: false,
            messages: [],
            isSomeoneElseTyping: false
        };
        // Binding socket listener handlers:
        socket.on("receive_message", (message) => {
            console.log(`Received message: ${message}`);
            this.fetchMessages();
        });
        socket.on("show_typing_prompt", () => {
            console.log("User is typing...");
            this.setState({
                isSomeoneElseTyping: true
            });
        });
        socket.on("hide_typing_prompt", () => {
            console.log("User is NOT typing...");
            this.setState({
                isSomeoneElseTyping: false
            });
        });
        socket.on("message_removed", (message) => {
            console.log(`Received message: ${message}`);
            this.fetchMessages();
        });
        socket.on("message_edited", (message) => {
            console.log(`Received message: ${message}`);
            this.fetchMessages();
        });
        socket.on("input_error", (message) => {
            Notification.spawnNotification("Input error", message, "danger")
        });
        this.broadcastTypingPrompt = this.broadcastTypingPrompt.bind(this);

        // TODO: remove
        this.pingRoom = this.pingRoom.bind(this);
        socket.on("pinged", (message) => {
            console.log("YOU HAVE BEEN PINGED: " + message);
        });

        this.exitChannelRoom = this.exitChannelRoom.bind(this);
        this.joinChannelRoom = this.joinChannelRoom.bind(this);
    }

    // Emits a socket event to enter this user to the channel's broadcast group
    joinChannelRoom() {
        // socket.emit("user_enter", { user_id: 1, room: "Notification" })
        socket.emit("user_enter", {user: "test", room: "Notification"});
    }

    // Emits a socket event to drop this user from the channel's broadcast group
    exitChannelRoom() {
        socket.emit("user_leave", { "user_id": 1, "room": "Notification" })
    }

    // TODO: Remove this test func
    pingRoom() {
        console.log("Trying to ping room");
        socket.emit("pingtest", {user: "test", room: "Notification"});
    }

    UNSAFE_componentWillMount() {
        this.fetchMessages();
    }

    componentDidMount() {
        const textField = document.getElementById("typingArea");
        if (textField) {
            textField.addEventListener("input", this.broadcastTypingPrompt);
        } else {
            console.log("Typing text field could not be selected!");
        }
        this.joinChannelRoom();
    }

    broadcastTypingPrompt(event) {
        // Extracting the current value in the text field from the event object
        // and checking whether it is non-empty (contains non-whitespace characters)
        const currMessage = event.target.value;
        const currToken = Cookie.get("token");
        if (currMessage.trim() !== "") {
            socket.emit("started_typing", {"room": "Notification"});
        } else {
            socket.emit("stopped_typing", {"room": "Notification"});
        }
    }

    sendMessage(event) {
        event.preventDefault();
        const messageData = new FormData(event.target);
        const currToken = Cookie.get("token");
        if (currToken) {
            console.log(`Sending the message: ${messageData.get("message")}`);
            console.log(`Emitting send_message with params: ${currToken} ${this.props.channelID} ${messageData.get("message")}`);
            // TODO: Move the event name 'send_message' to a constants file
            socket.emit("send_message", currToken, this.props.channelID, messageData.get("message"));
            const textField = document.getElementById("typingArea");
            textField.value = "";
        }
    }

    fetchMessages() {
        this.setState({
            isLoading: true
        });
        const currToken = Cookie.get("token");
        if (currToken) {
            axios.get(`${BASE_URL}/channels/messages?token=${currToken}&channel_id=${this.props.channelID}&start=0`)
                .then((response) => {
                    this.setState({
                        isLoading: false,
                        fetchSucceeded: true,
                        messages: response.data.messages
                    });
                })
                .catch((err) => {
                    const errorMessage = (err.response.data.message) ? (err.response.data.message) : "Something went wrong";
                    Notification.spawnNotification("Fetching channel messages failed", errorMessage, "danger");
                    this.setState({
                        isLoading: false,
                        fetchSucceeded: false
                    });
                });
        }
    }

    componentDidUpdate() {
        setTimeout(function() {
            const messageListContainer = document.getElementById("message-list-container");
            messageListContainer.scrollTop = messageListContainer.scrollHeight;
        }, 200);
    }

    render() {
        return (
            <>
                <Prompt
                    when={true}
                    message={this.exitChannelRoom}
                />
                <ChatBox {...this.state} />
                {/* 'User is typing' prompt */}
                <TypingPrompt isSomeoneElseTyping={this.state.isSomeoneElseTyping} />
                {/* Type a message form: */}
                <Form className="messageForm" onSubmit={this.sendMessage}>
                    <FormGroup className="typingAreaFormGroup">
                        <InputGroup>
                            <Input id="typingArea" type="textarea" placeholder="Type a message" name="message" />
                            <InputGroupAddon addonType="append">
                                <InputGroupText>
                                    <Button>
                                        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
                                    </Button>
                                </InputGroupText>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </Form>
            </>
        );
    }
}

export default ChannelMessages;
