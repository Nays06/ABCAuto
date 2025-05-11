import { NgFor, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-video-slider',
  imports: [NgFor, NgIf],
  templateUrl: './video-slider.component.html',
  styleUrl: './video-slider.component.css',
})
export class VideoSliderComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  currentIndex = 0;
  progress = 0;
  showPlayButton = false;
  private progressInterval: any;

  slides = [
    {
      videoUrl: './assets/videos/original (2).mp4',
      title: 'Заголовок 1',
      description: 'Описание 1',
    },
    {
      videoUrl: './assets/videos/original (3).mp4',
      title: 'Заголовок 2',
      description: 'Описание 2',
    },
  ];

  ngAfterViewInit(): void {
    this.setupVideoEvents();
    this.tryAutoPlay();
  }

  ngOnDestroy(): void {
    this.clearProgressInterval();
  }

  next(): void {
    this.clearProgressInterval();
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.resetVideo();
    this.tryAutoPlay();
  }

  prev(): void {
    this.clearProgressInterval();
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.resetVideo();
    this.tryAutoPlay();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetVideo();
    this.tryAutoPlay();
  }

  playVideo(): void {
    const video = this.videoElement.nativeElement;
    video.play()
      .then(() => this.showPlayButton = false)
      .catch(e => console.error('Video play failed:', e));
  }

  private setupVideoEvents(): void {
    const video = this.videoElement.nativeElement;
    
    video.onended = () => this.next();
    
    video.onplay = () => {
      this.startProgressTracking();
      this.showPlayButton = false;
    };

    video.onpause = () => {
      this.clearProgressInterval();
    };
  }

  private tryAutoPlay(): void {
    setTimeout(() => {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play()
        .catch(() => this.showPlayButton = true);
    }, 10);
  }

  private resetVideo(): void {
    const video = this.videoElement.nativeElement;
    video.currentTime = 0;
    this.progress = 0;
  }

  private startProgressTracking(): void {
    this.clearProgressInterval();
    
    this.progressInterval = setInterval(() => {
      const video = this.videoElement.nativeElement;
      if (video.duration) {
        this.progress = (video.currentTime / video.duration) * 100;
      }
    }, 100);
  }

  private clearProgressInterval(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
