import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FavoriteService } from './favorite.service';
import { Favorite } from './schema/favorite.schema';

describe('FavoriteService', () => {
    let service: FavoriteService;

    const mockFavorite = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Tunis-Carthage Airport',
        address: 'Tunis, Tunisia',
        lat: 36.851,
        lng: 10.2272,
        sessionId: 'test-session-123',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockFavoriteModel = {
        new: jest.fn().mockResolvedValue(mockFavorite),
        constructor: jest.fn().mockResolvedValue(mockFavorite),
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndDelete: jest.fn(),
        countDocuments: jest.fn(),
        create: jest.fn(),
        exec: jest.fn(),
    };

    // Make the mock work as both a constructor and an object with methods
    const MockModel = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockFavorite),
    }));
    Object.assign(MockModel, mockFavoriteModel);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FavoriteService,
                {
                    provide: getModelToken(Favorite.name),
                    useValue: MockModel,
                },
            ],
        }).compile();

        service = module.get<FavoriteService>(FavoriteService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new favorite when no duplicate exists', async () => {
            MockModel.findOne = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null), // no duplicate
            });

            const dto = {
                name: 'Tunis-Carthage Airport',
                address: 'Tunis, Tunisia',
                lat: 36.851,
                lng: 10.2272,
                sessionId: 'test-session-123',
            };

            const result = await service.create(dto);

            expect(result).toBeDefined();
            expect(MockModel.findOne).toHaveBeenCalledWith({
                sessionId: dto.sessionId,
                lat: dto.lat,
                lng: dto.lng,
            });
        });

        it('should throw BadRequestException when duplicate exists', async () => {
            MockModel.findOne = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFavorite), // duplicate found
            });

            const dto = {
                name: 'Tunis-Carthage Airport',
                lat: 36.851,
                lng: 10.2272,
                sessionId: 'test-session-123',
            };

            await expect(service.create(dto)).rejects.toThrow(
                'This place is already in your favorites',
            );
        });
    });

    describe('findBySession', () => {
        it('should return favorites for a given sessionId', async () => {
            const mockFavorites = [mockFavorite];
            MockModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(mockFavorites),
                    }),
                }),
            });

            const result = await service.findBySession('test-session-123');

            expect(result).toEqual(mockFavorites);
            expect(MockModel.find).toHaveBeenCalledWith({
                sessionId: 'test-session-123',
            });
        });

        it('should return empty array when no favorites exist', async () => {
            MockModel.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue([]),
                    }),
                }),
            });

            const result = await service.findBySession('no-favorites-session');

            expect(result).toEqual([]);
        });
    });

    describe('remove', () => {
        it('should remove and return the favorite', async () => {
            MockModel.findOneAndDelete = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFavorite),
            });

            const result = await service.remove(
                '507f1f77bcf86cd799439011',
                'test-session-123',
            );

            expect(result).toEqual(mockFavorite);
            expect(MockModel.findOneAndDelete).toHaveBeenCalledWith({
                _id: '507f1f77bcf86cd799439011',
                sessionId: 'test-session-123',
            });
        });

        it('should throw NotFoundException when favorite not found', async () => {
            MockModel.findOneAndDelete = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.remove('nonexistent-id', 'test-session-123'),
            ).rejects.toThrow('Favorite not found');
        });
    });
});
