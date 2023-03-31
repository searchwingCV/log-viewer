import pytest
from common.encryption import decrypt, encrypt
from cryptography.fernet import Fernet


@pytest.fixture
def test_fernet():
    key = b"ukdN44aw2QetPUwTcXzonJ8aUhQwNZwUjyHWGaX-va0="
    fernet = Fernet(key)
    return fernet


def test_encrypt(test_fernet: Fernet):
    TEST_STR = "hallo_hallo"
    encrypted_str = encrypt(TEST_STR, test_fernet, "utf-8")
    expected = test_fernet.decrypt(bytes(encrypted_str, "utf-8")).decode("utf-8")
    assert expected == TEST_STR


def test_decrypt(test_fernet: Fernet):

    encrypted_str = (
        "gAAAAABjhlDws7i03cFwbaT7rFykFm-nZK8dSMRWQlVXAs_lZCQ-DB-L-aCnZjSs9RC4tsfCtJ84EX-ZVJt-HEubdmhxrzwglw=="  # noqa
    )
    decrypted_str = decrypt(encrypted_str, test_fernet, "utf-8")
    assert decrypted_str == "holaholapedro"
