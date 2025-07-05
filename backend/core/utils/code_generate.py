import random
import hashlib
import datetime

def generate_verification_code():
    # Step 1: Get current timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")  # microsecond precision
    
    # Step 2: Add randomness
    random_int = random.randint(100000, 999999)
    raw_string = f"{timestamp}{random_int}"

    # Step 3: Hash the combined string
    hash_object = hashlib.sha256(raw_string.encode())
    hex_digest = hash_object.hexdigest()

    # Step 4: Extract a 6-digit numeric code from hash
    numeric_code = ''.join(filter(str.isdigit, hex_digest))[:6]

    # If not enough digits, fallback
    if len(numeric_code) < 6:
        numeric_code = str(random.randint(100000, 999999))

    return numeric_code
