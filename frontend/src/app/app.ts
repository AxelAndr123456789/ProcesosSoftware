import { Component, OnInit } from '@angular/core';
import { bootstrapMVC } from './controller/controller';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  ngOnInit(): void {
    bootstrapMVC();
  }
}
