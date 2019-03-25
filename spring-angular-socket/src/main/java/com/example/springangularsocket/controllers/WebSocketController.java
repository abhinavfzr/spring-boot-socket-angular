package com.example.springangularsocket.controllers;

import com.example.springangularsocket.domain.User;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

@RestController
public class WebSocketController {


    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    public User user;
    int flag=0;

    public WebSocketController() {
        user= new User();
    }

    @RequestMapping("/socket/{id}")
    public  String set(@PathVariable String id)
    {
        user.setId(id);
        this.flag=1;
        return id;
    }
    @MessageMapping("/reset")
    public  void reset()
    {
        this.flag=0;
    }
    @MessageMapping("/message")
    public void processMessageFromClient(@Payload String message) throws Exception {
         String name = new Gson().fromJson(message, Map.class).get("name").toString();
        String  s = new Gson().fromJson(message, Map.class).get("session").toString();
        if(flag!=1)
        {
            user.setId(s);
        }
        this.messagingTemplate.convertAndSendToUser(user.getId(),"/reply",name);
    }

    @MessageExceptionHandler
    public String handleException(Throwable exception) {
        messagingTemplate.convertAndSend("/errors", exception.getMessage());
        return exception.getMessage();
    }

}