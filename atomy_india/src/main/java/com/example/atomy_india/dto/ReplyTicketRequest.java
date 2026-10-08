package com.example.atomy_india.dto;

import com.example.atomy_india.model.TicketMessage;

public class ReplyTicketRequest {
    private String message;
    private TicketMessage.MessageSender sender = TicketMessage.MessageSender.ADMIN;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public TicketMessage.MessageSender getSender() { return sender; }
    public void setSender(TicketMessage.MessageSender sender) { this.sender = sender; }
}
