import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

interface Senator {
  id: number;
  name: string;
  imageUrl: string;
  state: string;
  party: string;
  matched: boolean;
}

@Component({
  selector: 'app-senator-matching-game',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbToastModule],
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-6">
        <h2 class="text-2xl font-bold mb-2 dark:text-gray-200">Senator Matching Game (made in 10 minutes with Claude 3.7)</h2>
        <p class="mb-4 dark:text-gray-300">Match the Senator's name to their face!</p>
        
        <div class="mb-4 flex flex-wrap gap-2">
          <button 
            class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            (click)="startGame()">
            New Game
          </button>
          <div class="ml-auto flex items-center gap-2 dark:text-gray-300">
            <span class="font-semibold">Score: {{ score }}</span>
            <span class="font-semibold">Time: {{ timer }}s</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Names Section -->
        <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-3 dark:text-gray-200">Names</h3>
          <div class="grid grid-cols-1 gap-2">
            @for (senator of shuffledNames; track senator.id) {
              <button 
                [class]="'p-3 rounded flex justify-between items-center ' + 
                  (selectedName === senator ? 'bg-blue-200 dark:bg-blue-900' : 
                   senator.matched ? 'bg-green-200 dark:bg-green-900 opacity-50' : 'bg-white dark:bg-gray-700') +
                  ' dark:text-gray-200'"
                [disabled]="senator.matched"
                (click)="selectName(senator)">
                <span>{{ senator.name }}</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">({{ senator.state }} - {{ senator.party }})</span>
              </button>
            }
          </div>
        </div>

        <!-- Photos Section -->
        <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold mb-3 dark:text-gray-200">Photos</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            @for (senator of shuffledPhotos; track senator.id) {
              <div 
                [class]="'aspect-square cursor-pointer rounded-lg overflow-hidden border-2 ' + 
                  (selectedPhoto === senator ? 'border-blue-500' :
                   senator.matched ? 'border-green-500 opacity-50' : 'border-transparent')"
                [ngClass]="{ 'pointer-events-none': senator.matched }"
                (click)="selectPhoto(senator)">
                <img 
                  [src]="senator.imageUrl" 
                  [alt]="'Senator ' + senator.name"
                  class="w-full h-full object-cover">
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Toast for feedback -->
      <ngb-toast
        *ngIf="showToast"
        [autohide]="true"
        [delay]="2000"
        (hidden)="showToast = false"
        [class]="'position-fixed top-0 end-0 m-3 ' + (isCorrectMatch ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500')">
        <div class="d-flex align-items-center">
          <span class="me-auto">{{ toastMessage }}</span>
        </div>
      </ngb-toast>
    </div>
  `,
  styles: [`
    .position-fixed {
      position: fixed;
    }
    .top-0 {
      top: 0;
    }
    .end-0 {
      right: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SenatorMatchingGameComponent implements OnInit {
  // Game state
  shuffledNames: Senator[] = [];
  shuffledPhotos: Senator[] = [];
  selectedName: Senator | null = null;
  selectedPhoto: Senator | null = null;
  score: number = 0;
  timer: number = 0;
  timerInterval: any = null;
  showToast: boolean = false;
  toastMessage: string = '';
  isCorrectMatch: boolean = false;
  
  // Sample senator data with local image paths
  senators: Senator[] = [
    { id: 1, name: 'Chuck Schumer', imageUrl: 'assets/senators/schumer.jpg', state: 'NY', party: 'D', matched: false },
    { id: 2, name: 'Mitch McConnell', imageUrl: 'assets/senators/mcconnell.jpg', state: 'KY', party: 'R', matched: false },
    { id: 3, name: 'Bernie Sanders', imageUrl: 'assets/senators/sanders.jpg', state: 'VT', party: 'I', matched: false },
    { id: 4, name: 'Elizabeth Warren', imageUrl: 'assets/senators/warren.jpg', state: 'MA', party: 'D', matched: false },
    { id: 5, name: 'Ted Cruz', imageUrl: 'assets/senators/cruz.jpg', state: 'TX', party: 'R', matched: false },
    { id: 6, name: 'Amy Klobuchar', imageUrl: 'assets/senators/klobuchar.jpg', state: 'MN', party: 'D', matched: false },
    { id: 7, name: 'Marco Rubio', imageUrl: 'assets/senators/rubio.jpg', state: 'FL', party: 'R', matched: false },
    { id: 8, name: 'Tammy Duckworth', imageUrl: 'assets/senators/duckworth.jpg', state: 'IL', party: 'D', matched: false },
    { id: 9, name: 'Rand Paul', imageUrl: 'assets/senators/paul.jpg', state: 'KY', party: 'R', matched: false },
  ];

  ngOnInit() {
    this.startGame();
  }

  startGame() {
    // Reset game state
    this.score = 0;
    this.timer = 0;
    this.selectedName = null;
    this.selectedPhoto = null;
    
    // Reset matched status
    this.senators.forEach(senator => senator.matched = false);
    
    // Shuffle senators for both arrays
    this.shuffledNames = this.shuffle([...this.senators]);
    this.shuffledPhotos = this.shuffle([...this.senators]);
    
    // Start timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      this.timer++;
    }, 1000);
  }

  selectName(senator: Senator) {
    if (senator.matched) return;
    this.selectedName = senator;
    this.checkMatch();
  }

  selectPhoto(senator: Senator) {
    if (senator.matched) return;
    this.selectedPhoto = senator;
    this.checkMatch();
  }

  checkMatch() {
    if (!this.selectedName || !this.selectedPhoto) return;
    
    if (this.selectedName.id === this.selectedPhoto.id) {
      // Match found
      this.isCorrectMatch = true;
      this.toastMessage = `Correct! That's ${this.selectedName.name}`;
      this.showToast = true;
      this.score += 10;
      
      // Mark as matched
      const nameIdx = this.shuffledNames.findIndex(s => s.id === this.selectedName!.id);
      const photoIdx = this.shuffledPhotos.findIndex(s => s.id === this.selectedPhoto!.id);
      
      if (nameIdx !== -1) this.shuffledNames[nameIdx].matched = true;
      if (photoIdx !== -1) this.shuffledPhotos[photoIdx].matched = true;
      
      // Check if game is complete
      if (this.shuffledNames.every(s => s.matched)) {
        clearInterval(this.timerInterval);
        setTimeout(() => {
          alert(`Congratulations! You completed the game in ${this.timer} seconds with a score of ${this.score}!`);
        }, 500);
      }
    } else {
      // No match
      this.isCorrectMatch = false;
      this.toastMessage = 'Incorrect match. Try again!';
      this.showToast = true;
      if (this.score > 0) this.score -= 2;
    }
    
    // Reset selections
    setTimeout(() => {
      this.selectedName = null;
      this.selectedPhoto = null;
    }, 1000);
  }

  shuffle(array: Senator[]): Senator[] {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      
      // Swap elements
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}