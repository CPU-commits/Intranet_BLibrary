import { Test, TestingModule } from '@nestjs/testing';
import { EditorialsService } from './editorials.service';

describe('EditorialsService', () => {
  let service: EditorialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditorialsService],
    }).compile();

    service = module.get<EditorialsService>(EditorialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
