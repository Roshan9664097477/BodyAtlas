import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { ThemeService } from '../../core/services/theme.service';
import { ChatMessage } from '../../shared/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  chatService: ChatService;
  userMessage = '';
  showSuggestions = signal(false);

  quickPrompts = [
    '🥗 Create a diet plan for weight loss',
    '💪 Give me a chest workout routine',
    '🍎 What should I eat before workout?',
    '📊 Make a 1200-calorie meal plan'
  ];

  suggestions = [
    'Beginner workout',
    'High protein meals',
    'Ab exercises',
    'Post-workout food',
    'Build muscle tips',
    'Fat burning workout'
  ];

  constructor(
    chatService: ChatService,
    public themeService: ThemeService
  ) {
    this.chatService = chatService;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  async sendMessage() {
    if (!this.userMessage.trim() || this.chatService.loading()) return;

    const message = this.userMessage;
    this.userMessage = '';
    this.showSuggestions.set(false);
    
    await this.chatService.sendMessage(message);
  }

  sendQuickPrompt(prompt: string) {
    const cleanPrompt = prompt.replace(/^[^\w\s]+\s*/, '');
    this.userMessage = cleanPrompt;
    this.sendMessage();
  }

  useSuggestion(suggestion: string) {
    this.userMessage = suggestion;
    this.showSuggestions.set(false);
    this.sendMessage(); // Send the message immediately
  }

  clearChat() {
    if (confirm('Clear chat history?')) {
      this.chatService.clearHistory();
    }
  }

  formatMessage(content: string): string {
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^# (.*$)/gm, '<h2>$1</h2>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li><strong>$1.</strong> $2</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    if (!formatted.startsWith('<')) {
      formatted = `<p>${formatted}</p>`;
    }
    
    return formatted;
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}
