import { TestBed } from '@angular/core/testing';

import { UploadAvatarService } from './upload-avatar.service'

describe('UploadAvatarServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadAvatarService = TestBed.get(UploadAvatarService);
    expect(service).toBeTruthy();
  });
});
