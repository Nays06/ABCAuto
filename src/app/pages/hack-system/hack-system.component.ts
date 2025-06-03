import { Location, NgFor, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hack-system',
  imports: [NgIf, NgFor],
  templateUrl: './hack-system.component.html',
  styleUrl: './hack-system.component.css',
})
export class HackSystemComponent {
  balance = 0;
  isFullscreen = true;
  terminalOutput: any = [
    { text: 'Welcome to the system.', isError: false },
    { text: 'Type "help" for command list.', isError: false },
    '',
  ];
  commandsHistory: string[] = [];
  currentCommandIndex = -1;
  private lastPartialCommand = '';
  private commandSuggestions: string[] = [];
  private currentSuggestionIndex = -1;

  private commands = {
    help: 'Available commands: help, sudo transfer [amount], clear, leave',
    clear: '',
    'sudo transfer':
      'Transfers specified amount to your account. Usage: sudo transfer [amount]',
  };

  private allCommands = ['help', 'clear', 'sudo transfer', 'leave'];

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key && /[а-яА-ЯЁё]/.test(event.key)) {
      event.preventDefault();
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      this.handleTabCompletion();
    }
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  handleArrowUp(event: KeyboardEvent) {
    if (this.commandsHistory.length > 0) {
      if (this.currentCommandIndex < this.commandsHistory.length - 1) {
        this.currentCommandIndex++;
      }
      const input = document.querySelector(
        '.command-input'
      ) as HTMLInputElement;
      if (input) {
        input.value =
          this.commandsHistory[
            this.commandsHistory.length - 1 - this.currentCommandIndex
          ];
        this.resetTabCompletion();
      }
    }
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  handleArrowDown(event: KeyboardEvent) {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (input) {
      if (this.currentCommandIndex > 0) {
        this.currentCommandIndex--;
        input.value =
          this.commandsHistory[
            this.commandsHistory.length - 1 - this.currentCommandIndex
          ];
      } else {
        this.currentCommandIndex = -1;
        input.value = '';
      }
      this.resetTabCompletion();
    }
  }

  constructor (private authService: AuthService, private router: Router, private location: Location) { }

  ngOnInit() {
    this.authService.getBalance().subscribe(
      (res: any) => {
        this.balance = res
      },
      (err: any) => {
        console.error(err);
      }
    )
  }

  private handleTabCompletion() {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (!input) return;

    const currentValue = input.value.trim();

    if (currentValue !== this.lastPartialCommand) {
      this.resetTabCompletion();
      this.lastPartialCommand = currentValue;

      this.commandSuggestions = this.allCommands.filter((cmd) =>
        cmd.startsWith(currentValue.toLowerCase())
      );

      if (this.commandSuggestions.length === 0) {
        return;
      }

      this.currentSuggestionIndex = 0;
      input.value = this.commandSuggestions[this.currentSuggestionIndex];
    } else if (this.commandSuggestions.length > 0) {
      this.currentSuggestionIndex =
        (this.currentSuggestionIndex + 1) % this.commandSuggestions.length;
      input.value = this.commandSuggestions[this.currentSuggestionIndex];
    }

    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  }

  private resetTabCompletion() {
    this.lastPartialCommand = '';
    this.commandSuggestions = [];
    this.currentSuggestionIndex = -1;
  }

  toggleFullscreen() {
    const elem = document.documentElement;
    if (!this.isFullscreen) {
      elem.requestFullscreen().catch((err) => {
        this.addToTerminal(`Error: ${err}`, true);
      });
    } else {
      document.exitFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  executeCommand(event: Event) {
    const input = event.target as HTMLInputElement;
    const command = input.value.trim();
    input.value = '';

    if (!command) return;

    if (/[а-яА-ЯЁё]/.test(command)) {
      this.addToTerminal('Error: Only English commands allowed', true);
      return;
    }

    this.commandsHistory.push(command);
    this.currentCommandIndex = -1;
    this.resetTabCompletion();

    this.addToTerminal(`$ ${command}`);

    if (command === 'clear') {
      this.terminalOutput = [];
    } else if (command.startsWith('sudo transfer ')) {
      const amount = this.parseAmount(command);
      if (amount > 0) {
        this.hackTransfer(amount);
      } else {
        this.addToTerminal(
          'Error: Invalid amount. Example: "sudo transfer 500000"',
          true
        );
      }
    } else if(command === "leave") {
      if(this.isFullscreen) {
        this.toggleFullscreen()
      }
      this.location.back()
    } else if (command in this.commands) {
      this.addToTerminal(this.commands[command as keyof typeof this.commands]);
    } else {
      this.addToTerminal(
        `Error: command "${command}" not found. Type "help" for assistance.`,
        true
      );
    }
  }

  private parseAmount(command: string): number {
    const amountStr = command
      .replace('sudo transfer ', '')
      .trim()
      .toLowerCase();

    if (amountStr.includes('m')) {
      const numPart = amountStr.replace('m', '').replace(/\s+/g, '');
      const amount = parseFloat(numPart);
      return isNaN(amount) ? 0 : amount * 1000000;
    } else if (amountStr.includes('k')) {
      const numPart = amountStr.replace('k', '').replace(/\s+/g, '');
      const amount = parseFloat(numPart);
      return isNaN(amount) ? 0 : amount * 1000;
    } else {
      const numPart = amountStr.replace(/\s+/g, '');
      const amount = parseInt(numPart, 10);
      return isNaN(amount) ? 0 : amount;
    }
  }

private hackTransfer(amount: number) {
  this.authService.setBalance(this.balance + amount).subscribe(
    (res: any) => {
      console.log(res);
      this.authService.updateBalance(this.balance + amount);
      this.processHackingSteps(amount);
    },
    (err: any) => {
      console.log(err);
      this.addToTerminal(err.error.message, true);
    }
  );
}

private processHackingSteps(amount: number) {
  this.addToTerminal(`'Mamkin Hacker' Hacking system for amount $${amount.toLocaleString()}...`);

  setTimeout(() => {
    this.addToTerminal('Bypassing security...');
  }, 800);

  setTimeout(() => {
    this.addToTerminal('Replacing data...');
  }, 1600);

  setTimeout(() => {
    this.balance += amount;
    this.addToTerminal(`Success! Balance increased by $${amount.toLocaleString()}`);
    this.addToTerminal(`Current balance: $${this.balance.toLocaleString()}`);
    this.playSuccessSound();
  }, 2500);
}

  private addToTerminal(text: string, isError: boolean = false) {
    this.terminalOutput.push({ text, isError });
    setTimeout(() => {
      const terminal = document.querySelector('.terminal-body');
      if (terminal) terminal.scrollTop = terminal.scrollHeight;
    }, 0);
  }

  private playSuccessSound() {
    const audio = new Audio();
    audio.src =
      'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3';
    audio.volume = 0.3;
    audio.play().catch((e) => console.log('Sound playback failed:', e));
  }

  focusInput() {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }
}
