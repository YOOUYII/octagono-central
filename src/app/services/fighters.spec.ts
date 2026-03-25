import { TestBed } from '@angular/core/testing';

import { Fighters } from './fighters';

describe('Fighters', () => {
  let service: Fighters;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fighters);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
