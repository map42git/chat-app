import { TestBed } from '@angular/core/testing';

import { TextcutterService } from './textcutter.service';

describe('TextcutterService', () => {
  let service: TextcutterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextcutterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
