import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
	declarations: [ProgressBarComponent],
	imports: [CommonModule, BrowserModule],
	exports: [ProgressBarComponent, BrowserModule]
})
export class ComponentsModule {}
