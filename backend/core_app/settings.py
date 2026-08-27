# Ensure os is imported if using os.path
import os

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# If your settings.py uses pathlib.Path instead, use:
# STATIC_ROOT = BASE_DIR / 'static'