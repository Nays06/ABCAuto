import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatListComponent } from "../../components/chat-list/chat-list.component";

@Component({
  selector: 'app-chats',
  imports: [RouterOutlet, ChatListComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class ChatsComponent {

}
