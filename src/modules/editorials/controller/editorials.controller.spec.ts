import { Test, TestingModule } from '@nestjs/testing';
import { EditorialsController } from './editorials.controller';

describe('EditorialsController', () => {
  let controller: EditorialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialsController],
    }).compile();

    controller = module.get<EditorialsController>(EditorialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
