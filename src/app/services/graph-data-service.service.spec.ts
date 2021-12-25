import { TestBed } from '@angular/core/testing';

import { GraphDataServiceService } from './graph-data-service.service';

describe('GraphDataServiceService', () => {
  let service: GraphDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
