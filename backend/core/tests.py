from django.test import SimpleTestCase


class UrlNormalizationTests(SimpleTestCase):
    def test_v1_redirects_to_api_v1(self):
        resp = self.client.get('/v1/auth/')
        self.assertIn(resp.status_code, (301, 302))
        self.assertTrue(resp['Location'].startswith('/api/v1/'))

    def test_api_admin_api_redirects(self):
        resp = self.client.get('/api/admin-api/hotels/')
        self.assertIn(resp.status_code, (301, 302))
        self.assertTrue(resp['Location'].startswith('/admin-api/'))

    def test_double_api_collapses(self):
        resp = self.client.get('/api/api/v1/hotels/')
        self.assertIn(resp.status_code, (301, 302))
        self.assertTrue(resp['Location'].startswith('/api/v1/'))
