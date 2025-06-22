import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ChatListComponent } from '../../components/chat-list/chat-list.component';

@Component({
  selector: 'app-chats',
  imports: [RouterOutlet, ChatListComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent {
  currentChatId: any = ""
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.firstChild?.paramMap.subscribe((params) => {
      this.currentChatId = params.get('id');
    });
  }
}
