import { TestBed } from '@angular/core/testing';
import { LessonsListService } from './lessons-list.service';
describe('LessonsListService', function () {
    beforeEach(function () { return TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = TestBed.get(LessonsListService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=lessons-list.service.spec.js.map