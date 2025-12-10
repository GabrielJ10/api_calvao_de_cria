import { vi } from 'vitest';

export default {
  uploadFromBuffer: vi.fn().mockResolvedValue({
    url: 'https://fake-cloudinary.com/image.jpg',
    public_id: 'fake_public_id_' + Date.now(),
  }),
  uploadFromUrl: vi.fn().mockResolvedValue({
    url: 'https://fake-cloudinary.com/image.jpg',
    public_id: 'fake_public_id_' + Date.now(),
  }),
  delete: vi.fn().mockResolvedValue(true),
};
