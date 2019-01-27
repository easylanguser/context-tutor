import { TestBed } from '@angular/core/testing';
import { LessonByNameService } from './lesson-by-name.service';
describe('LessonByNameService', function () {
    beforeEach(function () { return TestBed.configureTestingModule({}); });
    it('should be created', function () {
        var service = TestBed.get(LessonByNameService);
        expect(service).toBeTruthy();
    });
});
//# sourceMappingURL=lesson-by-name.service.spec.js.map