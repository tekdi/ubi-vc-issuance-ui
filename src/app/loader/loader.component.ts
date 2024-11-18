import { Component, OnInit } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})

export class LoaderComponent implements OnInit {
  isLoading = this.loadingService.loadingStatus;

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {}
}
