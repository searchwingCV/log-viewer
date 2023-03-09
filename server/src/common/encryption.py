import os

from common.logging import get_logger
from cryptography.fernet import Fernet

logger = get_logger(__name__)
encription_key = os.getenv("ENCRYPTION_KEY")
if encription_key is not None:
    fernet = Fernet(encription_key)
else:
    logger.warning("Encryption key not provided, will generate a new one")
    fernet = Fernet(Fernet.generate_key())

ascii_format = os.getenv("ASCII_FORMAT", "utf-8")


def encrypt(decrypted_str: str, encrypter: Fernet = fernet, ascii_format: str = ascii_format) -> str:
    decrypted_data = bytes(decrypted_str, ascii_format)
    encrypted_data = encrypter.encrypt(decrypted_data)
    return encrypted_data.decode("utf-8")


def decrypt(encrypted_str: str, encrypter: Fernet = fernet, ascii_format: str = ascii_format) -> str:
    encrypted_data = bytes(encrypted_str, ascii_format)
    decrypted_data = encrypter.decrypt(encrypted_data)
    return decrypted_data.decode(ascii_format)
