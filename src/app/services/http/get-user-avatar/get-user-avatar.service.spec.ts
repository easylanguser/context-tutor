import { TestBed } from '@angular/core/testing';

import { GetUserAvatarService } from './get-user-avatar.service';

describe('GetUserAvatarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetUserAvatarService = TestBed.get(GetUserAvatarService);
    expect(service).toBeTruthy();
  });
});
