import { Component } from '@angular/core';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import $ from 'jquery';
import { Session } from 'protractor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private url="http://localhost:8080/greeting";
  greetings: string[] = [];
  showConversation: boolean = false;
  ws: any;
  name: string;
  disabled: boolean;
  session: any;
  constructor(){
    this.session="abc";
  }

  connect() {   // invoked when connect buuton is clicked 
    // it is used to connect socket to the spring boot api
    // it will als extract the session id and subscribe the data into the mapping 
    //connect to stomp where stomp endpoint is exposed
    let ws = new SockJS(this.url);    
    this.ws = Stomp.over(ws)
    let that = this;
    this.ws.connect({}, function(frame) {
      that.session=ws._transport.unloadRef;

      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe(`/user/${ws._transport.unloadRef}/reply`, function(message) {
        console.log(message);
        console.log("this is socket",ws._transport.unloadRef);
        that.session=ws._transport.unloadRef;
        that.showGreeting(message.body);
        
      });
      that.disabled = true;
    }, function(error) {
      alert("STOMP error " + error);
    });
  
  }

  disconnect() {// it will disconnect the socket and also reset the user sicked id
    if (this.ws != null) {
      this.ws.send("/app/reset");
      this.ws.ws.close();
    }
    this.setConnected(false);
    console.log("Disconnected");
  }

  sendName() { // it will send the message and session data to the mapping of spring boot 
    let data = JSON.stringify({
      'name' : this.name,      // name==message
      'session': this.session
    })
    console.log("session come here ",this.session);
    this.ws.send("/app/message", {}, data);
  }

  showGreeting(message) {   // it will push the messages into list of arrays
    this.showConversation = true;
    this.greetings.push(message)
    
  }

  setConnected(connected) { // it will set the button to connected
    this.disabled = connected;
    this.showConversation = connected;
    this.greetings = [];
  }
 

}
