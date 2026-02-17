import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchHistoryService } from './search-history.service';
import { SearchHistory } from './schema/search-history.schema';

describe('SearchHistoryService', () => {
    let service: SearchHistoryService;

    const mockEntry = {
        _id: '507f1f77bcf86cd799439022',
        query: 'bardo museum',
        placeName: 'Bardo Museum',
        lat: 36.8094,
        lng: 10.1342,
        sessionId: 'test-session-123',
        createdAt: new Date(),
    };

    const mockModel = {
        find: jest.fn(),
        countDocuments: jest.fn(),
        deleteMany: jest.fn(),
    };

    const MockModel = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockEntry),
    }));
    Object.assign(MockModel, mockModel);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchHistoryService,
                {
                    provide: getModelToken(SearchHistory.name),
                    useValue: MockModel,
                },
            ],
        }).compile();

        service = module.get<SearchHistoryService>(SearchHistoryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new search history entry', async () => {
            MockModel.countDocuments = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(5), // under limit of 20
            });

            const dto = {
                query: 'bardo museum',
                placeName: 'Bardo Museum',
                lat: 36.8094,
                lng: 10.1342,
                sessionId: 'test-session-123',
            };

            const result = await service.create(dto);

            expect(result).toBeDefined();
            expect(result.query).toBe('bardo museum');
        });

        it('should auto-cleanup old entries when over 20', async () => {
            const oldEntries = [
                { _id: 'old-1' },
                { _id: 'old-2' },
            ];

            MockModel.countDocuments = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(22), // over limit
            });

            MockModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        select: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue(oldEntries),
                        }),
                    }),
                }),
            });

            MockModel.deleteMany = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 2 }),
            });

            const dto = {
                query: 'airport',
                lat: 36.851,
                lng: 10.227,
                sessionId: 'test-session-123',
            };

            await service.create(dto);

            // Should have cleaned up old entries
            expect(MockModel.deleteMany).toHaveBeenCalledWith({
                _id: { $in: ['old-1', 'old-2'] },
            });
        });
    });

    describe('findBySession', () => {
        it('should return search history for a session', async () => {
            const mockEntries = [mockEntry];
            MockModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        lean: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue(mockEntries),
                        }),
                    }),
                }),
            });

            const result = await service.findBySession('test-session-123', 10);

            expect(result).toEqual(mockEntries);
            expect(MockModel.find).toHaveBeenCalledWith({
                sessionId: 'test-session-123',
            });
        });

        it('should return empty array when no history exists', async () => {
            MockModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        lean: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            const result = await service.findBySession('empty-session');

            expect(result).toEqual([]);
        });
    });

    describe('clearBySession', () => {
        it('should delete all history for a session and return count', async () => {
            MockModel.deleteMany = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
            });

            const result = await service.clearBySession('test-session-123');

            expect(result).toEqual({ deletedCount: 5 });
            expect(MockModel.deleteMany).toHaveBeenCalledWith({
                sessionId: 'test-session-123',
            });
        });

        it('should return 0 when no history to clear', async () => {
            MockModel.deleteMany = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
            });

            const result = await service.clearBySession('no-history-session');

            expect(result).toEqual({ deletedCount: 0 });
        });
    });
});
