"""
Database configuration module.

Loads database connection settings from environment variables.
Supports loading .env from current directory or backend directory.
"""
import os
import logging
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent

# Load environment variables from .env file
# Priority: current directory -> backend directory -> system environment
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    # Fallback to backend's .env file for shared configuration
    backend_env = BASE_DIR.parent.parent / "backend" / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
    else:
        load_dotenv(env_file)  # Try anyway, may use system env vars

# Load database configuration from environment
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5432")


def _sanitize_host(host: str) -> str:
    """
    Sanitize database host value.
    
    Removes invalid characters like @, /, and extracts hostname
    from malformed values (e.g., "user@host" -> "host").
    
    Args:
        host: Raw host value from environment
        
    Returns:
        Cleaned hostname string
    """
    if not host:
        return "127.0.0.1"
    
    host = host.strip()
    
    # Remove username if included (e.g., "user@host" -> "host")
    if "@" in host:
        host = host.split("@")[-1]
    
    # Remove path components
    if "/" in host:
        host = host.split("/")[0]
    
    # Extract hostname if port is included (e.g., "host:5432" -> "host")
    # Allow IPv6 addresses (they contain colons)
    if ":" in host and not host.startswith("["):
        parts = host.split(":")
        if len(parts) == 2 and parts[1].isdigit():
            host = parts[0]
    
    return host or "127.0.0.1"


def _sanitize_user(user: str) -> str:
    """
    Sanitize database username value.
    
    Args:
        user: Raw username value from environment
        
    Returns:
        Cleaned username string
    """
    if not user:
        return user
    # Remove @ symbol if present (shouldn't be in username)
    if "@" in user:
        user = user.split("@")[0].strip()
    return user


# Validate required configuration
if not all([DB_NAME, DB_USER, DB_PASSWORD]):
    missing = [
        name for name, value in [
            ("DB_NAME", DB_NAME),
            ("DB_USER", DB_USER),
            ("DB_PASSWORD", DB_PASSWORD)
        ] if not value
    ]
    raise ValueError(
        f"Missing required environment variables: {', '.join(missing)}"
    )

# Sanitize configuration values
DB_HOST = _sanitize_host(DB_HOST)
DB_USER = _sanitize_user(DB_USER)

# URL encode credentials to handle special characters safely
encoded_user = quote_plus(DB_USER)
encoded_password = quote_plus(DB_PASSWORD)

# Construct database URL
DATABASE_URL = (
    f"postgresql://{encoded_user}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
