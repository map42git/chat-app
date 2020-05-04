/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserHookService } from './userHook.service';

describe('Service: UserHook', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserHookService]
    });
  });

  it('should ...', inject([UserHookService], (service: UserHookService) => {
    expect(service).toBeTruthy();
  }));
});
