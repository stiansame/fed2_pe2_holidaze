import assert from 'node:assert/strict';
import { test } from 'node:test';
import { profileUpdate } from '../../src/utils/profile.js';

const values = { bio: '  Hello!  ', avatarUrl: '', avatarAlt: '', bannerUrl: '', bannerAlt: '' };

test('updates only editable profile fields and preserves omitted or unchanged images', () => {
  assert.deepEqual(profileUpdate({ ...values, name: 'other', venueManager: false }, {}), { bio: 'Hello!' });
  const profile = { avatar: { url: 'https://example.com/broken.jpg', alt: 'Old avatar' } };
  assert.deepEqual(profileUpdate({ ...values, avatarUrl: profile.avatar.url, avatarAlt: profile.avatar.alt }, profile), { bio: 'Hello!' });
  assert.deepEqual(profileUpdate({ ...values, bio: ' ', avatarAlt: 'Ignored without URL' }, profile), { bio: '' });
  assert.deepEqual(profileUpdate({ ...values, bannerUrl: ' https://example.com/banner.jpg ', bannerAlt: '  Mountain  ' }, profile), { bio: 'Hello!', banner: { url: 'https://example.com/banner.jpg', alt: 'Mountain' } });
  assert.deepEqual(profileUpdate({ ...values, avatarUrl: profile.avatar.url, avatarAlt: 'New description' }, profile).avatar, { url: profile.avatar.url, alt: 'New description' });
});

test('checks bio, media lengths and safe URL protocols before sending to the API', () => {
  assert.equal(profileUpdate({ ...values, bio: 'a'.repeat(160) }, {}).bio.length, 160);
  assert.throws(() => profileUpdate({ ...values, bio: 'a'.repeat(161) }, {}), /160/);
  for (const avatarUrl of ['invalid', 'javascript:alert(1)', 'data:image/png,test', 'file:///test.jpg', 'https://user:password@example.com/a.jpg', `https://example.com/${'a'.repeat(300)}`]) {
    assert.throws(() => profileUpdate({ ...values, avatarUrl }, {}), /HTTP/);
  }
  assert.throws(() => profileUpdate({ ...values, avatarUrl: 'https://example.com/a.jpg', avatarAlt: 'a'.repeat(121) }, {}), /120/);
  assert.equal(profileUpdate({ ...values, avatarUrl: 'https://example.com/a.jpg', avatarAlt: 'a'.repeat(120) }, {}).avatar.alt.length, 120);
});
